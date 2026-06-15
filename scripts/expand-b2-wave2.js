/**
 * Second Major Wave - B2 Vocabulary Expansion
 * Focused on adding a large number of fresh, high-quality B2 entries
 * with minimal overlap to previous data.
 * Themes based on Aspekte neu B2, Netzwerk B2, Sicher! B2, Goethe B2 materials.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

function normalize(str) {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function e(w, t, de, en) {
  return { w, t, de, en };
}

const wave2Categories = [
  // Large batch - Wirtschaft & Globalisierung
  {
    id: 'B2_WIRTSCHAFT_GLOBAL2',
    emoji: '📈',
    title: 'WIRTSCHAFT & GLOBALISIERUNG (ERWEITERT)',
    level: 'B2',
    entries: [
      e('die Wirtschaftskrise', 'economic crisis', 'Die Wirtschaftskrise traf viele kleine Unternehmen hart.', 'The economic crisis hit many small businesses hard.'),
      e('die Inflation', 'inflation', 'Hohe Inflation verringert die Kaufkraft.', 'High inflation reduces purchasing power.'),
      e('die Rezession', 'recession', 'In einer Rezession steigt die Arbeitslosigkeit.', 'In a recession, unemployment rises.'),
      e('der Freihandel', 'free trade', 'Freihandel soll den Wohlstand steigern.', 'Free trade is supposed to increase prosperity.'),
      e('die Protektionismus', 'protectionism', 'Protektionismus behindert den internationalen Handel.', 'Protectionism hinders international trade.'),
      e('die Lieferkette', 'supply chain', 'Störungen in der Lieferkette führen zu Engpässen.', 'Disruptions in the supply chain lead to shortages.'),
      e('das Bruttoinlandsprodukt', 'gross domestic product (GDP)', 'Das Bruttoinlandsprodukt misst die Wirtschaftsleistung.', 'Gross domestic product measures economic output.'),
      e('die Deindustrialisierung', 'deindustrialization', 'Deindustrialisierung verändert ganze Regionen.', 'Deindustrialization is transforming entire regions.'),
      e('der Strukturwandel', 'structural change', 'Der Strukturwandel erfordert neue Qualifikationen.', 'Structural change requires new qualifications.'),
      e('die Wettbewerbsfähigkeit', 'competitiveness', 'Deutschland muss seine Wettbewerbsfähigkeit erhalten.', 'Germany must maintain its competitiveness.'),
      e('die Exportorientierung', 'export orientation', 'Die Exportorientierung ist ein Merkmal der deutschen Wirtschaft.', 'Export orientation is a characteristic of the German economy.'),
      e('die Finanzkrise', 'financial crisis', 'Die Finanzkrise 2008 hatte globale Auswirkungen.', 'The 2008 financial crisis had global consequences.'),
      e('die Steuerpolitik', 'tax policy', 'Steuerpolitik beeinflusst Investitionsentscheidungen.', 'Tax policy influences investment decisions.'),
      e('die Subvention', 'subsidy', 'Subventionen sollen bestimmte Branchen unterstützen.', 'Subsidies are meant to support certain industries.'),
      e('die Schattenwirtschaft', 'shadow economy', 'Die Schattenwirtschaft entzieht sich der Steuer.', 'The shadow economy evades taxation.'),
    ]
  },

  // Large batch - Bildung und Wissenschaft
  {
    id: 'B2_BILDUNG_WISSENSCHAFT2',
    emoji: '🎓',
    title: 'BILDUNG & WISSENSCHAFT (ERWEITERT)',
    level: 'B2',
    entries: [
      e('die Hochschulreform', 'university reform', 'Die Hochschulreform soll die Qualität der Lehre verbessern.', 'The university reform is intended to improve the quality of teaching.'),
      e('die Bologna-Reform', 'Bologna Process', 'Die Bologna-Reform führte zur Einführung von Bachelor und Master.', 'The Bologna Process led to the introduction of Bachelor and Master degrees.'),
      e('die Bildungsgerechtigkeit', 'educational equity', 'Bildungsgerechtigkeit ist noch nicht erreicht.', 'Educational equity has not yet been achieved.'),
      e('das duale Studium', 'dual study program', 'Das duale Studium kombiniert Theorie und Praxis.', 'Dual study programs combine theory and practice.'),
      e('die Forschungsförderung', 'research funding', 'Forschungsförderung ist für Innovation entscheidend.', 'Research funding is crucial for innovation.'),
      e('die Lehrerbildung', 'teacher training', 'Die Lehrerbildung muss an neue Herausforderungen angepasst werden.', 'Teacher training must be adapted to new challenges.'),
      e('die Digitalisierung im Bildungswesen', 'digitalization in education', 'Die Digitalisierung im Bildungswesen schreitet voran.', 'Digitalization in the education sector is progressing.'),
      e('die Studiengebühren', 'tuition fees', 'Studiengebühren sind in Deutschland umstritten.', 'Tuition fees are controversial in Germany.'),
      e('die Akademisierung', 'academization', 'Die Akademisierung vieler Berufe verändert den Arbeitsmarkt.', 'The academization of many professions is changing the labor market.'),
      e('die Bildungsstandards', 'educational standards', 'Bildungsstandards sollen die Qualität sichern.', 'Educational standards are meant to ensure quality.'),
      e('die Inklusion im Bildungssystem', 'inclusion in the education system', 'Inklusion im Bildungssystem stellt hohe Anforderungen an Lehrkräfte.', 'Inclusion in the education system places high demands on teachers.'),
      e('die frühkindliche Bildung', 'early childhood education', 'Frühkindliche Bildung legt den Grundstein für späteren Erfolg.', 'Early childhood education lays the foundation for later success.'),
      e('die Wissenschaftsfreiheit', 'academic freedom', 'Wissenschaftsfreiheit ist ein hohes Gut.', 'Academic freedom is a precious asset.'),
      e('die Doktorarbeit', 'doctoral thesis', 'Die Doktorarbeit erfordert mehrere Jahre intensiver Forschung.', 'A doctoral thesis requires several years of intensive research.'),
      e('die Habilitation', 'habilitation', 'Die Habilitation ist in manchen Fächern noch üblich.', 'Habilitation is still common in some subjects.'),
    ]
  },

  // Large batch - Kunst, Kultur und Medien
  {
    id: 'B2_KULTUR_MEDIAL2',
    emoji: '🎨',
    title: 'KUNST, KULTUR & MEDIEN (ERWEITERT)',
    level: 'B2',
    entries: [
      e('die kulturelle Identität', 'cultural identity', 'Kulturelle Identität verändert sich durch Migration.', 'Cultural identity changes through migration.'),
      e('die kulturelle Aneignung', 'cultural appropriation', 'Kulturelle Aneignung ist ein kontroverses Thema.', 'Cultural appropriation is a controversial topic.'),
      e('die Förderung der Künste', 'arts funding', 'Die Förderung der Künste ist in Deutschland traditionell stark.', 'Arts funding has traditionally been strong in Germany.'),
      e('das Kulturgut', 'cultural asset', 'Viele Kulturgüter stehen unter Denkmalschutz.', 'Many cultural assets are protected as historical monuments.'),
      e('die Filmförderung', 'film funding', 'Filmförderung hilft unabhängigen Produktionen.', 'Film funding helps independent productions.'),
      e('die Digitalisierung von Kulturgütern', 'digitization of cultural assets', 'Die Digitalisierung von Kulturgütern macht sie weltweit zugänglich.', 'Digitization of cultural assets makes them accessible worldwide.'),
      e('die Meinungsmache', 'manipulation of opinion', 'In sozialen Medien findet oft Meinungsmache statt.', 'Opinion manipulation often takes place on social media.'),
      e('die Qualitätsjournalismus', 'quality journalism', 'Qualitätsjournalismus ist teuer und wichtig.', 'Quality journalism is expensive and important.'),
      e('die Clickbait', 'clickbait', 'Clickbait lockt mit reißerischen Überschriften.', 'Clickbait lures with sensational headlines.'),
      e('die Fake News', 'fake news', 'Fake News verbreiten sich besonders schnell.', 'Fake news spreads particularly quickly.'),
      e('die Pressefreiheit', 'freedom of the press', 'Pressefreiheit ist in manchen Ländern bedroht.', 'Freedom of the press is threatened in some countries.'),
      e('das Urheberrecht', 'copyright', 'Das Urheberrecht schützt geistiges Eigentum.', 'Copyright protects intellectual property.'),
      e('die Streaming-Plattform', 'streaming platform', 'Streaming-Plattformen haben den Medienkonsum verändert.', 'Streaming platforms have changed media consumption.'),
      e('die kulturelle Vielfalt', 'cultural diversity', 'Kulturelle Vielfalt ist ein Reichtum der Gesellschaft.', 'Cultural diversity is a wealth of society.'),
      e('die Subkultur', 'subculture', 'Subkulturen prägen oft die Mainstream-Kultur.', 'Subcultures often shape mainstream culture.'),
    ]
  },

  // Additional strong B2 categories
  {
    id: 'B2_MOBILITAET_VERKEHR2',
    emoji: '🚄',
    title: 'MOBILITÄT & VERKEHR (B2)',
    level: 'B2',
    entries: [
      e('die Verkehrswende', 'transport transition', 'Die Verkehrswende soll den CO2-Ausstoß senken.', 'The transport transition is meant to reduce CO2 emissions.'),
      e('der öffentliche Nahverkehr', 'public local transport', 'Ein guter öffentlicher Nahverkehr entlastet die Städte.', 'Good public local transport relieves pressure on cities.'),
      e('die Elektroautoförderung', 'electric car subsidies', 'Elektroautoförderung soll den Umstieg beschleunigen.', 'Electric car subsidies are meant to accelerate the switch.'),
      e('der Stau', 'traffic jam', 'Staus kosten viel Zeit und Geld.', 'Traffic jams cost a lot of time and money.'),
      e('die nachhaltige Mobilität', 'sustainable mobility', 'Nachhaltige Mobilität ist ein Zukunftsthema.', 'Sustainable mobility is a topic of the future.'),
      e('das Carsharing', 'car sharing', 'Carsharing reduziert die Anzahl der Autos in der Stadt.', 'Car sharing reduces the number of cars in the city.'),
      e('die Fahrradinfrastruktur', 'bicycle infrastructure', 'Gute Fahrradinfrastruktur macht das Radfahren attraktiver.', 'Good bicycle infrastructure makes cycling more attractive.'),
      e('die Luftverschmutzung', 'air pollution', 'Luftverschmutzung durch Verkehr ist ein Gesundheitsrisiko.', 'Air pollution from traffic is a health risk.'),
      e('der autonome Verkehr', 'autonomous traffic', 'Autonomer Verkehr wirft rechtliche Fragen auf.', 'Autonomous traffic raises legal questions.'),
      e('die Verkehrsberuhigung', 'traffic calming', 'Verkehrsberuhigung verbessert die Lebensqualität.', 'Traffic calming improves quality of life.'),
    ]
  },
  {
    id: 'B2_PHILOSOPHIE_ETHIK2',
    emoji: '🤔',
    title: 'PHILOSOPHIE & ETHIK (B2)',
    level: 'B2',
    entries: [
      e('die Verantwortungsethik', 'ethics of responsibility', 'Verantwortungsethik fragt nach den Folgen des Handelns.', 'Ethics of responsibility asks about the consequences of actions.'),
      e('die Gesinnungsethik', 'ethics of conviction', 'Gesinnungsethik orientiert sich an moralischen Prinzipien.', 'Ethics of conviction is guided by moral principles.'),
      e('die Menschenwürde', 'human dignity', 'Die Menschenwürde ist unantastbar.', 'Human dignity is inviolable.'),
      e('die Autonomie', 'autonomy', 'Autonomie ist ein zentraler Wert der Aufklärung.', 'Autonomy is a central value of the Enlightenment.'),
      e('die Gerechtigkeitstheorie', 'theory of justice', 'Gerechtigkeitstheorien beschäftigen sich mit fairer Verteilung.', 'Theories of justice deal with fair distribution.'),
      e('die Utilitarismus', 'utilitarianism', 'Der Utilitarismus bewertet Handlungen nach ihrem Nutzen.', 'Utilitarianism evaluates actions according to their usefulness.'),
      e('die Pflichtethik', 'deontological ethics', 'Pflichtethik betont die Einhaltung von Regeln.', 'Deontological ethics emphasizes following rules.'),
      e('die Moral', 'morality', 'Moralische Fragen sind oft nicht eindeutig zu beantworten.', 'Moral questions are often not easy to answer.'),
      e('die Toleranz', 'tolerance', 'Toleranz bedeutet nicht, alles gutzuheißen.', 'Tolerance does not mean approving of everything.'),
      e('die Verantwortung', 'responsibility', 'Verantwortung wächst mit der Macht eines Menschen.', 'Responsibility grows with a person\'s power.'),
    ]
  }
];

function main() {
  console.log('Loading vocabulary for Wave 2 expansion...');
  const raw = fs.readFileSync(FILE, 'utf8');
  const vocab = JSON.parse(raw);

  const existing = new Set();
  vocab.forEach(cat => {
    if (Array.isArray(cat.entries)) {
      cat.entries.forEach(e => {
        if (e.w) existing.add(normalize(e.w));
      });
    }
  });

  console.log(`Current unique entries: ${existing.size}`);

  let added = 0;
  let catsCreated = 0;

  wave2Categories.forEach(catData => {
    let cat = vocab.find(c => c.id === catData.id || c.title === catData.title);
    if (!cat) {
      cat = { id: catData.id, emoji: catData.emoji, title: catData.title, level: 'B2', entries: [] };
      vocab.push(cat);
      catsCreated++;
    }

    let addedHere = 0;
    catData.entries.forEach(entry => {
      if (!existing.has(normalize(entry.w))) {
        cat.entries.push(entry);
        existing.add(normalize(entry.w));
        addedHere++;
        added++;
      }
    });

    if (addedHere > 0) {
      console.log(`+ ${addedHere} new entries → ${catData.title}`);
    }
  });

  fs.writeFileSync(FILE, JSON.stringify(vocab, null, 2), 'utf8');

  let finalB2 = 0;
  vocab.forEach(c => {
    if (c.level === 'B2' && Array.isArray(c.entries)) finalB2 += c.entries.length;
  });

  console.log('\n=== Wave 2 Complete ===');
  console.log(`New categories created: ${catsCreated}`);
  console.log(`New entries added: ${added}`);
  console.log(`New B2 total: ${finalB2}`);
}

main();
