import type { Metadata } from 'next';
import { Lora, Plus_Jakarta_Sans, Comic_Neue } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { ToastHost } from '@/components/gamification/ToastHost';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

/* Always use the light theme; apply saved font scale before first paint. */
const themeBootScript = `(function(){try{var f=localStorage.getItem('dl_font')||'md';document.documentElement.setAttribute('data-theme','light');document.documentElement.setAttribute('data-font',f);}catch(e){}})();`;

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
    <html lang="de" data-theme="light" data-font="md" suppressHydrationWarning className={`${jakarta.variable} ${lora.variable} ${comicNeue.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <SettingsProvider>
            <LanguageProvider>
              <GamificationProvider>
                {children}
                <ToastHost />
                <ServiceWorkerRegister />
              </GamificationProvider>
            </LanguageProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
