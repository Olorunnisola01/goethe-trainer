import { Topbar } from '@/components/layout/Topbar';
import { NachrichtenClient } from './NachrichtenClient';

export const metadata = { title: 'Deutsche Nachrichten' };

export default function NachrichtenPage() {
  return (
    <>
      <Topbar title="Deutsche Nachrichten" />
      <NachrichtenClient />
    </>
  );
}
