"""
Generates 1,000 MC questions for A1 verbs 1-50 (20 questions each).
Output: verbquiz_mc_a1_1.json
"""
import json, random, re

with open(r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbs_data.json', 'r', encoding='utf-8') as f:
    ALL_VERBS = json.load(f)

PERSONS = ["ich", "du", "er", "wir", "ihr", "sie"]
PERSON_LABELS = {"ich": "ich", "du": "du", "er": "er/sie/es", "wir": "wir", "ihr": "ihr", "sie": "sie/Sie"}

# Verb type classification
IRREGULAR = {1,2,3,4,5,6,7,8,9,11,12,14,15,16,17,18,19,20,21,22,23,27,28,29,30,31,32,
              39,40,41,46,47,49,50,51,52,62,63,64,67,68,69,70,71,72,73,74,75,76,85,88,
              90,92,95,96,98,99}

# Sentence templates: [ich, du, er, wir, ihr, sie]
# {V} = conjugated verb form (complete, from verbs_data)
TMPL = {
    1: [  # sein
        "Ich {V} heute sehr glücklich.",
        "Du {V} immer so ehrlich – das schätze ich.",
        "Er {V} ein sehr erfahrener Arzt.",
        "Wir {V} eine große Familie.",
        "Ihr {V} die besten Freunde, die ich je hatte.",
        "Sie {V} sehr freundlich zu allen Gästen."
    ],
    2: [  # haben
        "Ich {V} leider keine Zeit für dich.",
        "Du {V} wirklich viel Glück gehabt!",
        "Er {V} einen neuen Job in der Stadt.",
        "Wir {V} heute keine Hausaufgaben auf.",
        "Ihr {V} doch genug Geld für die Reise?",
        "Sie {V} einen großen Garten hinter dem Haus."
    ],
    3: [  # werden
        "Ich {V} eines Tages ein berühmter Koch.",
        "Du {V} bestimmt ein guter Arzt.",
        "Es {V} draußen langsam dunkel.",
        "Wir {V} alte Freunde niemals vergessen.",
        "Ihr {V} sicher sehr gute Eltern.",
        "Die Äpfel {V} schnell reif im Sommer."
    ],
    4: [  # können
        "Ich {V} leider nicht zum Treffen kommen.",
        "Du {V} wirklich sehr gut Gitarre spielen.",
        "Er {V} kein Wort Spanisch sprechen.",
        "Wir {V} das Problem gemeinsam lösen.",
        "Ihr {V} morgen früher nach Hause gehen.",
        "Sie {V} sich kaum noch bewegen."
    ],
    5: [  # müssen
        "Ich {V} heute Abend noch lernen.",
        "Du {V} unbedingt zum Arzt gehen.",
        "Er {V} früh aufstehen für die Arbeit.",
        "Wir {V} den Bus um 7 Uhr nehmen.",
        "Ihr {V} eure Aufgaben bis Freitag abgeben.",
        "Sie {V} jeden Tag lange arbeiten."
    ],
    6: [  # wollen
        "Ich {V} nächsten Sommer nach Spanien reisen.",
        "Du {V} doch auch mitkommen, oder?",
        "Er {V} unbedingt Fußball spielen.",
        "Wir {V} ein neues Restaurant ausprobieren.",
        "Ihr {V} doch sicher auch Pizza essen?",
        "Sie {V} das Gespräch nicht fortsetzen."
    ],
    7: [  # dürfen
        "Ich {V} hier leider nicht parken.",
        "Du {V} heute länger aufbleiben.",
        "Er {V} im Büro kein Handy benutzen.",
        "Wir {V} das Museum kostenlos betreten.",
        "Ihr {V} in dieser Zone nicht rauchen.",
        "Die Kinder {V} heute ausnahmsweise fernsehen."
    ],
    8: [  # sollen
        "Ich {V} den Brief morgen abschicken.",
        "Du {V} deiner Mutter beim Kochen helfen.",
        "Er {V} den Bericht bis Montag fertigstellen.",
        "Wir {V} pünktlich um neun Uhr da sein.",
        "Ihr {V} leiser sprechen in der Bibliothek.",
        "Sie {V} das Formular sofort ausfüllen."
    ],
    9: [  # mögen
        "Ich {V} keinen Kaffee – ich trinke lieber Tee.",
        "Du {V} doch auch Schokolade sehr gerne, oder?",
        "Er {V} keine laute Musik in der Wohnung.",
        "Wir {V} dieses Restaurant sehr gerne.",
        "Ihr {V} klassische Musik, stimmt's?",
        "Sie {V} ihren neuen Kollegen sehr."
    ],
    10: [  # machen
        "Ich {V} jeden Abend Sport nach der Arbeit.",
        "Was {V} du am Wochenende?",
        "Er {V} immer gute Witze auf Partys.",
        "Wir {V} zusammen die Hausaufgaben.",
        "Was {V} ihr in den Ferien?",
        "Sie {V} eine lange Reise durch Europa."
    ],
    11: [  # gehen
        "Ich {V} jeden Morgen zu Fuß zur Arbeit.",
        "Wohin {V} du so früh am Morgen?",
        "Er {V} schnell zum Supermarkt um die Ecke.",
        "Wir {V} am Abend zusammen spazieren.",
        "{V} ihr morgen in die Schule?",
        "Die Kinder {V} fröhlich in den Park."
    ],
    12: [  # kommen
        "Ich {V} aus einer kleinen Stadt in Bayern.",
        "Woher {V} du eigentlich ursprünglich?",
        "Er {V} immer zu spät zu den Meetings.",
        "Wir {V} morgen Abend zu eurer Party.",
        "{V} ihr auch zur Feier am Samstag?",
        "Die Gäste {V} pünktlich um 8 Uhr an."
    ],
    13: [  # sagen
        "Ich {V} dir die Wahrheit – kein Geheimnis.",
        "Was {V} du gerade? Ich habe es nicht gehört.",
        "Er {V} immer genau, was er denkt.",
        "Wir {V} Auf Wiedersehen und fahren ab.",
        "Was {V} ihr dazu? Seid ihr einverstanden?",
        "Sie {V} immer Danke – sehr höflich."
    ],
    14: [  # sehen
        "Ich {V} heute einen tollen Film im Kino.",
        "{V} du den großen Vogel dort oben?",
        "Er {V} schlecht und braucht eine Brille.",
        "Wir {V} uns jeden Tag in der Schule.",
        "{V} ihr den Unfall gestern Abend?",
        "Sie {V} endlich Licht am Ende des Tunnels."
    ],
    15: [  # geben
        "Ich {V} dir meine Telefonnummer.",
        "Kannst du mir bitte {V}, was du weißt?",
        "Er {V} der Katze täglich frisches Wasser.",
        "Wir {V} unseren Kindern gute Ratschläge.",
        "{V} ihr uns bitte eure Meinung dazu?",
        "Die Lehrer {V} den Schülern gute Noten."
    ],
    16: [  # nehmen
        "Ich {V} den Zug um acht Uhr morgens.",
        "{V} du dir bitte noch ein Stück Kuchen?",
        "Er {V} sich viel Zeit für seine Hobbys.",
        "Wir {V} ein Taxi zum Flughafen.",
        "{V} ihr den Bus oder die U-Bahn?",
        "Sie {V} ihre Medikamente jeden Morgen."
    ],
    17: [  # wissen
        "Ich {V} nicht, wo mein Schlüssel ist.",
        "{V} du, wann der Zug abfährt?",
        "Er {V} die Antwort auf jede Frage.",
        "Wir {V} noch nicht, was wir kochen.",
        "{V} ihr schon das neue Programm?",
        "Sie {V} genau, was sie wollen."
    ],
    18: [  # denken
        "Ich {V} oft an meine Kindheit zurück.",
        "Was {V} du über das neue Gesetz?",
        "Er {V} immer positiv über die Zukunft.",
        "Wir {V} oft an unsere alten Freunde.",
        "Was {V} ihr über den neuen Chef?",
        "Sie {V} sehr logisch und strukturiert."
    ],
    19: [  # finden
        "Ich {V} das Buch wirklich sehr interessant.",
        "Wo {V} du deine Brille immer wieder?",
        "Er {V} einen Geldbeutel auf der Straße.",
        "Wir {V} das Hotel sehr bequem und schön.",
        "Wie {V} ihr die neue Wohnung?",
        "Sie {V} keinen Parkplatz in der Stadtmitte."
    ],
    20: [  # sprechen
        "Ich {V} fließend Deutsch und Englisch.",
        "{V} du auch ein bisschen Französisch?",
        "Er {V} laut und deutlich vor der Klasse.",
        "Wir {V} täglich miteinander über die Arbeit.",
        "{V} ihr manchmal über eure Probleme?",
        "Sie {V} sehr leise und ruhig miteinander."
    ],
    21: [  # heißen
        "Ich {V} Anna und komme aus Österreich.",
        "Wie {V} du mit Nachnamen?",
        "Der Film {V} 'Das Leben der Anderen'.",
        "Wir {V} die Müller-Gruppe im Kurs.",
        "Wie {V} eure Katzen eigentlich?",
        "Die Straße {V} Goethestraße, glaube ich."
    ],
    22: [  # lesen
        "Ich {V} jeden Abend vor dem Schlafen.",
        "Was {V} du gerade für ein Buch?",
        "Er {V} die Zeitung schon um sechs Uhr.",
        "Wir {V} zusammen Geschichten auf Deutsch.",
        "{V} ihr noch die gedruckte Zeitung?",
        "Sie {V} sehr viel in ihrer Freizeit."
    ],
    23: [  # schreiben
        "Ich {V} einen Brief an meine Oma.",
        "{V} du mir bitte deine Adresse auf?",
        "Er {V} einen Roman über seine Heimat.",
        "Wir {V} täglich E-Mails an die Kunden.",
        "{V} ihr eure Antworten ins Heft?",
        "Die Studenten {V} fleißig ihre Notizen."
    ],
    24: [  # arbeiten
        "Ich {V} seit fünf Jahren in dieser Firma.",
        "Wo {V} du zurzeit – in der Stadt?",
        "Er {V} sehr hart für seinen Erfolg.",
        "Wir {V} eng zusammen als Team.",
        "{V} ihr auch am Wochenende manchmal?",
        "Sie {V} als Ärztin in einem großen Krankenhaus."
    ],
    25: [  # wohnen
        "Ich {V} in einer kleinen Wohnung im Zentrum.",
        "Wo {V} du jetzt – noch bei deinen Eltern?",
        "Er {V} seit Jahren in München.",
        "Wir {V} in einem ruhigen Vorort der Stadt.",
        "{V} ihr noch in der alten Wohnung?",
        "Sie {V} direkt am Rhein – wunderschön!"
    ],
    26: [  # kaufen
        "Ich {V} heute frisches Brot beim Bäcker.",
        "Was {V} du dir von deinem Taschengeld?",
        "Er {V} einen neuen Laptop für die Arbeit.",
        "Wir {V} das Haus endlich nach langer Suche.",
        "{V} ihr die Tickets schon online?",
        "Die Touristen {V} viele Souvenirs auf dem Markt."
    ],
    27: [  # fahren
        "Ich {V} jeden Tag mit dem Fahrrad zur Arbeit.",
        "Wohin {V} du in den Sommerferien?",
        "Er {V} sehr schnell auf der Autobahn.",
        "Wir {V} nächste Woche nach Hamburg.",
        "{V} ihr mit dem Auto oder mit dem Zug?",
        "Die Familie {V} jedes Jahr nach Italien."
    ],
    28: [  # laufen
        "Ich {V} jeden Morgen fünf Kilometer.",
        "Wie schnell {V} du beim Marathon?",
        "Er {V} jeden Tag durch den Park.",
        "Wir {V} zusammen zum Bahnhof.",
        "{V} ihr auch beim Stadtlauf mit?",
        "Die Kinder {V} fröhlich über die Wiese."
    ],
    29: [  # schlafen
        "Ich {V} immer mindestens acht Stunden.",
        "Wie lange {V} du normalerweise?",
        "Er {V} tief und fest nach dem langen Tag.",
        "Wir {V} auf dem Campingplatz in Zelten.",
        "{V} ihr gut in der neuen Wohnung?",
        "Die Babys {V} meistens tagsüber sehr viel."
    ],
    30: [  # essen
        "Ich {V} mittags immer warm in der Kantine.",
        "Was {V} du zum Frühstück heute?",
        "Er {V} sehr schnell – kaum Zeit zum Kauen.",
        "Wir {V} jeden Sonntag zusammen Kuchen.",
        "Was {V} ihr heute Abend zum Abendbrot?",
        "Sie {V} sehr gesund – viel Gemüse und Obst."
    ],
    31: [  # trinken
        "Ich {V} morgens immer Kaffee mit Milch.",
        "Was {V} du am liebsten im Sommer?",
        "Er {V} täglich mindestens zwei Liter Wasser.",
        "Wir {V} zusammen ein Glas Wein zum Abendessen.",
        "Was {V} ihr auf der Party so?",
        "Die Sportler {V} nach dem Training Isotonisches."
    ],
    32: [  # helfen
        "Ich {V} dir gerne beim Umzug.",
        "{V} du mir bitte kurz mit diesem Koffer?",
        "Er {V} immer seinen Nachbarn im Garten.",
        "Wir {V} gemeinsam bei der Schulaufgabe.",
        "{V} ihr beim Aufbau des Festes mit?",
        "Die Freiwilligen {V} täglich vielen Menschen."
    ],
    33: [  # fragen
        "Ich {V} den Lehrer, ob wir früher gehen.",
        "Warum {V} du nicht einfach nach dem Weg?",
        "Er {V} seinen Chef um einen freien Tag.",
        "Wir {V} alle Beteiligten nach ihrer Meinung.",
        "{V} ihr die Auskunft nach dem Fahrplan?",
        "Die Schüler {V} viel – sie sind sehr neugierig."
    ],
    34: [  # antworten
        "Ich {V} so schnell wie möglich auf E-Mails.",
        "Bitte {V} du auf die Frage des Lehrers!",
        "Er {V} immer klar und höflich.",
        "Wir {V} gemeinsam auf die Einladung.",
        "{V} ihr bitte bis Ende der Woche?",
        "Die Schüler {V} kaum – es ist sehr still."
    ],
    35: [  # lernen
        "Ich {V} Deutsch seit sechs Monaten.",
        "Was {V} du gerade in der Schule?",
        "Er {V} täglich neue Vokabeln auf Englisch.",
        "Wir {V} zusammen für die Prüfung.",
        "{V} ihr noch für den Test heute Abend?",
        "Die Studenten {V} sehr fleißig vor den Prüfungen."
    ],
    36: [  # spielen
        "Ich {V} nach der Schule oft Fußball.",
        "Was {V} du gerne in deiner Freizeit?",
        "Er {V} sehr gut Klavier und auch Gitarre.",
        "Wir {V} jeden Samstag zusammen Schach.",
        "{V} ihr heute Nachmittag draußen?",
        "Die Kinder {V} glücklich im Garten."
    ],
    37: [  # hören
        "Ich {V} beim Joggen immer Podcasts.",
        "Was {V} du gerade für Musik?",
        "Er {V} Radio, während er frühstückt.",
        "Wir {V} keine Geräusche aus der Wohnung.",
        "{V} ihr gut, was ich sage?",
        "Die Nachbarn {V} leider sehr laute Musik."
    ],
    38: [  # zeigen
        "Ich {V} dir gerne die Stadt.",
        "Kannst du mir {V}, wie das geht?",
        "Er {V} uns den Weg zum Bahnhof.",
        "Wir {V} euch unsere neue Wohnung.",
        "{V} ihr uns bitte euren Ausweis?",
        "Die Lehrerin {V} den Schülern die Lösung."
    ],
    39: [  # stehen
        "Ich {V} schon seit einer Stunde in der Schlange.",
        "Wo {V} du gerade – draußen oder drinnen?",
        "Er {V} jeden Morgen früh auf dem Balkon.",
        "Wir {V} vor einer schwierigen Entscheidung.",
        "Warum {V} ihr noch? Setzt euch doch hin!",
        "Die Bücher {V} ordentlich im Regal."
    ],
    40: [  # liegen
        "Ich {V} gerne am Strand in der Sonne.",
        "Wo {V} du – bist du krank im Bett?",
        "Das Buch {V} auf dem Tisch im Wohnzimmer.",
        "Wir {V} entspannt auf der Wiese.",
        "{V} ihr schon oder seid ihr noch wach?",
        "Die Schlüssel {V} immer auf der Kommode."
    ],
    41: [  # sitzen
        "Ich {V} den ganzen Tag vor dem Computer.",
        "Wo {V} du am liebsten im Café?",
        "Er {V} ruhig am Fenster und liest.",
        "Wir {V} gemütlich zusammen am Tisch.",
        "{V} ihr schon oder braucht ihr noch Stühle?",
        "Die Katzen {V} auf dem warmen Heizkörper."
    ],
    42: [  # stellen
        "Ich {V} die Vase auf den Tisch.",
        "Wohin {V} du das Fahrrad?",
        "Er {V} das Gepäck in den Flur.",
        "Wir {V} den Weihnachtsbaum in die Ecke.",
        "Wo {V} ihr den Fernseher auf?",
        "Sie {V} frische Blumen auf jeden Tisch."
    ],
    43: [  # legen
        "Ich {V} die Zeitung auf den Tisch.",
        "Wohin {V} du das Buch nach dem Lesen?",
        "Er {V} das Baby vorsichtig ins Bett.",
        "Wir {V} Decken auf die Couch zum Schlafen.",
        "Wo {V} ihr eure Mäntel hin?",
        "Sie {V} das Geld auf den Tresen."
    ],
    44: [  # setzen
        "Ich {V} mich ans Fenster im Zug.",
        "Wohin {V} du dich am liebsten?",
        "Er {V} sich immer in die erste Reihe.",
        "Wir {V} uns gerne in die Sonne draußen.",
        "{V} ihr euch bitte ruhig hin!",
        "Sie {V} die Kinder ans Tischende."
    ],
    45: [  # öffnen
        "Ich {V} das Fenster für frische Luft.",
        "Kannst du bitte die Tür {V}?",
        "Er {V} das Paket vorsichtig auf.",
        "Wir {V} das Geschäft um 9 Uhr.",
        "{V} ihr bitte das Buch auf Seite 20?",
        "Der Arzt {V} das Wartezimmer um 8 Uhr."
    ],
    46: [  # schließen
        "Ich {V} die Tür hinter mir.",
        "Bitte {V} du das Fenster! Es ist kalt.",
        "Der Laden {V} um 20 Uhr.",
        "Wir {V} den Vertrag nächste Woche.",
        "{V} ihr bitte eure Bücher!",
        "Sie {V} das Büro um Punkt sechs Uhr."
    ],
    47: [  # beginnen
        "Ich {V} heute mit dem Lauftraining.",
        "Wann {V} du mit dem Studium?",
        "Der Film {V} genau um 20 Uhr.",
        "Wir {V} das Projekt am Montag.",
        "Wann {V} ihr mit der Renovierung?",
        "Die Vorlesung {V} pünktlich um acht."
    ],
    48: [  # enden
        "Ich {V} meinen Vortrag mit einem Zitat.",
        "Wann {V} du deinen Arbeitstag?",
        "Das Konzert {V} nach drei Stunden.",
        "Wir {V} die Sitzung früher als geplant.",
        "Wann {V} ihr mit dem Meeting?",
        "Die Serie {V} mit einer Überraschung."
    ],
    49: [  # bleiben
        "Ich {V} heute Abend lieber zu Hause.",
        "Wie lange {V} du noch in Berlin?",
        "Er {V} ruhig, obwohl er wütend war.",
        "Wir {V} das ganze Wochenende in der Stadt.",
        "{V} ihr noch zum Abendessen?",
        "Sie {V} trotz allem immer optimistisch."
    ],
    50: [  # bringen
        "Ich {V} dir morgen das Buch zurück.",
        "Was {V} du uns aus dem Urlaub mit?",
        "Er {V} jeden Morgen Kaffee für die Kollegen.",
        "Wir {V} einen Kuchen zur Party.",
        "{V} ihr bitte die Stühle aus dem Keller?",
        "Die Eltern {V} die Kinder jeden Tag zur Schule."
    ],
}

# Time markers for tense-specific contexts
PRAET_MARKERS = ["Gestern", "Letzte Woche", "Früher", "Damals", "Am Montag"]
PERF_MARKERS  = ["Heute", "Schon", "Gerade", "Bereits", "Neulich"]

# Irregular verbs set for classification
IRREGULAR_NUMS = {1,2,3,4,5,6,7,8,9,11,12,14,15,16,17,18,19,20,21,22,23,27,28,29,30,31,32,
                  39,40,41,46,47,49,50}

def verb_type(num):
    return "Irregular" if num in IRREGULAR_NUMS else "Regular"

def get_conjugation(verb, person, tense):
    if tense == "Präsens":
        return verb["praesens"][person]
    elif tense == "Präteritum":
        return verb["praeteritum"][person]
    else:  # Perfekt
        aux_conj = {
            "haben": {"ich":"habe","du":"hast","er":"hat","wir":"haben","ihr":"habt","sie":"haben"},
            "sein":  {"ich":"bin", "du":"bist","er":"ist","wir":"sind","ihr":"seid","sie":"sind"}
        }
        aux = verb["perfekt"]["aux"]
        part = verb["perfekt"]["participle"]
        return f"{aux_conj[aux][person]} {part}"

def build_sentence(tmpl_str, conjugation, tense):
    """Replace {V} with conjugation. Add time marker context for past tenses."""
    return tmpl_str.replace("{V}", conjugation)

def make_sentence_q(tmpl_str, tense, person):
    """Return sentence with blank and hint."""
    blank = "_____"
    s = tmpl_str.replace("{V}", blank)
    return s

def make_distractors(correct, verb, person, tense, all_verbs_list):
    """Generate 3 plausible wrong answers."""
    distractors = set()

    # 1) Same verb, different person
    other_persons = [p for p in PERSONS if p != person]
    for op in other_persons[:2]:
        d = get_conjugation(verb, op, tense)
        if d != correct:
            distractors.add(d)

    # 2) Same person, different tense
    other_tenses = ["Präsens","Präteritum","Perfekt"]
    for ot in other_tenses:
        if ot != tense:
            d = get_conjugation(verb, person, ot)
            if d != correct:
                distractors.add(d)

    # 3) Common mistake: regularize an irregular verb (strip umlaut / apply -te ending)
    inf = verb["verb"]
    stem = inf.rstrip("en").rstrip("n")
    common_err_map = {"ä":"a","ö":"o","ü":"u"}
    err_stem = stem
    for uml, base in common_err_map.items():
        err_stem = err_stem.replace(uml, base)
    if person == "ich":
        distractors.add(err_stem + "te")
    elif person == "du":
        distractors.add(err_stem + "test")
    elif person == "er":
        distractors.add(err_stem + "te")
    elif person == "wir":
        distractors.add(err_stem + "ten")
    elif person == "ihr":
        distractors.add(err_stem + "tet")
    else:
        distractors.add(err_stem + "ten")

    distractors.discard(correct)
    distractors = list(distractors)[:3]

    # Pad if needed
    fallbacks = ["machte","hatte","ging","war","wurde","konnte"]
    i = 0
    while len(distractors) < 3:
        if fallbacks[i] != correct and fallbacks[i] not in distractors:
            distractors.append(fallbacks[i])
        i += 1
        if i >= len(fallbacks):
            distractors.append("spielte")
            break

    return distractors[:3]

def tense_tip(tense, person, correct, verb_inf):
    pmap = {"ich":"1st sg","du":"2nd sg","er":"3rd sg","wir":"1st pl","ihr":"2nd pl","sie":"3rd pl"}
    if tense == "Präsens":
        return f"**{verb_inf}** im Präsens ({pmap[person]}): **{correct}**. Präsens describes current or habitual actions."
    elif tense == "Präteritum":
        return f"**{verb_inf}** im Präteritum ({pmap[person]}): **{correct}**. Präteritum is used in written/formal narrative."
    else:
        return f"**{verb_inf}** im Perfekt ({pmap[person]}): **{correct}**. Perfekt is the spoken past tense in German."

questions = []
q_id = 1

# Tense display order and labels
TENSES = ["Präsens", "Präteritum", "Perfekt"]

for verb in ALL_VERBS:
    num = verb["num"]
    if num > 50:
        break  # Only verbs 1-50 in this batch
    if num not in TMPL:
        continue

    templates_for_verb = TMPL[num]

    # Generate 18 base questions (6 persons × 3 tenses)
    base_qs = []
    for tense in TENSES:
        for i, person in enumerate(PERSONS):
            correct = get_conjugation(verb, person, tense)
            tmpl_str = templates_for_verb[i]
            sentence = build_sentence(tmpl_str, correct, tense)
            sentence_q = make_sentence_q(tmpl_str, tense, person)
            distractors = make_distractors(correct, verb, person, tense, ALL_VERBS)

            # Build options list and shuffle
            opts = [correct] + distractors
            random.shuffle(opts)
            ans_idx = opts.index(correct)

            q = {
                "id": f"VQ{q_id:04d}",
                "level": verb["level"],
                "verbType": verb_type(num),
                "tense": tense,
                "format": "Multiple Choice",
                "verb": verb["verb"],
                "person": PERSON_LABELS[person],
                "q": f"{sentence_q}\n(→ Welche Form von „{verb['verb']}\" ist korrekt? Tense: {tense}, Person: {PERSON_LABELS[person]})",
                "opts": opts,
                "ans": ans_idx,
                "correct": correct,
                "ch": "Verb Conjugation",
                "tip": tense_tip(tense, person, correct, verb['verb'])
            }
            questions.append(q)
            base_qs.append(q)
            q_id += 1

    # Add 2 extra MC questions (repeat ich + du Präsens with rephrased context)
    for extra_person in ["ich", "du"]:
        tense = "Präsens"
        i = PERSONS.index(extra_person)
        correct = get_conjugation(verb, extra_person, tense)
        tmpl_str = templates_for_verb[i]
        # Rephrase slightly
        sentence_q = f"[{verb['english'].upper()}] — Ergänze die richtige Form: {make_sentence_q(tmpl_str, tense, extra_person)}"
        distractors = make_distractors(correct, verb, extra_person, tense, ALL_VERBS)
        opts = [correct] + distractors
        random.shuffle(opts)
        ans_idx = opts.index(correct)
        q = {
            "id": f"VQ{q_id:04d}",
            "level": verb["level"],
            "verbType": verb_type(num),
            "tense": tense,
            "format": "Multiple Choice",
            "verb": verb["verb"],
            "person": PERSON_LABELS[extra_person],
            "q": sentence_q,
            "opts": opts,
            "ans": ans_idx,
            "correct": correct,
            "ch": "Verb Conjugation",
            "tip": tense_tip(tense, extra_person, correct, verb['verb'])
        }
        questions.append(q)
        q_id += 1

print(f"Batch 1 generated: {len(questions)} questions")

out_path = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_mc_a1_1.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f"Saved to {out_path}")
