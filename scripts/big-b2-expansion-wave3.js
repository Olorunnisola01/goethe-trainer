/**
 * Big B2 Expansion Wave 3
 * Goal: Make substantial progress toward 5,000 clean B2 entries
 * Based on themes from Aspekte neu B2, Netzwerk B2, Sicher! B2, Goethe B2 materials
 * Heavy focus on unique, high-level B2 vocabulary
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

function norm(s) { return (s || '').toLowerCase().trim().replace(/\s+/g, ' '); }
function e(w, t, de, en) { return { w, t, de, en }; }

const wave3 = [
  {
    id: 'B2_ARBEITSWELT_MODERN',
    emoji: '🏢',
    title: 'MODERNE ARBEITSWELT (B2)',
    level: 'B2',
    entries: [
      e('die New Work', 'New Work', 'New Work verändert traditionelle Arbeitsmodelle grundlegend.', 'New Work is fundamentally changing traditional work models.'),
      e('die agile Arbeitsweise', 'agile working methods', 'Viele Unternehmen setzen auf agile Arbeitsweisen.', 'Many companies are adopting agile working methods.'),
      e('das Homeoffice', 'home office', 'Homeoffice hat sich in vielen Branchen etabliert.', 'Home office has become established in many sectors.'),
      e('die Projektarbeit', 'project-based work', 'Projektarbeit erfordert hohe Flexibilität.', 'Project-based work requires high flexibility.'),
      e('die Jobrotation', 'job rotation', 'Jobrotation soll Mitarbeiter motivieren.', 'Job rotation is intended to motivate employees.'),
      e('die Leistungskultur', 'performance culture', 'Eine starke Leistungskultur kann Druck erzeugen.', 'A strong performance culture can create pressure.'),
      e('die Diversity-Strategie', 'diversity strategy', 'Viele Firmen verfolgen eine aktive Diversity-Strategie.', 'Many companies pursue an active diversity strategy.'),
      e('die Workation', 'workation', 'Workation kombiniert Arbeiten und Urlaub.', 'A workation combines work and vacation.'),
      e('die Führungskultur', 'leadership culture', 'Eine gute Führungskultur ist entscheidend für den Erfolg.', 'Good leadership culture is crucial for success.'),
      e('die Mitarbeiterbindung', 'employee retention', 'Mitarbeiterbindung wird durch gute Bedingungen erreicht.', 'Employee retention is achieved through good conditions.'),
      e('die Change-Management', 'change management', 'Change-Management ist bei großen Umstrukturierungen notwendig.', 'Change management is necessary during major restructuring.'),
      e('die interne Kommunikation', 'internal communication', 'Gute interne Kommunikation verhindert Missverständnisse.', 'Good internal communication prevents misunderstandings.'),
      e('die Feedbackkultur', 'feedback culture', 'Eine offene Feedbackkultur fördert die Entwicklung.', 'An open feedback culture promotes development.'),
      e('die Work-Life-Integration', 'work-life integration', 'Work-Life-Integration ersetzt zunehmend die klassische Balance.', 'Work-life integration is increasingly replacing the classic balance.'),
      e('die Talententwicklung', 'talent development', 'Talententwicklung ist ein zentraler Bestandteil moderner Personalstrategien.', 'Talent development is a central part of modern HR strategies.'),
    ]
  },
  {
    id: 'B2_SOZIALE_GERECHTIGKEIT',
    emoji: '⚖️',
    title: 'SOZIALE GERECHTIGKEIT (B2)',
    level: 'B2',
    entries: [
      e('die soziale Gerechtigkeit', 'social justice', 'Soziale Gerechtigkeit ist ein zentrales politisches Ziel.', 'Social justice is a central political goal.'),
      e('die Armutsbekämpfung', 'poverty reduction', 'Armutsbekämpfung erfordert langfristige Strategien.', 'Poverty reduction requires long-term strategies.'),
      e('die Chancengerechtigkeit', 'equal opportunity', 'Chancengerechtigkeit beginnt bereits in der frühkindlichen Bildung.', 'Equal opportunity starts in early childhood education.'),
      e('die Umverteilung', 'redistribution', 'Umverteilung durch Steuern ist ein umstrittenes Thema.', 'Redistribution through taxes is a controversial topic.'),
      e('die soziale Ausgrenzung', 'social exclusion', 'Soziale Ausgrenzung führt oft zu Resignation und Protest.', 'Social exclusion often leads to resignation and protest.'),
      e('die Teilhabe', 'participation', 'Teilhabe am gesellschaftlichen Leben ist ein Grundrecht.', 'Participation in social life is a fundamental right.'),
      e('die Mindestsicherung', 'minimum income support', 'Die Mindestsicherung soll ein menschenwürdiges Leben ermöglichen.', 'Minimum income support is meant to enable a dignified life.'),
      e('die soziale Durchlässigkeit', 'social permeability', 'Soziale Durchlässigkeit ist in Deutschland noch zu gering.', 'Social permeability is still too low in Germany.'),
      e('die Bildungschancen', 'educational opportunities', 'Gleiche Bildungschancen sind ein wichtiges Gerechtigkeitsziel.', 'Equal educational opportunities are an important goal of justice.'),
      e('die Altersarmut', 'old-age poverty', 'Altersarmut betrifft besonders Frauen.', 'Old-age poverty particularly affects women.'),
      e('die soziale Mobilität', 'social mobility', 'Hohe soziale Mobilität gilt als Zeichen einer offenen Gesellschaft.', 'High social mobility is seen as a sign of an open society.'),
      e('die Solidarität', 'solidarity', 'Solidarität zeigt sich besonders in Krisenzeiten.', 'Solidarity is particularly evident in times of crisis.'),
      e('die Verteilungsgerechtigkeit', 'distributive justice', 'Verteilungsgerechtigkeit ist ein zentrales Thema der Sozialpolitik.', 'Distributive justice is a central topic in social policy.'),
      e('die soziale Verantwortung', 'social responsibility', 'Unternehmen tragen zunehmend soziale Verantwortung.', 'Companies are increasingly taking on social responsibility.'),
      e('die Inklusion', 'inclusion', 'Inklusion bedeutet Teilhabe für alle Menschen.', 'Inclusion means participation for all people.'),
    ]
  },
  {
    id: 'B2_WISSENSCHAFT_FORSCHUNG2',
    emoji: '🔬',
    title: 'WISSENSCHAFT & FORSCHUNG (B2)',
    level: 'B2',
    entries: [
      e('die Grundlagenforschung', 'basic research', 'Grundlagenforschung legt den Boden für spätere Anwendungen.', 'Basic research lays the foundation for later applications.'),
      e('die angewandte Forschung', 'applied research', 'Angewandte Forschung zielt auf konkrete Lösungen ab.', 'Applied research aims at concrete solutions.'),
      e('die Forschungsethik', 'research ethics', 'Forschungsethik gewinnt durch neue Technologien an Bedeutung.', 'Research ethics is gaining importance due to new technologies.'),
      e('die Drittmittel', 'third-party funding', 'Viele Projekte sind auf Drittmittel angewiesen.', 'Many projects depend on third-party funding.'),
      e('die wissenschaftliche Publikation', 'scientific publication', 'Wissenschaftliche Publikationen unterliegen Peer-Review.', 'Scientific publications undergo peer review.'),
      e('die Open-Access-Publikation', 'open access publication', 'Open-Access-Publikationen sind kostenlos zugänglich.', 'Open access publications are freely available.'),
      e('die Reproduzierbarkeit', 'reproducibility', 'Reproduzierbarkeit ist ein Qualitätsmerkmal guter Forschung.', 'Reproducibility is a quality feature of good research.'),
      e('die Forschungsförderung', 'research funding', 'Forschungsförderung entscheidet über die Zukunft eines Landes.', 'Research funding determines a country\'s future.'),
      e('die Innovationskraft', 'innovative strength', 'Deutschlands Innovationskraft ist international anerkannt.', 'Germany\'s innovative strength is internationally recognized.'),
      e('die Wissenschaftskommunikation', 'science communication', 'Gute Wissenschaftskommunikation macht Forschung verständlich.', 'Good science communication makes research understandable.'),
      e('die interdisziplinäre Forschung', 'interdisciplinary research', 'Interdisziplinäre Forschung löst komplexe Probleme besser.', 'Interdisciplinary research solves complex problems better.'),
      e('die Technologiefolgenabschätzung', 'technology assessment', 'Technologiefolgenabschätzung bewertet Risiken neuer Technologien.', 'Technology assessment evaluates the risks of new technologies.'),
      e('die wissenschaftliche Unabhängigkeit', 'scientific independence', 'Wissenschaftliche Unabhängigkeit muss geschützt werden.', 'Scientific independence must be protected.'),
      e('die Patentierung', 'patenting', 'Patentierung von Forschungsergebnissen ist umstritten.', 'Patenting of research results is controversial.'),
      e('die Citizen Science', 'citizen science', 'Citizen Science bezieht Bürger in Forschungsprojekte ein.', 'Citizen science involves citizens in research projects.'),
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

  wave3.forEach(catData => {
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

  console.log(`\nWave 3: +${added} entries | New categories: ${newCats}`);
  console.log(`Current B2 total: ${b2}`);
}

main();
