# -*- coding: utf-8 -*-
import json, os, re, collections
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
out = open(os.path.join(PROJ,'scripts','clutter.txt'),'w',encoding='utf-8')
def w(s=''): out.write(str(s)+'\n')
data = json.load(open(os.path.join(PROJ,'public','data','vocab.json'), encoding='utf-8'))
paren = re.compile(r'\(([^)]*)\)')
NUMERIC = re.compile(r'^\d+\s*(?:st|nd|rd|th)?$', re.IGNORECASE)

# A) Any field containing "(pl" (pl. / pl / Pl. / plural)
w('===== ENTRIES WITH "(pl" IN ANY FIELD =====')
plcount=0
for c in data:
    for e in c['entries']:
        for fld in ('w','t','de','en'):
            v = e.get(fld) or ''
            if re.search(r'\(pl', v, re.IGNORECASE) or re.search(r'\(plural', v, re.IGNORECASE):
                plcount+=1
                w('   [%s] %-22s %s=%r' % (c['level'], e['w'][:22], fld, v))
w('TOTAL "(pl" hits: %d' % plcount)

# B) Numeric/ordinal parentheticals in t (per level)
w('\n===== NUMERIC/ORDINAL PARENTHETICALS IN t =====')
numcount=collections.Counter()
for c in data:
    for e in c['entries']:
        for m in paren.findall(e.get('t') or ''):
            if NUMERIC.match(m.strip()):
                numcount[c['level']]+=1
w('   counts by level: %s' % dict(numcount))
# sample
n=0
for c in data:
    for e in c['entries']:
        if any(NUMERIC.match(m.strip()) for m in paren.findall(e.get('t') or '')):
            w('     [%s] %-14s t=%r' % (c['level'], e['w'][:14], e['t'])); n+=1
            if n>=12: break
    if n>=12: break

# C) Distinct t-parenthetical contents for A2/B1/B2 (spot other label clutter)
for lvl in ('A2','B1','B2'):
    cnt=collections.Counter()
    for c in data:
        if c['level']!=lvl: continue
        for e in c['entries']:
            for m in paren.findall(e.get('t') or ''):
                cnt[m.strip().lower()]+=1
    w('\n===== DISTINCT t-parentheticals in %s (top 40) =====' % lvl)
    for k,v in cnt.most_common(40):
        w('   %4d  (%s)' % (v,k))

# D) Distinct w-parentheticals all levels (any leftover headword clutter)
w('\n===== DISTINCT w-parentheticals (all levels) =====')
wc=collections.Counter()
for c in data:
    for e in c['entries']:
        for m in paren.findall(e.get('w') or ''):
            wc[m.strip().lower()]+=1
for k,v in wc.most_common(40):
    w('   %4d  (%s)' % (v,k))
out.close()
print('done')
