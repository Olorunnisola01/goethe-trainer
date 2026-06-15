/* Dedup existing B2 + add Batch 3 (~600 more words across 30 categories) */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

function clean(w) {
  return w
    .replace(/,\s*["'“\-–][^\s,()]*(\s*\/\s*["'\-–][^\s,()]*)?/g, '')
    .replace(/\s*\(Sg\.\)/g, '').replace(/\s*\(Pl\.\)/g, '')
    .replace(/\s*\(ohne Artikel\)/g, '')
    .replace(/\s*\(\+\s*[DAG]\.\)/g, '')
    .replace(/\s*\([a-z]+\s*\+[^)]*\)/g, '')
    .trim();
}
function e(word, t, de, en) { return { w: clean(word), t, de, en }; }

let data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Deduplicate by id (keep first occurrence)
const seen = new Set();
data = data.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
console.log('After dedup:', data.length, 'total categories');

const newCats = [

  // ══ ARBEIT & KARRIERE VERTIEFUNG ═══════════════════════════════════
  { id:'B2_PRAKTIKUM_KARRIERE', emoji:'📋', title:'PRAKTIKUM & KARRIEREPLANUNG', level:'B2', entries:[
    e('das Praktikum','internship','Sie absolviert ein Praktikum bei einer Werbeagentur.','She is completing an internship at an advertising agency.'),
    e('absolvieren','to complete / do (a course/internship)','Er hat das Praktikum erfolgreich absolviert.','He successfully completed the internship.'),
    e('der Schulabschluss','school-leaving qualification','Ohne Schulabschluss hat man es schwer.','Without a school-leaving qualification things are difficult.'),
    e('die Karriereplanung','career planning','Eine gute Karriereplanung erleichtert den Einstieg.','Good career planning makes entry easier.'),
    e('die Praktikumszeit','internship period','Die Praktikumszeit hat mir sehr viel gebracht.','The internship period has taught me a lot.'),
    e('die Stellenausschreibung','job advertisement / posting','Sie hat auf die Stellenausschreibung reagiert.','She responded to the job advertisement.'),
    e('die Entwicklungsperspektive','development prospect','Das Unternehmen bietet gute Entwicklungsperspektiven.','The company offers good development prospects.'),
    e('das Aufgabengebiet','area of responsibility','Das Aufgabengebiet umfasst Marketing und Vertrieb.','The area of responsibility includes marketing and sales.'),
    e('die Arbeitsweise','way of working / work approach','Eine strukturierte Arbeitsweise ist gefragt.','A structured work approach is required.'),
    e('die Atmosphäre','atmosphere','Die Arbeitsatmosphäre im Team ist sehr gut.','The working atmosphere in the team is very good.'),
    e('erhoffen (sich)','to hope for','Was erhoffst du dir von dem neuen Job?','What do you hope for from the new job?'),
    e('bisherig','previous / up to now','In meiner bisherigen Tätigkeit war ich zufrieden.','In my previous activity I was satisfied.'),
    e('vertiefen','to deepen / consolidate','Ich möchte meine Kenntnisse vertiefen.','I would like to deepen my knowledge.'),
    e('umfangreich','extensive / comprehensive','Das Aufgabengebiet ist sehr umfangreich.','The area of responsibility is very extensive.'),
    e('die Anschrift','address / postal address','Tragen Sie bitte Ihre vollständige Anschrift ein.','Please enter your full postal address.'),
    e('die Betreffzeile','subject line','Achten Sie auf eine klare Betreffzeile in der E-Mail.','Pay attention to a clear subject line in the email.'),
    e('die Schlussformel','closing formula (letter)','Die Schlussformel eines Bewerbungsbriefs ist wichtig.','The closing formula of an application letter is important.'),
    e('arrogant','arrogant','Ein arrogantes Auftreten im Bewerbungsgespräch schadet.','An arrogant manner in the job interview is harmful.'),
    e('selbstbewusst','self-confident','Sei selbstbewusst, aber nicht arrogant.','Be self-confident but not arrogant.'),
    e('die Checkliste','checklist','Mach eine Checkliste für das Vorstellungsgespräch.','Make a checklist for the job interview.'),
  ]},

  // ══ SPRACHE & LINGUISTIK ══════════════════════════════════════════
  { id:'B2_LINGUISTIK', emoji:'🔤', title:'LINGUISTIK & SPRACHGEBRAUCH', level:'B2', entries:[
    e('lexikalisch','lexical','Das ist ein lexikalisches Problem, kein grammatisches.','That is a lexical problem, not a grammatical one.'),
    e('bilingual aufwachsen','to grow up bilingual','Sie ist bilingual aufgewachsen.','She grew up bilingual.'),
    e('der Sprachschatz','vocabulary / linguistic repertoire','Ihr Sprachschatz ist sehr reich.','Her vocabulary is very rich.'),
    e('der Dialekt','dialect','Der bayerische Dialekt ist für manche schwer zu verstehen.','The Bavarian dialect is hard for some to understand.'),
    e('die Alltagssprache','everyday language','In der Alltagssprache verwendet man viele Abkürzungen.','In everyday language many abbreviations are used.'),
    e('die Wissenschaftssprache','language of science','Die Wissenschaftssprache ist oft sehr abstrakt.','The language of science is often very abstract.'),
    e('die Bedeutungsnuance','nuance of meaning','Jede Sprache hat eigene Bedeutungsnuancen.','Every language has its own nuances of meaning.'),
    e('die Körpersprache','body language','Körpersprache verrät oft mehr als Worte.','Body language often reveals more than words.'),
    e('der Muttersprachler','native speaker','Als Muttersprachler übersetzt man natürlicher.','As a native speaker one translates more naturally.'),
    e('die Sprachpolitik','language policy','Die Sprachpolitik der EU ist komplex.','The EU\'s language policy is complex.'),
    e('die Kompetenz','competence','Sie verfügt über hohe kommunikative Kompetenz.','She has high communicative competence.'),
    e('mehrsprachig','multilingual','Mehrsprachige Menschen haben kognitive Vorteile.','Multilingual people have cognitive advantages.'),
    e('einsprachig','monolingual','In einer einsprachigen Umgebung lernt man langsamer.','In a monolingual environment one learns more slowly.'),
    e('die Interferenz','interference (linguistics)','Sprachliche Interferenz ist beim Lernen normal.','Linguistic interference is normal when learning.'),
    e('der Wortschatz','vocabulary','Erweitern Sie täglich Ihren Wortschatz.','Expand your vocabulary daily.'),
    e('die Muttersprache','mother tongue','Deutsch ist seine Muttersprache.','German is his mother tongue.'),
    e('nichtssagend','meaningless / bland','Die Antwort war nichtssagend.','The answer was bland.'),
    e('verwunderlich','astonishing / surprising','Es ist verwunderlich, dass er das nicht weiß.','It is surprising that he does not know that.'),
    e('ratsam','advisable','Es wäre ratsam, frühzeitig zu planen.','It would be advisable to plan early.'),
    e('witzig','funny / witty','Sein Vortrag war sehr witzig und unterhaltsam.','His talk was very funny and entertaining.'),
  ]},

  // ══ UMWELT & ENERGIE VERTIEFUNG ═══════════════════════════════════
  { id:'B2_ENERGIE_UMWELT', emoji:'⚡', title:'ENERGIE & UMWELTPOLITIK', level:'B2', entries:[
    e('das Kraftwerk','power station','Das Kraftwerk wird auf erneuerbare Energie umgestellt.','The power station is being switched to renewable energy.'),
    e('das Atomkraftwerk','nuclear power station','Das letzte Atomkraftwerk wurde abgeschaltet.','The last nuclear power station was shut down.'),
    e('die Atomenergie','nuclear energy','Über Atomenergie wird heftig diskutiert.','Nuclear energy is being hotly debated.'),
    e('die Prognose','prognosis / forecast','Die Klimaprognosen sind besorgniserregend.','The climate forecasts are alarming.'),
    e('der Damm','dam','Der Damm hält das Wasser zurück.','The dam holds back the water.'),
    e('das Plutonium','plutonium','Plutonium ist hochgiftig und radioaktiv.','Plutonium is highly toxic and radioactive.'),
    e('der Planet','planet','Wir müssen unseren Planeten schützen.','We must protect our planet.'),
    e('die Erderwärmung','global warming','Die Erderwärmung ist ein globales Problem.','Global warming is a global problem.'),
    e('die Plastiktüte','plastic bag','Plastiktüten sind in vielen Ländern verboten.','Plastic bags are banned in many countries.'),
    e('der Treibhauseffekt','greenhouse effect','Der Treibhauseffekt verstärkt sich zunehmend.','The greenhouse effect is intensifying increasingly.'),
    e('das Artensterben','extinction of species','Das Artensterben beschleunigt sich weltweit.','The extinction of species is accelerating worldwide.'),
    e('die Biodiversität','biodiversity','Biodiversität ist für das Ökosystem essenziell.','Biodiversity is essential for the ecosystem.'),
    e('die Emissionen','emissions','Die CO2-Emissionen müssen reduziert werden.','CO2 emissions must be reduced.'),
    e('erneuerbar','renewable','Erneuerbare Energien sind die Zukunft.','Renewable energies are the future.'),
    e('das Ökosystem','ecosystem','Das Ökosystem des Waldes ist sehr komplex.','The ecosystem of the forest is very complex.'),
    e('die Sonnenenergie','solar energy','Sonnenenergie wird immer erschwinglicher.','Solar energy is becoming increasingly affordable.'),
    e('der Ressourcenverbrauch','resource consumption','Der Ressourcenverbrauch muss drastisch sinken.','Resource consumption must decrease drastically.'),
    e('die Nachhaltigkeit','sustainability','Nachhaltigkeit muss in allen Bereichen gelten.','Sustainability must apply in all areas.'),
    e('die Klimazone','climate zone','Verschiedene Klimazonen haben verschiedene Flora.','Different climate zones have different flora.'),
    e('wegwerfen','to throw away / discard','Wir werfen zu viele Lebensmittel weg.','We throw away too many foodstuffs.'),
  ]},

  // ══ MEDIEN & JOURNALISMUS ═════════════════════════════════════════
  { id:'B2_JOURNALISMUS', emoji:'📰', title:'JOURNALISMUS & MEDIENSPRACHE', level:'B2', entries:[
    e('die Pressekonferenz','press conference','Auf der Pressekonferenz wurden Fragen gestellt.','Questions were asked at the press conference.'),
    e('die Berichterstattung','reporting / media coverage','Die Berichterstattung über den Krieg war intensiv.','Reporting on the war was intensive.'),
    e('der Pressesprecher','press spokesperson','Der Pressesprecher gab eine Erklärung ab.','The press spokesperson issued a statement.'),
    e('publizieren','to publish','Er hat mehrere Fachartikel publiziert.','He has published several specialist articles.'),
    e('veröffentlichen','to publish / release','Die Studie wurde gestern veröffentlicht.','The study was published yesterday.'),
    e('recherchieren','to research / investigate','Journalisten recherchieren sorgfältig.','Journalists research carefully.'),
    e('die Recherche','research / investigation','Die Recherche hat Monate gedauert.','The research took months.'),
    e('das Radiofeature','radio feature','Das Radiofeature behandelt das Thema Migration.','The radio feature deals with the topic of migration.'),
    e('kommentieren','to comment on','Er kommentiert die politischen Ereignisse täglich.','He comments on political events daily.'),
    e('der Feuilleton','arts / culture section','Im Feuilleton erscheint die Buchkritik.','The book review appears in the culture section.'),
    e('die Informationsfreiheit','freedom of information','Informationsfreiheit ist in Demokratien wichtig.','Freedom of information is important in democracies.'),
    e('der Leitartikel','leading article / editorial','Der Leitartikel kritisiert die Regierungspolitik.','The editorial criticises government policy.'),
    e('andeuten','to hint at / suggest','Er deutete an, dass es Probleme gibt.','He hinted that there are problems.'),
    e('erwähnen','to mention','Sie erwähnte beiläufig ihren neuen Job.','She casually mentioned her new job.'),
    e('der Sachtext','factual text / non-fiction text','Sachtexte erfordern eine andere Lesestrategie.','Factual texts require a different reading strategy.'),
    e('die Überschrift','headline / heading','Die Überschrift muss prägnant sein.','The headline must be concise.'),
    e('der Kommentar','comment / commentary','Sein Kommentar war sehr kritisch.','His commentary was very critical.'),
    e('die Medienkompetenz','media literacy','Medienkompetenz ist heute eine Schlüsselkompetenz.','Media literacy is a key competence today.'),
    e('der Algorithmus','algorithm','Algorithmen bestimmen, was wir in sozialen Medien sehen.','Algorithms determine what we see on social media.'),
    e('die Nachrichtenredaktion','news editorial team','Die Nachrichtenredaktion arbeitet rund um die Uhr.','The news editorial team works around the clock.'),
  ]},

  // ══ PSYCHOLOGIE & VERHALTEN ════════════════════════════════════════
  { id:'B2_PSYCHOLOGIE_VERHALTEN', emoji:'🧠', title:'PSYCHOLOGIE & MENSCHLICHES VERHALTEN', level:'B2', entries:[
    e('die Wahrnehmung','perception','Die Wahrnehmung der Realität ist subjektiv.','The perception of reality is subjective.'),
    e('die Kognition','cognition','Kognitive Prozesse laufen meist unbewusst ab.','Cognitive processes mostly run unconsciously.'),
    e('das Unterbewusstsein','subconscious','Viele Entscheidungen treffen wir im Unterbewusstsein.','We make many decisions in the subconscious.'),
    e('instinktiv','instinctive','Wir reagieren auf Gefahren oft instinktiv.','We often react to dangers instinctively.'),
    e('das Verhalten','behaviour','Das Verhalten des Kindes hat sich verändert.','The child\'s behaviour has changed.'),
    e('die Motivation','motivation','Intrinsische Motivation ist nachhaltiger als extrinsische.','Intrinsic motivation is more sustainable than extrinsic.'),
    e('das Selbstbild','self-image','Ein positives Selbstbild ist wichtig.','A positive self-image is important.'),
    e('die Persönlichkeit','personality','Jeder Mensch hat eine einzigartige Persönlichkeit.','Every person has a unique personality.'),
    e('die Empathie','empathy','Empathie ist die Fähigkeit, sich in andere einzufühlen.','Empathy is the ability to empathise with others.'),
    e('der Stress','stress','Chronischer Stress schadet der Gesundheit erheblich.','Chronic stress considerably harms health.'),
    e('die Belastung','strain / burden / load','Die psychische Belastung am Arbeitsplatz nimmt zu.','Psychological strain at the workplace is increasing.'),
    e('die Resilienz','resilience','Resilienz hilft, Krisen besser zu bewältigen.','Resilience helps to cope better with crises.'),
    e('das Wohlbefinden','wellbeing / wellbeing','Das Wohlbefinden der Mitarbeiter steht im Vordergrund.','The wellbeing of employees is the priority.'),
    e('die Überforderung','being overwhelmed','Überforderung führt oft zu Burnout.','Being overwhelmed often leads to burnout.'),
    e('bewältigen','to cope with / manage','Wie bewältigst du schwierige Situationen?','How do you cope with difficult situations?'),
    e('verdrängen','to suppress / repress','Man sollte Probleme nicht verdrängen.','One should not suppress problems.'),
    e('verarbeiten','to process (emotionally)','Sie hat das Erlebnis noch nicht verarbeitet.','She has not yet processed the experience.'),
    e('der Konflikt','conflict','Konflikte gehören zum Leben dazu.','Conflicts are part of life.'),
    e('die Therapie','therapy / treatment','Eine Therapie kann bei Depressionen helfen.','Therapy can help with depression.'),
    e('der Therapeut','therapist','Sie geht einmal pro Woche zum Therapeuten.','She goes to the therapist once a week.'),
  ]},

  // ══ WOHNEN & STADTENTWICKLUNG ══════════════════════════════════════
  { id:'B2_WOHNEN_STADT', emoji:'🏙️', title:'WOHNEN & STADTENTWICKLUNG', level:'B2', entries:[
    e('die Infrastruktur','infrastructure','Die Infrastruktur der Stadt muss modernisiert werden.','The infrastructure of the city must be modernised.'),
    e('die Stadtplanung','urban planning','Stadtplanung muss Grünflächen berücksichtigen.','Urban planning must take green spaces into account.'),
    e('die Gentrifizierung','gentrification','Die Gentrifizierung vertreibt ärmere Bewohner.','Gentrification displaces poorer residents.'),
    e('das Viertel','quarter / neighbourhood','Das Viertel hat sich in den letzten Jahren verändert.','The neighbourhood has changed in recent years.'),
    e('der Wohnungsmangel','housing shortage','In Großstädten herrscht akuter Wohnungsmangel.','There is an acute housing shortage in major cities.'),
    e('die Mietpreise','rental prices','Die Mietpreise steigen in vielen Städten rasant.','Rental prices are rising rapidly in many cities.'),
    e('das Gewerbegebiet','commercial/industrial area','Das neue Gewerbegebiet soll Arbeitsplätze schaffen.','The new commercial area should create jobs.'),
    e('die Barrierefreiheit','accessibility (for disabled)','Barrierefreiheit ist gesetzlich vorgeschrieben.','Accessibility is legally required.'),
    e('das Generationenwohnprojekt','intergenerational housing project','Generationenwohnprojekte fördern den Zusammenhalt.','Intergenerational housing projects promote cohesion.'),
    e('die Wohngemeinschaft','shared flat / house share','Viele Studierende wohnen in einer Wohngemeinschaft.','Many students live in a shared flat.'),
    e('die Eigentumswohnung','owner-occupied flat','Sie hat sich eine Eigentumswohnung gekauft.','She bought herself an owner-occupied flat.'),
    e('sanieren','to renovate / refurbish','Das alte Gebäude muss dringend saniert werden.','The old building urgently needs to be refurbished.'),
    e('die Nebenkosten','additional costs / service charges','Die Nebenkosten sind im Mietpreis enthalten.','Service charges are included in the rent.'),
    e('der Baulärm','construction noise','Der Baulärm macht das Arbeiten unmöglich.','The construction noise makes working impossible.'),
    e('das Stadtbild','cityscape / townscape','Das Stadtbild von Berlin ist sehr vielfältig.','The cityscape of Berlin is very diverse.'),
    e('der öffentliche Nahverkehr','public local transport','Der öffentliche Nahverkehr muss ausgebaut werden.','Public local transport must be expanded.'),
    e('die Aufwertung','upgrading / enhancement','Die Aufwertung des Stadtteils zieht neue Bewohner an.','The upgrading of the district attracts new residents.'),
    e('der Leerstand','vacancy / empty property','Leerstand in Innenstädten ist ein Problem.','Vacancy in city centres is a problem.'),
    e('nachhaltig bauen','to build sustainably','Immer mehr Unternehmen bauen nachhaltig.','More and more companies are building sustainably.'),
    e('die Grünfläche','green space','Grünflächen verbessern die Lebensqualität in Städten.','Green spaces improve the quality of life in cities.'),
  ]},

  // ══ BILDUNG & SCHULSYSTEM ══════════════════════════════════════════
  { id:'B2_BILDUNG_SCHULE', emoji:'🎓', title:'BILDUNG & SCHULSYSTEM', level:'B2', entries:[
    e('die Pädagogik','pedagogy / educational science','Die Pädagogik entwickelt neue Lehrmethoden.','Pedagogy develops new teaching methods.'),
    e('die Lehrmethode','teaching method','Moderne Lehrmethoden fördern kritisches Denken.','Modern teaching methods promote critical thinking.'),
    e('die Schulpflicht','compulsory schooling','In Deutschland gilt neunjährige Schulpflicht.','In Germany there is compulsory schooling for nine years.'),
    e('der Bildungsabschluss','educational qualification','Ein guter Bildungsabschluss öffnet Türen.','A good educational qualification opens doors.'),
    e('die Hochschulzulassung','university admission','Die Hochschulzulassung hängt von der Note ab.','University admission depends on the grade.'),
    e('das Stipendium','scholarship / grant','Sie hat ein Stipendium für ihr Studium erhalten.','She received a scholarship for her studies.'),
    e('der Lerneffekt','learning effect','Gruppenarbeit verstärkt den Lerneffekt.','Group work enhances the learning effect.'),
    e('die Hausaufgabe','homework','Hausaufgaben festigen das Gelernte.','Homework consolidates what has been learned.'),
    e('die Klausur','written exam / test','Die Klausur war sehr anspruchsvoll.','The written exam was very demanding.'),
    e('das Semester','semester','Im ersten Semester lernt man die Grundlagen.','In the first semester one learns the fundamentals.'),
    e('die Vorlesung','lecture (at university)','Die Vorlesung beginnt um neun Uhr.','The lecture begins at nine o\'clock.'),
    e('das Seminar','seminar','Im Seminar diskutieren wir aktuelle Forschung.','In the seminar we discuss current research.'),
    e('die Nachhilfe','private tuition','Sie gibt Nachhilfe in Mathematik.','She gives private tuition in mathematics.'),
    e('fördern','to support / promote (education)','Begabte Schüler muss man gezielt fördern.','Talented pupils must be specifically supported.'),
    e('die Bildungsreform','education reform','Die Bildungsreform soll Chancengleichheit verbessern.','The education reform is intended to improve equal opportunities.'),
    e('integrieren','to integrate','Geflüchtete Kinder werden in Regelklassen integriert.','Refugee children are integrated into regular classes.'),
    e('die Alphabetisierung','literacy / teaching to read and write','Alphabetisierungskurse helfen Erwachsenen.','Literacy courses help adults.'),
    e('der Bildungserfolg','educational success','Bildungserfolg hängt von vielen Faktoren ab.','Educational success depends on many factors.'),
    e('das Bachelor-Studium','bachelor\'s degree programme','Das Bachelor-Studium dauert drei Jahre.','The bachelor\'s degree programme lasts three years.'),
    e('die Bachelorarbeit','bachelor\'s thesis','Die Bachelorarbeit muss eigenständig verfasst werden.','The bachelor\'s thesis must be written independently.'),
  ]},

  // ══ KULTUR & INTERKULTURALITÄT ════════════════════════════════════
  { id:'B2_INTERKULTUR', emoji:'🌏', title:'INTERKULTURALITÄT & TRADITION', level:'B2', entries:[
    e('interkulturell','intercultural','Interkulturelle Kommunikation ist lernbar.','Intercultural communication can be learned.'),
    e('die Tradition','tradition','Traditionen verbinden Generationen miteinander.','Traditions connect generations with each other.'),
    e('die Bräuche','customs / traditions','Jedes Land hat eigene Bräuche und Feste.','Every country has its own customs and celebrations.'),
    e('das Hofzeremoniell','court ceremonial / protocol','Das Hofzeremoniell war sehr streng geregelt.','The court ceremonial was very strictly regulated.'),
    e('das Alltagsprodukt','everyday product','Alltagsprodukte spiegeln die Kultur wider.','Everyday products reflect the culture.'),
    e('der Sachverhalt','matter / state of affairs','Der Sachverhalt wurde ausführlich erläutert.','The matter was explained in detail.'),
    e('die Auffassung','view / opinion','Ich teile diese Auffassung nicht.','I do not share this view.'),
    e('geteilt (geteilter Meinung sein)','to be of divided opinion','Die Experten sind geteilter Meinung.','The experts are of divided opinion.'),
    e('hilfreich','helpful','Interkulturelle Kompetenz ist sehr hilfreich.','Intercultural competence is very helpful.'),
    e('nützlich','useful','Diese Informationen sind sehr nützlich.','This information is very useful.'),
    e('entscheidend','decisive / crucial','Sprachkenntnisse sind entscheidend für die Integration.','Language skills are crucial for integration.'),
    e('erstaunlich','astonishing / amazing','Es ist erstaunlich, wie ähnlich wir uns sind.','It is astonishing how similar we are.'),
    e('die Sicht','view / perspective','Aus meiner Sicht ist das die beste Lösung.','From my perspective that is the best solution.'),
    e('die Gemeinschaft','community','In einer starken Gemeinschaft fühlt man sich sicher.','In a strong community one feels safe.'),
    e('die Vielfalt','diversity','Kulturelle Vielfalt bereichert die Gesellschaft.','Cultural diversity enriches society.'),
    e('tolerant','tolerant','Eine tolerante Gesellschaft akzeptiert Unterschiede.','A tolerant society accepts differences.'),
    e('weltoffen','open-minded / cosmopolitan','Junge Leute sind heute oft weltoffener.','Young people today are often more cosmopolitan.'),
    e('der Vorurteil','prejudice','Vorurteile entstehen oft aus Unwissenheit.','Prejudices often arise from ignorance.'),
    e('das Klischee','cliché / stereotype','Klischees vereinfachen die Realität.','Clichés simplify reality.'),
    e('die Solidarität','solidarity','Internationale Solidarität ist wichtig.','International solidarity is important.'),
  ]},

  // ══ RECHT & GESETZ VERTIEFUNG ═════════════════════════════════════
  { id:'B2_RECHT_GESETZ', emoji:'⚖️', title:'RECHT & GESETZ VERTIEFT', level:'B2', entries:[
    e('das Gesetz','law','Das Gesetz gilt für alle Bürger.','The law applies to all citizens.'),
    e('die Gesetzgebung','legislation','Die Gesetzgebung muss reformiert werden.','The legislation must be reformed.'),
    e('die Verordnung','regulation / ordinance','Eine neue EU-Verordnung tritt in Kraft.','A new EU regulation is coming into force.'),
    e('das Strafrecht','criminal law','Das Strafrecht regelt Vergehen und Strafen.','Criminal law regulates offences and punishments.'),
    e('das Zivilrecht','civil law','Mietstreitigkeiten werden im Zivilrecht geregelt.','Tenancy disputes are regulated in civil law.'),
    e('die Klage','lawsuit / complaint','Sie hat eine Klage gegen den Arbeitgeber eingereicht.','She filed a lawsuit against the employer.'),
    e('der Anspruch','claim / entitlement','Sie hat einen Anspruch auf Schadensersatz.','She has a claim to compensation.'),
    e('klagen','to sue / take legal action','Er klagte gegen die Kündigung.','He took legal action against the dismissal.'),
    e('der Schadensersatz','compensation / damages','Das Unternehmen muss Schadensersatz zahlen.','The company must pay compensation.'),
    e('die Haftung','liability','Der Arbeitgeber trägt die Haftung.','The employer bears the liability.'),
    e('das Urteil','verdict / judgement','Das Urteil des Gerichts ist rechtskräftig.','The court\'s verdict is legally binding.'),
    e('verurteilen','to convict / sentence','Er wurde zu zwei Jahren verurteilt.','He was sentenced to two years.'),
    e('rechtskräftig','legally binding / final','Das Urteil ist rechtskräftig.','The judgement is legally binding.'),
    e('der Paragraph','paragraph / section (of law)','Paragraph 14 des Gesetzes ist relevant.','Paragraph 14 of the law is relevant.'),
    e('die Rechtsprechung','jurisdiction / case law','Die Rechtsprechung hat sich geändert.','Case law has changed.'),
    e('das Grundgesetz','Basic Law / Constitution','Das Grundgesetz schützt die Grundrechte.','The Basic Law protects fundamental rights.'),
    e('die Grundrechte','fundamental rights','Meinungsfreiheit gehört zu den Grundrechten.','Freedom of expression is one of the fundamental rights.'),
    e('die Menschenrechte','human rights','Menschenrechte gelten weltweit.','Human rights apply worldwide.'),
    e('die Rechtsstaatlichkeit','rule of law','Rechtsstaatlichkeit ist ein Grundprinzip der Demokratie.','The rule of law is a fundamental principle of democracy.'),
    e('das Gericht','court','Der Fall kommt vor Gericht.','The case is going to court.'),
  ]},

  // ══ GLOBALISIERUNG & WIRTSCHAFT ════════════════════════════════════
  { id:'B2_GLOBALISIERUNG', emoji:'🌐', title:'GLOBALISIERUNG & WELTWIRTSCHAFT', level:'B2', entries:[
    e('die Globalisierung','globalisation','Die Globalisierung verändert alle Lebensbereiche.','Globalisation changes all areas of life.'),
    e('die Freihandelszone','free trade zone','Die EU ist eine große Freihandelszone.','The EU is a large free trade zone.'),
    e('der Weltmarkt','world market','Das Unternehmen ist auf dem Weltmarkt tätig.','The company operates on the world market.'),
    e('die Lieferkette','supply chain','Die Lieferkette wurde durch die Krise unterbrochen.','The supply chain was disrupted by the crisis.'),
    e('der Protektionismus','protectionism','Protektionismus schadet dem Welthandel.','Protectionism harms world trade.'),
    e('das Handelsabkommen','trade agreement','Das Handelsabkommen soll Zölle abbauen.','The trade agreement is intended to reduce tariffs.'),
    e('die Währung','currency','Der Euro ist die gemeinsame Währung der EU.','The euro is the common currency of the EU.'),
    e('der Wechselkurs','exchange rate','Der Wechselkurs beeinflusst den Import.','The exchange rate influences imports.'),
    e('die Auslandsinvestition','foreign investment','Auslandsinvestitionen stärken die Wirtschaft.','Foreign investments strengthen the economy.'),
    e('die Bilanz','balance sheet / balance','Die Handelsbilanz ist positiv.','The trade balance is positive.'),
    e('das Bruttoinlandsprodukt','gross domestic product (GDP)','Das BIP ist im letzten Jahr gestiegen.','GDP rose last year.'),
    e('die Rezession','recession','Eine Rezession bedroht die Arbeitsplätze.','A recession threatens jobs.'),
    e('die Konjunktur','economic climate / business cycle','Die Konjunktur schwächelt derzeit.','The economic climate is currently weak.'),
    e('der Aufschwung','economic upturn / boom','Nach der Krise kam ein starker Aufschwung.','After the crisis came a strong upturn.'),
    e('die Wettbewerbsfähigkeit','competitiveness','Die Wettbewerbsfähigkeit der Branche sinkt.','The competitiveness of the sector is declining.'),
    e('der Wohlstand','prosperity / wealth','Wohlstand für alle ist ein politisches Ziel.','Prosperity for all is a political goal.'),
    e('die Ungleichheit','inequality','Wirtschaftliche Ungleichheit nimmt weltweit zu.','Economic inequality is increasing worldwide.'),
    e('das Schwellenland','emerging economy','China gilt als wichtiges Schwellenland.','China is regarded as an important emerging economy.'),
    e('die Entwicklungshilfe','development aid','Entwicklungshilfe soll nachhaltig wirken.','Development aid should have a lasting effect.'),
    e('die Rohstoffe','raw materials','Die Nachfrage nach Rohstoffen steigt.','Demand for raw materials is rising.'),
  ]},

  // ══ SOZIALER WANDEL ════════════════════════════════════════════════
  { id:'B2_SOZIALER_WANDEL', emoji:'🔄', title:'SOZIALER WANDEL & GESELLSCHAFT', level:'B2', entries:[
    e('der demografische Wandel','demographic change','Der demografische Wandel stellt neue Anforderungen.','Demographic change poses new demands.'),
    e('die Überalterung','ageing population','Die Überalterung der Gesellschaft ist ein Problem.','The ageing of society is a problem.'),
    e('der Generationenvertrag','intergenerational contract','Der Generationenvertrag sichert die Renten.','The intergenerational contract secures pensions.'),
    e('die Altersarmut','old-age poverty','Altersarmut trifft vor allem Frauen.','Old-age poverty affects women in particular.'),
    e('das Rentensystem','pension system','Das Rentensystem muss reformiert werden.','The pension system must be reformed.'),
    e('die Pflegebedürftigkeit','need for care','Die Pflegebedürftigkeit im Alter nimmt zu.','The need for care in old age is increasing.'),
    e('ehrenamtlich','voluntary / honorary','Ehrenamtliches Engagement ist wichtig für die Gesellschaft.','Voluntary commitment is important for society.'),
    e('die Zivilgesellschaft','civil society','Die Zivilgesellschaft spielt eine wichtige Rolle.','Civil society plays an important role.'),
    e('die Inklusion','inclusion','Inklusion bedeutet Teilhabe für alle.','Inclusion means participation for everyone.'),
    e('die Teilhabe','participation / inclusion','Soziale Teilhabe stärkt den Zusammenhalt.','Social participation strengthens cohesion.'),
    e('der Zusammenhalt','cohesion / solidarity','Gesellschaftlicher Zusammenhalt muss gepflegt werden.','Social cohesion must be nurtured.'),
    e('die Vielfalt','diversity','Gesellschaftliche Vielfalt ist eine Stärke.','Social diversity is a strength.'),
    e('der Wertewandel','change in values','Ein Wertewandel prägt die Gesellschaft.','A change in values shapes society.'),
    e('die Chancengleichheit','equal opportunities','Chancengleichheit ist ein Grundprinzip.','Equal opportunities are a fundamental principle.'),
    e('benachteiligen','to disadvantage / discriminate against','Armut benachteiligt Kinder in der Bildung.','Poverty disadvantages children in education.'),
    e('die Integration','integration','Gelungene Integration nutzt allen.','Successful integration benefits everyone.'),
    e('der Zuzug','influx / immigration','Der Zuzug in die Städte hält an.','The influx into the cities continues.'),
    e('der Abwanderung','emigration / population exodus','Die Abwanderung vom Land in die Stadt ist groß.','The exodus from the countryside to the city is large.'),
    e('die Urbanisierung','urbanisation','Die Urbanisierung schreitet weltweit voran.','Urbanisation is progressing worldwide.'),
    e('die Landflucht','rural exodus','Landflucht lässt Dörfer veröden.','Rural exodus causes villages to become desolate.'),
  ]},

  // ══ KÖRPER & SINNE ════════════════════════════════════════════════
  { id:'B2_KOERPER_SINNE', emoji:'🫀', title:'KÖRPER, SINNE & MEDIZIN', level:'B2', entries:[
    e('der Herzinfarkt','heart attack','Ein Herzinfarkt ist ein medizinischer Notfall.','A heart attack is a medical emergency.'),
    e('der Bluthochdruck','high blood pressure','Bluthochdruck erhöht das Herzinfarktrisiko.','High blood pressure increases the risk of a heart attack.'),
    e('das Organ','organ','Die inneren Organe arbeiten eng zusammen.','The internal organs work closely together.'),
    e('der Pulsschlag','pulse / heartbeat','Bei Aufregung erhöht sich der Pulsschlag.','With excitement the pulse rate increases.'),
    e('die Atmung','breathing / respiration','Eine ruhige Atmung beruhigt das Nervensystem.','Calm breathing calms the nervous system.'),
    e('der Blutdruck','blood pressure','Der Blutdruck sollte regelmäßig gemessen werden.','Blood pressure should be regularly measured.'),
    e('der Sauerstoffverbrauch','oxygen consumption','Sport erhöht den Sauerstoffverbrauch.','Sport increases oxygen consumption.'),
    e('das Schmerzempfinden','perception of pain','Das Schmerzempfinden ist sehr individuell.','The perception of pain is very individual.'),
    e('der Herzschlag','heartbeat','Musik beeinflusst den Herzschlag.','Music influences the heartbeat.'),
    e('chronisch','chronic','Chronische Rückenschmerzen sind verbreitet.','Chronic back pain is widespread.'),
    e('das Symptom','symptom','Die Symptome deuten auf eine Erkältung hin.','The symptoms point to a cold.'),
    e('die Diagnose','diagnosis','Eine frühe Diagnose erhöht die Heilungschancen.','An early diagnosis increases the chances of recovery.'),
    e('die Therapie','therapy','Die Therapie hat sehr geholfen.','The therapy helped a great deal.'),
    e('rehabilitieren','to rehabilitate','Er wurde nach dem Unfall erfolgreich rehabilitiert.','He was successfully rehabilitated after the accident.'),
    e('das Immunsystem','immune system','Ein starkes Immunsystem schützt vor Krankheiten.','A strong immune system protects against diseases.'),
    e('die Gelenkschmerzen','joint pain','Ältere Menschen leiden oft unter Gelenkschmerzen.','Older people often suffer from joint pain.'),
    e('der Schlaganfall','stroke','Nach dem Schlaganfall brauchte er Rehabilitation.','After the stroke he needed rehabilitation.'),
    e('die Nervenzelle','nerve cell','Gehirntraining stärkt die Nervenzellen.','Brain training strengthens the nerve cells.'),
    e('der Stoffwechsel','metabolism','Sport beschleunigt den Stoffwechsel.','Sport speeds up the metabolism.'),
    e('erträglich','bearable / tolerable','Mit dem Medikament sind die Schmerzen erträglich.','With the medication the pain is bearable.'),
  ]},

  // ══ TECHNIK & INNOVATION ══════════════════════════════════════════
  { id:'B2_TECHNIK_INNOVATION', emoji:'🚀', title:'TECHNIK & INNOVATION', level:'B2', entries:[
    e('die künstliche Intelligenz','artificial intelligence','Künstliche Intelligenz verändert die Arbeitswelt.','Artificial intelligence is changing the world of work.'),
    e('der Algorithmus','algorithm','Der Algorithmus lernt aus den Daten.','The algorithm learns from the data.'),
    e('die Digitalisierung','digitalisation','Die Digitalisierung erfasst alle Branchen.','Digitalisation is affecting all sectors.'),
    e('das maschinelle Lernen','machine learning','Maschinelles Lernen ist ein Teilgebiet der KI.','Machine learning is a subfield of AI.'),
    e('die Automatisierung','automation','Automatisierung ersetzt manche Arbeitsplätze.','Automation replaces some jobs.'),
    e('der Datenschutz','data protection','Datenschutz ist ein Grundrecht in der EU.','Data protection is a fundamental right in the EU.'),
    e('die Cybersicherheit','cybersecurity','Cybersicherheit ist für Unternehmen essenziell.','Cybersecurity is essential for companies.'),
    e('die Vernetzung','networking / interconnection','Die Vernetzung von Geräten heißt IoT.','The interconnection of devices is called IoT.'),
    e('das Internet der Dinge','Internet of Things','Das Internet der Dinge verändert den Alltag.','The Internet of Things is changing everyday life.'),
    e('der Quantencomputer','quantum computer','Quantencomputer werden die Rechenleistung revolutionieren.','Quantum computers will revolutionise computing power.'),
    e('die Blockchain','blockchain','Blockchain-Technologie ist transparent und sicher.','Blockchain technology is transparent and secure.'),
    e('die Start-up-Szene','start-up scene','Die Start-up-Szene in Berlin ist lebhaft.','The start-up scene in Berlin is lively.'),
    e('das Patent','patent','Die Erfindung wurde zum Patent angemeldet.','The invention was registered for a patent.'),
    e('die Innovation','innovation','Innovationen treiben den Fortschritt voran.','Innovations drive progress forward.'),
    e('disruptiv','disruptive','Smartphones waren eine disruptive Technologie.','Smartphones were a disruptive technology.'),
    e('der Prototyp','prototype','Der erste Prototyp wurde erfolgreich getestet.','The first prototype was successfully tested.'),
    e('skalierbar','scalable','Das Geschäftsmodell muss skalierbar sein.','The business model must be scalable.'),
    e('der Einsatz','use / deployment','Der Einsatz von KI in der Medizin wächst.','The use of AI in medicine is growing.'),
    e('die Forschung und Entwicklung','research and development','Investitionen in F&E sichern die Zukunft.','Investments in R&D secure the future.'),
    e('zukunftsweisend','forward-looking / pioneering','Das Projekt ist zukunftsweisend.','The project is forward-looking.'),
  ]},

  // ══ GRAMMATIK-STRUKTUREN B2 ════════════════════════════════════════
  { id:'B2_SATZSTRUKTUREN', emoji:'📐', title:'SATZSTRUKTUREN & GRAMMATISCHE BEGRIFFE', level:'B2', entries:[
    e('der Hauptsatz','main clause','Der Hauptsatz steht oft am Anfang.','The main clause often comes at the beginning.'),
    e('der Nebensatz','subordinate clause','Im Nebensatz steht das Verb am Ende.','In the subordinate clause the verb comes at the end.'),
    e('der Relativsatz','relative clause','Ein Relativsatz beschreibt ein Nomen genauer.','A relative clause describes a noun more precisely.'),
    e('der Infinitivsatz','infinitive clause','Ein Infinitivsatz hat kein eigenes Subjekt.','An infinitive clause has no subject of its own.'),
    e('die Konjunktion','conjunction','Konjunktionen verbinden Sätze.','Conjunctions connect sentences.'),
    e('die Präposition','preposition','Präpositionen regieren bestimmte Fälle.','Prepositions govern certain cases.'),
    e('das Partizip','participle','Das Partizip II wird im Perfekt gebraucht.','The past participle is used in the perfect tense.'),
    e('der Konjunktiv','subjunctive','Im Konjunktiv II drückt man Hypothesen aus.','In the subjunctive II one expresses hypotheses.'),
    e('das Passiv','passive voice','Das Passiv betont die Handlung, nicht den Handelnden.','The passive emphasises the action, not the actor.'),
    e('der Genitiv','genitive case','Der Genitiv zeigt Besitz an.','The genitive case indicates possession.'),
    e('die Wortstellung','word order','Die Wortstellung im Deutschen ist komplex.','Word order in German is complex.'),
    e('die Verneinung','negation','Mit "nicht" oder "kein" verneint man Sätze.','Sentences are negated with "nicht" or "kein".'),
    e('der Artikel','article','Im Deutschen gibt es bestimmte und unbestimmte Artikel.','In German there are definite and indefinite articles.'),
    e('das Adjektiv','adjective','Adjektive passen sich dem Nomen an.','Adjectives agree with the noun.'),
    e('das Adverb','adverb','Adverbien beschreiben Verben oder Adjektive.','Adverbs describe verbs or adjectives.'),
    e('die Steigerung','comparison / gradation','Es gibt drei Steigerungsstufen: positiv, komparativ, superlativ.','There are three degrees of comparison: positive, comparative, superlative.'),
    e('die Kongruenz','agreement (grammar)','Kongruenz bedeutet grammatische Übereinstimmung.','Agreement means grammatical concordance.'),
    e('die Deklination','declension','Im Deutschen gibt es vier Fälle in der Deklination.','In German there are four cases in declension.'),
    e('die Konjugation','conjugation','Die Konjugation der Verben ist komplex.','The conjugation of verbs is complex.'),
    e('die Wortbildung','word formation','Deutsche Komposita entstehen durch Wortbildung.','German compound words are formed through word formation.'),
  ]},
];

// Clean all new entries
newCats.forEach(cat => {
  cat.entries = cat.entries.map(entry => ({ ...entry, w: clean(entry.w) }));
});

const out = [...data, ...newCats];
fs.writeFileSync(FILE, JSON.stringify(out));

const newTotal = newCats.reduce((s, c) => s + c.entries.length, 0);
const b2Cats = out.filter(c => c.level === 'B2');
const b2Words = b2Cats.reduce((s, c) => s + c.entries.length, 0);
console.log(`Added ${newCats.length} new B2 categories (${newTotal} words).`);
console.log(`B2 total: ${b2Cats.length} categories, ${b2Words} words.`);
