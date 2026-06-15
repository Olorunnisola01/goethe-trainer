import type { Metadata } from 'next';
import { Lora, Plus_Jakarta_Sans, Comic_Neue } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-comic',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Deutsch Lernen · A1 · A2 · B1 Komplett',
    template: '%s · Deutsch Trainer',
  },
  description:
    'Kostenlos Deutsch lernen: Vokabeln, Grammatik, Redemittel, Schreibübungen und Quizze für A1, A2 und B1 – perfekte Vorbereitung für den Goethe-Test.',
  keywords: ['Deutsch lernen', 'A1', 'A2', 'B1', 'Goethe Zertifikat', 'Vokabeln', 'Grammatik'],
  openGraph: {
    title: 'Deutsch Lernen · A1 · A2 · B1 Komplett',
    description: 'Vokabeln, Grammatik, Quiz und mehr für A1–B1.',
    type: 'website',
    locale: 'de_DE',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${jakarta.variable} ${lora.variable} ${comicNeue.variable}`}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
