/* Batch 1: append curated, correct B2-level vocabulary categories to vocab.json. */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

const cats = [
  { id: 'B2_BERUF_KARRIERE', emoji: '💼', title: 'BERUF & KARRIERE', level: 'B2', entries: [
    ['die Bewerbung', 'application (job)', 'Ich habe meine Bewerbung gestern abgeschickt.', 'I sent my application yesterday.'],
    ['der Lebenslauf', 'CV / résumé', 'Bitte senden Sie Ihren Lebenslauf mit.', 'Please include your CV.'],
    ['die Fähigkeit', 'ability / skill', 'Diese Fähigkeit ist im Beruf sehr wichtig.', 'This skill is very important at work.'],
    ['die Verantwortung', 'responsibility', 'Er übernimmt gern Verantwortung.', 'He likes to take on responsibility.'],
    ['der Vertrag', 'contract', 'Sie hat den Vertrag unterschrieben.', 'She signed the contract.'],
    ['die Gehaltserhöhung', 'pay rise', 'Ich habe um eine Gehaltserhöhung gebeten.', 'I asked for a pay rise.'],
    ['die Weiterbildung', 'further training', 'Die Firma bietet viele Weiterbildungen an.', 'The company offers a lot of further training.'],
    ['die Besprechung', 'meeting', 'Die Besprechung dauert eine Stunde.', 'The meeting lasts an hour.'],
    ['der Vorgesetzte', 'superior / boss', 'Mein Vorgesetzter ist sehr fair.', 'My boss is very fair.'],
    ['selbstständig', 'self-employed / independent', 'Sie arbeitet seit drei Jahren selbstständig.', 'She has been self-employed for three years.'],
    ['die Kündigung', 'notice / termination', 'Er hat seine Kündigung eingereicht.', 'He handed in his notice.'],
    ['der Schichtdienst', 'shift work', 'Im Krankenhaus gibt es Schichtdienst.', 'There is shift work in the hospital.'],
  ]},
  { id: 'B2_UMWELT', emoji: '🌍', title: 'UMWELT & NACHHALTIGKEIT', level: 'B2', entries: [
    ['der Klimawandel', 'climate change', 'Der Klimawandel betrifft uns alle.', 'Climate change affects us all.'],
    ['die Umweltverschmutzung', 'pollution', 'Die Umweltverschmutzung nimmt zu.', 'Pollution is increasing.'],
    ['erneuerbar', 'renewable', 'Wir setzen auf erneuerbare Energien.', 'We rely on renewable energy.'],
    ['nachhaltig', 'sustainable', 'Das Unternehmen handelt nachhaltig.', 'The company acts sustainably.'],
    ['der Verbrauch', 'consumption', 'Der Verbrauch von Plastik ist hoch.', 'The consumption of plastic is high.'],
    ['die Folge', 'consequence', 'Das hat schlimme Folgen für die Natur.', 'That has bad consequences for nature.'],
    ['vermeiden', 'to avoid', 'Wir sollten unnötigen Müll vermeiden.', 'We should avoid unnecessary waste.'],
    ['der Treibhauseffekt', 'greenhouse effect', 'Der Treibhauseffekt erwärmt die Erde.', 'The greenhouse effect warms the Earth.'],
    ['schützen', 'to protect', 'Wir müssen die Umwelt schützen.', 'We must protect the environment.'],
    ['die Ressource', 'resource', 'Wasser ist eine wichtige Ressource.', 'Water is an important resource.'],
    ['der Verzicht', 'doing without', 'Der Verzicht auf das Auto hilft dem Klima.', 'Doing without the car helps the climate.'],
    ['die Mülltrennung', 'waste separation', 'Mülltrennung ist in Deutschland üblich.', 'Waste separation is common in Germany.'],
  ]},
  { id: 'B2_MEINUNG', emoji: '💭', title: 'MEINUNG & DISKUSSION', level: 'B2', entries: [
    ['die Meinung', 'opinion', 'Meiner Meinung nach ist das falsch.', 'In my opinion that is wrong.'],
    ['behaupten', 'to claim', 'Er behauptet, er sei unschuldig.', 'He claims he is innocent.'],
    ['der Vorteil', 'advantage', 'Diese Lösung hat viele Vorteile.', 'This solution has many advantages.'],
    ['der Nachteil', 'disadvantage', 'Der größte Nachteil ist der Preis.', 'The biggest disadvantage is the price.'],
    ['überzeugen', 'to convince', 'Sein Argument hat mich überzeugt.', 'His argument convinced me.'],
    ['zustimmen', 'to agree', 'Ich kann dir nur zustimmen.', 'I can only agree with you.'],
    ['ablehnen', 'to reject', 'Sie lehnt den Vorschlag ab.', 'She rejects the proposal.'],
    ['der Standpunkt', 'point of view', 'Ich verstehe deinen Standpunkt.', 'I understand your point of view.'],
    ['begründen', 'to justify / give reasons', 'Kannst du deine Meinung begründen?', 'Can you justify your opinion?'],
    ['der Zusammenhang', 'connection / context', 'Es gibt einen Zusammenhang zwischen beiden.', 'There is a connection between the two.'],
    ['berücksichtigen', 'to take into account', 'Wir müssen alle Faktoren berücksichtigen.', 'We must take all factors into account.'],
    ['der Vorschlag', 'suggestion / proposal', 'Das ist ein guter Vorschlag.', 'That is a good suggestion.'],
  ]},
  { id: 'B2_GESUNDHEIT', emoji: '🩺', title: 'GESUNDHEIT & WOHLBEFINDEN', level: 'B2', entries: [
    ['die Vorsorge', 'prevention / check-up', 'Vorsorge ist besser als heilen.', 'Prevention is better than cure.'],
    ['die Ernährung', 'nutrition / diet', 'Eine gesunde Ernährung ist wichtig.', 'A healthy diet is important.'],
    ['der Stress', 'stress', 'Zu viel Stress macht krank.', 'Too much stress makes you ill.'],
    ['sich erholen', 'to recover / relax', 'Im Urlaub kann ich mich gut erholen.', 'On holiday I can relax well.'],
    ['die Beschwerde', 'complaint / ailment', 'Der Patient hat starke Beschwerden.', 'The patient has severe ailments.'],
    ['die Behandlung', 'treatment', 'Die Behandlung dauert mehrere Wochen.', 'The treatment takes several weeks.'],
    ['vorbeugen', 'to prevent', 'Sport beugt vielen Krankheiten vor.', 'Exercise prevents many illnesses.'],
    ['die Sucht', 'addiction', 'Er kämpft gegen seine Sucht.', 'He is fighting his addiction.'],
    ['das Immunsystem', 'immune system', 'Schlaf stärkt das Immunsystem.', 'Sleep strengthens the immune system.'],
    ['belastend', 'stressful / burdensome', 'Die Arbeit ist sehr belastend.', 'The work is very stressful.'],
    ['die Genesung', 'recovery', 'Wir wünschen dir gute Genesung.', 'We wish you a speedy recovery.'],
    ['ausgewogen', 'balanced', 'Eine ausgewogene Mahlzeit ist gesund.', 'A balanced meal is healthy.'],
  ]},
  { id: 'B2_MEDIEN', emoji: '📱', title: 'MEDIEN & DIGITALES', level: 'B2', entries: [
    ['die Nachricht', 'news / message', 'Ich habe die Nachricht im Radio gehört.', 'I heard the news on the radio.'],
    ['der Datenschutz', 'data protection', 'Datenschutz ist ein wichtiges Thema.', 'Data protection is an important topic.'],
    ['herunterladen', 'to download', 'Du kannst die App kostenlos herunterladen.', 'You can download the app for free.'],
    ['die Quelle', 'source', 'Bitte gib die Quelle an.', 'Please cite the source.'],
    ['verbreiten', 'to spread / distribute', 'Falschnachrichten verbreiten sich schnell.', 'Fake news spreads quickly.'],
    ['die Werbung', 'advertising', 'Im Internet gibt es zu viel Werbung.', 'There is too much advertising online.'],
    ['zuverlässig', 'reliable', 'Die Information stammt aus zuverlässiger Quelle.', 'The information comes from a reliable source.'],
    ['das Netzwerk', 'network', 'Sie pflegt ihr berufliches Netzwerk.', 'She maintains her professional network.'],
    ['der Beitrag', 'post / contribution', 'Sein Beitrag hat viele Likes bekommen.', 'His post got many likes.'],
    ['veröffentlichen', 'to publish', 'Die Zeitung veröffentlicht den Artikel morgen.', 'The newspaper publishes the article tomorrow.'],
    ['die Reichweite', 'reach', 'Das Video hat eine große Reichweite.', 'The video has a large reach.'],
    ['abonnieren', 'to subscribe', 'Ich habe den Kanal abonniert.', 'I subscribed to the channel.'],
  ]},
  { id: 'B2_GESELLSCHAFT', emoji: '🤝', title: 'GESELLSCHAFT & ZUSAMMENLEBEN', level: 'B2', entries: [
    ['die Gesellschaft', 'society', 'Die Gesellschaft verändert sich ständig.', 'Society is constantly changing.'],
    ['die Integration', 'integration', 'Sprache ist wichtig für die Integration.', 'Language is important for integration.'],
    ['die Gleichberechtigung', 'equal rights', 'Gleichberechtigung betrifft alle.', 'Equal rights concern everyone.'],
    ['die Vielfalt', 'diversity', 'Die kulturelle Vielfalt bereichert uns.', 'Cultural diversity enriches us.'],
    ['das Vorurteil', 'prejudice', 'Wir sollten Vorurteile abbauen.', 'We should reduce prejudices.'],
    ['der Zusammenhalt', 'cohesion / solidarity', 'Der Zusammenhalt in der Gruppe ist stark.', 'The cohesion in the group is strong.'],
    ['benachteiligt', 'disadvantaged', 'Manche Gruppen sind benachteiligt.', 'Some groups are disadvantaged.'],
    ['ehrenamtlich', 'voluntary (unpaid)', 'Sie arbeitet ehrenamtlich im Verein.', 'She works voluntarily in the club.'],
    ['die Toleranz', 'tolerance', 'Toleranz ist die Basis des Zusammenlebens.', 'Tolerance is the basis of living together.'],
    ['die Bevölkerung', 'population', 'Die Bevölkerung wächst langsam.', 'The population is growing slowly.'],
    ['mitbestimmen', 'to have a say', 'Bürger können bei der Wahl mitbestimmen.', 'Citizens can have a say in the election.'],
    ['der Anspruch', 'claim / entitlement', 'Jeder hat Anspruch auf faire Behandlung.', 'Everyone is entitled to fair treatment.'],
  ]},
];

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
// Remove any previously-added B2 categories (idempotent re-runs)
const base = data.filter(c => c.level !== 'B2');
const built = cats.map(c => ({
  id: c.id, emoji: c.emoji, title: c.title, level: c.level,
  entries: c.entries.map(([w, t, de, en]) => ({ w, t, de, en })),
}));
const out = [...base, ...built];
fs.writeFileSync(FILE, JSON.stringify(out));
const words = built.reduce((s, c) => s + c.entries.length, 0);
console.log(`Added ${built.length} B2 categories (${words} words). Total categories: ${out.length}.`);
