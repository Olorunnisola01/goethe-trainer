"""
Merges all verb quiz batches into the final verbquiz.json
and saves it to public/data/verbquiz.json
"""
import json

BATCH_FILES = [
    r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_mc_a1_1.json',
    r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_mc_a1_2.json',
    r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_mc_a2_1.json',
    r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_mc_a2_2.json',
    r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_fitg.json',
]

all_questions = []
for path in BATCH_FILES:
    with open(path, 'r', encoding='utf-8') as f:
        batch = json.load(f)
    print(f"  {path.split(chr(92))[-1]}: {len(batch)} questions")
    all_questions.extend(batch)

print(f"\nTotal questions: {len(all_questions)}")

# Verify structure
by_level   = {}
by_type    = {}
by_tense   = {}
by_format  = {}
for q in all_questions:
    by_level[q['level']]   = by_level.get(q['level'], 0) + 1
    by_type[q['verbType']] = by_type.get(q['verbType'], 0) + 1
    by_tense[q['tense']]   = by_tense.get(q['tense'], 0) + 1
    by_format[q['format']] = by_format.get(q['format'], 0) + 1

print("\nBy Level:  ", by_level)
print("By Type:   ", by_type)
print("By Tense:  ", by_tense)
print("By Format: ", by_format)

# Ensure IDs are unique
ids = [q['id'] for q in all_questions]
dupes = [id for id in ids if ids.count(id) > 1]
if dupes:
    print(f"\nWARNING: Duplicate IDs found: {set(dupes)}")
else:
    print("\nAll IDs are unique ✓")

# Save
out_path = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\public\data\verbquiz.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)
print(f"\nSaved to {out_path}")
print("Done! verbquiz.json is ready.")
