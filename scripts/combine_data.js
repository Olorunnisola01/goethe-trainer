/**
 * Combine all batch JSON files into the final public/data files.
 * Run: node scripts/combine_data.js
 */
const fs = require('fs');
const path = require('path');

const DATA = 'C:/Users/ADELEKEOLORUNISOLAO/Desktop/goethe-trainer/public/data';

function readIfExists(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')); }
  catch { return []; }
}

// ── Conversations ──────────────────────────────
const convoParts = ['convo_a1.json','convo_a2.json','convo_b1.json'];
const convo = convoParts.flatMap(f => readIfExists(f));
if (convo.length > 0) {
  fs.writeFileSync(path.join(DATA, 'convo.json'), JSON.stringify(convo, null, 2));
  console.log(`✅ convo.json — ${convo.length} conversations (from ${convoParts.filter(f => readIfExists(f).length > 0).length} batches)`);
} else {
  console.log('⚠️  convo.json — no batch files found yet');
}

// ── Stories ────────────────────────────────────
const storyParts = ['stories_a1.json','stories_a2.json','stories_b1_part1.json','stories_b1_part2.json'];
const stories = storyParts.flatMap(f => readIfExists(f));
if (stories.length > 0) {
  fs.writeFileSync(path.join(DATA, 'stories.json'), JSON.stringify(stories, null, 2));
  console.log(`✅ stories.json — ${stories.length} stories (from ${storyParts.filter(f => readIfExists(f).length > 0).length} batches)`);
} else {
  console.log('⚠️  stories.json — no batch files found yet');
}
