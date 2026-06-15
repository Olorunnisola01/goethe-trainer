"""
Generates 1,000 MC questions for A2 verbs 101-150 (20 questions each).
IDs start at VQ2001. Output: verbquiz_mc_a2_1.json
"""
import json, random

with open(r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbs_data.json', 'r', encoding='utf-8') as f:
    ALL_VERBS = json.load(f)

PERSONS = ["ich","du","er","wir","ihr","sie"]
PERSON_LABELS = {"ich":"ich","du":"du","er":"er/sie/es","wir":"wir","ihr":"ihr","sie":"sie/Sie"}
IRREGULAR_NUMS = {118,119,120,127,128,130,136,137,138,139,140,142,143,144,146,147,148,150}

TMPL = {
    101: [  # lachen
        "Ich {V} immer, wenn ich gute Witze höre.",
        "Warum {V} du so laut gerade?",
        "Er {V} herzlich über den Witz des Komikers.",
        "Wir {V} alle zusammen über den lustigen Film.",
        "{V} ihr oft zusammen im Büro?",
        "Die Kinder {V} fröhlich auf dem Spielplatz."
    ],
    102: [  # weinen
        "Ich {V} beim traurigen Filmende immer.",
        "Warum {V} du — ist alles okay?",
        "Er {V} still, als er die Nachricht hörte.",
        "Wir {V} alle bei der bewegenden Zeremonie.",
        "{V} ihr bei romantischen Filmen?",
        "Sie {V} vor Freude, als sie die Prüfung bestand."
    ],
    103: [  # sich freuen
        "Ich {V} sehr auf das Konzert nächste Woche.",
        "Worüber {V} du dich gerade so sehr?",
        "Er {V} sich über das Geschenk seiner Freundin.",
        "Wir {V} uns sehr über euren Besuch.",
        "Worüber {V} ihr euch am meisten?",
        "Sie {V} sich über jede kleine Aufmerksamkeit."
    ],
    104: [  # sich fühlen
        "Ich {V} mich heute sehr wohl und entspannt.",
        "Wie {V} du dich heute — besser?",
        "Er {V} sich nach dem Urlaub viel besser.",
        "Wir {V} uns in dieser Stadt sehr wohl.",
        "Wie {V} ihr euch nach dem langen Flug?",
        "Sie {V} sich nach der Therapie viel stärker."
    ],
    105: [  # sich beeilen
        "Ich {V} mich, damit ich pünktlich bin.",
        "{V} dich bitte — der Zug fährt gleich!",
        "Er {V} sich, weil er zu spät dran ist.",
        "Wir {V} uns, um den letzten Bus zu kriegen.",
        "{V} euch bitte — wir warten alle!",
        "Sie {V} sich sehr, die Arbeit fertigzustellen."
    ],
    106: [  # sich setzen
        "Ich {V} mich gerne ans Fenster im Zug.",
        "Bitte {V} dich doch hin!",
        "Er {V} sich entspannt in den Liegestuhl.",
        "Wir {V} uns in den Schatten unter den Baum.",
        "{V} euch bitte — das Meeting beginnt!",
        "Die Gäste {V} sich gemütlich ans Feuer."
    ],
    107: [  # sich vorstellen
        "Ich {V} mir vor, wie schön das sein wird.",
        "Kannst du dir {V}, wie schwer das ist?",
        "Er {V} sich als Nächstes vor der Gruppe vor.",
        "Wir {V} uns eine große Reise durch Asien vor.",
        "Könnt ihr euch {V}, wie das aussehen wird?",
        "Sie {V} sich eine bessere Zukunft vor."
    ],
    108: [  # benutzen
        "Ich {V} täglich mein Fahrrad statt des Autos.",
        "{V} du auch diese App zum Lernen?",
        "Er {V} immer öffentliche Verkehrsmittel.",
        "Wir {V} das neue Programm für die Präsentation.",
        "{V} ihr Wörterbücher oder eher Übersetzungs-Apps?",
        "Die Studenten {V} die Bibliothek intensiv."
    ],
    109: [  # buchen
        "Ich {V} das Hotel schon drei Monate im Voraus.",
        "Hast du den Flug schon {V}?",
        "Er {V} einen Tisch im besten Restaurant.",
        "Wir {V} das Ferienhaus für den ganzen August.",
        "{V} ihr Pauschalreisen oder lieber einzeln?",
        "Sie {V} regelmäßig Wellnessurlaube im Schwarzwald."
    ],
    110: [  # reservieren
        "Ich {V} einen Tisch für zwei Personen.",
        "Hast du schon einen Platz {V}?",
        "Er {V} immer früh — sonst gibt es nichts.",
        "Wir {V} eine Suite im Stadthotel.",
        "{V} ihr Karten für das Konzert im Voraus?",
        "Sie {V} den ganzen Konferenzsaal für den Tag."
    ],
    111: [  # telefonieren
        "Ich {V} jeden Abend mit meiner Mutter.",
        "Mit wem {V} du gerade so lange?",
        "Er {V} täglich stundenlang für die Arbeit.",
        "Wir {V} einmal pro Woche als Familie.",
        "{V} ihr noch mit dem alten Festnetz?",
        "Sie {V} ständig — das Handy ist immer am Ohr."
    ],
    112: [  # funktionieren
        "Ich hoffe, dass mein Plan {V}.",
        "{V} dein neues Laptop endlich?",
        "Das WLAN {V} heute leider nicht.",
        "Wir hoffen, dass alles reibungslos {V}.",
        "{V} eure neuen Handys schon richtig?",
        "Die Heizung {V} seit dem Winter nicht mehr."
    ],
    113: [  # passieren
        "Ich frage, was hier gerade {V}.",
        "Was {V} dir — alles okay?",
        "Ein Unfall {V} gestern Abend auf der Kreuzung.",
        "Wir beobachten, was als Nächstes {V}.",
        "Was {V} euch auf dem Weg hierher?",
        "Solche Fehler {V} manchmal sogar den Besten."
    ],
    114: [  # studieren
        "Ich {V} Informatik an der TU Berlin.",
        "Was {V} du — Medizin oder Jura?",
        "Er {V} schon im fünften Semester Physik.",
        "Wir {V} alle an derselben Universität.",
        "{V} ihr auf Bachelor oder Master?",
        "Die Austauschstudenten {V} ein Jahr in Wien."
    ],
    115: [  # unterrichten
        "Ich {V} Deutsch als Fremdsprache.",
        "Welche Fächer {V} du an der Schule?",
        "Sie {V} Mathematik für die Abschlussklassen.",
        "Wir {V} gemeinsam in einem Projekt.",
        "{V} ihr auch Online-Kurse?",
        "Die erfahrenen Lehrerinnen {V} die neuen Klassen."
    ],
    116: [  # rechnen
        "Ich {V} jeden Tag mit Zahlen in meiner Arbeit.",
        "Kannst du das schnell {V}?",
        "Er {V} im Kopf — ganz ohne Taschenrechner.",
        "Wir {V} die Kosten für das Projekt.",
        "{V} ihr schon das Budget für nächstes Jahr?",
        "Die Buchhalter {V} täglich mit großen Summen."
    ],
    117: [  # zählen
        "Ich {V} die Einladungen für die Party.",
        "Kannst du bitte die Stühle {V}?",
        "Er {V} die Münzen in seinem Sparschwein.",
        "Wir {V} alle Stimmen nach der Wahl.",
        "{V} ihr die Gäste schon, die kommen?",
        "Die Kassiererin {V} das Wechselgeld sorgfältig."
    ],
    118: [  # messen
        "Ich {V} täglich meinen Blutdruck.",
        "Hast du schon die Temperatur {V}?",
        "Er {V} den Raum vor dem Kauf der Möbel.",
        "Wir {V} die Abstände sehr genau.",
        "{V} ihr den Regen mit dem Messgerät?",
        "Die Ärztin {V} die Körpergröße aller Patienten."
    ],
    119: [  # wiegen
        "Ich {V} mich jeden Montag.",
        "Wie viel {V} du — wenn ich fragen darf?",
        "Das Paket {V} leider über fünf Kilogramm.",
        "Wir {V} alle Zutaten vor dem Backen.",
        "{V} ihr das Gepäck schon vor dem Abflug?",
        "Der Händler {V} das Gemüse frisch auf dem Markt."
    ],
    120: [  # schneiden
        "Ich {V} das Gemüse für die Suppe.",
        "Kannst du bitte das Brot {V}?",
        "Er {V} sich beim Kochen in den Finger.",
        "Wir {V} den Kuchen in gleich große Stücke.",
        "{V} ihr die Haare selbst oder geht ihr zum Friseur?",
        "Die Friseurin {V} die Haare sehr präzise."
    ],
    121: [  # kleben
        "Ich {V} das zerrissene Buch zusammen.",
        "Was {V} du da auf das Papier?",
        "Er {V} das Plakat an die Wand.",
        "Wir {V} die Fotos ins Album.",
        "{V} ihr die Briefmarken auf die Umschläge?",
        "Die Kinder {V} bunte Formen auf das Bastelpapier."
    ],
    122: [  # zeichnen
        "Ich {V} gerne Porträts von Menschen.",
        "Was {V} du da in dein Notizbuch?",
        "Er {V} technische Pläne für das Gebäude.",
        "Wir {V} eine Karte des Viertels.",
        "{V} ihr die Diagramme für die Präsentation?",
        "Die Architektin {V} komplexe Baupläne."
    ],
    123: [  # tippen
        "Ich {V} sehr schnell auf der Tastatur.",
        "Kannst du das bitte {V} — meine Hände tun weh.",
        "Er {V} die ganze Nacht an seinem Roman.",
        "Wir {V} gleichzeitig an der Präsentation.",
        "{V} ihr noch auf Laptops oder schreibt ihr mit dem Handy?",
        "Die Sekretärin {V} alle Protokolle ein."
    ],
    124: [  # drucken
        "Ich {V} das Dokument auf dem Bürodrucker.",
        "Kannst du das bitte für mich {V}?",
        "Er {V} täglich Berichte für den Chef.",
        "Wir {V} alle Unterlagen für das Meeting.",
        "{V} ihr die Präsentation noch schnell?",
        "Die Druckerei {V} täglich tausende Flyer."
    ],
    125: [  # herunterladen
        "Ich {V} die neue App sofort herunter.",
        "Hast du die Datei schon {V}?",
        "Er {V} Filme für die lange Zugfahrt.",
        "Wir {V} die Software auf alle Computer.",
        "{V} ihr das Update schon?",
        "Die Schüler {V} die Lernmaterialien herunter."
    ],
    126: [  # hochladen
        "Ich {V} die Fotos direkt in die Cloud hoch.",
        "Hast du das Video schon {V}?",
        "Er {V} täglich neue Inhalte auf seinem Kanal hoch.",
        "Wir {V} alle Dateien auf den Server hoch.",
        "{V} ihr die Bilder schon auf Instagram hoch?",
        "Die Studenten {V} ihre Hausarbeiten hoch."
    ],
    127: [  # aufnehmen
        "Ich {V} das Interview mit meinem Handy auf.",
        "{V} du das Konzert für mich auf?",
        "Er {V} täglich kurze Videos für den Kurs auf.",
        "Wir {V} das Gespräch mit Erlaubnis auf.",
        "{V} ihr den Podcast selbst auf?",
        "Die Produzentinnen {V} das Album im Studio auf."
    ],
    128: [  # fernsehen
        "Ich {V} abends nur selten fern.",
        "Was {V} du gerade — eine Serie?",
        "Er {V} nach der Arbeit immer eine Stunde fern.",
        "Wir {V} freitags zusammen einen Film.",
        "{V} ihr noch linear oder nur Streaming?",
        "Die Familie {V} zusammen das Finale."
    ],
    129: [  # aufhören
        "Ich {V} jetzt mit dem Rauchen auf.",
        "Wann {V} du endlich damit auf?",
        "Es {V} plötzlich auf zu regnen.",
        "Wir {V} mit dem Streit auf — genug!",
        "{V} ihr bitte mit dem Lärm auf!",
        "Sie {V} nach Jahren mit dem Sport auf."
    ],
    130: [  # anfangen
        "Ich {V} heute mit dem Lesen an.",
        "Wann {V} du mit dem Studium an?",
        "Er {V} einen neuen Job nächste Woche an.",
        "Wir {V} das Projekt erst im Februar an.",
        "Wann {V} ihr mit der Renovierung an?",
        "Die Kurse {V} pünktlich um 9 Uhr an."
    ],
    131: [  # vorhaben
        "Ich {V} nächstes Jahr eine große Reise vor.",
        "Was {V} du dieses Wochenende vor?",
        "Er {V} viel für sein Leben nach der Schule vor.",
        "Wir {V} ein Fest für alle Freunde vor.",
        "Was {V} ihr für die Ferien vor?",
        "Sie {V} eine Karriere in der Medizin vor."
    ],
    132: [  # vorlesen
        "Ich {V} meinen Kindern jede Nacht vor.",
        "Kannst du den Satz bitte {V}?",
        "Er {V} seinen Schülern Kurzgeschichten vor.",
        "Wir {V} abwechselnd aus dem Roman vor.",
        "{V} ihr den Eltern beim Abend etwas vor?",
        "Die Bibliothekarin {V} den Kindern Märchen vor."
    ],
    133: [  # nachfragen
        "Ich {V} noch einmal beim Arzt nach.",
        "Kannst du bitte {V}, ob der Termin gilt?",
        "Er {V} beim Kunden wegen der Bestellung nach.",
        "Wir {V} bei der Schule wegen der Noten nach.",
        "{V} ihr beim Vermieter nach, ob das erlaubt ist?",
        "Sie {V} immer, wenn etwas unklar ist."
    ],
    134: [  # übersetzen
        "Ich {V} Texte vom Deutschen ins Englische.",
        "Kannst du das für mich {V}?",
        "Er {V} seit Jahren medizinische Dokumente.",
        "Wir {V} den ganzen Brief gemeinsam.",
        "{V} ihr den Text für die Ausländer?",
        "Die Dolmetscherin {V} simultan bei der Konferenz."
    ],
    135: [  # überprüfen
        "Ich {V} meine E-Mails jeden Morgen.",
        "Kannst du bitte den Text {V}?",
        "Er {V} alle Dokumente vor der Abgabe.",
        "Wir {V} die Qualität jedes Produkts.",
        "{V} ihr die Zahlen vor der Präsentation?",
        "Die Prüferin {V} alle Antworten sehr genau."
    ],
    136: [  # abnehmen
        "Ich {V} durch Sport und gesunde Ernährung ab.",
        "Wie viel {V} du seit letztem Monat ab?",
        "Er {V} seit dem Sommer fünf Kilo ab.",
        "Wir {V} alle etwas ab nach der Diät.",
        "{V} ihr durch das Training ab?",
        "Sie {V} nach der Krankheit ungewollt ab."
    ],
    137: [  # zunehmen
        "Ich {V} in der kalten Jahreszeit immer zu.",
        "Hast du in letzter Zeit zugenommen?",
        "Er {V} durch die Medikamente zu.",
        "Wir {V} alle im Urlaub etwas zu.",
        "{V} ihr bei der Abschlussfeier richtig zu?",
        "Die Anzahl der Touristen {V} jedes Jahr zu."
    ],
    138: [  # aufwachsen
        "Ich {V} in einem kleinen Dorf auf.",
        "Wo {V} du auf — in der Stadt oder auf dem Land?",
        "Er {V} in einer mehrsprachigen Familie auf.",
        "Wir {V} alle in derselben Straße auf.",
        "Wo {V} ihr auf — hier in Berlin?",
        "Die Kinder {V} zweisprachig auf."
    ],
    139: [  # ausgehen
        "Ich {V} freitags immer gerne aus.",
        "Wo {V} du am liebsten am Wochenende aus?",
        "Er {V} kaum noch aus — er ist sehr müde.",
        "Wir {V} samstags in eine Cocktailbar aus.",
        "{V} ihr heute Abend auch aus?",
        "Sie {V} oft aus, um neue Leute kennenzulernen."
    ],
    140: [  # zurückkommen
        "Ich {V} nächste Woche aus dem Urlaub zurück.",
        "Wann {V} du aus Paris zurück?",
        "Er {V} spät in der Nacht nach Hause zurück.",
        "Wir {V} alle gemeinsam nach Hause zurück.",
        "Wann {V} ihr von der Reise zurück?",
        "Die Expedition {V} nach einem Jahr zurück."
    ],
    141: [  # vorbereiten
        "Ich {V} mich intensiv auf die Prüfung vor.",
        "Wie {V} du dich auf das Gespräch vor?",
        "Er {V} die Präsentation für den Kunden vor.",
        "Wir {V} alles für das große Fest vor.",
        "{V} ihr euch auf das Vorstellungsgespräch vor?",
        "Die Köchin {V} das Menü einen Tag vorher vor."
    ],
    142: [  # teilnehmen
        "Ich {V} am Marathonlauf diesen Herbst teil.",
        "Nimmst du am Kurs {V}?",
        "Er {V} regelmäßig an Seminaren teil.",
        "Wir {V} alle am Workshop teil.",
        "{V} ihr am Wettbewerb auch teil?",
        "Viele Studenten {V} an der Demonstration teil."
    ],
    143: [  # stattfinden
        "Das Konzert {V} heute Abend im Freien statt.",
        "Wann {V} das Fest bei euch statt?",
        "Der Kurs {V} jeden Montag um 18 Uhr statt.",
        "Die Meetings {V} online statt.",
        "Wann {V} eure Hochzeit statt?",
        "Die Veranstaltung {V} trotz Regen statt."
    ],
    144: [  # vergessen
        "Ich {V} leider manchmal wichtige Termine.",
        "Hast du deinen Schlüssel schon wieder {V}?",
        "Er {V} seinen Regenschirm im Bus.",
        "Wir {V} nie die Freundschaft, die wir hatten.",
        "Habt ihr den Termin {V}?",
        "Sie {V} nie ein Gesicht — ein perfektes Gedächtnis."
    ],
    145: [  # erinnern
        "Ich {V} mich noch gut an meine erste Reise.",
        "Erinnerst du dich noch daran?",
        "Er {V} sich an jedes Detail des Gesprächs.",
        "Wir {V} uns gerne an die Zeit zusammen.",
        "Erinnert ihr euch noch daran?",
        "Sie {V} sich an den Namen aller Schüler."
    ],
    146: [  # verlieren
        "Ich {V} immer meinen Hausschlüssel.",
        "Hast du schon wieder dein Handy {V}?",
        "Er {V} das Spiel trotz guter Leistung.",
        "Wir {V} den Anschluss nicht.",
        "{V} ihr nie euren Optimismus?",
        "Das Team {V} das entscheidende Finale."
    ],
    147: [  # gewinnen
        "Ich {V} selten bei Kartenspielen.",
        "Hast du bei der Lotterie {V}?",
        "Er {V} den ersten Preis im Wettbewerb.",
        "Wir {V} das Turnier im Sommer.",
        "{V} ihr auch manchmal beim Spieleabend?",
        "Die Mannschaft {V} das Meisterschaftsfinale."
    ],
    148: [  # kämpfen
        "Ich {V} täglich für mehr Gerechtigkeit.",
        "Wofür {V} du in deinem Leben?",
        "Er {V} mutig für seine Überzeugungen.",
        "Wir {V} gemeinsam gegen Unrecht.",
        "Wofür {V} ihr in eurem Beruf?",
        "Die Aktivisten {V} für den Klimaschutz."
    ],
    149: [  # schützen
        "Ich {V} meine Privatsphäre im Internet.",
        "Wie {V} du deine Daten online?",
        "Er {V} die Kinder vor gefährlichen Inhalten.",
        "Wir {V} die Umwelt durch bewusstes Handeln.",
        "Wie {V} ihr eure persönlichen Daten?",
        "Der Sonnencreme {V} die Haut vor UV-Strahlen."
    ],
    150: [  # tragen
        "Ich {V} heute eine leichte Sommerjacke.",
        "Was {V} du zur Feier — ein Kleid?",
        "Er {V} das schwere Gepäck alleine die Treppe hoch.",
        "Wir {V} alle Verantwortung für das Ergebnis.",
        "{V} ihr eure Schuluniformen täglich?",
        "Die Träger {V} die Möbel ins neue Zimmer."
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
    for fb in ["machte","hatte","ging","war","wurde","lernte","spielte"]:
        if len(distractors) >= 3: break
        if fb != correct and fb not in distractors: distractors.append(fb)
    return distractors[:3]

def tense_tip(tense, person, correct, verb_inf):
    pmap = {"ich":"1st sg","du":"2nd sg","er":"3rd sg","wir":"1st pl","ihr":"2nd pl","sie":"3rd pl"}
    tips = {
        "Präsens": f"**{verb_inf}** (Präsens, {pmap[person]}): **{correct}**.",
        "Präteritum": f"**{verb_inf}** (Präteritum, {pmap[person]}): **{correct}**. Used in written narrative.",
        "Perfekt": f"**{verb_inf}** (Perfekt, {pmap[person]}): **{correct}**. Spoken past tense."
    }
    return tips[tense]

questions = []
q_id = 2001
TENSES = ["Präsens","Präteritum","Perfekt"]

for verb in ALL_VERBS:
    num = verb["num"]
    if num < 101 or num > 150: continue
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

print(f"Batch 3 generated: {len(questions)} questions")
out_path = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_mc_a2_1.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f"Saved to {out_path}")
