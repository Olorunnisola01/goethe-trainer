/* German conjugation engine — generates CORRECT present/präteritum/perfekt.
   The source docx treats every verb as weak (wrong), so we ignore its forms and
   generate our own from a hand-verified strong-verb table + reliable weak rules. */

/* Principal parts of base strong/irregular verbs.
   key (ASCII) -> [infinitive, du (present), er/sie (present), praet (ich/er), partizip2, aux]
   Storing du AND er explicitly removes all derivation ambiguity for stem-changers. */
const STRONG = {
  backen:   ['backen','backst','backt','backte','gebacken','haben'],
  befehlen: ['befehlen','befiehlst','befiehlt','befahl','befohlen','haben'],
  beginnen: ['beginnen','beginnst','beginnt','begann','begonnen','haben'],
  beissen:  ['beißen','beißt','beißt','biss','gebissen','haben'],
  biegen:   ['biegen','biegst','biegt','bog','gebogen','haben'],
  bieten:   ['bieten','bietest','bietet','bot','geboten','haben'],
  binden:   ['binden','bindest','bindet','band','gebunden','haben'],
  bitten:   ['bitten','bittest','bittet','bat','gebeten','haben'],
  blasen:   ['blasen','bläst','bläst','blies','geblasen','haben'],
  bleiben:  ['bleiben','bleibst','bleibt','blieb','geblieben','sein'],
  braten:   ['braten','brätst','brät','briet','gebraten','haben'],
  brechen:  ['brechen','brichst','bricht','brach','gebrochen','haben'],
  brennen:  ['brennen','brennst','brennt','brannte','gebrannt','haben'],
  bringen:  ['bringen','bringst','bringt','brachte','gebracht','haben'],
  denken:   ['denken','denkst','denkt','dachte','gedacht','haben'],
  empfehlen:['empfehlen','empfiehlst','empfiehlt','empfahl','empfohlen','haben'],
  essen:    ['essen','isst','isst','aß','gegessen','haben'],
  fahren:   ['fahren','fährst','fährt','fuhr','gefahren','sein'],
  fallen:   ['fallen','fällst','fällt','fiel','gefallen','sein'],
  fangen:   ['fangen','fängst','fängt','fing','gefangen','haben'],
  finden:   ['finden','findest','findet','fand','gefunden','haben'],
  fliegen:  ['fliegen','fliegst','fliegt','flog','geflogen','sein'],
  fliehen:  ['fliehen','fliehst','flieht','floh','geflohen','sein'],
  fliessen: ['fließen','fließt','fließt','floss','geflossen','sein'],
  fressen:  ['fressen','frisst','frisst','fraß','gefressen','haben'],
  frieren:  ['frieren','frierst','friert','fror','gefroren','haben'],
  geben:    ['geben','gibst','gibt','gab','gegeben','haben'],
  gefallen: ['gefallen','gefällst','gefällt','gefiel','gefallen','haben'],
  gehen:    ['gehen','gehst','geht','ging','gegangen','sein'],
  gelingen: ['gelingen','gelingst','gelingt','gelang','gelungen','sein'],
  gelten:   ['gelten','giltst','gilt','galt','gegolten','haben'],
  geniessen:['genießen','genießt','genießt','genoss','genossen','haben'],
  geschehen:['geschehen','geschiehst','geschieht','geschah','geschehen','sein'],
  gewinnen: ['gewinnen','gewinnst','gewinnt','gewann','gewonnen','haben'],
  giessen:  ['gießen','gießt','gießt','goss','gegossen','haben'],
  graben:   ['graben','gräbst','gräbt','grub','gegraben','haben'],
  greifen:  ['greifen','greifst','greift','griff','gegriffen','haben'],
  halten:   ['halten','hältst','hält','hielt','gehalten','haben'],
  hangen:   ['hängen','hängst','hängt','hing','gehangen','haben'],
  heben:    ['heben','hebst','hebt','hob','gehoben','haben'],
  heissen:  ['heißen','heißt','heißt','hieß','geheißen','haben'],
  helfen:   ['helfen','hilfst','hilft','half','geholfen','haben'],
  kennen:   ['kennen','kennst','kennt','kannte','gekannt','haben'],
  klingen:  ['klingen','klingst','klingt','klang','geklungen','haben'],
  kommen:   ['kommen','kommst','kommt','kam','gekommen','sein'],
  kriechen: ['kriechen','kriechst','kriecht','kroch','gekrochen','sein'],
  laden:    ['laden','lädst','lädt','lud','geladen','haben'],
  lassen:   ['lassen','lässt','lässt','ließ','gelassen','haben'],
  laufen:   ['laufen','läufst','läuft','lief','gelaufen','sein'],
  leihen:   ['leihen','leihst','leiht','lieh','geliehen','haben'],
  lesen:    ['lesen','liest','liest','las','gelesen','haben'],
  liegen:   ['liegen','liegst','liegt','lag','gelegen','haben'],
  luegen:   ['lügen','lügst','lügt','log','gelogen','haben'],
  messen:   ['messen','misst','misst','maß','gemessen','haben'],
  nehmen:   ['nehmen','nimmst','nimmt','nahm','genommen','haben'],
  nennen:   ['nennen','nennst','nennt','nannte','genannt','haben'],
  pfeifen:  ['pfeifen','pfeifst','pfeift','pfiff','gepfiffen','haben'],
  preisen:  ['preisen','preist','preist','pries','gepriesen','haben'],
  raten:    ['raten','rätst','rät','riet','geraten','haben'],
  reiben:   ['reiben','reibst','reibt','rieb','gerieben','haben'],
  reissen:  ['reißen','reißt','reißt','riss','gerissen','haben'],
  reiten:   ['reiten','reitest','reitet','ritt','geritten','sein'],
  rennen:   ['rennen','rennst','rennt','rannte','gerannt','sein'],
  riechen:  ['riechen','riechst','riecht','roch','gerochen','haben'],
  rufen:    ['rufen','rufst','ruft','rief','gerufen','haben'],
  saugen:   ['saugen','saugst','saugt','sog','gesogen','haben'],
  schaffen: ['schaffen','schaffst','schafft','schuf','geschaffen','haben'],
  scheinen: ['scheinen','scheinst','scheint','schien','geschienen','haben'],
  schieben: ['schieben','schiebst','schiebt','schob','geschoben','haben'],
  schiessen:['schießen','schießt','schießt','schoss','geschossen','haben'],
  schlafen: ['schlafen','schläfst','schläft','schlief','geschlafen','haben'],
  schlagen: ['schlagen','schlägst','schlägt','schlug','geschlagen','haben'],
  schliessen:['schließen','schließt','schließt','schloss','geschlossen','haben'],
  schmelzen:['schmelzen','schmilzt','schmilzt','schmolz','geschmolzen','sein'],
  schneiden:['schneiden','schneidest','schneidet','schnitt','geschnitten','haben'],
  schreiben:['schreiben','schreibst','schreibt','schrieb','geschrieben','haben'],
  schreien: ['schreien','schreist','schreit','schrie','geschrien','haben'],
  schweigen:['schweigen','schweigst','schweigt','schwieg','geschwiegen','haben'],
  schwimmen:['schwimmen','schwimmst','schwimmt','schwamm','geschwommen','sein'],
  sehen:    ['sehen','siehst','sieht','sah','gesehen','haben'],
  senden:   ['senden','sendest','sendet','sandte','gesandt','haben'],
  singen:   ['singen','singst','singt','sang','gesungen','haben'],
  sinken:   ['sinken','sinkst','sinkt','sank','gesunken','sein'],
  sitzen:   ['sitzen','sitzt','sitzt','saß','gesessen','haben'],
  sprechen: ['sprechen','sprichst','spricht','sprach','gesprochen','haben'],
  springen: ['springen','springst','springt','sprang','gesprungen','sein'],
  spinnen:  ['spinnen','spinnst','spinnt','spann','gesponnen','haben'],
  stechen:  ['stechen','stichst','sticht','stach','gestochen','haben'],
  stehen:   ['stehen','stehst','steht','stand','gestanden','haben'],
  stehlen:  ['stehlen','stiehlst','stiehlt','stahl','gestohlen','haben'],
  steigen:  ['steigen','steigst','steigt','stieg','gestiegen','sein'],
  sterben:  ['sterben','stirbst','stirbt','starb','gestorben','sein'],
  stinken:  ['stinken','stinkst','stinkt','stank','gestunken','haben'],
  stossen:  ['stoßen','stößt','stößt','stieß','gestoßen','haben'],
  streichen:['streichen','streichst','streicht','strich','gestrichen','haben'],
  tragen:   ['tragen','trägst','trägt','trug','getragen','haben'],
  treffen:  ['treffen','triffst','trifft','traf','getroffen','haben'],
  treiben:  ['treiben','treibst','treibt','trieb','getrieben','haben'],
  treten:   ['treten','trittst','tritt','trat','getreten','sein'],
  trinken:  ['trinken','trinkst','trinkt','trank','getrunken','haben'],
  vergessen:['vergessen','vergisst','vergisst','vergaß','vergessen','haben'],
  verlieren:['verlieren','verlierst','verliert','verlor','verloren','haben'],
  wachsen:  ['wachsen','wächst','wächst','wuchs','gewachsen','sein'],
  waschen:  ['waschen','wäschst','wäscht','wusch','gewaschen','haben'],
  weisen:   ['weisen','weist','weist','wies','gewiesen','haben'],
  wenden:   ['wenden','wendest','wendet','wandte','gewandt','haben'],
  werben:   ['werben','wirbst','wirbt','warb','geworben','haben'],
  werfen:   ['werfen','wirfst','wirft','warf','geworfen','haben'],
  wiegen:   ['wiegen','wiegst','wiegt','wog','gewogen','haben'],
  winden:   ['winden','windest','windet','wand','gewunden','haben'],
  ziehen:   ['ziehen','ziehst','zieht','zog','gezogen','haben'],
  zwingen:  ['zwingen','zwingst','zwingt','zwang','gezwungen','haben'],
  weichen:  ['weichen','weichst','weicht','wich','gewichen','sein'],
  /* prefixed exceptions whose aux differs from the base verb */
  erscheinen:['erscheinen','erscheinst','erscheint','erschien','erschienen','sein'],
};

/* Full infinitives that take 'sein' even though the engine would default to 'haben'
   (motion / change-of-state verbs, mostly weak or aux-switching separables). */
const AUX_SEIN = new Set([
  'landen','passieren','klettern','rutschen','schrumpfen','avancieren','erfolgen',
  'entstammen','ertönen','auswandern','einwandern','aufstehen','aufwachen','einschlafen',
  'umziehen','aufgehen','abweichen','eingehen','aufstehen','aufkommen','beitreten',
]);

const SEP = ['zurück','zusammen','gegenüber','heraus','herein','herunter','hinaus','hinein','hinunter','herauf','herab','entgegen','voran','voraus','vorbei','weiter','nieder',
  'ab','an','auf','aus','bei','ein','mit','nach','vor','zu','weg','her','hin','los','fort','fest','frei','hoch','teil','statt','um'];
const INSEP = ['be','ge','er','ver','zer','ent','emp','miss','wider','durch','über','unter','hinter'];
const PRON = ['ich','du','er/sie/es','wir','ihr','sie/Sie'];

function asciiKey(s){return s.replace(/ä/g,'a').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ß/g,'ss');}

/** Infinitive → present stem (strip exactly ONE ending: -en or -n). */
function infStem(inf){
  if(inf.endsWith('en')) return inf.slice(0,-2);
  if(inf.endsWith('n'))  return inf.slice(0,-1);
  return inf;
}

/** does the stem need a binding -e- before -st / -t ? */
function needE(stem){
  return /[dt]$/.test(stem) || /(chn|ffn|gn|tm|dm)$/.test(stem) ||
         (/[^aeiouäöülrhmn][mn]$/.test(stem));
}

function auxRow(aux, pp){
  const hb={'ich':'habe','du':'hast','er/sie/es':'hat','wir':'haben','ihr':'habt','sie/Sie':'haben'};
  const sn={'ich':'bin','du':'bist','er/sie/es':'ist','wir':'sind','ihr':'seid','sie/Sie':'sind'};
  const a = aux==='sein'?sn:hb; const r={};
  for(const p of PRON) r[p]=a[p]+' '+pp;
  return r;
}

/* ── WEAK verb full conjugation (base = infinitive without separable prefix) ── */
function weakPresent(base){
  if(base.endsWith('eln')){ const s=base.slice(0,-3); // sammeln->sammel
    return {'ich':s+'le','du':s+'elst','er/sie/es':s+'elt','wir':base,'ihr':s+'elt','sie/Sie':base}; }
  if(base.endsWith('ern')){ const s=base.slice(0,-3); // ändern->änder
    return {'ich':s+'ere','du':s+'erst','er/sie/es':s+'ert','wir':base,'ihr':s+'ert','sie/Sie':base}; }
  const stem=infStem(base);
  const e=needE(stem)?'e':'';
  const sib=/[sßxz]$/.test(stem);
  const du = sib ? stem+(e?e+'st':'t') : stem+e+'st';
  return {'ich':stem+'e','du':du,'er/sie/es':stem+e+'t','wir':base,'ihr':stem+e+'t','sie/Sie':base};
}
function weakPraet(base){
  const stem = (base.endsWith('eln')||base.endsWith('ern')) ? base.slice(0,-1) : infStem(base);
  const e=needE(stem)?'e':'';
  const t=stem+e+'te';
  return {'ich':t,'du':stem+e+'test','er/sie/es':t,'wir':stem+e+'ten','ihr':stem+e+'tet','sie/Sie':stem+e+'ten'};
}
/* Weak verbs with an inseparable prefix take NO ge- in the participle
   (besuchen→besucht, erklären→erklärt, gehören→gehört, entdecken→entdeckt). */
const INSEP_PFX = ['be','emp','ent','er','ver','zer','miss','ge'];
/* simplex weak verbs that merely START with those letters and DO keep ge- */
const SIMPLEX_KEEP_GE = new Set([
  'beben','beten','betteln','bellen','beeren','benoten','enden','endigen','engen',
  'erben','ernten','erden','gähnen','gönnen','geizen','gellen','gären','genesen',
]);
function hasInsepPrefix(base){
  if(SIMPLEX_KEEP_GE.has(base)) return false;
  return INSEP_PFX.some(p => base.startsWith(p) && base.length - p.length >= 3);
}
function weakPP(base){
  if(base.endsWith('ieren')) return base.slice(0,-2)+'t'; // studieren->studiert
  const stem = (base.endsWith('eln')||base.endsWith('ern')) ? base.slice(0,-1) : infStem(base);
  const e=needE(stem)?'e':'';
  return (hasInsepPrefix(base) ? '' : 'ge') + stem + e + 't';
}

/* ── STRONG verb full conjugation from principal parts ──
   du and er are taken verbatim from the table; ich/wir/ihr/sie are always
   the REGULAR forms (strong verbs never change the vowel in those persons). */
function strongPresent(base, du, er){
  const stem=infStem(base);
  const ihrE=needE(stem)?'e':'';
  return {'ich':stem+'e','du':du,'er/sie/es':er,'wir':base,'ihr':stem+ihrE+'t','sie/Sie':base};
}
function strongPraet(praet){
  const e=/[dt]$/.test(praet)?'e':'';
  const du = /[sßzx]$/.test(praet)? praet+'est' : praet+e+'st';
  return {'ich':praet,'du':du,'er/sie/es':praet,'wir':praet+'en','ihr':praet+e+'t','sie/Sie':praet+'en'};
}

/** Detect a separable/inseparable prefix whose remainder is a known strong base. */
function splitStrong(inf){
  const direct=STRONG[asciiKey(inf)];
  if(direct) return {prefix:'',sep:false,base:inf,parts:direct};
  for(const p of INSEP){
    if(inf.startsWith(p)){ const rest=inf.slice(p.length); const k=STRONG[asciiKey(rest)];
      if(k) return {prefix:p,sep:false,base:rest,parts:k}; } }
  for(const p of [...SEP].sort((a,b)=>b.length-a.length)){
    if(inf.startsWith(p)){ const rest=inf.slice(p.length); const k=STRONG[asciiKey(rest)];
      if(k && rest.length>=3) return {prefix:p,sep:true,base:rest,parts:k}; } }
  return null;
}

/** Detect a separable prefix on a WEAK verb (remainder is a plausible weak infinitive). */
function splitWeakSep(inf){
  for(const p of [...SEP].sort((a,b)=>b.length-a.length)){
    if(inf.startsWith(p)){ const rest=inf.slice(p.length);
      if(rest.length>=4 && /(en|eln|ern)$/.test(rest)) return {prefix:p,base:rest}; } }
  return null;
}

function applySepPresentPraet(row, prefix){ const r={}; for(const p of PRON) r[p]=row[p]+' '+prefix; return r; }
function applyInsepRows(row, prefix){ const r={}; for(const p of PRON) r[p]=prefix+row[p]; return r; }

/** Apply the AUX_SEIN override: rebuild perfekt with 'sein' if listed. */
function applyAuxOverride(entry){
  if(entry && AUX_SEIN.has(entry.verb)){
    const pp = entry.perfekt['er/sie/es'].split(' ').slice(1).join(' '); // strip 'hat '
    entry.perfekt = auxRow('sein', pp);
  }
  return entry;
}

/** Build a full verb entry. Returns null if not confidently conjugatable. */
function conjugate(inf, meaning, level){
  inf=inf.trim();
  // STRONG (incl. prefixed)
  const s=splitStrong(inf);
  if(s){
    const [,du,er,praet,pp,aux]=s.parts;
    let present=strongPresent(s.base,du,er);
    let praeteritum=strongPraet(praet);
    let perfekt;
    if(!s.prefix){ perfekt=auxRow(aux,pp); }
    else if(s.sep){ present=applySepPresentPraet(present,s.prefix); praeteritum=applySepPresentPraet(praeteritum,s.prefix); perfekt=auxRow(aux,s.prefix+pp); }
    else { present=applyInsepRows(present,s.prefix); praeteritum=applyInsepRows(praeteritum,s.prefix); const ppNoGe=pp.startsWith('ge')?pp.slice(2):pp; perfekt=auxRow(aux,s.prefix+ppNoGe); }
    return applyAuxOverride({ verb:inf, meaning, level, category: s.sep?'Trennbar':'Stark', irregular:true, present, praeteritum, perfekt });
  }
  // WEAK separable
  const ws=splitWeakSep(inf);
  if(ws){
    const present=applySepPresentPraet(weakPresent(ws.base),ws.prefix);
    const praeteritum=applySepPresentPraet(weakPraet(ws.base),ws.prefix);
    const perfekt=auxRow('haben', ws.prefix+weakPP(ws.base));
    return applyAuxOverride({ verb:inf, meaning, level, category:'Trennbar', irregular:false, present, praeteritum, perfekt });
  }
  // WEAK simple (must look like a real infinitive)
  if(/[a-zäöüß]+(en|eln|ern)$/.test(inf) && inf.length>=4){
    const present=weakPresent(inf);
    const praeteritum=weakPraet(inf);
    const perfekt=auxRow('haben',weakPP(inf));
    return applyAuxOverride({ verb:inf, meaning, level, category:'Schwach', irregular:false, present, praeteritum, perfekt });
  }
  return null; // not confidently a conjugatable infinitive
}

module.exports={ conjugate, STRONG, asciiKey, splitStrong };
