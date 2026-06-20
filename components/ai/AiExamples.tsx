'use client';

/* "✨ KI-Beispiele" — generates 3 example sentences for a German word at the
   learner's level, with English translations and per-sentence read-aloud.
   Self-contained: drop <AiExamples word="..." /> anywhere. */

import { useState } from 'react';
import { askAi, extractJson } from '@/lib/ai';
import { useGame } from '@/context/GamificationContext';
import { speakDE } from '@/lib/cloudVoice';

interface Sentence { de: string; en: string; }

export function AiExamples({ word }: { word: string }) {
  const { state } = useGame();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentences, setSentences] = useState<Sentence[] | null>(null);
  const [error, setError] = useState('');

  const level = state.cefr ?? 'A2';

  const generate = async () => {
    setOpen(true);
    if (sentences || loading) return;
    setLoading(true); setError('');
    try {
      const reply = await askAi([{
        role: 'user',
        content: `Give exactly 3 natural German example sentences using the word "${word}" at CEFR level ${level}. Keep them short and level-appropriate. Respond ONLY with JSON in this exact shape: {"sentences":[{"de":"...","en":"..."},{"de":"...","en":"..."},{"de":"...","en":"..."}]} — "de" is the German sentence, "en" its English translation. No other text.`,
      }], { maxTokens: 500 });
      const parsed = extractJson<{ sentences: Sentence[] }>(reply);
      if (parsed?.sentences?.length) setSentences(parsed.sentences.slice(0, 3));
      else setError('Keine Beispiele erhalten. Bitte erneut versuchen.');
    } catch {
      setError('KI nicht erreichbar. Bitte später erneut versuchen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 6 }}>
      <button
        onClick={() => (open ? setOpen(false) : generate())}
        className="vex-toggle-btn"
        style={{ alignSelf: 'center' }}
      >
        {open ? '▲ KI-Beispiele' : '✨ KI-Beispiele'}
      </button>

      {open && (
        <div style={{ marginTop: 8, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--muted)', fontSize: 12 }}>
              <span style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' }} />
              KI erstellt Beispiele…
            </div>
          )}
          {error && <div style={{ fontSize: 11.5, color: 'var(--red)', textAlign: 'center' }}>{error}</div>}
          {sentences?.map((s, i) => (
            <div key={i} style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <button onClick={() => speakDE(s.de, 0.9)} title="Vorlesen"
                  style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--blue-bd)', background: 'var(--bg)', color: 'var(--blue)', cursor: 'pointer', fontSize: 9 }}>🔊</button>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', userSelect: 'text' }}>{s.de}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', userSelect: 'text' }}>{s.en}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
