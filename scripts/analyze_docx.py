# -*- coding: utf-8 -*-
import docx, os, json, re
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl
from docx.table import Table
from docx.text.paragraph import Paragraph

base = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\extracted-vocabs - Copy'
proj = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
out = open(os.path.join(proj, 'scripts', 'analysis.txt'), 'w', encoding='utf-8')
def w(s=''): out.write(str(s) + '\n')

def iter_block_items(parent):
    for child in parent.element.body.iterchildren():
        if isinstance(child, CT_P): yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl): yield Table(child, parent)

FILES = {'A1':'Goethe_Vocabulary_A1.docx','A2':'Goethe_Vocabulary_A2.docx',
         'B1':'Goethe_Vocabulary_B1.docx','B2':'Goethe_Vocabulary_B2.docx'}

def parse(level):
    d = docx.Document(os.path.join(base, FILES[level]))
    cats = []
    cur = None
    for b in iter_block_items(d):
        if isinstance(b, Paragraph):
            if b.style.name.startswith('Heading'):
                t = b.text.strip()
                if t:
                    cur = {'title': t, 'rows': []}
                    cats.append(cur)
        else:  # table
            if cur is None:
                cur = {'title': '(untitled)', 'rows': []}; cats.append(cur)
            for ri, r in enumerate(b.rows):
                cells = [c.text.strip() for c in r.cells]
                if ri == 0 and cells[:1] == ['German']:
                    continue  # header
                if not any(cells): continue
                cur['rows'].append(cells)
    return cats

parsed = {}
for lv in FILES:
    parsed[lv] = parse(lv)

# Multi-word / separator detection on German column
SEP = re.compile(r'[/,;]| oder | bzw\.| – | - |\(')
ARTICLES = {'der','die','das','den','dem','des'}
def is_multiword(g):
    return bool(SEP.search(g))
def token_count_noart(g):
    toks = g.split()
    if toks and toks[0].lower() in ARTICLES:
        toks = toks[1:]
    return len(toks)

for lv in FILES:
    cats = parsed[lv]
    total = sum(len(c['rows']) for c in cats)
    w('\n' + '='*60)
    w('%s : %d categories, %d entries' % (lv, len(cats), total))
    w('='*60)
    # duplicates by lowercased german word (within level)
    seen = {}
    dups = []
    for c in cats:
        for row in c['rows']:
            g = row[0].lower().strip()
            if g in seen:
                dups.append((row[0], c['title'], seen[g]))
            else:
                seen[g] = c['title']
    w('duplicate German words (within level): %d' % len(dups))
    for d_ in dups[:25]:
        w('   DUP: %-28s  in [%s]  (first in [%s])' % (d_[0][:28], d_[1][:22], d_[2][:22]))
    # separator/multiword german entries
    multi = []
    for c in cats:
        for row in c['rows']:
            if is_multiword(row[0]):
                multi.append((row[0], c['title']))
    w('German entries with separator (/ , ; oder ( -): %d' % len(multi))
    for m in multi[:30]:
        w('   MULTI: %s' % m[0][:70])
    # column sanity: any row not exactly 4 cols / empty cells
    bad = []
    for c in cats:
        for row in c['rows']:
            if len(row) != 4 or not row[0] or not row[1]:
                bad.append((c['title'], row))
    w('rows with !=4 cols or missing word/translation: %d' % len(bad))
    for bcat, brow in bad[:10]:
        w('   BAD [%s]: %r' % (bcat[:20], brow))

# Compare with current vocab.json categories
w('\n' + '#'*60)
w('CURRENT vocab.json category structure')
w('#'*60)
vj = json.load(open(os.path.join(proj,'public','data','vocab.json'), encoding='utf-8'))
bylv = {}
for c in vj:
    bylv.setdefault(c.get('level','?'), []).append(c)
for lv in ['A1','A2','B1','B2']:
    cs = bylv.get(lv, [])
    w('\n%s: %d categories, %d entries' % (lv, len(cs), sum(len(c.get('entries',[])) for c in cs)))
    for c in cs:
        w('   id=%-26s emoji=%s  title=%-40s  n=%d' % (str(c.get('id'))[:26], c.get('emoji',''), c.get('title','')[:40], len(c.get('entries',[]))))
    # sample entry keys
    if cs and cs[0].get('entries'):
        w('   sample entry: %r' % cs[0]['entries'][0])

out.close()
print('done')
