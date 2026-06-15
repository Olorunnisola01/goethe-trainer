/* Build comprehensive Goethe B2 Wortliste vocabulary for vocab.json.
   Covers all thematic areas of the official Goethe-Institut B2 Wortliste.
   Each entry: [German word/phrase, English meaning, German example, English translation] */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

const cats = [

  // ── 1. Persönlichkeit & Sozialverhalten ──────────────────────────────────
  { id: 'B2_PERSOENLICHKEIT', emoji: '🧠', title: 'PERSÖNLICHKEIT & CHARAKTER', level: 'B2', entries: [
    ['die Eigenschaft', 'characteristic / quality', 'Ehrlichkeit ist eine wichtige Eigenschaft.', 'Honesty is an important quality.'],
    ['die Einstellung', 'attitude / view', 'Seine Einstellung zur Arbeit hat sich verändert.', 'His attitude to work has changed.'],
    ['die Überzeugung', 'conviction / belief', 'Sie handelt nach ihrer Überzeugung.', 'She acts according to her convictions.'],
    ['das Selbstbewusstsein', 'self-confidence', 'Er hat ein gesundes Selbstbewusstsein.', 'He has a healthy self-confidence.'],
    ['die Stärke', 'strength', 'Geduld ist seine größte Stärke.', 'Patience is his greatest strength.'],
    ['die Schwäche', 'weakness', 'Ungeduld ist ihre Schwäche.', 'Impatience is her weakness.'],
    ['zuverlässig', 'reliable', 'Sie ist eine sehr zuverlässige Mitarbeiterin.', 'She is a very reliable employee.'],
    ['verantwortungsbewusst', 'responsible / conscientious', 'Er ist ein verantwortungsbewusster Vater.', 'He is a responsible father.'],
    ['einfühlsam', 'empathetic', 'Eine gute Lehrerin muss einfühlsam sein.', 'A good teacher must be empathetic.'],
    ['hartnäckig', 'persistent / tenacious', 'Sie kämpft hartnäckig für ihre Rechte.', 'She fights tenaciously for her rights.'],
    ['die Toleranz', 'tolerance', 'Toleranz gegenüber anderen ist wichtig.', 'Tolerance towards others is important.'],
    ['der Respekt', 'respect', 'Respekt ist die Basis jeder Beziehung.', 'Respect is the basis of every relationship.'],
    ['das Vertrauen', 'trust', 'Sie hat das Vertrauen ihrer Kollegen gewonnen.', 'She has won the trust of her colleagues.'],
    ['die Geduld', 'patience', 'Mit Kindern braucht man viel Geduld.', 'You need a lot of patience with children.'],
    ['bescheiden', 'modest / humble', 'Trotz seines Erfolgs ist er bescheiden geblieben.', 'Despite his success he remained modest.'],
    ['ehrgeizig', 'ambitious', 'Sie ist sehr ehrgeizig und arbeitet hart.', 'She is very ambitious and works hard.'],
  ]},

  // ── 2. Zwischenmenschliches & Beziehungen ────────────────────────────────
  { id: 'B2_BEZIEHUNGEN', emoji: '🤝', title: 'BEZIEHUNGEN & SOZIALES', level: 'B2', entries: [
    ['der Konflikt', 'conflict', 'Der Konflikt zwischen den Parteien eskaliert.', 'The conflict between the parties is escalating.'],
    ['die Auseinandersetzung', 'dispute / confrontation', 'Es kam zu einer heftigen Auseinandersetzung.', 'There was a fierce dispute.'],
    ['der Kompromiss', 'compromise', 'Beide Seiten mussten Kompromisse eingehen.', 'Both sides had to make compromises.'],
    ['die Solidarität', 'solidarity', 'Die Solidarität der Nachbarn hat uns geholfen.', 'The solidarity of the neighbours helped us.'],
    ['die Gemeinschaft', 'community', 'Wir leben in einer starken Gemeinschaft.', 'We live in a strong community.'],
    ['das Engagement', 'commitment / involvement', 'Ihr soziales Engagement ist vorbildlich.', 'Her social commitment is exemplary.'],
    ['unterstützen', 'to support', 'Sie unterstützt ihren Freund bei der Bewerbung.', 'She supports her friend with the application.'],
    ['aufeinander angewiesen sein', 'to be dependent on each other', 'In der Familie sind wir aufeinander angewiesen.', 'In the family we depend on each other.'],
    ['der Zusammenhalt', 'cohesion / solidarity', 'Der Zusammenhalt in der Gruppe ist stark.', 'The cohesion in the group is strong.'],
    ['die Rücksicht', 'consideration', 'Rücksicht auf andere ist wichtig.', 'Consideration for others is important.'],
    ['das Vorurteil', 'prejudice', 'Vorurteile entstehen oft durch Unwissenheit.', 'Prejudices often arise through ignorance.'],
    ['die Diskriminierung', 'discrimination', 'Diskriminierung am Arbeitsplatz ist verboten.', 'Discrimination at the workplace is prohibited.'],
  ]},

  // ── 3. Arbeit & Beruf ────────────────────────────────────────────────────
  { id: 'B2_ARBEIT', emoji: '💼', title: 'ARBEIT & BERUF', level: 'B2', entries: [
    ['die Bewerbung', 'job application', 'Ich habe meine Bewerbung gestern abgeschickt.', 'I sent my application yesterday.'],
    ['der Lebenslauf', 'CV / résumé', 'Ein guter Lebenslauf ist entscheidend.', 'A good CV is decisive.'],
    ['das Vorstellungsgespräch', 'job interview', 'Das Vorstellungsgespräch läuft gut.', 'The job interview is going well.'],
    ['die Qualifikation', 'qualification', 'Welche Qualifikationen werden gefordert?', 'What qualifications are required?'],
    ['die Berufsausbildung', 'vocational training', 'Er macht eine Berufsausbildung zum Koch.', 'He is doing vocational training as a cook.'],
    ['das Gehalt', 'salary', 'Das Gehalt ist nach einem Jahr gestiegen.', 'The salary increased after one year.'],
    ['die Kündigung', 'notice / termination', 'Sie hat ihre Kündigung eingereicht.', 'She handed in her notice.'],
    ['die Überstunde', 'overtime', 'Er macht regelmäßig Überstunden.', 'He regularly does overtime.'],
    ['die Elternzeit', 'parental leave', 'Sie ist gerade in Elternzeit.', 'She is currently on parental leave.'],
    ['das Praktikum', 'internship', 'Ich mache ein Praktikum bei einer Zeitung.', 'I am doing an internship at a newspaper.'],
    ['selbstständig', 'self-employed', 'Er arbeitet seit fünf Jahren selbstständig.', 'He has been self-employed for five years.'],
    ['die Weiterbildung', 'further training', 'Weiterbildung ist wichtig für die Karriere.', 'Further training is important for a career.'],
    ['das Teamwork', 'teamwork', 'Gutes Teamwork ist entscheidend für den Erfolg.', 'Good teamwork is decisive for success.'],
    ['der Arbeitsvertrag', 'employment contract', 'Ich habe den Arbeitsvertrag unterschrieben.', 'I signed the employment contract.'],
    ['die Arbeitslosigkeit', 'unemployment', 'Die Arbeitslosigkeit ist gesunken.', 'Unemployment has fallen.'],
    ['der Mindestlohn', 'minimum wage', 'Der Mindestlohn wurde erhöht.', 'The minimum wage was increased.'],
  ]},

  // ── 4. Bildung & Schule ──────────────────────────────────────────────────
  { id: 'B2_BILDUNG', emoji: '🎓', title: 'BILDUNG & SCHULE', level: 'B2', entries: [
    ['das Abitur', 'A-levels / school-leaving exam', 'Sie hat ihr Abitur mit Auszeichnung bestanden.', 'She passed her A-levels with distinction.'],
    ['das Studium', 'university studies', 'Das Studium dauert mindestens drei Jahre.', 'The degree takes at least three years.'],
    ['die Prüfung', 'exam', 'Er hat die Prüfung mit Bravour bestanden.', 'He passed the exam with flying colours.'],
    ['das Stipendium', 'scholarship', 'Sie hat ein Stipendium bekommen.', 'She received a scholarship.'],
    ['die Forschung', 'research', 'Die Forschung an der Universität ist wichtig.', 'Research at the university is important.'],
    ['der Abschluss', 'degree / qualification', 'Welchen Abschluss hast du gemacht?', 'What degree did you get?'],
    ['das Zeugnis', 'school report / certificate', 'Sein Zeugnis war sehr gut.', 'His school report was very good.'],
    ['das Lernziel', 'learning objective', 'Die Lernziele sind klar definiert.', 'The learning objectives are clearly defined.'],
    ['die Hausaufgabe', 'homework', 'Sie macht ihre Hausaufgaben immer pünktlich.', 'She always does her homework on time.'],
    ['der Lehrplan', 'curriculum', 'Der Lehrplan wurde modernisiert.', 'The curriculum was modernised.'],
    ['fördern', 'to support / promote', 'Talentierte Schüler sollte man fördern.', 'Talented pupils should be supported.'],
    ['sich konzentrieren', 'to concentrate', 'Es fällt ihm schwer, sich zu konzentrieren.', 'He finds it difficult to concentrate.'],
    ['das Fach', 'school subject', 'Mathematik ist mein Lieblingsfach.', 'Maths is my favourite subject.'],
    ['die Bildungschance', 'educational opportunity', 'Bildungschancen sollen gleich sein.', 'Educational opportunities should be equal.'],
  ]},

  // ── 5. Gesellschaft & Politik ────────────────────────────────────────────
  { id: 'B2_GESELLSCHAFT', emoji: '🏛️', title: 'GESELLSCHAFT & POLITIK', level: 'B2', entries: [
    ['die Demokratie', 'democracy', 'Die Demokratie basiert auf dem Willen des Volkes.', 'Democracy is based on the will of the people.'],
    ['die Wahl', 'election', 'Die Wahl findet alle vier Jahre statt.', 'The election takes place every four years.'],
    ['das Recht', 'right / law', 'Jeder hat das Recht auf freie Meinungsäußerung.', 'Everyone has the right to free expression.'],
    ['die Gleichberechtigung', 'equal rights', 'Gleichberechtigung ist ein Grundrecht.', 'Equal rights are a fundamental right.'],
    ['die Meinungsfreiheit', 'freedom of speech', 'Meinungsfreiheit ist in Deutschland garantiert.', 'Freedom of speech is guaranteed in Germany.'],
    ['die Gerechtigkeit', 'justice', 'Gerechtigkeit für alle ist das Ziel.', 'Justice for all is the goal.'],
    ['die Bürgerrechte', 'civil rights', 'Bürgerrechte müssen geschützt werden.', 'Civil rights must be protected.'],
    ['der Staat', 'state', 'Der Staat ist für das Wohl der Bürger verantwortlich.', 'The state is responsible for the welfare of its citizens.'],
    ['die Regierung', 'government', 'Die Regierung hat neue Gesetze beschlossen.', 'The government passed new laws.'],
    ['die Partei', 'political party', 'Welcher Partei gehörst du an?', 'Which party do you belong to?'],
    ['abstimmen', 'to vote', 'Die Bevölkerung stimmt über das Gesetz ab.', 'The population votes on the law.'],
    ['die Integration', 'integration', 'Integration gelingt durch Sprache.', 'Integration succeeds through language.'],
    ['die Flüchtlinge', 'refugees', 'Das Land nimmt viele Flüchtlinge auf.', 'The country takes in many refugees.'],
    ['die Sozialhilfe', 'social welfare / benefits', 'Er ist auf Sozialhilfe angewiesen.', 'He depends on social welfare.'],
    ['die Steuern', 'taxes', 'Die Steuern wurden erhöht.', 'Taxes were increased.'],
    ['die Bevölkerung', 'population', 'Die Bevölkerung wächst langsam.', 'The population is growing slowly.'],
  ]},

  // ── 6. Wirtschaft & Finanzen ─────────────────────────────────────────────
  { id: 'B2_WIRTSCHAFT', emoji: '📈', title: 'WIRTSCHAFT & FINANZEN', level: 'B2', entries: [
    ['die Wirtschaft', 'economy', 'Die Wirtschaft wächst langsamer als erwartet.', 'The economy is growing more slowly than expected.'],
    ['das Unternehmen', 'company / enterprise', 'Das Unternehmen beschäftigt 500 Mitarbeiter.', 'The company employs 500 employees.'],
    ['der Umsatz', 'turnover / revenue', 'Der Umsatz ist im letzten Jahr gestiegen.', 'Turnover rose last year.'],
    ['der Gewinn', 'profit', 'Das Unternehmen macht hohe Gewinne.', 'The company makes high profits.'],
    ['der Verlust', 'loss', 'Das war ein erheblicher finanzieller Verlust.', 'That was a considerable financial loss.'],
    ['die Investition', 'investment', 'Investitionen in Bildung sind wichtig.', 'Investments in education are important.'],
    ['die Inflation', 'inflation', 'Die Inflation steigt in vielen Ländern.', 'Inflation is rising in many countries.'],
    ['der Kredit', 'loan / credit', 'Sie hat einen Kredit aufgenommen.', 'She took out a loan.'],
    ['das Budget', 'budget', 'Das Budget des Projekts ist begrenzt.', 'The project budget is limited.'],
    ['die Globalisierung', 'globalisation', 'Die Globalisierung verändert die Arbeitswelt.', 'Globalisation is changing the world of work.'],
    ['konkurrenzfähig', 'competitive', 'Das Produkt muss konkurrenzfähig sein.', 'The product must be competitive.'],
    ['die Nachfrage', 'demand', 'Die Nachfrage nach Elektroautos steigt.', 'Demand for electric cars is rising.'],
    ['das Angebot', 'supply / offer', 'Angebot und Nachfrage bestimmen den Preis.', 'Supply and demand determine the price.'],
    ['die Börse', 'stock exchange', 'Die Kurse an der Börse sind gefallen.', 'Stock exchange prices fell.'],
    ['sparen', 'to save (money)', 'Sie spart jeden Monat etwas Geld.', 'She saves some money every month.'],
  ]},

  // ── 7. Umwelt & Natur ────────────────────────────────────────────────────
  { id: 'B2_UMWELT_NATUR', emoji: '🌿', title: 'UMWELT & NATUR', level: 'B2', entries: [
    ['der Klimawandel', 'climate change', 'Der Klimawandel ist die größte Herausforderung unserer Zeit.', 'Climate change is the greatest challenge of our time.'],
    ['die Nachhaltigkeit', 'sustainability', 'Nachhaltigkeit muss in allen Bereichen gelten.', 'Sustainability must apply in all areas.'],
    ['die erneuerbare Energie', 'renewable energy', 'Wir setzen auf erneuerbare Energien.', 'We rely on renewable energy.'],
    ['die Umweltverschmutzung', 'environmental pollution', 'Umweltverschmutzung schadet der Gesundheit.', 'Environmental pollution harms health.'],
    ['der Treibhauseffekt', 'greenhouse effect', 'Der Treibhauseffekt erwärmt die Erde.', 'The greenhouse effect is warming the Earth.'],
    ['das Artensterben', 'extinction of species', 'Das Artensterben nimmt zu.', 'The extinction of species is increasing.'],
    ['recyceln', 'to recycle', 'Wir sollten mehr recyceln.', 'We should recycle more.'],
    ['der Müll', 'waste / rubbish', 'Müll trennen ist in Deutschland Pflicht.', 'Separating waste is compulsory in Germany.'],
    ['der Ressourcenverbrauch', 'resource consumption', 'Der Ressourcenverbrauch muss sinken.', 'Resource consumption must decrease.'],
    ['die Abgase', 'exhaust fumes', 'Abgase verschmutzen die Luft.', 'Exhaust fumes pollute the air.'],
    ['der Naturschutz', 'nature conservation', 'Naturschutz liegt mir am Herzen.', 'Nature conservation is close to my heart.'],
    ['biologisch', 'organic / biological', 'Ich kaufe lieber biologische Lebensmittel.', 'I prefer to buy organic food.'],
    ['der ökologische Fußabdruck', 'ecological footprint', 'Jeder kann seinen ökologischen Fußabdruck reduzieren.', 'Everyone can reduce their ecological footprint.'],
    ['die Erderwärmung', 'global warming', 'Die Erderwärmung führt zu extremen Wetterereignissen.', 'Global warming leads to extreme weather events.'],
    ['der Wasserverbrauch', 'water consumption', 'Der Wasserverbrauch steigt weltweit.', 'Water consumption is rising worldwide.'],
  ]},

  // ── 8. Gesundheit & Medizin ──────────────────────────────────────────────
  { id: 'B2_GESUNDHEIT', emoji: '🩺', title: 'GESUNDHEIT & MEDIZIN', level: 'B2', entries: [
    ['die Vorsorgeuntersuchung', 'preventive check-up', 'Regelmäßige Vorsorgeuntersuchungen sind wichtig.', 'Regular preventive check-ups are important.'],
    ['die Behandlung', 'treatment', 'Die Behandlung dauert mehrere Wochen.', 'The treatment lasts several weeks.'],
    ['das Symptom', 'symptom', 'Die Symptome sind typisch für eine Erkältung.', 'The symptoms are typical for a cold.'],
    ['die Diagnose', 'diagnosis', 'Die Diagnose war ein Schock für ihn.', 'The diagnosis was a shock for him.'],
    ['die Operation', 'operation', 'Die Operation war erfolgreich.', 'The operation was successful.'],
    ['das Medikament', 'medication', 'Das Medikament hat Nebenwirkungen.', 'The medication has side effects.'],
    ['die Nebenwirkung', 'side effect', 'Lesen Sie die Nebenwirkungen sorgfältig.', 'Read the side effects carefully.'],
    ['die Rehabilitation', 'rehabilitation', 'Nach der Operation folgte eine Rehabilitation.', 'After the operation came rehabilitation.'],
    ['das Immunsystem', 'immune system', 'Ein starkes Immunsystem schützt vor Krankheiten.', 'A strong immune system protects against diseases.'],
    ['der Stress', 'stress', 'Dauerhafter Stress schadet der Gesundheit.', 'Chronic stress harms health.'],
    ['psychisch', 'psychological / mental', 'Psychische Gesundheit ist genauso wichtig.', 'Mental health is equally important.'],
    ['die Prävention', 'prevention', 'Prävention ist besser als Heilung.', 'Prevention is better than cure.'],
    ['chronisch', 'chronic', 'Er leidet an einer chronischen Krankheit.', 'He suffers from a chronic illness.'],
    ['die Allergie', 'allergy', 'Sie hat eine Allergie gegen Pollen.', 'She has an allergy to pollen.'],
    ['die Ernährung', 'diet / nutrition', 'Eine ausgewogene Ernährung ist wichtig.', 'A balanced diet is important.'],
  ]},

  // ── 9. Medien & Kommunikation ────────────────────────────────────────────
  { id: 'B2_MEDIEN', emoji: '📱', title: 'MEDIEN & KOMMUNIKATION', level: 'B2', entries: [
    ['die Berichterstattung', 'reporting / coverage', 'Die Berichterstattung war sehr ausführlich.', 'The reporting was very detailed.'],
    ['der Datenschutz', 'data protection', 'Datenschutz ist in der EU streng geregelt.', 'Data protection is strictly regulated in the EU.'],
    ['die Zensur', 'censorship', 'Zensur widerspricht der Pressefreiheit.', 'Censorship contradicts freedom of the press.'],
    ['die Pressefreiheit', 'freedom of the press', 'Pressefreiheit ist ein Grundrecht.', 'Freedom of the press is a fundamental right.'],
    ['die soziale Netzwerke', 'social networks', 'Soziale Netzwerke verbinden Menschen weltweit.', 'Social networks connect people worldwide.'],
    ['die Manipulation', 'manipulation', 'Medien können zur Manipulation benutzt werden.', 'Media can be used for manipulation.'],
    ['die Fake News', 'fake news', 'Fake News verbreiten sich sehr schnell.', 'Fake news spreads very quickly.'],
    ['die Quelle', 'source', 'Man sollte immer die Quelle prüfen.', 'One should always check the source.'],
    ['die Reichweite', 'reach / coverage', 'Der Beitrag hat eine enorme Reichweite.', 'The post has an enormous reach.'],
    ['veröffentlichen', 'to publish', 'Sie hat einen Artikel veröffentlicht.', 'She published an article.'],
    ['die Werbung', 'advertising', 'Kinder sind sehr anfällig für Werbung.', 'Children are very susceptible to advertising.'],
    ['der Algorithmus', 'algorithm', 'Der Algorithmus bestimmt, was wir sehen.', 'The algorithm determines what we see.'],
    ['die Digitalisierung', 'digitalisation', 'Die Digitalisierung verändert alle Branchen.', 'Digitalisation is changing all sectors.'],
    ['online', 'online', 'Viele Einkäufe werden online gemacht.', 'Many purchases are made online.'],
    ['das Urheberrecht', 'copyright', 'Das Urheberrecht schützt Kunstwerke.', 'Copyright protects works of art.'],
  ]},

  // ── 10. Wissenschaft & Technologie ──────────────────────────────────────
  { id: 'B2_WISSENSCHAFT', emoji: '🔬', title: 'WISSENSCHAFT & TECHNOLOGIE', level: 'B2', entries: [
    ['die Forschung', 'research', 'Die Forschung auf diesem Gebiet schreitet voran.', 'Research in this field is progressing.'],
    ['die Entwicklung', 'development', 'Die technologische Entwicklung ist rasant.', 'Technological development is rapid.'],
    ['die künstliche Intelligenz', 'artificial intelligence', 'Künstliche Intelligenz verändert die Arbeitswelt.', 'Artificial intelligence is changing the world of work.'],
    ['das Experiment', 'experiment', 'Das Experiment wurde mehrmals wiederholt.', 'The experiment was repeated several times.'],
    ['die Hypothese', 'hypothesis', 'Die Hypothese konnte bewiesen werden.', 'The hypothesis could be proven.'],
    ['die Entdeckung', 'discovery', 'Diese Entdeckung ist bahnbrechend.', 'This discovery is groundbreaking.'],
    ['die Innovation', 'innovation', 'Innovation ist der Motor des Fortschritts.', 'Innovation is the engine of progress.'],
    ['der Fortschritt', 'progress', 'Der technische Fortschritt ist nicht aufzuhalten.', 'Technical progress cannot be stopped.'],
    ['die Robotik', 'robotics', 'Die Robotik revolutioniert die Industrie.', 'Robotics is revolutionising industry.'],
    ['die Raumfahrt', 'space travel', 'Die Raumfahrt fasziniert mich seit der Kindheit.', 'Space travel has fascinated me since childhood.'],
    ['nachweisen', 'to prove / detect', 'Die Wirkung konnte wissenschaftlich nachgewiesen werden.', 'The effect could be scientifically proven.'],
    ['analysieren', 'to analyse', 'Wir müssen die Daten analysieren.', 'We must analyse the data.'],
    ['das Labor', 'laboratory', 'Die Proben werden im Labor untersucht.', 'The samples are examined in the laboratory.'],
    ['die Strahlung', 'radiation', 'UV-Strahlung kann die Haut schädigen.', 'UV radiation can damage the skin.'],
  ]},

  // ── 11. Kultur & Freizeit ───────────────────────────────────────────────
  { id: 'B2_KULTUR', emoji: '🎭', title: 'KULTUR & KUNST', level: 'B2', entries: [
    ['das Kulturerbe', 'cultural heritage', 'Das Kulturerbe muss bewahrt werden.', 'Cultural heritage must be preserved.'],
    ['die Ausstellung', 'exhibition', 'Die Ausstellung im Museum war beeindruckend.', 'The exhibition at the museum was impressive.'],
    ['das Kunstwerk', 'work of art', 'Das Kunstwerk ist Millionen wert.', 'The work of art is worth millions.'],
    ['der Künstler', 'artist', 'Der Künstler ist weltweit bekannt.', 'The artist is known worldwide.'],
    ['der Regisseur', 'director (film)', 'Der Regisseur hat einen Oscar gewonnen.', 'The director won an Oscar.'],
    ['die Aufführung', 'performance', 'Die Aufführung beginnt um 19 Uhr.', 'The performance starts at 7 pm.'],
    ['das Drehbuch', 'screenplay / script', 'Das Drehbuch ist sehr gut geschrieben.', 'The screenplay is very well written.'],
    ['literarisch', 'literary', 'Der Roman hat einen hohen literarischen Wert.', 'The novel has a high literary value.'],
    ['die Kritik', 'criticism / review', 'Die Kritiken des Stückes waren gemischt.', 'The reviews of the play were mixed.'],
    ['das Publikum', 'audience', 'Das Publikum war begeistert.', 'The audience was enthusiastic.'],
    ['die Tradition', 'tradition', 'Diese Tradition wird seit Jahrhunderten gepflegt.', 'This tradition has been maintained for centuries.'],
    ['die Subkultur', 'subculture', 'Jede Stadt hat ihre eigene Subkultur.', 'Every city has its own subculture.'],
    ['interkulturell', 'intercultural', 'Interkulturelle Kompetenz ist gefragt.', 'Intercultural competence is in demand.'],
  ]},

  // ── 12. Reise & Verkehr ─────────────────────────────────────────────────
  { id: 'B2_REISE', emoji: '✈️', title: 'REISE & VERKEHR', level: 'B2', entries: [
    ['die Infrastruktur', 'infrastructure', 'Die Infrastruktur in der Stadt ist gut ausgebaut.', 'The infrastructure in the city is well developed.'],
    ['der öffentliche Nahverkehr', 'public transport', 'Der öffentliche Nahverkehr ist günstig.', 'Public transport is affordable.'],
    ['das Visum', 'visa', 'Für die Einreise braucht man ein Visum.', 'You need a visa to enter.'],
    ['die Unterkunft', 'accommodation', 'Wir suchen noch eine günstige Unterkunft.', 'We are still looking for affordable accommodation.'],
    ['der Stau', 'traffic jam', 'Auf der Autobahn gibt es einen langen Stau.', 'There is a long traffic jam on the motorway.'],
    ['die Verspätung', 'delay', 'Der Zug hatte eine Stunde Verspätung.', 'The train was an hour late.'],
    ['die Verbindung', 'connection', 'Die Verbindung nach Berlin fährt stündlich.', 'The connection to Berlin runs hourly.'],
    ['umsteigen', 'to change (transport)', 'Sie müssen in Frankfurt umsteigen.', 'You have to change in Frankfurt.'],
    ['die Umleitung', 'diversion', 'Wegen der Baustelle gibt es eine Umleitung.', 'There is a diversion because of the construction site.'],
    ['das Gepäck', 'luggage', 'Mein Gepäck wurde verloren.', 'My luggage was lost.'],
    ['die Reiseversicherung', 'travel insurance', 'Eine Reiseversicherung ist empfehlenswert.', 'Travel insurance is recommended.'],
    ['auswandern', 'to emigrate', 'Viele Menschen wandern ins Ausland aus.', 'Many people emigrate abroad.'],
    ['die Sehenswürdigkeit', 'sight / attraction', 'Das ist eine der schönsten Sehenswürdigkeiten Europas.', 'That is one of the most beautiful sights in Europe.'],
  ]},

  // ── 13. Wohnen & Stadtleben ─────────────────────────────────────────────
  { id: 'B2_WOHNEN', emoji: '🏙️', title: 'WOHNEN & STADTLEBEN', level: 'B2', entries: [
    ['die Miete', 'rent', 'Die Mieten in Großstädten steigen stark.', 'Rents in big cities are rising sharply.'],
    ['der Mietvertrag', 'rental agreement', 'Der Mietvertrag läuft noch drei Jahre.', 'The rental agreement runs for another three years.'],
    ['das Grundstück', 'plot / property', 'Das Grundstück in der Stadtmitte ist teuer.', 'The plot in the city centre is expensive.'],
    ['die Eigentumswohnung', 'owner-occupied flat', 'Sie hat eine Eigentumswohnung gekauft.', 'She bought an owner-occupied flat.'],
    ['sanieren', 'to renovate / refurbish', 'Das alte Gebäude wurde saniert.', 'The old building was refurbished.'],
    ['die Nebenkosten', 'additional costs / utilities', 'Die Nebenkosten sind im Mietpreis enthalten.', 'The utilities are included in the rent.'],
    ['der Lärm', 'noise', 'Der Lärm der Baustelle stört mich sehr.', 'The noise from the construction site bothers me a lot.'],
    ['das Viertel', 'quarter / neighbourhood', 'Das Viertel hat sich stark verändert.', 'The neighbourhood has changed a lot.'],
    ['barrierefreiheit', 'accessibility', 'Barrierefreiheit ist wichtig für alle.', 'Accessibility is important for everyone.'],
    ['der Hausmeister', 'caretaker / janitor', 'Der Hausmeister ist für alle Reparaturen zuständig.', 'The caretaker is responsible for all repairs.'],
    ['die Wohngemeinschaft', 'shared flat (WG)', 'Sie lebt in einer Wohngemeinschaft mit drei Freunden.', 'She lives in a shared flat with three friends.'],
    ['die Stadtplanung', 'urban planning', 'Stadtplanung muss Grünflächen berücksichtigen.', 'Urban planning must take green spaces into account.'],
  ]},

  // ── 14. Sprache & Kommunikation ─────────────────────────────────────────
  { id: 'B2_SPRACHE', emoji: '🗣️', title: 'SPRACHE & KOMMUNIKATION', level: 'B2', entries: [
    ['der Ausdruck', 'expression / term', 'Dieser Ausdruck ist in der Umgangssprache üblich.', 'This expression is common in everyday language.'],
    ['die Übersetzung', 'translation', 'Die Übersetzung ist sehr gelungen.', 'The translation is very successful.'],
    ['mehrdeutig', 'ambiguous', 'Dieser Satz ist mehrdeutig.', 'This sentence is ambiguous.'],
    ['die Kommunikation', 'communication', 'Gute Kommunikation ist in jedem Beruf wichtig.', 'Good communication is important in every job.'],
    ['formulieren', 'to formulate', 'Kannst du das klarer formulieren?', 'Can you formulate that more clearly?'],
    ['argumentieren', 'to argue / make a case', 'Er argumentiert immer sehr überzeugend.', 'He always argues very convincingly.'],
    ['der Dialekt', 'dialect', 'Der bayerische Dialekt ist für mich schwer zu verstehen.', 'The Bavarian dialect is hard for me to understand.'],
    ['die Muttersprache', 'mother tongue', 'Deutsch ist meine Muttersprache.', 'German is my mother tongue.'],
    ['das Missverständnis', 'misunderstanding', 'Das war ein großes Missverständnis.', 'That was a big misunderstanding.'],
    ['überzeugend', 'convincing', 'Seine Rede war sehr überzeugend.', 'His speech was very convincing.'],
    ['sachlich', 'factual / objective', 'Bitte bleib sachlich in der Diskussion.', 'Please stay factual in the discussion.'],
    ['widerlegen', 'to refute', 'Er konnte das Argument nicht widerlegen.', 'He could not refute the argument.'],
  ]},

  // ── 15. Meinung & Argumentation ─────────────────────────────────────────
  { id: 'B2_ARGUMENTATION', emoji: '💬', title: 'MEINUNG & ARGUMENTATION', level: 'B2', entries: [
    ['behaupten', 'to claim / assert', 'Er behauptet, das Problem gelöst zu haben.', 'He claims to have solved the problem.'],
    ['begründen', 'to justify / give reasons', 'Bitte begründe deine Aussage.', 'Please justify your statement.'],
    ['der Standpunkt', 'point of view', 'Ich verstehe deinen Standpunkt, teile ihn aber nicht.', 'I understand your point of view but don\'t share it.'],
    ['die Schlussfolgerung', 'conclusion', 'Welche Schlussfolgerung ziehst du daraus?', 'What conclusion do you draw from that?'],
    ['einräumen', 'to admit / concede', 'Ich räume ein, dass ich einen Fehler gemacht habe.', 'I concede that I made a mistake.'],
    ['widersprechen', 'to contradict', 'Ich muss dir in diesem Punkt widersprechen.', 'I must contradict you on this point.'],
    ['der Beweis', 'proof / evidence', 'Wo ist der Beweis für diese Behauptung?', 'Where is the proof for this claim?'],
    ['die Debatte', 'debate', 'Die Debatte wurde sehr hitzig geführt.', 'The debate was conducted very heatedly.'],
    ['einerseits … andererseits', 'on the one hand … on the other hand', 'Einerseits spart man Geld, andererseits verliert man Zeit.', 'On the one hand you save money, on the other you lose time.'],
    ['im Gegensatz dazu', 'in contrast to this', 'Im Gegensatz dazu ist die andere Methode günstiger.', 'In contrast to this, the other method is cheaper.'],
    ['zu bedenken ist', 'it should be noted that', 'Zu bedenken ist, dass nicht alle davon profitieren.', 'It should be noted that not everyone benefits from it.'],
    ['letztendlich', 'ultimately / in the end', 'Letztendlich muss jeder selbst entscheiden.', 'Ultimately everyone must decide for themselves.'],
  ]},

];

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
// Remove previously added B2 categories (idempotent)
const base = data.filter(c => c.level !== 'B2');
const built = cats.map(c => ({
  id: c.id, emoji: c.emoji, title: c.title, level: c.level,
  entries: c.entries.map(([w, t, de, en]) => ({ w, t, de, en })),
}));
const out = [...base, ...built];
fs.writeFileSync(FILE, JSON.stringify(out));
const words = built.reduce((s, c) => s + c.entries.length, 0);
console.log(`Added ${built.length} B2 categories (${words} words). Total categories: ${out.length}.`);
