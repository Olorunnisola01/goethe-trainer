import { Topbar } from '@/components/layout/Topbar';
import { GeschichtenClient } from './GeschichtenClient';

export const metadata = { title: 'Kurzgeschichten | Deutsch Lernen' };

export default function GeschichtenPage() {
  return (
    <>
      <Topbar title="Kurzgeschichten" />
      <GeschichtenClient />
    </>
  );
}
