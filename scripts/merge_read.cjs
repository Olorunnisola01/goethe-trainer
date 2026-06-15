/* Append/replace Leseverstehen exercises in public/data/read.json.
   Patch entries are matched by id: replaced if present, appended if new.
   Usage: node scripts/merge_read.cjs scripts/read_XX.json                     */
const fs = require('fs');
const path = require('path');

const patchPath = process.argv[2];
if (!patchPath) { console.error('Usage: node scripts/merge_read.cjs <patch.json>'); process.exit(1); }

const readPath = path.join(__dirname, '..', 'public', 'data', 'read.json');
const data = JSON.parse(fs.readFileSync(readPath, 'utf8'));
const patch = JSON.parse(fs.readFileSync(patchPath, 'utf8'));

const backupsDir = path.join(__dirname, '..', 'backups');
fs.mkdirSync(backupsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(path.join(backupsDir, `read-${stamp}.json`), JSON.stringify(data), 'utf8');

const byId = new Map(data.map((e, i) => [e.id, i]));
let added = 0, replaced = 0;
const problems = [];
for (const e of patch) {
  if (!e.id || !e.level || !e.text || !Array.isArray(e.questions)) { problems.push(`bad entry ${e.id || '?'}`); continue; }
  // validate questions
  for (const q of e.questions) {
    if (q.type === 'TF' && typeof q.a !== 'boolean') problems.push(`${e.id}: TF a not bool`);
    if (q.type === 'MCQ' && (!Array.isArray(q.opts) || typeof q.a !== 'number' || q.a < 0 || q.a >= q.opts.length)) problems.push(`${e.id}: MCQ a/opts invalid`);
  }
  if (byId.has(e.id)) { data[byId.get(e.id)] = e; replaced++; }
  else { data.push(e); byId.set(e.id, data.length - 1); added++; }
}

fs.writeFileSync(readPath, JSON.stringify(data), 'utf8');
const byLvl = {}; data.forEach(e => byLvl[e.level] = (byLvl[e.level] || 0) + 1);
console.log(`Added ${added}, replaced ${replaced}. Total: ${data.length}. Per level: ${JSON.stringify(byLvl)}`);
const ids = data.map(e => e.id); const dup = ids.length - new Set(ids).size;
console.log(`Duplicate ids: ${dup}.`, problems.length ? 'PROBLEMS: ' + problems.join('; ') : 'No problems.');
