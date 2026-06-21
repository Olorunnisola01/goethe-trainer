/**
 * Landing page at "/"
 * Shows a short intro and links to the app (sign in) or the free exam info.
 * English so a brand-new learner immediately knows what to do.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Learn German · A1 · A2 · B1 Complete',
  description:
    'Learn German for free — vocabulary, grammar, writing exercises, flashcards and quizzes. Perfect Goethe-exam preparation.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-center px-6 text-center">
      <span className="text-6xl mb-4">🇩🇪</span>
      <h1 className="font-serif text-4xl font-bold text-gray-900 mb-3">
        Learn German
      </h1>
      <p className="text-gray-500 text-lg max-w-md mb-8 leading-relaxed">
        Everything from A1 to B1 — vocabulary, grammar, writing exercises,
        flashcards, quizzes and more. Free.
      </p>

      <div className="flex gap-4 flex-wrap justify-center mb-6">
        <Link
          href="/home"
          className="px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm"
        >
          Get started — sign in →
        </Link>
        <Link
          href="/pruefungsinfo"
          className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Exam Info (free)
        </Link>
      </div>

      <div className="flex gap-6 text-sm text-gray-400 flex-wrap justify-center">
        <span>📚 2,600+ words</span>
        <span>✍️ 200 writing tasks</span>
        <span>🎯 Quizzes &amp; flashcards</span>
      </div>
    </main>
  );
}
