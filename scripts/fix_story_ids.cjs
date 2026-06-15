/* One-time fix: stories.json has duplicate `id`s across levels
   (A1 S001-100, A2 S051-150, B1 S101-200 → collisions), which breaks
   React list keys and per-story selection. Reassign globally-unique,
   level-prefixed ids: A1_001.., A2_001.., B1_001.., B2_001..
   Content (de/en/vocab/title/num) is untouched. */
const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '..', 'public', 'data', 'stories.json');
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

// Backup
const backupsDir = path.join(__dirname, '..', 'backups');
fs.mkdirSync(backupsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(path.join(backupsDir, `stories-idfix-${stamp}.json`), JSON.stringify(stories), 'utf8');

const seq = {};
for (const s of stories) {
  seq[s.level] = (seq[s.level] || 0) + 1;
  s.id = `${s.level}_${String(seq[s.level]).padStart(3, '0')}`;
}

// Validate uniqueness
const ids = stories.map(s => s.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 0), 'utf8');

console.log('Reassigned ids. Per-level counts:', JSON.stringify(seq));
console.log('Total:', stories.length, 'unique ids:', new Set(ids).size, 'remaining dups:', dup.length);
console.log('Backup: backups/stories-idfix-' + stamp + '.json');
