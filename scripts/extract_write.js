const fs = require('fs');
const src = fs.readFileSync('C:/Users/ADELEKEOLORUNISOLAO/Desktop/Website/index.html', 'utf8');

// Find WRITE_DATA
const marker = 'const WRITE_DATA = [';
const startIdx = src.indexOf(marker);
console.log('WRITE_DATA found at line:', src.slice(0, startIdx).split('\n').length);

// Find the array start
let i = startIdx;
while (src[i] !== '[') i++;
const arrStart = i;
let depth = 0;

// Scan through with template literal awareness
while (i < src.length) {
  const c = src[i];
  if (c === '`') {
    // skip template literal
    i++;
    while (i < src.length) {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === '`') { i++; break; }
      if (src[i] === '$' && src[i+1] === '{') {
        // nested expression - simplified: just scan to matching }
        i += 2;
        let nd = 1;
        while (i < src.length && nd > 0) {
          if (src[i] === '{') nd++;
          else if (src[i] === '}') nd--;
          i++;
        }
        continue;
      }
      i++;
    }
    continue;
  }
  if (c === '"' || c === "'") {
    const q = c; i++;
    while (i < src.length) {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === q) { i++; break; }
      i++;
    }
    continue;
  }
  if (c === '[' || c === '{') depth++;
  else if (c === ']' || c === '}') {
    depth--;
    if (depth === 0 && c === ']') { i++; break; }
  }
  i++;
}

console.log('Array ends at approx line:', src.slice(0, i).split('\n').length);
const rawArr = src.slice(arrStart, i);

let data;
try {
  data = new Function('return ' + rawArr)();
  console.log('WRITE_DATA count:', data.length);
  data.forEach((d, idx) => {
    if (!d.id) console.warn('Missing id at index', idx);
  });
} catch(e) {
  console.error('Parse error:', e.message.slice(0, 300));
  // Try to identify the problem line
  const lines = rawArr.split('\n');
  const match = e.message.match(/line (\d+)/);
  if (match) {
    const ln = parseInt(match[1]);
    console.log('Context:', lines.slice(Math.max(0,ln-3), ln+3).join('\n'));
  }
  process.exit(1);
}

fs.writeFileSync('C:/Users/ADELEKEOLORUNISOLAO/Desktop/goethe-trainer/public/data/write.json', JSON.stringify(data, null, 2));
console.log('Saved', data.length, 'exercises');

// Check for push expansions
const pushIdx = src.indexOf('WRITE_DATA.push(', i);
if (pushIdx !== -1) {
  console.log('Found WRITE_DATA.push() at line:', src.slice(0, pushIdx).split('\n').length);
}
