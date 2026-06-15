/**
 * Major B2 Vocabulary Expansion Script
 * Goal: Push B2 vocabulary toward 5,000 clean, high-quality entries
 * Sources: Themes from Aspekte neu B2, Netzwerk B2, Sicher! B2, Mit Erfolg zum Goethe-Zertifikat B2
 * 
 * Features:
 * - Strict deduplication against existing vocabulary
 * - Clean, natural example sentences
 * - Balanced mix of nouns, verbs, adjectives, expressions
 * - Modern, exam-relevant B2 topics
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

// Normalize for deduplication
function normalize(str) {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function createEntry(w, t, de, en) {
  return { w, t, de, en };
}

// === NEW HIGH-QUALITY B2 CATEGORIES ===
// Themes drawn from standard B2 textbooks (Aspekte, Netzwerk, Sicher, etc.)

const newCategories = [
  // 1. Arbeit und Berufswelt (very common B2 theme)
  {
    id: 'B2_ARBEIT_BERUF2',
    emoji: '💼',
    title: 'ARBEIT & BERUFSWELT (VERTIEFUNG)',
    level: 'B2',
    entries: [
      createEntry('die Work-Life-Balance', 'work-life balance', 'Viele Menschen streben nach einer guten Work-Life-Balance.', 'Many people strive for a good work-life balance.'),
      createEntry('der Fachkräftemangel', 'shortage of skilled workers', 'Der Fachkräftemangel ist in vielen Branchen spürbar.', 'The shortage of skilled workers is noticeable in many sectors.'),
      createEntry('die Weiterbildung', 'further training / continuing education', 'Weiterbildung ist für die Karriere immer wichtiger.', 'Further training is becoming increasingly important for careers.'),
      createEntry('die Digitalisierung', 'digitalization', 'Die Digitalisierung verändert die Arbeitswelt grundlegend.', 'Digitalization is fundamentally changing the world of work.'),
      createEntry('die Gig Economy', 'gig economy', 'In der Gig Economy arbeiten viele Menschen projektbasiert.', 'In the gig economy, many people work on a project basis.'),
      createEntry('der Mindestlohn', 'minimum wage', 'Der Mindestlohn soll vor Armut schützen.', 'The minimum wage is meant to protect against poverty.'),
      createEntry('die Tarifverhandlung', 'collective bargaining / wage negotiation', 'Tarifverhandlungen dauern oft mehrere Wochen.', 'Collective bargaining often lasts several weeks.'),
      createEntry('die Burnout-Gefahr', 'risk of burnout', 'Hoher Druck am Arbeitsplatz birgt die Burnout-Gefahr.', 'High pressure at work carries the risk of burnout.'),
      createEntry('die Remote-Arbeit', 'remote work', 'Remote-Arbeit bietet mehr Flexibilität.', 'Remote work offers more flexibility.'),
      createEntry('die Kündigung', 'dismissal / termination', 'Eine fristlose Kündigung hat ernste Folgen.', 'A summary dismissal has serious consequences.'),
      createEntry('die Bewerbung', 'job application', 'Eine überzeugende Bewerbung erhöht die Chancen.', 'A convincing application increases the chances.'),
      createEntry('das Vorstellungsgespräch', 'job interview', 'Im Vorstellungsgespräch zählen Kompetenz und Persönlichkeit.', 'In a job interview, both competence and personality count.'),
      createEntry('die Karriereleiter', 'career ladder', 'Viele wollen die Karriereleiter hinaufsteigen.', 'Many want to climb the career ladder.'),
      createEntry('die Zeitarbeit', 'temporary work', 'Zeitarbeit bietet oft einen Einstieg in den Arbeitsmarkt.', 'Temporary work often provides an entry into the job market.'),
      createEntry('die Selbstständigkeit', 'self-employment', 'Die Selbstständigkeit bringt Freiheit, aber auch Risiken.', 'Self-employment brings freedom but also risks.'),
    ]
  },

  // 2. Umwelt und Nachhaltigkeit (core B2 theme)
  {
    id: 'B2_UMWELT_NACHHALTIGKEIT2',
    emoji: '🌱',
    title: 'UMWELT & NACHHALTIGKEIT (VERTIEFUNG)',
    level: 'B2',
    entries: [
      createEntry('die Klimagerechtigkeit', 'climate justice', 'Klimagerechtigkeit fordert faire Lastenverteilung.', 'Climate justice demands a fair distribution of burdens.'),
      createEntry('die Kreislaufwirtschaft', 'circular economy', 'Die Kreislaufwirtschaft reduziert Abfall.', 'The circular economy reduces waste.'),
      createEntry('die CO2-Steuer', 'carbon tax', 'Eine CO2-Steuer soll Emissionen senken.', 'A carbon tax is intended to reduce emissions.'),
      createEntry('die Energiewende', 'energy transition', 'Die Energiewende ist ein zentrales Projekt Deutschlands.', 'The energy transition is a central project in Germany.'),
      createEntry('die Biodiversität', 'biodiversity', 'Der Verlust an Biodiversität ist alarmierend.', 'The loss of biodiversity is alarming.'),
      createEntry('die Nachhaltigkeitsstrategie', 'sustainability strategy', 'Unternehmen brauchen eine klare Nachhaltigkeitsstrategie.', 'Companies need a clear sustainability strategy.'),
      createEntry('das Recycling', 'recycling', 'Recycling spart Rohstoffe und Energie.', 'Recycling saves raw materials and energy.'),
      createEntry('der ökologische Fußabdruck', 'ecological footprint', 'Unser ökologischer Fußabdruck ist zu groß.', 'Our ecological footprint is too large.'),
      createEntry('die Umweltverschmutzung', 'environmental pollution', 'Luft- und Wasserverschmutzung sind große Probleme.', 'Air and water pollution are major problems.'),
      createEntry('die Renaturierung', 'renaturation / restoration', 'Die Renaturierung von Flüssen hilft der Natur.', 'The renaturation of rivers helps nature.'),
      createEntry('die Elektromobilität', 'electromobility', 'Elektromobilität soll den Verkehr klimafreundlicher machen.', 'Electromobility is meant to make transport more climate-friendly.'),
      createEntry('die Plastikverschmutzung', 'plastic pollution', 'Plastikverschmutzung bedroht die Meere.', 'Plastic pollution threatens the oceans.'),
      createEntry('die grüne Technologie', 'green technology', 'Grüne Technologien schaffen neue Arbeitsplätze.', 'Green technologies create new jobs.'),
      createEntry('die Klimaneutralität', 'climate neutrality', 'Deutschland strebt Klimaneutralität bis 2045 an.', 'Germany aims for climate neutrality by 2045.'),
      createEntry('die Ressourcenschonung', 'resource conservation', 'Ressourcenschonung ist für die Zukunft entscheidend.', 'Resource conservation is crucial for the future.'),
    ]
  },

  // 3. Medien und Digitalisierung
  {
    id: 'B2_MEDIEN_DIGITALISIERUNG2',
    emoji: '📱',
    title: 'MEDIEN & DIGITALISIERUNG (VERTIEFUNG)',
    level: 'B2',
    entries: [
      createEntry('die Filterblase', 'filter bubble', 'Filterblasen verstärken bestehende Meinungen.', 'Filter bubbles reinforce existing opinions.'),
      createEntry('die Desinformation', 'disinformation', 'Desinformation verbreitet sich schnell in sozialen Medien.', 'Disinformation spreads quickly on social media.'),
      createEntry('der Algorithmus', 'algorithm', 'Algorithmen entscheiden, welche Inhalte wir sehen.', 'Algorithms decide which content we see.'),
      createEntry('die Privatsphäre', 'privacy', 'Viele Menschen geben ihre Privatsphäre im Internet preis.', 'Many people give up their privacy on the internet.'),
      createEntry('die Bildschirmzeit', 'screen time', 'Zu viel Bildschirmzeit kann die Konzentration beeinträchtigen.', 'Too much screen time can impair concentration.'),
      createEntry('die Cyberkriminalität', 'cybercrime', 'Cyberkriminalität nimmt weltweit zu.', 'Cybercrime is increasing worldwide.'),
      createEntry('die Datensicherheit', 'data security', 'Gute Datensicherheit ist für Unternehmen unverzichtbar.', 'Good data security is essential for companies.'),
      createEntry('die digitale Kluft', 'digital divide', 'Die digitale Kluft zwischen Stadt und Land bleibt bestehen.', 'The digital divide between urban and rural areas persists.'),
      createEntry('die Plattformökonomie', 'platform economy', 'Die Plattformökonomie verändert traditionelle Branchen.', 'The platform economy is changing traditional industries.'),
      createEntry('die Künstliche Intelligenz', 'artificial intelligence', 'Künstliche Intelligenz verändert viele Berufe.', 'Artificial intelligence is changing many professions.'),
      createEntry('die Deepfake-Technologie', 'deepfake technology', 'Deepfakes können die öffentliche Meinung manipulieren.', 'Deepfakes can manipulate public opinion.'),
      createEntry('die Netzneutralität', 'net neutrality', 'Netzneutralität schützt den freien Zugang zum Internet.', 'Net neutrality protects free access to the internet.'),
      createEntry('die Social-Media-Sucht', 'social media addiction', 'Social-Media-Sucht ist ein wachsendes Problem bei Jugendlichen.', 'Social media addiction is a growing problem among young people.'),
      createEntry('die Meinungsfreiheit', 'freedom of expression', 'Meinungsfreiheit endet dort, wo Hass beginnt.', 'Freedom of expression ends where hatred begins.'),
      createEntry('die digitale Souveränität', 'digital sovereignty', 'Europa strebt mehr digitale Souveränität an.', 'Europe is striving for greater digital sovereignty.'),
    ]
  },

  // 4. Gesellschaft und Werte
  {
    id: 'B2_GESELLSCHAFT_WERTE2',
    emoji: '👥',
    title: 'GESELLSCHAFT & WERTE (VERTIEFUNG)',
    level: 'B2',
    entries: [
      createEntry('die soziale Ungleichheit', 'social inequality', 'Soziale Ungleichheit ist in vielen Ländern gestiegen.', 'Social inequality has increased in many countries.'),
      createEntry('die Chancengleichheit', 'equal opportunities', 'Chancengleichheit ist ein wichtiges gesellschaftliches Ziel.', 'Equal opportunities are an important societal goal.'),
      createEntry('die Integration', 'integration', 'Erfolgreiche Integration braucht Zeit und gegenseitigen Respekt.', 'Successful integration requires time and mutual respect.'),
      createEntry('die Diskriminierung', 'discrimination', 'Diskriminierung aufgrund der Herkunft ist inakzeptabel.', 'Discrimination based on origin is unacceptable.'),
      createEntry('die Vielfalt', 'diversity', 'Kulturelle Vielfalt bereichert die Gesellschaft.', 'Cultural diversity enriches society.'),
      createEntry('die Toleranz', 'tolerance', 'Toleranz ist eine Grundvoraussetzung für das Zusammenleben.', 'Tolerance is a basic requirement for living together.'),
      createEntry('die Solidarität', 'solidarity', 'Solidarität zeigt sich besonders in Krisenzeiten.', 'Solidarity is especially evident in times of crisis.'),
      createEntry('die soziale Mobilität', 'social mobility', 'Soziale Mobilität ist in Deutschland vergleichsweise gering.', 'Social mobility is relatively low in Germany.'),
      createEntry('die Altersarmut', 'poverty in old age', 'Altersarmut ist ein wachsendes Problem.', 'Poverty in old age is a growing problem.'),
      createEntry('die Ehrenamtlichkeit', 'volunteering / voluntary work', 'Ehrenamtlichkeit stärkt den sozialen Zusammenhalt.', 'Volunteering strengthens social cohesion.'),
      createEntry('die Generationengerechtigkeit', 'intergenerational justice', 'Generationengerechtigkeit betrifft Rente und Umwelt.', 'Intergenerational justice concerns pensions and the environment.'),
      createEntry('die Identitätspolitik', 'identity politics', 'Identitätspolitik ist ein umstrittenes Thema.', 'Identity politics is a controversial topic.'),
      createEntry('die soziale Exklusion', 'social exclusion', 'Soziale Exklusion führt oft zu Resignation.', 'Social exclusion often leads to resignation.'),
      createEntry('die Wertegemeinschaft', 'community of values', 'Die EU versteht sich als Wertegemeinschaft.', 'The EU sees itself as a community of values.'),
      createEntry('die Zivilgesellschaft', 'civil society', 'Eine starke Zivilgesellschaft ist wichtig für die Demokratie.', 'A strong civil society is important for democracy.'),
    ]
  },

  // 5. Politik und Demokratie
  {
    id: 'B2_POLITIK_DEMOKRATIE2',
    emoji: '🗳️',
    title: 'POLITIK & DEMOKRATIE (VERTIEFUNG)',
    level: 'B2',
    entries: [
      createEntry('die Wahlbeteiligung', 'voter turnout', 'Eine hohe Wahlbeteiligung stärkt die Legitimität der Demokratie.', 'High voter turnout strengthens the legitimacy of democracy.'),
      createEntry('die Polarisierung', 'polarization', 'Politische Polarisierung erschwert Kompromisse.', 'Political polarization makes compromises more difficult.'),
      createEntry('die Desinformation', 'disinformation', 'Desinformation bedroht die Demokratie.', 'Disinformation threatens democracy.'),
      createEntry('die Korruption', 'corruption', 'Korruption untergräbt das Vertrauen in die Politik.', 'Corruption undermines trust in politics.'),
      createEntry('die Bürgerbeteiligung', 'citizen participation', 'Bürgerbeteiligung stärkt das demokratische Bewusstsein.', 'Citizen participation strengthens democratic awareness.'),
      createEntry('die Menschenrechte', 'human rights', 'Menschenrechte sind universell und unteilbar.', 'Human rights are universal and indivisible.'),
      createEntry('die Pressefreiheit', 'freedom of the press', 'Pressefreiheit ist ein Pfeiler der Demokratie.', 'Freedom of the press is a pillar of democracy.'),
      createEntry('der Populismus', 'populism', 'Populismus nutzt einfache Lösungen für komplexe Probleme.', 'Populism uses simple solutions for complex problems.'),
      createEntry('die Gewaltenteilung', 'separation of powers', 'Die Gewaltenteilung verhindert Machtmissbrauch.', 'The separation of powers prevents abuse of power.'),
      createEntry('die Opposition', 'opposition', 'Eine starke Opposition ist für die Demokratie essenziell.', 'A strong opposition is essential for democracy.'),
      createEntry('die Koalition', 'coalition', 'Koalitionen erfordern Kompromissbereitschaft.', 'Coalitions require willingness to compromise.'),
      createEntry('die Europäische Union', 'European Union', 'Die Europäische Union steht vor großen Herausforderungen.', 'The European Union faces major challenges.'),
      createEntry('die Souveränität', 'sovereignty', 'Nationale Souveränität wird durch internationale Abkommen eingeschränkt.', 'National sovereignty is limited by international agreements.'),
      createEntry('die Lobbyarbeit', 'lobbying', 'Lobbyarbeit beeinflusst politische Entscheidungen.', 'Lobbying influences political decisions.'),
      createEntry('die Demokratieverdrossenheit', 'disaffection with democracy', 'Demokratieverdrossenheit ist ein gefährliches Phänomen.', 'Disaffection with democracy is a dangerous phenomenon.'),
    ]
  },

  // 6. Gesundheit und Psychologie
  {
    id: 'B2_GESUNDHEIT_PSYCHOLOGIE2',
    emoji: '🧠',
    title: 'GESUNDHEIT & PSYCHOLOGIE (VERTIEFUNG)',
    level: 'B2',
    entries: [
      createEntry('die psychische Gesundheit', 'mental health', 'Psychische Gesundheit wird oft unterschätzt.', 'Mental health is often underestimated.'),
      createEntry('die Depression', 'depression', 'Depression ist eine der häufigsten psychischen Erkrankungen.', 'Depression is one of the most common mental illnesses.'),
      createEntry('die Resilienz', 'resilience', 'Resilienz hilft, mit Stress und Krisen umzugehen.', 'Resilience helps in dealing with stress and crises.'),
      createEntry('die Achtsamkeit', 'mindfulness', 'Achtsamkeit kann das Wohlbefinden steigern.', 'Mindfulness can increase well-being.'),
      createEntry('die Therapie', 'therapy', 'Eine Therapie ist bei vielen psychischen Problemen wirksam.', 'Therapy is effective for many mental health problems.'),
      createEntry('der Schlafmangel', 'sleep deprivation', 'Chronischer Schlafmangel beeinträchtigt die Gesundheit.', 'Chronic sleep deprivation impairs health.'),
      createEntry('die Sucht', 'addiction', 'Sucht kann sowohl körperlich als auch psychisch sein.', 'Addiction can be both physical and psychological.'),
      createEntry('die Stressbewältigung', 'stress management', 'Gute Stressbewältigung ist für die Gesundheit wichtig.', 'Good stress management is important for health.'),
      createEntry('die Prävention', 'prevention', 'Prävention ist besser als spätere Behandlung.', 'Prevention is better than later treatment.'),
      createEntry('die psychosomatische Erkrankung', 'psychosomatic illness', 'Psychosomatische Erkrankungen haben sowohl seelische als auch körperliche Ursachen.', 'Psychosomatic illnesses have both mental and physical causes.'),
      createEntry('die Selbstfürsorge', 'self-care', 'Selbstfürsorge ist kein Luxus, sondern eine Notwendigkeit.', 'Self-care is not a luxury but a necessity.'),
      createEntry('die Angststörung', 'anxiety disorder', 'Angststörungen sind weit verbreitet.', 'Anxiety disorders are widespread.'),
      createEntry('die Rehabilitation', 'rehabilitation', 'Rehabilitation hilft nach schweren Erkrankungen.', 'Rehabilitation helps after serious illnesses.'),
      createEntry('die Gesundheitsförderung', 'health promotion', 'Gesundheitsförderung am Arbeitsplatz wird immer wichtiger.', 'Health promotion in the workplace is becoming increasingly important.'),
      createEntry('die psychische Belastung', 'mental strain', 'Hohe psychische Belastung kann krank machen.', 'High mental strain can make people ill.'),
    ]
  },

  // 7. Wissenschaft, Forschung und Ethik
  {
    id: 'B2_WISSENSCHAFT_ETHIK2',
    emoji: '🔬',
    title: 'WISSENSCHAFT, FORSCHUNG & ETHIK (VERTIEFUNG)',
    level: 'B2',
    entries: [
      createEntry('die Gentechnik', 'genetic engineering', 'Gentechnik bietet Chancen, birgt aber auch Risiken.', 'Genetic engineering offers opportunities but also carries risks.'),
      createEntry('die Stammzellenforschung', 'stem cell research', 'Die Stammzellenforschung wirft ethische Fragen auf.', 'Stem cell research raises ethical questions.'),
      createEntry('die Klimaforschung', 'climate research', 'Klimaforschung liefert wichtige Daten für politische Entscheidungen.', 'Climate research provides important data for political decisions.'),
      createEntry('die künstliche Befruchtung', 'artificial insemination', 'Künstliche Befruchtung wirft rechtliche und ethische Fragen auf.', 'Artificial insemination raises legal and ethical questions.'),
      createEntry('die Tierversuche', 'animal testing', 'Tierversuche sind in der Forschung umstritten.', 'Animal testing is controversial in research.'),
      createEntry('die wissenschaftliche Redlichkeit', 'scientific integrity', 'Wissenschaftliche Redlichkeit ist die Grundlage guter Forschung.', 'Scientific integrity is the foundation of good research.'),
      createEntry('die Ethikkommission', 'ethics committee', 'Ethikkommissionen prüfen Forschungsprojekte.', 'Ethics committees review research projects.'),
      createEntry('die Genmanipulation', 'genetic manipulation', 'Genmanipulation an Embryonen ist hochumstritten.', 'Genetic manipulation of embryos is highly controversial.'),
      createEntry('die evidenzbasierte Medizin', 'evidence-based medicine', 'Evidenzbasierte Medizin stützt sich auf wissenschaftliche Studien.', 'Evidence-based medicine is based on scientific studies.'),
      createEntry('die Forschungsförderung', 'research funding', 'Forschungsförderung entscheidet über die Zukunft eines Landes.', 'Research funding determines a country\'s future.'),
      createEntry('die wissenschaftliche Publikation', 'scientific publication', 'Wissenschaftliche Publikationen unterliegen strengen Standards.', 'Scientific publications are subject to strict standards.'),
      createEntry('die Künstliche Intelligenz in der Medizin', 'AI in medicine', 'Künstliche Intelligenz verändert die Diagnostik.', 'Artificial intelligence is changing diagnostics.'),
      createEntry('die Verantwortung der Wissenschaft', 'responsibility of science', 'Die Verantwortung der Wissenschaft wächst mit ihren Möglichkeiten.', 'The responsibility of science grows with its capabilities.'),
      createEntry('die Reproduktionsmedizin', 'reproductive medicine', 'Die Reproduktionsmedizin entwickelt sich rasant.', 'Reproductive medicine is developing rapidly.'),
      createEntry('die wissenschaftliche Ethik', 'scientific ethics', 'Wissenschaftliche Ethik muss mit dem technischen Fortschritt Schritt halten.', 'Scientific ethics must keep pace with technological progress.'),
    ]
  },

  // 8. Globalisierung und Internationale Beziehungen
  {
    id: 'B2_GLOBALISIERUNG_INTERNATIONAL2',
    emoji: '🌍',
    title: 'GLOBALISIERUNG & INTERNATIONALE BEZIEHUNGEN (VERTIEFUNG)',
    level: 'B2',
    entries: [
      createEntry('die Globalisierung', 'globalization', 'Globalisierung verbindet Märkte, aber auch Probleme.', 'Globalization connects markets but also problems.'),
      createEntry('die internationale Zusammenarbeit', 'international cooperation', 'Internationale Zusammenarbeit ist bei globalen Herausforderungen notwendig.', 'International cooperation is necessary for global challenges.'),
      createEntry('die Handelsbeziehungen', 'trade relations', 'Gute Handelsbeziehungen stärken die Wirtschaft.', 'Good trade relations strengthen the economy.'),
      createEntry('die Entwicklungszusammenarbeit', 'development cooperation', 'Entwicklungszusammenarbeit soll Armut bekämpfen.', 'Development cooperation is meant to fight poverty.'),
      createEntry('die geopolitische Spannungen', 'geopolitical tensions', 'Geopolitische Spannungen beeinflussen die Weltwirtschaft.', 'Geopolitical tensions affect the global economy.'),
      createEntry('die internationale Sicherheit', 'international security', 'Internationale Sicherheit erfordert gemeinsame Strategien.', 'International security requires joint strategies.'),
      createEntry('die Klimadiplomatie', 'climate diplomacy', 'Klimadiplomatie wird immer wichtiger.', 'Climate diplomacy is becoming increasingly important.'),
      createEntry('die Migration', 'migration', 'Migration ist ein globales Phänomen.', 'Migration is a global phenomenon.'),
      createEntry('die multinationale Unternehmen', 'multinational companies', 'Multinationale Unternehmen haben großen Einfluss.', 'Multinational companies have great influence.'),
      createEntry('die weltweite Lieferketten', 'global supply chains', 'Weltweite Lieferketten sind anfällig für Krisen.', 'Global supply chains are vulnerable to crises.'),
      createEntry('die internationale Organisation', 'international organization', 'Internationale Organisationen wie die UNO spielen eine wichtige Rolle.', 'International organizations like the UN play an important role.'),
      createEntry('die kulturelle Globalisierung', 'cultural globalization', 'Kulturelle Globalisierung führt zu einer Angleichung von Lebensstilen.', 'Cultural globalization leads to a homogenization of lifestyles.'),
      createEntry('die Nord-Süd-Beziehungen', 'North-South relations', 'Nord-Süd-Beziehungen sind von Ungleichheit geprägt.', 'North-South relations are characterized by inequality.'),
      createEntry('die globale Gerechtigkeit', 'global justice', 'Globale Gerechtigkeit ist ein zentrales Thema der Gegenwart.', 'Global justice is a central issue of our time.'),
      createEntry('die internationale Solidarität', 'international solidarity', 'Internationale Solidarität zeigt sich in humanitären Krisen.', 'International solidarity is evident in humanitarian crises.'),
    ]
  },
];

// === END OF NEW CATEGORIES ===

function main() {
  console.log('Loading existing vocabulary...');
  const raw = fs.readFileSync(FILE, 'utf8');
  const vocab = JSON.parse(raw);

  // Build set of existing normalized words for deduplication
  const existingWords = new Set();
  vocab.forEach(category => {
    if (Array.isArray(category.entries)) {
      category.entries.forEach(entry => {
        if (entry.w) {
          existingWords.add(normalize(entry.w));
        }
      });
    }
  });

  console.log(`Found ${existingWords.size} existing unique vocabulary entries.`);

  let totalAdded = 0;
  let categoriesAdded = 0;

  newCategories.forEach(newCat => {
    // Check if category already exists
    let existingCat = vocab.find(c => 
      (c.id && c.id === newCat.id) || 
      (c.title && c.title === newCat.title)
    );

    if (!existingCat) {
      // Create new category
      existingCat = {
        id: newCat.id,
        emoji: newCat.emoji,
        title: newCat.title,
        level: newCat.level,
        entries: []
      };
      vocab.push(existingCat);
      categoriesAdded++;
    }

    let addedInThisCat = 0;

    newCat.entries.forEach(entry => {
      const normalized = normalize(entry.w);
      if (!existingWords.has(normalized)) {
        existingCat.entries.push(entry);
        existingWords.add(normalized);
        addedInThisCat++;
        totalAdded++;
      }
    });

    if (addedInThisCat > 0) {
      console.log(`+ Added ${addedInThisCat} new entries to "${newCat.title}"`);
    }
  });

  // Write updated file
  fs.writeFileSync(FILE, JSON.stringify(vocab, null, 2), 'utf8');

  console.log('\n=== Expansion Complete ===');
  console.log(`New categories created: ${categoriesAdded}`);
  console.log(`Total new vocabulary entries added: ${totalAdded}`);

  // Recalculate B2 total
  let newB2Total = 0;
  vocab.forEach(cat => {
    if (cat.level === 'B2' && Array.isArray(cat.entries)) {
      newB2Total += cat.entries.length;
    }
  });
  console.log(`New total B2 vocabulary entries: ${newB2Total}`);
}

main();
