'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from '@/components/layout/MobileFilterDrawer';
import { useResizableSidebar } from '@/components/layout/ResizableSidebar';
import { translateToEnglish } from '@/lib/translateGerman';
import { speakDE, speakEN, warmUpVoices, warmUpEnglishVoice } from '@/lib/cloudVoice';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface SatzItem {
  id: string;
  level: Level;
  topic: string;
  words: string[];   // scrambled
  answer: string[];  // correct token order
  correct: string;   // correct sentence (display)
  tip: string;
  structure: string; // English grammar pattern
}

/* ─── drag token (with unique instance id) ─────────────────── */
interface Token {
  uid: string;
  word: string;
}

const QUESTIONS_PER_SESSION = 10;

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

function toTokens(words: string[]): Token[] {
  return words.map((w, i) => ({ uid: `${w}-${i}`, word: w }));
}

/* ─── Sidebar helpers ────────────────────────────────────────── */
function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '14px 14px 4px', fontSize: 9.5, fontWeight: 700,
      color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em',
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

const TOPIC_ICONS: Record<string, string> = {
  'sein': '🔵', 'haben': '🟢', 'W-Fragen': '❓',
  'Ja/Nein-Fragen': '🔘', 'Negation': '🚫', 'Verben': '⚡',
  'Zeit': '🕐', 'Familie': '👨‍👩‍👧', 'Zahlen': '🔢',
  'Grundsätze': '📝', 'Trennbare Verben': '✂️', 'Modalverben': '🎯',
  'Perfekt': '✅', 'TeKaMoLo': '📐', 'Dativ': '📍',
  'Präpositionen': '🔗', 'Komparativ': '📊', 'Imperativ': '📣',
  'weil-Satz': '💡', 'dass-Satz': '💬', 'ob-Satz': '🤔',
  'wenn-Satz': '🔀', 'Relativsatz': '🔍', 'Passiv': '🔄',
  'Konjunktiv II': '🌟',
  'Konnektoren': '🧩', 'Doppelkonnektoren': '🪢', 'Temporalsätze': '⏳',
  'Finalsätze': '🏁', 'Infinitiv mit zu': '➡️',
  'Partizipialkonstruktionen': '🎭', 'Vergleichssätze': '⚖️',
};

/* Grammatical category label per topic */
const TOPIC_CATEGORY: Record<string, string> = {
  'sein':             'SVO / V2',
  'haben':            'SVO / V2',
  'Verben':           'SVO / V2',
  'Familie':          'SVO / V2',
  'Zahlen':           'SVO / V2',
  'Zeit':             'SVO / V2',
  'Grundsätze':       'SVO / V2',
  'W-Fragen':         'W-Frage',
  'Ja/Nein-Fragen':   'Ja/Nein-Frage',
  'Negation':         'Negation',
  'Trennbare Verben': 'V2 + Präfix am Ende',
  'Modalverben':      'Modal + Infinitiv',
  'Perfekt':          'Perfekt (Hilfsverb + Partizip II)',
  'TeKaMoLo':         'TeKaMoLo',
  'Dativ':            'Dativ',
  'Präpositionen':    'Präpositionalphrase',
  'Komparativ':       'Komparativ',
  'Imperativ':        'Imperativ',
  'weil-Satz':        'Nebensatz (SOV)',
  'dass-Satz':        'Nebensatz (SOV)',
  'ob-Satz':          'Nebensatz (SOV)',
  'wenn-Satz':        'Nebensatz (SOV)',
  'Relativsatz':      'Relativsatz (SOV)',
  'Passiv':           'Vorgangspassiv',
  'Konjunktiv II':    'Konjunktiv II',
  'Konnektoren':              'Konnektor (Position 0/1)',
  'Doppelkonnektoren':        'Doppelkonnektor',
  'Temporalsätze':            'Nebensatz (SOV)',
  'Finalsätze':               'Finalsatz',
  'Infinitiv mit zu':         'Infinitiv mit zu',
  'Partizipialkonstruktionen':'Partizip I als Adjektiv',
  'Vergleichssätze':          'je...desto/umso',
};

/* Short description shown under the category badge */
const CATEGORY_DESC: Record<string, string> = {
  'SVO / V2':                        'Subject → Verb (position 2) → Object/rest. The finite verb always holds position 2 in a main clause.',
  'W-Frage':                         'Question word → Verb → Subject → rest. The verb stays in position 2 after the question word.',
  'Ja/Nein-Frage':                   'Verb → Subject → rest. The verb moves to position 1; no question word needed.',
  'Negation':                        '"nicht" negates verbs/adjectives and goes near the end. "kein" replaces the indefinite article.',
  'V2 + Präfix am Ende':             'The base verb holds position 2; its separable prefix is sent to the very end of the clause.',
  'Modal + Infinitiv':               'Modal verb in position 2 + … + Infinitive at the end. The main verb appears in its base (infinitive) form.',
  'Perfekt (Hilfsverb + Partizip II)':'haben/sein in position 2 + … + past participle (Partizip II) at the very end.',
  'TeKaMoLo':                        'Adverbials follow the order: Time → Cause/Manner → Location. Multiple adverbs obey this fixed sequence.',
  'Dativ':                           'Indirect object (dative) comes before the direct object (accusative) when both are nouns.',
  'Präpositionalphrase':             'Preposition + noun phrase acts as a unit; its case (dative/accusative) depends on the preposition.',
  'Komparativ':                      'adjective + -er + als → comparison. The compared noun is introduced by "als" (than).',
  'Imperativ':                       'Verb in imperative form at position 1; subject "du/ihr/Sie" is often omitted.',
  'Nebensatz (SOV)':                 'Subordinating conjunction → Subject → … → Finite verb at the end. The verb is pushed to the final position.',
  'Relativsatz (SOV)':               'Relative pronoun → Subject (or pronoun) → … → Verb at the end. Agrees in gender/number with the antecedent noun.',
  'Vorgangspassiv':                  'werden + … + Partizip II. The agent (doer) can be added with "von + dative".',
  'Konjunktiv II':                   'würde + Infinitive, or special forms (wäre, hätte, könnte). Used for hypothetical or polite statements.',
  'Konnektor (Position 0/1)':       '"und/aber/oder/denn" (position 0) don\'t affect word order; "deshalb/trotzdem/also/dann/sonst" (position 1) trigger verb-subject inversion.',
  'Doppelkonnektor':                 'Two-part connectors (weder...noch, sowohl...als auch, nicht nur...sondern auch, entweder...oder, zwar...aber) link two clauses or elements as a pair.',
  'Finalsatz':                       '"um...zu" + infinitive expresses purpose with the same subject; "damit" introduces a purpose clause with its own verb-final word order.',
  'Infinitiv mit zu':                'Verb + … + "zu" + infinitive at the end, after verbs like versuchen/hoffen/planen, or in expressions like "Es ist... zu...".',
  'Partizip I als Adjektiv':         'Present participle (-end) used as an adjective before a noun, agreeing in case/gender/number like any other adjective.',
  'je...desto/umso':                 '"je" + comparative (verb-final) is paired with "desto/umso" + comparative (verb-second with inversion) to show proportional comparison.',
};

/* Color per category group */
const CATEGORY_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  'SVO / V2':                        { bg: 'var(--blue-bg)',   text: 'var(--blue)',  border: 'var(--blue-bd)' },
  'W-Frage':                         { bg: '#f0fdf4',          text: '#16a34a',      border: '#bbf7d0' },
  'Ja/Nein-Frage':                   { bg: '#f0fdf4',          text: '#16a34a',      border: '#bbf7d0' },
  'Negation':                        { bg: 'var(--red-bg)',    text: 'var(--red)',   border: '#fecaca' },
  'V2 + Präfix am Ende':             { bg: '#fdf4ff',          text: '#a21caf',      border: '#f0abfc' },
  'Modal + Infinitiv':               { bg: '#fdf4ff',          text: '#a21caf',      border: '#f0abfc' },
  'Perfekt (Hilfsverb + Partizip II)':{ bg: '#fdf4ff',         text: '#a21caf',      border: '#f0abfc' },
  'TeKaMoLo':                        { bg: 'var(--blue-bg)',   text: 'var(--blue)',  border: 'var(--blue-bd)' },
  'Dativ':                           { bg: 'var(--amber-bg)',  text: 'var(--amber)', border: '#fde68a' },
  'Präpositionalphrase':             { bg: 'var(--amber-bg)',  text: 'var(--amber)', border: '#fde68a' },
  'Komparativ':                      { bg: 'var(--amber-bg)',  text: 'var(--amber)', border: '#fde68a' },
  'Imperativ':                       { bg: 'var(--red-bg)',    text: 'var(--red)',   border: '#fecaca' },
  'Nebensatz (SOV)':                 { bg: '#f8fafc',          text: '#475569',      border: '#cbd5e1' },
  'Relativsatz (SOV)':               { bg: '#f8fafc',          text: '#475569',      border: '#cbd5e1' },
  'Vorgangspassiv':                  { bg: '#f8fafc',          text: '#475569',      border: '#cbd5e1' },
  'Konjunktiv II':                   { bg: '#fdf4ff',          text: '#a21caf',      border: '#f0abfc' },
  'Konnektor (Position 0/1)':        { bg: 'var(--blue-bg)',   text: 'var(--blue)',  border: 'var(--blue-bd)' },
  'Doppelkonnektor':                 { bg: '#f0fdf4',          text: '#16a34a',      border: '#bbf7d0' },
  'Finalsatz':                       { bg: '#fdf4ff',          text: '#a21caf',      border: '#f0abfc' },
  'Infinitiv mit zu':                { bg: 'var(--amber-bg)',  text: 'var(--amber)', border: '#fde68a' },
  'Partizip I als Adjektiv':         { bg: '#f8fafc',          text: '#475569',      border: '#cbd5e1' },
  'je...desto/umso':                 { bg: 'var(--red-bg)',    text: 'var(--red)',   border: '#fecaca' },
};

/* ─── Structure panel used in both active-question and review ── */
function StructurePanel({ topic, structure, tip, compact = false }: {
  topic: string; structure: string; tip: string; compact?: boolean;
}) {
  const cat   = TOPIC_CATEGORY[topic] ?? 'SVO / V2';
  const col   = CATEGORY_COLOR[cat] ?? CATEGORY_COLOR['SVO / V2'];
  const desc  = CATEGORY_DESC[cat] ?? '';
  const pad   = compact ? '8px 12px' : '11px 16px';
  const fSize = compact ? 11 : 12.5;

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>

      {/* Row 1 — category badge + pattern */}
      <div style={{
        padding: pad, borderBottom: '1px solid var(--border)',
        background: col.bg,
      }}>
        {/* Category badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '.08em',
            textTransform: 'uppercase', color: col.text,
            background: 'rgba(255,255,255,.55)', border: `1px solid ${col.border}`,
            borderRadius: 100, padding: '2px 8px',
          }}>
            {cat}
          </span>
          <span style={{ fontSize: 9, fontWeight: 600, color: col.text, opacity: .7, textTransform: 'uppercase', letterSpacing: '.07em' }}>
            📐 Sentence Structure
          </span>
        </div>
        {/* Pattern */}
        <div style={{
          fontFamily: 'var(--font-lora,Lora),serif',
          fontSize: compact ? 12.5 : 13.5, fontWeight: 600,
          color: col.text, letterSpacing: '.01em',
        }}>
          {structure}
        </div>
        {/* Category description */}
        {desc && (
          <div style={{ marginTop: 5, fontSize: fSize - 1.5, color: col.text, opacity: .75, lineHeight: 1.55 }}>
            {desc}
          </div>
        )}
      </div>

      {/* Row 2 — why tip */}
      <div style={{
        padding: pad, background: 'var(--amber-bg)',
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <span style={{ flexShrink: 0, fontSize: compact ? 12 : 14 }}>💡</span>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>
            Hint
          </div>
          <div style={{ fontSize: fSize, color: 'var(--ink2)', lineHeight: 1.6 }}>
            {renderTip(tip)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export function SatzstellungClient() {
  const { user } = useAuth();
  const { trackQuiz } = useProgress(user?.uid ?? null);
  const uid = user?.uid ?? 'guest';
  const storageKey = `satzstellung_${uid}`;

  /* Data */
  const [allItems, setAllItems] = useState<SatzItem[]>([]);
  const [loading, setLoading]   = useState(true);

  /* Filters */
  const [levelFilter, setLevelFilter] = useState<'ALL' | Level>('ALL');
  const [topicFilter, setTopicFilter] = useState<string>('ALL');

  /* Quiz state */
  const [questions, setQuestions] = useState<SatzItem[]>([]);
  const [qIdx,      setQIdx]      = useState(0);
  const [score,     setScore]     = useState(0);
  const [finished,  setFinished]  = useState(false);
  const [history,   setHistory]   = useState<{
    q: string; correct: string; built: string; isCorrect: boolean; tip: string; structure: string; topic: string;
  }[]>([]);

  /* Drag state */
  const [bank,    setBank]    = useState<Token[]>([]); // word bank (source)
  const [built,   setBuilt]   = useState<Token[]>([]); // answer row
  const [checked, setChecked] = useState(false);
  const [isOk,    setIsOk]    = useState(false);

  /* Stats */
  const [savedScore, setSavedScore] = useState({ attempts: 0, correct: 0 });

  /* English translation of the revealed sentence */
  const [enText,    setEnText]    = useState<string | null>(null);
  const [enLoading, setEnLoading] = useState(false);

  /* Speaking feedback for the correct sentence speaker button */
  const [speaking, setSpeaking] = useState(false);
  const [speakingEn, setSpeakingEn] = useState(false);

  const dragSrc = useRef<{ from: 'bank' | 'built'; uid: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setSavedScore(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [storageKey]);

  useEffect(() => {
    fetch('/data/sentence_order.json')
      .then(r => r.json())
      .then((d: SatzItem[]) => { setAllItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Warm up the best German TTS voice early (so first 🔊 click isn't robotic)
  useEffect(() => { warmUpVoices(); warmUpEnglishVoice(); }, []);

  // Deep-link support: /ueben/satzstellung?level=A1&topic=sein
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const lvl = params.get('level');
    const topic = params.get('topic');
    if (lvl === 'A1' || lvl === 'A2' || lvl === 'B1' || lvl === 'B2') setLevelFilter(lvl);
    if (topic) setTopicFilter(topic);
  }, []);

  /* Topics for current level */
  const topics = useMemo(() => {
    const base = levelFilter === 'ALL' ? allItems : allItems.filter(i => i.level === levelFilter);
    return Array.from(new Set(base.map(i => i.topic)));
  }, [allItems, levelFilter]);

  const pool = useMemo(() => {
    let items = levelFilter === 'ALL' ? allItems : allItems.filter(i => i.level === levelFilter);
    if (topicFilter !== 'ALL') items = items.filter(i => i.topic === topicFilter);
    return items;
  }, [allItems, levelFilter, topicFilter]);

  const startQuiz = useCallback(() => {
    const qs = shuffle(pool).slice(0, QUESTIONS_PER_SESSION);
    setQuestions(qs);
    setQIdx(0); setScore(0); setFinished(false); setHistory([]);
    setChecked(false); setIsOk(false);
    if (qs[0]) { setBank(toTokens(qs[0].words)); setBuilt([]); }
  }, [pool]);

  useEffect(() => {
    if (!loading && pool.length > 0) startQuiz();
  }, [loading, pool, startQuiz]);

  /* Load new question into drag state */
  useEffect(() => {
    if (questions[qIdx]) {
      setBank(toTokens(questions[qIdx].words));
      setBuilt([]);
      setChecked(false);
      setIsOk(false);
    }
  }, [qIdx, questions]);

  const current = questions[qIdx];
  const { filterOpen, setFilterOpen, isMobile } = useMobileFilter();
  const { asideStyle, DragHandle, collapsed, SidebarToggle } = useResizableSidebar();

  /* When the answer is checked, fetch the English translation of the correct sentence. */
  useEffect(() => {
    if (!checked || !current) { setEnText(null); setEnLoading(false); return; }
    let cancelled = false;
    setEnText(null); setEnLoading(true);
    translateToEnglish(current.correct)
      .then(t => { if (!cancelled) { setEnText(t); setEnLoading(false); } })
      .catch(() => { if (!cancelled) { setEnText(null); setEnLoading(false); } });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, qIdx]);

  /* ── Check answer ── */
  const checkAnswer = () => {
    if (!current || checked) return;
    const builtWords = built.map(t => t.word);
    const ok =
      builtWords.length === current.answer.length &&
      builtWords.every((w, i) => w === current.answer[i]);
    const builtSentence = built.map(t => t.word).join(' ');
    setChecked(true);
    setIsOk(ok);
    if (ok) setScore(s => s + 1);
    trackQuiz(ok);
    const next = {
      attempts: savedScore.attempts + 1,
      correct: savedScore.correct + (ok ? 1 : 0),
    };
    setSavedScore(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignore */ }
    setHistory(h => [...h, {
      q: current.words.join(' / '),
      correct: current.correct,
      built: builtSentence,
      isCorrect: ok,
      tip: current.tip,
      structure: current.structure,
      topic: current.topic,
    }]);
  };

  const nextQ = () => {
    if (qIdx + 1 >= questions.length) { setFinished(true); return; }
    setQIdx(i => i + 1);
  };

  /* ── Drag helpers ── */
  const moveToBuilt = (uid: string) => {
    if (checked) return;
    const tok = bank.find(t => t.uid === uid);
    if (!tok) return;
    setBank(b => b.filter(t => t.uid !== uid));
    setBuilt(b => [...b, tok]);
  };

  const moveToBank = (uid: string) => {
    if (checked) return;
    const tok = built.find(t => t.uid === uid);
    if (!tok) return;
    setBuilt(b => b.filter(t => t.uid !== uid));
    setBank(b => [...b, tok]);
  };

  const onDragStart = (from: 'bank' | 'built', uid: string) => {
    dragSrc.current = { from, uid };
  };

  const onDropBuilt = (e: React.DragEvent, targetUid?: string) => {
    e.preventDefault();
    if (!dragSrc.current || checked) return;
    const { from, uid: srcUid } = dragSrc.current;

    if (from === 'bank') {
      // move from bank to built (at target position or end)
      const tok = bank.find(t => t.uid === srcUid);
      if (!tok) return;
      setBank(b => b.filter(t => t.uid !== srcUid));
      if (targetUid) {
        setBuilt(b => {
          const idx = b.findIndex(t => t.uid === targetUid);
          const next = [...b];
          next.splice(idx, 0, tok);
          return next;
        });
      } else {
        setBuilt(b => [...b, tok]);
      }
    } else if (from === 'built' && targetUid && srcUid !== targetUid) {
      // reorder within built
      setBuilt(b => {
        const srcIdx = b.findIndex(t => t.uid === srcUid);
        const tgtIdx = b.findIndex(t => t.uid === targetUid);
        if (srcIdx === -1 || tgtIdx === -1) return b;
        const next = [...b];
        const [moved] = next.splice(srcIdx, 1);
        next.splice(tgtIdx, 0, moved);
        return next;
      });
    }
    dragSrc.current = null;
  };

  const onDropBank = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragSrc.current || checked) return;
    const { from, uid: srcUid } = dragSrc.current;
    if (from === 'built') moveToBank(srcUid);
    dragSrc.current = null;
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
      <SideHeading>Level</SideHeading>
      <SideItem active={levelFilter === 'ALL'} onClick={() => { setLevelFilter('ALL'); setTopicFilter('ALL'); }}>
        <span>📖</span><span>Alle Level</span>
      </SideItem>
      <SideItem active={levelFilter === 'A1'} onClick={() => { setLevelFilter('A1'); setTopicFilter('ALL'); }} indent>
        <span className="lvl lvl-a1" style={{ fontSize: 8, padding: '1px 4px' }}>A1</span>
        <span>A1 — Grundstufe</span>
      </SideItem>
      <SideItem active={levelFilter === 'A2'} onClick={() => { setLevelFilter('A2'); setTopicFilter('ALL'); }} indent>
        <span className="lvl lvl-a2" style={{ fontSize: 8, padding: '1px 4px' }}>A2</span>
        <span>A2 — Grundstufe</span>
      </SideItem>
      <SideItem active={levelFilter === 'B1'} onClick={() => { setLevelFilter('B1'); setTopicFilter('ALL'); }} indent>
        <span className="lvl lvl-b1" style={{ fontSize: 8, padding: '1px 4px' }}>B1</span>
        <span>B1 — Mittelstufe</span>
      </SideItem>
      <SideItem active={levelFilter === 'B2'} onClick={() => { setLevelFilter('B2'); setTopicFilter('ALL'); }} indent>
        <span className="lvl lvl-b2" style={{ fontSize: 8, padding: '1px 4px' }}>B2</span>
        <span>B2 — Mittelstufe</span>
      </SideItem>

      <SideDivider />

      <SideHeading>Thema</SideHeading>
      <SideItem active={topicFilter === 'ALL'} onClick={() => setTopicFilter('ALL')}>
        <span>🗂</span><span>Alle Themen</span>
      </SideItem>
      {topics.map(t => (
        <SideItem key={t} active={topicFilter === t} onClick={() => setTopicFilter(t)} indent>
          <span>{TOPIC_ICONS[t] ?? '📄'}</span>
          <span>{t}</span>
        </SideItem>
      ))}

      <SideDivider />

      <SideHeading>Statistik</SideHeading>
      <div style={{ padding: '4px 14px 12px', fontSize: 11.5, color: 'var(--ink2)', lineHeight: 2 }}>
        <div><span style={{ color: 'var(--muted)' }}>Versuche:</span> <b>{savedScore.attempts}</b></div>
        <div><span style={{ color: 'var(--muted)' }}>Richtig:</span> <b style={{ color: 'var(--green)' }}>{savedScore.correct}</b></div>
        {savedScore.attempts > 0 && (
          <div><span style={{ color: 'var(--muted)' }}>Quote:</span> <b style={{ color: 'var(--blue)' }}>{pct}%</b></div>
        )}
        <div style={{ marginTop: 4, color: 'var(--muted)', fontSize: 11 }}>
          Pool: <b style={{ color: 'var(--ink)' }}>{pool.length.toLocaleString()}</b> Sätze
        </div>
      </div>

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
      {(!isMobile ? !collapsed : true) && (
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

      {/* ═══════════ RIGHT CONTENT ═══════════ */}
      <div className="gram-content">
        <div className="gch active">

          <div className="gch-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>🧩 Satzstellung — Wortordnung</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isMobile && <SidebarToggle />}
              {isMobile && <FilterToggleButton onClick={() => setFilterOpen(true)} />}
            </div>
          </div>
          <div className="gch-sub">
            {questions.length > 0 && !finished
              ? `Frage ${qIdx + 1} von ${questions.length} · ${score} richtig`
              : `${pool.length.toLocaleString()} Sätze verfügbar · A1, A2 & B1 · 3.882 gesamt`}
          </div>

          {/* Progress bar */}
          {!finished && questions.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4, background: 'var(--blue)',
                  width: `${(qIdx / questions.length) * 100}%`,
                  transition: 'width .4s ease',
                }} />
              </div>
            </div>
          )}

          {/* ── FINISHED ── */}
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
                    {score === questions.length ? 'Perfekt — weiter so!' : score >= questions.length * 0.8 ? 'Sehr gut gemacht!' : 'Weiter üben — du schaffst das!'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
                  Auswertung
                </div>
                {history.map((h, i) => (
                  <div key={i} className="gsec" style={{ marginBottom: 10 }}>
                    <div style={{
                      padding: '11px 16px', display: 'flex', alignItems: 'flex-start', gap: 10,
                      background: h.isCorrect ? 'var(--green-bg)' : 'var(--red-bg)',
                      borderLeft: `3px solid ${h.isCorrect ? 'var(--green)' : 'var(--red)'}`,
                    }}>
                      <span style={{ fontWeight: 700, color: h.isCorrect ? 'var(--green)' : 'var(--red)', flexShrink: 0, fontSize: 14 }}>
                        {h.isCorrect ? '✓' : '✗'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                          {h.q}
                        </div>
                        {!h.isCorrect && (
                          <div style={{ fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: 'var(--red)' }}>Deine Antwort: </span>
                            <span style={{ fontFamily: 'var(--font-lora,Lora),serif', fontStyle: 'italic' }}>{h.built || '—'}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ fontSize: 13, fontFamily: 'var(--font-lora,Lora),serif', fontStyle: 'italic', color: 'var(--green)', flex: 1, minWidth: 0 }}>
                            ✓ {h.correct}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); speakDE(h.correct, 0.92); }}
                            title="Satz vorlesen"
                            aria-label="Satz vorlesen"
                            style={{
                              width: 26, height: 26, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1px solid var(--blue-bd)', background: '#fff', color: 'var(--blue)',
                              cursor: 'pointer', fontSize: 13, flexShrink: 0,
                              transition: 'all .15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--blue)'; }}
                          >
                            🔊
                          </button>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <StructurePanel
                            topic={h.topic}
                            structure={h.structure}
                            tip={h.tip}
                            compact
                          />
                        </div>
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
                      {TOPIC_ICONS[current.topic] ?? '📄'} {current.topic}
                    </span>
                  </div>

                  {/* Instruction */}
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                    Bringe die Wörter in die richtige Reihenfolge. Klicke oder ziehe die Wörter.
                  </p>

                  {/* ── ANSWER ROW (drop zone) ── */}
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => onDropBuilt(e)}
                    style={{
                      minHeight: 52, padding: '8px 10px',
                      borderRadius: 8, border: `2px dashed ${checked ? isOk ? 'var(--green)' : 'var(--red)' : 'var(--blue)'}`,
                      background: checked ? isOk ? 'var(--green-bg)' : 'var(--red-bg)' : 'var(--blue-bg)',
                      display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
                      marginBottom: 12, transition: 'background .2s, border-color .2s',
                    }}
                  >
                    {built.length === 0 && (
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                        Wörter hier ablegen…
                      </span>
                    )}
                    {built.map(tok => (
                      <span
                        key={tok.uid}
                        draggable={!checked}
                        onDragStart={() => onDragStart('built', tok.uid)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.stopPropagation(); onDropBuilt(e, tok.uid); }}
                        onClick={() => !checked && moveToBank(tok.uid)}
                        style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '5px 12px', borderRadius: 6,
                          background: checked ? isOk ? 'var(--green)' : 'var(--red)' : 'var(--blue)',
                          color: '#fff',
                          fontFamily: 'var(--font-lora,Lora),serif',
                          fontSize: 15, fontWeight: 600,
                          cursor: checked ? 'default' : 'grab',
                          userSelect: 'none',
                          boxShadow: '0 1px 3px rgba(0,0,0,.15)',
                          transition: 'background .15s',
                        }}
                      >
                        {tok.word}
                      </span>
                    ))}
                  </div>

                  {/* ── WORD BANK ── */}
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={onDropBank}
                    style={{
                      minHeight: 44, padding: '8px 10px',
                      borderRadius: 8, border: '1.5px solid var(--border)',
                      background: 'var(--bg)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
                    }}
                  >
                    {bank.length === 0 && checked && (
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>Alle Wörter verwendet</span>
                    )}
                    {bank.map(tok => (
                      <span
                        key={tok.uid}
                        draggable={!checked}
                        onDragStart={() => onDragStart('bank', tok.uid)}
                        onClick={() => !checked && moveToBuilt(tok.uid)}
                        style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '5px 12px', borderRadius: 6,
                          background: 'var(--bg2)', border: '1.5px solid var(--border)',
                          color: 'var(--ink)',
                          fontFamily: 'var(--font-lora,Lora),serif',
                          fontSize: 15, fontWeight: 600,
                          cursor: checked ? 'default' : 'pointer',
                          userSelect: 'none',
                          boxShadow: 'var(--sh)',
                          opacity: checked ? 0.5 : 1,
                        }}
                        onMouseEnter={e => { if (!checked) (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue)'; }}
                        onMouseLeave={e => { if (!checked) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                      >
                        {tok.word}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Correct sentence revealed after check */}
                {checked && (
                  <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border)',
                    background: isOk ? 'var(--green-bg)' : 'var(--red-bg)',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isOk ? 'var(--green)' : 'var(--red)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      {isOk ? '✓ Richtig!' : '✗ Nicht ganz — die richtige Antwort:'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        fontFamily: 'var(--font-lora,Lora),serif',
                        fontSize: 17, fontWeight: 600, fontStyle: 'italic',
                        color: 'var(--ink)',
                        flex: 1, minWidth: 0,
                      }}>
                        {current.correct}
                      </div>
                      <button
                        className={`speak-btn${speaking ? ' speaking' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!current.correct) return;
                          setSpeaking(true);
                          speakDE(current.correct, 0.92);
                          setTimeout(() => setSpeaking(false), 1800);
                        }}
                        title="Korrekten Satz vorlesen"
                        aria-label="Korrekten Satz vorlesen"
                      >
                        🔊
                      </button>
                    </div>
                    {/* English translation of the full correct sentence */}
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', flexShrink: 0 }}>
                        🇬🇧 English
                      </span>
                      <span style={{ fontSize: 13.5, color: 'var(--ink2)', fontStyle: 'italic', lineHeight: 1.5, flex: 1, minWidth: 0 }}>
                        {enLoading ? 'Translating…' : enText ? enText : '—'}
                      </span>
                      {enText && (
                        <button
                          className={`speak-btn${speakingEn ? ' speaking' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSpeakingEn(true);
                            speakEN(enText, 0.95);
                            setTimeout(() => setSpeakingEn(false), 1800);
                          }}
                          title="English translation aloud"
                          aria-label="English translation aloud"
                        >
                          🔊
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Reset / Check / Next buttons ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {!checked ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setBank(toTokens(questions[qIdx].words));
                        setBuilt([]);
                      }}
                      style={{
                        flex: '0 0 auto', padding: '10px 16px', borderRadius: 8,
                        border: '1.5px solid var(--border)', background: 'var(--bg)',
                        color: 'var(--muted)', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      ↩ Zurücksetzen
                    </button>
                    <button
                      onClick={checkAnswer}
                      disabled={built.length === 0}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8,
                        background: built.length === 0 ? 'var(--bg3)' : 'var(--blue)',
                        color: built.length === 0 ? 'var(--muted)' : '#fff',
                        fontSize: 14, fontWeight: 600, border: 'none',
                        cursor: built.length === 0 ? 'default' : 'pointer',
                        fontFamily: 'inherit', transition: 'background .15s',
                      }}
                      onMouseEnter={e => { if (built.length > 0) (e.currentTarget.style.background = '#1e40af'); }}
                      onMouseLeave={e => { if (built.length > 0) (e.currentTarget.style.background = 'var(--blue)'); }}
                    >
                      Antwort prüfen ✓
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Structure + Tip panel — always shown after checking */}
                    <StructurePanel
                      topic={current.topic}
                      structure={current.structure}
                      tip={current.tip}
                    />

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
                  </>
                )}
              </div>
            </div>

          /* ── EMPTY POOL ── */
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-lora,Lora),serif', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                Keine Sätze gefunden
              </div>
              <div style={{ fontSize: 13 }}>Bitte Filter in der Seitenleiste anpassen.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
