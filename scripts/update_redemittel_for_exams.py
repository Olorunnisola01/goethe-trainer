#!/usr/bin/env python3
"""
Update redemittel.json with additional exam-aligned phrases for A1, A2, B1.

Adds practical, high-frequency redemittel that are commonly tested or essential
for passing the Goethe-Zertifikat speaking sections at each level, based on
official exam models and standard prep materials.

- A1: More topic cards (Familie, Hobbys, Wohnen, Reisen) + richer request/response pairs for role-plays.
- A2: Narration of past events, simple planning/suggestions with reasons, gift/party planning dialogues (matches A2 Teil 2/3).
- B1: Richer "Gemeinsam etwas planen" variants (Wann/Wo/Absagen/Zusagen from official-style lists), presentation feedback & Q&A handling.

Only appends; does not remove or alter existing content.
"""

import json
from pathlib import Path

# === A1 ADDITIONS (exam-critical everyday topics + request variants) ===
A1_ADDITIONS = [
    {
        "cat": "Familie und Freunde",
        "en": "Family and Friends",
        "topic": "",
        "level": "A1",
        "phrases": [
            {"de": "Hast du Geschwister?", "en": "Do you have siblings?"},
            {"de": "Ich habe einen Bruder und eine Schwester.", "en": "I have one brother and one sister."},
            {"de": "Meine Eltern wohnen in ...", "en": "My parents live in ..."},
            {"de": "Ich habe einen Hund / eine Katze / kein Haustier.", "en": "I have a dog / a cat / no pet."},
            {"de": "Wir treffen uns oft am Wochenende.", "en": "We often meet at the weekend."},
            {"de": "Mein bester Freund / meine beste Freundin heißt ...", "en": "My best friend is called ..."},
            {"de": "Ich habe viele Freunde in der Schule / bei der Arbeit.", "en": "I have many friends at school / at work."},
            {"de": "Wie ist deine Familie?", "en": "What is your family like?"},
        ]
    },
    {
        "cat": "Hobbys und Freizeit",
        "en": "Hobbies and Free Time",
        "topic": "",
        "level": "A1",
        "phrases": [
            {"de": "Was machst du gern in deiner Freizeit?", "en": "What do you like to do in your free time?"},
            {"de": "Ich spiele gern Fußball / Tennis / Gitarre.", "en": "I like playing football / tennis / guitar."},
            {"de": "In meiner Freizeit lese ich Bücher / koche ich / höre ich Musik.", "en": "In my free time I read books / cook / listen to music."},
            {"de": "Ich treffe mich mit Freunden / gehe ins Kino.", "en": "I meet friends / go to the cinema."},
            {"de": "Am Wochenende schlafe ich lange / mache ich einen Ausflug.", "en": "At the weekend I sleep in / go on a trip."},
            {"de": "Mein Hobby ist ...", "en": "My hobby is ..."},
            {"de": "Ich habe nicht viel Freizeit, weil ich viel arbeite.", "en": "I don't have much free time because I work a lot."},
        ]
    },
    {
        "cat": "Wohnen und Zuhause",
        "en": "Living and Home",
        "topic": "",
        "level": "A1",
        "phrases": [
            {"de": "Ich wohne in einer Wohnung / einem Haus / einem Zimmer.", "en": "I live in a flat / a house / a room."},
            {"de": "Ich habe ein eigenes Zimmer.", "en": "I have my own room."},
            {"de": "Die Wohnung ist klein / groß / hell / günstig.", "en": "The flat is small / big / bright / cheap."},
            {"de": "Ich wohne in der Stadt / auf dem Land / in der Nähe vom Zentrum.", "en": "I live in the city / in the countryside / near the centre."},
            {"de": "Die Miete kostet ... Euro im Monat.", "en": "The rent is ... euros per month."},
            {"de": "Wo wohnst du?", "en": "Where do you live?"},
            {"de": "Ich suche eine neue Wohnung.", "en": "I am looking for a new flat."},
        ]
    },
    {
        "cat": "Reisen und Verkehrsmittel",
        "en": "Travel and Means of Transport",
        "topic": "",
        "level": "A1",
        "phrases": [
            {"de": "Ich fahre gern in den Urlaub / reise gern.", "en": "I like going on holiday / travelling."},
            {"de": "Letztes Jahr war ich in Spanien / Italien.", "en": "Last year I was in Spain / Italy."},
            {"de": "Ich nehme den Bus / die U-Bahn / den Zug / das Auto.", "en": "I take the bus / the underground / the train / the car."},
            {"de": "Wie komme ich zum Bahnhof / Flughafen?", "en": "How do I get to the station / airport?"},
            {"de": "Eine Fahrkarte nach Berlin, bitte.", "en": "A ticket to Berlin, please."},
            {"de": "Der Flug ist um ... Uhr.", "en": "The flight is at ... o'clock."},
            {"de": "Ich habe Gepäck / nur Handgepäck.", "en": "I have luggage / only hand luggage."},
        ]
    },
    {
        "cat": "Einfache Bitten und Reaktionen (Alltag)",
        "en": "Simple Requests and Reactions (Daily Life)",
        "topic": "",
        "level": "A1",
        "phrases": [
            {"de": "Können Sie mir bitte helfen?", "en": "Can you help me, please?"},
            {"de": "Haben Sie ...? / Gibt es ...?", "en": "Do you have ...? / Is there ...?"},
            {"de": "Ich hätte gern ... / Ich möchte ...", "en": "I would like ..."},
            {"de": "Kann ich das bitte haben? / Darf ich ...?", "en": "Can I have that, please? / May I ...?"},
            {"de": "Ja, gern. / Ja, natürlich. / Klar!", "en": "Yes, with pleasure. / Yes, of course. / Sure!"},
            {"de": "Nein, danke. / Leider nicht. / Das passt nicht.", "en": "No, thank you. / Unfortunately not."},
            {"de": "Das ist zu teuer. Haben Sie etwas Billigeres?", "en": "That is too expensive. Do you have something cheaper?"},
            {"de": "Entschuldigung, wo finde ich ...?", "en": "Excuse me, where can I find ...?"},
            {"de": "Könnten Sie das bitte wiederholen?", "en": "Could you please repeat that?"},
        ]
    },
]

# === A2 ADDITIONS (narration, planning dialogues, simple opinions — matches A2 exam dialogues) ===
A2_ADDITIONS = [
    {
        "cat": "Vergangenheit erzählen (Wochenende, Ausflug)",
        "en": "Talking about the Past (Weekend, Trip)",
        "topic": "",
        "level": "A2",
        "phrases": [
            {"de": "Letztes Wochenende bin ich ... gewesen.", "en": "Last weekend I went to ..."},
            {"de": "Zuerst habe ich ..., dann habe ich ... gemacht.", "en": "First I ..., then I did ..."},
            {"de": "Am Samstag war ich im Park / im Museum / bei Freunden.", "en": "On Saturday I was in the park / at the museum / with friends."},
            {"de": "Es hat viel Spaß gemacht. / Es war anstrengend / interessant.", "en": "It was a lot of fun. / It was tiring / interesting."},
            {"de": "Ich habe ein neues Restaurant / einen Film entdeckt.", "en": "I discovered a new restaurant / a film."},
            {"de": "Am Ende des Tages war ich müde, aber glücklich.", "en": "At the end of the day I was tired but happy."},
            {"de": "Ich habe viel gelernt / gesehen / erlebt.", "en": "I learned / saw / experienced a lot."},
        ]
    },
    {
        "cat": "Pläne machen und Vorschläge (A2)",
        "en": "Making Plans and Suggestions (A2)",
        "topic": "",
        "level": "A2",
        "phrases": [
            {"de": "Lass uns ins Kino / ins Restaurant / spazieren gehen.", "en": "Let's go to the cinema / to a restaurant / for a walk."},
            {"de": "Wie wäre es mit Samstag / mit einem Ausflug?", "en": "How about Saturday / a day trip?"},
            {"de": "Hast du Lust auf ...? / Was hältst du von ...?", "en": "Do you fancy ...? / What do you think of ...?"},
            {"de": "Das klingt super / gut / interessant!", "en": "That sounds great / good / interesting!"},
            {"de": "Leider habe ich keine Zeit, weil ich arbeiten muss.", "en": "Unfortunately I have no time because I have to work."},
            {"de": "Ein anderes Mal gern. / Vielleicht nächste Woche?", "en": "Another time with pleasure. / Maybe next week?"},
            {"de": "Ich bin einverstanden. / Okay, abgemacht!", "en": "I agree. / Okay, it's a deal!"},
            {"de": "Wann und wo treffen wir uns?", "en": "When and where shall we meet?"},
        ]
    },
    {
        "cat": "Feiern, Geschenke und Einladungen (A2)",
        "en": "Parties, Gifts and Invitations (A2)",
        "topic": "",
        "level": "A2",
        "phrases": [
            {"de": "Was schenkst du ... zum Geburtstag?", "en": "What are you giving ... for their birthday?"},
            {"de": "Ich lade dich zu meiner Party ein. Kommst du?", "en": "I'm inviting you to my party. Are you coming?"},
            {"de": "Ich bringe eine Flasche Wein / etwas zu essen mit.", "en": "I'll bring a bottle of wine / something to eat."},
            {"de": "Herzlichen Glückwunsch zum Geburtstag!", "en": "Happy birthday!"},
            {"de": "Vielen Dank für die Einladung. Ich komme gern.", "en": "Thank you very much for the invitation. I'd love to come."},
            {"de": "Ich kann leider nicht kommen, weil ...", "en": "Unfortunately I can't come because ..."},
            {"de": "Wir feiern im Restaurant / bei mir zu Hause.", "en": "We're celebrating at a restaurant / at my place."},
        ]
    },
    {
        "cat": "Einfache Meinungen und Begründungen (A2)",
        "en": "Simple Opinions and Reasons (A2)",
        "topic": "",
        "level": "A2",
        "phrases": [
            {"de": "Ich finde das gut / nicht so gut, weil ...", "en": "I think that's good / not so good, because ..."},
            {"de": "Meiner Meinung nach ist ... teuer / langweilig / praktisch.", "en": "In my opinion ... is expensive / boring / practical."},
            {"de": "Das gefällt mir (nicht), weil ...", "en": "I (don't) like that because ..."},
            {"de": "Ich mag ... lieber als ...", "en": "I prefer ... to ..."},
            {"de": "Das ist eine gute / schlechte Idee, finde ich.", "en": "That's a good / bad idea, I think."},
            {"de": "Warum? — Weil es ... ist.", "en": "Why? — Because it is ..."},
        ]
    },
]

# === B1 ADDITIONS (deeper "Gemeinsam planen" + feedback/Q&A — critical for B1 Sprechen Teil 1 & 2) ===
B1_ADDITIONS = [
    {
        "cat": "Gemeinsam planen – Was, Wann, Wo, Absagen & Zusagen",
        "en": "Planning Together – What, When, Where, Declining & Accepting",
        "topic": "",
        "level": "B1",
        "phrases": [
            {"de": "Was könnten wir machen? / Was denkst du, wenn wir ...?", "en": "What could we do? / What do you think if we ...?"},
            {"de": "Sollen wir ... oder lieber ...? Was hältst du davon?", "en": "Shall we ... or would you rather ...? What do you think?"},
            {"de": "Wie sieht es bei dir am Samstag / nächsten Wochenende aus?", "en": "How does Saturday / next weekend look for you?"},
            {"de": "Hättest du am Samstag um 14 Uhr Zeit? Wäre es für dich in Ordnung, wenn ...?", "en": "Would you have time on Saturday at 2 pm? Would it be okay for you if ...?"},
            {"de": "Am Samstag kann ich leider nicht – ich muss arbeiten / habe einen Termin.", "en": "Unfortunately I can't on Saturday – I have to work / have an appointment."},
            {"de": "Könnten wir es auf Sonntag / nächsten Dienstag verschieben?", "en": "Could we move it to Sunday / next Tuesday?"},
            {"de": "Sonntag klingt ganz gut! / Das ist eine super Idee! / Prima!", "en": "Sunday sounds good! / That's a great idea! / Great!"},
            {"de": "Das passt mir perfekt. / Das klappt! / Sehr gut, dann machen wir das so.", "en": "That suits me perfectly. / That works! / Very good, let's do it like that."},
            {"de": "Ich bin flexibel. / Für mich passt alles nach 16 Uhr.", "en": "I'm flexible. / Anything after 4 pm works for me."},
            {"de": "Einverstanden! / Abgemacht! / Dann bis Samstag!", "en": "Agreed! / It's a deal! / See you Saturday then!"},
            {"de": "Leider passt es mir nicht so gut, weil ...", "en": "Unfortunately it doesn't suit me so well because ..."},
            {"de": "Wie wäre es mit ... Uhr im Café / im Park / bei dir?", "en": "How about ... o'clock at the café / in the park / at your place?"},
        ]
    },
    {
        "cat": "Präsentationsfeedback geben und auf Fragen reagieren (B1)",
        "en": "Giving Presentation Feedback and Responding to Questions (B1)",
        "topic": "",
        "level": "B1",
        "phrases": [
            {"de": "Ich habe deinen Vortrag sehr interessant gefunden, weil ...", "en": "I found your presentation very interesting because ..."},
            {"de": "Ich wusste nicht, dass ... / Mich hat überrascht, dass ...", "en": "I didn't know that ... / I was surprised that ..."},
            {"de": "Die Präsentation war gut strukturiert / sehr informativ.", "en": "The presentation was well structured / very informative."},
            {"de": "Ich habe (aber) eine Frage: ...", "en": "I have (however) a question: ..."},
            {"de": "Könntest du bitte noch einmal erklären, warum / wie ...?", "en": "Could you please explain again why / how ...?"},
            {"de": "Danke für deine / Ihre Frage. Ich würde sagen, dass ...", "en": "Thank you for your question. I would say that ..."},
            {"de": "Das ist eine gute / interessante Frage! Dazu kann ich sagen: ...", "en": "That's a good / interesting question! I can say the following about it: ..."},
            {"de": "Es freut mich, dass es dir / Ihnen gefallen hat.", "en": "I'm glad you liked it."},
            {"de": "Vielen Dank für das interessante Feedback.", "en": "Thank you very much for the interesting feedback."},
            {"de": "Haben Sie / Hast du noch weitere Fragen?", "en": "Do you have any more questions?"},
        ]
    },
    {
        "cat": "Diskussion und Reagieren – Erweiterungen (B1)",
        "en": "Discussion and Reacting – Extensions (B1)",
        "topic": "",
        "level": "B1",
        "phrases": [
            {"de": "Da bin ich (nicht) ganz deiner / Ihrer Meinung, weil ...", "en": "I (don't) completely agree with you there, because ..."},
            {"de": "Allerdings muss man auch bedenken, dass ...", "en": "However, one must also consider that ..."},
            {"de": "Ein gutes Argument dafür / dagegen ist ...", "en": "A good argument for / against it is ..."},
            {"de": "Lass uns die Vor- und Nachteile noch einmal kurz zusammenfassen.", "en": "Let's briefly summarise the pros and cons again."},
            {"de": "Ich kann deinen Standpunkt verstehen, aber ...", "en": "I can understand your point of view, but ..."},
            {"de": "Ein Kompromiss wäre vielleicht ...", "en": "A compromise might be ..."},
        ]
    },
]

def main():
    src = Path("public/data/redemittel.json")
    if not src.exists():
        raise FileNotFoundError(f"Source not found: {src}")

    print("Loading current redemittel.json ...")
    with open(src, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Count before
    counts_before = {}
    for item in data:
        lvl = item.get("level")
        if lvl not in counts_before:
            counts_before[lvl] = {"cats": 0, "phrases": 0}
        counts_before[lvl]["cats"] += 1
        counts_before[lvl]["phrases"] += len(item.get("phrases", []))

    print("Before update:")
    for lvl in ["A1", "A2", "B1"]:
        c = counts_before.get(lvl, {"cats": 0, "phrases": 0})
        print(f"  {lvl}: {c['cats']} cats, {c['phrases']} phrases")

    # Append new categories at the end (simple and safe)
    additions_map = {
        "A1": A1_ADDITIONS,
        "A2": A2_ADDITIONS,
        "B1": B1_ADDITIONS,
    }

    added = {}
    for item in data:
        pass  # just to iterate once

    for lvl, new_cats in additions_map.items():
        for new_cat in new_cats:
            data.append(new_cat)
        added[lvl] = len(new_cats)

    # Write back (pretty-printed for readability/maintainability; valid JSON either way)
    with open(src, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("\nAdded new categories:")
    for lvl, n in added.items():
        print(f"  {lvl}: +{n} categories")

    # Verify counts after
    with open(src, "r", encoding="utf-8") as f:
        data2 = json.load(f)

    counts_after = {}
    for item in data2:
        lvl = item.get("level")
        if lvl not in counts_after:
            counts_after[lvl] = {"cats": 0, "phrases": 0}
        counts_after[lvl]["cats"] += 1
        counts_after[lvl]["phrases"] += len(item.get("phrases", []))

    print("\nAfter update:")
    for lvl in ["A1", "A2", "B1"]:
        c = counts_after.get(lvl, {"cats": 0, "phrases": 0})
        print(f"  {lvl}: {c['cats']} cats, {c['phrases']} phrases")

    print("\n[OK] redemittel.json successfully updated with exam-aligned additions.")
    print("     The website (and any quizzes using this file) will now include the new phrases.")
    print("     Backup the original if you want to revert: the script only appends.")

if __name__ == "__main__":
    main()
