'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { UbLayout } from '@/components/layout/UbLayout';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface TFQuestion { type: 'TF'; q: string; a: boolean; exp: string; }
interface MCQQuestion { type: 'MCQ'; q: string; opts: string[]; a: number; exp: string; }
type Question = TFQuestion | MCQQuestion;

interface ReadingExercise {
  id: string;
  level: Level;
  type: string;
  title: string;
  text: string;
  questions: Question[];
}

const LEVEL_LABELS: Record<string, string> = { A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed' };

export function LesenClient() {
  const { user } = useAuth();
  const { trackRead } = useProgress(user?.uid ?? null);
  const uid = user?.uid ?? 'guest';
  const storageKey = `dllesen_${uid}`;

  const [exercises, setExercises] = useState<ReadingExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<Level | 'ALL'>('ALL');
  const [selected, setSelected] = useState<ReadingExercise | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<number, boolean | number | null>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch('/data/read.json')
      .then(r => r.json())
      .then((data: ReadingExercise[]) => { setExercises(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, [storageKey]);

  const filtered = useMemo(
    () => levelFilter === 'ALL' ? exercises : exercises.filter(e => e.level === levelFilter),
    [exercises, levelFilter]
  );

  const openExercise = (ex: ReadingExercise) => {
    setSelected(ex); setAnswers({}); setFinished(false); setScore(0);
  };

  const answerQuestion = (qIdx: number, answer: boolean | number) => {
    if (answers[qIdx] !== undefined || !selected) return;
    const newAnswers = { ...answers, [qIdx]: answer };
    setAnswers(newAnswers);

    if (Object.keys(newAnswers).length === selected.questions.length) {
      let correct = 0;
      selected.questions.forEach((q, i) => {
        const ans = newAnswers[i];
        if ((q.type === 'TF' && ans === q.a) || (q.type === 'MCQ' && ans === q.a)) correct++;
      });
      setScore(correct);
      setFinished(true);
      trackRead(correct, selected.questions.length);
      const nextDone = new Set(done).add(selected.id);
      setDone(nextDone);
      try { localStorage.setItem(storageKey, JSON.stringify([...nextDone])); } catch { /* ignore */ }
    }
  };

  const isCorrect = (qIdx: number) => {
    if (!selected || answers[qIdx] === undefined) return null;
    const q = selected.questions[qIdx];
    return q.type === 'TF' ? answers[qIdx] === q.a : answers[qIdx] === q.a;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
        <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
      </div>
    );
  }

  return (
    <UbLayout sidebar={close => (
      <>
      {/* Filter bar */}
      <div className="ub-bar" style={{ position: 'static', flexShrink: 0 }}>
        <span className="fl-lbl">Level:</span>
        {(['ALL', 'A1', 'A2', 'B1', 'B2'] as (Level | 'ALL')[]).map(lv => (
          <button
            key={lv}
            className={`chip${levelFilter === lv ? ' on' : ''}`}
            onClick={() => setLevelFilter(lv)}
            style={levelFilter === lv && lv !== 'ALL' ? { background: LEVEL_LABELS[lv], borderColor: LEVEL_LABELS[lv], color: '#fff' } : {}}
          >
            {lv === 'ALL' ? 'Alle' : <span className={`lvl lvl-${lv.toLowerCase()}`}>{lv}</span>}
          </button>
        ))}
        <span className="ub-note">{filtered.length} Texte · {done.size} gelöst</span>
      </div>

      {/* Selection list (inside resizable sidebar / mobile drawer) */}
      <div className="ub-list" style={{ border: 'none', position: 'static', maxHeight: 'none', background: 'transparent' }}>
          {filtered.length === 0 ? (
            <p className="ub-empty">Keine Texte</p>
          ) : filtered.map(ex => (
            <div
              key={ex.id}
              className={`ub-item${selected?.id === ex.id ? ' active' : ''}`}
              onClick={() => { openExercise(ex); close(); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="ub-item-t">{ex.title}</div>
                  <div className="ub-item-s">
                    <span className={`ub-item-tag lvl-${ex.level.toLowerCase()}`}>{ex.level}</span>
                    {ex.type} · {ex.questions.length} Fragen
                  </div>
                </div>
                {done.has(ex.id) && <span className="ub-item-done">✓</span>}
              </div>
            </div>
          ))}
      </div>
      </>
    )}>
      {/* Main pane */}
      <div className="ub-pane">
          {!selected ? (
            <div className="ub-empty" style={{ paddingTop: 80 }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>📖</div>
              <div style={{ fontFamily: 'var(--font-lora)', fontWeight: 600, fontSize: 16, color: 'var(--ink2)', fontStyle: 'normal', marginBottom: 6 }}>Leseverstehen</div>
              <div>Wähle einen Text aus der Liste</div>
            </div>
          ) : (
            <div style={{ maxWidth: 680 }}>
              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className={`lvl lvl-${selected.level.toLowerCase()}`}>{selected.level}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{selected.type}</span>
                  {done.has(selected.id) && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Gelöst</span>}
                </div>
                <div className="ub-prompt" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
                  <div className="ub-prompt-t" style={{ fontSize: 18 }}>📖 {selected.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    {selected.questions.length} Verständnisfragen
                  </div>
                </div>
              </div>

              {/* Reading text */}
              <div className="ub-section">
                <div className="ub-section-h">Lesetext</div>
                <div style={{
                  background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10,
                  padding: '20px 24px', fontSize: 14, lineHeight: 1.85, color: 'var(--ink)',
                  fontFamily: 'var(--font-lora)', boxShadow: 'var(--sh)',
                  borderLeft: '4px solid var(--blue-bd)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {selected.text}
                </div>
              </div>

              {/* Score banner */}
              {finished && (
                <div className="ub-result">
                  <div className="ub-result-score">{score} / {selected.questions.length}</div>
                  <div className="ub-result-text">
                    {score === selected.questions.length
                      ? '🎉 Perfekt! Alle Fragen richtig!'
                      : `${score} von ${selected.questions.length} Fragen richtig`}
                  </div>
                  <button
                    className="btn-secondary"
                    style={{ marginTop: 14 }}
                    onClick={() => openExercise(selected)}
                  >↺ Nochmal versuchen</button>
                </div>
              )}

              {/* Questions */}
              <div className="ub-section" style={{ marginTop: 22 }}>
                <div className="ub-section-h">{selected.questions.length} Fragen</div>
                {selected.questions.map((q, qIdx) => {
                  const ans = answers[qIdx];
                  const answered = ans !== undefined;
                  const correct = isCorrect(qIdx);

                  return (
                    <div
                      key={qIdx}
                      className={`ub-q${answered ? ' graded' : ''}`}
                      style={correct === true ? { borderColor: 'var(--green-bd)', background: 'var(--green-bg)' }
                        : correct === false ? { borderColor: 'var(--red-bd)', background: 'var(--red-bg)' } : {}}
                    >
                      <div className="ub-q-num">Frage {qIdx + 1}</div>
                      <div className="ub-q-text">{q.q}</div>

                      {q.type === 'TF' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          {([true, false] as const).map(val => {
                            const isSel = ans === val;
                            const isGood = answered && val === q.a;
                            const isBad = answered && isSel && !isGood;
                            return (
                              <button
                                key={String(val)}
                                className={`lst-tf-btn${isGood ? ' correct' : isBad ? ' incorrect' : isSel ? ' selected' : ''}`}
                                disabled={answered}
                                onClick={() => answerQuestion(qIdx, val)}
                              >
                                {val ? 'Richtig' : 'Falsch'}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="ub-q-opts">
                          {q.opts.map((opt, oIdx) => {
                            const isSel = ans === oIdx;
                            const isGood = answered && oIdx === q.a;
                            const isBad = answered && isSel && !isGood;
                            return (
                              <button
                                key={oIdx}
                                className={`ub-q-opt${isGood ? ' correct' : isBad ? ' incorrect' : isSel ? ' selected' : ''}`}
                                disabled={answered}
                                onClick={() => answerQuestion(qIdx, oIdx)}
                              >
                                <span style={{ fontWeight: 700, marginRight: 7, opacity: .55 }}>
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {answered && (
                        <div className="ub-q-exp">
                          {correct ? '✓ Richtig! ' : '✗ Falsch. '}{q.exp}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
    </UbLayout>
  );
}
