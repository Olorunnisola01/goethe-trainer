# -*- coding: utf-8 -*-
import json, os, datetime
PROJ = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
VJSON = os.path.join(PROJ,'public','data','vocab.json')
OLD, NEW = '\U0001F393', '\U0001F4DA'   # 🎓 -> 📚

data = json.load(open(VJSON, encoding='utf-8'))
hits = [c for c in data if c['level']=='B2' and c.get('emoji')==OLD]
log = open(os.path.join(PROJ,'scripts','emoji_change.txt'),'w',encoding='utf-8')
log.write('B2 categories changed 🎓 -> 📚: %d\n' % len(hits))
for c in hits:
    log.write('   %s | %s\n' % (c['id'], c['title']))
    c['emoji'] = NEW
# also report any non-B2 graduation-cap categories left untouched
other = [c for c in data if c['level']!='B2' and c.get('emoji')==OLD]
log.write('\nleft untouched (not B2) with 🎓: %d\n' % len(other))
for c in other:
    log.write('   [%s] %s | %s\n' % (c['level'], c['id'], c['title']))
log.close()

ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
os.makedirs(os.path.join(PROJ,'backups'), exist_ok=True)
json.dump(json.load(open(VJSON,encoding='utf-8')), open(os.path.join(PROJ,'backups',f'vocab.pre-emoji-{ts}.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=2)
json.dump(data, open(VJSON,'w',encoding='utf-8'), ensure_ascii=False, indent=2)
print('changed', len(hits), 'B2 categories; left', len(other), 'non-B2 untouched')
