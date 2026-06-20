'use client';

import { useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';

/* ──────────────────────────────────────────────────────
   Official Goethe-Zertifikat exam structure
────────────────────────────────────────────────────── */
const EXAMS = [
  /* ═══════════════════════ A1 ═══════════════════════ */
  {
    level: 'A1',
    fullName: 'Start Deutsch 1',
    color: '#15803d',
    bg: '#f0fdf4',
    bd: '#bbf7d0',
    badge: { bg: '#dcfce7', color: '#15803d' },
    totalTime: '80 Min',
    setup: 'Gruppen (3–4 Personen)',
    totalPts: '60 Punkte',
    parts: [
      {
        name: 'Lesen',
        icon: '📖',
        time: '25 Min',
        pts: '15 Punkte',
        questions: '15 Aufgaben',
        desc: '3 Teile — kurze Alltagstexte, Anzeigen und öffentliche Schilder lesen und verstehen.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Kurze Nachrichten & Briefe',
            type: 'Richtig / Falsch',
            count: '5 Aufgaben',
            playback: null,
            themes: ['Kurze E-Mails', 'Postkarten', 'Notizen zwischen Freunden'],
            tip: 'Du liest zwei kurze Alltagstexte. Lies zuerst die Aussagen, dann suche die Antwort im Text.',
          },
          {
            num: 'Teil 2',
            title: 'Anzeigen & Informationen',
            type: 'Multiple Choice (a / b)',
            count: '5 Aufgaben',
            playback: null,
            themes: ['Kleinanzeigen', 'Internet-Shops', 'Veranstaltungsplakate', 'Infoseiten'],
            tip: 'Nur zwei Antwortoptionen — überprüfe, ob die Information exakt passt.',
          },
          {
            num: 'Teil 3',
            title: 'Öffentliche Hinweisschilder',
            type: 'Richtig / Falsch',
            count: '5 Aufgaben',
            playback: null,
            themes: ['Laden-Öffnungszeiten', 'Bahnhofshinweise', 'Verbotsschilder', 'Kurze Anweisungen'],
            tip: 'Kurze Texte — auf genaue Formulierungen und Negationen achten.',
          },
        ],
      },
      {
        name: 'Hören',
        icon: '🎧',
        time: '20 Min',
        pts: '15 Punkte',
        questions: '15 Aufgaben',
        desc: '3 Teile — kurze Alltagsgespräche, öffentliche Ansagen und Telefonansagen.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Kurze Alltagsgespräche',
            type: 'Multiple Choice — Bild wählen (a / b / c)',
            count: '6 Aufgaben · 2× hören',
            playback: '2× hören',
            themes: ['Einkaufen', 'Nach dem Weg fragen', 'Verabredungen', 'Preise & Zeiten', 'Persönliche Informationen'],
            tip: 'Beim ersten Hören: Thema erfassen. Beim zweiten: Antwort bestätigen. Die richtige Antwort ist ein Bild (a, b oder c).',
          },
          {
            num: 'Teil 2',
            title: 'Öffentliche Durchsagen',
            type: 'Richtig / Falsch',
            count: '4 Aufgaben · 1× hören',
            playback: '1× hören — Achtung!',
            themes: ['Bahnhofsdurchsagen', 'Flughafen', 'Supermarkt-Lautsprecher', 'Schulansagen'],
            tip: 'Nur einmal gehört! Zahlen, Gleise und Uhrzeiten sofort notieren.',
          },
          {
            num: 'Teil 3',
            title: 'Anrufbeantworter & Telefonansagen',
            type: 'Multiple Choice (a / b / c)',
            count: '5 Aufgaben · 2× hören',
            playback: '2× hören',
            themes: ['Terminabsagen', 'Einladungen', 'Informationsanfragen', 'Lieferbenachrichtigungen'],
            tip: 'Wer ruft an? Warum? Was soll man tun? Diese drei Fragen beim Hören im Kopf behalten.',
          },
        ],
      },
      {
        name: 'Schreiben',
        icon: '✍️',
        time: '20 Min',
        pts: '15 Punkte',
        questions: '2 Teile',
        desc: '2 Teile — ein Formular ausfüllen und eine kurze Mitteilung schreiben.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Formular ausfüllen',
            type: 'Kurzantworten (5 Felder)',
            count: '5 Felder',
            playback: null,
            themes: ['Hotelreservierung', 'Kursanmeldung', 'Bibliotheksausweis', 'Name, Adresse, Beruf, Datum, E-Mail'],
            tip: 'Du liest einen kurzen Text über eine Person und trägst 5 Informationen in ein Formular ein. Nur das Gefragte — keine ganzen Sätze nötig.',
          },
          {
            num: 'Teil 2',
            title: 'Kurze Mitteilung schreiben',
            type: 'Freier Text · 3 Inhaltspunkte',
            count: '≈ 30 Wörter',
            playback: null,
            themes: ['E-Mail an einen Freund', 'Postkarte', 'Notiz', 'Warum schreibst du? Infos? Treffpunkt?'],
            tip: 'Die Aufgabe gibt 3 Inhaltspunkte vor — alle drei müssen angesprochen werden, sonst Punktabzug.',
          },
        ],
      },
      {
        name: 'Sprechen',
        icon: '🎙',
        time: '15 Min',
        pts: '15 Punkte',
        questions: '3 Teile',
        desc: '3 Teile — Vorstellung, Informationen erfragen und Bitten formulieren. Prüfung in Gruppen (3–4 Personen).',
        teile: [
          {
            num: 'Teil 1',
            title: 'Sich vorstellen',
            type: 'Monolog mit Stichwortliste',
            count: 'Stichworte: Name, Alter, Land, Wohnort, Sprachen, Beruf, Hobby',
            playback: null,
            themes: ['Name, Alter, Herkunft', 'Wohnort, Beruf', 'Sprachen, Hobbys', 'Buchstabieren & Zahlen nennen'],
            tip: 'Nach der Vorstellung: Der Prüfer bittet dich, einen Namen oder eine Stadt zu buchstabieren und eine Zahl (z. B. Telefonnummer) auf Deutsch zu sagen.',
          },
          {
            num: 'Teil 2',
            title: 'Fragen stellen und beantworten',
            type: 'Kartenspiel: Stichwort + Thema → Frage',
            count: 'Je Kandidat 1 Karte',
            playback: null,
            themes: ['"Essen & Trinken" + "Sonntag" → Was isst du sonntags?', '"Sport" + "Abend" → Machst du abends Sport?'],
            tip: 'Du ziehst eine Karte, bildest eine Frage und stellst sie dem Nachbarn. Dieser antwortet — dann ist er dran.',
          },
          {
            num: 'Teil 3',
            title: 'Bitten formulieren',
            type: 'Bildkarte → höfliche Bitte',
            count: 'Je Kandidat 1 Bildkarte',
            playback: null,
            themes: ['Apfel → "Gib mir bitte den Apfel."', 'Wasser → "Könntest du mir Wasser geben?"', 'Jacke, Stift, Tür'],
            tip: 'Karte zeigt ein Bild ohne Wort — bilde eine höfliche Bitte. Der Partner reagiert angemessen ("Bitte sehr." / "Tut mir leid...").',
          },
        ],
      },
    ],
  },

  /* ═══════════════════════ A2 ═══════════════════════ */
  {
    level: 'A2',
    fullName: 'Goethe-Zertifikat A2',
    color: '#1d4ed8',
    bg: '#eff6ff',
    bd: '#bfdbfe',
    badge: { bg: '#dbeafe', color: '#1d4ed8' },
    totalTime: '105 Min',
    setup: 'Paare (2 Personen)',
    totalPts: '85 Punkte',
    parts: [
      {
        name: 'Lesen',
        icon: '📖',
        time: '30 Min',
        pts: '20 Punkte',
        questions: '20 Aufgaben',
        desc: '4 Teile — Informationstexte, Verzeichnisse, E-Mails/Briefe und Kleinanzeigen.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Informationstexte',
            type: 'Multiple Choice (a / b / c)',
            count: '5 Aufgaben',
            playback: null,
            themes: ['Zeitungsartikel', 'Informationsbroschüren', 'Schwarzes Brett'],
            tip: 'Längerer Text — Schlüsselwörter in den Fragen markieren, dann gezielt im Text suchen.',
          },
          {
            num: 'Teil 2',
            title: 'Schwarzes Brett / Verzeichnis',
            type: 'Multiple Choice (a / b / c)',
            count: '5 Aufgaben',
            playback: null,
            themes: ['Kaufhausplan', 'TV-Programm', 'Kursverzeichnis', 'Fahrplan'],
            tip: 'Du musst spezifische Informationen lokalisieren — scanne den Text, lies nicht alles durch.',
          },
          {
            num: 'Teil 3',
            title: 'E-Mails und Briefe',
            type: 'Multiple Choice (a / b / c)',
            count: '5 Aufgaben',
            playback: null,
            themes: ['Freundschaftliche E-Mails', 'Formelle Briefe', 'Geschäftskorrespondenz'],
            tip: 'Auf Tonfall achten — formell vs. informell beeinflusst die Bedeutung einzelner Aussagen.',
          },
          {
            num: 'Teil 4',
            title: 'Kleinanzeigen zuordnen',
            type: 'Zuordnung (Situation → Anzeige)',
            count: '5 Aufgaben',
            playback: null,
            themes: ['Gebrauchtfahrrad gesucht', 'Wohnungsangebote', 'Kurse & Dienstleistungen'],
            tip: '5 Situationen (Personen) und mehrere Anzeigen — lies zuerst die Situationsbeschreibungen, dann suche die passende Anzeige.',
          },
        ],
      },
      {
        name: 'Hören',
        icon: '🎧',
        time: '30 Min',
        pts: '20 Punkte',
        questions: '20 Aufgaben',
        desc: '4 Teile — Radio/Voicemail, Informationsmonolog (Zuordnung), Gespräche und Radiointerview.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Radio & Telefonansagen',
            type: 'Multiple Choice (a / b / c)',
            count: '5 Aufgaben · 2× hören',
            playback: '2× hören',
            themes: ['Wetterbericht', 'Verkehrsmeldungen', 'Voicemail-Nachrichten', 'Radionachrichten'],
            tip: 'Beim ersten Hören: Hauptaussage. Beim zweiten: Details und richtige Option bestätigen.',
          },
          {
            num: 'Teil 2',
            title: 'Informationsmonolog (Zuordnung)',
            type: 'Zuordnung — Bilder / Tage / Namen',
            count: '5 Aufgaben · 1× hören',
            playback: '1× hören — Achtung!',
            themes: ['Veranstaltungskalender', 'Reiseführer', 'Programmübersicht'],
            tip: 'Nur einmal gehört! Schaue vorher kurz die Tabelle/Bilder an, um vorbereitet zu sein.',
          },
          {
            num: 'Teil 3',
            title: 'Kurzgespräche zwischen Bekannten',
            type: 'Multiple Choice (a / b / c)',
            count: '5 Aufgaben · 1× hören',
            playback: '1× hören — Achtung!',
            themes: ['Gespräche unter Freunden', 'Kollegengespräche', 'Alltägliche Situationen'],
            tip: 'Nur einmal gehört — auf den Kern der Aussage konzentrieren, Ablenkungsdetails ignorieren.',
          },
          {
            num: 'Teil 4',
            title: 'Radiointerview',
            type: 'Ja / Nein (Richtig / Falsch)',
            count: '5 Aufgaben · 2× hören',
            playback: '2× hören',
            themes: ['Interview mit einem Gast', 'Podcast-Gespräch', 'Erfahrungsberichte'],
            tip: 'Du bewertest Aussagen des Gastes — hat er das wirklich so gesagt? Paraphrasierungen genau prüfen.',
          },
        ],
      },
      {
        name: 'Schreiben',
        icon: '✍️',
        time: '30 Min',
        pts: '20 Punkte',
        questions: '2 Teile',
        desc: '2 Teile — informelle Kurznachricht und formelle E-Mail/Brief. 3 Inhaltspunkte pro Teil.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Informelle Nachricht (SMS / kurze E-Mail)',
            type: 'Freier Text · 3 Inhaltspunkte',
            count: '≈ 20–30 Wörter',
            playback: null,
            themes: ['Zu spät kommen', 'Termin absagen und neuen vorschlagen', 'Kurze Information an Freund/Kollege'],
            tip: 'Alle 3 Inhaltspunkte ansprechen. Kurz und direkt — informeller Ton ist erwünscht.',
          },
          {
            num: 'Teil 2',
            title: 'Formelle E-Mail / Brief',
            type: 'Freier Text · 3 Inhaltspunkte · formell',
            count: '≈ 30–40 Wörter',
            playback: null,
            themes: ['Krankmeldung beim Chef', 'Informationsanfrage beim Touristenbüro', 'Anfrage an Vermieter oder Kursleitung'],
            tip: 'Formelle Anrede: "Sehr geehrte/r..." und Gruß: "Mit freundlichen Grüßen" nicht vergessen. Alle 3 Punkte adressieren.',
          },
        ],
      },
      {
        name: 'Sprechen',
        icon: '🎙',
        time: '15 Min',
        pts: '25 Punkte',
        questions: '3 Teile',
        desc: '3 Teile — Fragen stellen, über sich erzählen und gemeinsam planen. Prüfung zu zweit.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Fragen stellen und beantworten',
            type: 'Kartenspiel: 4 Stichwörter zu einem Thema',
            count: '4 Karten je Kandidat',
            playback: null,
            themes: ['Thema "Sprachschule": Lehrer, Hausaufgaben, Pause, Kurs', 'Thema "Freizeit": Sport, Musik, Kino, Wochenende'],
            tip: 'Du und dein Partner nehmt abwechselnd Karten und stellt Fragen. Es geht um ein einfaches Gespräch — keine Monologe.',
          },
          {
            num: 'Teil 2',
            title: 'Von sich erzählen (Kurzmonolog)',
            type: 'Monolog mit 4 Stichpunkten',
            count: '≈ 1–2 Min je Kandidat',
            playback: null,
            themes: ['"Was machst du mit deinem Geld?" → Kleidung / Reisen / Essen / Sparen', 'Ähnliche Fragen mit 4 Aspekten'],
            tip: 'Sprich frei über dich selbst — nutze die 4 Stichpunkte als Leitfaden, nicht als Pflichtprogramm.',
          },
          {
            num: 'Teil 3',
            title: 'Gemeinsam etwas planen',
            type: 'Dialog — Einigung finden',
            count: '≈ 2–3 Min zu zweit',
            playback: null,
            themes: ['Geburtstagsgeschenk für einen Freund kaufen', 'Termin zum Kaffeetrinken finden', 'Gemeinsamen Ausflug planen'],
            tip: 'Vorschläge machen ("Wie wäre es mit...?"), auf Partner reagieren ("Das ist eine gute Idee, aber...") und gemeinsam zu einem Ergebnis kommen.',
          },
        ],
      },
    ],
  },

  /* ═══════════════════════ B1 ═══════════════════════ */
  {
    level: 'B1',
    fullName: 'Goethe-Zertifikat B1',
    color: '#7c3aed',
    bg: '#f5f3ff',
    bd: '#ddd6fe',
    badge: { bg: '#ede9fe', color: '#7c3aed' },
    totalTime: '3 Std',
    setup: 'Paare · 15 Min Vorbereitungszeit (Sprechen)',
    totalPts: '100 Punkte (skaliert)',
    parts: [
      {
        name: 'Lesen',
        icon: '📖',
        time: '65 Min',
        pts: '30 Punkte',
        questions: '30 Aufgaben',
        desc: '5 Teile — Blog/E-Mail, Zeitungsartikel, Anzeigen-Zuordnung, Forumsbeiträge und formelle Regeln.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Blogbeitrag oder persönliche E-Mail',
            type: 'Richtig / Falsch',
            count: '6 Aufgaben',
            playback: null,
            themes: ['Tagebucheintrag', 'Erfahrungsbericht', 'Detaillierte E-Mail'],
            tip: 'Längerer persönlicher Text — prüfe jede Aussage sorgfältig und achte auf Details.',
          },
          {
            num: 'Teil 2',
            title: 'Zeitungs- / Magazinartikel',
            type: 'Multiple Choice (a / b / c)',
            count: '6 Aufgaben (2 Texte · je 3 Fragen)',
            playback: null,
            themes: ['Gesellschaft & Kultur', 'Umwelt', 'Arbeit & Karriere', 'Technik & Medien'],
            tip: 'Lies zuerst die Fragen, dann gezielt im Text nach der Antwort suchen.',
          },
          {
            num: 'Teil 3',
            title: 'Anzeigen zuordnen',
            type: 'Zuordnung · "0" = keine passende Anzeige',
            count: '7 Aufgaben (10 Situationen · 7 Anzeigen)',
            playback: null,
            themes: ['Kurs- und Urlaubsangebote', 'Berufsangebote', 'Dienstleistungen'],
            tip: '⚠️ Wichtig: Es gibt mehr Situationen (10) als Anzeigen (7). Für mindestens eine Situation gibt es keine passende Anzeige → "0" auf dem Antwortbogen eintragen.',
          },
          {
            num: 'Teil 4',
            title: 'Forumsmeinungen / Leserbriefe',
            type: 'Ja / Nein (dafür / dagegen)',
            count: '7 Aufgaben (7 kurze Texte)',
            playback: null,
            themes: ['Sollen Läden sonntags öffnen?', 'Sind Computerspiele schädlich?', 'Online-Diskussionen zu Alltagsthemen'],
            tip: 'Jeder Text ist eine kurze Meinung einer Person — entscheide: Ist sie dafür (Ja) oder dagegen (Nein)?',
          },
          {
            num: 'Teil 5',
            title: 'Regeln und Vorschriften',
            type: 'Multiple Choice (a / b / c)',
            count: '4 Aufgaben',
            playback: null,
            themes: ['Hausordnung', 'AGBs', 'Bedienungsanleitungen', 'Behördliche Vorschriften'],
            tip: 'Formales, bürokratisches Deutsch — auf genaue Bedeutung achten, keine Interpretation.',
          },
        ],
      },
      {
        name: 'Hören',
        icon: '🎧',
        time: '40 Min',
        pts: '30 Punkte',
        questions: '30 Aufgaben',
        desc: '4 Teile — kurze Ansagen, Informationsmonolog, langer Dialog und Radiodiskussion.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Kurze Ansagen & Nachrichten',
            type: 'Richtig/Falsch + Multiple Choice (je Aufnahme)',
            count: '10 Aufgaben (5 Aufnahmen · je 1× R/F + 1× MC) · 2× hören',
            playback: '2× hören',
            themes: ['Öffentliche Durchsagen', 'Voicemail-Nachrichten', 'Automatische Telefonansagen'],
            tip: 'Für jede der 5 Aufnahmen gibt es 2 Fragen: zuerst Richtig/Falsch, dann Multiple Choice. Beim ersten Hören: Überblick. Beim zweiten: Details.',
          },
          {
            num: 'Teil 2',
            title: 'Informativer Monolog / Vortrag',
            type: 'Multiple Choice (a / b / c)',
            count: '5 Aufgaben · 1× hören',
            playback: '1× hören — Achtung!',
            themes: ['Museumsführung', 'Willkommensrede', 'Informationsvortrag'],
            tip: 'Nur einmal gehört — Fragen vorher lesen und auf Schlüsselbegriffe vorbereiten.',
          },
          {
            num: 'Teil 3',
            title: 'Längeres Gespräch (2 Personen)',
            type: 'Richtig / Falsch',
            count: '7 Aufgaben · 1× hören',
            playback: '1× hören — Achtung!',
            themes: ['Erfahrungsberichte', 'Gemeinsame Planung', 'Diskussion über Erlebnisse'],
            tip: 'Nur einmal gehört — wer sagt was? Auf Sprecherwechsel achten.',
          },
          {
            num: 'Teil 4',
            title: 'Radiodiskussion (3 Sprecher)',
            type: 'Zuordnung — Wer sagt das?',
            count: '8 Aufgaben · 2× hören',
            playback: '2× hören',
            themes: ['Moderierte Debatte (Host + 2 Gäste)', 'Kontroverse Alltagsthemen', 'Verschiedene Standpunkte'],
            tip: '3 Sprecher: Moderator + 2 Gäste mit unterschiedlichen Meinungen. Jede Aussage musst du der richtigen Person zuordnen. Auf Signalwörter achten.',
          },
        ],
      },
      {
        name: 'Schreiben',
        icon: '✍️',
        time: '60 Min',
        pts: '100 Punkte (skaliert)',
        questions: '3 Teile',
        desc: '3 Teile — informelle E-Mail (~80 Wörter), Forumsbeitrag (~80 Wörter) und formelle E-Mail (~40 Wörter).',
        teile: [
          {
            num: 'Teil 1',
            title: 'Informelle E-Mail an einen Freund',
            type: 'Freier Text · 3 Inhaltspunkte',
            count: '≈ 80 Wörter',
            playback: null,
            themes: ['Über etwas berichten, das du getan oder gekauft hast', 'Gefühle und Meinung ausdrücken', 'Vorschlag machen oder Treffen planen'],
            tip: 'Alle 3 Inhaltspunkte ansprechen. Strukturierter Text mit Einleitung und Abschluss. Informeller Ton.',
          },
          {
            num: 'Teil 2',
            title: 'Meinung äußern (Forumsbeitrag)',
            type: 'Freier Text · eigene Meinung mit Begründung',
            count: '≈ 80 Wörter',
            playback: null,
            themes: ['Soll der ÖPNV kostenlos sein?', 'Sind Computerspiele gut oder schlecht für Kinder?', 'Aktuelle gesellschaftliche Alltagsthemen'],
            tip: 'Klare Meinung äußern + Begründungen nennen. Schlüssig und kohärent schreiben. Kein Aufsatz-Stil — natürlicher Forenkommentar.',
          },
          {
            num: 'Teil 3',
            title: 'Formelle E-Mail (Entschuldigung / Absage)',
            type: 'Freier Text · formeller Register',
            count: '≈ 40 Wörter',
            playback: null,
            themes: ['Termin absagen und Grund nennen', 'Entschuldigung an Kursleitung oder Chef', 'Alternative vorschlagen'],
            tip: '⚠️ Achtung: Formeller Register ist Pflicht — "Sehr geehrte/r..." / "Mit freundlichen Grüßen". Punkte werden für falschen Tonfall abgezogen.',
          },
        ],
      },
      {
        name: 'Sprechen',
        icon: '🎙',
        time: '15 Min + 15 Min Vorbereitung',
        pts: '100 Punkte (skaliert)',
        questions: '3 Teile',
        desc: '3 Teile — gemeinsam planen, Thema präsentieren (5 Abschnitte) und Rückfragen beantworten. Prüfung zu zweit.',
        teile: [
          {
            num: 'Teil 1',
            title: 'Gemeinsam etwas planen',
            type: 'Dialog · Einigung finden',
            count: '≈ 3 Minuten',
            playback: null,
            themes: [
              'Szenario: Ein Kollege liegt im Krankenhaus — ihr wollt ihn besuchen',
              'Was kaufen? Wann fahren? Wie hinkommen? Aufgaben aufteilen',
            ],
            tip: 'Vorschläge machen, Ideen ablehnen (höflich!), Kompromisse finden und eine Einigung erzielen. Interaktion wird bewertet.',
          },
          {
            num: 'Teil 2',
            title: 'Ein Thema präsentieren',
            type: 'Monolog · 5 Pflichtabschnitte',
            count: '≈ 3–4 Min je Kandidat',
            playback: null,
            themes: [
              '1. Einleitung & Struktur deiner Präsentation',
              '2. Eigene Erfahrungen mit dem Thema',
              '3. Situation in deinem Heimatland',
              '4. Vor- und Nachteile + persönliche Meinung',
              '5. Fazit & Dank an das Publikum',
            ],
            tip: 'Du wählst in der Vorbereitungszeit (15 Min.) zwischen 2 Themen. Struktur ist Pflicht — alle 5 Abschnitte müssen vorkommen. Notizen erlaubt, kein Wörterbuch.',
          },
          {
            num: 'Teil 3',
            title: 'Über das Thema diskutieren',
            type: 'Rückfragen & Reaktion',
            count: '≈ 2 Min je Kandidat',
            playback: null,
            themes: [
              'Kurzes Feedback zur Präsentation deines Partners geben',
              'Deinem Partner eine Frage stellen',
              'Eine Frage deines Partners beantworten',
              'Eine Frage des Prüfers beantworten',
            ],
            tip: 'Nach der Präsentation deines Partners: kurzes Feedback + 1 Frage stellen. Nach deiner eigenen Präsentation: 1 Frage des Partners + 1 Frage des Prüfers beantworten.',
          },
        ],
      },
    ],
  },
];

/* ──────────────────────────────────────────────────────
   Sub-components
────────────────────────────────────────────────────── */
function PlaybackBadge({ text }: { text: string }) {
  const warn = text.includes('Achtung');
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
      background: warn ? 'var(--red-bg, #fef2f2)' : 'var(--blue-bg)',
      color: warn ? '#dc2626' : 'var(--blue)',
      border: `1px solid ${warn ? '#fecaca' : 'var(--blue-bd)'}`,
      flexShrink: 0,
    }}>🔉 {text}</span>
  );
}

function TeilCard({ teil, accentColor }: {
  teil: { num: string; title: string; type: string; count: string; playback: string | null; themes: string[]; tip: string };
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden',
      boxShadow: open ? 'var(--sh-md)' : 'var(--sh)', transition: 'box-shadow .15s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
          background: open ? accentColor : 'var(--bg)', border: 'none', cursor: 'pointer',
          textAlign: 'left', transition: 'background .15s', fontFamily: 'inherit',
        }}
      >
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, flexShrink: 0,
          background: open ? 'rgba(255,255,255,.2)' : 'var(--faint)',
          color: open ? '#fff' : 'var(--muted)',
        }}>{teil.num}</span>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: open ? '#fff' : 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teil.title}</span>
        <span className="pruef-teil-count" style={{ fontSize: 11, color: open ? 'rgba(255,255,255,.7)' : 'var(--muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>{teil.count}</span>
        <svg style={{ flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={open ? '#fff' : 'currentColor'} strokeWidth="2">
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </button>

      {open && (
        <div style={{ padding: '14px 16px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          {/* Type + playback chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'var(--blue-bg)', color: 'var(--blue)', fontWeight: 600 }}>
              {teil.type}
            </span>
            {teil.playback && <PlaybackBadge text={teil.playback} />}
          </div>

          {/* Themes */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>
              Themen / Format
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {teil.themes.map((t, i) => (
                <span key={i} style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 6, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--ink2)', lineHeight: 1.5 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-bd)', borderRadius: 7, padding: '9px 12px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', marginRight: 6 }}>💡 Tipp:</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6 }}>{teil.tip}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ExamSection({ exam }: { exam: typeof EXAMS[0] }) {
  const [activeTab, setActiveTab] = useState(0);
  const part = exam.parts[activeTab];

  return (
    <div style={{ border: `1px solid ${exam.bd}`, borderRadius: 14, background: exam.bg, overflow: 'hidden' }}>
      {/* Level header */}
      <div className="pruef-exam-header" style={{ padding: '14px 16px', borderBottom: `1px solid ${exam.bd}`, display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 800, padding: '4px 12px', borderRadius: 100, background: exam.badge.bg, color: exam.badge.color, flexShrink: 0 }}>
          {exam.level}
        </span>
        <span style={{ fontFamily: 'var(--font-lora)', fontSize: 15, fontWeight: 700, color: exam.color, flex: 1, minWidth: 120 }}>
          {exam.fullName}
        </span>
        <div className="pruef-exam-badges" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: exam.badge.bg, color: exam.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
            ⏱ {exam.totalTime}
          </span>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: exam.badge.bg, color: exam.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
            🏆 {exam.totalPts}
          </span>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: exam.badge.bg, color: exam.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
            👥 {exam.setup}
          </span>
        </div>
      </div>

      {/* Part tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${exam.bd}`, overflowX: 'auto' }}>
        {exam.parts.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '10px 18px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: activeTab === i ? 700 : 500,
              background: activeTab === i ? '#fff' : 'transparent',
              color: activeTab === i ? exam.color : 'var(--muted)',
              borderBottom: activeTab === i ? `2px solid ${exam.color}` : '2px solid transparent',
              transition: 'all .15s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <span>{p.icon}</span>
            <span>{p.name}</span>
            <span className="pruef-tab-time" style={{ fontSize: 10, opacity: .65 }}>({p.time})</span>
          </button>
        ))}
      </div>

      {/* Part content */}
      <div style={{ padding: '18px 20px', background: '#fff' }}>
        {/* Part overview */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 10px' }}>{part.desc}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 100, background: exam.bg, color: exam.color, fontWeight: 600, border: `1px solid ${exam.bd}` }}>
              ⏱ {part.time}
            </span>
            <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 100, background: 'var(--faint)', color: 'var(--ink2)', fontWeight: 600 }}>
              🏆 {part.pts}
            </span>
            <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 100, background: 'var(--faint)', color: 'var(--ink2)', fontWeight: 600 }}>
              📝 {part.questions}
            </span>
            <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 100, background: 'var(--faint)', color: 'var(--ink2)', fontWeight: 600 }}>
              {part.teile.length} Teile
            </span>
          </div>
        </div>

        {/* Teil cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {part.teile.map(teil => (
            <TeilCard key={teil.num} teil={teil} accentColor={exam.color} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────── */
export default function PruefungsinfoPage() {
  return (
    <>
      <Topbar title="Prüfungsinfo" />
      <div className="pruef-page" style={{ maxWidth: 880, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
            Goethe-Zertifikat — Vollständige Prüfungsstruktur
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
            Offizielle Aufgabentypen, Punktzahlen und Tipps für A1, A2 und B1.
            Klicke auf jeden Teil, um Details zu sehen.
          </p>
        </div>

        {/* Bestehen banner */}
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 10, background: 'var(--amber-bg)', border: '1px solid var(--amber-bd)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>📌 Bestehenskriterien (alle Niveaus)</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7 }}>
            Mindestens <strong>60 von 100 Punkten</strong> im Gesamtergebnis <em>und</em> mindestens <strong>45&nbsp;%</strong> in jedem einzelnen Prüfungsteil (Lesen, Hören, Schreiben, Sprechen).
            Ein schlechtes Ergebnis in nur einem Teil kann zur Gesamtnicht­bestehung führen.
          </div>
        </div>

        {/* Crucial tip: task fulfillment */}
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 10, background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--blue)', marginBottom: 4 }}>⭐ Wichtigster Tipp für alle Niveaus</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7 }}>
            Die Prüfer bewerten nicht nur Grammatik und Wortschatz — sie bewerten die <strong>Aufgabenerfüllung</strong>.
            Du <em>musst</em> alle genannten Inhaltspunkte ansprechen. Perfektes Deutsch mit fehlenden Punkten = Punktabzug.
          </div>
        </div>

        {/* Quick overview table */}
        <div className="pruef-overview-wrap" style={{ marginBottom: 28, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="pruef-table-scroll" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div className="pruef-ovw-inner" style={{ minWidth: 560 }}>
              <div className="pruef-ovw-row" style={{ display: 'grid', gridTemplateColumns: '0.6fr 1fr 1fr 1fr 1fr', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                {['Niveau', 'Lesen', 'Hören', 'Schreiben', 'Sprechen'].map(h => (
                  <div key={h} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>{h}</div>
                ))}
              </div>
              {[
                { level: 'A1', color: '#15803d', bg: '#f0fdf4', cols: ['25 Min · 15 Pkt · 3 Teile', '20 Min · 15 Pkt · 3 Teile', '20 Min · 15 Pkt · 2 Teile', '15 Min · 15 Pkt · 3 Teile'] },
                { level: 'A2', color: '#1d4ed8', bg: '#eff6ff', cols: ['30 Min · 20 Pkt · 4 Teile', '30 Min · 20 Pkt · 4 Teile', '30 Min · 20 Pkt · 2 Teile', '15 Min · 25 Pkt · 3 Teile'] },
                { level: 'B1', color: '#7c3aed', bg: '#f5f3ff', cols: ['65 Min · 30 Pkt · 5 Teile', '40 Min · 30 Pkt · 4 Teile', '60 Min · 100 Pkt* · 3 Teile', '15 Min · 100 Pkt* · 3 Teile'] },
              ].map((row, ri) => (
                <div key={row.level} className="pruef-ovw-row" style={{ display: 'grid', gridTemplateColumns: '0.6fr 1fr 1fr 1fr 1fr', borderBottom: ri < 2 ? '1px solid var(--border)' : 'none', background: row.bg }}>
                  <div style={{ padding: '10px 12px', fontWeight: 800, color: row.color, fontSize: 14, fontFamily: 'var(--font-lora)' }}>{row.level}</div>
                  {row.cols.map((c, ci) => (
                    <div key={ci} style={{ padding: '10px 12px', fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.5, whiteSpace: 'nowrap' }}>{c}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
            * B1 Schreiben und Sprechen werden auf 100 Punkte skaliert.
          </div>
        </div>

        {/* Speaking exam note */}
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>🗣 Sprechen — Prüfungsformat nach Niveau</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.8 }}>
            <strong style={{ color: '#15803d' }}>A1:</strong> Gruppen (3–4 Kandidaten) ·
            <strong style={{ color: '#1d4ed8' }}> A2:</strong> Paare (2 Kandidaten) ·
            <strong style={{ color: '#7c3aed' }}> B1:</strong> Paare + 15 Minuten Vorbereitungszeit davor (Notizen erlaubt, kein Wörterbuch, kein Handy).<br/>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Tipp: Interaktion wird bewertet. Wenn dein Partner stockt, hilf ihm. Wenn du etwas nicht verstanden hast, frage nach: <em>"Könntest du das bitte wiederholen?"</em></span>
          </div>
        </div>

        {/* Exam sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {EXAMS.map(exam => (
            <ExamSection key={exam.level} exam={exam} />
          ))}
        </div>
      </div>
    </>
  );
}
