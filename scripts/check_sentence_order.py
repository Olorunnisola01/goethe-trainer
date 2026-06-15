"""
QA validation for the rebuilt Satzstellung pool.

Validates scripts/_generated_v3_entries.json (the SO2509+ new entries)
against the constraints from the rebuild plan, then (if --write is
passed) assembles the final public/data/sentence_order.json by combining the
original SO0001-SO2508 with the new entries.

Run: python scripts/check_sentence_order.py [--write]
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEW_PATH = os.path.join(ROOT, 'scripts', '_generated_v3_entries.json')
OUT_PATH = os.path.join(ROOT, 'public', 'data', 'sentence_order.json')

SUPPORTED_TOPICS = {
    'sein', 'haben', 'W-Fragen', 'Ja/Nein-Fragen', 'Negation', 'Verben', 'Zeit',
    'Familie', 'Zahlen', 'Grundsätze', 'Trennbare Verben', 'Modalverben',
    'Perfekt', 'TeKaMoLo', 'Dativ', 'Präpositionen', 'Komparativ', 'Imperativ',
    'weil-Satz', 'dass-Satz', 'ob-Satz', 'wenn-Satz', 'Relativsatz', 'Passiv',
    'Konjunktiv II',
    'Konnektoren', 'Doppelkonnektoren', 'Temporalsätze', 'Finalsätze',
    'Infinitiv mit zu', 'Partizipialkonstruktionen', 'Vergleichssätze',
}
SUPPORTED_LEVELS = {'A1', 'A2', 'B1'}

# Common German-only filler words that should NOT appear in tip/structure
# (those fields must be English prose for the UI's StructurePanel).
GERMAN_TIP_MARKERS = [
    'verlangt', 'Akkusativ-Objekt', 'Subjekt +', 'Zeitangabe', 'Nebensatz',
    'Hauptsatz', 'steht am Ende', 'immer auf Position',
]


def join_sentence(tokens):
    s = ' '.join(tokens)
    s = s.replace(' .', '.').replace(' ?', '?').replace(' ,', ',').replace(' !', '!')
    return s


def main():
    new_entries = json.load(open(NEW_PATH, encoding='utf-8'))
    errors = []
    warnings = []

    seen_ids = set()
    expected_num = 2509
    correct_seen = {}

    for e in new_entries:
        eid = e['id']
        # Sequential ID check
        m = re.match(r'^SO(\d{4})$', eid)
        if not m:
            errors.append(f'{eid}: malformed id')
        else:
            num = int(m.group(1))
            if num != expected_num:
                errors.append(f'{eid}: expected SO{expected_num:04d}')
            expected_num += 1
        if eid in seen_ids:
            errors.append(f'{eid}: duplicate id')
        seen_ids.add(eid)

        # Level / topic
        if e['level'] not in SUPPORTED_LEVELS:
            errors.append(f'{eid}: bad level {e["level"]}')
        if e['topic'] not in SUPPORTED_TOPICS:
            errors.append(f'{eid}: unsupported topic {e["topic"]}')

        # correct == join(answer)
        if e['correct'] != join_sentence(e['answer']):
            errors.append(f'{eid}: correct != join(answer): {e["correct"]!r} vs {join_sentence(e["answer"])!r}')

        # words is permutation of answer, and words != answer
        if sorted(e['words']) != sorted(e['answer']):
            errors.append(f'{eid}: words is not a permutation of answer')
        if e['words'] == e['answer']:
            errors.append(f'{eid}: words == answer (not scrambled)')

        # stray digit tokens
        for tok in e['answer']:
            if re.search(r'\d', tok):
                errors.append(f'{eid}: stray digit token {tok!r}')

        # tip/structure should be English (heuristic)
        for marker in GERMAN_TIP_MARKERS:
            if marker in e['tip'] or marker in e['structure']:
                errors.append(f'{eid}: German marker {marker!r} found in tip/structure')

        # duplicate 'correct' sentences (warn only)
        if e['correct'] in correct_seen:
            warnings.append(f'{eid}: duplicate sentence (also {correct_seen[e["correct"]]}): {e["correct"]}')
        else:
            correct_seen[e['correct']] = eid

    print(f'New entries: {len(new_entries)}')
    print(f'Errors: {len(errors)}')
    for err in errors[:50]:
        print('  ERROR:', err)
    print(f'Warnings (duplicate sentences): {len(warnings)}')
    for w in warnings[:20]:
        print('  WARN:', w)

    if errors:
        sys.exit(1)

    if '--write' in sys.argv:
        old_data = json.load(open(OUT_PATH, encoding='utf-8'))
        kept = [e for e in old_data if re.match(r'^SO\d{4}$', e['id']) and int(e['id'][2:]) <= 2508]
        kept_nums = sorted(int(e['id'][2:]) for e in kept)
        assert kept_nums == list(range(1, 2509)), 'expected exactly SO0001..SO2508'
        kept.sort(key=lambda e: int(e['id'][2:]))
        final = kept + new_entries
        with open(OUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(final, f, ensure_ascii=False, indent=2)
            f.write('\n')
        print(f'Wrote {len(final)} entries to {OUT_PATH}')


if __name__ == '__main__':
    main()
