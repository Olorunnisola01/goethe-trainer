/**
 * Merges per-level JSON files into the combined files used by the app.
 * Run after background agents finish writing new content.
 *   node scripts/merge-content.js
 */

const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'public', 'data');

function read(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'));
}

function write(file, data) {
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2));
  console.log(`✓ ${file}  (${data.length} items)`);
}

/* ── Conversations ── */
const convo_a1 = read('convo_a1.json');
const convo_a2 = read('convo_a2.json');
const convo_b1 = read('convo_b1.json');
const allConvos = [...convo_a1, ...convo_a2, ...convo_b1];
write('convo.json', allConvos);

/* ── Stories ── */
const stories_a1   = read('stories_a1.json');
const stories_a2   = read('stories_a2.json');
const stories_b1p1 = read('stories_b1_part1.json');
const stories_b1p2 = read('stories_b1_part2.json');

// Re-number to avoid collisions after appending
let num = 1;
const allStories = [
  ...stories_a1.map(s  => ({ ...s, num: num++ })),
  ...stories_a2.map(s  => ({ ...s, num: num++ })),
  ...stories_b1p1.map(s => ({ ...s, num: num++ })),
  ...stories_b1p2.map(s => ({ ...s, num: num++ })),
];
write('stories.json', allStories);

console.log('\nMerge complete!');
console.log('Conversations:', allConvos.length, '| Stories:', allStories.length);
