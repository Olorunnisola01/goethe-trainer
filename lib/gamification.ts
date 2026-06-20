/* ──────────────────────────────────────────────────────────────────────────
   gamification.ts — pure logic for the app's progress & motivation system.

   No React, no I/O — just data shapes and pure functions so it's easy to test
   and reuse. The GamificationContext wires this to localStorage + Firestore.

   Powers: daily streak, XP + rank, achievements, daily goal, weak-words list,
   activity history (for charts), and SM-2 spaced repetition for flashcards.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Date helpers (local-time YYYY-MM-DD) ─────────────────────────────────── */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}
export function addDays(key: string, n: number): string {
  const d = new Date(key + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return todayKey(d);
}

/* ── Activity type → XP earned ────────────────────────────────────────────── */
export type ActivityType =
  | 'quiz' | 'flash' | 'write' | 'read' | 'listen' | 'speak'
  | 'grammar' | 'verb' | 'satz' | 'story' | 'konv' | 'redemittel' | 'other';

export const XP_PER_CORRECT = 10;
export const XP_PER_EXERCISE = 4;     // participation, even if wrong
export const XP_DAILY_GOAL_BONUS = 25;

/* ── Ranks (gamification "Stufe", distinct from CEFR A1/A2/B1) ────────────── */
export interface Rank { name: string; min: number; icon: string; color: string; }
export const RANKS: Rank[] = [
  { name: 'Neuling',         min: 0,     icon: '🌱', color: '#15803d' },
  { name: 'Anfänger',        min: 150,   icon: '📗', color: '#15803d' },
  { name: 'Lernende:r',      min: 500,   icon: '📘', color: '#1d4ed8' },
  { name: 'Kenner:in',       min: 1200,  icon: '📙', color: '#1d4ed8' },
  { name: 'Fortgeschritten', min: 2500,  icon: '🎯', color: '#7c3aed' },
  { name: 'Profi',           min: 5000,  icon: '🏅', color: '#7c3aed' },
  { name: 'Experte:in',      min: 9000,  icon: '🏆', color: '#b45309' },
  { name: 'Meister:in',      min: 15000, icon: '👑', color: '#b45309' },
];
export function rankForXp(xp: number): { rank: Rank; next: Rank | null; intoLevel: number; levelSpan: number; index: number } {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].min) index = i;
  const rank = RANKS[index];
  const next = RANKS[index + 1] ?? null;
  const intoLevel = xp - rank.min;
  const levelSpan = next ? next.min - rank.min : 1;
  return { rank, next, intoLevel, levelSpan, index };
}

/* ── Achievements ─────────────────────────────────────────────────────────── */
export interface Achievement {
  id: string; icon: string; name: string; desc: string;
  test: (s: GameState) => boolean;
}
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps',  icon: '👣', name: 'Erste Schritte',  desc: 'Erste Übung abgeschlossen',          test: s => s.totalExercises >= 1 },
  { id: 'streak-3',     icon: '🔥', name: 'Auf Kurs',        desc: '3 Tage in Folge gelernt',             test: s => s.bestStreak >= 3 },
  { id: 'streak-7',     icon: '🔥', name: 'Eine Woche!',     desc: '7 Tage in Folge gelernt',             test: s => s.bestStreak >= 7 },
  { id: 'streak-30',    icon: '🔥', name: 'Unaufhaltsam',    desc: '30 Tage in Folge gelernt',            test: s => s.bestStreak >= 30 },
  { id: 'words-50',     icon: '📚', name: '50 Wörter',       desc: '50 Vokabeln richtig beantwortet',     test: s => s.totalCorrect >= 50 },
  { id: 'words-250',    icon: '📚', name: '250 Wörter',      desc: '250 richtige Antworten',              test: s => s.totalCorrect >= 250 },
  { id: 'words-1000',   icon: '📚', name: 'Wortschatz-Held', desc: '1000 richtige Antworten',             test: s => s.totalCorrect >= 1000 },
  { id: 'perfect-quiz', icon: '💯', name: 'Volle Punktzahl', desc: 'Ein Quiz ohne Fehler',                test: s => s.perfectQuizzes >= 1 },
  { id: 'rank-profi',   icon: '🏅', name: 'Profi-Stufe',     desc: 'Stufe „Profi" erreicht',              test: s => s.xp >= 5000 },
  { id: 'goal-7',       icon: '🎯', name: 'Zielstrebig',     desc: 'Tagesziel 7×  erreicht',              test: s => s.goalsHit >= 7 },
  { id: 'all-skills',   icon: '🌈', name: 'Allrounder',      desc: 'Jede Übungsart 1× ausprobiert',       test: s => Object.keys(s.skillCounts).length >= 8 },
  { id: 'night-owl',    icon: '🦉', name: 'Nachteule',       desc: 'Nach 22 Uhr gelernt',                 test: s => s.nightOwl },
];

/* ── SM-2 spaced repetition (for Karteikarten) ────────────────────────────── */
export interface SrsCard { ef: number; interval: number; reps: number; due: string; lapses: number; }
export function newSrsCard(): SrsCard { return { ef: 2.5, interval: 0, reps: 0, due: todayKey(), lapses: 0 }; }
/** quality: 0 = again, 3 = hard, 4 = good, 5 = easy */
export function reviewSrs(card: SrsCard, quality: number): SrsCard {
  let { ef, interval, reps, lapses } = card;
  if (quality < 3) {
    reps = 0; interval = 1; lapses += 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ef);
    ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  }
  return { ef, interval, reps, lapses, due: addDays(todayKey(), Math.max(1, interval)) };
}
export function isDue(card: SrsCard, on: string = todayKey()): boolean {
  return daysBetween(card.due, on) >= 0;
}

/* ── Weak words ───────────────────────────────────────────────────────────── */
export interface WeakWord { de: string; en: string; misses: number; hits: number; lastMiss: number; }

/* ── Activity history (one bucket per day) ────────────────────────────────── */
export interface DayActivity { date: string; xp: number; exercises: number; correct: number; total: number; }

/* ── The persisted state ──────────────────────────────────────────────────── */
export interface GameState {
  xp: number;
  streak: number;
  bestStreak: number;
  lastActiveDate: string;       // YYYY-MM-DD of last activity
  dailyGoal: number;            // target exercises/day
  todayDate: string;            // which day todayCount refers to
  todayCount: number;           // exercises completed today
  goalsHit: number;             // # days the daily goal was reached
  totalExercises: number;
  totalCorrect: number;
  perfectQuizzes: number;
  nightOwl: boolean;
  skillCounts: Record<string, number>;   // ActivityType → count
  achievements: string[];                // unlocked ids
  activity: DayActivity[];               // trailing history (≤ 120 days)
  weakWords: Record<string, WeakWord>;   // key = German word
  srs: Record<string, SrsCard>;          // key = German word
  onboarded: boolean;
  cefr: string | null;                   // self-declared A1/A2/B1/B2
  interests: string[];
  updatedAt: number;
}

export function emptyGameState(): GameState {
  return {
    xp: 0, streak: 0, bestStreak: 0, lastActiveDate: '', dailyGoal: 10,
    todayDate: todayKey(), todayCount: 0, goalsHit: 0,
    totalExercises: 0, totalCorrect: 0, perfectQuizzes: 0, nightOwl: false,
    skillCounts: {}, achievements: [], activity: [], weakWords: {}, srs: {},
    onboarded: false, cefr: null, interests: [], updatedAt: Date.now(),
  };
}

/* Roll the streak/today counters forward to `today` (call on load + on activity). */
export function rollToToday(s: GameState, today: string = todayKey()): GameState {
  if (s.todayDate === today) return s;
  const gap = s.lastActiveDate ? daysBetween(s.lastActiveDate, today) : 0;
  // Streak survives if the last active day was today or yesterday; else it resets.
  const streak = (!s.lastActiveDate || gap > 1) ? 0 : s.streak;
  return { ...s, todayDate: today, todayCount: 0, streak };
}

/* Record one exercise result; returns the next state + any newly-unlocked achievements. */
export function recordActivity(
  prev: GameState,
  opts: { type: ActivityType; correct: boolean; word?: { de: string; en: string }; now?: Date },
): { state: GameState; newAchievements: Achievement[]; xpGained: number; goalJustHit: boolean } {
  const now = opts.now ?? new Date();
  const today = todayKey(now);
  let s = rollToToday({ ...prev }, today);

  // XP
  const xpGained = XP_PER_EXERCISE + (opts.correct ? XP_PER_CORRECT : 0);
  s.xp += xpGained;

  // Streak — increment once per new active day
  if (s.lastActiveDate !== today) {
    const gap = s.lastActiveDate ? daysBetween(s.lastActiveDate, today) : 999;
    s.streak = gap === 1 ? s.streak + 1 : 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
  }
  s.lastActiveDate = today;

  // Counters
  s.todayCount += 1;
  s.totalExercises += 1;
  if (opts.correct) s.totalCorrect += 1;
  s.skillCounts = { ...s.skillCounts, [opts.type]: (s.skillCounts[opts.type] ?? 0) + 1 };
  if (now.getHours() >= 22 || now.getHours() < 5) s.nightOwl = true;

  // Daily goal
  let goalJustHit = false;
  if (s.todayCount === s.dailyGoal) { s.goalsHit += 1; s.xp += XP_DAILY_GOAL_BONUS; goalJustHit = true; }

  // Activity history bucket
  const activity = s.activity.slice();
  const last = activity[activity.length - 1];
  if (last && last.date === today) {
    activity[activity.length - 1] = {
      ...last, xp: last.xp + xpGained, exercises: last.exercises + 1,
      correct: last.correct + (opts.correct ? 1 : 0), total: last.total + 1,
    };
  } else {
    activity.push({ date: today, xp: xpGained, exercises: 1, correct: opts.correct ? 1 : 0, total: 1 });
  }
  s.activity = activity.slice(-120);

  // Weak words
  if (opts.word) {
    const key = opts.word.de;
    const w = s.weakWords[key] ?? { de: opts.word.de, en: opts.word.en, misses: 0, hits: 0, lastMiss: 0 };
    const updated: WeakWord = opts.correct
      ? { ...w, hits: w.hits + 1 }
      : { ...w, misses: w.misses + 1, lastMiss: now.getTime() };
    // Drop from the list once it's been answered correctly enough and isn't recently missed.
    const mastered = updated.hits >= updated.misses + 3 && updated.misses > 0;
    s.weakWords = { ...s.weakWords };
    if (mastered) delete s.weakWords[key];
    else s.weakWords[key] = updated;
  }

  s.updatedAt = now.getTime();

  // Achievements
  const newAchievements = ACHIEVEMENTS.filter(a => !s.achievements.includes(a.id) && a.test(s));
  if (newAchievements.length) s.achievements = [...s.achievements, ...newAchievements.map(a => a.id)];

  return { state: s, newAchievements, xpGained, goalJustHit };
}

/* Build a contiguous trailing window of daily activity (fills gaps with zeros). */
export function activityWindow(s: GameState, days: number): DayActivity[] {
  const map = new Map(s.activity.map(a => [a.date, a]));
  const out: DayActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = addDays(todayKey(), -i);
    out.push(map.get(key) ?? { date: key, xp: 0, exercises: 0, correct: 0, total: 0 });
  }
  return out;
}

/* Top weak words, worst-first. */
export function topWeakWords(s: GameState, limit = 30): WeakWord[] {
  return Object.values(s.weakWords)
    .filter(w => w.misses > 0)
    .sort((a, b) => (b.misses - b.hits) - (a.misses - a.hits) || b.lastMiss - a.lastMiss)
    .slice(0, limit);
}
