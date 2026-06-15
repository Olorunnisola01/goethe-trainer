/* Remove structurally-invalid verb-quiz questions.

   Some example templates contain a MODAL verb (kannst, willst, musst, …) or a
   future auxiliary (wirst) before the gap. Grammatically those constructions
   require the INFINITIVE of the main verb at the clause end
   ("Kannst du dich bitte entschuldigen?"), so you cannot test a conjugated
   Präsens/Präteritum/Perfekt form in that slot — the question is invalid.

   We drop these (unless the verb being tested IS the modal itself). */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'verbquiz.json');

const MODALS = new Set([
  'kann','kannst','könnt','könnte','könntest','könnten','könntet',
  'will','willst','wollt','wollte','wolltest','wollten',
  'muss','musst','müsst','musste','musstest','mussten',
  'soll','sollst','sollt','sollte','solltest','sollten',
  'darf','darfst','dürft','durfte','durftest','durften',
  'möchte','möchtest','möchtet','möchten',
  'mag','magst','mögt',
  'wirst','werdet',
  'würde','würdest','würden','würdet',
  'lass','lässt','lasst',
]);
const MODAL_VERBS = new Set(['können','wollen','müssen','sollen','dürfen','mögen','werden','lassen']);

const words = (s) => s.toLowerCase().replace(/[^a-zäöüß\s]/g, ' ').split(/\s+/).filter(Boolean);

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const before = data.length;

const kept = data.filter(item => {
  const template = (item.q || '').split('\n')[0];
  const hasModal = words(template).some(w => MODALS.has(w));
  const isModalVerb = MODAL_VERBS.has((item.verb || '').replace(/^sich\s/, ''));
  return !(hasModal && !isModalVerb);   // drop modal-context questions for non-modal verbs
});

fs.writeFileSync(FILE, JSON.stringify(kept));
console.log(`Dropped ${before - kept.length} invalid (modal-context) questions — ${kept.length} remain.`);
