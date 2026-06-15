"""
Appends 400 more sentence-order questions to sentence_order.json
A1:+200  A2:+150  B1:+50  -> total 800
"""
import json, random
random.seed(42)

out_path = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\public\data\sentence_order.json'

def sid(n): return f"SO{n:04d}"

def scramble(tokens):
    t = tokens[:]
    for _ in range(20):
        random.shuffle(t)
        if t != tokens:
            return t
    return t[::-1] if t == tokens else t

# (level, topic, tokens_CORRECT, correct_sentence, tip_english, structure_english)
RAW_EXTRA = [

# ══════════════════════════════════════════
# A1 — 200 new sentences
# ══════════════════════════════════════════

# ── sein (20) ─────────────────────────────
("A1","sein",["Ich","bin","Schüler","."],"Ich bin Schüler.","Job/role after 'sein' takes no article in German.","Subject + sein + Role (no article)"),
("A1","sein",["Du","bist","sehr","freundlich","."],"Du bist sehr freundlich.","'sehr' intensifies the adjective; both follow the verb.","Subject + sein + sehr + Adjective"),
("A1","sein",["Er","ist","Informatiker","."],"Er ist Informatiker.","Professions after 'sein' take no article.","Subject + sein + Profession (no article)"),
("A1","sein",["Sie","ist","aus","der","Schweiz","."],"Sie ist aus der Schweiz.","'die Schweiz' always takes the definite article; 'aus + dative' for origin.","Subject + sein + aus + der + Country"),
("A1","sein",["Wir","sind","glücklich","und","zufrieden","."],"Wir sind glücklich und zufrieden.","Two adjectives joined with 'und'; no comma between them.","Subject + sind + Adj + und + Adj"),
("A1","sein",["Ihr","seid","jung","."],"Ihr seid jung.","'ihr seid' = you (plural) are; adjective follows.","Subject (ihr) + seid + Adjective"),
("A1","sein",["Das","Kind","ist","gesund","."],"Das Kind ist gesund.","Neutral subject 'das Kind'; predicative adjective after 'ist'.","Subject (das) + sein + Adjective"),
("A1","sein",["Die","Stadt","ist","sehr","groß","."],"Die Stadt ist sehr groß.","Feminine subject 'die Stadt'; 'sehr groß' as predicate.","Subject (die) + sein + sehr + Adjective"),
("A1","sein",["Meine","Eltern","sind","alt","."],"Meine Eltern sind alt.","Possessive 'meine' for plural; 'sind' for plural subject.","Possessive + Plural noun + sind + Adjective"),
("A1","sein",["Das","ist","eine","schwierige","Frage","."],"Das ist eine schwierige Frage.","Feminine noun: 'eine schwierige Frage' (adjective ending '-e' after 'eine').","Das + sein + eine + Adjective(-e) + Noun"),
("A1","sein",["Er","ist","Pilot","von","Beruf","."],"Er ist Pilot von Beruf.","'von Beruf' (by profession) follows the job title to add emphasis.","Subject + sein + Profession + von Beruf"),
("A1","sein",["Ich","bin","manchmal","traurig","."],"Ich bin manchmal traurig.","Frequency adverb 'manchmal' sits between verb and adjective.","Subject + sein + manchmal + Adjective"),
("A1","sein",["Das","Wasser","ist","sauber","."],"Das Wasser ist sauber.","Simple predicate: neuter subject + ist + adjective.","Subject (das) + sein + Adjective"),
("A1","sein",["Sie","sind","gute","Freunde","."],"Sie sind gute Freunde.","Plural predicate noun with adjective; adjective takes '-e' (no article).","Subject + sind + Adjective(-e) + Plural noun"),
("A1","sein",["Er","ist","sehr","beliebt","."],"Er ist sehr beliebt.","'beliebt' (popular) is a predicative adjective; 'sehr' precedes it.","Subject + sein + sehr + Adjective"),
("A1","sein",["Das","Museum","ist","am","Dienstag","geschlossen","."],"Das Museum ist am Dienstag geschlossen.","'am Dienstag' (on Tuesday) is the time; 'geschlossen' (closed) is the predicate.","Subject + sein + am + Day + Adjective/Participle"),
("A1","sein",["Die","Kinder","sind","laut","und","aktiv","."],"Die Kinder sind laut und aktiv.","Plural subject 'die Kinder' + 'sind' + two adjectives with 'und'.","Subject + sind + Adj + und + Adj"),
("A1","sein",["Mein","Zimmer","ist","ordentlich","."],"Mein Zimmer ist ordentlich.","Neuter possessive 'mein' + 'ist' + predicate adjective.","Possessive + Noun + sein + Adjective"),
("A1","sein",["Du","bist","nicht","allein","."],"Du bist nicht allein.","'nicht' before the adverb/adjective negates the statement.","Subject + sein + nicht + Adjective"),
("A1","sein",["Das","Café","ist","gemütlich","."],"Das Café ist gemütlich.","Neutral noun + ist + predicative adjective (no ending needed).","Subject (das) + sein + Adjective"),

# ── haben (20) ────────────────────────────
("A1","haben",["Ich","habe","eine","Idee","."],"Ich habe eine Idee.","Feminine noun 'Idee' takes 'eine' in the accusative.","Subject + haben + eine (fem.) + Noun"),
("A1","haben",["Du","hast","Recht","."],"Du hast Recht.","'Recht haben' (to be right) is a fixed phrase; no article.","Subject + haben + Noun (set phrase)"),
("A1","haben",["Er","hat","eine","neue","Arbeit","."],"Er hat eine neue Arbeit.","Feminine noun + adjective: 'eine neue Arbeit' (ending '-e' after 'eine').","Subject + haben + eine + Adj(-e) + Noun"),
("A1","haben",["Wir","haben","einen","Termin","."],"Wir haben einen Termin.","Masculine accusative: 'einen Termin'.","Subject + haben + einen (masc. acc.) + Noun"),
("A1","haben",["Das","Kind","hat","Fieber","."],"Das Kind hat Fieber.","'Fieber haben' (to have a fever) — no article with 'Fieber'.","Subject + haben + Noun (no article, set phrase)"),
("A1","haben",["Ihr","habt","keine","Ahnung","."],"Ihr habt keine Ahnung.","'keine Ahnung haben' = to have no clue; feminine noun negated with 'keine'.","Subject (ihr) + habt + keine (fem.) + Noun"),
("A1","haben",["Ich","habe","ein","schönes","Zimmer","."],"Ich habe ein schönes Zimmer.","Neuter indefinite + adjective: 'ein schönes' (strong ending '-es').","Subject + haben + ein + Adj(-es) + Neuter noun"),
("A1","haben",["Wir","haben","viel","zu","tun","."],"Wir haben viel zu tun.","'viel zu tun haben' is a fixed phrase (to have a lot to do).","Subject + haben + viel + zu + Infinitive"),
("A1","haben",["Er","hat","einen","guten","Job","."],"Er hat einen guten Job.","Masculine accusative: 'einen guten' (mixed ending '-en').","Subject + haben + einen + Adj(-en) + Noun"),
("A1","haben",["Sie","hat","keine","Lust","."],"Sie hat keine Lust.","'keine Lust haben' = to not feel like it; feminine negation.","Subject + haben + keine (fem.) + Noun"),
("A1","haben",["Ich","habe","Heimweh","."],"Ich habe Heimweh.","'Heimweh haben' (to be homesick) — compound noun, no article.","Subject + haben + Noun (no article)"),
("A1","haben",["Wir","haben","Glück","."],"Wir haben Glück.","'Glück haben' (to be lucky) is a fixed phrase; no article.","Subject + haben + Noun (set phrase)"),
("A1","haben",["Er","hat","einen","älteren","Bruder","."],"Er hat einen älteren Bruder.","Comparative adjective 'älteren' as attributive; masculine accusative.","Subject + haben + einen + Adj-comparative(-en) + Noun"),
("A1","haben",["Sie","hat","eine","neue","Adresse","."],"Sie hat eine neue Adresse.","Feminine noun + adjective ending '-e' after 'eine'.","Subject + haben + eine + Adj(-e) + Noun"),
("A1","haben",["Ich","habe","keine","Angst","."],"Ich habe keine Angst.","'keine Angst haben' = to not be afraid; feminine negation.","Subject + haben + keine (fem.) + Noun"),
("A1","haben",["Du","hast","ein","Talent","für","Musik","."],"Du hast ein Talent für Musik.","'für + accusative' gives the area of talent.","Subject + haben + ein + Noun + für + Noun"),
("A1","haben",["Das","Restaurant","hat","gutes","Essen","."],"Das Restaurant hat gutes Essen.","Neuter object without article: adjective takes strong ending '-es'.","Subject + haben + Adj(-es) + Noun (no article)"),
("A1","haben",["Ich","habe","Kopfschmerzen","und","Fieber","."],"Ich habe Kopfschmerzen und Fieber.","Two symptom nouns joined with 'und'; both without article (set phrases).","Subject + haben + Noun + und + Noun"),
("A1","haben",["Wir","haben","morgen","einen","freien","Tag","."],"Wir haben morgen einen freien Tag.","Time adverb 'morgen' after verb; masculine accusative 'einen freien Tag'.","Subject + haben + Time + einen + Adj(-en) + Noun"),
("A1","haben",["Du","hast","ein","Problem","."],"Du hast ein Problem.","Neuter noun: 'ein Problem' (accusative same as nominative for neuter).","Subject + haben + ein (neut.) + Noun"),

# ── W-Fragen (20) ─────────────────────────
("A1","W-Fragen",["Wie","lange","wohnst","du","hier","?"],"Wie lange wohnst du hier?","'Wie lange' asks about duration; verb in position 2 after the question phrase.","Wie lange + Verb + Subject + Adverb + ?"),
("A1","W-Fragen",["Wohin","fährt","der","Bus","?"],"Wohin fährt der Bus?","'Wohin' asks about direction; subject follows the verb.","Wohin + Verb + Subject + ?"),
("A1","W-Fragen",["Was","macht","dein","Vater","?"],"Was macht dein Vater?","'Was' asks about an action; possessive + noun as subject.","Was + Verb + Possessive + Noun + ?"),
("A1","W-Fragen",["Wer","ist","dein","Lieblingslehrer","?"],"Wer ist dein Lieblingslehrer?","'Wer' (who) as subject; possessive compound noun.","Wer + ist + Possessive + Compound noun + ?"),
("A1","W-Fragen",["Warum","bist","du","so","müde","?"],"Warum bist du so müde?","'Warum' asks for a reason; 'so' intensifies the adjective.","Warum + sein + Subject + so + Adjective + ?"),
("A1","W-Fragen",["Was","liest","du","gern","?"],"Was liest du gern?","'gern' after the subject shows preference; 'was' asks about the object.","Was + Verb + Subject + gern + ?"),
("A1","W-Fragen",["Wann","beginnt","der","Unterricht","?"],"Wann beginnt der Unterricht?","'Wann' asks about time; definite article + noun as subject.","Wann + Verb + Article + Noun + ?"),
("A1","W-Fragen",["Wo","kaufst","du","ein","?"],"Wo kaufst du ein?","'Wo' asks for location; separable verb 'einkaufen' splits.","Wo + Verb stem + Subject + Prefix + ?"),
("A1","W-Fragen",["Wie","oft","gehst","du","ins","Kino","?"],"Wie oft gehst du ins Kino?","'Wie oft' asks about frequency; 'ins Kino' = accusative (direction).","Wie oft + Verb + Subject + ins + Noun + ?"),
("A1","W-Fragen",["Welchen","Sport","machst","du","?"],"Welchen Sport machst du?","'Welchen' (which, masc. acc.) modifies 'Sport'; verb at position 2.","Welchen + Noun + Verb + Subject + ?"),
("A1","W-Fragen",["Was","ist","dein","Lieblingsfilm","?"],"Was ist dein Lieblingsfilm?","'Was' requests a definition; possessive + compound noun.","Was + ist + Possessive + Compound noun + ?"),
("A1","W-Fragen",["Wer","kommt","morgen","?"],"Wer kommt morgen?","'Wer' as subject; time adverb at the end.","Wer + Verb + Time + ?"),
("A1","W-Fragen",["Wie","findest","du","das","Wetter","?"],"Wie findest du das Wetter?","'Wie findest du' = what do you think of; object at the end.","Wie + Verb + Subject + Object + ?"),
("A1","W-Fragen",["Was","isst","du","zum","Frühstück","?"],"Was isst du zum Frühstück?","'zum Frühstück' = for breakfast (zu + dem); object of question is 'was'.","Was + Verb + Subject + zum + Noun + ?"),
("A1","W-Fragen",["Wann","schläfst","du","normalerweise","?"],"Wann schläfst du normalerweise?","'normalerweise' (normally) follows the subject.","Wann + Verb + Subject + Adverb + ?"),
("A1","W-Fragen",["Wo","arbeitest","du","?"],"Wo arbeitest du?","Simplest W-question: W-word + Verb + Subject.","Wo + Verb + Subject + ?"),
("A1","W-Fragen",["Was","trägst","du","heute","?"],"Was trägst du heute?","'Was' asks about clothing; time adverb at the end.","Was + Verb + Subject + Time + ?"),
("A1","W-Fragen",["Woher","weißt","du","das","?"],"Woher weißt du das?","'Woher' asks origin of knowledge; demonstrative 'das' as object.","Woher + Verb + Subject + Object + ?"),
("A1","W-Fragen",["Wie","ist","deine","Telefonnummer","?"],"Wie ist deine Telefonnummer?","'Wie ist' requests a detail; possessive + noun.","Wie + ist + Possessive + Noun + ?"),
("A1","W-Fragen",["Was","trinkst","du","morgens","?"],"Was trinkst du morgens?","'morgens' (in the mornings) as time adverb at the end.","Was + Verb + Subject + Time adverb + ?"),

# ── Ja/Nein-Fragen (15) ───────────────────
("A1","Ja/Nein-Fragen",["Liest","du","gern","Bücher","?"],"Liest du gern Bücher?","Verb-first yes/no question; 'gern' between subject and object.","Verb + Subject + gern + Object + ?"),
("A1","Ja/Nein-Fragen",["Hast","du","einen","Computer","?"],"Hast du einen Computer?","'haben' inverts; masculine accusative 'einen'.","haben + Subject + einen + Noun + ?"),
("A1","Ja/Nein-Fragen",["Wohnt","sie","in","München","?"],"Wohnt sie in München?","Verb first; location phrase follows subject.","Verb + Subject + in + City + ?"),
("A1","Ja/Nein-Fragen",["Kommt","ihr","aus","Österreich","?"],"Kommt ihr aus Österreich?","Plural 'ihr' as subject in yes/no question.","Verb + ihr + aus + Country + ?"),
("A1","Ja/Nein-Fragen",["Spielst","du","ein","Instrument","?"],"Spielst du ein Instrument?","'ein Instrument' — neuter accusative.","Verb + Subject + ein (neut.) + Noun + ?"),
("A1","Ja/Nein-Fragen",["Hat","das","Restaurant","geöffnet","?"],"Hat das Restaurant geöffnet?","'haben' flips to front; 'geöffnet' is the participle.","haben + Subject + Participle + ?"),
("A1","Ja/Nein-Fragen",["Bist","du","heute","müde","?"],"Bist du heute müde?","'sein' inverted; time adverb before adjective.","sein + Subject + Time + Adjective + ?"),
("A1","Ja/Nein-Fragen",["Kennen","Sie","den","Weg","?"],"Kennen Sie den Weg?","Formal yes/no with 'Sie'; masculine accusative 'den Weg'.","Verb + Sie + den + Noun + ?"),
("A1","Ja/Nein-Fragen",["Magst","du","Schokolade","?"],"Magst du Schokolade?","'mögen' inverted; 'Schokolade' as mass noun (no article).","Verb + Subject + Noun (no article) + ?"),
("A1","Ja/Nein-Fragen",["Fährt","der","Zug","pünktlich","?"],"Fährt der Zug pünktlich?","Verb first; manner adverb 'pünktlich' at end.","Verb + Subject + Adverb + ?"),
("A1","Ja/Nein-Fragen",["Hörst","du","gern","Musik","?"],"Hörst du gern Musik?","'gern' shows preference; 'Musik' without article.","Verb + Subject + gern + Noun (no article) + ?"),
("A1","Ja/Nein-Fragen",["Wohnst","du","allein","?"],"Wohnst du allein?","Short yes/no; adverb 'allein' after subject.","Verb + Subject + Adverb + ?"),
("A1","Ja/Nein-Fragen",["Macht","ihr","Sport","?"],"Macht ihr Sport?","'Sport machen' fixed phrase; verb first, plural 'ihr'.","Verb + ihr + Noun + ?"),
("A1","Ja/Nein-Fragen",["Ist","das","Hotel","teuer","?"],"Ist das Hotel teuer?","'sein' inverted; neuter subject + adjective.","sein + Subject + Adjective + ?"),
("A1","Ja/Nein-Fragen",["Kochst","du","gern","?"],"Kochst du gern?","Minimal yes/no; 'gern' at end expresses enjoyment.","Verb + Subject + gern + ?"),

# ── Negation (20) ─────────────────────────
("A1","Negation",["Ich","habe","keine","Ahnung","."],"Ich habe keine Ahnung.","'keine Ahnung' = no idea; feminine noun negated with 'keine'.","Subject + haben + keine (fem.) + Noun"),
("A1","Negation",["Er","spielt","nicht","Klavier","."],"Er spielt nicht Klavier.","'nicht' before the specific object negates the activity.","Subject + Verb + nicht + Noun"),
("A1","Negation",["Wir","haben","kein","Haustier","."],"Wir haben kein Haustier.","Neuter noun negated with 'kein'.","Subject + haben + kein (neut.) + Noun"),
("A1","Negation",["Das","ist","nicht","richtig","."],"Das ist nicht richtig.","'nicht' before the adjective negates the predicate.","Das + sein + nicht + Adjective"),
("A1","Negation",["Sie","trinkt","keinen","Kaffee","."],"Sie trinkt keinen Kaffee.","Masculine accusative noun negated with 'keinen'.","Subject + Verb + keinen (masc. acc.) + Noun"),
("A1","Negation",["Du","bist","nicht","allein","."],"Du bist nicht allein.","'nicht' before the adverb/adjective negates the state.","Subject + sein + nicht + Adjective"),
("A1","Negation",["Er","hat","keine","Erfahrung","."],"Er hat keine Erfahrung.","Feminine noun negated with 'keine'.","Subject + haben + keine (fem.) + Noun"),
("A1","Negation",["Das","Geschäft","ist","nicht","offen","."],"Das Geschäft ist nicht offen.","'nicht' before a predicative adjective negates the state.","Subject + sein + nicht + Adjective"),
("A1","Negation",["Wir","gehen","heute","nicht","aus","."],"Wir gehen heute nicht aus.","Separable verb 'ausgehen'; 'nicht' before the prefix negates the action.","Subject + Verb stem + Time + nicht + Prefix (end)"),
("A1","Negation",["Sie","wohnt","nicht","mehr","hier","."],"Sie wohnt nicht mehr hier.","'nicht mehr' (no longer) + place adverb.","Subject + Verb + nicht mehr + Adverb"),
("A1","Negation",["Ich","lese","keine","Zeitung","."],"Ich lese keine Zeitung.","Feminine noun negated with 'keine'.","Subject + Verb + keine (fem.) + Noun"),
("A1","Negation",["Er","macht","das","nicht","gern","."],"Er macht das nicht gern.","'nicht gern' = doesn't like to; 'nicht' before 'gern'.","Subject + Verb + Object + nicht + gern"),
("A1","Negation",["Das","ist","kein","guter","Plan","."],"Das ist kein guter Plan.","'kein' + adjective (-er, strong masc. nom.) + noun.","Das + sein + kein + Adj(-er) + Noun"),
("A1","Negation",["Du","machst","keine","Fehler","."],"Du machst keine Fehler.","Plural noun negated with 'keine'.","Subject + Verb + keine + Plural noun"),
("A1","Negation",["Er","kennt","mich","nicht","."],"Er kennt mich nicht.","Accusative pronoun 'mich'; 'nicht' goes to the end.","Subject + Verb + mich (acc.) + nicht (end)"),
("A1","Negation",["Das","Wetter","ist","nicht","gut","."],"Das Wetter ist nicht gut.","'nicht' before a predicative adjective.","Subject + sein + nicht + Adjective"),
("A1","Negation",["Ich","habe","keinen","Hunger","."],"Ich habe keinen Hunger.","Masculine noun 'Hunger' negated with 'keinen'.","Subject + haben + keinen (masc. acc.) + Noun"),
("A1","Negation",["Sie","sind","nicht","zu","Hause","."],"Sie sind nicht zu Hause.","'nicht' before the location phrase negates the presence.","Subject + sein + nicht + zu Hause"),
("A1","Negation",["Ich","verstehe","ihn","nicht","."],"Ich verstehe ihn nicht.","Masculine accusative pronoun 'ihn'; 'nicht' at the end.","Subject + Verb + ihn (masc. acc.) + nicht (end)"),
("A1","Negation",["Das","Café","hat","heute","nicht","geöffnet","."],"Das Café hat heute nicht geöffnet.","'nicht' before the participle negates the action in the past.","Subject + haben + Time + nicht + Participle"),

# ── Verben im Präsens (30) ────────────────
("A1","Verben",["Ich","lese","jeden","Abend","ein","Buch","."],"Ich lese jeden Abend ein Buch.","Time 'jeden Abend' between verb and object.","Subject + Verb + Time + ein + Noun"),
("A1","Verben",["Er","trinkt","jeden","Morgen","Tee","."],"Er trinkt jeden Morgen Tee.","'Tee' as mass noun (no article); time before object.","Subject + Verb + Time + Noun (no article)"),
("A1","Verben",["Wir","spielen","samstags","Fußball","."],"Wir spielen samstags Fußball.","'samstags' (on Saturdays) as a time adverb; 'Fußball' without article.","Subject + Verb + Time adverb + Noun"),
("A1","Verben",["Sie","kocht","gern","für","ihre","Familie","."],"Sie kocht gern für ihre Familie.","'gern' after verb; 'für + accusative' with possessive.","Subject + Verb + gern + für + Possessive + Noun"),
("A1","Verben",["Du","arbeitest","sehr","hart","."],"Du arbeitest sehr hart.","Manner adverb phrase 'sehr hart' after the verb.","Subject + Verb + sehr + Adverb"),
("A1","Verben",["Er","schwimmt","jedes","Wochenende","."],"Er schwimmt jedes Wochenende.","Time phrase 'jedes Wochenende' after the verb.","Subject + Verb + Time"),
("A1","Verben",["Ich","brauche","deine","Hilfe","."],"Ich brauche deine Hilfe.","'brauchen' + accusative object with possessive.","Subject + Verb + Possessive + Noun"),
("A1","Verben",["Wir","wohnen","in","einer","großen","Stadt","."],"Wir wohnen in einer großen Stadt.","'in + dative' for location; feminine: 'einer', adjective '-en'.","Subject + Verb + in + einer + Adj(-en) + Noun"),
("A1","Verben",["Sie","fährt","täglich","mit","dem","Zug","."],"Sie fährt täglich mit dem Zug.","Frequency 'täglich' then manner 'mit dem Zug' (TeKaMoLo).","Subject + Verb + Time + mit + dem + Noun"),
("A1","Verben",["Du","lernst","sehr","schnell","."],"Du lernst sehr schnell.","Manner adverbs 'sehr schnell' after the verb.","Subject + Verb + sehr + Adverb"),
("A1","Verben",["Er","schläft","lange","am","Wochenende","."],"Er schläft lange am Wochenende.","Manner 'lange' before time 'am Wochenende'.","Subject + Verb + Manner + am + Noun"),
("A1","Verben",["Wir","machen","einen","Spaziergang","."],"Wir machen einen Spaziergang.","'einen Spaziergang machen' (to go for a walk) — fixed phrase; masculine accusative.","Subject + Verb + einen + Noun (set phrase)"),
("A1","Verben",["Sie","singt","gern","in","der","Dusche","."],"Sie singt gern in der Dusche.","'gern' after verb; location 'in der Dusche' (dative).","Subject + Verb + gern + in + der + Noun"),
("A1","Verben",["Ich","warte","auf","den","Bus","."],"Ich warte auf den Bus.","'warten auf + accusative' is a fixed prepositional verb.","Subject + Verb + auf + den (masc. acc.) + Noun"),
("A1","Verben",["Er","kommt","aus","der","Schweiz","."],"Er kommt aus der Schweiz.","'aus + der Schweiz' — Switzerland takes a definite article.","Subject + Verb + aus + der + Country"),
("A1","Verben",["Wir","besuchen","oft","das","Museum","."],"Wir besuchen oft das Museum.","Frequency adverb 'oft' between verb and object.","Subject + Verb + oft + Object"),
("A1","Verben",["Sie","trägt","ein","rotes","Kleid","."],"Sie trägt ein rotes Kleid.","Neuter indefinite + adjective: 'ein rotes' (strong ending '-es').","Subject + Verb + ein + Adj(-es) + Noun"),
("A1","Verben",["Ich","nehme","den","Zug","nach","Hamburg","."],"Ich nehme den Zug nach Hamburg.","Masculine accusative 'den Zug'; 'nach + city' for destination.","Subject + Verb + den + Noun + nach + City"),
("A1","Verben",["Er","öffnet","das","Fenster","."],"Er öffnet das Fenster.","Neuter accusative 'das Fenster'.","Subject + Verb + das (neut. acc.) + Noun"),
("A1","Verben",["Wir","gehen","jeden","Sonntag","in","die","Kirche","."],"Wir gehen jeden Sonntag in die Kirche.","Time 'jeden Sonntag'; 'in die Kirche' (accusative, direction).","Subject + Verb + Time + in + die + Noun"),
("A1","Verben",["Du","fragst","immer","viel","."],"Du fragst immer viel.","'immer' (always) before 'viel' (much).","Subject + Verb + immer + Adverb"),
("A1","Verben",["Ich","zahle","mit","Kreditkarte","."],"Ich zahle mit Kreditkarte.","'mit + noun (no article)' = means of payment.","Subject + Verb + mit + Noun (no article)"),
("A1","Verben",["Er","schreibt","täglich","in","sein","Tagebuch","."],"Er schreibt täglich in sein Tagebuch.","Time 'täglich'; 'in + accusative' (direction into the diary).","Subject + Verb + Time + in + Possessive + Noun"),
("A1","Verben",["Wir","reisen","gern","im","Sommer","."],"Wir reisen gern im Sommer.","'gern' after verb; 'im Sommer' (in + dem) as time phrase.","Subject + Verb + gern + im + Noun"),
("A1","Verben",["Du","hilfst","mir","immer","."],"Du hilfst mir immer.","'helfen' takes dative 'mir'; 'immer' at end.","Subject + Verb + Dative pronoun + immer"),
("A1","Verben",["Sie","lernt","Spanisch","für","die","Reise","."],"Sie lernt Spanisch für die Reise.","Language without article; 'für + accusative' gives purpose.","Subject + Verb + Language + für + die + Noun"),
("A1","Verben",["Ich","kaufe","frisches","Brot","."],"Ich kaufe frisches Brot.","Neuter noun 'Brot' without article; adjective takes strong ending '-es'.","Subject + Verb + Adj(-es) + Noun (no article)"),
("A1","Verben",["Er","wohnt","allein","in","der","Stadt","."],"Er wohnt allein in der Stadt.","Manner 'allein' before location 'in der Stadt' (dative).","Subject + Verb + allein + in + der + Noun"),
("A1","Verben",["Wir","sprechen","kein","Französisch","."],"Wir sprechen kein Französisch.","Language negated with 'kein' (neuter noun).","Subject + Verb + kein (neut.) + Language"),
("A1","Verben",["Sie","arbeitet","von","zu","Hause","aus","."],"Sie arbeitet von zu Hause aus.","'von zu Hause aus' is a fixed phrase meaning 'from home / remotely'.","Subject + Verb + von zu Hause aus (fixed phrase)"),

# ── Zeitangaben (20) ──────────────────────
("A1","Zeit",["Am","Montagmorgen","habe","ich","Deutsch","."],"Am Montagmorgen habe ich Deutsch.","Fronted time 'am Montagmorgen' → verb second; subject inverts.","Time phrase + Verb + Subject + Noun"),
("A1","Zeit",["Übermorgen","fahren","wir","nach","Wien","."],"Übermorgen fahren wir nach Wien.","'Übermorgen' (the day after tomorrow) fronted → verb second.","Time adverb + Verb + Subject + nach + City"),
("A1","Zeit",["Um","Mitternacht","kommt","der","Zug","."],"Um Mitternacht kommt der Zug.","'Um Mitternacht' (at midnight) fronted; verb second.","Time phrase + Verb + Subject"),
("A1","Zeit",["Im","Frühling","blühen","die","Blumen","."],"Im Frühling blühen die Blumen.","Seasonal phrase fronted; verb second; plural subject after verb.","Time phrase + Verb + Subject"),
("A1","Zeit",["Seit","drei","Jahren","lerne","ich","Deutsch","."],"Seit drei Jahren lerne ich Deutsch.","'Seit + dative' (for the past three years); verb second after fronted phrase.","seit + Time + Verb + Subject + Object"),
("A1","Zeit",["Vor","dem","Frühstück","gehe","ich","joggen","."],"Vor dem Frühstück gehe ich joggen.","'Vor + dative' (before breakfast); verb second; infinitive at end.","Time phrase + Verb + Subject + Infinitive"),
("A1","Zeit",["In","einer","Stunde","bin","ich","fertig","."],"In einer Stunde bin ich fertig.","'In + dative' expresses how soon; verb second; predicate at end.","Time phrase + sein + Subject + Adjective"),
("A1","Zeit",["Der","Film","dauert","zwei","Stunden","."],"Der Film dauert zwei Stunden.","'dauern' (to last) + duration phrase.","Subject + Verb + Number + Time unit"),
("A1","Zeit",["Abends","gehen","wir","oft","spazieren","."],"Abends gehen wir oft spazieren.","Time adverb 'abends' fronted; 'oft' after subject; infinitive at end.","Time adverb + Verb + Subject + oft + Infinitive"),
("A1","Zeit",["Nach","dem","Unterricht","gehe","ich","nach","Hause","."],"Nach dem Unterricht gehe ich nach Hause.","'Nach + dative' (after class); verb second; destination 'nach Hause'.","Time phrase + Verb + Subject + Destination"),
("A1","Zeit",["Mittags","esse","ich","in","der","Kantine","."],"Mittags esse ich in der Kantine.","'Mittags' (at noon) fronted; location 'in der Kantine' (dative).","Time adverb + Verb + Subject + in + der + Noun"),
("A1","Zeit",["Morgen","früh","fahren","wir","los","."],"Morgen früh fahren wir los.","'Morgen früh' (tomorrow morning) fronted; separable verb 'losfahren'.","Time phrase + Verb stem + Subject + Prefix (end)"),
("A1","Zeit",["Im","August","haben","wir","Urlaub","."],"Im August haben wir Urlaub.","'Im August' fronted; 'Urlaub haben' is a fixed phrase.","Time phrase + Verb + Subject + Noun (set phrase)"),
("A1","Zeit",["Sonntags","schlafen","wir","lange","."],"Sonntags schlafen wir lange.","'Sonntags' (on Sundays) fronted; manner adverb 'lange' at end.","Time adverb + Verb + Subject + Adverb"),
("A1","Zeit",["Am","Nachmittag","trinken","wir","Kaffee","."],"Am Nachmittag trinken wir Kaffee.","'Am Nachmittag' (in the afternoon) fronted; verb second.","Time phrase + Verb + Subject + Noun"),
("A1","Zeit",["Einmal","pro","Woche","gehe","ich","schwimmen","."],"Einmal pro Woche gehe ich schwimmen.","Frequency phrase 'einmal pro Woche' fronted; infinitive at end.","Frequency phrase + Verb + Subject + Infinitive"),
("A1","Zeit",["Jeden","Abend","macht","er","seine","Hausaufgaben","."],"Jeden Abend macht er seine Hausaufgaben.","'Jeden Abend' fronted; verb second; object after subject.","Time phrase + Verb + Subject + Possessive + Object"),
("A1","Zeit",["Bald","beginnt","die","Schule","wieder","."],"Bald beginnt die Schule wieder.","'Bald' (soon) fronted; 'wieder' (again) at the end.","Time adverb + Verb + Subject + wieder"),
("A1","Zeit",["Am","Wochenende","besuchen","wir","unsere","Großeltern","."],"Am Wochenende besuchen wir unsere Großeltern.","Time phrase fronted; object with possessive at the end.","Time phrase + Verb + Subject + Possessive + Object"),
("A1","Zeit",["Um","halb","neun","fängt","der","Film","an","."],"Um halb neun fängt der Film an.","'Um halb neun' (at 8:30); separable 'anfangen': prefix 'an' at end.","Time phrase + Verb stem + Subject + Prefix (end)"),

# ── Familie (20) ──────────────────────────
("A1","Familie",["Mein","Großvater","erzählt","gern","Geschichten","."],"Mein Großvater erzählt gern Geschichten.","Possessive + masculine noun; 'gern' between verb and object.","Possessive + Noun + Verb + gern + Object"),
("A1","Familie",["Ihre","Schwester","studiert","Medizin","."],"Ihre Schwester studiert Medizin.","'ihre' (her) for feminine; subject + verb + field of study (no article).","Possessive + Noun + Verb + Noun (no article)"),
("A1","Familie",["Unser","Onkel","wohnt","in","München","."],"Unser Onkel wohnt in München.","'unser' for masculine nominative; 'in + city' (no article).","Possessive + Noun + Verb + in + City"),
("A1","Familie",["Meine","Cousine","heißt","Anna","."],"Meine Cousine heißt Anna.","'meine' for feminine; 'heißen' + name.","Possessive + Noun + heißen + Name"),
("A1","Familie",["Sein","Bruder","ist","Polizist","."],"Sein Bruder ist Polizist.","'sein' (his) for masculine; profession without article.","Possessive + Noun + sein + Profession"),
("A1","Familie",["Ihre","Eltern","kommen","aus","Polen","."],"Ihre Eltern kommen aus Polen.","'ihre' (her) for plural; 'aus + country' (no article for Poland).","Possessive + Plural noun + Verb + aus + Country"),
("A1","Familie",["Mein","Neffe","ist","fünf","Jahre","alt","."],"Mein Neffe ist fünf Jahre alt.","Age formula: sein + number + Jahre + alt.","Possessive + Noun + sein + Number + Jahre alt"),
("A1","Familie",["Ihre","Tante","backt","sehr","gut","."],"Ihre Tante backt sehr gut.","'sehr gut' as adverb phrase modifying the verb.","Possessive + Noun + Verb + sehr + Adverb"),
("A1","Familie",["Mein","Schwiegervater","ist","nett","."],"Mein Schwiegervater ist nett.","'mein' for masculine compound noun; predicative adjective.","Possessive + Compound noun + sein + Adjective"),
("A1","Familie",["Wir","haben","eine","große","Familie","."],"Wir haben eine große Familie.","Feminine noun: 'eine große Familie' (ending '-e' after 'eine').","Subject + haben + eine + Adj(-e) + Noun"),
("A1","Familie",["Ihr","Vater","arbeitet","als","Lehrer","."],"Ihr Vater arbeitet als Lehrer.","'ihr' (her) possessive; 'als + profession' (no article).","Possessive + Noun + Verb + als + Profession"),
("A1","Familie",["Meine","Oma","wohnt","bei","uns","."],"Meine Oma wohnt bei uns.","'bei + dative pronoun' means living with someone.","Possessive + Noun + Verb + bei + Pronoun"),
("A1","Familie",["Sein","Cousin","kommt","aus","Österreich","."],"Sein Cousin kommt aus Österreich.","'aus + country' (no article for Austria).","Possessive + Noun + Verb + aus + Country"),
("A1","Familie",["Ihre","Mutter","ist","Krankenschwester","."],"Ihre Mutter ist Krankenschwester.","Profession after 'ist' without article.","Possessive + Noun + sein + Profession (no article)"),
("A1","Familie",["Unser","Sohn","ist","sehr","intelligent","."],"Unser Sohn ist sehr intelligent.","'unser' for masculine; 'sehr' before adjective.","Possessive + Noun + sein + sehr + Adjective"),
("A1","Familie",["Ihr","Mann","kommt","aus","Spanien","."],"Ihr Mann kommt aus Spanien.","'ihr' (her); 'aus + country' without article.","Possessive + Noun + Verb + aus + Country"),
("A1","Familie",["Meine","Schwester","und","ich","sind","Zwillinge","."],"Meine Schwester und ich sind Zwillinge.","Compound subject with 'und'; plural predicate noun 'Zwillinge'.","Possessive + Noun + und + Pronoun + sein + Noun"),
("A1","Familie",["Sein","Großvater","lebt","noch","."],"Sein Großvater lebt noch.","'noch' (still) at the end of the sentence.","Possessive + Noun + Verb + noch"),
("A1","Familie",["Wir","besuchen","unsere","Großeltern","oft","."],"Wir besuchen unsere Großeltern oft.","Frequency adverb 'oft' at the end; object before adverb.","Subject + Verb + Possessive + Object + Frequency"),
("A1","Familie",["Ihre","Nichte","heißt","Sophie","."],"Ihre Nichte heißt Sophie.","'ihre' (her) for feminine noun; 'heißen' + name.","Possessive + Noun + heißen + Name"),

# ── Zahlen (15) ───────────────────────────
("A1","Zahlen",["Das","Ticket","kostet","zwanzig","Euro","."],"Das Ticket kostet zwanzig Euro.","Price: number + currency (no article).","Subject + Verb + Number + Currency"),
("A1","Zahlen",["Wir","sind","fünfzehn","Schüler","in","der","Klasse","."],"Wir sind fünfzehn Schüler in der Klasse.","Number + plural noun (no article); location 'in der Klasse'.","Subject + sein + Number + Plural noun + in + der + Noun"),
("A1","Zahlen",["Sie","wohnt","im","vierten","Stock","."],"Sie wohnt im vierten Stock.","Ordinal 'vierten' in dative; 'im' = in dem.","Subject + Verb + im + Ordinal(-ten) + Noun"),
("A1","Zahlen",["Das","Buch","hat","dreihundert","Seiten","."],"Das Buch hat dreihundert Seiten.","Number + plural noun as object; no article needed.","Subject + haben + Number + Plural noun"),
("A1","Zahlen",["Er","ist","am","zwanzigsten","März","geboren","."],"Er ist am zwanzigsten März geboren.","Date of birth: 'am + ordinal + month + geboren'.","Subject + sein + am + Ordinal + Month + geboren"),
("A1","Zahlen",["Das","kostet","elf","Euro","fünfzig","."],"Das kostet elf Euro fünfzig.","Spoken price: euros then cents (no decimal word).","Subject + Verb + Number + Euro + Cents"),
("A1","Zahlen",["Wir","brauchen","vier","Stühle","."],"Wir brauchen vier Stühle.","Number + plural noun as direct object.","Subject + Verb + Number + Plural noun"),
("A1","Zahlen",["Sie","lernt","seit","sechs","Monaten","Deutsch","."],"Sie lernt seit sechs Monaten Deutsch.","'seit + dative' (for six months); time before object.","Subject + Verb + seit + Number + Noun (dat.) + Language"),
("A1","Zahlen",["Das","Restaurant","hat","zwanzig","Tische","."],"Das Restaurant hat zwanzig Tische.","Number + plural noun after 'haben'.","Subject + haben + Number + Plural noun"),
("A1","Zahlen",["Ich","kaufe","drei","Liter","Milch","."],"Ich kaufe drei Liter Milch.","Quantity + unit + noun (no article after unit of measure).","Subject + Verb + Number + Unit + Noun"),
("A1","Zahlen",["Der","Laden","öffnet","um","neun","Uhr","dreißig","."],"Der Laden öffnet um neun Uhr dreißig.","'um' + clock time; minutes follow 'Uhr'.","Subject + Verb + um + Number + Uhr + Minutes"),
("A1","Zahlen",["Ich","brauche","ein","Kilo","Mehl","."],"Ich brauche ein Kilo Mehl.","Unit of measure 'ein Kilo' + noun without article.","Subject + Verb + ein + Unit + Noun (no article)"),
("A1","Zahlen",["Er","wohnt","im","dritten","Stock","."],"Er wohnt im dritten Stock.","'dritten' is the dative form of the ordinal.","Subject + Verb + im + Ordinal(-ten) + Noun"),
("A1","Zahlen",["Das","Kind","ist","am","zweiten","Juli","geboren","."],"Das Kind ist am zweiten Juli geboren.","Birthday: 'am + ordinal(-ten) + month + geboren'.","Subject + sein + am + Ordinal + Month + geboren"),
("A1","Zahlen",["Er","wiegt","achtzig","Kilo","."],"Er wiegt achtzig Kilo.","'wiegen' (to weigh) + number + unit.","Subject + Verb + Number + Unit"),

# ── Grundsätze (20) ───────────────────────
("A1","Grundsätze",["Ich","trinke","gern","grünen","Tee","."],"Ich trinke gern grünen Tee.","'gern' after verb; 'grünen Tee' — masculine accusative without article (strong '-en').","Subject + Verb + gern + Adj(-en) + Noun (no article)"),
("A1","Grundsätze",["Er","liest","die","Zeitung","am","Morgen","."],"Er liest die Zeitung am Morgen.","Object before time phrase; 'am Morgen' = in the morning.","Subject + Verb + Object + am + Noun"),
("A1","Grundsätze",["Wir","fahren","jeden","Sommer","ans","Meer","."],"Wir fahren jeden Sommer ans Meer.","'ans Meer' = an das Meer (accusative, direction).","Subject + Verb + Time + ans + Noun"),
("A1","Grundsätze",["Sie","spielt","Gitarre","und","singt","."],"Sie spielt Gitarre und singt.","Two verbs with same subject joined by 'und'; no article for instrument.","Subject + Verb + Noun + und + Verb"),
("A1","Grundsätze",["Das","ist","eine","interessante","Geschichte","."],"Das ist eine interessante Geschichte.","Feminine noun; adjective ending '-e' after 'eine'.","Das + sein + eine + Adj(-e) + Noun"),
("A1","Grundsätze",["Er","wohnt","allein","in","einer","Wohnung","."],"Er wohnt allein in einer Wohnung.","'allein' (alone) as manner adverb; location with 'in + dative'.","Subject + Verb + allein + in + einer + Noun"),
("A1","Grundsätze",["Wir","gehen","heute","Abend","ins","Theater","."],"Wir gehen heute Abend ins Theater.","'ins Theater' = in das Theater (accusative, direction).","Subject + Verb + Time + ins + Noun"),
("A1","Grundsätze",["Sie","trägt","heute","ein","blaues","Kleid","."],"Sie trägt heute ein blaues Kleid.","Time 'heute' before object; neuter indefinite: 'ein blaues' (strong '-es').","Subject + Verb + Time + ein + Adj(-es) + Noun"),
("A1","Grundsätze",["Ich","brauche","Zeit","für","mich","."],"Ich brauche Zeit für mich.","'für + reflexive pronoun' (for myself); 'Zeit' without article (general).","Subject + Verb + Noun + für + Pronoun"),
("A1","Grundsätze",["Wir","sprechen","immer","Deutsch","zusammen","."],"Wir sprechen immer Deutsch zusammen.","'immer' before language; 'zusammen' at the end.","Subject + Verb + immer + Language + zusammen"),
("A1","Grundsätze",["Sie","hilft","gern","anderen","Menschen","."],"Sie hilft gern anderen Menschen.","'helfen + dative'; 'gern' shows willingness; 'anderen Menschen' = dative plural.","Subject + Verb + gern + Dative plural"),
("A1","Grundsätze",["Ich","lerne","jeden","Tag","neue","Wörter","."],"Ich lerne jeden Tag neue Wörter.","Time 'jeden Tag'; accusative plural 'neue Wörter' (adjective '-e').","Subject + Verb + Time + Adj(-e) + Plural noun"),
("A1","Grundsätze",["Er","fährt","mit","dem","Fahrrad","zur","Arbeit","."],"Er fährt mit dem Fahrrad zur Arbeit.","'mit + dative' for transport; 'zur Arbeit' = zu der Arbeit.","Subject + Verb + mit + dem + Noun + zur + Noun"),
("A1","Grundsätze",["Wir","essen","abends","oft","zusammen","."],"Wir essen abends oft zusammen.","Time 'abends', frequency 'oft', manner 'zusammen' — all after verb.","Subject + Verb + Time + oft + zusammen"),
("A1","Grundsätze",["Sie","macht","jeden","Morgen","Yoga","."],"Sie macht jeden Morgen Yoga.","'jeden Morgen' (every morning) + activity (no article).","Subject + Verb + Time + Noun (no article)"),
("A1","Grundsätze",["Ich","rufe","meine","Eltern","jeden","Sonntag","an","."],"Ich rufe meine Eltern jeden Sonntag an.","Separable 'anrufen': accusative object + time + prefix 'an' at end.","Subject + Verb stem + Object + Time + Prefix (end)"),
("A1","Grundsätze",["Er","liest","gern","historische","Romane","."],"Er liest gern historische Romane.","'gern' after verb; accusative plural without article: adjective '-e'.","Subject + Verb + gern + Adj(-e) + Plural noun"),
("A1","Grundsätze",["Wir","trinken","Kaffee","und","essen","Kuchen","."],"Wir trinken Kaffee und essen Kuchen.","Two verbs sharing the same subject; both objects without article.","Subject + Verb + Noun + und + Verb + Noun"),
("A1","Grundsätze",["Das","ist","kein","Problem","für","mich","."],"Das ist kein Problem für mich.","'kein' negates the neuter noun; 'für + accusative pronoun'.","Das + sein + kein + Noun + für + Pronoun"),
("A1","Grundsätze",["Er","kommt","immer","pünktlich","zur","Arbeit","."],"Er kommt immer pünktlich zur Arbeit.","'immer pünktlich' (always on time); 'zur Arbeit' (zu der Arbeit).","Subject + Verb + immer + Adverb + zur + Noun"),

# ══════════════════════════════════════════
# A2 — 150 new sentences
# ══════════════════════════════════════════

# ── Trennbare Verben (25) ─────────────────
("A2","Trennbare Verben",["Er","wacht","jeden","Morgen","um","sechs","Uhr","auf","."],"Er wacht jeden Morgen um sechs Uhr auf.","'aufwachen': time expressions before the prefix 'auf' at end.","Subject + Verb stem + Time + Time + Prefix (end)"),
("A2","Trennbare Verben",["Ich","ziehe","mich","schnell","an","."],"Ich ziehe mich schnell an.","'sich anziehen' (to get dressed): reflexive 'mich' after stem; adverb then prefix.","Subject + Verb stem + mich + Adverb + Prefix (end)"),
("A2","Trennbare Verben",["Sie","lädt","ihre","Familie","zum","Essen","ein","."],"Sie lädt ihre Familie zum Essen ein.","'einladen': object + 'zum Essen' (purpose) + prefix 'ein'.","Subject + Verb stem + Object + zum Noun + Prefix (end)"),
("A2","Trennbare Verben",["Wir","räumen","nach","dem","Essen","auf","."],"Wir räumen nach dem Essen auf.","'aufräumen': time phrase 'nach dem Essen' before prefix 'auf'.","Subject + Verb stem + Time phrase + Prefix (end)"),
("A2","Trennbare Verben",["Er","fängt","morgen","mit","dem","Kurs","an","."],"Er fängt morgen mit dem Kurs an.","'anfangen': time 'morgen' then manner 'mit dem Kurs' before prefix.","Subject + Verb stem + Time + Manner + Prefix (end)"),
("A2","Trennbare Verben",["Du","siehst","heute","sehr","schick","aus","."],"Du siehst heute sehr schick aus.","'aussehen': time + manner adverbs before prefix 'aus'.","Subject + Verb stem + Time + sehr + Adverb + Prefix (end)"),
("A2","Trennbare Verben",["Ich","stelle","das","Handy","ab","."],"Ich stelle das Handy ab.","'abstellen' (to turn off): object between stem and prefix 'ab'.","Subject + Verb stem + Object + Prefix (end)"),
("A2","Trennbare Verben",["Wir","gehen","am","Samstag","einkaufen","."],"Wir gehen am Samstag einkaufen.","'einkaufen gehen': time + infinitive at end.","Subject + Verb stem + Time + Infinitive (end)"),
("A2","Trennbare Verben",["Er","nimmt","seinen","Schlüssel","mit","."],"Er nimmt seinen Schlüssel mit.","'mitnehmen': masculine accusative object before prefix 'mit'.","Subject + Verb stem + Object (masc. acc.) + Prefix (end)"),
("A2","Trennbare Verben",["Sie","schreibt","die","wichtigen","Wörter","auf","."],"Sie schreibt die wichtigen Wörter auf.","'aufschreiben': object with adjective before prefix 'auf'.","Subject + Verb stem + Article + Adj + Noun + Prefix (end)"),
("A2","Trennbare Verben",["Ich","rufe","heute","Abend","an","."],"Ich rufe heute Abend an.","'anrufen': time phrase before prefix 'an' at end (no object stated).","Subject + Verb stem + Time + Prefix (end)"),
("A2","Trennbare Verben",["Wir","holen","das","Paket","ab","."],"Wir holen das Paket ab.","'abholen' (to pick up): neuter object before prefix 'ab'.","Subject + Verb stem + Object + Prefix (end)"),
("A2","Trennbare Verben",["Er","macht","die","Heizung","an","."],"Er macht die Heizung an.","'anmachen' (to turn on): feminine object before prefix 'an'.","Subject + Verb stem + Object (fem.) + Prefix (end)"),
("A2","Trennbare Verben",["Sie","zieht","die","Schuhe","aus","."],"Sie zieht die Schuhe aus.","'ausziehen' (to take off): plural object before prefix 'aus'.","Subject + Verb stem + Object (pl.) + Prefix (end)"),
("A2","Trennbare Verben",["Ich","bereite","das","Abendessen","vor","."],"Ich bereite das Abendessen vor.","'vorbereiten': neuter object before prefix 'vor'.","Subject + Verb stem + Object (neut.) + Prefix (end)"),
("A2","Trennbare Verben",["Er","liest","den","Kindern","die","Geschichte","vor","."],"Er liest den Kindern die Geschichte vor.","'vorlesen': dative recipient then accusative object then prefix.","Subject + Verb stem + Dative + Accusative + Prefix (end)"),
("A2","Trennbare Verben",["Wir","machen","das","Fenster","auf","."],"Wir machen das Fenster auf.","'aufmachen' (to open): neuter object before prefix.","Subject + Verb stem + Object (neut.) + Prefix (end)"),
("A2","Trennbare Verben",["Sie","kommt","pünktlich","an","."],"Sie kommt pünktlich an.","'ankommen' (to arrive): manner adverb before prefix 'an'.","Subject + Verb stem + Adverb + Prefix (end)"),
("A2","Trennbare Verben",["Ich","packe","meine","Sachen","ein","."],"Ich packe meine Sachen ein.","'einpacken': possessive object before prefix 'ein'.","Subject + Verb stem + Possessive + Noun + Prefix (end)"),
("A2","Trennbare Verben",["Er","dreht","das","Radio","ab","."],"Er dreht das Radio ab.","'abdrehen' (to turn off by rotating): object before prefix 'ab'.","Subject + Verb stem + Object + Prefix (end)"),
("A2","Trennbare Verben",["Wir","bereiten","uns","auf","den","Test","vor","."],"Wir bereiten uns auf den Test vor.","'sich vorbereiten auf + accusative': reflexive + prepositional object + prefix.","Subject + Verb stem + sich + auf + Accusative + Prefix (end)"),
("A2","Trennbare Verben",["Er","stellt","den","Wecker","auf","sieben","Uhr","ein","."],"Er stellt den Wecker auf sieben Uhr ein.","'einstellen' (to set): object + 'auf + time' + prefix 'ein'.","Subject + Verb stem + Object + auf + Time + Prefix (end)"),
("A2","Trennbare Verben",["Sie","zieht","nächsten","Monat","in","ein","neues","Haus","um","."],"Sie zieht nächsten Monat in ein neues Haus um.","'umziehen': time + destination phrase (in + acc.) + prefix at very end.","Subject + Verb stem + Time + in + Object + Prefix (end)"),
("A2","Trennbare Verben",["Ich","mache","das","Licht","aus","."],"Ich mache das Licht aus.","'ausmachen' (to switch off): neuter object before prefix 'aus'.","Subject + Verb stem + Object + Prefix (end)"),
("A2","Trennbare Verben",["Du","rufst","bitte","mich","morgen","an","."],"Du rufst bitte mich morgen an.","'anrufen': polite 'bitte' before pronoun object, time then prefix.","Subject + Verb stem + bitte + Pronoun + Time + Prefix (end)"),

# ── Modalverben (25) ──────────────────────
("A2","Modalverben",["Ich","möchte","gern","Pilot","werden","."],"Ich möchte gern Pilot werden.","'möchte' (would like) + 'gern' + noun + infinitive at end.","Subject + möchte + gern + Noun + Infinitive (end)"),
("A2","Modalverben",["Du","kannst","das","schaffen","."],"Du kannst das schaffen.","'können' (can) + accusative pronoun + infinitive at end.","Subject + können + Object + Infinitive (end)"),
("A2","Modalverben",["Er","muss","jeden","Tag","trainieren","."],"Er muss jeden Tag trainieren.","'müssen' + time phrase + infinitive at end.","Subject + müssen + Time + Infinitive (end)"),
("A2","Modalverben",["Wir","dürfen","hier","nicht","lärmen","."],"Wir dürfen hier nicht lärmen.","'dürfen + nicht' = prohibition; location before 'nicht'.","Subject + dürfen + Location + nicht + Infinitive (end)"),
("A2","Modalverben",["Sie","soll","die","E-Mail","schicken","."],"Sie soll die E-Mail schicken.","'sollen' = she is supposed to; object before infinitive.","Subject + sollen + Object + Infinitive (end)"),
("A2","Modalverben",["Ich","will","ein","neues","Buch","kaufen","."],"Ich will ein neues Buch kaufen.","'wollen' + object (neut. indef. + adj.) + infinitive.","Subject + wollen + ein + Adj + Noun + Infinitive (end)"),
("A2","Modalverben",["Kann","ich","bitte","das","Fenster","öffnen","?"],"Kann ich bitte das Fenster öffnen?","Modal-first question; 'bitte' after subject for politeness.","Modal + Subject + bitte + Object + Infinitive + ?"),
("A2","Modalverben",["Du","musst","dir","keine","Sorgen","machen","."],"Du musst dir keine Sorgen machen.","'sich Sorgen machen' = to worry; 'keine' negates the plural noun.","Subject + müssen + Dative pronoun + keine + Noun + Infinitive (end)"),
("A2","Modalverben",["Er","will","nach","Australien","reisen","."],"Er will nach Australien reisen.","'nach + country' for destination; infinitive at end.","Subject + wollen + nach + Country + Infinitive (end)"),
("A2","Modalverben",["Wir","können","das","Problem","zusammen","lösen","."],"Wir können das Problem zusammen lösen.","'können' + object + manner adverb + infinitive.","Subject + können + Object + Adverb + Infinitive (end)"),
("A2","Modalverben",["Sie","darf","heute","früher","gehen","."],"Sie darf heute früher gehen.","Permission: time + comparative adverb + infinitive.","Subject + dürfen + Time + Adverb + Infinitive (end)"),
("A2","Modalverben",["Ich","soll","mehr","Gemüse","essen","."],"Ich soll mehr Gemüse essen.","'sollen' for advice/instruction; 'mehr' before object.","Subject + sollen + mehr + Noun + Infinitive (end)"),
("A2","Modalverben",["Möchten","Sie","noch","etwas","trinken","?"],"Möchten Sie noch etwas trinken?","Formal polite question; 'noch etwas' (something more) before infinitive.","Möchten + Sie + noch + etwas + Infinitive + ?"),
("A2","Modalverben",["Er","kann","sehr","gut","Gitarre","spielen","."],"Er kann sehr gut Gitarre spielen.","Ability: 'sehr gut' adverb phrase + instrument + infinitive.","Subject + können + sehr gut + Noun + Infinitive (end)"),
("A2","Modalverben",["Wir","müssen","das","Zimmer","aufräumen","."],"Wir müssen das Zimmer aufräumen.","'müssen' + object + separable infinitive at end.","Subject + müssen + Object + Separable infinitive (end)"),
("A2","Modalverben",["Ich","will","nächstes","Jahr","Urlaub","nehmen","."],"Ich will nächstes Jahr Urlaub nehmen.","'wollen' + time + fixed phrase 'Urlaub nehmen' at end.","Subject + wollen + Time + Noun + Infinitive (end)"),
("A2","Modalverben",["Sie","kann","kein","Auto","fahren","."],"Sie kann kein Auto fahren.","'kein' negates the neuter noun; infinitive at end.","Subject + können + kein + Noun + Infinitive (end)"),
("A2","Modalverben",["Du","darfst","das","nicht","essen","."],"Du darfst das nicht essen.","'dürfen + nicht' = prohibition; 'nicht' before infinitive.","Subject + dürfen + Object + nicht + Infinitive (end)"),
("A2","Modalverben",["Er","muss","den","Zug","nehmen","."],"Er muss den Zug nehmen.","'müssen' + masculine accusative object + infinitive.","Subject + müssen + den + Noun + Infinitive (end)"),
("A2","Modalverben",["Wir","können","heute","nicht","kommen","."],"Wir können heute nicht kommen.","Time then 'nicht' before infinitive; inability expressed.","Subject + können + Time + nicht + Infinitive (end)"),
("A2","Modalverben",["Sie","möchte","eine","Pause","machen","."],"Sie möchte eine Pause machen.","'möchte' (would like) + feminine object + infinitive.","Subject + möchte + eine + Noun + Infinitive (end)"),
("A2","Modalverben",["Ich","kann","nicht","gut","schlafen","."],"Ich kann nicht gut schlafen.","'nicht' before adverb negates ability; infinitive at end.","Subject + können + nicht + gut + Infinitive (end)"),
("A2","Modalverben",["Du","musst","früher","aufstehen","."],"Du musst früher aufstehen.","'müssen' + comparative adverb + separable infinitive.","Subject + müssen + Adverb + Separable infinitive (end)"),
("A2","Modalverben",["Ich","möchte","eine","Reise","nach","Japan","machen","."],"Ich möchte eine Reise nach Japan machen.","'möchte' + object + destination + infinitive at end.","Subject + möchte + Object + Destination + Infinitive (end)"),
("A2","Modalverben",["Er","mag","keine","laute","Musik","."],"Er mag keine laute Musik.","'mögen' expresses dislike; 'keine' + adjective + feminine noun.","Subject + mögen + keine + Adj + Noun"),

# ── Perfekt (30) ──────────────────────────
("A2","Perfekt",["Ich","habe","heute","Morgen","gefrühstückt","."],"Ich habe heute Morgen gefrühstückt.","Regular participle 'gefrühstückt'; compound time 'heute Morgen'.","Subject + haben + Time + Participle (end)"),
("A2","Perfekt",["Er","hat","gestern","seine","Mutter","besucht","."],"Er hat gestern seine Mutter besucht.","'besuchen' is inseparable: no 'ge-'; regular '-t' ending.","Subject + hat + Time + Object + Participle (no ge-)"),
("A2","Perfekt",["Wir","sind","nach","Wien","geflogen","."],"Wir sind nach Wien geflogen.","'fliegen' uses 'sein' (movement); 'nach + city' for destination.","Subject + sein + Destination + Participle (end)"),
("A2","Perfekt",["Sie","hat","ein","neues","Kleid","gekauft","."],"Sie hat ein neues Kleid gekauft.","Regular participle 'gekauft'; adjective inside neuter object phrase.","Subject + hat + ein + Adj + Noun + Participle (end)"),
("A2","Perfekt",["Ich","bin","gestern","zu","Fuß","gegangen","."],"Ich bin gestern zu Fuß gegangen.","'gehen' uses 'sein'; time before manner phrase 'zu Fuß'.","Subject + sein + Time + zu Fuß + Participle (end)"),
("A2","Perfekt",["Du","hast","einen","Fehler","gefunden","."],"Du hast einen Fehler gefunden.","Irregular participle 'gefunden'; masculine accusative object.","Subject + hast + einen + Noun + Participle (end)"),
("A2","Perfekt",["Er","ist","spät","nach","Hause","gekommen","."],"Er ist spät nach Hause gekommen.","'kommen' uses 'sein'; manner 'spät' before destination.","Subject + sein + Adverb + Destination + Participle (end)"),
("A2","Perfekt",["Wir","haben","das","Projekt","abgeschlossen","."],"Wir haben das Projekt abgeschlossen.","Separable 'abschließen': participle = 'ab' + 'ge' + 'schlossen'.","Subject + haben + Object + Separable participle (end)"),
("A2","Perfekt",["Sie","hat","eine","Prüfung","bestanden","."],"Sie hat eine Prüfung bestanden.","Inseparable 'bestehen': no 'ge-'; irregular participle 'bestanden'.","Subject + hat + Object + Participle (no ge-, irregular)"),
("A2","Perfekt",["Ich","habe","einen","Brief","geschrieben","."],"Ich habe einen Brief geschrieben.","Irregular participle 'geschrieben'; masculine accusative object.","Subject + haben + einen + Noun + Participle (end)"),
("A2","Perfekt",["Er","hat","das","Auto","verkauft","."],"Er hat das Auto verkauft.","Inseparable 'verkaufen': no 'ge-'; regular '-t' ending.","Subject + hat + Object + Participle (no ge-)"),
("A2","Perfekt",["Wir","sind","im","Park","spazieren","gegangen","."],"Wir sind im Park spazieren gegangen.","'spazieren gehen' uses 'sein'; location before compound infinitive.","Subject + sein + Location + Infinitive + Participle (end)"),
("A2","Perfekt",["Sie","hat","Spanisch","gelernt","."],"Sie hat Spanisch gelernt.","Regular participle 'gelernt'; language without article.","Subject + hat + Language + Participle (end)"),
("A2","Perfekt",["Ich","habe","den","Bus","verpasst","."],"Ich habe den Bus verpasst.","Inseparable 'verpassen': no 'ge-'; regular '-t' ending.","Subject + haben + den + Noun + Participle (no ge-)"),
("A2","Perfekt",["Wir","haben","das","Haus","geputzt","."],"Wir haben das Haus geputzt.","Regular participle 'geputzt'; neuter accusative object.","Subject + haben + Object + Participle (end)"),
("A2","Perfekt",["Sie","ist","ins","Ausland","gefahren","."],"Sie ist ins Ausland gefahren.","'fahren' uses 'sein'; 'ins Ausland' (abroad, accusative direction).","Subject + sein + ins + Noun + Participle (end)"),
("A2","Perfekt",["Ich","habe","meinen","Schlüssel","verloren","."],"Ich habe meinen Schlüssel verloren.","Inseparable 'verlieren': no 'ge-'; irregular participle 'verloren'.","Subject + haben + Object + Participle (no ge-)"),
("A2","Perfekt",["Er","hat","ein","Buch","geschrieben","."],"Er hat ein Buch geschrieben.","Irregular participle 'geschrieben'; indefinite neuter object.","Subject + hat + ein + Noun + Participle (end)"),
("A2","Perfekt",["Sie","hat","ihre","Freundin","angerufen","."],"Sie hat ihre Freundin angerufen.","Separable 'anrufen': participle 'an' + 'ge' + 'rufen'.","Subject + hat + Object + Separable participle (end)"),
("A2","Perfekt",["Ich","bin","gestern","früh","aufgestanden","."],"Ich bin gestern früh aufgestanden.","'aufstehen' uses 'sein'; time adverbs before the separable participle.","Subject + sein + Time + Adverb + Separable participle (end)"),
("A2","Perfekt",["Er","hat","das","Essen","bezahlt","."],"Er hat das Essen bezahlt.","Regular participle 'bezahlt'; no 'ge-' as 'be-' makes it inseparable.","Subject + hat + Object + Participle (no ge-, inseparable)"),
("A2","Perfekt",["Wir","haben","lange","gefeiert","."],"Wir haben lange gefeiert.","Duration adverb 'lange'; regular participle 'gefeiert'.","Subject + haben + lange + Participle (end)"),
("A2","Perfekt",["Sie","hat","ihren","Job","gewechselt","."],"Sie hat ihren Job gewechselt.","Regular participle 'gewechselt'; masculine accusative object.","Subject + hat + Object + Participle (end)"),
("A2","Perfekt",["Ich","habe","gut","geschlafen","."],"Ich habe gut geschlafen.","Irregular participle 'geschlafen'; adverb 'gut' before participle.","Subject + haben + gut + Participle (end)"),
("A2","Perfekt",["Du","hast","die","Aufgabe","erledigt","."],"Du hast die Aufgabe erledigt.","Inseparable 'erledigen': no 'ge-'; regular '-t' ending.","Subject + hast + Object + Participle (no ge-)"),
("A2","Perfekt",["Er","ist","nach","München","umgezogen","."],"Er ist nach München umgezogen.","'umziehen' (to move house) uses 'sein'; separable participle.","Subject + sein + Destination + Separable participle (end)"),
("A2","Perfekt",["Wir","haben","das","Konzert","verpasst","."],"Wir haben das Konzert verpasst.","Inseparable 'verpassen': no 'ge-'; neuter object.","Subject + haben + Object + Participle (no ge-)"),
("A2","Perfekt",["Sie","hat","ihre","Hausaufgaben","vergessen","."],"Sie hat ihre Hausaufgaben vergessen.","'vergessen' stays the same as participle; inseparable verb.","Subject + hat + Object + Participle (no ge-)"),
("A2","Perfekt",["Ich","habe","das","Formular","ausgefüllt","."],"Ich habe das Formular ausgefüllt.","Separable 'ausfüllen': participle = 'aus' + 'ge' + 'füllt'.","Subject + haben + Object + Separable participle (end)"),
("A2","Perfekt",["Er","hat","den","ganzen","Tag","gearbeitet","."],"Er hat den ganzen Tag gearbeitet.","Duration phrase 'den ganzen Tag' (accusative) before participle.","Subject + hat + Duration + Participle (end)"),

# ── TeKaMoLo (20) ─────────────────────────
("A2","TeKaMoLo",["Ich","gehe","jeden","Morgen","mit","dem","Hund","in","den","Park","."],"Ich gehe jeden Morgen mit dem Hund in den Park.","Time (jeden Morgen) → Manner (mit dem Hund) → Place (in den Park).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Er","fährt","oft","schnell","mit","dem","Motorrad","zur","Arbeit","."],"Er fährt oft schnell mit dem Motorrad zur Arbeit.","Time (oft) → Manner (schnell / mit dem Motorrad) → Place (zur Arbeit).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Wir","fahren","nächsten","Sommer","mit","dem","Zug","nach","Paris","."],"Wir fahren nächsten Sommer mit dem Zug nach Paris.","Time (nächsten Sommer) → Manner (mit dem Zug) → Place (nach Paris).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Sie","geht","abends","allein","im","Park","spazieren","."],"Sie geht abends allein im Park spazieren.","Time (abends) → Manner (allein) → Place (im Park).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Er","hat","gestern","nervös","im","Büro","gearbeitet","."],"Er hat gestern nervös im Büro gearbeitet.","Perfekt + TeKaMoLo: Time (gestern) → Manner (nervös) → Place (im Büro).","Subject + haben + Time + Manner + Place + Participle (end)"),
("A2","TeKaMoLo",["Wir","essen","samstags","gemütlich","in","einem","Café","."],"Wir essen samstags gemütlich in einem Café.","Time (samstags) → Manner (gemütlich) → Place (in einem Café).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Ich","gehe","morgens","immer","zu","Fuß","zur","Uni","."],"Ich gehe morgens immer zu Fuß zur Uni.","Time (morgens/immer) → Manner (zu Fuß) → Place (zur Uni).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Er","fährt","manchmal","mit","dem","Bus","in","die","Stadt","."],"Er fährt manchmal mit dem Bus in die Stadt.","Time (manchmal) → Manner (mit dem Bus) → Place (in die Stadt).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Sie","kommt","täglich","pünktlich","ins","Büro","."],"Sie kommt täglich pünktlich ins Büro.","Time (täglich) → Manner (pünktlich) → Place (ins Büro).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Wir","treffen","uns","jeden","Freitag","gemeinsam","am","Bahnhof","."],"Wir treffen uns jeden Freitag gemeinsam am Bahnhof.","Time (jeden Freitag) → Manner (gemeinsam) → Place (am Bahnhof).","Subject + Verb + uns + Time + Manner + Place"),
("A2","TeKaMoLo",["Er","hat","letzte","Woche","fleißig","zu","Hause","gearbeitet","."],"Er hat letzte Woche fleißig zu Hause gearbeitet.","Perfekt + TeKaMoLo: Time → Manner → Place → Participle.","Subject + haben + Time + Manner + Place + Participle (end)"),
("A2","TeKaMoLo",["Ich","fahre","morgen","früh","mit","dem","Flugzeug","nach","London","."],"Ich fahre morgen früh mit dem Flugzeug nach London.","Time (morgen früh) → Manner (mit dem Flugzeug) → Place (nach London).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Sie","geht","mittwochs","immer","schnell","ins","Fitnessstudio","."],"Sie geht mittwochs immer schnell ins Fitnessstudio.","Time (mittwochs/immer) → Manner (schnell) → Place (ins Fitnessstudio).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Wir","sind","letzten","Sommer","gemütlich","ans","Meer","gefahren","."],"Wir sind letzten Sommer gemütlich ans Meer gefahren.","Perfekt + sein: Time → Manner → Place → Participle.","Subject + sein + Time + Manner + Place + Participle (end)"),
("A2","TeKaMoLo",["Er","kommt","heute","Abend","spät","nach","Hause","."],"Er kommt heute Abend spät nach Hause.","Time (heute Abend) → Manner (spät) → Place (nach Hause).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Ich","arbeite","täglich","konzentriert","im","Büro","."],"Ich arbeite täglich konzentriert im Büro.","Time (täglich) → Manner (konzentriert) → Place (im Büro).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Sie","fährt","morgens","mit","der","U-Bahn","zur","Schule","."],"Sie fährt morgens mit der U-Bahn zur Schule.","Time (morgens) → Manner (mit der U-Bahn) → Place (zur Schule).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Wir","gehen","sonntags","gern","in","die","Natur","."],"Wir gehen sonntags gern in die Natur.","Time (sonntags) → Manner (gern) → Place (in die Natur).","Subject + Verb + Time + Manner + Place"),
("A2","TeKaMoLo",["Er","ist","gestern","früh","zum","Arzt","gegangen","."],"Er ist gestern früh zum Arzt gegangen.","Perfekt + sein: Time (gestern früh) → Place (zum Arzt).","Subject + sein + Time + Place + Participle (end)"),
("A2","TeKaMoLo",["Sie","kommt","jeden","Abend","erschöpft","nach","Hause","."],"Sie kommt jeden Abend erschöpft nach Hause.","Time (jeden Abend) → Manner (erschöpft) → Place (nach Hause).","Subject + Verb + Time + Manner + Place"),

# ── Dativ (15) ────────────────────────────
("A2","Dativ",["Ich","kaufe","meinem","Vater","ein","Geschenk","."],"Ich kaufe meinem Vater ein Geschenk.","'kaufen': dative recipient ('meinem Vater') before the accusative object.","Subject + Verb + Dative + Accusative"),
("A2","Dativ",["Du","schenkst","deiner","Mutter","Blumen","."],"Du schenkst deiner Mutter Blumen.","'schenken': dative ('deiner Mutter', feminine) before accusative plural.","Subject + Verb + Dative (fem.) + Accusative (pl.)"),
("A2","Dativ",["Er","gibt","dem","Kind","eine","Süßigkeit","."],"Er gibt dem Kind eine Süßigkeit.","'geben': dative ('dem Kind', neuter) then accusative object.","Subject + Verb + Dative (neut.) + Accusative"),
("A2","Dativ",["Wir","erklären","den","Schülern","die","Aufgabe","."],"Wir erklären den Schülern die Aufgabe.","'erklären': dative plural ('den Schülern') before definite accusative.","Subject + Verb + Dative (pl.) + Accusative"),
("A2","Dativ",["Sie","hilft","ihrem","Kollegen","bei","der","Arbeit","."],"Sie hilft ihrem Kollegen bei der Arbeit.","'helfen' + dative; 'bei + dative' gives the context.","Subject + helfen + Dative + bei + der + Noun"),
("A2","Dativ",["Ich","zeige","meiner","Freundin","die","Fotos","."],"Ich zeige meiner Freundin die Fotos.","'zeigen': dative ('meiner Freundin', feminine) before accusative.","Subject + Verb + Dative (fem.) + Accusative"),
("A2","Dativ",["Er","bringt","seiner","Frau","Kaffee","."],"Er bringt seiner Frau Kaffee.","'bringen': dative ('seiner Frau') before mass noun (no article).","Subject + Verb + Dative + Noun (no article)"),
("A2","Dativ",["Wir","danken","dem","Lehrer","für","seinen","Unterricht","."],"Wir danken dem Lehrer für seinen Unterricht.","'danken' + dative; reason with 'für + accusative'.","Subject + danken + Dative + für + Possessive + Noun"),
("A2","Dativ",["Das","gefällt","mir","wirklich","gut","."],"Das gefällt mir wirklich gut.","'gefallen' + dative 'mir'; 'wirklich' intensifies 'gut'.","Subject (thing) + gefallen + Dative + wirklich + gut"),
("A2","Dativ",["Er","empfiehlt","mir","dieses","Restaurant","."],"Er empfiehlt mir dieses Restaurant.","'empfehlen': dative pronoun 'mir' before demonstrative accusative.","Subject + empfehlen + Dative pronoun + Accusative"),
("A2","Dativ",["Sie","erklärt","ihrem","Sohn","die","Hausaufgaben","."],"Sie erklärt ihrem Sohn die Hausaufgaben.","'erklären': dative ('ihrem Sohn', masculine) before definite plural.","Subject + Verb + Dative (masc.) + Accusative (pl.)"),
("A2","Dativ",["Ich","gebe","dem","Hund","etwas","zu","fressen","."],"Ich gebe dem Hund etwas zu fressen.","'geben' + dative + 'etwas zu + infinitive' (something to eat).","Subject + Verb + Dative + etwas + zu + Infinitive"),
("A2","Dativ",["Er","schreibt","seiner","Oma","einen","Brief","."],"Er schreibt seiner Oma einen Brief.","'schreiben': dative ('seiner Oma', feminine) before masculine accusative.","Subject + Verb + Dative (fem.) + Accusative (masc.)"),
("A2","Dativ",["Wir","schenken","unserer","Lehrerin","Blumen","."],"Wir schenken unserer Lehrerin Blumen.","'schenken': dative ('unserer Lehrerin', feminine) before plural object.","Subject + Verb + Dative (fem.) + Accusative (pl.)"),
("A2","Dativ",["Das","passt","ihm","gut","."],"Das passt ihm gut.","'passen' + dative; masculine dative pronoun 'ihm'.","Subject + Verb + Dative pronoun + gut"),

# ── Präpositionen (15) ────────────────────
("A2","Präpositionen",["Er","steht","vor","dem","Spiegel","."],"Er steht vor dem Spiegel.","'vor + dative' for static position (in front of).","Subject + stehen + vor + dem + Noun"),
("A2","Präpositionen",["Das","Buch","liegt","unter","dem","Tisch","."],"Das Buch liegt unter dem Tisch.","'unter + dative' for static position (under/beneath).","Subject + liegen + unter + dem + Noun"),
("A2","Präpositionen",["Sie","läuft","durch","den","Park","."],"Sie läuft durch den Park.","'durch + accusative' (through); movement through a space.","Subject + Verb + durch + den + Noun"),
("A2","Präpositionen",["Wir","warten","auf","den","nächsten","Zug","."],"Wir warten auf den nächsten Zug.","'warten auf + accusative' is a fixed prepositional verb.","Subject + warten + auf + den + Adj + Noun"),
("A2","Präpositionen",["Er","hängt","das","Bild","über","das","Sofa","."],"Er hängt das Bild über das Sofa.","'über + accusative' = movement upward above the sofa.","Subject + hängen + Object + über + das + Noun (acc.)"),
("A2","Präpositionen",["Er","denkt","oft","an","seinen","alten","Freund","."],"Er denkt oft an seinen alten Freund.","'denken an + accusative' is a fixed prepositional verb.","Subject + denken + oft + an + Accusative"),
("A2","Präpositionen",["Wir","fahren","durch","die","Stadt","."],"Wir fahren durch die Stadt.","'durch + accusative' for movement through.","Subject + Verb + durch + die + Noun"),
("A2","Präpositionen",["Das","Café","liegt","zwischen","dem","Bahnhof","und","dem","Hotel","."],"Das Café liegt zwischen dem Bahnhof und dem Hotel.","'zwischen + dative' for static location between two things.","Subject + liegen + zwischen + dem + Noun + und + dem + Noun"),
("A2","Präpositionen",["Sie","stellt","die","Vase","auf","das","Regal","."],"Sie stellt die Vase auf das Regal.","'stellen + auf + accusative' = placing onto a surface (direction).","Subject + stellen + Object + auf + das + Noun (acc.)"),
("A2","Präpositionen",["Er","setzt","sich","neben","seine","Freundin","."],"Er setzt sich neben seine Freundin.","'sich setzen + neben + accusative' = to sit down next to (movement).","Subject + sich setzen + neben + Possessive + Noun (acc.)"),
("A2","Präpositionen",["Wir","gehen","an","den","Strand","."],"Wir gehen an den Strand.","'an + accusative' for direction towards the shore.","Subject + gehen + an + den + Noun (acc.)"),
("A2","Präpositionen",["Sie","hängt","die","Jacke","an","den","Haken","."],"Sie hängt die Jacke an den Haken.","'an + accusative' = hanging onto a hook (direction).","Subject + hängen + Object + an + den + Noun (acc.)"),
("A2","Präpositionen",["Er","kommt","aus","einem","kleinen","Dorf","."],"Er kommt aus einem kleinen Dorf.","'aus + dative' for origin; 'einem kleinen Dorf' — neuter dative.","Subject + Verb + aus + einem + Adj(-en) + Noun"),
("A2","Präpositionen",["Wir","treffen","uns","hinter","dem","Museum","."],"Wir treffen uns hinter dem Museum.","'hinter + dative' for static meeting point behind something.","Subject + treffen + uns + hinter + dem + Noun"),
("A2","Präpositionen",["Sie","freut","sich","über","das","Geschenk","."],"Sie freut sich über das Geschenk.","'sich freuen über + accusative' = to be happy about something (present).","Subject + sich freuen + über + Accusative"),

# ── Komparativ (10) ───────────────────────
("A2","Komparativ",["Das","Wetter","heute","ist","schlechter","als","gestern","."],"Das Wetter heute ist schlechter als gestern.","'schlechter' = irregular comparative of 'schlecht'; 'als' for comparison.","Subject + sein + Comparative + als + Time"),
("A2","Komparativ",["Sie","ist","jünger","als","ihr","Bruder","."],"Sie ist jünger als ihr Bruder.","'jünger' = jung + -er + umlaut; pronoun/noun after 'als' in nominative.","Subject + sein + Comparative + als + Possessive + Noun"),
("A2","Komparativ",["Dieser","Computer","ist","moderner","als","mein","alter","."],"Dieser Computer ist moderner als mein alter.","'moderner' = modern + -er; 'mein alter' = elliptical (than my old one).","Subject + sein + Comparative + als + Possessive + Adj"),
("A2","Komparativ",["Das","Buch","ist","interessanter","als","der","Film","."],"Das Buch ist interessanter als der Film.","Standard comparative pattern: adjective + -er + als.","Subject + sein + Comparative + als + Subject"),
("A2","Komparativ",["Er","spricht","fließender","Englisch","als","ich","."],"Er spricht fließender Englisch als ich.","Adverb comparative; pronoun after 'als' stays in nominative.","Subject + Verb + Adverb-er + Language + als + Pronoun"),
("A2","Komparativ",["Je","früher","du","anfängst",",","desto","besser","."],"Je früher du anfängst, desto besser.","'Je früher … desto besser' = the sooner … the better; verb at end of je-clause.","Je + Comparative + Subject + Verb (end), desto + Comparative"),
("A2","Komparativ",["Dein","Haus","ist","genauso","groß","wie","meins","."],"Dein Haus ist genauso groß wie meins.","Equality: 'genauso + adjective + wie' (just as big as).","Subject + sein + genauso + Adjective + wie + Pronoun"),
("A2","Komparativ",["Sie","arbeitet","effizienter","als","ihre","Kollegin","."],"Sie arbeitet effizienter als ihre Kollegin.","Adverb comparative; 'ihre Kollegin' after 'als'.","Subject + Verb + Adverb-er + als + Possessive + Noun"),
("A2","Komparativ",["Das","neue","Modell","ist","leichter","als","das","alte","."],"Das neue Modell ist leichter als das alte.","'leichter' = leicht + -er; 'das alte' is elliptical (than the old one).","Subject + sein + Comparative + als + Article + Adj"),
("A2","Komparativ",["Er","ist","genauso","klug","wie","sein","Vater","."],"Er ist genauso klug wie sein Vater.","Equality comparison: 'genauso + adjective + wie'.","Subject + sein + genauso + Adjective + wie + Possessive + Noun"),

# ── Imperativ (10) ────────────────────────
("A2","Imperativ",["Schlaf","gut","!"],"Schlaf gut!","Informal du-imperative of 'schlafen' without final -e; adverb follows.","Verb stem + Adverb + !"),
("A2","Imperativ",["Esst","euer","Gemüse","!"],"Esst euer Gemüse!","Ihr-form imperative: 'esst'; possessive 'euer' before the noun.","esst + Possessive + Noun + !"),
("A2","Imperativ",["Seien","Sie","bitte","geduldig","!"],"Seien Sie bitte geduldig!","Formal imperative of 'sein': 'seien Sie'; 'bitte' before adjective.","seien + Sie + bitte + Adjective + !"),
("A2","Imperativ",["Komm","sofort","her","!"],"Komm sofort her!","Informal imperative; 'sofort' (immediately) + directional adverb 'her'.","Verb stem + sofort + Adverb + !"),
("A2","Imperativ",["Trinken","Sie","viel","Wasser","!"],"Trinken Sie viel Wasser!","Formal imperative; 'viel' before the mass noun.","Verb + Sie + viel + Noun + !"),
("A2","Imperativ",["Hör","gut","zu","!"],"Hör gut zu!","Separable informal imperative 'zuhören': stem 'Hör' + adverb + prefix 'zu'.","Verb stem + Adverb + Prefix + !"),
("A2","Imperativ",["Öffnen","Sie","bitte","die","Tür","!"],"Öffnen Sie bitte die Tür!","Formal imperative; 'bitte' before the object.","Verb + Sie + bitte + Object + !"),
("A2","Imperativ",["Macht","eure","Hausaufgaben","!"],"Macht eure Hausaufgaben!","Ihr-form: 'macht'; possessive 'eure' before plural noun.","macht + Possessive + Plural noun + !"),
("A2","Imperativ",["Sprich","lauter","!"],"Sprich lauter!","Irregular du-imperative of 'sprechen' (e→i); comparative adverb.","sprich (irregular) + Comparative adverb + !"),
("A2","Imperativ",["Beeilt","euch","!"],"Beeilt euch!","Ihr-form of reflexive 'sich beeilen': 'Beeilt euch!' (Hurry up!).","beeilt + euch (reflexive) + !"),

# ══════════════════════════════════════════
# B1 — 50 new sentences
# ══════════════════════════════════════════

# ── weil-Satz (10) ────────────────────────
("B1","weil-Satz",["Ich","trinke","viel","Tee",",","weil","er","mir","gut","tut","."],"Ich trinke viel Tee, weil er mir gut tut.","In the weil-clause: 'mir' is dative; 'tut' goes to the very end.","Main clause + , + weil + Pronoun + Dative + Verb (end)"),
("B1","weil-Satz",["Er","lernt","jeden","Tag",",","weil","er","die","Prüfung","bestehen","will","."],"Er lernt jeden Tag, weil er die Prüfung bestehen will.","Modal 'will' at the very end of the weil-clause; infinitive before it.","Main clause + , + weil + Subject + Object + Infinitive + Modal (end)"),
("B1","weil-Satz",["Wir","bleiben","drinnen",",","weil","es","draußen","regnet","."],"Wir bleiben drinnen, weil es draußen regnet.","'es regnet' (it rains); location 'draußen' before the verb at end.","Main clause + , + weil + es + Location + Verb (end)"),
("B1","weil-Satz",["Sie","ist","traurig",",","weil","ihr","Freund","weggefahren","ist","."],"Sie ist traurig, weil ihr Freund weggefahren ist.","Perfekt in weil-clause with 'sein'; separable participle then 'ist'.","Main clause + , + weil + Subject + Participle + sein (end)"),
("B1","weil-Satz",["Ich","esse","mehr","Gemüse",",","weil","ich","gesünder","leben","will","."],"Ich esse mehr Gemüse, weil ich gesünder leben will.","Modal 'will' at end; adverb 'gesünder' before infinitive.","Main clause + , + weil + Subject + Adverb + Infinitive + Modal (end)"),
("B1","weil-Satz",["Er","kommt","zu","spät",",","weil","der","Zug","Verspätung","hat","."],"Er kommt zu spät, weil der Zug Verspätung hat.","'Verspätung haben' fixed phrase; 'hat' at end of weil-clause.","Main clause + , + weil + Subject + Noun + Verb (end)"),
("B1","weil-Satz",["Wir","rufen","an",",","weil","wir","Informationen","brauchen","."],"Wir rufen an, weil wir Informationen brauchen.","Separable verb in main clause; 'brauchen' at end of weil-clause.","Main clause + , + weil + Subject + Object + Verb (end)"),
("B1","weil-Satz",["Sie","lernt","Deutsch",",","weil","sie","in","Deutschland","studieren","möchte","."],"Sie lernt Deutsch, weil sie in Deutschland studieren möchte.","Modal 'möchte' at very end; infinitive + destination before it.","Main clause + , + weil + Subject + Location + Infinitive + Modal (end)"),
("B1","weil-Satz",["Er","ist","erschöpft",",","weil","er","die","ganze","Nacht","gearbeitet","hat","."],"Er ist erschöpft, weil er die ganze Nacht gearbeitet hat.","Perfekt in weil-clause: participle then 'hat' at the very end.","Main clause + , + weil + Subject + Time + Participle + haben (end)"),
("B1","weil-Satz",["Ich","freue","mich",",","weil","meine","Familie","zu","Besuch","kommt","."],"Ich freue mich, weil meine Familie zu Besuch kommt.","'zu Besuch kommen' fixed phrase; 'kommt' at end of weil-clause.","Main clause + , + weil + Subject + zu Besuch + Verb (end)"),

# ── dass-Satz (8) ─────────────────────────
("B1","dass-Satz",["Ich","glaube",",","dass","du","es","schaffen","kannst","."],"Ich glaube, dass du es schaffen kannst.","Modal 'kannst' at the very end of the dass-clause; infinitive before it.","Main clause + , + dass + Subject + Object + Infinitive + Modal (end)"),
("B1","dass-Satz",["Er","weiß",",","dass","sie","morgen","kommt","."],"Er weiß, dass sie morgen kommt.","Time adverb 'morgen' before the verb at end of dass-clause.","Main clause + , + dass + Subject + Time + Verb (end)"),
("B1","dass-Satz",["Wir","hoffen",",","dass","das","Wetter","besser","wird","."],"Wir hoffen, dass das Wetter besser wird.","'wird' (future/change) at very end; adjective 'besser' before it.","Main clause + , + dass + Subject + Adjective + werden (end)"),
("B1","dass-Satz",["Sie","sagt",",","dass","sie","keine","Zeit","hat","."],"Sie sagt, dass sie keine Zeit hat.","'keine Zeit haben' — negation inside dass-clause; 'hat' at end.","Main clause + , + dass + Subject + keine + Noun + Verb (end)"),
("B1","dass-Satz",["Ich","finde",",","dass","Deutsch","schwierig","ist","."],"Ich finde, dass Deutsch schwierig ist.","'ist' at the very end of the dass-clause.","Main clause + , + dass + Subject + Adjective + Verb (end)"),
("B1","dass-Satz",["Er","behauptet",",","dass","er","die","Wahrheit","sagt","."],"Er behauptet, dass er die Wahrheit sagt.","Object 'die Wahrheit' before the verb at end.","Main clause + , + dass + Subject + Object + Verb (end)"),
("B1","dass-Satz",["Wir","wissen",",","dass","er","recht","hat","."],"Wir wissen, dass er recht hat.","'Recht haben' fixed phrase; 'hat' at end of dass-clause.","Main clause + , + dass + Subject + Noun + Verb (end)"),
("B1","dass-Satz",["Sie","denkt",",","dass","ich","falsch","liege","."],"Sie denkt, dass ich falsch liege.","'falsch liegen' (to be wrong) fixed phrase; verb 'liege' at end.","Main clause + , + dass + Subject + Adverb + Verb (end)"),

# ── ob-Satz (6) ───────────────────────────
("B1","ob-Satz",["Ich","weiß","nicht",",","ob","er","kommt","."],"Ich weiß nicht, ob er kommt.","'ob' introduces an indirect yes/no question; 'kommt' at very end.","Main clause (neg.) + , + ob + Subject + Verb (end)"),
("B1","ob-Satz",["Sie","fragt",",","ob","wir","Zeit","haben","."],"Sie fragt, ob wir Zeit haben.","'haben' at very end; 'Zeit' before it.","Main clause + , + ob + Subject + Noun + Verb (end)"),
("B1","ob-Satz",["Er","überlegt",",","ob","er","kündigen","soll","."],"Er überlegt, ob er kündigen soll.","Modal 'soll' at the very end; infinitive before it.","Main clause + , + ob + Subject + Infinitive + Modal (end)"),
("B1","ob-Satz",["Ich","frage","mich",",","ob","das","stimmt","."],"Ich frage mich, ob das stimmt.","Reflexive main clause; 'stimmt' at end of ob-clause.","Main clause (reflexive) + , + ob + Subject + Verb (end)"),
("B1","ob-Satz",["Wir","wissen","nicht",",","ob","das","richtig","ist","."],"Wir wissen nicht, ob das richtig ist.","Adjective 'richtig' before 'ist' at end of ob-clause.","Main clause (neg.) + , + ob + Subject + Adjective + Verb (end)"),
("B1","ob-Satz",["Er","fragt",",","ob","sie","ihn","versteht","."],"Er fragt, ob sie ihn versteht.","Accusative pronoun 'ihn' before 'versteht' at end.","Main clause + , + ob + Subject + Object + Verb (end)"),

# ── wenn-Satz (8) ─────────────────────────
("B1","wenn-Satz",["Wenn","du","Hunger","hast",",","iss","etwas","!"],"Wenn du Hunger hast, iss etwas!","Fronted wenn-clause → imperative in main clause.","wenn + Subject + Noun + Verb (end), Imperative + Object"),
("B1","wenn-Satz",["Wenn","es","regnet",",","bleiben","wir","zu","Hause","."],"Wenn es regnet, bleiben wir zu Hause.","Fronted wenn-clause → verb of main clause inverts to position 1.","wenn + Subject + Verb (end), Verb + Subject + Location"),
("B1","wenn-Satz",["Er","ruft","an",",","wenn","er","ankommt","."],"Er ruft an, wenn er ankommt.","Main clause first (separable verb); wenn-clause appended with verb at end.","Main clause + , + wenn + Subject + Verb (end)"),
("B1","wenn-Satz",["Wenn","sie","schläft",",","ist","sie","ruhig","."],"Wenn sie schläft, ist sie ruhig.","Fronted wenn-clause; main clause begins with 'ist'.","wenn + Subject + Verb (end), sein + Subject + Adjective"),
("B1","wenn-Satz",["Wenn","wir","Zeit","haben",",","besuchen","wir","euch","."],"Wenn wir Zeit haben, besuchen wir euch.","Verb-end in wenn-clause; inverted main clause with accusative pronoun.","wenn + Subject + Noun + Verb (end), Verb + Subject + Pronoun"),
("B1","wenn-Satz",["Wenn","du","willst",",","helfe","ich","dir","."],"Wenn du willst, helfe ich dir.","Short wenn-clause; main clause begins with 'helfe'; dative 'dir'.","wenn + Subject + Modal (end), Verb + Subject + Dative"),
("B1","wenn-Satz",["Wenn","es","kalt","ist",",","ziehe","ich","eine","Jacke","an","."],"Wenn es kalt ist, ziehe ich eine Jacke an.","Fronted condition; separable 'anziehen' in main clause (prefix 'an' at end).","wenn + Subject + Adj + Verb (end), Verb stem + Subject + Object + Prefix (end)"),
("B1","wenn-Satz",["Er","ist","glücklich",",","wenn","er","kocht","."],"Er ist glücklich, wenn er kocht.","Main clause first; wenn-clause appended; 'kocht' at end.","Main clause + , + wenn + Subject + Verb (end)"),

# ── Relativsatz (8) ───────────────────────
("B1","Relativsatz",["Der","Student",",","der","fleißig","lernt",",","besteht","die","Prüfung","."],"Der Student, der fleißig lernt, besteht die Prüfung.","'der' (masc. nom. relative pronoun); verb 'lernt' at end of clause.","Noun + , + der + Adverb + Verb (end) + , + Main clause"),
("B1","Relativsatz",["Das","Restaurant",",","das","wir","besucht","haben",",","war","sehr","gut","."],"Das Restaurant, das wir besucht haben, war sehr gut.","Neuter relative pronoun 'das'; perfect at end of relative clause.","Noun + , + das + Subject + Participle + haben (end) + , + Main verb"),
("B1","Relativsatz",["Die","Frau",",","der","ich","geholfen","habe",",","war","sehr","dankbar","."],"Die Frau, der ich geholfen habe, war sehr dankbar.","'der' = dative feminine relative pronoun (I helped her); perfect at end.","Noun + , + der (dat. fem.) + Subject + Participle + haben (end) + , + Main clause"),
("B1","Relativsatz",["Das","Auto",",","das","er","gekauft","hat",",","ist","sehr","teuer","."],"Das Auto, das er gekauft hat, ist sehr teuer.","Neuter relative pronoun 'das'; perfect at end of relative clause.","Noun + , + das + Subject + Participle + haben (end) + , + Main verb"),
("B1","Relativsatz",["Der","Arzt",",","dem","ich","vertraue",",","ist","sehr","kompetent","."],"Der Arzt, dem ich vertraue, ist sehr kompetent.","'dem' = dative masculine relative pronoun ('vertrauen + dative').","Noun + , + dem (dat. masc.) + Subject + Verb (end) + , + Main clause"),
("B1","Relativsatz",["Die","Stadt",",","in","der","ich","lebe",",","ist","sehr","schön","."],"Die Stadt, in der ich lebe, ist sehr schön.","Prepositional relative clause: 'in der' (feminine dative).","Noun + , + in + der (dat. fem.) + Subject + Verb (end) + , + Main clause"),
("B1","Relativsatz",["Das","Buch",",","das","sie","empfohlen","hat",",","ist","sehr","interessant","."],"Das Buch, das sie empfohlen hat, ist sehr interessant.","'empfehlen' inseparable: no 'ge-'; 'hat' at end of relative clause.","Noun + , + das + Subject + Participle + haben (end) + , + Main verb"),
("B1","Relativsatz",["Der","Mann",",","dessen","Name","ich","vergessen","habe",",","war","sehr","nett","."],"Der Mann, dessen Name ich vergessen habe, war sehr nett.","'dessen' = genitive masculine relative pronoun (whose name).","Noun + , + dessen + Noun + Subject + Participle + haben (end) + , + Main clause"),

# ── Passiv (6) ────────────────────────────
("B1","Passiv",["Das","Haus","wird","gerade","renoviert","."],"Das Haus wird gerade renoviert.","'gerade' (right now) shows ongoing passive action; participle at end.","Subject + werden + gerade + Participle (end)"),
("B1","Passiv",["Die","Aufgabe","wurde","von","den","Schülern","gelöst","."],"Die Aufgabe wurde von den Schülern gelöst.","Past passive: 'wurde' + agent ('von + dative plural') + participle.","Subject + wurde + von + Dative (pl.) + Participle (end)"),
("B1","Passiv",["Der","Brief","wird","morgen","geschickt","."],"Der Brief wird morgen geschickt.","Time adverb 'morgen' before participle in present passive.","Subject + werden + Time + Participle (end)"),
("B1","Passiv",["Das","Museum","wird","um","achtzehn","Uhr","geschlossen","."],"Das Museum wird um achtzehn Uhr geschlossen.","Time phrase 'um achtzehn Uhr' before participle.","Subject + werden + um + Time + Participle (end)"),
("B1","Passiv",["Die","Prüfung","wurde","erfolgreich","bestanden","."],"Die Prüfung wurde erfolgreich bestanden.","Past passive: 'wurde' + manner adverb + participle (inseparable verb).","Subject + wurde + Adverb + Participle (end)"),
("B1","Passiv",["Das","Auto","wird","gerade","repariert","."],"Das Auto wird gerade repariert.","Ongoing passive with 'gerade' (currently being repaired).","Subject + werden + gerade + Participle (end)"),

# ── Konjunktiv II (4) ─────────────────────
("B1","Konjunktiv II",["Wenn","ich","mehr","Zeit","hätte",",","würde","ich","mehr","reisen","."],"Wenn ich mehr Zeit hätte, würde ich mehr reisen.","Unreal condition: 'hätte' (Konj. II of haben) in wenn-clause; 'würde + infinitive' in main clause.","wenn + Subject + Object + hätte (end), würde + Subject + mehr + Infinitive"),
("B1","Konjunktiv II",["Er","würde","gern","eine","neue","Sprache","lernen","."],"Er würde gern eine neue Sprache lernen.","'würde + infinitive' expresses an unreal wish; 'gern' shows desire.","Subject + würde + gern + Object + Infinitive (end)"),
("B1","Konjunktiv II",["Ich","wäre","gern","Arzt","geworden","."],"Ich wäre gern Arzt geworden.","Konjunktiv II perfect with 'sein': 'wäre … geworden'; 'gern' shows wish.","Subject + wäre + gern + Noun + Participle (end)"),
("B1","Konjunktiv II",["Hättest","du","Lust",",","ins","Kino","zu","gehen","?"],"Hättest du Lust, ins Kino zu gehen?","'Hättest du Lust' (would you like to) + 'zu + infinitive' clause.","hätte + Subject + Noun + , + Destination + zu + Infinitive + ?"),
]

print(f"New sentences to add: {len(RAW_EXTRA)}")
counts = {}
for r in RAW_EXTRA:
    counts[r[0]] = counts.get(r[0], 0) + 1
print("Per level:", counts)

# Load existing questions
with open(out_path, 'r', encoding='utf-8') as f:
    existing = json.load(f)

print(f"Existing questions: {len(existing)}")

# Build new entries starting after the last existing id
start_n = len(existing) + 1

new_questions = []
for i, (level, topic, tokens, correct, tip, structure) in enumerate(RAW_EXTRA):
    scrambled = scramble(tokens)
    new_questions.append({
        "id":        sid(start_n + i),
        "level":     level,
        "topic":     topic,
        "words":     scrambled,
        "answer":    tokens,
        "correct":   correct,
        "tip":       tip,
        "structure": structure,
    })

all_questions = existing + new_questions

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

print(f"Saved {len(all_questions)} questions to {out_path}")
