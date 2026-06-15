/* Framework: add B2 as a selectable level to the filter arrays + Level types
   across the Üben pages and Konjugation. Content can be filled in later batches. */
const fs = require('fs');
const path = require('path');

const files = [
  'app/(dashboard)/ueben/geschichten/GeschichtenClient.tsx',
  'app/(dashboard)/ueben/hoeren/HoerenClient.tsx',
  'app/(dashboard)/ueben/karteikarten/KarteikartenClient.tsx',
  'app/(dashboard)/ueben/konversation/KonversationClient.tsx',
  'app/(dashboard)/ueben/lesen/LesenClient.tsx',
  'app/(dashboard)/ueben/quiz/QuizClient.tsx',
  'app/(dashboard)/ueben/redemittel-quiz/RedemittelQuizClient.tsx',
  'app/(dashboard)/ueben/schreiben/SchreibenClient.tsx',
  'app/(dashboard)/ueben/sprechen/SprechenClient.tsx',
  'app/(dashboard)/konjugation/KonjugationClient.tsx',
];

let changed = 0;
for (const rel of files) {
  const fp = path.join(__dirname, '..', rel);
  if (!fs.existsSync(fp)) { console.log('skip (missing):', rel); continue; }
  let s = fs.readFileSync(fp, 'utf8');
  const before = s;

  // 1) filter array (handles a couple of spacing variants)
  s = s.replace(/\['ALL',\s*'A1',\s*'A2',\s*'B1'\]/g, "['ALL', 'A1', 'A2', 'B1', 'B2']");
  // 2) Level type union
  s = s.replace(/type Level\s*=\s*'A1'\s*\|\s*'A2'\s*\|\s*'B1'(?!\s*\|\s*'B2')/g, "type Level = 'A1' | 'A2' | 'B1' | 'B2'");

  if (s !== before) { fs.writeFileSync(fp, s); changed++; console.log('updated:', rel); }
  else console.log('no change:', rel);
}
console.log(`Done. ${changed} files updated.`);
