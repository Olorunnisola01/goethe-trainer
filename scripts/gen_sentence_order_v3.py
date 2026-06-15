"""
Generate v3 additions to the Satzstellung pool (SO2509+), covering the
7 grammar topics identified as missing from v1+v2: Konnektoren,
Doppelkonnektoren, Temporalsaetze, Finalsaetze, Infinitiv mit zu,
Partizipialkonstruktionen and Vergleichssaetze (je...desto/umso).

Run: python scripts/gen_sentence_order_v3.py
Writes: scripts/_generated_v3_entries.json (list of entries, SO2509+)
"""
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'lib'))
from degen import (  # noqa: E402
    gen_svo, gen_connector, gen_subordinate, gen_subordinate_perfekt,
    gen_final_um_zu, gen_zu_infinitiv, gen_je_desto,
    build_entry, PRON_LOW, VERBS, PERSONS,
)

NEXT_ID = [2509]
ENTRIES = []


def add(entries):
    ENTRIES.extend(entries)


# =============================================================================
# Konnektoren (Position-0: und/aber/oder/denn -- no inversion;
#               Position-1: deshalb/trotzdem/also/dann/sonst -- inversion)
# =============================================================================
POS0_TIP = "und/aber/oder/denn (Position-0 connectors) join two main clauses without changing the word order of the second clause."
POS0_STRUCT = "Clause 1 + , + und/aber/oder/denn + Subject + Verb + ..."
POS1_TIP = "deshalb/trotzdem/also/dann/sonst (Position-1 connectors) take position 1, so the verb of the second clause comes immediately after them (Subject moves after the verb)."
POS1_STRUCT = "Clause 1 + , + deshalb/trotzdem/also/dann/sonst + Verb + Subject + ..."

for verb1, rest1, connector, verb2, rest2 in (
    ('machen', ['die', 'Hausaufgaben'], 'und', 'raeumen', ['das', 'Zimmer', 'auf']),
    ('sein', ['müde'], 'aber', 'arbeiten', ['weiter']),
    ('haben', ['Hunger'], 'aber', 'kochen', ['nicht']),
    ('gehen', ['ins', 'Kino'], 'oder', 'bleiben', ['zu', 'Hause']),
    ('sein', ['krank'], 'denn', 'haben', ['Fieber']),
    ('kaufen', ['Brot'], 'und', 'holen', ['Milch']),
    ('spielen', ['Fußball'], 'aber', 'verlieren', ['oft']),
    ('lesen', ['ein', 'Buch'], 'und', 'trinken', ['Tee']),
    ('kochen', ['Suppe'], 'denn', 'haben', ['Gäste']),
    ('lernen', ['Deutsch'], 'oder', 'üben', ['Französisch']),
    ('waschen', ['das', 'Auto'], 'und', 'putzen', ['die', 'Fenster']),
    ('schreiben', ['eine', 'E-Mail'], 'aber', 'vergessen', ['den', 'Anhang']),
    ('suchen', ['einen', 'Job'], 'denn', 'brauchen', ['Geld']),
    ('fahren', ['nach', 'Berlin'], 'oder', 'fahren', ['nach', 'München']),
    ('treffen', ['meine', 'Freunde'], 'und', 'feiern', ['zusammen']),
    ('sein', ['glücklich'], 'denn', 'gewinnen', ['oft']),
    ('besuchen', ['meine', 'Eltern'], 'und', 'bringen', ['Blumen', 'mit']),
    ('haben', ['Durst'], 'aber', 'finden', ['kein', 'Wasser']),
):
    add(gen_connector({'verb1': verb1, 'rest1': rest1, 'connector': connector, 'inversion': False,
                        'verb2': verb2, 'rest2': rest2, 'tip': POS0_TIP, 'structure': POS0_STRUCT},
                       NEXT_ID, 'A2', 'Konnektoren'))

for verb1, rest1, connector, verb2, rest2 in (
    ('sein', ['müde'], 'deshalb', 'gehen', ['früh', 'ins', 'Bett']),
    ('haben', ['keine', 'Zeit'], 'trotzdem', 'kommen', ['zur', 'Party']),
    ('lernen', ['fleißig'], 'deshalb', 'verstehen', ['alles']),
    ('sein', ['krank'], 'deshalb', 'bleiben', ['zu', 'Hause']),
    ('haben', ['Hunger'], 'also', 'kochen', ['etwas']),
    ('sein', ['fertig'], 'dann', 'gehen', ['nach', 'Hause']),
    ('haben', ['Zeit'], 'dann', 'helfen', ['gern']),
    ('sein', ['nicht', 'sicher'], 'deshalb', 'fragen', ['noch', 'einmal']),
    ('arbeiten', ['viel'], 'trotzdem', 'haben', ['wenig', 'Geld']),
    ('üben', ['jeden', 'Tag'], 'trotzdem', 'machen', ['viele', 'Fehler']),
    ('sein', ['hungrig'], 'also', 'essen', ['einen', 'Apfel']),
    ('gewinnen', ['das', 'Spiel'], 'dann', 'feiern', ['mit', 'Freunden']),
    ('haben', ['Durst'], 'also', 'trinken', ['Wasser']),
    ('sein', ['spät'], 'deshalb', 'laufen', ['schnell']),
    ('vergessen', ['den', 'Schlüssel'], 'deshalb', 'warten', ['vor', 'der', 'Tür']),
    ('sein', ['sehr', 'beschäftigt'], 'trotzdem', 'helfen', ['gern']),
    ('nehmen', ['das', 'Auto'], 'sonst', 'kommen', ['zu', 'spät']),
    ('packen', ['den', 'Koffer', 'heute'], 'sonst', 'vergessen', ['etwas']),
):
    add(gen_connector({'verb1': verb1, 'rest1': rest1, 'connector': connector, 'inversion': True,
                        'verb2': verb2, 'rest2': rest2, 'tip': POS1_TIP, 'structure': POS1_STRUCT},
                       NEXT_ID, 'B1', 'Konnektoren'))


# =============================================================================
# Doppelkonnektoren
# =============================================================================
WEDER_TIP = "'weder ... noch' (neither ... nor) negates both items; the conjugated verb stays in position 2."
WEDER_STRUCT = "Subject + Verb + weder + A + noch + B"
for verb, rest in (
    ('trinken', ['weder', 'Kaffee', 'noch', 'Tee', '.']),
    ('haben', ['weder', 'Zeit', 'noch', 'Geld', '.']),
    ('sein', ['weder', 'müde', 'noch', 'hungrig', '.']),
    ('mögen', ['weder', 'Fußball', 'noch', 'Tennis', '.']),
    ('essen', ['weder', 'Fleisch', 'noch', 'Fisch', '.']),
    ('sprechen', ['weder', 'Englisch', 'noch', 'Französisch', '.']),
    ('kennen', ['weder', 'das', 'Buch', 'noch', 'den', 'Film', '.']),
    ('haben', ['weder', 'ein', 'Auto', 'noch', 'ein', 'Fahrrad', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': WEDER_TIP, 'structure': WEDER_STRUCT}, NEXT_ID, 'B1', 'Doppelkonnektoren'))

SOWOHL_TIP = "'sowohl ... als auch' (both ... and) links two items equally; the conjugated verb stays in position 2."
SOWOHL_STRUCT = "Subject + Verb + sowohl + A + als auch + B"
for verb, rest in (
    ('trinken', ['sowohl', 'Kaffee', 'als', 'auch', 'Tee', '.']),
    ('sprechen', ['sowohl', 'Deutsch', 'als', 'auch', 'Englisch', '.']),
    ('sein', ['sowohl', 'klug', 'als', 'auch', 'fleißig', '.']),
    ('spielen', ['sowohl', 'Fußball', 'als', 'auch', 'Tennis', '.']),
    ('putzen', ['sowohl', 'das', 'Haus', 'als', 'auch', 'das', 'Auto', '.']),
    ('essen', ['sowohl', 'Obst', 'als', 'auch', 'Gemüse', '.']),
    ('mögen', ['sowohl', 'Musik', 'als', 'auch', 'Sport', '.']),
    ('besuchen', ['sowohl', 'die', 'Eltern', 'als', 'auch', 'die', 'Großeltern', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': SOWOHL_TIP, 'structure': SOWOHL_STRUCT}, NEXT_ID, 'B1', 'Doppelkonnektoren'))

NICHTNUR_TIP = "'nicht nur ..., sondern auch ...' (not only ... but also ...) adds a second item; a comma comes before 'sondern'."
NICHTNUR_STRUCT = "Subject + Verb + nicht nur + A + , sondern auch + B"
for verb, rest in (
    ('essen', ['nicht', 'nur', 'Obst', ',', 'sondern', 'auch', 'Gemüse', '.']),
    ('sein', ['nicht', 'nur', 'klug', ',', 'sondern', 'auch', 'nett', '.']),
    ('lernen', ['nicht', 'nur', 'Deutsch', ',', 'sondern', 'auch', 'Spanisch', '.']),
    ('trinken', ['nicht', 'nur', 'Kaffee', ',', 'sondern', 'auch', 'Tee', '.']),
    ('lesen', ['nicht', 'nur', 'Bücher', ',', 'sondern', 'auch', 'Zeitschriften', '.']),
    ('fahren', ['nicht', 'nur', 'schnell', ',', 'sondern', 'auch', 'sicher', '.']),
    ('spielen', ['nicht', 'nur', 'Fußball', ',', 'sondern', 'auch', 'Volleyball', '.']),
    ('putzen', ['nicht', 'nur', 'das', 'Zimmer', ',', 'sondern', 'auch', 'die', 'Küche', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': NICHTNUR_TIP, 'structure': NICHTNUR_STRUCT}, NEXT_ID, 'B1', 'Doppelkonnektoren'))

ZWAR_TIP = "'zwar ... aber ...' concedes a point and then contrasts it; 'zwar' sits right after the conjugated verb in clause 1, 'aber' does not change clause-2 word order."
ZWAR_STRUCT = "Subject + Verb + zwar + ... + , + aber + Subject + Verb + ..."
for verb1, rest1, verb2, rest2 in (
    ('sein', ['zwar', 'müde'], 'arbeiten', ['weiter']),
    ('haben', ['zwar', 'wenig', 'Zeit'], 'helfen', ['gern']),
    ('sein', ['zwar', 'klein'], 'sein', ['stark']),
    ('lernen', ['zwar', 'viel'], 'vergessen', ['schnell']),
    ('haben', ['zwar', 'Hunger'], 'essen', ['nichts']),
    ('sein', ['zwar', 'müde'], 'gehen', ['noch', 'nicht', 'ins', 'Bett']),
    ('üben', ['zwar', 'jeden', 'Tag'], 'spielen', ['nicht', 'perfekt']),
    ('haben', ['zwar', 'ein', 'Auto'], 'fahren', ['selten']),
):
    add(gen_connector({'verb1': verb1, 'rest1': rest1, 'connector': 'aber', 'inversion': False,
                        'verb2': verb2, 'rest2': rest2, 'tip': ZWAR_TIP, 'structure': ZWAR_STRUCT},
                       NEXT_ID, 'B1', 'Doppelkonnektoren'))

# entweder ... oder (front 'Entweder' triggers inversion in clause 1; 'oder' does not invert clause 2)
ENTWEDER_TIP = "'Entweder' at the start of the sentence triggers verb-subject inversion in clause 1; 'oder' before clause 2 does not change its word order."
ENTWEDER_STRUCT = "Entweder + Verb + Subject + ... + , + oder + Subject + Verb + ..."
for verb1, rest1, verb2, rest2 in (
    ('gehen', ['ins', 'Kino'], 'bleiben', ['zu', 'Hause']),
    ('trinken', ['Kaffee'], 'trinken', ['Tee']),
    ('fahren', ['mit', 'dem', 'Bus'], 'laufen', ['zu', 'Fuß']),
    ('kochen', ['heute'], 'essen', ['im', 'Restaurant']),
    ('lernen', ['Deutsch'], 'üben', ['Englisch']),
    ('kaufen', ['ein', 'neues', 'Auto'], 'fahren', ['mit', 'dem', 'Fahrrad']),
    ('bleiben', ['hier'], 'gehen', ['nach', 'Hause']),
    ('helfen', ['heute'], 'arbeiten', ['morgen']),
):
    for p in PERSONS:
        answer = (['Entweder', VERBS[verb1][p], PRON_LOW[p]] + rest1 + [',', 'oder', PRON_LOW[p], VERBS[verb2][p]] + rest2 + ['.'])
        ENTRIES.append(build_entry(NEXT_ID[0], 'B1', 'Doppelkonnektoren', answer, ENTWEDER_TIP, ENTWEDER_STRUCT))
        NEXT_ID[0] += 1


# =============================================================================
# Temporalsaetze (waehrend / bevor / seit -- present tense Nebensatz;
#                  nachdem -- Perfekt Nebensatz + inverted main clause)
# =============================================================================
WAEHREND_TIP = "'während' (while) introduces a subordinate clause: the conjugated verb moves to the very end."
WAEHREND_STRUCT = "Main clause + , + während + Subject + ... + Verb (end)"
for main, sub_rest, sub_verb in (
    (['Ich', 'koche', 'das', 'Essen', ','], ['Musik'], 'hören'),
    (['Ich', 'lese', 'ein', 'Buch', ','], ['Tee'], 'trinken'),
    (['Ich', 'warte', ','], ['ein', 'Buch'], 'lesen'),
    (['Ich', 'dusche', ','], ['Musik'], 'hören'),
    (['Ich', 'esse', ','], ['die', 'Nachrichten'], 'sehen'),
    (['Ich', 'fahre', 'mit', 'dem', 'Bus', ','], ['ein', 'Buch'], 'lesen'),
    (['Ich', 'putze', 'die', 'Wohnung', ','], ['ein', 'Hörbuch'], 'hören'),
    (['Ich', 'warte', 'auf', 'den', 'Bus', ','], ['eine', 'SMS'], 'schreiben'),
):
    add(gen_subordinate({'main': main, 'conj': 'während', 'sub_rest': sub_rest, 'sub_verb': sub_verb,
                          'tip': WAEHREND_TIP, 'structure': WAEHREND_STRUCT}, NEXT_ID, 'B1', 'Temporalsätze'))

BEVOR_TIP = "'bevor' (before) introduces a subordinate clause: the conjugated verb moves to the very end."
BEVOR_STRUCT = "Main clause + , + bevor + Subject + ... + Verb (end)"
for main, sub_rest, sub_verb in (
    (['Ich', 'esse', ','], ['ins', 'Bett'], 'gehen'),
    (['Ich', 'dusche', ','], ['zur', 'Arbeit'], 'gehen'),
    (['Ich', 'übe', 'viel', ','], ['die', 'Prüfung'], 'schreiben'),
    (['Ich', 'packe', 'den', 'Koffer', ','], ['in', 'den', 'Urlaub'], 'fahren'),
    (['Ich', 'wasche', 'die', 'Hände', ','], [], 'essen'),
    (['Ich', 'rufe', 'an', ','], [], 'kommen'),
    (['Ich', 'lese', 'die', 'E-Mail', ','], ['eine', 'Antwort'], 'schreiben'),
    (['Ich', 'frage', 'noch', 'einmal', ','], [], 'antworten'),
):
    add(gen_subordinate({'main': main, 'conj': 'bevor', 'sub_rest': sub_rest, 'sub_verb': sub_verb,
                          'tip': BEVOR_TIP, 'structure': BEVOR_STRUCT}, NEXT_ID, 'B1', 'Temporalsätze'))

SEIT_TIP = "'seit' (since) introduces a subordinate clause describing how long something has been true: the conjugated verb moves to the very end."
SEIT_STRUCT = "Main clause + , + seit + Subject + ... + Verb (end)"
for main, sub_rest, sub_verb in (
    (['Ich', 'bin', 'glücklich', ','], ['hier'], 'wohnen'),
    (['Ich', 'spreche', 'besser', 'Deutsch', ','], ['in', 'Deutschland'], 'wohnen'),
    (['Ich', 'bin', 'müde', ','], ['schlecht'], 'schlafen'),
    (['Ich', 'habe', 'mehr', 'Zeit', ','], ['nicht', 'mehr'], 'arbeiten'),
    (['Ich', 'bin', 'gesünder', ','], ['jeden', 'Tag', 'Sport'], 'machen'),
    (['Ich', 'lerne', 'viel', ','], ['in', 'der', 'Bibliothek'], 'arbeiten'),
    (['Ich', 'bin', 'ruhiger', ','], ['weniger', 'Kaffee'], 'trinken'),
    (['Ich', 'koche', 'gern', ','], ['das', 'Kochbuch'], 'haben'),
):
    add(gen_subordinate({'main': main, 'conj': 'seit', 'sub_rest': sub_rest, 'sub_verb': sub_verb,
                          'tip': SEIT_TIP, 'structure': SEIT_STRUCT}, NEXT_ID, 'B1', 'Temporalsätze'))

NACHDEM_TIP = "'nachdem' (after) introduces a subordinate clause in the Perfekt: the participle comes before the conjugated auxiliary, both at the end of the clause. The fronted clause then triggers inversion in the main clause."
NACHDEM_STRUCT = "Nachdem + Subject + ... + Participle + haben/sein + , + Verb + Subject + ..."
for sub_rest, sub_verb, main_verb, main_rest in (
    (['das', 'Frühstück'], 'essen', 'gehen', ['zur', 'Arbeit']),
    (['die', 'Hausaufgaben'], 'machen', 'spielen', ['Fußball']),
    (['den', 'Film'], 'sehen', 'gehen', ['ins', 'Bett']),
    (['die', 'E-Mail'], 'schreiben', 'machen', ['eine', 'Pause']),
    (['das', 'Auto'], 'waschen', 'fahren', ['zum', 'Supermarkt']),
    (['die', 'Wohnung'], 'putzen', 'einladen', ['Freunde', 'ein']),
    (['das', 'Buch'], 'lesen', 'schreiben', ['eine', 'Rezension']),
    (['die', 'Prüfung'], 'schreiben', 'feiern', ['mit', 'Freunden']),
    (['Sport'], 'machen', 'duschen', []),
    (['meinen', 'Schlüssel'], 'finden', 'kommen', ['nach', 'Hause']),
):
    add(gen_subordinate_perfekt({'conj': 'nachdem', 'sub_rest': sub_rest, 'sub_verb': sub_verb,
                                  'main_verb': main_verb, 'main_rest': main_rest,
                                  'tip': NACHDEM_TIP, 'structure': NACHDEM_STRUCT}, NEXT_ID, 'B1', 'Temporalsätze'))


# =============================================================================
# Finalsaetze (um ... zu + Infinitiv -- same subject; damit -- different subject possible)
# =============================================================================
UMZU_TIP = "'um ... zu + Infinitiv' expresses a purpose when the subject of both clauses is the same; the infinitive stays uninflected at the end."
UMZU_STRUCT = "Subject + Verb + ... + , + um + ... + zu + Infinitiv"
for main_verb, main_rest, zu_rest, infinitive in (
    ('lernen', ['jeden', 'Tag'], ['die', 'Prüfung'], 'bestehen'),
    ('gehen', ['früh', 'ins', 'Bett'], ['ausgeruht'], 'sein'),
    ('arbeiten', ['viel'], ['ein', 'Haus'], 'kaufen'),
    ('fahren', ['nach', 'Berlin'], ['meine', 'Familie'], 'besuchen'),
    ('üben', ['jeden', 'Tag', 'Deutsch'], ['besser'], 'sprechen'),
    ('kochen', ['heute'], ['Geld'], 'sparen'),
    ('laufen', ['jeden', 'Morgen'], ['fit'], 'bleiben'),
    ('gehen', ['zur', 'Bank'], ['Geld'], 'wechseln'),
    ('kommen', ['früher'], ['beim', 'Umzug'], 'helfen'),
    ('schreiben', ['eine', 'Liste'], ['nichts'], 'vergessen'),
    ('gehen', ['ins', 'Fitnessstudio'], [], 'trainieren'),
    ('nehmen', ['ein', 'Taxi'], ['pünktlich'], 'anzukommen'),
    ('lernen', ['Vokabeln'], ['den', 'Wortschatz'], 'erweitern'),
    ('kaufen', ['neue', 'Schuhe'], ['bequemer'], 'laufen'),
    ('reisen', ['nach', 'Spanien'], ['Spanisch'], 'lernen'),
    ('arbeiten', ['am', 'Wochenende'], ['mehr'], 'verdienen'),
    ('gehen', ['zur', 'Bibliothek'], ['ein', 'Buch'], 'auszuleihen'),
):
    add(gen_final_um_zu({'main_verb': main_verb, 'main_rest': main_rest, 'zu_rest': zu_rest, 'infinitive': infinitive,
                          'tip': UMZU_TIP, 'structure': UMZU_STRUCT}, NEXT_ID, 'B1', 'Finalsätze'))

DAMIT_TIP = "'damit' (so that) introduces a purpose clause that can have a different subject; the conjugated verb moves to the end."
DAMIT_STRUCT = "Main clause + , + damit + Subject + ... + Verb (end)"
for main, sub_rest, sub_verb in (
    (['Ich', 'erkläre', 'die', 'Regel', ','], ['alles'], 'verstehen'),
    (['Ich', 'spreche', 'laut', ','], ['mich'], 'hören'),
    (['Ich', 'schreibe', 'das', 'auf', ','], ['es', 'nicht'], 'vergessen'),
    (['Ich', 'koche', 'extra', 'viel', ','], ['auch'], 'essen'),
    (['Ich', 'gebe', 'dir', 'Geld', ','], ['ein', 'Geschenk'], 'kaufen'),
    (['Ich', 'rufe', 'früh', 'an', ','], ['mich', 'nicht'], 'vergessen'),
    (['Ich', 'zeige', 'dir', 'den', 'Weg', ','], ['das', 'Haus'], 'finden'),
    (['Ich', 'spare', 'Geld', ','], ['in', 'den', 'Urlaub'], 'fahren'),
    (['Ich', 'arbeite', 'viel', ','], ['studieren'], 'können'),
    (['Ich', 'helfe', 'dir', ','], ['die', 'Prüfung', 'bestehen'], 'können'),
    (['Ich', 'übe', 'mit', 'dir', ','], ['besser', 'Deutsch', 'sprechen'], 'können'),
    (['Ich', 'schreibe', 'eine', 'Liste', ','], ['nichts'], 'vergessen'),
    (['Ich', 'packe', 'den', 'Koffer', ','], ['rechtzeitig'], 'fahren'),
    (['Ich', 'mache', 'das', 'Fenster', 'zu', ','], ['nicht', 'krank'], 'werden'),
    (['Ich', 'bringe', 'dir', 'Tee', ','], ['gesund'], 'werden'),
    (['Ich', 'warte', 'hier', ','], ['mich'], 'finden'),
    (['Ich', 'lege', 'den', 'Schlüssel', 'hin', ','], ['ihn'], 'nehmen'),
):
    add(gen_subordinate({'main': main, 'conj': 'damit', 'sub_rest': sub_rest, 'sub_verb': sub_verb,
                          'tip': DAMIT_TIP, 'structure': DAMIT_STRUCT}, NEXT_ID, 'B1', 'Finalsätze'))


# =============================================================================
# Infinitiv mit zu
# =============================================================================
ZU_TIP = "Verbs like 'versuchen', 'vergessen', 'hoffen', 'planen' and 'beginnen', or expressions like 'Zeit haben' / 'Lust haben', are followed by a comma and a 'zu + Infinitiv' clause."
ZU_STRUCT = "Subject + Verb + ... + , + ... + zu + Infinitiv"
NOCOMMA_TIP = "'brauchen ... nicht zu' and 'haben viel zu tun' are fixed expressions: no comma before 'zu + Infinitiv'."
NOCOMMA_STRUCT = "Subject + Verb + ... + zu + Infinitiv (no comma)"
for main_verb, main_rest, zu_rest, infinitive in (
    ('versuchen', [], ['früh'], 'aufzustehen'),
    ('vergessen', [], ['die', 'Tür'], 'abzuschließen'),
    ('hoffen', [], ['die', 'Prüfung'], 'bestehen'),
    ('planen', [], ['nach', 'Berlin'], 'fahren'),
    ('beginnen', [], ['Deutsch'], 'lernen'),
    ('haben', ['keine', 'Zeit'], [], 'kommen'),
    ('versuchen', [], ['das', 'Problem'], 'lösen'),
    ('vergessen', [], ['Wasser'], 'mitzubringen'),
    ('hoffen', [], ['bald'], 'anzukommen'),
    ('planen', [], ['ein', 'Haus'], 'kaufen'),
    ('beginnen', [], ['mehr'], 'sparen'),
    ('versuchen', [], ['ruhig'], 'bleiben'),
    ('hoffen', [], ['dich', 'bald'], 'sehen'),
    ('vergessen', [], ['ihm'], 'antworten'),
    ('planen', [], ['früher'], 'aufzuhören'),
    ('versuchen', [], ['weniger'], 'arbeiten'),
    ('beginnen', [], ['regelmäßig', 'Sport'], 'treiben'),
    ('hoffen', [], ['einen', 'Job'], 'finden'),
    ('haben', ['Lust'], [], 'kochen'),
    ('versuchen', [], ['neue', 'Wörter'], 'lernen'),
):
    add(gen_zu_infinitiv({'main_verb': main_verb, 'main_rest': main_rest, 'zu_rest': zu_rest, 'infinitive': infinitive,
                           'tip': ZU_TIP, 'structure': ZU_STRUCT}, NEXT_ID, 'A2', 'Infinitiv mit zu'))

for main_verb, main_rest, zu_rest, infinitive in (
    ('haben', ['viel'], [], 'tun'),
    ('brauchen', ['nicht'], [], 'kommen'),
):
    add(gen_zu_infinitiv({'main_verb': main_verb, 'main_rest': main_rest, 'zu_rest': zu_rest, 'infinitive': infinitive,
                           'no_comma': True, 'tip': NOCOMMA_TIP, 'structure': NOCOMMA_STRUCT}, NEXT_ID, 'A2', 'Infinitiv mit zu'))

# Hand-written impersonal "Es ist .../Es macht ..., ... zu ..." sentences (subject 'es' is fixed,
# so person-multiplication does not apply).
ES_TIP = "After 'Es ist + Adjektiv' or 'Es macht Spaß', a comma introduces a 'zu + Infinitiv' clause."
ES_STRUCT = "Es ist/macht + Adjektiv/Spaß + , + ... + zu + Infinitiv"
for sentence_tokens in (
    ['Es', 'ist', 'wichtig', ',', 'jeden', 'Tag', 'zu', 'üben', '.'],
    ['Es', 'macht', 'Spaß', ',', 'Deutsch', 'zu', 'lernen', '.'],
    ['Es', 'ist', 'schwer', ',', 'früh', 'aufzustehen', '.'],
    ['Es', 'ist', 'gesund', ',', 'viel', 'Wasser', 'zu', 'trinken', '.'],
    ['Es', 'ist', 'nicht', 'einfach', ',', 'eine', 'neue', 'Sprache', 'zu', 'lernen', '.'],
    ['Es', 'ist', 'normal', ',', 'Fehler', 'zu', 'machen', '.'],
    ['Es', 'ist', 'wichtig', ',', 'pünktlich', 'zu', 'sein', '.'],
    ['Es', 'macht', 'Spaß', ',', 'mit', 'Freunden', 'zu', 'kochen', '.'],
    ['Es', 'ist', 'gut', ',', 'viel', 'zu', 'lesen', '.'],
    ['Es', 'ist', 'notwendig', ',', 'Vokabeln', 'zu', 'wiederholen', '.'],
    ['Es', 'ist', 'interessant', ',', 'andere', 'Kulturen', 'kennenzulernen', '.'],
    ['Es', 'ist', 'hilfreich', ',', 'Notizen', 'zu', 'machen', '.'],
    ['Es', 'ist', 'toll', ',', 'neue', 'Leute', 'kennenzulernen', '.'],
    ['Es', 'ist', 'langweilig', ',', 'allein', 'zu', 'Hause', 'zu', 'bleiben', '.'],
    ['Es', 'ist', 'anstrengend', ',', 'jeden', 'Tag', 'zu', 'pendeln', '.'],
    ['Es', 'ist', 'klug', ',', 'früh', 'zu', 'planen', '.'],
    ['Es', 'ist', 'praktisch', ',', 'ein', 'Wörterbuch', 'zu', 'benutzen', '.'],
    ['Es', 'ist', 'schön', ',', 'draußen', 'zu', 'spielen', '.'],
):
    ENTRIES.append(build_entry(NEXT_ID[0], 'B1', 'Infinitiv mit zu', sentence_tokens, ES_TIP, ES_STRUCT))
    NEXT_ID[0] += 1


# =============================================================================
# Partizipialkonstruktionen (Partizip I as a pre-noun adjective)
# =============================================================================
PART_TIP = "Partizip I (Verbstamm + -end) can be used like an adjective before a noun and takes normal adjective endings (-e/-en/-er ...)."
PART_STRUCT = "Subject + Verb + Article + Partizip-I-Adjektiv + Noun"
for verb, rest in (
    ('sehen', ['die', 'singende', 'Frau', '.']),
    ('kennen', ['den', 'lachenden', 'Mann', '.']),
    ('sehen', ['das', 'schlafende', 'Kind', '.']),
    ('hören', ['die', 'spielenden', 'Kinder', '.']),
    ('treffen', ['den', 'wartenden', 'Freund', '.']),
    ('sehen', ['die', 'lesende', 'Studentin', '.']),
    ('kennen', ['die', 'tanzenden', 'Mädchen', '.']),
    ('hören', ['das', 'weinende', 'Baby', '.']),
    ('sehen', ['den', 'laufenden', 'Hund', '.']),
    ('treffen', ['die', 'kochende', 'Köchin', '.']),
    ('sehen', ['den', 'schreibenden', 'Journalisten', '.']),
    ('kennen', ['die', 'arbeitenden', 'Eltern', '.']),
    ('sehen', ['das', 'spielende', 'Kind', '.']),
    ('hören', ['den', 'singenden', 'Chor', '.']),
    ('treffen', ['die', 'lachende', 'Lehrerin', '.']),
    ('sehen', ['die', 'wartenden', 'Leute', '.']),
    ('kennen', ['den', 'tanzenden', 'Jungen', '.']),
    ('sehen', ['das', 'laufende', 'Pferd', '.']),
    ('hören', ['die', 'schreienden', 'Fans', '.']),
    ('treffen', ['den', 'lesenden', 'Großvater', '.']),
    ('sehen', ['die', 'spielende', 'Band', '.']),
    ('kennen', ['die', 'kochenden', 'Männer', '.']),
    ('sehen', ['das', 'schreiende', 'Kind', '.']),
    ('hören', ['den', 'klingelnden', 'Wecker', '.']),
    ('treffen', ['die', 'wartende', 'Kundin', '.']),
    ('sehen', ['den', 'rennenden', 'Mann', '.']),
    ('kennen', ['die', 'singende', 'Band', '.']),
    ('sehen', ['die', 'schlafenden', 'Katzen', '.']),
    ('hören', ['die', 'lachenden', 'Gäste', '.']),
    ('treffen', ['den', 'arbeitenden', 'Kollegen', '.']),
):
    add(gen_svo({'verb': verb, 'rest': rest, 'tip': PART_TIP, 'structure': PART_STRUCT}, NEXT_ID, 'B1', 'Partizipialkonstruktionen'))


# =============================================================================
# Vergleichssaetze (je ... desto/umso + Komparativ)
# =============================================================================
JE_TIP = "'je + Komparativ ... Verb(end), desto/umso + Komparativ + Verb + Subject ...': the je-clause is verb-final, the desto/umso-clause has verb-subject inversion."
JE_STRUCT = "Je + Komparativ + ... + Verb (end) + , + desto/umso + Komparativ + Verb + Subject + ..."
for je_komp, je_rest, je_verb, desto_word, desto_komp, desto_verb, desto_rest in (
    ('mehr', [], 'lernen', 'desto', 'besser', 'werden', []),
    ('mehr', ['Geld'], 'haben', 'desto', 'mehr', 'reisen', []),
    ('älter', [], 'werden', 'desto', 'weiser', 'werden', []),
    ('länger', [], 'schlafen', 'desto', 'besser', 'sein', []),
    ('mehr', [], 'üben', 'desto', 'besser', 'spielen', []),
    ('früher', ['ins', 'Bett'], 'gehen', 'desto', 'ausgeruhter', 'sein', []),
    ('mehr', ['Wasser'], 'trinken', 'umso', 'gesünder', 'sein', []),
    ('schneller', [], 'laufen', 'desto', 'müder', 'sein', []),
    ('mehr', ['Obst'], 'essen', 'desto', 'fitter', 'sein', []),
    ('mehr', ['Sport'], 'machen', 'umso', 'stärker', 'werden', []),
    ('weniger', ['Stress'], 'haben', 'desto', 'glücklicher', 'sein', []),
    ('mehr', ['Bücher'], 'lesen', 'desto', 'mehr', 'lernen', []),
    ('öfter', [], 'kochen', 'umso', 'besser', 'werden', []),
    ('mehr', ['Freunde'], 'haben', 'desto', 'glücklicher', 'sein', []),
    ('später', [], 'kommen', 'desto', 'müder', 'sein', []),
    ('mehr', ['Kaffee'], 'trinken', 'umso', 'nervöser', 'werden', []),
    ('länger', [], 'warten', 'desto', 'ungeduldiger', 'werden', []),
    ('mehr', [], 'helfen', 'desto', 'zufriedener', 'sein', []),
    ('weniger', [], 'arbeiten', 'umso', 'mehr', 'reisen', []),
    ('intensiver', [], 'üben', 'desto', 'sicherer', 'sein', []),
    ('öfter', [], 'reisen', 'desto', 'offener', 'werden', []),
    ('mehr', ['Vokabeln'], 'lernen', 'umso', 'schneller', 'sprechen', ['Deutsch']),
    ('entspannter', [], 'sein', 'desto', 'produktiver', 'arbeiten', []),
    ('gesünder', [], 'essen', 'desto', 'besser', 'schlafen', []),
    ('mehr', ['Filme'], 'sehen', 'umso', 'mehr', 'lernen', ['Englisch']),
    ('schneller', [], 'arbeiten', 'desto', 'mehr', 'machen', ['Fehler']),
    ('weiter', [], 'fahren', 'desto', 'müder', 'werden', []),
    ('lauter', [], 'sprechen', 'umso', 'deutlicher', 'sein', []),
    ('mehr', [], 'tanzen', 'desto', 'glücklicher', 'sein', []),
    ('besser', [], 'kochen', 'desto', 'mehr', 'essen', []),
):
    add(gen_je_desto({'je_komp': je_komp, 'je_rest': je_rest, 'je_verb': je_verb,
                       'desto_word': desto_word, 'desto_komp': desto_komp, 'desto_verb': desto_verb, 'desto_rest': desto_rest,
                       'tip': JE_TIP, 'structure': JE_STRUCT}, NEXT_ID, 'B1', 'Vergleichssätze'))


# =============================================================================
# Output
# =============================================================================
if __name__ == '__main__':
    out_path = os.path.join(os.path.dirname(__file__), '_generated_v3_entries.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(ENTRIES, f, ensure_ascii=False, indent=2)
    print(f'Wrote {len(ENTRIES)} entries to {out_path}')
    print('Next id:', NEXT_ID[0])
