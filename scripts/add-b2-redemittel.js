/* Batch 3: Add B2 Redemittel categories to redemittel.json */
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'public', 'data', 'redemittel.json');

const b2Cats = [
  {
    cat: 'Meinung äußern & begründen', en: 'Expressing & justifying opinions',
    topic: 'Argumentation', level: 'B2',
    phrases: [
      { de: 'Meiner Meinung nach ist das ein wichtiges Thema.', en: 'In my opinion, this is an important topic.' },
      { de: 'Ich bin der Überzeugung, dass wir handeln müssen.', en: 'I am convinced that we must act.' },
      { de: 'Es steht außer Frage, dass Bildung wichtig ist.', en: 'There is no doubt that education is important.' },
      { de: 'Ich möchte betonen, dass dies kein einfaches Problem ist.', en: 'I would like to emphasise that this is not a simple problem.' },
      { de: 'Ich halte es für unerlässlich, dass wir zusammenarbeiten.', en: 'I consider it essential that we work together.' },
      { de: 'Das lässt sich damit begründen, dass …', en: 'This can be justified by the fact that …' },
      { de: 'Dafür spricht, dass …', en: 'In favour of this is the fact that …' },
      { de: 'Dagegen lässt sich einwenden, dass …', en: 'Against this one can object that …' },
      { de: 'Aus diesem Grund bin ich der Ansicht, dass …', en: 'For this reason I am of the opinion that …' },
      { de: 'Ich sehe das aus einer anderen Perspektive.', en: 'I see this from a different perspective.' },
    ],
  },
  {
    cat: 'Zustimmen & widersprechen', en: 'Agreeing & disagreeing',
    topic: 'Diskussion', level: 'B2',
    phrases: [
      { de: 'Da stimme ich Ihnen vollkommen zu.', en: 'I completely agree with you on that.' },
      { de: 'Das sehe ich genauso wie Sie.', en: 'I see it exactly the same way as you.' },
      { de: 'Sie haben absolut Recht damit.', en: 'You are absolutely right about that.' },
      { de: 'Ich muss Ihnen in diesem Punkt widersprechen.', en: 'I must disagree with you on this point.' },
      { de: 'Das kann ich so nicht stehen lassen.', en: 'I cannot let that stand unchallenged.' },
      { de: 'Da bin ich anderer Meinung.', en: 'I disagree on that.' },
      { de: 'Einerseits haben Sie Recht, andererseits …', en: 'On the one hand you are right, on the other hand …' },
      { de: 'Das mag stimmen, aber man sollte auch bedenken, dass …', en: 'That may be true, but one should also consider that …' },
      { de: 'Ich kann Ihren Standpunkt verstehen, teile ihn aber nicht.', en: 'I can understand your point of view, but I do not share it.' },
      { de: 'Das sehe ich etwas differenzierter.', en: 'I see that in a more nuanced way.' },
    ],
  },
  {
    cat: 'Vor- und Nachteile abwägen', en: 'Weighing up advantages and disadvantages',
    topic: 'Argumentation', level: 'B2',
    phrases: [
      { de: 'Ein wesentlicher Vorteil ist, dass …', en: 'A significant advantage is that …' },
      { de: 'Ein nicht zu unterschätzender Nachteil besteht darin, dass …', en: 'A not-to-be-underestimated disadvantage consists in the fact that …' },
      { de: 'Auf der einen Seite … auf der anderen Seite …', en: 'On the one side … on the other side …' },
      { de: 'Es ist nicht von der Hand zu weisen, dass …', en: 'It cannot be denied that …' },
      { de: 'Hinzu kommt, dass …', en: 'Added to this is the fact that …' },
      { de: 'Abgesehen davon, dass …', en: 'Apart from the fact that …' },
      { de: 'Letztendlich überwiegen die Vorteile.', en: 'Ultimately the advantages outweigh the disadvantages.' },
      { de: 'Alles in allem lässt sich sagen, dass …', en: 'All in all one can say that …' },
      { de: 'Wenn man die Vor- und Nachteile abwägt, …', en: 'When weighing up the pros and cons, …' },
      { de: 'Im Vergleich dazu ist … deutlich besser.', en: 'In comparison to that, … is clearly better.' },
    ],
  },
  {
    cat: 'Probleme beschreiben & Lösungen vorschlagen', en: 'Describing problems & suggesting solutions',
    topic: 'Diskussion', level: 'B2',
    phrases: [
      { de: 'Das eigentliche Problem liegt darin, dass …', en: 'The actual problem lies in the fact that …' },
      { de: 'Es handelt sich hierbei um ein strukturelles Problem.', en: 'This is a structural problem.' },
      { de: 'Eine mögliche Lösung wäre, wenn …', en: 'A possible solution would be if …' },
      { de: 'Man könnte das Problem beheben, indem man …', en: 'One could solve the problem by …' },
      { de: 'Es wäre sinnvoll, mehr in Bildung zu investieren.', en: 'It would make sense to invest more in education.' },
      { de: 'Ich schlage vor, dass wir zunächst …', en: 'I suggest that we first …' },
      { de: 'Um dem entgegenzuwirken, sollte man …', en: 'To counteract this, one should …' },
      { de: 'Entscheidend ist, dass alle Beteiligten zusammenarbeiten.', en: 'What is decisive is that all involved work together.' },
      { de: 'Auf lange Sicht ist das keine nachhaltige Lösung.', en: 'In the long run that is not a sustainable solution.' },
      { de: 'Kurzfristig könnte man …, langfristig sollte man …', en: 'In the short term one could …, in the long term one should …' },
    ],
  },
  {
    cat: 'Hypothesen & Bedingungen ausdrücken', en: 'Expressing hypotheses & conditions',
    topic: 'Argumentation', level: 'B2',
    phrases: [
      { de: 'Wenn man davon ausgeht, dass …, dann …', en: 'If one assumes that …, then …' },
      { de: 'Angenommen, das stimmt, dann müssten wir …', en: 'Assuming that is true, we would have to …' },
      { de: 'Unter der Voraussetzung, dass …', en: 'On the condition that …' },
      { de: 'Das würde bedeuten, dass …', en: 'That would mean that …' },
      { de: 'Sofern das zutrifft, …', en: 'Insofar as that is the case, …' },
      { de: 'Im Falle, dass … eintritt, …', en: 'In the event that … occurs, …' },
      { de: 'Selbst wenn das der Fall wäre, …', en: 'Even if that were the case, …' },
      { de: 'Das würde voraussetzen, dass …', en: 'That would presuppose that …' },
      { de: 'Es könnte sein, dass … — das lässt sich jedoch nicht belegen.', en: 'It could be that … — however, that cannot be proven.' },
      { de: 'Rein hypothetisch gesehen, …', en: 'Purely hypothetically speaking, …' },
    ],
  },
  {
    cat: 'Texte zusammenfassen & referieren', en: 'Summarising texts & reporting',
    topic: 'Schreiben & Lesen', level: 'B2',
    phrases: [
      { de: 'Der Text / Artikel befasst sich mit dem Thema …', en: 'The text / article deals with the topic of …' },
      { de: 'Im Mittelpunkt steht die Frage, ob …', en: 'At the centre is the question of whether …' },
      { de: 'Der Autor / Die Autorin vertritt die These, dass …', en: 'The author argues the thesis that …' },
      { de: 'Als Beleg führt er / sie an, dass …', en: 'As evidence he / she cites the fact that …' },
      { de: 'Zusammenfassend lässt sich sagen, dass …', en: 'In summary one can say that …' },
      { de: 'Abschließend kommt der Autor zu dem Schluss, dass …', en: 'In conclusion the author arrives at the conclusion that …' },
      { de: 'Laut dem Artikel / der Studie …', en: 'According to the article / the study …' },
      { de: 'Der Verfasser stellt fest, dass …', en: 'The author notes that …' },
      { de: 'Darüber hinaus wird darauf hingewiesen, dass …', en: 'Furthermore, it is pointed out that …' },
      { de: 'Der Text gibt Anlass zu der Frage, ob …', en: 'The text gives cause to the question of whether …' },
    ],
  },
  {
    cat: 'Bewerbung & formelle Kommunikation', en: 'Applications & formal communication',
    topic: 'Beruf', level: 'B2',
    phrases: [
      { de: 'Hiermit bewerbe ich mich um die ausgeschriebene Stelle als …', en: 'I hereby apply for the advertised position as …' },
      { de: 'Ich bin überzeugt, dass ich Ihren Anforderungen entspreche.', en: 'I am convinced that I meet your requirements.' },
      { de: 'Meine Kenntnisse und Erfahrungen passen ideal zu dieser Stelle.', en: 'My knowledge and experience are ideally suited to this position.' },
      { de: 'Ich freue mich auf ein persönliches Gespräch.', en: 'I look forward to a personal conversation.' },
      { de: 'Ich stehe Ihnen für Rückfragen gern zur Verfügung.', en: 'I am happy to be available for any questions.' },
      { de: 'Im Anhang finden Sie meine vollständigen Bewerbungsunterlagen.', en: 'In the attachment you will find my complete application documents.' },
      { de: 'Mit freundlichen Grüßen', en: 'Yours sincerely' },
      { de: 'Bezug nehmend auf Ihre Stellenanzeige …', en: 'With reference to your job advertisement …' },
      { de: 'Ich erlauben mir, Ihnen meine Bewerbung zu übersenden.', en: 'I take the liberty of sending you my application.' },
      { de: 'Ich bin derzeit auf der Suche nach einer neuen beruflichen Herausforderung.', en: 'I am currently looking for a new professional challenge.' },
    ],
  },
  {
    cat: 'Verhandeln & Kompromisse finden', en: 'Negotiating & finding compromises',
    topic: 'Beruf & Diskussion', level: 'B2',
    phrases: [
      { de: 'Ich wäre bereit, einen Kompromiss zu finden.', en: 'I would be willing to find a compromise.' },
      { de: 'Könnten wir uns auf … einigen?', en: 'Could we agree on …?' },
      { de: 'Das ist für mich nicht akzeptabel.', en: 'That is not acceptable to me.' },
      { de: 'Unter welchen Bedingungen wären Sie bereit, …?', en: 'Under what conditions would you be willing to …?' },
      { de: 'Ich denke, wir sollten aufeinander zugehen.', en: 'I think we should meet each other halfway.' },
      { de: 'Das ist ein fairer Vorschlag.', en: 'That is a fair proposal.' },
      { de: 'Ich schlage folgende Lösung vor: …', en: 'I suggest the following solution: …' },
      { de: 'Wir sind uns in diesem Punkt einig.', en: 'We are in agreement on this point.' },
      { de: 'Ich behalte mir vor, das nochmals zu überdenken.', en: 'I reserve the right to reconsider that.' },
      { de: 'Lassen Sie uns einen Mittelweg finden.', en: 'Let us find a middle way.' },
    ],
  },
];

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const base = data.filter(c => c.level !== 'B2');
const out = [...base, ...b2Cats];
fs.writeFileSync(FILE, JSON.stringify(out));
const phrases = b2Cats.reduce((s,c)=>s+c.phrases.length,0);
console.log(`Added ${b2Cats.length} B2 Redemittel categories (${phrases} phrases). Total: ${out.length} categories.`);
