'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProgress, Grade } from '@/types';

const EMPTY_PROGRESS = (): UserProgress => ({
  quiz:     { attempts: 0, correct: 0 },
  gramQuiz: { attempts: 0, correct: 0 },
  flash:    { seen: 0, known: 0 },
  write:    { done: 0, correct: 0, total: 200 },
  read:     { done: 0, correct: 0, total: 12 },
  updatedAt: Date.now(),
});

function storageKey(uid: string) { return `dlprog_${uid}`; }

function pct(a: number, b: number) { return b > 0 ? Math.round((a / b) * 100) : 0; }

function computeOverall(p: UserProgress): number {
  const quiz     = pct(p.quiz.correct,     p.quiz.attempts)     * 0.30;
  const gramQuiz = pct(p.gramQuiz.correct, p.gramQuiz.attempts) * 0.25;
  const flash    = pct(p.flash.known,      p.flash.seen)        * 0.20;
  const write    = pct(p.write.correct,    p.write.done)        * 0.12;
  const read     = pct(p.read.correct,     p.read.done)         * 0.13;
  return Math.round(quiz + gramQuiz + flash + write + read);
}

function computeGrade(overall: number): Grade {
  if (overall >= 90) return 'A';
  if (overall >= 75) return 'B';
  if (overall >= 60) return 'C';
  if (overall >= 45) return 'D';
  if (overall >   0) return 'E';
  return '—';
}

export function useProgress(uid: string | null) {
  const [progress, setProgress] = useState<UserProgress>(EMPTY_PROGRESS());

  useEffect(() => {
    if (!uid) { setProgress(EMPTY_PROGRESS()); return; }
    try {
      const raw = localStorage.getItem(storageKey(uid));
      if (raw) setProgress({ ...EMPTY_PROGRESS(), ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, [uid]);

  const save = useCallback((next: UserProgress) => {
    if (!uid) return;
    setProgress(next);
    try { localStorage.setItem(storageKey(uid), JSON.stringify(next)); } catch { /* ignore */ }
  }, [uid]);

  const trackQuiz = useCallback((correct: boolean) => {
    setProgress(prev => {
      const next = { ...prev, quiz: { ...prev.quiz, attempts: prev.quiz.attempts + 1, correct: prev.quiz.correct + (correct ? 1 : 0) }, updatedAt: Date.now() };
      if (uid) try { localStorage.setItem(storageKey(uid), JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [uid]);

  const trackFlash = useCallback((known: boolean) => {
    setProgress(prev => {
      const next = { ...prev, flash: { seen: prev.flash.seen + 1, known: prev.flash.known + (known ? 1 : 0) }, updatedAt: Date.now() };
      if (uid) try { localStorage.setItem(storageKey(uid), JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [uid]);

  const trackWrite = useCallback((correctBlanks: number, totalBlanks: number) => {
    setProgress(prev => {
      const next = { ...prev, write: { ...prev.write, done: prev.write.done + 1, correct: prev.write.correct + correctBlanks, total: Math.max(prev.write.total, totalBlanks) }, updatedAt: Date.now() };
      if (uid) try { localStorage.setItem(storageKey(uid), JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [uid]);

  const trackRead = useCallback((correct: number, total: number) => {
    setProgress(prev => {
      const next = { ...prev, read: { done: prev.read.done + 1, correct: prev.read.correct + correct, total: Math.max(prev.read.total, total) }, updatedAt: Date.now() };
      if (uid) try { localStorage.setItem(storageKey(uid), JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [uid]);

  const overall = computeOverall(progress);
  const grade   = computeGrade(overall);

  return { progress, save, trackQuiz, trackFlash, trackWrite, trackRead, overall, grade };
}
