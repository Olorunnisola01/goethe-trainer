"""
Generates 1,000 MC questions for A2 verbs 151-200 (20 questions each).
IDs start at VQ3001. Output: verbquiz_mc_a2_2.json
"""
import json, random

with open(r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbs_data.json', 'r', encoding='utf-8') as f:
    ALL_VERBS = json.load(f)

PERSONS = ["ich","du","er","wir","ihr","sie"]
PERSON_LABELS = {"ich":"ich","du":"du","er":"er/sie/es","wir":"wir","ihr":"ihr","sie":"sie/Sie"}
IRREGULAR_NUMS = {159,160,161,165,172,173,176,177,178,179,189,190,191,196,197,198,200}

TMPL = {
    151: [  # empfangen
        "Ich {V} die Gäste herzlich an der Tür.",
        "Wie {V} du Feedback — offen oder defensiv?",
        "Er {V} täglich viele E-Mails im Büro.",
        "Wir {V} die Delegation am Flughafen.",
        "{V} ihr die Besucher freundlich?",
        "Die Rezeptionistin {V} alle Gäste mit einem Lächeln."
    ],
    152: [  # ankündigen
        "Ich {V} mein Kommen rechtzeitig an.",
        "Wann {V} du deinen Besuch an?",
        "Er {V} seinen Rücktritt überraschend an.",
        "Wir {V} die Veranstaltung in der Zeitung an.",
        "{V} ihr die neuen Regeln schon an?",
        "Die Firma {V} neue Stellen auf ihrer Website an."
    ],
    153: [  # absagen
        "Ich {V} den Termin leider kurzfristig ab.",
        "Musst du wirklich {V}?",
        "Er {V} das Meeting wegen Krankheit ab.",
        "Wir {V} die Party wegen des Sturms ab.",
        "{V} ihr auch das Treffen ab?",
        "Sie {V} die Veranstaltung aufgrund des Wetters ab."
    ],
    154: [  # danken
        "Ich {V} dir für deine Hilfe von Herzen.",
        "Wem {V} du am meisten in deinem Leben?",
        "Er {V} den Helfern nach dem Umzug.",
        "Wir {V} allen Beteiligten am Ende.",
        "{V} ihr euren Eltern für alles?",
        "Die Gewinnerin {V} ihrem Team auf der Bühne."
    ],
    155: [  # entschuldigen
        "Ich {V} mich für mein Verhalten gestern.",
        "Kannst du dich bitte {V}?",
        "Er {V} sich höflich für seine Verspätung.",
        "Wir {V} uns für das Missverständnis.",
        "{V} ihr euch bei euren Kollegen?",
        "Sie {V} sich aufrichtig für den Fehler."
    ],
    156: [  # begrüßen
        "Ich {V} alle Gäste einzeln an der Tür.",
        "Wie {V} du Fremde normalerweise?",
        "Er {V} seinen alten Freund herzlich.",
        "Wir {V} die neuen Mitglieder im Team.",
        "{V} ihr die Besucher auf Deutsch?",
        "Die Gastgeberin {V} jeden mit einem Lächeln."
    ],
    157: [  # verabschieden
        "Ich {V} mich immer herzlich von den Gästen.",
        "Wie {V} du dich — mit Handschlag?",
        "Er {V} sich weinend von seiner Familie.",
        "Wir {V} uns am Bahnhof voneinander.",
        "Wie {V} ihr euch bei Bekannten?",
        "Sie {V} sich nach drei Jahren von der Firma."
    ],
    158: [  # heiraten
        "Ich {V} nächsten Sommer meine große Liebe.",
        "Wann {V} du — hast du schon ein Datum?",
        "Er {V} seine Jugendliebe nach zwanzig Jahren.",
        "Wir {V} im kleinen Kreis nächsten Frühling.",
        "{V} ihr auch bald — ihr seid schon so lange zusammen?",
        "Sie {V} in einer kleinen Kapelle am See."
    ],
    159: [  # gebären
        "Ich {V} mein erstes Kind im Frühjahr.",
        "Wann {V} du dein Kind?",
        "Sie {V} Zwillinge im Krankenhaus.",
        "Wir freuen uns, dass sie so ein gesundes Kind {V}.",
        "Habt ihr schon {V} — herzlichen Glückwunsch!",
        "Sie {V} ein gesundes Mädchen im Juli."
    ],
    160: [  # sterben
        "Ich hoffe, dass niemand {V}.",
        "Woran {V} du in diesem Roman fast?",
        "Der alte Hund {V} friedlich in der Nacht.",
        "Wir trauern um alle, die {V}.",
        "Habt ihr gehört, wer {V}?",
        "Viele Pflanzen {V} bei zu wenig Wasser."
    ],
    161: [  # wachsen
        "Ich {V} jeden Tag an meinen Erfahrungen.",
        "Wie schnell {V} du als Kind?",
        "Der Baum {V} jeden Sommer mehrere Zentimeter.",
        "Wir {V} als Team durch jede Herausforderung.",
        "{V} eure Kinder schnell gerade?",
        "Die Stadt {V} jedes Jahr um tausende Einwohner."
    ],
    162: [  # ändern
        "Ich {V} meinen Plan kurzfristig.",
        "Was {V} du an deiner Situation?",
        "Er {V} seine Meinung nach der Diskussion.",
        "Wir {V} die Uhrzeit des Treffens.",
        "{V} ihr den Plan oder bleibt ihr dabei?",
        "Die Firma {V} ihre Öffnungszeiten im Sommer."
    ],
    163: [  # verbessern
        "Ich {V} mein Deutsch täglich durch Üben.",
        "Wie {V} du deine Sprachkenntnisse?",
        "Er {V} seinen Aufsatz nach dem Feedback.",
        "Wir {V} ständig unsere Prozesse.",
        "{V} ihr eure Noten dieses Semester?",
        "Die Wissenschaftler {V} die Technologie laufend."
    ],
    164: [  # aufpassen
        "Ich {V} in der Stadt gut auf meine Tasche auf.",
        "Kannst du bitte auf die Kinder {V}?",
        "Er {V} immer gut auf seine Gesundheit auf.",
        "Wir {V} gegenseitig aufeinander auf.",
        "{V} ihr gut auf das Gepäck auf?",
        "Die Eltern {V} ständig auf ihre kleinen Kinder auf."
    ],
    165: [  # mitnehmen
        "Ich {V} immer Wasser und Snacks mit.",
        "Was {V} du auf die Wanderung mit?",
        "Er {V} seinen Hund überall mit.",
        "Wir {V} Essen und Getränke zum Picknick mit.",
        "{V} ihr das Zelt oder leiht ihr es aus?",
        "Die Schüler {V} ihre Bücher mit nach Hause."
    ],
    166: [  # hinstellen
        "Ich {V} die Blumen auf den Tisch hin.",
        "Wohin {V} du das neue Regal hin?",
        "Er {V} das Fahrrad vor dem Eingang hin.",
        "Wir {V} die Stühle in einen Kreis hin.",
        "{V} ihr den Weihnachtsbaum in die Ecke hin?",
        "Sie {V} die Tassen auf das Tablett hin."
    ],
    167: [  # hinlegen
        "Ich {V} das Buch nach dem Lesen beiseite hin.",
        "Wohin {V} du deine Sachen normalerweise hin?",
        "Er {V} das Baby vorsichtig in die Krippe hin.",
        "Wir {V} die Decken auf den Boden hin.",
        "{V} ihr eure Jacken auf das Bett hin?",
        "Sie {V} die Dokumente auf den Schreibtisch hin."
    ],
    168: [  # spazieren gehen
        "Ich {V} jeden Abend am See spazieren.",
        "{V} du auch gerne in der Natur spazieren?",
        "Er {V} mit seinem Hund durch den Park spazieren.",
        "Wir {V} nach dem Essen im Stadtpark spazieren.",
        "{V} ihr am Wochenende gerne spazieren?",
        "Die Familie {V} sonntags am Rhein spazieren."
    ],
    169: [  # joggen
        "Ich {V} jeden Morgen fünf Kilometer.",
        "Wie oft {V} du pro Woche?",
        "Er {V} täglich vor der Arbeit im Park.",
        "Wir {V} zusammen für den Halbmarathon.",
        "{V} ihr auch bei Regen?",
        "Die Gruppe {V} jeden Dienstag durch den Wald."
    ],
    170: [  # trainieren
        "Ich {V} dreimal pro Woche im Fitnessstudio.",
        "Wie oft {V} du für den Wettkampf?",
        "Er {V} intensiv für die Meisterschaft.",
        "Wir {V} jeden Tag zusammen als Team.",
        "{V} ihr schon für den Marathon?",
        "Die Athleten {V} täglich sechs Stunden lang."
    ],
    171: [  # gebrauchen
        "Ich {V} das Wörterbuch täglich beim Lernen.",
        "{V} du noch Hilfe bei der Aufgabe?",
        "Er {V} immer alte Werkzeuge statt neue.",
        "Wir {V} das Programm für alle Berechnungen.",
        "{V} ihr noch das alte Gerät?",
        "Die Handwerker {V} nur professionelles Werkzeug."
    ],
    172: [  # überweisen
        "Ich {V} die Miete immer pünktlich am Ersten.",
        "Hast du das Geld schon {V}?",
        "Er {V} den Betrag sofort nach der Rechnung.",
        "Wir {V} den Betrag in drei Raten.",
        "{V} ihr die Gehaltserhöhung schon?",
        "Die Firma {V} die Gehälter am Monatsende."
    ],
    173: [  # abheben
        "Ich {V} am Automaten dreihundert Euro ab.",
        "Wie viel {V} du heute ab?",
        "Er {V} sein ganzes Erspartes ab.",
        "Wir {V} genug für den Urlaub ab.",
        "{V} ihr lieber Bargeld oder zahlt ihr mit Karte?",
        "Sie {V} jeden Monat einen festen Betrag ab."
    ],
    174: [  # einzahlen
        "Ich {V} jeden Monat Geld auf mein Sparkonto ein.",
        "Wie viel {V} du regelmäßig ein?",
        "Er {V} seinen Bonus sofort in die Rente ein.",
        "Wir {V} gemeinsam für den Urlaub ein.",
        "{V} ihr schon in eine Altersvorsorge ein?",
        "Die Kunden {V} Geld am Schalter ein."
    ],
    175: [  # ausfüllen
        "Ich {V} das Formular sorgfältig aus.",
        "Kannst du das Formular {V}?",
        "Er {V} den Antrag mit allen Daten aus.",
        "Wir {V} die Bögen gemeinsam aus.",
        "{V} ihr die Bewerbungsunterlagen vollständig aus?",
        "Die Bewerber {V} alle Felder im Formular aus."
    ],
    176: [  # unterschreiben
        "Ich {V} den Vertrag nach der Prüfung.",
        "Kannst du hier bitte {V}?",
        "Er {V} den Mietvertrag nach langer Suche.",
        "Wir {V} alle Dokumente zusammen.",
        "{V} ihr den Kaufvertrag schon?",
        "Die Beteiligten {V} die Vereinbarung feierlich."
    ],
    177: [  # abgeben
        "Ich {V} die Hausarbeit pünktlich ab.",
        "Hast du deine Prüfung schon {V}?",
        "Er {V} das Paket beim Nachbarn ab.",
        "Wir {V} den Bericht vor der Frist ab.",
        "{V} ihr die Schlüssel nach dem Auszug ab?",
        "Die Schüler {V} ihre Arbeiten bis Freitag ab."
    ],
    178: [  # abbiegen
        "Ich {V} an der Ampel nach links ab.",
        "Wo {V} du ab — an der nächsten Kreuzung?",
        "Er {V} falsch ab und verirrt sich.",
        "Wir {V} an der Kirche rechts ab.",
        "Wo {V} ihr ab, um zur Schule zu kommen?",
        "Das Taxi {V} am Ende der Straße links ab."
    ],
    179: [  # einbiegen
        "Ich {V} in die kleine Gasse ein.",
        "Wo {V} du in die Hauptstraße ein?",
        "Er {V} an der Ampel in die Seitenstraße ein.",
        "Wir {V} in die Einbahnstraße ein.",
        "{V} ihr dort in den Parkweg ein?",
        "Das Auto {V} vorsichtig in die enge Zufahrt ein."
    ],
    180: [  # überqueren
        "Ich {V} die Straße nur bei Grün.",
        "Wo {V} du die Kreuzung am sichersten?",
        "Er {V} die breite Straße mit dem Kinderwagen.",
        "Wir {V} die Brücke zu Fuß.",
        "{V} ihr die Kreuzung oder geht ihr drumherum?",
        "Die Fußgänger {V} die Ampelkreuzung vorsichtig."
    ],
    181: [  # parken
        "Ich {V} immer in der Tiefgarage.",
        "Wo {V} du — hast du einen Platz gefunden?",
        "Er {V} direkt vor dem Eingang des Supermarkts.",
        "Wir {V} immer auf dem Parkplatz hinter dem Haus.",
        "{V} ihr hier oder weiter weg?",
        "Die meisten Besucher {V} in der Innenstadt kostenpflichtig."
    ],
    182: [  # tanken
        "Ich {V} immer, bevor der Tank leer ist.",
        "Wo {V} du — an welcher Tankstelle?",
        "Er {V} volltanken für die lange Fahrt.",
        "Wir {V} kurz vor der Autobahn.",
        "{V} ihr heute noch oder reicht der Tank?",
        "Sie {V} Super E10 für das Auto."
    ],
    183: [  # reparieren
        "Ich {V} mein Fahrrad selbst wenn möglich.",
        "Wer {V} das kaputte Gerät?",
        "Er {V} alte Uhren als Hobby.",
        "Wir {V} das Auto in unserer eigenen Werkstatt.",
        "{V} ihr das Dach selbst oder holt ihr Handwerker?",
        "Die Mechaniker {V} das Fahrzeug innerhalb eines Tages."
    ],
    184: [  # putzen
        "Ich {V} jede Woche gründlich das Badezimmer.",
        "Wann {V} du deine Wohnung?",
        "Er {V} jeden Samstag die Fenster.",
        "Wir {V} die Küche nach dem Kochen zusammen.",
        "{V} ihr eure Zimmer selbst?",
        "Die Reinigungskraft {V} das Büro täglich."
    ],
    185: [  # bügeln
        "Ich {V} meine Hemden am Sonntag.",
        "Wie oft {V} du deine Kleidung?",
        "Er {V} seine Hemden immer selbst für die Arbeit.",
        "Wir {V} abwechselnd die Wäsche.",
        "{V} ihr alles oder nur das Nötigste?",
        "Die Haushaltshelfer {V} alle Kleidungsstücke."
    ],
    186: [  # nähen
        "Ich {V} meine eigenen Kleider selbst.",
        "Kannst du {V} — hast du eine Nähmaschine?",
        "Sie {V} ein Kostüm für das Theaterstück.",
        "Wir {V} zusammen Dekoration für das Fest.",
        "{V} ihr eure Kostüme selbst?",
        "Die Schneiderin {V} maßgefertigte Anzüge."
    ],
    187: [  # stricken
        "Ich {V} meiner Oma einen warmen Schal.",
        "Was {V} du gerade — einen Pullover?",
        "Sie {V} wunderschöne Muster in bunten Farben.",
        "Wir {V} gemeinsam im Strickkreis jeden Freitag.",
        "{V} ihr selbst oder kauft ihr eure Kleidung?",
        "Die Frauen {V} warme Sachen für den Winter."
    ],
    188: [  # grillen
        "Ich {V} im Sommer fast jedes Wochenende.",
        "Was {V} du — Fleisch oder Gemüse?",
        "Er {V} meisterhaft Spare Ribs und Burger.",
        "Wir {V} am Samstag im Garten mit Freunden.",
        "{V} ihr auch oder habt ihr keinen Grill?",
        "Die Familie {V} gemeinsam bei gutem Wetter."
    ],
    189: [  # aufessen
        "Ich {V} immer alles auf — nichts bleibt übrig.",
        "Kannst du bitte deinen Teller {V}?",
        "Er {V} den ganzen Kuchen alleine auf.",
        "Wir {V} alles restlos auf.",
        "{V} ihr das ganze Essen oder bleibt etwas übrig?",
        "Die Kinder {V} begeistert ihre Lieblingsspeise auf."
    ],
    190: [  # austrinken
        "Ich {V} mein Glas immer bis zum letzten Schluck aus.",
        "Trinkst du das wirklich alles {V}?",
        "Er {V} die Flasche Wasser nach dem Sport aus.",
        "Wir {V} die letzte Flasche Saft gemeinsam aus.",
        "{V} ihr eure Getränke vor dem Aufbruch aus?",
        "Die Gäste {V} ihre Gläser und verabschiedeten sich."
    ],
    191: [  # aufwachen
        "Ich {V} jeden Morgen ohne Wecker auf.",
        "Wann {V} du normalerweise auf?",
        "Er {V} von einem lauten Geräusch auf.",
        "Wir {V} alle gleichzeitig vom Lärm auf.",
        "Um wie viel Uhr {V} ihr am Wochenende auf?",
        "Die Kinder {V} früh am Weihnachtsmorgen auf."
    ],
    192: [  # duschen
        "Ich {V} jeden Morgen kalt nach dem Aufstehen.",
        "Wie lange {V} du immer?",
        "Er {V} nach dem Training schnell.",
        "Wir {V} abwechselnd das Badezimmer nutzen.",
        "{V} ihr lieber morgens oder abends?",
        "Die Sportler {V} nach jedem Training."
    ],
    193: [  # baden
        "Ich {V} abends gerne lange in der Badewanne.",
        "Wann {V} du die Kinder?",
        "Er {V} jeden Abend entspannt im heißen Wasser.",
        "Wir {V} die Kleinen immer zusammen.",
        "{V} ihr im Meer oder lieber im Pool?",
        "Die Kinder {V} nach dem Strand unter der Dusche."
    ],
    194: [  # schminken
        "Ich {V} mich nur für besondere Anlässe.",
        "Wie lange {V} du dich morgens?",
        "Sie {V} sich für die Theatervorstellung.",
        "Wir {V} uns für die Karnevalsparty auf.",
        "{V} ihr euch für die Feier?",
        "Die Schauspielerinnen {V} sich vor der Vorstellung."
    ],
    195: [  # kämmen
        "Ich {V} mir morgens schnell die Haare.",
        "Wann {V} du dir die Haare?",
        "Er {V} dem Kind sanft die Haare.",
        "Wir {V} uns schnell und sind fertig.",
        "{V} ihr euch noch oder seid ihr schon bereit?",
        "Die Mutter {V} ihrer Tochter die langen Haare."
    ],
    196: [  # anziehen
        "Ich {V} mir heute etwas Warmes an.",
        "Was {V} du zur Feier an?",
        "Er {V} sich schnell den Mantel an.",
        "Wir {V} uns warm an — es ist kalt draußen.",
        "{V} ihr euch schon oder braucht ihr noch Zeit?",
        "Die Kinder {V} sich selbst an."
    ],
    197: [  # ausziehen
        "Ich {V} mir die nassen Schuhe sofort aus.",
        "Was {V} du zuerst aus?",
        "Er {V} sich den schweren Rucksack aus.",
        "Wir {V} uns die Jacken beim Betreten aus.",
        "{V} ihr euch die Schuhe an der Tür aus?",
        "Die Kinder {V} sich vor dem Baden aus."
    ],
    198: [  # schreien
        "Ich {V} vor Schreck laut auf.",
        "Warum {V} du so laut?",
        "Er {V} vor Freude nach dem Tor.",
        "Wir {V} alle gleichzeitig beim Horrorfilm.",
        "{V} ihr immer so beim Fußball?",
        "Die Fans {V} begeistert nach dem Sieg."
    ],
    199: [  # flüstern
        "Ich {V} dir etwas Wichtiges ins Ohr.",
        "Warum {V} du so leise?",
        "Er {V} das Geheimnis nur seiner besten Freundin.",
        "Wir {V} im Lesesaal der Bibliothek.",
        "Warum {V} ihr so — dürft ihr laut sprechen?",
        "Die Kinder {V} kichernd miteinander."
    ],
    200: [  # bitten
        "Ich {V} dich um einen kleinen Gefallen.",
        "Wen {V} du um Hilfe?",
        "Er {V} höflich um eine Verlängerung.",
        "Wir {V} alle Gäste pünktlich zu kommen.",
        "{V} ihr um Erlaubnis oder macht ihr einfach?",
        "Sie {V} die Lehrerin um mehr Erklärung."
    ],
}

def verb_type(num):
    return "Irregular" if num in IRREGULAR_NUMS else "Regular"

def get_conjugation(verb, person, tense):
    if tense == "Präsens":    return verb["praesens"][person]
    elif tense == "Präteritum": return verb["praeteritum"][person]
    else:
        aux_conj = {
            "haben": {"ich":"habe","du":"hast","er":"hat","wir":"haben","ihr":"habt","sie":"haben"},
            "sein":  {"ich":"bin","du":"bist","er":"ist","wir":"sind","ihr":"seid","sie":"sind"}
        }
        return f"{aux_conj[verb['perfekt']['aux']][person]} {verb['perfekt']['participle']}"

def make_distractors(correct, verb, person, tense):
    distractors = set()
    for op in [p for p in PERSONS if p != person][:2]:
        d = get_conjugation(verb, op, tense)
        if d != correct: distractors.add(d)
    for ot in [t for t in ["Präsens","Präteritum","Perfekt"] if t != tense]:
        d = get_conjugation(verb, person, ot)
        if d != correct: distractors.add(d)
    stem = verb["verb"].rstrip("en").rstrip("n")
    for uml,base in {"ä":"a","ö":"o","ü":"u"}.items():
        stem = stem.replace(uml,base)
    sfx = {"ich":"te","du":"test","er":"te","wir":"ten","ihr":"tet","sie":"ten"}
    distractors.add(stem + sfx[person])
    distractors.discard(correct)
    distractors = list(distractors)[:3]
    for fb in ["machte","hatte","ging","war","wurde","lernte","spielte","lebte"]:
        if len(distractors) >= 3: break
        if fb != correct and fb not in distractors: distractors.append(fb)
    return distractors[:3]

def tense_tip(tense, person, correct, verb_inf):
    pmap = {"ich":"1st sg","du":"2nd sg","er":"3rd sg","wir":"1st pl","ihr":"2nd pl","sie":"3rd pl"}
    tips = {
        "Präsens": f"**{verb_inf}** (Präsens, {pmap[person]}): **{correct}**.",
        "Präteritum": f"**{verb_inf}** (Präteritum, {pmap[person]}): **{correct}**. Narrative past tense.",
        "Perfekt": f"**{verb_inf}** (Perfekt, {pmap[person]}): **{correct}**. Spoken past tense."
    }
    return tips[tense]

questions = []
q_id = 3001
TENSES = ["Präsens","Präteritum","Perfekt"]

for verb in ALL_VERBS:
    num = verb["num"]
    if num < 151 or num > 200: continue
    if num not in TMPL: continue
    tmpls = TMPL[num]

    for tense in TENSES:
        for i, person in enumerate(PERSONS):
            correct = get_conjugation(verb, person, tense)
            sentence_q = tmpls[i].replace("{V}", "_____")
            distractors = make_distractors(correct, verb, person, tense)
            opts = [correct] + distractors
            random.shuffle(opts)
            questions.append({
                "id": f"VQ{q_id:04d}",
                "level": verb["level"],
                "verbType": verb_type(num),
                "tense": tense,
                "format": "Multiple Choice",
                "verb": verb["verb"],
                "person": PERSON_LABELS[person],
                "q": f"{sentence_q}\n(→ Welche Form von „{verb['verb']}\" ist korrekt? Tense: {tense}, Person: {PERSON_LABELS[person]})",
                "opts": opts,
                "ans": opts.index(correct),
                "correct": correct,
                "ch": "Verb Conjugation",
                "tip": tense_tip(tense, person, correct, verb['verb'])
            })
            q_id += 1

    for extra_person in ["ich","du"]:
        tense = "Präsens"
        i = PERSONS.index(extra_person)
        correct = get_conjugation(verb, extra_person, tense)
        sentence_q = f"[{verb['english'].upper()}] — {tmpls[i].replace('{V}','_____')}"
        distractors = make_distractors(correct, verb, extra_person, tense)
        opts = [correct] + distractors
        random.shuffle(opts)
        questions.append({
            "id": f"VQ{q_id:04d}",
            "level": verb["level"],
            "verbType": verb_type(num),
            "tense": tense,
            "format": "Multiple Choice",
            "verb": verb["verb"],
            "person": PERSON_LABELS[extra_person],
            "q": sentence_q,
            "opts": opts,
            "ans": opts.index(correct),
            "correct": correct,
            "ch": "Verb Conjugation",
            "tip": tense_tip(tense, extra_person, correct, verb['verb'])
        })
        q_id += 1

print(f"Batch 4 generated: {len(questions)} questions")
out_path = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_mc_a2_2.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f"Saved to {out_path}")
