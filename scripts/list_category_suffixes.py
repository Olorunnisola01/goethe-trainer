# -*- coding: utf-8 -*-
import json, os, re
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
out = open(os.path.join(PROJ,'scripts','suffixes.txt'),'w',encoding='utf-8')
def w(s=''): out.write(str(s)+'\n')

data = json.load(open(os.path.join(PROJ,'public','data','vocab.json'), encoding='utf-8'))

LEVELTOK = r'(?:A1|A2|B1|B2)'

def strip_levels(title):
    """Remove level markers only; keep other qualifiers like EXTENDED/DEEP/VERTIEFUNG."""
    t = title
    m = re.search(r'\s*\(([^)]*)\)\s*$', t)
    if m:
        inside = m.group(1)
        inside2 = re.sub(r'\b'+LEVELTOK+r'\b', '', inside)
        inside2 = re.sub(r'[\/,]', ' ', inside2)
        inside2 = ' '.join(inside2.split()).strip()
        t = (t[:m.start()] + (' ('+inside2+')' if inside2 else ''))
    t = re.sub(r'\s+'+LEVELTOK+r'\s*$', '', t)   # trailing bare level e.g. "... B2"
    return ' '.join(t.split()).strip()

def strip_all_paren(title):
    """Remove the whole trailing parenthetical + trailing bare level."""
    t = re.sub(r'\s*\([^)]*\)\s*$', '', title)
    t = re.sub(r'\s+'+LEVELTOK+r'\s*$', '', t)
    return ' '.join(t.split()).strip()

# Group by level, preserving order
levels = ['A1','A2','B1','B2']
cat_by_level = {lv:[c for c in data if c['level']==lv] for lv in levels}

w('================ CATEGORIES WITH A LEVEL MARKER (A1/A2/B1/B2) ================')
total_level = 0
level_new_titles = {lv:{} for lv in levels}
for lv in levels:
    rows = []
    for c in cat_by_level[lv]:
        nl = strip_levels(c['title'])
        if nl != c['title']:
            rows.append((c['title'], nl))
        level_new_titles[lv].setdefault(nl, 0)
        level_new_titles[lv][nl]+=1
    if rows:
        w('\n--- %s (%d categories with a level marker) ---' % (lv, len(rows)))
        for o,n in rows:
            total_level += 1
            w('   %-52s ->  %s' % (o, n))
w('\nTOTAL categories with a level marker: %d' % total_level)

# collisions if we apply strip_levels everywhere
w('\n================ COLLISIONS after removing level markers ================')
coll=0
for lv in levels:
    for title,cnt in level_new_titles[lv].items():
        if cnt>1:
            coll+=1
            w('   [%s] "%s" would appear %d times' % (lv, title, cnt))
if coll==0: w('   none')

# Other (non-level) parenthetical qualifiers that remain
w('\n================ NON-LEVEL PARENTHETICALS (EXTENDED / VERTIEFUNG / KEY / DEEP ...) ================')
n_other=0
for lv in levels:
    rows=[]
    for c in cat_by_level[lv]:
        nl = strip_levels(c['title'])
        if '(' in nl:  # still has a parenthetical after level removal
            rows.append((c['title'], nl, strip_all_paren(c['title'])))
    if rows:
        w('\n--- %s ---' % lv)
        for o,nl,allp in rows:
            n_other+=1
            w('   %-52s  level-stripped: %-40s  all-paren-stripped: %s' % (o, nl, allp))
w('\nTOTAL categories with a non-level parenthetical: %d' % n_other)
out.close()
print('done; level-marker categories:', total_level, ' non-level-paren categories:', n_other, ' collisions:', coll)
