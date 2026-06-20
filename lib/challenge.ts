/* ──────────────────────────────────────────────────────────────────────────
   challenge.ts — Firestore-backed friend challenges.

   A challenge embeds a fixed set of quiz questions plus the creator's score.
   A friend opens the share link, takes the exact same questions, and their
   result is appended for a head-to-head comparison.
   ────────────────────────────────────────────────────────────────────────── */

import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ChallengeQuestion { word: string; correct: string; options: string[]; }
export interface ChallengeResult { name: string; score: number; total: number; at: number; }
export interface Challenge {
  creatorName: string;
  creatorScore: number;
  total: number;
  level: string;
  category: string;
  questions: ChallengeQuestion[];
  createdAt: number;
  results: ChallengeResult[];
}

function genId(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export async function createChallenge(data: Omit<Challenge, 'createdAt' | 'results'>): Promise<string> {
  const id = genId();
  const payload: Challenge = {
    ...data,
    creatorName: (data.creatorName || 'Anonym').slice(0, 60),
    questions: data.questions.slice(0, 30),
    createdAt: Date.now(),
    results: [],
  };
  await setDoc(doc(db, 'challenges', id), payload);
  return id;
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  const snap = await getDoc(doc(db, 'challenges', id));
  return snap.exists() ? (snap.data() as Challenge) : null;
}

export async function addChallengeResult(id: string, result: ChallengeResult): Promise<void> {
  await updateDoc(doc(db, 'challenges', id), { results: arrayUnion(result) });
}

export function challengeUrl(id: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://teach-me-german-app.web.app';
  return `${origin}/challenge?id=${id}`;
}
