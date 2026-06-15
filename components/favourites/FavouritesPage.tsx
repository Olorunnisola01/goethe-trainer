'use client';

import { useState } from 'react';
import { FavouriteItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { speakDE, speakEN } from '@/lib/germanVoice';
import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';

interface FavouritesPageProps {
  favs: FavouriteItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

type Mode = 'grid' | 'flash';

export function FavouritesPage({ favs, onRemove, onClear }: FavouritesPageProps) {
  const [mode, setMode]     = useState<Mode>('grid');
  const [idx, setIdx]       = useState(0);
  const [flipped, setFlip]  = useState(false);

  const speak = (text: string, lang: 'de' | 'en') => {
    if (lang === 'en') speakEN(text, 0.9);
    else               speakDE(text, 0.9);
  };

  const current = favs[Math.min(idx, favs.length - 1)];

  const navFlash = (dir: number) => {
    setFlip(false);
    setIdx(i => (i + dir + favs.length) % favs.length);
  };

  const Empty = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">⭐</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Noch keine Favoriten</h3>
      <p className="text-sm text-gray-500 max-w-xs">
        Rechtsklick auf eine Vokabelkarte und wähle &ldquo;Zu Favoriten hinzufügen&rdquo;.
      </p>
    </div>
  );

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 flex-wrap">
        <h2 className="font-serif text-lg font-bold text-gray-900 flex-1">⭐ Meine Favoriten</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('grid')}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all', mode === 'grid' ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')}
          >
            🗂 Karten
          </button>
          <button
            onClick={() => { setMode('flash'); setFlip(false); setIdx(0); }}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all', mode === 'flash' ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')}
          >
            🃏 Lernkarten
          </button>
        </div>
        {favs.length > 0 && (
          <button
            onClick={() => { if (confirm(`Alle ${favs.length} Favoriten löschen?`)) onClear(); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-700 hover:text-white transition-all"
          >
            🗑 Alle löschen
          </button>
        )}
      </div>

      {/* Grid mode */}
      {mode === 'grid' && (
        <div className="p-6">
          {favs.length === 0 ? <Empty/> : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {favs.map(f => (
                <Card key={f.id} className="relative flex flex-col gap-2">
                  <button
                    onClick={() => onRemove(f.id)}
                    className="absolute top-2.5 right-2.5 text-gray-300 hover:text-red-500 text-sm leading-none transition-colors"
                    title="Entfernen"
                  >
                    ✕
                  </button>
                  <div className="text-base font-bold text-gray-900">{f.de}</div>
                  <div className="text-sm text-gray-500">{f.en}</div>
                  {f.ex && <div className="text-xs italic text-gray-400 border-t border-gray-100 pt-1.5">{f.ex}</div>}
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => speak(f.de, 'de')} className="px-2.5 py-1 rounded-md border border-gray-200 text-xs hover:border-green-400 hover:text-green-700 transition-colors">🔊 DE</button>
                    <button onClick={() => speak(f.en, 'en')} className="px-2.5 py-1 rounded-md border border-gray-200 text-xs hover:border-green-400 hover:text-green-700 transition-colors">🔊 EN</button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flashcard mode */}
      {mode === 'flash' && (
        <div className="flex flex-col items-center gap-5 py-10 px-6">
          {favs.length === 0 ? <Empty/> : (
            <>
              <div className="text-xs text-gray-400 font-semibold">{idx + 1} / {favs.length}</div>
              <div
                onClick={() => setFlip(!flipped)}
                className="w-full max-w-md min-h-[220px] bg-white border-2 border-gray-200 rounded-2xl shadow-md flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow p-8 text-center select-none"
              >
                <div className="text-2xl font-bold text-gray-900">{current?.de}</div>
                {flipped && (
                  <>
                    <div className="text-base text-gray-500 mt-3">{current?.en ?? '—'}</div>
                    {current?.ex && <div className="text-xs italic text-gray-400 mt-2">{current.ex}</div>}
                  </>
                )}
                {!flipped && <div className="text-xs text-gray-300 mt-4">Karte anklicken zum Umdrehen</div>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => navFlash(-1)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:border-blue-400 hover:text-blue-700 transition-colors">← Zurück</button>
                <button onClick={() => speak(current?.de ?? '', 'de')} className="px-4 py-2 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-700 hover:text-white transition-colors">🔊 Vorlesen</button>
                <button onClick={() => navFlash(1)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold hover:border-blue-400 hover:text-blue-700 transition-colors">Weiter →</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
