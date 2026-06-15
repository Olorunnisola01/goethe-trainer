import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import { RedemittelClient } from './RedemittelClient';

const LEVELS = {
  A1: { count: 134 },
  A2: { count: 247 },
  B1: { count: 265 },
  B2: { count: 80  },
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
    title: `Redemittel ${level} · ${info.count} Phrasen`,
    description: `${info.count} Redemittel auf ${level}-Niveau für natürliches Deutsch.`,
  };
}

export default async function RedemittelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const info = LEVELS[level as Level];
  if (!info) notFound();

  return (
    <>
      <Topbar title={`Redemittel ${level}`}>
        <Badge variant={level as Level}>{level}</Badge>
        <span className="text-xs text-gray-400 font-semibold">{info.count} Phrasen</span>
      </Topbar>
      <RedemittelClient level={level as Level} />
    </>
  );
}
