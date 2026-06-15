/* B2 Vocab Batch 4 — ~600 more words across 30 categories */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

function clean(w) {
  return w
    .replace(/,\s*["'"\-–][^\s,()]*(\s*\/\s*["'\-–][^\s,()]*)?/g, '')
    .replace(/\s*\(Sg\.\)/g, '').replace(/\s*\(Pl\.\)/g, '')
    .replace(/\s*\(ohne Artikel\)/g, '')
    .replace(/\s*\(\+\s*[DAG]\.\)/g, '')
    .replace(/\s*\([a-z]+\s*\+[^)]*\)/g, '')
    .replace(/\s*\/[A-Z][a-z]+.*$/, '')  // strip "/Verb" gender variants at end
    .trim();
}
function e(w, t, de, en) { return { w: clean(w), t, de, en }; }

let data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
// Deduplicate
const seen = new Set();
data = data.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });

const cats = [

  // ══ MEDIZIN & THERAPIE ════════════════════════════════════════════
  { id:'B2_MEDIZIN_THERAPIE', emoji:'💊', title:'MEDIZIN & THERAPIEFORMEN', level:'B2', entries:[
    e('die Behandlungsmethode','treatment method','Neue Behandlungsmethoden werden erforscht.','New treatment methods are being researched.'),
    e('die Prävention','prevention','Prävention ist kostengünstiger als Behandlung.','Prevention is cheaper than treatment.'),
    e('die Vorsorgeuntersuchung','preventive check-up','Regelmäßige Vorsorgeuntersuchungen retten Leben.','Regular preventive check-ups save lives.'),
    e('die klinische Studie','clinical trial','Die klinische Studie zeigt vielversprechende Ergebnisse.','The clinical trial shows promising results.'),
    e('die Nebenwirkung','side effect','Das Medikament hat kaum Nebenwirkungen.','The medication has few side effects.'),
    e('das Rezept','prescription','Das Medikament ist nur auf Rezept erhältlich.','The medication is only available on prescription.'),
    e('die Krankenkasse','health insurance fund','Welche Krankenkasse bist du versichert?','Which health insurance fund are you insured with?'),
    e('die Pflegeversicherung','long-term care insurance','Die Pflegeversicherung deckt die Pflegekosten.','Long-term care insurance covers care costs.'),
    e('chronisch krank','chronically ill','Chronisch kranke Menschen brauchen Dauerbetreuung.','Chronically ill people need ongoing care.'),
    e('die Schmerztherapie','pain therapy','Musik wird in der Schmerztherapie eingesetzt.','Music is used in pain therapy.'),
    e('die Suchtbehandlung','addiction treatment','Die Suchtbehandlung dauert oft Monate.','Addiction treatment often takes months.'),
    e('die Rehabilitation','rehabilitation','Nach der Operation folgte eine lange Rehabilitation.','A long rehabilitation followed the operation.'),
    e('die psychosomatisch','psychosomatic','Psychosomatische Beschwerden haben seelische Ursachen.','Psychosomatic complaints have psychological causes.'),
    e('das Wohlbefinden','wellbeing','Sport steigert das allgemeine Wohlbefinden.','Sport improves general wellbeing.'),
    e('medikamentös','with medication / pharmaceutical','Die Erkrankung wird medikamentös behandelt.','The illness is treated with medication.'),
    e('die Sprechstunde','consulting hours / surgery','Die Sprechstunde beginnt um neun Uhr.','The consulting hours begin at nine o\'clock.'),
    e('die Überweisung','referral (medical)','Der Hausarzt stellte eine Überweisung aus.','The GP issued a referral.'),
    e('stationär','inpatient','Sie wird stationär im Krankenhaus behandelt.','She is being treated as an inpatient in hospital.'),
    e('ambulant','outpatient','Die Operation kann ambulant durchgeführt werden.','The operation can be performed on an outpatient basis.'),
    e('die Diagnose stellen','to make a diagnosis','Der Arzt stellte eine klare Diagnose.','The doctor made a clear diagnosis.'),
  ]},

  // ══ WISSENSCHAFT VERTIEFUNG ════════════════════════════════════════
  { id:'B2_FORSCHUNG_METHODEN', emoji:'🔭', title:'FORSCHUNGSMETHODEN & WISSENSCHAFT', level:'B2', entries:[
    e('die Hypothese','hypothesis','Die Hypothese muss durch Experimente geprüft werden.','The hypothesis must be tested through experiments.'),
    e('die These','thesis / proposition','Er vertritt die These, dass Bildung Armut reduziert.','He proposes the thesis that education reduces poverty.'),
    e('empirisch','empirical','Die Studie basiert auf empirischen Daten.','The study is based on empirical data.'),
    e('die Methodik','methodology','Die Methodik der Studie ist klar beschrieben.','The methodology of the study is clearly described.'),
    e('das Labor','laboratory','Die Proben werden im Labor analysiert.','The samples are analysed in the laboratory.'),
    e('reproduzierbar','reproducible','Wissenschaftliche Ergebnisse müssen reproduzierbar sein.','Scientific results must be reproducible.'),
    e('signifikant','significant','Das Ergebnis ist statistisch signifikant.','The result is statistically significant.'),
    e('die Stichprobe','sample (statistics)','Die Stichprobe umfasst 1000 Personen.','The sample comprises 1,000 people.'),
    e('auswerten','to evaluate / analyse','Die Daten werden sorgfältig ausgewertet.','The data is carefully evaluated.'),
    e('das Ergebnis','result / finding','Die Ergebnisse überraschten die Forscher.','The results surprised the researchers.'),
    e('belegen','to prove / demonstrate','Studien belegen den positiven Effekt.','Studies demonstrate the positive effect.'),
    e('widerlegen','to refute / disprove','Die neue Studie widerlegte die alte Theorie.','The new study refuted the old theory.'),
    e('die Erkenntnis','insight / finding','Diese Erkenntnis veränderte die Forschung.','This finding changed the research.'),
    e('interdisziplinär','interdisciplinary','Interdisziplinäre Forschung liefert neue Perspektiven.','Interdisciplinary research provides new perspectives.'),
    e('die Grundlagenforschung','basic research','Grundlagenforschung schafft die Basis für Anwendungen.','Basic research creates the basis for applications.'),
    e('die angewandte Forschung','applied research','Angewandte Forschung löst praktische Probleme.','Applied research solves practical problems.'),
    e('der Durchbruch','breakthrough','Ein wissenschaftlicher Durchbruch ist gelungen.','A scientific breakthrough has been achieved.'),
    e('veröffentlichen','to publish','Die Ergebnisse wurden in einer Fachzeitschrift veröffentlicht.','The results were published in a specialist journal.'),
    e('die Peer Review','peer review','Das Paper durchlief ein strenges Peer-Review-Verfahren.','The paper went through a strict peer review process.'),
    e('zitieren','to cite / quote','In wissenschaftlichen Texten muss man korrekt zitieren.','In scientific texts one must cite correctly.'),
  ]},

  // ══ ARMUT & ENTWICKLUNG WELTWEIT ══════════════════════════════════
  { id:'B2_ENTWICKLUNG_WELTWEIT', emoji:'🌍', title:'ENTWICKLUNG & GLOBALE GERECHTIGKEIT', level:'B2', entries:[
    e('die Entwicklungsländer','developing countries','In Entwicklungsländern fehlt es an Infrastruktur.','Developing countries lack infrastructure.'),
    e('die Korruption','corruption','Korruption hemmt die wirtschaftliche Entwicklung.','Corruption hinders economic development.'),
    e('die Armut','poverty','Extreme Armut ist weltweit noch immer verbreitet.','Extreme poverty is still widespread worldwide.'),
    e('die Ungleichheit','inequality','Globale Ungleichheit nimmt weiter zu.','Global inequality continues to increase.'),
    e('die Nachhilfe','tutoring / private tuition','Nachhilfestunden helfen benachteiligten Kindern.','Tutoring helps disadvantaged children.'),
    e('die Spende','donation','Ihre Spende hilft Kindern in Not.','Your donation helps children in need.'),
    e('die Naturkatastrophe','natural disaster','Nach der Naturkatastrophe leisteten viele Länder Hilfe.','After the natural disaster many countries provided assistance.'),
    e('die Epidemie','epidemic','Die Epidemie forderte viele Menschenleben.','The epidemic claimed many lives.'),
    e('die Bildungschance','educational opportunity','Gleiche Bildungschancen sind ein globales Ziel.','Equal educational opportunities are a global goal.'),
    e('der Flüchtling','refugee','Millionen Flüchtlinge suchen weltweit Schutz.','Millions of refugees seek protection worldwide.'),
    e('die Dürreperiode','drought period','Lange Dürreperioden zerstören die Ernte.','Long drought periods destroy the harvest.'),
    e('die Fördermaßnahme','support measure','Gezielte Fördermaßnahmen helfen Benachteiligten.','Targeted support measures help the disadvantaged.'),
    e('die Spendenbereitschaft','willingness to donate','In Krisen steigt die Spendenbereitschaft.','In crises the willingness to donate increases.'),
    e('die Bekämpfung','combating / fight against','Die Bekämpfung der Armut erfordert internationale Zusammenarbeit.','Combating poverty requires international cooperation.'),
    e('langfristig','long-term','Langfristige Lösungen sind nachhaltiger.','Long-term solutions are more sustainable.'),
    e('die Grundversorgung','basic provision / essential services','Sauberes Wasser gehört zur Grundversorgung.','Clean water is part of basic provision.'),
    e('die Ernährungssicherheit','food security','Ernährungssicherheit ist ein Menschenrecht.','Food security is a human right.'),
    e('die Migrationsbewegung','migratory movement','Klimawandel löst neue Migrationsbewegungen aus.','Climate change triggers new migratory movements.'),
    e('die humanitäre Hilfe','humanitarian aid','Humanitäre Hilfe erreicht oft erst spät die Betroffenen.','Humanitarian aid often only reaches those affected late.'),
    e('die Weltgesundheitsorganisation','World Health Organization (WHO)','Die WHO koordiniert die globale Gesundheitspolitik.','The WHO coordinates global health policy.'),
  ]},

  // ══ POLITIK & DEMOKRATIE ══════════════════════════════════════════
  { id:'B2_DEMOKRATIE_VERTIEFEN', emoji:'🗳️', title:'DEMOKRATIE & POLITISCHE PROZESSE', level:'B2', entries:[
    e('die Abstimmung','vote / ballot','Bei der Abstimmung gewann der Vorschlag.','In the vote the proposal won.'),
    e('das Referendum','referendum','Das Referendum entschied über den EU-Austritt.','The referendum decided on the EU exit.'),
    e('die Volksabstimmung','popular vote / plebiscite','Eine Volksabstimmung ist direkte Demokratie.','A popular vote is direct democracy.'),
    e('die Opposition','opposition','Die Opposition kritisierte den Gesetzesentwurf.','The opposition criticised the draft law.'),
    e('der Gesetzesentwurf','draft law / bill','Der Gesetzesentwurf wird im Parlament diskutiert.','The draft law is being discussed in parliament.'),
    e('das Wahlrecht','right to vote / electoral law','Das Wahlrecht gilt für alle Bürger ab 18.','The right to vote applies to all citizens from 18.'),
    e('die Wahlbeteiligung','voter turnout','Die Wahlbeteiligung ist gesunken.','Voter turnout has fallen.'),
    e('der Kandidat','candidate','Drei Kandidaten bewerben sich um das Amt.','Three candidates are standing for the office.'),
    e('die Legislaturperiode','legislative period / term of office','Die Legislaturperiode dauert vier Jahre.','The legislative period lasts four years.'),
    e('die Meinungsfreiheit','freedom of opinion / expression','Meinungsfreiheit ist in einer Demokratie essenziell.','Freedom of expression is essential in a democracy.'),
    e('die Versammlungsfreiheit','freedom of assembly','Das Demonstrationsrecht schützt die Versammlungsfreiheit.','The right to demonstrate protects freedom of assembly.'),
    e('die Pressefreiheit','freedom of the press','Pressefreiheit ist ein Kennzeichen offener Gesellschaften.','Freedom of the press is a hallmark of open societies.'),
    e('die Gewaltenteilung','separation of powers','Gewaltenteilung verhindert Machtmissbrauch.','Separation of powers prevents abuse of power.'),
    e('der Rechtsstaat','constitutional state / rule of law state','Im Rechtsstaat gilt das Gesetz für alle.','In a constitutional state the law applies to everyone.'),
    e('die Verfassung','constitution','Die Verfassung schützt die Grundrechte.','The constitution protects fundamental rights.'),
    e('der Bundestag','Bundestag (German federal parliament)','Der Bundestag wählt den Bundeskanzler.','The Bundestag elects the Federal Chancellor.'),
    e('der Bundesrat','Bundesrat (German federal council)','Der Bundesrat vertritt die Länder.','The Bundesrat represents the federal states.'),
    e('die Regierungskoalition','governing coalition','Die Regierungskoalition einigte sich auf einen Kompromiss.','The governing coalition agreed on a compromise.'),
    e('der Kompromiss','compromise','Ohne Kompromiss ist keine Einigung möglich.','Without compromise no agreement is possible.'),
    e('die Bürgerinitiative','citizens\' initiative','Eine Bürgerinitiative fordert mehr Radwege.','A citizens\' initiative is demanding more cycle paths.'),
  ]},

  // ══ KULTUR & MEDIEN ════════════════════════════════════════════════
  { id:'B2_KULTUR_MEDIEN', emoji:'📺', title:'KULTUR & MEDIENKONSUM', level:'B2', entries:[
    e('das Streaming','streaming','Streaming hat die Mediennutzung verändert.','Streaming has changed media consumption.'),
    e('die Medienkritik','media criticism','Medienkritik ist wichtig für die Demokratie.','Media criticism is important for democracy.'),
    e('die Echokammer','echo chamber','Soziale Netzwerke können Echokammern schaffen.','Social networks can create echo chambers.'),
    e('die Filterblase','filter bubble','Algorithmen erzeugen Filterblasen im Netz.','Algorithms create filter bubbles on the internet.'),
    e('viral gehen','to go viral','Das Video ist über Nacht viral gegangen.','The video went viral overnight.'),
    e('der Clickbait','clickbait','Viele Überschriften sind reiner Clickbait.','Many headlines are pure clickbait.'),
    e('die Hassrede','hate speech','Hassrede im Netz ist strafbar.','Hate speech on the internet is punishable.'),
    e('die Desinformation','disinformation','Desinformation gefährdet die Demokratie.','Disinformation endangers democracy.'),
    e('die Medienkompetenz','media literacy','Medienkompetenz muss in der Schule gelehrt werden.','Media literacy must be taught in school.'),
    e('der Influencer','influencer','Influencer haben großen Einfluss auf Jugendliche.','Influencers have great influence on young people.'),
    e('der Podcast','podcast','Podcasts erfreuen sich wachsender Beliebtheit.','Podcasts are enjoying growing popularity.'),
    e('das Abonnement','subscription','Ein Abonnement kostet monatlich neun Euro.','A subscription costs nine euros per month.'),
    e('die Nutzungsdauer','usage time / screen time','Die tägliche Nutzungsdauer von Smartphones steigt.','The daily usage time of smartphones is rising.'),
    e('die Plattform','platform','Auf dieser Plattform teilen Millionen Nutzer Inhalte.','On this platform millions of users share content.'),
    e('der Algorithmus','algorithm','Plattform-Algorithmen bestimmen, was wir sehen.','Platform algorithms determine what we see.'),
    e('die Reichweite','reach','Große Reichweite macht Einfluss möglich.','Large reach makes influence possible.'),
    e('das Urheberrecht','copyright','Das Urheberrecht schützt kreative Werke.','Copyright protects creative works.'),
    e('die Privatsphäre','privacy','Im Netz gibt man oft unbewusst die Privatsphäre auf.','On the internet one often unconsciously gives up privacy.'),
    e('interaktiv','interactive','Interaktive Medien fördern die Beteiligung.','Interactive media promote participation.'),
    e('die Aufmerksamkeitsökonomie','attention economy','In der Aufmerksamkeitsökonomie ist Zeit Geld.','In the attention economy time is money.'),
  ]},

  // ══ REISEN & TOURISMUS ════════════════════════════════════════════
  { id:'B2_REISEN_TOURISMUS', emoji:'✈️', title:'REISEN & TOURISMUS', level:'B2', entries:[
    e('der Massentourismus','mass tourism','Massentourismus schadet manchen Regionen.','Mass tourism harms some regions.'),
    e('nachhaltiger Tourismus','sustainable tourism','Nachhaltiger Tourismus schont die Umwelt.','Sustainable tourism protects the environment.'),
    e('das Reiseziel','destination','Ihr Lieblingsreiseziel ist Italien.','Her favourite destination is Italy.'),
    e('die Unterkunft','accommodation','Wir suchen eine günstige Unterkunft.','We are looking for affordable accommodation.'),
    e('der Auslandsaufenthalt','stay abroad','Ein Auslandsaufenthalt verbessert Sprachkenntnisse.','A stay abroad improves language skills.'),
    e('das Visum','visa','Für die Einreise brauche ich ein Visum.','I need a visa to enter.'),
    e('die Reisekrankenversicherung','travel health insurance','Eine Reisekrankenversicherung ist empfehlenswert.','Travel health insurance is recommended.'),
    e('die Sehenswürdigkeit','sight / tourist attraction','Die bekannteste Sehenswürdigkeit ist der Eiffelturm.','The best-known sight is the Eiffel Tower.'),
    e('die Reisewarnung','travel warning','Das Auswärtige Amt gab eine Reisewarnung heraus.','The Foreign Office issued a travel warning.'),
    e('der Kulturaustausch','cultural exchange','Reisen fördert den Kulturaustausch.','Travel promotes cultural exchange.'),
    e('das Hostel','hostel','Viele Backpacker übernachten im Hostel.','Many backpackers stay in hostels.'),
    e('der Rucksacktourismus','backpacking','Rucksacktourismus ist günstig und abenteuerlich.','Backpacking is cheap and adventurous.'),
    e('die Pauschalreise','package holiday','Eine Pauschalreise ist oft stressfreier.','A package holiday is often less stressful.'),
    e('das Reisebüro','travel agency','Sie buchte die Reise im Reisebüro.','She booked the trip at the travel agency.'),
    e('die Selbstverpflegung','self-catering','Mit Selbstverpflegung spart man beim Essen.','With self-catering one saves money on food.'),
    e('die Halbpension','half board','Das Hotel bietet Halbpension an.','The hotel offers half board.'),
    e('der Jetlag','jet lag','Nach dem Langstreckenflug litt sie unter Jetlag.','After the long-haul flight she suffered from jet lag.'),
    e('der Reisepass','passport','Der Reisepass muss noch mindestens sechs Monate gültig sein.','The passport must still be valid for at least six months.'),
    e('das Gepäck','luggage','Das Gepäck darf maximal 20 Kilo wiegen.','The luggage may weigh a maximum of 20 kilos.'),
    e('die Verspätung','delay','Der Flug hatte drei Stunden Verspätung.','The flight was three hours late.'),
  ]},

  // ══ SPORT & FREIZEIT ══════════════════════════════════════════════
  { id:'B2_SPORT_FREIZEIT', emoji:'🏃', title:'SPORT, FREIZEIT & HOBBYS', level:'B2', entries:[
    e('der Leistungssport','competitive sport','Leistungssport erfordert totale Hingabe.','Competitive sport requires total dedication.'),
    e('der Breitensport','mass participation sport','Breitensport ist für die Volksgesundheit wichtig.','Mass participation sport is important for public health.'),
    e('die Mannschaft','team','Die Mannschaft trainiert täglich.','The team trains daily.'),
    e('das Turnier','tournament','Beim Turnier spielen zwölf Teams.','Twelve teams are playing at the tournament.'),
    e('der Wettkampf','competition / contest','Der Wettkampf war sehr intensiv.','The competition was very intense.'),
    e('die Ausdauer','endurance / stamina','Marathon erfordert viel Ausdauer.','Marathon requires a great deal of stamina.'),
    e('die Disziplin','discipline','Ohne Disziplin gibt es keinen sportlichen Erfolg.','Without discipline there is no sporting success.'),
    e('trainieren','to train / practise','Sie trainiert sechsmal pro Woche.','She trains six times a week.'),
    e('der Trainer','coach / trainer','Der Trainer analysierte die Leistung.','The coach analysed the performance.'),
    e('die Fitness','fitness','Regelmäßige Bewegung hält die Fitness aufrecht.','Regular exercise maintains fitness.'),
    e('das Ehrenamt','honorary position / volunteering','Das Ehrenamt im Sport ist unersetzlich.','Volunteering in sport is irreplaceable.'),
    e('der Verein','club / association','Er ist seit Jahren Mitglied im Fußballverein.','He has been a member of the football club for years.'),
    e('die Mitgliedschaft','membership','Die Mitgliedschaft im Verein kostet 50 Euro.','Membership of the club costs 50 euros.'),
    e('die Olympischen Spiele','Olympic Games','Die Olympischen Spiele finden alle vier Jahre statt.','The Olympic Games take place every four years.'),
    e('die Weltmeisterschaft','world championship','Die Weltmeisterschaft ist der Höhepunkt des Sports.','The world championship is the high point of the sport.'),
    e('der Rekord','record','Sie stellte einen neuen Weltrekord auf.','She set a new world record.'),
    e('die Leistung','performance / achievement','Seine sportliche Leistung ist bewundernswert.','His sporting performance is admirable.'),
    e('das Sportgericht','sports tribunal','Das Sportgericht verhängte eine Sperre.','The sports tribunal imposed a ban.'),
    e('das Doping','doping','Doping ist im Sport streng verboten.','Doping is strictly prohibited in sport.'),
    e('der Amateursport','amateur sport','Amateursport ist der Grundstein des Leistungssports.','Amateur sport is the foundation of competitive sport.'),
  ]},

  // ══ ERNÄHRUNG & LEBENSSTIL ════════════════════════════════════════
  { id:'B2_ERNAEHRUNG_LEBENSSTIL', emoji:'🥗', title:'ERNÄHRUNG & GESUNDER LEBENSSTIL', level:'B2', entries:[
    e('die ausgewogene Ernährung','balanced diet','Eine ausgewogene Ernährung ist die Basis der Gesundheit.','A balanced diet is the basis of health.'),
    e('der Nährstoff','nutrient','Vitamine sind wichtige Nährstoffe.','Vitamins are important nutrients.'),
    e('das Übergewicht','overweight / obesity','Übergewicht erhöht das Risiko für viele Krankheiten.','Overweight increases the risk of many diseases.'),
    e('der Kaloriengehalt','calorie content','Der Kaloriengehalt sollte auf der Verpackung stehen.','The calorie content should be on the packaging.'),
    e('die Lebensmittelkennzeichnung','food labelling','Klare Lebensmittelkennzeichnung schützt Verbraucher.','Clear food labelling protects consumers.'),
    e('biologisch angebaut','organically grown','Biologisch angebaute Produkte sind teurer.','Organically grown products are more expensive.'),
    e('die Ernährungsweise','dietary habits / way of eating','Eine vegetarische Ernährungsweise ist gesund.','A vegetarian dietary habit is healthy.'),
    e('der Lebensmittelskandal','food scandal','Der Lebensmittelskandal erschütterte die Branche.','The food scandal shook the industry.'),
    e('die Lebensmittelverschwendung','food waste','Lebensmittelverschwendung ist ein globales Problem.','Food waste is a global problem.'),
    e('die Nahrungsergänzung','dietary supplement','Nahrungsergänzungsmittel ersetzen keine gesunde Ernährung.','Dietary supplements do not replace a healthy diet.'),
    e('der Veganismus','veganism','Veganismus liegt im Trend.','Veganism is trending.'),
    e('der Vegetarismus','vegetarianism','Vegetarismus reduziert den ökologischen Fußabdruck.','Vegetarianism reduces the ecological footprint.'),
    e('die Fastfoodkultur','fast food culture','Die Fastfoodkultur ist weit verbreitet.','Fast food culture is widespread.'),
    e('saisonal','seasonal','Saisonal und regional einkaufen schont die Umwelt.','Buying seasonally and locally is kind to the environment.'),
    e('regional','regional / locally produced','Regionale Produkte unterstützen die lokale Wirtschaft.','Regional products support the local economy.'),
    e('die Essgewohnheit','eating habit','Essgewohnheiten sind kulturell geprägt.','Eating habits are culturally shaped.'),
    e('die Zutat','ingredient','Alle Zutaten sind auf der Verpackung angegeben.','All ingredients are stated on the packaging.'),
    e('der Konservierungsstoff','preservative','Viele Produkte enthalten Konservierungsstoffe.','Many products contain preservatives.'),
    e('intolerant (Lebensmittel)','intolerant (food)','Sie ist laktoseintolerant.','She is lactose intolerant.'),
    e('das Wohlbefinden','wellbeing','Gute Ernährung fördert das Wohlbefinden.','Good nutrition promotes wellbeing.'),
  ]},

  // ══ ARCHITEKTUR & KULTURERBE ══════════════════════════════════════
  { id:'B2_ARCHITEKTUR_ERBE', emoji:'🏛️', title:'ARCHITEKTUR & KULTURERBE', level:'B2', entries:[
    e('das Baudenkmal','architectural monument','Das Baudenkmal steht unter Schutz.','The architectural monument is protected.'),
    e('die Restaurierung','restoration','Die Restaurierung des Doms dauert Jahre.','The restoration of the cathedral takes years.'),
    e('die Fassade','facade','Die Fassade des Gebäudes wird renoviert.','The facade of the building is being renovated.'),
    e('der Grundriss','floor plan / layout','Der Grundriss des Hauses ist ungewöhnlich.','The floor plan of the house is unusual.'),
    e('der Baustil','architectural style','Der Baustil ist typisch für das Barock.','The architectural style is typical of the Baroque.'),
    e('das Mittelalter','Middle Ages','Viele Kathedralen stammen aus dem Mittelalter.','Many cathedrals date from the Middle Ages.'),
    e('die Gotik','Gothic (architecture)','Die Gotik ist durch spitze Bögen gekennzeichnet.','Gothic is characterised by pointed arches.'),
    e('der Barock','Baroque (style)','Der Barock ist für seine Pracht bekannt.','The Baroque is known for its splendour.'),
    e('das Welterbe','World Heritage','Schloss Neuschwanstein ist Welterbe.','Neuschwanstein Castle is a World Heritage site.'),
    e('die Denkmalpflege','monument conservation','Denkmalpflege schützt historische Substanz.','Monument conservation protects historic fabric.'),
    e('rekonstruieren','to reconstruct','Das zerstörte Gebäude wurde rekonstruiert.','The destroyed building was reconstructed.'),
    e('das Stadtbild','cityscape','Das Stadtbild prägt das Lebensgefühl.','The cityscape shapes the feeling of life.'),
    e('der Stadtplaner','urban planner','Der Stadtplaner entwarf ein neues Konzept.','The urban planner designed a new concept.'),
    e('nachhaltig bauen','to build sustainably','Nachhaltig bauen schont Ressourcen.','Building sustainably conserves resources.'),
    e('barrierefreiheit','accessibility','Barrierefreiheit ist im öffentlichen Bau Pflicht.','Accessibility is mandatory in public buildings.'),
    e('die Sanierung','renovation / refurbishment','Die Sanierung des alten Stadtteils ist abgeschlossen.','The refurbishment of the old district is complete.'),
    e('der Abriss','demolition','Der Abriss des alten Gebäudes ist umstritten.','The demolition of the old building is controversial.'),
    e('das Ensemble','ensemble / complex of buildings','Das historische Ensemble wird unter Schutz gestellt.','The historic ensemble is being placed under protection.'),
    e('der Architekt','architect','Der Architekt gewann einen internationalen Preis.','The architect won an international prize.'),
    e('der Entwurf','design / draft','Der Entwurf des neuen Museums ist beeindruckend.','The design of the new museum is impressive.'),
  ]},

  // ══ SOZIALE MEDIEN & DIGITALE KOMMUNIKATION ════════════════════
  { id:'B2_SOZIALE_MEDIEN', emoji:'📲', title:'SOZIALE MEDIEN & DIGITALE IDENTITÄT', level:'B2', entries:[
    e('das Profil','profile (social media)','Ihr Profil hat Millionen Follower.','Her profile has millions of followers.'),
    e('teilen','to share (content)','Bitte teile diesen Beitrag weiter.','Please share this post.'),
    e('kommentieren','to comment','Hunderte Menschen kommentierten das Video.','Hundreds of people commented on the video.'),
    e('folgen','to follow (social media)','Ich folge ihrem Account seit Jahren.','I have been following her account for years.'),
    e('der Hashtag','hashtag','Mit dem richtigen Hashtag erhöhst du die Reichweite.','With the right hashtag you increase your reach.'),
    e('der Content','content','Qualitätvoller Content zieht Nutzer an.','Quality content attracts users.'),
    e('die Reichweite','reach / coverage','Die Reichweite des Beitrags ist enorm.','The reach of the post is enormous.'),
    e('viral','viral','Das Meme ist viral gegangen.','The meme has gone viral.'),
    e('der Troll','troll (internet)','Trolle verbreiten Hass im Netz.','Trolls spread hatred on the internet.'),
    e('die Cybermobbing','cyberbullying','Cybermobbing ist ein ernstes Problem unter Jugendlichen.','Cyberbullying is a serious problem among young people.'),
    e('die digitale Identität','digital identity','Jeder hat eine digitale Identität im Netz.','Everyone has a digital identity on the internet.'),
    e('der Datenmissbrauch','data misuse / data abuse','Datenmissbrauch ist strafbar.','Data misuse is punishable.'),
    e('die Verschlüsselung','encryption','Ende-zu-Ende-Verschlüsselung schützt Nachrichten.','End-to-end encryption protects messages.'),
    e('die Privatsphäre','privacy','Im Netz ist die Privatsphäre oft nicht geschützt.','Privacy is often not protected on the internet.'),
    e('das Nutzerkonto','user account','Schütze dein Nutzerkonto mit einem sicheren Passwort.','Protect your user account with a secure password.'),
    e('der Datenschutz','data protection','Datenschutz ist ein Grundrecht in Deutschland.','Data protection is a fundamental right in Germany.'),
    e('der digitale Fußabdruck','digital footprint','Jeder hinterlässt im Netz einen digitalen Fußabdruck.','Everyone leaves a digital footprint on the internet.'),
    e('anonym','anonymous','Viele Nutzer posten anonym im Netz.','Many users post anonymously on the internet.'),
    e('die Netiquette','netiquette','Netiquette regelt den respektvollen Umgang online.','Netiquette regulates respectful interaction online.'),
    e('der Algorithmus','algorithm','Der Algorithmus filtert relevante Inhalte.','The algorithm filters relevant content.'),
  ]},

  // ══ EMOTIONEN & PSYCHOLOGISCHE KONZEPTE ══════════════════════════
  { id:'B2_EMOTIONEN_KONZEPTE', emoji:'🎭', title:'EMOTIONEN & PSYCHOLOGISCHE KONZEPTE', level:'B2', entries:[
    e('die Angst','anxiety / fear','Angst kann lähmen oder motivieren.','Fear can paralyse or motivate.'),
    e('die Freude','joy / happiness','Die Freude über den Erfolg war groß.','The joy at the success was great.'),
    e('der Neid','envy','Neid ist ein natürliches, aber destruktives Gefühl.','Envy is a natural but destructive feeling.'),
    e('die Eifersucht','jealousy','Eifersucht kann Beziehungen zerstören.','Jealousy can destroy relationships.'),
    e('die Wut','rage / anger','Unkontrollierte Wut führt zu Konflikten.','Uncontrolled rage leads to conflicts.'),
    e('die Scham','shame','Scham ist ein soziales Gefühl.','Shame is a social emotion.'),
    e('das Schuldbewusstsein','sense of guilt','Ein starkes Schuldbewusstsein kann belasten.','A strong sense of guilt can be a burden.'),
    e('die Empathie','empathy','Empathie ist die Basis jeder guten Beziehung.','Empathy is the basis of every good relationship.'),
    e('die Mitgefühl','compassion','Mitgefühl zeigt echtes menschliches Interesse.','Compassion shows genuine human interest.'),
    e('das Wohlbefinden','wellbeing','Positives Denken fördert das Wohlbefinden.','Positive thinking promotes wellbeing.'),
    e('die Selbstwahrnehmung','self-perception','Unsere Selbstwahrnehmung ist oft verzerrt.','Our self-perception is often distorted.'),
    e('das Selbstwertgefühl','self-esteem','Ein gesundes Selbstwertgefühl ist wichtig.','A healthy self-esteem is important.'),
    e('die Frustration','frustration','Frustration entsteht, wenn Ziele nicht erreicht werden.','Frustration arises when goals are not achieved.'),
    e('die Enttäuschung','disappointment','Die Enttäuschung nach der Niederlage war groß.','The disappointment after the defeat was great.'),
    e('die Begeisterung','enthusiasm / excitement','Ihre Begeisterung ist ansteckend.','Her enthusiasm is infectious.'),
    e('die Gelassenheit','composure / equanimity','Gelassenheit hilft in schwierigen Situationen.','Composure helps in difficult situations.'),
    e('die Resilienz','resilience','Resilienz ist die Fähigkeit, Krisen zu überstehen.','Resilience is the ability to survive crises.'),
    e('die Burnout','burnout','Burnout ist eine ernsthafte Erschöpfungserkrankung.','Burnout is a serious exhaustion disorder.'),
    e('der Optimismus','optimism','Optimismus ist lernbar.','Optimism can be learned.'),
    e('der Pessimismus','pessimism','Chronischer Pessimismus ist ungesund.','Chronic pessimism is unhealthy.'),
  ]},

  // ══ WIRTSCHAFT & FINANZEN VERTIEFUNG ════════════════════════════
  { id:'B2_FINANZEN_VERTIEFUNG', emoji:'💰', title:'FINANZEN & WIRTSCHAFT VERTIEFT', level:'B2', entries:[
    e('das Bruttoinlandsprodukt','gross domestic product (GDP)','Das BIP ist ein Maßstab für den Wohlstand.','GDP is a measure of prosperity.'),
    e('die Inflation','inflation','Hohe Inflation mindert die Kaufkraft.','High inflation reduces purchasing power.'),
    e('die Deflation','deflation','Deflation signalisiert wirtschaftliche Schwäche.','Deflation signals economic weakness.'),
    e('der Leitzins','key interest rate','Die EZB senkte den Leitzins.','The ECB lowered the key interest rate.'),
    e('die Zentralbank','central bank','Die Zentralbank steuert die Geldpolitik.','The central bank controls monetary policy.'),
    e('das Haushaltsdefizit','budget deficit','Das Haushaltsdefizit muss abgebaut werden.','The budget deficit must be reduced.'),
    e('die Staatsschulden','national debt','Die Staatsschulden sind auf einem Rekordniveau.','National debt is at a record level.'),
    e('die Steuererhöhung','tax increase','Die Steuererhöhung traf vor allem mittlere Einkommen.','The tax increase hit middle incomes in particular.'),
    e('die Subvention','subsidy','Subventionen stützen die Landwirtschaft.','Subsidies support agriculture.'),
    e('der Mindestlohn','minimum wage','Der Mindestlohn wurde auf 12 Euro angehoben.','The minimum wage was raised to 12 euros.'),
    e('das Tarifgehalt','collectively agreed salary','Das Tarifgehalt gilt für alle Branchenbeschäftigten.','The collectively agreed salary applies to all sector employees.'),
    e('die Gewerkschaft','trade union','Die Gewerkschaft verhandelte einen neuen Tarifvertrag.','The trade union negotiated a new collective agreement.'),
    e('der Streik','strike','Die Beschäftigten traten in den Streik.','The employees went on strike.'),
    e('die Insolvenz','insolvency','Das Unternehmen meldete Insolvenz an.','The company filed for insolvency.'),
    e('die Fusion','merger','Die Fusion der zwei Banken war umstritten.','The merger of the two banks was controversial.'),
    e('das Kapital','capital','Kapital wird in neue Technologien investiert.','Capital is being invested in new technologies.'),
    e('der Kredit','loan / credit','Sie nahm einen Kredit für das Haus auf.','She took out a loan for the house.'),
    e('der Zinssatz','interest rate','Der Zinssatz beeinflusst die Nachfrage nach Krediten.','The interest rate influences the demand for loans.'),
    e('die Aktie','share / stock','Die Aktie stieg gestern um fünf Prozent.','The share rose five per cent yesterday.'),
    e('das Investment','investment','Das Investment in erneuerbare Energien lohnt sich.','The investment in renewable energies is worthwhile.'),
  ]},

  // ══ SPRACHE LERNEN & METHODIK ═════════════════════════════════════
  { id:'B2_SPRACHENLERNEN', emoji:'📚', title:'SPRACHEN LERNEN & METHODIK', level:'B2', entries:[
    e('die Sprachkompetenz','language competence','Ihre Sprachkompetenz ist auf sehr hohem Niveau.','Her language competence is at a very high level.'),
    e('die Lerntechnik','learning technique','Gute Lerntechniken machen das Lernen effizienter.','Good learning techniques make learning more efficient.'),
    e('das Sprachniveau','language level','Welches Sprachniveau haben Sie?','What language level do you have?'),
    e('der Referenzrahmen','framework of reference (CEFR)','Der Europäische Referenzrahmen definiert Sprachniveaus.','The European Framework of Reference defines language levels.'),
    e('die Immersion','immersion','Immersionsprogramme beschleunigen den Spracherwerb.','Immersion programmes accelerate language acquisition.'),
    e('das Sprachlabor','language laboratory','Im Sprachlabor übt man Aussprache.','In the language laboratory one practises pronunciation.'),
    e('die Aussprache','pronunciation','Gute Aussprache ist wichtig für die Kommunikation.','Good pronunciation is important for communication.'),
    e('der Wortschatz','vocabulary','Täglich neue Wörter lernen erweitert den Wortschatz.','Learning new words daily expands vocabulary.'),
    e('die Grammatik','grammar','Ohne Grammatik versteht man keine Sprache tief.','Without grammar one cannot understand a language deeply.'),
    e('das Leseverstehen','reading comprehension','Leseverstehen wird durch viel Lesen verbessert.','Reading comprehension is improved by reading a lot.'),
    e('das Hörverstehen','listening comprehension','Podcast-Hören trainiert das Hörverstehen.','Listening to podcasts trains listening comprehension.'),
    e('die Sprachbarriere','language barrier','Sprachbarrieren können Missverständnisse verursachen.','Language barriers can cause misunderstandings.'),
    e('mehrsprachig aufwachsen','to grow up multilingual','Mehrsprachig aufgewachsene Kinder haben Vorteile.','Children who grow up multilingual have advantages.'),
    e('der Muttersprachler','native speaker','Ein Muttersprachler kann die Aussprache korrigieren.','A native speaker can correct the pronunciation.'),
    e('die Übersetzung','translation','Eine gute Übersetzung erfasst den Sinn.','A good translation captures the meaning.'),
    e('das Missverständnis','misunderstanding','Sprachliche Missverständnisse lassen sich vermeiden.','Linguistic misunderstandings can be avoided.'),
    e('die Fremdsprache','foreign language','Fremdsprachen öffnen berufliche Türen.','Foreign languages open professional doors.'),
    e('der Sprachaustausch','language exchange','Beim Sprachaustausch lernt man authentisch.','In a language exchange one learns authentically.'),
    e('das Sprachzertifikat','language certificate','Das Sprachzertifikat beweist die Kompetenz.','The language certificate proves competence.'),
    e('flüssig','fluent / fluently','Sie spricht fließend Arabisch und Deutsch.','She speaks Arabic and German fluently.'),
  ]},

  // ══ ÖKOLOGIE & KLIMAWANDEL ════════════════════════════════════════
  { id:'B2_KLIMAWANDEL_VERTIEFUNG', emoji:'🌡️', title:'KLIMAWANDEL & ÖKOLOGISCHE KRISE', level:'B2', entries:[
    e('die Klimaerwärmung','global warming / climate warming','Die Klimaerwärmung gefährdet die Artenvielfalt.','Climate warming endangers biodiversity.'),
    e('der Treibhauseffekt','greenhouse effect','Der Treibhauseffekt verstärkt sich durch CO2.','The greenhouse effect is intensified by CO2.'),
    e('die CO2-Emissionen','CO2 emissions','CO2-Emissionen müssen auf null reduziert werden.','CO2 emissions must be reduced to zero.'),
    e('der ökologische Fußabdruck','ecological footprint','Jeder kann seinen ökologischen Fußabdruck verkleinern.','Everyone can reduce their ecological footprint.'),
    e('die Klimaneutralität','climate neutrality','Bis 2050 soll Europa klimaneutral sein.','By 2050 Europe is to be climate-neutral.'),
    e('erneuerbare Energien','renewable energies','Erneuerbare Energien ersetzen fossile Brennstoffe.','Renewable energies replace fossil fuels.'),
    e('die Energiewende','energy transition','Die Energiewende ist politisch umstritten.','The energy transition is politically controversial.'),
    e('der Klimaschutz','climate protection','Klimaschutz ist eine globale Aufgabe.','Climate protection is a global task.'),
    e('die Biodiversität','biodiversity','Biodiversität ist für das Ökosystem lebenswichtig.','Biodiversity is vital for the ecosystem.'),
    e('das Artensterben','extinction of species','Das Artensterben bedroht das globale Ökosystem.','The extinction of species threatens the global ecosystem.'),
    e('die Entwaldung','deforestation','Entwaldung zerstört wichtige Lebensräume.','Deforestation destroys important habitats.'),
    e('der Meeresspiegel','sea level','Der steigende Meeresspiegel bedroht Küstenregionen.','The rising sea level threatens coastal regions.'),
    e('die Hitzewelle','heatwave','Hitzewellen werden durch den Klimawandel häufiger.','Heatwaves are becoming more frequent due to climate change.'),
    e('das Extremwetter','extreme weather','Extremwetterereignisse nehmen weltweit zu.','Extreme weather events are increasing worldwide.'),
    e('der Klimaflüchtling','climate refugee','Klimaflüchtlinge verlassen ihre Heimat wegen Naturkatastrophen.','Climate refugees leave their homeland because of natural disasters.'),
    e('die Nachhaltigkeit','sustainability','Nachhaltigkeit muss in allen Lebensbereichen gelten.','Sustainability must apply in all areas of life.'),
    e('die Kreislaufwirtschaft','circular economy','Eine Kreislaufwirtschaft minimiert Abfall.','A circular economy minimises waste.'),
    e('der Klimavertrag','climate agreement','Der Pariser Klimavertrag ist ein wichtiger Schritt.','The Paris Climate Agreement is an important step.'),
    e('die Klimakonferenz','climate conference','Auf der Klimakonferenz wurde über Ziele diskutiert.','At the climate conference goals were discussed.'),
    e('die Fossilenergie','fossil energy','Fossilenergie muss durch erneuerbare Energien ersetzt werden.','Fossil energy must be replaced by renewable energies.'),
  ]},

  // ══ INTERKULTURELLE MISSVERSTÄNDNISSE & KOMMUNIKATION ══════════
  { id:'B2_MISSVERSTAENDNISSE_KOMMUNIKATION', emoji:'🗣️', title:'INTERKULTURELLE KOMMUNIKATION & KONFLIKTE', level:'B2', entries:[
    e('das Missverständnis','misunderstanding','Kulturelle Missverständnisse entstehen oft unbewusst.','Cultural misunderstandings often arise unconsciously.'),
    e('das Klischee','cliché / stereotype','Klischees erschweren das gegenseitige Verständnis.','Clichés hinder mutual understanding.'),
    e('der Ethnozentrismus','ethnocentrism','Ethnozentrismus verhindert echtes interkulturelles Verständnis.','Ethnocentrism prevents genuine intercultural understanding.'),
    e('die Kommunikationsbarriere','communication barrier','Sprachliche Barrieren sind nur eine Form der Kommunikationsbarriere.','Linguistic barriers are only one form of communication barrier.'),
    e('das Tabu','taboo','Was in einer Kultur normal ist, kann in einer anderen ein Tabu sein.','What is normal in one culture can be a taboo in another.'),
    e('die Geste','gesture','Gesten haben in verschiedenen Kulturen verschiedene Bedeutungen.','Gestures have different meanings in different cultures.'),
    e('der Blickkontakt','eye contact','Blickkontakt ist kulturell unterschiedlich bewertet.','Eye contact is assessed differently across cultures.'),
    e('die Hierarchie','hierarchy','In manchen Kulturen ist Hierarchie sehr wichtig.','In some cultures hierarchy is very important.'),
    e('der Individualismus','individualism','Westliche Gesellschaften betonen Individualismus.','Western societies emphasise individualism.'),
    e('der Kollektivismus','collectivism','In kollektivistischen Kulturen steht die Gruppe im Vordergrund.','In collectivist cultures the group takes priority.'),
    e('die Gastfreundschaft','hospitality','Gastfreundschaft ist in vielen Kulturen heilig.','Hospitality is sacred in many cultures.'),
    e('der Zeitbegriff','concept of time','Der Zeitbegriff unterscheidet sich stark zwischen Kulturen.','The concept of time differs greatly between cultures.'),
    e('die Anpassung','adaptation / adjustment','Anpassung an neue Kulturen erfordert Offenheit.','Adaptation to new cultures requires openness.'),
    e('die Akzeptanz','acceptance','Gegenseitige Akzeptanz ist Grundlage des Zusammenlebens.','Mutual acceptance is the basis of living together.'),
    e('der Respekt','respect','Respekt ist universell, aber kulturell verschieden ausgedrückt.','Respect is universal but expressed differently across cultures.'),
    e('das Vorurteil','prejudice','Vorurteile lassen sich durch Begegnung abbauen.','Prejudices can be reduced through encounter.'),
    e('die interkulturelle Kompetenz','intercultural competence','Interkulturelle Kompetenz ist im Beruf sehr gefragt.','Intercultural competence is very much in demand at work.'),
    e('der Kulturschock','culture shock','Ein Kulturschock ist am Anfang oft normal.','Culture shock is often normal at the beginning.'),
    e('die Akkulturation','acculturation','Akkulturation beschreibt die Anpassung an eine neue Kultur.','Acculturation describes adaptation to a new culture.'),
    e('die Verständigung','communication / understanding','Verständigung ist möglich, auch ohne gemeinsame Sprache.','Communication is possible even without a common language.'),
  ]},
];

// Clean and add
cats.forEach(c => { c.entries = c.entries.map(entry => ({ ...entry, w: clean(entry.w) })); });
const out = [...data, ...cats];
fs.writeFileSync(FILE, JSON.stringify(out));
const added = cats.reduce((s, c) => s + c.entries.length, 0);
const b2 = out.filter(c => c.level === 'B2');
console.log(`Added ${cats.length} categories, ${added} words.`);
console.log(`B2 total: ${b2.length} categories, ${b2.reduce((s,c)=>s+c.entries.length,0)} words.`);
