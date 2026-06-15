import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/Topbar';
import { SatzstellungClient } from './SatzstellungClient';

export const metadata: Metadata = {
  title: 'Satzstellung · Wortordnung A1–B1',
  description: '800 Drag-and-Drop Satzordnung-Übungen für A1, A2 und B1 — von einfachen Aussagesätzen bis zu Nebensätzen.',
};

export default function SatzstellungPage() {
  return (
    <>
      <Topbar title="Satzstellung — Wortordnung" />
      <SatzstellungClient />
    </>
  );
}
