'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { UbLayout } from '@/components/layout/UbLayout';
import { WritingFeedback } from '@/components/ai/WritingFeedback';

type Level = 'A1' | 'A2' | 'B1' | 'B2';
type StatusFilter = 'ALL' | 'DONE' | 'OPEN';

interface WriteExercise {
  id: string;
  level: Level;
  type: string;
  title: string;
  scenario: string;
  template: string;
  answers: string[];
  bank?: string[];
  tip: string;
}

interface Blank { index: number; }

/* ── colour maps ── */
const LEVEL_COLOR: Record<string, string> = { A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed' };
const LEVEL_BG:    Record<string, string> = { A1: '#f0fdf4', A2: '#eff6ff', B1: '#faf5ff' };
const LEVEL_BD:    Record<string, string> = { A1: '#bbf7d0', A2: '#bfdbfe', B1: '#e9d5ff' };

const TYPE_ICON: Record<string, string> = {
  'E-Mail': '✉️', 'Postkarte': '📮', 'Formular': '📋', 'Nachricht': '💬',
  'Dialog': '🗨️', 'Steckbrief': '👤', 'Tagebuch': '📓', 'Beschreibung': '🖊️',
  'Satzergänzung': '🔤', 'Bericht': '📰', 'Brief': '📜', 'Forumsbeitrag': '🌐',
  'Essay': '📝', 'Einladung': '🎉', 'Bestellung': '🛒', 'Formeller Brief': '🏛️',
};

/* ── template parser ── */
function parseTemplate(template: string): (string | Blank)[] {
  const parts: (string | Blank)[] = [];
  const regex = /@@(\d+)@@/g;
  let lastIdx = 0, match;
  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIdx) parts.push(template.slice(lastIdx, match.index));
    parts.push({ index: parseInt(match[1], 10) });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < template.length) parts.push(template.slice(lastIdx));
  return parts;
}

/* ── Sidebar item — defined at module level to avoid React reconciliation issues ── */
function SidebarItem({
  ex, active, solved, onClick,
}: { ex: WriteExercise; active: boolean; solved: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', textAlign: 'left',
        padding: '9px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        marginBottom: 3,
        background: active ? 'var(--blue)' : 'transparent',
        transition: 'background .12s',
      }}
    >
      {/* Number */}
      <span style={{
        fontSize: 10, fontWeight: 800, minWidth: 22, flexShrink: 0, paddingTop: 1,
        color: active ? 'rgba(255,255,255,.65)' : 'var(--muted)',
      }}>
        {ex.id.replace('W', '')}
      </span>

      {/* Title + type */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          color: active ? '#fff' : 'var(--ink)',
        }}>
          {ex.title}
        </div>
        <div style={{ fontSize: 10.5, color: active ? 'rgba(255,255,255,.6)' : 'var(--muted)', marginTop: 1 }}>
          {TYPE_ICON[ex.type] ?? '✍️'} {ex.type}
        </div>
      </div>

      {/* Level badge */}
      <span style={{
        fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 100, flexShrink: 0,
        background: active ? 'rgba(255,255,255,.22)' : LEVEL_BG[ex.level],
        color: active ? '#fff' : LEVEL_COLOR[ex.level],
        border: `1px solid ${active ? 'rgba(255,255,255,.3)' : LEVEL_BD[ex.level]}`,
      }}>{ex.level}</span>

      {/* Check */}
      {solved && (
        <span style={{ fontSize: 12, color: active ? 'rgba(255,255,255,.8)' : 'var(--green)', flexShrink: 0 }}>✓</span>
      )}
    </button>
  );
}

/* ── Main client ── */
export function SchreibenClient() {
  const { user } = useAuth();
  const { trackWrite } = useProgress(user?.uid ?? null);
  const uid = user?.uid ?? 'guest';
  const storageKey = `dlwrite_${uid}`;

  const [exercises, setExercises] = useState<WriteExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [levelFilter, setLevelFilter] = useState<Level | 'ALL'>('ALL');
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [done, setDone] = useState<Set<string>>(new Set());

  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [usedChips, setUsedChips] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [revealed, setRevealed] = useState(false);

  /* fetch exercises */
  useEffect(() => {
    fetch('/data/write.json')
      .then(r => r.json())
      .then((data: WriteExercise[]) => { setExercises(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* load done set */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, [storageKey]);

  const filtered = useMemo(() => {
    let items = exercises;
    if (levelFilter !== 'ALL') items = items.filter(e => e.level === levelFilter);
    if (statusFilter === 'DONE') items = items.filter(e => done.has(e.id));
    if (statusFilter === 'OPEN') items = items.filter(e => !done.has(e.id));
    return items;
  }, [exercises, levelFilter, statusFilter, done]);

  const selected = selectedIdx >= 0 && selectedIdx < filtered.length ? filtered[selectedIdx] : null;

  const openExercise = useCallback((idx: number) => {
    setSelectedIdx(idx);
    setInputs({});
    setUsedChips(new Set());
    setChecked(false);
    setResults({});
    setRevealed(false);
  }, []);

  const parsed = useMemo(() => selected ? parseTemplate(selected.template) : [], [selected]);
  const blanks = useMemo(() => parsed.filter((p): p is Blank => typeof p !== 'string'), [parsed]);
  const blankCount = blanks.length;

  /* check answers */
  const checkAnswers = () => {
    if (!selected) return;
    const res: Record<number, boolean> = {};
    let correctCount = 0;
    blanks.forEach(b => {
      const userAns = (inputs[b.index] ?? '').trim().toLowerCase();
      const expected = (selected.answers[b.index - 1] ?? '').trim().toLowerCase();
      const options = expected.split('/').map(s => s.trim());
      const correct = options.some(opt => userAns === opt || (opt.includes('[') && userAns.length > 0));
      res[b.index] = correct;
      if (correct) correctCount++;
    });
    setResults(res);
    setChecked(true);
    const allCorrect = Object.values(res).every(Boolean);
    if (allCorrect && selected) {
      const nextDone = new Set(done);
      nextDone.add(selected.id);
      setDone(nextDone);
      try { localStorage.setItem(storageKey, JSON.stringify([...nextDone])); } catch { /* ignore */ }
    }
    trackWrite(correctCount, blankCount);
  };

  const reset = () => {
    setInputs({});
    setUsedChips(new Set());
    setChecked(false);
    setResults({});
    setRevealed(false);
  };

  const revealSolution = () => {
    if (!selected) return;
    const filled: Record<number, string> = {};
    blanks.forEach(b => { filled[b.index] = selected.answers[b.index - 1] ?? ''; });
    setInputs(filled);
    const res: Record<number, boolean> = {};
    blanks.forEach(b => { res[b.index] = true; });
    setResults(res);
    setChecked(true);
    setRevealed(true);
  };

  /* word bank chip click */
  const handleChip = (word: string, chipIdx: number) => {
    if (usedChips.has(chipIdx)) {
      // un-use chip: clear the blank that had this word
      const blankWithWord = blanks.find(b => inputs[b.index] === word);
      if (blankWithWord) {
        setInputs(prev => { const n = { ...prev }; delete n[blankWithWord.index]; return n; });
        setUsedChips(prev => { const n = new Set(prev); n.delete(chipIdx); return n; });
      }
      return;
    }
    const emptyBlank = blanks.find(b => !inputs[b.index]);
    if (emptyBlank) {
      setInputs(prev => ({ ...prev, [emptyBlank.index]: word }));
      setUsedChips(prev => new Set(prev).add(chipIdx));
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
      <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
    </div>
  );

  return (
    <UbLayout sidebar={close => (
      <>
      {/* ── Filter bar ── */}
      <div className="ub-bar" style={{ position: 'static', flexShrink: 0 }}>
        <span className="fl-lbl">Level:</span>
        {(['ALL', 'A1', 'A2', 'B1', 'B2'] as (Level | 'ALL')[]).map(lv => (
          <button key={lv}
            className={`chip${levelFilter === lv ? ' on' : ''}`}
            onClick={() => { setLevelFilter(lv); setSelectedIdx(-1); }}
            style={levelFilter === lv && lv !== 'ALL' ? { background: LEVEL_COLOR[lv], borderColor: LEVEL_COLOR[lv], color: '#fff' } : {}}
          >
            {lv === 'ALL' ? 'Alle' : <span className={`lvl lvl-${lv.toLowerCase()}`}>{lv}</span>}
          </button>
        ))}
        <div style={{ height: 18, width: 1, background: 'var(--border)', margin: '0 4px' }} />
        {([['ALL', 'Alle'], ['DONE', '✓ Gelöst'], ['OPEN', '○ Offen']] as [StatusFilter, string][]).map(([v, label]) => (
          <button key={v}
            className={`chip${statusFilter === v ? ' on' : ''}`}
            onClick={() => { setStatusFilter(v); setSelectedIdx(-1); }}
          >{label}</button>
        ))}
        <span className="ub-note">{filtered.length} Übungen · {done.size} gelöst</span>
      </div>

      {/* ── Selection list (inside resizable sidebar / mobile drawer) ── */}
      <div style={{ padding: '10px 8px' }}>
          {filtered.length === 0 ? (
            <p className="ub-empty">Keine Übungen</p>
          ) : filtered.map((ex, idx) => (
            <SidebarItem
              key={ex.id}
              ex={ex}
              active={selectedIdx === idx}
              solved={done.has(ex.id)}
              onClick={() => { openExercise(idx); close(); }}
            />
          ))}
      </div>
      </>
    )}>
        {/* ── Main pane ── */}
        <div style={{ overflowY: 'auto', padding: '24px 32px' }}>
          {!selected ? (
            <div className="ub-empty" style={{ paddingTop: 80 }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>✍️</div>
              <div style={{ fontFamily: 'var(--font-lora)', fontWeight: 600, fontSize: 16, color: 'var(--ink2)', fontStyle: 'normal', marginBottom: 6 }}>Schreibübungen</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>Wähle eine Übung aus der Liste</div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {(['A1','A2','B1'] as Level[]).map(lv => (
                  <div key={lv} style={{ padding: '8px 16px', borderRadius: 10, background: LEVEL_BG[lv], border: `1px solid ${LEVEL_BD[lv]}`, fontSize: 12, color: LEVEL_COLOR[lv], fontWeight: 700 }}>
                    {lv} · {exercises.filter(e => e.level === lv).length} Übungen
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 700 }}>

              {/* ── Exercise header ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100,
                    background: LEVEL_BG[selected.level], color: LEVEL_COLOR[selected.level],
                    border: `1px solid ${LEVEL_BD[selected.level]}`,
                  }}>{selected.level}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                    background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--ink2)',
                  }}>{TYPE_ICON[selected.type] ?? '✍️'} {selected.type}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>#{selected.id}</span>
                  {done.has(selected.id) && (
                    <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, marginLeft: 'auto' }}>✓ Gelöst</span>
                  )}
                </div>

                {/* Scenario card */}
                <div style={{
                  background: 'var(--bg)', border: `1.5px solid ${LEVEL_BD[selected.level]}`,
                  borderRadius: 14, padding: '16px 20px', boxShadow: 'var(--sh)',
                  borderLeft: `4px solid ${LEVEL_COLOR[selected.level]}`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: LEVEL_COLOR[selected.level], textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
                    📋 Aufgabe
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.65, margin: 0 }}>{selected.scenario}</p>
                </div>
              </div>

              {/* ── Word bank chips ── */}
              {selected.bank && selected.bank.length > 0 && (
                <div style={{
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '12px 16px', marginBottom: 18,
                }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                    📦 Wortbox — klicke ein Wort zum Einfügen
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {selected.bank.map((word, i) => {
                      const used = usedChips.has(i);
                      return (
                        <button
                          key={i}
                          onClick={() => !checked && handleChip(word, i)}
                          disabled={checked}
                          style={{
                            padding: '5px 14px', borderRadius: 100, fontSize: 13, cursor: checked ? 'default' : 'pointer',
                            fontFamily: 'var(--font-lora)', fontWeight: 600, transition: 'all .15s',
                            background: used ? '#e5e7eb' : 'var(--blue-bg)',
                            color: used ? '#9ca3af' : 'var(--blue)',
                            border: `1px solid ${used ? '#d1d5db' : 'var(--blue-bd)'}`,
                            textDecoration: used ? 'line-through' : 'none',
                          }}
                        >{word}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Template ── */}
              <div style={{
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: 14, padding: '20px 22px', marginBottom: 18,
                fontFamily: 'var(--font-lora)', fontSize: 14, lineHeight: 1.9,
                color: 'var(--ink)', whiteSpace: 'pre-wrap', boxShadow: 'var(--sh)',
              }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12, fontFamily: 'inherit' }}>
                  ✍️ {blankCount} Lücken ausfüllen
                </div>
                {parsed.map((part, i) => {
                  if (typeof part === 'string') return <span key={i}>{part}</span>;
                  const state = checked
                    ? results[part.index] ? 'correct' : 'wrong'
                    : '';
                  return (
                    <input
                      key={i}
                      value={inputs[part.index] ?? ''}
                      onChange={e => !checked && setInputs(prev => ({ ...prev, [part.index]: e.target.value }))}
                      disabled={checked}
                      placeholder={`(${part.index})`}
                      onKeyDown={e => e.key === 'Enter' && !checked && checkAnswers()}
                      style={{
                        display: 'inline-block',
                        minWidth: 90, width: `${Math.max(90, ((inputs[part.index] ?? '').length + 3) * 8)}px`,
                        height: 26, padding: '0 8px',
                        border: `1.5px solid ${state === 'correct' ? 'var(--green)' : state === 'wrong' ? 'var(--red)' : 'var(--blue-bd)'}`,
                        borderRadius: 6,
                        background: state === 'correct' ? 'var(--green-bg)' : state === 'wrong' ? 'var(--red-bg)' : 'var(--blue-bg)',
                        color: state === 'correct' ? 'var(--green)' : state === 'wrong' ? 'var(--red)' : 'var(--ink)',
                        fontSize: 13, fontFamily: 'var(--font-lora)', fontWeight: 600,
                        outline: 'none', transition: 'all .15s',
                        verticalAlign: 'middle',
                        cursor: checked ? 'default' : 'text',
                      }}
                    />
                  );
                })}
              </div>

              {/* ── Feedback ── */}
              {checked && !revealed && (
                <div style={{
                  padding: '12px 16px', borderRadius: 10, marginBottom: 16,
                  background: Object.values(results).every(Boolean) ? 'var(--green-bg)' : 'var(--red-bg)',
                  border: `1px solid ${Object.values(results).every(Boolean) ? 'var(--green-bd)' : 'var(--red-bd)'}`,
                }}>
                  {Object.values(results).every(Boolean) ? (
                    <><strong style={{ color: 'var(--green)' }}>🎉 Perfekt!</strong><span style={{ color: 'var(--ink2)', fontSize: 13 }}> Alle {blankCount} Lücken richtig.</span></>
                  ) : (
                    <><strong style={{ color: 'var(--red)' }}>{Object.values(results).filter(Boolean).length}/{blankCount} richtig</strong><span style={{ color: 'var(--ink2)', fontSize: 13 }}> — Schau dir die Lösung unten an.</span></>
                  )}
                </div>
              )}

              {/* ── Action buttons ── */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
                {!checked ? (
                  <>
                    <button className="btn-primary" onClick={checkAnswers}>✓ Überprüfen</button>
                    <button
                      onClick={revealSolution}
                      style={{
                        padding: '8px 18px', borderRadius: 9, border: '1px solid var(--amber-bd)',
                        background: 'var(--amber-bg)', color: 'var(--amber)', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                      }}
                    >💡 Lösung zeigen</button>
                  </>
                ) : (
                  <button className="btn-secondary" onClick={reset}>↺ Nochmal versuchen</button>
                )}

                {/* Prev / Next */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    onClick={() => openExercise(selectedIdx - 1)}
                    disabled={selectedIdx <= 0}
                    style={{
                      padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)',
                      background: 'var(--bg)', color: 'var(--ink2)', cursor: selectedIdx <= 0 ? 'default' : 'pointer',
                      fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                      opacity: selectedIdx <= 0 ? .4 : 1,
                    }}
                  >← Zurück</button>
                  <span style={{ fontSize: 11, color: 'var(--muted)', padding: '0 4px' }}>
                    {selectedIdx + 1} / {filtered.length}
                  </span>
                  <button
                    onClick={() => openExercise(selectedIdx + 1)}
                    disabled={selectedIdx >= filtered.length - 1}
                    style={{
                      padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)',
                      background: 'var(--bg)', color: 'var(--ink2)', cursor: selectedIdx >= filtered.length - 1 ? 'default' : 'pointer',
                      fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                      opacity: selectedIdx >= filtered.length - 1 ? .4 : 1,
                    }}
                  >Weiter →</button>
                </div>
              </div>

              {/* ── Model answers (shown after check if wrong) ── */}
              {checked && !Object.values(results).every(Boolean) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                    Musterlösung
                  </div>
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', boxShadow: 'var(--sh)' }}>
                    {blanks.map((b, i) => (
                      <div key={b.index} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px',
                        borderBottom: i < blanks.length - 1 ? '1px solid var(--border)' : 'none',
                        background: results[b.index] ? 'var(--green-bg)' : 'var(--red-bg)',
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', width: 22, textAlign: 'center', flexShrink: 0 }}>{b.index}.</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: results[b.index] ? 'var(--green)' : 'var(--red)' }}>
                          {results[b.index] ? '✓' : '✗'} {selected.answers[b.index - 1]}
                        </span>
                        {!results[b.index] && inputs[b.index] && (
                          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>← deine Antwort: „{inputs[b.index]}"</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Grammar tip ── */}
              <div style={{
                background: 'var(--amber-bg)', border: '1px solid var(--amber-bd)',
                borderRadius: 10, padding: '12px 16px',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '.05em' }}>💡 Grammatik-Tipp: </span>
                <span style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6 }}>{selected.tip}</span>
              </div>

              {/* Free-writing pad with AI correction */}
              <WritingFeedback scenario={selected.scenario} level={selected.level} />

            </div>
          )}
        </div>
    </UbLayout>
  );
}
