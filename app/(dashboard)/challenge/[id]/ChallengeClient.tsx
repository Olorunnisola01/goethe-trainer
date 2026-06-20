'use client';

/* Quiz-Duell — accept a friend's challenge: take the exact same questions, then
   see a head-to-head comparison. Reads/writes Firestore via lib/challenge. */

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GamificationContext';
import { Topbar } from '@/components/layout/Topbar';
import { speakDE } from '@/lib/cloudVoice';
import { shareScoreCard } from '@/lib/shareCard';
import { getChallenge, addChallengeResult, Challenge } from '@/lib/challenge';

export function ChallengeClient() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const { user } = useAuth();
  const { record } = useGame();

  const [ch, setCh] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [started, setStarted] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    getChallenge(id)
      .then(c => { if (!cancelled) { if (c) setCh(c); else setError('Diese Herausforderung wurde nicht gefunden.'); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError('Konnte die Herausforderung nicht laden.'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id, user]);

  const cur = ch?.questions[qIdx];

  const choose = (opt: string) => {
    if (picked !== null || !cur) return;
    setPicked(opt);
    const correct = opt === cur.correct;
    if (correct) setScore(s => s + 1);
    record({ type: 'quiz', correct, word: { de: cur.word, en: cur.correct } });
  };

  const next = () => {
    if (!ch) return;
    if (qIdx + 1 >= ch.questions.length) setFinished(true);
    else { setQIdx(i => i + 1); setPicked(null); }
  };

  const submit = useCallback(async () => {
    if (!ch || submitted) return;
    setSubmitted(true);
    try {
      await addChallengeResult(id, { name: user?.displayName ?? user?.email?.split('@')[0] ?? 'Ich', score, total: ch.questions.length, at: Date.now() });
    } catch { /* keep local view */ }
  }, [ch, submitted, id, user, score]);

  useEffect(() => { if (finished) submit(); }, [finished, submit]);

  /* ── States ── */
  if (!user) {
    return (
      <>
        <Topbar title="Quiz-Duell" />
        <div style={{ padding: 40, maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
          <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Du wurdest herausgefordert!</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>Melde dich an, um die Herausforderung anzunehmen und dein Ergebnis zu vergleichen.</p>
          <Link href="/home" style={{ color: 'var(--blue)', fontWeight: 600 }}>→ Zur Anmeldung</Link>
        </div>
      </>
    );
  }

  if (loading) return (<><Topbar title="Quiz-Duell" /><div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} /></div></>);

  if (error || !ch) return (<><Topbar title="Quiz-Duell" /><div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}><div style={{ fontSize: 40, marginBottom: 10 }}>😕</div>{error || 'Nicht gefunden.'}<div style={{ marginTop: 16 }}><Link href="/ueben/quiz" style={{ color: 'var(--blue)' }}>→ Eigenes Quiz starten</Link></div></div></>);

  const total = ch.questions.length;

  return (
    <>
      <Topbar title="Quiz-Duell" />
      <div style={{ padding: '28px 24px', maxWidth: 560, margin: '0 auto' }}>

        {!started && !finished && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>⚔️</div>
            <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
              {ch.creatorName} fordert dich heraus!
            </h1>
            <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)', borderRadius: 14, padding: '16px 20px', margin: '16px 0 22px' }}>
              <div style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>{ch.category} · {ch.level}</div>
              <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 4 }}>
                {ch.creatorName} hat <strong>{ch.creatorScore}/{ch.total}</strong> erreicht. Schaffst du mehr?
              </div>
            </div>
            <button onClick={() => setStarted(true)} style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: 'var(--blue)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              ▶ Herausforderung annehmen ({total} Fragen)
            </button>
          </div>
        )}

        {started && !finished && cur && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Frage {qIdx + 1} / {total}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>✓ {score}</span>
            </div>
            <div style={{ background: 'var(--bg)', border: '2px solid var(--blue-bd)', borderRadius: 20, padding: '36px 24px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Was bedeutet auf Englisch?</div>
              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 32, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, wordBreak: 'break-word' }}>{cur.word}</div>
              <button onClick={() => speakDE(cur.word, 0.9)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid var(--blue-bd)', background: 'var(--blue-bg)', color: 'var(--blue)', cursor: 'pointer', fontSize: 13 }}>🔊</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
            {picked !== null && (
              <button onClick={next} style={{ width: '100%', marginTop: 16, padding: '13px 0', borderRadius: 12, background: 'var(--blue)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {qIdx + 1 >= total ? '🏁 Ergebnis' : 'Weiter →'}
              </button>
            )}
          </div>
        )}

        {finished && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>{score > ch.creatorScore ? '🏆' : score === ch.creatorScore ? '🤝' : '💪'}</div>
            <div style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>
              {score > ch.creatorScore ? 'Du hast gewonnen!' : score === ch.creatorScore ? 'Unentschieden!' : 'Knapp verloren!'}
            </div>

            {/* Head-to-head */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 12px' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>👤 Du</div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 28, fontWeight: 800, color: score >= ch.creatorScore ? 'var(--green)' : 'var(--ink)' }}>{score}/{total}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 700, color: 'var(--muted)' }}>vs</div>
              <div style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 12px' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>⚔️ {ch.creatorName}</div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 28, fontWeight: 800, color: ch.creatorScore > score ? 'var(--green)' : 'var(--ink)' }}>{ch.creatorScore}/{ch.total}</div>
              </div>
            </div>

            {/* Other results */}
            {ch.results.length > 0 && (
              <div style={{ marginBottom: 20, textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Bestenliste</div>
                {[...ch.results, { name: ch.creatorName, score: ch.creatorScore, total: ch.total, at: ch.createdAt }]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 8)
                  .map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', borderRadius: 8, background: i === 0 ? 'var(--green-bg)' : 'var(--bg2)', marginBottom: 4, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{i === 0 ? '🥇 ' : `${i + 1}. `}{r.name}</span>
                      <span style={{ fontWeight: 700, color: 'var(--ink2)' }}>{r.score}/{r.total}</span>
                    </div>
                  ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => shareScoreCard({ score, total, title: `Quiz-Duell vs ${ch.creatorName}` })} style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'var(--green)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>📤 Teilen</button>
              <Link href="/ueben/quiz" style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 700, textAlign: 'center', textDecoration: 'none', fontFamily: 'inherit' }}>🎯 Eigenes Quiz</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
