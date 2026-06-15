/**
 * Final Large Push toward 5,000 B2 Vocabulary Entries
 * High-quality, exam-relevant additions based on Aspekte neu B2, Netzwerk B2, Sicher! B2, and Goethe B2 preparation materials.
 * Strong focus on unique, advanced B2-level language.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

function norm(s) { return (s || '').toLowerCase().trim().replace(/\s+/g, ' '); }
function entry(w, t, de, en) { return { w, t, de, en }; }

const pushCategories = [
  // 1. Recht und Justiz
  {
    id: 'B2_RECHT_JUSTIZ2',
    emoji: '⚖️',
    title: 'RECHT & JUSTIZ (B2)',
    level: 'B2',
    entries: [
      entry('die Rechtsstaatlichkeit', 'rule of law', 'Rechtsstaatlichkeit ist eine Grundlage der Demokratie.', 'The rule of law is a foundation of democracy.'),
      entry('die Strafverfolgung', 'criminal prosecution', 'Die Strafverfolgung muss unabhängig sein.', 'Criminal prosecution must be independent.'),
      entry('das Grundgesetz', 'Basic Law', 'Das Grundgesetz garantiert die Grundrechte.', 'The Basic Law guarantees fundamental rights.'),
      entry('die Verfassungsbeschwerde', 'constitutional complaint', 'Die Verfassungsbeschwerde ist ein wichtiges Rechtsmittel.', 'A constitutional complaint is an important legal remedy.'),
      entry('die Pressefreiheit', 'freedom of the press', 'Pressefreiheit darf nicht eingeschränkt werden.', 'Freedom of the press must not be restricted.'),
      entry('die Unschuldsvermutung', 'presumption of innocence', 'Die Unschuldsvermutung gilt bis zum Urteil.', 'The presumption of innocence applies until the verdict.'),
      entry('die Rechtsberatung', 'legal advice', 'Gute Rechtsberatung ist teuer.', 'Good legal advice is expensive.'),
      entry('die Strafzumessung', 'sentencing', 'Die Strafzumessung erfolgt nach dem Strafgesetzbuch.', 'Sentencing is carried out according to the Criminal Code.'),
      entry('die Rechtsmittel', 'legal remedies', 'Rechtsmittel können gegen ein Urteil eingelegt werden.', 'Legal remedies can be filed against a judgment.'),
      entry('die Justizreform', 'judicial reform', 'Eine Justizreform soll Verfahren beschleunigen.', 'A judicial reform is intended to speed up proceedings.'),
    ]
  },

  // 2. Psychologie und Gesellschaft
  {
    id: 'B2_PSYCHOLOGIE_GESELLSCHAFT2',
    emoji: '🧠',
    title: 'PSYCHOLOGIE & GESELLSCHAFT (B2)',
    level: 'B2',
    entries: [
      entry('die Gruppendynamik', 'group dynamics', 'Gruppendynamik beeinflusst Entscheidungen stark.', 'Group dynamics strongly influence decisions.'),
      entry('die kognitive Dissonanz', 'cognitive dissonance', 'Kognitive Dissonanz entsteht bei widersprüchlichen Überzeugungen.', 'Cognitive dissonance arises from contradictory beliefs.'),
      entry('die soziale Erwünschtheit', 'social desirability', 'Soziale Erwünschtheit verzerrt Umfrageergebnisse.', 'Social desirability distorts survey results.'),
      entry('die Konformität', 'conformity', 'Konformität kann kritisches Denken unterdrücken.', 'Conformity can suppress critical thinking.'),
      entry('die Vorurteilsforschung', 'prejudice research', 'Vorurteilsforschung untersucht Stereotype.', 'Prejudice research examines stereotypes.'),
      entry('die Resilienz', 'resilience', 'Resilienz ist die Fähigkeit, Krisen zu bewältigen.', 'Resilience is the ability to cope with crises.'),
      entry('die Identitätskrise', 'identity crisis', 'Eine Identitätskrise kann in jedem Alter auftreten.', 'An identity crisis can occur at any age.'),
      entry('die soziale Wahrnehmung', 'social perception', 'Soziale Wahrnehmung ist oft selektiv.', 'Social perception is often selective.'),
      entry('die Empathie', 'empathy', 'Empathie ist wichtig für zwischenmenschliche Beziehungen.', 'Empathy is important for interpersonal relationships.'),
      entry('die Aggression', 'aggression', 'Aggression kann sowohl physisch als auch verbal sein.', 'Aggression can be both physical and verbal.'),
    ]
  },

  // 3. Umweltpolitik und Nachhaltigkeit
  {
    id: 'B2_UMWELTPOLITIK_NACHHALTIG2',
    emoji: '🌍',
    title: 'UMWELTPOLITIK & NACHHALTIGKEIT (B2)',
    level: 'B2',
    entries: [
      entry('das Klimaschutzgesetz', 'Climate Protection Act', 'Das Klimaschutzgesetz legt verbindliche Ziele fest.', 'The Climate Protection Act sets binding targets.'),
      entry('die Emissionsminderung', 'emission reduction', 'Emissionsminderung ist das Ziel der Energiewende.', 'Emission reduction is the goal of the energy transition.'),
      entry('die Nachhaltigkeitsziele', 'sustainability goals', 'Die UN-Nachhaltigkeitsziele gelten weltweit.', 'The UN sustainability goals apply worldwide.'),
      entry('die Umweltverträglichkeitsprüfung', 'environmental impact assessment', 'Große Projekte brauchen eine Umweltverträglichkeitsprüfung.', 'Large projects require an environmental impact assessment.'),
      entry('die Kreislaufwirtschaft', 'circular economy', 'Die Kreislaufwirtschaft ist ein zukunftsfähiges Modell.', 'The circular economy is a future-proof model.'),
      entry('die Biodiversitätsstrategie', 'biodiversity strategy', 'Die EU hat eine eigene Biodiversitätsstrategie.', 'The EU has its own biodiversity strategy.'),
      entry('die CO2-Bepreisung', 'carbon pricing', 'CO2-Bepreisung soll umweltschädliches Verhalten verteuern.', 'Carbon pricing is meant to make environmentally harmful behavior more expensive.'),
      entry('die Renaturierung von Flächen', 'renaturation of land', 'Renaturierung von Flächen fördert die Artenvielfalt.', 'Renaturation of land promotes biodiversity.'),
      entry('die grüne Transformation', 'green transformation', 'Die grüne Transformation braucht massive Investitionen.', 'The green transformation requires massive investments.'),
      entry('die Klimaklage', 'climate lawsuit', 'Klimaklagen werden weltweit häufiger.', 'Climate lawsuits are becoming more frequent worldwide.'),
    ]
  },

  // 4. Technik und Zukunft
  {
    id: 'B2_TECHNIK_ZUKUNFT2',
    emoji: '🤖',
    title: 'TECHNIK & ZUKUNFT (B2)',
    level: 'B2',
    entries: [
      entry('die künstliche Intelligenz', 'artificial intelligence', 'Künstliche Intelligenz verändert ganze Branchen.', 'Artificial intelligence is transforming entire industries.'),
      entry('die Automatisierung', 'automation', 'Automatisierung ersetzt viele manuelle Tätigkeiten.', 'Automation is replacing many manual tasks.'),
      entry('das Internet der Dinge', 'Internet of Things', 'Das Internet der Dinge vernetzt Alltagsgeräte.', 'The Internet of Things connects everyday devices.'),
      entry('die Robotik', 'robotics', 'Robotik spielt in der Industrie eine immer größere Rolle.', 'Robotics plays an increasingly important role in industry.'),
      entry('die digitale Transformation', 'digital transformation', 'Die digitale Transformation erfordert neue Kompetenzen.', 'Digital transformation requires new skills.'),
      entry('die Blockchain-Technologie', 'blockchain technology', 'Blockchain-Technologie wird auch außerhalb von Kryptowährungen genutzt.', 'Blockchain technology is also used outside of cryptocurrencies.'),
      entry('die Nanotechnologie', 'nanotechnology', 'Nanotechnologie eröffnet neue medizinische Möglichkeiten.', 'Nanotechnology opens up new medical possibilities.'),
      entry('die Quantencomputer', 'quantum computers', 'Quantencomputer könnten bestimmte Probleme viel schneller lösen.', 'Quantum computers could solve certain problems much faster.'),
      entry('die ethische KI', 'ethical AI', 'Ethische KI ist ein wachsendes Forschungsfeld.', 'Ethical AI is a growing field of research.'),
      entry('die Industrie 4.0', 'Industry 4.0', 'Industrie 4.0 steht für die intelligente Vernetzung von Maschinen.', 'Industry 4.0 stands for the intelligent networking of machines.'),
    ]
  },

  // 5. Gesundheitssystem und Medizin
  {
    id: 'B2_GESUNDHEITSSYSTEM2',
    emoji: '🏥',
    title: 'GESUNDHEITSSYSTEM & MEDIZIN (B2)',
    level: 'B2',
    entries: [
      entry('die Gesundheitsversorgung', 'healthcare provision', 'Die Gesundheitsversorgung in Deutschland ist gut, aber teuer.', 'Healthcare provision in Germany is good but expensive.'),
      entry('die Krankenversicherung', 'health insurance', 'Die Krankenversicherung ist in Deutschland Pflicht.', 'Health insurance is mandatory in Germany.'),
      entry('die Pflegekrise', 'nursing crisis', 'Die Pflegekrise zeigt sich in Personalmangel.', 'The nursing crisis is evident in staff shortages.'),
      entry('die Telemedizin', 'telemedicine', 'Telemedizin ermöglicht Behandlungen über Distanz.', 'Telemedicine enables treatment over distance.'),
      entry('die Prävention', 'prevention', 'Prävention spart langfristig Kosten im Gesundheitssystem.', 'Prevention saves costs in the healthcare system in the long term.'),
      entry('die Palliativmedizin', 'palliative medicine', 'Palliativmedizin lindert Leiden bei unheilbaren Krankheiten.', 'Palliative medicine relieves suffering in incurable diseases.'),
      entry('die Organspende', 'organ donation', 'Die Organspende ist in Deutschland freiwillig.', 'Organ donation is voluntary in Germany.'),
      entry('die Psychotherapie', 'psychotherapy', 'Psychotherapie wird bei vielen psychischen Erkrankungen eingesetzt.', 'Psychotherapy is used for many mental illnesses.'),
      entry('die Gesundheitsökonomie', 'health economics', 'Gesundheitsökonomie analysiert Kosten und Nutzen im Gesundheitswesen.', 'Health economics analyzes costs and benefits in healthcare.'),
      entry('die Impfpflicht', 'compulsory vaccination', 'Impfpflicht ist ein kontroverses gesellschaftliches Thema.', 'Compulsory vaccination is a controversial societal issue.'),
    ]
  }
];

function main() {
  const raw = fs.readFileSync(FILE, 'utf8');
  const vocab = JSON.parse(raw);

  const existing = new Set();
  vocab.forEach(c => {
    if (Array.isArray(c.entries)) c.entries.forEach(e => { if (e.w) existing.add(norm(e.w)); });
  });

  let added = 0;
  let newCats = 0;

  pushCategories.forEach(catData => {
    let cat = vocab.find(c => c.id === catData.id || c.title === catData.title);
    if (!cat) {
      cat = { id: catData.id, emoji: catData.emoji, title: catData.title, level: 'B2', entries: [] };
      vocab.push(cat);
      newCats++;
    }

    let addedHere = 0;
    catData.entries.forEach(en => {
      if (!existing.has(norm(en.w))) {
        cat.entries.push(en);
        existing.add(norm(en.w));
        addedHere++;
        added++;
      }
    });

    if (addedHere > 0) console.log(`+ ${addedHere} → ${catData.title}`);
  });

  fs.writeFileSync(FILE, JSON.stringify(vocab, null, 2), 'utf8');

  let b2 = 0;
  vocab.forEach(c => {
    if (c.level === 'B2' && Array.isArray(c.entries)) b2 += c.entries.length;
  });

  console.log(`\nFinal Push: +${added} entries | New categories: ${newCats}`);
  console.log(`Current B2 total: ${b2}`);
}

main();
