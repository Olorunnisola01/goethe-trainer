'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
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
  const uid = user?.uid ?? 'guest';
  const storageKey = `dlflash_${uid}`;

  const [allEntries, setAllEntries] = useState<FlatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL');
  const [deck, setDeck] = useState<FlatEntry[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [again, setAgain] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

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

  const buildDeck = useCallback(() => {
    const d = shuffle(filtered);
    setDeck(d);
    setIdx(0);
    setFlipped(false);
    setDone(false);
    setAgain(new Set());
  }, [filtered]);

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
    advance();
  };

  const markAgain = () => {
    if (!current) return;
    setAgain(prev => new Set(prev).add(current.w));
    trackFlash(false);
    advance();
  };

  const advance = () => {
    setFlipped(false);
    if (idx + 1 >= deck.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
    }
  };

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
          onClick={buildDeck}
          className="px-4 py-1.5 rounded-full text-xs font-semibold border border-gray-200 hover:bg-gray-50 ml-auto"
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
      {done ? (
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
          onClick={() => setFlipped(f => !f)}
          className="relative cursor-pointer border-2 border-gray-200 rounded-2xl p-8 min-h-[220px] flex flex-col items-center justify-center text-center hover:border-green-300 transition-colors select-none"
        >
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
        <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}
