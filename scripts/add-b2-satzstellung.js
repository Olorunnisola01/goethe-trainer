/* Batch 4: Add B2 Satzstellung (sentence order) exercises to sentence_order.json */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'sentence_order.json');

// Helper: split sentence into tokens (words + punctuation)
function tok(s) { return s.match(/[\wäöüÄÖÜß]+|[^\w\s]/g) || s.split(' '); }

const exercises = [
  // ── Konjunktiv II ──────────────────────────────────────────
  { correct:'Wenn ich mehr Zeit hätte, würde ich mehr reisen.', topic:'Konjunktiv II', structure:'Wenn + Konjunktiv II, würde + Infinitiv (unreal condition)', tip:'Unreal conditions: Konjunktiv II in both clauses. **hätte** in the wenn-clause, **würde reisen** in the main clause.' },
  { correct:'An deiner Stelle würde ich das überdenken.', topic:'Konjunktiv II', structure:'An + Possessiv + Stelle würde ich + Infinitiv (advice)', tip:'**An deiner Stelle würde ich…** = "In your position I would…" — a standard way to give advice politely.' },
  { correct:'Das wäre wirklich eine gute Idee.', topic:'Konjunktiv II', structure:'Konjunktiv II von sein: wäre (hypothetical statement)', tip:'**wäre** = Konjunktiv II of *sein*. Expresses a hypothetical or wishful statement.' },
  { correct:'Könnten Sie mir bitte helfen?', topic:'Konjunktiv II', structure:'Konjunktiv II als höfliche Bitte: Könnten + Subject + Infinitiv', tip:'**Könnten Sie…?** is the polite Konjunktiv II request form — more formal than *Können Sie…?*' },
  { correct:'Wenn er doch rechtzeitig gekommen wäre!', topic:'Konjunktiv II', structure:'Irrealer Wunsch: Wenn + doch + Konjunktiv II Perfekt', tip:'Unreal wish about the past: **Konjunktiv II Perfekt** — wäre + Partizip II.' },

  // ── Passiv ─────────────────────────────────────────────────
  { correct:'Das neue Gesetz wird vom Parlament verabschiedet.', topic:'Passiv', structure:'Vorgangspassiv Präsens: wird + Partizip II (+ von + Dativ)', tip:'**Vorgangspassiv**: werden (conjugated) + Partizip II. Agent introduced with *von + Dativ*.' },
  { correct:'Der Bericht wurde gestern fertiggestellt.', topic:'Passiv', structure:'Vorgangspassiv Präteritum: wurde + Partizip II', tip:'Passive Präteritum: **wurde** + Partizip II. Common in written German for past events.' },
  { correct:'Das Gebäude ist vollständig renoviert worden.', topic:'Passiv', structure:'Passiv Perfekt: ist + Partizip II + worden', tip:'Passiv Perfekt uses **worden** (not *geworden*): **ist … worden**.' },
  { correct:'Das lässt sich nicht so einfach erklären.', topic:'Passiv', structure:'Passiversatz: sich lassen + Infinitiv (possibility)', tip:'**sich lassen + Infinitiv** = passive meaning with possibility: "cannot be easily explained."' },
  { correct:'Die Aufgabe ist bis morgen abzugeben.', topic:'Passiv', structure:'Passiversatz: sein + zu + Infinitiv (obligation)', tip:'**sein + zu + Infinitiv** = must be done. Formal, written style.' },

  // ── Nebensätze ─────────────────────────────────────────────
  { correct:'Er arbeitet hart, obwohl er schon sehr müde ist.', topic:'Nebensätze', structure:'Konzessivsatz: obwohl + SOV (verb at end)', tip:'**obwohl** (although) is a subordinating conjunction — the finite verb goes to the END of the clause.' },
  { correct:'Sie spart Geld, damit sie eine Reise machen kann.', topic:'Nebensätze', structure:'Finalsatz: damit + Subjekt + … + Verb (end)', tip:'**damit** introduces a purpose clause. Note: *damit* is used when the subjects of main and sub-clause differ. Verb goes to the end.' },
  { correct:'Er lernt Deutsch, indem er täglich Podcasts hört.', topic:'Nebensätze', structure:'Modalsatz: indem + SOV (how something is done)', tip:'**indem** = "by doing" — explains the METHOD. Verb at the end: *indem er Podcasts **hört***.' },
  { correct:'Da es heute regnet, bleibe ich zu Hause.', topic:'Nebensätze', structure:'Kausalsatz vorne: Da + SOV, Hauptsatz (V2)', tip:'When a *da/weil* clause comes FIRST, the main clause starts with the verb (V2 rule): *da es regnet,* **bleibe** ich…' },
  { correct:'Das ist das Thema, über das wir gesprochen haben.', topic:'Nebensätze', structure:'Relativsatz mit Präposition: über + das (Relativpronomen)', tip:'With a preposition in the relative clause: **preposition + relative pronoun**: *über das* (Neutr. Akk.).' },
  { correct:'Es gibt vieles, worüber man nachdenken könnte.', topic:'Nebensätze', structure:'wo-Kompositum als Relativpronomen für Sachen/Ideen', tip:'**wo- compounds** (worüber, womit…) replace *preposition + relative pronoun* for non-personal referents.' },

  // ── Partizipialkonstruktionen ───────────────────────────────
  { correct:'Die steigende Inflation ist ein ernstes Problem.', topic:'Partizipialkonstruktionen', structure:'Partizip I als Attribut: Stamm + -d + Adjektivendung', tip:'**Partizip I** (steigende): verb stem + -d + adjective ending. Describes an ongoing action.' },
  { correct:'Der vorgeschlagene Plan wurde einstimmig angenommen.', topic:'Partizipialkonstruktionen', structure:'Partizip II als Attribut (ersetzte Passiv-Relativsatz)', tip:'**Partizip II** as attribute replaces a passive relative clause: *der Plan, der vorgeschlagen wurde* → *der **vorgeschlagene** Plan*.' },
  { correct:'Sie ging, ohne sich zu verabschieden.', topic:'Partizipialkonstruktionen', structure:'ohne + zu + Infinitiv (same subject as main clause)', tip:'**ohne … zu + Infinitiv** expresses doing something WITHOUT doing something else. Infinitive goes after *zu* at the end.' },
  { correct:'Anstatt zu klagen, sucht er nach Lösungen.', topic:'Partizipialkonstruktionen', structure:'(an)statt + zu + Infinitiv (instead of doing)', tip:'**(An)statt … zu + Infinitiv** = "instead of doing". Same subject as the main clause required.' },

  // ── Konnektoren ────────────────────────────────────────────
  { correct:'Je mehr man liest, desto besser schreibt man.', topic:'Konnektoren', structure:'je + Komparativ, desto + Komparativ + V2', tip:'**je … desto**: both adjectives in comparative. After *desto*, verb comes in position 2 (V2): *desto besser **schreibt** man*.' },
  { correct:'Sowohl die Qualität als auch der Preis überzeugen.', topic:'Konnektoren', structure:'sowohl … als auch (both … and) — verb agrees with plural', tip:'**sowohl … als auch** connects two subjects. The verb agrees with both → plural: *überzeug**en***.' },
  { correct:'Das war zwar schwierig, aber wir haben es geschafft.', topic:'Konnektoren', structure:'zwar … aber: Hauptsatz + aber + Hauptsatz (V2)', tip:'**zwar … aber** = "admittedly … but". After *aber*, the main clause continues normally (V2).' },
  { correct:'Nicht nur die Kosten, sondern auch die Qualität spielen eine Rolle.', topic:'Konnektoren', structure:'nicht nur … sondern auch — Verb nach dem zweiten Subjekt', tip:'**nicht nur … sondern auch** connects two elements. Verb agrees with the second element or is plural.' },
  { correct:'Er hat weder Zeit noch Energie dafür.', topic:'Konnektoren', structure:'weder … noch: negiert beide Elemente', tip:'**weder … noch** = neither … nor. Negates BOTH elements. No extra *nicht* needed.' },

  // ── Indirekte Rede ─────────────────────────────────────────
  { correct:'Der Minister erklärte, die Lage sei unter Kontrolle.', topic:'Indirekte Rede', structure:'Indirekte Rede mit Konjunktiv I: sei (3. Sg. von sein)', tip:'In formal indirect speech, use **Konjunktiv I**: *sein* → er/sie **sei**. Common in news reports.' },
  { correct:'Sie sagte, sie könne leider nicht kommen.', topic:'Indirekte Rede', structure:'Indirekte Rede Konjunktiv I: könne (3. Sg. von können)', tip:'**können** Konjunktiv I: er/sie **könne**. Signals that these are reported words, not the speaker\'s own.' },
  { correct:'Der Bericht stellte fest, dass die Preise gestiegen seien.', topic:'Indirekte Rede', structure:'Indirekte Rede mit dass + Konjunktiv I (seien)', tip:'Indirect speech can also use *dass* + verb-final clause. **seien** = Konjunktiv I of *sein* (plural).' },

  // ── Nominalstil ────────────────────────────────────────────
  { correct:'Die Regierung hat eine wichtige Entscheidung getroffen.', topic:'Nominalstil', structure:'Funktionsverbgefüge: Entscheidung treffen (= entscheiden)', tip:'**eine Entscheidung treffen** = to make a decision. Nominalstil replaces the simple verb *entscheiden*.' },
  { correct:'Die Organisation leistet den Betroffenen wertvolle Hilfe.', topic:'Nominalstil', structure:'Funktionsverbgefüge: Hilfe leisten (= helfen)', tip:'**Hilfe leisten** = to provide help. The noun phrase can be extended: *wertvolle Hilfe leisten*.' },
];

// Build sentence_order entries from the exercises
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const base = data.filter(e => e.level !== 'B2');
let id = 6000 + base.length;

const built = exercises.map(ex => {
  const words = ex.correct.match(/[\wäöüÄÖÜß]+|[.,!?–—-]/g) || ex.correct.split(/\s+/);
  // Shuffle words for the puzzle
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Ensure it's actually shuffled (not same as original)
  let tries = 0;
  while (shuffled.join(' ') === words.join(' ') && tries < 20) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    tries++;
  }
  return {
    id: 'SO' + String(++id).padStart(4, '0'),
    level: 'B2',
    topic: ex.topic,
    words: shuffled,
    answer: words,
    correct: ex.correct,
    tip: ex.tip,
    structure: ex.structure,
  };
});

const out = [...base, ...built];
fs.writeFileSync(FILE, JSON.stringify(out));
console.log(`Added ${built.length} B2 Satzstellung exercises. Total: ${out.length}.`);
const byTopic = built.reduce((a,e)=>{a[e.topic]=(a[e.topic]||0)+1;return a},{});
Object.entries(byTopic).forEach(([t,n])=>console.log(`  ${t}: ${n}`));
