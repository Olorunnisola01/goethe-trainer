const fs = require("fs");
const data = JSON.parse(fs.readFileSync("public/data/vocab.json", "utf8"));

let flat = [];
data.forEach(topic => {
  if (topic.entries) {
    topic.entries.forEach(e => {
      flat.push({ ...e, topicId: topic.id, topicTitle: topic.title, level: topic.level });
    });
  }
});

console.log("Total flat entries:", flat.length);

const badPatterns = [
  /ablehnen, lehnt ab/,
  /ausgleichen, gleicht aus/,
  /, lehnt ab, lehnte ab, hat/,
  /, gleicht aus, glich aus, hat/,
  /entstand, ist entstanden/,
  /Organismus, Organismen/
];

const bad = flat.filter(e => {
  if (!e.w) return false;
  return badPatterns.some(p => p.test(e.w));
});

console.log("\nBad paradigm-style entries found:", bad.length);
bad.forEach((b, i) => {
  console.log(`${i+1}. w="${b.w}"  t="${b.t}"  topic="${b.topicTitle || b.topicId}"  level=${b.level}`);
});

fs.writeFileSync("temp_bad_entries.json", JSON.stringify(bad, null, 2));
console.log("\nWrote temp_bad_entries.json with details.");
