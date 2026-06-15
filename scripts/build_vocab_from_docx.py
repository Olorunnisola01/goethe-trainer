# -*- coding: utf-8 -*-
"""
Rebuild public/data/vocab.json from the user's edited Goethe vocabulary .docx files.

Rules (per user):
  - Each file: Heading 2 (emoji + TITLE) followed by a 4-col table
    [German | English | Example (German) | Example (English)] with a header row.
  - Headwords: strip ONLY trailing abbreviation parentheticals that are units /
    grammatical markers (kg, g, l, km, m, cm, %, pl., sg., ...). Leave everything
    else exactly as written (prepositions like "(um)", expansions like
    "(Auszubildende)", slashes, phrases).
  - Keep ALL repeats (no de-duplication).
  - Reuse existing category ids by (level, title) where possible; mint fresh
    unique ids otherwise. Preserve docx category order within each level.
"""
import docx, os, json, re, unicodedata, datetime
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl
from docx.table import Table
from docx.text.paragraph import Paragraph

BASE = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\extracted-vocabs - Copy'
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
VJSON = os.path.join(PROJ, 'public', 'data', 'vocab.json')
FILES = [('A1','Goethe_Vocabulary_A1.docx'), ('A2','Goethe_Vocabulary_A2.docx'),
         ('B1','Goethe_Vocabulary_B1.docx'), ('B2','Goethe_Vocabulary_B2.docx')]

# Strip ONLY unit / grammatical abbreviation parentheticals at end of headword.
UNIT_PAREN = re.compile(
    r'\s*\(\s*(kg|g|mg|t|l|ml|cl|dl|hl|km|m|dm|cm|mm|qm|ha|°c|°|%|pl\.?|sg\.?)\s*\)\s*$',
    re.IGNORECASE)

def clean(s):
    return ' '.join((s or '').split())

def strip_abbrev(w):
    new = UNIT_PAREN.sub('', w).strip()
    return new if new else w

def split_emoji_title(heading):
    """Split 'EMOJI  TITLE' -> (emoji, title) by walking to the first letter."""
    s = heading.strip()
    i = 0
    while i < len(s):
        ch = s[i]
        if unicodedata.category(ch).startswith('L'):  # first real letter
            break
        i += 1
    emoji = s[:i].strip()
    title = s[i:].strip()
    return emoji, title

def iter_block_items(parent):
    for child in parent.element.body.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl):
            yield Table(child, parent)

def slugify(title):
    s = title
    for a, b in [('Ä','AE'),('Ö','OE'),('Ü','UE'),('ä','AE'),('ö','OE'),('ü','UE'),('ß','SS')]:
        s = s.replace(a, b)
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^A-Za-z0-9]+', '_', s).strip('_').upper()
    return s[:40] or 'CAT'

# --- existing id map (level, normalized title) -> id (first occurrence) ---
old = json.load(open(VJSON, encoding='utf-8'))
old_ids = {}
for c in old:
    key = (c.get('level'), clean(c.get('title','')).upper())
    old_ids.setdefault(key, c.get('id'))

categories = []
used_ids = set()
report = {'stripped': [], 'per_level': {}}

for level, fname in FILES:
    d = docx.Document(os.path.join(BASE, fname))
    cur = None
    cats_this_level = 0
    entries_this_level = 0
    for b in iter_block_items(d):
        if isinstance(b, Paragraph):
            if b.style.name.startswith('Heading') and b.text.strip():
                emoji, title = split_emoji_title(b.text)
                # choose id: reuse existing by (level,title), else slug; ensure unique
                key = (level, clean(title).upper())
                cid = old_ids.get(key)
                if not cid or cid in used_ids:
                    base = f'{level}_{slugify(title)}'
                    cid = base
                    n = 2
                    while cid in used_ids:
                        cid = f'{base}_{n}'; n += 1
                used_ids.add(cid)
                cur = {'id': cid, 'emoji': emoji, 'title': clean(title),
                       'level': level, 'entries': []}
                categories.append(cur)
                cats_this_level += 1
        else:  # table
            if cur is None:
                continue
            for ri, row in enumerate(b.rows):
                cells = [clean(c.text) for c in row.cells]
                if len(cells) < 4:
                    continue
                if ri == 0 and cells[0].lower() == 'german':
                    continue  # header
                w_raw, t, de, en = cells[0], cells[1], cells[2], cells[3]
                if not w_raw and not t:
                    continue
                w = strip_abbrev(w_raw)
                if w != w_raw:
                    report['stripped'].append((level, w_raw, w))
                cur['entries'].append({'w': w, 't': t, 'de': de, 'en': en})
                entries_this_level += 1
    report['per_level'][level] = (cats_this_level, entries_this_level)

# --- drop empty categories (leftover duplicate headings with no table) ---
populated_titles = {}
for c in categories:
    if c['entries']:
        populated_titles.setdefault((c['level'], clean(c['title']).upper()), True)
dropped = [c for c in categories if not c['entries']]
report['dropped'] = []
for c in dropped:
    twin = (c['level'], clean(c['title']).upper()) in populated_titles
    report['dropped'].append((c['level'], c['title'], 'has populated twin' if twin else 'NO twin (unique but empty)'))
categories = [c for c in categories if c['entries']]

# --- write backup + new file ---
ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
backup = os.path.join(PROJ, 'public', 'data', f'vocab.backup-{ts}.json')
with open(backup, 'w', encoding='utf-8') as f:
    json.dump(old, f, ensure_ascii=False, indent=2)
with open(VJSON, 'w', encoding='utf-8') as f:
    json.dump(categories, f, ensure_ascii=False, indent=2)

# --- report ---
print('backup written:', os.path.basename(backup))
print('dropped empty categories:', len(report['dropped']))
for lv, title, note in report['dropped']:
    print(f'   [{lv}] {title}  ({note})')
print('new categories:', len(categories))
tot = 0
for level, _ in FILES:
    cats = [c for c in categories if c['level'] == level]
    e = sum(len(c['entries']) for c in cats)
    tot += e
    print(f'  {level}: {len(cats)} categories, {e} entries')
print('  TOTAL entries:', tot)
print('headwords stripped (abbreviation -> core):', len(report['stripped']))
seen = set()
for lv, a, b in report['stripped']:
    k = (a, b)
    if k in seen: continue
    seen.add(k)
    print(f'   [{lv}] {a!r} -> {b!r}')
