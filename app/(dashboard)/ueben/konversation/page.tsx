import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { KonversationClient } from './KonversationClient';

export const metadata: Metadata = {
  title: 'Konversation · Dialoge üben',
  description: 'Gesprächsübungen mit authentischen Dialogen und zweistimmiger Wiedergabe.',
};

export default function KonversationPage() {
  return (
    <>
      <Topbar title="Konversation" />
      <KonversationClient />
    </>
  );
}
