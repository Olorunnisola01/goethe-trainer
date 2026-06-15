"""
Generates 2,000 Fill-in-the-Gap questions for all 200 verbs (10 per verb).
IDs start at VQ4001. Output: verbquiz_fitg.json

Strategy: For each verb, select 10 of the 18 base scenarios (6 persons × 3 tenses).
Priority: 2 Präsens (ich, du) + 2 Präsens (er, wir) + 2 Präteritum (ich, er) + 2 Perfekt (ich, wir) + 2 more.
The prompt shows the word with some letters blanked: e.g. "g__t" or "h_tt_".
"""
import json, random, re

with open(r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbs_data.json', 'r', encoding='utf-8') as f:
    ALL_VERBS = json.load(f)

PERSONS = ["ich","du","er","wir","ihr","sie"]
PERSON_LABELS = {"ich":"ich","du":"du","er":"er/sie/es","wir":"wir","ihr":"ihr","sie":"sie/Sie"}

IRREGULAR_NUMS = {
    1,2,3,4,5,6,7,8,9,11,12,14,15,16,17,18,19,20,21,22,23,27,28,29,30,31,32,
    39,40,41,46,47,49,50,51,52,62,63,64,67,68,69,70,71,72,73,74,75,76,85,88,
    90,92,95,96,98,118,119,120,127,128,130,136,137,138,139,140,142,143,144,
    146,147,148,150,159,160,161,165,172,173,176,177,178,179,189,190,191,196,197,198,200
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

def make_prompt(correct):
    """
    Create a partial display: keep first letter and last letter, blank middle letters.
    For multi-word Perfekt forms, handle the participle.
    Examples: "gegangen" → "g______n", "bin gegangen" → "bin g______n"
    Short words (≤3 chars): keep first + _ per missing.
    """
    words = correct.split()
    if len(words) == 2:
        # Perfekt form: aux + participle — reveal aux, mask participle
        aux = words[0]
        part = words[1]
        return f"{aux} {_mask_word(part)}"
    else:
        return _mask_word(correct)

def _mask_word(word):
    if len(word) <= 2:
        return word[0] + "_"
    elif len(word) == 3:
        return word[0] + "_" + word[-1]
    elif len(word) == 4:
        return word[0] + "__" + word[-1]
    else:
        # Keep first 1 and last 1, blank middle
        middle_len = len(word) - 2
        # Reveal every 3rd letter in middle for longer words
        middle = word[1:-1]
        masked = ""
        for idx, ch in enumerate(middle):
            if len(word) > 7 and idx % 3 == 1:
                masked += ch  # hint every 3rd
            else:
                masked += "_"
        return word[0] + masked + word[-1]

# Sentence templates — use same sentence banks from MC batches (condensed to one per verb)
# Format: [ich_tmpl, du_tmpl, er_tmpl, wir_tmpl, ihr_tmpl, sie_tmpl]
# {V} = conjugated verb

SENTENCE_BANKS = {
    # ---- A1 verbs 1-100 ----
    1:  ["Ich {V} heute sehr glücklich.", "Du {V} immer so ehrlich.", "Er {V} ein guter Lehrer.", "Wir {V} müde nach der Arbeit.", "Ihr {V} bereit für die Prüfung.", "Sie {V} sehr freundlich."],
    2:  ["Ich {V} leider keine Zeit.", "Du {V} viel Glück gehabt.", "Er {V} einen neuen Job.", "Wir {V} heute keine Hausaufgaben.", "Ihr {V} genug Geld.", "Sie {V} einen großen Garten."],
    3:  ["Ich {V} eines Tages Arzt.", "Du {V} bestimmt gut.", "Es {V} draußen dunkel.", "Wir {V} die Freunde nie vergessen.", "Ihr {V} gute Eltern.", "Die Äpfel {V} reif."],
    4:  ["Ich {V} nicht kommen.", "Du {V} gut Gitarre spielen.", "Er {V} kein Spanisch sprechen.", "Wir {V} das lösen.", "Ihr {V} früher gehen.", "Sie {V} sich kaum bewegen."],
    5:  ["Ich {V} noch lernen.", "Du {V} zum Arzt gehen.", "Er {V} früh aufstehen.", "Wir {V} den Bus nehmen.", "Ihr {V} die Aufgaben abgeben.", "Sie {V} lange arbeiten."],
    6:  ["Ich {V} nach Spanien reisen.", "Du {V} auch mitkommen.", "Er {V} Fußball spielen.", "Wir {V} ein Restaurant ausprobieren.", "Ihr {V} sicher Pizza essen.", "Sie {V} das Gespräch nicht fortsetzen."],
    7:  ["Ich {V} hier nicht parken.", "Du {V} länger aufbleiben.", "Er {V} kein Handy benutzen.", "Wir {V} kostenlos eintreten.", "Ihr {V} hier nicht rauchen.", "Die Kinder {V} fernsehen."],
    8:  ["Ich {V} den Brief abschicken.", "Du {V} helfen.", "Er {V} den Bericht fertigstellen.", "Wir {V} pünktlich sein.", "Ihr {V} leiser sprechen.", "Sie {V} das Formular ausfüllen."],
    9:  ["Ich {V} keinen Kaffee.", "Du {V} Schokolade sehr gerne.", "Er {V} keine laute Musik.", "Wir {V} dieses Restaurant.", "Ihr {V} klassische Musik.", "Sie {V} ihren Kollegen sehr."],
    10: ["Ich {V} täglich Sport.", "Was {V} du am Wochenende?", "Er {V} gute Witze.", "Wir {V} die Hausaufgaben.", "Was {V} ihr in den Ferien?", "Sie {V} eine Reise."],
    11: ["Ich {V} zu Fuß zur Arbeit.", "Wohin {V} du so früh?", "Er {V} zum Supermarkt.", "Wir {V} abends spazieren.", "Geht ihr morgen in die Schule?", "Die Kinder {V} in den Park."],
    12: ["Ich {V} aus Bayern.", "Woher {V} du?", "Er {V} immer zu spät.", "Wir {V} morgen Abend.", "Kommt ihr zur Feier?", "Die Gäste {V} pünktlich an."],
    13: ["Ich {V} dir die Wahrheit.", "Was {V} du gerade?", "Er {V} genau, was er denkt.", "Wir {V} Auf Wiedersehen.", "Was {V} ihr dazu?", "Sie {V} immer Danke."],
    14: ["Ich {V} einen tollen Film.", "Siehst du den Vogel?", "Er {V} schlecht ohne Brille.", "Wir {V} uns täglich.", "Saht ihr den Unfall?", "Sie {V} Licht am Ende."],
    15: ["Ich {V} dir meine Nummer.", "Gibst du mir bitte das?", "Er {V} der Katze Wasser.", "Wir {V} unseren Kindern Ratschläge.", "Gebt ihr uns eure Meinung?", "Die Lehrer {V} gute Noten."],
    16: ["Ich {V} den Zug um acht.", "Nimmst du dir Kuchen?", "Er {V} sich Zeit für Hobbys.", "Wir {V} ein Taxi.", "Nehmt ihr Bus oder U-Bahn?", "Sie {V} Medikamente täglich."],
    17: ["Ich {V} nicht, wo mein Schlüssel ist.", "Weißt du, wann der Zug fährt?", "Er {V} die Antwort.", "Wir {V} noch nicht, was wir kochen.", "Wisst ihr das schon?", "Sie {V} genau, was sie wollen."],
    18: ["Ich {V} oft an meine Kindheit.", "Was {V} du über das Gesetz?", "Er {V} positiv über die Zukunft.", "Wir {V} an alte Freunde.", "Was {V} ihr über den Chef?", "Sie {V} logisch."],
    19: ["Ich {V} das Buch sehr interessant.", "Wo {V} du deine Brille?", "Er {V} einen Geldbeutel.", "Wir {V} das Hotel schön.", "Wie {V} ihr die Wohnung?", "Sie {V} keinen Parkplatz."],
    20: ["Ich {V} fließend Deutsch.", "Sprichst du auch Französisch?", "Er {V} laut vor der Klasse.", "Wir {V} täglich miteinander.", "Sprecht ihr über Probleme?", "Sie {V} sehr leise."],
    21: ["Ich {V} Anna.", "Wie {V} du mit Nachnamen?", "Der Film {V} 'Das Leben der Anderen'.", "Wir {V} die Müller-Gruppe.", "Wie {V} eure Katzen?", "Die Straße {V} Goethestraße."],
    22: ["Ich {V} abends vor dem Schlafen.", "Was {V} du gerade?", "Er {V} die Zeitung früh.", "Wir {V} Geschichten.", "Lest ihr noch Zeitung?", "Sie {V} viel in der Freizeit."],
    23: ["Ich {V} einen Brief.", "Schreibst du mir deine Adresse?", "Er {V} einen Roman.", "Wir {V} täglich E-Mails.", "Schreibt ihr ins Heft?", "Die Studenten {V} Notizen."],
    24: ["Ich {V} seit fünf Jahren hier.", "Wo {V} du zurzeit?", "Er {V} sehr hart.", "Wir {V} zusammen als Team.", "Arbeitet ihr am Wochenende?", "Sie {V} als Ärztin."],
    25: ["Ich {V} im Zentrum.", "Wo {V} du jetzt?", "Er {V} seit Jahren in München.", "Wir {V} im Vorort.", "Wohnt ihr noch dort?", "Sie {V} direkt am Rhein."],
    26: ["Ich {V} frisches Brot.", "Was {V} du dir?", "Er {V} einen neuen Laptop.", "Wir {V} das Haus.", "Kauft ihr die Tickets online?", "Die Touristen {V} Souvenirs."],
    27: ["Ich {V} mit dem Fahrrad.", "Wohin {V} du im Sommer?", "Er {V} schnell auf der Autobahn.", "Wir {V} nach Hamburg.", "Fahrt ihr mit Auto oder Zug?", "Die Familie {V} nach Italien."],
    28: ["Ich {V} fünf Kilometer.", "Wie schnell {V} du?", "Er {V} durch den Park.", "Wir {V} zum Bahnhof.", "Lauft ihr beim Stadtlauf mit?", "Die Kinder {V} über die Wiese."],
    29: ["Ich {V} acht Stunden.", "Wie lange {V} du?", "Er {V} tief und fest.", "Wir {V} in Zelten.", "Schlaft ihr gut?", "Die Babys {V} tagsüber viel."],
    30: ["Ich {V} mittags warm.", "Was {V} du zum Frühstück?", "Er {V} sehr schnell.", "Wir {V} zusammen Kuchen.", "Was {V} ihr heute?", "Sie {V} gesund."],
    31: ["Ich {V} morgens Kaffee.", "Was {V} du am liebsten?", "Er {V} täglich Wasser.", "Wir {V} Wein zum Abendessen.", "Was {V} ihr auf der Party?", "Die Sportler {V} Isotonisches."],
    32: ["Ich {V} dir beim Umzug.", "Hilfst du mir kurz?", "Er {V} seinen Nachbarn.", "Wir {V} bei der Aufgabe.", "Helft ihr beim Aufbau?", "Die Freiwilligen {V} vielen."],
    33: ["Ich {V} den Lehrer.", "Warum {V} du nicht nach dem Weg?", "Er {V} um einen freien Tag.", "Wir {V} nach der Meinung.", "Fragt ihr die Auskunft?", "Die Schüler {V} viel."],
    34: ["Ich {V} auf E-Mails schnell.", "Bitte {V} du auf die Frage!", "Er {V} klar und höflich.", "Wir {V} auf die Einladung.", "Antwortet ihr bis Ende der Woche?", "Die Schüler {V} kaum."],
    35: ["Ich {V} Deutsch seit sechs Monaten.", "Was {V} du in der Schule?", "Er {V} täglich Vokabeln.", "Wir {V} für die Prüfung.", "Lernt ihr für den Test?", "Die Studenten {V} fleißig."],
    36: ["Ich {V} nach der Schule Fußball.", "Was {V} du gerne?", "Er {V} Klavier.", "Wir {V} Schach.", "Spielt ihr heute draußen?", "Die Kinder {V} im Garten."],
    37: ["Ich {V} beim Joggen Podcasts.", "Was {V} du gerade?", "Er {V} Radio.", "Wir {V} keine Geräusche.", "Hört ihr gut?", "Die Nachbarn {V} laute Musik."],
    38: ["Ich {V} dir die Stadt.", "Zeigst du mir das?", "Er {V} uns den Weg.", "Wir {V} euch die Wohnung.", "Zeigt ihr uns den Ausweis?", "Die Lehrerin {V} die Lösung."],
    39: ["Ich {V} in der Schlange.", "Wo {V} du gerade?", "Er {V} auf dem Balkon.", "Wir {V} vor einer Entscheidung.", "Warum {V} ihr noch?", "Die Bücher {V} im Regal."],
    40: ["Ich {V} am Strand.", "Wo {V} du?", "Das Buch {V} auf dem Tisch.", "Wir {V} auf der Wiese.", "Liegt ihr schon?", "Die Schlüssel {V} auf der Kommode."],
    41: ["Ich {V} vor dem Computer.", "Wo {V} du am liebsten?", "Er {V} am Fenster.", "Wir {V} am Tisch.", "Sitzt ihr schon?", "Die Katzen {V} auf dem Heizkörper."],
    42: ["Ich {V} die Vase auf den Tisch.", "Wohin {V} du das Fahrrad?", "Er {V} das Gepäck in den Flur.", "Wir {V} den Weihnachtsbaum.", "Wo {V} ihr den Fernseher?", "Sie {V} Blumen auf jeden Tisch."],
    43: ["Ich {V} die Zeitung auf den Tisch.", "Wohin {V} du das Buch?", "Er {V} das Baby ins Bett.", "Wir {V} Decken auf die Couch.", "Wo {V} ihr eure Mäntel?", "Sie {V} das Geld hin."],
    44: ["Ich {V} mich ans Fenster.", "Wohin {V} du dich?", "Er {V} sich in die erste Reihe.", "Wir {V} uns in die Sonne.", "Setzt euch bitte!", "Sie {V} die Kinder ans Tischende."],
    45: ["Ich {V} das Fenster.", "Kannst du die Tür öffnen?", "Er {V} das Paket.", "Wir {V} das Geschäft.", "Öffnet ihr das Buch?", "Der Arzt {V} das Wartezimmer."],
    46: ["Ich {V} die Tür.", "Bitte {V} das Fenster!", "Der Laden {V} um 20 Uhr.", "Wir {V} den Vertrag.", "Schließt eure Bücher!", "Sie {V} das Büro um sechs."],
    47: ["Ich {V} heute mit Training.", "Wann {V} du mit dem Studium?", "Der Film {V} um 20 Uhr.", "Wir {V} das Projekt.", "Wann {V} ihr mit der Renovierung?", "Die Vorlesung {V} pünktlich."],
    48: ["Ich {V} meinen Vortrag.", "Wann {V} du deinen Arbeitstag?", "Das Konzert {V} nach drei Stunden.", "Wir {V} die Sitzung.", "Wann {V} ihr das Meeting?", "Die Serie {V} mit einer Überraschung."],
    49: ["Ich {V} heute Abend zu Hause.", "Wie lange {V} du noch?", "Er {V} ruhig.", "Wir {V} das ganze Wochenende.", "Bleibt ihr noch?", "Sie {V} immer optimistisch."],
    50: ["Ich {V} dir das Buch zurück.", "Was {V} du uns mit?", "Er {V} Kaffee für die Kollegen.", "Wir {V} einen Kuchen.", "Bringt ihr bitte die Stühle?", "Die Eltern {V} die Kinder zur Schule."],
    # ---- A1 verbs 51-100 ----
    51: ["Ich {V} diese Stadt.", "Kennst du diesen Schauspieler?", "Er {V} viele Leute.", "Wir {V} uns seit der Kindheit.", "Kennt ihr den Nachbarn?", "Sie {V} fast alle Sprachen."],
    52: ["Ich {V} diesen Satz nicht.", "Verstehst du ihn?", "Er {V} kein Japanisch.", "Wir {V} das Problem.", "Versteht ihr die Aufgabe?", "Sie {V} sich gut."],
    53: ["Ich {V} Hilfe beim Umzug.", "Was {V} du für die Reise?", "Er {V} täglich Kaffee.", "Wir {V} mehr Zeit.", "Was {V} ihr noch?", "Die Kinder {V} viel Schlaf."],
    54: ["Ich {V} mit Karte.", "Wie {V} du — bar?", "Er {V} immer das Essen.", "Wir {V} den Eintritt.", "Bezahlt ihr einzeln?", "Sie {V} die Miete pünktlich."],
    55: ["Ich frage, was das {V}.", "Wie viel {V} du?", "Das Handy {V} tausend Euro.", "Wir sehen, was es {V}.", "Wie viel {V} eure Flüge?", "Die Bücher {V} dreißig Euro."],
    56: ["Ich {V} mir einen Cappuccino.", "Was {V} du?", "Er {V} seine Bücher online.", "Wir {V} Pizza.", "Was {V} ihr?", "Sie {V} frische Lebensmittel."],
    57: ["Ich {V} seit einer Stunde.", "Auf wen {V} du?", "Er {V} geduldig.", "Wir {V} auf den Bus.", "Wartet ihr lange?", "Die Passagiere {V} ruhig."],
    58: ["Ich {V} meinen Schlüssel.", "Was {V} du?", "Er {V} einen Job.", "Wir {V} ein Restaurant.", "Was {V} ihr im Internet?", "Sie {V} die beste Lösung."],
    59: ["Ich {V} meine Großeltern.", "Wen {V} du im Sommer?", "Er {V} Museen.", "Wir {V} die Ausstellung.", "Wen {V} ihr in den Ferien?", "Die Touristen {V} das Schloss."],
    60: ["Ich {V} gerne in dieser Stadt.", "Wie lange {V} du schon hier?", "Er {V} allein.", "Wir {V} ruhig auf dem Land.", "Lebt ihr noch in Berlin?", "Sie {V} gesund."],
    61: ["Ich {V} dir die Fotos.", "Wann {V} du den Brief?", "Er {V} täglich Nachrichten.", "Wir {V} das Paket ab.", "Schickt ihr uns eine Einladung?", "Sie {V} Dokumente per E-Mail."],
    62: ["Ich {V} nach dem Arzt.", "Warum {V} du so laut?", "Er {V} laut um Hilfe.", "Wir {V} den Kundendienst.", "Ruft ihr uns an?", "Die Kinder {V} die Namen."],
    63: ["Ich {V} dich heute Abend an.", "Wann {V} du deine Mutter an?", "Er {V} täglich seine Freundin an.", "Wir {V} den Kundendienst an.", "Ruft ihr uns an?", "Sie {V} das Hotel an."],
    64: ["Ich {V} dich herzlich ein.", "Wen {V} du ein?", "Er {V} alle Kollegen ein.", "Wir {V} euch zum Essen ein.", "Ladet ihr die Nachbarn ein?", "Sie {V} ihre Familie ein."],
    65: ["Ich {V} jeden Morgen das Fenster auf.", "Kannst du die Tür aufmachen?", "Er {V} das Paket auf.", "Wir {V} das Café auf.", "Macht ihr die Fenster auf?", "Sie {V} die Flaschen auf."],
    66: ["Ich {V} die Tür zu.", "Machst du das Fenster zu?", "Er {V} das Buch zu.", "Wir {V} den Laden zu.", "Macht eure Mappen zu!", "Sie {V} den Koffer zu."],
    67: ["Ich {V} um 6 Uhr auf.", "Wann {V} du auf?", "Er {V} als Erster auf.", "Wir {V} früh auf.", "Steht ihr am Wochenende früh auf?", "Die Kinder {V} spät auf."],
    68: ["Ich {V} sofort ein.", "Wann {V} du ein?", "Er {V} beim Film ein.", "Wir {V} schnell ein.", "Schläft ihr gut ein?", "Die Kleinen {V} schnell ein."],
    69: ["Ich {V} um 10 Uhr an.", "Wann {V} du in Berlin an?", "Er {V} pünktlich an.", "Wir {V} nach sechs Stunden an.", "Wann {V} ihr an?", "Die Gäste {V} gleichzeitig an."],
    70: ["Ich {V} um 7 Uhr ab.", "Wann {V} du ab?", "Der Zug {V} gleich ab.", "Wir {V} pünktlich ab.", "Wann {V} ihr ab?", "Die Busse {V} alle zwanzig Minuten ab."],
    71: ["Ich {V} in Frankfurt um.", "Wo {V} du um?", "Er {V} in Köln um.", "Wir {V} zweimal um.", "Wo {V} ihr um?", "Die Fahrgäste {V} am Hauptbahnhof um."],
    72: ["Ich {V} vorne ein.", "Wo {V} du ein?", "Er {V} in letzter Minute ein.", "Wir {V} am Gleis 3 ein.", "Wo {V} ihr ein?", "Die Fahrgäste {V} schnell ein."],
    73: ["Ich {V} an der nächsten Haltestelle aus.", "Wo {V} du aus?", "Er {V} am Hauptbahnhof aus.", "Wir {V} gleichzeitig aus.", "Wo {V} ihr aus?", "Die Touristen {V} vor dem Museum aus."],
    74: ["Ich {V} dir etwas mit.", "Was {V} du mit?", "Er {V} immer Blumen mit.", "Wir {V} einen Kuchen mit.", "Was {V} ihr mit?", "Sie {V} ihre Kinder mit."],
    75: ["Ich {V} gerne mit.", "Kommst du auch mit?", "Er {V} leider nicht mit.", "Wir {V} alle mit.", "Kommt ihr morgen mit?", "Die Freunde {V} alle mit."],
    76: ["Ich {V} jetzt weiter.", "Kannst du bitte weitergehen?", "Er {V} ruhig weiter.", "Wir {V} noch ein Stück weiter.", "Geht ihr weiter?", "Die Gruppe {V} weiter."],
    77: ["Ich {V} die Vokabeln.", "Kannst du das wiederholen?", "Er {V} den Satz dreimal.", "Wir {V} die Regeln.", "Wiederholt ihr die Übung?", "Die Lehrerin {V} alles."],
    78: ["Ich {V} genug für die Miete.", "Wie viel {V} du?", "Er {V} sehr gut.", "Wir {V} alle gleich viel.", "Was {V} ihr stündlich?", "Die Ärztin {V} mehr als der Schnitt."],
    79: ["Ich {V} täglich pünktlich zu sein.", "Versuchst du das selbst?", "Er {V} ein neues Rezept.", "Wir {V} die Aufgabe zu lösen.", "Versucht ihr die App?", "Sie {V} das Beste zu geben."],
    80: ["Ich {V} dir die Grammatik.", "Kannst du mir das erklären?", "Er {V} der Klasse die Regel.", "Wir {V} den Kollegen.", "Erklärt ihr uns den Weg?", "Die Lehrerin {V} alles geduldig."],
    81: ["Ich {V} dir von meinem Urlaub.", "Was {V} du mir?", "Er {V} spannende Geschichten.", "Wir {V} uns Witze.", "Erzählt ihr, was passiert ist?", "Die Großeltern {V} Märchen."],
    82: ["Ich {V} jetzt über meinen Aufenthalt.", "Worüber {V} du?", "Der Journalist {V} live.", "Wir {V} dem Chef.", "Worüber {V} ihr?", "Sie {V} ausführlich."],
    83: ["Ich frage, was das Wort {V}.", "Was {V} dieses Symbol?", "Das Wort {V} Sehnsucht.", "Wir fragen, was das {V}.", "Was {V} diese Zeichen?", "Manche Gesten {V} anderes."],
    84: ["Ich frage, wem das {V}.", "Wem {V} dieses Fahrrad?", "Der Hund {V} unseren Nachbarn.", "Wir fragen, ob das uns {V}.", "Wem {V} diese Jacken?", "Diese Bücher {V} der Bibliothek."],
    85: ["Ich sage, wie gut mir das {V}.", "Wie {V} dir das?", "Der Film {V} mir sehr gut.", "Wir sagen, wie gut uns das {V}.", "Wie {V} euch die Wohnung?", "Das Konzert {V} allen gut."],
    86: ["Ich {V} heute meine Kollegin kennen.", "Wann {V} du deinen Partner kennen?", "Er {V} seine Frau kennen.", "Wir {V} viele Menschen kennen.", "Wen {V} ihr kennen?", "Sie {V} sich im Zug kennen."],
    87: ["Ich {V} mich kurz vor.", "Stellst du dich bitte vor?", "Er {V} sich der Gruppe vor.", "Wir {V} uns alle vor.", "Stellt euch der Klasse vor!", "Die Teilnehmer {V} sich vor."],
    88: ["Ich {V} heute müde aus.", "Wie {V} du aus?", "Er {V} sehr professionell aus.", "Wir {V} alle erschöpft aus.", "Wie {V} ihr aus?", "Die Wohnung {V} modern aus."],
    89: ["Ich {V} mein Zimmer auf.", "Wann {V} du dein Zimmer auf?", "Er {V} die Küche auf.", "Wir {V} das Wohnzimmer auf.", "Räumt ihr auf!", "Die Kinder {V} nach dem Spielen auf."],
    90: ["Ich {V} mein Gesicht.", "Wann {V} du deine Wäsche?", "Er {V} sein Auto.", "Wir {V} das Geschirr.", "Wascht ihr eure Kleidung?", "Die Krankenschwestern {V} ihre Hände."],
    91: ["Ich {V} heute Pasta.", "Was {V} du am Wochenende?", "Er {V} leidenschaftlich.", "Wir {V} jeden Sonntag.", "Was {V} ihr heute?", "Die Köchin {V} für 50 Gäste."],
    92: ["Ich {V} am Sonntag Brot.", "Was {V} du für die Party?", "Er {V} Brötchen.", "Wir {V} einen Kuchen.", "Was {V} ihr?", "Die Bäckerin {V} viele Sorten."],
    93: ["Ich {V} freitags ein.", "Wo {V} du am liebsten?", "Er {V} frisches Obst.", "Wir {V} zusammen.", "Kauft ihr noch ein?", "Sie {V} auf dem Markt."],
    94: ["Ich {V} jedes Jahr.", "Wohin {V} du dieses Jahr?", "Er {V} gerne mit Rucksack.", "Wir {V} nach Portugal.", "Reist ihr ins Ausland?", "Sie {V} mit dem Zug."],
    95: ["Ich {V} nach Tokyo.", "Wohin {V} du?", "Er {V} oft nach London.", "Wir {V} direkt nach Kanada.", "Fliegt ihr oder nehmt ihr den Zug?", "Die Vögel {V} in den Süden."],
    96: ["Ich {V} dreimal pro Woche.", "Schwimmst du im Meer?", "Er {V} sehr schnell.", "Wir {V} im See.", "Schwimmt ihr noch?", "Die Kinder {V} im Freibad."],
    97: ["Ich {V} Tango.", "Was {V} du?", "Er {V} elegant.", "Wir {V} in der Tanzschule.", "Tanzt ihr auf dem Fest?", "Die Paare {V} bis in die Nacht."],
    98: ["Ich {V} unter der Dusche.", "Was {V} du am liebsten?", "Er {V} im Chor.", "Wir {V} Weihnachtslieder.", "Singt ihr den Refrain?", "Die Kinder {V} im Schulchor."],
    99: ["Ich {V} Landschaften.", "Was {V} du?", "Er {V} abstrakte Bilder.", "Wir {V} ein Wandbild.", "Malt ihr noch?", "Die Kinder {V} bunte Bilder."],
    100:["Ich {V} Architektur.", "Was {V} du?", "Er {V} für Modemagazine.", "Wir {V} die Sehenswürdigkeiten.", "Fotografiert ihr?", "Die Touristinnen {V} mit Handys."],
    # ---- A2 verbs 101-200 ----
    101:["Ich {V} immer bei guten Witzen.", "Warum {V} du so laut?", "Er {V} herzlich.", "Wir {V} alle zusammen.", "Lacht ihr oft zusammen?", "Die Kinder {V} fröhlich."],
    102:["Ich {V} beim traurigen Film.", "Warum {V} du?", "Er {V} still.", "Wir {V} alle bei der Zeremonie.", "Weint ihr bei Filmen?", "Sie {V} vor Freude."],
    103:["Ich {V} mich auf das Konzert.", "Worüber {V} du dich?", "Er {V} sich über das Geschenk.", "Wir {V} uns über euren Besuch.", "Worüber {V} ihr euch?", "Sie {V} sich über Aufmerksamkeiten."],
    104:["Ich {V} mich sehr wohl.", "Wie {V} du dich?", "Er {V} sich viel besser.", "Wir {V} uns wohl.", "Wie {V} ihr euch?", "Sie {V} sich stärker."],
    105:["Ich {V} mich, um pünktlich zu sein.", "Beeile dich bitte!", "Er {V} sich.", "Wir {V} uns.", "Beeilt euch!", "Sie {V} sich."],
    106:["Ich {V} mich ans Fenster.", "Bitte setz dich!", "Er {V} sich in den Liegestuhl.", "Wir {V} uns in den Schatten.", "Setzt euch!", "Die Gäste {V} sich ans Feuer."],
    107:["Ich {V} mir das vor.", "Kannst du dir das vorstellen?", "Er {V} sich als Nächster vor.", "Wir {V} uns eine Reise vor.", "Könnt ihr euch das vorstellen?", "Sie {V} sich eine bessere Zukunft vor."],
    108:["Ich {V} mein Fahrrad täglich.", "Benutzt du diese App?", "Er {V} öffentliche Verkehrsmittel.", "Wir {V} das neue Programm.", "Benutzt ihr Wörterbücher?", "Die Studenten {V} die Bibliothek."],
    109:["Ich {V} das Hotel im Voraus.", "Hast du den Flug gebucht?", "Er {V} einen Tisch.", "Wir {V} das Ferienhaus.", "Bucht ihr Pauschalreisen?", "Sie {V} Wellnessurlaube."],
    110:["Ich {V} einen Tisch.", "Hast du schon reserviert?", "Er {V} immer früh.", "Wir {V} eine Suite.", "Reserviert ihr Karten?", "Sie {V} den Konferenzsaal."],
    111:["Ich {V} abends mit meiner Mutter.", "Mit wem {V} du?", "Er {V} stundenlang.", "Wir {V} wöchentlich.", "Telefoniert ihr noch?", "Sie {V} ständig."],
    112:["Ich hoffe, dass mein Plan {V}.", "Funktioniert dein Laptop?", "Das WLAN {V} nicht.", "Wir hoffen, dass alles {V}.", "Funktioniert eure App?", "Die Heizung {V} nicht."],
    113:["Ich frage, was hier {V}.", "Was {V} dir?", "Ein Unfall {V} gestern.", "Wir beobachten, was {V}.", "Was {V} euch?", "Solche Fehler {V} manchmal."],
    114:["Ich {V} Informatik.", "Was {V} du?", "Er {V} Physik.", "Wir {V} an derselben Uni.", "Studiert ihr auf Bachelor?", "Die Austauschstudenten {V} in Wien."],
    115:["Ich {V} Deutsch.", "Welche Fächer {V} du?", "Sie {V} Mathematik.", "Wir {V} gemeinsam.", "Unterrichtet ihr online?", "Die Lehrerinnen {V} die neuen Klassen."],
    116:["Ich {V} täglich mit Zahlen.", "Rechnest du das schnell?", "Er {V} im Kopf.", "Wir {V} die Kosten.", "Rechnet ihr das Budget?", "Die Buchhalter {V} täglich."],
    117:["Ich {V} die Einladungen.", "Zählst du die Stühle?", "Er {V} die Münzen.", "Wir {V} die Stimmen.", "Zählt ihr die Gäste?", "Die Kassiererin {V} das Wechselgeld."],
    118:["Ich {V} meinen Blutdruck.", "Hast du die Temperatur gemessen?", "Er {V} den Raum.", "Wir {V} die Abstände.", "Messt ihr den Regen?", "Die Ärztin {V} die Körpergröße."],
    119:["Ich {V} mich jeden Montag.", "Wie viel wiegst du?", "Das Paket {V} fünf Kilo.", "Wir {V} die Zutaten.", "Wiegt ihr das Gepäck?", "Der Händler {V} das Gemüse."],
    120:["Ich {V} das Gemüse.", "Kannst du das Brot schneiden?", "Er {V} sich in den Finger.", "Wir {V} den Kuchen.", "Schneidet ihr Haare selbst?", "Die Friseurin {V} präzise."],
    121:["Ich {V} das Buch zusammen.", "Was {V} du auf das Papier?", "Er {V} das Plakat an.", "Wir {V} die Fotos.", "Klebt ihr Briefmarken?", "Die Kinder {V} Formen."],
    122:["Ich {V} Porträts.", "Was {V} du?", "Er {V} technische Pläne.", "Wir {V} eine Karte.", "Zeichnet ihr Diagramme?", "Die Architektin {V} Baupläne."],
    123:["Ich {V} sehr schnell.", "Kannst du das tippen?", "Er {V} die ganze Nacht.", "Wir {V} gleichzeitig.", "Tippt ihr auf Laptops?", "Die Sekretärin {V} alle Protokolle."],
    124:["Ich {V} das Dokument.", "Kannst du das drucken?", "Er {V} täglich Berichte.", "Wir {V} alle Unterlagen.", "Druckt ihr die Präsentation?", "Die Druckerei {V} Flyer."],
    125:["Ich {V} die neue App herunter.", "Hast du die Datei heruntergeladen?", "Er {V} Filme herunter.", "Wir {V} die Software.", "Ladet ihr das Update herunter?", "Die Schüler {V} Materialien herunter."],
    126:["Ich {V} die Fotos hoch.", "Hast du das Video hochgeladen?", "Er {V} neue Inhalte hoch.", "Wir {V} alle Dateien hoch.", "Ladet ihr die Bilder hoch?", "Die Studenten {V} Hausarbeiten hoch."],
    127:["Ich {V} das Interview auf.", "Nimmst du das Konzert auf?", "Er {V} Videos auf.", "Wir {V} das Gespräch auf.", "Nehmt ihr den Podcast auf?", "Die Produzentinnen {V} das Album auf."],
    128:["Ich {V} selten fern.", "Was {V} du gerade?", "Er {V} nach der Arbeit fern.", "Wir {V} freitags zusammen.", "Seht ihr noch linear fern?", "Die Familie {V} das Finale zusammen."],
    129:["Ich {V} mit Rauchen auf.", "Wann {V} du endlich auf?", "Es {V} auf zu regnen.", "Wir {V} mit dem Streit auf.", "Hört mit dem Lärm auf!", "Sie {V} mit dem Sport auf."],
    130:["Ich {V} heute an.", "Wann {V} du an?", "Er {V} einen neuen Job an.", "Wir {V} erst im Februar an.", "Wann {V} ihr an?", "Die Kurse {V} pünktlich an."],
    131:["Ich {V} eine Reise vor.", "Was {V} du vor?", "Er {V} viel vor.", "Wir {V} ein Fest vor.", "Was {V} ihr vor?", "Sie {V} eine Karriere vor."],
    132:["Ich {V} meinen Kindern vor.", "Kannst du den Satz vorlesen?", "Er {V} Kurzgeschichten vor.", "Wir {V} abwechselnd vor.", "Lest ihr den Eltern vor?", "Die Bibliothekarin {V} Märchen vor."],
    133:["Ich {V} noch einmal nach.", "Fragst du nach, ob der Termin gilt?", "Er {V} beim Kunden nach.", "Wir {V} bei der Schule nach.", "Fragt ihr beim Vermieter nach?", "Sie {V} immer nach."],
    134:["Ich {V} Texte.", "Kannst du das übersetzen?", "Er {V} medizinische Dokumente.", "Wir {V} den Brief.", "Übersetzt ihr den Text?", "Die Dolmetscherin {V} simultan."],
    135:["Ich {V} meine E-Mails.", "Kannst du den Text überprüfen?", "Er {V} alle Dokumente.", "Wir {V} die Qualität.", "Überprüft ihr die Zahlen?", "Die Prüferin {V} alle Antworten."],
    136:["Ich {V} durch Sport ab.", "Wie viel {V} du ab?", "Er {V} fünf Kilo ab.", "Wir {V} alle ab.", "Nehmt ihr durch Training ab?", "Sie {V} ungewollt ab."],
    137:["Ich {V} im Winter zu.", "Hast du zugenommen?", "Er {V} durch Medikamente zu.", "Wir {V} im Urlaub zu.", "Nehmt ihr zu?", "Die Touristenzahl {V} zu."],
    138:["Ich {V} in einem Dorf auf.", "Wo {V} du auf?", "Er {V} mehrsprachig auf.", "Wir {V} in derselben Straße auf.", "Wo {V} ihr auf?", "Die Kinder {V} zweisprachig auf."],
    139:["Ich {V} freitags aus.", "Wo {V} du am Wochenende aus?", "Er {V} kaum noch aus.", "Wir {V} samstags aus.", "Geht ihr heute aus?", "Sie {V} oft aus."],
    140:["Ich {V} nächste Woche zurück.", "Wann {V} du zurück?", "Er {V} spät zurück.", "Wir {V} gemeinsam zurück.", "Wann {V} ihr zurück?", "Die Expedition {V} zurück."],
    141:["Ich {V} mich auf die Prüfung vor.", "Wie {V} du dich vor?", "Er {V} die Präsentation vor.", "Wir {V} alles vor.", "Bereitet ihr euch vor?", "Die Köchin {V} das Menü vor."],
    142:["Ich {V} am Marathon teil.", "Nimmst du am Kurs teil?", "Er {V} an Seminaren teil.", "Wir {V} am Workshop teil.", "Nehmt ihr am Wettbewerb teil?", "Viele Studenten {V} teil."],
    143:["Das Konzert {V} im Freien statt.", "Wann {V} das Fest statt?", "Der Kurs {V} montags statt.", "Die Meetings {V} online statt.", "Wann {V} eure Hochzeit statt?", "Die Veranstaltung {V} trotz Regen statt."],
    144:["Ich {V} wichtige Termine.", "Hast du den Schlüssel vergessen?", "Er {V} den Schirm im Bus.", "Wir {V} nie die Freundschaft.", "Habt ihr den Termin vergessen?", "Sie {V} nie ein Gesicht."],
    145:["Ich {V} mich an meine erste Reise.", "Erinnerst du dich noch?", "Er {V} sich an jedes Detail.", "Wir {V} uns gerne.", "Erinnert ihr euch?", "Sie {V} sich an alle Namen."],
    146:["Ich {V} immer meinen Schlüssel.", "Hast du dein Handy verloren?", "Er {V} das Spiel.", "Wir {V} den Anschluss nicht.", "Verliert ihr nie euren Optimismus?", "Das Team {V} das Finale."],
    147:["Ich {V} selten.", "Hast du bei der Lotterie gewonnen?", "Er {V} den ersten Preis.", "Wir {V} das Turnier.", "Gewinnt ihr manchmal?", "Die Mannschaft {V} das Finale."],
    148:["Ich {V} für Gerechtigkeit.", "Wofür {V} du?", "Er {V} für seine Überzeugungen.", "Wir {V} gegen Unrecht.", "Wofür {V} ihr?", "Die Aktivisten {V} für Klimaschutz."],
    149:["Ich {V} meine Privatsphäre.", "Wie {V} du deine Daten?", "Er {V} die Kinder.", "Wir {V} die Umwelt.", "Wie {V} ihr eure Daten?", "Die Creme {V} die Haut."],
    150:["Ich {V} eine Sommerjacke.", "Was {V} du zur Feier?", "Er {V} das Gepäck.", "Wir {V} Verantwortung.", "Tragt ihr Schuluniformen?", "Die Träger {V} die Möbel."],
    151:["Ich {V} die Gäste herzlich.", "Wie {V} du Feedback?", "Er {V} täglich E-Mails.", "Wir {V} die Delegation.", "Empfangt ihr Besucher?", "Die Rezeptionistin {V} alle Gäste."],
    152:["Ich {V} mein Kommen an.", "Wann {V} du deinen Besuch an?", "Er {V} seinen Rücktritt an.", "Wir {V} die Veranstaltung an.", "Kündigt ihr das an?", "Die Firma {V} neue Stellen an."],
    153:["Ich {V} den Termin ab.", "Musst du wirklich absagen?", "Er {V} das Meeting ab.", "Wir {V} die Party ab.", "Sagt ihr auch ab?", "Sie {V} die Veranstaltung ab."],
    154:["Ich {V} dir für deine Hilfe.", "Wem {V} du?", "Er {V} den Helfern.", "Wir {V} allen Beteiligten.", "Dankt ihr euren Eltern?", "Die Gewinnerin {V} ihrem Team."],
    155:["Ich {V} mich für mein Verhalten.", "Entschuldigst du dich?", "Er {V} sich für die Verspätung.", "Wir {V} uns für das Missverständnis.", "Entschuldigt ihr euch?", "Sie {V} sich aufrichtig."],
    156:["Ich {V} alle Gäste.", "Wie {V} du Fremde?", "Er {V} seinen Freund herzlich.", "Wir {V} die neuen Mitglieder.", "Begrüßt ihr auf Deutsch?", "Die Gastgeberin {V} jeden."],
    157:["Ich {V} mich herzlich.", "Wie {V} du dich?", "Er {V} sich weinend.", "Wir {V} uns am Bahnhof.", "Wie {V} ihr euch?", "Sie {V} sich nach drei Jahren."],
    158:["Ich {V} nächsten Sommer.", "Wann {V} du?", "Er {V} seine Jugendliebe.", "Wir {V} im kleinen Kreis.", "Heiratet ihr bald?", "Sie {V} in einer Kapelle."],
    159:["Ich {V} mein erstes Kind.", "Wann {V} du?", "Sie {V} Zwillinge.", "Wir freuen uns, dass sie {V}.", "Habt ihr schon geboren?", "Sie {V} ein gesundes Mädchen."],
    160:["Ich hoffe, niemand {V}.", "Woran {V} du fast?", "Der Hund {V} friedlich.", "Wir trauern um alle, die {V}.", "Habt ihr gehört, wer {V}?", "Viele Pflanzen {V} bei wenig Wasser."],
    161:["Ich {V} an meinen Erfahrungen.", "Wie schnell {V} du als Kind?", "Der Baum {V} jeden Sommer.", "Wir {V} als Team.", "Wachsen eure Kinder schnell?", "Die Stadt {V} jedes Jahr."],
    162:["Ich {V} meinen Plan.", "Was {V} du?", "Er {V} seine Meinung.", "Wir {V} die Uhrzeit.", "Ändert ihr den Plan?", "Die Firma {V} die Öffnungszeiten."],
    163:["Ich {V} mein Deutsch.", "Wie {V} du deine Kenntnisse?", "Er {V} seinen Aufsatz.", "Wir {V} ständig unsere Prozesse.", "Verbessert ihr eure Noten?", "Die Wissenschaftler {V} die Technologie."],
    164:["Ich {V} auf meine Tasche auf.", "Passt du auf die Kinder auf?", "Er {V} auf seine Gesundheit auf.", "Wir {V} aufeinander auf.", "Passt ihr auf das Gepäck auf?", "Die Eltern {V} auf die Kinder auf."],
    165:["Ich {V} Wasser und Snacks mit.", "Was {V} du mit?", "Er {V} seinen Hund mit.", "Wir {V} Essen mit.", "Nehmt ihr das Zelt mit?", "Die Schüler {V} ihre Bücher mit."],
    166:["Ich {V} die Blumen hin.", "Wohin {V} du das Regal?", "Er {V} das Fahrrad hin.", "Wir {V} die Stühle hin.", "Stellt ihr den Baum hin?", "Sie {V} die Tassen hin."],
    167:["Ich {V} das Buch hin.", "Wohin {V} du deine Sachen?", "Er {V} das Baby hin.", "Wir {V} die Decken hin.", "Legt ihr Jacken hin?", "Sie {V} Dokumente hin."],
    168:["Ich {V} am See spazieren.", "Gehst du gerne spazieren?", "Er {V} mit dem Hund spazieren.", "Wir {V} im Park spazieren.", "Geht ihr gerne spazieren?", "Die Familie {V} am Rhein spazieren."],
    169:["Ich {V} fünf Kilometer.", "Wie oft {V} du?", "Er {V} täglich.", "Wir {V} für den Marathon.", "Joggt ihr auch bei Regen?", "Die Gruppe {V} durch den Wald."],
    170:["Ich {V} im Fitnessstudio.", "Wie oft {V} du?", "Er {V} intensiv.", "Wir {V} täglich.", "Trainiert ihr für den Marathon?", "Die Athleten {V} sechs Stunden."],
    171:["Ich {V} das Wörterbuch.", "Brauchst du noch Hilfe?", "Er {V} altes Werkzeug.", "Wir {V} das Programm.", "Gebraucht ihr noch das alte Gerät?", "Die Handwerker {V} professionelles Werkzeug."],
    172:["Ich {V} die Miete pünktlich.", "Hast du das Geld überwiesen?", "Er {V} den Betrag.", "Wir {V} in Raten.", "Überweist ihr das Gehalt?", "Die Firma {V} Gehälter am Monatsende."],
    173:["Ich {V} dreihundert Euro ab.", "Wie viel {V} du ab?", "Er {V} sein Erspartes ab.", "Wir {V} genug ab.", "Hebt ihr lieber Bargeld ab?", "Sie {V} monatlich ab."],
    174:["Ich {V} auf mein Sparkonto ein.", "Wie viel {V} du ein?", "Er {V} seinen Bonus ein.", "Wir {V} gemeinsam ein.", "Zahlt ihr in eine Altersvorsorge ein?", "Die Kunden {V} am Schalter ein."],
    175:["Ich {V} das Formular aus.", "Kannst du das Formular ausfüllen?", "Er {V} den Antrag aus.", "Wir {V} die Bögen aus.", "Füllt ihr die Unterlagen aus?", "Die Bewerber {V} alle Felder aus."],
    176:["Ich {V} den Vertrag.", "Kannst du hier unterschreiben?", "Er {V} den Mietvertrag.", "Wir {V} alle Dokumente.", "Unterschreibt ihr schon?", "Die Beteiligten {V} feierlich."],
    177:["Ich {V} die Hausarbeit ab.", "Hast du deine Prüfung abgegeben?", "Er {V} das Paket ab.", "Wir {V} den Bericht ab.", "Gebt ihr die Schlüssel ab?", "Die Schüler {V} ihre Arbeiten ab."],
    178:["Ich {V} nach links ab.", "Wo {V} du ab?", "Er {V} falsch ab.", "Wir {V} an der Kirche ab.", "Wo {V} ihr ab?", "Das Taxi {V} links ab."],
    179:["Ich {V} in die Gasse ein.", "Wo {V} du ein?", "Er {V} in die Seitenstraße ein.", "Wir {V} in die Einbahnstraße ein.", "Biegt ihr dort ein?", "Das Auto {V} in die Zufahrt ein."],
    180:["Ich {V} die Straße bei Grün.", "Wo {V} du am sichersten?", "Er {V} die Straße mit dem Kinderwagen.", "Wir {V} die Brücke.", "Überquert ihr die Kreuzung?", "Die Fußgänger {V} vorsichtig."],
    181:["Ich {V} in der Tiefgarage.", "Wo {V} du?", "Er {V} vor dem Eingang.", "Wir {V} hinter dem Haus.", "Parkt ihr hier?", "Die Besucher {V} kostenpflichtig."],
    182:["Ich {V} immer rechtzeitig.", "Wo {V} du?", "Er {V} volltanken.", "Wir {V} vor der Autobahn.", "Tankt ihr noch?", "Sie {V} Super E10."],
    183:["Ich {V} mein Fahrrad selbst.", "Wer {V} das?", "Er {V} alte Uhren.", "Wir {V} das Auto selbst.", "Repariert ihr das Dach?", "Die Mechaniker {V} das Fahrzeug."],
    184:["Ich {V} das Badezimmer.", "Wann {V} du deine Wohnung?", "Er {V} die Fenster.", "Wir {V} die Küche.", "Putzt ihr eure Zimmer?", "Die Reinigungskraft {V} täglich."],
    185:["Ich {V} meine Hemden.", "Wie oft {V} du?", "Er {V} seine Hemden selbst.", "Wir {V} abwechselnd.", "Bügelt ihr alles?", "Die Helfer {V} alle Stücke."],
    186:["Ich {V} meine eigenen Kleider.", "Kannst du nähen?", "Sie {V} ein Kostüm.", "Wir {V} Dekoration.", "Näht ihr eure Kostüme?", "Die Schneiderin {V} Anzüge."],
    187:["Ich {V} meiner Oma einen Schal.", "Was {V} du?", "Sie {V} wunderschöne Muster.", "Wir {V} im Strickkreis.", "Strickt ihr selbst?", "Die Frauen {V} warme Sachen."],
    188:["Ich {V} jedes Wochenende.", "Was {V} du?", "Er {V} Spare Ribs.", "Wir {V} am Samstag.", "Grillt ihr auch?", "Die Familie {V} zusammen."],
    189:["Ich {V} alles auf.", "Kannst du deinen Teller aufessen?", "Er {V} den Kuchen auf.", "Wir {V} alles auf.", "Esst ihr alles auf?", "Die Kinder {V} ihre Lieblingsspeise auf."],
    190:["Ich {V} mein Glas aus.", "Trinkst du das aus?", "Er {V} die Flasche aus.", "Wir {V} den Saft aus.", "Trinkt ihr aus?", "Die Gäste {V} ihre Gläser aus."],
    191:["Ich {V} ohne Wecker auf.", "Wann {V} du auf?", "Er {V} von einem Geräusch auf.", "Wir {V} alle auf.", "Wann {V} ihr auf?", "Die Kinder {V} früh auf."],
    192:["Ich {V} jeden Morgen.", "Wie lange {V} du?", "Er {V} nach dem Training.", "Wir {V} abwechselnd.", "Duscht ihr morgens?", "Die Sportler {V} nach dem Training."],
    193:["Ich {V} abends in der Badewanne.", "Wann {V} du die Kinder?", "Er {V} entspannt.", "Wir {V} die Kleinen.", "Badet ihr im Meer?", "Die Kinder {V} nach dem Strand."],
    194:["Ich {V} mich für besondere Anlässe.", "Wie lange {V} du dich?", "Sie {V} sich für das Theater.", "Wir {V} uns für den Karneval.", "Schminkt ihr euch?", "Die Schauspielerinnen {V} sich."],
    195:["Ich {V} mir die Haare.", "Wann {V} du?", "Er {V} dem Kind die Haare.", "Wir {V} uns schnell.", "Kämmt ihr euch?", "Die Mutter {V} die langen Haare."],
    196:["Ich {V} mir etwas Warmes an.", "Was {V} du an?", "Er {V} sich den Mantel an.", "Wir {V} uns warm an.", "Zieht ihr euch an?", "Die Kinder {V} sich selbst an."],
    197:["Ich {V} mir die nassen Schuhe aus.", "Was {V} du zuerst aus?", "Er {V} sich den Rucksack aus.", "Wir {V} uns die Jacken aus.", "Zieht ihr Schuhe aus?", "Die Kinder {V} sich aus."],
    198:["Ich {V} vor Schreck auf.", "Warum {V} du so laut?", "Er {V} vor Freude.", "Wir {V} alle beim Horrorfilm.", "Schreit ihr beim Fußball?", "Die Fans {V} nach dem Sieg."],
    199:["Ich {V} dir etwas ins Ohr.", "Warum {V} du so leise?", "Er {V} das Geheimnis.", "Wir {V} im Lesesaal.", "Warum {V} ihr?", "Die Kinder {V} kichernd."],
    200:["Ich {V} dich um einen Gefallen.", "Wen {V} du um Hilfe?", "Er {V} höflich um Verlängerung.", "Wir {V} alle pünktlich zu kommen.", "Bittet ihr um Erlaubnis?", "Sie {V} um mehr Erklärung."],
}

# Which 10 scenarios to use per verb (indices: person_idx * 3 + tense_idx)
# person order: ich=0,du=1,er=2,wir=3,ihr=4,sie=5
# tense order: Präsens=0, Präteritum=1, Perfekt=2
# Mapping: scenario = person_idx * 3 + tense_idx
# Priority selection: ich-Präs, du-Präs, er-Präs, wir-Präs, ich-Prät, er-Prät, ich-Perf, wir-Perf, ihr-Präs, sie-Präs
SCENARIO_PRIORITY = [
    (0, "Präsens"), (1, "Präsens"), (2, "Präsens"), (3, "Präsens"),
    (0, "Präteritum"), (2, "Präteritum"),
    (0, "Perfekt"), (3, "Perfekt"),
    (4, "Präsens"), (5, "Präsens")
]

def tense_tip(tense, person, correct, verb_inf):
    pmap = {"ich":"1st sg","du":"2nd sg","er":"3rd sg","wir":"1st pl","ihr":"2nd pl","sie":"3rd pl"}
    tips = {
        "Präsens": f"**{verb_inf}** (Präsens, {pmap[person]}): **{correct}**.",
        "Präteritum": f"**{verb_inf}** (Präteritum, {pmap[person]}): **{correct}**. Narrative past tense.",
        "Perfekt": f"**{verb_inf}** (Perfekt, {pmap[person]}): **{correct}**. Spoken past tense."
    }
    return tips[tense]

questions = []
q_id = 4001

for verb in ALL_VERBS:
    num = verb["num"]
    if num not in SENTENCE_BANKS:
        continue
    bank = SENTENCE_BANKS[num]

    for (p_idx, tense) in SCENARIO_PRIORITY:
        person = PERSONS[p_idx]
        correct = get_conjugation(verb, person, tense)
        tmpl_str = bank[p_idx]
        sentence_full = tmpl_str.replace("{V}", correct)
        sentence_q = tmpl_str.replace("{V}", f"[{verb['verb']}]")
        prompt = make_prompt(correct)

        questions.append({
            "id": f"VQ{q_id:04d}",
            "level": verb["level"],
            "verbType": verb_type(num),
            "tense": tense,
            "format": "Fill-in-the-Gap",
            "verb": verb["verb"],
            "person": PERSON_LABELS[person],
            "q": f"{sentence_q}\n(→ Ergänze die richtige Form von „{verb['verb']}\" — Tense: {tense}, Person: {PERSON_LABELS[person]})",
            "prompt": prompt,
            "correct": correct,
            "sentence": sentence_full,
            "ch": "Verb Conjugation",
            "tip": tense_tip(tense, person, correct, verb['verb'])
        })
        q_id += 1

print(f"Batch 5 (FITG) generated: {len(questions)} questions")
out_path = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\scripts\verbquiz_fitg.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f"Saved to {out_path}")
