import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  title: 'Startseite',
  description: 'Lerne Deutsch mit Vokabeln, Grammatik und Übungen für A1, A2 und B1.',
};

export default function HomePage() {
  return <HomeClient />;
}
