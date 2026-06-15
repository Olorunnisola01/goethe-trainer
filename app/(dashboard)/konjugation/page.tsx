import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { KonjugationClient } from './KonjugationClient';

export const metadata: Metadata = {
  title: 'Konjugation · Präsens A1–B1',
  description: '65 deutsche Verben mit Präsens-Konjugationstabellen und Vorlese-Funktion für A1, A2 und B1.',
};

export default function KonjugationPage() {
  return (
    <>
      <Topbar title="Konjugation — Präsens" />
      <KonjugationClient />
    </>
  );
}
