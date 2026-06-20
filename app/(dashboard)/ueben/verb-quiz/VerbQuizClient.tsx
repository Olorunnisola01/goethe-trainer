'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { useResizableSidebar } from '@/components/layout/ResizableSidebar';
import { translateToEnglish } from '@/lib/translateGerman';

/* ─── Types ─────────────────────────────────────────────────── */
type Level     = 'A1' | 'A2';
type VerbType  = 'Regular' | 'Irregular';
type Tense     = 'Präsens' | 'Präteritum' | 'Perfekt';
type Format    = 'Multiple Choice' | 'Fill-in-the-Gap';

interface VerbQuestion {
  id: string;
  level: Level;
  verbType: VerbType;
  tense: Tense;
  format: Format;
  verb: string;
  person: string;
  q: string;
  opts?: string[];
  ans?: number;
  prompt?: string;
  correct: string;
  sentence?: string;
  alt?: string;      // alternative accepted answer (conjugated verb without prefix/pronoun)
  sep?: boolean;     // separable verb
  ch: string;
  tip: string;
}

const QUESTIONS_PER_SESSION = 10;

/* ─── Verb → English meaning lookup ─────────────────────────── */
const VERB_EN: Record<string, string> = {
  sein: 'to be', haben: 'to have', werden: 'to become / will',
  gehen: 'to go', kommen: 'to come', machen: 'to do / make',
  sehen: 'to see', geben: 'to give', nehmen: 'to take',
  sagen: 'to say', fragen: 'to ask', wissen: 'to know (a fact)',
  können: 'can / to be able to', müssen: 'must / to have to',
  wollen: 'to want to', sollen: 'to be supposed to',
  dürfen: 'may / to be allowed to', mögen: 'to like',
  fahren: 'to drive / travel', laufen: 'to run / walk',
  lesen: 'to read', schreiben: 'to write', sprechen: 'to speak',
  hören: 'to hear / listen', arbeiten: 'to work', spielen: 'to play',
  trinken: 'to drink', essen: 'to eat', kaufen: 'to buy',
  verkaufen: 'to sell', helfen: 'to help', denken: 'to think',
  glauben: 'to believe', finden: 'to find', bringen: 'to bring',
  beginnen: 'to begin', schlafen: 'to sleep', stehen: 'to stand',
  sitzen: 'to sit', wohnen: 'to live / reside', heißen: 'to be called',
  kennen: 'to know (a person)', lernen: 'to learn',
  verstehen: 'to understand', öffnen: 'to open', schließen: 'to close',
  warten: 'to wait', zeigen: 'to show', legen: 'to lay / put',
  stellen: 'to place / set', fallen: 'to fall', halten: 'to hold / stop',
  lassen: 'to let / leave', führen: 'to lead / guide',
  ziehen: 'to pull / move', steigen: 'to climb / rise',
  treffen: 'to meet / hit', tragen: 'to carry / wear',
  schlagen: 'to hit / beat', rufen: 'to call / shout',
  folgen: 'to follow', landen: 'to land', reisen: 'to travel',
  buchen: 'to book', bezahlen: 'to pay', kochen: 'to cook',
  putzen: 'to clean', wechseln: 'to change / exchange',
};

/* ─── Reconstruct full sentence from q + correct form ──────── */
function buildFullSentence(q: string, correct: string, sentence?: string): string {
  if (sentence) return sentence;
  const first = q.split('\n')[0];
  // Replace ___ blanks or [verb] tokens with the correct form
  return first.replace(/_{3,}|\[[\wäöüÄÖÜß/'\s]+\]/g, correct);
}

/* ─── Display the question sentence with a clean blank ─────────
   The Fill-in-the-Gap data embeds the infinitive as "[verb]"; show a neat
   underscore gap instead so the instruction isn't mixed into the sentence. */
function cleanQuestionSentence(q: string): string {
  return q.split('\n')[0].replace(/\[[^\]]*\]/g, '_____');
}

const SEP_PREFIXES_CLIENT = new Set([
  'ab','an','auf','aus','ein','mit','nach','vor','zu','zurück','weg','fest',
  'los','her','hin','um','bei','durch','über','unter','wieder','fort','heim',
  'statt','zusammen','teil','frei','nieder','empor','voran','bereit','wahr',
]);

/* ─── Build the question with a blank at EACH position the verb form occupies ───
   Split forms (Perfekt "seid … gegangen", separable "rufe … an") put their parts
   in different places, so we blank each part of `correct` where it actually sits
   in the corrected full sentence. Single-word forms get one blank, as before. */
function questionWithBlanks(sentence: string, correct: string): string {
  if (!sentence) return '_____';
  const strip = (w: string) => w.replace(/^[^\wäöüÄÖÜß]+|[^\wäöüÄÖÜß]+$/g, '').toLowerCase();
  const parts = correct.trim().split(/\s+/).filter(Boolean);
  const words = sentence.split(/\s+/);
  const cores = words.map(strip);
  const used  = new Array(words.length).fill(false);

  for (const part of parts) {
    const p = part.toLowerCase();
    let idx = -1;
    if (SEP_PREFIXES_CLIENT.has(p)) {                 // prefix sits at the clause end
      for (let i = words.length - 1; i >= 0; i--) if (!used[i] && cores[i] === p) { idx = i; break; }
    } else {                                          // verb / aux / participle / pronoun
      for (let i = 0; i < words.length; i++) if (!used[i] && cores[i] === p) { idx = i; break; }
    }
    if (idx >= 0) used[idx] = true;
  }

  return words.map((w, i) => {
    if (!used[i]) return w;
    const lead  = (w.match(/^[^\wäöüÄÖÜß]+/) || [''])[0];
    const trail = (w.match(/[^\wäöüÄÖÜß]+$/) || [''])[0];
    return lead + '_____' + trail;
  }).join(' ');
}

/* The displayed question for an item — multi-blank when a corrected sentence exists. */
function displayQuestion(q: string, correct: string, sentence?: string): string {
  const full = sentence ?? buildFullSentence(q, correct);
  return full ? questionWithBlanks(full, correct) : cleanQuestionSentence(q);
}

/* ─── Highlight the conjugated verb (each part) inside a sentence ───
   Separable/Perfekt forms split across the clause ("heben … ab",
   "bin … gewesen"), so highlight every token of `correct`. */
function highlightCorrect(sentence: string, correct: string) {
  const parts = correct.trim().split(/\s+/).filter(Boolean);
  // Build a regex matching any of the form's words as whole words.
  const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(^|[^\\wäöüÄÖÜß])(' + parts.map(esc).join('|') + ')(?=[^\\wäöüÄÖÜß]|$)', 'gi');
  const out: React.ReactNode[] = [];
  let last = 0, m: RegExpExecArray | null, key = 0;
  while ((m = re.exec(sentence)) !== null) {
    const wordStart = m.index + m[1].length;
    out.push(sentence.slice(last, wordStart));
    out.push(
      <mark key={key++} style={{ background: 'var(--blue-bg)', color: 'var(--blue)', borderRadius: 4, padding: '0 3px', fontWeight: 700 }}>
        {m[2]}
      </mark>
    );
    last = wordStart + m[2].length;
    if (re.lastIndex === m.index) re.lastIndex++;   // avoid zero-width loop
  }
  out.push(sentence.slice(last));
  return <>{out}</>;
}

/* ─── Utils ─────────────────────────────────────────────────── */
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
    i % 2 === 1 ? <strong key={i} style={{ fontWeight: 600, color: 'var(--blue)' }}>{part}</strong>
                : <span key={i}>{part}</span>
  );
}

/* ─── Sidebar filter item ────────────────────────────────────── */
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

/* ─── Section heading in sidebar ─────────────────────────────── */
function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '14px 14px 4px',
      fontSize: 9.5,
      fontWeight: 700,
      color: 'var(--muted)',
      textTransform: 'uppercase',
      letterSpacing: '.08em',
    }}>
      {children}
    </div>
  );
}

/* ─── Divider ────────────────────────────────────────────────── */
function SideDivider() {
  return <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />;
}

/* ─── Main ───────────────────────────────────────────────────── */
export function VerbQuizClient() {
  const { user } = useAuth();
  const { trackQuiz } = useProgress(user?.uid ?? null);
  const uid = user?.uid ?? 'guest';
  const storageKey = `verbquiz_${uid}`;

  /* Data */
  const [allItems, setAllItems] = useState<VerbQuestion[]>([]);
  const [loading, setLoading]   = useState(true);

  /* Filters */
  const [levelFilter,  setLevelFilter]  = useState<'ALL' | Level>('ALL');
  const [typeFilter,   setTypeFilter]   = useState<'ALL' | VerbType>('ALL');
  const [tenseFilter,  setTenseFilter]  = useState<'ALL' | Tense>('ALL');
  const [formatFilter, setFormatFilter] = useState<'ALL' | Format>('ALL');

  /* Quiz */
  const [questions, setQuestions] = useState<VerbQuestion[]>([]);
  const [qIdx,      setQIdx]      = useState(0);
  const [score,     setScore]     = useState(0);
  const [finished,  setFinished]  = useState(false);
  const [history,   setHistory]   = useState<{
    q: string; correct: string; chosen: string; isCorrect: boolean; tip: string; format: Format; sentence?: string;
  }[]>([]);

  /* MC */
  const [selected, setSelected] = useState<number | null>(null);

  /* FITG */
  const [typed,    setTyped]    = useState('');
  const [fitgDone, setFitgDone] = useState(false);
  const [fitgOk,   setFitgOk]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* English translation of the revealed sentence */
  const [enText,    setEnText]    = useState<string | null>(null);
  const [enLoading, setEnLoading] = useState(false);

  /* Mobile filter drawer */
  const [filterOpen, setFilterOpen] = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Lifetime stats */
  const [savedScore, setSavedScore] = useState({ attempts: 0, correct: 0 });
  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw) setSavedScore(JSON.parse(raw)); }
    catch { /* ignore */ }
  }, [storageKey]);

  /* Load */
  useEffect(() => {
    fetch('/data/verbquiz.json')
      .then(r => r.json())
      .then((d: VerbQuestion[]) => { setAllItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* Pool */
  const pool = useMemo(() => {
    let items = allItems;
    if (levelFilter  !== 'ALL') items = items.filter(i => i.level    === levelFilter);
    if (typeFilter   !== 'ALL') items = items.filter(i => i.verbType === typeFilter);
    if (tenseFilter  !== 'ALL') items = items.filter(i => i.tense    === tenseFilter);
    if (formatFilter !== 'ALL') items = items.filter(i => i.format   === formatFilter);
    return items;
  }, [allItems, levelFilter, typeFilter, tenseFilter, formatFilter]);

  /* Start */
  const startQuiz = useCallback(() => {
    const qs = shuffle(pool).slice(0, QUESTIONS_PER_SESSION);
    setQuestions(qs);
    setQIdx(0); setSelected(null); setScore(0); setFinished(false); setHistory([]);
    setTyped(''); setFitgDone(false); setFitgOk(false);
  }, [pool]);

  useEffect(() => {
    if (!loading && pool.length > 0) startQuiz();
  }, [loading, pool, startQuiz]);

  useEffect(() => {
    if (!finished && questions[qIdx]?.format === 'Fill-in-the-Gap')
      setTimeout(() => inputRef.current?.focus(), 80);
  }, [qIdx, finished, questions]);

  const current = questions[qIdx];
  const { asideStyle, DragHandle, collapsed, SidebarToggle } = useResizableSidebar();

  /* When an answer is revealed, fetch the English translation of the full sentence. */
  useEffect(() => {
    const revealed = selected !== null || fitgDone;
    if (finished || !current || !revealed) { setEnText(null); setEnLoading(false); return; }
    const de = buildFullSentence(current.q, current.correct, current.sentence);
    let cancelled = false;
    setEnText(null); setEnLoading(true);
    translateToEnglish(de)
      .then(t => { if (!cancelled) { setEnText(t); setEnLoading(false); } })
      .catch(() => { if (!cancelled) { setEnText(null); setEnLoading(false); } });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, fitgDone, qIdx, finished]);

  const recordAnswer = (isCorrect: boolean, chosen: string) => {
    if (!current) return;
    if (isCorrect) setScore(s => s + 1);
    trackQuiz(isCorrect);
    const next = { attempts: savedScore.attempts + 1, correct: savedScore.correct + (isCorrect ? 1 : 0) };
    setSavedScore(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
    setHistory(h => [...h, { q: current.q, correct: current.correct, chosen, isCorrect, tip: current.tip, format: current.format, sentence: current.sentence }]);
  };

  const chooseMC = (optIdx: number) => {
    if (selected !== null || !current?.opts) return;
    setSelected(optIdx);
    recordAnswer(optIdx === current.ans, current.opts[optIdx]);
  };

  const submitFITG = () => {
    if (fitgDone) return;
    const ans = typed.trim().toLowerCase();
    // Accept the full form OR the conjugated-verb-only form for separable/reflexive verbs.
    const accepted = [current.correct, current.alt]
      .filter(Boolean)
      .map(a => (a as string).toLowerCase());
    const isCorrect = accepted.includes(ans);
    setFitgDone(true); setFitgOk(isCorrect);
    recordAnswer(isCorrect, typed.trim());
  };

  const nextQ = () => {
    if (qIdx + 1 >= questions.length) { setFinished(true); return; }
    setQIdx(i => i + 1);
    setSelected(null); setTyped(''); setFitgDone(false); setFitgOk(false);
  };

  /* ─── Loading ── */
  if (loading) return (
    <div className="gram-layout" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
    </div>
  );

  const pct = savedScore.attempts > 0 ? Math.round((savedScore.correct / savedScore.attempts) * 100) : 0;

  /* ─── Render ── */
  return (
    <div className="gram-layout">

      {/* Mobile overlay behind filter drawer */}
      {isMobile && filterOpen && (
        <div
          onClick={() => setFilterOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 198 }}
        />
      )}

      {/* ═══════════════ LEFT SIDEBAR — FILTERS ═══════════════ */}
      {!isMobile && !collapsed && (
      <aside
        className="gram-toc"
        style={isMobile ? {
          position:  'fixed',
          top: 0,
          left: filterOpen ? 0 : -230,
          height: '100vh',
          width: 220,
          zIndex: 199,
          transition: 'left .25s cubic-bezier(.4,0,.2,1)',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          overflowX: 'hidden',
          overflowY: 'auto',
          paddingTop: 52,
          borderRight: '1px solid var(--border)',
          borderBottom: 'none',
        } : asideStyle}
      >
        {/* Mobile close button inside drawer */}
        {isMobile && (
          <button
            onClick={() => setFilterOpen(false)}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg2)',
              cursor: 'pointer', fontSize: 14, fontWeight: 700,
              color: 'var(--ink2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        )}
        {isMobile && (
          <div style={{ padding: '0 14px 8px', fontSize: 11, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            ⚙ Filter
          </div>
        )}

        {/* Level */}
        <SideHeading>Level</SideHeading>
        <SideItem active={levelFilter === 'ALL'} onClick={() => setLevelFilter('ALL')}>
          <span>📖</span><span>Alle Level</span>
        </SideItem>
        <SideItem active={levelFilter === 'A1'} onClick={() => setLevelFilter('A1')} indent>
          <span className="lvl lvl-a1" style={{ fontSize: 8, padding: '1px 4px' }}>A1</span>
          <span>A1 — Grundstufe</span>
        </SideItem>
        <SideItem active={levelFilter === 'A2'} onClick={() => setLevelFilter('A2')} indent>
          <span className="lvl lvl-a2" style={{ fontSize: 8, padding: '1px 4px' }}>A2</span>
          <span>A2 — Grundstufe</span>
        </SideItem>

        <SideDivider />

        {/* Verb Type */}
        <SideHeading>Verbtyp</SideHeading>
        <SideItem active={typeFilter === 'ALL'} onClick={() => setTypeFilter('ALL')}>
          <span>🔡</span><span>Alle Verben</span>
        </SideItem>
        <SideItem active={typeFilter === 'Regular'} onClick={() => setTypeFilter('Regular')} indent>
          <span>✅</span><span>Regelmäßig</span>
        </SideItem>
        <SideItem active={typeFilter === 'Irregular'} onClick={() => setTypeFilter('Irregular')} indent>
          <span>⚡</span><span>Unregelmäßig</span>
        </SideItem>

        <SideDivider />

        {/* Tense */}
        <SideHeading>Zeitform</SideHeading>
        <SideItem active={tenseFilter === 'ALL'} onClick={() => setTenseFilter('ALL')}>
          <span>🕐</span><span>Alle Zeiten</span>
        </SideItem>
        <SideItem active={tenseFilter === 'Präsens'} onClick={() => setTenseFilter('Präsens')} indent>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block', flexShrink: 0 }} />
          <span>Präsens</span>
        </SideItem>
        <SideItem active={tenseFilter === 'Präteritum'} onClick={() => setTenseFilter('Präteritum')} indent>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block', flexShrink: 0 }} />
          <span>Präteritum</span>
        </SideItem>
        <SideItem active={tenseFilter === 'Perfekt'} onClick={() => setTenseFilter('Perfekt')} indent>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block', flexShrink: 0 }} />
          <span>Perfekt</span>
        </SideItem>

        <SideDivider />

        {/* Format */}
        <SideHeading>Format</SideHeading>
        <SideItem active={formatFilter === 'ALL'} onClick={() => setFormatFilter('ALL')}>
          <span>🎯</span><span>Alle Formate</span>
        </SideItem>
        <SideItem active={formatFilter === 'Multiple Choice'} onClick={() => setFormatFilter('Multiple Choice')} indent>
          <span>🔘</span><span>Multiple Choice</span>
        </SideItem>
        <SideItem active={formatFilter === 'Fill-in-the-Gap'} onClick={() => setFormatFilter('Fill-in-the-Gap')} indent>
          <span>⌨️</span><span>Lückentext</span>
        </SideItem>

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
      </aside>
      )}

      {/* Drag-to-resize handle (desktop only) */}
      {!isMobile && !collapsed && <DragHandle />}

      {/* ═══════════════ RIGHT CONTENT — QUIZ ═══════════════ */}
      <div className="gram-content">
        <div className="gch active">

          {/* Title */}
          <div className="gch-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>🔤 Verb-Konjugations-Quiz</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isMobile && <SidebarToggle />}
              {/* Mobile filter toggle */}
              {isMobile && (
                <button
                onClick={() => setFilterOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8,
                  border: '1.5px solid var(--blue-bd)', background: 'var(--blue-bg)',
                  color: 'var(--blue)', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ⚙ Filter
              </button>
            )}
            </div>
          </div>
          <div className="gch-sub">
            {questions.length > 0 && !finished
              ? `Frage ${qIdx + 1} von ${questions.length} · ${score} richtig`
              : `${pool.length.toLocaleString()} Fragen verfügbar · 200 Verben · A1 & A2`}
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
                  <div style={{ fontSize: 40 }}>{score >= QUESTIONS_PER_SESSION * 0.8 ? '🏆' : score >= QUESTIONS_PER_SESSION * 0.5 ? '📚' : '💪'}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-lora, Lora), serif' }}>
                    {score} / {questions.length}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85 }}>
                    {score === questions.length ? 'Perfekt — weiter so!' : score >= questions.length * 0.8 ? 'Sehr gut gemacht!' : 'Weiter üben — du schaffst das!'}
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
                      background: h.isCorrect ? 'var(--green-bg)' : 'var(--red-bg)',
                      borderLeft: `3px solid ${h.isCorrect ? 'var(--green)' : 'var(--red)'}`,
                    }}>
                      <span style={{ fontWeight: 700, color: h.isCorrect ? 'var(--green)' : 'var(--red)', flexShrink: 0, fontSize: 14 }}>
                        {h.isCorrect ? '✓' : '✗'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontFamily: 'var(--font-lora, Lora), serif',
                          fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.5,
                        }}>
                          {displayQuestion(h.q, h.correct, h.sentence)}
                        </div>
                        {!h.isCorrect && (
                          <div style={{ marginTop: 6, fontSize: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            <span style={{ color: 'var(--red)' }}>
                              Deine Antwort: <b style={{ fontFamily: 'var(--font-lora, Lora), serif' }}>{h.chosen || '—'}</b>
                            </span>
                            <span style={{ color: 'var(--green)' }}>
                              Richtig: <b style={{ fontFamily: 'var(--font-lora, Lora), serif' }}>{h.correct}</b>
                            </span>
                          </div>
                        )}
                        {!h.isCorrect && (
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
                  {/* Badges row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    <span className={`lvl lvl-${current.level.toLowerCase()}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                      {current.level}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600,
                      border: '1px solid',
                      ...(current.tense === 'Präsens'
                        ? { background: 'var(--blue-bg)', color: 'var(--blue)', borderColor: 'var(--blue-bd)' }
                        : current.tense === 'Präteritum'
                          ? { background: 'var(--b1-bg)', color: 'var(--b1)', borderColor: 'var(--b1-bd)' }
                          : { background: 'var(--green-bg)', color: 'var(--green)', borderColor: 'var(--green-bd)' })
                    }}>
                      {current.tense}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600,
                      background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)',
                    }}>
                      {current.verbType === 'Regular' ? 'Regelmäßig' : 'Unregelmäßig'}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 100, fontWeight: 600,
                      background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)',
                      marginLeft: 'auto',
                    }}>
                      {current.format === 'Multiple Choice' ? '🔘 MC' : '⌨️ Lückentext'}
                    </span>
                  </div>

                  {/* Infinitive */}
                  <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-lora, Lora), serif',
                      fontSize: 22, fontWeight: 700, color: 'var(--ink)',
                      background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)',
                      padding: '4px 20px', borderRadius: 8,
                    }}>
                      {current.verb}
                    </span>
                    <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                      · {current.person}
                    </span>
                  </div>

                  {/* Sentence */}
                  <div className="g-ex" style={{ justifyContent: 'center', borderLeft: 'none', background: 'var(--bg2)' }}>
                    <p style={{
                      fontFamily: 'var(--font-lora, Lora), serif',
                      fontSize: 17, fontWeight: 600, fontStyle: 'italic',
                      color: 'var(--ink)', textAlign: 'center', lineHeight: 1.7, margin: 0,
                    }}>
                      {displayQuestion(current.q, current.correct, current.sentence)}
                    </p>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
                    {current.q.split('\n')[1]}
                  </p>
                </div>

                {/* FITG hint */}
                {current.format === 'Fill-in-the-Gap' && current.prompt && (
                  <div style={{ padding: '10px 20px', background: 'var(--faint)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Hinweis:</span>
                    <span style={{
                      fontFamily: 'var(--font-lora, Lora), serif',
                      fontSize: 15, fontWeight: 700, letterSpacing: 3,
                      color: 'var(--blue)', background: 'var(--blue-bg)',
                      border: '1px solid var(--blue-bd)', borderRadius: 6,
                      padding: '2px 12px',
                    }}>
                      {current.prompt}
                    </span>
                  </div>
                )}
              </div>

              {/* MC Options */}
              {current.format === 'Multiple Choice' && current.opts && (
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
                        onClick={() => chooseMC(i)}
                        disabled={isDone}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 16px', borderRadius: 8,
                          border: `1.5px solid ${border}`,
                          background: bg, color,
                          cursor: isDone ? 'default' : 'pointer',
                          textAlign: 'left', width: '100%',
                          fontFamily: 'var(--font-jakarta, Plus Jakarta Sans), sans-serif',
                          fontSize: 13.5, fontWeight: 500,
                          transition: 'border-color .15s, background .15s',
                          boxShadow: 'var(--sh)',
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

                        {/* Option text — Lora for the conjugated form */}
                        <span style={{
                          fontFamily: 'var(--font-lora, Lora), serif',
                          fontSize: 15, fontWeight: 600,
                        }}>
                          {opt}
                        </span>

                        {/* Tick/Cross */}
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
              )}

              {/* FITG Input */}
              {current.format === 'Fill-in-the-Gap' && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={typed}
                      onChange={e => setTyped(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !fitgDone) submitFITG(); }}
                      disabled={fitgDone}
                      placeholder="Konjugierte Form eingeben…"
                      style={{
                        flex: 1, padding: '11px 16px', borderRadius: 8, fontSize: 15, fontWeight: 600,
                        fontFamily: 'var(--font-lora, Lora), serif',
                        border: `1.5px solid ${fitgDone ? fitgOk ? 'var(--green)' : 'var(--red)' : 'var(--border)'}`,
                        background: fitgDone ? fitgOk ? 'var(--green-bg)' : 'var(--red-bg)' : 'var(--bg)',
                        color: fitgDone ? fitgOk ? 'var(--green)' : 'var(--red)' : 'var(--ink)',
                        outline: 'none', transition: 'border-color .15s',
                        boxShadow: 'var(--sh)',
                      }}
                      onFocus={e => { if (!fitgDone) e.currentTarget.style.borderColor = 'var(--blue)'; }}
                      onBlur={e => { if (!fitgDone) e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                    {!fitgDone && (
                      <button
                        onClick={submitFITG}
                        disabled={!typed.trim()}
                        style={{
                          padding: '11px 20px', borderRadius: 8,
                          background: 'var(--blue)', color: '#fff', fontSize: 13,
                          fontWeight: 600, border: 'none', cursor: typed.trim() ? 'pointer' : 'default',
                          fontFamily: 'inherit', opacity: typed.trim() ? 1 : 0.4, transition: 'background .15s',
                        }}
                        onMouseEnter={e => { if (typed.trim()) (e.currentTarget.style.background = '#1e40af'); }}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue)')}
                      >
                        OK
                      </button>
                    )}
                  </div>
                  {fitgDone && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12.5 }}>
                      {!fitgOk && (
                        <span style={{ color: 'var(--red)' }}>
                          ✗ Deine Antwort:{' '}
                          <b style={{ fontFamily: 'var(--font-lora, Lora), serif' }}>{typed || '—'}</b>
                        </span>
                      )}
                      <span style={{ color: fitgOk ? 'var(--green)' : 'var(--muted)' }}>
                        {fitgOk ? '✓ Richtig!' : `Richtig: `}
                        {!fitgOk && <b style={{ color: 'var(--green)', fontFamily: 'var(--font-lora, Lora), serif' }}>{current.correct}</b>}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Post-answer panel ── */}
              {(selected !== null || fitgDone) && (() => {
                const fullSentence = buildFullSentence(current.q, current.correct, current.sentence);
                const verbEn = VERB_EN[current.verb.toLowerCase()];
                const isRight = current.format === 'Multiple Choice'
                  ? selected === current.ans
                  : fitgOk;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* ✅ Full correct answer card */}
                    <div style={{
                      borderRadius: 10, overflow: 'hidden',
                      border: `1.5px solid ${isRight ? 'var(--green-bd, #6ee7b7)' : 'var(--blue-bd)'}`,
                      boxShadow: '0 2px 10px rgba(0,0,0,.06)',
                    }}>
                      {/* Header */}
                      <div style={{
                        padding: '8px 16px',
                        background: isRight ? 'var(--green-bg)' : 'var(--blue-bg)',
                        borderBottom: `1px solid ${isRight ? 'var(--green-bd, #6ee7b7)' : 'var(--blue-bd)'}`,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: isRight ? 'var(--green)' : 'var(--blue)' }}>
                          {isRight ? '✓' : '→'} Richtige Antwort
                        </span>
                        {verbEn && (
                          <span style={{
                            marginLeft: 'auto', fontSize: 11, fontWeight: 600,
                            color: 'var(--muted)', fontStyle: 'italic',
                          }}>
                            {current.verb} = &ldquo;{verbEn}&rdquo;
                          </span>
                        )}
                      </div>
                      {/* Full sentence */}
                      <div style={{ padding: '12px 18px', background: 'var(--bg)' }}>
                        <p style={{
                          fontFamily: 'var(--font-lora, Lora), serif',
                          fontSize: 17, fontWeight: 600, margin: 0, lineHeight: 1.6,
                          color: 'var(--ink)',
                        }}>
                          {highlightCorrect(fullSentence, current.correct)}
                        </p>
                        {/* English translation of the FULL sentence */}
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', flexShrink: 0 }}>
                            🇬🇧 English
                          </span>
                          <span style={{ fontSize: 13.5, color: 'var(--ink2)', fontStyle: 'italic', lineHeight: 1.5 }}>
                            {enLoading ? 'Translating…' : enText ? enText : '—'}
                          </span>
                        </div>
                        {/* Form reference line */}
                        <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--muted)' }}>
                          {current.verb} ({current.tense}, {current.person}) →{' '}
                          <strong style={{ color: 'var(--blue)', fontFamily: 'var(--font-lora, Lora), serif' }}>
                            {current.correct}
                          </strong>
                          {verbEn ? ` · "${verbEn}"` : ''}
                        </div>
                      </div>
                    </div>

                    {/* 💡 Grammar tip */}
                    <div style={{
                      padding: '10px 16px', fontSize: 12.5, color: 'var(--amber)',
                      background: 'var(--amber-bg)', borderRadius: 8,
                      border: '1px solid var(--amber-bd, #fcd34d)',
                      display: 'flex', gap: 8, alignItems: 'flex-start',
                    }}>
                      <span style={{ flexShrink: 0 }}>💡</span>
                      <span>{renderTip(current.tip)}</span>
                    </div>

                    {/* Next button */}
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
                );
              })()}
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
