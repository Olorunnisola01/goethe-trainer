import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { SchreibenClient } from './SchreibenClient';

export const metadata: Metadata = {
  title: 'Schreibübungen · 200 Lückentexte',
  description: '200 geführte Lückentexte für A1, A2 und B1 – E-Mails, Briefe, Essays und mehr.',
};

export default function SchreibenPage() {
  return (
    <>
      <Topbar title="Schreibübungen" />
      <SchreibenClient />
    </>
  );
}
