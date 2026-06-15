#!/usr/bin/env python3
"""Quick analyzer for redemittel.json per level."""
import json
from collections import defaultdict

with open('public/data/redemittel.json', encoding='utf-8') as f:
    data = json.load(f)

by_level = defaultdict(list)
for item in data:
    lvl = item.get('level', 'unknown')
    by_level[lvl].append(item)

for lvl in ['A1', 'A2', 'B1', 'B2']:
    cats = by_level.get(lvl, [])
    total_phrases = sum(len(c.get('phrases', [])) for c in cats)
    print(f"\n=== {lvl} ===")
    print(f"Categories: {len(cats)}, Total phrases: {total_phrases}")
    for c in cats:
        n = len(c.get('phrases', []))
        print(f"  • {c.get('cat', '?')} ({n})")
        # show 1-2 samples
        for p in c.get('phrases', [])[:1]:
            de = p.get('de', '')[:55]
            print(f"      e.g. {de}...")

print("\n\n=== Checking for common exam-critical phrases (simple keyword search) ===")
all_text = json.dumps(data, ensure_ascii=False).lower()

checks = [
    ("A1 critical: 'kann ich' / requests in shop/cafe", ['kann ich', 'ich hätte gern', 'haben sie']),
    ("A1: picture or describe simple", ['ich sehe', 'auf dem bild']),
    ("A2/B1 planning: 'was hältst du', 'lass uns', 'gute idee'", ['was hältst du', 'lass uns', 'gute idee', 'einverstanden']),
    ("B1 presentation: 'zunächst', 'darüber hinaus', 'zusammenfassend'", ['zunächst', 'darüber hinaus', 'zusammenfassend', 'meiner meinung nach']),
    ("B1 discussion: 'ich bin der meinung', 'dagegen', 'allerdings'", ['ich bin der meinung', 'dagegen sprechen', 'allerdings']),
    ("Konjunktiv II / polite / wishes", ['würde', 'könnte', 'hätte', 'wäre', 'wenn ich']),
    ("Modal particles (A2+)", ['doch', 'mal', 'eben', 'ja', 'halt']),
]

for label, kws in checks:
    found = any(kw in all_text for kw in kws)
    print(f"  {'✓' if found else '✗'} {label}: {'present' if found else 'MISSING or weak'}")
