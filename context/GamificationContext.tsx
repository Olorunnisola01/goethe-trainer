'use client';

/* ──────────────────────────────────────────────────────────────────────────
   GamificationContext — single source of truth for streak / XP / rank /
   achievements / daily goal / weak-words / activity history / SRS.

   Persists to localStorage immediately and mirrors to Firestore
   (gamification/{uid}) debounced when signed in. Surfaces lightweight toasts
   when XP is gained, the daily goal is hit, or an achievement unlocks.
   ────────────────────────────────────────────────────────────────────────── */

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import {
  GameState, emptyGameState, rollToToday, recordActivity, reviewSrs, newSrsCard,
  ActivityType, Achievement, rankForXp, SrsCard, ACHIEVEMENTS,
} from '@/lib/gamification';

export interface Toast { id: number; kind: 'xp' | 'achievement' | 'goal' | 'rank'; icon: string; title: string; sub?: string; }

interface GamificationValue {
  state: GameState;
  ready: boolean;
  /** Record one exercise result (awards XP, updates streak/goal/weak-words/achievements). */
  record: (opts: { type: ActivityType; correct: boolean; word?: { de: string; en: string } }) => void;
  /** SM-2 review for a flashcard; quality 0 (again) / 3 (hard) / 4 (good) / 5 (easy). */
  reviewCard: (key: string, quality: number) => void;
  getCard: (key: string) => SrsCard;
  setDailyGoal: (n: number) => void;
  markPerfectQuiz: () => void;
  completeOnboarding: (cefr: string | null, interests: string[], goal: number) => void;
  resetWeakWord: (key: string) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
}

const Ctx = createContext<GamificationValue | null>(null);
const LS = (uid: string) => `dlgame_${uid}`;

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? 'guest';
  const [state, setState] = useState<GameState>(emptyGameState);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const cloudReady = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRankIdx = useRef(0);

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  /* Load from localStorage (and roll the streak forward to today). */
  useEffect(() => {
    cloudReady.current = false;
    setReady(false);
    let loaded = emptyGameState();
    try {
      const raw = localStorage.getItem(LS(uid));
      if (raw) loaded = { ...emptyGameState(), ...JSON.parse(raw) };
    } catch { /* ignore */ }
    loaded = rollToToday(loaded);
    prevRankIdx.current = rankForXp(loaded.xp).index;
    setState(loaded);
    setReady(true);
  }, [uid]);

  /* Cloud: pull this user's state on sign-in, keeping whichever is further along. */
  useEffect(() => {
    if (!user) { cloudReady.current = false; return; }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'gamification', user.uid));
        if (cancelled) return;
        if (snap.exists()) {
          const cloud = { ...emptyGameState(), ...(snap.data() as GameState) };
          setState(local => {
            // Cloud wins when it has more XP (the device that practised more).
            const winner = cloud.xp >= local.xp ? cloud : local;
            const rolled = rollToToday(winner);
            prevRankIdx.current = rankForXp(rolled.xp).index;
            return rolled;
          });
        }
        cloudReady.current = true;
      } catch { /* offline — local only */ }
    })();
    return () => { cancelled = true; };
  }, [user]);

  /* Persist: localStorage immediately + Firestore (debounced) when signed in. */
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(LS(uid), JSON.stringify(state)); } catch { /* ignore */ }
    if (!user || !cloudReady.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setDoc(doc(db, 'gamification', user.uid), state).catch(() => { /* keep local */ });
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, ready, uid, user]);

  const record = useCallback<GamificationValue['record']>((opts) => {
    setState(prev => {
      const { state: next, newAchievements, xpGained, goalJustHit } = recordActivity(prev, opts);
      // Toasts (after render, to avoid setState-in-render)
      queueMicrotask(() => {
        pushToast({ kind: 'xp', icon: '✨', title: `+${xpGained} XP` });
        if (goalJustHit) pushToast({ kind: 'goal', icon: '🎯', title: 'Tagesziel erreicht!', sub: `+25 Bonus-XP` });
        const newIdx = rankForXp(next.xp).index;
        if (newIdx > prevRankIdx.current) {
          prevRankIdx.current = newIdx;
          const r = rankForXp(next.xp).rank;
          pushToast({ kind: 'rank', icon: r.icon, title: 'Neue Stufe!', sub: r.name });
        }
        newAchievements.forEach((a: Achievement) =>
          pushToast({ kind: 'achievement', icon: a.icon, title: a.name, sub: a.desc }));
      });
      return next;
    });
  }, [pushToast]);

  const reviewCard = useCallback((key: string, quality: number) => {
    setState(prev => {
      const card = prev.srs[key] ?? newSrsCard();
      return { ...prev, srs: { ...prev.srs, [key]: reviewSrs(card, quality) }, updatedAt: Date.now() };
    });
  }, []);
  const getCard = useCallback((key: string) => state.srs[key] ?? newSrsCard(), [state.srs]);

  const setDailyGoal = useCallback((n: number) =>
    setState(prev => ({ ...prev, dailyGoal: Math.max(1, n), updatedAt: Date.now() })), []);

  const markPerfectQuiz = useCallback(() => setState(prev => {
    const next = { ...prev, perfectQuizzes: prev.perfectQuizzes + 1, updatedAt: Date.now() };
    const newly = ACHIEVEMENTS.filter(a => !next.achievements.includes(a.id) && a.test(next));
    if (newly.length) {
      next.achievements = [...next.achievements, ...newly.map(a => a.id)];
      queueMicrotask(() => newly.forEach(a =>
        pushToast({ kind: 'achievement', icon: a.icon, title: a.name, sub: a.desc })));
    }
    return next;
  }), [pushToast]);

  const completeOnboarding = useCallback((cefr: string | null, interests: string[], goal: number) =>
    setState(prev => ({ ...prev, onboarded: true, cefr, interests, dailyGoal: Math.max(1, goal), updatedAt: Date.now() })), []);

  const resetWeakWord = useCallback((key: string) =>
    setState(prev => { const w = { ...prev.weakWords }; delete w[key]; return { ...prev, weakWords: w }; }), []);

  return (
    <Ctx.Provider value={{
      state, ready, record, reviewCard, getCard, setDailyGoal,
      markPerfectQuiz, completeOnboarding, resetWeakWord, toasts, dismissToast,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGame() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGame must be used within GamificationProvider');
  return ctx;
}
