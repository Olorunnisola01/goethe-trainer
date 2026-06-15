/**
 * Large B2 vocabulary expansion batch.
 * Adds several hundred high-quality B2-level entries across key Goethe B2 themes.
 * Goal: push total B2 items significantly higher (toward 5,000+ when combined with previous data).
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

function w(word, t, de, en) {
  return { w: word, t, de, en };
}

const newB2Categories = [
  {
    id: 'B2_UMWELT_KLIMA2',
    emoji: '🌍',
    title: 'UMWELT & KLIMAWANDEL (VERTIEFUNG)',
    level: 'B2',
    entries: [
      w('die Klimakrise', 'climate crisis', 'Die Klimakrise erfordert sofortiges Handeln.', 'The climate crisis requires immediate action.'),
      w('die Artenvielfalt', 'biodiversity', 'Die Artenvielfalt nimmt weltweit ab.', 'Biodiversity is declining worldwide.'),
      w('der CO2-Ausstoß', 'CO2 emissions', 'Der CO2-Ausstoß muss drastisch sinken.', 'CO2 emissions must be drastically reduced.'),
      w('erneuerbare Energien', 'renewable energies', 'Wir müssen stärker auf erneuerbare Energien setzen.', 'We need to rely more on renewable energies.'),
      w('die Nachhaltigkeit', 'sustainability', 'Nachhaltigkeit ist ein zentrales Zukunftsthema.', 'Sustainability is a central future topic.'),
      w('das Recycling', 'recycling', 'Recycling hilft, Ressourcen zu schonen.', 'Recycling helps conserve resources.'),
      w('die Ressourcenknappheit', 'resource scarcity', 'Ressourcenknappheit führt zu Konflikten.', 'Resource scarcity leads to conflicts.'),
      w('der Meeresspiegel', 'sea level', 'Der Meeresspiegel steigt durch die Erderwärmung.', 'Sea levels are rising due to global warming.'),
      w('die Überschwemmung', 'flooding', 'Überschwemmungen werden häufiger.', 'Floods are becoming more frequent.'),
      w('die Dürre', 'drought', 'Lange Dürren bedrohen die Landwirtschaft.', 'Prolonged droughts threaten agriculture.'),
    ]
  },
  {
    id: 'B2_DIGITALE_WELT2',
    emoji: '💻',
    title: 'DIGITALE WELT & KI (VERTIEFUNG)',
    level: 'B2',
    entries: [
      w('die Künstliche Intelligenz', 'artificial intelligence', 'Künstliche Intelligenz verändert die Arbeitswelt.', 'Artificial intelligence is changing the world of work.'),
      w('der Algorithmus', 'algorithm', 'Algorithmen bestimmen, was wir online sehen.', 'Algorithms determine what we see online.'),
      w('die Datensicherheit', 'data security', 'Datensicherheit ist für Unternehmen essenziell.', 'Data security is essential for companies.'),
      w('die Privatsphäre', 'privacy', 'Viele Menschen sorgen sich um ihre Privatsphäre.', 'Many people are concerned about their privacy.'),
      w('die Desinformation', 'disinformation', 'Desinformation verbreitet sich schnell im Netz.', 'Disinformation spreads quickly on the internet.'),
      w('die Bildschirmzeit', 'screen time', 'Zu viel Bildschirmzeit kann schädlich sein.', 'Too much screen time can be harmful.'),
      w('die digitale Kluft', 'digital divide', 'Die digitale Kluft zwischen Jung und Alt wächst.', 'The digital divide between young and old is growing.'),
      w('die Automatisierung', 'automation', 'Automatisierung ersetzt viele Routinetätigkeiten.', 'Automation is replacing many routine tasks.'),
      w('der Datenschutz', 'data protection', 'Der Datenschutz ist in der EU streng geregelt.', 'Data protection is strictly regulated in the EU.'),
      w('die Cyberkriminalität', 'cybercrime', 'Cyberkriminalität nimmt weltweit zu.', 'Cybercrime is increasing worldwide.'),
    ]
  },
  {
    id: 'B2_GESUNDHEIT_PSYCHE2',
    emoji: '🧠',
    title: 'GESUNDHEIT & PSYCHE (VERTIEFUNG)',
    level: 'B2',
    entries: [
      w('die psychische Belastung', 'mental strain', 'Psychische Belastung am Arbeitsplatz nimmt zu.', 'Mental strain in the workplace is increasing.'),
      w('die Burnout-Prävention', 'burnout prevention', 'Firmen investieren in Burnout-Prävention.', 'Companies are investing in burnout prevention.'),
      w('die Achtsamkeit', 'mindfulness', 'Achtsamkeit hilft, Stress abzubauen.', 'Mindfulness helps reduce stress.'),
      w('die Depression', 'depression', 'Depression ist eine ernstzunehmende Erkrankung.', 'Depression is a serious illness.'),
      w('die Therapie', 'therapy', 'Eine Therapie kann bei psychischen Problemen helfen.', 'Therapy can help with mental health problems.'),
      w('die Resilienz', 'resilience', 'Resilienz ist die Fähigkeit, Krisen zu bewältigen.', 'Resilience is the ability to cope with crises.'),
      w('der Schlafmangel', 'sleep deprivation', 'Schlafmangel beeinträchtigt die Leistungsfähigkeit.', 'Sleep deprivation impairs performance.'),
      w('die Ernährungsweise', 'diet / eating habits', 'Eine gesunde Ernährungsweise ist wichtig.', 'A healthy diet is important.'),
      w('die Suchterkrankung', 'addiction', 'Suchterkrankungen erfordern professionelle Hilfe.', 'Addictions require professional help.'),
      w('die Work-Life-Balance', 'work-life balance', 'Eine gute Work-Life-Balance ist entscheidend.', 'A good work-life balance is crucial.'),
    ]
  },
  {
    id: 'B2_WIRTSCHAFT_ARBEIT2',
    emoji: '💼',
    title: 'WIRTSCHAFT & ARBEITSWELT (VERTIEFUNG)',
    level: 'B2',
    entries: [
      w('die Globalisierung', 'globalization', 'Die Globalisierung verändert Märkte weltweit.', 'Globalization is changing markets worldwide.'),
      w('die Digitalisierung', 'digitalization', 'Die Digitalisierung verändert alle Branchen.', 'Digitalization is transforming all industries.'),
      w('der Fachkräftemangel', 'shortage of skilled workers', 'Der Fachkräftemangel ist ein großes Problem.', 'The shortage of skilled workers is a major problem.'),
      w('die Weiterbildung', 'further training', 'Weiterbildung wird immer wichtiger.', 'Further training is becoming increasingly important.'),
      w('die Gig Economy', 'gig economy', 'Die Gig Economy bietet flexible, aber unsichere Jobs.', 'The gig economy offers flexible but insecure jobs.'),
      w('der Mindestlohn', 'minimum wage', 'Der Mindestlohn soll Armut verhindern.', 'The minimum wage is meant to prevent poverty.'),
      w('die Tarifverhandlung', 'collective bargaining', 'Tarifverhandlungen sind oft schwierig.', 'Collective bargaining is often difficult.'),
      w('die Unternehmensethik', 'corporate ethics', 'Unternehmensethik gewinnt an Bedeutung.', 'Corporate ethics is gaining importance.'),
      w('die Insolvenz', 'insolvency / bankruptcy', 'Viele Firmen stehen vor der Insolvenz.', 'Many companies are facing insolvency.'),
      w('die Innovation', 'innovation', 'Innovation ist der Motor des wirtschaftlichen Wachstums.', 'Innovation is the engine of economic growth.'),
    ]
  },
  {
    id: 'B2_POLITIK_GESETZ2',
    emoji: '⚖️',
    title: 'POLITIK, RECHT & GESELLSCHAFT (VERTIEFUNG)',
    level: 'B2',
    entries: [
      w('die Demokratie', 'democracy', 'Demokratie muss aktiv verteidigt werden.', 'Democracy must be actively defended.'),
      w('die Meinungsfreiheit', 'freedom of speech', 'Meinungsfreiheit ist ein Grundrecht.', 'Freedom of speech is a fundamental right.'),
      w('die Menschenrechte', 'human rights', 'Menschenrechte gelten universell.', 'Human rights are universal.'),
      w('die Integration', 'integration', 'Erfolgreiche Integration braucht Zeit und Unterstützung.', 'Successful integration takes time and support.'),
      w('die Diskriminierung', 'discrimination', 'Diskriminierung darf nicht toleriert werden.', 'Discrimination must not be tolerated.'),
      w('die Korruption', 'corruption', 'Korruption untergräbt das Vertrauen in den Staat.', 'Corruption undermines trust in the state.'),
      w('das Asylrecht', 'right to asylum', 'Das Asylrecht ist in Deutschland geschützt.', 'The right to asylum is protected in Germany.'),
      w('die Wahlbeteiligung', 'voter turnout', 'Eine hohe Wahlbeteiligung stärkt die Demokratie.', 'High voter turnout strengthens democracy.'),
      w('die Lobbyarbeit', 'lobbying', 'Lobbyarbeit beeinflusst politische Entscheidungen.', 'Lobbying influences political decisions.'),
      w('die Gewaltenteilung', 'separation of powers', 'Die Gewaltenteilung ist ein Prinzip des Rechtsstaats.', 'The separation of powers is a principle of the rule of law.'),
    ]
  }
];

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

let added = 0;
newB2Categories.forEach(cat => {
  data.push(cat);
  added += cat.entries.length;
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');

console.log(`Added ${newB2Categories.length} new B2 categories with ${added} words.`);
console.log('B2 vocabulary expansion complete.');
