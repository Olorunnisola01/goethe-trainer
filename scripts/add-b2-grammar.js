/* Batch 2a: Add B2 grammar chapters to grammar.json */
const fs = require('fs');
const path = require('path');
const GFILE = path.join(__dirname, '..', 'public', 'data', 'grammar.json');

const b2Chapters = [
  {
    ch: 'B2 Kapitel 1: Konjunktiv II',
    icon: '🌟',
    level: 'B2',
    sections: [
      {
        title: '1.1 Konjunktiv II — Bildung (Formation)',
        intro: 'The **Konjunktiv II** (subjunctive II) is used to express hypothetical situations, wishes, polite requests, and unreal conditions. It is one of the most important advanced German structures.\n\n**Formation of Konjunktiv II:**\n- **Modal & irregular verbs**: use the Präteritum stem + umlaut (where possible) + Konjunktiv endings (-e, -est, -e, -en, -et, -en)\n- **Regular verbs**: use **würde + Infinitive** (most common in spoken German)\n- **sein, haben** and modals have their own Konjunktiv II forms used directly',
        tables: [
          [
            ['**Verb**', '**Konjunktiv II**', '**English**'],
            ['sein', 'ich **wäre**', 'I would be'],
            ['haben', 'ich **hätte**', 'I would have'],
            ['werden', 'ich **würde**', 'I would'],
            ['können', 'ich **könnte**', 'I could'],
            ['müssen', 'ich **müsste**', 'I would have to'],
            ['dürfen', 'ich **dürfte**', 'I would be allowed to'],
            ['wollen', 'ich **wollte**', 'I would want to'],
            ['sollen', 'ich **sollte**', 'I should'],
          ],
          [
            ['**Person**', '**würde + Inf.**', '**Example**'],
            ['ich', 'würde', 'Ich **würde** gern reisen.'],
            ['du', 'würdest', 'Du **würdest** das verstehen.'],
            ['er/sie/es', 'würde', 'Er **würde** kommen.'],
            ['wir', 'würden', 'Wir **würden** helfen.'],
            ['ihr', 'würdet', 'Ihr **würdet** lachen.'],
            ['sie/Sie', 'würden', 'Sie **würden** zustimmen.'],
          ],
        ],
        examples: [
          'Wenn ich Zeit **hätte**, **würde** ich mehr reisen. (If I had time, I would travel more.)',
          'Das **wäre** schön! (That would be nice!)',
          'Ich **könnte** dir helfen, wenn du willst. (I could help you if you want.)',
          '**Würdest** du mir bitte helfen? (Would you please help me?)',
        ],
      },
      {
        title: '1.2 Konjunktiv II — Verwendung (Usage)',
        intro: 'The Konjunktiv II is used in several important contexts at B2 level:\n\n**1. Irreale Bedingungssätze (Unreal conditionals):** Wenn + Konjunktiv II in the *wenn*-clause, Konjunktiv II in the main clause.\n**2. Irreale Wunschsätze (Unreal wishes):** Often with *wenn doch* or *wenn nur*.\n**3. Höfliche Bitten (Polite requests):** *Könnten Sie…? Würden Sie…? Hätten Sie…?*\n**4. Ratschläge (Advice):** *An deiner Stelle würde ich… / Du solltest…*',
        tables: [
          [
            ['**Function**', '**Example**', '**English**'],
            ['Unreal condition', 'Wenn ich Geld **hätte**, **würde** ich ein Haus kaufen.', 'If I had money, I would buy a house.'],
            ['Unreal wish', 'Wenn ich doch mehr Zeit **hätte**!', 'If only I had more time!'],
            ['Polite request', '**Könnten** Sie mir helfen?', 'Could you help me?'],
            ['Advice', 'An deiner Stelle **würde** ich das nicht tun.', 'In your position I wouldn\'t do that.'],
            ['Hypothetical', 'Das **wäre** eine gute Idee.', 'That would be a good idea.'],
          ],
        ],
        examples: [
          'Wenn es nicht so kalt **wäre**, **würde** ich spazieren gehen. (If it weren\'t so cold, I would go for a walk.)',
          '**Hätten** Sie vielleicht einen Moment Zeit? (Would you perhaps have a moment?)',
          'Ich **würde** das an deiner Stelle überdenken. (I would reconsider that in your position.)',
        ],
      },
    ],
  },

  {
    ch: 'B2 Kapitel 2: Passiv',
    icon: '🔄',
    level: 'B2',
    sections: [
      {
        title: '2.1 Vorgangspassiv (Action Passive)',
        intro: 'The **Vorgangspassiv** (process/action passive) describes an action happening to the subject. It focuses on the action itself, not the person performing it.\n\n**Formation:** **werden** (conjugated) + **Partizip II**\n\nThe agent (who does it) is introduced with **von + Dativ**.',
        tables: [
          [
            ['**Tense**', '**Formation**', '**Example**'],
            ['Präsens', 'wird + Partizip II', 'Das Buch **wird gelesen**.'],
            ['Präteritum', 'wurde + Partizip II', 'Das Buch **wurde gelesen**.'],
            ['Perfekt', 'ist + Partizip II + worden', 'Das Buch **ist gelesen worden**.'],
            ['Plusquamperfekt', 'war + Partizip II + worden', 'Das Buch **war gelesen worden**.'],
            ['Futur I', 'wird + Partizip II + werden', 'Das Buch **wird gelesen werden**.'],
            ['Konjunktiv II', 'würde + Partizip II + werden', 'Das Buch **würde gelesen werden**.'],
          ],
        ],
        examples: [
          'Der Brief **wird** heute **geschrieben**. (The letter is being written today.)',
          'Das Gesetz **wurde** 2020 **geändert**. (The law was changed in 2020.)',
          'Die Stadt **ist** von Touristen **besucht worden**. (The city has been visited by tourists.)',
          'Der Bericht **wird** vom Chef **gelesen**. (The report is read by the boss.)',
        ],
      },
      {
        title: '2.2 Zustandspassiv & Passiversatz (State Passive & Passive Alternatives)',
        intro: '**Zustandspassiv** describes a state (result), not the action itself.\nFormation: **sein** + **Partizip II**\n\n**Passive alternatives** (Passiversatz) express passive meaning without *werden*:',
        tables: [
          [
            ['**Structure**', '**Example**', '**English**'],
            ['sein + Partizip II (Zustandspassiv)', 'Das Fenster **ist geöffnet**.', 'The window is open (opened).'],
            ['man + Aktiv', '**Man** baut hier ein neues Haus.', 'A new house is being built here.'],
            ['sich lassen + Infinitiv', 'Das Problem **lässt sich** lösen.', 'The problem can be solved.'],
            ['sein + zu + Infinitiv', 'Der Text **ist** noch **zu korrigieren**.', 'The text still needs to be corrected.'],
          ],
        ],
        examples: [
          'Die Tür **ist geschlossen**. (The door is closed.) [Zustandspassiv]',
          'Das **lässt sich** nicht beweisen. (That cannot be proven.)',
          'Der Bericht **ist** bis Freitag **abzugeben**. (The report must be submitted by Friday.)',
        ],
      },
    ],
  },

  {
    ch: 'B2 Kapitel 3: Nebensätze (Subordinate Clauses)',
    icon: '🔗',
    level: 'B2',
    sections: [
      {
        title: '3.1 Kausale & konzessive Nebensätze',
        intro: '**Kausale Nebensätze** (causal clauses) give reasons. **Konzessive Nebensätze** (concessive clauses) express a contrast or concession.\n\nKey conjunctions:',
        tables: [
          [
            ['**Type**', '**Conjunction**', '**Example**', '**English**'],
            ['Kausal (reason)', 'weil', 'Ich bleibe zu Hause, **weil** ich krank bin.', 'I stay home because I am ill.'],
            ['Kausal (reason)', 'da', '**Da** es regnet, nehme ich einen Schirm.', 'Since it is raining, I take an umbrella.'],
            ['Konzessiv (concession)', 'obwohl', 'Er geht aus, **obwohl** er müde ist.', 'He goes out although he is tired.'],
            ['Konzessiv (concession)', 'obgleich', '**Obgleich** sie Hunger hat, isst sie nichts.', 'Although she is hungry, she eats nothing.'],
            ['Konzessiv (concession)', 'auch wenn', '**Auch wenn** es schwer ist, gebe ich nicht auf.', 'Even if it is hard, I do not give up.'],
          ],
        ],
        examples: [
          'Sie hat den Job bekommen, **obwohl** sie wenig Erfahrung hatte. (She got the job although she had little experience.)',
          '**Da** ich früh aufstehen muss, gehe ich jetzt schlafen. (Since I have to get up early, I am going to sleep now.)',
        ],
      },
      {
        title: '3.2 Finale, konsekutive & modale Nebensätze',
        intro: '**Finalsätze** express purpose (why). **Konsekutivsätze** express consequences. **Modalsätze** express how.',
        tables: [
          [
            ['**Type**', '**Conjunction**', '**Example**', '**English**'],
            ['Final (purpose)', 'damit', 'Er lernt, **damit** er die Prüfung besteht.', 'He studies so that he passes the exam.'],
            ['Final (purpose)', 'um … zu', 'Sie spart, **um** ein Haus **zu** kaufen.', 'She saves (in order) to buy a house.'],
            ['Konsekutiv (consequence)', 'so dass', 'Es regnet stark, **so dass** die Straße überflutet ist.', 'It rains heavily so that the road is flooded.'],
            ['Konsekutiv (consequence)', 'sodass', 'Er war so müde, **sodass** er sofort einschlief.', 'He was so tired that he fell asleep immediately.'],
            ['Modal (manner)', 'indem', 'Er lernt, **indem** er Karteikarten schreibt.', 'He learns by writing flashcards.'],
            ['Modal (manner)', 'ohne dass', 'Sie hat geholfen, **ohne dass** jemand sie fragte.', 'She helped without anyone asking her.'],
          ],
        ],
        examples: [
          'Ich stehe früh auf, **um** den Sonnenaufgang **zu** sehen. (I get up early in order to see the sunrise.)',
          'Er spricht sehr leise, **so dass** ich ihn kaum verstehe. (He speaks very quietly so that I can barely understand him.)',
          'Sie hat das Problem gelöst, **indem** sie kreativ gedacht hat. (She solved the problem by thinking creatively.)',
        ],
      },
      {
        title: '3.3 Relativsätze mit Präpositionen & Relativpronomen wo-',
        intro: 'At B2, relative clauses become more complex with **prepositions + relative pronoun** or **wo- compounds** for non-personal referents.',
        tables: [
          [
            ['**Structure**', '**Example**', '**English**'],
            ['Prep. + dem/der/dem/denen', 'Das ist das Thema, **über das** wir sprechen.', 'That is the topic we are talking about.'],
            ['Prep. + dem/der/dem/denen', 'Der Mann, **mit dem** sie arbeitet, ist nett.', 'The man she works with is nice.'],
            ['wo- compound (things/ideas)', 'Das ist etwas, **worüber** ich nachdenke.', 'That is something I think about.'],
            ['wo- compound', 'Das Tool, **womit** wir arbeiten, ist neu.', 'The tool we work with is new.'],
            ['was (after alles, nichts, vieles)', 'Alles, **was** er sagt, klingt überzeugend.', 'Everything he says sounds convincing.'],
          ],
        ],
        examples: [
          'Das ist das Buch, **von dem** ich dir erzählt habe. (That is the book I told you about.)',
          'Es gibt viel, **worüber** wir reden müssen. (There is a lot we need to talk about.)',
          'Nichts, **was** sie tat, war falsch. (Nothing she did was wrong.)',
        ],
      },
    ],
  },

  {
    ch: 'B2 Kapitel 4: Partizipialkonstruktionen',
    icon: '📐',
    level: 'B2',
    sections: [
      {
        title: '4.1 Partizip I & II als Adjektive und in Konstruktionen',
        intro: '**Partizip I** (present participle = Verb + -end) describes an ongoing action. **Partizip II** (past participle) describes a completed or passive action. Both can be used as adjectives (with adjective endings) or in reduced relative clauses, replacing longer subordinate clauses.',
        tables: [
          [
            ['**Form**', '**Example as adjective**', '**English**'],
            ['Partizip I', 'das **laufende** Wasser', 'the running water'],
            ['Partizip I', 'ein **wachsendes** Problem', 'a growing problem'],
            ['Partizip II', 'das **gekochte** Ei', 'the boiled egg'],
            ['Partizip II', 'die **geschlossene** Tür', 'the closed door'],
          ],
          [
            ['**Reduced clause**', '**Full relative clause**', '**English**'],
            ['der **schlafende** Mann', 'der Mann, der schläft', 'the man who is sleeping'],
            ['das **gebaute** Haus', 'das Haus, das gebaut wurde', 'the house that was built'],
            ['die **angebotene** Stelle', 'die Stelle, die angeboten wird', 'the position that is being offered'],
          ],
        ],
        examples: [
          'Die **steigende** Inflation ist ein Problem. (Rising inflation is a problem.)',
          'Der **vorgeschlagene** Plan klingt gut. (The proposed plan sounds good.)',
          'Das **gewonnene** Spiel war spannend. (The won game was exciting.)',
        ],
      },
      {
        title: '4.2 Infinitivkonstruktionen (Infinitive Constructions)',
        intro: 'Extended infinitive constructions with **zu + Infinitiv** can replace subordinate clauses, making sentences more concise and formal.',
        tables: [
          [
            ['**Construction**', '**Example**', '**English**'],
            ['um … zu + Inf. (purpose)', 'Er lernt, **um** Erfolg **zu haben**.', 'He studies in order to be successful.'],
            ['ohne … zu + Inf. (without)', 'Sie ging, **ohne** zu **warten**.', 'She left without waiting.'],
            ['(an)statt … zu + Inf. (instead)', '**Anstatt** zu klagen, handelt er.', 'Instead of complaining, he acts.'],
            ['scheinen … zu + Inf.', 'Er **scheint** das **zu wissen**.', 'He seems to know that.'],
            ['haben … zu + Inf. (obligation)', 'Ich **habe** viel **zu tun**.', 'I have a lot to do.'],
            ['sein … zu + Inf. (necessity)', 'Das **ist** noch **zu erledigen**.', 'That still needs to be done.'],
          ],
        ],
        examples: [
          'Sie fährt nach Berlin, **um** ihre Familie **zu besuchen**. (She goes to Berlin to visit her family.)',
          'Er hat aufgehört, **ohne** sich **zu verabschieden**. (He left without saying goodbye.)',
          '**Anstatt** das Problem **zu ignorieren**, sucht sie eine Lösung. (Instead of ignoring the problem, she looks for a solution.)',
        ],
      },
    ],
  },

  {
    ch: 'B2 Kapitel 5: Erweiterte Syntax & Konnektoren',
    icon: '🔀',
    level: 'B2',
    sections: [
      {
        title: '5.1 Zweiteilige Konnektoren (Two-Part Connectors)',
        intro: 'Two-part connectors link clauses and emphasise contrast, addition, or alternatives. They are essential for well-structured arguments at B2 level.',
        tables: [
          [
            ['**Connector**', '**Meaning**', '**Example**'],
            ['sowohl … als auch', 'both … and', '**Sowohl** der Preis **als auch** die Qualität sind wichtig.'],
            ['entweder … oder', 'either … or', '**Entweder** kommst du mit, **oder** ich gehe allein.'],
            ['weder … noch', 'neither … nor', 'Er hat **weder** Zeit **noch** Lust.'],
            ['nicht nur … sondern auch', 'not only … but also', '**Nicht nur** der Inhalt, **sondern auch** die Form zählt.'],
            ['zwar … aber', 'admittedly … but', 'Das ist **zwar** teuer, **aber** es lohnt sich.'],
            ['je … desto', 'the more … the more', '**Je** mehr man lernt, **desto** besser versteht man.'],
          ],
        ],
        examples: [
          '**Sowohl** die Regierung **als auch** die Bevölkerung sind gefordert. (Both the government and the population are required.)',
          '**Je** früher man beginnt, **desto** leichter fällt das Lernen. (The earlier you start, the easier learning becomes.)',
          'Das war **zwar** schwierig, **aber** wir haben es geschafft. (That was admittedly difficult, but we managed it.)',
        ],
      },
      {
        title: '5.2 Modalpartikeln & Abtönungspartikeln (Modal Particles)',
        intro: 'Modal particles are small words that add nuance, tone, and attitude to sentences. They are unstressed and cannot be translated literally — but they are essential for natural German at B2+.',
        tables: [
          [
            ['**Particle**', '**Function / Tone**', '**Example**'],
            ['doch', 'contradiction, reassurance', 'Das stimmt **doch** nicht!'],
            ['ja', 'shared knowledge, emphasis', 'Das weißt du **ja** selbst.'],
            ['eigentlich', 'actually, in principle', '**Eigentlich** wollte ich früh aufstehen.'],
            ['mal', 'softening a request', 'Schau **mal** hier!'],
            ['halt / eben', 'inevitability, resignation', 'Das ist **eben** so.'],
            ['wohl', 'assumption / probability', 'Er ist **wohl** krank.'],
            ['schon', 'concession / certainly', 'Das stimmt **schon**, aber…'],
            ['bloß', 'emphatic concern', 'Was hat er **bloß** gedacht?'],
          ],
        ],
        examples: [
          'Das hast du **doch** selbst gesagt! (But you said that yourself!)',
          'Er kommt **wohl** nicht mehr. (He probably won\'t come anymore.)',
          'Das ist **eben** das Problem. (That is simply the problem.)',
          'Schau **mal**, was ich gefunden habe! (Look what I found!)',
        ],
      },
      {
        title: '5.3 Nominalstil & Funktionsverbgefüge (Nominal Style)',
        intro: 'Formal German (newspapers, official documents, academic writing) uses **Nominalstil** — turning verbs into nouns + function verbs. Recognising these structures is essential at B2.',
        tables: [
          [
            ['**Verb form**', '**Nominalstil**', '**English**'],
            ['entscheiden', 'eine Entscheidung treffen', 'to make a decision'],
            ['helfen', 'Hilfe leisten', 'to provide help'],
            ['anfangen', 'einen Anfang machen', 'to make a start'],
            ['fragen', 'eine Frage stellen', 'to ask a question'],
            ['beeinflussen', 'Einfluss haben / nehmen auf', 'to have / exert influence on'],
            ['erklären', 'eine Erklärung abgeben', 'to give an explanation'],
            ['kritisieren', 'Kritik üben an', 'to criticise'],
            ['vorschlagen', 'einen Vorschlag machen', 'to make a suggestion'],
          ],
        ],
        examples: [
          'Die Regierung hat **eine Entscheidung getroffen**. (The government made a decision.)',
          'Er hat **einen wichtigen Beitrag geleistet**. (He made an important contribution.)',
          'Bitte **stellen Sie Ihre Fragen** am Ende. (Please ask your questions at the end.)',
        ],
      },
    ],
  },

  {
    ch: 'B2 Kapitel 6: Indirekte Rede & Konjunktiv I',
    icon: '💬',
    level: 'B2',
    sections: [
      {
        title: '6.1 Indirekte Rede (Reported Speech)',
        intro: '**Indirekte Rede** (reported/indirect speech) is used to report what someone said without quoting them directly. In formal German (journalism, official reports), **Konjunktiv I** is used; in everyday speech, Konjunktiv II or *würde* constructions are common.',
        tables: [
          [
            ['**Person**', '**Konjunktiv I of "sein"**', '**Konjunktiv I of "haben"**'],
            ['ich', 'sei', 'habe'],
            ['du', 'sei(e)st', 'habest'],
            ['er/sie/es', '**sei**', '**habe**'],
            ['wir', 'seien', 'haben'],
            ['ihr', 'seiet', 'habet'],
            ['sie/Sie', 'seien', 'haben'],
          ],
          [
            ['**Direct speech**', '**Indirect speech (Konj. I)**', '**English**'],
            ['"Ich bin krank."', 'Er sagte, er **sei** krank.', 'He said he was ill.'],
            ['"Wir haben Zeit."', 'Sie sagten, sie **haben** Zeit.', 'They said they had time.'],
            ['"Ich werde kommen."', 'Er sagte, er **werde** kommen.', 'He said he would come.'],
            ['"Ich kann helfen."', 'Sie sagte, sie **könne** helfen.', 'She said she could help.'],
          ],
        ],
        examples: [
          'Der Minister erklärte, die Lage **sei** unter Kontrolle. (The minister stated that the situation was under control.)',
          'Die Sprecherin teilte mit, das Unternehmen **habe** Gewinne erzielt. (The spokesperson announced that the company had made profits.)',
          'Er behauptete, er **könne** das Problem lösen. (He claimed he could solve the problem.)',
        ],
      },
    ],
  },
];

const grammar = JSON.parse(fs.readFileSync(GFILE, 'utf8').replace(/^﻿/, ''));
// Remove previous B2 chapters if any
const base = grammar.filter(c => c.level !== 'B2');
const out = [...base, ...b2Chapters];
fs.writeFileSync(GFILE, JSON.stringify(out));
console.log(`Added ${b2Chapters.length} B2 grammar chapters. Total: ${out.length} chapters.`);
b2Chapters.forEach(c => console.log(`  ${c.icon} ${c.ch} — ${c.sections.length} sections`));
