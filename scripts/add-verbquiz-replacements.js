/* Generate 128 new, grammatically valid verb-quiz questions to replace the
   invalid modal-context ones that were removed (bringing the total back to 6000).

   Each question uses a simple, natural, modal-free sentence frame with correct
   word order (Perfekt participle at the clause end), built from the verified
   conjugation tables in verbs.json. */

const fs = require('fs');
const path = require('path');
const QFILE = path.join(__dirname, '..', 'public', 'data', 'verbquiz.json');
const VFILE = path.join(__dirname, '..', 'public', 'data', 'verbs.json');

const verbs = JSON.parse(fs.readFileSync(VFILE, 'utf8'));
const data  = JSON.parse(fs.readFileSync(QFILE, 'utf8'));

/* Natural complement per verb (German) — reads correctly for every person. */
const COMPLEMENT = {
  gehen: 'ins Kino', kommen: 'zur Party', arbeiten: 'im Büro', spielen: 'Fußball',
  lernen: 'Deutsch', wohnen: 'in Berlin', warten: 'auf den Bus', kochen: 'eine Suppe',
  kaufen: 'frisches Brot', trinken: 'einen Kaffee', schlafen: 'acht Stunden',
  lachen: 'über den Witz', tanzen: 'die ganze Nacht', reisen: 'nach Italien',
  bleiben: 'zu Hause', schwimmen: 'im See', fragen: 'den Lehrer',
  antworten: 'auf die E-Mail', hören: 'Musik', machen: 'die Hausaufgaben',
};
const VERB_LIST = Object.keys(COMPLEMENT);

const PERSONS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
const SUBJECT = { 'ich': 'Ich', 'du': 'Du', 'er/sie/es': 'Er', 'wir': 'Wir', 'ihr': 'Ihr', 'sie/Sie': 'Sie' };
const PLABEL  = { 'ich': '1st sg', 'du': '2nd sg', 'er/sie/es': '3rd sg', 'wir': '1st pl', 'ihr': '2nd pl', 'sie/Sie': '3rd pl' };
const TENSES  = [['Präsens', 'present'], ['Präteritum', 'praeteritum'], ['Perfekt', 'perfekt']];
const FORMATS = ['Multiple Choice', 'Fill-in-the-Gap'];

const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* Build the natural full sentence for a given tense form. */
function makeSentence(subject, form, complement, tenseKey) {
  if (tenseKey === 'perfekt') {
    const parts = form.split(/\s+/);            // e.g. ["bin","gegangen"] or ["habe","gearbeitet"]
    const aux = parts[0], participle = parts.slice(1).join(' ');
    return `${subject} ${aux} ${complement} ${participle}.`;
  }
  return `${subject} ${form} ${complement}.`;
}

/* Blank out each word of `form` where it sits in the sentence. */
function blankSentence(sentence, form) {
  let s = sentence;
  for (const t of form.split(/\s+/)) {
    s = s.replace(new RegExp('(^|[^\\wäöüÄÖÜß])' + esc(t) + '(?=[^\\wäöüÄÖÜß]|$)'), '$1_____');
  }
  return s;
}

/* Mask a form for the Fill-in-the-Gap hint: keep first & last letter of each word. */
function maskForm(form) {
  return form.split(/\s+/).map(w =>
    w.length <= 2 ? w : w[0] + '_'.repeat(w.length - 2) + w[w.length - 1]
  ).join(' ');
}

/* Build 4 multiple-choice options (1 correct + 3 plausible distractors). */
function makeOptions(vEntry, person, tenseKey, correct) {
  const pool = new Set();
  for (const tk of ['present', 'praeteritum', 'perfekt']) {
    for (const p of PERSONS) pool.add(vEntry[tk][p]);
  }
  pool.add(vEntry.verb);                          // infinitive
  pool.delete(correct);
  const distractors = [...pool].filter(Boolean);
  // shuffle distractors
  for (let i = distractors.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [distractors[i], distractors[j]] = [distractors[j], distractors[i]]; }
  const opts = [correct, ...distractors.slice(0, 3)];
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  return { opts, ans: opts.indexOf(correct) };
}

/* Build the full combo list, then take 128 spread across verbs/tenses/formats. */
const combos = [];
for (const person of PERSONS)
  for (const [tenseLabel, tenseKey] of TENSES)
    for (const fmt of FORMATS)
      for (const vName of VERB_LIST)
        combos.push({ vName, person, tenseLabel, tenseKey, fmt });
// deterministic-ish shuffle
for (let i = combos.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [combos[i], combos[j]] = [combos[j], combos[i]]; }

let made = 0, idNum = 6001;
const seen = new Set();
for (const c of combos) {
  if (made >= 128) break;
  const key = `${c.vName}|${c.person}|${c.tenseKey}|${c.fmt}`;
  if (seen.has(key)) continue;
  seen.add(key);

  const vEntry = verbs.find(v => v.verb === c.vName);
  if (!vEntry) continue;
  const form = vEntry[c.tenseKey][c.person];
  if (!form) continue;

  const subject    = SUBJECT[c.person];
  const complement = COMPLEMENT[c.vName];
  const sentence   = makeSentence(subject, form, complement, c.tenseKey);
  const qFirst     = blankSentence(sentence, form);
  const level      = vEntry.level || 'A1';
  const verbType   = vEntry.irregular ? 'Irregular' : 'Regular';

  const base = {
    id: 'VQ' + String(idNum++).padStart(4, '0'),
    level, verbType, tense: c.tenseLabel, format: c.fmt,
    verb: c.vName, person: c.person,
    correct: form, sentence,
    ch: 'Verb Conjugation',
    tip: `**${c.vName}** (${c.tenseLabel}, ${PLABEL[c.person]}): **${form}**.`,
  };

  if (c.fmt === 'Multiple Choice') {
    const { opts, ans } = makeOptions(vEntry, c.person, c.tenseKey, form);
    if (opts.length < 4) continue;               // need 4 distinct options
    base.q = `${qFirst}\n(→ Welche Form von „${c.vName}" ist korrekt? Tense: ${c.tenseLabel}, Person: ${c.person})`;
    base.opts = opts; base.ans = ans;
  } else {
    base.q = `${qFirst}\n(→ Ergänze die richtige Form von „${c.vName}" — Tense: ${c.tenseLabel}, Person: ${c.person})`;
    base.prompt = maskForm(form);
  }

  data.push(base);
  made++;
}

fs.writeFileSync(QFILE, JSON.stringify(data));
console.log(`Added ${made} new questions — total now ${data.length}.`);
