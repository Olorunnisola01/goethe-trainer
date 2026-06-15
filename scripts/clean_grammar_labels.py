# -*- coding: utf-8 -*-
"""Remove grammatical part-of-speech labels (preposition)/(subordinating) from
the English translation (t) of A1 vocab. Keep meaning-bearing parentheticals."""
import json, os, re, datetime, collections, copy
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
VJSON = os.path.join(PROJ,'public','data','vocab.json')
data = json.load(open(VJSON, encoding='utf-8'))

LABELS = re.compile(r'\s*\((?:preposition|subordinating)\)', re.IGNORECASE)

# Scope report: such labels per level
per_level = collections.Counter()
for c in data:
    for e in c['entries']:
        if LABELS.search(e.get('t') or ''):
            per_level[c['level']] += 1
print('grammatical-label counts by level (preposition/subordinating):', dict(per_level))

# True backup BEFORE editing
ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
os.makedirs(os.path.join(PROJ,'backups'), exist_ok=True)
with open(os.path.join(PROJ,'backups',f'vocab.pre-grammarlabels-{ts}.json'),'w',encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

changed = []
for c in data:
    if c['level'] != 'A1':
        continue
    for e in c['entries']:
        t = e.get('t') or ''
        nt = ' '.join(LABELS.sub('', t).split()).strip()
        if nt != t:
            changed.append((c['title'], e['w'], t, nt))
            e['t'] = nt

with open(VJSON,'w',encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('A1 translations cleaned:', len(changed))
for title,w,o,n in changed:
    print(f'   [{title[:24]}] {w[:18]:18} {o!r} -> {n!r}')
# sanity: any empty t in A1?
empty = sum(1 for c in data if c['level']=='A1' for e in c['entries'] if not (e.get('t') or '').strip())
print('A1 entries with empty t after edit:', empty)
print('A1 entries still containing (preposition)/(subordinating):',
      sum(1 for c in data if c['level']=='A1' for e in c['entries'] if LABELS.search(e.get('t') or '')))
