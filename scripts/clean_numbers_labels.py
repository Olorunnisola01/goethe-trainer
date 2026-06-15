# -*- coding: utf-8 -*-
"""Cleaner A1 number translations: strip numeric/ordinal parens "(1)","(1st)".
Also strip remaining grammatical POS-label parentheticals (conjunction) etc.
from the English (t). Keep meaning-bearing parentheticals."""
import json, os, re, datetime
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
VJSON = os.path.join(PROJ,'public','data','vocab.json')
data = json.load(open(VJSON, encoding='utf-8'))

NUM = re.compile(r'\s*\(\d+\s*(?:st|nd|rd|th)?\)', re.IGNORECASE)   # (0) (12) (1st)
POS = re.compile(r'\s*\((?:preposition|subordinating|conjunction|pronoun|article|interjection)\)', re.IGNORECASE)

# backup before editing
ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
os.makedirs(os.path.join(PROJ,'backups'), exist_ok=True)
with open(os.path.join(PROJ,'backups',f'vocab.pre-numlabels-{ts}.json'),'w',encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

num_changes, pos_changes = [], []
for c in data:
    for e in c['entries']:
        t = e.get('t') or ''
        nt = t
        if c['level'] == 'A1':            # numbers only live in A1
            nt2 = ' '.join(NUM.sub('', nt).split()).strip()
            if nt2 != nt:
                num_changes.append((e['w'], nt, nt2)); nt = nt2
        nt2 = ' '.join(POS.sub('', nt).split()).strip()
        if nt2 != nt:
            pos_changes.append((c['level'], e['w'], nt, nt2)); nt = nt2
        e['t'] = nt

with open(VJSON,'w',encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('A1 number translations cleaned:', len(num_changes))
for w_,o,n in num_changes[:8]:
    print(f'   {w_:14} {o!r} -> {n!r}')
print('   ...' if len(num_changes) > 8 else '')
print('POS-label translations cleaned:', len(pos_changes))
for lv,w_,o,n in pos_changes:
    print(f'   [{lv}] {w_:14} {o!r} -> {n!r}')
empty = sum(1 for c in data for e in c['entries'] if not (e.get('t') or '').strip())
print('entries with empty t:', empty)
