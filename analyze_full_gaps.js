const fs = require("fs");

const csv = fs.readFileSync("goethe_b1_official.csv", "utf8");
const lines = csv.split(/\r?\n/).slice(1);

const officialWords = new Set();
lines.forEach(line => {
  if (!line.trim()) return;
  let word = "";
  if (line.startsWith('"')) {
    const idx = line.indexOf('"', 1);
    if (idx > 0) word = line.slice(1, idx);
  } else {
    const comma = line.indexOf(",");
    word = comma > -1 ? line.slice(0, comma) : line;
  }
  word = word.toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/→.*$/g, "")
    .replace(/".*"/g, "")
    .replace(/^\s+|\s+$/g, "")
    .trim();

  if (word && word.length > 1 && word.length < 25 && !/^\d/.test(word) && !word.includes("  ")) {
    officialWords.add(word);
  }
});

console.log("Clean official B1 words:", officialWords.size);

// App words union A1+A2+B1
const app = JSON.parse(fs.readFileSync("public/data/vocab.json", "utf8"));
const appWords = new Set();
["A1","A2","B1"].forEach(level => {
  app.filter(c => c.level === level).forEach(cat => {
    (cat.entries || []).forEach(e => {
      let w = (e.w || "").toLowerCase().trim()
        .replace(/\(.*?\)/g, "")
        .replace(/,.*$/, "")
        .replace(/".*"/g, "")
        .trim();
      if (w) appWords.add(w);
    });
  });
});
console.log("App A1+A2+B1 words:", appWords.size);

const missing = [...officialWords].filter(w => !appWords.has(w));
console.log("Missing from entire A1-B1 app:", missing.length);

// High-value filter
const highValue = missing.filter(w => {
  const len = w.length;
  const isVerb = w.includes(",") || w.endsWith("en") || w.endsWith("eln") || w.endsWith("ern");
  const isAdj = w.endsWith("lich") || w.endsWith("ig") || w.endsWith("bar") || w.endsWith("sam");
  const isCommon = len >= 3 && len <= 18;
  const hasSpace = w.includes(" ");
  return isCommon && (isVerb || isAdj || !hasSpace);
}).sort((a,b) => a.length - b.length);

console.log("\n=== Top 80 high-value missing words (prioritized for addition) ===");
highValue.slice(0, 80).forEach((w, i) => console.log((i+1).toString().padStart(2) + ". " + w));
