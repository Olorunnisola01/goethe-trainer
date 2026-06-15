# -*- coding: utf-8 -*-
import json, os, unicodedata, sys
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
out = open(os.path.join(PROJ,'scripts','validate.txt'),'w',encoding='utf-8')
def w(s=''): out.write(str(s)+'\n')

data = json.load(open(os.path.join(PROJ,'public','data','vocab.json'), encoding='utf-8'))
w('total categories: %d' % len(data))
ids = [c['id'] for c in data]
w('unique ids: %d (dups: %d)' % (len(set(ids)), len(ids)-len(set(ids))))

problems = []
def has_letter(s): return any(unicodedata.category(ch).startswith('L') for ch in s)

by_level = {}
ent_total = 0
for c in data:
    lv = c.get('level')
    by_level.setdefault(lv, [0,0])
    by_level[lv][0]+=1
    n=len(c.get('entries',[]))
    by_level[lv][1]+=n
    ent_total+=n
    if not c.get('emoji'): problems.append(('no emoji', c['id'], c.get('title')))
    if not c.get('title'): problems.append(('no title', c['id'], c.get('emoji')))
    if has_letter(c.get('emoji','')): problems.append(('emoji has letter', c['id'], repr(c.get('emoji'))))
    if lv not in ('A1','A2','B1','B2'): problems.append(('bad level', c['id'], lv))
    if n==0: problems.append(('empty category', c['id'], c.get('title')))
    for e in c.get('entries',[]):
        for k in ('w','t','de','en'):
            if k not in e: problems.append(('missing key '+k, c['id'], e))
        if not e.get('w','').strip(): problems.append(('empty w', c['id'], e))
        if not e.get('t','').strip(): problems.append(('empty t', c['id'], e))

w('entries total: %d' % ent_total)
for lv in ('A1','A2','B1','B2'):
    cc,ee = by_level.get(lv,[0,0])
    w('  %s: %d cats, %d entries' % (lv, cc, ee))
w('problems: %d' % len(problems))
for p in problems[:40]:
    w('   %r' % (p,))

# spot-check: first 3 categories per level (emoji | title | n | first entry)
w('\n--- spot check categories ---')
shown={}
for c in data:
    lv=c['level']; shown.setdefault(lv,0)
    if shown[lv]<3:
        shown[lv]+=1
        e0=c['entries'][0] if c['entries'] else {}
        w('[%s] id=%s | %s | %s | n=%d' % (lv, c['id'], c['emoji'], c['title'], len(c['entries'])))
        w('      e0: w=%r t=%r' % (e0.get('w'), e0.get('t')))
        w('      ex: de=%r' % (e0.get('de'),))

# spot-check B2 with umlauts / complex emoji
w('\n--- B2 complex emoji/title samples ---')
cnt=0
for c in data:
    if c['level']=='B2' and (any(x in c['emoji'] for x in ['‍']) or any(o in c['title'] for o in 'ÄÖÜß')):
        w('[B2] %s | %s (%d cp emoji)' % (c['emoji'], c['title'], len(c['emoji'])))
        cnt+=1
        if cnt>=8: break

# verify stripped words present without parens
w('\n--- verify unit strips ---')
for c in data:
    if c['level']=='A1':
        for e in c['entries']:
            if e['w'] in ('das Kilogramm','der Meter','das Prozent'):
                w('   %r (ex: %r)' % (e['w'], e['de'][:40]))
out.close()
print('validation written')
