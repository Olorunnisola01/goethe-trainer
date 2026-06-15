'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from '@/components/layout/MobileFilterDrawer';
import { useResizableSidebar } from '@/components/layout/ResizableSidebar';

type Level = 'A1' | 'A2' | 'B1' | 'B2';
type LevelFilter = 'ALL' | Level;

interface GramQuizItem {
  q: string;
  opts: string[];
  ans: number;
  ch: string;
  tip: string;
  level: Level;
}

const QUESTIONS_PER_SESSION = 10;

const CHAPTER_ICONS: Record<string, string> = {
  'Alphabet':          '🔤',
  'Nouns':             '📌',
  'Articles':          '📰',
  'Pronouns':          '👤',
  'Adjectives':        '🎨',
  'Verbs':             '⚡',
  'Adverbs':           '🔄',
  'Prepositions':      '📍',
  'Conjunctions':      '🔗',
  'Question Words':    '❓',
  'Particles':         '💬',
  'Numerals':          '🔢',
  'Interjections':     '😲',
  'Sentence Structure':'🏗',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderTip(tip: string) {
  return tip.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ fontWeight: 600, color: 'var(--blue)' }}>{part}</strong>
      : <span key={i}>{part}</span>
  );
}

/* ─── Sidebar helpers ────────────────────────────────────────── */
function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '14px 14px 4px',
      fontSize: 9.5, fontWeight: 700,
      color: 'var(--muted)',
      textTransform: 'uppercase', letterSpacing: '.08em',
    }}>
      {children}
    </div>
  );
}

function SideItem({
  active, onClick, children, indent = false,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`gtoc-it${active ? ' active' : ''}`}
      style={indent ? { paddingLeft: 22, fontSize: 12 } : {}}
    >
      {children}
    </button>
  );
}

function SideDivider() {
  return <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />;
}

/* ─── Main ───────────────────────────────────────────────────── */
export function GramQuizClient() {
  const { user } = useAuth();
  const { trackQuiz } = useProgress(user?.uid ?? null);
  const uid = user?.uid ?? 'guest';
  const storageKey = `dlgramquiz_${uid}`;

  const [allItems, setAllItems]     = useState<GramQuizItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [levelFilter, setLevelFilter]     = useState<LevelFilter>('ALL');
  const [chapterFilter, setChapterFilter] = useState<string>('ALL');

  const [questions, setQuestions] = useState<GramQuizItem[]>([]);
  const [qIdx,      setQIdx]      = useState(0);
  const [selected,  setSelected]  = useState<number | null>(null);
  const [score,     setScore]     = useState(0);
  const [finished,  setFinished]  = useState(false);
  const [history,   setHistory]   = useState<{
    q: string; correct: number; chosen: number; tip: string;
  }[]>([]);

  const [savedScore, setSavedScore] = useState({ attempts: 0, correct: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setSavedScore(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [storageKey]);

  useEffect(() => {
    fetch('/data/gramquiz.json')
      .then(r => r.json())
      .then((data: GramQuizItem[]) => { setAllItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* All chapters that exist for the current level filter */
  const chapters = useMemo(() => {
    const base = levelFilter === 'ALL' ? allItems : allItems.filter(i => i.level === levelFilter);
    return Array.from(new Set(base.map(i => i.ch)));
  }, [allItems, levelFilter]);

  const pool = useMemo(() => {
    let items = levelFilter === 'ALL' ? allItems : allItems.filter(i => i.level === levelFilter);
    if (chapterFilter !== 'ALL') items = items.filter(i => i.ch === chapterFilter);
    return items;
  }, [allItems, levelFilter, chapterFilter]);

  const startQuiz = useCallback(() => {
    const qs = shuffle(pool).slice(0, QUESTIONS_PER_SESSION);
    setQuestions(qs);
    setQIdx(0); setSelected(null); setScore(0); setFinished(false); setHistory([]);
  }, [pool]);

  useEffect(() => {
    if (!loading && pool.length > 0) startQuiz();
  }, [loading, pool, startQuiz]);

  const current = questions[qIdx];
  const { filterOpen, setFilterOpen, isMobile } = useMobileFilter();
  const { asideStyle, DragHandle, collapsed, SidebarToggle } = useResizableSidebar();

  const choose = (optIdx: number) => {
    if (selected !== null || !current) return;
    setSelected(optIdx);
    const isCorrect = optIdx === current.ans;
    if (isCorrect) setScore(s => s + 1);
    trackQuiz(isCorrect);
    const next = { attempts: savedScore.attempts + 1, correct: savedScore.correct + (isCorrect ? 1 : 0) };
    setSavedScore(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
    setHistory(h => [...h, { q: current.q, correct: current.ans, chosen: optIdx, tip: current.tip }]);
  };

  const nextQ = () => {
    if (qIdx + 1 >= questions.length) { setFinished(true); return; }
    setQIdx(i => i + 1);
    setSelected(null);
  };

  const pct = savedScore.attempts > 0
    ? Math.round((savedScore.correct / savedScore.attempts) * 100)
    : 0;

  /* ── Loading ── */
  if (loading) return (
    <div className="gram-layout" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{
        width: 32, height: 32,
        border: '4px solid var(--border)', borderTopColor: 'var(--blue)',
        borderRadius: '50%', animation: 'spin .9s linear infinite',
      }} />
    </div>
  );

  /* Sidebar content shared between desktop aside and mobile drawer */
  const sidebarContent = (
    <>
      {/* Level */}
      <SideHeading>Level</SideHeading>
      <SideItem active={levelFilter === 'ALL'} onClick={() => { setLevelFilter('ALL'); setChapterFilter('ALL'); }}>
        <span>📖</span><span>Alle Level</span>
      </SideItem>
      <SideItem active={levelFilter === 'A1'} onClick={() => { setLevelFilter('A1'); setChapterFilter('ALL'); }} indent>
        <span className="lvl lvl-a1" style={{ fontSize: 8, padding: '1px 4px' }}>A1</span>
        <span>A1 — Grundstufe</span>
      </SideItem>
      <SideItem active={levelFilter === 'A2'} onClick={() => { setLevelFilter('A2'); setChapterFilter('ALL'); }} indent>
        <span className="lvl lvl-a2" style={{ fontSize: 8, padding: '1px 4px' }}>A2</span>
        <span>A2 — Grundstufe</span>
      </SideItem>
      <SideItem active={levelFilter === 'B1'} onClick={() => { setLevelFilter('B1'); setChapterFilter('ALL'); }} indent>
        <span className="lvl lvl-b1" style={{ fontSize: 8, padding: '1px 4px' }}>B1</span>
        <span>B1 — Mittelstufe</span>
      </SideItem>
      <SideItem active={levelFilter === 'B2'} onClick={() => { setLevelFilter('B2'); setChapterFilter('ALL'); }} indent>
        <span className="lvl lvl-b2" style={{ fontSize: 8, padding: '1px 4px' }}>B2</span>
        <span>B2 — Mittelstufe</span>
      </SideItem>

      <SideDivider />

      {/* Chapters */}
      <SideHeading>Kapitel</SideHeading>
      <SideItem active={chapterFilter === 'ALL'} onClick={() => setChapterFilter('ALL')}>
        <span>🗂</span><span>Alle Kapitel</span>
      </SideItem>
      {chapters.map(ch => (
        <SideItem
          key={ch}
          active={chapterFilter === ch}
          onClick={() => setChapterFilter(ch)}
          indent
        >
          <span>{CHAPTER_ICONS[ch] ?? '📄'}</span>
          <span>{ch}</span>
        </SideItem>
      ))}

      <SideDivider />

      {/* Stats */}
      <SideHeading>Statistik</SideHeading>
      <div style={{ padding: '4px 14px 12px', fontSize: 11.5, color: 'var(--ink2)', lineHeight: 2 }}>
        <div><span style={{ color: 'var(--muted)' }}>Versuche:</span> <b>{savedScore.attempts}</b></div>
        <div><span style={{ color: 'var(--muted)' }}>Richtig:</span> <b style={{ color: 'var(--green)' }}>{savedScore.correct}</b></div>
        {savedScore.attempts > 0 && (
          <div><span style={{ color: 'var(--muted)' }}>Quote:</span> <b style={{ color: 'var(--blue)' }}>{pct}%</b></div>
        )}
        <div style={{ marginTop: 4, color: 'var(--muted)', fontSize: 11 }}>
          Pool: <b style={{ color: 'var(--ink)' }}>{pool.length.toLocaleString()}</b> Fragen
        </div>
      </div>

      {/* Start button */}
      <div style={{ padding: '0 10px 16px' }}>
        <button
          onClick={startQuiz}
          disabled={pool.length === 0}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 8,
            background: 'var(--blue)', color: '#fff', fontSize: 12.5,
            fontWeight: 600, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', transition: 'background .15s',
            opacity: pool.length === 0 ? 0.4 : 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue)')}
        >
          Neue Runde starten
        </button>
      </div>
    </>
  );

  return (
    <div className="gram-layout">

      {/* ═══ SIDEBAR — FILTERS ═══ */}
      {/* Desktop sidebar — flexible, drag-to-resize like Vokabeln */}
      {!isMobile && !collapsed && (
        <>
          <aside className="gram-toc" style={asideStyle}>
            {sidebarContent}
          </aside>
          <DragHandle />
        </>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Quiz-Filter">
          {sidebarContent}
        </MobileFilterDrawer>
      )}

      {/* ═══════════════ RIGHT CONTENT — QUIZ ═══════════════ */}
      <div className="gram-content">
        <div className="gch active">

          {/* Title */}
          <div className="gch-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>🏗 Grammatik-Quiz</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isMobile && <SidebarToggle />}
              {isMobile && <FilterToggleButton onClick={() => setFilterOpen(true)} />}
            </div>
          </div>
          <div className="gch-sub">
            {questions.length > 0 && !finished
              ? `Frage ${qIdx + 1} von ${questions.length} · ${score} richtig`
              : `${pool.length.toLocaleString()} Fragen verfügbar · A1, A2 & B1`}
          </div>

          {/* Progress bar */}
          {!finished && questions.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: 'var(--blue)',
                  width: `${(qIdx / questions.length) * 100}%`,
                  transition: 'width .4s ease',
                }} />
              </div>
            </div>
          )}

          {/* ── FINISHED SCREEN ── */}
          {finished ? (
            <div>
              <div className="gsec open" style={{ marginBottom: 20 }}>
                <div className="gsec-hd" style={{ textAlign: 'center', flexDirection: 'column', gap: 8, padding: '24px 20px' }}>
                  <div style={{ fontSize: 40 }}>
                    {score >= QUESTIONS_PER_SESSION * 0.8 ? '🏆' : score >= QUESTIONS_PER_SESSION * 0.5 ? '📚' : '💪'}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-lora, Lora), serif' }}>
                    {score} / {questions.length}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85 }}>
                    {score === questions.length
                      ? 'Perfekt — weiter so!'
                      : score >= questions.length * 0.8
                        ? 'Sehr gut gemacht!'
                        : 'Weiter üben — du schaffst das!'}
                  </div>
                </div>
              </div>

              {/* Review */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                  Auswertung
                </div>
                {history.map((h, i) => (
                  <div key={i} className="gsec" style={{ marginBottom: 10 }}>
                    <div style={{
                      padding: '11px 16px',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      background: h.chosen === h.correct ? 'var(--green-bg)' : 'var(--red-bg)',
                      borderLeft: `3px solid ${h.chosen === h.correct ? 'var(--green)' : 'var(--red)'}`,
                    }}>
                      <span style={{ fontWeight: 700, color: h.chosen === h.correct ? 'var(--green)' : 'var(--red)', flexShrink: 0, fontSize: 14 }}>
                        {h.chosen === h.correct ? '✓' : '✗'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>{h.q}</div>
                        {h.chosen !== h.correct && (
                          <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--amber)', background: 'var(--amber-bg)', borderRadius: 6, padding: '6px 10px' }}>
                            💡 {renderTip(h.tip)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={startQuiz}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 8,
                  background: 'var(--blue)', color: '#fff', fontSize: 14,
                  fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue)')}
              >
                Neue Runde →
              </button>
            </div>

          /* ── ACTIVE QUESTION ── */
          ) : current ? (
            <div>
              {/* Question card */}
              <div className="gsec open" style={{ marginBottom: 16 }}>
                <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border)' }}>

                  {/* Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    <span className={`lvl lvl-${current.level.toLowerCase()}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                      {current.level}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600,
                      background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)',
                    }}>
                      {CHAPTER_ICONS[current.ch] ?? '📄'} {current.ch}
                    </span>
                  </div>

                  {/* Question text */}
                  <div className="g-ex" style={{ justifyContent: 'center', borderLeft: 'none', background: 'var(--bg2)' }}>
                    <p style={{
                      fontFamily: 'var(--font-lora, Lora), serif',
                      fontSize: 17, fontWeight: 600,
                      color: 'var(--ink)', textAlign: 'center', lineHeight: 1.7, margin: 0,
                    }}>
                      {current.q}
                    </p>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {current.opts.map((opt, i) => {
                  const isDone = selected !== null;
                  const isCorrectOpt = i === current.ans;
                  const isChosen = i === selected;
                  let bg = 'var(--bg)', border = 'var(--border)', color = 'var(--ink)';
                  if (isDone) {
                    if (isCorrectOpt) { bg = 'var(--green-bg)'; border = 'var(--green)'; color = 'var(--green)'; }
                    else if (isChosen) { bg = 'var(--red-bg)'; border = 'var(--red)'; color = 'var(--red)'; }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => choose(i)}
                      disabled={isDone}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 16px', borderRadius: 8,
                        border: `1.5px solid ${border}`,
                        background: bg, color,
                        cursor: isDone ? 'default' : 'pointer',
                        textAlign: 'left', width: '100%',
                        fontSize: 13.5, fontWeight: 500,
                        transition: 'border-color .15s, background .15s',
                        boxShadow: 'var(--sh)',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => { if (!isDone) (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue)'; }}
                      onMouseLeave={e => { if (!isDone) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                    >
                      {/* Letter badge */}
                      <span style={{
                        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                        background: isDone
                          ? isCorrectOpt ? 'var(--green)' : isChosen ? 'var(--red)' : 'var(--bg3)'
                          : 'var(--bg3)',
                        color: isDone && (isCorrectOpt || isChosen) ? '#fff' : 'var(--muted)',
                      }}>
                        {String.fromCharCode(65 + i)}
                      </span>

                      {/* Option text — Lora */}
                      <span style={{
                        fontFamily: 'var(--font-lora, Lora), serif',
                        fontSize: 15, fontWeight: 600,
                      }}>
                        {opt}
                      </span>

                      {/* Tick / Cross */}
                      {isDone && isCorrectOpt && (
                        <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 15 }}>✓</span>
                      )}
                      {isDone && isChosen && !isCorrectOpt && (
                        <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 15 }}>✗</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tip + Next */}
              {selected !== null && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="gsec" style={{ marginBottom: 0 }}>
                    <div style={{
                      padding: '11px 16px', fontSize: 12.5, color: 'var(--amber)',
                      background: 'var(--amber-bg)', display: 'flex', gap: 8, alignItems: 'flex-start',
                    }}>
                      <span style={{ flexShrink: 0 }}>💡</span>
                      <span>{renderTip(current.tip)}</span>
                    </div>
                  </div>

                  <button
                    onClick={nextQ}
                    style={{
                      width: '100%', padding: '11px 0', borderRadius: 8,
                      background: 'var(--blue)', color: '#fff', fontSize: 14,
                      fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue)')}
                  >
                    {qIdx + 1 >= questions.length ? 'Ergebnis anzeigen →' : 'Nächste Frage →'}
                  </button>
                </div>
              )}
            </div>

          /* ── EMPTY POOL ── */
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-lora, Lora), serif', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                Keine Fragen gefunden
              </div>
              <div style={{ fontSize: 13 }}>Bitte Filter in der Seitenleiste anpassen.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
