/**
 * Landing page at "/"
 * Shows a marketing/intro screen and redirects logged-in users to /home
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Deutsch Lernen · A1 · A2 · B1 Komplett',
  description:
    'Kostenlos Deutsch lernen mit Vokabeln, Grammatik, Schreibübungen und mehr – perfekte Prüfungsvorbereitung.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-center px-6 text-center">
      <span className="text-6xl mb-4">🇩🇪</span>
      <h1 className="font-serif text-4xl font-bold text-gray-900 mb-3">
        Deutsch Lernen
      </h1>
      <p className="text-gray-500 text-lg max-w-md mb-8 leading-relaxed">
        Alles von A1 bis B1 — Vokabeln, Grammatik, Schreibübungen,
        Karteikarten, Quiz und mehr. Kostenlos.
      </p>

      <div className="flex gap-4 flex-wrap justify-center mb-6">
        <Link
          href="/home"
          className="px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm"
        >
          Jetzt starten →
        </Link>
        <Link
          href="/pruefungsinfo"
          className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Prüfungsinfo (kostenlos)
        </Link>
      </div>

      <div className="flex gap-6 text-sm text-gray-400">
        <span>📚 2.600+ Vokabeln</span>
        <span>✍️ 200 Schreibübungen</span>
        <span>🎯 Quiz &amp; Karteikarten</span>
      </div>
    </main>
  );
}
