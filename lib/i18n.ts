/* ──────────────────────────────────────────────────────────────────────────
   i18n.ts — UI string dictionary (German default + English).

   Covers the app "chrome" — navigation, home, settings, onboarding, auth and
   shared buttons — so true beginners (A0/A1) can use the interface in English.
   Learning CONTENT (German words, grammar, example sentences, exercise text)
   stays German by design. Keys missing from a language fall back to German.
   ────────────────────────────────────────────────────────────────────────── */

export type Lang = 'de' | 'en';

type Dict = Record<string, string>;

const de: Dict = {
  // common
  'common.search': 'Suchen…',
  'common.login': '🔐 Anmelden / Registrieren',
  'common.logout': 'Abmelden',
  'common.signInRequired': '🔒 Anmeldung erforderlich',
  'common.back': '← Zurück',
  'common.cancel': 'Abbrechen',

  // nav groups
  'nav.group.overview': 'Übersicht',
  'nav.group.vocabGrammar': 'Vokabeln & Grammatik',
  'nav.group.redemittel': 'Redemittel',
  'nav.group.news': '📰 Nachrichten',
  'nav.group.practice': 'Üben',

  // nav items
  'nav.home': 'Startseite',
  'nav.progress': 'Mein Fortschritt',
  'nav.favourites': 'Meine Favoriten',
  'nav.notes': 'Notizen',
  'nav.vocab': 'Vokabeln',
  'nav.grammar': 'Grammatik',
  'nav.conjugation': 'Konjugation',
  'nav.verbQuiz': 'Verb-Konjugations-Quiz',
  'nav.satzstellung': 'Satzstellung',
  'nav.redemittel': 'Redemittel',
  'nav.newsGerman': 'Deutsche Nachrichten',
  'nav.examInfo': 'Prüfungsinfo',
  'nav.lernplan': 'Lernplan',
  'nav.flashcards': 'Karteikarten',
  'nav.vocabQuiz': 'Vokabel-Quiz',
  'nav.redemittelQuiz': 'Redemittel-Quiz',
  'nav.grammarQuiz': 'Grammatik-Quiz',
  'nav.writing': 'Schreibübungen',
  'nav.reading': 'Leseverstehen',
  'nav.speaking': 'Sprechen',
  'nav.listening': 'Hören',
  'nav.conversation': 'Konversation',
  'nav.stories': 'Kurzgeschichten',

  // home
  'home.welcome': 'Willkommen',
  'home.welcomeBack': 'zurück',
  'home.subtitle': 'Lerne Deutsch von A1 bis B1 — mit Vokabeln, Grammatik, Schreibübungen und mehr.',
  'home.vocabByLevel': 'Vokabeln nach Level',
  'home.practiceAreas': 'Übungsbereiche',
  'home.words': 'Wörter',
  // level labels
  'home.level.A1': 'Anfänger',
  'home.level.A2': 'Grundkenntnisse',
  'home.level.B1': 'Fortgeschritten',
  'home.level.B2': 'Selbstständig',
  // feature cards
  'home.feat.flashcards': 'Karteikarten',
  'home.feat.flashcards.d': 'Vokabeln mit Flashcards lernen',
  'home.feat.quiz': 'Quiz',
  'home.feat.quiz.d': 'Wissen testen & Punkte sammeln',
  'home.feat.writing': 'Schreibübungen',
  'home.feat.writing.d': '200 geführte Lückentexte A1–B1',
  'home.feat.reading': 'Leseverstehen',
  'home.feat.reading.d': 'Texte lesen & Fragen beantworten',
  'home.feat.exam': 'Prüfungsinfo',
  'home.feat.exam.d': 'Aufbau & Tipps für Goethe-Prüfung',
  'home.feat.fav': 'Meine Favoriten',
  'home.feat.fav.d': 'Gespeicherte Vokabeln üben',

  // home stats
  'stats.streak': 'Tage in Folge',
  'stats.record': 'Rekord',
  'stats.rank': 'Stufe',
  'stats.dailyGoal': 'Tagesziel',
  'stats.done': 'Geschafft!',
  'stats.left': 'übrig',
  'stats.toNext': 'Noch {n} XP bis {rank}',
  'stats.maxRank': 'Höchste Stufe erreicht 👑',
  'quickreview.title': '⚡ Schnellübung',

  // settings
  'settings.title': '⚙️ Einstellungen',
  'settings.appearance': '🎨 Erscheinungsbild',
  'settings.light': 'Hell',
  'settings.dark': 'Dunkel',
  'settings.auto': 'Auto',
  'settings.fontSize': '🔠 Schriftgröße',
  'settings.dailyGoal': '🎯 Tagesziel (Übungen)',
  'settings.language': '🌐 Sprache der Oberfläche',

  // onboarding
  'onb.welcome': 'Willkommen!',
  'onb.subtitle': 'Lass uns deinen Lernplan einrichten — Schritt {n} von 3',
  'onb.levelQ': 'Welches Niveau hast du?',
  'onb.interestsQ': 'Was interessiert dich?',
  'onb.interestsHint': 'Wähle beliebig viele (optional)',
  'onb.goalQ': 'Dein Tagesziel',
  'onb.goalHint': 'Wie viele Übungen pro Tag?',
  'onb.exercises': 'Übungen',
  'onb.next': 'Weiter →',
  'onb.start': "🚀 Los geht's!",
  'onb.skip': 'Überspringen',
  'onb.lvl.A1': 'A1 — Anfänger',
  'onb.lvl.A2': 'A2 — Grundkenntnisse',
  'onb.lvl.B1': 'B1 — Mittelstufe',
  'onb.lvl.B2': 'B2 — Fortgeschritten',

  // auth
  'auth.subtitle': 'Melde dich an, um alle Inhalte freizuschalten',
  'auth.login': 'Anmelden',
  'auth.register': 'Registrieren',
  'auth.google': 'Mit Google fortfahren',
  'auth.orEmail': 'oder per E-Mail',
  'auth.email': 'E-Mail',
  'auth.password': 'Passwort',
  'auth.createAccount': 'Konto erstellen',

  // quiz
  'quiz.numQuestions': '📊 Anzahl der Fragen',
  'quiz.tenQuestions': '10 Fragen',
  'quiz.allQuestions': 'Alle ({n})',
  'quiz.adaptive': '🧠 Adaptive Schwierigkeit',
  'quiz.adaptiveHint': 'Bevorzugt deine Schwachstellen & mischt die Niveaus ({levels}) ausgewogen.',
  'quiz.inThisQuiz': '{n} Fragen in diesem Quiz',
  'quiz.start': '▶ Quiz starten',
  'quiz.tooFew': 'Zu wenig Wörter (min. 4 nötig)',
  'quiz.pool': 'Wörter im Pool',
};

const en: Dict = {
  'common.search': 'Search…',
  'common.login': '🔐 Sign in / Register',
  'common.logout': 'Sign out',
  'common.signInRequired': '🔒 Sign-in required',
  'common.back': '← Back',
  'common.cancel': 'Cancel',

  'nav.group.overview': 'Overview',
  'nav.group.vocabGrammar': 'Vocabulary & Grammar',
  'nav.group.redemittel': 'Useful Phrases',
  'nav.group.news': '📰 News',
  'nav.group.practice': 'Practice',

  'nav.home': 'Home',
  'nav.progress': 'My Progress',
  'nav.favourites': 'My Favourites',
  'nav.notes': 'Notes',
  'nav.vocab': 'Vocabulary',
  'nav.grammar': 'Grammar',
  'nav.conjugation': 'Conjugation',
  'nav.verbQuiz': 'Verb Conjugation Quiz',
  'nav.satzstellung': 'Word Order',
  'nav.redemittel': 'Useful Phrases',
  'nav.newsGerman': 'German News',
  'nav.examInfo': 'Exam Info',
  'nav.lernplan': 'Study Plan',
  'nav.flashcards': 'Flashcards',
  'nav.vocabQuiz': 'Vocabulary Quiz',
  'nav.redemittelQuiz': 'Phrases Quiz',
  'nav.grammarQuiz': 'Grammar Quiz',
  'nav.writing': 'Writing',
  'nav.reading': 'Reading',
  'nav.speaking': 'Speaking',
  'nav.listening': 'Listening',
  'nav.conversation': 'Conversation',
  'nav.stories': 'Short Stories',

  'home.welcome': 'Welcome',
  'home.welcomeBack': 'back',
  'home.subtitle': 'Learn German from A1 to B1 — with vocabulary, grammar, writing exercises and more.',
  'home.vocabByLevel': 'Vocabulary by Level',
  'home.practiceAreas': 'Practice Areas',
  'home.words': 'words',
  'home.level.A1': 'Beginner',
  'home.level.A2': 'Elementary',
  'home.level.B1': 'Intermediate',
  'home.level.B2': 'Independent',
  'home.feat.flashcards': 'Flashcards',
  'home.feat.flashcards.d': 'Learn vocabulary with flashcards',
  'home.feat.quiz': 'Quiz',
  'home.feat.quiz.d': 'Test your knowledge & earn points',
  'home.feat.writing': 'Writing',
  'home.feat.writing.d': '200 guided gap-fill texts A1–B1',
  'home.feat.reading': 'Reading',
  'home.feat.reading.d': 'Read texts & answer questions',
  'home.feat.exam': 'Exam Info',
  'home.feat.exam.d': 'Structure & tips for the Goethe exam',
  'home.feat.fav': 'My Favourites',
  'home.feat.fav.d': 'Practise saved vocabulary',

  'stats.streak': 'day streak',
  'stats.record': 'Best',
  'stats.rank': 'Rank',
  'stats.dailyGoal': 'Daily goal',
  'stats.done': 'Done!',
  'stats.left': 'left',
  'stats.toNext': '{n} XP to {rank}',
  'stats.maxRank': 'Top rank reached 👑',
  'quickreview.title': '⚡ Quick Review',

  'settings.title': '⚙️ Settings',
  'settings.appearance': '🎨 Appearance',
  'settings.light': 'Light',
  'settings.dark': 'Dark',
  'settings.auto': 'Auto',
  'settings.fontSize': '🔠 Font size',
  'settings.dailyGoal': '🎯 Daily goal (exercises)',
  'settings.language': '🌐 Interface language',

  'onb.welcome': 'Welcome!',
  'onb.subtitle': "Let's set up your study plan — step {n} of 3",
  'onb.levelQ': 'What is your level?',
  'onb.interestsQ': 'What are you interested in?',
  'onb.interestsHint': 'Pick as many as you like (optional)',
  'onb.goalQ': 'Your daily goal',
  'onb.goalHint': 'How many exercises per day?',
  'onb.exercises': 'exercises',
  'onb.next': 'Next →',
  'onb.start': "🚀 Let's go!",
  'onb.skip': 'Skip',
  'onb.lvl.A1': 'A1 — Beginner',
  'onb.lvl.A2': 'A2 — Elementary',
  'onb.lvl.B1': 'B1 — Intermediate',
  'onb.lvl.B2': 'B2 — Upper-intermediate',

  'auth.subtitle': 'Sign in to unlock all content',
  'auth.login': 'Sign in',
  'auth.register': 'Register',
  'auth.google': 'Continue with Google',
  'auth.orEmail': 'or with email',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.createAccount': 'Create account',

  'quiz.numQuestions': '📊 Number of questions',
  'quiz.tenQuestions': '10 questions',
  'quiz.allQuestions': 'All ({n})',
  'quiz.adaptive': '🧠 Adaptive difficulty',
  'quiz.adaptiveHint': 'Prioritises your weak words & balances the levels ({levels}).',
  'quiz.inThisQuiz': '{n} questions in this quiz',
  'quiz.start': '▶ Start quiz',
  'quiz.tooFew': 'Too few words (min. 4 needed)',
  'quiz.pool': 'words in the pool',
};

const DICTS: Record<Lang, Dict> = { de, en };

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let s = DICTS[lang]?.[key] ?? DICTS.de[key] ?? key;
  if (vars) for (const k in vars) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
  return s;
}
