import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { GrammatikClient } from './GrammatikClient';

export const metadata: Metadata = {
  title: 'Grammatik · A1–B1',
  description: '14 Grammatikkapitel von A1 bis B1 mit Erklärungen, Tabellen und Beispielen.',
};

export default function GrammatikPage() {
  return (
    <>
      <Topbar title="Grammatik" />
      <GrammatikClient />
    </>
  );
}
