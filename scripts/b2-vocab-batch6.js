/* Fix ALL remaining dirty word entries + add Batch 6 (~300 more words) */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

function clean(w) {
  return w
    // Remove ALL parenthetical groups containing + or case letters: (mit + D.), (für + A.), (gegenüber + D.) etc.
    .replace(/\s*\([^)]*\+[^)]*\)/g, '')
    // Remove parentheticals with single uppercase case letter: (D.), (A.), (G.)
    .replace(/\s*\([DAG]\.\)/g, '')
    // Remove (Sg.) and (Pl.)
    .replace(/\s*\(Sg\.\)/g, '')
    .replace(/\s*\(Pl\.\)/g, '')
    // Remove (ohne Artikel)
    .replace(/\s*\(ohne Artikel\)/g, '')
    // Remove plural forms: ", -en" / ", -n" / ", -s" / ", -e" / ', "-e' / ', "-er' / ', -"e' etc.
    .replace(/,\s*["'“„\-–][^\s,()]{0,10}(\s*\/\s*["'“„\-–][^\s,()]{0,15})?/g, '')
    // Remove trailing comma if left
    .replace(/,\s*$/, '')
    .trim();
}

function e(w, t, de, en) { return { w: clean(w), t, de, en }; }

let data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Deduplicate
const seen = new Set();
data = data.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });

// Fix ALL existing entries across ALL levels
let fixed = 0;
data.forEach(cat => {
  cat.entries.forEach(entry => {
    const cleaned = clean(entry.w);
    if (cleaned !== entry.w) { entry.w = cleaned; fixed++; }
  });
});
console.log(`Fixed ${fixed} dirty word entries across all categories.`);

// ── Verify no dirty entries remain ─────────────────────────────────
const b2 = data.filter(c => c.level === 'B2');
const stillDirty = [];
b2.forEach(c => c.entries.forEach(e => {
  if (/\+\s*[DAG]|\(Sg\.\)|\(Pl\.\)|,\s*[-"]/.test(e.w)) stillDirty.push(e.w);
}));
console.log('Still dirty after fix:', stillDirty.length, stillDirty.slice(0,5));

// ── Batch 6: 300 more words ─────────────────────────────────────────
const cats = [

  { id:'B2_STADTLEBEN_KULTUR', emoji:'🏙️', title:'STADTLEBEN & URBANE KULTUR', level:'B2', entries:[
    e('die Großstadt','major city','In der Großstadt pulsiert das Leben.','Life pulses in the major city.'),
    e('das Stadtquartier','city quarter / urban district','Das Stadtquartier wurde aufgewertet.','The city quarter was upgraded.'),
    e('die Nachbarschaft','neighbourhood','In einer guten Nachbarschaft kennt man sich.','In a good neighbourhood people know each other.'),
    e('die Gemeinschaft','community','Eine aktive Gemeinschaft macht ein Quartier lebendig.','An active community makes a quarter lively.'),
    e('das Straßenfest','street festival','Beim Straßenfest feiern alle zusammen.','At the street festival everyone celebrates together.'),
    e('der öffentliche Raum','public space','Öffentliche Räume gehören allen Bürgern.','Public spaces belong to all citizens.'),
    e('die Gentrifizierung','gentrification','Gentrifizierung vertreibt ärmere Bewohner aus ihren Vierteln.','Gentrification displaces poorer residents from their neighbourhoods.'),
    e('die Urbanisierung','urbanisation','Urbanisierung ist ein weltweites Phänomen.','Urbanisation is a worldwide phenomenon.'),
    e('die Subkultur','subculture','Jede Stadt hat ihre eigene Subkultur.','Every city has its own subculture.'),
    e('die Kreativwirtschaft','creative industries','Die Kreativwirtschaft belebt Städte.','The creative industries enliven cities.'),
    e('das Coworking Space','coworking space','In Coworking Spaces arbeiten Freiberufler zusammen.','Freelancers work together in coworking spaces.'),
    e('das Café','café','Das Café ist ein wichtiger sozialer Treffpunkt.','The café is an important social meeting point.'),
    e('das Kulturzentrum','cultural centre','Im Kulturzentrum finden regelmäßig Veranstaltungen statt.','Events take place regularly at the cultural centre.'),
    e('die Fußgängerzone','pedestrian zone','In der Fußgängerzone ist kein Autoverkehr erlaubt.','No car traffic is allowed in the pedestrian zone.'),
    e('der Marktplatz','market square','Der Marktplatz ist das Herz der Altstadt.','The market square is the heart of the old town.'),
    e('die Stadtbibliothek','city library','In der Stadtbibliothek gibt es Tausende Bücher.','The city library has thousands of books.'),
    e('das Freizeitangebot','leisure provision / recreational offering','Das Freizeitangebot der Stadt ist vielfältig.','The city\'s leisure provision is diverse.'),
    e('die Veranstaltungshalle','event hall / venue','In der Veranstaltungshalle finden Konzerte statt.','Concerts take place in the event hall.'),
    e('das Grünflächenprogramm','green space programme','Das Grünflächenprogramm macht die Stadt lebenswerter.','The green space programme makes the city more liveable.'),
    e('die Verkehrsberuhigung','traffic calming','Verkehrsberuhigung verbessert die Lebensqualität.','Traffic calming improves the quality of life.'),
  ]},

  { id:'B2_WIRTSCHAFTSPOLITIK', emoji:'📊', title:'WIRTSCHAFTSPOLITIK & KONJUNKTUR', level:'B2', entries:[
    e('die Konjunktur','economic cycle / business cycle','Die Konjunktur schwächelt derzeit.','The economic cycle is currently weak.'),
    e('die Rezession','recession','In einer Rezession steigt die Arbeitslosigkeit.','In a recession unemployment rises.'),
    e('der Aufschwung','economic upturn','Nach der Krise folgte ein starker Aufschwung.','After the crisis a strong upturn followed.'),
    e('die Fiskalpolitik','fiscal policy','Fiskalpolitik steuert Ausgaben und Einnahmen des Staates.','Fiscal policy steers state expenditure and revenue.'),
    e('die Geldpolitik','monetary policy','Die EZB betreibt eine lockere Geldpolitik.','The ECB is pursuing a loose monetary policy.'),
    e('das Wachstum','growth','Wirtschaftswachstum ist kein Selbstzweck.','Economic growth is not an end in itself.'),
    e('die Globalisierung','globalisation','Die Globalisierung schafft Gewinner und Verlierer.','Globalisation creates winners and losers.'),
    e('der Freihandel','free trade','Freihandel fördert den wirtschaftlichen Austausch.','Free trade promotes economic exchange.'),
    e('die Deregulierung','deregulation','Deregulierung kann Wachstum fördern.','Deregulation can promote growth.'),
    e('die Regulierung','regulation','Mehr Regulierung schützt Verbraucher.','More regulation protects consumers.'),
    e('das Wirtschaftswunder','economic miracle','Das Wirtschaftswunder der Nachkriegszeit ist bekannt.','The post-war economic miracle is well known.'),
    e('der Protektionismus','protectionism','Protektionismus schadet dem globalen Handel.','Protectionism harms global trade.'),
    e('das Haushaltsdefizit','budget deficit','Das Haushaltsdefizit muss abgebaut werden.','The budget deficit must be reduced.'),
    e('die Staatsverschuldung','national debt / government debt','Hohe Staatsverschuldung schränkt politischen Handlungsspielraum ein.','High national debt limits political room to manoeuvre.'),
    e('die Wirtschaftspolitik','economic policy','Die Wirtschaftspolitik der Regierung ist umstritten.','The government\'s economic policy is controversial.'),
    e('die Standortpolitik','location policy / business location policy','Standortpolitik soll Unternehmen anziehen.','Location policy is intended to attract companies.'),
    e('die Lieferkette','supply chain','Gestörte Lieferketten erhöhen die Preise.','Disrupted supply chains increase prices.'),
    e('das Wirtschaftswachstum','economic growth','Nachhaltiges Wirtschaftswachstum ist das Ziel.','Sustainable economic growth is the goal.'),
    e('der Binnenmarkt','single market / domestic market','Der europäische Binnenmarkt gilt seit 1993.','The European single market has been in force since 1993.'),
    e('die Exportwirtschaft','export economy','Deutschland ist stark von der Exportwirtschaft abhängig.','Germany is heavily dependent on the export economy.'),
  ]},

  { id:'B2_KOMMUNIKATION_BERUF', emoji:'💼', title:'KOMMUNIKATION IM BERUF', level:'B2', entries:[
    e('die Geschäftskorrespondenz','business correspondence','Formelle Geschäftskorrespondenz folgt bestimmten Regeln.','Formal business correspondence follows certain rules.'),
    e('das Protokoll','minutes / protocol','Das Protokoll der Sitzung liegt vor.','The minutes of the meeting are available.'),
    e('die Tagesordnung','agenda','Die Tagesordnung umfasst fünf Punkte.','The agenda covers five points.'),
    e('der Bericht','report','Der Bericht fasst die wichtigsten Ergebnisse zusammen.','The report summarises the most important results.'),
    e('die Präsentation','presentation','Die Präsentation überzeugte die Kunden.','The presentation convinced the clients.'),
    e('die Verhandlung','negotiation','Die Verhandlung dauerte drei Stunden.','The negotiation lasted three hours.'),
    e('das Protokoll führen','to take minutes','Wer führt heute das Protokoll?','Who is taking the minutes today?'),
    e('der Vermerk','memo / note','Ein Vermerk über das Gespräch wurde erstellt.','A note about the conversation was drawn up.'),
    e('das Anschreiben','covering letter / letter of application','Das Anschreiben muss präzise und klar sein.','The covering letter must be precise and clear.'),
    e('die Besprechung','meeting / discussion','Die Besprechung findet um 10 Uhr statt.','The meeting takes place at 10 o\'clock.'),
    e('die Agenda','agenda','Bitte halten Sie sich an die Agenda.','Please stick to the agenda.'),
    e('das Feedback geben','to give feedback','Nach dem Projekt wurde ausführlich Feedback gegeben.','After the project extensive feedback was given.'),
    e('das Brainstorming','brainstorming','Beim Brainstorming sind alle Ideen willkommen.','In brainstorming all ideas are welcome.'),
    e('die Zusammenarbeit','cooperation / collaboration','Die Zusammenarbeit im Team war sehr effektiv.','The cooperation in the team was very effective.'),
    e('delegieren','to delegate','Eine gute Führungskraft delegiert Aufgaben.','A good manager delegates tasks.'),
    e('priorisieren','to prioritise','In stressigen Zeiten muss man priorisieren.','In stressful times one must prioritise.'),
    e('das Konzept erarbeiten','to develop a concept','Das Team erarbeitete ein neues Konzept.','The team developed a new concept.'),
    e('die Deadline einhalten','to meet a deadline','Wir müssen die Deadline unbedingt einhalten.','We must absolutely meet the deadline.'),
    e('die Zielsetzung','setting of objectives / goal-setting','Klare Zielsetzung ist die Basis guter Arbeit.','Clear goal-setting is the basis of good work.'),
    e('die Ergebnissicherung','securing of results','Die Ergebnissicherung erfolgt durch das Protokoll.','The securing of results is carried out through the minutes.'),
  ]},

  { id:'B2_GESUNDHEITSSYSTEM', emoji:'🏥', title:'GESUNDHEITSSYSTEM & VERSORGUNG', level:'B2', entries:[
    e('das Gesundheitssystem','healthcare system','Das Gesundheitssystem steht vor großen Herausforderungen.','The healthcare system faces great challenges.'),
    e('die Zweiklassenmedizin','two-tier medicine','Zweiklassenmedizin ist ethisch problematisch.','Two-tier medicine is ethically problematic.'),
    e('die Kassenarzt','panel doctor / NHS doctor','Beim Kassenarzt wartet man oft lange.','One often waits a long time at the panel doctor\'s.'),
    e('der Privatarzt','private doctor','Ein Privatarzt hat kürzere Wartezeiten.','A private doctor has shorter waiting times.'),
    e('die Wartezeit','waiting time','Die Wartezeit beim Facharzt kann Monate dauern.','The waiting time at the specialist can last months.'),
    e('das Krankenhaus','hospital','Das Krankenhaus wurde modernisiert.','The hospital was modernised.'),
    e('die Notaufnahme','emergency department / A&E','In der Notaufnahme werden Notfälle behandelt.','Emergencies are treated in the emergency department.'),
    e('der Fachspezialist','specialist / consultant','Der Fachspezialist konnte das Problem lösen.','The specialist was able to solve the problem.'),
    e('die Prävention','prevention','In Prävention zu investieren spart Kosten.','Investing in prevention saves costs.'),
    e('der Hausarzt','general practitioner / family doctor','Der Hausarzt ist die erste Anlaufstelle.','The GP is the first point of contact.'),
    e('die Überweisung','referral (to specialist)','Mit der Überweisung geht man zum Facharzt.','With the referral one goes to the specialist.'),
    e('das Rezept','prescription','Das Rezept löst man in der Apotheke ein.','The prescription is filled at the pharmacy.'),
    e('die Krankmeldung','sick note / medical certificate','Sie reichte eine Krankmeldung beim Arbeitgeber ein.','She submitted a sick note to the employer.'),
    e('der Pflegegrad','level of care','Der Pflegegrad bestimmt die Leistungen.','The level of care determines the benefits.'),
    e('die Gesundheitsvorsorge','healthcare / health prevention','Gesundheitsvorsorge beginnt mit gesunder Ernährung.','Healthcare begins with healthy nutrition.'),
    e('die Arztpraxis','medical practice / doctor\'s surgery','In der Arztpraxis wartet man oft lang.','One often waits a long time at the medical practice.'),
    e('die Pharmaindustrie','pharmaceutical industry','Die Pharmaindustrie entwickelt neue Medikamente.','The pharmaceutical industry develops new medicines.'),
    e('die Impfung','vaccination','Impfungen schützen vor gefährlichen Krankheiten.','Vaccinations protect against dangerous diseases.'),
    e('die Telemedizin','telemedicine','Telemedizin macht Arztbesuche manchmal überflüssig.','Telemedicine sometimes makes doctor visits unnecessary.'),
    e('das Gesundheitsamt','public health office','Das Gesundheitsamt überwacht die Hygienevorschriften.','The public health office monitors hygiene regulations.'),
  ]},

  { id:'B2_GESELLSCHAFT_WERTE', emoji:'⚖️', title:'GESELLSCHAFTLICHE WERTE & NORMEN', level:'B2', entries:[
    e('der Wert','value / principle','Gemeinsame Werte sind die Basis einer Gesellschaft.','Shared values are the basis of a society.'),
    e('die Norm','norm / standard','Soziale Normen regeln das Zusammenleben.','Social norms regulate living together.'),
    e('die Konvention','convention','Gesellschaftliche Konventionen ändern sich.','Social conventions change.'),
    e('der Konsens','consensus','Ein gesellschaftlicher Konsens ist schwer zu finden.','A social consensus is hard to find.'),
    e('die Zivilcourage','civic courage','Zivilcourage bedeutet, für das Richtige einzustehen.','Civic courage means standing up for what is right.'),
    e('das Ehrenamt','voluntary work','Das Ehrenamt stärkt den gesellschaftlichen Zusammenhalt.','Voluntary work strengthens social cohesion.'),
    e('die Solidarität','solidarity','Solidarität ist besonders in Krisen wichtig.','Solidarity is especially important in crises.'),
    e('die Gemeinwohl','common good','Politik soll dem Gemeinwohl dienen.','Politics should serve the common good.'),
    e('die Gleichberechtigung','equal rights','Gleichberechtigung ist noch nicht überall erreicht.','Equal rights have not yet been achieved everywhere.'),
    e('die Menschenwürde','human dignity','Die Menschenwürde ist unantastbar.','Human dignity is inviolable.'),
    e('die Toleranz','tolerance','Toleranz ist die Grundlage des Zusammenlebens.','Tolerance is the foundation of living together.'),
    e('die Akzeptanz','acceptance','Akzeptanz gegenüber Andersdenkenden ist wichtig.','Acceptance of those who think differently is important.'),
    e('der Gemeinsinn','public spirit / civic mindedness','Gemeinsinn fördert das Zusammenleben.','Public spirit promotes living together.'),
    e('die Verantwortung übernehmen','to take on responsibility','Wer Macht hat, muss Verantwortung übernehmen.','Whoever has power must take on responsibility.'),
    e('das Miteinander','togetherness / living together','Ein respektvolles Miteinander ist möglich.','A respectful togetherness is possible.'),
    e('der soziale Zusammenhalt','social cohesion','Sozialer Zusammenhalt schützt vor Radikalisierung.','Social cohesion protects against radicalisation.'),
    e('die Inklusion','inclusion','Inklusion bedeutet, niemanden auszugrenzen.','Inclusion means not excluding anyone.'),
    e('der Pluralismus','pluralism','Pluralismus akzeptiert verschiedene Meinungen.','Pluralism accepts different opinions.'),
    e('die demokratische Kultur','democratic culture','Demokratische Kultur muss gelernt werden.','Democratic culture must be learned.'),
    e('die Zivilgesellschaft','civil society','Eine starke Zivilgesellschaft kontrolliert die Macht.','A strong civil society controls power.'),
  ]},

  { id:'B2_SPRACHERWERB_THEORIE', emoji:'🧠', title:'SPRACHERWERBSTHEORIEN & KOGNITION', level:'B2', entries:[
    e('der Spracherwerb','language acquisition','Frühkindlicher Spracherwerb verläuft unbewusst.','Early childhood language acquisition occurs unconsciously.'),
    e('die Erstsprache','first language','Die Erstsprache beeinflusst alle weiteren Sprachen.','The first language influences all subsequent languages.'),
    e('die Zweitsprache','second language','Deutsch ist für viele eine Zweitsprache.','German is a second language for many.'),
    e('die Fremdsprachendidaktik','foreign language pedagogy','Fremdsprachendidaktik erforscht effektive Lehrmethoden.','Foreign language pedagogy researches effective teaching methods.'),
    e('das implizite Lernen','implicit learning','Kleinkinder lernen Sprache implizit.','Small children learn language implicitly.'),
    e('das explizite Lernen','explicit learning','Grammatikregeln werden oft explizit gelehrt.','Grammar rules are often taught explicitly.'),
    e('die Transferstrategie','transfer strategy','Lerner nutzen Transferstrategien aus der Erstsprache.','Learners use transfer strategies from the first language.'),
    e('die kognitive Belastung','cognitive load','Zu viel neue Information erzeugt kognitive Belastung.','Too much new information creates cognitive load.'),
    e('die Sprachbewusstheit','language awareness','Sprachbewusstheit fördert das Sprachenlernen.','Language awareness promotes language learning.'),
    e('das Arbeitsgedächtnis','working memory','Das Arbeitsgedächtnis spielt beim Lernen eine zentrale Rolle.','Working memory plays a central role in learning.'),
    e('die Interferenz','interference (between languages)','Interferenz zwischen Sprachen kann Fehler verursachen.','Interference between languages can cause errors.'),
    e('der Transfer','transfer (positive/negative)','Positiver Transfer erleichtert das Lernen neuer Sprachen.','Positive transfer facilitates learning new languages.'),
    e('die Lernstrategie','learning strategy','Effektive Lernstrategien verbessern den Lernerfolg.','Effective learning strategies improve learning success.'),
    e('die Motivation','motivation (language learning)','Motivation ist der wichtigste Faktor beim Sprachenlernen.','Motivation is the most important factor in language learning.'),
    e('das Sprachbad','language immersion / language bath','Ein Sprachbad beschleunigt den Erwerb.','A language immersion accelerates acquisition.'),
    e('die kommunikative Kompetenz','communicative competence','Kommunikative Kompetenz ist das Ziel des Sprachunterrichts.','Communicative competence is the goal of language teaching.'),
    e('die interlinguistik','interlinguistics','Interlinguistik untersucht Plansprachen wie Esperanto.','Interlinguistics studies planned languages like Esperanto.'),
    e('der Sprachcontact','language contact','Durch Sprachkontakt entstehen neue Varianten.','New variants emerge through language contact.'),
    e('der Code-Switching','code-switching','Code-Switching ist bei Mehrsprachigen normal.','Code-switching is normal for multilingual people.'),
    e('die Fossilisierung','fossilisation (language)','Fossilisierung bedeutet, Fehler beizubehalten.','Fossilisation means retaining errors.'),
  ]},

  { id:'B2_GLOBALE_HERAUSFORDERUNGEN', emoji:'🌐', title:'GLOBALE HERAUSFORDERUNGEN', level:'B2', entries:[
    e('die globale Erwärmung','global warming','Die globale Erwärmung überschreitet kritische Grenzen.','Global warming is exceeding critical limits.'),
    e('der Klimanotstand','climate emergency','Viele Städte riefen den Klimanotstand aus.','Many cities declared a climate emergency.'),
    e('die Wasserknappheit','water scarcity','Wasserknappheit bedroht Milliarden Menschen.','Water scarcity threatens billions of people.'),
    e('die Nahrungsmittelkrise','food crisis','Eine globale Nahrungsmittelkrise zeichnet sich ab.','A global food crisis is emerging.'),
    e('der Ressourcenkonflikt','resource conflict','Ressourcenkonflikte werden durch Klimawandel verschärft.','Resource conflicts are intensified by climate change.'),
    e('die Überbevölkerung','overpopulation','Überbevölkerung belastet natürliche Ressourcen.','Overpopulation burdens natural resources.'),
    e('die Pandemie','pandemic','Eine Pandemie kann die ganze Welt betreffen.','A pandemic can affect the whole world.'),
    e('die internationale Zusammenarbeit','international cooperation','Globale Probleme erfordern internationale Zusammenarbeit.','Global problems require international cooperation.'),
    e('die nachhaltige Entwicklung','sustainable development','Nachhaltige Entwicklung schützt künftige Generationen.','Sustainable development protects future generations.'),
    e('die Entwicklungsziele','development goals (SDGs)','Die UN-Entwicklungsziele sollen Armut bekämpfen.','The UN development goals are intended to combat poverty.'),
    e('das Kyoto-Protokoll','Kyoto Protocol','Das Kyoto-Protokoll war ein erster Schritt.','The Kyoto Protocol was a first step.'),
    e('das Pariser Abkommen','Paris Agreement','Das Pariser Abkommen zielt auf 1,5 Grad.','The Paris Agreement aims for 1.5 degrees.'),
    e('die CO2-Neutralität','carbon neutrality','CO2-Neutralität bis 2050 ist das Ziel.','Carbon neutrality by 2050 is the goal.'),
    e('die Entwaldung','deforestation','Entwaldung zerstört wichtige Ökosysteme.','Deforestation destroys important ecosystems.'),
    e('der Meeresspiegel','sea level','Steigende Meeresspiegel bedrohen Küstengebiete.','Rising sea levels threaten coastal areas.'),
    e('die Extremwetterereignis','extreme weather event','Extremwetterereignisse werden häufiger und stärker.','Extreme weather events are becoming more frequent and stronger.'),
    e('der Treibhausgas','greenhouse gas','Treibhausgase heizen das Klima auf.','Greenhouse gases heat up the climate.'),
    e('die erneuerbare Energie','renewable energy','Erneuerbare Energien sind der Schlüssel zur Klimaneutralität.','Renewable energies are the key to climate neutrality.'),
    e('die Energiesicherheit','energy security','Energiesicherheit ist politisch relevant.','Energy security is politically relevant.'),
    e('die Dekarbonisierung','decarbonisation','Die Dekarbonisierung der Wirtschaft ist dringend.','The decarbonisation of the economy is urgent.'),
  ]},

  { id:'B2_ARBEIT_WANDEL', emoji:'🔧', title:'WANDEL DER ARBEITSWELT', level:'B2', entries:[
    e('die Digitalisierung der Arbeit','digitalisation of work','Die Digitalisierung der Arbeit schafft neue Berufe.','The digitalisation of work creates new professions.'),
    e('die Automatisierung','automation','Automatisierung verdrängt repetitive Tätigkeiten.','Automation displaces repetitive activities.'),
    e('der Fachkräftemangel','shortage of skilled workers','Der Fachkräftemangel ist ein wirtschaftliches Problem.','The shortage of skilled workers is an economic problem.'),
    e('das lebenslanges Lernen','lifelong learning','Lebenslanges Lernen ist im digitalen Zeitalter unverzichtbar.','Lifelong learning is indispensable in the digital age.'),
    e('die Umschulung','retraining','Umschulung hilft, neue Berufe zu ergreifen.','Retraining helps to take up new professions.'),
    e('die Quereinsteiger','career changer / lateral entrant','Quereinsteiger bringen neue Perspektiven.','Career changers bring new perspectives.'),
    e('der Plattformarbeit','platform work / gig economy work','Plattformarbeit ist flexibel, aber oft unsicher.','Platform work is flexible but often insecure.'),
    e('die Gig Economy','gig economy','In der Gig Economy sind viele Selbstständige tätig.','Many self-employed people operate in the gig economy.'),
    e('die Kurzarbeit','short-time work / furlough','In der Krise nutzte die Firma Kurzarbeit.','In the crisis the company used short-time work.'),
    e('das Grundeinkommen','basic income','Das bedingungslose Grundeinkommen wird diskutiert.','Unconditional basic income is being discussed.'),
    e('die Viertagewoche','four-day working week','Die Viertagewoche wird in manchen Ländern getestet.','The four-day working week is being tested in some countries.'),
    e('die Arbeitnehmerrechte','workers\' rights','Arbeitnehmerrechte müssen geschützt werden.','Workers\' rights must be protected.'),
    e('der Betriebsrat','works council','Der Betriebsrat vertritt die Interessen der Mitarbeiter.','The works council represents the interests of employees.'),
    e('das Homeoffice','working from home / home office','Homeoffice ist bei vielen Firmen standard.','Working from home is standard in many companies.'),
    e('die Work-Life-Balance','work-life balance','Eine gute Work-Life-Balance ist wichtig für die Gesundheit.','A good work-life balance is important for health.'),
    e('der Berufsausstieg','career exit / stepping back from career','Nach dem Burnout erwog er den Berufsausstieg.','After the burnout he considered stepping back from his career.'),
    e('die Arbeitszeitregelung','working hours regulation','Klare Arbeitszeitregelungen schützen Beschäftigte.','Clear working hours regulations protect employees.'),
    e('das Modell der Arbeitsteilung','model of division of labour','Das Modell der Arbeitsteilung verändert sich.','The model of division of labour is changing.'),
    e('die Qualifizierung','qualification / training','Laufende Qualifizierung sichert Beschäftigung.','Ongoing qualification secures employment.'),
    e('die Rentenlücke','pension gap','Viele haben eine erhebliche Rentenlücke.','Many people have a significant pension gap.'),
  ]},

  { id:'B2_WISSENSCHAFT_GESELLSCHAFT', emoji:'🔬', title:'WISSENSCHAFT & GESELLSCHAFT', level:'B2', entries:[
    e('die Wissenschaftskommunikation','science communication','Wissenschaftskommunikation erklärt Forschung für die Öffentlichkeit.','Science communication explains research to the public.'),
    e('die Peer-Review','peer review','Das Peer-Review-Verfahren sichert wissenschaftliche Qualität.','The peer review process ensures scientific quality.'),
    e('die Replikationskrise','replication crisis','Die Replikationskrise erschütterte die Psychologie.','The replication crisis shook psychology.'),
    e('der Wissenstransfer','knowledge transfer','Wissenstransfer zwischen Hochschule und Wirtschaft ist wichtig.','Knowledge transfer between university and business is important.'),
    e('die Ethikkommission','ethics committee','Die Ethikkommission prüft Forschungsvorhaben.','The ethics committee examines research projects.'),
    e('der Interessenkonflikt','conflict of interest','Interessenkonflikte müssen offengelegt werden.','Conflicts of interest must be disclosed.'),
    e('die Pseudowissenschaft','pseudoscience','Pseudowissenschaft schadet dem Vertrauen in die Wissenschaft.','Pseudoscience harms trust in science.'),
    e('der Konsens','scientific consensus','Der wissenschaftliche Konsens zum Klimawandel ist eindeutig.','The scientific consensus on climate change is clear.'),
    e('die Langzeitstudie','longitudinal study','Langzeitstudien liefern zuverlässigere Daten.','Longitudinal studies provide more reliable data.'),
    e('die Metaanalyse','meta-analysis','Eine Metaanalyse wertet viele Studien gemeinsam aus.','A meta-analysis evaluates many studies together.'),
    e('die Grundlagenforschung','basic / fundamental research','Grundlagenforschung ist die Basis aller Anwendungen.','Basic research is the foundation of all applications.'),
    e('die angewandte Wissenschaft','applied science','Angewandte Wissenschaft löst praktische Probleme.','Applied science solves practical problems.'),
    e('das Forschungsdesiderat','research gap / desideratum','Hier besteht noch ein Forschungsdesiderat.','There is still a research gap here.'),
    e('die wissenschaftliche Integrität','scientific integrity','Wissenschaftliche Integrität ist unverzichtbar.','Scientific integrity is indispensable.'),
    e('das Plagiat','plagiarism','Plagiate zerstören wissenschaftliche Karrieren.','Plagiarism destroys scientific careers.'),
    e('die Forschungsförderung','research funding','Forschungsförderung durch den Staat ist wichtig.','Research funding by the state is important.'),
    e('das Labor','laboratory','Im Labor werden Experimente durchgeführt.','Experiments are carried out in the laboratory.'),
    e('der Durchbruch','breakthrough','Ein wissenschaftlicher Durchbruch verändert alles.','A scientific breakthrough changes everything.'),
    e('das Forschungsprojekt','research project','Das Forschungsprojekt läuft drei Jahre.','The research project runs for three years.'),
    e('interdisziplinär','interdisciplinary','Komplexe Probleme erfordern interdisziplinäre Lösungen.','Complex problems require interdisciplinary solutions.'),
  ]},
];

cats.forEach(c => { c.entries = c.entries.map(entry => ({ ...entry, w: clean(entry.w) })); });
const out = [...data, ...cats];
fs.writeFileSync(FILE, JSON.stringify(out));
const added = cats.reduce((s, c) => s + c.entries.length, 0);
const b2final = out.filter(c => c.level === 'B2');
console.log(`Added ${cats.length} new categories, ${added} words.`);
console.log(`B2 total: ${b2final.length} categories, ${b2final.reduce((s,c)=>s+c.entries.length,0)} words.`);
