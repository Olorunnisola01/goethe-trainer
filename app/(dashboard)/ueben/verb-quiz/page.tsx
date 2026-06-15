import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { VerbQuizClient } from './VerbQuizClient';

export const metadata: Metadata = {
  title: 'Verb-Konjugations-Quiz · A1–A2',
  description: '6.000 Fragen zur Verbkonjugation auf A1 und A2 — Multiple Choice und Lückentext.',
};

export default function VerbQuizPage() {
  return (
    <>
      <Topbar title="Verb-Konjugations-Quiz" />
      <VerbQuizClient />
    </>
  );
}
