export type Level = 'A1' | 'A2' | 'B1';

export interface VocabEntry {
  w: string;   // German word/phrase
  t: string;   // English translation
  ex?: string; // German example sentence
  exT?: string; // English translation of example
}

export interface VocabCategory {
  cat: string;
  level: Level;
  entries: VocabEntry[];
}

export interface WriteExercise {
  id: string;
  level: Level;
  type: string;
  title: string;
  prompt: string;
  template: string;
  answers: string[];
  tip: string;
  bank?: string[];
}

export interface ReadingExercise {
  id: string;
  level: Level;
  title: string;
  text: string;
  questions: { q: string; options: string[]; answer: number }[];
}

export interface FavouriteItem {
  id: string;
  de: string;
  en: string;
  ex?: string;
  addedAt: number;
}

export interface UserProgress {
  quiz:      { attempts: number; correct: number };
  gramQuiz:  { attempts: number; correct: number };
  flash:     { seen: number; known: number };
  write:     { done: number; correct: number; total: number };
  read:      { done: number; correct: number; total: number };
  updatedAt: number;
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | '—';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  protected?: boolean;
  badge?: number;
}
