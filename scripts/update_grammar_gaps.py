"""
Fill the grammar-coverage gaps identified in the Satzstellung audit:
  - #7  Position-1 connectors (deshalb/trotzdem/also/dann/sonst...) -> inversion
  - #10 Infinitiv mit zu after subject-identity verbs (versuchen/hoffen/...)
  - #11 Infinitiv ohne zu (modal + perception verbs + lassen)
  - #17 je...desto/umso

Run: python scripts/update_grammar_gaps.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, 'public', 'data', 'grammar.json')

data = json.load(open(PATH, encoding='utf-8'))
by_ch = {c['ch']: c for c in data}


# ---- #7: Position-1 connectors -> Conjunctions chapter --------------------
conjunctions = by_ch['Conjunctions']
conjunctions['sections'].append({
    "title": "8.4 Adverbial Connectors (Position 1) – Inversion",
    "intro": "Some connectors are not coordinating conjunctions like und/aber/oder/denn — they are adverbs that link two main clauses while occupying Position 1 themselves. Because the conjugated verb must stay in Position 2 (V2 rule), the subject is pushed to Position 3. Pattern: Connector (Pos 1) -> Verb (Pos 2) -> Subject (Pos 3) -> rest. This is called inversion. Common ones: deshalb/deswegen/daher (therefore), trotzdem/dennoch (nevertheless), also (so), dann (then), sonst (otherwise), außerdem (besides), allerdings (however).",
    "tables": [
        [
            ["**Type**", "**Example**", "**Word order**"],
            ["Position 0 (und/aber/oder/denn)", "Es regnet, **und ich bleibe** zu Hause.", "Connector + Subject + Verb (no inversion)"],
            ["Position 1 (deshalb/trotzdem/also...)", "Es regnet, **deshalb bleibe ich** zu Hause.", "Connector + Verb + Subject (inversion)"],
        ],
        [
            ["**Connector**", "**Meaning**", "**Example (with inversion)**", "**English**"],
            ["**deshalb / deswegen**", "therefore, that's why", "Es regnet, **deshalb bleibe ich** zu Hause.", "It's raining, that's why I'm staying home."],
            ["**daher**", "hence, therefore", "Sie ist krank, **daher kann sie** nicht kommen.", "She is ill, hence she can't come."],
            ["**trotzdem**", "nevertheless", "Er war müde, **trotzdem ging er** joggen.", "He was tired, nevertheless he went jogging."],
            ["**dennoch**", "nevertheless (formal)", "Es war teuer, **dennoch kaufte sie** es.", "It was expensive, nevertheless she bought it."],
            ["**also**", "so, thus", "Ich habe verschlafen, **also komme ich** später.", "I overslept, so I'm coming later."],
            ["**dann**", "then", "Iss zuerst, **dann gehen wir** los.", "Eat first, then we'll go."],
            ["**sonst**", "otherwise", "Beeil dich, **sonst verpassen wir** den Bus.", "Hurry up, otherwise we'll miss the bus."],
            ["**außerdem**", "besides, moreover", "Das Hotel ist teuer, **außerdem liegt es** weit weg.", "The hotel is expensive, besides it's far away."],
            ["**allerdings**", "however", "Das stimmt, **allerdings fehlen** noch Details.", "That's true, however details are still missing."],
        ],
    ],
    "examples": [
        {"de": "Ich habe keine Zeit, **deshalb gehe ich** nicht mit.", "en": "I don't have time, that's why I'm not coming along."},
        {"de": "Sie spricht kein Englisch, **trotzdem hat sie** den Job bekommen.", "en": "She doesn't speak English, nevertheless she got the job."},
        {"de": "Wir hatten kein Geld, **also blieben wir** zu Hause.", "en": "We had no money, so we stayed home."},
    ],
})


# ---- #11: Infinitiv ohne zu -> Verbs chapter -------------------------------
verbs = by_ch['Verbs']
verbs['sections'].append({
    "title": "5.9 Infinitiv ohne zu – Modal & Perception Verbs",
    "intro": "Several verb groups are followed by a **bare infinitive** (no 'zu') at the end of the clause. Modal verbs (können, müssen, wollen, sollen, dürfen, mögen) always take a bare infinitive (see 5.4). Perception verbs (sehen, hören, fühlen, spüren) and **lassen** also take a bare infinitive when describing a directly perceived or caused action: lassen + Akkusativ + Infinitiv means either 'to have something done' (causative) or 'to let someone do something' (permission). The verbs bleiben and gehen can likewise be followed by a bare infinitive of posture/leisure verbs.",
    "tables": [
        [
            ["**Verb type**", "**Example**", "**English**", "**Note**"],
            ["Modalverb", "Ich **muss** früh **aufstehen**.", "I have to get up early.", "Modal + bare infinitive (see 5.4)"],
            ["Wahrnehmung: sehen", "Ich **sehe** die Kinder **spielen**.", "I see the children playing.", "sehen + Akk. + bare infinitive"],
            ["Wahrnehmung: hören", "Wir **hören** den Vogel **singen**.", "We hear the bird singing.", "hören + Akk. + bare infinitive"],
            ["lassen (causative)", "Sie **lässt** ihr Auto **reparieren**.", "She has her car repaired.", "lassen + Akk. + bare infinitive = 'have something done'"],
            ["lassen (permission)", "Er **lässt** mich **fahren**.", "He lets me drive.", "lassen + Akk. + bare infinitive = 'let someone do'"],
            ["bleiben + Verb", "Das Kind **bleibt** im Bett **liegen**.", "The child stays lying in bed.", "bleiben + bare infinitive (posture verbs)"],
            ["gehen + Verb", "Wir **gehen** heute **schwimmen**.", "We're going swimming today.", "gehen + bare infinitive (leisure activities)"],
        ],
    ],
    "examples": [
        {"de": "Ich **höre** dich **kommen**.", "en": "I hear you coming."},
        {"de": "Der Friseur **lässt** mich lange **warten**.", "en": "The hairdresser makes me wait a long time."},
        {"de": "Sie **bleibt** am Telefon **stehen**.", "en": "She remains standing at the phone."},
    ],
})


# ---- #10: Infinitiv mit zu after versuchen/hoffen/planen... ----------------
partizip = by_ch['Partizipialkonstruktionen']
inf_section = next(s for s in partizip['sections'] if s['title'].startswith('Infinitivkonstruktionen'))
inf_section['intro'] += (
    " Many common verbs are followed directly by **zu + Infinitiv** when the subject of both "
    "clauses is the same: versuchen, hoffen, planen, beginnen, vergessen, vorhaben, aufhören, "
    "sich freuen (auf/über)."
)
inf_section['tables'].append([
    ["**Verb**", "**Example**", "**English**"],
    ["versuchen", "Er **versucht**, pünktlich **zu kommen**.", "He tries to arrive on time."],
    ["hoffen", "Ich **hoffe**, dich bald **zu sehen**.", "I hope to see you soon."],
    ["planen", "Wir **planen**, nach Berlin **zu fahren**.", "We plan to travel to Berlin."],
    ["beginnen", "Sie **beginnt**, Deutsch **zu lernen**.", "She is starting to learn German."],
    ["vergessen", "Er **vergisst** oft, die Tür **abzuschließen**.", "He often forgets to lock the door."],
    ["sich freuen (auf)", "Ich **freue mich darauf**, euch **zu sehen**.", "I'm looking forward to seeing you."],
    ["aufhören", "Hör auf, so laut **zu reden**!", "Stop talking so loudly!"],
])
inf_section['examples'] += [
    {"de": "Er **versucht**, jeden Tag Sport **zu machen**.", "en": "He tries to do sports every day."},
    {"de": "Ich **hoffe**, die Prüfung **zu bestehen**.", "en": "I hope to pass the exam."},
]


# ---- #17: je...desto/umso -> Erweiterte Syntax & Konnektoren --------------
erweiterte = by_ch['Erweiterte Syntax & Konnektoren']
konnektoren_section = next(s for s in erweiterte['sections'] if s['title'].startswith('Zweiteilige Konnektoren'))
for table in konnektoren_section['tables']:
    for row in table:
        if row[0] == 'je … desto':
            row[0] = 'je … desto / umso'
            row[2] = '**Je** mehr man lernt, **desto/umso** besser versteht man.'
konnektoren_section['examples'].append(
    "**Je** länger die Prüfung dauert, **umso** müder werde ich. (The longer the exam lasts, the more tired I become.)"
)


with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)

print('Updated grammar.json')
print('Conjunctions sections:', [s['title'] for s in conjunctions['sections']])
print('Verbs sections:', [s['title'] for s in verbs['sections']])
