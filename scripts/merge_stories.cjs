/* Merge a patch file of rewritten stories into public/data/stories.json.
   Each patch entry is matched by (level, num) — unique per story — and may
   replace de / en / vocab / title / titleEn. Preserves id, num, level.
   Usage: node scripts/merge_stories.cjs scripts/batch_XX.json                 */
const fs = require('fs');
const path = require('path');

const patchPath = process.argv[2];
if (!patchPath) { console.error('Usage: node scripts/merge_stories.cjs <patch.json>'); process.exit(1); }

const storiesPath = path.join(__dirname, '..', 'public', 'data', 'stories.json');
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));
const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));

// Backup first (to project backups/, never under public/).
const backupsDir = path.join(__dirname, '..', 'backups');
fs.mkdirSync(backupsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(path.join(backupsDir, `stories-${stamp}.json`), JSON.stringify(stories), 'utf8');

// Index by "level#num" (unique).
const key = (lv, num) => `${lv}#${num}`;
const byKey = new Map(stories.map(s => [key(s.level, s.num), s]));
const paras = t => t.split(/\n\n+/).length;
let applied = 0; const missing = []; const tooShort = [];

for (const p of patch) {
  const s = byKey.get(key(p.level, p.num));
  if (!s) { missing.push(key(p.level, p.num)); continue; }
  if (p.de) s.de = p.de;
  if (p.en) s.en = p.en;
  if (p.vocab) s.vocab = p.vocab;
  if (p.title) s.title = p.title;
  if (p.titleEn) s.titleEn = p.titleEn;
  applied++;
  if (s.de.length < 700) tooShort.push(`${key(s.level, s.num)}=${s.de.length}`);
}

fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 0), 'utf8');
console.log(`Applied ${applied}/${patch.length}. Missing: ${missing.length ? missing.join(',') : 'none'}.`);
if (tooShort.length) console.log(`WARN under 700 chars: ${tooShort.join(', ')}`);
console.log(`Total stories: ${stories.length}. Backup: backups/stories-${stamp}.json`);
