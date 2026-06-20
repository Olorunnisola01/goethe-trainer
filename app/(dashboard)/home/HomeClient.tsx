'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Topbar } from '@/components/layout/Topbar';
import { HomeStats } from '@/components/gamification/HomeStats';
import { QuickReview } from '@/components/gamification/QuickReview';

const levelCards = [
  { level: 'A1', color: 'green', icon: '🌱', label: 'Anfänger', words: 720,
    desc: 'Grundlegende Kommunikation meistern: Familie, Alltag, einfache Sätze.' },
  { level: 'A2', color: 'blue',  icon: '📘', label: 'Grundkenntnisse', words: 666,
    desc: 'Einfache Situationen bewältigen: Einkaufen, Reisen, Beziehungen.' },
  { level: 'B1', color: 'violet', icon: '🏆', label: 'Fortgeschritten', words: 1339,
    desc: 'Komplexe Themen verstehen: Arbeit, Gesellschaft, Meinungen äußern.' },
  { level: 'B2', color: 'amber', icon: '🎓', label: 'Selbstständig', words: 2753,
    desc: 'Differenziert ausdrücken: Beruf, Umwelt, Medien, Gesellschaft.' },
];

const featureCards = [
  { href: '/ueben/karteikarten', icon: '🃏', title: 'Karteikarten', desc: 'Vokabeln mit Flashcards lernen', protected: true },
  { href: '/ueben/quiz',         icon: '🎯', title: 'Quiz',         desc: 'Wissen testen & Punkte sammeln', protected: true },
  { href: '/ueben/schreiben',    icon: '✍️', title: 'Schreibübungen', desc: '200 geführte Lückentexte A1–B1', protected: true, badge: '200' },
  { href: '/ueben/lesen',        icon: '📖', title: 'Leseverstehen', desc: 'Texte lesen & Fragen beantworten', protected: true, badge: '12' },
  { href: '/pruefungsinfo',      icon: '📋', title: 'Prüfungsinfo', desc: 'Aufbau & Tipps für Goethe-Prüfung' },
  { href: '/favoriten',          icon: '⭐', title: 'Meine Favoriten', desc: 'Gespeicherte Vokabeln üben', protected: true },
];

const colorMap: Record<string, string> = {
  green:  'border-green-200 bg-green-50 text-green-800',
  blue:   'border-blue-200 bg-blue-50 text-blue-800',
  violet: 'border-violet-200 bg-violet-50 text-violet-800',
  amber:  'border-amber-200 bg-amber-50 text-amber-800',
};

export function HomeClient() {
  const { user } = useAuth();

  return (
    <>
      <Topbar title="Startseite" />

      <div className="flex-1 p-7 max-w-5xl">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            Willkommen{user ? `, ${user.displayName?.split(' ')[0] ?? 'zurück'}` : ''}! 👋
          </h1>
          <p className="text-gray-500 text-base">
            Lerne Deutsch von A1 bis B1 — mit Vokabeln, Grammatik, Schreibübungen und mehr.
          </p>
        </div>

        {/* Gamification: streak · XP · daily goal (signed-in only) */}
        {user && <HomeStats />}

        {/* Quick review micro-quiz (signed-in only) */}
        {user && <QuickReview />}

        {/* Level Cards */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Vokabeln nach Level</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {levelCards.map(({ level, color, icon, label, words, desc }) => (
              <Link
                key={level}
                href={`/vocab/${level}`}
                className={`block rounded-xl border p-4 transition-all hover:shadow-md ${colorMap[color]}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-bold text-lg">{level}</span>
                  <span className="text-xs font-semibold ml-auto">{words} Wörter</span>
                </div>
                <div className="font-semibold text-sm mb-1">{label}</div>
                <div className="text-xs opacity-75 leading-relaxed">{desc}</div>
                {!user && <div className="mt-2 text-xs opacity-50">🔒 Anmeldung erforderlich</div>}
              </Link>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Übungsbereiche</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {featureCards.map(card => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{card.icon}</span>
                  {card.badge && (
                    <span className="ml-auto text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{card.badge}</span>
                  )}
                  {card.protected && !user && <span className="ml-auto text-xs text-gray-300">🔒</span>}
                </div>
                <div className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition-colors">{card.title}</div>
                <div className="text-xs text-gray-400">{card.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
