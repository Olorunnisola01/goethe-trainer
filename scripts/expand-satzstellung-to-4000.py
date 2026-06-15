"""
Expand Satzstellung (sentence order) pool to ~4000 total.
Loads current public/data/sentence_order.json, appends many new high-quality entries
for A1/A2 (bulk) + some B1/B2, with proper scrambling, tips and structures.
Run: python scripts/expand-satzstellung-to-4000.py
"""

import json
import random
import os
import re

random.seed(2026)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(ROOT, 'public', 'data', 'sentence_order.json')

def sid(n):
    return f"SO{n:04d}"

def tokenize_correct(s):
    # Match words (incl. German umlauts/ß) and punctuation as separate tokens
    return re.findall(r"[\wäöüÄÖÜß]+|[^\w\s]", s) or s.split()

def scramble(tokens):
    t = list(tokens)
    for _ in range(25):
        random.shuffle(t)
        if t != tokens:
            return t
    # fallback reverse
    return list(reversed(tokens)) if t == tokens else t

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

# --- Vocab banks for templated generation (to reach thousands without pure duplication) ---
SUBJECTS = ["Ich", "Du", "Er", "Sie", "Wir", "Ihr", "Die Kinder", "Mein Bruder", "Meine Schwester", "Der Lehrer", "Die Lehrerin", "Unsere Eltern"]
SUBJECTS_PL = ["Wir", "Ihr", "Sie", "Die Kinder", "Meine Eltern", "Die Schüler", "Die Freunde"]
VERBS_PRES = [
    ("arbeiten", "arbeitet", "arbeitest", "arbeite", "arbeiten"),
    ("lernen", "lernt", "lernst", "lerne", "lernen"),
    ("lesen", "liest", "liest", "lese", "lesen"),
    ("schreiben", "schreibt", "schreibst", "schreibe", "schreiben"),
    ("spielen", "spielt", "spielst", "spiele", "spielen"),
    ("wohnen", "wohnt", "wohnst", "wohne", "wohnen"),
    ("gehen", "geht", "gehst", "gehe", "gehen"),
    ("kommen", "kommt", "kommst", "komme", "kommen"),
    ("essen", "isst", "isst", "esse", "essen"),
    ("trinken", "trinkt", "trinkst", "trinke", "trinken"),
]
TIME_ADVS = ["heute", "morgen", "gestern", "jeden Tag", "oft", "manchmal", "am Abend", "am Morgen", "im Sommer", "jede Woche"]
MANNER = ["gern", "schnell", "langsam", "laut", "leise", "fleißig", "gut", "viel"]
PLACES = ["in Berlin", "in München", "zu Hause", "in der Schule", "im Park", "in der Stadt", "im Kino", "im Restaurant", "bei uns", "in Deutschland"]
OBJECTS_M = ["einen Apfel", "einen Hund", "einen Ball", "den Zug", "einen Kaffee", "einen Brief"]
OBJECTS_F = ["eine Katze", "eine Blume", "die Zeitung", "eine Frage", "eine Karte", "die Tür"]
OBJECTS_N = ["ein Buch", "ein Haus", "das Auto", "ein Fahrrad", "das Brot", "ein Geschenk"]
OBJECTS_PL = ["Bücher", "Freunde", "Äpfel", "Hausaufgaben", "Spiele", "Kinder"]

def gen_sein_variations(start_n, count):
    entries = []
    n = start_n
    adjs = ["müde", "glücklich", "traurig", "krank", "gesund", "froh", "nervös", "ruhig", "laut", "still", "groß", "klein", "alt", "jung", "klug", "nett", "freundlich", "wichtig", "schön", "interessant"]
    professions = ["Lehrer", "Arzt", "Student", "Ingenieur", "Künstler", "Musiker", "Schüler", "Polizist", "Koch", "Verkäuferin"]
    places = ["in Berlin", "in Hamburg", "in Köln", "aus Deutschland", "aus Österreich", "aus der Schweiz"]
    i = 0
    while len(entries) < count and i < 2000:
        subj = random.choice(SUBJECTS)
        if subj in ["Ich", "Er", "Mein Bruder", "Der Lehrer"]:
            verb = "bin" if subj in ["Ich"] else "ist"
            if subj == "Ich": verb = "bin"
            elif subj in ["Er", "Mein Bruder", "Der Lehrer"]: verb = "ist"
        elif subj in ["Du"]: verb = "bist"
        elif subj in ["Wir", "Die Kinder", "Unsere Eltern"]: verb = "sind"
        elif subj in ["Ihr"]: verb = "seid"
        else: verb = "ist"
        adj = random.choice(adjs)
        tokens = [subj, verb, adj, "."]
        correct = f"{subj} {verb} {adj}."
        tip = "'sein' steht immer an Position 2. Adjektiv als Prädikatsnomen ohne Endung."
        structure = "Subjekt + sein + Adjektiv"
        entries.append(make_entry(n, "A1", "sein", tokens, correct, tip, structure))
        n += 1
        i += 1

        # profession
        if len(entries) < count:
            subj = random.choice(["Er", "Sie", "Mein Vater", "Meine Mutter", "Der Mann", "Die Frau"])
            verb = "ist"
            prof = random.choice(professions)
            tokens = [subj, verb, prof, "."]
            correct = f"{subj} {verb} {prof}."
            tip = "Berufe nach 'sein' stehen ohne Artikel."
            structure = "Subjekt + sein + Beruf (ohne Artikel)"
            entries.append(make_entry(n, "A1", "sein", tokens, correct, tip, structure))
            n += 1

        # location
        if len(entries) < count:
            subj = random.choice(SUBJECTS)
            verb = {"Ich":"bin","Du":"bist","Wir":"sind","Ihr":"seid"}.get(subj, "ist")
            if subj in ["Die Kinder","Unsere Eltern","Meine Schwester"]: verb="sind"
            loc = random.choice(places)
            tokens = [subj, verb, loc, "."] if "aus" not in loc else [subj, verb, loc.split()[0], loc.split()[1], "."] if len(loc.split())>1 else [subj, verb, loc, "."]
            if "aus" in loc:
                parts = loc.split()
                tokens = [subj, verb] + parts + ["."]
            else:
                tokens = [subj, verb, loc, "."]
            correct = f"{subj} {verb} {loc}."
            tip = "Ortsangaben mit 'in' oder 'aus' kommen nach dem Verb."
            structure = "Subjekt + sein + Ort"
            entries.append(make_entry(n, "A1", "sein", tokens, correct, tip, structure))
            n += 1
        i += 1
    return entries[:count], n

def gen_haben_variations(start_n, count):
    entries = []
    n = start_n
    i = 0
    while len(entries) < count and i < 2500:
        subj = random.choice(SUBJECTS)
        hab = {"Ich":"habe","Du":"hast","Er":"hat","Sie":"hat","Wir":"haben","Ihr":"habt","Die Kinder":"haben","Mein Bruder":"hat","Meine Schwester":"hat","Der Lehrer":"hat","Die Lehrerin":"hat","Unsere Eltern":"haben"}.get(subj, "hat")
        obj = random.choice(OBJECTS_M + OBJECTS_F + OBJECTS_N + OBJECTS_PL)
        time = random.choice(["", "heute", "morgen", "gestern"])
        if time:
            tokens = [subj, hab, time, obj, "."]
            correct = f"{subj} {hab} {time} {obj}."
        else:
            tokens = [subj, hab, obj, "."]
            correct = f"{subj} {hab} {obj}."
        tip = "'haben' + Akkusativobjekt. 'kein/keine' für Negation. Zeitadverb nach Verb."
        structure = "Subjekt + haben + (Zeit) + Akkusativobjekt"
        entries.append(make_entry(n, "A1", "haben", tokens, correct, tip, structure))
        n += 1

        # negation
        if len(entries) < count:
            subj = random.choice(SUBJECTS)
            hab = {"Ich":"habe","Du":"hast"}.get(subj, "hat") if subj not in ["Wir","Ihr","Die Kinder"] else ("haben" if subj in ["Wir","Die Kinder"] else "habt")
            negobj = random.choice(["keinen Hund", "keine Zeit", "kein Auto", "keine Hausaufgaben", "keinen Kaffee"])
            tokens = [subj, hab, negobj, "."]
            correct = f"{subj} {hab} {negobj}."
            tip = "'kein/keine/keinen' ersetzt den unbestimmten Artikel bei Negation."
            structure = "Subjekt + haben + kein- + Objekt"
            entries.append(make_entry(n, "A1", "Negation", tokens, correct, tip, structure))
            n += 1
        i += 1
    return entries[:count], n

def gen_verb_teka_variations(start_n, count):
    entries = []
    n = start_n
    i = 0
    while len(entries) < count and i < 3000:
        subj = random.choice(SUBJECTS)
        vinf, v3, v2, v1, vpl = random.choice(VERBS_PRES)
        if subj == "Ich": vform = v1
        elif subj == "Du": vform = v2
        elif subj in ["Wir", "Ihr", "Die Kinder", "Unsere Eltern"]: vform = vpl
        else: vform = v3
        time = random.choice(TIME_ADVS)
        man = random.choice(MANNER)
        place = random.choice(PLACES)
        obj = random.choice(OBJECTS_M + OBJECTS_F + OBJECTS_N + [""] )
        # TeKaMoLo order: Time - Manner - Place , obj before place often
        parts = [subj, vform]
        if time: parts.append(time)
        if man: parts.append(man)
        if obj: parts.append(obj)
        if place: parts += place.split()
        parts.append(".")
        tokens = parts
        correct = " ".join(parts).replace(" .", ".")
        tip = "TeKaMoLo: Zeit vor Art und Weise vor Ort. Objekt vor Ort."
        structure = "Subjekt + Verb + Zeit + Art + Objekt + Ort"
        entries.append(make_entry(n, "A2", "Verben", tokens, correct, tip, structure))
        n += 1

        # simple present with gern
        if len(entries) < count:
            subj2 = random.choice(SUBJECTS)
            vinf2, v32, v22, v12, vpl2 = random.choice(VERBS_PRES)
            if subj2 == "Ich": vf = v12
            elif subj2 == "Du": vf = v22
            elif subj2 in ["Wir","Die Kinder"]: vf = vpl2
            else: vf = v32
            obj2 = random.choice(OBJECTS_PL + OBJECTS_F)
            tokens2 = [subj2, vf, "gern", obj2, "."]
            correct2 = f"{subj2} {vf} gern {obj2}."
            tip = "'gern' steht nach dem Verb und zeigt Vorliebe an."
            structure = "Subjekt + Verb + gern + Objekt"
            entries.append(make_entry(n, "A1", "Verben", tokens2, correct2, tip, structure))
            n += 1
        i += 1
    return entries[:count], n

def gen_questions_variations(start_n, count):
    entries = []
    n = start_n
    i = 0
    wwords = ["Wo", "Wann", "Warum", "Wie", "Was", "Wer", "Wohin", "Woher"]
    while len(entries) < count and i < 500:
        w = random.choice(wwords)
        subj = random.choice(["du", "er", "sie", "ihr", "wir", "Sie"])
        vinf, v3, v2, v1, vpl = random.choice(VERBS_PRES)
        if subj == "du": vf = v2
        elif subj in ["wir", "ihr"]: vf = vpl
        else: vf = v3
        obj = random.choice(["Deutsch", "Fußball", "das Buch", "eine Frage", "im Park", "nach Hause", "gern", "heute"])
        if w in ["Wo", "Wohin", "Woher"]:
            q = f"{w} {vf} {subj}?"
            tokens = tokenize_correct(q)
            tip = "W-Frage: W-Wort + Verb + Subjekt. Verb bleibt in Position 2."
            structure = "W-Wort + Verb + Subjekt + ?"
        else:
            q = f"{w} {vf} {subj} {obj}?"
            tokens = tokenize_correct(q)
            tip = "W-Frage: Fragewort vorne, Verb an 2. Stelle, Subjekt danach."
            structure = "W-Wort + Verb + Subjekt + Ergänzung + ?"
        entries.append(make_entry(n, "A1", "W-Fragen", tokens, q, tip, structure))
        n += 1

        # yes/no
        if len(entries) < count:
            subj2 = random.choice(["du", "er", "sie", "ihr"])
            vf2 = {"du": random.choice(VERBS_PRES)[2], "er": random.choice(VERBS_PRES)[1], "sie": random.choice(VERBS_PRES)[1], "ihr": random.choice(VERBS_PRES)[4] }[subj2]
            q2 = f"{vf2.capitalize()} {subj2} {random.choice(['gern', 'heute', 'ein Buch', 'Fußball'])}?"
            tokens2 = tokenize_correct(q2)
            tip2 = "Ja/Nein-Frage: Verb an erster Stelle, Subjekt direkt danach."
            structure2 = "Verb + Subjekt + ... + ?"
            entries.append(make_entry(n, "A1", "Ja/Nein-Fragen", tokens2, q2, tip2, structure2))
            n += 1
        i += 1
    return entries[:count], n

def gen_modal_variations(start_n, count):
    entries = []
    n = start_n
    modals = [
        ("kann", "kannst", "können", "kann"),
        ("muss", "musst", "müssen", "muss"),
        ("will", "willst", "wollen", "will"),
        ("darf", "darfst", "dürfen", "darf"),
        ("soll", "sollst", "sollen", "soll"),
        ("möchte", "möchtest", "möchten", "möchte"),
    ]
    i = 0
    while len(entries) < count and i < 1500:
        subj = random.choice(["Ich", "Du", "Er", "Wir"])
        minf, m2, mpl, m3 = random.choice(modals)
        if subj == "Ich": mf = minf
        elif subj == "Du": mf = m2
        elif subj == "Wir": mf = mpl
        else: mf = m3
        inf = random.choice(["arbeiten", "lernen", "lesen", "schlafen", "fahren", "essen", "helfen"])
        time = random.choice(["heute", "morgen", "nicht", "gern", ""])
        parts = [subj, mf]
        if time and time != "nicht": parts.append(time)
        if time == "nicht": parts.append("nicht")
        parts.append(inf)
        parts.append(".")
        tokens = parts
        correct = " ".join(parts).replace(" .", ".")
        tip = "Modalverb + Infinitiv am Ende. 'nicht' vor Infinitiv bei Verneinung."
        structure = "Subjekt + Modal + (nicht/Zeit) + Infinitiv (Ende)"
        entries.append(make_entry(n, "A2", "Modalverben", tokens, correct, tip, structure))
        n += 1
        i += 1
    return entries[:count], n

def gen_time_fronted_variations(start_n, count):
    entries = []
    n = start_n
    i = 0
    while len(entries) < count and i < 1200:
        time = random.choice(TIME_ADVS + ["Am Montag", "Im Winter", "Nach der Schule", "Vor dem Essen", "Um acht Uhr"])
        subj = random.choice(SUBJECTS)
        vinf, v3, v2, v1, vpl = random.choice(VERBS_PRES)
        if subj == "Ich": vf = v1
        elif subj == "Du": vf = v2
        elif subj in ["Wir", "Die Kinder"]: vf = vpl
        else: vf = v3
        rest = random.choice(["gehe ich ins Kino", "fahren wir nach Hause", "lerne ich Deutsch", "spielt er Fußball", "essen wir zusammen"])
        # fronted time forces V2 (verb before subject in main)
        correct = f"{time} {rest}."
        # rough tokenization for common cases
        tokens = tokenize_correct(correct)
        tip = "Zeitangabe am Satzanfang: Verb an 2. Stelle, Subjekt nach dem Verb."
        structure = "Zeit + Verb + Subjekt + Rest (V2)"
        entries.append(make_entry(n, "A2", "Zeitangaben", tokens, correct, tip, structure))
        n += 1
        i += 1
    return entries[:count], n

def gen_subordinate_variations(start_n, count):
    entries = []
    n = start_n
    i = 0
    weil_templates = [
        ("Ich trinke Tee, weil ich müde bin.", "weil", "Subjekt + ... + Verb (Endstellung) im Nebensatz"),
        ("Er lernt viel, weil er die Prüfung bestehen will.", "weil", "Modal am Ende des weil-Satzes"),
        ("Wir bleiben zu Hause, weil es regnet.", "weil", "Verb ans Ende des Nebensatzes"),
        ("Sie ist glücklich, weil sie einen neuen Job hat.", "weil", "Verb (hat) am Ende"),
    ]
    dass_templates = [
        ("Ich glaube, dass du recht hast.", "dass", "dass + Subjekt + Objekt + Verb (Ende)"),
        ("Er sagt, dass er morgen kommt.", "dass", "dass + Subjekt + Zeit + Verb (Ende)"),
    ]
    wenn_templates = [
        ("Wenn ich Zeit habe, gehe ich spazieren.", "wenn", "wenn + Verb am Ende, Hauptsatz V2"),
        ("Wenn es kalt ist, ziehe ich eine Jacke an.", "wenn", "wenn-Satz vorne: Verb am Ende, dann Hauptsatz"),
    ]
    while len(entries) < count and i < 200:
        for tmpl, topic, struct in (weil_templates + dass_templates + wenn_templates):
            if len(entries) >= count: break
            tokens = tokenize_correct(tmpl)
            tip = "Nebensatz: einleitendes Wort + Verb ans Satzende. Komma vor dem Einleiter."
            entries.append(make_entry(n, "B1", topic + "-Satz", tokens, tmpl, tip, struct))
            n += 1
        i += 1
    return entries[:count], n

def gen_b2_variations(start_n, count):
    entries = []
    n = start_n
    b2_items = [
        ("Er würde mehr reisen, wenn er mehr Zeit hätte.", "B2", "Konjunktiv II", "Irrealer Bedingungssatz: hätte + würde + Inf.", "wenn + Konjunktiv II im Neben-, würde + Inf im Hauptsatz"),
        ("Das Gesetz wird vom Parlament verabschiedet.", "B2", "Passiv", "Vorgangspassiv: wird + Partizip II + von + Dativ", "werden + Partizip II (Agent mit von)"),
        ("Sie spart, damit sie eine Weltreise machen kann.", "B2", "Nebensätze", "Finalsatz mit 'damit': Verb am Ende", "damit + Subjekt + ... + Verb (Ende)"),
        ("Je mehr man übt, desto besser wird man.", "B2", "Konnektoren", "je + Komparativ, desto + Komparativ + V2", "je … desto mit Verb in Position 2 nach desto"),
        ("Der Minister erklärte, die Lage sei stabil.", "B2", "Indirekte Rede", "Konjunktiv I in indirekter Rede: sei", "Indirekte Rede: Verb im Konjunktiv I"),
        ("Ohne zu zögern, half er dem Kind.", "B2", "Partizipialkonstruktionen", "ohne + zu + Infinitiv (gleichzeitig)", "ohne … zu + Infinitiv am Ende"),
        ("Das neue Modell ist leichter als das alte.", "B2", "Komparativ", "Komparativ + als", "Adjektiv + -er + als + Vergleich"),
        ("Das Auto wurde gestern repariert.", "B2", "Passiv", "Präteritum Passiv: wurde + Partizip", "wurde + Partizip II"),
    ]
    i = 0
    while len(entries) < count:
        for correct, level, topic, tip, structure in b2_items:
            if len(entries) >= count: break
            tokens = tokenize_correct(correct)
            entries.append(make_entry(n, level, topic, tokens, correct, tip, structure))
            n += 1
        i += 1
        if i > 50: break
    return entries[:count], n

def main():
    with open(OUT_PATH, 'r', encoding='utf-8') as f:
        existing = json.load(f)

    print(f"Current questions: {len(existing)}")

    # Dedup by correct sentence
    existing_corrects = {e.get("correct", "") for e in existing}

    next_id_num = max((int(e["id"].replace("SO","")) for e in existing if e.get("id","").startswith("SO")), default=0) + 1

    added = []

    # Generate large batches. Target total ~4000
    target_total = 4200
    need = target_total - len(existing)

    # A1 heavy
    batch, next_id_num = gen_sein_variations(next_id_num, min(need, 1800))
    for e in batch:
        if e["correct"] not in existing_corrects:
            added.append(e)
            existing_corrects.add(e["correct"])
    need = target_total - (len(existing) + len(added))

    batch, next_id_num = gen_haben_variations(next_id_num, min(need, 1400))
    for e in batch:
        if e["correct"] not in existing_corrects:
            added.append(e)
            existing_corrects.add(e["correct"])
    need = target_total - (len(existing) + len(added))

    batch, next_id_num = gen_verb_teka_variations(next_id_num, min(need, 1600))
    for e in batch:
        if e["correct"] not in existing_corrects:
            added.append(e)
            existing_corrects.add(e["correct"])
    need = target_total - (len(existing) + len(added))

    batch, next_id_num = gen_questions_variations(next_id_num, min(need, 1200))
    for e in batch:
        if e["correct"] not in existing_corrects:
            added.append(e)
            existing_corrects.add(e["correct"])
    need = target_total - (len(existing) + len(added))

    batch, next_id_num = gen_modal_variations(next_id_num, min(need, 800))
    for e in batch:
        if e["correct"] not in existing_corrects:
            added.append(e)
            existing_corrects.add(e["correct"])
    need = target_total - (len(existing) + len(added))

    batch, next_id_num = gen_time_fronted_variations(next_id_num, min(need, 600))
    for e in batch:
        if e["correct"] not in existing_corrects:
            added.append(e)
            existing_corrects.add(e["correct"])
    need = target_total - (len(existing) + len(added))

    batch, next_id_num = gen_subordinate_variations(next_id_num, min(need, 500))
    for e in batch:
        if e["correct"] not in existing_corrects:
            added.append(e)
            existing_corrects.add(e["correct"])
    need = target_total - (len(existing) + len(added))

    batch, next_id_num = gen_b2_variations(next_id_num, min(need, 300))
    for e in batch:
        if e["correct"] not in existing_corrects:
            added.append(e)
            existing_corrects.add(e["correct"])

    all_q = existing + added

    # Final trim or pad if slightly over/under
    if len(all_q) > target_total:
        all_q = all_q[:target_total]
    while len(all_q) < target_total:
        # simple pad with a couple more variations if needed (rare)
        pad = make_entry(next_id_num, "A1", "sein", ["Ich", "bin", "glücklich", "."], "Ich bin glücklich.", "'sein' an 2. Stelle.", "Subjekt + sein + Adjektiv")
        if pad["correct"] not in existing_corrects:
            all_q.append(pad)
            next_id_num += 1
        else:
            next_id_num += 1
            break

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_q, f, ensure_ascii=False, indent=2)

    counts = {}
    for e in all_q:
        counts[e["level"]] = counts.get(e["level"], 0) + 1
    print(f"Saved {len(all_q)} questions (target ~{target_total}).")
    print("By level:", counts)
    print(f"File: {OUT_PATH}")

if __name__ == "__main__":
    main()
