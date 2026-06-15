/* Repair malformed verb-quiz questions whose `q` first line is prefixed with an
   English tag and (sometimes) an instruction, e.g.:
     "[BE] — Ergänze die richtige Form: Ich _____ heute sehr glücklich."
     "[KNOW (PERSON)] — Ich _____ diese Stadt sehr gut."
   These leak the tag/instruction into the displayed sentence and produce extra
   blanks. We recover the real sentence and rebuild a clean two-line `q`. */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'verbquiz.json');

const PLABEL = { 'ich': '1st sg', 'du': '2nd sg', 'er/sie/es': '3rd sg', 'wir': '1st pl', 'ihr': '2nd pl', 'sie/Sie': '3rd pl' };

// Tag + optional dash + optional "Ergänze die richtige Form:" → capture the rest.
const TAG_RE = /^\s*\[[^\]]*\]\s*[—\-–]\s*(?:Ergänze die richtige Form:\s*)?(.*)$/;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let fixed = 0;

for (const item of data) {
  const firstLine = (item.q || '').split('\n')[0];
  const m = firstLine.match(TAG_RE);
  if (!m) continue;

  const realSentence = m[1].trim();
  if (!realSentence) continue;

  const instr = item.format === 'Fill-in-the-Gap'
    ? `(→ Ergänze die richtige Form von „${item.verb}" — Tense: ${item.tense}, Person: ${item.person})`
    : `(→ Welche Form von „${item.verb}" ist korrekt? Tense: ${item.tense}, Person: ${item.person})`;

  item.q = `${realSentence}\n${instr}`;
  fixed++;
}

fs.writeFileSync(FILE, JSON.stringify(data));
console.log(`De-tagged ${fixed} malformed questions.`);
