import json

with open('public/data/redemittel.json', encoding='utf-8') as f:
    data = json.load(f)

a2 = [c for c in data if c.get('level') == 'A2']
print('A2 categories (in order):')
for i, c in enumerate(a2):
    print(f'{i:2d}. {c["cat"]} ({len(c.get("phrases", []))} phrases)')
print(f'\nTotal A2: {len(a2)}')
