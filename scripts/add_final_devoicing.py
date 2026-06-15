"""
Adds the 'Final Devoicing (Auslautverhärtung)' chapter to grammar.json
"""
import json

CHAPTER = {
  "ch": "Final Devoicing",
  "icon": "🔊",
  "sections": [

    # ── 1. What is Auslautverhärtung? ──────────────────────────────
    {
      "title": "What is Auslautverhärtung?",
      "intro": "**Auslautverhärtung** (literally \"end-sound hardening\") is one of the most important phonological rules in German. It states: **voiced consonants become voiceless when they appear at the end of a syllable or word**. The *spelling* never changes — only the *sound* does. This means a word like **Hund** is written with a 'd' but pronounced with a 't' sound. Understanding this rule is essential for both correct pronunciation and for understanding how German words are structured.",
      "tables": [],
      "examples": [
        "**Auslaut** = the final sound of a word or syllable",
        "**Verhärtung** = hardening (voiced → voiceless)",
        { "de": "Hund (dog)", "en": "written 'd' → pronounced [t] at the end: [hʊnt]" },
        { "de": "Tag (day)", "en": "written 'g' → pronounced [k] at the end: [taːk]" },
        { "de": "Dieb (thief)", "en": "written 'b' → pronounced [p] at the end: [diːp]" }
      ]
    },

    # ── 2. Voiced vs Voiceless ──────────────────────────────────────
    {
      "title": "Voiced vs. Voiceless Consonants",
      "intro": "Consonants are either **voiced** (vocal cords vibrate) or **voiceless** (vocal cords do not vibrate). Place your fingers on your throat — you will feel a buzz for voiced sounds and nothing for voiceless. German has six pairs where Auslautverhärtung applies. Each **voiced** consonant has a **voiceless twin** that sounds the same but without the voice.",
      "tables": [
        [
          ["Voiced (in the middle of a word)", "Voiceless (at the end of a word)", "Example word", "Pronunciation"],
          ["**b**", "**p**", "Dieb", "[diːp]"],
          ["**d**", "**t**", "Hund", "[hʊnt]"],
          ["**g**", "**k**", "Tag", "[taːk]"],
          ["**v**", "**f**", "brav", "[braːf]"],
          ["**s** (= [z])", "**s** (= [s])", "Haus", "[haʊ̯s]"],
          ["**w**", "**f**", "aktiv →", "varies by origin"]
        ]
      ],
      "examples": [
        "**Remember:** the spelling stays the same — only the pronunciation changes at the end of a word or syllable.",
        "**Tip:** To check whether a word has a voiced or voiceless final consonant, add a vowel suffix: *Hund → Hunde* — you can hear the [d] return in *Hunde*!"
      ]
    },

    # ── 3. b → p ───────────────────────────────────────────────────
    {
      "title": "b → p: The 'b' Becomes 'p' at the End",
      "intro": "Whenever a word or syllable ends in **b**, it is pronounced as **[p]**. Add a vowel ending (like the plural -e) and the [b] sound returns. This is the clearest proof that the underlying consonant is a 'b', not a 'p'.",
      "tables": [
        [
          ["Word (singular)", "Pronunciation", "Inflected form (plural/feminine)", "Pronunciation"],
          ["**Dieb** (thief)", "[diːp]", "**Diebe** (thieves)", "[ˈdiːbə]"],
          ["**Grab** (grave)", "[ɡraːp]", "**Gräber** (graves)", "[ˈɡrɛːbɐ]"],
          ["**Urlaub** (holiday)", "[ˈuːɐ̯laʊ̯p]", "**Urlaube** (holidays)", "[ˈuːɐ̯laʊ̯bə]"],
          ["**Klub** (club)", "[klʊp]", "**Klubs** (clubs)", "[klʊps]"],
          ["**Staub** (dust)", "[ʃtaʊ̯p]", "**stauben** (to be dusty)", "[ˈʃtaʊ̯bən]"]
        ]
      ],
      "examples": [
        { "de": "gelb (yellow) → [ɡɛlp]", "en": "but: gelbe Blumen → [ˈɡɛlbə] — the [b] returns before a vowel" },
        { "de": "halb (half) → [halp]", "en": "but: halbe Stunde → [ˈhalbə] — same underlying /b/" },
        { "de": "lieb (dear) → [liːp]", "en": "but: liebe Maria → [ˈliːbə] — spelling reveals the truth" },
        { "de": "Lob (praise) → [loːp]", "en": "but: loben (to praise) → [ˈloːbən]" }
      ]
    },

    # ── 4. d → t ───────────────────────────────────────────────────
    {
      "title": "d → t: The 'd' Becomes 't' at the End",
      "intro": "The **d → t** devoicing is the most commonly encountered pair because so many high-frequency German words end in **-nd, -ld, -rd, -d**. Native German speakers say these words automatically with a [t], but the underlying letter is still 'd' — confirmed by the inflected forms.",
      "tables": [
        [
          ["Word (singular / base)", "Pronunciation", "Inflected form", "Pronunciation"],
          ["**Hund** (dog)", "[hʊnt]", "**Hunde** (dogs)", "[ˈhʊndə]"],
          ["**Kind** (child)", "[kɪnt]", "**Kinder** (children)", "[ˈkɪndɐ]"],
          ["**Hand** (hand)", "[hant]", "**Hände** (hands)", "[ˈhɛndə]"],
          ["**Land** (country)", "[lant]", "**Länder** (countries)", "[ˈlɛndɐ]"],
          ["**Rad** (wheel)", "[raːt]", "**Räder** (wheels)", "[ˈrɛːdɐ]"],
          ["**Bad** (bath)", "[baːt]", "**Bäder** (baths)", "[ˈbɛːdɐ]"],
          ["**Mund** (mouth)", "[mʊnt]", "**Münder** (mouths)", "[ˈmʏndɐ]"],
          ["**Pferd** (horse)", "[pfeːɐ̯t]", "**Pferde** (horses)", "[ˈpfeːɐ̯də]"]
        ]
      ],
      "examples": [
        { "de": "Freund (friend) → [fʁɔʏ̯nt]", "en": "but: Freunde (friends) → [ˈfʁɔʏ̯ndə]" },
        { "de": "Abend (evening) → [ˈaːbənt]", "en": "but: Abende → [ˈaːbəndə]" },
        { "de": "Held (hero) → [hɛlt]", "en": "but: Helden → [ˈhɛldən]" },
        { "de": "Wald (forest) → [valt]", "en": "but: Wälder → [ˈvɛldɐ]" },
        "**Watch out:** *Rat* (advice) and *Rad* (wheel) are both [raːt] — you must use context or inflection to distinguish them!"
      ]
    },

    # ── 5. g → k ───────────────────────────────────────────────────
    {
      "title": "g → k: The 'g' Becomes 'k' at the End",
      "intro": "Words ending in **g** are pronounced with a **[k]** sound. This affects many common words. Note: in some southern German and Austrian varieties, final **g** is realised as [x] or [ç] instead of [k] — but Standard German (Hochdeutsch) uses [k].",
      "tables": [
        [
          ["Word (base form)", "Pronunciation (Standard)", "Inflected form", "Pronunciation"],
          ["**Tag** (day)", "[taːk]", "**Tage** (days)", "[ˈtaːɡə]"],
          ["**Weg** (path/way)", "[veːk]", "**Wege** (paths)", "[ˈveːɡə]"],
          ["**Berg** (mountain)", "[bɛɐ̯k]", "**Berge** (mountains)", "[ˈbɛɐ̯ɡə]"],
          ["**Zug** (train)", "[tsuːk]", "**Züge** (trains)", "[ˈtsyːɡə]"],
          ["**Sarg** (coffin)", "[zaɐ̯k]", "**Särge** (coffins)", "[ˈzɛɐ̯ɡə]"],
          ["**Zwerg** (dwarf)", "[tsvɛɐ̯k]", "**Zwerge** (dwarves)", "[ˈtsvɛɐ̯ɡə]"],
          ["**Burg** (castle)", "[bʊɐ̯k]", "**Burgen** (castles)", "[ˈbʊɐ̯ɡən]"],
          ["**Flug** (flight)", "[fluːk]", "**Flüge** (flights)", "[ˈflyːɡə]"]
        ]
      ],
      "examples": [
        { "de": "König (king) → [ˈkøːnɪç]", "en": "Note: '-ig' at word end is pronounced [ɪç] in Standard German, not [ɪk]!" },
        { "de": "heilig (holy) → [ˈhaɪ̯lɪç]", "en": "but: heilige Nacht → [ˈhaɪ̯lɪɡə] — the [ɡ] returns before a vowel" },
        { "de": "hungrig (hungry) → [ˈhʊŋʁɪç]", "en": "but: hungrige Kinder → [ˈhʊŋʁɪɡə]" },
        "**Special rule:** the suffix **-ig** at the very end of a word is pronounced **[ɪç]** in Standard German, not [ɪk]. But before a vowel suffix, the 'g' is restored: [ɡ]."
      ]
    },

    # ── 6. v → f ───────────────────────────────────────────────────
    {
      "title": "v → f: The 'v' at the End Sounds Like 'f'",
      "intro": "German **v** is already pronounced [f] in most native German words (e.g. *Vater, Vogel*). In words of foreign origin (mostly from Latin/French/English), **v** is pronounced [v] in the middle of a word but devoiced to [f] at the end. Similarly, words ending in **-iv, -av, -ov** follow this pattern.",
      "tables": [
        [
          ["Word", "Pronunciation at end", "Inflected/derived form", "Pronunciation (with vowel)"],
          ["**brav** (well-behaved)", "[braːf]", "**brave** Kinder", "[ˈbraːvə]"],
          ["**aktiv** (active)", "[akˈtiːf]", "**aktive** Teilnahme", "[akˈtiːvə]"],
          ["**naiv** (naive)", "[naˈiːf]", "**naive** Frage", "[naˈiːvə]"],
          ["**Motiv** (motive)", "[moˈtiːf]", "**Motive** (motives)", "[moˈtiːvə]"],
          ["**relativ** (relative)", "[ʁelaˈtiːf]", "**relative** Mehrheit", "[ʁelaˈtiːvə]"],
          ["**Nerv** (nerve)", "[nɛɐ̯f]", "**Nerven** (nerves)", "[ˈnɛɐ̯vən]"]
        ]
      ],
      "examples": [
        { "de": "Der Test war relativ schwer.", "en": "The test was relatively hard. → [ʁelaˈtiːf]" },
        { "de": "Sie ist sehr aktiv.", "en": "She is very active. → [akˈtiːf]" },
        { "de": "Das Motiv ist klar.", "en": "The motive is clear. → [moˈtiːf]" },
        "**Note:** Native German words beginning with 'v' (Vater, Vogel, vier) are *always* [f] — this is not Auslautverhärtung but simply German pronunciation of 'v'."
      ]
    },

    # ── 7. s → [s] ─────────────────────────────────────────────────
    {
      "title": "s → [s]: Voiced 's' Becomes Voiceless at the End",
      "intro": "In German, the letter **s** is pronounced **[z]** (voiced) when it appears at the start of a syllable before a vowel. However, at the **end** of a word or syllable, 's' is pronounced **[s]** (voiceless). The plural forms of these words often reveal the underlying [z] when a vowel follows.",
      "tables": [
        [
          ["Word", "Pronunciation", "Inflected form", "Pronunciation"],
          ["**Haus** (house)", "[haʊ̯s]", "**Häuser** (houses)", "[ˈhɔʏ̯zɐ]"],
          ["**Maus** (mouse)", "[maʊ̯s]", "**Mäuse** (mice)", "[ˈmɔʏ̯zə]"],
          ["**Glas** (glass)", "[ɡlaːs]", "**Gläser** (glasses)", "[ˈɡlɛːzɐ]"],
          ["**Preis** (price)", "[pʁaɪ̯s]", "**Preise** (prices)", "[ˈpʁaɪ̯zə]"],
          ["**Kreis** (circle)", "[kʁaɪ̯s]", "**Kreise** (circles)", "[ˈkʁaɪ̯zə]"],
          ["**Reis** (rice/journey)", "[ʁaɪ̯s]", "**Reise** (journey)", "[ˈʁaɪ̯zə]"],
          ["**Eis** (ice)", "[aɪ̯s]", "**Eisen** (iron)", "[ˈaɪ̯zən]"]
        ]
      ],
      "examples": [
        { "de": "Das Haus ist groß. → [haʊ̯s]", "en": "but: die Häuser → [ˈhɔʏ̯zɐ] — [z] returns before the vowel suffix" },
        { "de": "Der Preis ist günstig. → [pʁaɪ̯s]", "en": "but: die Preise → [ˈpʁaɪ̯zə] — voiced [z] mid-word" },
        "**Contrast:** *lesen* (to read) → [ˈleːzən]: the 's' here is between vowels so it stays voiced [z] throughout."
      ]
    },

    # ── 8. Spelling vs Pronunciation ────────────────────────────────
    {
      "title": "Spelling Stays the Same — Only Sound Changes",
      "intro": "A fundamental principle of Auslautverhärtung is that **the written form (spelling) is never affected** — only the spoken form changes. German spelling is largely **morphophonemic**: it represents the underlying form of the word, which is consistent across all inflected forms. This makes spelling more logical than pronunciation alone might suggest.",
      "tables": [
        [
          ["Word pair", "What you write", "What you hear at the end", "What you hear mid-word"],
          ["Rat / Rad", "Rat (advice) | Rad (wheel)", "[raːt] | [raːt]", "Rates [ˈraːtəs] | Rades [ˈraːdəs]"],
          ["Maut / Mund", "Maut (toll) | Mund (mouth)", "[maʊ̯t] | [mʊnt]", "Mauten [ˈmaʊ̯tən] | Münder [ˈmʏndɐ]"],
          ["Berg / Werk", "Berg (mountain) | Werk (work)", "[bɛɐ̯k] | [vɛɐ̯k]", "Berge [ˈbɛɐ̯ɡə] | Werke [ˈvɛɐ̯kə]"]
        ]
      ],
      "examples": [
        "**Key insight:** Because spelling reflects the underlying form, you can always identify the root consonant by finding an inflected form. *Hund → Hunde* shows the root is /d/.",
        { "de": "der Rat (advice) ≠ das Rad (wheel)", "en": "Both are [raːt] alone — context and case endings tell them apart" },
        { "de": "der Bund (federation) vs. bunt (colourful)", "en": "[bʊnt] vs [bʊnt] — identical at word end! Inflect to distinguish: Bünde vs. bunte" },
        "**Practical rule:** When you're unsure how to spell a word, inflect it (add -e, -er, -en) and listen to the consonant — what you hear before the vowel is what you write."
      ]
    },

    # ── 9. Finding the Root Form ─────────────────────────────────────
    {
      "title": "How to Find the Root Consonant",
      "intro": "Because Auslautverhärtung masks the true underlying consonant, German learners need a reliable strategy to identify it. The method is simple: **add a vowel ending** to the word. In the inflected form, the voiced consonant resurfaces. This is also why German grammar instruction teaches noun plurals, verb conjugations, and adjective declension simultaneously with base forms.",
      "tables": [
        [
          ["Base form (devoiced)", "You hear", "Add a vowel ending", "Now you hear", "Root consonant"],
          ["Hund", "[hʊnt]", "Hunde", "[ˈhʊndə]", "/d/"],
          ["Tag", "[taːk]", "Tage", "[ˈtaːɡə]", "/g/"],
          ["Dieb", "[diːp]", "Diebe", "[ˈdiːbə]", "/b/"],
          ["Haus", "[haʊ̯s]", "Häuser", "[ˈhɔʏ̯zɐ]", "/z/ (written s)"],
          ["brav", "[braːf]", "brave", "[ˈbraːvə]", "/v/"],
          ["Wald", "[valt]", "Wälder", "[ˈvɛldɐ]", "/d/"],
          ["Zwerg", "[tsvɛɐ̯k]", "Zwerge", "[ˈtsvɛɐ̯ɡə]", "/g/"]
        ]
      ],
      "examples": [
        "**Step 1:** Hear the word at the end — you get the devoiced form.",
        "**Step 2:** Inflect or derive a related word with a vowel suffix.",
        "**Step 3:** Listen to the consonant before the vowel — that is the root consonant.",
        { "de": "Kind → [kɪnt] → Kinder → [ˈkɪndɐ]", "en": "Root is /d/ → spelled 'Kind', not 'Kint'" },
        { "de": "gelb → [ɡɛlp] → gelbe → [ˈɡɛlbə]", "en": "Root is /b/ → spelled 'gelb', not 'gelp'" }
      ]
    },

    # ── 10. In Compound Words ─────────────────────────────────────────
    {
      "title": "Auslautverhärtung in Compound Words",
      "intro": "German loves compound words (Komposita). When a word with a voiced final consonant becomes the **first element** of a compound, Auslautverhärtung still applies if the syllable boundary creates a final position. However, the morpheme boundary is transparent — good spellers recognise each component.",
      "tables": [
        [
          ["Compound word", "Components", "Pronunciation", "Note"],
          ["**Handbuch** (handbook)", "Hand + Buch", "[ˈhantbuːx]", "The 'd' in Hand is devoiced → [t]"],
          ["**Landkarte** (map)", "Land + Karte", "[ˈlantkartə]", "The 'd' in Land is devoiced → [t]"],
          ["**Tageslicht** (daylight)", "Tage + Licht", "[ˈtaːɡəslɪçt]", "The 'g' is now mid-word → stays [ɡ]"],
          ["**Stadtplan** (city map)", "Stadt + Plan", "[ˈʃtatplaːn]", "The 'dt' = [t], not doubled"],
          ["**Hundeleine** (dog lead)", "Hunde + Leine", "[ˈhʊndəˌlaɪ̯nə]", "Hunde- has -e suffix → [d] restored"],
          ["**Wegweiser** (signpost)", "Weg + Weiser", "[ˈveːkvaɪ̯zɐ]", "The 'g' in Weg is devoiced → [k]"],
          ["**Abendessen** (dinner)", "Abend + Essen", "[ˈaːbəntˌʔɛsən]", "The 'd' in Abend is devoiced → [t]"]
        ]
      ],
      "examples": [
        { "de": "die Handbremse (handbrake) → [ˈhantbʁɛmzə]", "en": "'d' in Hand is devoiced even inside the compound" },
        { "de": "der Zugführer (train driver) → [ˈtsuːkˌfyːʁɐ]", "en": "'g' in Zug devoiced → [k] before the second element" },
        { "de": "das Tagebuch (diary) → [ˈtaːɡəbuːx]", "en": "Tage- has -e linking element → 'g' is voiced [ɡ] again" },
        "**Tip:** Linking elements like **-e-, -es-, -s-, -en-** between compound parts often restore the voiced consonant."
      ]
    },

    # ── 11. Common English-Speaker Mistakes ──────────────────────────
    {
      "title": "Common Mistakes for English Speakers",
      "intro": "English does **not** have Auslautverhärtung — English final voiced consonants stay voiced (*bed, bag, rob* all keep their voiced endings). This means English speakers must consciously practise devoicing German final consonants. Below are the most common pronunciation errors and how to fix them.",
      "tables": [
        [
          ["Word", "❌ English-style error", "✅ Correct German pronunciation", "Why"],
          ["Hund", "[hʊnd] (voiced d)", "[hʊnt] (voiceless t)", "Final consonant must be devoiced"],
          ["Tag", "[taːg] (voiced g)", "[taːk] (voiceless k)", "No voiced stops at word end"],
          ["Dieb", "[diːb] (voiced b)", "[diːp] (voiceless p)", "Written 'b' → sounds like 'p'"],
          ["Haus", "[haʊ̯z] (voiced z)", "[haʊ̯s] (voiceless s)", "Final 's' in German is always [s]"],
          ["brav", "[braːv] (voiced v)", "[braːf] (voiceless f)", "Final 'v' → [f] in German"],
          ["König", "[ˈkøːnɪɡ] (hard g)", "[ˈkøːnɪç] (ich-sound)", "'-ig' at end → [ɪç] not [ɪk] or [ɪg]"]
        ]
      ],
      "examples": [
        "**Practice drill:** Say the inflected form first (where the consonant is voiced), then say the base form — your mouth learns to devoice automatically.",
        { "de": "Practice: Hunde → Hund / Tage → Tag / Diebe → Dieb", "en": "Say the plural, then drop the -e: the final consonant should change!" },
        { "de": "Kinder → Kind / Länder → Land / Pferde → Pferd", "en": "Plural → singular: feel the consonant harden at the end" },
        "**Memory trick:** In German, consonants at the end of a word always 'lose their voice' — they get quieter, softer, and voiceless. Think of a sound 'fading out' at the end."
      ]
    },

    # ── 12. Quick Reference ───────────────────────────────────────────
    {
      "title": "Quick Reference: All Pairs at a Glance",
      "intro": "Use this table as a rapid reference. For every voiced consonant that ends a German word, the corresponding voiceless sound is used in speech — while the spelling preserves the original voiced letter.",
      "tables": [
        [
          ["Written letter", "Sounds like (at word end)", "Example word", "Singular pronunciation", "Plural (voice restored)"],
          ["b", "p", "Grab (grave)", "[ɡraːp]", "Gräber [ˈɡrɛːbɐ]"],
          ["d", "t", "Kind (child)", "[kɪnt]", "Kinder [ˈkɪndɐ]"],
          ["g", "k", "Weg (path)", "[veːk]", "Wege [ˈveːɡə]"],
          ["g (-ig suffix)", "ç", "König (king)", "[ˈkøːnɪç]", "Könige [ˈkøːnɪɡə]"],
          ["v (foreign)", "f", "aktiv (active)", "[akˈtiːf]", "aktive [akˈtiːvə]"],
          ["s (= voiced)", "s (voiceless)", "Haus (house)", "[haʊ̯s]", "Häuser [ˈhɔʏ̯zɐ]"]
        ]
      ],
      "examples": [
        "**Golden rule:** If a German word ends in b, d, or g — always pronounce it as p, t, or k.",
        "**Test yourself:** Cover the pronunciation column and say each word aloud. Then uncover and check!",
        { "de": "Übung macht den Meister!", "en": "Practice makes perfect — the more you speak, the more automatic Auslautverhärtung becomes." }
      ]
    }

  ]
}

# Load existing grammar.json
path = r'C:\Users\ADELEKEOLORUNISOLAO\Desktop\goethe-trainer\public\data\grammar.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Remove any existing Final Devoicing chapter (idempotent)
data = [ch for ch in data if ch['ch'] != 'Final Devoicing']

# Append the new chapter
data.append(CHAPTER)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Done! grammar.json now has {len(data)} chapters:")
for ch in data:
    print(f"  - {ch['ch']}")
