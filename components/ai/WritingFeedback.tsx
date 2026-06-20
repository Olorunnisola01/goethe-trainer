'use client';

/* Free-writing pad with AI correction. The learner writes a German response to
   a scenario; the AI returns a corrected version, an inline list of fixes, and
   a 0-100 score. Awards XP through the gamification system. */

import { useState } from 'react';
import { askAi, extractJson } from '@/lib/ai';
import { useGame } from '@/context/GamificationContext';
import { speakDE } from '@/lib/cloudVoice';

interface Correction { from: string; to: string; why: string; }
interface Feedback { score: number; corrected: string; corrections: Correction[]; comment: string; }

export function WritingFeedback({ scenario, level }: { scenario: string; level: string }) {
  const { record } = useGame();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [error, setError] = useState('');

  const check = async () => {
    if (text.trim().length < 8 || loading) return;
    setLoading(true); setError(''); setFb(null);
    try {
      const reply = await askAi([{
        role: 'user',
        content: `A German learner (level ${level}) wrote this in response to the task: "${scenario}".\n\nTheir text:\n"""${text.trim()}"""\n\nCorrect their German. Respond ONLY with JSON: {"score": <0-100 integer>, "corrected": "the fully corrected German text", "corrections": [{"from":"original phrase","to":"corrected phrase","why":"short English reason"}], "comment": "one short encouraging English sentence"}. Only list real mistakes in "corrections".`,
      }], { maxTokens: 900 });
      const parsed = extractJson<Feedback>(reply);
      if (parsed && typeof parsed.score === 'number') {
        setFb(parsed);
        record({ type: 'write', correct: parsed.score >= 60 });
      } else setError('Keine Korrektur erhalten. Bitte erneut versuchen.');
    } catch {
      setError('KI nicht erreichbar. Bitte später erneut versuchen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 18, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
        ✍️ Freie Antwort schreiben — KI korrigiert
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Schreibe hier deine eigene Antwort auf Deutsch…"
        rows={4}
        style={{ width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit', lineHeight: 1.6, outline: 'none' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button className="btn-primary" onClick={check} disabled={loading || text.trim().length < 8}>
          {loading ? '⏳ KI prüft…' : '🤖 Text korrigieren'}
        </button>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{text.trim().split(/\s+/).filter(Boolean).length} Wörter</span>
      </div>

      {error && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{error}</div>}

      {fb && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-lora)', color: fb.score >= 75 ? 'var(--green)' : fb.score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
              {fb.score}<span style={{ fontSize: 13, color: 'var(--muted)' }}>/100</span>
            </div>
            <div style={{ flex: 1, fontSize: 12.5, color: 'var(--ink2)' }}>{fb.comment}</div>
          </div>

          <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-bd)', borderRadius: 9, padding: '10px 12px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>✅ Korrigierte Version</span>
              <button onClick={() => speakDE(fb.corrected, 0.9)} title="Vorlesen"
                style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--green-bd)', background: 'var(--bg)', color: 'var(--green)', cursor: 'pointer', fontSize: 10 }}>🔊</button>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6, userSelect: 'text' }}>{fb.corrected}</div>
          </div>

          {fb.corrections?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', marginBottom: 5 }}>✏️ Korrekturen ({fb.corrections.length})</div>
              {fb.corrections.map((c, i) => (
                <div key={i} style={{ fontSize: 12.5, marginBottom: 5, paddingBottom: 5, borderBottom: i < fb.corrections.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--red)', textDecoration: 'line-through' }}>{c.from}</span>
                  {' → '}
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>{c.to}</span>
                  {c.why && <span style={{ color: 'var(--muted)' }}> — {c.why}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
