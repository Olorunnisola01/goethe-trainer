import type { Metadata } from 'next';
import { FavoritenClient } from './FavoritenClient';

export const metadata: Metadata = {
  title: 'Meine Favoriten',
  description: 'Deine gespeicherten Lieblingsvokabeln – übe sie mit Karteikarten und Vorlesen.',
};

export default function FavoritenPage() {
  return <FavoritenClient />;
}
