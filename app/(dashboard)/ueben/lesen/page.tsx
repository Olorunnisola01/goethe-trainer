import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { LesenClient } from './LesenClient';

export const metadata: Metadata = {
  title: 'Leseverstehen · 15 Texte',
  description: '15 Lesetexte mit Verständnisfragen für A1, A2 und B1 Deutschprüfungen.',
};

export default function LesenPage() {
  return (
    <>
      <Topbar title="Leseverstehen" />
      <LesenClient />
    </>
  );
}
