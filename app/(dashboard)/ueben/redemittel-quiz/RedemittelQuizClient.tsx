'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { warmUpVoices, speakDE } from '@/lib/cloudVoice';
import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from '@/components/layout/MobileFilterDrawer';
import { useResizableSidebar } from '@/components/layout/ResizableSidebar';

type Level = 'A1' | 'A2' | 'B1' | 'B2';
type LevelFilter = 'ALL' | Level;

interface Phrase { de: string; en: string; }
interface RedemittelCat { cat: string; en: string; topic: string; level: Level; phrases: Phrase[]; }
interface Question { de: string; correct: string; options: string[]; cat: string; level: Level; }

const LEVEL_COLOR: Record<string, string> = { A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed' };
const LEVEL_BG:    Record<string, string> = { A1: '#f0fdf4', A2: '#eff6ff', B1: '#faf5ff' };
const LEVEL_BD:    Record<string, string> = { A1: '#bbf7d0', A2: '#bfdbfe', B1: '#e9d5ff' };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface FlatPhrase extends Phrase { level: Level; cat: string; }

function buildQuestions(pool: FlatPhrase[], count: number): Question[] {
  if (pool.length < 4) return [];
  const selected = shuffle(pool).slice(0, count);
  return selected.map(entry => {
    const distractors = shuffle(pool.filter(e => e.en !== entry.en)).slice(0, 3).map(e => e.en);
    if (distractors.length < 3) return null;
    return {
      de: entry.de,
      correct: entry.en,
      options: shuffle([entry.en, ...distractors]),
      cat: entry.cat,
      level: entry.level,
    };
  }).filter(Boolean) as Question[];
}

function speak(text: string, _lang = 'de-DE') {
  speakDE(text, 0.85);
}

/* ── Sidebar item — top-level component so React identity is stable ── */
function RQSidebarItem({
  id, topic, cat, level, count, isAll, selectedCat, onSelect,
}: {
  id: string; topic: string; cat: string; level?: Level;
  count: number; isAll?: boolean;
  selectedCat: string;
  onSelect: (id: string) => void;
}) {
  const active = selectedCat === id;
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        width: '100%', padding: '9px 12px', borderRadius: 8,
        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        textAlign: 'left', transition: 'all .13s', marginBottom: 3,
        background: active ? 'var(--b1)' : 'transparent',
        color: active ? '#fff' : 'var(--ink2)',
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{isAll ? '🔀' : '💬'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: active ? 700 : 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: active ? '#fff' : 'var(--ink)',
        }}>
          {isAll ? 'Alle Kategorien' : cat}
        </div>
        <div style={{ fontSize: 10.5, color: active ? 'rgba(255,255,255,.65)' : 'var(--muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {isAll ? `${count} Phrasen gesamt` : `${topic} · ${count} Phrasen`}
        </div>
      </div>
      {!isAll && level && (
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 100, flexShrink: 0,
          background: active ? 'rgba(255,255,255,.22)' : LEVEL_BG[level],
          color: active ? '#fff' : LEVEL_COLOR[level],
          border: `1px solid ${active ? 'rgba(255,255,255,.3)' : LEVEL_BD[level]}`,
        }}>{level}</span>
      )}
    </button>
  );
}

export function RedemittelQuizClient() {
  const { user } = useAuth();
  const { trackQuiz } = useProgress(user?.uid ?? null);

  const [allCats, setAllCats] = useState<RedemittelCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const [questions, setQuestions]     = useState<Question[]>([]);
  const [qIdx, setQIdx]               = useState(0);
  const [selected, setSelected]       = useState<string | null>(null);
  const [score, setScore]             = useState(0);
  const [finished, setFinished]       = useState(false);
  const [history, setHistory]         = useState<{ de: string; correct: string; chosen: string; level: Level }[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [canAdvance, setCanAdvance]   = useState(false);

  useEffect(() => {
    warmUpVoices();   // preload best German voice so the FIRST play isn't robotic
    fetch('/data/redemittel.json')
      .then(r => r.json())
      .then((data: RedemittelCat[]) => { setAllCats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const levelCats = useMemo(
    () => levelFilter === 'ALL' ? allCats : allCats.filter(c => c.level === levelFilter),
    [allCats, levelFilter]
  );

  const pool = useMemo<FlatPhrase[]>(() => {
    const cats = selectedCat === 'ALL' ? levelCats : levelCats.filter(c => c.cat === selectedCat);
    const out: FlatPhrase[] = [];
    cats.forEach(cat => cat.phrases.forEach(p => out.push({ ...p, level: cat.level, cat: cat.cat })));
    return out;
  }, [levelCats, selectedCat]);

  const questionCount = useMemo(() => {
    if (selectedCat !== 'ALL') return Math.max(4, pool.length);
    return 10;
  }, [selectedCat, pool.length]);

  const startQuiz = useCallback(() => {
    const qs = buildQuestions(pool, questionCount);
    setQuestions(qs);
    setQIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setHistory([]);
    setQuizStarted(true);
    setCanAdvance(false);
  }, [pool, questionCount]);

  const advanceQuestion = () => {
    if (qIdx + 1 >= questions.length) setFinished(true);
    else { setQIdx(i => i + 1); setSelected(null); setCanAdvance(false); }
  };

  // Must be before any early return to satisfy Rules of Hooks
  const current = questions[qIdx];

  useEffect(() => {
    if (quizStarted && !finished && current) speak(current.de);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx, quizStarted, finished]);

  const choose = (opt: string) => {
    if (selected !== null || !current) return;
    setSelected(opt);
    const isCorrect = opt === current.correct;
    if (isCorrect) setScore(s => s + 1);
    trackQuiz(isCorrect);
    setHistory(h => [...h, { de: current.de, correct: current.correct, chosen: opt, level: current.level }]);
    setCanAdvance(true);
  };

  const handleSidebarSelect = useCallback((id: string) => {
    setSelectedCat(id);
    setQuizStarted(false);
    setFinished(false);
    setCanAdvance(false);
  }, []);

  const handleLevelFilter = (l: LevelFilter) => {
    setLevelFilter(l);
    setSelectedCat('ALL');
    setQuizStarted(false);
    setFinished(false);
  };

  const pct = questions.length ? Math.round((qIdx / questions.length) * 100) : 0;
  const activeCat = levelCats.find(c => c.cat === selectedCat);
  const catName = selectedCat === 'ALL' ? 'Alle Kategorien' : (activeCat?.cat ?? '');
  const totalPhrases = levelCats.reduce((s, c) => s + c.phrases.length, 0);

  const { filterOpen, setFilterOpen, isMobile } = useMobileFilter();
  const { asideStyle, DragHandle, collapsed, SidebarToggle } = useResizableSidebar(230, 180, 420);

  // Selecting a category from the mobile drawer should close it.
  const onSidebarSelect = (id: string) => { handleSidebarSelect(id); setFilterOpen(false); };

  // Shared sidebar content (desktop aside + mobile drawer).
  const sidebarItems = loading ? (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
      <div style={{ width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--b1)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
    </div>
  ) : (
    <>
      <RQSidebarItem
        id="ALL" topic="" cat="Alle Kategorien"
        count={totalPhrases} isAll
        selectedCat={selectedCat} onSelect={onSidebarSelect}
      />
      <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px 8px' }} />
      {levelCats.map(cat => (
        <RQSidebarItem
          key={cat.cat}
          id={cat.cat} topic={cat.topic} cat={cat.cat}
          level={cat.level} count={cat.phrases.length}
          selectedCat={selectedCat} onSelect={onSidebarSelect}
        />
      ))}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 51px)', overflow: 'hidden' }}>

      {/* ── Filter bar ── */}
      <div className="ub-bar" style={{ position: 'static', flexShrink: 0 }}>
        <span className="fl-lbl">Level:</span>
        {(['ALL', 'A1', 'A2', 'B1', 'B2'] as LevelFilter[]).map(l => (
          <button key={l} type="button"
            className={`chip${levelFilter === l ? ' on' : ''}`}
            onClick={() => handleLevelFilter(l)}
            style={levelFilter === l && l !== 'ALL' ? { background: LEVEL_COLOR[l], borderColor: LEVEL_COLOR[l], color: '#fff' } : {}}
          >
            {l === 'ALL' ? 'Alle' : <span className={`lvl lvl-${l.toLowerCase()}`}>{l}</span>}
          </button>
        ))}
        <span className="ub-note">{levelCats.length} Kategorien · {pool.length} Phrasen</span>
        {!isMobile && <SidebarToggle />}
        {isMobile && (
          <span style={{ marginLeft: 'auto' }}>
            <FilterToggleButton onClick={() => setFilterOpen(true)} label="⚙ Kategorien" />
          </span>
        )}
      </div>

      {/* ── Layout: flexible sidebar (desktop) / drawer (mobile) ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Left sidebar — flexible, drag-to-resize like Vokabeln (desktop only) */}
        {!isMobile && !collapsed && (
          <>
            <aside style={{
              ...asideStyle,
              borderRight: '1px solid var(--border)', background: 'var(--bg2)',
              overflowY: 'auto', padding: '12px 10px', height: '100%',
            }}>
              {sidebarItems}
            </aside>
            <DragHandle />
          </>
        )}

        {/* Right pane */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', height: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
              <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--b1)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
            </div>
          ) : !quizStarted ? (

            /* ── Setup / start ── */
            <div style={{ padding: '36px 40px', maxWidth: 560 }}>
              <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 42, lineHeight: 1 }}>💬</div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                    {catName}
                  </h2>
                  {selectedCat !== 'ALL' && activeCat && (
                    <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                        background: LEVEL_BG[activeCat.level], color: LEVEL_COLOR[activeCat.level],
                        border: `1px solid ${LEVEL_BD[activeCat.level]}`,
                      }}>{activeCat.level}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{activeCat.topic}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: 'var(--b1-bg)', border: '1px solid var(--b1-bd)', borderRadius: 14, padding: '18px 22px', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--b1)', marginBottom: 4 }}>
                  📋 {pool.length} Phrasen im Pool
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {selectedCat === 'ALL'
                    ? 'Quiz: 10 zufällige Phrasen aus allen Kategorien'
                    : `Quiz: alle ${Math.min(pool.length, questionCount)} Phrasen aus dieser Kategorie`}
                </div>
              </div>

              {finished && (
                <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-bd)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
                    Letztes Ergebnis: {score} / {questions.length} ✓
                  </div>
                </div>
              )}

              <button
                type="button" onClick={startQuiz} disabled={pool.length < 4}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 12,
                  background: pool.length < 4 ? 'var(--bg3)' : 'var(--b1)',
                  color: pool.length < 4 ? 'var(--muted)' : '#fff',
                  border: 'none', fontSize: 15, fontWeight: 700,
                  cursor: pool.length < 4 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background .15s',
                  boxShadow: pool.length >= 4 ? 'var(--sh-md)' : 'none',
                }}
              >
                {pool.length < 4 ? 'Zu wenig Phrasen (min. 4 nötig)' : '▶ Quiz starten'}
              </button>

            </div>

          ) : finished ? (

            /* ── Results ── */
            <div style={{ padding: '36px 40px', maxWidth: 560 }}>
              <div style={{ textAlign: 'center', background: 'var(--bg2)', borderRadius: 20, padding: '32px 24px', marginBottom: 20, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>
                  {score >= questions.length * 0.9 ? '🏆' : score >= questions.length * 0.6 ? '👍' : '💪'}
                </div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 36, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                  {score} / {questions.length}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                  {score === questions.length ? 'Perfekt! Alle Phrasen richtig! 🎉' :
                   score >= questions.length * 0.8 ? 'Sehr gut! Fast perfekt.' :
                   score >= questions.length * 0.5 ? 'Gut gemacht! Weiter üben!' :
                   'Noch etwas üben — du schaffst das!'}
                </div>
                <div style={{ height: 8, borderRadius: 100, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, width: `${(score / questions.length) * 100}%`,
                    background: score >= questions.length * 0.8 ? 'var(--green)' : score >= questions.length * 0.5 ? 'var(--b1)' : 'var(--amber)',
                    transition: 'width 1s ease' }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Ergebnisse</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.map((h, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, fontSize: 13,
                      background: h.chosen === h.correct ? 'var(--green-bg)' : 'var(--red-bg)',
                      border: `1px solid ${h.chosen === h.correct ? 'var(--green-bd)' : 'var(--red-bd)'}`,
                    }}>
                      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{h.chosen === h.correct ? '✅' : '❌'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 2, wordBreak: 'break-word', fontStyle: 'italic' }}>{h.de}</div>
                        <div style={{ color: h.chosen === h.correct ? 'var(--green)' : 'var(--red)', fontSize: 12, fontWeight: 600 }}>{h.correct}</div>
                        {h.chosen !== h.correct && (
                          <div style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through', marginTop: 1 }}>{h.chosen}</div>
                        )}
                      </div>
                      <button type="button" onClick={() => speak(h.de)}
                        style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--muted)', cursor: 'pointer', fontSize: 11, flexShrink: 0, marginTop: 2 }}>
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={startQuiz}
                  style={{ flex: 1, padding: '13px 0', borderRadius: 12, background: 'var(--b1)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🔄 Nochmal
                </button>
                <button type="button" onClick={() => { setQuizStarted(false); setFinished(false); }}
                  style={{ flex: 1, padding: '13px 0', borderRadius: 12, background: 'var(--bg2)', color: 'var(--ink2)', border: '1px solid var(--border)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ⚙ Neue Auswahl
                </button>
              </div>
            </div>

          ) : (

            /* ── Active quiz ── */
            <div style={{ padding: '28px 40px', maxWidth: 560 }}>
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Frage {qIdx + 1} / {questions.length}</span>
                    {current && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100,
                        background: LEVEL_BG[current.level], color: LEVEL_COLOR[current.level],
                        fontWeight: 700, border: `1px solid ${LEVEL_COLOR[current.level]}30`,
                        maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{current.cat}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>✓ {score}</span>
                </div>
                <div style={{ height: 6, borderRadius: 100, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, background: 'var(--b1)', transition: 'width .4s ease', width: `${pct}%` }} />
                </div>
              </div>

              {current && (
                <div>
                  <div style={{
                    background: 'var(--bg)', border: `2px solid ${LEVEL_COLOR[current.level]}25`,
                    borderRadius: 20, padding: '36px 28px', textAlign: 'center',
                    marginBottom: 18, boxShadow: 'var(--sh-md)',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: LEVEL_COLOR[current.level], textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
                      Was bedeutet auf Englisch?
                    </div>
                    <div style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 14, wordBreak: 'break-word', fontStyle: 'italic' }}>
                      „{current.de}"
                    </div>
                    <button type="button" onClick={() => speak(current.de)} title="Vorlesen"
                      style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${LEVEL_COLOR[current.level]}40`, background: LEVEL_BG[current.level], color: LEVEL_COLOR[current.level], cursor: 'pointer', fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      🔊
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {current.options.map(opt => {
                      const isSelected = selected === opt;
                      const isCorrect = opt === current.correct;
                      const isWrong = selected !== null && isSelected && !isCorrect;
                      const isGreenHint = selected !== null && isCorrect;
                      return (
                        <button type="button" key={opt} onClick={() => choose(opt)} disabled={selected !== null}
                          style={{
                            padding: '13px 18px', borderRadius: 12, border: '2px solid',
                            fontSize: 13, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer',
                            fontFamily: 'inherit', transition: 'all .2s', textAlign: 'left', lineHeight: 1.5, wordBreak: 'break-word',
                            background: isGreenHint ? 'var(--green-bg)' : isWrong ? 'var(--red-bg)' : isSelected ? 'var(--b1-bg)' : 'var(--bg)',
                            borderColor: isGreenHint ? 'var(--green-bd)' : isWrong ? 'var(--red-bd)' : isSelected ? 'var(--b1)' : 'var(--border)',
                            color: isGreenHint ? 'var(--green)' : isWrong ? 'var(--red)' : isSelected ? 'var(--b1)' : 'var(--ink2)',
                            transform: isGreenHint ? 'scale(1.01)' : 'scale(1)',
                          }}
                        >
                          {isGreenHint ? '✓ ' : isWrong ? '✗ ' : ''}{opt}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {canAdvance && (
                      <button type="button" onClick={advanceQuestion}
                        style={{ width: '100%', padding: '13px 0', borderRadius: 12, background: 'var(--b1)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--sh-md)', animation: 'slide-up .18s ease both' }}>
                        {qIdx + 1 >= questions.length ? '🏁 Ergebnis ansehen' : 'Weiter →'}
                      </button>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <button type="button" onClick={() => { setQuizStarted(false); setFinished(false); setCanAdvance(false); }}
                        style={{ fontSize: 11.5, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✕ Quiz beenden
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile category drawer */}
      {isMobile && (
        <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Kategorien">
          {sidebarItems}
        </MobileFilterDrawer>
      )}
    </div>
  );
}
