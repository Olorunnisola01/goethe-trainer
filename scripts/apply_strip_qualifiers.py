# -*- coding: utf-8 -*-
"""Remove trailing qualifier parentheticals from category titles:
(EXTENDED) (DEEP) (VERTIEFUNG) (ERWEITERT) (BASIC) (KEY) (EXPANDED) (GRAMMAR).
Keep real-content parens like (DDR & MAUERFALL). Merge post-strip duplicates
within the same level into the first occurrence."""
import json, os, re, datetime
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
VJSON = os.path.join(PROJ,'public','data','vocab.json')
QUAL = {'EXTENDED','DEEP','VERTIEFUNG','ERWEITERT','BASIC','KEY','EXPANDED','GRAMMAR'}

def strip_qual(title):
    m = re.search(r'\s*\(([^)]*)\)\s*$', title)
    if m and m.group(1).strip().upper() in QUAL:
        return ' '.join(title[:m.start()].split()).strip()
    return title

data = json.load(open(VJSON, encoding='utf-8'))

changed = []
for c in data:
    nt = strip_qual(c['title'])
    if nt != c['title']:
        changed.append((c['level'], c['title'], nt))
        c['title'] = nt

# merge post-strip duplicates within level into first occurrence
result, index, merges = [], {}, []
for c in data:
    key = (c['level'], c['title'])
    if key in index:
        index[key]['entries'].extend(c['entries'])
        merges.append((c['level'], c['title'], c['id'], index[key]['id'], len(c['entries'])))
    else:
        index[key] = c
        result.append(c)

ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
os.makedirs(os.path.join(PROJ,'backups'), exist_ok=True)
with open(os.path.join(PROJ,'backups',f'vocab.pre-qual-{ts}.json'),'w',encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
with open(VJSON,'w',encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print('titles changed:', len(changed))
for lv,o,n in changed:
    print(f'   [{lv}] {o}  ->  {n}')
print('merges:', len(merges))
for lv,title,fromid,toid,n in merges:
    print(f'   [{lv}] merged {fromid} ({n}) -> {toid} ("{title}")')
print('categories: %d -> %d   entries: %d' % (len(data), len(result), sum(len(c['entries']) for c in result)))
