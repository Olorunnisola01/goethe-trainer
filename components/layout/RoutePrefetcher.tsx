'use client';

/* Warms the most-used routes (and the big vocab dataset) in the background after
   the app is idle, so navigating to them is instant instead of waiting on the
   network. Prefetches are staggered so they never compete with the current
   page's first paint — important on memory/network-constrained phones. */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ROUTES = [
  '/home', '/fortschritt', '/favoriten', '/notizen',
  '/vocab/A1', '/vocab/A2', '/vocab/B1',
  '/ueben/karteikarten', '/ueben/quiz', '/ueben/satzstellung', '/ueben/verb-quiz',
  '/grammatik', '/konjugation', '/redemittel/A1',
  '/nachrichten', '/pruefungsinfo', '/lernplan',
];

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    let i = 0;
    let stagger: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      if (i >= ROUTES.length) return;
      try { router.prefetch(ROUTES[i]); } catch { /* ignore */ }
      i++;
      stagger = setTimeout(tick, 250);   // stagger — don't burst the network
    };

    const start = () => {
      fetch('/data/vocab.json').catch(() => { /* warm the SW cache */ });
      tick();
    };

    // requestIdleCallback when available (so prefetch never blocks first paint).
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const startId = ric ? ric(start, { timeout: 4000 }) : window.setTimeout(start, 2000);

    return () => {
      if (stagger) clearTimeout(stagger);
      clearTimeout(startId);   // harmless if it was an idle id
    };
  }, [router]);

  return null;
}
