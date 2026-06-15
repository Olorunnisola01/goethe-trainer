/* 1. Fix existing B2 entries: strip ", -en" / ", -s" / "(Sg.)" / "(Pl.)" etc from the w field
   2. Add next batch of ~500 B2 words from Aspekte neu B2 (continuing where we left off) */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'vocab.json');

// ── Strip grammatical annotations from the word field ──────────────────────
function cleanWord(w) {
  return w
    .replace(/,\s*["'\-–][^\s,()]*(\s*\/\s*["'\-–][^\s,()]*)?/g, '')  // ", -en" / ", -s" / ", "-e"
    .replace(/\s*\(Sg\.\)/g, '')          // (Sg.)
    .replace(/\s*\(Pl\.\)/g, '')          // (Pl.)
    .replace(/\s*\(ohne Artikel\)/g, '')  // (ohne Artikel)
    .replace(/\s*\(\+\s*[DAG]\.\)/g, '')  // (+ D.) / (+ A.) / (+ G.)
    .replace(/\s*\(nach\s*\+[^)]*\)/g, '') // (nach + D.) etc.
    .replace(/\s*\([a-z]\s*\+[^)]*\)/g, '') // (mit + D.) (von + D.) etc.
    .replace(/\s+$/, '')
    .trim();
}

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

// Fix existing B2 entries
let fixed = 0;
data.forEach(cat => {
  if (cat.level !== 'B2') return;
  cat.entries.forEach(e => {
    const cleaned = cleanWord(e.w);
    if (cleaned !== e.w) { e.w = cleaned; fixed++; }
  });
});
console.log(`Fixed ${fixed} existing B2 word entries.`);

// ── Next batch of B2 words ──────────────────────────────────────────────────
// Format: [word (no plural), English, German example, English translation]
function w(word, t, de, en) {
  return { w: cleanWord(word), t, de, en };
}

const newCats = [

  { id:'B2_HEIMAT2_VERBEN', emoji:'🏡', title:'HEIMAT & IDENTITÄT – VERBEN', level:'B2', entries:[
    w('empfinden','to feel / perceive','Ich empfinde eine tiefe Verbundenheit mit meiner Heimat.','I feel a deep connection to my homeland.'),
    w('sich beziehen auf','to refer to / relate to','Diese Aussage bezieht sich auf das aktuelle Problem.','This statement refers to the current problem.'),
    w('prägen','to shape / characterise','Die Kindheit prägt den Charakter eines Menschen.','Childhood shapes a person\'s character.'),
    w('entstammen','to originate from / descend from','Er entstammt einer Arbeiterfamilie.','He originates from a working-class family.'),
    w('annehmen','to accept / adopt','Sie hat die Herausforderung angenommen.','She accepted the challenge.'),
    w('einig sein (in + D.)','to be in agreement on','Wir sind uns in diesem Punkt einig.','We are in agreement on this point.'),
    w('veranstalten','to organise / hold (an event)','Wir veranstalten nächste Woche ein Fest.','We are holding a celebration next week.'),
    w('meinetwegen','as far as I\'m concerned / for my sake','Meinetwegen kannst du bleiben.','As far as I\'m concerned you can stay.'),
    w('entwickeln','to develop','Er hat eine neue Methode entwickelt.','He has developed a new method.'),
    w('anfügen','to add / append','Fügen Sie bitte die fehlenden Daten an.','Please append the missing data.'),
    w('ausbremsen','to slow down / frustrate','Bürokratie bremst viele Ideen aus.','Bureaucracy slows down many ideas.'),
    w('weitergehen','to continue / go on','Das Leben geht weiter.','Life goes on.'),
    w('verbergen','to hide / conceal','Sie konnte ihre Enttäuschung nicht verbergen.','She could not conceal her disappointment.'),
    w('leuchten','to glow / shine','Die Stadt leuchtet nachts sehr schön.','The city glows beautifully at night.'),
    w('zusammenbinden','to tie together / bundle','Er band die Pakete zusammen.','He tied the packages together.'),
    w('scheitern','to fail / come to nothing','Das Projekt ist gescheitert.','The project came to nothing.'),
    w('zerrissen','torn / divided','Er fühlt sich zwischen zwei Kulturen zerrissen.','He feels torn between two cultures.'),
    w('flechten','to braid / weave','Sie flicht ihre Haare jeden Morgen.','She braids her hair every morning.'),
    w('führen','to lead / run','Sie führt ein eigenes Geschäft.','She runs her own business.'),
    w('auflösen','to dissolve / cancel','Er musste seine Wohnung auflösen.','He had to give up his flat.'),
  ]},

  { id:'B2_POLITIK_VERTIEFEN', emoji:'🗳️', title:'POLITIK & GESELLSCHAFT VERTIEFT', level:'B2', entries:[
    w('die Bundestagsfraktion','parliamentary group in the Bundestag','Die Bundestagsfraktion diskutiert das Gesetz.','The parliamentary group in the Bundestag is discussing the law.'),
    w('die Bundestagswahl','federal election','Die Bundestagswahl findet alle vier Jahre statt.','The federal election takes place every four years.'),
    w('der Nationalfeiertag','national holiday','Am Nationalfeiertag ist alles geschlossen.','On the national holiday everything is closed.'),
    w('die Neutralität','neutrality','Die Neutralität der Schweiz ist weltbekannt.','Switzerland\'s neutrality is world-famous.'),
    w('die Protestaktion','protest action','Die Gewerkschaft organisierte eine Protestaktion.','The trade union organised a protest action.'),
    w('die Gründung','founding / establishment','Die Gründung des Vereins war vor zehn Jahren.','The founding of the club was ten years ago.'),
    w('die Koalition','coalition','Die Koalition hat neue Reformen geplant.','The coalition has planned new reforms.'),
    w('der Machtwechsel','change of power','Der Machtwechsel verlief friedlich.','The change of power was peaceful.'),
    w('initiieren','to initiate','Die Ministerin initiierte das Programm.','The minister initiated the programme.'),
    w('die Hilfsorganisation','aid organisation','Die Hilfsorganisation versorgt Flüchtlinge.','The aid organisation provides for refugees.'),
    w('gesetzlich','legal / statutory','Das ist gesetzlich vorgeschrieben.','That is legally prescribed.'),
    w('distanzieren (sich) (von + D.)','to distance oneself from','Er distanzierte sich von den Vorwürfen.','He distanced himself from the accusations.'),
    w('die Beteiligung','participation / involvement','Die Beteiligung der Bürger ist wichtig.','Citizens\' participation is important.'),
    w('zurückgeben','to return / give back','Die Regierung gab das Vertrauen nicht zurück.','The government did not return the trust.'),
    w('der Orden','order / decoration (medal)','Sie erhielt einen Orden für ihre Verdienste.','She received a decoration for her services.'),
    w('ernennen (zu + D.)','to appoint / name','Er wurde zum Minister ernannt.','He was appointed minister.'),
    w('die Laufbahn','career / professional path','Sie hat eine steile Laufbahn gemacht.','She has had a steep career.'),
    w('promovieren','to do a doctorate / obtain a PhD','Sie promoviert an der Universität Frankfurt.','She is doing her doctorate at Frankfurt University.'),
    w('die Entscheidung treffen','to make a decision','Die Regierung muss eine wichtige Entscheidung treffen.','The government must make an important decision.'),
    w('beitreten','to join (an organisation)','Er ist der Partei beigetreten.','He has joined the party.'),
  ]},

  { id:'B2_WIRTSCHAFT_UNTERNEHMEN', emoji:'🏭', title:'WIRTSCHAFT & UNTERNEHMEN', level:'B2', entries:[
    w('herstellen','to produce / manufacture','Das Unternehmen stellt Autos her.','The company manufactures cars.'),
    w('hierzulande','in this country / here','Hierzulande gelten andere Regeln.','Different rules apply in this country.'),
    w('konkurrenzfähig','competitive','Das Produkt muss konkurrenzfähig sein.','The product must be competitive.'),
    w('die Transparenz','transparency','Transparenz ist in der Wirtschaft wichtig.','Transparency is important in business.'),
    w('importieren','to import','Das Land importiert viel Öl.','The country imports a lot of oil.'),
    w('verlagern','to shift / relocate','Viele Firmen verlagern ihre Produktion.','Many companies relocate their production.'),
    w('die Manufaktur','manufactory / workshop','Dort werden Produkte in einer Manufaktur hergestellt.','Products are manufactured there in a workshop.'),
    w('die Grundvoraussetzung','basic prerequisite','Kapital ist eine Grundvoraussetzung für ein Unternehmen.','Capital is a basic prerequisite for a company.'),
    w('zutrauen','to believe someone capable of','Ich traue dir das zu.','I believe you are capable of that.'),
    w('hofieren','to court / flatter','Große Unternehmen werden von der Politik hofiert.','Large companies are courted by politicians.'),
    w('der Gerechtigkeitssinn','sense of justice','Ihr ausgeprägter Gerechtigkeitssinn ist bekannt.','Her strong sense of justice is well known.'),
    w('verzweifelt','desperate / frantic','Sie sucht verzweifelt nach einer Lösung.','She is desperately looking for a solution.'),
    w('respektvoll','respectful','Die Firma behandelt ihre Mitarbeiter respektvoll.','The company treats its employees respectfully.'),
    w('gefragt sein','to be in demand','Fachkräfte sind derzeit sehr gefragt.','Skilled workers are currently very much in demand.'),
    w('das Lob','praise','Das Lob des Chefs hat ihn motiviert.','The boss\'s praise motivated him.'),
    w('die Gewerkschaft','trade union','Die Gewerkschaft kämpft für bessere Löhne.','The trade union fights for better wages.'),
    w('avancieren (zu + D.)','to advance to / rise to','Sie avancierte zur Geschäftsführerin.','She advanced to become managing director.'),
    w('der Langzeitarbeitslose','long-term unemployed person','Es gibt viele Langzeitarbeitslose in der Region.','There are many long-term unemployed people in the region.'),
    w('überschüssig','surplus / excess','Überschüssige Lebensmittel werden gespendet.','Surplus food is donated.'),
    w('verderblich','perishable','Verderbliche Waren müssen gekühlt werden.','Perishable goods must be kept cool.'),
  ]},

  { id:'B2_WISSENSCHAFT_NATUR', emoji:'🌿', title:'WISSENSCHAFT & NATUR', level:'B2', entries:[
    w('die Prognose','prognosis / forecast','Die Prognose der Wissenschaftler ist besorgniserregend.','The scientists\' prognosis is alarming.'),
    w('die Spezies','species','Jedes Jahr sterben mehrere Spezies aus.','Several species become extinct every year.'),
    w('überleben','to survive','Nur die anpassungsfähigsten Tiere überleben.','Only the most adaptable animals survive.'),
    w('radioaktiv','radioactive','Radioaktive Strahlung ist gefährlich.','Radioactive radiation is dangerous.'),
    w('das Grundwasser','groundwater','Das Grundwasser wird durch Chemikalien verseucht.','The groundwater is being contaminated by chemicals.'),
    w('der Planet','planet','Die Erde ist ein einzigartiger Planet.','Earth is a unique planet.'),
    w('zerfallen','to decay / disintegrate','Radioaktive Materialien zerfallen sehr langsam.','Radioactive materials decay very slowly.'),
    w('bedroht','threatened / endangered','Viele Tierarten sind bedroht.','Many animal species are threatened.'),
    w('langlebig','long-lasting / durable','Plastik ist leider sehr langlebig.','Plastic is unfortunately very long-lasting.'),
    w('deprimierend','depressing','Die Umweltdaten sind deprimierend.','The environmental data is depressing.'),
    w('vergehen','to pass (time) / perish','Mit der Zeit verging die Erinnerung.','With time the memory faded.'),
    w('zurückerobern','to reconquer / reclaim','Die Natur hat das verlassene Gelände zurückerobert.','Nature has reclaimed the abandoned site.'),
    w('dramatisch','dramatic','Der Klimawandel hat dramatische Folgen.','Climate change has dramatic consequences.'),
    w('vermehren','to multiply / increase','Bakterien können sich sehr schnell vermehren.','Bacteria can multiply very quickly.'),
    w('versinken','to sink / be submerged','Die Küstenstädte drohen zu versinken.','The coastal cities are in danger of being submerged.'),
    w('die Vision','vision','Wir brauchen eine klare Vision für die Zukunft.','We need a clear vision for the future.'),
    w('die Struktur','structure','Die Struktur des Ökosystems ist komplex.','The structure of the ecosystem is complex.'),
    w('intakt','intact / undamaged','Das Ökosystem ist noch weitgehend intakt.','The ecosystem is still largely intact.'),
    w('hinterlassen','to leave behind','Die Industrie hat Schäden hinterlassen.','Industry has left behind damage.'),
    w('der Überrest','remnant / remains','Die Überreste der alten Fabrik wurden abgerissen.','The remnants of the old factory were demolished.'),
  ]},

  { id:'B2_SCHLAF_GESUNDHEIT', emoji:'😴', title:'SCHLAF, STRESS & GESUNDHEIT', level:'B2', entries:[
    w('der Schlafmangel','sleep deprivation','Schlafmangel beeinträchtigt die Konzentration.','Sleep deprivation impairs concentration.'),
    w('die Schlafstörung','sleep disorder','An Schlafstörungen leiden viele Menschen.','Many people suffer from sleep disorders.'),
    w('der Mittagsschlaf','afternoon nap','Ein kurzer Mittagsschlaf erhöht die Produktivität.','A short afternoon nap increases productivity.'),
    w('rastlos','restless','Er ist immer rastlos und kann kaum schlafen.','He is always restless and can barely sleep.'),
    w('dauerhaft','lasting / permanent','Dauerhafter Stress schadet der Gesundheit.','Lasting stress harms health.'),
    w('das Hirn','brain','Das Hirn benötigt ausreichend Schlaf.','The brain requires sufficient sleep.'),
    w('gleichermaßen','equally / alike','Schlafmangel schadet Körper und Geist gleichermaßen.','Sleep deprivation harms body and mind equally.'),
    w('ohnehin','anyway / in any case','Das wäre ohnehin zu spät gewesen.','That would have been too late anyway.'),
    w('vorbildlich','exemplary / model','Ihr Umgang mit Stress ist vorbildlich.','Her handling of stress is exemplary.'),
    w('solide','solid / sound','Eine solide Schlafbasis ist wichtig.','A solid sleep foundation is important.'),
    w('die Nervosität','nervousness / anxiety','Vor der Prüfung war ihre Nervosität spürbar.','Her nervousness before the exam was noticeable.'),
    w('rechtzeitig','in time / on time','Rechtzeitiges Einschlafen fördert die Erholung.','Going to sleep on time promotes recovery.'),
    w('verunsichern','to unsettle / disconcert','Schlechte Nachrichten können uns verunsichern.','Bad news can unsettle us.'),
    w('der Schlafexperte','sleep expert','Der Schlafexperte empfiehlt acht Stunden Schlaf.','The sleep expert recommends eight hours of sleep.'),
    w('das Fazit ziehen','to draw a conclusion','Am Ende zog er ein positives Fazit.','In the end he drew a positive conclusion.'),
    w('der Leserbrief','letter to the editor','Sie schrieb einen Leserbrief an die Zeitung.','She wrote a letter to the editor of the newspaper.'),
    w('betonen','to emphasise / stress','Er betonte die Wichtigkeit des Schlafs.','He emphasised the importance of sleep.'),
    w('das Schlaflabor','sleep laboratory','Im Schlaflabor werden Schlafstörungen untersucht.','Sleep disorders are investigated in the sleep laboratory.'),
    w('abwägen','to weigh up / consider','Man muss Vor- und Nachteile abwägen.','One must weigh up the advantages and disadvantages.'),
    w('der Kulturwandel','cultural shift / change in culture','Es braucht einen Kulturwandel in der Arbeitswelt.','A cultural shift is needed in the world of work.'),
  ]},

  { id:'B2_KUNST_LITERATUR', emoji:'📖', title:'LITERATUR & FILMKUNST', level:'B2', entries:[
    w('die Lektüre','reading / book','Die Lektüre des Romans hat mir sehr gefallen.','I really enjoyed reading the novel.'),
    w('klischeehaft','clichéd / stereotyped','Der Film war leider sehr klischeehaft.','The film was unfortunately very clichéd.'),
    w('die Melancholie','melancholy','Das Buch ist von einer tiefen Melancholie geprägt.','The book is characterised by a deep melancholy.'),
    w('philosophisch','philosophical','Der Roman ist sehr philosophisch.','The novel is very philosophical.'),
    w('gelungen','successful / well done','Die Verfilmung des Romans ist sehr gelungen.','The film adaptation of the novel is very well done.'),
    w('skeptisch (gegenüber + D.)','sceptical of / towards','Er ist gegenüber neuen Ideen skeptisch.','He is sceptical of new ideas.'),
    w('die Skepsis','scepticism','Mit Skepsis begegnet man dem Unbekannten.','One approaches the unknown with scepticism.'),
    w('die Resignation','resignation','Am Ende des Romans herrscht eine tiefe Resignation.','At the end of the novel there is a deep resignation.'),
    w('die Mischung','mixture / blend','Der Film ist eine gelungene Mischung aus Komödie und Drama.','The film is a successful mixture of comedy and drama.'),
    w('wundervoll','wonderful / marvellous','Die Aufführung war wundervoll.','The performance was wonderful.'),
    w('fraglich','questionable / doubtful','Ob das klappt, ist fraglich.','Whether that will work is questionable.'),
    w('reifen','to mature / ripen','Der Held reift im Laufe des Romans.','The hero matures in the course of the novel.'),
    w('die Überlegung','consideration / reflection','Nach reiflicher Überlegung lehnte sie ab.','After careful reflection she declined.'),
    w('unglaubwürdig','unbelievable / implausible','Die Handlung wirkte unglaubwürdig.','The plot seemed implausible.'),
    w('vorausgehen','to precede / go before','Dem Erfolg ging jahrelange Arbeit voraus.','Years of work preceded the success.'),
    w('angelehnt (an + A.)','inspired by / based on','Der Film ist an den Roman angelehnt.','The film is inspired by the novel.'),
    w('die Empfindung','sensation / feeling','Der Autor beschreibt feine Empfindungen.','The author describes subtle sensations.'),
    w('die Buchbesprechung','book review','Die Buchbesprechung erschien in der Zeitung.','The book review appeared in the newspaper.'),
    w('der Unterhaltungswert','entertainment value','Der Film hat einen hohen Unterhaltungswert.','The film has a high entertainment value.'),
    w('charakteristisch','characteristic / typical','Dieser Stil ist charakteristisch für den Autor.','This style is characteristic of the author.'),
  ]},

  { id:'B2_GEFUEHLE_AUSDRUCKE', emoji:'❤️', title:'GEFÜHLE & EMOTIONALE AUSDRÜCKE', level:'B2', entries:[
    w('das Fernweh','wanderlust','Das Fernweh treibt sie immer wieder ins Ausland.','Wanderlust keeps driving her abroad.'),
    w('das Heimweh','homesickness','Nach drei Monaten überkam ihn das Heimweh.','After three months homesickness overcame him.'),
    w('sehnen (sich) (nach + D.)','to long for / yearn for','Sie sehnt sich nach ihrer Familie.','She longs for her family.'),
    w('die Verzweiflung','despair / desperation','In der Verzweiflung machte er einen Fehler.','In despair he made a mistake.'),
    w('die Trauer','grief / sadness','Die Trauer um den Verstorbenen war groß.','The grief for the deceased was great.'),
    w('die Reue','remorse / regret','Er empfand tiefe Reue.','He felt deep remorse.'),
    w('der Zweifel','doubt','Ohne Zweifel hat sie recht.','Without doubt she is right.'),
    w('unsterblich','immortal / madly (in love)','Er ist unsterblich in sie verliebt.','He is madly in love with her.'),
    w('die Treue','loyalty / faithfulness','Ihre Treue zu Freunden ist bewundernswert.','Her loyalty to friends is admirable.'),
    w('überaus','exceedingly / extremely','Ich bin überaus dankbar für Ihre Hilfe.','I am exceedingly grateful for your help.'),
    w('zugleich','at the same time / simultaneously','Das ist zugleich traurig und wunderschön.','That is sad and beautiful at the same time.'),
    w('zurückkehren','to return / go back','Sie kehrte nach Jahren in ihre Heimat zurück.','She returned to her homeland after years.'),
    w('die Gunst','favour / goodwill','Er stand in der Gunst des Chefs.','He was in the favour of the boss.'),
    w('die Last','burden / load','Die Last der Verantwortung drückt ihn.','The burden of responsibility weighs on him.'),
    w('die Macht','power','Sprache hat eine große Macht.','Language has great power.'),
    w('das Schicksal','fate / destiny','Das Schicksal hat es so gewollt.','Fate willed it so.'),
    w('spüren','to feel / sense','Ich spüre, dass etwas nicht stimmt.','I sense that something is not right.'),
    w('gezeichnet sein','to be marked / scarred','Er ist von seiner schweren Kindheit gezeichnet.','He is scarred by his difficult childhood.'),
    w('hervorragend','outstanding / excellent','Die Leistung war hervorragend.','The performance was outstanding.'),
    w('smart','smart / clever (modern usage)','Er ist sehr smart und findet immer Lösungen.','He is very smart and always finds solutions.'),
  ]},

  { id:'B2_MEDIZIN_DIGITAL', emoji:'💊', title:'DIGITALE MEDIZIN & GESUNDHEITSTECHNIK', level:'B2', entries:[
    w('die Körpertemperatur','body temperature','Die Körpertemperatur kann per App gemessen werden.','Body temperature can be measured via an app.'),
    w('der Puls','pulse','Die Smartwatch misst kontinuierlich den Puls.','The smartwatch continuously measures the pulse.'),
    w('diagnostizieren','to diagnose','KI kann Krankheiten früh diagnostizieren.','AI can diagnose diseases early.'),
    w('optimieren','to optimise','Das System wird ständig optimiert.','The system is constantly being optimised.'),
    w('die Körpergröße','height (body)','Gib bitte deine Körpergröße ein.','Please enter your height.'),
    w('vermessen','to measure / survey','Das Gerät vermisst den Körper präzise.','The device measures the body precisely.'),
    w('lindern','to alleviate / relieve','Das Medikament lindert die Schmerzen.','The medicine alleviates the pain.'),
    w('der Sauerstoff','oxygen','Das Blut transportiert Sauerstoff im Körper.','Blood transports oxygen in the body.'),
    w('rasant','rapid / meteoric','Die medizinische Forschung entwickelt sich rasant.','Medical research is developing rapidly.'),
    w('umstritten','controversial','Die neue Behandlung ist medizinisch umstritten.','The new treatment is medically controversial.'),
    w('die Kontaktlinse','contact lens','Manche Kontaktlinsen können Gesundheitsdaten messen.','Some contact lenses can measure health data.'),
    w('die Krankenakte','medical record','Die Krankenakte wird digital gespeichert.','The medical record is stored digitally.'),
    w('simpel','simple / straightforward','Die Lösung ist überraschend simpel.','The solution is surprisingly simple.'),
    w('der Ärztemangel','shortage of doctors','Besonders auf dem Land herrscht Ärztemangel.','There is a particular shortage of doctors in rural areas.'),
    w('sträuben (sich) (gegen + A.)','to resist / bristle at','Viele Ärzte sträuben sich gegen Veränderungen.','Many doctors resist changes.'),
    w('die Neuerung','innovation / new development','Digitale Neuerungen verändern die Medizin.','Digital innovations are changing medicine.'),
    w('hinterherhinken','to lag behind','Manche Kliniken hinken der Digitalisierung hinterher.','Some clinics lag behind in digitalisation.'),
    w('aufkommen (für + A.)','to pay for / cover','Wer kommt für die Behandlungskosten auf?','Who will pay for the treatment costs?'),
    w('auswerten','to evaluate / analyse','Die gesammelten Daten müssen ausgewertet werden.','The collected data must be evaluated.'),
    w('bündeln','to pool / bundle','Wir bündeln die Gesundheitsdaten zentral.','We pool the health data centrally.'),
  ]},

  { id:'B2_REDEWENDUNGEN', emoji:'💡', title:'REDEWENDUNGEN & FESTE AUSDRÜCKE', level:'B2', entries:[
    w('auf Nummer sicher gehen','to play it safe','Bei so einer wichtigen Entscheidung gehe ich lieber auf Nummer sicher.','With such an important decision I prefer to play it safe.'),
    w('in der Lage sein (zu + Inf.)','to be in a position to / be able to','Bist du in der Lage, das alleine zu lösen?','Are you in a position to solve that alone?'),
    w('in Betracht kommen','to come into consideration','Diese Option kommt für uns nicht in Betracht.','This option does not come into consideration for us.'),
    w('bei der Sache bleiben','to stay focused / stick to the point','Bitte bleib bei der Sache und rede nicht um den heißen Brei.','Please stay focused and don\'t beat about the bush.'),
    w('auf die lange Bank schieben','to put on the back burner','Man darf das Problem nicht auf die lange Bank schieben.','One must not put the problem on the back burner.'),
    w('ein Resümee ziehen','to draw a conclusion / take stock','Am Jahresende zieht die Firma ein Resümee.','At the end of the year the company takes stock.'),
    w('unter Druck stehen','to be under pressure','Er steht beruflich ständig unter Druck.','He is constantly under pressure at work.'),
    w('zur Verfügung stehen','to be available','Ich stehe Ihnen jederzeit zur Verfügung.','I am available to you at any time.'),
    w('in Frage stellen','to call into question','Man sollte alte Gewohnheiten in Frage stellen.','One should call old habits into question.'),
    w('einen Beitrag leisten (zu + D.)','to make a contribution to','Jeder kann einen Beitrag zum Umweltschutz leisten.','Everyone can make a contribution to environmental protection.'),
    w('auf dem Vormarsch sein','to be on the advance','Englisch ist weltweit auf dem Vormarsch.','English is on the advance worldwide.'),
    w('in Windeseile','in no time / lightning-fast','Die Nachricht verbreitete sich in Windeseile.','The news spread in no time.'),
    w('meines Erachtens','in my opinion','Meines Erachtens ist das die beste Lösung.','In my opinion that is the best solution.'),
    w('auf den richtigen Weg bringen','to set on the right path','Der Trainer hat viele Jugendliche auf den richtigen Weg gebracht.','The trainer set many young people on the right path.'),
    w('aus heiterem Himmel','out of the blue','Die Kündigung kam aus heiterem Himmel.','The dismissal came out of the blue.'),
    w('ins Leben rufen','to create / launch','Der Verein wurde vor zehn Jahren ins Leben gerufen.','The association was launched ten years ago.'),
    w('in Aufregung versetzen','to cause excitement / stir up','Die Neuigkeit hat alle in Aufregung versetzt.','The news caused excitement among everyone.'),
    w('einen Schlag (auf einen Schlag)','at one stroke / all at once','Auf einen Schlag löste sich alles.','At one stroke everything resolved itself.'),
    w('unter Wasser stehen','to be flooded / overwhelmed','Nach dem Unwetter stand die Stadt unter Wasser.','After the storm the town was flooded.'),
    w('im Rahmen (von + D.)','in the context of / within the framework of','Im Rahmen des Projekts wurde viel erreicht.','A lot was achieved within the framework of the project.'),
  ]},

  { id:'B2_ADJEKTIVE_NOMEN_MIX', emoji:'🎯', title:'WICHTIGE ADJEKTIVE & NOMEN GEMISCHT', level:'B2', entries:[
    w('die Dringlichkeit','urgency','Die Dringlichkeit des Problems ist offensichtlich.','The urgency of the problem is obvious.'),
    w('die Abstammung','descent / origin','Seine Abstammung ist interessant.','His descent is interesting.'),
    w('die Hochschulreife','university entrance qualification (Abitur)','Mit der Hochschulreife kann man studieren.','With the university entrance qualification one can study.'),
    w('die Informatik','computer science','Sie studiert Informatik im dritten Semester.','She is studying computer science in her third semester.'),
    w('die Betriebswirtschaft','business administration','Er hat Betriebswirtschaft studiert.','He studied business administration.'),
    w('das Diplom','diploma','Sie hat ihr Diplom in Ingenieurwesen.','She has her diploma in engineering.'),
    w('der Durchbruch','breakthrough','Das war ein wichtiger Durchbruch.','That was an important breakthrough.'),
    w('der Einwanderer','immigrant','Viele Einwanderer kommen nach Deutschland.','Many immigrants come to Germany.'),
    w('der Lebensweg','path through life / life course','Jeder Mensch geht seinen eigenen Lebensweg.','Every person goes their own way through life.'),
    w('das Milieu','milieu / social environment','Das soziale Milieu beeinflusst die Entwicklung.','The social milieu influences development.'),
    w('der Vorbild','role model','Er ist ein Vorbild für seine jüngeren Geschwister.','He is a role model for his younger siblings.'),
    w('passioniert','passionate / enthusiastic','Sie ist eine passionierte Musikerin.','She is a passionate musician.'),
    w('kommerziell','commercial','Der Film war ein kommerzieller Erfolg.','The film was a commercial success.'),
    w('visuell','visual','Visuelles Lernen ist für manche besser.','Visual learning is better for some people.'),
    w('gläubig','devout / religious','Er ist sehr gläubig und geht jeden Sonntag in die Kirche.','He is very devout and goes to church every Sunday.'),
    w('geprägt (von + D.)','shaped / marked by','Ihr Leben ist von Erfahrungen im Ausland geprägt.','Her life is shaped by experiences abroad.'),
    w('stets','always / constantly','Er ist stets pünktlich und zuverlässig.','He is always punctual and reliable.'),
    w('treu (etw./jmd. treu bleiben)','true / loyal (to remain true to)','Sie blieb ihren Werten immer treu.','She always remained true to her values.'),
    w('begehrt','sought-after / desirable','Diese Stelle ist sehr begehrt.','This position is very sought-after.'),
    w('bürgerlich','civil / middle-class','Er kommt aus einer bürgerlichen Familie.','He comes from a middle-class family.'),
  ]},

];

// Clean all new entries
newCats.forEach(cat => {
  cat.entries = cat.entries.map(e => ({ ...e, w: cleanWord(e.w) }));
});

// Add new categories to data
const out = [...data, ...newCats];
fs.writeFileSync(FILE, JSON.stringify(out));

const newTotal = newCats.reduce((s, c) => s + c.entries.length, 0);
const b2Total = out.filter(c => c.level === 'B2').reduce((s, c) => s + c.entries.length, 0);
console.log(`Fixed ${fixed} existing word fields.`);
console.log(`Added ${newCats.length} new categories (${newTotal} words).`);
console.log(`B2 total: ${out.filter(c=>c.level==='B2').length} categories, ${b2Total} words.`);
