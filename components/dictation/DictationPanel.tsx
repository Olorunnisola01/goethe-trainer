'use client';

/* Diktat — type-what-you-hear. Plays one sentence of the audio at a time; the
   learner types it; we score word-by-word and highlight the differences.
   Closer to real exam listening than multiple choice. Awards XP via the game. */

import { useState, useMemo, useCallback } from 'react';
import { speakDE, stopAll } from '@/lib/cloudVoice';
import { useGame } from '@/context/GamificationContext';

/* Split a transcript into speakable sentences. */
function toSentences(text: string): string[] {
  const raw = text.match(/[^.!?…]+[.!?…]+["»")\]]*\s*/g) || [text];
  return raw.map(s => s.trim()).filter(s => s.length > 1);
}
/* Normalise a word for comparison (lowercase, strip surrounding punctuation). */
const norm = (w: string) => w.toLowerCase().replace(/^[^a-zäöüß0-9]+|[^a-zäöüß0-9]+$/gi, '');

export function DictationPanel({ script }: { script: string }) {
  const { record } = useGame();
  const sentences = useMemo(() => toSentences(script), [script]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [speaking, setSpeaking] = useState(false);

  const target = sentences[idx] ?? '';
  const targetWords = useMemo(() => target.split(/\s+/).filter(Boolean), [target]);

  const play = useCallback((rate = 0.8) => {
    stopAll(); setSpeaking(true);
    speakDE(target, rate, { onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  }, [target]);

  /* Word-level comparison against the user's typed words (position-aligned). */
  const diff = useMemo(() => {
    const userWords = input.split(/\s+/).filter(Boolean).map(norm);
    let hits = 0;
    const marks = targetWords.map((tw, i) => {
      const ok = norm(tw) === userWords[i];
      if (ok) hits++;
      return { word: tw, ok };
    });
    return { marks, hits, total: targetWords.length };
  }, [input, targetWords]);

  const check = () => {
    if (checked || !target) return;
    setChecked(true);
    const acc = diff.total ? diff.hits / diff.total : 0;
    setScores(s => [...s, acc]);
    record({ type: 'listen', correct: acc >= 0.7 });
  };

  const next = () => {
    setChecked(false); setInput('');
    if (idx + 1 < sentences.length) { setIdx(i => i + 1); }
  };

  const restart = () => { setIdx(0); setInput(''); setChecked(false); setScores([]); };

  const done = scores.length === sentences.length && sentences.length > 0;
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) : 0;

  if (!sentences.length) return null;

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>{avg >= 80 ? '🏆' : avg >= 50 ? '👍' : '💪'}</div>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 26, fontWeight: 800, color: 'var(--ink)' }}>{avg}%</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', margin: '4px 0 14px' }}>Diktat abgeschlossen · {sentences.length} Sätze</div>
        <button onClick={restart} className="btn-primary">🔄 Nochmal</button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>Satz {idx + 1} / {sentences.length}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => play(0.8)} className="btn-secondary" style={{ fontSize: 11.5 }}>{speaking ? '▶ …' : '🔊 Anhören'}</button>
          <button onClick={() => play(0.6)} className="btn-secondary" style={{ fontSize: 11.5 }} title="Langsam">🐢</button>
        </div>
      </div>

      <textarea
        value={input}
        onChange={e => !checked && setInput(e.target.value)}
        disabled={checked}
        placeholder="Tippe, was du hörst…"
        rows={2}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); checked ? next() : check(); } }}
        style={{ width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', fontSize: 14.5, fontFamily: 'inherit', lineHeight: 1.6, outline: 'none' }}
      />

      {checked && (
        <div style={{ marginTop: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>
            Lösung · {diff.hits}/{diff.total} Wörter richtig
          </div>
          <div style={{ fontSize: 14.5, lineHeight: 1.7 }}>
            {diff.marks.map((m, i) => (
              <span key={i} style={{ color: m.ok ? 'var(--green)' : 'var(--red)', fontWeight: m.ok ? 500 : 700, textDecoration: m.ok ? 'none' : 'underline' }}>
                {m.word}{' '}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {!checked ? (
          <button onClick={check} className="btn-primary" disabled={!input.trim()}>✓ Prüfen</button>
        ) : (
          <button onClick={next} className="btn-primary">{idx + 1 < sentences.length ? 'Nächster Satz →' : '🏁 Ergebnis'}</button>
        )}
      </div>
    </div>
  );
}
