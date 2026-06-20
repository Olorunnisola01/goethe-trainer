'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/context/LanguageContext';
import { Topbar } from '@/components/layout/Topbar';
import { HomeStats } from '@/components/gamification/HomeStats';
import { QuickReview } from '@/components/gamification/QuickReview';

const levelCards = [
  { level: 'A1', color: 'green', icon: '🌱', labelKey: 'home.level.A1', words: 720 },
  { level: 'A2', color: 'blue',  icon: '📘', labelKey: 'home.level.A2', words: 666 },
  { level: 'B1', color: 'violet', icon: '🏆', labelKey: 'home.level.B1', words: 1339 },
  { level: 'B2', color: 'amber', icon: '🎓', labelKey: 'home.level.B2', words: 2753 },
];
const levelDesc: Record<string, string> = {
  A1: 'Grundlegende Kommunikation meistern: Familie, Alltag, einfache Sätze.',
  A2: 'Einfache Situationen bewältigen: Einkaufen, Reisen, Beziehungen.',
  B1: 'Komplexe Themen verstehen: Arbeit, Gesellschaft, Meinungen äußern.',
  B2: 'Differenziert ausdrücken: Beruf, Umwelt, Medien, Gesellschaft.',
};

const featureCards = [
  { href: '/ueben/karteikarten', icon: '🃏', titleKey: 'home.feat.flashcards', descKey: 'home.feat.flashcards.d', protected: true },
  { href: '/ueben/quiz',         icon: '🎯', titleKey: 'home.feat.quiz', descKey: 'home.feat.quiz.d', protected: true },
  { href: '/ueben/schreiben',    icon: '✍️', titleKey: 'home.feat.writing', descKey: 'home.feat.writing.d', protected: true, badge: '200' },
  { href: '/ueben/lesen',        icon: '📖', titleKey: 'home.feat.reading', descKey: 'home.feat.reading.d', protected: true, badge: '12' },
  { href: '/pruefungsinfo',      icon: '📋', titleKey: 'home.feat.exam', descKey: 'home.feat.exam.d' },
  { href: '/favoriten',          icon: '⭐', titleKey: 'home.feat.fav', descKey: 'home.feat.fav.d', protected: true },
];

const colorMap: Record<string, string> = {
  green:  'border-green-200 bg-green-50 text-green-800',
  blue:   'border-blue-200 bg-blue-50 text-blue-800',
  violet: 'border-violet-200 bg-violet-50 text-violet-800',
  amber:  'border-amber-200 bg-amber-50 text-amber-800',
};

export function HomeClient() {
  const { user } = useAuth();
  const { t } = useT();

  return (
    <>
      <Topbar title={t('nav.home')} />

      <div className="flex-1 p-7 max-w-5xl">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            {t('home.welcome')}{user ? `, ${user.displayName?.split(' ')[0] ?? t('home.welcomeBack')}` : ''}! 👋
          </h1>
          <p className="text-gray-500 text-base">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Gamification: streak · XP · daily goal (signed-in only) */}
        {user && <HomeStats />}

        {/* Quick review micro-quiz (signed-in only) */}
        {user && <QuickReview />}

        {/* Level Cards */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('home.vocabByLevel')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {levelCards.map(({ level, color, icon, labelKey, words }) => (
              <Link
                key={level}
                href={`/vocab/${level}`}
                className={`block rounded-xl border p-4 transition-all hover:shadow-md ${colorMap[color]}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-bold text-lg">{level}</span>
                  <span className="text-xs font-semibold ml-auto">{words} {t('home.words')}</span>
                </div>
                <div className="font-semibold text-sm mb-1">{t(labelKey)}</div>
                <div className="text-xs opacity-75 leading-relaxed">{levelDesc[level]}</div>
                {!user && <div className="mt-2 text-xs opacity-50">{t('common.signInRequired')}</div>}
              </Link>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t('home.practiceAreas')}</h2>
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
                <div className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition-colors">{t(card.titleKey)}</div>
                <div className="text-xs text-gray-400">{t(card.descKey)}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
