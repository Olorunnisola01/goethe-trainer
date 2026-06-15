# -*- coding: utf-8 -*-
import json

FILE = 'public/data/grammar.json'

rows = [
    ["**Fragewort**", "**Frage** *(Deutsch / English)*", "**Antwort** *(Deutsch / English)*"],
    # WOHIN
    ["**wohin** *(where to)*", "Wohin gehen Sie? *(Where are you going?)*", "Ich gehe nach Hause. *(I am going home.)*"],
    ["**wohin**", "Wohin fährst du im Urlaub? *(Where are you going on holiday?)*", "Ich fahre nach Spanien. *(I am going to Spain.)*"],
    ["**wohin**", "Wohin gehst du heute Abend? *(Where are you going tonight?)*", "Ich gehe ins Kino. *(I am going to the cinema.)*"],
    ["**wohin**", "Wohin reist ihr diesen Sommer? *(Where are you travelling this summer?)*", "Wir reisen nach Italien. *(We are travelling to Italy.)*"],
    # WOHER
    ["**woher** *(where from)*", "Woher kommen Sie? *(Where do you come from?)*", "Ich komme aus Nigeria / Deutschland / Peru. *(I come from ...)*"],
    ["**woher**", "Woher hast du das? *(Where did you get that?)*", "Ich habe es vom Supermarkt. *(I got it from the supermarket.)*"],
    ["**woher**", "Woher kennst du ihn? *(How do you know him?)*", "Ich kenne ihn aus der Schule. *(I know him from school.)*"],
    ["**woher**", "Woher weißt du das? *(How do you know that?)*", "Ich habe es im Internet gelesen. *(I read it on the internet.)*"],
    # WIE
    ["**wie** *(how / what)*", "Wie heißen Sie? *(What is your name?)*", "Ich heiße Thomas / Anna / Maria. *(My name is ...)*"],
    ["**wie**", "Wie ist Ihr Vorname? *(What is your first name?)*", "Mein Vorname ist Anna. *(My first name is Anna.)*"],
    ["**wie**", "Wie ist Ihr Nachname? *(What is your last name?)*", "Mein Nachname ist Müller. *(My last name is Müller.)*"],
    ["**wie**", "Wie geht es Ihnen? *(How are you? – formal)*", "Gut, danke. Und Ihnen? *(Fine, thank you. And you?)*"],
    ["**wie**", "Wie geht es dir? *(How are you? – informal)*", "Es geht mir gut / nicht so gut. *(I am fine / not so well.)*"],
    ["**wie**", "Wie ist Ihre Handynummer? *(What is your mobile number?)*", "Meine Handynummer ist 0176 123 456. *(My number is ...)*"],
    ["**wie**", "Wie ist Ihr Familienstand? *(What is your marital status?)*", "Ich bin ledig / verheiratet / geschieden. *(I am single / married / divorced.)*"],
    ["**wie**", "Wie buchstabiert man das? *(How do you spell that?)*", "P-E-T-R-A / A-N-N-A. *(Spelling out the name.)*"],
    ["**wie**", "Wie alt bist du? *(How old are you?)*", "Ich bin 25 Jahre alt. *(I am 25 years old.)*"],
    ["**wie**", "Wie komme ich zum Bahnhof? *(How do I get to the station?)*", "Gehen Sie geradeaus, dann links. *(Go straight, then left.)*"],
    ["**wie**", "Wie lange dauert die Fahrt? *(How long does the journey take?)*", "Die Fahrt dauert zwei Stunden. *(Two hours.)*"],
    # WAS
    ["**was** *(what)*", "Was sind Sie von Beruf? *(What is your profession?)*", "Ich bin Lehrerin / Arzt / Koch von Beruf. *(I am a teacher / doctor / cook.)*"],
    ["**was**", "Was ist das? *(What is that?)*", "Das ist ein Buch / eine Katze. *(That is a book / a cat.)*"],
    ["**was**", "Was machst du am Wochenende? *(What are you doing at the weekend?)*", "Ich besuche meine Familie. *(I am visiting my family.)*"],
    ["**was**", "Was hast du gestern gegessen? *(What did you eat yesterday?)*", "Ich habe Pizza gegessen. *(I ate pizza.)*"],
    ["**was**", "Was lernst du gerade? *(What are you learning right now?)*", "Ich lerne Deutsch. *(I am learning German.)*"],
    ["**was**", "Was kostet ein Ticket? *(How much does a ticket cost?)*", "Ein Ticket kostet 3,50 Euro. *(A ticket costs 3.50 euros.)*"],
    ["**was**", "Was ist dein Hobby? *(What is your hobby?)*", "Mein Hobby ist Lesen / Kochen / Reisen. *(Reading / cooking / travelling.)*"],
    ["**was**", "Was für Musik magst du? *(What kind of music do you like?)*", "Ich mag Popmusik / Jazz / Klassik. *(Pop / jazz / classical.)*"],
    ["**was**", "Was hast du heute vor? *(What are your plans for today?)*", "Ich gehe einkaufen. *(I am going shopping.)*"],
    # WO
    ["**wo** *(where – location)*", "Wo wohnen Sie? *(Where do you live?)*", "Ich wohne in Berlin / Hamburg / Madrid. *(I live in ...)*"],
    ["**wo**", "Wo ist die nächste Apotheke? *(Where is the nearest pharmacy?)*", "Die Apotheke ist um die Ecke. *(Around the corner.)*"],
    ["**wo**", "Wo bist du geboren? *(Where were you born?)*", "Ich bin in München geboren. *(I was born in Munich.)*"],
    ["**wo**", "Wo arbeitest du? *(Where do you work?)*", "Ich arbeite in einem Krankenhaus. *(I work in a hospital.)*"],
    ["**wo**", "Wo ist mein Handy? *(Where is my phone?)*", "Es liegt auf dem Tisch. *(It is on the table.)*"],
    ["**wo**", "Wo treffen wir uns? *(Where shall we meet?)*", "Wir treffen uns am Bahnhof. *(At the station.)*"],
    # WER
    ["**wer** *(who)*", "Wer ist das? *(Who is that?)*", "Das ist meine Mutter / meine Tochter Anna. *(That is my mother / my daughter Anna.)*"],
    ["**wer**", "Wer kommt zur Party? *(Who is coming to the party?)*", "Meine Freunde kommen. *(My friends are coming.)*"],
    ["**wer**", "Wer hat das gesagt? *(Who said that?)*", "Das hat Anna gesagt. *(Anna said that.)*"],
    ["**wer**", "Wer ist an der Tür? *(Who is at the door?)*", "Das ist der Postbote. *(That is the postman.)*"],
    # WANN
    ["**wann** *(when)*", "Wann beginnt der Unterricht? *(When does the lesson begin?)*", "Der Unterricht beginnt um 9 Uhr. *(At 9 o'clock.)*"],
    ["**wann**", "Wann bist du geboren? *(When were you born?)*", "Ich bin am 5. März 1995 geboren. *(On 5 March 1995.)*"],
    ["**wann**", "Wann kommt der Zug? *(When does the train arrive?)*", "Der Zug kommt um 14:30 Uhr. *(At 14:30.)*"],
    ["**wann**", "Wann hast du Zeit? *(When are you free?)*", "Ich habe am Donnerstag Zeit. *(On Thursday.)*"],
    # WARUM
    ["**warum** *(why)*", "Warum lernst du Deutsch? *(Why are you learning German?)*", "Ich lerne Deutsch für die Arbeit / das Studium. *(For work / studies.)*"],
    ["**warum**", "Warum bist du müde? *(Why are you tired?)*", "Ich habe schlecht geschlafen. *(I slept badly.)*"],
    ["**warum**", "Warum kommst du zu spät? *(Why are you late?)*", "Der Bus hatte Verspätung. *(The bus was delayed.)*"],
    ["**warum**", "Warum magst du das nicht? *(Why don't you like that?)*", "Das schmeckt mir nicht. *(I don't like the taste.)*"],
    # WIE VIEL / WIE VIELE
    ["**wie viel** *(how much)*", "Wie viel kostet das? *(How much does that cost?)*", "Das kostet zehn Euro. *(That costs ten euros.)*"],
    ["**wie viel**", "Wie viel Uhr ist es? *(What time is it?)*", "Es ist halb drei. *(It is half past two.)*"],
    ["**wie viele** *(how many)*", "Wie viele Kinder haben Sie? *(How many children do you have?)*", "Ich habe zwei Kinder. *(I have two children.)*"],
    ["**wie viele**", "Wie viele Sprachen sprichst du? *(How many languages do you speak?)*", "Ich spreche drei Sprachen. *(I speak three languages.)*"],
    # WELCHER / WELCHE
    ["**welcher/welche** *(which)*", "Welchen Bus muss ich nehmen? *(Which bus do I need to take?)*", "Sie müssen den Bus Nummer 7 nehmen. *(Bus number 7.)*"],
    ["**welche**", "Welche Sprachen sprichst du? *(Which languages do you speak?)*", "Ich spreche Deutsch, Englisch und Spanisch. *(German, English and Spanish.)*"],
]

new_section = {
    "title": "9.4 W-Fragen – 50 Practical Q&A Pairs",
    "intro": (
        "These 50 real-life question-and-answer pairs cover all major W-question words. "
        "Each row shows the question word, the German question with its English meaning, "
        "and a model answer. Practice by covering the **Antwort** column and answering aloud."
    ),
    "tables": [rows],
    "examples": []
}

with open(FILE, encoding='utf-8-sig') as f:
    data = json.load(f)

# Remove any previously added 9.4 section to avoid duplicates
for ch in data:
    if ch['ch'] == 'Question Words':
        ch['sections'] = [s for s in ch['sections'] if '9.4' not in s['title']]
        ch['sections'].append(new_section)
        print(f"Sections now: {[s['title'] for s in ch['sections']]}")
        print(f"Table rows: {len(ch['sections'][-1]['tables'][0])}")
        break

with open(FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done.")
