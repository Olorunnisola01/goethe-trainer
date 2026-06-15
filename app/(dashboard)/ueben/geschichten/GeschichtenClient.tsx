'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { UbLayout } from '@/components/layout/UbLayout';
import { warmUpVoices, warmUpEnglishVoice, speakAwait, speakDE, stopAll, pauseSpeaking, resumeSpeaking } from '@/lib/cloudVoice';
import { translateDEtoEN } from '@/lib/translate';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface VocabItem { de: string; en: string; }
interface Story {
  id: string; num: number;
  title: string; titleEn: string;
  level: Level;
  de: string; en: string;
  vocab: VocabItem[];
}

type PlayMode = 'de' | 'en' | 'both';
type PlayState = 'idle' | 'playing' | 'paused';
interface Playing { scope: 'story' | 'all'; mode: PlayMode; storyId: string; }

const LEVEL_COLOR: Record<string, string> = { A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed', B2: '#b45309' };
const LEVEL_BG:    Record<string, string> = { A1: '#f0fdf4', A2: '#eff6ff', B1: '#faf5ff', B2: '#fffbeb' };
const LEVEL_BD:    Record<string, string> = { A1: '#bbf7d0', A2: '#bfdbfe', B1: '#e9d5ff', B2: '#fde68a' };

/* ══════════════════════════════════════════════════════════════════════════
   SPEECH HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

function sleep(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }

function splitSentences(text: string): string[] {
  const parts = text.replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]+["»"")\]]*|\S[^.!?…]*$/g);
  return (parts || [text]).map(s => s.trim()).filter(Boolean);
}

/** Speak a chunk and resolve when it ENDS (or errors / safety timeout). */
function speakChunk(text: string, lang: 'de' | 'en', rate: number): Promise<void> {
  if (!text.trim()) return Promise.resolve();
  return speakAwait(text, { lang, rate });
}

/** Wait while pausedRef.current is true. Resolves immediately if not paused. */
function waitWhilePaused(pausedRef: React.MutableRefObject<boolean>, stopRef: React.MutableRefObject<boolean>): Promise<void> {
  return new Promise(resolve => {
    const check = () => {
      if (stopRef.current) { resolve(); return; }
      if (!pausedRef.current) { resolve(); return; }
      setTimeout(check, 150);
    };
    check();
  });
}

function speakWord(text: string) {
  stopAll();
  speakDE(text, 0.9);
}

/* ══════════════════════════════════════════════════════════════════════════
   GRAMMAR / POS DETECTION  (no API needed — heuristics for German)
   ══════════════════════════════════════════════════════════════════════════ */

function detectPOS(token: string): string {
  const w = token.toLowerCase().replace(/[^a-zA-ZäöüÄÖÜß]/g, '');
  if (!w) return '';

  if (/^(der|die|das|dem|den|des|ein|eine|einem|einer|einen|eines)$/.test(w))
    return 'Artikel (article)';
  if (/^(ich|du|er|sie|es|wir|ihr|mich|dich|sich|uns|euch|mir|dir|ihm|ihnen|ihn|man)$/.test(w))
    return 'Pronomen (pronoun)';
  if (/^(ist|bin|bist|sind|seid|war|waren|wird|werden|wurde|wurden|sein|haben|hat|habe|hatten|hatte|gewesen|worden|geworden)$/.test(w))
    return 'Hilfsverb (auxiliary verb)';
  if (/^(kann|muss|soll|darf|mag|will|möchte|könnte|würde|sollte|müsste|dürfte|können|müssen|sollen|dürfen|mögen|wollen|möchten)$/.test(w))
    return 'Modalverb (modal verb)';
  if (/^(und|oder|aber|denn|weil|dass|wenn|als|obwohl|damit|sodass|jedoch|doch|zwar|während|nachdem|bevor|seitdem|sobald|trotzdem|sondern|sowohl|weder|entweder)$/.test(w))
    return 'Konjunktion (conjunction)';
  if (/^(in|an|auf|mit|von|zu|bei|nach|aus|durch|für|über|unter|vor|hinter|neben|zwischen|um|ohne|gegen|bis|seit|ab|statt|wegen|trotz|während|gegenüber)$/.test(w))
    return 'Präposition (preposition)';
  if (/^(nicht|sehr|auch|noch|schon|immer|oft|gerne|so|hier|dort|heute|gestern|morgen|dann|nun|ja|nein|vielleicht|wirklich|eigentlich|genau|bereits|bald|fast|kaum|zuletzt|danach|daher|dazu|dabei|davon|dafür|damit|also|deshalb|trotzdem|manchmal|meistens|plötzlich|sofort|zusammen|zurück|leider|glücklicherweise|natürlich|besonders|einfach|wieder)$/.test(w))
    return 'Adverb (adverb)';
  if (/(lich|ig|sam|bar|haft|isch|los|reich|voll|arm|frei|leer|artig|mäßig)$/.test(w))
    return 'Adjektiv (adjective)';
  // Capitalized in mid-sentence → German noun
  if (token[0] === token[0].toUpperCase() && token[0] !== token[0].toLowerCase() && /[a-zA-ZäöüÄÖÜß]/.test(token[0]))
    return 'Nomen (noun)';
  if (/(en|te|ten|ete|etest|eten|st|t|e)$/.test(w))
    return 'Verb';
  return 'Wort (word)';
}

/* ══════════════════════════════════════════════════════════════════════════
   WORD TOOLTIP
   ══════════════════════════════════════════════════════════════════════════ */

interface WordTipState {
  cleanWord: string; displayWord: string;
  translation: string; pos: string;
  loading: boolean;
  x: number; y: number;
  visible: boolean; above: boolean;
}

/**
 * Pick a colour palette for the POS chip based on the grammar category.
 * Each category gets a distinct hue so users learn to recognise the colour.
 */
function posColours(pos: string): { bg: string; fg: string; bd: string } {
  const p = pos.toLowerCase();
  if (p.startsWith('nomen'))      return { bg: '#fef3c7', fg: '#92400e', bd: '#fde68a' }; // amber — nouns
  if (p.startsWith('verb') || p.includes('hilfsverb') || p.includes('modalverb'))
                                    return { bg: '#dcfce7', fg: '#166534', bd: '#bbf7d0' }; // green — verbs
  if (p.startsWith('adjektiv'))   return { bg: '#fce7f3', fg: '#9d174d', bd: '#fbcfe8' }; // pink — adjectives
  if (p.startsWith('adverb'))     return { bg: '#ede9fe', fg: '#5b21b6', bd: '#ddd6fe' }; // purple — adverbs
  if (p.startsWith('pronomen'))   return { bg: '#dbeafe', fg: '#1e40af', bd: '#bfdbfe' }; // blue — pronouns
  if (p.startsWith('artikel'))    return { bg: '#e0e7ff', fg: '#3730a3', bd: '#c7d2fe' }; // indigo — articles
  if (p.startsWith('präposition')) return { bg: '#ccfbf1', fg: '#115e59', bd: '#99f6e4' }; // teal — prepositions
  if (p.startsWith('konjunktion')) return { bg: '#ffe4e6', fg: '#9f1239', bd: '#fecdd3' }; // rose — conjunctions
  return { bg: '#f1f5f9', fg: '#475569', bd: '#e2e8f0' }; // slate — fallback
}

function WordTip({ tip, onClose, onSpeak }: { tip: WordTipState; onClose: () => void; onSpeak: (w: string) => void }) {
  const W = 260;
  const TIP_HEIGHT_GUESS = 150;
  const posC = posColours(tip.pos);

  // Initial position centred over the clicked word, kept on-screen.
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return { left: 100, top: 100 };
    const left = Math.max(8, Math.min(tip.x - W / 2, window.innerWidth - W - 8));
    const top  = tip.above
      ? Math.max(8, tip.y - TIP_HEIGHT_GUESS - 10 - window.scrollY)
      : Math.min(window.innerHeight - TIP_HEIGHT_GUESS - 8, tip.y + 30 - window.scrollY);
    return { left, top };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip.x, tip.y, tip.above]);

  // Live position (updated by drag). `null` until first drag — use `initial` then.
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; baseLeft: number; baseTop: number } | null>(null);

  // Reset position when a new word is clicked
  useEffect(() => { setPos(null); }, [tip.cleanWord]);

  const cur = pos ?? initial;

  function onPointerDown(e: React.PointerEvent) {
    // Only the header is a drag handle; ignore clicks on the speaker button.
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      baseLeft: cur.left, baseTop: cur.top,
    };
    setDragging(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const W_ = (typeof window !== 'undefined' ? window.innerWidth  : 1000);
    const H_ = (typeof window !== 'undefined' ? window.innerHeight : 800);
    const nextLeft = Math.max(4, Math.min(W_ - W - 4,    dragRef.current.baseLeft + dx));
    const nextTop  = Math.max(4, Math.min(H_ - 60,       dragRef.current.baseTop  + dy));
    setPos({ left: nextLeft, top: nextTop });
  }
  function onPointerUp(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDragging(false);
  }

  return (
    <>
      {/* Backdrop: dismisses tooltip on tap-outside, but only when NOT dragging */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1200, pointerEvents: dragging ? 'none' : 'auto' }} />
      <div
        style={{
          position: 'fixed', left: cur.left, top: cur.top, width: W,
          background: '#fff',
          border: '1.5px solid #c7d2fe',
          borderRadius: 14,
          boxShadow: dragging
            ? '0 18px 50px rgba(60, 60, 130, 0.40)'
            : '0 10px 35px rgba(60, 60, 130, 0.25)',
          zIndex: 1201,
          animation: pos ? undefined : 'fadeIn .12s ease',
          overflow: 'hidden',
          transition: dragging ? 'none' : 'box-shadow .15s',
          userSelect: 'none',
          touchAction: 'none', // prevent scroll while dragging on mobile
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* DE word — gradient header, doubles as drag handle */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
            padding: '11px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            cursor: dragging ? 'grabbing' : 'grab',
          }}
          title="Zum Verschieben ziehen"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <span style={{ fontSize: 15 }}>🇩🇪</span>
            <span style={{
              fontWeight: 800, fontSize: 17, color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.15)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{tip.displayWord}</span>
          </div>
          <button
            data-no-drag
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onSpeak(tip.cleanWord); }}
            title="Vorlesen"
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
              border: 'none', background: 'rgba(255,255,255,0.92)',
              color: '#c2410c', fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >🔊</button>
        </div>

        {/* POS category chip */}
        {tip.pos && (
          <div style={{ padding: '10px 14px 0' }}>
            <div style={{
              fontSize: 11.5, fontWeight: 700, padding: '4px 11px', borderRadius: 100,
              background: posC.bg, color: posC.fg, border: `1px solid ${posC.bd}`,
              display: 'inline-block', letterSpacing: '.02em',
            }}>
              {tip.pos}
            </div>
          </div>
        )}

        {/* EN translation — matches DE size (17px) */}
        <div style={{
          background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
          padding: '11px 14px 14px',
          marginTop: tip.pos ? 9 : 0,
          borderTop: '1px solid #dbeafe',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>🇬🇧</span>
          <span style={{
            fontSize: 17,           // same size as the DE word
            fontWeight: 700,         // same weight as the DE word
            color: '#1e3a8a',
            minHeight: 22, flex: 1, lineHeight: 1.3,
            wordBreak: 'break-word',
          }}>
            {tip.loading
              ? <span style={{ color: '#6b7280', fontStyle: 'italic', fontWeight: 400, fontSize: 14 }}>wird übersetzt…</span>
              : tip.translation}
          </span>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STORY LIST ITEM
   ══════════════════════════════════════════════════════════════════════════ */

function StoryListItem({ story, active, speaking, onClick }: { story: Story; active: boolean; speaking: boolean; onClick: () => void }) {
  return (
    <div
      className={`ub-item${active ? ' active' : ''}`}
      onClick={onClick}
      style={active
        ? { background: 'var(--blue)', borderColor: 'var(--blue)', borderLeft: '3px solid var(--blue)' }
        : { borderLeft: `3px solid ${LEVEL_COLOR[story.level]}` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: active ? 'rgba(255,255,255,.6)' : 'var(--muted)', minWidth: 24, flexShrink: 0 }}>
          {speaking ? '🔊' : String(story.num).padStart(2, '0')}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ub-item-t" style={{ color: active ? '#fff' : 'var(--ink)' }}>{story.title}</div>
          <div style={{ fontSize: 10.5, color: active ? 'rgba(255,255,255,.65)' : 'var(--muted)', marginTop: 1 }}>{story.titleEn}</div>
        </div>
        <span style={{
          fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 100, flexShrink: 0,
          background: active ? 'rgba(255,255,255,.22)' : LEVEL_BG[story.level],
          color: active ? '#fff' : LEVEL_COLOR[story.level],
          border: `1px solid ${active ? 'rgba(255,255,255,.3)' : LEVEL_BD[story.level]}`,
        }}>{story.level}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   READ BUTTON  (idle → playing ⏸ → paused ▶ Weiter)
   ══════════════════════════════════════════════════════════════════════════ */

function ReadBtn({ label, icon, activeColor, state, onPlay, onPause, onResume }: {
  label: string; icon: string; activeColor: string; state: PlayState;
  onPlay: () => void; onPause: () => void; onResume: () => void;
}) {
  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 13px', borderRadius: 10, color: '#fff', border: 'none',
    cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
    boxShadow: 'var(--sh)', transition: 'background .15s',
  };
  if (state === 'playing') return (
    <button onClick={onPause} style={{ ...base, background: activeColor }} title="Pause">⏸ Pause</button>
  );
  if (state === 'paused') return (
    <button onClick={onResume} style={{ ...base, background: activeColor, opacity: 0.82 }} title="Weiter">▶ Weiter</button>
  );
  return (
    <button onClick={onPlay} style={{ ...base, background: activeColor }} title={`Vorlesen (${label})`}>
      {icon} {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   STORY READER PANE
   ══════════════════════════════════════════════════════════════════════════ */

interface StoryReaderProps {
  story: Story;
  activeMode: PlayMode | null;
  playState: PlayState;
  activeSentDE: number;
  activeSentEN: number;
  titleReadingDE: boolean;
  titleReadingEN: boolean;
  speed: number;
  onSpeedChange: (s: number) => void;
  onPlay: (mode: PlayMode) => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onWordClick: (clean: string, displayWord: string, el: HTMLElement) => void;
  tipVisible: boolean;
}

function StoryReader({
  story, activeMode, playState, activeSentDE, activeSentEN,
  titleReadingDE, titleReadingEN,
  speed, onSpeedChange,
  onPlay, onStop, onPause, onResume, onWordClick, tipVisible,
}: StoryReaderProps) {
  const [showVocab, setShowVocab] = useState(false);
  const [showEn, setShowEn]   = useState(false);    // hidden by default
  const color = LEVEL_COLOR[story.level] ?? '#15803d';

  const deSents = useMemo(() => splitSentences(story.de), [story.de]);
  const enSents = useMemo(() => splitSentences(story.en), [story.en]);

  const sentRefsDE = useRef<(HTMLSpanElement | null)[]>([]);
  const sentRefsEN = useRef<(HTMLSpanElement | null)[]>([]);

  // Auto-scroll highlighted sentence into view
  useEffect(() => {
    if (activeSentDE >= 0 && sentRefsDE.current[activeSentDE]) {
      sentRefsDE.current[activeSentDE]!.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeSentDE]);

  useEffect(() => {
    if (activeSentEN >= 0 && sentRefsEN.current[activeSentEN]) {
      sentRefsEN.current[activeSentEN]!.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeSentEN]);

  // When EN reading starts, auto-open the EN section
  useEffect(() => {
    if (activeSentEN >= 0) setShowEn(true);
  }, [activeSentEN]);

  function btnState(mode: PlayMode): PlayState {
    if (activeMode !== mode) return 'idle';
    return playState;
  }

  /* Render a block of text as sentence spans with clickable word spans */
  function renderClickableText(
    sents: string[],
    lang: 'de' | 'en',
    sentRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>,
    activeSentIdx: number,
    allowWordClick: boolean,
  ) {
    return (
      <div style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--ink)', fontFamily: 'var(--font-lora)', whiteSpace: 'pre-wrap' }}>
        {sents.map((sent, si) => {
          const active = activeSentIdx === si;
          const tokens = sent.split(/(\s+)/);
          return (
            <span
              key={si}
              ref={el => { sentRefs.current[si] = el; }}
              style={{
                // Stable box model — colours change, dimensions never do.
                // boxShadow draws a "border" that doesn't take up layout space,
                // so when the highlight moves to a sentence on a new line there
                // is no reflow / shake.
                display: 'inline',
                background: active ? '#fef3c7' : 'transparent',
                boxShadow: active ? '0 0 0 2px #f59e0b' : '0 0 0 2px transparent',
                borderRadius: 5,
                transition: 'background .25s ease, box-shadow .25s ease',
              }}
            >
              {tokens.map((token, ti) => {
                if (/^\s+$/.test(token)) return <span key={ti}>{token}</span>;
                if (!allowWordClick) return <span key={ti}>{token}</span>;
                const clean = token.replace(/^[^a-zA-ZäöüÄÖÜß]+|[^a-zA-ZäöüÄÖÜß]+$/g, '');
                if (!clean || clean.length < 2) return <span key={ti}>{token}</span>;
                return (
                  <span key={ti}
                    onClick={e => { if (!tipVisible) onWordClick(clean, token, e.currentTarget as HTMLElement); }}
                    style={{ cursor: 'pointer', borderBottom: '1px dotted rgba(0,0,0,0.22)', display: 'inline' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--blue)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ''; }}
                  >{token}</span>
                );
              })}
              {' '}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 660 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, background: LEVEL_BG[story.level], color, border: `1px solid ${LEVEL_BD[story.level]}` }}>
              {story.level}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Geschichte #{story.num}</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 3, lineHeight: 1.3 }}>
            <span
              style={{
                // Same stable-box highlight as sentences — colour-only animation.
                display: 'inline',
                background: titleReadingDE ? '#fef3c7' : 'transparent',
                boxShadow: titleReadingDE ? '0 0 0 3px #f59e0b' : '0 0 0 3px transparent',
                borderRadius: 6,
                transition: 'background .25s ease, box-shadow .25s ease',
              }}
            >{story.title}</span>
          </h2>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
            <span
              style={{
                display: 'inline',
                background: titleReadingEN ? '#fef3c7' : 'transparent',
                boxShadow: titleReadingEN ? '0 0 0 2px #f59e0b' : '0 0 0 2px transparent',
                borderRadius: 5,
                transition: 'background .25s ease, box-shadow .25s ease',
              }}
            >{story.titleEn}</span>
          </div>
        </div>
      </div>

      {/* Playback toolbar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        <ReadBtn label="Deutsch" icon="🔊" activeColor={color}
          state={btnState('de')} onPlay={() => onPlay('de')} onPause={onPause} onResume={onResume} />
        <ReadBtn label="English" icon="🔊" activeColor="#0369a1"
          state={btnState('en')} onPlay={() => onPlay('en')} onPause={onPause} onResume={onResume} />
        <ReadBtn label="DE + EN" icon="🔊" activeColor="#7c3aed"
          state={btnState('both')} onPlay={() => onPlay('both')} onPause={onPause} onResume={onResume} />
        {activeMode && (
          <button onClick={onStop} style={{ padding: '8px 13px', borderRadius: 10, background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, boxShadow: 'var(--sh)' }}>
            ⏹ Stopp
          </button>
        )}
      </div>

      {/* Speed slider — change applies to the next sentence */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', marginBottom: 18,
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
        maxWidth: 460,
      }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>🐢 Langsam</span>
        <input
          type="range" min={0.55} max={1.05} step={0.05}
          value={speed}
          onChange={e => onSpeedChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--blue)' }}
          title={`Geschwindigkeit: ${speed.toFixed(2)}×`}
        />
        <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', fontWeight: 600 }}>Schnell 🏃</span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--blue)',
          minWidth: 42, textAlign: 'right',
          background: 'var(--blue-bg)', border: '1px solid var(--blue-bd)',
          borderRadius: 100, padding: '2px 8px',
        }}>{speed.toFixed(2)}×</span>
      </div>

      {/* Hint for word click */}
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ borderBottom: '1px dotted rgba(0,0,0,0.3)' }}>Wort</span> antippen für Übersetzung &amp; Wortart
      </div>

      {/* German text */}
      <div style={{
        background: 'var(--bg)', border: `1.5px solid ${LEVEL_BD[story.level]}`, borderRadius: 16,
        padding: '22px 24px', marginBottom: 12, boxShadow: 'var(--sh)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: color, borderRadius: '4px 0 0 4px' }} />
        <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10, paddingLeft: 12 }}>
          🇩🇪 Deutsch
        </div>
        <div style={{ paddingLeft: 12 }}>
          {renderClickableText(deSents, 'de', sentRefsDE, activeSentDE, true)}
        </div>
      </div>

      {/* English translation — collapsed by default */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setShowEn(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '11px 16px', borderRadius: showEn ? '12px 12px 0 0' : 12,
            background: showEn ? '#eff6ff' : 'var(--bg2)',
            border: `1px solid ${showEn ? '#bfdbfe' : 'var(--border)'}`,
            borderBottom: showEn ? 'none' : undefined,
            color: showEn ? '#1d4ed8' : 'var(--ink2)', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all .15s',
          }}
        >
          <span>🇬🇧 English Translation</span>
          {activeSentEN >= 0 && <span style={{ fontSize: 10, color: '#1d4ed8', fontWeight: 400 }}>● liest vor</span>}
          <span style={{ marginLeft: 'auto', fontSize: 14, transition: 'transform .2s', transform: showEn ? 'rotate(180deg)' : 'none' }}>▾</span>
        </button>
        {showEn && (
          <div style={{ background: 'var(--bg2)', border: '1px solid #bfdbfe', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '18px 20px' }}>
            {renderClickableText(enSents, 'en', sentRefsEN, activeSentEN, false)}
          </div>
        )}
      </div>

      {/* Vocabulary */}
      <div>
        <button
          onClick={() => setShowVocab(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '11px 16px', borderRadius: 12,
            background: showVocab ? 'var(--amber-bg)' : 'var(--bg2)',
            border: `1px solid ${showVocab ? 'var(--amber-bd)' : 'var(--border)'}`,
            color: showVocab ? 'var(--amber)' : 'var(--ink2)', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all .15s',
          }}
        >
          <span>✦ Wortschatz</span>
          <span style={{ fontSize: 11, opacity: .7, fontWeight: 400 }}>({story.vocab.length} Wörter)</span>
          <span style={{ marginLeft: 'auto', fontSize: 14, transition: 'transform .2s', transform: showVocab ? 'rotate(180deg)' : 'none' }}>▾</span>
        </button>
        {showVocab && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
            {story.vocab.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <button onClick={() => speakWord(v.de)} title="Vorlesen"
                  style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--blue-bd)', background: 'var(--blue-bg)', color: 'var(--blue)', cursor: 'pointer', fontSize: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🔊
                </button>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{v.de}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{v.en}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN CLIENT
   ══════════════════════════════════════════════════════════════════════════ */

export function GeschichtenClient() {
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [loading, setLoading]       = useState(true);
  const [levelFilter, setLevelFilter] = useState<Level | 'ALL'>('ALL');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<Story | null>(null);
  const [playing, setPlaying]       = useState<Playing | null>(null);
  const [paused, setPaused]         = useState(false);

  // Active sentence indices for highlight (-1 = none)
  const [activeSentDE, setActiveSentDE] = useState(-1);
  const [activeSentEN, setActiveSentEN] = useState(-1);
  // Title highlights — true while the title itself is being spoken
  const [titleReadingDE, setTitleReadingDE] = useState(false);
  const [titleReadingEN, setTitleReadingEN] = useState(false);
  // Playback speed — controlled by slider, applies to next sentence
  const [speed, setSpeed] = useState(0.85);
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Word-click tooltip
  const [tip, setTip] = useState<WordTipState | null>(null);
  const translationCache = useRef<Record<string, string>>({});

  const stopRef     = useRef(false);
  const pausedRef   = useRef(false);   // mirror of `paused` state for use inside async loops

  useEffect(() => {
    warmUpVoices();
    warmUpEnglishVoice();
    fetch('/data/stories.json')
      .then(r => r.json())
      .then((d: Story[]) => { setAllStories(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = levelFilter === 'ALL' ? allStories : allStories.filter(s => s.level === levelFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.titleEn.toLowerCase().includes(q) ||
        s.de.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allStories, levelFilter, search]);

  /* ── Playback controls ───────────────────────────────────────────────── */
  const stop = useCallback(() => {
    stopRef.current = true;
    pausedRef.current = false;
    stopAll();
    setPlaying(null);
    setPaused(false);
    setActiveSentDE(-1);
    setActiveSentEN(-1);
    setTitleReadingDE(false);
    setTitleReadingEN(false);
  }, []);

  const pause = useCallback(() => {
    pauseSpeaking();
    pausedRef.current = true;
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    resumeSpeaking();
    pausedRef.current = false;
    setPaused(false);
  }, []);

  /* ── Core reading engine — emits sentence index for highlight ────────── */
  const readStoryContent = useCallback(async (
    story: Story,
    mode: PlayMode,
    onSentIdx?: (lang: 'de' | 'en', idx: number) => void,
    onTitle?: (lang: 'de' | 'en', reading: boolean) => void,
  ) => {
    // Read rates derived from the user's slider — titles slightly slower for clarity.
    const titleRate = () => Math.max(0.4, speedRef.current - 0.05);
    const bodyRate  = () => speedRef.current;

    // German section
    if (mode === 'de' || mode === 'both') {
      onTitle?.('de', true);
      await speakChunk(story.title, 'de', titleRate());
      onTitle?.('de', false);
      if (stopRef.current) return;
      await waitWhilePaused(pausedRef, stopRef);
      if (stopRef.current) return;
      await sleep(350);
      const deSents = splitSentences(story.de);
      for (let i = 0; i < deSents.length; i++) {
        if (stopRef.current) return;
        await waitWhilePaused(pausedRef, stopRef);
        if (stopRef.current) return;
        onSentIdx?.('de', i);
        await speakChunk(deSents[i], 'de', bodyRate());
        if (stopRef.current) return;
        await waitWhilePaused(pausedRef, stopRef);
        if (stopRef.current) return;
        await sleep(110);
      }
      onSentIdx?.('de', -1);
    }
    // English section
    if (mode === 'en' || mode === 'both') {
      if (stopRef.current) return;
      if (mode === 'both') await sleep(500);
      await waitWhilePaused(pausedRef, stopRef);
      if (stopRef.current) return;
      onTitle?.('en', true);
      await speakChunk(story.titleEn, 'en', titleRate());
      onTitle?.('en', false);
      if (stopRef.current) return;
      await waitWhilePaused(pausedRef, stopRef);
      if (stopRef.current) return;
      await sleep(350);
      const enSents = splitSentences(story.en);
      for (let i = 0; i < enSents.length; i++) {
        if (stopRef.current) return;
        await waitWhilePaused(pausedRef, stopRef);
        if (stopRef.current) return;
        onSentIdx?.('en', i);
        await speakChunk(enSents[i], 'en', bodyRate());
        if (stopRef.current) return;
        await waitWhilePaused(pausedRef, stopRef);
        if (stopRef.current) return;
        await sleep(110);
      }
      onSentIdx?.('en', -1);
    }
  }, []);

  const playStory = useCallback(async (story: Story, mode: PlayMode) => {
    stop();
    await sleep(70);
    stopRef.current = false;
    setPaused(false);
    setActiveSentDE(-1);
    setActiveSentEN(-1);
    setTitleReadingDE(false);
    setTitleReadingEN(false);
    setPlaying({ scope: 'story', mode, storyId: story.id });
    await readStoryContent(
      story, mode,
      (lang, idx) => { if (lang === 'de') setActiveSentDE(idx); else setActiveSentEN(idx); },
      (lang, on) => { if (lang === 'de') setTitleReadingDE(on); else setTitleReadingEN(on); },
    );
    if (!stopRef.current) {
      setPlaying(null); setPaused(false);
      setActiveSentDE(-1); setActiveSentEN(-1);
      setTitleReadingDE(false); setTitleReadingEN(false);
    }
  }, [stop, readStoryContent]);

  const playAll = useCallback(async (mode: PlayMode, startId?: string) => {
    const list = filtered;
    if (!list.length) return;
    stop();
    await sleep(70);
    stopRef.current = false;
    setPaused(false);

    const startIdx = startId ? Math.max(0, list.findIndex(s => s.id === startId)) : 0;

    for (let i = startIdx; i < list.length; i++) {
      if (stopRef.current) break;
      const story = list[i];
      setSelected(story);
      setActiveSentDE(-1);
      setActiveSentEN(-1);
      setTitleReadingDE(false);
      setTitleReadingEN(false);
      setPlaying({ scope: 'all', mode, storyId: story.id });
      await readStoryContent(
        story, mode,
        (lang, idx) => { if (lang === 'de') setActiveSentDE(idx); else setActiveSentEN(idx); },
        (lang, on) => { if (lang === 'de') setTitleReadingDE(on); else setTitleReadingEN(on); },
      );
      if (stopRef.current) break;
      await sleep(350);
    }
    if (!stopRef.current) {
      setPlaying(null); setPaused(false);
      setActiveSentDE(-1); setActiveSentEN(-1);
      setTitleReadingDE(false); setTitleReadingEN(false);
    }
  }, [filtered, stop, readStoryContent]);

  useEffect(() => () => {
    stopRef.current = true;
    stopAll();
  }, []);

  useEffect(() => {
    if (selected && !filtered.some(s => s.id === selected.id) && !(playing && playing.storyId === selected.id)) {
      setSelected(null);
    }
  }, [filtered, selected, playing]);

  /* ── Word-click handler ──────────────────────────────────────────────── */
  const handleWordClick = useCallback(async (clean: string, displayWord: string, el: HTMLElement) => {
    if (!clean || clean.length < 2) return;

    const rect = el.getBoundingClientRect();
    const above = rect.top > 110;
    const pos = detectPOS(displayWord);
    const cached = translationCache.current[clean.toLowerCase()];

    setTip({
      cleanWord: clean, displayWord,
      translation: cached || '', pos,
      loading: !cached,
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY,
      visible: true, above,
    });

    if (!cached) {
      const tr = await translateDEtoEN(clean);
      if (tr && tr !== '—') translationCache.current[clean.toLowerCase()] = tr;
      setTip(prev => prev && prev.cleanWord === clean ? { ...prev, translation: tr, loading: false } : prev);
    }
  }, []);

  /* ── Render ──────────────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
      <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
    </div>
  );

  const levelsPresent = (['A1', 'A2', 'B1', 'B2'] as Level[]).filter(lv => allStories.some(s => s.level === lv));
  const playingIndex  = playing?.scope === 'all' ? filtered.findIndex(s => s.id === playing.storyId) : -1;
  const storyPlayState: PlayState = playing?.scope === 'story' && playing.storyId === selected?.id
    ? (paused ? 'paused' : 'playing') : 'idle';

  return (
    <UbLayout sidebar={close => (
      <>
      <div className="ub-bar" style={{ position: 'static', flexShrink: 0 }}>
        <span className="fl-lbl">Level:</span>
        {(['ALL', 'A1', 'A2', 'B1', 'B2'] as (Level | 'ALL')[]).map(lv => (
          <button key={lv}
            className={`chip${levelFilter === lv ? ' on' : ''}`}
            onClick={() => setLevelFilter(lv)}
            style={levelFilter === lv && lv !== 'ALL' ? { background: LEVEL_COLOR[lv], borderColor: LEVEL_COLOR[lv], color: '#fff' } : {}}
          >
            {lv === 'ALL' ? 'Alle' : <span className={`lvl lvl-${lv.toLowerCase()}`}>{lv}</span>}
          </button>
        ))}
        <div className="srchbox" style={{ marginLeft: 'auto', maxWidth: 200 }}>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>🔍</span>
          <input type="search" placeholder="Suchen…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="ub-note">{filtered.length} Geschichten</span>
      </div>

      <div style={{ padding: '14px 12px' }}>
        {filtered.length === 0 ? (
          <p className="ub-empty">Keine Geschichten gefunden</p>
        ) : filtered.map(story => (
          <StoryListItem
            key={story.id} story={story}
            active={selected?.id === story.id}
            speaking={playing?.storyId === story.id}
            onClick={() => { setSelected(story); close(); }}
          />
        ))}
      </div>
      </>
    )}>
      <div style={{ overflowY: 'auto', padding: '28px 36px' }} onClick={() => tip?.visible && setTip(t => t ? { ...t, visible: false } : null)}>
        {/* Global "read all" controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          {playing?.scope === 'all' ? (
            <>
              {paused ? (
                <button onClick={resume} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: '#15803d', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, boxShadow: 'var(--sh)' }}>
                  ▶ Weiter
                </button>
              ) : (
                <button onClick={pause} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, boxShadow: 'var(--sh)' }}>
                  ⏸ Pause
                </button>
              )}
              <button onClick={stop} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, boxShadow: 'var(--sh)' }}>
                ⏹ Stopp
              </button>
              <span style={{ fontSize: 12.5, color: 'var(--ink2)', fontWeight: 600 }}>
                {paused ? '⏸' : '▶'} Liest alle vor ({playing.mode === 'both' ? 'DE + EN' : 'nur DE'}) — {playingIndex + 1} / {filtered.length}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Alle vorlesen:</span>
              <button onClick={() => playAll('both', selected?.id)} disabled={!filtered.length}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 15px', borderRadius: 10, background: filtered.length ? 'var(--blue)' : 'var(--bg3)', color: filtered.length ? '#fff' : 'var(--muted)', border: 'none', cursor: filtered.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, boxShadow: filtered.length ? 'var(--sh)' : 'none' }}>
                ▶ DE + EN {selected ? '(von hier)' : ''}
              </button>
              <button onClick={() => playAll('de', selected?.id)} disabled={!filtered.length}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 15px', borderRadius: 10, background: filtered.length ? '#15803d' : 'var(--bg3)', color: filtered.length ? '#fff' : 'var(--muted)', border: 'none', cursor: filtered.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, boxShadow: filtered.length ? 'var(--sh)' : 'none' }}>
                ▶ Nur DE {selected ? '(von hier)' : ''}
              </button>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{filtered.length} Geschichten</span>
            </>
          )}
        </div>

        {!selected ? (
          <div className="ub-empty" style={{ paddingTop: 60 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📖</div>
            <div style={{ fontFamily: 'var(--font-lora)', fontWeight: 600, fontSize: 16, color: 'var(--ink2)', fontStyle: 'normal', marginBottom: 6 }}>Kurzgeschichten</div>
            <div>Wähle eine Geschichte aus der Liste</div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {levelsPresent.map(lv => (
                <div key={lv} style={{ padding: '8px 16px', borderRadius: 10, background: LEVEL_BG[lv], border: `1px solid ${LEVEL_BD[lv]}`, fontSize: 12, color: LEVEL_COLOR[lv], fontWeight: 700 }}>
                  {lv} · {allStories.filter(s => s.level === lv).length} Geschichten
                </div>
              ))}
            </div>
          </div>
        ) : (
          <StoryReader
            story={selected}
            activeMode={playing?.scope === 'story' && playing.storyId === selected.id ? playing.mode : null}
            playState={storyPlayState}
            activeSentDE={activeSentDE}
            activeSentEN={activeSentEN}
            titleReadingDE={titleReadingDE}
            titleReadingEN={titleReadingEN}
            speed={speed}
            onSpeedChange={setSpeed}
            onPlay={(mode) => playStory(selected, mode)}
            onStop={stop}
            onPause={pause}
            onResume={resume}
            onWordClick={handleWordClick}
            tipVisible={tip?.visible ?? false}
          />
        )}
      </div>

      {/* Word tooltip — fixed position, rendered at root level */}
      {tip?.visible && (
        <WordTip
          tip={tip}
          onClose={() => setTip(t => t ? { ...t, visible: false } : null)}
          onSpeak={speakWord}
        />
      )}
    </UbLayout>
  );
}
