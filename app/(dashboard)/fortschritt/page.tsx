import type { Metadata } from 'next';
import { FortschrittClient } from './FortschrittClient';

export const metadata: Metadata = {
  title: 'Mein Fortschritt',
  description: 'Verfolge deinen Lernfortschritt in allen Übungsbereichen.',
};

export default function FortschrittPage() {
  return <FortschrittClient />;
}
