"""
Generates 1,000 MC questions for A1 verbs 51-100 (20 questions each).
IDs start at VQ1001. Output: verbquiz_mc_a1_2.json
"""
import json, random

with open(r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbs_data.json', 'r', encoding='utf-8') as f:
    ALL_VERBS = json.load(f)

PERSONS = ["ich", "du", "er", "wir", "ihr", "sie"]
PERSON_LABELS = {"ich":"ich","du":"du","er":"er/sie/es","wir":"wir","ihr":"ihr","sie":"sie/Sie"}
IRREGULAR_NUMS = {51,52,62,63,64,67,68,69,70,71,72,73,74,75,76,85,88,90,92,95,96,98}

TMPL = {
    51: [  # kennen
        "Ich {V} diese Stadt sehr gut.",
        "{V} du diesen Schauspieler auch?",
        "Er {V} viele Leute in der ganzen Stadt.",
        "Wir {V} uns schon seit der Kindheit.",
        "{V} ihr den neuen Nachbarn schon?",
        "Sie {V} fast alle Sprachen in Europa."
    ],
    52: [  # verstehen
        "Ich {V} diesen Satz leider nicht.",
        "{V} du, was er meint?",
        "Er {V} kein Wort auf Japanisch.",
        "Wir {V} das Problem sehr gut.",
        "{V} ihr die Aufgabe richtig?",
        "Sie {V} sich gut, obwohl sie verschieden sind."
    ],
    53: [  # brauchen
        "Ich {V} dringend Hilfe beim Umzug.",
        "Was {V} du für die Reise?",
        "Er {V} täglich starken Kaffee morgens.",
        "Wir {V} mehr Zeit für das Projekt.",
        "Was {V} ihr noch für die Party?",
        "Die Kinder {V} viel Schlaf und gutes Essen."
    ],
    54: [  # bezahlen
        "Ich {V} die Rechnung gerne mit Karte.",
        "Wie {V} du — bar oder per App?",
        "Er {V} immer das Essen für alle.",
        "Wir {V} den Eintritt an der Kasse.",
        "{V} ihr einzeln oder zusammen?",
        "Sie {V} die Miete immer pünktlich."
    ],
    55: [  # kosten
        "Ich frage mich, was das {V}.",
        "Wie viel {V} du für deine Wohnung?",
        "Das neue Handy {V} fast tausend Euro.",
        "Wir sehen, was es uns {V}.",
        "Wie viel {V} eure Flüge insgesamt?",
        "Die Bücher {V} zusammen dreißig Euro."
    ],
    56: [  # bestellen
        "Ich {V} mir jetzt einen Cappuccino.",
        "Was {V} du — das Tagesgericht?",
        "Er {V} seine Bücher immer online.",
        "Wir {V} Pizza und Salat für alle.",
        "Was {V} ihr — habt ihr schon gewählt?",
        "Sie {V} täglich frische Lebensmittel."
    ],
    57: [  # warten
        "Ich {V} schon seit einer Stunde hier.",
        "Auf wen {V} du draußen?",
        "Er {V} geduldig auf seinen Freund.",
        "Wir {V} auf den nächsten Bus.",
        "{V} ihr noch lange auf die Ergebnisse?",
        "Die Passagiere {V} ruhig am Gate."
    ],
    58: [  # suchen
        "Ich {V} meinen Haustürschlüssel überall.",
        "Was {V} du — eine Wohnung?",
        "Er {V} schon lange einen neuen Job.",
        "Wir {V} ein Restaurant in der Nähe.",
        "Was {V} ihr im Internet gerade?",
        "Sie {V} immer die beste Lösung."
    ],
    59: [  # besuchen
        "Ich {V} meine Großeltern jedes Wochenende.",
        "Wen {V} du diesen Sommer?",
        "Er {V} regelmäßig Museen in der Stadt.",
        "Wir {V} morgen die neue Ausstellung.",
        "Wen {V} ihr in den Ferien?",
        "Die Touristen {V} das Schloss jeden Tag."
    ],
    60: [  # leben
        "Ich {V} sehr gerne in dieser Stadt.",
        "Wie lange {V} du schon hier?",
        "Er {V} allein in einer kleinen Wohnung.",
        "Wir {V} sehr ruhig auf dem Land.",
        "{V} ihr noch in Berlin oder seid ihr umgezogen?",
        "Sie {V} sehr gesund und aktiv."
    ],
    61: [  # schicken
        "Ich {V} dir die Fotos heute noch.",
        "Wann {V} du den Brief ab?",
        "Er {V} seiner Familie täglich Nachrichten.",
        "Wir {V} das Paket morgen früh ab.",
        "{V} ihr uns eine Einladung?",
        "Sie {V} die Dokumente per E-Mail."
    ],
    62: [  # rufen
        "Ich {V} nach dem Arzt sofort.",
        "Warum {V} du so laut auf der Straße?",
        "Er {V} laut um Hilfe.",
        "Wir {V} gemeinsam den Kundendienst an.",
        "{V} ihr uns, wenn ihr ankommt?",
        "Die Kinder {V} fröhlich die Namen ihrer Freunde."
    ],
    63: [  # anrufen
        "Ich {V} dich heute Abend noch an.",
        "Wann {V} du deine Mutter an?",
        "Er {V} täglich seine Freundin an.",
        "Wir {V} den Kundendienst morgen an.",
        "{V} ihr uns, wenn ihr losfahrt?",
        "Sie {V} das Hotel an, um zu reservieren."
    ],
    64: [  # einladen
        "Ich {V} dich herzlich zu meiner Party ein.",
        "Wen {V} du zu deinem Geburtstag ein?",
        "Er {V} alle Kollegen zum Grillen ein.",
        "Wir {V} euch nächste Woche zum Essen ein.",
        "{V} ihr die ganzen Nachbarn ein?",
        "Sie {V} ihre Familie zu Weihnachten ein."
    ],
    65: [  # aufmachen
        "Ich {V} jeden Morgen das Fenster auf.",
        "Kannst du bitte die Tür {V}?",
        "Er {V} das Paket vorsichtig auf.",
        "Wir {V} das Café um 8 Uhr auf.",
        "{V} ihr bitte die Fenster?",
        "Sie {V} die Flaschen für die Gäste auf."
    ],
    66: [  # zumachen
        "Ich {V} die Tür leise hinter mir zu.",
        "Bitte {V} du das Fenster — es ist kalt.",
        "Er {V} das Buch und legt es weg.",
        "Wir {V} den Laden um 20 Uhr zu.",
        "{V} ihr eure Mappen nach der Stunde!",
        "Sie {V} ihren Koffer und sind bereit."
    ],
    67: [  # aufstehen
        "Ich {V} jeden Morgen um 6 Uhr auf.",
        "Wann {V} du normalerweise auf?",
        "Er {V} immer als Erster in der Familie auf.",
        "Wir {V} früh auf, um den Zug zu erwischen.",
        "{V} ihr auch so früh auf am Wochenende?",
        "Die Kinder {V} am Wochenende sehr spät auf."
    ],
    68: [  # einschlafen
        "Ich {V} sofort nach dem Lesen ein.",
        "Wann {V} du meistens ein?",
        "Er {V} beim Film auf dem Sofa ein.",
        "Wir {V} schnell nach dem langen Wandertag ein.",
        "{V} ihr gut oder braucht ihr lange?",
        "Die Kleinen {V} schnell in der Hängematte ein."
    ],
    69: [  # ankommen
        "Ich {V} morgen um 10 Uhr am Bahnhof an.",
        "Wann {V} du in Berlin an?",
        "Er {V} immer pünktlich bei der Arbeit an.",
        "Wir {V} nach sechs Stunden Fahrt an.",
        "Wann {V} ihr bei uns an?",
        "Die Gäste {V} alle um die gleiche Zeit an."
    ],
    70: [  # abfahren
        "Ich {V} morgen früh um 7 Uhr ab.",
        "Wann {V} du mit dem Zug ab?",
        "Der Zug {V} in zehn Minuten ab.",
        "Wir {V} pünktlich — alle sind fertig.",
        "Wann {V} ihr in Richtung Hamburg ab?",
        "Die Busse {V} alle zwanzig Minuten ab."
    ],
    71: [  # umsteigen
        "Ich {V} in Frankfurt um.",
        "Wo {V} du um — in München oder Nürnberg?",
        "Er {V} in Köln auf die S-Bahn um.",
        "Wir {V} zweimal, bevor wir ankommen.",
        "Wo {V} ihr auf die U-Bahn um?",
        "Die Fahrgäste {V} am Hauptbahnhof um."
    ],
    72: [  # einsteigen
        "Ich {V} vorne in den Bus ein.",
        "Wo {V} du in die U-Bahn ein?",
        "Er {V} am letzten Moment in den Zug ein.",
        "Wir {V} am Gleis 3 in den ICE ein.",
        "Wo {V} ihr ein — hier oder am Marktplatz?",
        "Die Fahrgäste {V} schnell in die Straßenbahn ein."
    ],
    73: [  # aussteigen
        "Ich {V} an der nächsten Haltestelle aus.",
        "Wo {V} du aus dem Bus aus?",
        "Er {V} am Hauptbahnhof aus dem Zug aus.",
        "Wir {V} alle gleichzeitig aus dem Taxi aus.",
        "Wo {V} ihr aus — am Markt oder danach?",
        "Die Touristen {V} direkt vor dem Museum aus."
    ],
    74: [  # mitbringen
        "Ich {V} dir etwas aus dem Urlaub mit.",
        "Was {V} du zur Party mit?",
        "Er {V} immer Blumen, wenn er besucht.",
        "Wir {V} einen Kuchen zum Treffen mit.",
        "Was {V} ihr zum Grillen mit?",
        "Sie {V} ihre Kinder zum Treffen mit."
    ],
    75: [  # mitkommen
        "Ich {V} gerne mit euch ins Kino mit.",
        "{V} du auch zum Konzert mit?",
        "Er {V} leider nicht mit — er ist krank.",
        "Wir {V} alle zusammen zur Party mit.",
        "{V} ihr morgen zum Picknick mit?",
        "Die Freunde {V} alle spontan mit."
    ],
    76: [  # weitergehen
        "Ich {V} jetzt weiter — bis später!",
        "Kannst du bitte {V} — du blockierst den Weg.",
        "Er {V} ruhig, ohne sich umzudrehen.",
        "Wir {V} noch ein Stück bis zum Café.",
        "{V} ihr oder wartet ihr hier auf uns?",
        "Die Gruppe {V} nach der Pause weiter."
    ],
    77: [  # wiederholen
        "Ich {V} die Vokabeln jeden Abend.",
        "Kannst du das bitte {V}? Ich habe es nicht gehört.",
        "Er {V} den Satz dreimal für die Klasse.",
        "Wir {V} die Grammatikregeln vor der Prüfung.",
        "{V} ihr bitte die Übung von gestern?",
        "Die Lehrerin {V} alles am Ende der Stunde."
    ],
    78: [  # verdienen
        "Ich {V} genug für meine Miete.",
        "Wie viel {V} du in deinem neuen Job?",
        "Er {V} sehr gut als Ingenieur.",
        "Wir {V} alle gleich viel im Team.",
        "Was {V} ihr stündlich als Studenten?",
        "Die Ärztin {V} mehr als der Durchschnitt."
    ],
    79: [  # versuchen
        "Ich {V} täglich, pünktlich zu sein.",
        "{V} du mal, das selbst zu reparieren?",
        "Er {V} ein neues Rezept in der Küche.",
        "Wir {V} die Aufgabe gemeinsam zu lösen.",
        "{V} ihr die neue App mal aus?",
        "Sie {V} immer, das Beste zu geben."
    ],
    80: [  # erklären
        "Ich {V} dir die Grammatik Schritt für Schritt.",
        "Kannst du mir {V}, wie das funktioniert?",
        "Er {V} der Klasse die Regel sehr klar.",
        "Wir {V} den Prozess den neuen Kollegen.",
        "{V} ihr uns bitte den Weg zur Haltestelle?",
        "Die Lehrerin {V} alles sehr geduldig."
    ],
    81: [  # erzählen
        "Ich {V} dir von meinem Urlaub.",
        "Was {V} du mir über deine Familie?",
        "Er {V} immer spannende Geschichten.",
        "Wir {V} uns Witze am Lagerfeuer.",
        "{V} ihr uns, was in der Schule passiert ist?",
        "Die Großeltern {V} den Kindern Märchen."
    ],
    82: [  # berichten
        "Ich {V} jetzt über meinen Aufenthalt.",
        "Worüber {V} du in deinem Aufsatz?",
        "Der Journalist {V} live von der Veranstaltung.",
        "Wir {V} dem Chef täglich über den Fortschritt.",
        "Worüber {V} ihr in der Präsentation?",
        "Sie {V} ausführlich über ihre Erfahrungen."
    ],
    83: [  # bedeuten
        "Ich frage, was das Wort {V}.",
        "Was {V} dieses Symbol für dich?",
        "Das Wort 'Fernweh' {V} Sehnsucht nach der Ferne.",
        "Wir fragen, was das für uns alle {V}.",
        "Was {V} diese Zeichen für euch?",
        "Manche Gesten {V} in anderen Kulturen etwas anderes."
    ],
    84: [  # gehören
        "Ich frage, wem das {V}.",
        "Wem {V} dieses schöne Fahrrad?",
        "Der Hund {V} unseren Nachbarn.",
        "Wir fragen, ob das alles uns {V}.",
        "Wem {V} diese Jacken hier?",
        "Diese Bücher {V} der Schulbibliothek."
    ],
    85: [  # gefallen
        "Ich sage, wie gut mir das {V}.",
        "Wie gut {V} dir das neue Konzept?",
        "Der Film {V} mir sehr gut.",
        "Wir sagen, wie gut uns das {V}.",
        "Wie gut {V} euch die neue Wohnung?",
        "Das Konzert {V} allen Besuchern sehr gut."
    ],
    86: [  # kennenlernen
        "Ich {V} heute meine neue Kollegin kennen.",
        "Wann {V} du deinen Partner kennen?",
        "Er {V} seine Frau auf einer Party kennen.",
        "Wir {V} viele interessante Menschen kennen.",
        "Wen {V} ihr auf dem Fest kennen?",
        "Sie {V} sich zufällig im Zug kennen."
    ],
    87: [  # vorstellen
        "Ich {V} mich kurz am Anfang vor.",
        "Kannst du dich bitte {V}?",
        "Er {V} sich der neuen Gruppe vor.",
        "Wir {V} uns alle der Runde vor.",
        "{V} ihr euch bitte kurz der Klasse?",
        "Die Teilnehmer {V} sich am Anfang vor."
    ],
    88: [  # aussehen
        "Ich {V} heute etwas müde aus.",
        "Wie {V} du heute — bist du krank?",
        "Er {V} sehr professionell im Anzug aus.",
        "Wir {V} alle ein bisschen erschöpft aus.",
        "Wie {V} ihr — habt ihr gut geschlafen?",
        "Die Wohnung {V} sehr modern und hell aus."
    ],
    89: [  # aufräumen
        "Ich {V} jeden Samstag mein Zimmer auf.",
        "Wann {V} du dein Zimmer auf?",
        "Er {V} die Küche nach dem Kochen auf.",
        "Wir {V} gemeinsam das Wohnzimmer auf.",
        "{V} ihr bitte euer Klassenzimmer auf!",
        "Die Kinder {V} nach dem Spielen auf."
    ],
    90: [  # waschen
        "Ich {V} jeden Abend mein Gesicht.",
        "Wann {V} du deine Wäsche?",
        "Er {V} sein Auto jeden Samstag.",
        "Wir {V} das Geschirr nach dem Essen.",
        "{V} ihr eure Kleidung selbst?",
        "Die Krankenschwestern {V} sich oft die Hände."
    ],
    91: [  # kochen
        "Ich {V} heute Abend Pasta für alle.",
        "Was {V} du gerne am Wochenende?",
        "Er {V} leidenschaftlich gerne italienisch.",
        "Wir {V} jeden Sonntag zusammen ein Mittagessen.",
        "Was {V} ihr heute — habt ihr schon eine Idee?",
        "Die Köchin {V} täglich für 50 Gäste."
    ],
    92: [  # backen
        "Ich {V} am Sonntag Brot für die Woche.",
        "Was {V} du für die Party?",
        "Er {V} jeden Freitag frische Brötchen.",
        "Wir {V} gemeinsam einen Geburtstagskuchen.",
        "Was {V} ihr für das Schulfest?",
        "Die Bäckerin {V} täglich viele Sorten Brot."
    ],
    93: [  # einkaufen
        "Ich {V} immer freitags für die ganze Woche.",
        "Wo {V} du am liebsten — im Supermarkt?",
        "Er {V} täglich frisches Obst und Gemüse.",
        "Wir {V} zusammen, um Zeit zu sparen.",
        "{V} ihr noch schnell für das Abendessen?",
        "Sie {V} jeden Samstag auf dem Wochenmarkt."
    ],
    94: [  # reisen
        "Ich {V} jedes Jahr in ein neues Land.",
        "Wohin {V} du dieses Jahr?",
        "Er {V} sehr gerne mit dem Rucksack.",
        "Wir {V} im Sommer nach Portugal.",
        "{V} ihr dieses Jahr ins Ausland?",
        "Sie {V} am liebsten mit dem Zug durch Europa."
    ],
    95: [  # fliegen
        "Ich {V} nächste Woche nach Tokyo.",
        "Wohin {V} du in den Ferien?",
        "Er {V} oft für die Arbeit nach London.",
        "Wir {V} direkt ohne Umstieg nach Kanada.",
        "{V} ihr oder nehmt ihr den Zug?",
        "Die Vögel {V} im Winter in den Süden."
    ],
    96: [  # schwimmen
        "Ich {V} dreimal pro Woche im Hallenbad.",
        "{V} du lieber im Meer oder im Pool?",
        "Er {V} sehr schnell über kurze Distanzen.",
        "Wir {V} jeden Sommer im See.",
        "{V} ihr noch oder seid ihr schon fertig?",
        "Die Kinder {V} begeistert im Freibad."
    ],
    97: [  # tanzen
        "Ich {V} leidenschaftlich gerne Tango.",
        "Was {V} du — Salsa oder Walzer?",
        "Er {V} sehr elegant auf der Bühne.",
        "Wir {V} jeden Freitag in der Tanzschule.",
        "{V} ihr auch auf dem Stadtfest?",
        "Die Paare {V} bis in die frühen Morgenstunden."
    ],
    98: [  # singen
        "Ich {V} jeden Morgen unter der Dusche.",
        "Welches Lied {V} du am liebsten?",
        "Er {V} wunderschön im Kirchenchor.",
        "Wir {V} gemeinsam Weihnachtslieder.",
        "{V} ihr alle zusammen den Refrain?",
        "Die Kinder {V} fröhlich im Schulchor."
    ],
    99: [  # malen
        "Ich {V} in meiner Freizeit gerne Landschaften.",
        "Was {V} du in deiner Freizeit?",
        "Er {V} abstrakte Bilder in leuchtenden Farben.",
        "Wir {V} zusammen ein großes Wandbild.",
        "{V} ihr noch oder seid ihr schon fertig?",
        "Die Kinder {V} bunte Bilder im Kunstunterricht."
    ],
    100: [  # fotografieren
        "Ich {V} gerne Architektur auf meinen Reisen.",
        "Was {V} du am liebsten?",
        "Er {V} professionell für Modemagazine.",
        "Wir {V} alle Sehenswürdigkeiten der Stadt.",
        "{V} ihr oder filmt ihr lieber?",
        "Die Touristinnen {V} alles mit ihren Handys."
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
    other_persons = [p for p in PERSONS if p != person]
    for op in other_persons[:2]:
        d = get_conjugation(verb, op, tense)
        if d != correct: distractors.add(d)
    other_tenses = [t for t in ["Präsens","Präteritum","Perfekt"] if t != tense]
    for ot in other_tenses:
        d = get_conjugation(verb, person, ot)
        if d != correct: distractors.add(d)
    inf = verb["verb"]
    stem = inf.rstrip("en").rstrip("n")
    for uml,base in {"ä":"a","ö":"o","ü":"u"}.items():
        stem = stem.replace(uml,base)
    sfx = {"ich":"te","du":"test","er":"te","wir":"ten","ihr":"tet","sie":"ten"}
    distractors.add(stem + sfx[person])
    distractors.discard(correct)
    distractors = list(distractors)[:3]
    fallbacks = ["machte","hatte","ging","war","wurde","konnte","spielte","lebte"]
    i = 0
    while len(distractors) < 3:
        if fallbacks[i] != correct and fallbacks[i] not in distractors:
            distractors.append(fallbacks[i])
        i = (i+1) % len(fallbacks)
        if i == 0: break
    return distractors[:3]

def tense_tip(tense, person, correct, verb_inf):
    pmap = {"ich":"1st sg","du":"2nd sg","er":"3rd sg","wir":"1st pl","ihr":"2nd pl","sie":"3rd pl"}
    tips = {
        "Präsens": f"**{verb_inf}** (Präsens, {pmap[person]}): **{correct}**. Used for present/habitual actions.",
        "Präteritum": f"**{verb_inf}** (Präteritum, {pmap[person]}): **{correct}**. Written/narrative past tense.",
        "Perfekt": f"**{verb_inf}** (Perfekt, {pmap[person]}): **{correct}**. Spoken past tense in German."
    }
    return tips[tense]

questions = []
q_id = 1001  # Batch 2 starts at VQ1001
TENSES = ["Präsens","Präteritum","Perfekt"]

for verb in ALL_VERBS:
    num = verb["num"]
    if num < 51 or num > 100: continue
    if num not in TMPL: continue

    tmpls = TMPL[num]

    for tense in TENSES:
        for i, person in enumerate(PERSONS):
            correct = get_conjugation(verb, person, tense)
            tmpl_str = tmpls[i]
            sentence_q = tmpl_str.replace("{V}", "_____")
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

    # 2 extra (ich + du Präsens)
    for extra_person in ["ich","du"]:
        tense = "Präsens"
        i = PERSONS.index(extra_person)
        correct = get_conjugation(verb, extra_person, tense)
        tmpl_str = tmpls[i]
        sentence_q = f"[{verb['english'].upper()}] — {tmpl_str.replace('{V}','_____')}"
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

print(f"Batch 2 generated: {len(questions)} questions")
out_path = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_mc_a1_2.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f"Saved to {out_path}")
