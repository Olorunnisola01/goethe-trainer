# -*- coding: utf-8 -*-
"""Remove level markers (A1/A2/B1/B2) from category titles. Keep non-level
qualifiers like (EXTENDED)/(DEEP)/(VERTIEFUNG). Merge any post-strip duplicate
title within the same level into its first occurrence (avoids duplicate labels)."""
import json, os, re, datetime
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
VJSON = os.path.join(PROJ,'public','data','vocab.json')
LEVELTOK = r'(?:A1|A2|B1|B2)'

def strip_levels(title):
    t = title
    m = re.search(r'\s*\(([^)]*)\)\s*$', t)
    if m:
        inside = re.sub(r'\b'+LEVELTOK+r'\b', '', m.group(1))
        inside = re.sub(r'[\/,]', ' ', inside)
        inside = ' '.join(inside.split()).strip()
        t = t[:m.start()] + (' ('+inside+')' if inside else '')
    t = re.sub(r'\s+'+LEVELTOK+r'\s*$', '', t)
    return ' '.join(t.split()).strip()

data = json.load(open(VJSON, encoding='utf-8'))

changed = []
for c in data:
    nt = strip_levels(c['title'])
    if nt != c['title']:
        changed.append((c['level'], c['title'], nt))
        c['title'] = nt

# Merge post-strip duplicates within the same level into first occurrence
result = []
index = {}      # (level, title) -> category in result
merges = []
for c in data:
    key = (c['level'], c['title'])
    if key in index:
        tgt = index[key]
        tgt['entries'].extend(c['entries'])
        merges.append((c['level'], c['title'], c['id'], tgt['id'], len(c['entries'])))
    else:
        index[key] = c
        result.append(c)

# backup (outside public/) + write
ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
os.makedirs(os.path.join(PROJ,'backups'), exist_ok=True)
with open(os.path.join(PROJ,'backups',f'vocab.pre-strip-{ts}.json'),'w',encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
with open(VJSON,'w',encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print('titles changed:', len(changed))
print('categories merged (collision resolution):', len(merges))
for lv,title,fromid,toid,n in merges:
    print(f'   [{lv}] merged {fromid} ({n} entries) -> {toid} ("{title}")')
print('categories: %d -> %d' % (len(data), len(result)))
print('entries:', sum(len(c['entries']) for c in result))
# show a few sample changes per level
for lv in ['A1','A2','B1','B2']:
    sample=[ (o,n) for (l,o,n) in changed if l==lv ][:3]
    if sample:
        print(f'  {lv} e.g.: ' + '; '.join(f'{o!r}->{n!r}' for o,n in sample))
