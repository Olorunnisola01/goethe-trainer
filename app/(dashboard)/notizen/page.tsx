import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { NotizenClient } from './NotizenClient';

export const metadata: Metadata = {
  title: 'Notizen · Mein Lern-Journal',
  description: 'Persönliches Notizbuch zum Festhalten von Vokabeln, Grammatik und Gedanken beim Deutschlernen.',
};

export default function NotizenPage() {
  return (
    <>
      <Topbar title="Notizen — Mein Journal" />
      <NotizenClient />
    </>
  );
}
