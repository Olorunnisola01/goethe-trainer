'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from '@/components/layout/MobileFilterDrawer';

/* ─── Chapter → level mapping (from index.html GRAM_CH_LEVELS) ─── */
const GRAM_CH_LEVELS: Record<string, 'A1' | 'A2' | 'B1' | 'B2'> = {
  Alphabet: 'A1', Nouns: 'A1', Articles: 'A1', Pronouns: 'A1',
  Adjectives: 'A2', Verbs: 'A2', Adverbs: 'A2', Prepositions: 'A2',
  Conjunctions: 'A2', 'Question Words': 'A1', Particles: 'B1',
  Numerals: 'A1', Interjections: 'A1', 'Sentence Structure': 'A2',
  'Final Devoicing': 'B1',
  'Konjunktiv II': 'B2',
  'Passiv': 'B2',
  'Nebensätze (Subordinate Clauses)': 'B2',
  'Partizipialkonstruktionen': 'B2',
  'Erweiterte Syntax & Konnektoren': 'B2',
  'Indirekte Rede & Konjunktiv I': 'B2',
};

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface GrammarSection {
  title: string;
  intro: string;
  tables: string[][][];
  examples: (string | { de: string; en: string })[];
}

interface GrammarChapter {
  ch: string;
  icon: string;
  sections: GrammarSection[];
}

/* ─── Markdown → JSX ─── */
function renderMd(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    if (m[1] !== undefined) parts.push(<strong key={k++} style={{ fontWeight: 600, color: 'var(--blue)' }}>{m[1]}</strong>);
    else parts.push(<em key={k++}>{m[2]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

/* ─── Grammar table ─── */
function GTable({ table }: { table: string[][] }) {
  if (!table?.length) return null;
  const [head, ...rows] = table;
  return (
    <div className="g-tw">
      <table className="g-tbl">
        <thead>
          <tr>{head.map((c, i) => <th key={i}>{c.replace(/\*\*/g, '')}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((c, ci) => <td key={ci}>{renderMd(c)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Section accordion ─── */
function GSection({ section, defaultOpen }: { section: GrammarSection; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={`gsec${open ? ' open' : ''}`}>
      <button className="gsec-hd" onClick={() => setOpen(o => !o)}>
        <span className="gsec-hd-t">{section.title}</span>
        <svg className="gsec-chev" width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4.5l4.5 4.5 4.5-4.5" />
        </svg>
      </button>
      {open && (
        <div className="gsec-body">
          {section.intro && <p className="g-intro">{renderMd(section.intro)}</p>}
          {section.tables?.map((tbl, ti) => <GTable key={ti} table={tbl} />)}
          {section.examples?.length > 0 && (
            <div className="g-exs">
              {section.examples.map((ex, ei) =>
                typeof ex === 'string' ? (
                  <div key={ei} className="g-ex">
                    <div className="g-ex-de" style={{ fontStyle: 'normal' }}>{renderMd(ex)}</div>
                  </div>
                ) : (
                  <div key={ei} className="g-ex">
                    <div className="g-ex-de">{ex.de}</div>
                    <div style={{ color: 'var(--muted)', flexShrink: 0, fontSize: 11.5, paddingTop: 2 }}>→</div>
                    <div className="g-ex-en">{ex.en}</div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GrammatikClient() {
  const [chapters, setChapters] = useState<GrammarChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<Set<Level>>(new Set(['A1']));
  const [activeChapter, setActiveChapter] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Hide by default
  const { filterOpen, setFilterOpen, isMobile } = useMobileFilter();

  useEffect(() => {
    fetch('/data/grammar.json?v=2')
      .then(r => r.json())
      .then((data: GrammarChapter[]) => {
        setChapters(data);
        setLoading(false);
        // Auto-select first chapter
        const first = data.find(ch => levels.has(GRAM_CH_LEVELS[ch.ch] ?? 'A1'));
        if (first) setActiveChapter(first.ch);
      })
      .catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLevel = (lv: Level) => {
    setLevels(prev => {
      const next = new Set(prev);
      if (next.has(lv) && next.size > 1) next.delete(lv);
      else next.add(lv);
      return next;
    });
  };

  const visible = chapters.filter(ch => levels.has(GRAM_CH_LEVELS[ch.ch] ?? 'A1'));

  // Auto-select first visible chapter when level changes
  useEffect(() => {
    if (!visible.find(ch => ch.ch === activeChapter) && visible.length > 0) {
      setActiveChapter(visible[0].ch);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels]);

  const current = visible.find(ch => ch.ch === activeChapter);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
        <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      {/* Level filter bar */}
      <div className="filter-bar" style={{ top: 51 }}>
        <span className="fl-lbl">Level:</span>
        {(['A1', 'A2', 'B1', 'B2'] as Level[]).map(lv => (
          <button
            key={lv}
            className={`chip${levels.has(lv) ? ' on' : ''}`}
            onClick={() => toggleLevel(lv)}
          >
            <span className={`lvl lvl-${lv.toLowerCase()}`}>{lv}</span>
          </button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>
          {visible.length} Kapitel · Level: {[...levels].sort().join(' + ')}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="gram-layout">
        {/* Left TOC sidebar — desktop only */}
        {!isMobile && !sidebarCollapsed && (
          <aside className="gram-toc">
            {visible.map((ch) => {
              const lv = GRAM_CH_LEVELS[ch.ch] ?? 'A1';
              return (
                <button
                  key={ch.ch}
                  className={`gtoc-it${ch.ch === activeChapter ? ' active' : ''}`}
                  onClick={() => setActiveChapter(ch.ch)}
                >
                  <span className={`lvl lvl-${lv.toLowerCase()}`} style={{ fontSize: 8, padding: '1px 4px' }}>{lv}</span>
                  <span>{ch.icon}</span>
                  <span>{ch.ch}</span>
                </button>
              );
            })}
          </aside>
        )}

        {/* Mobile drawer */}
        {isMobile && (
          <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Kapitel">
            {visible.map((ch) => {
              const lv = GRAM_CH_LEVELS[ch.ch] ?? 'A1';
              return (
                <button
                  key={ch.ch}
                  className={`gtoc-it${ch.ch === activeChapter ? ' active' : ''}`}
                  onClick={() => { setActiveChapter(ch.ch); setFilterOpen(false); }}
                >
                  <span className={`lvl lvl-${lv.toLowerCase()}`} style={{ fontSize: 8, padding: '1px 4px' }}>{lv}</span>
                  <span>{ch.icon}</span>
                  <span>{ch.ch}</span>
                </button>
              );
            })}
          </MobileFilterDrawer>
        )}

        {/* Right content area */}
        <div className="gram-content">
          {current ? (
            <div className="gch active">
              <div className="gch-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span>
                  {current.icon} {current.ch}
                  <span className={`lvl lvl-${(GRAM_CH_LEVELS[current.ch] ?? 'A1').toLowerCase()}`} style={{ marginLeft: 8 }}>
                    {GRAM_CH_LEVELS[current.ch] ?? 'A1'}
                  </span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!isMobile && (
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      style={{
                        padding: '3px 7px', fontSize: 12, fontWeight: 600,
                        border: '1px solid var(--border)', borderRadius: 6,
                        background: 'var(--bg)', color: 'var(--ink2)',
                        cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4
                      }}
                      title={sidebarCollapsed ? 'Show Filters' : 'Hide Filters'}
                    >
                      {sidebarCollapsed ? '☰' : '⟨'} {sidebarCollapsed ? 'Show Filters' : 'Hide Filters'}
                    </button>
                  )}
                  {isMobile && <FilterToggleButton onClick={() => setFilterOpen(true)} label="⚙ Kapitel" />}
                </div>
              </div>
              <div className="gch-sub">
                Level {GRAM_CH_LEVELS[current.ch] ?? 'A1'} · {current.sections.length} Abschnitte
              </div>
              {current.sections.map((sec, si) => (
                <GSection key={si} section={sec} defaultOpen={si === 0} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--muted)' }}>
              Wähle ein Kapitel aus der Seitenleiste
            </div>
          )}
        </div>
      </div>
    </>
  );
}
