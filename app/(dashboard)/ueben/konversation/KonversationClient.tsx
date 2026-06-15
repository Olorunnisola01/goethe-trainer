'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { UbLayout } from '@/components/layout/UbLayout';
import { warmUpVoices, speakDE, speakDEMale, speakAwait, stopAll } from '@/lib/cloudVoice';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface ConvoLine {
  speaker: string;
  side: 'left' | 'right';
  de: string;
  en: string;
}
interface ConvoItem {
  id: string;
  level: Level;
  title: string;
  description: string;
  speakers: { name: string; voice: number }[];
  lines: ConvoLine[];
}

const LEVEL_LABELS: Record<string, string> = { A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed' };

/** Rate per dialogue side — left speaker (female/Seraphina) vs right (male/Florian). */
const LINE_RATE: Record<ConvoLine['side'], number> = { left: 0.88, right: 0.85 };

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export function KonversationClient() {
  const [items, setItems] = useState<ConvoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<Level | 'ALL'>('ALL');
  const [selected, setSelected] = useState<ConvoItem | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const autoRef = useRef(false);

  // Warm up voices early so online/neural voices are ready before first play
  useEffect(() => { warmUpVoices(); }, []);

  useEffect(() => {
    fetch('/data/convo.json')
      .then(r => r.json())
      .then((d: ConvoItem[]) => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => levelFilter === 'ALL' ? items : items.filter(i => i.level === levelFilter),
    [items, levelFilter]
  );

  const selectItem = (item: ConvoItem) => {
    autoRef.current = false;
    setAutoPlaying(false);
    setSelected(item);
    setPlayingIdx(null);
    stopAll();
  };

  const speakLine = (idx: number, item: ConvoItem) => {
    stopAll();
    setPlayingIdx(idx);
    const line = item.lines[idx];
    const opts = { onEnd: () => setPlayingIdx(null), onError: () => setPlayingIdx(null) };
    if (line.side === 'left') speakDE(line.de, LINE_RATE.left, opts);
    else speakDEMale(line.de, LINE_RATE.right, opts);
  };

  // Auto-play the full dialogue sequentially with distinct male/female voices.
  const playAll = async (item: ConvoItem) => {
    if (autoPlaying) {
      autoRef.current = false;
      setAutoPlaying(false);
      stopAll();
      setPlayingIdx(null);
      return;
    }

    autoRef.current = true;
    setAutoPlaying(true);

    for (let idx = 0; idx < item.lines.length; idx++) {
      if (!autoRef.current) break;
      setPlayingIdx(idx);
      const line = item.lines[idx];
      await speakAwait(line.de, { lang: 'de', voice: line.side === 'left' ? 'female' : 'male', rate: LINE_RATE[line.side] });
      if (!autoRef.current) break;
      await sleep(500);
    }

    autoRef.current = false;
    setAutoPlaying(false);
    setPlayingIdx(null);
  };

  useEffect(() => () => { autoRef.current = false; stopAll(); }, []);

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
        <span className="ub-note">{filtered.length} Dialoge</span>
      </div>

      {/* Selection list (inside resizable sidebar / mobile drawer) */}
      <div className="ub-list" style={{ border: 'none', position: 'static', maxHeight: 'none', background: 'transparent' }}>
          {filtered.length === 0 ? (
            <p className="ub-empty">Keine Dialoge</p>
          ) : filtered.map(item => (
            <div
              key={item.id}
              className={`ub-item${selected?.id === item.id ? ' active' : ''}`}
              onClick={() => { selectItem(item); close(); }}
            >
              <div className="ub-item-t">{item.title}</div>
              <div className="ub-item-s">
                <span className={`ub-item-tag lvl-${item.level.toLowerCase()}`}>{item.level}</span>
                {item.speakers.map(s => s.name).join(' & ')} · {item.lines.length} Zeilen
              </div>
            </div>
          ))}
      </div>
      </>
    )}>
      {/* Right pane */}
      <div className="ub-pane">
          {!selected ? (
            <div className="ub-empty" style={{ paddingTop: 80 }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>💬</div>
              <div style={{ fontFamily: 'var(--font-lora)', fontWeight: 600, fontSize: 16, color: 'var(--ink2)', fontStyle: 'normal', marginBottom: 6 }}>Konversation</div>
              <div>Wähle einen Dialog aus der Liste</div>
            </div>
          ) : (
            <div style={{ maxWidth: 680 }}>
              {/* Header */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className={`lvl lvl-${selected.level.toLowerCase()}`}>{selected.level}</span>
                  <span style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 700 }}>{selected.title}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>{selected.description}</div>

                {/* Speakers legend */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  {selected.speakers.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink2)', background: i === 0 ? 'var(--bg2)' : 'var(--blue-bg)', border: `1px solid ${i === 0 ? 'var(--border)' : 'var(--blue-bd)'}`, borderRadius: 8, padding: '4px 10px' }}>
                      <span>{i === 0 ? '👤' : '👥'}</span>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                      <span style={{ opacity: .5 }}>({i === 0 ? 'links' : 'rechts'})</span>
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className={`btn-primary`}
                    onClick={() => playAll(selected)}
                    style={autoPlaying
                      ? { background: 'var(--red)', borderColor: 'var(--red)' }
                      : {}}
                  >
                    {autoPlaying ? '⏹ Stoppen' : '▶ Dialog abspielen'}
                  </button>
                </div>
              </div>

              {/* Dialogue bubbles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selected.lines.map((line, idx) => {
                  const isLeft = line.side === 'left';
                  const isPlaying = playingIdx === idx;
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isLeft ? 'flex-start' : 'flex-end' }}>
                      <div
                        className={isLeft ? 'convo-bubble-left' : 'convo-bubble-right'}
                        style={isPlaying ? { outline: '2px solid var(--blue)', outlineOffset: 2 } : {}}
                      >
                        <div className="convo-name">{line.speaker}</div>
                        <div className="convo-de">{line.de}</div>
                        <div className="convo-en">{line.en}</div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => speakLine(idx, selected)}
                            title="Vorlesen"
                            style={{
                              width: 26, height: 26, borderRadius: '50%', border: isLeft ? '1px solid var(--border)' : '1px solid rgba(255,255,255,.4)',
                              background: 'transparent', color: isLeft ? 'var(--blue)' : 'rgba(255,255,255,.8)',
                              cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all .15s',
                            }}
                          >
                            {isPlaying ? '⏵' : '🔊'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Practice tip */}
              <div style={{ marginTop: 24, background: 'var(--amber-bg)', border: '1px solid var(--amber-bd)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>💡 Übungstipp</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6 }}>
                  Höre den Dialog zuerst komplett an. Dann spiele eine Rolle nach:
                  klicke auf 🔊 bei jeder Zeile und spreche nach. Nutze „Übersetzung zeigen" zum Verständnis-Check.
                </div>
              </div>
            </div>
          )}
        </div>
    </UbLayout>
  );
}
