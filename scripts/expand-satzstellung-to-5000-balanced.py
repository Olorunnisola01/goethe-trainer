"""
Expand Satzstellung pool to exactly 5000 with balanced distribution:
  A1: 2500
  A2: 1500
  B1: 500
  B2: 500

Generates rich, varied items per topic (Thema) so that filtering by a single Thema
still gives the user a large practice pool (hundreds for main topics).

Run after restoring the base ~830:
  python scripts/gen_sentence_order.py
  python scripts/gen_sentence_order_ext.py
  node scripts/add-b2-satzstellung.js
  python scripts/expand-satzstellung-to-5000-balanced.py

Then the UI badge and "gesamt" text should be updated to 5000.
"""

import json
import random
import os
import re
from collections import Counter, defaultdict

random.seed(424242)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT, 'public', 'data', 'sentence_order.json')

TARGET = {
    'A1': 2500,
    'A2': 1500,
    'B1': 500,
    'B2': 500,
}

def sid(n):
    return f"SO{n:04d}"

def tokenize_correct(s):
    return re.findall(r"[\wäöüÄÖÜß]+|[^\w\s]", s) or s.split()

def scramble(tokens):
    t = list(tokens)
    for _ in range(30):
        random.shuffle(t)
        if t != tokens:
            return t
    return list(reversed(tokens))

def make_entry(n, level, topic, tokens_correct, correct, tip, structure):
    scrambled = scramble(tokens_correct)
    return {
        "id": sid(n),
        "level": level,
        "topic": topic,
        "words": scrambled,
        "answer": tokens_correct,
        "correct": correct,
        "tip": tip,
        "structure": structure,
    }

# ==================== RICH VOCAB & TEMPLATES ====================

SUBJECTS = ["Ich", "Du", "Er", "Sie", "Wir", "Ihr", "Das Kind", "Die Kinder", "Mein Bruder", "Meine Schwester",
            "Der Lehrer", "Die Lehrerin", "Unsere Eltern", "Mein Vater", "Meine Mutter", "Der Mann", "Die Frau",
            "Die Schüler", "Die Freunde", "Der Hund", "Die Katze"]

VERBS_PRES_1 = ["arbeite", "lerne", "lese", "schreibe", "spiele", "wohne", "gehe", "komme", "esse", "trinke",
                "mache", "habe", "sehe", "höre", "kaufe", "besuche", "treffe", "warte", "rufe", "öffne"]
VERBS_PRES_3 = ["arbeitet", "lernt", "liest", "schreibt", "spielt", "wohnt", "geht", "kommt", "isst", "trinkt",
                "macht", "hat", "sieht", "hört", "kauft", "besucht", "trifft", "wartet", "ruft", "öffnet"]
VERBS_PRES_2 = ["arbeitest", "lernst", "liest", "schreibst", "spielst", "wohnst", "gehst", "kommst", "isst", "trinkst",
                "machst", "hast", "siehst", "hörst", "kaufst", "besuchst", "triffst", "wartest", "rufst", "öffnest"]
VERBS_PRES_PL = ["arbeiten", "lernen", "lesen", "schreiben", "spielen", "wohnen", "gehen", "kommen", "essen", "trinken",
                 "machen", "haben", "sehen", "hören", "kaufen", "besuchen", "treffen", "warten", "rufen", "öffnen"]

TIMES = ["heute", "morgen", "gestern", "jeden Tag", "oft", "manchmal", "am Abend", "am Morgen", "im Sommer",
         "jede Woche", "immer", "selten", "jetzt", "bald", "früher", "später", "am Wochenende", "nach der Schule"]
MANNERS = ["gern", "schnell", "langsam", "laut", "leise", "fleißig", "gut", "viel", "wenig", "ruhig", "konzentriert", "zusammen"]
PLACES = ["in Berlin", "in München", "zu Hause", "in der Schule", "im Park", "in der Stadt", "im Kino",
          "im Restaurant", "bei uns", "in Deutschland", "in der Bibliothek", "auf dem Land", "am Meer", "im Büro"]

OBJECTS_M = ["einen Apfel", "einen Hund", "einen Ball", "den Zug", "einen Kaffee", "einen Brief", "den Schlüssel",
             "einen Kuchen", "den Bus", "einen Termin"]
OBJECTS_F = ["eine Katze", "eine Blume", "die Zeitung", "eine Frage", "eine Karte", "die Tür", "eine Tasche",
             "die Rechnung", "eine Antwort", "die Einladung"]
OBJECTS_N = ["ein Buch", "ein Haus", "das Auto", "ein Fahrrad", "das Brot", "ein Geschenk", "das Handy",
             "ein Ticket", "das Fenster", "ein Problem"]
OBJECTS_PL = ["Bücher", "Freunde", "Äpfel", "Hausaufgaben", "Spiele", "Kinder", "Wörter", "Tickets", "Briefe", "Fragen"]

ADJECTIVES = ["müde", "glücklich", "traurig", "krank", "gesund", "froh", "nervös", "ruhig", "laut", "still",
              "groß", "klein", "alt", "jung", "klug", "nett", "freundlich", "wichtig", "schön", "interessant",
              "neu", "alt", "teuer", "billig", "schnell", "langsam"]

PROFESSIONS = ["Lehrer", "Arzt", "Student", "Ingenieur", "Künstler", "Musiker", "Schüler", "Polizist",
               "Koch", "Verkäuferin", "Anwalt", "Architekt", "Pilot", "Journalist", "Programmierer"]

COUNTRIES_CITIES = ["in Berlin", "in Hamburg", "in München", "aus Deutschland", "aus Österreich", "aus der Schweiz",
                    "in Köln", "nach Wien", "in Paris", "in London"]

# For subordinate clauses
SUBORDINATE_BASES = [
    ("Ich trinke viel Tee", "weil", "er mir gut tut"),
    ("Er lernt jeden Tag", "weil", "er die Prüfung bestehen will"),
    ("Wir bleiben drinnen", "weil", "es draußen regnet"),
    ("Sie ist traurig", "weil", "ihr Freund weggefahren ist"),
    ("Ich glaube", "dass", "du es schaffen kannst"),
    ("Er weiß", "dass", "sie morgen kommt"),
    ("Wir hoffen", "dass", "das Wetter besser wird"),
    ("Sie sagt", "dass", "sie keine Zeit hat"),
    ("Ich weiß nicht", "ob", "er kommt"),
    ("Sie fragt", "ob", "wir Zeit haben"),
    ("Er überlegt", "ob", "er kündigen soll"),
    ("Wenn du Hunger hast", "", "iss etwas"),
    ("Wenn es regnet", "", "bleiben wir zu Hause"),
    ("Er ruft an", "wenn", "er ankommt"),
    ("Der Student", "der", "fleißig lernt, besteht die Prüfung"),
]

# ==================== GENERATORS ====================

def generate_for_level(level, topic, count, start_n, existing_corrects):
    """Generic dispatcher – dispatches to level/topic specific generators."""
    added = []
    n = start_n

    if level == 'A1':
        added, n = _gen_a1(topic, count, n, existing_corrects)
    elif level == 'A2':
        added, n = _gen_a2(topic, count, n, existing_corrects)
    elif level == 'B1':
        added, n = _gen_b1(topic, count, n, existing_corrects)
    else:  # B2
        added, n = _gen_b2(topic, count, n, existing_corrects)

    return added, n

def _gen_a1(topic, count, start_n, existing_corrects):
    added = []
    n = start_n
    i = 0
    while len(added) < count and i < count * 5:
        i += 1
        subj = random.choice(SUBJECTS)
        if topic == "sein":
            verb = {"Ich": "bin", "Du": "bist", "Wir": "sind", "Ihr": "seid"}.get(subj, "ist")
            if subj in ["Die Kinder", "Unsere Eltern", "Die Schüler"]: verb = "sind"
            adj = random.choice(ADJECTIVES)
            correct = f"{subj} {verb} {adj}."
            tokens = tokenize_correct(correct)
            tip = "'sein' steht immer an Position 2. Adjektiv als Prädikatsnomen hat keine Endung."
            structure = "Subjekt + sein + Adjektiv"
        elif topic == "haben":
            hab = {"Ich":"habe","Du":"hast","Er":"hat","Sie":"hat","Wir":"haben","Ihr":"habt"}.get(subj.split()[0] if subj.split()[0] in ["Ich","Du","Wir","Ihr"] else subj, "hat")
            if subj in ["Die Kinder","Unsere Eltern","Die Schüler","Die Freunde"]: hab = "haben"
            obj = random.choice(OBJECTS_M + OBJECTS_F + OBJECTS_N + OBJECTS_PL)
            time = random.choice([""] + TIMES[:6])
            if time:
                correct = f"{subj} {hab} {time} {obj}."
            else:
                correct = f"{subj} {hab} {obj}."
            tokens = tokenize_correct(correct)
            tip = "'haben' verlangt Akkusativ. Zeitangaben stehen nach dem Verb."
            structure = "Subjekt + haben + (Zeit) + Akkusativ-Objekt"
        elif topic in ["W-Fragen", "Ja/Nein-Fragen"]:
            w = random.choice(["Wo", "Wann", "Warum", "Wie", "Was", "Wer", "Wohin"])
            v = random.choice(VERBS_PRES_3)
            obj = random.choice(OBJECTS_PL + OBJECTS_F + ["Deutsch", "Fußball", "gern"])
            if topic == "W-Fragen":
                correct = f"{w} {v} {subj.lower()} {obj}?"
            else:
                vfirst = random.choice(VERBS_PRES_3 + VERBS_PRES_2)
                correct = f"{vfirst.capitalize()} {subj.lower()} {obj}?"
            tokens = tokenize_correct(correct)
            tip = "W-Frage: W-Wort + Verb (Pos. 2) + Subjekt. Ja/Nein-Frage: Verb an erster Stelle."
            structure = "W-Wort/Verb + Subjekt + Ergänzung + ?"
        elif topic == "Negation":
            hab = random.choice(["habe", "hast", "hat", "haben"])
            neg = random.choice(["keine Ahnung", "keinen Hund", "kein Auto", "keine Zeit", "keine Hausaufgaben"])
            correct = f"{subj} {hab} {neg}."
            tokens = tokenize_correct(correct)
            tip = "'kein / keine / keinen' ersetzt den Artikel bei der Negation."
            structure = "Subjekt + haben + kein- + Objekt"
        else:  # Verben, Zeit, Familie, Zahlen, Grundsätze etc. → general present + time
            v = random.choice(VERBS_PRES_3)
            time = random.choice(TIMES)
            man = random.choice(MANNERS)
            obj = random.choice(OBJECTS_M + OBJECTS_F + OBJECTS_N + OBJECTS_PL + [""])
            parts = [subj, v]
            if time: parts.append(time)
            if man: parts.append(man)
            if obj: parts.append(obj)
            parts.append(".")
            correct = " ".join(parts).replace(" .", ".")
            tokens = tokenize_correct(correct)
            tip = "TeKaMoLo-Prinzip: Zeit vor Art und Weise vor Ort. 'gern' zeigt Vorliebe."
            structure = "Subjekt + Verb + Zeit + Art + Objekt + Ort"
        if correct not in existing_corrects:
            added.append(make_entry(n, "A1", topic, tokens, correct, tip, structure))
            existing_corrects.add(correct)
            n += 1
    return added[:count], n

def _gen_a2(topic, count, start_n, existing_corrects):
    added = []
    n = start_n
    i = 0
    while len(added) < count and i < count * 4:
        i += 1
        subj = random.choice(SUBJECTS)
        if topic == "Trennbare Verben":
            prefix = random.choice(["auf", "an", "aus", "ein", "mit", "vor", "zu"])
            stem = random.choice(["wachen", "stehen", "machen", "nehmen", "packen", "räumen", "laden"])
            time = random.choice(TIMES[:8])
            correct = f"{subj} {stem}t {time} {prefix}."
            tokens = tokenize_correct(correct)
            tip = "Trennbare Verben: Präfix ans Ende. Zeit vor dem Präfix."
            structure = "Subjekt + Verb-Stamm + Zeit + Präfix (Ende)"
        elif topic == "Modalverben":
            modal = random.choice(["kann", "muss", "will", "darf", "soll", "möchte"])
            inf = random.choice(["arbeiten", "lernen", "lesen", "schlafen", "fahren", "helfen", "kommen"])
            time = random.choice(["heute", "morgen", "nicht", "gern", ""])
            correct = f"{subj} {modal} {time} {inf}.".replace("  ", " ").strip()
            tokens = tokenize_correct(correct)
            tip = "Modal + Infinitiv am Ende. 'nicht' steht vor dem Infinitiv."
            structure = "Subjekt + Modal + (nicht/Zeit) + Infinitiv (Satzende)"
        elif topic == "Perfekt":
            aux = random.choice(["habe", "hat", "sind", "ist"])
            part = random.choice(["gearbeitet", "gelesen", "geschrieben", "gegessen", "getrunken",
                                  "gefahren", "gekommen", "gemacht", "besucht", "gekauft"])
            time = random.choice(TIMES[:6])
            obj = random.choice(OBJECTS_M + OBJECTS_F + [""])
            correct = f"{subj} {aux} {time} {obj} {part}.".replace("  ", " ").strip()
            tokens = tokenize_correct(correct)
            tip = "Perfekt: Hilfsverb + Partizip II am Ende. 'sein' bei Bewegungsverben."
            structure = "Subjekt + haben/sein + Zeit + Objekt + Partizip II"
        else:
            # General A2: TeKaMoLo, Dativ, Präpositionen, Komparativ, Imperativ, Verben
            v = random.choice(VERBS_PRES_3)
            time = random.choice(TIMES)
            man = random.choice(MANNERS)
            place = random.choice(PLACES)
            obj = random.choice(OBJECTS_M + OBJECTS_F + OBJECTS_N + [""])
            parts = [subj, v, time, man]
            if obj: parts.append(obj)
            parts += place.split()
            parts.append(".")
            correct = " ".join(parts).replace(" .", ".")
            tokens = tokenize_correct(correct)
            tip = "A2: Starke Trennung von Zeit, Art & Weise und Ort. Dativ nach bestimmten Verben/Präpositionen."
            structure = "Subjekt + Verb + Zeit + Art + Objekt + Ort (TeKaMoLo)"
        if correct not in existing_corrects:
            added.append(make_entry(n, "A2", topic, tokens, correct, tip, structure))
            existing_corrects.add(correct)
            n += 1
    return added[:count], n

def _gen_b1(topic, count, start_n, existing_corrects):
    added = []
    n = start_n
    i = 0

    # Dynamic builders for lots of unique B1 sentences
    subjects = ["Ich", "Er", "Sie", "Wir", "Das Kind", "Die Kinder", "Mein Freund", "Meine Kollegin", "Der Student", "Die Firma"]
    verbs = ["essen", "kommen", "lernen", "arbeiten", "kaufen", "besuchen", "lesen", "schreiben", "helfen", "warten"]
    objects = ["mehr Gemüse", "zu spät", "Deutsch", "hart", "ein Geschenk", "die Stadt", "viele Bücher", "einen Brief", "dem Nachbarn", "auf den Bus"]
    reasons = ["ich gesünder leben will", "der Zug Verspätung hat", "wir Informationen brauchen", "sie in Deutschland studieren möchte",
               "er die ganze Nacht gearbeitet hat", "meine Familie zu Besuch kommt", "es hungrig ist", "das Wetter schlecht ist",
               "die Vorräte leer sind", "er die Prüfung bestehen möchte", "die Preise gestiegen sind", "ich müde bin"]

    while len(added) < count and i < count * 15:
        i += 1
        if topic == "Passiv":
            subj = random.choice(["Das Haus", "Der Bericht", "Die Aufgabe", "Das Museum", "Die Prüfung", "Das Auto", "Der Brief", "Das Gesetz"])
            correct = f"{subj} {random.choice(['wird', 'wurde'])} {random.choice(['gerade', 'gestern', 'morgen', 'erfolgreich', 'schnell'])} {random.choice(['renoviert', 'fertiggestellt', 'gelöst', 'geschlossen', 'bestanden', 'repariert', 'geschickt', 'verabschiedet'])}."
            tip = "Vorgangspassiv: werden + Partizip II. Zeitadverb vor dem Partizip."
            structure = "Subjekt + werden + (Zeit/Adverb) + Partizip II"
        elif topic == "Konjunktiv II":
            correct = random.choice([
                "Wenn ich mehr Zeit hätte, würde ich mehr reisen.",
                "An deiner Stelle würde ich das überdenken.",
                "Das wäre wirklich eine gute Idee.",
                "Er würde gern eine neue Sprache lernen.",
                "Ich wäre gern Arzt geworden.",
                "Wenn wir reicher wären, würden wir ein Haus kaufen.",
                "Sie würde sofort helfen, wenn sie könnte.",
            ])
            tip = "Konjunktiv II für irreale Wünsche, Höflichkeit und Ratschläge."
            structure = "wenn + Konjunktiv II / würde + Infinitiv"
        elif topic == "weil-Satz":
            s = random.choice(subjects)
            v = random.choice(verbs)
            o = random.choice(objects)
            r = random.choice(reasons)
            correct = f"{s} {v} {o}, weil {r}."
            tip = "weil-Satz: Verb ans Ende des Nebensatzes. Komma davor."
            structure = "Hauptsatz + , + weil + Subjekt + ... + Verb (Ende)"
        elif topic == "dass-Satz":
            s = random.choice(subjects)
            correct = f"{s} glaubt, dass {random.choice(['du es schaffen kannst', 'sie morgen kommt', 'das Wetter besser wird', 'er recht hat', 'die Preise steigen werden', 'wir gewinnen werden'])}."
            tip = "dass-Satz: Verb ans Ende. Häufig nach Verben des Meinens/Sagens."
            structure = "Hauptsatz + , + dass + ... + Verb (Ende)"
        elif topic == "ob-Satz":
            s = random.choice(subjects)
            correct = f"{s} weiß nicht, ob {random.choice(['er kommt', 'wir Zeit haben', 'das stimmt', 'sie ihn versteht', 'die Tür offen ist', 'es regnen wird'])}."
            tip = "ob-Satz: indirekte Ja/Nein-Frage. Verb ans Ende."
            structure = "Hauptsatz + , + ob + Subjekt + ... + Verb (Ende)"
        elif topic == "wenn-Satz":
            s = random.choice(subjects)
            correct = f"Wenn {random.choice(['du Hunger hast', 'es regnet', 'wir Zeit haben', 'die Sonne scheint', 'man älter wird', 'es kalt ist'])}, {random.choice(['iss etwas', 'bleiben wir zu Hause', 'besuchen wir euch', 'gehen wir spazieren', 'ziehe ich eine Jacke an', 'verändert sich die Sicht'])}."
            tip = "wenn-Satz: Bedingung oder Zeit. Verb-Endstellung im Nebensatz."
            structure = "wenn + ... + Verb (Ende), Hauptsatz (V2)"
        else:  # Relativsatz
            correct = random.choice([
                "Der Student, der fleißig lernt, besteht die Prüfung.",
                "Das Restaurant, das wir besucht haben, war sehr gut.",
                "Die Frau, der ich geholfen habe, war sehr dankbar.",
                "Das Auto, das er gekauft hat, ist sehr teuer.",
                "Der Arzt, dem ich vertraue, ist sehr kompetent.",
                "Die Stadt, in der ich lebe, ist sehr schön.",
                "Das Buch, das sie empfohlen hat, ist sehr interessant.",
                "Der Mann, dessen Name ich vergessen habe, war sehr nett.",
            ])
            tip = "Relativsatz: Relativpronomen + Verb am Ende des Relativsatzes."
            structure = "Nomen + , + Relativpronomen + ... + Verb (Ende) + , + Hauptsatz"
        tokens = tokenize_correct(correct)
        if correct not in existing_corrects:
            added.append(make_entry(n, "B1", topic, tokens, correct, tip, structure))
            existing_corrects.add(correct)
            n += 1
    return added[:count], n

def _gen_b2(topic, count, start_n, existing_corrects):
    added = []
    n = start_n
    i = 0
    while len(added) < count and i < count * 20:
        i += 1
        subj = random.choice(["Die Regierung", "Das Unternehmen", "Der Minister", "Viele Menschen", "Er", "Sie", "Das Gesetz", "Die Organisation", "Der Experte"])
        if topic == "Passiv":
            correct = f"{subj} wird von Experten beraten."
            tip = "Erweitertes Passiv mit Agent oder Passiversatz (sich lassen / sein + zu)."
            structure = "werden + Partizip II (+ von + Dativ)"
        elif topic == "Konnektoren":
            correct = random.choice([
                "Je mehr man liest, desto besser schreibt man.",
                "Sowohl die Qualität als auch der Preis überzeugen.",
                "Das war zwar schwierig, aber wir haben es geschafft.",
                "Nicht nur die Kosten, sondern auch die Qualität spielen eine Rolle.",
                "Er hat weder Zeit noch Energie dafür.",
                "Je früher du anfängst, desto besser.",
                "Sowohl die Schüler als auch die Lehrer waren zufrieden.",
            ])
            tip = "Konnektoren (je-desto, sowohl-als-auch, zwar-aber, weder-noch) verbinden Sätze oder Satzteile."
            structure = "je ... desto / sowohl ... als auch / weder ... noch"
        elif topic == "Indirekte Rede":
            correct = f"{subj} erklärte, die Lage sei unter Kontrolle."
            tip = "Indirekte Rede: Konjunktiv I (sei, habe, werde) in formeller Berichterstattung."
            structure = "Hauptsatz + Konjunktiv I (indirekte Rede)"
        elif topic == "Partizipialkonstruktionen":
            correct = random.choice([
                "Die steigende Inflation ist ein ernstes Problem.",
                "Der vorgeschlagene Plan wurde einstimmig angenommen.",
                "Sie ging, ohne sich zu verabschieden.",
                "Anstatt zu klagen, sucht er nach Lösungen.",
                "Das neue Modell ist leichter als das alte.",
            ])
            tip = "Partizip I/II als Attribut oder Infinitivkonstruktionen mit 'ohne zu' / 'anstatt zu'."
            structure = "Partizip als Adjektiv / ohne/anstatt + zu + Infinitiv"
        elif topic == "Nebensätze":
            correct = random.choice([
                "Er arbeitet hart, obwohl er schon sehr müde ist.",
                "Sie spart Geld, damit sie eine Reise machen kann.",
                "Er lernt Deutsch, indem er täglich Podcasts hört.",
                "Da es heute regnet, bleibe ich zu Hause.",
                "Das ist das Thema, über das wir gesprochen haben.",
            ])
            tip = "Erweiterte Nebensätze mit obwohl, damit, indem, da (Konzessiv, Final, Modal, Kausal)."
            structure = "Nebensatz mit speziellem Einleiter + Verb am Ende"
        else:  # Konjunktiv II and fallback
            correct = random.choice([
                "An deiner Stelle würde ich das überdenken.",
                "Wenn ich mehr Zeit hätte, würde ich mehr reisen.",
                "Das wäre wirklich eine gute Idee.",
                "Könnten Sie mir bitte helfen?",
                "Wenn er doch rechtzeitig gekommen wäre!",
                "Er würde sofort helfen, wenn er könnte.",
            ])
            tip = "Konjunktiv II für höfliche Ratschläge, irreale Bedingungen und Wünsche."
            structure = "würde + Infinitiv / Konjunktiv II"
        tokens = tokenize_correct(correct)
        if correct not in existing_corrects:
            added.append(make_entry(n, "B2", topic, tokens, correct, tip, structure))
            existing_corrects.add(correct)
            n += 1
    return added[:count], n

def main():
    with open(OUT_PATH, 'r', encoding='utf-8') as f:
        existing = json.load(f)

    print(f"Starting from {len(existing)} items")

    existing_corrects = {e.get("correct", "") for e in existing}
    next_id = max((int(e["id"].replace("SO", "")) for e in existing if str(e.get("id","")).startswith("SO")), default=0) + 1

    # Current counts
    current = Counter(d["level"] for d in existing)
    print("Current per level:", dict(current))

    # Define target topics per level (we will distribute the needed items across them)
    a1_topics = ["sein", "haben", "W-Fragen", "Ja/Nein-Fragen", "Negation", "Verben", "Zeit", "Familie", "Zahlen", "Grundsätze"]
    a2_topics = ["Trennbare Verben", "Modalverben", "Perfekt", "TeKaMoLo", "Dativ", "Präpositionen", "Komparativ", "Imperativ", "Verben"]
    b1_topics = ["weil-Satz", "dass-Satz", "ob-Satz", "wenn-Satz", "Relativsatz", "Passiv", "Konjunktiv II"]
    b2_topics = ["Konjunktiv II", "Passiv", "Nebensätze", "Partizipialkonstruktionen", "Konnektoren", "Indirekte Rede"]

    needed = {}
    for lev, target in TARGET.items():
        needed[lev] = target - current.get(lev, 0)

    print("Still needed:", needed)

    all_added = []

    # Generate for each level the required additional items, spreading across its topics
    for level in ['A1', 'A2', 'B1', 'B2']:
        need = needed.get(level, 0)
        if need <= 0:
            continue
        topics = {'A1': a1_topics, 'A2': a2_topics, 'B1': b1_topics, 'B2': b2_topics}[level]
        per_topic = max(20, need // len(topics) + 30)   # much more aggressive per topic

        for topic in topics:
            to_make = max(0, min(per_topic, need - len(all_added)))
            if to_make <= 0:
                break
            batch, next_id = generate_for_level(level, topic, to_make, next_id, existing_corrects)
            all_added.extend(batch)
            print(f"  Added {len(batch)} for {level} / {topic}")

    # Second and third aggressive passes focused on B1 and B2
    for _pass in range(6):
        for level in ['A2', 'B1', 'B2']:
            current_count = sum(1 for x in (existing + all_added) if x['level'] == level)
            still_need = TARGET[level] - current_count
            if still_need <= 0:
                continue
            topics = {'A2': a2_topics, 'B1': b1_topics, 'B2': b2_topics}[level]
            for topic in topics:
                batch_size = 80 if level in ['B1', 'B2'] else 50
                batch, next_id = generate_for_level(level, topic, batch_size, next_id, existing_corrects)
                all_added.extend(batch)
                print(f"  [Pass {_pass}] Added batch for {level}/{topic}")
                if len(existing) + len(all_added) >= 5000:
                    break
            if len(existing) + len(all_added) >= 5000:
                break
        if len(existing) + len(all_added) >= 5000:
            break

    # Final filler — prioritize B levels then A2
    while len(existing) + len(all_added) < 5000:
        if sum(1 for x in (existing + all_added) if x['level'] == 'B2') < TARGET['B2']:
            lev, tops = 'B2', b2_topics
        elif sum(1 for x in (existing + all_added) if x['level'] == 'B1') < TARGET['B1']:
            lev, tops = 'B1', b1_topics
        else:
            lev, tops = 'A2', a2_topics
        batch, next_id = generate_for_level(lev, random.choice(tops), 50, next_id, existing_corrects)
        all_added.extend(batch)

    final = existing + all_added
    # Trim or pad to exactly 5000 while respecting targets as much as possible
    if len(final) > 5000:
        final = final[:5000]

    # Re-balance if needed by truncating per level (rare)
    by_lev = defaultdict(list)
    for item in final:
        by_lev[item["level"]].append(item)

    balanced = []
    for lev, target in TARGET.items():
        items = by_lev[lev][:target]
        balanced.extend(items)

    # If under 5000, add more from A1/A2
    while len(balanced) < 5000:
        extra = final[len(balanced) % len(final)]
        if len([x for x in balanced if x['level']==extra['level']]) < TARGET[extra['level']]:
            balanced.append(extra)
        else:
            break

    balanced = balanced[:5000]

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(balanced, f, ensure_ascii=False, indent=2)

    final_counts = Counter(d["level"] for d in balanced)
    topic_counts = Counter(d["topic"] for d in balanced)
    print(f"\n=== FINAL: {len(balanced)} items ===")
    print("Per level:", dict(final_counts))
    print("Top topics:")
    for t, c in topic_counts.most_common(15):
        print(f"  {t}: {c}")
    print(f"Saved to {OUT_PATH}")

if __name__ == "__main__":
    main()
