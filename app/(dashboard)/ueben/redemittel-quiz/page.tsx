import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { RedemittelQuizClient } from './RedemittelQuizClient';

export const metadata: Metadata = {
  title: 'Redemittel-Quiz | Deutsch Lernen',
  description: 'Teste deine Redemittel — Niveau A1, A2 und B1.',
};

export default function RedemittelQuizPage() {
  return (
    <>
      <Topbar title="Redemittel-Quiz" />
      <RedemittelQuizClient />
    </>
  );
}
