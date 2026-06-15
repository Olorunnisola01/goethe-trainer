import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { GramQuizClient } from './GramQuizClient';

export const metadata: Metadata = {
  title: 'Grammatik-Quiz · Regeln testen',
  description: 'Teste deine Grammatikkenntnisse mit Quizfragen zu Kasus, Konjugation und mehr.',
};

export default function GrammatikQuizPage() {
  return (
    <>
      <Topbar title="Grammatik-Quiz" />
      <GramQuizClient />
    </>
  );
}
