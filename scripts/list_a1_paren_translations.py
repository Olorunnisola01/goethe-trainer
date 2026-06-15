# -*- coding: utf-8 -*-
import json, os, re, collections
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
out = open(os.path.join(PROJ,'scripts','a1_parens.txt'),'w',encoding='utf-8')
def w(s=''): out.write(str(s)+'\n')
data = json.load(open(os.path.join(PROJ,'public','data','vocab.json'), encoding='utf-8'))

paren = re.compile(r'\(([^)]*)\)')
contents = collections.Counter()
rows = 0
for c in data:
    if c['level'] != 'A1':
        continue
    hits = [e for e in c['entries'] if '(' in (e.get('t') or '')]
    if hits:
        w('\n=== %s (%s) ===' % (c['title'], c['id']))
        for e in hits:
            rows += 1
            w('   w=%-26s t=%r' % (e['w'][:26], e['t']))
            for m in paren.findall(e['t']):
                contents[m.strip().lower()] += 1

w('\n\n===== DISTINCT PARENTHETICAL CONTENTS in A1 English (t) =====')
for k,v in contents.most_common():
    w('   %4d  (%s)' % (v, k))
w('\nTOTAL A1 entries with a paren in t: %d' % rows)
out.close()
print('done; A1 entries with paren in t:', rows, ' distinct contents:', len(contents))
