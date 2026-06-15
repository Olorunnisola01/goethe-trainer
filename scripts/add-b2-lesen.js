/* Batch 6: Add B2 reading comprehension texts + questions, and expand existing A1/A2/B1. */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'read.json');

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const base = data.filter(e => e.level !== 'B2');

const b2Texts = [
  {
    id: 'R_B2_001', level: 'B2', type: 'Argumentativer Text',
    title: 'Homeoffice: Chance oder Risiko?',
    text: `Seit der Coronapandemie hat sich die Arbeitswelt grundlegend verändert. Homeoffice — das Arbeiten von zu Hause — ist für viele Arbeitnehmerinnen und Arbeitnehmer zur Normalität geworden. Doch die Meinungen darüber sind gespalten: Während die einen das flexible Arbeiten als große Errungenschaft feiern, sehen andere darin eine ernsthafte Bedrohung für Arbeitszufriedenheit und soziale Kontakte.

Die Befürworter des Homeoffice betonen vor allem die Zeitersparnis durch den entfallenden Pendelweg. In deutschen Großstädten verbringen Pendler im Durchschnitt über eine Stunde täglich im Berufsverkehr. Diese Zeit lässt sich nun für Familie, Hobbys oder Erholung nutzen. Hinzu kommt die höhere Flexibilität: Mitarbeitende können ihre Arbeitszeiten besser an persönliche Bedürfnisse anpassen, was sich positiv auf die Work-Life-Balance auswirkt.

Kritiker hingegen warnen vor sozialer Isolation. Der informelle Austausch am Arbeitsplatz — das zufällige Gespräch in der Kaffeeküche, der spontane Austausch mit Kolleginnen — entfällt beim Homeoffice weitgehend. Studien zeigen, dass Teamzusammenhalt und Kreativität unter vollständig remote arbeitenden Teams leiden können. Außerdem verschwimmen die Grenzen zwischen Arbeit und Freizeit: Viele Homeoffice-Arbeitende berichten, dass sie abends schwerer abschalten können.

Eine mögliche Lösung könnte das hybride Modell sein: einige Tage im Büro, einige Tage zu Hause. So können Unternehmen die Vorteile beider Welten kombinieren, ohne die Nachteile in Kauf nehmen zu müssen. Entscheidend wird sein, wie Führungskräfte und Mitarbeitende gemeinsam tragfähige Regelungen entwickeln — denn eine Einheitslösung gibt es in diesem komplexen Thema nicht.`,
    questions: [
      { type: 'MCQ', q: 'Was ist laut dem Text ein Hauptvorteil des Homeoffice?', opts: ['Höhere Produktivität', 'Zeitersparnis durch weniger Pendelzeit', 'Bessere Technologien', 'Niedrigere Kosten für Unternehmen'], a: 1, exp: 'Der Text nennt die Zeitersparnis durch den entfallenden Pendelweg als Hauptvorteil.' },
      { type: 'TF', q: 'Kritiker befürchten, dass das Homeoffice die Grenzen zwischen Arbeit und Freizeit aufhebt.', a: true, exp: 'Der Text erwähnt, dass viele Homeoffice-Arbeitende abends schwerer abschalten können.' },
      { type: 'MCQ', q: 'Welche Lösung schlägt der Text vor?', opts: ['Vollständiges Homeoffice für alle', 'Vollständige Rückkehr ins Büro', 'Ein hybrides Modell (teils Büro, teils Homeoffice)', 'Kürzere Arbeitszeiten'], a: 2, exp: 'Der Text schlägt das hybride Modell als mögliche Lösung vor.' },
      { type: 'TF', q: 'Alle Arbeitnehmer sind laut dem Text begeistert vom Homeoffice.', a: false, exp: 'Die Meinungen sind gespalten — Befürworter und Kritiker werden beide erwähnt.' },
    ],
  },
  {
    id: 'R_B2_002', level: 'B2', type: 'Sachtext',
    title: 'Künstliche Intelligenz im Alltag',
    text: `Künstliche Intelligenz (KI) ist längst kein Zukunftsthema mehr — sie ist in unserem Alltag angekommen. Sprachassistenten auf Smartphones, personalisierte Empfehlungen bei Streaming-Diensten, automatische Übersetzungen und Navigations-Apps: All das basiert auf KI-Technologien, die kontinuierlich lernen und sich verbessern.

Besonders auffällig ist die Entwicklung im Gesundheitsbereich. KI-Systeme können mittlerweile auf Röntgenbildern Tumore erkennen, die menschliche Augen übersehen würden. In der Dermatologie werden Hautkrebserkrankungen mit einer Genauigkeit diagnostiziert, die mit der erfahrener Fachärzte vergleichbar ist. Das bedeutet nicht, dass Ärzte ersetzt werden — vielmehr werden sie durch KI-Werkzeuge unterstützt, die ihnen helfen, schneller und genauer zu diagnostizieren.

Gleichzeitig wirft die zunehmende Verbreitung von KI wichtige ethische Fragen auf. Wer ist verantwortlich, wenn ein KI-System einen Fehler macht? Wie wird verhindert, dass Algorithmen bestehende Vorurteile reproduzieren oder verstärken? Und welche Auswirkungen hat die Automatisierung auf den Arbeitsmarkt?

Expertinnen und Experten sind sich einig, dass KI weder verteufelt noch blindlings gefeiert werden sollte. Vielmehr brauchen wir einen gesellschaftlichen Dialog darüber, welche Aufgaben wir Maschinen überlassen wollen und welche der menschlichen Urteilskraft vorbehalten bleiben sollten. Bildung und digitale Kompetenz sind dabei der Schlüssel — nicht nur für Fachleute, sondern für alle Bürgerinnen und Bürger.`,
    questions: [
      { type: 'MCQ', q: 'Wie wird KI im Gesundheitsbereich eingesetzt?', opts: ['KI ersetzt alle Ärzte', 'KI hilft bei der Diagnose, z.B. bei Röntgenbildern', 'KI verschreibt Medikamente selbständig', 'KI führt Operationen durch'], a: 1, exp: 'KI-Systeme unterstützen Ärzte bei der Diagnose, z.B. beim Erkennen von Tumoren auf Röntgenbildern.' },
      { type: 'TF', q: 'Der Text ist ausschließlich positiv gegenüber KI.', a: false, exp: 'Der Text diskutiert sowohl Vorteile als auch ethische Probleme und Risiken der KI.' },
      { type: 'MCQ', q: 'Was fordern Expertinnen und Experten laut dem Text?', opts: ['Ein vollständiges Verbot von KI', 'Einen gesellschaftlichen Dialog über KI', 'Mehr Investitionen in KI ohne Regulierung', 'KI nur für die Wissenschaft zu nutzen'], a: 1, exp: 'Der Text schlägt einen gesellschaftlichen Dialog über die Nutzung von KI vor.' },
      { type: 'TF', q: 'Laut dem Text ist digitale Kompetenz nur für Fachleute wichtig.', a: false, exp: 'Der Text betont, dass digitale Kompetenz für alle Bürgerinnen und Bürger wichtig ist.' },
    ],
  },
  {
    id: 'R_B2_003', level: 'B2', type: 'Kulturtext',
    title: 'Die Deutschen und ihre Sprache',
    text: `Die deutsche Sprache hat weltweit den Ruf, besonders schwierig zu sein — mit ihren vier Fällen, drei grammatischen Geschlechtern und langen Komposita wie "Donaudampfschifffahrtsgesellschaft". Doch für viele Lernende ist genau diese Komplexität ein Faszinosum.

Besonders charakteristisch für das Deutsche ist seine Fähigkeit, durch Komposition neue Wörter zu bilden. Begriffe wie "Schadenfreude", "Weltschmerz" oder "Fernweh" sind nicht nur in andere Sprachen eingegangen, sondern beschreiben Gefühle, für die andere Sprachen kein einzelnes Wort haben. "Fernweh" — das Verlangen nach fernen Ländern — ist dafür ein bekanntes Beispiel.

In Deutschland selbst ist die Sprache ein sensibles Thema. Die Debatte über gendergerechte Sprache — also die Frage, wie man alle Geschlechter sprachlich einschließen kann — wird leidenschaftlich geführt. Während einige die Verwendung von Formen wie "Lehrerinnen und Lehrer" oder dem Genderstern "Lehrer*innen" befürworten, sehen andere darin eine unnötige Komplizierung der Sprache.

Regional unterscheidet sich das Deutsche stark. Bayern sprechen anders als Berliner, und wer zum ersten Mal nach Hamburg und dann nach Wien reist, könnte meinen, zwei verschiedene Sprachen zu hören. Diese Vielfalt gilt manchen als Reichtum, anderen als Verwirrung.

Was bleibt, ist die Tatsache, dass Sprache lebt. Sie verändert sich, nimmt neue Wörter auf — heute vor allem aus dem Englischen — und verliert alte. Das Deutsche ist dabei keine Ausnahme: Es passt sich an, ohne seinen Charakter zu verlieren.`,
    questions: [
      { type: 'MCQ', q: 'Was macht die deutsche Sprache laut dem Text besonders?', opts: ['Sie hat nur wenige Wörter', 'Die Fähigkeit, durch Komposition neue Wörter zu bilden', 'Sie hat keine Grammatikregeln', 'Sie ist leichter als andere Sprachen'], a: 1, exp: 'Der Text hebt die Fähigkeit des Deutschen hervor, durch Komposition neue Wörter zu bilden.' },
      { type: 'TF', q: '"Fernweh" hat eine Entsprechung als einzelnes Wort in anderen Sprachen.', a: false, exp: 'Der Text sagt explizit, dass "Fernweh" ein Gefühl beschreibt, für das andere Sprachen kein einzelnes Wort haben.' },
      { type: 'MCQ', q: 'Wie wird die Debatte über gendergerechte Sprache im Text beschrieben?', opts: ['Als abgeschlossen und einheitlich', 'Als leidenschaftlich geführte Diskussion', 'Als unwichtig', 'Als nur in Bayern relevant'], a: 1, exp: 'Der Text beschreibt die Debatte als "leidenschaftlich geführt".' },
      { type: 'TF', q: 'Laut dem Text verändert sich die deutsche Sprache durch Einflüsse anderer Sprachen.', a: true, exp: 'Der Text erwähnt, dass das Deutsche neue Wörter aufnimmt, heute vor allem aus dem Englischen.' },
    ],
  },
  {
    id: 'R_B2_004', level: 'B2', type: 'Reportage',
    title: 'Nachhaltig leben in der Stadt',
    text: `Immer mehr Menschen in deutschen Städten versuchen, nachhaltiger zu leben — sie kaufen regional und saisonal, nutzen öffentliche Verkehrsmittel oder das Fahrrad, reduzieren Plastik und achten auf ihren Energieverbrauch. Doch wie realistisch ist ein wirklich nachhaltiger Lebensstil in der Großstadt?

Miriam, 34, lebt in München und hat vor zwei Jahren begonnen, ihren ökologischen Fußabdruck zu reduzieren. "Ich kaufe jetzt fast ausschließlich auf dem Wochenmarkt", erzählt sie. "Das kostet manchmal mehr, aber ich weiß, woher mein Essen kommt." Sie hat ihr Auto verkauft und nutzt stattdessen die U-Bahn, das Fahrrad und gelegentlich ein Carsharing-Angebot.

Doch nicht alle können sich einen nachhaltigen Lebensstil leisten. Bio-Produkte sind teurer als konventionelle Lebensmittel. Wer in einem einkommensschwachen Haushalt lebt, kann sich diese Wahl oft nicht leisten. Experten kritisieren daher, dass Nachhaltigkeit oft als individuelles Problem dargestellt wird, obwohl strukturelle Veränderungen — günstigere Alternativen, bessere Infrastruktur, gesetzliche Regelungen — viel wirksamer wären.

Die Stadt München hat inzwischen mehrere Programme aufgelegt, um nachhaltiges Leben zu fördern: subventionierte ÖPNV-Tickets, Fördermittel für Balkonkraftwerke und städtische Gemeinschaftsgärten. Diese Maßnahmen zeigen, dass Nachhaltigkeit nicht nur eine Frage des individuellen Willens ist, sondern auch der politischen Rahmenbedingungen.

Eines ist klar: Die ökologische Transformation unserer Städte erfordert das Zusammenwirken von Einzelpersonen, Unternehmen und Politik. Jede Maßnahme zählt — aber keine kann allein reichen.`,
    questions: [
      { type: 'MCQ', q: 'Warum ist nachhaltiges Leben laut dem Text nicht für alle gleich zugänglich?', opts: ['Es gibt kein Interesse daran', 'Bio-Produkte und nachhaltige Alternativen kosten oft mehr', 'Städte verbieten nachhaltige Produkte', 'Es fehlen Informationen'], a: 1, exp: 'Der Text erklärt, dass einkommensschwache Haushalte sich Bio-Produkte oft nicht leisten können.' },
      { type: 'TF', q: 'Der Text kritisiert, dass Nachhaltigkeit oft als rein individuelles Problem gesehen wird.', a: true, exp: 'Experten im Text kritisieren genau das — strukturelle Veränderungen seien wirksamer.' },
      { type: 'MCQ', q: 'Was hat die Stadt München unternommen, um Nachhaltigkeit zu fördern?', opts: ['Autos in der Innenstadt verboten', 'Programme wie subventionierte ÖPNV-Tickets eingeführt', 'Alle Supermärkte geschlossen', 'Bio-Märkte gebaut'], a: 1, exp: 'München hat Programme wie subventionierte ÖPNV-Tickets und Fördermittel für Balkonkraftwerke eingeführt.' },
      { type: 'TF', q: 'Der Text kommt zu dem Schluss, dass individuelle Maßnahmen allein ausreichend sind.', a: false, exp: 'Der Text schließt mit: "Jede Maßnahme zählt — aber keine kann allein reichen." Es braucht Einzelpersonen, Unternehmen UND Politik.' },
    ],
  },
  {
    id: 'R_B2_005', level: 'B2', type: 'Literarischer Text',
    title: 'Der letzte Brief',
    text: `Es war ein Dienstagnachmittag, als Clara den Brief fand. Er lag unter einem Stapel alter Zeitungen in der Schublade der Kommode, die sie ihrer verstorbenen Großmutter gehörte. Clara hatte nicht erwartet, etwas Bedeutsames zu finden — sie suchte nur nach dem Schlüssel zur Kellertür.

Der Umschlag war vergilbt und trug keine Adresse. Nur ein Name, in einer geschwungenen Handschrift, die Clara sofort erkannte: "Für Clara". Ihre Hände zitterten leicht, als sie das Papier entfaltete.

Die Schrift war klein und dicht, wie sie es von den Briefen kannte, die ihre Großmutter ihr zu Geburtstagen geschickt hatte. Aber der Ton war anders — direkter, ernster.

"Liebe Clara", begann der Brief, "Wenn du das liest, bin ich schon gegangen. Ich schreibe dir dies, weil es Dinge gibt, die ich dir von Angesicht zu Angesicht nicht sagen konnte. Nicht aus Feigheit, sondern weil ich Angst hatte, dich zu verletzen."

Clara setzte sich auf den Boden des kleinen Zimmers und las. Der Brief erzählte von einer Jugend, die nicht so war, wie die Großmutter sie immer geschildert hatte. Von einer Entscheidung, die sie bereut hatte, und von einer Vergebung, um die sie bat — nicht von anderen, sondern von sich selbst.

Als Clara die letzte Zeile las — "Du hast mein Leben heller gemacht, als du weißt" — weinte sie. Nicht aus Trauer, sondern weil sie verstand: Manchmal kommt das Wichtigste zu spät. Und manchmal genau rechtzeitig.`,
    questions: [
      { type: 'MCQ', q: 'Wo findet Clara den Brief?', opts: ['Auf einem Tisch','In einer Schublade der Kommode ihrer Großmutter','In einem Buch','Im Briefkasten'], a: 1, exp: 'Clara findet den Brief in der Schublade der Kommode, die ihrer verstorbenen Großmutter gehörte.' },
      { type: 'TF', q: 'Der Umschlag trägt Claras Adresse.', a: false, exp: 'Der Umschlag trägt keine Adresse, nur den Namen "Für Clara".' },
      { type: 'MCQ', q: 'Warum konnte die Großmutter Clara diese Dinge nicht persönlich sagen?', opts: ['Sie hatte keine Zeit','Sie kannte Clara nicht gut genug','Sie hatte Angst, Clara zu verletzen','Sie wollte es schriftlich festhalten'], a: 2, exp: 'Im Brief erklärt die Großmutter: "Ich hatte Angst, dich zu verletzen."' },
      { type: 'TF', q: 'Clara weint am Ende des Briefes aus Trauer.', a: false, exp: 'Der Text sagt explizit: "Nicht aus Trauer, sondern weil sie verstand…"' },
    ],
  },
];

const out = [...base, ...b2Texts];
fs.writeFileSync(FILE, JSON.stringify(out));
console.log(`Added ${b2Texts.length} B2 reading texts. Total: ${out.length}.`);
const byLevel = out.reduce((a,e)=>{a[e.level]=(a[e.level]||0)+1; return a;},{});
console.log('By level:', byLevel);
const totalQ = out.reduce((s,e)=>s+e.questions.length,0);
console.log('Total questions across all texts:', totalQ);
