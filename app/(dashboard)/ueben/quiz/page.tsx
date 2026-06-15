import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { QuizClient } from './QuizClient';

export const metadata: Metadata = {
  title: 'Quiz · Vokabeln testen',
  description: 'Teste dein Vokabelwissen mit Multiple-Choice-Quizfragen für A1, A2 und B1.',
};

export default function QuizPage() {
  return (
    <>
      <Topbar title="Vokabel-Quiz" />
      <QuizClient />
    </>
  );
}
