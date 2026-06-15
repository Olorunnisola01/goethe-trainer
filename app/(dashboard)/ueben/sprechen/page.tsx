import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { SprechenClient } from './SprechenClient';

export const metadata: Metadata = {
  title: 'Sprechen · Mündliche Übungen',
  description: 'Sprechübungen und Aussprachetraining für das Goethe-Zertifikat A1, A2 und B1.',
};

export default function SprechenPage() {
  return (
    <>
      <Topbar title="Sprechen" />
      <SprechenClient />
    </>
  );
}
