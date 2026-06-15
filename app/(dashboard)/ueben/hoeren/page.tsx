import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { HoerenClient } from './HoerenClient';

export const metadata: Metadata = {
  title: 'Hören · Hörverstehen üben',
  description: 'Hörverstehensübungen und Goethe-Prüfungssätze für A1, A2 und B1.',
};

export default function HoerenPage() {
  return (
    <>
      <Topbar title="Hören" />
      <HoerenClient />
    </>
  );
}
