/* Rebuild stories.json from the separate level files, apply expansions, add B2. */
const fs = require('fs');
const path = require('path');
const load = f => JSON.parse(fs.readFileSync(path.join(__dirname,'..','public','data',f),'utf8').replace(/^﻿/,''));

// ── Expanded versions (replace originals by id) ─────────────────────────────
const expansions = {
  'S001': { de:`Ich heiße Lena und ich wohne in Hamburg. Jeden Morgen stehe ich um sieben Uhr auf. Mein Wecker klingelt laut. Ich gehe zuerst ins Badezimmer. Dort wasche ich mein Gesicht mit kaltem Wasser. Das hilft mir, wach zu werden. Dann putze ich meine Zähne. Das dauert zwei Minuten.

Danach gehe ich in die Küche. Ich trinke zuerst ein Glas Wasser. Dann mache ich Kaffee. Ich mag meinen Kaffee mit Milch und ohne Zucker. Zum Frühstück esse ich ein Brot mit Butter und Marmelade. Manchmal esse ich auch ein Ei. Das Frühstück ist meine Lieblingsmahlzeit.

Während ich esse, höre ich Radio. Ich mag Musik am Morgen. Sie macht mich glücklich. Um halb acht ziehe ich mich an. Ich schaue aus dem Fenster. Wenn es regnet, nehme ich meinen Regenschirm. Wenn die Sonne scheint, freue ich mich.

Um acht Uhr verlasse ich das Haus. Ich gehe zu Fuß zur U-Bahn-Station. Das dauert fünf Minuten. Die U-Bahn fährt mich zur Arbeit. Ich arbeite in einem Büro in der Stadtmitte. Meine Kolleginnen und Kollegen sind sehr nett. Der Tag beginnt gut, wenn der Morgen gut beginnt.`,
    en:`My name is Lena and I live in Hamburg. Every morning I get up at seven o'clock. My alarm clock rings loudly. I first go to the bathroom. There I wash my face with cold water. That helps me to wake up. Then I brush my teeth. That takes two minutes.

After that I go to the kitchen. I first drink a glass of water. Then I make coffee. I like my coffee with milk and without sugar. For breakfast I eat a slice of bread with butter and jam. Sometimes I also eat an egg. Breakfast is my favourite meal.

While I eat, I listen to the radio. I like music in the morning. It makes me happy. At half past seven I get dressed. I look out of the window. If it is raining I take my umbrella. If the sun is shining I am happy.

At eight o'clock I leave the house. I walk to the underground station. That takes five minutes. The underground takes me to work. I work in an office in the city centre. My colleagues are very nice. The day begins well when the morning begins well.`,
    vocab:[{de:'der Wecker',en:'alarm clock'},{de:'das Frühstück',en:'breakfast'},{de:'der Regenschirm',en:'umbrella'},{de:'die Stadtmitte',en:'city centre'}]},

  'S002': { de:`Ich heiße Jonas und ich komme aus München. Ich habe eine große Familie. Meine Eltern heißen Thomas und Anna. Mein Vater ist fünfundvierzig Jahre alt. Er arbeitet als Ingenieur. Er ist groß und hat braune Haare. Meine Mutter ist zweiundvierzig Jahre alt. Sie ist Lehrerin in einer Grundschule. Sie hat lange blonde Haare und blaue Augen.

Ich habe zwei Geschwister. Meine Schwester heißt Lisa. Sie ist siebzehn Jahre alt und geht noch zur Schule. Sie liest sehr gern und mag Musik. Mein Bruder heißt Max. Er ist zehn Jahre alt. Max spielt gern Fußball und hat viele Freunde. Wir streiten manchmal, aber wir helfen uns auch.

Wir haben auch ein Haustier — einen Hund namens Bello. Bello ist drei Jahre alt und sehr freundlich. Er spielt gern mit uns im Garten. Jeden Abend gehe ich mit Bello spazieren. Das macht mir viel Spaß.

Am Wochenende essen wir immer zusammen. Meine Mutter kocht sehr gut. Am Sonntag machen wir oft Ausflüge in die Berge oder an den See. Das ist meine Lieblingszeit. Ich liebe meine Familie sehr. Sie gibt mir Kraft und Freude jeden Tag.`,
    en:`My name is Jonas and I come from Munich. I have a big family. My parents are called Thomas and Anna. My father is forty-five years old. He works as an engineer. He is tall and has brown hair. My mother is forty-two years old. She is a teacher at a primary school. She has long blonde hair and blue eyes.

I have two siblings. My sister is called Lisa. She is seventeen years old and still goes to school. She loves reading and likes music. My brother is called Max. He is ten years old. Max likes playing football and has many friends. We sometimes argue, but we also help each other.

We also have a pet — a dog called Bello. Bello is three years old and very friendly. He likes playing with us in the garden. Every evening I go for a walk with Bello. I really enjoy that.

At the weekend we always eat together. My mother cooks very well. On Sundays we often make trips to the mountains or to the lake. That is my favourite time. I love my family very much. They give me strength and joy every day.`,
    vocab:[{de:'die Geschwister',en:'siblings'},{de:'die Grundschule',en:'primary school'},{de:'das Haustier',en:'pet'},{de:'der Ausflug',en:'excursion / trip'}]},

  'S003': { de:`Heute gehe ich einkaufen. Ich brauche viele Dinge für die Woche. Zuerst schreibe ich eine Einkaufsliste. Ich brauche Brot, Milch, Käse, Eier, Äpfel, Tomaten, Nudeln und Joghurt. Meine Einkaufsliste ist lang.

Ich gehe zu Fuß zum Supermarkt. Er ist nur fünf Minuten von meiner Wohnung entfernt. Am Eingang nehme ich einen Einkaufswagen. Der Supermarkt ist groß und hell. Es gibt viele Regale mit vielen Produkten.

Zuerst gehe ich in die Obst- und Gemüseabteilung. Ich suche frische Tomaten und grüne Äpfel. Die Äpfel kosten zwei Euro pro Kilogramm. Dann gehe ich zur Milchabteilung. Dort finde ich Milch, Joghurt und Käse. Ich nehme fettarme Milch und griechischen Joghurt.

In der Brotabteilung gibt es viele verschiedene Brote. Ich kaufe ein Vollkornbrot — das ist gesund. Dann nehme ich Eier aus dem Regal. Ich kaufe immer sechs Eier. Zuletzt nehme ich Nudeln.

An der Kasse warte ich kurz. Eine Frau vor mir kauft sehr viel. Dann komme ich dran. Die Kassiererin ist freundlich und lächelt. Ich bezahle neunzehn Euro fünfzig. Ich zahle mit Karte. Dann packe ich alles in meine Tasche und gehe nach Hause. Das Einkaufen ist erledigt.`,
    en:`Today I am going shopping. I need many things for the week. First I write a shopping list. I need bread, milk, cheese, eggs, apples, tomatoes, pasta and yoghurt. My shopping list is long.

I walk to the supermarket. It is only five minutes from my flat. At the entrance I take a shopping trolley. The supermarket is big and bright. There are many shelves with many products.

First I go to the fruit and vegetable section. I am looking for fresh tomatoes and green apples. The apples cost two euros per kilogram. Then I go to the dairy section. There I find milk, yoghurt and cheese. I take low-fat milk and Greek yoghurt.

In the bread section there are many different breads. I buy a wholemeal bread — that is healthy. Then I take eggs from the shelf. I always buy six eggs. Finally I take pasta.

At the checkout I wait briefly. A woman in front of me is buying a lot. Then it is my turn. The cashier is friendly and smiles. I pay nineteen euros fifty. I pay by card. Then I pack everything in my bag and go home. The shopping is done.`,
    vocab:[{de:'die Einkaufsliste',en:'shopping list'},{de:'das Regal',en:'shelf'},{de:'die Kasse',en:'checkout / till'},{de:'das Vollkornbrot',en:'wholemeal bread'}]},

  'S004': { de:`Ich habe einen Hund. Er heißt Bello und ist vier Jahre alt. Bello ist ein Labrador. Er hat goldenes Fell und große braune Augen. Er ist sehr schön und sehr freundlich. Alle Leute mögen Bello.

Bello schläft jeden Nacht in seinem Korb neben meinem Bett. Morgens wacht er auf, wenn ich aufwache. Er wedelt sofort mit dem Schwanz. Das macht mich glücklich. Wir frühstücken zusammen — ich esse Brot und Bello bekommt sein Hundefutter.

Jeden Morgen und jeden Abend gehe ich mit Bello spazieren. Wir gehen in den Park in der Nähe. Bello liebt den Park. Er läuft sehr schnell und spielt gern mit anderen Hunden. Manchmal bringt er mir einen Stock zurück. Das macht sehr viel Spaß.

Bello ist auch sehr klug. Er kennt viele Befehle: Sitz, Platz, Bleib und Komm. Wenn ich nach Hause komme, bellt er nicht. Er bringt mir manchmal meine Schuhe. Das ist sehr lustig.

Am Wochenende fahren wir manchmal in den Wald. Bello liebt die Natur. Er riecht an Blumen und Bäumen. Er springt in Pfützen und wird dann ganz nass. Zu Hause muss ich ihn dann waschen. Das mag er nicht so gern. Aber ich liebe meinen Hund sehr. Er ist mein bester Freund.`,
    en:`I have a dog. He is called Bello and is four years old. Bello is a Labrador. He has golden fur and big brown eyes. He is very beautiful and very friendly. Everyone likes Bello.

Bello sleeps every night in his basket next to my bed. In the morning he wakes up when I wake up. He immediately wags his tail. That makes me happy. We have breakfast together — I eat bread and Bello gets his dog food.

Every morning and every evening I go for a walk with Bello. We go to the park nearby. Bello loves the park. He runs very fast and likes playing with other dogs. Sometimes he brings me a stick back. That is great fun.

Bello is also very clever. He knows many commands: Sit, Down, Stay and Come. When I come home he does not bark. He sometimes brings me my shoes. That is very funny.

At the weekend we sometimes drive to the forest. Bello loves nature. He sniffs at flowers and trees. He jumps in puddles and then gets completely wet. At home I then have to wash him. He does not like that much. But I love my dog very much. He is my best friend.`,
    vocab:[{de:'der Schwanz',en:'tail'},{de:'das Hundefutter',en:'dog food'},{de:'der Befehl',en:'command'},{de:'die Pfütze',en:'puddle'}]},

  'S005': { de:`Heute gehe ich mit meiner Freundin Sarah in ein Restaurant. Das Restaurant heißt "Zur Sonne" und liegt in der Altstadt. Es ist ein gemütliches Restaurant mit roten Stühlen und kleinen Tischen. An den Wänden hängen schöne Bilder.

Ein Kellner kommt zu uns. Er ist freundlich und begrüßt uns mit einem Lächeln. Er gibt uns die Speisekarte. Die Speisekarte ist auf Deutsch und auf Englisch. Es gibt viele Gerichte zur Auswahl — Suppen, Salate, Fleischgerichte und vegetarische Gerichte.

Ich bestelle zuerst eine Tomatensuppe als Vorspeise. Als Hauptgericht nehme ich Schnitzel mit Pommes frites und Salat. Sarah bestellt eine Gemüsesuppe und dann Pasta mit Tomatensauce. Zum Trinken bestellen wir Wasser und zwei Gläser Weißwein.

Die Suppe kommt schnell. Sie ist heiß und sehr lecker. Das Schnitzel ist groß und knusprig. Der Salat ist frisch mit einer leichten Vinaigrette. Sarah ist auch sehr zufrieden mit ihrer Pasta.

Nach dem Essen bestellen wir noch einen Kaffee. Dann kommt die Rechnung. Wir bezahlen zusammen — das macht fünfzig Euro. Wir geben dem Kellner ein Trinkgeld. Das Restaurant war sehr gut. Wir kommen sicher wieder.`,
    en:`Today I am going to a restaurant with my friend Sarah. The restaurant is called "Zur Sonne" and is in the old town. It is a cosy restaurant with red chairs and small tables. Beautiful pictures hang on the walls.

A waiter comes to us. He is friendly and greets us with a smile. He gives us the menu. The menu is in German and in English. There are many dishes to choose from — soups, salads, meat dishes and vegetarian dishes.

I first order a tomato soup as a starter. As a main course I have schnitzel with chips and salad. Sarah orders a vegetable soup and then pasta with tomato sauce. To drink we order water and two glasses of white wine.

The soup comes quickly. It is hot and very tasty. The schnitzel is large and crispy. The salad is fresh with a light vinaigrette. Sarah is also very pleased with her pasta.

After the meal we order a coffee. Then the bill comes. We pay together — that comes to fifty euros. We give the waiter a tip. The restaurant was very good. We will certainly come again.`,
    vocab:[{de:'die Speisekarte',en:'menu'},{de:'die Vorspeise',en:'starter'},{de:'das Hauptgericht',en:'main course'},{de:'die Rechnung',en:'bill'}]},
};

// ── B2 new stories ──────────────────────────────────────────────────────────
const b2Stories = [
  { id:'SB2_001', num:1, title:'Der Karrierewechsel', titleEn:'The Career Change', level:'B2',
    de:`Miriam hatte zehn Jahre lang als Controllerin in einem großen Pharmaunternehmen gearbeitet. Das Gehalt war gut, die Aufstiegschancen waren vorhanden, und ihre Vorgesetzte schätzte ihre Arbeit. Trotzdem fehlte ihr etwas — ein Gefühl von Sinn, das sie zunehmend vermisste.

Der Wendepunkt kam an einem grauen Dienstagmorgen im November. Miriam saß in einer Besprechung über Quartalszahlen und bemerkte plötzlich, dass sie innerlich völlig abwesend war. Ihre Gedanken wanderten zu einem Wochenendkurs, den sie im Sommer belegt hatte: Erste Hilfe für psychische Krisen. Die Kursleiterin hatte gesagt, dass ausgebildete Begleiter in Deutschland dringend gesucht würden.

In den folgenden Wochen informierte sich Miriam intensiv. Sie las Berichte von Menschen, die aus der Finanzbranche in soziale Berufe gewechselt hatten. Sie sprach mit einer Karriereberaterin, die ihr half, ihre Stärken neu zu bewerten — analytisches Denken, Empathie, strukturiertes Arbeiten. Diese Fähigkeiten wären auch in der psychosozialen Beratung wertvoll.

Die Entscheidung fiel ihr nicht leicht. Ein Masterstudium in Psychologie würde drei Jahre dauern. Sie würde weniger verdienen und vieles aufgeben müssen. Aber der Gedanke, täglich etwas Bedeutsames zu tun, überwog.

Heute, zwei Jahre nach dem Beginn ihres Studiums, arbeitet Miriam als studentische Hilfskraft in einer Beratungsstelle für junge Menschen mit Burnout. Sie verdient deutlich weniger als früher. Aber wenn sie abends nach Hause kommt, fühlt sie sich nicht leer, sondern erfüllt. Manche Entscheidungen kosten viel — und sind genau deshalb die richtigen.`,
    en:`Miriam had worked for ten years as a controller in a large pharmaceutical company. The salary was good, promotion prospects were there, and her supervisor valued her work. Nevertheless, something was missing — a sense of meaning that she increasingly missed.

The turning point came on a grey Tuesday morning in November. Miriam was sitting in a meeting about quarterly figures and suddenly noticed that she was completely absent internally. Her thoughts wandered to a weekend course she had done in the summer: first aid for psychological crises. The course leader had said that trained companions were urgently needed in Germany.

In the following weeks Miriam researched intensively. She read reports from people who had switched from the financial sector to social professions. She spoke with a career advisor who helped her reassess her strengths — analytical thinking, empathy, structured working. These skills would also be valuable in psychosocial counselling.

The decision was not easy for her. A master's degree in psychology would take three years. She would earn less and have to give up much. But the thought of doing something meaningful every day outweighed everything.

Today, two years after starting her studies, Miriam works as a student assistant in a counselling centre for young people with burnout. She earns significantly less than before. But when she comes home in the evening, she does not feel empty but fulfilled. Some decisions cost a lot — and are precisely the right ones for that reason.`,
    vocab:[{de:'der Wendepunkt',en:'turning point'},{de:'die Aufstiegschancen',en:'promotion prospects'},{de:'die psychosoziale Beratung',en:'psychosocial counselling'},{de:'erfüllt',en:'fulfilled'}]},

  { id:'SB2_002', num:2, title:'Zwischen zwei Kulturen', titleEn:'Between Two Cultures', level:'B2',
    de:`Amara wurde in Accra geboren und kam mit sieben Jahren nach Deutschland. Ihre Eltern hatten sich bewusst für Köln entschieden — eine offene Stadt mit einer internationalen Bevölkerung. Trotzdem erlebte Amara in der Schule Momente, in denen sie merkte, dass sie zwischen zwei Welten stand.

Zu Hause sprachen sie Twi und kochten ghanaische Gerichte. Fufu mit Erdnusssuppe am Sonntag war heilig. In der Schule dagegen wollte Amara einfach dazugehören. Sie lernte schnell Deutsch, begeisterte sich für deutsche Literatur und sang im Schulchor.

Das Schwierigste war, wenn beide Welten kollidierten. Bei einer Schulfeier brachte Amara Kelewele — frittierte Kochbananen mit Ingwer und Chilipfeffer. Einige Klassenkameradinnen sagten höflich, es sei "interessant". Amara lachte, aber innerlich fragte sie sich, ob sie sich schämen sollte.

Mit achtzehn begann sie, Romanistik und Afrikanistik zu studieren. Sie erkannte, dass ihre Zerrissenheit keine Schwäche war, sondern eine besondere Perspektive. Sie konnte zwischen Sprachen und Bedeutungswelten vermitteln, die anderen verschlossen blieben.

Heute arbeitet Amara als Übersetzerin und Kulturvermittlerin. Wenn Kinder sie fragen, woher sie kommt, antwortet sie: "Ich komme von überall — und das ist mein größtes Geschenk."`,
    en:`Amara was born in Accra and came to Germany at the age of seven. Her parents had consciously chosen Cologne — an open city with an international population. Nevertheless, Amara experienced moments at school when she noticed that she stood between two worlds.

At home they spoke Twi and cooked Ghanaian dishes. Fufu with peanut soup on Sundays was sacred. At school, by contrast, Amara simply wanted to belong. She learned German quickly, became enthusiastic about German literature and sang in the school choir.

The most difficult thing was when both worlds collided. At a school celebration Amara brought Kelewele — fried plantains with ginger and chilli pepper. Some classmates politely said it was "interesting". Amara laughed but inwardly wondered whether she should be ashamed.

At eighteen she began studying Romance languages and African studies. She recognised that her sense of being torn was not a weakness but a special perspective. She could mediate between languages and worlds of meaning that remained closed to others.

Today Amara works as a translator and cultural mediator. When children ask her where she comes from, she answers: "I come from everywhere — and that is my greatest gift."`,
    vocab:[{de:'die Hybrididentität',en:'hybrid identity'},{de:'die Zerrissenheit',en:'sense of being torn'},{de:'die Kulturvermittlerin',en:'cultural mediator'},{de:'die Zugehörigkeit',en:'belonging'}]},

  { id:'SB2_003', num:3, title:'Das Vorstellungsgespräch', titleEn:'The Job Interview', level:'B2',
    de:`Felix hatte sich auf siebenundvierzig Stellen beworben. Bei vierzig Bewerbungen kam gar keine Rückmeldung. Sechs führten zu Absagen. Nur eine einzige hatte zu einem Vorstellungsgespräch geführt — und der Termin war heute.

Die Stelle war bei einem mittelgroßen IT-Unternehmen in Berlin. Felix hatte das Unternehmen gründlich recherchiert. Er kannte ihre Produkte, ihre Marktposition und sogar den Namen der Personalchefin. Er hatte sich passend gekleidet: ein hellblaues Hemd, eine dunkle Hose, saubere Schuhe. Nicht zu formal, nicht zu lässig.

Das Gespräch begann gut. Die Personalchefin, Frau Brandt, war direkter und freundlicher, als er erwartet hatte. Sie fragte nach seinem technischen Hintergrund und seiner Erfahrung im Teamwork. Felix antwortete ruhig und strukturiert, auch wenn sein Herz schnell schlug.

Dann kam die Frage, die ihn fast aus dem Konzept brachte: "Was ist Ihre größte Schwäche?" Felix hatte diese Antwort geübt — er sprach über seine Tendenz, Projekte zu perfektionieren, und wie er gelernt hatte, rechtzeitig abzuschließen. Frau Brandt nickte nachdenklich.

Am Ende fragte Felix nach dem Team und der Unternehmenskultur. Drei Tage später erhielt er eine E-Mail: Er war eingestellt. Felix las die E-Mail dreimal, bevor er glaubte, was er sah.`,
    en:`Felix had applied for forty-seven positions. For forty applications no response came at all. Six led to rejections. Only one had led to a job interview — and the appointment was today.

The position was at a medium-sized IT company in Berlin. Felix had researched the company thoroughly. He knew their products, their market position and even the name of the HR manager. He had dressed appropriately: a light blue shirt, dark trousers, clean shoes. Not too formal, not too casual.

The conversation started well. The HR manager, Ms Brandt, was more direct and friendly than he had expected. She asked about his technical background and teamwork experience. Felix answered calmly and in a structured way, even though his heart was beating fast.

Then came the question that almost threw him off: "What is your greatest weakness?" Felix had practised this answer — he spoke about his tendency to perfect projects and how he had learned to conclude them in good time. Ms Brandt nodded thoughtfully.

At the end Felix asked about the team and company culture. Three days later he received an email: he had been hired. Felix read the email three times before he believed what he saw.`,
    vocab:[{de:'das Motivationsschreiben',en:'cover letter'},{de:'die Absage',en:'rejection'},{de:'die Personalchefin',en:'HR manager (f)'},{de:'eingestellt werden',en:'to be hired'}]},
];

// Rebuild from source files
const a1 = load('stories_a1.json');
const a2 = load('stories_a2.json');
const b1a = load('stories_b1_part1.json');
const b1b = load('stories_b1_part2.json');

// Apply expansions to A1 stories
const a1expanded = a1.map(s => {
  if (expansions[s.id]) return { ...s, ...expansions[s.id] };
  return s;
});

const all = [...a1expanded, ...a2, ...b1a, ...b1b, ...b2Stories];
fs.writeFileSync(path.join(__dirname,'..','public','data','stories.json'), JSON.stringify(all));

console.log(`Total stories: ${all.length}`);
const byLevel = all.reduce((a,s)=>{a[s.level]=(a[s.level]||0)+1;return a},{});
console.log('By level:', byLevel);
const avgA1 = Math.round(a1expanded.reduce((s,x)=>s+x.de.length,0)/a1expanded.length);
console.log('Avg A1 chars (after expansion):', avgA1);
const expanded5 = a1expanded.filter(s=>expansions[s.id]);
expanded5.forEach(s=>console.log(`  [A1] ${s.title}: ${s.de.length} chars`));
b2Stories.forEach(s=>console.log(`  [B2] ${s.title}: ${s.de.length} chars`));
