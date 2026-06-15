import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { KarteikartenClient } from './KarteikartenClient';

export const metadata: Metadata = {
  title: 'Karteikarten · Vokabeln üben',
  description: 'Lerne Vokabeln mit dem Karteikarten-System – bekannt/unbekannt, alle Level.',
};

export default function KarteikartenPage() {
  return (
    <>
      <Topbar title="Karteikarten" />
      <KarteikartenClient />
    </>
  );
}
