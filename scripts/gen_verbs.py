"""
Generate public/data/verbs.json with German verbs — Präsens, Präteritum, Perfekt.
Run: python scripts/gen_verbs.py
"""
import json, os

# ── Present-tense helpers ────────────────────────────────────────
def w(s):   return {'ich':f'{s}e','du':f'{s}st','er/sie/es':f'{s}t','wir':f'{s}en','ihr':f'{s}t','sie/Sie':f'{s}en'}
def we(s):  return {'ich':f'{s}e','du':f'{s}est','er/sie/es':f'{s}et','wir':f'{s}en','ihr':f'{s}et','sie/Sie':f'{s}en'}
def ws(s):  return {'ich':f'{s}e','du':f'{s}t','er/sie/es':f'{s}t','wir':f'{s}en','ihr':f'{s}t','sie/Sie':f'{s}en'}
def c(i,d,e,wir,ihr,sie): return {'ich':i,'du':d,'er/sie/es':e,'wir':wir,'ihr':ihr,'sie/Sie':sie}
def sep(f,p): return {k:f'{v} {p}' for k,v in f.items()}

# ── Präteritum helpers ───────────────────────────────────────────
def pw(s):   # weak
    return {'ich':f'{s}te','du':f'{s}test','er/sie/es':f'{s}te','wir':f'{s}ten','ihr':f'{s}tet','sie/Sie':f'{s}ten'}
def pwe(s):  # weak with e-insertion (stem ends in t/d/consonant cluster)
    return {'ich':f'{s}ete','du':f'{s}etest','er/sie/es':f'{s}ete','wir':f'{s}eten','ihr':f'{s}etet','sie/Sie':f'{s}eten'}
def ps(s):   # strong (ich/er = bare stem, du+st, wir/sie+en, ihr+t)
    return {'ich':s,'du':f'{s}st','er/sie/es':s,'wir':f'{s}en','ihr':f'{s}t','sie/Sie':f'{s}en'}
def pss(s):  # strong, stem ends in s/ß/z (du=ihr = stem+t)
    return {'ich':s,'du':f'{s}t','er/sie/es':s,'wir':f'{s}en','ihr':f'{s}t','sie/Sie':f'{s}en'}
def pse(s):  # strong, stem ends in t/d (e-insert for du/ihr)
    return {'ich':s,'du':f'{s}est','er/sie/es':s,'wir':f'{s}en','ihr':f'{s}et','sie/Sie':f'{s}en'}
def pc(i,d,e,wir,ihr,sie): return {'ich':i,'du':d,'er/sie/es':e,'wir':wir,'ihr':ihr,'sie/Sie':sie}
def sep_p(prät, pfx): return {k:f'{v} {pfx}' for k,v in prät.items()}

# ── Perfekt helpers ──────────────────────────────────────────────
def ph(p2):  # haben + Partizip II
    return {'ich':f'habe {p2}','du':f'hast {p2}','er/sie/es':f'hat {p2}','wir':f'haben {p2}','ihr':f'habt {p2}','sie/Sie':f'haben {p2}'}
def ps2(p2): # sein + Partizip II
    return {'ich':f'bin {p2}','du':f'bist {p2}','er/sie/es':f'ist {p2}','wir':f'sind {p2}','ihr':f'seid {p2}','sie/Sie':f'sind {p2}'}

# ── Verb data ────────────────────────────────────────────────────
# (id, verb, meaning, level, category, irregular, present, praeteritum, perfekt)
RAW = [

# ════════════════════════════════════════════════════════════════
# A1 — 80 verbs
# ════════════════════════════════════════════════════════════════

# Hilfsverben (3)
('sein','sein','to be','A1','Hilfsverb',True,
 c('bin','bist','ist','sind','seid','sind'),
 pc('war','warst','war','waren','wart','waren'),
 ps2('gewesen')),

('haben','haben','to have','A1','Hilfsverb',True,
 c('habe','hast','hat','haben','habt','haben'),
 pw('hat'),
 ph('gehabt')),

('werden','werden','to become','A1','Hilfsverb',True,
 c('werde','wirst','wird','werden','werdet','werden'),
 pc('wurde','wurdest','wurde','wurden','wurdet','wurden'),
 ps2('geworden')),

# Modalverben (6)
('koennen','können','to be able to / can','A1','Modal',True,
 c('kann','kannst','kann','können','könnt','können'),
 pw('konn'),
 ph('gekonnt')),

('muessen','müssen','to have to / must','A1','Modal',True,
 c('muss','musst','muss','müssen','müsst','müssen'),
 pw('muss'),
 ph('gemusst')),

('wollen','wollen','to want to','A1','Modal',True,
 c('will','willst','will','wollen','wollt','wollen'),
 pw('woll'),
 ph('gewollt')),

('sollen','sollen','should / to be supposed to','A1','Modal',True,
 c('soll','sollst','soll','sollen','sollt','sollen'),
 pw('soll'),
 ph('gesollt')),

('duerfen','dürfen','to be allowed to / may','A1','Modal',True,
 c('darf','darfst','darf','dürfen','dürft','dürfen'),
 pw('durf'),
 ph('gedurft')),

('moegen','mögen','to like','A1','Modal',True,
 c('mag','magst','mag','mögen','mögt','mögen'),
 pw('moch'),
 ph('gemocht')),

# Starke Verben A1 (20)
('sehen','sehen','to see','A1','Stark',True,
 c('sehe','siehst','sieht','sehen','seht','sehen'),
 ps('sah'),
 ph('gesehen')),

('sprechen','sprechen','to speak','A1','Stark',True,
 c('spreche','sprichst','spricht','sprechen','sprecht','sprechen'),
 ps('sprach'),
 ph('gesprochen')),

('lesen','lesen','to read','A1','Stark',True,
 c('lese','liest','liest','lesen','lest','lesen'),
 pss('las'),
 ph('gelesen')),

('fahren','fahren','to drive / travel','A1','Stark',True,
 c('fahre','fährst','fährt','fahren','fahrt','fahren'),
 ps('fuhr'),
 ps2('gefahren')),

('nehmen','nehmen','to take','A1','Stark',True,
 c('nehme','nimmst','nimmt','nehmen','nehmt','nehmen'),
 ps('nahm'),
 ph('genommen')),

('geben','geben','to give','A1','Stark',True,
 c('gebe','gibst','gibt','geben','gebt','geben'),
 ps('gab'),
 ph('gegeben')),

('schlafen','schlafen','to sleep','A1','Stark',True,
 c('schlafe','schläfst','schläft','schlafen','schlaft','schlafen'),
 ps('schlief'),
 ph('geschlafen')),

('essen','essen','to eat','A1','Stark',True,
 c('esse','isst','isst','essen','esst','essen'),
 pss('aß'),
 ph('gegessen')),

('trinken','trinken','to drink','A1','Stark',False,
 w('trink'),
 ps('trank'),
 ph('getrunken')),

('gehen','gehen','to go','A1','Stark',False,
 w('geh'),
 ps('ging'),
 ps2('gegangen')),

('kommen','kommen','to come','A1','Stark',False,
 w('komm'),
 ps('kam'),
 ps2('gekommen')),

('schreiben','schreiben','to write','A1','Stark',False,
 w('schreib'),
 ps('schrieb'),
 ph('geschrieben')),

('heissen','heißen','to be called','A1','Stark',False,
 ws('heiß'),
 pss('hieß'),
 ph('geheißen')),

('wissen','wissen','to know (a fact)','A1','Stark',True,
 c('weiß','weißt','weiß','wissen','wisst','wissen'),
 pw('wuss'),
 ph('gewusst')),

('tragen','tragen','to carry / wear','A1','Stark',True,
 c('trage','trägst','trägt','tragen','tragt','tragen'),
 ps('trug'),
 ph('getragen')),

('fallen','fallen','to fall','A1','Stark',True,
 c('falle','fällst','fällt','fallen','fallt','fallen'),
 ps('fiel'),
 ps2('gefallen')),

('halten','halten','to hold / stop','A1','Stark',True,
 c('halte','hältst','hält','halten','haltet','halten'),
 pse('hielt'),
 ph('gehalten')),

('waschen','waschen','to wash','A1','Stark',True,
 c('wasche','wäschst','wäscht','waschen','wascht','waschen'),
 ps('wusch'),
 ph('gewaschen')),

('bleiben','bleiben','to stay / remain','A1','Stark',False,
 w('bleib'),
 ps('blieb'),
 ps2('geblieben')),

('fliegen','fliegen','to fly','A1','Stark',False,
 w('flieg'),
 ps('flog'),
 ps2('geflogen')),

# Schwache Verben A1 (35)
('machen','machen','to make / do','A1','Schwach',False,
 w('mach'), pw('mach'), ph('gemacht')),

('wohnen','wohnen','to live / reside','A1','Schwach',False,
 w('wohn'), pw('wohn'), ph('gewohnt')),

('lernen','lernen','to learn','A1','Schwach',False,
 w('lern'), pw('lern'), ph('gelernt')),

('hoeren','hören','to hear / listen','A1','Schwach',False,
 w('hör'), pw('hör'), ph('gehört')),

('kaufen','kaufen','to buy','A1','Schwach',False,
 w('kauf'), pw('kauf'), ph('gekauft')),

('spielen','spielen','to play','A1','Schwach',False,
 w('spiel'), pw('spiel'), ph('gespielt')),

('arbeiten','arbeiten','to work','A1','Schwach',False,
 we('arbeit'), pwe('arbeit'), ph('gearbeitet')),

('suchen','suchen','to search / look for','A1','Schwach',False,
 w('such'), pw('such'), ph('gesucht')),

('brauchen','brauchen','to need','A1','Schwach',False,
 w('brauch'), pw('brauch'), ph('gebraucht')),

('leben','leben','to live (be alive)','A1','Schwach',False,
 w('leb'), pw('leb'), ph('gelebt')),

('lieben','lieben','to love','A1','Schwach',False,
 w('lieb'), pw('lieb'), ph('geliebt')),

('zahlen','zahlen','to pay / count','A1','Schwach',False,
 w('zahl'), pw('zahl'), ph('gezahlt')),

('lachen','lachen','to laugh','A1','Schwach',False,
 w('lach'), pw('lach'), ph('gelacht')),

('weinen','weinen','to cry','A1','Schwach',False,
 w('wein'), pw('wein'), ph('geweint')),

('singen','singen','to sing','A1','Schwach',False,
 w('sing'),
 ps('sang'),
 ph('gesungen')),

('malen','malen','to paint / draw','A1','Schwach',False,
 w('mal'), pw('mal'), ph('gemalt')),

('holen','holen','to fetch / get','A1','Schwach',False,
 w('hol'), pw('hol'), ph('geholt')),

('schicken','schicken','to send','A1','Schwach',False,
 w('schick'), pw('schick'), ph('geschickt')),

('buchen','buchen','to book / reserve','A1','Schwach',False,
 w('buch'), pw('buch'), ph('gebucht')),

('legen','legen','to lay / put down','A1','Schwach',False,
 w('leg'), pw('leg'), ph('gelegt')),

('stellen','stellen','to place / put upright','A1','Schwach',False,
 w('stell'), pw('stell'), ph('gestellt')),

('rufen','rufen','to call / shout','A1','Schwach',False,
 w('ruf'),
 ps('rief'),
 ph('gerufen')),

('rennen','rennen','to run','A1','Schwach',False,
 w('renn'),
 pw('rann'),
 ps2('gerannt')),

('schwimmen','schwimmen','to swim','A1','Schwach',False,
 w('schwimm'),
 ps('schwamm'),
 ph('geschwommen')),

('schenken','schenken','to give as a gift','A1','Schwach',False,
 w('schenk'), pw('schenk'), ph('geschenkt')),

('bauen','bauen','to build','A1','Schwach',False,
 w('bau'), pw('bau'), ph('gebaut')),

('reden','reden','to talk','A1','Schwach',False,
 we('red'), pwe('red'), ph('geredet')),

('kosten','kosten','to cost','A1','Schwach',False,
 we('kost'), pwe('kost'), ph('gekostet')),

('danken','danken','to thank','A1','Schwach',False,
 w('dank'), pw('dank'), ph('gedankt')),

('zeichnen','zeichnen','to draw (sketch)','A1','Schwach',False,
 we('zeichn'), pwe('zeichn'), ph('gezeichnet')),

('oeffnen','öffnen','to open','A1','Schwach',False,
 we('öffn'), pwe('öffn'), ph('geöffnet')),

('zaehlen','zählen','to count','A1','Schwach',False,
 w('zähl'), pw('zähl'), ph('gezählt')),

('gruessen','grüßen','to greet','A1','Schwach',False,
 ws('grüß'), pw('grüß'), ph('gegrüßt')),

('putzen','putzen','to clean','A1','Schwach',False,
 ws('putz'), pw('putz'), ph('geputzt')),

('tanzen','tanzen','to dance','A1','Schwach',False,
 ws('tanz'), pw('tanz'), ph('getanzt')),

# Trennbare Verben A1 (16)
('aufmachen','aufmachen','to open','A1','Trennbar',False,
 sep(w('mach'),'auf'),
 sep_p(pw('mach'),'auf'),
 ph('aufgemacht')),

('zumachen','zumachen','to close','A1','Trennbar',False,
 sep(w('mach'),'zu'),
 sep_p(pw('mach'),'zu'),
 ph('zugemacht')),

('anrufen','anrufen','to call (phone)','A1','Trennbar',False,
 sep(w('ruf'),'an'),
 sep_p(ps('rief'),'an'),
 ph('angerufen')),

('aufstehen','aufstehen','to get up','A1','Trennbar',False,
 sep(w('steh'),'auf'),
 sep_p(ps('stand'),'auf'),
 ps2('aufgestanden')),

('einkaufen','einkaufen','to go shopping','A1','Trennbar',False,
 sep(w('kauf'),'ein'),
 sep_p(pw('kauf'),'ein'),
 ph('eingekauft')),

('fernsehen','fernsehen','to watch TV','A1','Trennbar',True,
 sep(c('sehe','siehst','sieht','sehen','seht','sehen'),'fern'),
 sep_p(ps('sah'),'fern'),
 ph('ferngesehen')),

('ankommen','ankommen','to arrive','A1','Trennbar',False,
 sep(w('komm'),'an'),
 sep_p(ps('kam'),'an'),
 ps2('angekommen')),

('mitkommen','mitkommen','to come along','A1','Trennbar',False,
 sep(w('komm'),'mit'),
 sep_p(ps('kam'),'mit'),
 ps2('mitgekommen')),

('ausgehen','ausgehen','to go out','A1','Trennbar',False,
 sep(w('geh'),'aus'),
 sep_p(ps('ging'),'aus'),
 ps2('ausgegangen')),

('aufhoeren','aufhören','to stop (doing sth)','A1','Trennbar',False,
 sep(w('hör'),'auf'),
 sep_p(pw('hör'),'auf'),
 ph('aufgehört')),

('anfangen','anfangen','to begin / start','A1','Trennbar',True,
 sep(c('fange','fängst','fängt','fangen','fangt','fangen'),'an'),
 sep_p(ps('fing'),'an'),
 ph('angefangen')),

('mitnehmen','mitnehmen','to take along','A1','Trennbar',True,
 sep(c('nehme','nimmst','nimmt','nehmen','nehmt','nehmen'),'mit'),
 sep_p(ps('nahm'),'mit'),
 ph('mitgenommen')),

('einladen','einladen','to invite','A1','Trennbar',True,
 sep(c('lade','lädst','lädt','laden','ladet','laden'),'ein'),
 sep_p(ps('lud'),'ein'),
 ph('eingeladen')),

('aufwachen','aufwachen','to wake up','A1','Trennbar',False,
 {'ich':'wache auf','du':'wachst auf','er/sie/es':'wacht auf','wir':'wachen auf','ihr':'wacht auf','sie/Sie':'wachen auf'},
 sep_p(pw('wach'),'auf'),
 ps2('aufgewacht')),

('zurueckkommen','zurückkommen','to come back','A1','Trennbar',False,
 sep(w('komm'),'zurück'),
 sep_p(ps('kam'),'zurück'),
 ps2('zurückgekommen')),

('weitermachen','weitermachen','to continue','A1','Trennbar',False,
 sep(w('mach'),'weiter'),
 sep_p(pw('mach'),'weiter'),
 ph('weitergemacht')),

# ════════════════════════════════════════════════════════════════
# A2 — verbs
# ════════════════════════════════════════════════════════════════

# Starke Verben A2 (25)
('helfen','helfen','to help','A2','Stark',True,
 c('helfe','hilfst','hilft','helfen','helft','helfen'),
 ps('half'),
 ph('geholfen')),

('vergessen','vergessen','to forget','A2','Stark',True,
 c('vergesse','vergisst','vergisst','vergessen','vergesst','vergessen'),
 pss('vergaß'),
 ph('vergessen')),

('treffen','treffen','to meet','A2','Stark',True,
 c('treffe','triffst','trifft','treffen','trefft','treffen'),
 ps('traf'),
 ph('getroffen')),

('laufen','laufen','to run / walk','A2','Stark',True,
 c('laufe','läufst','läuft','laufen','lauft','laufen'),
 ps('lief'),
 ps2('gelaufen')),

('stehen','stehen','to stand','A2','Stark',False,
 w('steh'),
 ps('stand'),
 ph('gestanden')),

('liegen','liegen','to lie / be located','A2','Stark',False,
 w('lieg'),
 ps('lag'),
 ph('gelegen')),

('sitzen','sitzen','to sit','A2','Stark',False,
 ws('sitz'),
 pss('saß'),
 ph('gesessen')),

('beginnen','beginnen','to begin','A2','Stark',False,
 w('beginn'),
 ps('begann'),
 ph('begonnen')),

('verstehen','verstehen','to understand','A2','Stark',False,
 w('versteh'),
 pse('verstand'),
 ph('verstanden')),

('schlagen','schlagen','to hit / beat','A2','Stark',True,
 c('schlage','schlägst','schlägt','schlagen','schlagt','schlagen'),
 ps('schlug'),
 ph('geschlagen')),

('werfen','werfen','to throw','A2','Stark',True,
 c('werfe','wirfst','wirft','werfen','werft','werfen'),
 ps('warf'),
 ph('geworfen')),

('brechen','brechen','to break','A2','Stark',True,
 c('breche','brichst','bricht','brechen','brecht','brechen'),
 ps('brach'),
 ph('gebrochen')),

('steigen','steigen','to climb / rise','A2','Stark',False,
 w('steig'),
 ps('stieg'),
 ps2('gestiegen')),

('finden','finden','to find','A2','Stark',False,
 we('find'),
 pse('fand'),
 ph('gefunden')),

('schneiden','schneiden','to cut','A2','Stark',False,
 we('schneid'),
 pse('schnitt'),
 ph('geschnitten')),

('bieten','bieten','to offer','A2','Stark',False,
 we('biet'),
 pse('bot'),
 ph('geboten')),

('ziehen','ziehen','to pull / move','A2','Stark',False,
 w('zieh'),
 ps('zog'),
 ph('gezogen')),

('laden','laden','to load / invite','A2','Stark',True,
 c('lade','lädst','lädt','laden','ladet','laden'),
 ps('lud'),
 ph('geladen')),

('empfangen','empfangen','to receive / welcome','A2','Stark',True,
 c('empfange','empfängst','empfängt','empfangen','empfangt','empfangen'),
 ps('empfing'),
 ph('empfangen')),

('schliessen','schließen','to close / lock','A2','Stark',False,
 ws('schließ'),
 pss('schloss'),
 ph('geschlossen')),

('fliehen','fliehen','to flee','A2','Stark',False,
 w('flieh'),
 ps('floh'),
 ps2('geflohen')),

('reiten','reiten','to ride (horse)','A2','Stark',False,
 we('reit'),
 pse('ritt'),
 ps2('geritten')),

('streiten','streiten','to argue / quarrel','A2','Stark',False,
 we('streit'),
 pse('stritt'),
 ph('gestritten')),

('leiden','leiden','to suffer','A2','Stark',False,
 we('leid'),
 pse('litt'),
 ph('gelitten')),

('meiden','meiden','to avoid','A2','Stark',False,
 we('meid'),
 pse('mied'),
 ph('gemieden')),

# Schwache Verben A2
('kennen','kennen','to know / be familiar with','A2','Schwach',False,
 w('kenn'),
 pw('kann'),
 ph('gekannt')),

('denken','denken','to think','A2','Schwach',False,
 w('denk'),
 pc('dachte','dachtest','dachte','dachten','dachtet','dachten'),
 ph('gedacht')),

('sagen','sagen','to say','A2','Schwach',False,
 w('sag'), pw('sag'), ph('gesagt')),

('fragen','fragen','to ask','A2','Schwach',False,
 w('frag'), pw('frag'), ph('gefragt')),

('antworten','antworten','to answer','A2','Schwach',False,
 we('antwort'), pwe('antwort'), ph('geantwortet')),

('warten','warten','to wait','A2','Schwach',False,
 we('wart'), pwe('wart'), ph('gewartet')),

('hoffen','hoffen','to hope','A2','Schwach',False,
 w('hoff'), pw('hoff'), ph('gehofft')),

('glauben','glauben','to believe / think','A2','Schwach',False,
 w('glaub'), pw('glaub'), ph('geglaubt')),

('bezahlen','bezahlen','to pay','A2','Schwach',False,
 w('bezahl'), pw('bezahl'), ph('bezahlt')),

('kochen','kochen','to cook','A2','Schwach',False,
 w('koch'), pw('koch'), ph('gekocht')),

('zeigen','zeigen','to show','A2','Schwach',False,
 w('zeig'), pw('zeig'), ph('gezeigt')),

('bringen','bringen','to bring','A2','Schwach',False,
 w('bring'),
 pc('brachte','brachtest','brachte','brachten','brachtet','brachten'),
 ph('gebracht')),

('erklaeren','erklären','to explain','A2','Schwach',False,
 w('erklär'), pw('erklär'), ph('erklärt')),

('besuchen','besuchen','to visit','A2','Schwach',False,
 w('besuch'), pw('besuch'), ph('besucht')),

('verkaufen','verkaufen','to sell','A2','Schwach',False,
 w('verkauf'), pw('verkauf'), ph('verkauft')),

('bestellen','bestellen','to order','A2','Schwach',False,
 w('bestell'), pw('bestell'), ph('bestellt')),

('mieten','mieten','to rent','A2','Schwach',False,
 we('miet'), pwe('miet'), ph('gemietet')),

('setzen','setzen','to put / set','A2','Schwach',False,
 ws('setz'), pw('setz'), ph('gesetzt')),

('reisen','reisen','to travel','A2','Schwach',False,
 ws('reis'), pw('reis'), ps2('gereist')),

('spazieren','spazieren','to stroll / walk','A2','Schwach',False,
 w('spazier'), pw('spazier'), ps2('spaziert')),

('erzaehlen','erzählen','to tell / narrate','A2','Schwach',False,
 w('erzähl'), pw('erzähl'), ph('erzählt')),

('wuenschen','wünschen','to wish','A2','Schwach',False,
 ws('wünsch'), pw('wünsch'), ph('gewünscht')),

('fuehlen','fühlen','to feel','A2','Schwach',False,
 w('fühl'), pw('fühl'), ph('gefühlt')),

('packen','packen','to pack','A2','Schwach',False,
 w('pack'), pw('pack'), ph('gepackt')),

('rauchen','rauchen','to smoke','A2','Schwach',False,
 w('rauch'), pw('rauch'), ph('geraucht')),

('laecheln','lächeln','to smile','A2','Schwach',False,
 {'ich':'lächle','du':'lächelst','er/sie/es':'lächelt','wir':'lächeln','ihr':'lächelt','sie/Sie':'lächeln'},
 pc('lächelte','lächeltest','lächelte','lächelten','lächeltet','lächelten'),
 ph('gelächelt')),

('verdienen','verdienen','to earn / deserve','A2','Schwach',False,
 w('verdien'), pw('verdien'), ph('verdient')),

('meinen','meinen','to mean / think','A2','Schwach',False,
 w('mein'), pw('mein'), ph('gemeint')),

('schauen','schauen','to look / watch','A2','Schwach',False,
 w('schau'), pw('schau'), ph('geschaut')),

('tippen','tippen','to type / tap','A2','Schwach',False,
 w('tipp'), pw('tipp'), ph('getippt')),

('klingeln','klingeln','to ring (doorbell)','A2','Schwach',False,
 {'ich':'klingle','du':'klingelst','er/sie/es':'klingelt','wir':'klingeln','ihr':'klingelt','sie/Sie':'klingeln'},
 pc('klingelte','klingeltest','klingelte','klingelten','klingeltet','klingelten'),
 ph('geklingelt')),

('wandern','wandern','to hike / wander','A2','Schwach',False,
 {'ich':'wandere','du':'wanderst','er/sie/es':'wandert','wir':'wandern','ihr':'wandert','sie/Sie':'wandern'},
 pc('wanderte','wandertest','wanderte','wanderten','wandertet','wanderten'),
 ps2('gewandert')),

('passen','passen','to fit / suit','A2','Schwach',False,
 ws('pass'), pw('pass'), ph('gepasst')),

('wechseln','wechseln','to change / exchange','A2','Schwach',False,
 {'ich':'wechsle','du':'wechselst','er/sie/es':'wechselt','wir':'wechseln','ihr':'wechselt','sie/Sie':'wechseln'},
 pc('wechselte','wechseltest','wechselte','wechselten','wechseltet','wechselten'),
 ph('gewechselt')),

('tanken','tanken','to fill up (fuel)','A2','Schwach',False,
 w('tank'), pw('tank'), ph('getankt')),

('recyceln','recyceln','to recycle','A2','Schwach',False,
 {'ich':'recycle','du':'recycelst','er/sie/es':'recycelt','wir':'recyceln','ihr':'recycelt','sie/Sie':'recyceln'},
 pc('recycelte','recyceltest','recycelte','recycelten','recyceltet','recycelten'),
 ph('recycelt')),

('markieren','markieren','to mark','A2','Schwach',False,
 w('markier'), pw('markier'), ph('markiert')),

('funktionieren','funktionieren','to function / work','A2','Schwach',False,
 w('funktionier'), pw('funktionier'), ph('funktioniert')),

('reservieren','reservieren','to reserve','A2','Schwach',False,
 w('reservier'), pw('reservier'), ph('reserviert')),

('parken','parken','to park','A2','Schwach',False,
 w('park'), pw('park'), ph('geparkt')),

('stoeren','stören','to disturb / bother','A2','Schwach',False,
 w('stör'), pw('stör'), ph('gestört')),

('pflegen','pflegen','to care for / maintain','A2','Schwach',False,
 w('pfleg'), pw('pfleg'), ph('gepflegt')),

# Trennbar A2
('zuhoeren','zuhören','to listen to','A2','Trennbar',False,
 {'ich':'höre zu','du':'hörst zu','er/sie/es':'hört zu','wir':'hören zu','ihr':'hört zu','sie/Sie':'hören zu'},
 sep_p(pw('hör'),'zu'),
 ph('zugehört')),

('einschlafen','einschlafen','to fall asleep','A2','Trennbar',True,
 {'ich':'schlafe ein','du':'schläfst ein','er/sie/es':'schläft ein','wir':'schlafen ein','ihr':'schlaft ein','sie/Sie':'schlafen ein'},
 sep_p(ps('schlief'),'ein'),
 ps2('eingeschlafen')),

('aufraeumen','aufräumen','to tidy up','A2','Trennbar',False,
 sep(w('räum'),'auf'),
 sep_p(pw('räum'),'auf'),
 ph('aufgeräumt')),

('abfahren','abfahren','to depart','A2','Trennbar',True,
 {'ich':'fahre ab','du':'fährst ab','er/sie/es':'fährt ab','wir':'fahren ab','ihr':'fahrt ab','sie/Sie':'fahren ab'},
 sep_p(ps('fuhr'),'ab'),
 ps2('abgefahren')),

('umziehen','umziehen','to move house','A2','Trennbar',False,
 sep(w('zieh'),'um'),
 sep_p(ps('zog'),'um'),
 ps2('umgezogen')),

('ausschalten','ausschalten','to turn off','A2','Trennbar',False,
 sep(we('schalt'),'aus'),
 sep_p(pwe('schalt'),'aus'),
 ph('ausgeschaltet')),

('einschalten','einschalten','to turn on','A2','Trennbar',False,
 sep(we('schalt'),'ein'),
 sep_p(pwe('schalt'),'ein'),
 ph('eingeschaltet')),

('abholen','abholen','to pick up','A2','Trennbar',False,
 sep(w('hol'),'ab'),
 sep_p(pw('hol'),'ab'),
 ph('abgeholt')),

('vorbereiten','vorbereiten','to prepare','A2','Trennbar',False,
 sep(we('bereit'),'vor'),
 sep_p(pwe('bereit'),'vor'),
 ph('vorbereitet')),

('nachdenken','nachdenken','to think about / reflect','A2','Trennbar',False,
 sep(w('denk'),'nach'),
 sep_p(pc('dachte','dachtest','dachte','dachten','dachtet','dachten'),'nach'),
 ph('nachgedacht')),

('aussehen','aussehen','to look / appear','A2','Trennbar',True,
 {'ich':'sehe aus','du':'siehst aus','er/sie/es':'sieht aus','wir':'sehen aus','ihr':'seht aus','sie/Sie':'sehen aus'},
 sep_p(ps('sah'),'aus'),
 ph('ausgesehen')),

('anmelden','anmelden','to register','A2','Trennbar',False,
 sep(we('meld'),'an'),
 sep_p(pwe('meld'),'an'),
 ph('angemeldet')),

('abmelden','abmelden','to deregister','A2','Trennbar',False,
 sep(we('meld'),'ab'),
 sep_p(pwe('meld'),'ab'),
 ph('abgemeldet')),

('vorlesen','vorlesen','to read aloud','A2','Trennbar',True,
 {'ich':'lese vor','du':'liest vor','er/sie/es':'liest vor','wir':'lesen vor','ihr':'lest vor','sie/Sie':'lesen vor'},
 sep_p(pss('las'),'vor'),
 ph('vorgelesen')),

('aufpassen','aufpassen','to pay attention / look out','A2','Trennbar',False,
 {'ich':'passe auf','du':'passt auf','er/sie/es':'passt auf','wir':'passen auf','ihr':'passt auf','sie/Sie':'passen auf'},
 sep_p(pw('pass'),'auf'),
 ph('aufgepasst')),

('herunterladen','herunterladen','to download','A2','Trennbar',True,
 {'ich':'lade herunter','du':'lädst herunter','er/sie/es':'lädt herunter','wir':'laden herunter','ihr':'ladet herunter','sie/Sie':'laden herunter'},
 sep_p(ps('lud'),'herunter'),
 ph('heruntergeladen')),

('ausprobieren','ausprobieren','to try out','A2','Trennbar',False,
 sep(w('probier'),'aus'),
 sep_p(pw('probier'),'aus'),
 ph('ausprobiert')),

('weggehen','weggehen','to leave / go away','A2','Trennbar',False,
 sep(w('geh'),'weg'),
 sep_p(ps('ging'),'weg'),
 ps2('weggegangen')),

('abgeben','abgeben','to hand in','A2','Trennbar',True,
 {'ich':'gebe ab','du':'gibst ab','er/sie/es':'gibt ab','wir':'geben ab','ihr':'gebt ab','sie/Sie':'geben ab'},
 sep_p(ps('gab'),'ab'),
 ph('abgegeben')),

('nachfragen','nachfragen','to inquire','A2','Trennbar',False,
 sep(w('frag'),'nach'),
 sep_p(pw('frag'),'nach'),
 ph('nachgefragt')),

('zustimmen','zustimmen','to agree','A2','Trennbar',False,
 sep(w('stimm'),'zu'),
 sep_p(pw('stimm'),'zu'),
 ph('zugestimmt')),

('ablehnen','ablehnen','to decline / reject','A2','Trennbar',False,
 sep(w('lehn'),'ab'),
 sep_p(pw('lehn'),'ab'),
 ph('abgelehnt')),

('aufbauen','aufbauen','to build up / set up','A2','Trennbar',False,
 sep(w('bau'),'auf'),
 sep_p(pw('bau'),'auf'),
 ph('aufgebaut')),

('fertigmachen','fertigmachen','to finish / get ready','A2','Trennbar',False,
 sep(w('mach'),'fertig'),
 sep_p(pw('mach'),'fertig'),
 ph('fertiggemacht')),

('kennenlernen','kennenlernen','to get to know','A2','Trennbar',False,
 sep(w('lern'),'kennen'),
 sep_p(pw('lern'),'kennen'),
 ph('kennengelernt')),

('abschreiben','abschreiben','to copy / write off','A2','Trennbar',False,
 sep(w('schreib'),'ab'),
 sep_p(ps('schrieb'),'ab'),
 ph('abgeschrieben')),

('vorstellen','vorstellen','to introduce / imagine','A2','Trennbar',False,
 sep(w('stell'),'vor'),
 sep_p(pw('stell'),'vor'),
 ph('vorgestellt')),

('aufschreiben','aufschreiben','to write down','A2','Trennbar',False,
 sep(w('schreib'),'auf'),
 sep_p(ps('schrieb'),'auf'),
 ph('aufgeschrieben')),

('einziehen','einziehen','to move in','A2','Trennbar',False,
 sep(w('zieh'),'ein'),
 sep_p(ps('zog'),'ein'),
 ps2('eingezogen')),

('ausziehen','ausziehen','to move out / undress','A2','Trennbar',False,
 sep(w('zieh'),'aus'),
 sep_p(ps('zog'),'aus'),
 ps2('ausgezogen')),

# ════════════════════════════════════════════════════════════════
# B1 — verbs
# ════════════════════════════════════════════════════════════════

# Stark B1
('empfehlen','empfehlen','to recommend','B1','Stark',True,
 c('empfehle','empfiehlst','empfiehlt','empfehlen','empfehlt','empfehlen'),
 ps('empfahl'),
 ph('empfohlen')),

('entscheiden','entscheiden','to decide','B1','Stark',False,
 we('entscheid'),
 pse('entschied'),
 ph('entschieden')),

('beschreiben','beschreiben','to describe','B1','Stark',False,
 w('beschreib'),
 ps('beschrieb'),
 ph('beschrieben')),

('verlieren','verlieren','to lose','B1','Stark',False,
 w('verlier'),
 ps('verlor'),
 ph('verloren')),

('gewinnen','gewinnen','to win','B1','Stark',False,
 w('gewinn'),
 ps('gewann'),
 ph('gewonnen')),

('verschlafen','verschlafen','to oversleep','B1','Stark',True,
 c('verschlafe','verschläfst','verschläft','verschlafen','verschlaft','verschlafen'),
 ps('verschlief'),
 ph('verschlafen')),

('bestehen','bestehen','to pass (exam) / consist of','B1','Stark',False,
 w('besteh'),
 pse('bestand'),
 ph('bestanden')),

('entstehen','entstehen','to develop / arise','B1','Stark',False,
 w('entsteh'),
 pse('entstand'),
 ps2('entstanden')),

('betragen','betragen','to amount to','B1','Stark',True,
 c('betrage','beträgst','beträgt','betragen','betragt','betragen'),
 ps('betrug'),
 ph('betragen')),

('betreffen','betreffen','to concern / affect','B1','Stark',True,
 c('betreffe','betriffst','betrifft','betreffen','betrefft','betreffen'),
 ps('betraf'),
 ph('betroffen')),

('verlassen','verlassen','to leave / abandon','B1','Stark',True,
 c('verlasse','verlässt','verlässt','verlassen','verlasst','verlassen'),
 pss('verließ'),
 ph('verlassen')),

('erhalten','erhalten','to receive / maintain','B1','Stark',True,
 c('erhalte','erhältst','erhält','erhalten','erhaltet','erhalten'),
 pse('erhielt'),
 ph('erhalten')),

('verbinden','verbinden','to connect / link','B1','Stark',False,
 we('verbind'),
 pse('verband'),
 ph('verbunden')),

('beweisen','beweisen','to prove','B1','Stark',False,
 ws('beweis'),
 pss('bewies'),
 ph('bewiesen')),

('vergleichen','vergleichen','to compare','B1','Stark',False,
 w('vergleich'),
 ps('verglich'),
 ph('verglichen')),

('beziehen','beziehen','to refer to / obtain','B1','Stark',False,
 w('bezieh'),
 ps('bezog'),
 ph('bezogen')),

('vermeiden','vermeiden','to avoid','B1','Stark',False,
 we('vermeid'),
 pse('vermied'),
 ph('vermieden')),

('verbieten','verbieten','to forbid / ban','B1','Stark',False,
 w('verbiet'),
 pse('verbot'),
 ph('verboten')),

('widersprechen','widersprechen','to contradict','B1','Stark',True,
 c('widerspreche','widersprichst','widerspricht','widersprechen','widersprecht','widersprechen'),
 ps('widersprach'),
 ph('widersprochen')),

('besprechen','besprechen','to discuss / talk about','B1','Stark',True,
 c('bespreche','besprichst','bespricht','besprechen','besprecht','besprechen'),
 ps('besprach'),
 ph('besprochen')),

('versprechen','versprechen','to promise','B1','Stark',True,
 c('verspreche','versprichst','verspricht','versprechen','versprecht','versprechen'),
 ps('versprach'),
 ph('versprochen')),

('unterscheiden','unterscheiden','to distinguish','B1','Stark',False,
 we('unterscheid'),
 pse('unterschied'),
 ph('unterschieden')),

('verleihen','verleihen','to lend / award','B1','Stark',False,
 w('verleih'),
 ps('verlieh'),
 ph('verliehen')),

('verbringen','verbringen','to spend (time)','B1','Schwach',False,
 w('verbring'),
 pc('verbrachte','verbrachtest','verbrachte','verbrachten','verbrachtet','verbrachten'),
 ph('verbracht')),

('gelingen','gelingen','to succeed (impersonal)','B1','Stark',False,
 w('geling'),
 ps('gelang'),
 ps2('gelungen')),

('misslingen','misslingen','to fail','B1','Stark',False,
 w('missling'),
 ps('misslang'),
 ps2('misslungen')),

# Trennbar B1
('vorziehen','vorziehen','to prefer','B1','Trennbar',False,
 sep(w('zieh'),'vor'),
 sep_p(ps('zog'),'vor'),
 ph('vorgezogen')),

('aufnehmen','aufnehmen','to record / accept','B1','Trennbar',True,
 {'ich':'nehme auf','du':'nimmst auf','er/sie/es':'nimmt auf','wir':'nehmen auf','ihr':'nehmt auf','sie/Sie':'nehmen auf'},
 sep_p(ps('nahm'),'auf'),
 ph('aufgenommen')),

('annehmen','annehmen','to accept / assume','B1','Trennbar',True,
 {'ich':'nehme an','du':'nimmst an','er/sie/es':'nimmt an','wir':'nehmen an','ihr':'nehmt an','sie/Sie':'nehmen an'},
 sep_p(ps('nahm'),'an'),
 ph('angenommen')),

('wahrnehmen','wahrnehmen','to perceive / notice','B1','Trennbar',True,
 {'ich':'nehme wahr','du':'nimmst wahr','er/sie/es':'nimmt wahr','wir':'nehmen wahr','ihr':'nehmt wahr','sie/Sie':'nehmen wahr'},
 sep_p(ps('nahm'),'wahr'),
 ph('wahrgenommen')),

('aufgeben','aufgeben','to give up / hand in','B1','Trennbar',True,
 {'ich':'gebe auf','du':'gibst auf','er/sie/es':'gibt auf','wir':'geben auf','ihr':'gebt auf','sie/Sie':'geben auf'},
 sep_p(ps('gab'),'auf'),
 ph('aufgegeben')),

('teilnehmen','teilnehmen','to participate','B1','Trennbar',True,
 {'ich':'nehme teil','du':'nimmst teil','er/sie/es':'nimmt teil','wir':'nehmen teil','ihr':'nehmt teil','sie/Sie':'nehmen teil'},
 sep_p(ps('nahm'),'teil'),
 ph('teilgenommen')),

('vorschlagen','vorschlagen','to suggest / propose','B1','Trennbar',True,
 {'ich':'schlage vor','du':'schlägst vor','er/sie/es':'schlägt vor','wir':'schlagen vor','ihr':'schlagt vor','sie/Sie':'schlagen vor'},
 sep_p(ps('schlug'),'vor'),
 ph('vorgeschlagen')),

('nachschlagen','nachschlagen','to look up (dictionary)','B1','Trennbar',True,
 {'ich':'schlage nach','du':'schlägst nach','er/sie/es':'schlägt nach','wir':'schlagen nach','ihr':'schlagt nach','sie/Sie':'schlagen nach'},
 sep_p(ps('schlug'),'nach'),
 ph('nachgeschlagen')),

('einfallen','einfallen','to occur to / come to mind','B1','Trennbar',True,
 {'ich':'falle ein','du':'fällst ein','er/sie/es':'fällt ein','wir':'fallen ein','ihr':'fallt ein','sie/Sie':'fallen ein'},
 sep_p(ps('fiel'),'ein'),
 ps2('eingefallen')),

('vorkommen','vorkommen','to occur / happen','B1','Trennbar',False,
 sep(w('komm'),'vor'),
 sep_p(ps('kam'),'vor'),
 ps2('vorgekommen')),

('durchsetzen','durchsetzen','to enforce / push through','B1','Trennbar',False,
 {'ich':'setze durch','du':'setzt durch','er/sie/es':'setzt durch','wir':'setzen durch','ihr':'setzt durch','sie/Sie':'setzen durch'},
 sep_p(pw('setz'),'durch'),
 ph('durchgesetzt')),

('aufstellen','aufstellen','to set up / put up','B1','Trennbar',False,
 sep(w('stell'),'auf'),
 sep_p(pw('stell'),'auf'),
 ph('aufgestellt')),

('anbieten','anbieten','to offer','B1','Trennbar',False,
 sep(we('biet'),'an'),
 sep_p(pse('bot'),'an'),
 ph('angeboten')),

('einsetzen','einsetzen','to deploy / use','B1','Trennbar',False,
 {'ich':'setze ein','du':'setzt ein','er/sie/es':'setzt ein','wir':'setzen ein','ihr':'setzt ein','sie/Sie':'setzen ein'},
 sep_p(pw('setz'),'ein'),
 ph('eingesetzt')),

('umsetzen','umsetzen','to implement / convert','B1','Trennbar',False,
 {'ich':'setze um','du':'setzt um','er/sie/es':'setzt um','wir':'setzen um','ihr':'setzt um','sie/Sie':'setzen um'},
 sep_p(pw('setz'),'um'),
 ph('umgesetzt')),

('herausfinden','herausfinden','to find out','B1','Trennbar',False,
 sep(we('find'),'heraus'),
 sep_p(pse('fand'),'heraus'),
 ph('herausgefunden')),

('zusammenfassen','zusammenfassen','to summarize','B1','Trennbar',False,
 {'ich':'fasse zusammen','du':'fasst zusammen','er/sie/es':'fasst zusammen','wir':'fassen zusammen','ihr':'fasst zusammen','sie/Sie':'fassen zusammen'},
 sep_p(pw('fass'),'zusammen'),
 ph('zusammengefasst')),

('auswaehlen','auswählen','to select / choose','B1','Trennbar',False,
 sep(w('wähl'),'aus'),
 sep_p(pw('wähl'),'aus'),
 ph('ausgewählt')),

('anpassen','anpassen','to adapt / adjust','B1','Trennbar',False,
 {'ich':'passe an','du':'passt an','er/sie/es':'passt an','wir':'passen an','ihr':'passt an','sie/Sie':'passen an'},
 sep_p(pw('pass'),'an'),
 ph('angepasst')),

('abbauen','abbauen','to reduce / dismantle','B1','Trennbar',False,
 sep(w('bau'),'ab'),
 sep_p(pw('bau'),'ab'),
 ph('abgebaut')),

('aufzeigen','aufzeigen','to demonstrate / show','B1','Trennbar',False,
 sep(w('zeig'),'auf'),
 sep_p(pw('zeig'),'auf'),
 ph('aufgezeigt')),

('umgehen','umgehen','to deal with / bypass','B1','Trennbar',False,
 sep(w('geh'),'um'),
 sep_p(ps('ging'),'um'),
 ps2('umgegangen')),

('durchfuehren','durchführen','to carry out / conduct','B1','Trennbar',False,
 sep(w('führ'),'durch'),
 sep_p(pw('führ'),'durch'),
 ph('durchgeführt')),

('abschliessen','abschließen','to complete / lock','B1','Trennbar',False,
 {'ich':'schließe ab','du':'schließt ab','er/sie/es':'schließt ab','wir':'schließen ab','ihr':'schließt ab','sie/Sie':'schließen ab'},
 sep_p(pss('schloss'),'ab'),
 ph('abgeschlossen')),

('vorhaben','vorhaben','to plan / intend','B1','Trennbar',True,
 {'ich':'habe vor','du':'hast vor','er/sie/es':'hat vor','wir':'haben vor','ihr':'habt vor','sie/Sie':'haben vor'},
 sep_p(pw('hat'),'vor'),
 ph('vorgehabt')),

('zusammenarbeiten','zusammenarbeiten','to collaborate','B1','Trennbar',False,
 sep(we('arbeit'),'zusammen'),
 sep_p(pwe('arbeit'),'zusammen'),
 ph('zusammengearbeitet')),

('eingestehen','eingestehen','to admit','B1','Trennbar',False,
 sep(w('gesteh'),'ein'),
 sep_p(pse('gestand'),'ein'),
 ph('eingestanden')),

('anerkennen','anerkennen','to recognise / acknowledge','B1','Trennbar',False,
 sep(w('kenn'),'an'),
 sep_p(pw('erkann'),'an'),
 ph('anerkannt')),

('weitergeben','weitergeben','to pass on','B1','Trennbar',True,
 {'ich':'gebe weiter','du':'gibst weiter','er/sie/es':'gibt weiter','wir':'geben weiter','ihr':'gebt weiter','sie/Sie':'geben weiter'},
 sep_p(ps('gab'),'weiter'),
 ph('weitergegeben')),

('aufgreifen','aufgreifen','to pick up / take up','B1','Trennbar',False,
 sep(w('greif'),'auf'),
 sep_p(ps('griff'),'auf'),
 ph('aufgegriffen')),

('hervorheben','hervorheben','to emphasise','B1','Trennbar',False,
 sep(w('heb'),'hervor'),
 sep_p(ps('hob'),'hervor'),
 ph('hervorgehoben')),

('auftreten','auftreten','to appear / occur','B1','Trennbar',True,
 {'ich':'trete auf','du':'trittst auf','er/sie/es':'tritt auf','wir':'treten auf','ihr':'tretet auf','sie/Sie':'treten auf'},
 sep_p(pse('trat'),'auf'),
 ps2('aufgetreten')),

('zurueckgehen','zurückgehen','to go back / decrease','B1','Trennbar',False,
 sep(w('geh'),'zurück'),
 sep_p(ps('ging'),'zurück'),
 ps2('zurückgegangen')),

('zunehmen','zunehmen','to increase / gain weight','B1','Trennbar',True,
 {'ich':'nehme zu','du':'nimmst zu','er/sie/es':'nimmt zu','wir':'nehmen zu','ihr':'nehmt zu','sie/Sie':'nehmen zu'},
 sep_p(ps('nahm'),'zu'),
 ph('zugenommen')),

('abnehmen','abnehmen','to decrease / lose weight','B1','Trennbar',True,
 {'ich':'nehme ab','du':'nimmst ab','er/sie/es':'nimmt ab','wir':'nehmen ab','ihr':'nehmt ab','sie/Sie':'nehmen ab'},
 sep_p(ps('nahm'),'ab'),
 ph('abgenommen')),

('aufteilen','aufteilen','to divide / split up','B1','Trennbar',False,
 sep(w('teil'),'auf'),
 sep_p(pw('teil'),'auf'),
 ph('aufgeteilt')),

('beitragen','beitragen','to contribute','B1','Trennbar',True,
 {'ich':'trage bei','du':'trägst bei','er/sie/es':'trägt bei','wir':'tragen bei','ihr':'tragt bei','sie/Sie':'tragen bei'},
 sep_p(ps('trug'),'bei'),
 ph('beigetragen')),

('ablaufen','ablaufen','to expire / run out','B1','Trennbar',True,
 {'ich':'laufe ab','du':'läufst ab','er/sie/es':'läuft ab','wir':'laufen ab','ihr':'lauft ab','sie/Sie':'laufen ab'},
 sep_p(ps('lief'),'ab'),
 ps2('abgelaufen')),

('ausloesen','auslösen','to trigger / cause','B1','Trennbar',False,
 sep(ws('lös'),'aus'),
 sep_p(pw('lös'),'aus'),
 ph('ausgelöst')),

('einschaetzen','einschätzen','to assess / estimate','B1','Trennbar',False,
 {'ich':'schätze ein','du':'schätzt ein','er/sie/es':'schätzt ein','wir':'schätzen ein','ihr':'schätzt ein','sie/Sie':'schätzen ein'},
 sep_p(pw('schätz'),'ein'),
 ph('eingeschätzt')),

('auswerten','auswerten','to evaluate / analyse','B1','Trennbar',False,
 sep(we('wert'),'aus'),
 sep_p(pwe('wert'),'aus'),
 ph('ausgewertet')),

('einführen','einführen','to introduce / import','B1','Trennbar',False,
 sep(w('führ'),'ein'),
 sep_p(pw('führ'),'ein'),
 ph('eingeführt')),

('ausführen','ausführen','to carry out / export','B1','Trennbar',False,
 sep(w('führ'),'aus'),
 sep_p(pw('führ'),'aus'),
 ph('ausgeführt')),

('auffordern','auffordern','to call upon / urge','B1','Trennbar',False,
 {'ich':'fordere auf','du':'forderst auf','er/sie/es':'fordert auf','wir':'fordern auf','ihr':'fordert auf','sie/Sie':'fordern auf'},
 sep_p(pc('forderte','fordertest','forderte','forderten','fordertet','forderten'),'auf'),
 ph('aufgefordert')),

('hinweisen','hinweisen','to point out','B1','Trennbar',False,
 {'ich':'weise hin','du':'weist hin','er/sie/es':'weist hin','wir':'weisen hin','ihr':'weist hin','sie/Sie':'weisen hin'},
 sep_p(pss('wies'),'hin'),
 ph('hingewiesen')),

('aufklaeren','aufklären','to enlighten / clarify','B1','Trennbar',False,
 sep(w('klär'),'auf'),
 sep_p(pw('klär'),'auf'),
 ph('aufgeklärt')),

('voraussetzen','voraussetzen','to presuppose / require','B1','Trennbar',False,
 {'ich':'setze voraus','du':'setzt voraus','er/sie/es':'setzt voraus','wir':'setzen voraus','ihr':'setzt voraus','sie/Sie':'setzen voraus'},
 sep_p(pw('setz'),'voraus'),
 ph('vorausgesetzt')),

('ueberdenken','überdenken','to reconsider','B1','Schwach',False,
 w('überdenk'),
 pc('überdachte','überdachtest','überdachte','überdachten','überdachtet','überdachten'),
 ph('überdacht')),

# Schwach B1
('erinnern','erinnern','to remind / remember','B1','Schwach',False,
 w('erinner'),
 pc('erinnerte','erinnertest','erinnerte','erinnerten','erinnertet','erinnerten'),
 ph('erinnert')),

('erreichen','erreichen','to reach / achieve','B1','Schwach',False,
 w('erreich'), pw('erreich'), ph('erreicht')),

('diskutieren','diskutieren','to discuss','B1','Schwach',False,
 w('diskutier'), pw('diskutier'), ph('diskutiert')),

('ueberlegen','überlegen','to consider / think over','B1','Schwach',False,
 w('überleg'), pw('überleg'), ph('überlegt')),

('verbessern','verbessern','to improve','B1','Schwach',False,
 {'ich':'verbessere','du':'verbesserst','er/sie/es':'verbessert','wir':'verbessern','ihr':'verbessert','sie/Sie':'verbessern'},
 pc('verbesserte','verbessertest','verbesserte','verbesserten','verbessertet','verbesserten'),
 ph('verbessert')),

('organisieren','organisieren','to organise','B1','Schwach',False,
 w('organisier'), pw('organisier'), ph('organisiert')),

('informieren','informieren','to inform','B1','Schwach',False,
 w('informier'), pw('informier'), ph('informiert')),

('kommunizieren','kommunizieren','to communicate','B1','Schwach',False,
 w('kommunizier'), pw('kommunizier'), ph('kommuniziert')),

('praesentieren','präsentieren','to present','B1','Schwach',False,
 w('präsentier'), pw('präsentier'), ph('präsentiert')),

('reagieren','reagieren','to react','B1','Schwach',False,
 w('reagier'), pw('reagier'), ph('reagiert')),

('studieren','studieren','to study (university)','B1','Schwach',False,
 w('studier'), pw('studier'), ph('studiert')),

('produzieren','produzieren','to produce','B1','Schwach',False,
 w('produzier'), pw('produzier'), ph('produziert')),

('kontrollieren','kontrollieren','to check / control','B1','Schwach',False,
 w('kontrollier'), pw('kontrollier'), ph('kontrolliert')),

('korrigieren','korrigieren','to correct','B1','Schwach',False,
 w('korrigier'), pw('korrigier'), ph('korrigiert')),

('planen','planen','to plan','B1','Schwach',False,
 w('plan'), pw('plan'), ph('geplant')),

('leiten','leiten','to lead / manage','B1','Schwach',False,
 we('leit'), pwe('leit'), ph('geleitet')),

('berichten','berichten','to report','B1','Schwach',False,
 we('bericht'), pwe('bericht'), ph('berichtet')),

('ergaenzen','ergänzen','to supplement / add','B1','Schwach',False,
 ws('ergänz'), pw('ergänz'), ph('ergänzt')),

('ueberleben','überleben','to survive','B1','Schwach',False,
 {'ich':'überlebe','du':'überlebst','er/sie/es':'überlebt','wir':'überleben','ihr':'überlebt','sie/Sie':'überleben'},
 pw('überlieb') if False else pc('überlebte','überlebtest','überlebte','überlebten','überlebtet','überlebten'),
 ph('überlebt')),

('entwickeln','entwickeln','to develop','B1','Schwach',False,
 {'ich':'entwickle','du':'entwickelst','er/sie/es':'entwickelt','wir':'entwickeln','ihr':'entwickelt','sie/Sie':'entwickeln'},
 pc('entwickelte','entwickeltest','entwickelte','entwickelten','entwickeltet','entwickelten'),
 ph('entwickelt')),

('behandeln','behandeln','to treat / handle','B1','Schwach',False,
 {'ich':'behandle','du':'behandelst','er/sie/es':'behandelt','wir':'behandeln','ihr':'behandelt','sie/Sie':'behandeln'},
 pc('behandelte','behandeltest','behandelte','behandelten','behandeltet','behandelten'),
 ph('behandelt')),

('benoetigen','benötigen','to need / require','B1','Schwach',False,
 w('benötig'), pw('benötig'), ph('benötigt')),

('ermoeglichen','ermöglichen','to enable / make possible','B1','Schwach',False,
 w('ermöglich'), pw('ermöglich'), ph('ermöglicht')),

('unterstuetzen','unterstützen','to support','B1','Schwach',False,
 ws('unterstütz'), pw('unterstütz'), ph('unterstützt')),

('bewaeltigen','bewältigen','to cope with / manage','B1','Schwach',False,
 w('bewältig'), pw('bewältig'), ph('bewältigt')),

('beschaeftigen','beschäftigen','to occupy / employ','B1','Schwach',False,
 w('beschäftig'), pw('beschäftig'), ph('beschäftigt')),

('uebersetzen','übersetzen','to translate','B1','Schwach',False,
 ws('übersetz'), pw('übersetz'), ph('übersetzt')),

('unterrichten','unterrichten','to teach','B1','Schwach',False,
 we('unterricht'), pwe('unterricht'), ph('unterrichtet')),

('abhaengen','abhängen','to depend on','B1','Schwach',False,
 w('abhäng'), pw('abhäng'), ph('abgehangen')),

('bezeichnen','bezeichnen','to designate / call','B1','Schwach',False,
 we('bezeichn'), pwe('bezeichn'), ph('bezeichnet')),

('behaupten','behaupten','to claim / assert','B1','Schwach',False,
 {'ich':'behaupte','du':'behauptest','er/sie/es':'behauptet','wir':'behaupten','ihr':'behauptet','sie/Sie':'behaupten'},
 pwe('behaup'),
 ph('behauptet')),

('beurteilen','beurteilen','to judge / assess','B1','Schwach',False,
 w('beurteil'), pw('beurteil'), ph('beurteilt')),

('verbreiten','verbreiten','to spread / distribute','B1','Schwach',False,
 we('verbreit'), pwe('verbreit'), ph('verbreitet')),

('verlaengern','verlängern','to extend / prolong','B1','Schwach',False,
 {'ich':'verlängere','du':'verlängerst','er/sie/es':'verlängert','wir':'verlängern','ihr':'verlängert','sie/Sie':'verlängern'},
 pc('verlängerte','verlängertest','verlängerte','verlängerten','verlängertet','verlängerten'),
 ph('verlängert')),

('erlauben','erlauben','to allow / permit','B1','Schwach',False,
 w('erlaub'), pw('erlaub'), ph('erlaubt')),

('fordern','fordern','to demand / require','B1','Schwach',False,
 {'ich':'fordere','du':'forderst','er/sie/es':'fordert','wir':'fordern','ihr':'fordert','sie/Sie':'fordern'},
 pc('forderte','fordertest','forderte','forderten','fordertet','forderten'),
 ph('gefordert')),

('foerdern','fördern','to promote / support','B1','Schwach',False,
 {'ich':'fördere','du':'förderst','er/sie/es':'fördert','wir':'fördern','ihr':'fördert','sie/Sie':'fördern'},
 pc('förderte','fördertest','förderte','förderten','fördertet','förderten'),
 ph('gefördert')),

('sichern','sichern','to secure / protect','B1','Schwach',False,
 {'ich':'sichere','du':'sicherst','er/sie/es':'sichert','wir':'sichern','ihr':'sichert','sie/Sie':'sichern'},
 pc('sicherte','sichertest','sicherte','sicherten','sichertet','sicherten'),
 ph('gesichert')),

('staerken','stärken','to strengthen','B1','Schwach',False,
 w('stärk'), pw('stärk'), ph('gestärkt')),

('schwaerchen','schwächen','to weaken','B1','Schwach',False,
 w('schwäch'), pw('schwäch'), ph('geschwächt')),

('beeinflussen','beeinflussen','to influence','B1','Schwach',False,
 {'ich':'beeinflusse','du':'beeinflusst','er/sie/es':'beeinflusst','wir':'beeinflussen','ihr':'beeinflusst','sie/Sie':'beeinflussen'},
 pc('beeinflusste','beeinflussttest','beeinflusste','beeinflussten','beeinflussttet','beeinflussten'),
 ph('beeinflusst')),

('scheitern','scheitern','to fail','B1','Schwach',False,
 {'ich':'scheitere','du':'scheiterst','er/sie/es':'scheitert','wir':'scheitern','ihr':'scheitert','sie/Sie':'scheitern'},
 pc('scheiterte','scheitertest','scheiterte','scheiterten','scheitertet','scheiterten'),
 ps2('gescheitert')),

('ueberzeugen','überzeugen','to convince','B1','Schwach',False,
 w('überzeug'), pw('überzeug'), ph('überzeugt')),

('zweifeln','zweifeln','to doubt','B1','Schwach',False,
 {'ich':'zweifle','du':'zweifelst','er/sie/es':'zweifelt','wir':'zweifeln','ihr':'zweifelt','sie/Sie':'zweifeln'},
 pc('zweifelte','zweifeltest','zweifelte','zweifelten','zweifeltet','zweifelten'),
 ph('gezweifelt')),

('zoegern','zögern','to hesitate','B1','Schwach',False,
 {'ich':'zögere','du':'zögerst','er/sie/es':'zögert','wir':'zögern','ihr':'zögert','sie/Sie':'zögern'},
 pc('zögerte','zögertest','zögerte','zögerten','zögertet','zögerten'),
 ph('gezögert')),

('kaempfen','kämpfen','to fight / struggle','B1','Schwach',False,
 w('kämpf'), pw('kämpf'), ph('gekämpft')),

('siegen','siegen','to win / be victorious','B1','Schwach',False,
 w('sieg'), pw('sieg'), ph('gesiegt')),

('einigen','einigen','to agree / unite','B1','Schwach',False,
 w('einig'), pw('einig'), ph('geeinigt')),

('widmen','widmen','to dedicate','B1','Schwach',False,
 we('widm'), pwe('widm'), ph('gewidmet')),

('orientieren','orientieren','to orient / guide','B1','Schwach',False,
 w('orientier'), pw('orientier'), ph('orientiert')),

('analysieren','analysieren','to analyse','B1','Schwach',False,
 w('analysier'), pw('analysier'), ph('analysiert')),

('formulieren','formulieren','to formulate','B1','Schwach',False,
 w('formulier'), pw('formulier'), ph('formuliert')),

('definieren','definieren','to define','B1','Schwach',False,
 w('definier'), pw('definier'), ph('definiert')),

('evaluieren','evaluieren','to evaluate','B1','Schwach',False,
 w('evaluier'), pw('evaluier'), ph('evaluiert')),

('strukturieren','strukturieren','to structure','B1','Schwach',False,
 w('strukturier'), pw('strukturier'), ph('strukturiert')),

('argumentieren','argumentieren','to argue (make argument)','B1','Schwach',False,
 w('argumentier'), pw('argumentier'), ph('argumentiert')),

('kritisieren','kritisieren','to criticise','B1','Schwach',False,
 w('kritisier'), pw('kritisier'), ph('kritisiert')),

('kommentieren','kommentieren','to comment on','B1','Schwach',False,
 w('kommentier'), pw('kommentier'), ph('kommentiert')),

('begegnen','begegnen','to meet / encounter','B1','Schwach',False,
 we('begegn'), pwe('begegn'), ps2('begegnet')),

('ueberarbeiten','überarbeiten','to revise / overhaul','B1','Schwach',False,
 we('überarbeit'), pwe('überarbeit'), ph('überarbeitet')),

('wiederholen','wiederholen','to repeat / revise','B1','Schwach',False,
 w('wiederhol'), pw('wiederhol'), ph('wiederholt')),

('beantworten','beantworten','to answer (sth)','B1','Schwach',False,
 {'ich':'beantworte','du':'beantwortest','er/sie/es':'beantwortet','wir':'beantworten','ihr':'beantwortet','sie/Sie':'beantworten'},
 pwe('beantwortet')[:-2] if False else pwe('beantwortet') if False else pc('beantwortete','beantworttest','beantwortete','beantworteten','beantworttet','beantworteten') if False else {'ich':'beantwortete','du':'beantwortetest','er/sie/es':'beantwortete','wir':'beantworteten','ihr':'beantwortetet','sie/Sie':'beantworteten'},
 ph('beantwortet')),

('begruenden','begründen','to justify / give reasons','B1','Schwach',False,
 we('begründ'), pwe('begründ'), ph('begründet')),

('vereinbaren','vereinbaren','to arrange / agree on','B1','Schwach',False,
 w('vereinbar'), pw('vereinbar'), ph('vereinbart')),

('verwalten','verwalten','to manage / administer','B1','Schwach',False,
 we('verwalt'), pwe('verwalt'), ph('verwaltet')),

('verantworten','verantworten','to be responsible for','B1','Schwach',False,
 we('verantwort'), pwe('verantwort'), ph('verantwortet')),

('beruecksichtigen','berücksichtigen','to take into account','B1','Schwach',False,
 w('berücksichtig'), pw('berücksichtig'), ph('berücksichtigt')),

('bewirken','bewirken','to cause / bring about','B1','Schwach',False,
 w('bewirk'), pw('bewirk'), ph('bewirkt')),

('absolvieren','absolvieren','to complete / pass','B1','Schwach',False,
 w('absolvier'), pw('absolvier'), ph('absolviert')),

('qualifizieren','qualifizieren','to qualify','B1','Schwach',False,
 w('qualifizier'), pw('qualifizier'), ph('qualifiziert')),

('spezialisieren','spezialisieren','to specialise','B1','Schwach',False,
 w('spezialisier'), pw('spezialisier'), ph('spezialisiert')),

('profitieren','profitieren','to benefit / profit','B1','Schwach',False,
 w('profitier'), pw('profitier'), ph('profitiert')),

('investieren','investieren','to invest','B1','Schwach',False,
 w('investier'), pw('investier'), ph('investiert')),

('finanzieren','finanzieren','to finance','B1','Schwach',False,
 w('finanzier'), pw('finanzier'), ph('finanziert')),

('garantieren','garantieren','to guarantee','B1','Schwach',False,
 w('garantier'), pw('garantier'), ph('garantiert')),

('protestieren','protestieren','to protest','B1','Schwach',False,
 w('protestier'), pw('protestier'), ph('protestiert')),

('demonstrieren','demonstrieren','to demonstrate','B1','Schwach',False,
 w('demonstrier'), pw('demonstrier'), ph('demonstriert')),

('respektieren','respektieren','to respect','B1','Schwach',False,
 w('respektier'), pw('respektier'), ph('respektiert')),

('tolerieren','tolerieren','to tolerate','B1','Schwach',False,
 w('tolerier'), pw('tolerier'), ph('toleriert')),

('akzeptieren','akzeptieren','to accept','B1','Schwach',False,
 w('akzeptier'), pw('akzeptier'), ph('akzeptiert')),

('ignorieren','ignorieren','to ignore','B1','Schwach',False,
 w('ignorier'), pw('ignorier'), ph('ignoriert')),

('integrieren','integrieren','to integrate','B1','Schwach',False,
 w('integrier'), pw('integrier'), ph('integriert')),

('reduzieren','reduzieren','to reduce','B1','Schwach',False,
 w('reduzier'), pw('reduzier'), ph('reduziert')),

('steigern','steigern','to increase / improve','B1','Schwach',False,
 {'ich':'steigere','du':'steigerst','er/sie/es':'steigert','wir':'steigern','ihr':'steigert','sie/Sie':'steigern'},
 pc('steigerte','steigertest','steigerte','steigerten','steigertet','steigerten'),
 ph('gesteigert')),

('verringern','verringern','to reduce / decrease','B1','Schwach',False,
 {'ich':'verringere','du':'verringerst','er/sie/es':'verringert','wir':'verringern','ihr':'verringert','sie/Sie':'verringern'},
 pc('verringerte','verringertest','verringerte','verringerten','verringertet','verringerten'),
 ph('verringert')),

('beschleunigen','beschleunigen','to accelerate','B1','Schwach',False,
 {'ich':'beschleunige','du':'beschleunigst','er/sie/es':'beschleunigt','wir':'beschleunigen','ihr':'beschleunigt','sie/Sie':'beschleunigen'},
 pc('beschleunigte','beschleunigtest','beschleunigte','beschleunigten','beschleunigtet','beschleunigten'),
 ph('beschleunigt')),

('verlangsamen','verlangsamen','to slow down','B1','Schwach',False,
 w('verlangsam'), pw('verlangsam'), ph('verlangsamt')),

]  # end RAW

# ── Filter out skip entries ──────────────────────────────────────
VERBS = [v for v in RAW if len(v) == 9 and v[1] != 'x']

# ── Remove duplicates by id ──────────────────────────────────────
seen_ids = set()
unique_verbs = []
for v in VERBS:
    if v[0] not in seen_ids:
        seen_ids.add(v[0])
        unique_verbs.append(v)

# ── Build output ─────────────────────────────────────────────────
output = []
for (vid, verb, meaning, level, category, irregular, present, praeteritum, perfekt) in unique_verbs:
    output.append({
        'id': vid,
        'verb': verb,
        'meaning': meaning,
        'level': level,
        'category': category,
        'irregular': irregular,
        'present': present,
        'praeteritum': praeteritum,
        'perfekt': perfekt,
    })

from collections import Counter
counts = Counter(v['level'] for v in output)
print(f"Total: {len(output)} verbs")
print(f"  A1: {counts['A1']}")
print(f"  A2: {counts['A2']}")
print(f"  B1: {counts['B1']}")

out_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'verbs.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
print(f"Written to {os.path.abspath(out_path)}")
