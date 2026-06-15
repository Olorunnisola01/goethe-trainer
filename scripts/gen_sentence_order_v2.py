"""
Generate the replacement pool for SO0801+ (the broken machine-generated
entries). Built topic-by-topic with curated, semantically-coherent base
scenarios, multiplied across the 6 canonical subjects (ich/du/er/wir/ihr/sie)
via degen.py's conjugation/agreement tables.

Run: python scripts/gen_sentence_order_v2.py
Writes: scripts/_generated_new_entries.json (list of entries, SO0801+)
"""
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))
from degen import (  # noqa: E402
    gen_svo, gen_svo_poss, gen_w_frage, gen_ja_nein_frage,
    gen_imperativ, gen_subordinate, gen_konjunktiv2,
    build_entry, SUBJ, PERSONS,
)

NEXT_ID = [801]
ENTRIES = []


def add(entries):
    ENTRIES.extend(entries)


# =============================================================================
# A1 topics
# =============================================================================

# ---------------------------------------------------------------------------
# sein
# ---------------------------------------------------------------------------
SEIN_TIP = "'sein' (to be) is the conjugated verb in position 2; the predicate (adjective/noun/place) follows at the end."
SEIN_STRUCT = "Subject + sein (conjugated) + Predicate"
for rest in (
    ['müde', '.'],
    ['hungrig', '.'],
    ['glücklich', '.'],
    ['in', 'der', 'Schule', '.'],
    ['zu', 'Hause', '.'],
    ['nicht', 'da', '.'],
    ['krank', '.'],
    ['sehr', 'nett', '.'],
    ['heute', 'frei', '.'],
    ['im', 'Garten', '.'],
    ['fertig', '.'],
    ['pünktlich', '.'],
):
    add(gen_svo({'verb': 'sein', 'rest': rest, 'tip': SEIN_TIP, 'structure': SEIN_STRUCT}, NEXT_ID, 'A1', 'sein'))

# ---------------------------------------------------------------------------
# haben
# ---------------------------------------------------------------------------
HABEN_TIP = "'haben' (to have) is the conjugated verb in position 2; the object follows."
HABEN_STRUCT = "Subject + haben (conjugated) + Object"
for rest in (
    ['Zeit', '.'],
    ['Hunger', '.'],
    ['einen', 'Hund', '.'],
    ['heute', 'frei', '.'],
    ['keine', 'Zeit', '.'],
    ['Durst', '.'],
    ['eine', 'Frage', '.'],
    ['morgen', 'Unterricht', '.'],
    ['ein', 'neues', 'Auto', '.'],
    ['viele', 'Freunde', '.'],
    ['heute', 'Geburtstag', '.'],
    ['Probleme', 'mit', 'dem', 'Computer', '.'],
):
    add(gen_svo({'verb': 'haben', 'rest': rest, 'tip': HABEN_TIP, 'structure': HABEN_STRUCT}, NEXT_ID, 'A1', 'haben'))

# ---------------------------------------------------------------------------
# W-Fragen
# ---------------------------------------------------------------------------
WF_TIP = "In a W-question, the question word comes first, then the conjugated verb, then the subject."
WF_STRUCT = "W-word + Verb (conjugated) + Subject + Rest + ?"
for wort, verb, rest in (
    ('Wo', 'wohnen', ['?']),
    ('Wann', 'kommen', ['nach', 'Hause', '?']),
    ('Was', 'machen', ['heute', '?']),
    ('Warum', 'lernen', ['Deutsch', '?']),
    ('Wohin', 'gehen', ['heute', 'Abend', '?']),
    ('Was', 'trinken', ['gern', '?']),
    ('Wie', 'finden', ['das', 'Buch', '?']),
    ('Wann', 'beginnen', ['mit', 'der', 'Arbeit', '?']),
    ('Was', 'suchen', ['hier', '?']),
    ('Wo', 'arbeiten', ['jetzt', '?']),
    ('Wann', 'essen', ['zu', 'Mittag', '?']),
    ('Warum', 'glauben', ['daran', '?']),
):
    add(gen_w_frage({'wort': wort, 'verb': verb, 'rest': rest, 'tip': WF_TIP, 'structure': WF_STRUCT}, NEXT_ID, 'A1', 'W-Fragen'))

# ---------------------------------------------------------------------------
# Ja/Nein-Fragen
# ---------------------------------------------------------------------------
JN_TIP = "In a yes/no question, the conjugated verb moves to position 1, before the subject."
JN_STRUCT = "Verb (conjugated) + Subject + Rest + ?"
for verb, rest in (
    ('wohnen', ['hier', '?']),
    ('spielen', ['gern', 'Fußball', '?']),
    ('trinken', ['Kaffee', '?']),
    ('kommen', ['aus', 'Nigeria', '?']),
    ('haben', ['Zeit', '?']),
    ('lernen', ['Deutsch', '?']),
    ('arbeiten', ['heute', '?']),
    ('kochen', ['gern', '?']),
    ('wohnen', ['in', 'Berlin', '?']),
    ('kaufen', ['das', 'Buch', '?']),
    ('sein', ['müde', '?']),
    ('gehen', ['ins', 'Kino', '?']),
):
    add(gen_ja_nein_frage({'verb': verb, 'rest': rest, 'tip': JN_TIP, 'structure': JN_STRUCT}, NEXT_ID, 'A1', 'Ja/Nein-Fragen'))

# ---------------------------------------------------------------------------
# Negation
# ---------------------------------------------------------------------------
NEG_NICHT_TIP = "'nicht' negates the whole statement and usually stands at the end of the sentence (or right before the part it negates)."
NEG_KEIN_TIP = "'kein-' negates a noun that would otherwise have 'ein' or no article; it agrees with the noun like 'ein-'."
NEG_STRUCT = "Subject + Verb + ... + nicht/kein- + (Noun) + ."
for verb, rest, tip in (
    ('verstehen', ['das', 'nicht', '.'], NEG_NICHT_TIP),
    ('haben', ['keine', 'Zeit', '.'], NEG_KEIN_TIP),
    ('trinken', ['keinen', 'Kaffee', '.'], NEG_KEIN_TIP),
    ('wohnen', ['nicht', 'mehr', 'hier', '.'], NEG_NICHT_TIP),
    ('haben', ['kein', 'Auto', '.'], NEG_KEIN_TIP),
    ('kommen', ['heute', 'nicht', '.'], NEG_NICHT_TIP),
    ('kennen', ['ihn', 'nicht', '.'], NEG_NICHT_TIP),
    ('essen', ['kein', 'Fleisch', '.'], NEG_KEIN_TIP),
    ('arbeiten', ['heute', 'nicht', '.'], NEG_NICHT_TIP),
    ('sein', ['nicht', 'müde', '.'], NEG_NICHT_TIP),
    ('haben', ['keine', 'Geschwister', '.'], NEG_KEIN_TIP),
    ('glauben', ['ihm', 'nicht', '.'], NEG_NICHT_TIP),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': tip, 'structure': NEG_STRUCT}, NEXT_ID, 'A1', 'Negation'))

# ---------------------------------------------------------------------------
# Verben
# ---------------------------------------------------------------------------
VERB_TIP = "Regular verbs add -e/-st/-t/-en/-t/-en to the stem depending on the subject."
VERB_STRUCT = "Subject + Verb (conjugated) + Object"
for verb, rest in (
    ('spielen', ['Gitarre', '.']),
    ('lernen', ['Deutsch', '.']),
    ('kochen', ['gern', '.']),
    ('lesen', ['ein', 'Buch', '.']),
    ('schreiben', ['eine', 'E-Mail', '.']),
    ('hören', ['Musik', '.']),
    ('sehen', ['einen', 'Film', '.']),
    ('kaufen', ['Brot', '.']),
    ('trinken', ['Wasser', '.']),
    ('machen', ['die', 'Hausaufgaben', '.']),
    ('suchen', ['einen', 'Job', '.']),
    ('brauchen', ['Hilfe', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': VERB_TIP, 'structure': VERB_STRUCT}, NEXT_ID, 'A1', 'Verben'))

# ---------------------------------------------------------------------------
# Zeit
# ---------------------------------------------------------------------------
ZEIT_TIP = "Time expressions (e.g. 'am Montag', 'um acht Uhr') usually come right after the conjugated verb."
ZEIT_STRUCT = "Subject + Verb + Time + (Object)"
for verb, rest in (
    ('kommen', ['um', 'acht', 'Uhr', '.']),
    ('arbeiten', ['von', 'Montag', 'bis', 'Freitag', '.']),
    ('haben', ['am', 'Montag', 'Deutschunterricht', '.']),
    ('spielen', ['am', 'Wochenende', 'Tennis', '.']),
    ('kochen', ['jeden', 'Abend', '.']),
    ('lernen', ['jeden', 'Tag', 'Deutsch', '.']),
    ('gehen', ['um', 'sieben', 'Uhr', 'ins', 'Bett', '.']),
    ('besuchen', ['die', 'Oma', 'am', 'Sonntag', '.']),
    ('reisen', ['im', 'Sommer', 'nach', 'Italien', '.']),
    ('feiern', ['heute', 'Abend', '.']),
    ('warten', ['seit', 'einer', 'Stunde', '.']),
    ('trinken', ['morgens', 'Kaffee', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': ZEIT_TIP, 'structure': ZEIT_STRUCT}, NEXT_ID, 'A1', 'Zeit'))

# ---------------------------------------------------------------------------
# Familie
# ---------------------------------------------------------------------------
FAM_POSS_TIP = "The possessive determiner ('mein-/dein-/sein-/unser-/euer-/ihr-') agrees with the case and gender of the noun that follows it, not with the subject."
FAM_TIP = "Family vocabulary in a simple Subject + Verb + Object sentence."
FAM_STRUCT_POSS = "Subject + Verb + poss.-determiner + Noun"
FAM_STRUCT = "Subject + Verb + Object"
for verb, rest, slot in (
    ('anrufen', ['{poss}', 'Bruder', 'an', '.'], 'ma'),
    ('besuchen', ['{poss}', 'Schwester', '.'], 'f'),
    ('helfen', ['{poss}', 'Mutter', '.'], 'fd'),
    ('anrufen', ['{poss}', 'Eltern', 'an', '.'], 'f'),
    ('treffen', ['{poss}', 'Bruder', 'am', 'Sonntag', '.'], 'ma'),
    ('besuchen', ['{poss}', 'Großeltern', '.'], 'f'),
    ('schenken', ['{poss}', 'Schwester', 'ein', 'Buch', '.'], 'fd'),
    ('kennen', ['{poss}', 'Onkel', 'gut', '.'], 'ma'),
    ('besuchen', ['{poss}', 'Tante', 'am', 'Wochenende', '.'], 'f'),
):
    add(gen_svo_poss({'verb': verb, 'rest': rest, 'tip': FAM_POSS_TIP, 'structure': FAM_STRUCT_POSS}, NEXT_ID, 'A1', 'Familie', slot))
for verb, rest in (
    ('haben', ['eine', 'große', 'Familie', '.']),
    ('haben', ['drei', 'Geschwister', '.']),
    ('haben', ['zwei', 'Kinder', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': FAM_TIP, 'structure': FAM_STRUCT}, NEXT_ID, 'A1', 'Familie'))

# ---------------------------------------------------------------------------
# Zahlen
# ---------------------------------------------------------------------------
ZAHL_TIP = "Cardinal numbers (zwanzig, hundert, ...) come directly before the noun they count; the noun itself does not change."
ZAHL_STRUCT = "Subject + Verb + Number + Noun"
for verb, rest in (
    ('haben', ['zwanzig', 'Euro', '.']),
    ('kaufen', ['zwei', 'Bücher', '.']),
    ('brauchen', ['hundert', 'Euro', '.']),
    ('haben', ['vier', 'Fenster', 'im', 'Zimmer', '.']),
    ('haben', ['fünfzig', 'Bücher', '.']),
    ('kaufen', ['drei', 'Kilo', 'Äpfel', '.']),
    ('brauchen', ['zehn', 'Minuten', '.']),
    ('haben', ['dreißig', 'Jahre', 'Erfahrung', '.']),
    ('haben', ['zwei', 'Geschwister', '.']),
    ('brauchen', ['fünf', 'Minuten', 'für', 'den', 'Weg', '.']),
    ('kaufen', ['sechs', 'Eier', '.']),
    ('haben', ['drei', 'Zimmer', 'in', 'der', 'Wohnung', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': ZAHL_TIP, 'structure': ZAHL_STRUCT}, NEXT_ID, 'A1', 'Zahlen'))

# ---------------------------------------------------------------------------
# Grundsätze
# ---------------------------------------------------------------------------
GRUND_TIP = "Basic statement word order: Subject in position 1, conjugated verb in position 2, everything else follows."
GRUND_STRUCT = "Subject + Verb (position 2) + Object/Complement"
for verb, rest in (
    ('spielen', ['Fußball', '.']),
    ('trinken', ['Tee', '.']),
    ('lernen', ['Englisch', '.']),
    ('wohnen', ['in', 'Deutschland', '.']),
    ('kommen', ['aus', 'Nigeria', '.']),
    ('sprechen', ['Deutsch', '.']),
    ('lesen', ['die', 'Zeitung', '.']),
    ('kaufen', ['Milch', '.']),
    ('hören', ['Radio', '.']),
    ('kochen', ['Suppe', '.']),
    ('machen', ['eine', 'Pause', '.']),
    ('suchen', ['ein', 'Hotel', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': GRUND_TIP, 'structure': GRUND_STRUCT}, NEXT_ID, 'A1', 'Grundsätze'))


# =============================================================================
# A2 topics
# =============================================================================

# ---------------------------------------------------------------------------
# Trennbare Verben
# ---------------------------------------------------------------------------
TV_TIP = "Separable verbs (e.g. aufstehen, einkaufen) split: the conjugated stem stays in position 2, and the particle/prefix moves to the very end of the sentence."
TV_STRUCT = "Subject + Verb-stem (conjugated) + ... + Particle"
for verb, rest in (
    ('stehen', ['um', 'sechs', 'Uhr', 'auf', '.']),
    ('kaufen', ['heute', 'Gemüse', 'ein', '.']),
    ('raeumen', ['das', 'Zimmer', 'auf', '.']),
    ('anrufen', ['meine', 'Freundin', 'an', '.']),
    ('fangen', ['um', 'acht', 'Uhr', 'an', '.']),
    ('gehen', ['heute', 'Abend', 'aus', '.']),
    ('machen', ['das', 'Fenster', 'zu', '.']),
    ('machen', ['die', 'Tür', 'auf', '.']),
    ('holen', ['die', 'Kinder', 'ab', '.']),
    ('bringen', ['einen', 'Kuchen', 'mit', '.']),
    ('sehen', ['jeden', 'Abend', 'fern', '.']),
    ('mitkommen', ['heute', 'mit', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': TV_TIP, 'structure': TV_STRUCT}, NEXT_ID, 'A2', 'Trennbare Verben'))

# ---------------------------------------------------------------------------
# Modalverben
# ---------------------------------------------------------------------------
MOD_TIP = "Modal verbs (können/müssen/wollen/dürfen/sollen/möchten) are conjugated in position 2; the main verb stays in its infinitive form at the very end."
MOD_STRUCT = "Subject + Modal (conjugated) + ... + Infinitive"
for verb, rest in (
    ('können', ['gut', 'schwimmen', '.']),
    ('müssen', ['heute', 'arbeiten', '.']),
    ('wollen', ['ein', 'Eis', 'essen', '.']),
    ('dürfen', ['hier', 'nicht', 'rauchen', '.']),
    ('sollen', ['mehr', 'Wasser', 'trinken', '.']),
    ('möchten', ['einen', 'Kaffee', 'trinken', '.']),
    ('können', ['heute', 'nicht', 'kommen', '.']),
    ('müssen', ['die', 'Hausaufgaben', 'machen', '.']),
    ('wollen', ['nach', 'Berlin', 'fahren', '.']),
    ('dürfen', ['das', 'Auto', 'fahren', '.']),
    ('können', ['sehr', 'gut', 'kochen', '.']),
    ('möchten', ['ein', 'Buch', 'kaufen', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': MOD_TIP, 'structure': MOD_STRUCT}, NEXT_ID, 'A2', 'Modalverben'))

# ---------------------------------------------------------------------------
# Perfekt
# ---------------------------------------------------------------------------
PERF_TIP = "Perfekt = haben/sein (conjugated, position 2) + ... + past participle (at the end). Verbs of motion or change of state usually take 'sein'."
PERF_STRUCT = "Subject + haben/sein (conjugated) + ... + Participle"
for aux, rest in (
    ('haben', ['Fußball', 'gespielt', '.']),
    ('sein', ['ins', 'Kino', 'gegangen', '.']),
    ('haben', ['ein', 'neues', 'Handy', 'gekauft', '.']),
    ('sein', ['nach', 'Berlin', 'gefahren', '.']),
    ('haben', ['einen', 'Apfel', 'gegessen', '.']),
    ('haben', ['ein', 'Buch', 'gelesen', '.']),
    ('sein', ['spät', 'gekommen', '.']),
    ('haben', ['die', 'Hausaufgaben', 'gemacht', '.']),
    ('haben', ['einen', 'Film', 'gesehen', '.']),
    ('haben', ['eine', 'E-Mail', 'geschrieben', '.']),
    ('sein', ['zu', 'Hause', 'geblieben', '.']),
    ('haben', ['einen', 'Kaffee', 'getrunken', '.']),
):
    add(gen_svo({'verb': aux, 'rest': rest, 'tip': PERF_TIP, 'structure': PERF_STRUCT}, NEXT_ID, 'A2', 'Perfekt'))

# ---------------------------------------------------------------------------
# TeKaMoLo (Time - Kausal - Modal - Lokal word order)
# ---------------------------------------------------------------------------
TKM_TIP = "TeKaMoLo: when several adverbials combine in a sentence, the order is Temporal (when) - Kausal (why) - Modal (how) - Lokal (where)."
TKM_STRUCT = "Subject + Verb + Time + Manner + Place"
for verb, rest in (
    ('fahren', ['morgen', 'mit', 'dem', 'Bus', 'in', 'die', 'Stadt', '.']),
    ('gehen', ['heute', 'zu', 'Fuß', 'zur', 'Schule', '.']),
    ('reisen', ['im', 'Sommer', 'mit', 'dem', 'Flugzeug', 'nach', 'Spanien', '.']),
    ('fahren', ['am', 'Wochenende', 'schnell', 'nach', 'Hause', '.']),
    ('gehen', ['abends', 'gern', 'spazieren', '.']),
    ('kommen', ['morgens', 'immer', 'pünktlich', 'zur', 'Arbeit', '.']),
    ('fahren', ['heute', 'mit', 'dem', 'Auto', 'zum', 'Supermarkt', '.']),
    ('gehen', ['am', 'Abend', 'allein', 'ins', 'Bett', '.']),
    ('laufen', ['jeden', 'Morgen', 'langsam', 'durch', 'den', 'Park', '.']),
    ('fahren', ['samstags', 'oft', 'mit', 'dem', 'Rad', 'zur', 'Arbeit', '.']),
    ('kommen', ['heute', 'leider', 'sehr', 'spät', 'nach', 'Hause', '.']),
    ('gehen', ['nachmittags', 'manchmal', 'zu', 'Fuß', 'nach', 'Hause', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': TKM_TIP, 'structure': TKM_STRUCT}, NEXT_ID, 'A2', 'TeKaMoLo'))

# ---------------------------------------------------------------------------
# Dativ
# ---------------------------------------------------------------------------
DAT_TIP = "Dative case marks the indirect object (to/for whom). Definite articles in the dative: der -> dem (m./n.), die -> der (f.), die -> den (pl.)."
DAT_STRUCT = "Subject + Verb + Dative object + (Accusative object)"
for verb, rest in (
    ('helfen', ['dem', 'Lehrer', '.']),
    ('geben', ['der', 'Frau', 'das', 'Geld', '.']),
    ('schenken', ['dem', 'Freund', 'ein', 'Buch', '.']),
    ('zeigen', ['den', 'Kindern', 'die', 'Bilder', '.']),
    ('antworten', ['dem', 'Chef', '.']),
    ('gefallen', ['der', 'Lehrerin', '.']),
    ('glauben', ['dem', 'Mann', 'nicht', '.']),
    ('helfen', ['den', 'Nachbarn', '.']),
    ('zeigen', ['dem', 'Touristen', 'den', 'Weg', '.']),
    ('schenken', ['der', 'Oma', 'Blumen', '.']),
    ('geben', ['dem', 'Kind', 'einen', 'Apfel', '.']),
    ('helfen', ['der', 'Familie', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': DAT_TIP, 'structure': DAT_STRUCT}, NEXT_ID, 'A2', 'Dativ'))

# ---------------------------------------------------------------------------
# Präpositionen
# ---------------------------------------------------------------------------
PRAEP_TIP = "Prepositions determine the case of the noun that follows (e.g. 'mit'/'aus'/'bei'/'zu' + Dative; 'für'/'durch'/'ohne'/'gegen' + Accusative)."
PRAEP_STRUCT = "Subject + Verb + Preposition + Case-marked Noun"
for verb, rest in (
    ('fahren', ['mit', 'dem', 'Zug', 'nach', 'München', '.']),
    ('kommen', ['aus', 'der', 'Türkei', '.']),
    ('warten', ['auf', 'den', 'Bus', '.']),
    ('gehen', ['durch', 'den', 'Park', '.']),
    ('sprechen', ['mit', 'der', 'Lehrerin', '.']),
    ('sein', ['gegen', 'den', 'Plan', '.']),
    ('gehen', ['um', 'die', 'Ecke', '.']),
    ('sprechen', ['über', 'das', 'Wetter', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': PRAEP_TIP, 'structure': PRAEP_STRUCT}, NEXT_ID, 'A2', 'Präpositionen'))
for verb, rest, slot in (
    ('kaufen', ['ein', 'Geschenk', 'für', '{poss}', 'Vater', '.'], 'ma'),
    ('wohnen', ['bei', '{poss}', 'Familie', '.'], 'fd'),
    ('reisen', ['ohne', '{poss}', 'Familie', '.'], 'f'),
    ('fahren', ['zu', '{poss}', 'Arbeit', '.'], 'fd'),
):
    add(gen_svo_poss({'verb': verb, 'rest': rest, 'tip': PRAEP_TIP, 'structure': PRAEP_STRUCT}, NEXT_ID, 'A2', 'Präpositionen', slot))

# ---------------------------------------------------------------------------
# Komparativ
# ---------------------------------------------------------------------------
KOMP_TIP = "Comparative adjectives add '-er' (often with an umlaut); 'als' introduces what is being compared to."
KOMP_STRUCT = "Subject + Verb + Adjective-er + als + Comparison"
for verb, rest, slot in (
    ('sein', ['größer', 'als', '{poss}', 'Bruder', '.'], 'm'),
    ('sein', ['jünger', 'als', '{poss}', 'Schwester', '.'], 'f'),
    ('sein', ['kleiner', 'als', '{poss}', 'Vater', '.'], 'm'),
    ('sein', ['schneller', 'als', '{poss}', 'Schwester', '.'], 'f'),
):
    add(gen_svo_poss({'verb': verb, 'rest': rest, 'tip': KOMP_TIP, 'structure': KOMP_STRUCT}, NEXT_ID, 'A2', 'Komparativ', slot))
for verb, rest in (
    ('kochen', ['besser', 'als', 'früher', '.']),
    ('arbeiten', ['schneller', 'als', 'gestern', '.']),
    ('sein', ['heute', 'müder', 'als', 'sonst', '.']),
    ('sein', ['besser', 'in', 'Mathe', 'als', 'in', 'Englisch', '.']),
    ('sein', ['lieber', 'zu', 'Hause', 'als', 'im', 'Büro', '.']),
    ('sein', ['heute', 'fitter', 'als', 'gestern', '.']),
    ('lernen', ['lieber', 'am', 'Morgen', 'als', 'am', 'Abend', '.']),
    ('sein', ['ruhiger', 'als', 'letzte', 'Woche', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': KOMP_TIP, 'structure': KOMP_STRUCT}, NEXT_ID, 'A2', 'Komparativ'))

# ---------------------------------------------------------------------------
# Imperativ
# ---------------------------------------------------------------------------
IMP_TIP = "Imperative: du-form often drops '-st' (and any vowel change); ihr-form = present-tense ihr-form; Sie-form = infinitive + 'Sie'. No subject pronoun for du/ihr."
IMP_STRUCT = "Verb (imperative) + ... + !"
for verb, du_form, rest in (
    ('kommen', 'Komm', ['bitte', 'her', '!']),
    ('helfen', 'Hilf', ['mir', 'bitte', '!']),
    ('machen', 'Mach', ['das', 'Fenster', 'zu', '!']),
    ('warten', 'Warte', ['hier', '!']),
    ('lesen', 'Lies', ['den', 'Text', '!']),
    ('sprechen', 'Sprich', ['lauter', '!']),
    ('nehmen', 'Nimm', ['den', 'Schirm', 'mit', '!']),
    ('geben', 'Gib', ['mir', 'das', 'Buch', '!']),
    ('sehen', 'Sieh', ['mal', '!']),
    ('essen', 'Iss', ['nicht', 'so', 'schnell', '!']),
    ('schreiben', 'Schreib', ['mir', 'eine', 'Nachricht', '!']),
    ('trinken', 'Trink', ['mehr', 'Wasser', '!']),
):
    add(gen_imperativ({'verb': verb, 'du_form': du_form, 'rest': rest, 'tip': IMP_TIP, 'structure': IMP_STRUCT}, NEXT_ID, 'A2', 'Imperativ'))


# =============================================================================
# B1 topics
# =============================================================================

# ---------------------------------------------------------------------------
# weil-Satz
# ---------------------------------------------------------------------------
WEIL_TIP = "'weil' sends the conjugated verb to the end of its clause (subordinate-clause word order)."
WEIL_STRUCT = "Main clause + , + weil + Subject + ... + Verb (end)"
for main, sub_rest, sub_verb in (
    (['Ich', 'bleibe', 'heute', 'zu', 'Hause', ','], ['krank'], 'sein'),
    (['Ich', 'lerne', 'viel', ','], ['gut', 'Deutsch', 'sprechen'], 'wollen'),
    (['Ich', 'gehe', 'früh', 'ins', 'Bett', ','], ['morgen', 'früh', 'aufstehen'], 'müssen'),
    (['Ich', 'esse', 'viel', 'Obst', ','], ['gesund', 'bleiben'], 'wollen'),
    (['Ich', 'rufe', 'dich', 'an', ','], ['eine', 'Frage'], 'haben'),
    (['Ich', 'trinke', 'viel', 'Wasser', ','], ['Durst'], 'haben'),
    (['Ich', 'arbeite', 'am', 'Wochenende', ','], ['Geld'], 'brauchen'),
    (['Ich', 'komme', 'heute', 'später', ','], ['noch', 'arbeiten'], 'müssen'),
    (['Ich', 'nehme', 'ein', 'Taxi', ','], ['keine', 'Zeit'], 'haben'),
    (['Ich', 'feiere', 'heute', ','], ['Geburtstag'], 'haben'),
    (['Ich', 'mache', 'eine', 'Pause', ','], ['müde'], 'sein'),
    (['Ich', 'übe', 'jeden', 'Tag', ','], ['besser', 'werden'], 'wollen'),
):
    add(gen_subordinate({'main': main, 'conj': 'weil', 'sub_rest': sub_rest, 'sub_verb': sub_verb,
                          'tip': WEIL_TIP, 'structure': WEIL_STRUCT}, NEXT_ID, 'B1', 'weil-Satz'))

# ---------------------------------------------------------------------------
# dass-Satz
# ---------------------------------------------------------------------------
DASS_TIP = "'dass' introduces a subordinate (object) clause and sends its conjugated verb to the end."
DASS_STRUCT = "Main clause + , + dass + Subject + ... + Verb (end)"
for main, sub_rest, sub_verb in (
    (['Ich', 'glaube', ','], ['Recht'], 'haben'),
    (['Ich', 'hoffe', ','], ['morgen', 'Zeit'], 'haben'),
    (['Ich', 'weiß', ','], ['Fehler'], 'machen'),
    (['Ich', 'denke', ','], ['zu', 'viel'], 'arbeiten'),
    (['Er', 'sagt', ','], ['die', 'Wahrheit'], 'sagen'),
    (['Ich', 'glaube', ','], ['nicht', 'genug'], 'schlafen'),
    (['Man', 'sagt', ','], ['gut', 'Deutsch'], 'sprechen'),
    (['Ich', 'denke', ','], ['das', 'heute', 'noch', 'schaffen'], 'können'),
    (['Ich', 'glaube', ','], ['bald', 'fertig'], 'sein'),
    (['Man', 'weiß', ','], ['gern', 'Sport'], 'machen'),
    (['Ich', 'hoffe', ','], ['das', 'schaffen'], 'können'),
    (['Ich', 'glaube', ','], ['das', 'richtig'], 'machen'),
):
    add(gen_subordinate({'main': main, 'conj': 'dass', 'sub_rest': sub_rest, 'sub_verb': sub_verb,
                          'tip': DASS_TIP, 'structure': DASS_STRUCT}, NEXT_ID, 'B1', 'dass-Satz'))

# ---------------------------------------------------------------------------
# ob-Satz
# ---------------------------------------------------------------------------
OB_TIP = "'ob' introduces an indirect yes/no question and sends its conjugated verb to the end."
OB_STRUCT = "Main clause + , + ob + Subject + ... + Verb (end)"
for main, sub_rest, sub_verb in (
    (['Ich', 'weiß', 'nicht', ','], ['Zeit'], 'haben'),
    (['Sie', 'fragt', ','], ['mitkommen'], 'wollen'),
    (['Ich', 'weiß', 'nicht', ','], ['Recht'], 'haben'),
    (['Er', 'fragt', ','], ['Deutsch'], 'sprechen'),
    (['Ich', 'weiß', 'nicht', ','], ['morgen', 'kommen'], 'können'),
    (['Ich', 'frage', 'mich', ','], ['genug'], 'lernen'),
    (['Ich', 'weiß', 'nicht', ','], ['das', 'Geschenk'], 'mögen'),
    (['Ich', 'weiß', 'nicht', ','], ['pünktlich'], 'sein'),
    (['Sie', 'fragt', ','], ['Hilfe'], 'brauchen'),
    (['Ich', 'weiß', 'nicht', ','], ['das', 'Auto'], 'kaufen'),
    (['Er', 'fragt', ','], ['morgen', 'arbeiten'], 'müssen'),
    (['Ich', 'weiß', 'nicht', ','], ['das', 'schaffen'], 'können'),
):
    add(gen_subordinate({'main': main, 'conj': 'ob', 'sub_rest': sub_rest, 'sub_verb': sub_verb,
                          'tip': OB_TIP, 'structure': OB_STRUCT}, NEXT_ID, 'B1', 'ob-Satz'))

# ---------------------------------------------------------------------------
# wenn-Satz (real condition, indicative)
# ---------------------------------------------------------------------------
WENN_TIP = "'wenn' introduces a conditional/temporal clause and sends its conjugated verb to the end; the main clause keeps normal verb-second order."
WENN_STRUCT = "Main clause + , + wenn + Subject + ... + Verb (end)"
for main, sub_rest, sub_verb in (
    (['Ich', 'gehe', 'ins', 'Kino', ','], ['Zeit'], 'haben'),
    (['Ich', 'bleibe', 'zu', 'Hause', ','], ['krank'], 'sein'),
    (['Ich', 'rufe', 'dich', 'an', ','], ['zu', 'Hause'], 'sein'),
    (['Ich', 'esse', 'etwas', ','], ['Hunger'], 'haben'),
    (['Ich', 'trinke', 'Tee', ','], ['müde'], 'sein'),
    (['Ich', 'helfe', 'dir', ','], ['Zeit'], 'haben'),
    (['Ich', 'gehe', 'schlafen', ','], ['müde'], 'sein'),
    (['Ich', 'mache', 'eine', 'Pause', ','], ['Hunger'], 'haben'),
    (['Ich', 'kaufe', 'das', 'Buch', ','], ['Geld'], 'haben'),
    (['Ich', 'besuche', 'dich', ','], ['in', 'Berlin'], 'sein'),
    (['Ich', 'schreibe', 'dir', ','], ['fertig'], 'sein'),
    (['Ich', 'lade', 'dich', 'ein', ','], ['Geburtstag'], 'haben'),
):
    add(gen_subordinate({'main': main, 'conj': 'wenn', 'sub_rest': sub_rest, 'sub_verb': sub_verb,
                          'tip': WENN_TIP, 'structure': WENN_STRUCT}, NEXT_ID, 'B1', 'wenn-Satz'))

# ---------------------------------------------------------------------------
# Relativsatz (hand-written; antecedent is a noun, not one of the 6 pronouns,
# so person-substitution does not apply naturally here)
# ---------------------------------------------------------------------------
REL_TIP = "A relative clause adds information about a noun. The relative pronoun (der/die/das/die ...) agrees with that noun's gender, number and case, and the clause's verb goes to the end."
REL_STRUCT = "Noun + , + Relative pronoun + ... + Verb (end) + , + rest of main clause"
for answer in (
    ['Der', 'Mann', ',', 'der', 'dort', 'steht', ',', 'ist', 'mein', 'Lehrer', '.'],
    ['Die', 'Frau', ',', 'die', 'dort', 'sitzt', ',', 'ist', 'meine', 'Chefin', '.'],
    ['Das', 'Kind', ',', 'das', 'dort', 'spielt', ',', 'heißt', 'Tom', '.'],
    ['Die', 'Leute', ',', 'die', 'dort', 'wohnen', ',', 'sind', 'sehr', 'freundlich', '.'],
    ['Der', 'Lehrer', ',', 'der', 'Deutsch', 'unterrichtet', ',', 'ist', 'sehr', 'geduldig', '.'],
    ['Die', 'Schülerin', ',', 'die', 'immer', 'pünktlich', 'kommt', ',', 'ist', 'sehr', 'fleißig', '.'],
    ['Der', 'Film', ',', 'den', 'ich', 'gestern', 'gesehen', 'habe', ',', 'war', 'toll', '.'],
    ['Die', 'Tasche', ',', 'die', 'ich', 'gekauft', 'habe', ',', 'ist', 'sehr', 'praktisch', '.'],
    ['Das', 'Buch', ',', 'das', 'ich', 'gerade', 'lese', ',', 'ist', 'spannend', '.'],
    ['Die', 'Bücher', ',', 'die', 'ich', 'gelesen', 'habe', ',', 'waren', 'interessant', '.'],
    ['Der', 'Freund', ',', 'dem', 'ich', 'geholfen', 'habe', ',', 'wohnt', 'in', 'Berlin', '.'],
    ['Die', 'Frau', ',', 'der', 'ich', 'geschrieben', 'habe', ',', 'hat', 'geantwortet', '.'],
    ['Der', 'Computer', ',', 'der', 'kaputt', 'ist', ',', 'gehört', 'meinem', 'Bruder', '.'],
    ['Die', 'Stadt', ',', 'die', 'ich', 'besuche', ',', 'ist', 'sehr', 'alt', '.'],
    ['Das', 'Restaurant', ',', 'das', 'wir', 'besuchen', ',', 'ist', 'sehr', 'gut', '.'],
    ['Die', 'Kinder', ',', 'die', 'im', 'Park', 'spielen', ',', 'sind', 'meine', 'Nachbarn', '.'],
):
    ENTRIES.append(build_entry(NEXT_ID[0], 'B1', 'Relativsatz', answer, REL_TIP, REL_STRUCT))
    NEXT_ID[0] += 1

# ---------------------------------------------------------------------------
# Passiv (Vorgangspassiv)
# ---------------------------------------------------------------------------
PASS_TIP = "Vorgangspassiv = werden (conjugated) + ... + past participle (at the end). The focus is on the action, not who performs it."
PASS_STRUCT = "Subject + werden (conjugated) + ... + Participle"
for rest in (
    ['kontrolliert', '.'],
    ['oft', 'eingeladen', '.'],
    ['von', 'allen', 'gemocht', '.'],
    ['nach', 'Hause', 'gebracht', '.'],
    ['zur', 'Party', 'eingeladen', '.'],
    ['im', 'Krankenhaus', 'untersucht', '.'],
    ['vom', 'Lehrer', 'gelobt', '.'],
    ['morgen', 'operiert', '.'],
    ['oft', 'gefragt', '.'],
    ['am', 'Flughafen', 'abgeholt', '.'],
    ['für', 'die', 'Arbeit', 'bezahlt', '.'],
    ['zum', 'Direktor', 'gerufen', '.'],
):
    add(gen_svo({'verb': 'werden', 'rest': rest, 'tip': PASS_TIP, 'structure': PASS_STRUCT}, NEXT_ID, 'B1', 'Passiv'))

# ---------------------------------------------------------------------------
# Konjunktiv II
# ---------------------------------------------------------------------------
KONJ_TIP = "Konjunktiv II expresses hypothetical conditions: the 'wenn'-clause uses a Konjunktiv-II form (hätte/wäre/könnte/...), the result clause uses 'würde' + infinitive."
KONJ_STRUCT = "Wenn + Subject + ... + Konjunktiv-II-Verb + , + würde + Subject + ... + Infinitive"
for verb1, cond_rest, verb2_inf, main_rest in (
    ('haben', ['Zeit'], 'reisen', ['mehr']),
    ('sein', ['reich'], 'kaufen', ['ein', 'großes', 'Haus']),
    ('haben', ['mehr', 'Geld'], 'helfen', ['mehr', 'Menschen']),
    ('haben', ['Flügel'], 'fliegen', []),
    ('sein', ['krank'], 'bleiben', ['zu', 'Hause']),
    ('haben', ['mehr', 'Zeit'], 'lernen', ['jeden', 'Tag', 'Deutsch']),
    ('können', ['besser', 'kochen'], 'einladen', ['oft', 'Freunde']),
    ('sein', ['jünger'], 'reisen', ['mehr']),
    ('haben', ['ein', 'Auto'], 'fahren', ['zur', 'Arbeit']),
    ('dürfen', ['länger', 'schlafen'], 'sein', ['glücklicher']),
    ('wissen', ['die', 'Antwort'], 'antworten', ['sofort']),
    ('haben', ['weniger', 'Stress'], 'schlafen', ['besser']),
):
    add(gen_konjunktiv2({'verb1': verb1, 'cond_rest': cond_rest, 'verb2_inf': verb2_inf, 'main_rest': main_rest,
                          'tip': KONJ_TIP, 'structure': KONJ_STRUCT}, NEXT_ID, 'B1', 'Konjunktiv II'))


# =============================================================================
# Output (A1 + A2 + B1)
# =============================================================================
if __name__ == '__main__':
    out_path = os.path.join(os.path.dirname(__file__), '_generated_new_entries.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(ENTRIES, f, ensure_ascii=False, indent=2)
    print(f'Wrote {len(ENTRIES)} entries to {out_path}')
    print('Next id:', NEXT_ID[0])
