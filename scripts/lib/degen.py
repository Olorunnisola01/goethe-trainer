"""
Shared helpers for generating Satzstellung (sentence-order) entries:
- present-tense conjugation tables for sein/haben/werden/modals + common verbs
- past-participle + Perfekt-auxiliary table
- Konjunktiv II forms for the verbs that need them
- possessive-determiner agreement table
- scramble() / join_sentence() / build_entry() utilities
"""
import random

# ---------------------------------------------------------------------------
# Canonical 6-subject set used for grammatically-safe pronoun substitution.
# Conjugation tables below are keyed by these 6 person-slots.
# ---------------------------------------------------------------------------
PERSONS = ['ich', 'du', 'er', 'wir', 'ihr', 'sie']
SUBJ = {
    'ich': 'Ich', 'du': 'Du', 'er': 'Er',
    'wir': 'Wir', 'ihr': 'Ihr', 'sie': 'Sie',
}
# Possessive determiner stem per subject (3rd-person fem subject not in the
# canonical 6, so 'er' -> 'sein', 'sie'(plural/formal) -> 'ihr').
POSS_STEM = {
    'ich': 'mein', 'du': 'dein', 'er': 'sein',
    'wir': 'unser', 'ihr': 'euer', 'sie': 'ihr',
}
# Accusative/dative object pronoun per subject (for "X ruft DICH an" style sentences
# referring back to a *different* person — not used for reflexive same-subject objects).

# ---------------------------------------------------------------------------
# Possessive-determiner agreement.
#   slot: 'm'  masc. nom.           (mein Bruder)
#         'ma' masc./neut./pl. acc. or dat.  (meinen Bruder / meinem Kind / meinen Eltern)
#         'n'  neut. nom./acc.      (mein Auto)
#         'f'  fem. nom./acc. or pl. nom./acc. (meine Schwester / meine Eltern)
#         'fd' fem. dat.            (meiner Schwester)
# ---------------------------------------------------------------------------
_POSS_ENDING = {'m': '', 'ma': 'en', 'n': '', 'f': 'e', 'fd': 'er'}


def poss(subj_key, slot):
    stem = POSS_STEM[subj_key]
    ending = _POSS_ENDING[slot]
    if stem == 'euer' and ending:
        return 'eur' + ending
    return stem + ending


# ---------------------------------------------------------------------------
# Present-tense conjugation tables: verb -> {person: form}
# ---------------------------------------------------------------------------
VERBS = {
    'sein':      {'ich': 'bin', 'du': 'bist', 'er': 'ist', 'wir': 'sind', 'ihr': 'seid', 'sie': 'sind'},
    'haben':     {'ich': 'habe', 'du': 'hast', 'er': 'hat', 'wir': 'haben', 'ihr': 'habt', 'sie': 'haben'},
    'werden':    {'ich': 'werde', 'du': 'wirst', 'er': 'wird', 'wir': 'werden', 'ihr': 'werdet', 'sie': 'werden'},
    # Modal verbs
    'können':    {'ich': 'kann', 'du': 'kannst', 'er': 'kann', 'wir': 'können', 'ihr': 'könnt', 'sie': 'können'},
    'müssen':    {'ich': 'muss', 'du': 'musst', 'er': 'muss', 'wir': 'müssen', 'ihr': 'müsst', 'sie': 'müssen'},
    'wollen':    {'ich': 'will', 'du': 'willst', 'er': 'will', 'wir': 'wollen', 'ihr': 'wollt', 'sie': 'wollen'},
    'dürfen':    {'ich': 'darf', 'du': 'darfst', 'er': 'darf', 'wir': 'dürfen', 'ihr': 'dürft', 'sie': 'dürfen'},
    'sollen':    {'ich': 'soll', 'du': 'sollst', 'er': 'soll', 'wir': 'sollen', 'ihr': 'sollt', 'sie': 'sollen'},
    'mögen':     {'ich': 'mag', 'du': 'magst', 'er': 'mag', 'wir': 'mögen', 'ihr': 'mögt', 'sie': 'mögen'},
    'möchten':   {'ich': 'möchte', 'du': 'möchtest', 'er': 'möchte', 'wir': 'möchten', 'ihr': 'möchtet', 'sie': 'möchten'},
    # Regular (weak) verbs
    'spielen':   {'ich': 'spiele', 'du': 'spielst', 'er': 'spielt', 'wir': 'spielen', 'ihr': 'spielt', 'sie': 'spielen'},
    'lernen':    {'ich': 'lerne', 'du': 'lernst', 'er': 'lernt', 'wir': 'lernen', 'ihr': 'lernt', 'sie': 'lernen'},
    'wohnen':    {'ich': 'wohne', 'du': 'wohnst', 'er': 'wohnt', 'wir': 'wohnen', 'ihr': 'wohnt', 'sie': 'wohnen'},
    'kaufen':    {'ich': 'kaufe', 'du': 'kaufst', 'er': 'kauft', 'wir': 'kaufen', 'ihr': 'kauft', 'sie': 'kaufen'},
    'kochen':    {'ich': 'koche', 'du': 'kochst', 'er': 'kocht', 'wir': 'kochen', 'ihr': 'kocht', 'sie': 'kochen'},
    'hören':     {'ich': 'höre', 'du': 'hörst', 'er': 'hört', 'wir': 'hören', 'ihr': 'hört', 'sie': 'hören'},
    'machen':    {'ich': 'mache', 'du': 'machst', 'er': 'macht', 'wir': 'machen', 'ihr': 'macht', 'sie': 'machen'},
    'sagen':     {'ich': 'sage', 'du': 'sagst', 'er': 'sagt', 'wir': 'sagen', 'ihr': 'sagt', 'sie': 'sagen'},
    'fragen':    {'ich': 'frage', 'du': 'fragst', 'er': 'fragt', 'wir': 'fragen', 'ihr': 'fragt', 'sie': 'fragen'},
    'brauchen':  {'ich': 'brauche', 'du': 'brauchst', 'er': 'braucht', 'wir': 'brauchen', 'ihr': 'braucht', 'sie': 'brauchen'},
    'suchen':    {'ich': 'suche', 'du': 'suchst', 'er': 'sucht', 'wir': 'suchen', 'ihr': 'sucht', 'sie': 'suchen'},
    'zeigen':    {'ich': 'zeige', 'du': 'zeigst', 'er': 'zeigt', 'wir': 'zeigen', 'ihr': 'zeigt', 'sie': 'zeigen'},
    'schenken':  {'ich': 'schenke', 'du': 'schenkst', 'er': 'schenkt', 'wir': 'schenken', 'ihr': 'schenkt', 'sie': 'schenken'},
    'arbeiten':  {'ich': 'arbeite', 'du': 'arbeitest', 'er': 'arbeitet', 'wir': 'arbeiten', 'ihr': 'arbeitet', 'sie': 'arbeiten'},
    'üben':      {'ich': 'übe', 'du': 'übst', 'er': 'übt', 'wir': 'üben', 'ihr': 'übt', 'sie': 'üben'},
    'glauben':   {'ich': 'glaube', 'du': 'glaubst', 'er': 'glaubt', 'wir': 'glauben', 'ihr': 'glaubt', 'sie': 'glauben'},
    'holen':     {'ich': 'hole', 'du': 'holst', 'er': 'holt', 'wir': 'holen', 'ihr': 'holt', 'sie': 'holen'},
    'packen':    {'ich': 'packe', 'du': 'packst', 'er': 'packt', 'wir': 'packen', 'ihr': 'packt', 'sie': 'packen'},
    'putzen':    {'ich': 'putze', 'du': 'putzt', 'er': 'putzt', 'wir': 'putzen', 'ihr': 'putzt', 'sie': 'putzen'},
    'tanzen':    {'ich': 'tanze', 'du': 'tanzt', 'er': 'tanzt', 'wir': 'tanzen', 'ihr': 'tanzt', 'sie': 'tanzen'},
    'besuchen':  {'ich': 'besuche', 'du': 'besuchst', 'er': 'besucht', 'wir': 'besuchen', 'ihr': 'besucht', 'sie': 'besuchen'},
    'erzählen':  {'ich': 'erzähle', 'du': 'erzählst', 'er': 'erzählt', 'wir': 'erzählen', 'ihr': 'erzählt', 'sie': 'erzählen'},
    'antworten': {'ich': 'antworte', 'du': 'antwortest', 'er': 'antwortet', 'wir': 'antworten', 'ihr': 'antwortet', 'sie': 'antworten'},
    'warten':    {'ich': 'warte', 'du': 'wartest', 'er': 'wartet', 'wir': 'warten', 'ihr': 'wartet', 'sie': 'warten'},
    'kosten':    {'ich': 'koste', 'du': 'kostest', 'er': 'kostet', 'wir': 'kosten', 'ihr': 'kostet', 'sie': 'kosten'},
    'schmecken': {'ich': 'schmecke', 'du': 'schmeckst', 'er': 'schmeckt', 'wir': 'schmecken', 'ihr': 'schmeckt', 'sie': 'schmecken'},
    'reisen':    {'ich': 'reise', 'du': 'reist', 'er': 'reist', 'wir': 'reisen', 'ihr': 'reist', 'sie': 'reisen'},
    'feiern':    {'ich': 'feiere', 'du': 'feierst', 'er': 'feiert', 'wir': 'feiern', 'ihr': 'feiert', 'sie': 'feiern'},
    'duschen':   {'ich': 'dusche', 'du': 'duschst', 'er': 'duscht', 'wir': 'duschen', 'ihr': 'duscht', 'sie': 'duschen'},
    # Irregular (stem-vowel-change) verbs
    'essen':     {'ich': 'esse', 'du': 'isst', 'er': 'isst', 'wir': 'essen', 'ihr': 'esst', 'sie': 'essen'},
    'geben':     {'ich': 'gebe', 'du': 'gibst', 'er': 'gibt', 'wir': 'geben', 'ihr': 'gebt', 'sie': 'geben'},
    'helfen':    {'ich': 'helfe', 'du': 'hilfst', 'er': 'hilft', 'wir': 'helfen', 'ihr': 'helft', 'sie': 'helfen'},
    'nehmen':    {'ich': 'nehme', 'du': 'nimmst', 'er': 'nimmt', 'wir': 'nehmen', 'ihr': 'nehmt', 'sie': 'nehmen'},
    'sprechen':  {'ich': 'spreche', 'du': 'sprichst', 'er': 'spricht', 'wir': 'sprechen', 'ihr': 'sprecht', 'sie': 'sprechen'},
    'treffen':   {'ich': 'treffe', 'du': 'triffst', 'er': 'trifft', 'wir': 'treffen', 'ihr': 'trefft', 'sie': 'treffen'},
    'lesen':     {'ich': 'lese', 'du': 'liest', 'er': 'liest', 'wir': 'lesen', 'ihr': 'lest', 'sie': 'lesen'},
    'sehen':     {'ich': 'sehe', 'du': 'siehst', 'er': 'sieht', 'wir': 'sehen', 'ihr': 'seht', 'sie': 'sehen'},
    'fahren':    {'ich': 'fahre', 'du': 'fährst', 'er': 'fährt', 'wir': 'fahren', 'ihr': 'fahrt', 'sie': 'fahren'},
    'schlafen':  {'ich': 'schlafe', 'du': 'schläfst', 'er': 'schläft', 'wir': 'schlafen', 'ihr': 'schlaft', 'sie': 'schlafen'},
    'tragen':    {'ich': 'trage', 'du': 'trägst', 'er': 'trägt', 'wir': 'tragen', 'ihr': 'tragt', 'sie': 'tragen'},
    'waschen':   {'ich': 'wasche', 'du': 'wäschst', 'er': 'wäscht', 'wir': 'waschen', 'ihr': 'wascht', 'sie': 'waschen'},
    'laufen':    {'ich': 'laufe', 'du': 'läufst', 'er': 'läuft', 'wir': 'laufen', 'ihr': 'lauft', 'sie': 'laufen'},
    'halten':    {'ich': 'halte', 'du': 'hältst', 'er': 'hält', 'wir': 'halten', 'ihr': 'haltet', 'sie': 'halten'},
    'fallen':    {'ich': 'falle', 'du': 'fällst', 'er': 'fällt', 'wir': 'fallen', 'ihr': 'fallt', 'sie': 'fallen'},
    'gefallen':  {'ich': 'gefalle', 'du': 'gefällst', 'er': 'gefällt', 'wir': 'gefallen', 'ihr': 'gefallt', 'sie': 'gefallen'},
    'einladen':  {'ich': 'lade', 'du': 'lädst', 'er': 'lädt', 'wir': 'laden', 'ihr': 'ladet', 'sie': 'laden'},
    # Irregular (no vowel change)
    'gehen':     {'ich': 'gehe', 'du': 'gehst', 'er': 'geht', 'wir': 'gehen', 'ihr': 'geht', 'sie': 'gehen'},
    'kommen':    {'ich': 'komme', 'du': 'kommst', 'er': 'kommt', 'wir': 'kommen', 'ihr': 'kommt', 'sie': 'kommen'},
    'trinken':   {'ich': 'trinke', 'du': 'trinkst', 'er': 'trinkt', 'wir': 'trinken', 'ihr': 'trinkt', 'sie': 'trinken'},
    'schreiben': {'ich': 'schreibe', 'du': 'schreibst', 'er': 'schreibt', 'wir': 'schreiben', 'ihr': 'schreibt', 'sie': 'schreiben'},
    'finden':    {'ich': 'finde', 'du': 'findest', 'er': 'findet', 'wir': 'finden', 'ihr': 'findet', 'sie': 'finden'},
    'bringen':   {'ich': 'bringe', 'du': 'bringst', 'er': 'bringt', 'wir': 'bringen', 'ihr': 'bringt', 'sie': 'bringen'},
    'verstehen': {'ich': 'verstehe', 'du': 'verstehst', 'er': 'versteht', 'wir': 'verstehen', 'ihr': 'versteht', 'sie': 'verstehen'},
    'beginnen':  {'ich': 'beginne', 'du': 'beginnst', 'er': 'beginnt', 'wir': 'beginnen', 'ihr': 'beginnt', 'sie': 'beginnen'},
    'gewinnen':  {'ich': 'gewinne', 'du': 'gewinnst', 'er': 'gewinnt', 'wir': 'gewinnen', 'ihr': 'gewinnt', 'sie': 'gewinnen'},
    'kennen':    {'ich': 'kenne', 'du': 'kennst', 'er': 'kennt', 'wir': 'kennen', 'ihr': 'kennt', 'sie': 'kennen'},
    'gehören':   {'ich': 'gehöre', 'du': 'gehörst', 'er': 'gehört', 'wir': 'gehören', 'ihr': 'gehört', 'sie': 'gehören'},
    'mitkommen': {'ich': 'komme', 'du': 'kommst', 'er': 'kommt', 'wir': 'kommen', 'ihr': 'kommt', 'sie': 'kommen'},
    'bleiben':   {'ich': 'bleibe', 'du': 'bleibst', 'er': 'bleibt', 'wir': 'bleiben', 'ihr': 'bleibt', 'sie': 'bleiben'},
    'verlieren': {'ich': 'verliere', 'du': 'verlierst', 'er': 'verliert', 'wir': 'verlieren', 'ihr': 'verliert', 'sie': 'verlieren'},
    'vergessen': {'ich': 'vergesse', 'du': 'vergisst', 'er': 'vergisst', 'wir': 'vergessen', 'ihr': 'vergesst', 'sie': 'vergessen'},
    'anrufen':   {'ich': 'rufe', 'du': 'rufst', 'er': 'ruft', 'wir': 'rufen', 'ihr': 'ruft', 'sie': 'rufen'},
    # Stem forms for separable verbs (particle is appended in 'rest')
    'stehen':    {'ich': 'stehe', 'du': 'stehst', 'er': 'steht', 'wir': 'stehen', 'ihr': 'steht', 'sie': 'stehen'},
    'raeumen':   {'ich': 'räume', 'du': 'räumst', 'er': 'räumt', 'wir': 'räumen', 'ihr': 'räumt', 'sie': 'räumen'},
    'fangen':    {'ich': 'fange', 'du': 'fängst', 'er': 'fängt', 'wir': 'fangen', 'ihr': 'fangt', 'sie': 'fangen'},
    'ziehen':    {'ich': 'ziehe', 'du': 'ziehst', 'er': 'zieht', 'wir': 'ziehen', 'ihr': 'zieht', 'sie': 'ziehen'},
    'bereiten':  {'ich': 'bereite', 'du': 'bereitest', 'er': 'bereitet', 'wir': 'bereiten', 'ihr': 'bereitet', 'sie': 'bereiten'},
    # Verbs governing a 'zu + Infinitiv' clause
    'versuchen': {'ich': 'versuche', 'du': 'versuchst', 'er': 'versucht', 'wir': 'versuchen', 'ihr': 'versucht', 'sie': 'versuchen'},
    'hoffen':    {'ich': 'hoffe', 'du': 'hoffst', 'er': 'hofft', 'wir': 'hoffen', 'ihr': 'hofft', 'sie': 'hoffen'},
    'planen':    {'ich': 'plane', 'du': 'planst', 'er': 'plant', 'wir': 'planen', 'ihr': 'plant', 'sie': 'planen'},
}

# Past participles + Perfekt-auxiliary ('h' = haben, 's' = sein)
PARTICIPLE = {
    'spielen': ('gespielt', 'h'), 'lernen': ('gelernt', 'h'), 'wohnen': ('gewohnt', 'h'),
    'kaufen': ('gekauft', 'h'), 'kochen': ('gekocht', 'h'), 'hören': ('gehört', 'h'),
    'machen': ('gemacht', 'h'), 'sagen': ('gesagt', 'h'), 'fragen': ('gefragt', 'h'),
    'brauchen': ('gebraucht', 'h'), 'suchen': ('gesucht', 'h'), 'zeigen': ('gezeigt', 'h'),
    'schenken': ('geschenkt', 'h'), 'arbeiten': ('gearbeitet', 'h'), 'üben': ('geübt', 'h'),
    'glauben': ('geglaubt', 'h'), 'holen': ('geholt', 'h'), 'packen': ('gepackt', 'h'),
    'putzen': ('geputzt', 'h'), 'tanzen': ('getanzt', 'h'), 'besuchen': ('besucht', 'h'),
    'erzählen': ('erzählt', 'h'), 'antworten': ('geantwortet', 'h'), 'warten': ('gewartet', 'h'),
    'feiern': ('gefeiert', 'h'), 'duschen': ('geduscht', 'h'), 'reisen': ('gereist', 's'),
    'essen': ('gegessen', 'h'), 'geben': ('gegeben', 'h'), 'helfen': ('geholfen', 'h'),
    'nehmen': ('genommen', 'h'), 'sprechen': ('gesprochen', 'h'), 'treffen': ('getroffen', 'h'),
    'lesen': ('gelesen', 'h'), 'sehen': ('gesehen', 'h'), 'fahren': ('gefahren', 's'),
    'schlafen': ('geschlafen', 'h'), 'tragen': ('getragen', 'h'), 'waschen': ('gewaschen', 'h'),
    'laufen': ('gelaufen', 's'), 'halten': ('gehalten', 'h'), 'fallen': ('gefallen', 's'),
    'gehen': ('gegangen', 's'), 'kommen': ('gekommen', 's'), 'trinken': ('getrunken', 'h'),
    'schreiben': ('geschrieben', 'h'), 'finden': ('gefunden', 'h'), 'bringen': ('gebracht', 'h'),
    'verstehen': ('verstanden', 'h'), 'beginnen': ('begonnen', 'h'), 'gewinnen': ('gewonnen', 'h'),
    'kennen': ('gekannt', 'h'), 'bleiben': ('geblieben', 's'), 'verlieren': ('verloren', 'h'),
    'vergessen': ('vergessen', 'h'), 'anrufen': ('angerufen', 'h'), 'einladen': ('eingeladen', 'h'),
}

# Konjunktiv II forms for the verbs the Konjunktiv II topic needs.
KONJ2 = {
    'sein':   {'ich': 'wäre', 'du': 'wärst', 'er': 'wäre', 'wir': 'wären', 'ihr': 'wärt', 'sie': 'wären'},
    'haben':  {'ich': 'hätte', 'du': 'hättest', 'er': 'hätte', 'wir': 'hätten', 'ihr': 'hättet', 'sie': 'hätten'},
    'werden': {'ich': 'würde', 'du': 'würdest', 'er': 'würde', 'wir': 'würden', 'ihr': 'würdet', 'sie': 'würden'},
    'können': {'ich': 'könnte', 'du': 'könntest', 'er': 'könnte', 'wir': 'könnten', 'ihr': 'könntet', 'sie': 'könnten'},
    'müssen': {'ich': 'müsste', 'du': 'müsstest', 'er': 'müsste', 'wir': 'müssten', 'ihr': 'müsstet', 'sie': 'müssten'},
    'dürfen': {'ich': 'dürfte', 'du': 'dürftest', 'er': 'dürfte', 'wir': 'dürften', 'ihr': 'dürftet', 'sie': 'dürften'},
    'gehen':  {'ich': 'ginge', 'du': 'gingest', 'er': 'ginge', 'wir': 'gingen', 'ihr': 'ginget', 'sie': 'gingen'},
    'kommen': {'ich': 'käme', 'du': 'kämest', 'er': 'käme', 'wir': 'kämen', 'ihr': 'kämet', 'sie': 'kämen'},
    'geben':  {'ich': 'gäbe', 'du': 'gäbest', 'er': 'gäbe', 'wir': 'gäben', 'ihr': 'gäbet', 'sie': 'gäben'},
    'wissen': {'ich': 'wüsste', 'du': 'wüsstest', 'er': 'wüsste', 'wir': 'wüssten', 'ihr': 'wüsstet', 'sie': 'wüssten'},
}


# ---------------------------------------------------------------------------
# scramble / join / build_entry
# ---------------------------------------------------------------------------
_RNG = random.Random(20260612)


def scramble(tokens):
    t = list(tokens)
    for _ in range(40):
        _RNG.shuffle(t)
        if t != tokens:
            return t
    return list(reversed(tokens))


def join_sentence(tokens):
    s = ' '.join(tokens)
    s = s.replace(' .', '.').replace(' ?', '?').replace(' ,', ',').replace(' !', '!')
    return s


def build_entry(sid_num, level, topic, answer, tip, structure):
    return {
        'id': f'SO{sid_num:04d}',
        'level': level,
        'topic': topic,
        'words': scramble(answer),
        'answer': answer,
        'correct': join_sentence(answer),
        'tip': tip,
        'structure': structure,
    }


# ---------------------------------------------------------------------------
# Lowercase / mid-sentence pronoun forms (for questions & subordinate clauses)
# ---------------------------------------------------------------------------
PRON_LOW = {'ich': 'ich', 'du': 'du', 'er': 'er', 'wir': 'wir', 'ihr': 'ihr', 'sie': 'Sie'}


def cap(word):
    return word[0].upper() + word[1:]


# ---------------------------------------------------------------------------
# Generic per-topic generators.
# Each takes a "scenario" dict and a Counter-like object 'next_id' (a
# one-element list used as a mutable counter) plus level/topic, and returns
# a list of entries (one per canonical subject / variant).
# ---------------------------------------------------------------------------

def gen_svo(scenario, next_id, level, topic, persons=None):
    """Generic V2 declarative: SUBJ + VERB(conjugated) + rest.

    scenario = {'verb': <key into VERBS>, 'rest': [tokens...], 'tip': str, 'structure': str}
    'rest' may itself end with an infinitive / participle / particle — the
    verb table only supplies the position-2 finite form.
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        answer = [SUBJ[p], VERBS[scenario['verb']][p]] + list(scenario['rest'])
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_svo_poss(scenario, next_id, level, topic, slot, persons=None):
    """Like gen_svo, but scenario['rest'] may contain the literal token
    '{poss}', replaced per-person with the agreeing possessive determiner
    for the given case/gender slot ('m'/'ma'/'n'/'f'/'fd')."""
    persons = persons or PERSONS
    out = []
    for p in persons:
        rest = [poss(p, slot) if tok == '{poss}' else tok for tok in scenario['rest']]
        answer = [SUBJ[p], VERBS[scenario['verb']][p]] + rest
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_w_frage(scenario, next_id, level, topic, persons=None):
    """W-question: Wort + VERB(conjugated) + pronoun(lower) + rest.

    scenario = {'wort': 'Wo', 'verb': <key>, 'rest': [...,'?'], 'tip':..., 'structure':...}
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        answer = [scenario['wort'], VERBS[scenario['verb']][p], PRON_LOW[p]] + list(scenario['rest'])
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_ja_nein_frage(scenario, next_id, level, topic, persons=None):
    """Yes/No question: VERB(conjugated, capitalised) + pronoun(lower) + rest.

    scenario = {'verb': <key>, 'rest': [...,'?'], 'tip':..., 'structure':...}
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        answer = [cap(VERBS[scenario['verb']][p]), PRON_LOW[p]] + list(scenario['rest'])
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_imperativ(scenario, next_id, level, topic):
    """Imperative: du / ihr / Sie forms.

    scenario = {'verb': <key into VERBS, for ihr/Sie forms>, 'du_form': 'Geh',
                 'rest': [...,'!'], 'tip':..., 'structure':...}
    """
    out = []
    forms = [
        [cap(scenario['du_form'])] + list(scenario['rest']),
        [cap(VERBS[scenario['verb']]['ihr'])] + list(scenario['rest']),
        [cap(VERBS[scenario['verb']]['sie']), 'Sie'] + list(scenario['rest']),
    ]
    for answer in forms:
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_subordinate(scenario, next_id, level, topic, persons=None):
    """Two-clause sentence with the subordinate clause's verb at the end.

    scenario = {'main': [tokens..., ','], 'conj': 'weil', 'sub_rest': [tokens...],
                 'sub_verb': <key into VERBS>, 'tip':..., 'structure':...}
    Produces: main + conj + pronoun(lower) + sub_rest + VERB(conjugated, end) + '.'
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        answer = (list(scenario['main']) + [scenario['conj'], PRON_LOW[p]]
                  + list(scenario['sub_rest']) + [VERBS[scenario['sub_verb']][p], '.'])
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


AUX_FULL = {'h': 'haben', 's': 'sein'}


def gen_connector(scenario, next_id, level, topic, persons=None):
    """Two clauses joined by a connector, both keeping the same subject.

    Position-0 connectors (und/aber/oder/denn) don't trigger inversion:
      Subject + Verb1 + rest1 + , + Connector + Subject + Verb2 + rest2 + .
    Position-1 connectors (deshalb/trotzdem/also/dann/sonst) front the
    connector and trigger verb-subject inversion in the second clause:
      Subject + Verb1 + rest1 + , + Connector + Verb2(conjugated) + pronoun + rest2 + .

    scenario = {'verb1': <key>, 'rest1': [...], 'connector': str, 'inversion': bool,
                 'verb2': <key>, 'rest2': [...], 'tip':..., 'structure':...}
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        clause1 = [SUBJ[p], VERBS[scenario['verb1']][p]] + list(scenario['rest1']) + [',']
        if scenario['inversion']:
            clause2 = [scenario['connector'], VERBS[scenario['verb2']][p], PRON_LOW[p]] + list(scenario['rest2']) + ['.']
        else:
            clause2 = [scenario['connector'], PRON_LOW[p], VERBS[scenario['verb2']][p]] + list(scenario['rest2']) + ['.']
        answer = clause1 + clause2
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_subordinate_perfekt(scenario, next_id, level, topic, persons=None):
    """Fronted subordinate clause in the Perfekt (für 'nachdem'/'als' + completed
    action), main clause in the present tense with verb-subject inversion.

    In a subordinate clause with a two-part verb, the participle comes before
    the conjugated auxiliary, both at the very end of the clause; the fronted
    clause then triggers inversion in the main clause (V2 rule).

    conj + pronoun + sub_rest + participle + aux(conjugated, end) + ',' +
    main_verb(conjugated) + pronoun + main_rest + '.'

    scenario = {'conj': 'nachdem', 'sub_rest': [...], 'sub_verb': <key into PARTICIPLE>,
                 'main_verb': <key into VERBS>, 'main_rest': [...], 'tip':..., 'structure':...}
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        participle, aux = PARTICIPLE[scenario['sub_verb']]
        answer = ([cap(scenario['conj']), PRON_LOW[p]] + list(scenario['sub_rest'])
                  + [participle, VERBS[AUX_FULL[aux]][p], ',']
                  + [VERBS[scenario['main_verb']][p], PRON_LOW[p]] + list(scenario['main_rest']) + ['.'])
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_final_um_zu(scenario, next_id, level, topic, persons=None):
    """Purpose clause with 'um ... zu + Infinitiv' (same subject as the main
    clause, so the infinitive doesn't change with person):

    Subject + Verb(conjugated) + main_rest + ',' + um + zu_rest + zu + Infinitiv + '.'

    scenario = {'main_verb': <key>, 'main_rest': [...], 'zu_rest': [...],
                 'infinitive': 'arbeiten', 'tip':..., 'structure':...}
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        tail = [scenario['infinitive'], '.'] if 'zu' in scenario['infinitive'] else ['zu', scenario['infinitive'], '.']
        answer = ([SUBJ[p], VERBS[scenario['main_verb']][p]] + list(scenario['main_rest']) + [',']
                  + ['um'] + list(scenario['zu_rest']) + tail)
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_zu_infinitiv(scenario, next_id, level, topic, persons=None):
    """A 'zu + Infinitiv' clause depending on the main clause's verb/adjective:

    Subject + Verb(conjugated) + main_rest + ',' + zu_rest + zu + Infinitiv + '.'

    scenario = {'main_verb': <key>, 'main_rest': [...], 'zu_rest': [...],
                 'infinitive': 'lernen', 'tip':..., 'structure':...}
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        tail = [scenario['infinitive'], '.'] if 'zu' in scenario['infinitive'] else ['zu', scenario['infinitive'], '.']
        comma = [] if scenario.get('no_comma') else [',']
        answer = ([SUBJ[p], VERBS[scenario['main_verb']][p]] + list(scenario['main_rest']) + comma
                  + list(scenario['zu_rest']) + tail)
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_je_desto(scenario, next_id, level, topic, persons=None):
    """'Je + Komparativ + ... + Verb (end), desto/umso + Komparativ + Verb + Subjekt + ...'

    The je-clause is verb-final (Nebensatz); the desto/umso-clause has
    verb-subject inversion, like the main clause after any fronted clause.

    scenario = {'je_komp': 'mehr', 'je_rest': [...], 'je_verb': <key>,
                 'desto_word': 'desto'/'umso', 'desto_komp': 'besser',
                 'desto_rest': [...], 'desto_verb': <key>, 'tip':..., 'structure':...}
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        answer = (['Je', scenario['je_komp'], PRON_LOW[p]] + list(scenario['je_rest']) + [VERBS[scenario['je_verb']][p], ',']
                  + [scenario['desto_word'], scenario['desto_komp'], VERBS[scenario['desto_verb']][p], PRON_LOW[p]]
                  + list(scenario['desto_rest']) + ['.'])
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out


def gen_konjunktiv2(scenario, next_id, level, topic, persons=None):
    """Conditional: Wenn + pronoun + cond_rest + KONJ2(verb1, end of clause 1) + ','
    + würde + pronoun + main_rest + infinitive + '.'

    After a fronted 'Wenn'-clause, German requires verb-subject inversion in
    the main clause (V2 rule), so 'würde' comes before the subject pronoun.

    scenario = {'verb1': <key into KONJ2>, 'cond_rest': [...], 'verb2_inf': 'reisen',
                 'main_rest': [...], 'tip':..., 'structure':...}
    """
    persons = persons or PERSONS
    out = []
    for p in persons:
        answer = (['Wenn', PRON_LOW[p]] + list(scenario['cond_rest']) + [KONJ2[scenario['verb1']][p], ',']
                  + [KONJ2['werden'][p], PRON_LOW[p]] + list(scenario['main_rest']) + [scenario['verb2_inf'], '.'])
        out.append(build_entry(next_id[0], level, topic, answer, scenario['tip'], scenario['structure']))
        next_id[0] += 1
    return out
