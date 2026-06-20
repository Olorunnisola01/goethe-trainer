'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { useGame } from '@/context/GamificationContext';
import { isDue } from '@/lib/gamification';
import { clsx } from 'clsx';
import { warmUpVoices, speakDE } from '@/lib/cloudVoice';

type Level = 'A1' | 'A2' | 'B1' | 'B2';
type LevelFilter = 'ALL' | Level;

interface FlatEntry {
  w: string;
  t: string;
  ex?: string;
  exT?: string;
  cat: string;
  emoji: string;
  level: Level;
}

interface VocabCategory {
  id: string;
  emoji: string;
  title: string;
  level: Level;
  entries: { w: string; t: string; ex?: string; exT?: string; de?: string; en?: string }[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(text: string, _lang: string) {
  speakDE(text, 0.9);
}

export function KarteikartenClient() {
  const { user } = useAuth();
  const { trackFlash } = useProgress(user?.uid ?? null);
  const { record, reviewCard, state: game } = useGame();
  const uid = user?.uid ?? 'guest';
  const storageKey = `dlflash_${uid}`;

  const [allEntries, setAllEntries] = useState<FlatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL');
  const [srsMode, setSrsMode] = useState(false);   // true = only due cards (SM-2)
  const [deck, setDeck] = useState<FlatEntry[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [again, setAgain] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const [dragX, setDragX] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  // Warm up high-quality voices as early as possible
  useEffect(() => { warmUpVoices(); }, []);

  // Load data
  useEffect(() => {
    fetch('/data/vocab.json')
      .then(r => r.json())
      .then((data: VocabCategory[]) => {
        const flat: FlatEntry[] = [];
        data.forEach(cat =>
          cat.entries.forEach(e =>
            flat.push({ w: e.w, t: e.t, ex: e.ex ?? e.de, exT: e.exT ?? e.en, cat: cat.title, emoji: cat.emoji, level: cat.level })
          )
        );
        setAllEntries(flat);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load saved known set
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setKnown(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, [storageKey]);

  const filtered = useMemo(
    () => levelFilter === 'ALL' ? allEntries : allEntries.filter(e => e.level === levelFilter),
    [allEntries, levelFilter]
  );

  /* How many cards in the current level are due for SRS review right now. */
  const dueCount = useMemo(
    () => filtered.filter(e => { const c = game.srs[e.w]; return !c || isDue(c); }).length,
    [filtered, game.srs]
  );

  const buildDeck = useCallback(() => {
    let pool = filtered;
    if (srsMode) {
      // Only due cards, soonest-due first (new cards count as due).
      pool = filtered.filter(e => { const c = game.srs[e.w]; return !c || isDue(c); })
        .sort((a, b) => (game.srs[a.w]?.due ?? '') < (game.srs[b.w]?.due ?? '') ? -1 : 1);
    } else {
      pool = shuffle(filtered);
    }
    setDeck(pool);
    setIdx(0);
    setFlipped(false);
    setDone(false);
    setAgain(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, srsMode]);

  useEffect(() => {
    if (!loading && filtered.length > 0) buildDeck();
  }, [loading, filtered, buildDeck]);

  const current = deck[idx];

  const markKnown = () => {
    if (!current) return;
    const key = current.w;
    setKnown(prev => {
      const next = new Set(prev).add(key);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
    trackFlash(true);
    reviewCard(key, 4);                                            // SM-2: "good"
    record({ type: 'flash', correct: true, word: { de: current.w, en: current.t } });
    advance();
  };

  const markEasy = () => {
    if (!current) return;
    const key = current.w;
    setKnown(prev => {
      const next = new Set(prev).add(key);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
    trackFlash(true);
    reviewCard(key, 5);                                            // SM-2: "easy" → longer interval
    record({ type: 'flash', correct: true, word: { de: current.w, en: current.t } });
    advance();
  };

  const markAgain = () => {
    if (!current) return;
    setAgain(prev => new Set(prev).add(current.w));
    trackFlash(false);
    reviewCard(current.w, 0);                                      // SM-2: "again" → reset
    record({ type: 'flash', correct: false, word: { de: current.w, en: current.t } });
    advance();
  };

  const advance = () => {
    setFlipped(false);
    setDragX(0);
    if (idx + 1 >= deck.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
    }
  };

  /* Swipe handlers: → known · ← again (only meaningful once flipped). */
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; swiped.current = false; };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) { setDragX(dx); if (Math.abs(dx) > 12) swiped.current = true; }
  };
  const onTouchEnd = () => {
    const dx = dragX;
    touchStart.current = null;
    if (flipped && Math.abs(dx) > 70) { dx > 0 ? markKnown() : markAgain(); }
    else setDragX(0);
  };

  /* Keyboard: Space/↑ flip · → known · ← again · R read aloud. */
  useEffect(() => {
    if (loading || done) return;
    const h = (e: KeyboardEvent) => {
      if (!current) return;
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); setFlipped(f => !f); }
      else if (e.key === 'ArrowRight' && flipped) { e.preventDefault(); markKnown(); }
      else if (e.key === 'ArrowLeft' && flipped) { e.preventDefault(); markAgain(); }
      else if (e.key.toLowerCase() === 'r') { e.preventDefault(); speak(current.w, 'de-DE'); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, flipped, loading, done]);

  const knownCount = deck.filter(e => known.has(e.w)).length;
  const againCount = again.size;
  const remaining = deck.length - idx;
  const progress = deck.length > 0 ? Math.round((idx / deck.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-300 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-7 py-6 max-w-2xl mx-auto space-y-6">
      {/* Level filter */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'A1', 'A2', 'B1', 'B2'] as LevelFilter[]).map(l => (
          <button
            key={l}
            onClick={() => setLevelFilter(l)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              levelFilter === l
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
            )}
          >
            {l === 'ALL' ? 'Alle Level' : l}
          </button>
        ))}
        <button
          onClick={() => setSrsMode(m => !m)}
          className={clsx('px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ml-auto',
            srsMode ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300')}
          title="Intelligente Wiederholung (SM-2): nur fällige Karten"
        >
          🧠 SRS{srsMode ? ` · ${dueCount} fällig` : ''}
        </button>
        <button
          onClick={buildDeck}
          className="px-4 py-1.5 rounded-full text-xs font-semibold border border-gray-200 hover:bg-gray-50"
        >
          🔀 Mischen
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{idx} / {deck.length} Karten</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-700">{knownCount}</div>
          <div className="text-xs text-green-600">Bekannt ✓</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-red-700">{againCount}</div>
          <div className="text-xs text-red-600">Nochmal ✗</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-gray-700">{remaining}</div>
          <div className="text-xs text-gray-500">Verbleibend</div>
        </div>
      </div>

      {/* Card */}
      {!done && deck.length === 0 && srsMode ? (
        <div className="border border-gray-200 rounded-2xl p-10 text-center space-y-3">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>Alles wiederholt!</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Für dieses Level sind aktuell keine Karten fällig. Komm später wieder — oder schalte SRS aus, um frei zu üben.</p>
          <button onClick={() => setSrsMode(false)} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm">Frei üben</button>
        </div>
      ) : done ? (
        <div className="border border-gray-200 rounded-2xl p-10 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold text-gray-800">Deck abgeschlossen!</h2>
          <p className="text-sm text-gray-500">
            {knownCount} von {deck.length} Karten bekannt
          </p>
          <button
            onClick={buildDeck}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            Neu starten
          </button>
        </div>
      ) : current ? (
        <div
          onClick={() => { if (!swiped.current) setFlipped(f => !f); }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="relative cursor-pointer border-2 border-gray-200 rounded-2xl p-8 min-h-[220px] flex flex-col items-center justify-center text-center hover:border-green-300 transition-colors select-none"
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX / 28}deg)`,
            transition: dragX === 0 ? 'transform .25s ease' : 'none',
            borderColor: dragX > 40 ? 'var(--green)' : dragX < -40 ? 'var(--red)' : undefined,
            touchAction: 'pan-y',
          }}
        >
          {/* Swipe hint badges */}
          {flipped && dragX > 40 && <div style={{ position: 'absolute', top: 14, left: 14, color: 'var(--green)', fontWeight: 800, fontSize: 14 }}>✓ Bekannt</div>}
          {flipped && dragX < -40 && <div style={{ position: 'absolute', top: 14, right: 14, color: 'var(--red)', fontWeight: 800, fontSize: 14 }}>✗ Nochmal</div>}
          <div className="text-xs text-gray-400 mb-4">{current.emoji} {current.cat}</div>

          {!flipped ? (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-2">{current.w}</p>
              <p className="text-xs text-gray-400 mt-4">Tippen zum Aufdecken</p>
            </>
          ) : (
            <>
              <p className="text-xl text-gray-500 mb-2">{current.w}</p>
              <p className="text-2xl font-bold text-green-700 mb-3">{current.t}</p>
              {current.ex && (
                <p className="text-sm text-gray-500 italic border-t border-gray-100 pt-3 mt-2">{current.ex}</p>
              )}
              {current.exT && (
                <p className="text-xs text-gray-400 mt-1">{current.exT}</p>
              )}
            </>
          )}

          <button
            onClick={e => { e.stopPropagation(); speak(current.w, 'de-DE'); }}
            className="absolute bottom-4 right-4 text-gray-300 hover:text-green-600 transition-colors text-lg"
            title="Vorlesen"
          >
            🔊
          </button>
        </div>
      ) : null}

      {/* Action buttons */}
      {!done && current && flipped && (
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={markAgain}
            className="py-3 rounded-xl border-2 border-red-200 text-red-700 font-semibold text-sm hover:bg-red-50 transition-colors"
          >
            ✗ Nochmal
          </button>
          <button
            onClick={markKnown}
            className="py-3 rounded-xl border-2 border-green-200 text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors"
          >
            ✓ Bekannt
          </button>
          <button
            onClick={markEasy}
            className="py-3 rounded-xl border-2 border-blue-200 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            ⚡ Einfach
          </button>
        </div>
      )}
      {!done && current && !flipped && (
        <button
          onClick={() => setFlipped(true)}
          className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors"
        >
          Aufdecken
        </button>
      )}
      {!done && current && (
        <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
          💡 Wischen: → bekannt · ← nochmal &nbsp;·&nbsp; Tasten: Leertaste umdrehen, ←/→ bewerten, R vorlesen
        </p>
      )}
    </div>
  );
}
