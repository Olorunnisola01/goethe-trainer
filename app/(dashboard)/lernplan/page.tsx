'use client';

import { useState, useEffect, useMemo } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/context/AuthContext';

/* ─── Types ─── */
type Level = 'A1' | 'A2' | 'B1' | 'B2';
type Timeline = 1 | 2 | 3 | 4 | 5;

interface PlanTask {
  id: string;
  category: string;
  title: string;
  level: Level;
  week: number;
  type: 'vocab' | 'grammar' | 'satzstellung' | 'reading' | 'listening' | 'writing' | 'speaking' | 'konversation' | 'redemittel';
  href?: string;
  duration: string; // "20 min"
}

interface PlanConfig {
  level: Level;
  months: Timeline;
}

/* ─── Icons per type ─── */
const TYPE_ICONS: Record<string, string> = {
  vocab: '📚', grammar: '🏗', satzstellung: '🔀', reading: '📖', listening: '🎧',
  writing: '✍️', speaking: '🎙', konversation: '💬', redemittel: '🗣',
};
const TYPE_COLORS: Record<string, string> = {
  vocab: '#1d4ed8', grammar: '#7c3aed', satzstellung: '#0d9488', reading: '#15803d', listening: '#b45309',
  writing: '#dc2626', speaking: '#0891b2', konversation: '#db2777', redemittel: '#65a30d',
};
const LEVEL_COLOR: Record<Level, string> = { A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed', B2: '#b45309' };

/* ─── Plan generation ─── */
const TASK_TEMPLATES: Record<Level, Omit<PlanTask, 'id' | 'week'>[]> = {
  A1: [
    // Einheit 1 — Begrüßung & Sich vorstellen
    { category: 'Redemittel', title: 'Redemittel: Begrüßung & Abschied', level: 'A1', type: 'redemittel', href: '/redemittel/A1', duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Sich vorstellen', level: 'A1', type: 'redemittel', href: '/redemittel/A1', duration: '15 Min' },
    { category: 'Grammatik', title: 'Grammatik: Pronomen (ich, du, er...)', level: 'A1', type: 'grammar', href: '/grammatik', duration: '20 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: sein (ich bin, du bist...)', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('sein')}`, duration: '15 Min' },

    // Einheit 2 — Familie & Grundlagen
    { category: 'Vokabeln', title: 'Vokabeln: Zahlen, Farben, Familie', level: 'A1', type: 'vocab', href: '/vocab/A1', duration: '20 Min' },
    { category: 'Grammatik', title: 'Grammatik: Artikel (der, die, das)', level: 'A1', type: 'grammar', href: '/grammatik', duration: '25 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Familie & Personen', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('Familie')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Grundlagen (SVO)', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('Grundsätze')}`, duration: '15 Min' },

    // Einheit 3 — Alltag & Verben im Präsens
    { category: 'Vokabeln', title: 'Vokabeln: Berufe & Alltag', level: 'A1', type: 'vocab', href: '/vocab/A1', duration: '20 Min' },
    { category: 'Grammatik', title: 'Grammatik: Verben im Präsens', level: 'A1', type: 'grammar', href: '/grammatik', duration: '30 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Verben im Präsens', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('Verben')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: haben (ich habe, du hast...)', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('haben')}`, duration: '15 Min' },

    // Einheit 4 — Fragen & Verneinung
    { category: 'Grammatik', title: 'Grammatik: Fragen stellen', level: 'A1', type: 'grammar', href: '/grammatik', duration: '20 Min' },
    { category: 'Grammatik', title: 'Grammatik: Verneinung (nicht / kein)', level: 'A1', type: 'grammar', href: '/grammatik', duration: '20 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: W-Fragen', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('W-Fragen')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Ja/Nein-Fragen', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('Ja/Nein-Fragen')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Verneinung (nicht/kein)', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('Negation')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Im Café & Einkaufen', level: 'A1', type: 'redemittel', href: '/redemittel/A1', duration: '15 Min' },

    // Einheit 5 — Essen, Wohnen, Zahlen & Zeit
    { category: 'Vokabeln', title: 'Vokabeln: Essen & Trinken', level: 'A1', type: 'vocab', href: '/vocab/A1', duration: '20 Min' },
    { category: 'Vokabeln', title: 'Vokabeln: Wohnen & Möbel', level: 'A1', type: 'vocab', href: '/vocab/A1', duration: '20 Min' },
    { category: 'Grammatik', title: 'Grammatik: Zahlen & Datum', level: 'A1', type: 'grammar', href: '/grammatik', duration: '20 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Zahlen', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('Zahlen')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Zeit & Datum', level: 'A1', type: 'satzstellung', href: `/ueben/satzstellung?level=A1&topic=${encodeURIComponent('Zeit')}`, duration: '15 Min' },

    // Einheit 6 — Schreiben & Hören
    { category: 'Schreiben', title: 'Schreiben: Formulare ausfüllen (W01–W05)', level: 'A1', type: 'writing', href: '/ueben/schreiben', duration: '30 Min' },
    { category: 'Schreiben', title: 'Schreiben: Kurze E-Mails & Nachrichten (W06–W10)', level: 'A1', type: 'writing', href: '/ueben/schreiben', duration: '30 Min' },
    { category: 'Hören', title: 'Hören: Kurze Gespräche (Teil 1)', level: 'A1', type: 'listening', href: '/ueben/hoeren', duration: '25 Min' },
    { category: 'Hören', title: 'Hören: Ansagen & Nachrichten (Teil 2+3)', level: 'A1', type: 'listening', href: '/ueben/hoeren', duration: '25 Min' },

    // Einheit 7 — Lesen, Sprechen & Konversation
    { category: 'Lesen', title: 'Leseverstehen: Schilder & Anzeigen', level: 'A1', type: 'reading', href: '/ueben/lesen', duration: '20 Min' },
    { category: 'Lesen', title: 'Leseverstehen: Kurzinformationen', level: 'A1', type: 'reading', href: '/ueben/lesen', duration: '20 Min' },
    { category: 'Sprechen', title: 'Sprechen: Sich vorstellen (Teil 1)', level: 'A1', type: 'speaking', href: '/ueben/sprechen', duration: '20 Min' },
    { category: 'Sprechen', title: 'Sprechen: Fragen & Bitten (Teil 2+3)', level: 'A1', type: 'speaking', href: '/ueben/sprechen', duration: '20 Min' },
    { category: 'Konversation', title: 'Konversation: Im Café & Beim Bäcker', level: 'A1', type: 'konversation', href: '/ueben/konversation', duration: '15 Min' },

    // Einheit 8 — Wiederholung & Prüfung
    { category: 'Karteikarten', title: 'Karteikarten: Vokabelwiederholung A1', level: 'A1', type: 'vocab', href: '/ueben/karteikarten', duration: '20 Min' },
    { category: 'Quiz', title: 'Quiz: Vokabel-Test A1', level: 'A1', type: 'vocab', href: '/ueben/quiz', duration: '15 Min' },
    { category: 'Grammatik-Quiz', title: 'Grammatik-Quiz: A1-Prüfung simulieren', level: 'A1', type: 'grammar', href: '/ueben/grammatik-quiz', duration: '30 Min' },
  ],
  A2: [
    // Einheit 1 — Reisen, Verkehr & Präpositionen
    { category: 'Vokabeln', title: 'Vokabeln: Reisen & Verkehr', level: 'A2', type: 'vocab', href: '/vocab/A2', duration: '20 Min' },
    { category: 'Grammatik', title: 'Grammatik: Präpositionen (Dativ, Akkusativ)', level: 'A2', type: 'grammar', href: '/grammatik', duration: '25 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Dativ', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('Dativ')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Präpositionen', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('Präpositionen')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Am Telefon', level: 'A2', type: 'redemittel', href: '/redemittel/A2', duration: '15 Min' },

    // Einheit 2 — Arbeit, Perfekt & Modalverben
    { category: 'Vokabeln', title: 'Vokabeln: Arbeit & Beruf', level: 'A2', type: 'vocab', href: '/vocab/A2', duration: '20 Min' },
    { category: 'Grammatik', title: 'Grammatik: Perfekt & Modalverben', level: 'A2', type: 'grammar', href: '/grammatik', duration: '30 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Perfekt', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('Perfekt')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Modalverben', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('Modalverben')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Trennbare Verben', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('Trennbare Verben')}`, duration: '15 Min' },

    // Einheit 3 — Freizeit & Vergleiche
    { category: 'Vokabeln', title: 'Vokabeln: Freizeit & Hobbys', level: 'A2', type: 'vocab', href: '/vocab/A2', duration: '20 Min' },
    { category: 'Grammatik', title: 'Grammatik: Adjektive & Komparation', level: 'A2', type: 'grammar', href: '/grammatik', duration: '25 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Komparativ', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('Komparativ')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Meinungen äußern', level: 'A2', type: 'redemittel', href: '/redemittel/A2', duration: '15 Min' },

    // Einheit 4 — Gesundheit & Nebensätze (weil/dass/wenn)
    { category: 'Vokabeln', title: 'Vokabeln: Gesundheit & Körper', level: 'A2', type: 'vocab', href: '/vocab/A2', duration: '20 Min' },
    { category: 'Grammatik', title: 'Grammatik: Konjunktionen (weil, dass, wenn)', level: 'A2', type: 'grammar', href: '/grammatik', duration: '25 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Konnektoren (weil, dass, wenn...)', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('Konnektoren')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Planung & Vorschläge', level: 'A2', type: 'redemittel', href: '/redemittel/A2', duration: '15 Min' },

    // Einheit 5 — Einkaufen & Satzbau
    { category: 'Vokabeln', title: 'Vokabeln: Einkaufen & Geld', level: 'A2', type: 'vocab', href: '/vocab/A2', duration: '20 Min' },
    { category: 'Grammatik', title: 'Grammatik: Satzbau & Nebensätze', level: 'A2', type: 'grammar', href: '/grammatik', duration: '30 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: TeKaMoLo (Wortstellung Mittelfeld)', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('TeKaMoLo')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Infinitiv mit zu', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('Infinitiv mit zu')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Imperativ', level: 'A2', type: 'satzstellung', href: `/ueben/satzstellung?level=A2&topic=${encodeURIComponent('Imperativ')}`, duration: '15 Min' },

    // Einheit 6 — Schreiben & Hören
    { category: 'Schreiben', title: 'Schreiben: Formelle E-Mails (W20–W30)', level: 'A2', type: 'writing', href: '/ueben/schreiben', duration: '35 Min' },
    { category: 'Schreiben', title: 'Schreiben: Beschreibungen & Berichte (W31–W40)', level: 'A2', type: 'writing', href: '/ueben/schreiben', duration: '35 Min' },
    { category: 'Hören', title: 'Hören: Dialoge & Radiobeiträge', level: 'A2', type: 'listening', href: '/ueben/hoeren', duration: '30 Min' },
    { category: 'Hören', title: 'Hören: Prüfungssatz A2 (vollständig)', level: 'A2', type: 'listening', href: '/ueben/hoeren', duration: '40 Min' },

    // Einheit 7 — Lesen, Sprechen & Konversation
    { category: 'Lesen', title: 'Leseverstehen: Anzeigen & Zuordnung', level: 'A2', type: 'reading', href: '/ueben/lesen', duration: '25 Min' },
    { category: 'Lesen', title: 'Leseverstehen: Briefe & E-Mails', level: 'A2', type: 'reading', href: '/ueben/lesen', duration: '25 Min' },
    { category: 'Sprechen', title: 'Sprechen: Gemeinsam planen', level: 'A2', type: 'speaking', href: '/ueben/sprechen', duration: '20 Min' },
    { category: 'Sprechen', title: 'Sprechen: Auf Aussagen reagieren', level: 'A2', type: 'speaking', href: '/ueben/sprechen', duration: '20 Min' },
    { category: 'Konversation', title: 'Konversation: Wohnungssuche & Arzttermin', level: 'A2', type: 'konversation', href: '/ueben/konversation', duration: '20 Min' },

    // Einheit 8 — Wiederholung & Prüfung
    { category: 'Quiz', title: 'Quiz: Vokabel-Test A2', level: 'A2', type: 'vocab', href: '/ueben/quiz', duration: '15 Min' },
    { category: 'Grammatik-Quiz', title: 'Grammatik-Quiz: A2-Prüfung simulieren', level: 'A2', type: 'grammar', href: '/ueben/grammatik-quiz', duration: '30 Min' },
  ],
  B1: [
    // Einheit 1 — Gesellschaft, Meinungen & Konnektoren
    { category: 'Vokabeln', title: 'Vokabeln: Gesellschaft & Politik', level: 'B1', type: 'vocab', href: '/vocab/B1', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Kausale & konzessive Konnektoren', level: 'B1', type: 'grammar', href: '/grammatik', duration: '30 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Konnektoren (deshalb, trotzdem...)', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Konnektoren')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: weil-Sätze', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('weil-Satz')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Argumentieren & Debattieren', level: 'B1', type: 'redemittel', href: '/redemittel/B1', duration: '20 Min' },

    // Einheit 2 — Wünsche, Höflichkeit & Konjunktiv II
    { category: 'Vokabeln', title: 'Vokabeln: Gesundheit & Lifestyle', level: 'B1', type: 'vocab', href: '/vocab/B1', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Konjunktiv II (Höflichkeit)', level: 'B1', type: 'grammar', href: '/grammatik', duration: '30 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Konjunktiv II', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Konjunktiv II')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: wenn-Sätze', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('wenn-Satz')}`, duration: '15 Min' },

    // Einheit 3 — Umwelt, Passiv & Relativsätze
    { category: 'Vokabeln', title: 'Vokabeln: Umwelt & Natur', level: 'B1', type: 'vocab', href: '/vocab/B1', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Passiv & Relativsätze', level: 'B1', type: 'grammar', href: '/grammatik', duration: '35 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Passiv', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Passiv')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Relativsätze', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Relativsatz')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: dass-Sätze', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('dass-Satz')}`, duration: '15 Min' },

    // Einheit 4 — Wirtschaft & Partizipialkonstruktionen
    { category: 'Vokabeln', title: 'Vokabeln: Wirtschaft & Arbeitswelt', level: 'B1', type: 'vocab', href: '/vocab/B1', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Partizipialkonstruktionen', level: 'B1', type: 'grammar', href: '/grammatik', duration: '30 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Partizipialkonstruktionen', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Partizipialkonstruktionen')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Infinitiv mit zu', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Infinitiv mit zu')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Formelle Korrespondenz', level: 'B1', type: 'redemittel', href: '/redemittel/B1', duration: '20 Min' },

    // Einheit 5 — Medien, Berichte & indirekte Rede
    { category: 'Vokabeln', title: 'Vokabeln: Medien & Technologie', level: 'B1', type: 'vocab', href: '/vocab/B1', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Indirekte Rede', level: 'B1', type: 'grammar', href: '/grammatik', duration: '30 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: ob-Sätze (indirekte Fragen)', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('ob-Satz')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Finalsätze (um...zu, damit)', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Finalsätze')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Temporalsätze (als, wenn, bevor...)', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Temporalsätze')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Doppelkonnektoren', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Doppelkonnektoren')}`, duration: '15 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Vergleichssätze (je...desto)', level: 'B1', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Vergleichssätze')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Präsentationen & Diskussionen', level: 'B1', type: 'redemittel', href: '/redemittel/B1', duration: '20 Min' },

    // Einheit 6 — Schreiben
    { category: 'Schreiben', title: 'Schreiben: Formeller Brief (180 Wörter)', level: 'B1', type: 'writing', href: '/ueben/schreiben', duration: '45 Min' },
    { category: 'Schreiben', title: 'Schreiben: Argumentation & Meinungstext', level: 'B1', type: 'writing', href: '/ueben/schreiben', duration: '45 Min' },
    { category: 'Schreiben', title: 'Schreiben: Beschwerde & Anfrage', level: 'B1', type: 'writing', href: '/ueben/schreiben', duration: '40 Min' },

    // Einheit 7 — Hören & Lesen
    { category: 'Hören', title: 'Hören: Radiobeitrag & Interview', level: 'B1', type: 'listening', href: '/ueben/hoeren', duration: '35 Min' },
    { category: 'Hören', title: 'Hören: Prüfungssatz B1 (Teil 1–4)', level: 'B1', type: 'listening', href: '/ueben/hoeren', duration: '50 Min' },
    { category: 'Lesen', title: 'Leseverstehen: Zeitungsartikel & Zuordnung', level: 'B1', type: 'reading', href: '/ueben/lesen', duration: '35 Min' },
    { category: 'Lesen', title: 'Leseverstehen: Lückentext & Briefe', level: 'B1', type: 'reading', href: '/ueben/lesen', duration: '35 Min' },

    // Einheit 8 — Sprechen, Konversation & Prüfung
    { category: 'Sprechen', title: 'Sprechen: Kurzpräsentation (Teil 2)', level: 'B1', type: 'speaking', href: '/ueben/sprechen', duration: '25 Min' },
    { category: 'Sprechen', title: 'Sprechen: Gemeinsam planen & Diskussion', level: 'B1', type: 'speaking', href: '/ueben/sprechen', duration: '25 Min' },
    { category: 'Konversation', title: 'Konversation: Homeoffice & gesellschaftl. Themen', level: 'B1', type: 'konversation', href: '/ueben/konversation', duration: '25 Min' },
    { category: 'Grammatik-Quiz', title: 'Grammatik-Quiz: B1-Prüfung simulieren', level: 'B1', type: 'grammar', href: '/ueben/grammatik-quiz', duration: '40 Min' },
  ],

  B2: [
    // Einheit 1 — Kultur, Medien & erweiterte Konnektoren
    { category: 'Vokabeln', title: 'Vokabeln: Kultur & Medienkonsum', level: 'B2', type: 'vocab', href: '/vocab/B2', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Doppelkonnektoren, Modalpartikeln & Nominalstil', level: 'B2', type: 'grammar', href: '/grammatik', duration: '35 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Doppelkonnektoren (Vertiefung)', level: 'B2', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Doppelkonnektoren')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Meinung äußern & begründen', level: 'B2', type: 'redemittel', href: '/redemittel/B2', duration: '20 Min' },

    // Einheit 2 — Arbeitswelt, Bewerbung & indirekte Rede
    { category: 'Vokabeln', title: 'Vokabeln: Arbeitswelt & Arbeitsumfeld', level: 'B2', type: 'vocab', href: '/vocab/B2', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Indirekte Rede (Konjunktiv I)', level: 'B2', type: 'grammar', href: '/grammatik', duration: '35 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: dass-Sätze (Vertiefung)', level: 'B2', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('dass-Satz')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Bewerbung & formelle Kommunikation', level: 'B2', type: 'redemittel', href: '/redemittel/B2', duration: '20 Min' },

    // Einheit 3 — Gesellschaft & Passiv
    { category: 'Vokabeln', title: 'Vokabeln: Gesellschaft & soziales Leben', level: 'B2', type: 'vocab', href: '/vocab/B2', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Passiv — Vorgangs-, Zustandspassiv & Passiversatz', level: 'B2', type: 'grammar', href: '/grammatik', duration: '35 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Passiv (Vertiefung)', level: 'B2', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Passiv')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Probleme beschreiben & Lösungen vorschlagen', level: 'B2', type: 'redemittel', href: '/redemittel/B2', duration: '20 Min' },

    // Einheit 4 — Wissenschaft & Nebensätze
    { category: 'Vokabeln', title: 'Vokabeln: Wissenschaft & Bildung', level: 'B2', type: 'vocab', href: '/vocab/B2', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Kausale, konzessive, finale & modale Nebensätze', level: 'B2', type: 'grammar', href: '/grammatik', duration: '35 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Finalsätze (Vertiefung)', level: 'B2', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Finalsätze')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Hypothesen & Bedingungen ausdrücken', level: 'B2', type: 'redemittel', href: '/redemittel/B2', duration: '20 Min' },

    // Einheit 5 — Umwelt & Konjunktiv II
    { category: 'Vokabeln', title: 'Vokabeln: Umwelt & Klimawandel', level: 'B2', type: 'vocab', href: '/vocab/B2', duration: '25 Min' },
    { category: 'Grammatik', title: 'Grammatik: Konjunktiv II — Vertiefung (Wünsche, Hypothesen, würde + Infinitiv)', level: 'B2', type: 'grammar', href: '/grammatik', duration: '35 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Konjunktiv II (Vertiefung)', level: 'B2', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Konjunktiv II')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Verhandeln & Kompromisse finden', level: 'B2', type: 'redemittel', href: '/redemittel/B2', duration: '20 Min' },

    // Einheit 6 — Texte zusammenfassen & Partizipialkonstruktionen
    { category: 'Grammatik', title: 'Grammatik: Partizip I/II als Adjektiv & Infinitivkonstruktionen', level: 'B2', type: 'grammar', href: '/grammatik', duration: '35 Min' },
    { category: 'Satzstellung', title: 'Satzstellung: Partizipialkonstruktionen (Vertiefung)', level: 'B2', type: 'satzstellung', href: `/ueben/satzstellung?level=B1&topic=${encodeURIComponent('Partizipialkonstruktionen')}`, duration: '15 Min' },
    { category: 'Redemittel', title: 'Redemittel: Texte zusammenfassen & referieren', level: 'B2', type: 'redemittel', href: '/redemittel/B2', duration: '20 Min' },
    { category: 'Redemittel', title: 'Redemittel: Vor- und Nachteile abwägen', level: 'B2', type: 'redemittel', href: '/redemittel/B2', duration: '20 Min' },

    // Einheit 7 — Schreiben & Hören
    { category: 'Schreiben', title: 'Schreiben: Stellungnahme & Erörterung', level: 'B2', type: 'writing', href: '/ueben/schreiben', duration: '45 Min' },
    { category: 'Schreiben', title: 'Schreiben: Formeller Bericht & Beschwerde', level: 'B2', type: 'writing', href: '/ueben/schreiben', duration: '45 Min' },
    { category: 'Hören', title: 'Hören: Vorträge, Interviews & Diskussionen', level: 'B2', type: 'listening', href: '/ueben/hoeren', duration: '40 Min' },
    { category: 'Hören', title: 'Hören: Prüfungssatz B2 (vollständig)', level: 'B2', type: 'listening', href: '/ueben/hoeren', duration: '50 Min' },

    // Einheit 8 — Lesen, Sprechen, Konversation & Prüfung
    { category: 'Lesen', title: 'Leseverstehen: Kommentare & komplexe Sachtexte', level: 'B2', type: 'reading', href: '/ueben/lesen', duration: '40 Min' },
    { category: 'Lesen', title: 'Leseverstehen: Prüfungssatz B2 (Teil 1–4)', level: 'B2', type: 'reading', href: '/ueben/lesen', duration: '45 Min' },
    { category: 'Sprechen', title: 'Sprechen: Podiumsdiskussion & Argumentation', level: 'B2', type: 'speaking', href: '/ueben/sprechen', duration: '30 Min' },
    { category: 'Konversation', title: 'Konversation: Aktuelle Themen & Streitgespräche', level: 'B2', type: 'konversation', href: '/ueben/konversation', duration: '25 Min' },
    { category: 'Redemittel', title: 'Redemittel: Zustimmen & widersprechen', level: 'B2', type: 'redemittel', href: '/redemittel/B2', duration: '20 Min' },
    { category: 'Grammatik-Quiz', title: 'Grammatik-Quiz: B2-Prüfung simulieren', level: 'B2', type: 'grammar', href: '/ueben/grammatik-quiz', duration: '40 Min' },
  ],
};

function generatePlan(config: PlanConfig): PlanTask[] {
  const tasks = TASK_TEMPLATES[config.level];
  const totalWeeks = config.months * 4;
  const tasksPerWeek = Math.ceil(tasks.length / totalWeeks);

  return tasks.map((t, i) => ({
    ...t,
    id: `${config.level}_${i}`,
    week: Math.floor(i / tasksPerWeek) + 1,
  }));
}

/* ─── Main page ─── */
export default function LernplanPage() {
  const { user } = useAuth();
  const uid = user?.uid ?? 'guest';
  const storageKey = `lernplan_${uid}`;

  const [config, setConfig] = useState<PlanConfig>({ level: 'A1', months: 2 });
  const [done, setDone] = useState<Set<string>>(new Set());
  const [activeWeek, setActiveWeek] = useState(1);
  const [viewMode, setViewMode] = useState<'weekly' | 'all'>('weekly');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, [storageKey]);

  const plan = useMemo(() => generatePlan(config), [config]);
  const totalWeeks = config.months * 4;

  const weekGroups = useMemo(() => {
    const groups: Record<number, PlanTask[]> = {};
    for (let w = 1; w <= totalWeeks; w++) groups[w] = [];
    plan.forEach(t => { if (groups[t.week]) groups[t.week].push(t); });
    return groups;
  }, [plan, totalWeeks]);

  const weekDone = (week: number) => weekGroups[week]?.filter(t => done.has(t.id)).length ?? 0;
  const weekTotal = (week: number) => weekGroups[week]?.length ?? 0;

  const toggleDone = (id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  };

  const totalDone = done.size;
  const planTotal = plan.length;
  const pct = planTotal > 0 ? Math.round((totalDone / planTotal) * 100) : 0;

  const displayWeeks = viewMode === 'weekly' ? [activeWeek] : Array.from({ length: totalWeeks }, (_, i) => i + 1);

  const MONTHS_OPTIONS: { value: Timeline; label: string }[] = [
    { value: 1, label: '1 Monat (schnell)' },
    { value: 2, label: '2 Monate (empfohlen A1)' },
    { value: 3, label: '3 Monate (empfohlen A2)' },
    { value: 4, label: '4 Monate (empfohlen B1)' },
    { value: 5, label: '5 Monate (empfohlen B2 / intensiv)' },
  ];

  const levelColor = LEVEL_COLOR[config.level];

  return (
    <>
      <Topbar title="Lernplan" />
      <div style={{ padding: '24px 40px', maxWidth: 920, margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            📅 Persönlicher Lernplan
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
            Wähle dein Niveau und Zeitrahmen — der Plan verteilt alle Übungen gleichmäßig auf deine Wochen.
            Hake ab, was du erledigt hast, und verfolge deinen Fortschritt.
          </p>
        </div>

        {/* Config */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>
              Ziel-Niveau
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['A1', 'A2', 'B1', 'B2'] as Level[]).map(lv => (
                <button
                  key={lv}
                  onClick={() => { setConfig(c => ({ ...c, level: lv })); setDone(new Set()); setActiveWeek(1); }}
                  className={`chip${config.level === lv ? ' on' : ''}`}
                  style={config.level === lv ? { background: LEVEL_COLOR[lv], borderColor: LEVEL_COLOR[lv], color: '#fff' } : {}}
                >
                  <span className={`lvl lvl-${lv.toLowerCase()}`}>{lv}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>
              Zeitrahmen
            </div>
            <select
              value={config.months}
              onChange={e => { setConfig(c => ({ ...c, months: Number(e.target.value) as Timeline })); setActiveWeek(1); }}
              style={{ height: 34, border: '1px solid var(--border)', borderRadius: 7, padding: '0 10px', fontSize: 13, background: 'var(--bg)', color: 'var(--ink)', fontFamily: 'inherit', cursor: 'pointer', width: '100%' }}
            >
              {MONTHS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, boxShadow: 'var(--sh)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 28, fontWeight: 800, color: levelColor }}>{pct}%</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                {totalDone} / {planTotal} Aufgaben erledigt
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                Niveau {config.level} · {config.months} Monat{config.months > 1 ? 'e' : ''} · {totalWeeks} Wochen
              </div>
            </div>
            {totalDone > 0 && (
              <button
                onClick={() => { setDone(new Set()); try { localStorage.removeItem(storageKey); } catch { /* ignore */ } }}
                className="btn-secondary"
                style={{ marginLeft: 'auto', fontSize: 11 }}
              >
                ↺ Zurücksetzen
              </button>
            )}
          </div>
          <div style={{ background: 'var(--border)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: levelColor, borderRadius: 100, transition: 'width .4s ease' }} />
          </div>
        </div>

        {/* Week nav + view toggle */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              className="btn-secondary"
              style={{ padding: '5px 10px' }}
              onClick={() => setActiveWeek(w => Math.max(1, w - 1))}
              disabled={activeWeek === 1 || viewMode === 'all'}
            >←</button>
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: 'center' }}>
              {viewMode === 'all' ? `Alle ${totalWeeks} Wochen` : `Woche ${activeWeek} / ${totalWeeks}`}
            </span>
            <button
              className="btn-secondary"
              style={{ padding: '5px 10px' }}
              onClick={() => setActiveWeek(w => Math.min(totalWeeks, w + 1))}
              disabled={activeWeek === totalWeeks || viewMode === 'all'}
            >→</button>
          </div>

          <button
            className={`chip${viewMode === 'weekly' ? ' on' : ''}`}
            onClick={() => setViewMode('weekly')}
          >Wochenansicht</button>
          <button
            className={`chip${viewMode === 'all' ? ' on' : ''}`}
            onClick={() => setViewMode('all')}
          >Gesamtansicht</button>

          {/* Category legend */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(TYPE_ICONS).map(([type, icon]) => (
              <span key={type} style={{ fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 3, color: TYPE_COLORS[type] }}>
                <span>{icon}</span>
                <span style={{ fontWeight: 600 }}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Week mini-nav (only in weekly view) */}
        {viewMode === 'weekly' && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => {
              const wDone = weekDone(w);
              const wTotal = weekTotal(w);
              const complete = wDone === wTotal && wTotal > 0;
              return (
                <button
                  key={w}
                  onClick={() => setActiveWeek(w)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: '1.5px solid',
                    borderColor: activeWeek === w ? levelColor : complete ? 'var(--green-bd)' : 'var(--border)',
                    background: activeWeek === w ? levelColor : complete ? 'var(--green-bg)' : 'var(--bg)',
                    color: activeWeek === w ? '#fff' : complete ? 'var(--green)' : 'var(--muted)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all .15s',
                  }}
                  title={`Woche ${w}: ${wDone}/${wTotal}`}
                >
                  {complete ? '✓' : w}
                </button>
              );
            })}
          </div>
        )}

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {displayWeeks.map(week => {
            const tasks = weekGroups[week] ?? [];
            const wDone = tasks.filter(t => done.has(t.id)).length;
            const allDone = wDone === tasks.length && tasks.length > 0;
            return (
              <div key={week}>
                {/* Week header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    fontFamily: 'var(--font-lora)', fontSize: 15, fontWeight: 700,
                    color: allDone ? 'var(--green)' : 'var(--ink)',
                  }}>
                    {allDone ? '✅' : '📅'} Woche {week}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    {wDone}/{tasks.length} erledigt
                  </div>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${tasks.length > 0 ? (wDone / tasks.length) * 100 : 0}%`, height: '100%', background: allDone ? 'var(--green)' : levelColor, borderRadius: 100, transition: 'width .3s' }} />
                  </div>
                </div>

                {/* Tasks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tasks.map(task => {
                    const isDone = done.has(task.id);
                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleDone(task.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px',
                          background: isDone ? 'var(--green-bg)' : 'var(--bg)',
                          border: `1px solid ${isDone ? 'var(--green-bd)' : 'var(--border)'}`,
                          borderRadius: 10, cursor: 'pointer', transition: 'all .15s',
                          boxShadow: 'var(--sh)',
                        }}
                        onMouseEnter={e => { if (!isDone) (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue-bd)'; }}
                        onMouseLeave={e => { if (!isDone) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          border: `2px solid ${isDone ? 'var(--green)' : 'var(--border2)'}`,
                          background: isDone ? 'var(--green)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 13, transition: 'all .15s',
                        }}>
                          {isDone ? '✓' : ''}
                        </div>

                        {/* Type icon */}
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICONS[task.type]}</span>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 600,
                            color: isDone ? 'var(--green)' : 'var(--ink)',
                            textDecoration: isDone ? 'line-through' : 'none',
                            opacity: isDone ? 0.75 : 1,
                          }}>{task.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                            {task.category} · {task.duration}
                          </div>
                        </div>

                        {/* Level + link */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span className={`lvl lvl-${task.level.toLowerCase()}`}>{task.level}</span>
                          {task.href && !isDone && (
                            <a
                              href={task.href}
                              onClick={e => e.stopPropagation()}
                              style={{
                                fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
                                background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-bd)',
                                textDecoration: 'none', transition: 'all .15s',
                              }}
                            >
                              Öffnen →
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion banner */}
        {pct === 100 && planTotal > 0 && (
          <div style={{ marginTop: 24, padding: '20px 24px', background: 'var(--green-bg)', border: '2px solid var(--green-bd)', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>
              Plan abgeschlossen!
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
              Du hast alle {planTotal} Aufgaben für Niveau {config.level} erledigt. Herzlichen Glückwunsch!
            </div>
          </div>
        )}
      </div>
    </>
  );
}
