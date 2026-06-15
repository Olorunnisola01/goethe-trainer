import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import { VocabClient } from './VocabClient';

const LEVELS = {
  A1: { words: 720,  desc: 'Grundlegende Alltagsvokabeln' },
  A2: { words: 666,  desc: 'Erweiterte Kommunikationsvokabeln' },
  B1: { words: 1339, desc: 'Fortgeschrittene Vokabeln für Beruf & Gesellschaft' },
  B2: { words: 2753, desc: 'Differenzierte Vokabeln für Beruf, Umwelt, Medien & Gesellschaft' },
};

type Level = keyof typeof LEVELS;

// No dynamic fallback — only A1/A2/B1 are valid
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(LEVELS).map(level => ({ level }));
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const info = LEVELS[level as Level];
  if (!info) return { title: 'Nicht gefunden' };
  return {
    title: `Vokabeln ${level} · ${info.words} Wörter`,
    description: `${info.words} deutsche Vokabeln auf ${level}-Niveau. ${info.desc}.`,
  };
}

export default async function VocabPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const info = LEVELS[level as Level];
  if (!info) notFound();

  return (
    <>
      <Topbar title={`Vokabeln ${level}`}>
        <Badge variant={level as Level}>{level}</Badge>
        <span className="text-xs text-gray-400 font-semibold">{info.words} Wörter</span>
      </Topbar>
      <VocabClient level={level as Level} />
    </>
  );
}
