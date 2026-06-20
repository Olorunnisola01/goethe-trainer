'use client';

/* ──────────────────────────────────────────────────────────────────────────
   WordTip — the draggable tap-a-word popover used by the Stories reader, now
   shared so the News reader uses the exact same UX: a gradient header with the
   German word + read-aloud, a colour-coded part-of-speech chip, and the English
   translation. POS is detected with lightweight German heuristics (no API).
   ────────────────────────────────────────────────────────────────────────── */

import { useState, useEffect, useMemo, useRef } from 'react';

export interface WordTipState {
  cleanWord: string; displayWord: string;
  translation: string; pos: string;
  loading: boolean;
  x: number; y: number;
  visible: boolean; above: boolean;
}

/* Lightweight German part-of-speech heuristics. */
export function detectPOS(token: string): string {
  const w = token.toLowerCase().replace(/[^a-zA-ZäöüÄÖÜß]/g, '');
  if (!w) return '';
  if (/^(der|die|das|dem|den|des|ein|eine|einem|einer|einen|eines)$/.test(w)) return 'Artikel (article)';
  if (/^(ich|du|er|sie|es|wir|ihr|mich|dich|sich|uns|euch|mir|dir|ihm|ihnen|ihn|man)$/.test(w)) return 'Pronomen (pronoun)';
  if (/^(ist|bin|bist|sind|seid|war|waren|wird|werden|wurde|wurden|sein|haben|hat|habe|hatten|hatte|gewesen|worden|geworden)$/.test(w)) return 'Hilfsverb (auxiliary verb)';
  if (/^(kann|muss|soll|darf|mag|will|möchte|könnte|würde|sollte|müsste|dürfte|können|müssen|sollen|dürfen|mögen|wollen|möchten)$/.test(w)) return 'Modalverb (modal verb)';
  if (/^(und|oder|aber|denn|weil|dass|wenn|als|obwohl|damit|sodass|jedoch|doch|zwar|während|nachdem|bevor|seitdem|sobald|trotzdem|sondern|sowohl|weder|entweder)$/.test(w)) return 'Konjunktion (conjunction)';
  if (/^(in|an|auf|mit|von|zu|bei|nach|aus|durch|für|über|unter|vor|hinter|neben|zwischen|um|ohne|gegen|bis|seit|ab|statt|wegen|trotz|während|gegenüber)$/.test(w)) return 'Präposition (preposition)';
  if (/^(nicht|sehr|auch|noch|schon|immer|oft|gerne|so|hier|dort|heute|gestern|morgen|dann|nun|ja|nein|vielleicht|wirklich|eigentlich|genau|bereits|bald|fast|kaum|zuletzt|danach|daher|dazu|dabei|davon|dafür|damit|also|deshalb|trotzdem|manchmal|meistens|plötzlich|sofort|zusammen|zurück|leider|glücklicherweise|natürlich|besonders|einfach|wieder)$/.test(w)) return 'Adverb (adverb)';
  if (/(lich|ig|sam|bar|haft|isch|los|reich|voll|arm|frei|leer|artig|mäßig)$/.test(w)) return 'Adjektiv (adjective)';
  if (token[0] === token[0].toUpperCase() && token[0] !== token[0].toLowerCase() && /[a-zA-ZäöüÄÖÜß]/.test(token[0])) return 'Nomen (noun)';
  if (/(en|te|ten|ete|etest|eten|st|t|e)$/.test(w)) return 'Verb';
  return 'Wort (word)';
}

function posColours(pos: string): { bg: string; fg: string; bd: string } {
  const p = pos.toLowerCase();
  if (p.startsWith('nomen'))       return { bg: '#fef3c7', fg: '#92400e', bd: '#fde68a' };
  if (p.startsWith('verb') || p.includes('hilfsverb') || p.includes('modalverb')) return { bg: '#dcfce7', fg: '#166534', bd: '#bbf7d0' };
  if (p.startsWith('adjektiv'))    return { bg: '#fce7f3', fg: '#9d174d', bd: '#fbcfe8' };
  if (p.startsWith('adverb'))      return { bg: '#ede9fe', fg: '#5b21b6', bd: '#ddd6fe' };
  if (p.startsWith('pronomen'))    return { bg: '#dbeafe', fg: '#1e40af', bd: '#bfdbfe' };
  if (p.startsWith('artikel'))     return { bg: '#e0e7ff', fg: '#3730a3', bd: '#c7d2fe' };
  if (p.startsWith('präposition')) return { bg: '#ccfbf1', fg: '#115e59', bd: '#99f6e4' };
  if (p.startsWith('konjunktion')) return { bg: '#ffe4e6', fg: '#9f1239', bd: '#fecdd3' };
  return { bg: '#f1f5f9', fg: '#475569', bd: '#e2e8f0' };
}

export function WordTip({ tip, onClose, onSpeak }: { tip: WordTipState; onClose: () => void; onSpeak: (w: string) => void }) {
  const W = 260;
  const TIP_HEIGHT_GUESS = 150;
  const posC = posColours(tip.pos);

  const initial = useMemo(() => {
    if (typeof window === 'undefined') return { left: 100, top: 100 };
    const left = Math.max(8, Math.min(tip.x - W / 2, window.innerWidth - W - 8));
    const top  = tip.above
      ? Math.max(8, tip.y - TIP_HEIGHT_GUESS - 10 - window.scrollY)
      : Math.min(window.innerHeight - TIP_HEIGHT_GUESS - 8, tip.y + 30 - window.scrollY);
    return { left, top };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tip.x, tip.y, tip.above]);

  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; baseLeft: number; baseTop: number } | null>(null);
  useEffect(() => { setPos(null); }, [tip.cleanWord]);
  const cur = pos ?? initial;

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    e.preventDefault(); e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseLeft: cur.left, baseTop: cur.top };
    setDragging(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const W_ = (typeof window !== 'undefined' ? window.innerWidth  : 1000);
    const H_ = (typeof window !== 'undefined' ? window.innerHeight : 800);
    setPos({
      left: Math.max(4, Math.min(W_ - W - 4, dragRef.current.baseLeft + dx)),
      top:  Math.max(4, Math.min(H_ - 60,    dragRef.current.baseTop  + dy)),
    });
  }
  function onPointerUp(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    dragRef.current = null; setDragging(false);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1200, pointerEvents: dragging ? 'none' : 'auto' }} />
      <div
        style={{
          position: 'fixed', left: cur.left, top: cur.top, width: W,
          background: '#fff', border: '1.5px solid #c7d2fe', borderRadius: 14,
          boxShadow: dragging ? '0 18px 50px rgba(60, 60, 130, 0.40)' : '0 10px 35px rgba(60, 60, 130, 0.25)',
          zIndex: 1201, animation: pos ? undefined : 'fadeIn .12s ease', overflow: 'hidden',
          transition: dragging ? 'none' : 'box-shadow .15s', userSelect: 'none', touchAction: 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
          style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, cursor: dragging ? 'grabbing' : 'grab' }}
          title="Drag to move"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <span style={{ fontSize: 15 }}>🇩🇪</span>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.15)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tip.displayWord}</span>
          </div>
          <button data-no-drag onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onSpeak(tip.cleanWord); }} title="Read aloud"
            style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.92)', color: '#c2410c', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
          >🔊</button>
        </div>

        {tip.pos && (
          <div style={{ padding: '10px 14px 0' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 11px', borderRadius: 100, background: posC.bg, color: posC.fg, border: `1px solid ${posC.bd}`, display: 'inline-block', letterSpacing: '.02em' }}>
              {tip.pos}
            </div>
          </div>
        )}

        <div style={{ background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)', padding: '11px 14px 14px', marginTop: tip.pos ? 9 : 0, borderTop: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>🇬🇧</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#1e3a8a', minHeight: 22, flex: 1, lineHeight: 1.3, wordBreak: 'break-word' }}>
            {tip.loading
              ? <span style={{ color: '#6b7280', fontStyle: 'italic', fontWeight: 400, fontSize: 14 }}>translating…</span>
              : tip.translation}
          </span>
        </div>
      </div>
    </>
  );
}
