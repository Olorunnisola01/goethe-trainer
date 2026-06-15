# -*- coding: utf-8 -*-
"""Dissolve the 'From Short Stories'/'Aus Kurzgeschichten' categories by moving each
entry into the best existing category per level, then de-duplicate headwords
(keep first occurrence in document order). Recompute per-level totals."""
import json, os, datetime, collections
proj = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer'
VJSON = os.path.join(proj,'public','data','vocab.json')
STORY = {'FROM SHORT STORIES','AUS KURZGESCHICHTEN'}

MAP = {
 'A1': {
   'darin':'BASIC PREPOSITIONS IN CONTEXT','vorbei':'BASIC PREPOSITIONS IN CONTEXT',
   'der Spaß':'COMMON EVERYDAY VERBS','bekommen':'BASIC VERBS & ACTIONS','der Magen':'HEALTH & BODY',
 },
 'A2': {
   'namens':'CONNECTORS & USEFUL PHRASES','lustig':'DESCRIPTIONS: CHARACTER & APPEARANCE',
   'diesmal':'CONNECTORS & USEFUL PHRASES','froh':'FEELINGS & EMOTIONS','der Dollar':'POST OFFICE & BANKING',
   'mögen':'FEELINGS & EMOTIONS','bewegen':'SPORT & BODY VOCABULARY','das Boot':'TRANSPORT & GETTING AROUND',
   'herum':'DIRECTIONS & LOCATION','hinzu':'CONNECTORS & USEFUL PHRASES','der Ball':'LEISURE, HOBBIES & SPORTS',
   'großartig':'DESCRIPTIONS: CHARACTER & APPEARANCE','schlimm':'DESCRIPTIONS: CHARACTER & APPEARANCE',
   'letzte':'COMPARING & CONTRASTING','erwarten':'APPOINTMENTS & PLANNING','die Planung':'APPOINTMENTS & PLANNING',
   'der Schwanz':'NATURE, ANIMALS & ENVIRONMENT','komisch':'DESCRIPTIONS: CHARACTER & APPEARANCE',
   'zuvor':'CONNECTORS & USEFUL PHRASES','verpassen':'TRANSPORT & GETTING AROUND','daneben':'DIRECTIONS & LOCATION',
   'innen':'DIRECTIONS & LOCATION','behalten':'DAILY ROUTINE & HOUSEHOLD',
 },
 'B1': {
   'klopfen':'HOUSEHOLD REPAIRS & DIY','die Kiste':'HOUSING, RENTING & MOVING','seltsam':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES',
   'herein':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','die Bushaltestelle':'TRAFFIC, ROADS & TRANSPORT LAW',
   'betrachten':'THINKING, REASONING & PROBLEM SOLVING','der Keks':'COOKING METHODS & FOOD CULTURE','springen':'SPORTS',
   'die Ziege':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN','der Eimer':'HOUSEHOLD REPAIRS & DIY',
   'zittern':'HEALTH, FITNESS & WELLBEING','beobachten':'THINKING, REASONING & PROBLEM SOLVING',
   'sich unterhalten':'LANGUAGE & COMMUNICATION SKILLS','silbern':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES',
   'verloren':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','der Zettel':'WRITING SKILLS & TEXT TYPES',
   'der Löwe':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN','der Knopf':'HOUSEHOLD REPAIRS & DIY',
   'drücken':'DESCRIBING PROCESSES & PROCEDURES','krachen':'DESCRIBING PROCESSES & PROCEDURES',
   'der Heimweg':'TRAFFIC, ROADS & TRANSPORT LAW','die Magie':'CULTURAL LIFE, FESTIVALS & TRADITIONS',
   'merken':'THINKING, REASONING & PROBLEM SOLVING','das Tuch':'HOUSEHOLD REPAIRS & DIY',
   'der Zoo':'CULTURAL LIFE, FESTIVALS & TRADITIONS','das Müsli':'COOKING METHODS & FOOD CULTURE',
   'verschwinden':'DESCRIBING PROCESSES & PROCEDURES','sich drehen':'DESCRIBING PROCESSES & PROCEDURES',
   'besorgt':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','fremd':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES',
   'erfahren':'THINKING, REASONING & PROBLEM SOLVING','beibringen':'FURTHER EDUCATION & TRAINING',
   'rutschen':'DESCRIBING PROCESSES & PROCEDURES','zerbrechen':'DESCRIBING PROCESSES & PROCEDURES',
   'graben':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN','der Sand':'LANDSCAPE, GEOGRAPHY & REGIONS',
   'der Ballon':'CULTURAL LIFE, FESTIVALS & TRADITIONS','die Halbzeit':'SPORTS','der Torwart':'SPORTS',
   'verärgert':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','überraschen':'RELATIONSHIPS, SOCIAL DYNAMICS & CONFLICT',
   'der Alarm':'EMERGENCY SERVICES & CRISIS COMMUNICATION','der Dachboden':'CONSTRUCTION, ARCHITECTURE & HOUSING',
   'glänzend':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','der Käfig':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN',
   'das Unkraut':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN','beschließen':'DISCUSSING PLANS & INTENTIONS',
   'schief':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','der/die Angestellte':'WORK, ECONOMY & BUSINESS',
   'die Kette':'HOUSEHOLD REPAIRS & DIY','die Notiz':'WRITING SKILLS & TEXT TYPES','der Atem':'HEALTH, FITNESS & WELLBEING',
   'herbei':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','notieren':'WRITING SKILLS & TEXT TYPES',
   'die Heimatstadt':'LANDSCAPE, GEOGRAPHY & REGIONS','schmal':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES',
   'vermissen':'RELATIONSHIPS, SOCIAL DYNAMICS & CONFLICT','das Papier':'WRITING SKILLS & TEXT TYPES',
   'retten':'EMERGENCY SERVICES & CRISIS COMMUNICATION','der Geruch':'HEALTH, FITNESS & WELLBEING',
   'kräftig':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','fressen':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN',
   'der Stall':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN','stoßen':'DESCRIBING PROCESSES & PROCEDURES',
   'riechen':'HEALTH, FITNESS & WELLBEING','die Zwiebel':'COOKING METHODS & FOOD CULTURE','die Trommel':'CULTURE, ARTS & MEDIA',
   'blass':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','der Staub':'HOUSEHOLD REPAIRS & DIY',
   'rüber':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','umher':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES',
   'die Flut':'LANDSCAPE, GEOGRAPHY & REGIONS','die Welle':'LANDSCAPE, GEOGRAPHY & REGIONS',
   'die Astronomie':'SCIENCE, RESEARCH & EDUCATION','deuten (auf)':'LANGUAGE & COMMUNICATION SKILLS',
   'die Zeichnung':'CULTURE, ARTS & MEDIA','die Galaxie':'SCIENCE, RESEARCH & EDUCATION',
   'hinein':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','jener':'EXTENDED GRAMMAR VOCABULARY: WORD ORDER & CLAUSES',
   'verwirrt':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','schmücken':'CULTURAL LIFE, FESTIVALS & TRADITIONS',
   'das Fell':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN','das Futter':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN',
   'begleiten':'RELATIONSHIPS, SOCIAL DYNAMICS & CONFLICT','der Affe':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN',
   'die Oma':'FAMILY LIFE, EVENTS & LAW','der Duft':'COOKING METHODS & FOOD CULTURE','erfüllen':'ABSTRACT & ACADEMIC LANGUAGE',
   'winzig':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','der Schmuck':'CULTURAL LIFE, FESTIVALS & TRADITIONS',
   'der Schatz':'CULTURAL LIFE, FESTIVALS & TRADITIONS','die Güte':'PHILOSOPHY, ETHICS & VALUES',
   'örtlich':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','schießen':'SPORTS','bemerken':'THINKING, REASONING & PROBLEM SOLVING',
   'erledigen':'WORK, ECONOMY & BUSINESS','der Tropfen':'COOKING METHODS & FOOD CULTURE',
   'endlos':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','woanders':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES',
   'hinauf':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','der Honig':'COOKING METHODS & FOOD CULTURE',
   'reinigen':'HOUSEHOLD REPAIRS & DIY','das Kabel':'TECHNOLOGY & DIGITAL LIFE','versagen':'WORK, ECONOMY & BUSINESS',
   'die Richterin':'LAW & LEGAL RIGHTS','wahr':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES',
   'schüchtern':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','die Königin':'SOCIETY, POLITICS & CITIZENSHIP',
   'aufgehen':'DESCRIBING PROCESSES IN NATURE & SCIENCE','der Samen':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN',
   'nebenan':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','wochenlang':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES',
   'die Schüssel':'COOKING METHODS & FOOD CULTURE','der Riss':'HOUSEHOLD REPAIRS & DIY','trocknen':'HOUSEHOLD REPAIRS & DIY',
   'stabil':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','betreten':'DESCRIBING LOCATION & SPATIAL RELATIONSHIPS',
   'hinüber':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','die Lektion':'FURTHER EDUCATION & TRAINING',
   'hetzen':'DESCRIBING PROCESSES & PROCEDURES','das Kätzchen':'AGRICULTURE, FOOD PRODUCTION & SUPPLY CHAIN',
   'der Knoblauch':'COOKING METHODS & FOOD CULTURE','das Abenteuer':'TRAVEL & CULTURE','das Plakat':'MEDIA LITERACY & JOURNALISM',
   'die Kerze':'HOUSEHOLD REPAIRS & DIY','der Stein':'LANDSCAPE, GEOGRAPHY & REGIONS','die Jahreszeit':'LANDSCAPE, GEOGRAPHY & REGIONS',
   'genießen':'TRAVEL & CULTURE','das Rätsel':'THINKING, REASONING & PROBLEM SOLVING','die Soße':'COOKING METHODS & FOOD CULTURE',
   'stumm':'EXTENDED ADJECTIVES & ADVERBIAL PHRASES','sinken':'DESCRIBING PROCESSES IN NATURE & SCIENCE',
   'freiwillig':'SOCIAL ISSUES & VOLUNTEERING',
 },
 'B2': {
   'nicken':'FORTGESCHRITTENE VERBEN','schütteln':'FORTGESCHRITTENE VERBEN','die Krabbe':'NATUR, LANDSCHAFT & TIERWELT',
   'die Brieftasche':'KOMPLEXE NOMEN','die Karotte':'ERNÄHRUNG & GESUNDER LEBENSSTIL','wischen':'FORTGESCHRITTENE VERBEN',
   'winken':'FORTGESCHRITTENE VERBEN','der Luftballon':'KOMPLEXE NOMEN','das Sandwich':'ERNÄHRUNG & GESUNDER LEBENSSTIL',
   'schweigen':'FORTGESCHRITTENE VERBEN','unordentlich':'FORTGESCHRITTENE ADJEKTIVE','das Lieblingsessen':'ERNÄHRUNG & GESUNDER LEBENSSTIL',
   'kauen':'FORTGESCHRITTENE VERBEN','belebt':'FORTGESCHRITTENE ADJEKTIVE','unerwartet':'FORTGESCHRITTENE ADJEKTIVE',
   'kneifen':'FORTGESCHRITTENE VERBEN','salzig':'ERNÄHRUNG & GESUNDER LEBENSSTIL','ausgefallen':'FORTGESCHRITTENE ADJEKTIVE',
   'sich weiten':'FORTGESCHRITTENE VERBEN','der Laden':'KONSUM, WERBUNG & VERBRAUCHERSCHUTZ','töpfern':'KREATIVITÄT & KUNSTPRODUKTION',
   'der Schultag':'BILDUNG & SCHULSYSTEM','sich hinsetzen':'FORTGESCHRITTENE VERBEN','herüber':'KONNEKTOREN & SATZVERBINDUNG',
   'stöhnen':'FORTGESCHRITTENE VERBEN','grinsen':'FORTGESCHRITTENE VERBEN','die Parkbank':'KOMPLEXE NOMEN',
   'das Spielzeug':'KOMPLEXE NOMEN','bedecken':'FORTGESCHRITTENE VERBEN','die Tomatensauce':'ERNÄHRUNG & GESUNDER LEBENSSTIL',
   'das Basilikum':'ERNÄHRUNG & GESUNDER LEBENSSTIL','füttern':'NATUR, LANDSCHAFT & TIERWELT','starren':'FORTGESCHRITTENE VERBEN',
   'eilen':'FORTGESCHRITTENE VERBEN','aufheben':'FORTGESCHRITTENE VERBEN','das Kochbuch':'ERNÄHRUNG & GESUNDER LEBENSSTIL',
   'das Gewürz':'ERNÄHRUNG & GESUNDER LEBENSSTIL','schaukeln':'FORTGESCHRITTENE VERBEN','klettern':'SPORT, FREIZEIT & HOBBYS',
   'der Tänzer':'THEATER, FILM & DARSTELLENDE KUNST','fegen':'FORTGESCHRITTENE VERBEN','die Muschel':'NATUR, LANDSCHAFT & TIERWELT',
   'zappeln':'FORTGESCHRITTENE VERBEN','wiederkommen':'FORTGESCHRITTENE VERBEN','verängstigt':'FORTGESCHRITTENE ADJEKTIVE',
   'das Halsband':'KOMPLEXE NOMEN','die Giraffe':'NATUR, LANDSCHAFT & TIERWELT','verspielt':'FORTGESCHRITTENE ADJEKTIVE',
   'das Gehege':'NATUR, LANDSCHAFT & TIERWELT','beängstigend':'FORTGESCHRITTENE ADJEKTIVE','der Einband':'LITERATUR & LITERARISCHE GENRES',
   'das Fußballspiel':'SPORT, FREIZEIT & HOBBYS','jubeln':'FORTGESCHRITTENE VERBEN','die Nettigkeit':'KOMPLEXE NOMEN',
   'der Regentropfen':'NATUR, LANDSCHAFT & TIERWELT','ertönen':'FORTGESCHRITTENE VERBEN','verriegelt':'FORTGESCHRITTENE ADJEKTIVE',
   'stoppen':'FORTGESCHRITTENE VERBEN','durchsuchen':'FORTGESCHRITTENE VERBEN','die Geburtstagsfeier':'KOMPLEXE NOMEN',
   'testen':'FORTGESCHRITTENE VERBEN','umarmen':'FORTGESCHRITTENE VERBEN','erwidern':'FORTGESCHRITTENE VERBEN',
   'verbrennen':'FORTGESCHRITTENE VERBEN','klatschen':'FORTGESCHRITTENE VERBEN','dunkelblau':'FORTGESCHRITTENE ADJEKTIVE',
   'atmen':'KÖRPER, SINNE & MEDIZIN','die Schaufel':'KOMPLEXE NOMEN','hinzufügen':'FORTGESCHRITTENE VERBEN',
   'der Karton':'KOMPLEXE NOMEN','zerbrochen':'FORTGESCHRITTENE ADJEKTIVE','die Pfote':'NATUR, LANDSCHAFT & TIERWELT',
   'schimpfen':'FORTGESCHRITTENE VERBEN','die Kunstausstellung':'KREATIVITÄT & KUNSTPRODUKTION','betreiben':'FORTGESCHRITTENE VERBEN',
   'klingen':'FORTGESCHRITTENE VERBEN','scherzen':'FORTGESCHRITTENE VERBEN','der Tagesablauf':'KOMPLEXE NOMEN',
   'seufzen':'FORTGESCHRITTENE VERBEN','das Dessert':'ERNÄHRUNG & GESUNDER LEBENSSTIL','zubereiten':'ERNÄHRUNG & GESUNDER LEBENSSTIL',
   'berühren':'FORTGESCHRITTENE VERBEN','reinlegen':'FORTGESCHRITTENE VERBEN','anzünden':'FORTGESCHRITTENE VERBEN',
   'toben':'FORTGESCHRITTENE VERBEN','stillstehen':'FORTGESCHRITTENE VERBEN','der Schneefall':'NATUR, LANDSCHAFT & TIERWELT',
   'die Flocke':'NATUR, LANDSCHAFT & TIERWELT','die Türschwelle':'KOMPLEXE NOMEN','das Mietshaus':'WOHNEN & STADTENTWICKLUNG',
   'der Donner':'NATUR, LANDSCHAFT & TIERWELT','der Schoß':'KÖRPER, SINNE & MEDIZIN','hupen':'FORTGESCHRITTENE VERBEN',
 },
}

data = json.load(open(VJSON, encoding='utf-8'))
# per-level lookup of existing (non-story) categories by title
bytitle = {lv: {} for lv in MAP}
for c in data:
    lv = c.get('level')
    if lv in bytitle and c['title'] not in STORY:
        bytitle[lv][c['title']] = c

# validate every MAP target exists
errors = []
for lv, m in MAP.items():
    for w_, tgt in m.items():
        if tgt not in bytitle[lv]:
            errors.append(f'{lv}: target category not found for {w_!r}: {tgt!r}')
if errors:
    print('TARGET ERRORS — aborting:'); [print(' ', e) for e in errors]; raise SystemExit(1)

# reshuffle: move story entries into target categories
moved = collections.Counter(); unmapped = []
for c in data:
    lv = c.get('level')
    if lv in MAP and c['title'] in STORY:
        for e in c['entries']:
            w_ = e.get('w','')
            tgt = MAP[lv].get(w_)
            if not tgt: unmapped.append((lv,w_)); continue
            bytitle[lv][tgt]['entries'].append(e); moved[lv]+=1
if unmapped:
    print('UNMAPPED — aborting:'); [print(' ',u) for u in unmapped]; raise SystemExit(1)

# drop the now-empty story categories
data = [c for c in data if c['title'] not in STORY]

# de-duplicate headwords: keep FIRST occurrence (document order) within each level
removed = collections.Counter()
seen = {}  # (level, key) -> True
for c in data:
    lv = c.get('level')
    kept = []
    for e in c['entries']:
        key = (lv, (e.get('w','') or '').strip().lower())
        if key in seen:
            removed[lv]+=1
            continue
        seen[key] = True
        kept.append(e)
    c['entries'] = kept

# backup + write
ts = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
json.dump(json.load(open(VJSON,encoding='utf-8')), open(os.path.join(proj,'backups',f'vocab.pre-reshuffle-{ts}.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=2)
json.dump(data, open(VJSON,'w',encoding='utf-8'), ensure_ascii=False, indent=2)

tot = collections.Counter()
for c in data:
    if c.get('level') in MAP: tot[c['level']] += len(c['entries'])
print('moved into existing categories:', dict(moved), ' total', sum(moved.values()))
print('duplicate headwords removed (keep-first):', dict(removed), ' total', sum(removed.values()))
print('story categories remaining:', sum(1 for c in data if c['title'] in STORY))
print('NEW per-level totals:', dict(tot))
