'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { useGame } from '@/context/GamificationContext';
import { warmUpVoices, speakDE } from '@/lib/cloudVoice';
import { shareScoreCard } from '@/lib/shareCard';
import { createChallenge, challengeUrl } from '@/lib/challenge';
import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from '@/components/layout/MobileFilterDrawer';

type Level = 'A1' | 'A2' | 'B1' | 'B2';
type LevelFilter = 'ALL' | Level;

interface VocabEntry { w: string; t: string; }
interface VocabCategory { id: string; emoji: string; title: string; level: Level; entries: VocabEntry[]; }

/* Consistent Title Case helper (matches VocabClient) */
const toTitleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
const catLabel = (title: string) => toTitleCase(title.replace(/\s*\(A[12B1]+\)/g, ''));

interface Question { word: string; correct: string; options: string[]; catTitle: string; catEmoji: string; level: Level; }

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

interface FlatEntry extends VocabEntry { level: Level; catId: string; catTitle: string; catEmoji: string; }

function buildQuestions(pool: FlatEntry[], count: number): Question[] {
  if (pool.length < 4) return [];
  const selected = shuffle(pool).slice(0, count);
  return selected.map(entry => {
    const distractors = shuffle(pool.filter(e => e.t !== entry.t)).slice(0, 3).map(e => e.t);
    if (distractors.length < 3) return null;
    return {
      word: entry.w,
      correct: entry.t,
      options: shuffle([entry.t, ...distractors]),
      catTitle: entry.catTitle,
      catEmoji: entry.catEmoji,
      level: entry.level,
    };
  }).filter(Boolean) as Question[];
}

function speak(text: string, _lang = 'de-DE') {
  speakDE(text, 0.9);
}

/* ── Sidebar item — top-level so React component identity is stable ── */
function VQSidebarItem({
  id, emoji, title, level, count, isAll, selectedCat, onSelect,
}: {
  id: string; emoji: string; title: string; level?: Level;
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
        background: active ? 'var(--blue)' : 'transparent',
        color: active ? '#fff' : 'var(--ink2)',
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: active ? 700 : 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: active ? '#fff' : 'var(--ink)',
        }}>{title}</div>
        <div style={{ fontSize: 10.5, color: active ? 'rgba(255,255,255,.65)' : 'var(--muted)', marginTop: 1 }}>
          {count} Wörter
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

export function QuizClient() {
  const { user } = useAuth();
  const { trackQuiz } = useProgress(user?.uid ?? null);
  const { record, markPerfectQuiz } = useGame();
  const { filterOpen, setFilterOpen, isMobile } = useMobileFilter();

  const [allCategories, setAllCategories] = useState<VocabCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const [questions, setQuestions]     = useState<Question[]>([]);
  const [qIdx, setQIdx]               = useState(0);
  const [selected, setSelected]       = useState<string | null>(null);
  const [score, setScore]             = useState(0);
  const [finished, setFinished]       = useState(false);
  const [history, setHistory]         = useState<{ word: string; correct: string; chosen: string; level: Level }[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [canAdvance, setCanAdvance]   = useState(false);
  const [challengeBusy, setChallengeBusy] = useState(false);
  const [challengeLink, setChallengeLink] = useState('');

  useEffect(() => { warmUpVoices(); }, []);

  useEffect(() => {
    fetch('/data/vocab.json')
      .then(r => r.json())
      .then((data: VocabCategory[]) => { setAllCategories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const levelCats = useMemo(
    () => levelFilter === 'ALL' ? allCategories : allCategories.filter(c => c.level === levelFilter),
    [allCategories, levelFilter]
  );

  const pool = useMemo<FlatEntry[]>(() => {
    const cats = selectedCat === 'ALL' ? levelCats : levelCats.filter(c => c.id === selectedCat);
    const out: FlatEntry[] = [];
    cats.forEach(cat => cat.entries.forEach(e => out.push({
      ...e, level: cat.level, catId: cat.id, catTitle: cat.title, catEmoji: cat.emoji,
    })));
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

  // Must be before any early return (Rules of Hooks)
  const current = questions[qIdx];

  useEffect(() => {
    if (quizStarted && !finished && current) speak(current.word);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx, quizStarted, finished]);

  const choose = (opt: string) => {
    if (selected !== null || !current) return;
    setSelected(opt);
    const isCorrect = opt === current.correct;
    if (isCorrect) setScore(s => s + 1);
    trackQuiz(isCorrect);
    record({ type: 'quiz', correct: isCorrect, word: { de: current.word, en: current.correct } });
    setHistory(h => [...h, { word: current.word, correct: current.correct, chosen: opt, level: current.level }]);
    setCanAdvance(true);
  };

  /* Perfect-quiz achievement when finishing with a clean sheet. */
  useEffect(() => {
    if (finished && questions.length > 0 && score === questions.length) markPerfectQuiz();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  /* Keyboard shortcuts: 1-4 pick an option · Enter/Space advance. */
  useEffect(() => {
    if (!quizStarted || finished) return;
    const h = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4' && current && selected === null) {
        const i = Number(e.key) - 1;
        if (i < current.options.length) { e.preventDefault(); choose(current.options[i]); }
      } else if ((e.key === 'Enter' || e.key === ' ') && canAdvance) {
        e.preventDefault(); advanceQuestion();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStarted, finished, current, selected, canAdvance]);

  const createFriendChallenge = async () => {
    if (challengeBusy || !questions.length) return;
    setChallengeBusy(true);
    try {
      const id = await createChallenge({
        creatorName: user?.displayName ?? user?.email?.split('@')[0] ?? 'Anonym',
        creatorScore: score,
        total: questions.length,
        level: levelFilter === 'ALL' ? 'Gemischt' : levelFilter,
        category: catName,
        questions: questions.map(q => ({ word: q.word, correct: q.correct, options: q.options })),
      });
      const url = challengeUrl(id);
      setChallengeLink(url);
      const text = `Ich fordere dich zum Deutsch-Quiz-Duell heraus! Ich habe ${score}/${questions.length} erreicht. Schaffst du mehr? 🇩🇪⚔️`;
      const nav = navigator as Navigator & { share?: (d: { title: string; text: string; url: string }) => Promise<void> };
      if (nav.share) { try { await nav.share({ title: 'Quiz-Duell', text, url }); } catch { /* cancelled */ } }
      else { try { await navigator.clipboard.writeText(url); } catch { /* ignore */ } }
    } catch {
      setChallengeLink('error');
    } finally {
      setChallengeBusy(false);
    }
  };

  const handleSidebarSelect = useCallback((id: string) => {
    setSelectedCat(id);
    setQuizStarted(false);
    setFinished(false);
    setCanAdvance(false);
    setFilterOpen(false);
  }, [setFilterOpen]);

  const handleLevelFilter = (l: LevelFilter) => {
    setLevelFilter(l);
    setSelectedCat('ALL');
    setQuizStarted(false);
    setFinished(false);
  };

  const pct = questions.length ? Math.round((qIdx / questions.length) * 100) : 0;
  const activeCat = levelCats.find(c => c.id === selectedCat);
  const catName = selectedCat === 'ALL' ? 'Alle Gruppen' : (activeCat ? catLabel(activeCat.title) : '');
  const totalWords = levelCats.reduce((s, c) => s + c.entries.length, 0);

  /* Category list — shared between desktop sidebar and mobile drawer */
  const categoryList = loading ? (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
      <div style={{ width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
    </div>
  ) : (
    <>
      {/* "All categories" option */}
      <VQSidebarItem
        id="ALL" emoji="🔀" title="Alle Gruppen"
        count={totalWords} isAll
        selectedCat={selectedCat} onSelect={handleSidebarSelect}
      />
      <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px 8px' }} />

      {/* Individual categories */}
      {levelCats.map(cat => (
        <VQSidebarItem
          key={cat.id}
          id={cat.id} emoji={cat.emoji} title={catLabel(cat.title)}
          level={cat.level} count={cat.entries.length}
          selectedCat={selectedCat} onSelect={handleSidebarSelect}
        />
      ))}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : 'calc(100vh - 51px)', overflow: isMobile ? 'visible' : 'hidden' }}>

      {/* ── Filter bar ── */}
      <div className="ub-bar" style={{ position: 'static', flexShrink: 0 }}>
        {isMobile && (
          <FilterToggleButton onClick={() => setFilterOpen(true)} label="⚙ Gruppen" />
        )}
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
        <span className="ub-note">{levelCats.length} Gruppen · {pool.length} Wörter</span>
      </div>

      {/* ── Layout: sidebar (desktop) + quiz pane ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', flex: 1, minHeight: 0, overflow: isMobile ? 'visible' : 'hidden' }}>

        {/* Left sidebar — category list (desktop only; mobile uses drawer) */}
        {!isMobile && (
          <aside style={{
            borderRight: '1px solid var(--border)',
            background: 'var(--bg2)',
            overflowY: 'auto',
            padding: '12px 10px',
            height: '100%',
          }}>
            {categoryList}
          </aside>
        )}

        {/* Right pane — quiz */}
        <div style={{ overflowY: isMobile ? 'visible' : 'auto', height: isMobile ? 'auto' : '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
              <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
            </div>
          ) : !quizStarted ? (

            /* ── Setup / start screen ── */
            <div className="quiz-page" style={{ padding: '36px 40px', maxWidth: 560 }}>
              <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 42, lineHeight: 1 }}>
                  {selectedCat === 'ALL' ? '🎯' : (activeCat?.emoji ?? '🎯')}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                    {catName}
                  </h2>
                  {selectedCat !== 'ALL' && activeCat && (
                    <div style={{ marginTop: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                        background: LEVEL_BG[activeCat.level], color: LEVEL_COLOR[activeCat.level],
                        border: `1px solid ${LEVEL_BD[activeCat.level]}`,
                      }}>{activeCat.level}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info card */}
              <div style={{ background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)', borderRadius: 14, padding: '18px 22px', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>
                  📋 {pool.length} Wörter im Pool
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {selectedCat === 'ALL'
                    ? 'Quiz: 10 zufällige Fragen aus allen Gruppen'
                    : `Quiz: alle ${Math.min(pool.length, questionCount)} Wörter aus dieser Gruppe`}
                </div>
              </div>

              {/* Finished result (if returning to setup after quiz) */}
              {finished && (
                <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-bd)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>
                    Letztes Ergebnis: {score} / {questions.length} ✓
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={startQuiz}
                disabled={pool.length < 4}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 12,
                  background: pool.length < 4 ? 'var(--bg3)' : 'var(--blue)',
                  color: pool.length < 4 ? 'var(--muted)' : '#fff',
                  border: 'none', fontSize: 15, fontWeight: 700,
                  cursor: pool.length < 4 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background .15s',
                  boxShadow: pool.length >= 4 ? 'var(--sh-md)' : 'none',
                }}
              >
                {pool.length < 4 ? 'Zu wenig Wörter (min. 4 nötig)' : '▶ Quiz starten'}
              </button>

            </div>

          ) : finished ? (

            /* ── Results screen ── */
            <div className="quiz-page" style={{ padding: '36px 40px', maxWidth: 560 }}>
              <div style={{ textAlign: 'center', background: 'var(--bg2)', borderRadius: 20, padding: '32px 24px', marginBottom: 20, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>
                  {score >= questions.length * 0.9 ? '🏆' : score >= questions.length * 0.6 ? '👍' : '💪'}
                </div>
                <div style={{ fontFamily: 'var(--font-lora)', fontSize: 36, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>
                  {score} / {questions.length}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                  {score === questions.length ? 'Perfekt! Alle Wörter richtig! 🎉' :
                   score >= questions.length * 0.8 ? 'Sehr gut! Fast perfekt.' :
                   score >= questions.length * 0.5 ? 'Gut gemacht! Weiter üben!' :
                   'Noch etwas üben — du schaffst das!'}
                </div>
                <div style={{ height: 8, borderRadius: 100, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, width: `${(score / questions.length) * 100}%`,
                    background: score >= questions.length * 0.8 ? 'var(--green)' : score >= questions.length * 0.5 ? 'var(--blue)' : 'var(--amber)',
                    transition: 'width 1s ease' }} />
                </div>
              </div>

              {/* Answer review */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Ergebnisse</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.map((h, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                      borderRadius: 10, fontSize: 13,
                      background: h.chosen === h.correct ? 'var(--green-bg)' : 'var(--red-bg)',
                      border: `1px solid ${h.chosen === h.correct ? 'var(--green-bd)' : 'var(--red-bd)'}`,
                    }}>
                      <span style={{ fontSize: 15 }}>{h.chosen === h.correct ? '✅' : '❌'}</span>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{h.word}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>→</span>
                      <span style={{ color: h.chosen === h.correct ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{h.correct}</span>
                      {h.chosen !== h.correct && (
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>{h.chosen}</span>
                      )}
                      <button type="button" onClick={() => speak(h.word)} title="Wort vorlesen"
                        style={{ marginLeft: h.chosen === h.correct ? 'auto' : 0, width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--muted)', cursor: 'pointer', fontSize: 10, flexShrink: 0 }}>
                        🔊
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={startQuiz} style={{ flex: 1, padding: '13px 0', borderRadius: 12, background: 'var(--blue)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🔄 Nochmal
                </button>
                <button type="button" onClick={() => { setQuizStarted(false); setFinished(false); }} style={{ flex: 1, padding: '13px 0', borderRadius: 12, background: 'var(--bg2)', color: 'var(--ink2)', border: '1px solid var(--border)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ⚙ Neue Auswahl
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => shareScoreCard({ score, total: questions.length, title: `${catName} · Vokabel-Quiz` })}
                  style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'var(--green)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  📤 Teilen
                </button>
                <button
                  type="button"
                  onClick={createFriendChallenge}
                  disabled={challengeBusy}
                  style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'var(--b1)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: challengeBusy ? 'wait' : 'pointer', fontFamily: 'inherit' }}
                >
                  {challengeBusy ? '⏳…' : '⚔️ Freund herausfordern'}
                </button>
              </div>
              {challengeLink && challengeLink !== 'error' && (
                <div style={{ marginTop: 10, background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11.5, color: 'var(--blue)', fontWeight: 600, marginBottom: 5 }}>⚔️ Herausforderungs-Link (kopiert):</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input readOnly value={challengeLink} onFocus={e => e.currentTarget.select()}
                      style={{ flex: 1, fontSize: 11.5, padding: '6px 8px', borderRadius: 7, border: '1px solid var(--blue-bd)', background: 'var(--bg)', color: 'var(--ink2)', fontFamily: 'inherit', minWidth: 0 }} />
                    <button onClick={() => navigator.clipboard?.writeText(challengeLink)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 7, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Kopieren</button>
                  </div>
                </div>
              )}
              {challengeLink === 'error' && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--red)' }}>Herausforderung konnte nicht erstellt werden. Bist du angemeldet?</div>
              )}
            </div>

          ) : (

            /* ── Active quiz ── */
            <div className="quiz-page" style={{ padding: '28px 40px', maxWidth: 560 }}>
              {/* Progress */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Frage {qIdx + 1} / {questions.length}</span>
                    {current && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: LEVEL_BG[current.level], color: LEVEL_COLOR[current.level], fontWeight: 700, border: `1px solid ${LEVEL_COLOR[current.level]}30` }}>
                        {current.catEmoji} {current.catTitle}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>✓ {score}</span>
                </div>
                <div style={{ height: 6, borderRadius: 100, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, background: 'var(--blue)', transition: 'width .4s ease', width: `${pct}%` }} />
                </div>
              </div>

              {/* Question card */}
              {current && (
                <div>
                  <div style={{
                    background: 'var(--bg)',
                    border: `2px solid ${LEVEL_COLOR[current.level]}30`,
                    borderRadius: 20, padding: '40px 28px', textAlign: 'center',
                    marginBottom: 18, boxShadow: 'var(--sh-md)', position: 'relative',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: LEVEL_COLOR[current.level], textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
                      Was bedeutet auf Englisch?
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-lora)', fontSize: 36, fontWeight: 800,
                      color: 'var(--ink)', letterSpacing: '-.5px', marginBottom: 12, lineHeight: 1.2, wordBreak: 'break-word',
                    }}>
                      {current.word}
                    </div>
                    <button
                      type="button"
                      onClick={() => speak(current.word)}
                      title="Vorlesen"
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        border: '1.5px solid var(--blue-bd)', background: 'var(--blue-bg)',
                        color: 'var(--blue)', cursor: 'pointer', fontSize: 14,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .15s',
                      }}
                    >🔊</button>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {current.options.map(opt => {
                      const isSelected = selected === opt;
                      const isCorrect = opt === current.correct;
                      const isWrong = selected !== null && isSelected && !isCorrect;
                      const isGreenHint = selected !== null && isCorrect;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => choose(opt)}
                          disabled={selected !== null}
                          style={{
                            padding: '14px 16px', borderRadius: 14, border: '2px solid',
                            fontSize: 13, fontWeight: 600, cursor: selected !== null ? 'default' : 'pointer',
                            fontFamily: 'inherit', transition: 'all .2s', textAlign: 'left', lineHeight: 1.4,
                            background: isGreenHint ? 'var(--green-bg)' : isWrong ? 'var(--red-bg)' : isSelected ? 'var(--blue-bg)' : 'var(--bg)',
                            borderColor: isGreenHint ? 'var(--green-bd)' : isWrong ? 'var(--red-bd)' : isSelected ? 'var(--blue)' : 'var(--border)',
                            color: isGreenHint ? 'var(--green)' : isWrong ? 'var(--red)' : isSelected ? 'var(--blue)' : 'var(--ink2)',
                            boxShadow: isGreenHint || isSelected ? 'var(--sh)' : 'none',
                            transform: isGreenHint ? 'scale(1.02)' : 'scale(1)',
                          }}
                        >
                          {isGreenHint ? '✓ ' : isWrong ? '✗ ' : ''}{opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Weiter / End */}
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {canAdvance && (
                      <button
                        type="button"
                        onClick={advanceQuestion}
                        style={{
                          width: '100%', padding: '13px 0', borderRadius: 12,
                          background: 'var(--blue)', color: '#fff',
                          border: 'none', fontSize: 15, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          boxShadow: 'var(--sh-md)', transition: 'background .15s',
                          animation: 'slide-up .18s ease both',
                        }}
                      >
                        {qIdx + 1 >= questions.length ? '🏁 Ergebnis ansehen' : 'Weiter →'}
                      </button>
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => { setQuizStarted(false); setFinished(false); setCanAdvance(false); }}
                        style={{ fontSize: 11.5, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      >
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
        <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Quiz-Gruppen">
          {categoryList}
        </MobileFilterDrawer>
      )}
    </div>
  );
}
