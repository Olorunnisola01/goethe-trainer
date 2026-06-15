/**
 * One-time cleaner for B2 vocab anomalies.
 * Removes full conjugation paradigm strings from the `w` (headword) field
 * and replaces them with clean base forms + improved English translations.
 *
 * Run:  node scripts/clean-b2-vocab-anomalies.js
 */

const fs = require('fs');
const path = require('path');

const VOCAB_FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

// High-quality clean mapping for the anomalies the user reported (and similar patterns)
const CLEAN_MAP = {
  // === Full paradigm anomalies reported ===
  'ablehnen, lehnt ab, lehnte ab, hat abgelehnt': { w: 'ablehnen', t: 'to reject / turn down' },
  'abschaffen, schafft ab, schaffte ab, hat abgeschafft': { w: 'abschaffen', t: 'to abolish / scrap / eliminate' },
  'anerkennen, erkennt an, erkannte an, hat anerkannt': { w: 'anerkennen', t: 'to recognize / acknowledge / accept' },
  'ausgleichen, gleicht aus, glich aus, hat ausgeglichen': { w: 'ausgleichen', t: 'to balance / equalize / compensate' },
  'beeinflussen, beeinflusst, beeinflusste, hat beeinflusst': { w: 'beeinflussen', t: 'to influence / affect' },
  'begrenzen, begrenzt, begrenzte, hat begrenzt': { w: 'begrenzen', t: 'to limit / restrict / cap' },
  'benachteiligen, benachteiligt, benachteiligte, hat benachteiligt': { w: 'benachteiligen', t: 'to disadvantage / discriminate against' },
  'durchsetzen, setzt durch, setzte durch, hat durchgesetzt': { w: 'durchsetzen', t: 'to enforce / assert / push through' },
  'einschränken, schränkt ein, schränkte ein, hat eingeschränkt': { w: 'einschränken', t: 'to restrict / limit / curtail' },
  'erreichen, erreicht, erreichte, hat erreicht': { w: 'erreichen', t: 'to achieve / reach / attain' },
  'fördern, fördert, förderte, hat gefördert': { w: 'fördern', t: 'to promote / support / foster' },
  'hervorheben, hebt hervor, hob hervor, hat hervorgehoben': { w: 'hervorheben', t: 'to emphasize / highlight / stress' },
  'kritisieren, kritisiert, kritisierte, hat kritisiert': { w: 'kritisieren', t: 'to criticize / critique' },
  'unterstützen, unterstützt, unterstützte, hat unterstützt': { w: 'unterstützen', t: 'to support / back / assist' },
  'verantworten, verantwortet, verantwortete, hat verantwortet': { w: 'verantworten', t: 'to be responsible for / justify / answer for' },
  'vergleichen, vergleicht, verglich, hat verglichen': { w: 'vergleichen', t: 'to compare' },
  'entstehen (entstand, ist entstanden)': { w: 'entstehen', t: 'to arise / emerge / come into being' },
  'vertreten, vertritt, vertrat, hat vertreten': { w: 'vertreten', t: 'to represent / stand for' },
  'der Organismus, Organismen': { w: 'der Organismus, -men', t: 'organism' },
  'widersprechen, widerspricht, widersprach, hat widersprochen': { w: 'widersprechen', t: 'to contradict / disagree with / oppose' },
  'zustimmen, stimmt zu, stimmte zu, hat zugestimmt': { w: 'zustimmen', t: 'to agree / consent / approve' },
  'umsetzen, setzt um, setzte um, hat umgesetzt': { w: 'umsetzen', t: 'to implement / put into practice / realize' },
  'verwirklichen, verwirklicht, verwirklichte, hat verwirklicht': { w: 'verwirklichen', t: 'to realize / implement / bring to fruition' },
  'überzeugen, überzeugt, überzeugte, hat überzeugt': { w: 'überzeugen', t: 'to convince / persuade' },
  'beitragen zu, trägt bei, trug bei, hat beigetragen': { w: 'beitragen (zu + Dat.)', t: 'to contribute to' },
  'hervorrufen, ruft hervor, rief hervor, hat hervorgerufen': { w: 'hervorrufen', t: 'to cause / provoke / elicit / bring about' },
  'umgehen mit, geht um, ging um, ist umgegangen': { w: 'umgehen mit', t: 'to deal with / handle / cope with' },
  'einfordern, fordert ein, forderte ein, hat eingefordert': { w: 'einfordern', t: 'to demand / claim / call for' },
  'aufrechterhalten, erhält aufrecht, erhielt aufrecht, hat aufrechterhalten': { w: 'aufrechterhalten', t: 'to maintain / uphold / preserve' },
  'verstärken, verstärkt, verstärkte, hat verstärkt': { w: 'verstärken', t: 'to strengthen / reinforce / intensify' },
  'herausfordern, fordert heraus, forderte heraus, hat herausgefordert': { w: 'herausfordern', t: 'to challenge / provoke' },
  'vorantreiben, treibt voran, trieb voran, hat vorangetrieben': { w: 'vorantreiben', t: 'to advance / drive forward / promote' },

  // Additional similar patterns that often appear
  'ablehnen, lehnt ab': { w: 'ablehnen', t: 'to reject / turn down' },
  'anerkennen, erkennt an': { w: 'anerkennen', t: 'to recognize / acknowledge' },
  'fördern, fördert': { w: 'fördern', t: 'to promote / support / foster' },
  'widersprechen, widerspricht': { w: 'widersprechen', t: 'to contradict / disagree with' },
  'zustimmen, stimmt zu': { w: 'zustimmen', t: 'to agree / consent' },
  'ausgleichen, gleicht aus': { w: 'ausgleichen', t: 'to balance / compensate' },
};

// Generic normalizer for any remaining "verb, 3sg, past, pp" style strings
function normalizeHeadword(entry) {
  let w = (entry.w || '').trim();
  let t = (entry.t || '').trim();

  // Exact map hit (highest priority)
  if (CLEAN_MAP[w]) {
    return { w: CLEAN_MAP[w].w, t: CLEAN_MAP[w].t };
  }

  // Pattern: "infinitive, 3sg präsens, präteritum, hat/ist pp"
  const paradigmMatch = w.match(/^([a-zäöüß]+(?: [a-zäöüß]+)?),\s*[a-zäöüß ]+,\s*[a-zäöüß ]+,\s*(?:hat|ist)\s+[a-zäöüß]+$/i);
  if (paradigmMatch) {
    const base = paradigmMatch[1].trim();
    // Improve English if it looks like a literal conjugation dump
    if (!t || t.length < 4 || /to [a-z]+,/.test(t)) {
      t = base; // fallback, better than garbage
    }
    return { w: base, t };
  }

  // Pattern with parentheses: "infinitive (past, auxiliary pp)"
  const parenMatch = w.match(/^([a-zäöüß]+)\s*\(([^)]+)\)$/i);
  if (parenMatch) {
    const base = parenMatch[1].trim();
    return { w: base, t };
  }

  // Noun with plural: "der X, Pluralen"
  const nounMatch = w.match(/^(der|die|das)\s+([A-ZÄÖÜ][a-zäöüß]+),\s*([A-ZÄÖÜ]?[a-zäöüß]+)$/);
  if (nounMatch) {
    const article = nounMatch[1];
    const singular = nounMatch[2];
    // Keep simple "der Organismus, -men" style if it was already reasonable
    if (w.includes('Organismen')) {
      return { w: 'der Organismus, -men', t: t || 'organism' };
    }
  }

  return { w, t }; // unchanged
}

function cleanVocab() {
  const raw = fs.readFileSync(VOCAB_FILE, 'utf8');
  const vocab = JSON.parse(raw);

  let changes = 0;
  const seenInTopic = new Map(); // to dedupe within same topic

  vocab.forEach(topic => {
    if (!topic.entries || !Array.isArray(topic.entries)) return;

    const newEntries = [];

    topic.entries.forEach(entry => {
      const originalW = entry.w;
      const normalized = normalizeHeadword(entry);

      if (normalized.w !== originalW) {
        console.log(`CLEANED: "${originalW}"  →  "${normalized.w}"  (topic: ${topic.id || topic.title})`);
        changes++;
      }

      // Dedupe logic: keep first occurrence of a clean headword per topic
      const key = `${topic.id || topic.title}::${normalized.w.toLowerCase()}`;
      if (seenInTopic.has(key)) {
        console.log(`  (duplicate removed: ${normalized.w})`);
        return;
      }
      seenInTopic.set(key, true);

      newEntries.push({
        ...entry,
        w: normalized.w,
        t: normalized.t
      });
    });

    topic.entries = newEntries;
  });

  fs.writeFileSync(VOCAB_FILE, JSON.stringify(vocab, null, 2), 'utf8');

  console.log(`\n✅ Done. ${changes} entries normalized.`);
  console.log(`File written: ${VOCAB_FILE}`);
}

cleanVocab();
