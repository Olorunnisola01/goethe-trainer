'use client';

/* Schnellübung — a 5-question vocab micro-quiz right on the home screen.
   Pulls from /data/vocab.json, prioritising the user's weak words. Each answer
   awards XP and feeds the gamification system (streak, goal, weak-words). */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useGame } from '@/context/GamificationContext';
import { speakDE } from '@/lib/cloudVoice';

interface VEntry { w: string; t: string; }
interface VCat { id: string; level: string; entries: VEntry[]; }
interface QQ { word: string; correct: string; options: string[] }

function shuffle<T>(a: T[]): T[] { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

export function QuickReview() {
  const { state, record } = useGame();
  const [pool, setPool] = useState<VEntry[]>([]);
  const [round, setRound] = useState(0);          // forces a fresh set of questions
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/vocab.json').then(r => r.json()).then((cats: VCat[]) => {
      if (cancelled) return;
      const cefr = state.cefr;
      const flat: VEntry[] = [];
      cats.forEach(c => { if (!cefr || c.level === cefr || cefr === 'B2') c.entries.forEach(e => flat.push(e)); });
      setPool(flat.length >= 8 ? flat : cats.flatMap(c => c.entries));
    }).catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const questions = useMemo<QQ[]>(() => {
    if (pool.length < 4) return [];
    // Seed with weak words first, then random fill
    const weak = Object.values(state.weakWords).map(w => ({ w: w.de, t: w.en }))
      .filter(e => pool.some(p => p.w === e.w));
    const seed = shuffle([...weak]).slice(0, 5);
    const rest = shuffle(pool.filter(e => !seed.some(s => s.w === e.w))).slice(0, 5 - seed.length);
    const chosen = [...seed, ...rest].slice(0, 5);
    return chosen.map(entry => {
      const distract = shuffle(pool.filter(e => e.t !== entry.t)).slice(0, 3).map(e => e.t);
      return { word: entry.w, correct: entry.t, options: shuffle([entry.t, ...distract]) };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, round]);

  const cur = questions[idx];

  const choose = useCallback((opt: string) => {
    if (picked !== null || !cur) return;
    setPicked(opt);
    const correct = opt === cur.correct;
    if (correct) setScore(s => s + 1);
    record({ type: 'quiz', correct, word: { de: cur.word, en: cur.correct } });
    setTimeout(() => {
      if (idx + 1 >= questions.length) setDone(true);
      else { setIdx(i => i + 1); setPicked(null); }
    }, 850);
  }, [picked, cur, idx, questions.length, record]);

  const restart = () => { setRound(r => r + 1); setIdx(0); setPicked(null); setScore(0); setDone(false); };

  if (!questions.length) return null;

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>⚡ Schnellübung</h2>
      <div style={{ border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg2)', padding: '18px 20px' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>{score >= 4 ? '🎉' : score >= 2 ? '👍' : '💪'}</div>
            <div style={{ fontFamily: 'var(--font-lora, Lora), serif', fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>{score} / {questions.length}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', margin: '4px 0 14px' }}>
              {score === questions.length ? 'Perfekt!' : 'Gut gemacht — weiter so!'}
            </div>
            <button onClick={restart} style={{ padding: '10px 22px', borderRadius: 11, background: 'var(--blue)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Nochmal</button>
          </div>
        ) : cur && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>Frage {idx + 1} / {questions.length}</span>
              <span style={{ fontSize: 11.5, color: 'var(--green)', fontWeight: 700 }}>✓ {score}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-lora, Lora), serif', fontSize: 28, fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>{cur.word}</span>
              <button onClick={() => speakDE(cur.word, 0.9)} title="Vorlesen"
                style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--blue-bd)', background: 'var(--blue-bg)', color: 'var(--blue)', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>🔊</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {cur.options.map(opt => {
                const isCorrect = picked !== null && opt === cur.correct;
                const isWrong = picked === opt && opt !== cur.correct;
                return (
                  <button key={opt} onClick={() => choose(opt)} disabled={picked !== null}
                    className={`qr-opt${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}`}>
                    {isCorrect ? '✓ ' : isWrong ? '✗ ' : ''}{opt}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
