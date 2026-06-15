'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from '@/components/layout/MobileFilterDrawer';
import { warmUpVoices, speakAwait, stopAll } from '@/lib/cloudVoice';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/* ── Types ───────────────────────────────────────────────────── */
type Level = 'A1' | 'A2' | 'B1' | 'B2';
type Category = 'Hilfsverb' | 'Modal' | 'Schwach' | 'Stark' | 'Trennbar';
type Tense    = 'present' | 'praeteritum' | 'perfekt';

type ConjRow = {
  ich: string; du: string; 'er/sie/es': string;
  wir: string; ihr: string; 'sie/Sie': string;
};

interface Verb {
  id: string;
  verb: string;
  meaning: string;
  level: Level;
  category: Category;
  irregular: boolean;
  present:      ConjRow;
  praeteritum?: ConjRow;
  perfekt?:     ConjRow;
}

const PRONOUNS: (keyof ConjRow)[] = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie'];
const PRONOUN_SPEECH: Record<keyof ConjRow, string> = {
  'ich': 'Ich', 'du': 'Du', 'er/sie/es': 'Er, sie, es',
  'wir': 'Wir', 'ihr': 'Ihr', 'sie/Sie': 'Sie',
};

const TENSES: { key: Tense; de: string; en: string }[] = [
  { key: 'present',     de: 'Präsens',    en: 'Present' },
  { key: 'praeteritum', de: 'Präteritum', en: 'Simple Past' },
  { key: 'perfekt',     de: 'Perfekt',    en: 'Present Perfect' },
];

const LEVEL_COLOR: Record<Level, string> = { A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed', B2: '#b45309' };
const CAT_COLOR: Record<Category, { bg: string; color: string }> = {
  Hilfsverb: { bg: '#fef3c7', color: '#92400e' },
  Modal:     { bg: '#ede9fe', color: '#5b21b6' },
  Stark:     { bg: '#fee2e2', color: '#991b1b' },
  Schwach:   { bg: '#dcfce7', color: '#166534' },
  Trennbar:  { bg: '#dbeafe', color: '#1e40af' },
};

function getForms(verb: Verb, tense: Tense): ConjRow {
  if (tense === 'praeteritum' && verb.praeteritum) return verb.praeteritum;
  if (tense === 'perfekt'     && verb.perfekt)     return verb.perfekt;
  return verb.present;
}

/* ── Component ───────────────────────────────────────────────── */
export function KonjugationClient() {
  const [verbs, setVerbs]         = useState<Verb[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [levelFilter, setLevel]   = useState<Level | 'ALL'>('ALL');
  const [catFilter, setCat]       = useState<Category | 'ALL'>('ALL');
  const [regFilter, setReg]       = useState<'ALL' | 'regular' | 'irregular'>('ALL');
  const [tense, setTense]         = useState<Tense>('present');

  /* Pagination */
  const [page, setPage]           = useState(0);
  const [perPage, setPerPage]     = useState(4);
  const [pageInput, setPageInput] = useState('1');
  const [perInput, setPerInput]   = useState('4');

  /* TTS state */
  const [isReading, setIsReading]       = useState(false);
  const [isPaused, setIsPaused]         = useState(false);
  const [activeVerbId, setActiveVerbId] = useState<string | null>(null);
  const [activeRow, setActiveRow]       = useState<number>(-1);
  const stopRef       = useRef(false);
  const userPausedRef = useRef(false);
  const sliceRef   = useRef<Verb[]>([]);
  const poolRef    = useRef<Verb[]>([]);   // full filtered pool for TTS
  const perPageRef = useRef(4);
  const tenseRef   = useRef<Tense>('present');

  useEffect(() => { tenseRef.current = tense; }, [tense]);

  useEffect(() => {
    warmUpVoices();
    fetch('/data/verbs.json?v=4').then(r => r.json())
      .then((data: Verb[]) => { setVerbs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ── Filtered pool ────────────────────────────────────────── */
  const pool = useMemo<Verb[]>(() => {
    let items = verbs;
    if (levelFilter !== 'ALL') items = items.filter(v => v.level === levelFilter);
    if (catFilter   !== 'ALL') items = items.filter(v => v.category === catFilter);
    if (regFilter === 'regular')   items = items.filter(v => !v.irregular);
    if (regFilter === 'irregular') items = items.filter(v => v.irregular);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(v => v.verb.toLowerCase().includes(q) || v.meaning.toLowerCase().includes(q));
    }
    return items;
  }, [verbs, levelFilter, catFilter, regFilter, search]);

  /* ── Pagination derived values ────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(pool.length / perPage));
  const safePage   = Math.min(page, totalPages - 1);
  const slice      = pool.slice(safePage * perPage, safePage * perPage + perPage);

  useEffect(() => { sliceRef.current = slice; }, [slice]);
  useEffect(() => { poolRef.current = pool; }, [pool]);
  useEffect(() => { perPageRef.current = perPage; }, [perPage]);

  /* Reset to page 0 on filter/tense change */
  useEffect(() => {
    setPage(0);
    setPageInput('1');
  }, [levelFilter, catFilter, regFilter, search, tense]);

  const goPage = (delta: number) => {
    const next = Math.max(0, Math.min(totalPages - 1, safePage + delta));
    setPage(next);
    setPageInput(String(next + 1));
    if (isReading) stopPlaylist();
  };

  const jumpPage = () => {
    const n = parseInt(pageInput, 10);
    if (!isNaN(n)) {
      const next = Math.max(0, Math.min(totalPages - 1, n - 1));
      setPage(next);
      setPageInput(String(next + 1));
    }
  };

  const changePerPage = () => {
    const n = parseInt(perInput, 10);
    if (!isNaN(n) && n >= 1 && n <= 100) {
      setPerPage(n);
      setPage(0);
      setPageInput('1');
    }
  };

  /* ── Stop ─────────────────────────────────────────────────── */
  const stopPlaylist = useCallback(() => {
    stopRef.current = true;
    userPausedRef.current = false;
    stopAll();
    setIsReading(false); setIsPaused(false); setActiveVerbId(null); setActiveRow(-1);
  }, []);

  /* ── Play single verb ─────────────────────────────────────── */
  const playSingleVerb = useCallback(async (verb: Verb, stop: { current: boolean }) => {
    setActiveVerbId(verb.id);
    const el = document.querySelector(`[data-verb-id="${verb.id}"]`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); await sleep(350); }
    const t = tenseRef.current;
    const tLabel = t === 'praeteritum' ? ', Präteritum' : t === 'perfekt' ? ', Perfekt' : '';
    await speakAwait(`${verb.verb}${tLabel}`, { lang: 'de', rate: 0.85 });
    if (stop.current) return;
    while (userPausedRef.current && !stop.current) await sleep(80);
    if (stop.current) return;
    await sleep(600);
    const forms = getForms(verb, t);
    for (let i = 0; i < PRONOUNS.length; i++) {
      if (stop.current) return;
      setActiveRow(i);
      await speakAwait(`${PRONOUN_SPEECH[PRONOUNS[i]]}: ${forms[PRONOUNS[i]]}`, { lang: 'de', rate: 0.85 });
      if (stop.current) return;
      while (userPausedRef.current && !stop.current) await sleep(80);
      if (stop.current) return;
      await sleep(500);
    }
    setActiveRow(-1);
    await sleep(900);
  }, []);

  /* ── Play current page ────────────────────────────────────── */
  const togglePlaylist = useCallback(async () => {
    if (isReading) { stopPlaylist(); return; }
    stopRef.current = false;
    setIsReading(true);
    const allVerbs = poolRef.current;
    for (let i = 0; i < allVerbs.length; i++) {
      if (stopRef.current) break;
      /* Auto-navigate to the page containing this verb */
      const pp = perPageRef.current;
      const targetPage = Math.floor(i / pp);
      setPage(targetPage);
      setPageInput(String(targetPage + 1));
      await playSingleVerb(allVerbs[i], stopRef);
    }
    if (!stopRef.current) { setIsReading(false); setActiveVerbId(null); setActiveRow(-1); }
  }, [isReading, stopPlaylist, playSingleVerb]);

  /* ── Play one card ────────────────────────────────────────── */
  const playOne = useCallback(async (verb: Verb) => {
    if (isReading) { stopPlaylist(); return; }
    stopRef.current = false;
    setIsReading(true);
    await playSingleVerb(verb, stopRef);
    if (!stopRef.current) { setIsReading(false); setActiveVerbId(null); setActiveRow(-1); }
  }, [isReading, stopPlaylist, playSingleVerb]);

  /* ── Pause / Resume ──────────────────────────────────────────── */
  const pausePlaylist = useCallback(() => {
    userPausedRef.current = true;
    setIsPaused(true);
    // Stop current playback — playSingleVerb spin-waits on userPausedRef until resumePlaylist() clears it.
    stopAll();
  }, []);

  const resumePlaylist = useCallback(() => {
    userPausedRef.current = false;
    setIsPaused(false);
    // No resume() needed — the spin-wait wakes up automatically.
  }, []);

  /* ── Start from a specific verb ───────────────────────────────── */
  const startFromVerb = useCallback(async (verbId: string) => {
    /* Hard-stop any current playback */
    stopRef.current = true;
    userPausedRef.current = false;
    stopAll();
    setIsReading(false); setIsPaused(false); setActiveVerbId(null); setActiveRow(-1);
    await sleep(180); // let running loop notice stopRef

    const allVerbs = poolRef.current;
    const startIdx = allVerbs.findIndex(v => v.id === verbId);
    if (startIdx === -1) return;

    stopRef.current = false;
    setIsReading(true);

    for (let i = startIdx; i < allVerbs.length; i++) {
      if (stopRef.current) break;
      const pp = perPageRef.current;
      const targetPage = Math.floor(i / pp);
      setPage(targetPage);
      setPageInput(String(targetPage + 1));
      await playSingleVerb(allVerbs[i], stopRef);
    }
    if (!stopRef.current) { setIsReading(false); setIsPaused(false); setActiveVerbId(null); setActiveRow(-1); }
  }, [playSingleVerb]);

  /* Stop if tense/filter changes mid-read */
  useEffect(() => { if (isReading) stopPlaylist(); }, [levelFilter, catFilter, regFilter, search, tense]);

  /* ── Mobile filter — must be before any early return (Rules of Hooks) ── */
  const { filterOpen, setFilterOpen, isMobile } = useMobileFilter();

  /* On mobile, show one card per page (grid is single-column there) */
  useEffect(() => {
    if (isMobile) { setPerPage(1); setPerInput('1'); }
  }, [isMobile]);

  /* ── Render ──────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
    </div>
  );

  const categories: Category[] = ['Hilfsverb', 'Modal', 'Schwach', 'Stark', 'Trennbar'];

  return (
    <div style={{ padding: '0 0 60px' }}>

      {/* ── Tense tabs ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        borderBottom: '2px solid var(--border)',
        padding: '0 32px',
        background: 'var(--bg)',
        position: 'sticky', top: 51, zIndex: 40,
      }}>
        {TENSES.map(t => {
          const active = tense === t.key;
          return (
            <button key={t.key} onClick={() => setTense(t.key)} style={{
              padding: '11px 22px',
              border: 'none',
              borderBottom: active ? '2.5px solid var(--blue)' : '2.5px solid transparent',
              marginBottom: -2,
              background: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: active ? 700 : 500,
              fontSize: 13.5,
              color: active ? 'var(--blue)' : 'var(--muted)',
              transition: 'all .15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            }}>
              <span>{t.de}</span>
              <span style={{ fontSize: 10, opacity: 0.65 }}>{t.en}</span>
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', paddingRight: 4 }}>
          {pool.length} Verben
        </div>
      </div>

      {/* ── Filter content (chips + search) — shared between bar and drawer ── */}
      {(() => {
        const filterChipsContent = (
          <>
            <span className="fl-lbl">Level:</span>
            {(['ALL', 'A1', 'A2', 'B1', 'B2'] as (Level | 'ALL')[]).map(lv => (
              <button key={lv} className={`chip${levelFilter === lv ? ' on' : ''}`}
                onClick={() => setLevel(lv)}
                style={levelFilter === lv && lv !== 'ALL' ? { background: LEVEL_COLOR[lv as Level], borderColor: LEVEL_COLOR[lv as Level], color: '#fff' } : {}}>
                {lv === 'ALL' ? 'Alle' : <span className={`lvl lvl-${lv.toLowerCase()}`}>{lv}</span>}
              </button>
            ))}
            <div style={{ height: 20, width: 1, background: 'var(--border)', margin: '0 2px' }} />
            <span className="fl-lbl">Typ:</span>
            <button className={`chip${catFilter === 'ALL' ? ' on' : ''}`} onClick={() => setCat('ALL')}>Alle</button>
            {categories.map(cat => (
              <button key={cat} className={`chip${catFilter === cat ? ' on' : ''}`}
                onClick={() => setCat(cat)}
                style={catFilter === cat ? { background: CAT_COLOR[cat].color, borderColor: CAT_COLOR[cat].color, color: '#fff' } : {}}>
                {cat}
              </button>
            ))}
            <div style={{ height: 20, width: 1, background: 'var(--border)', margin: '0 2px' }} />
            <span className="fl-lbl">Konjugation:</span>
            {([
              { key: 'ALL',       label: 'Alle' },
              { key: 'regular',   label: 'Regelmäßig' },
              { key: 'irregular', label: 'Unregelmäßig' },
            ] as const).map(opt => (
              <button key={opt.key} className={`chip${regFilter === opt.key ? ' on' : ''}`}
                onClick={() => setReg(opt.key)}
                style={regFilter === opt.key && opt.key !== 'ALL'
                  ? (opt.key === 'irregular'
                      ? { background: '#991b1b', borderColor: '#991b1b', color: '#fff' }
                      : { background: '#166534', borderColor: '#166534', color: '#fff' })
                  : {}}>
                {opt.label}
              </button>
            ))}
            <div style={{ height: 20, width: 1, background: 'var(--border)', margin: '0 2px' }} />
            <input
              type="text" value={search} placeholder="Verb suchen…"
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12.5, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', width: 140 }}
            />
          </>
        );

        const playbackControls = (
          <div style={{ display: 'flex', gap: 6 }}>
            {!isReading ? (
              <button onClick={togglePlaylist} style={{
                padding: '6px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                background: 'var(--blue)', color: '#fff',
              }}>
                {`▶ Alle vorlesen (${pool.length})`}
              </button>
            ) : (
              <>
                <button onClick={isPaused ? resumePlaylist : pausePlaylist} style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                  background: isPaused ? '#16a34a' : '#d97706', color: '#fff',
                }}>
                  {isPaused ? '▶ Weiter' : '⏸ Pause'}
                </button>
                <button onClick={stopPlaylist} style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                  background: 'var(--red)', color: '#fff',
                }}>
                  ⏹ Stop
                </button>
              </>
            )}
          </div>
        );

        return isMobile ? (
          <>
            {/* Mobile: drawer for filter chips */}
            <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter">
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filterChipsContent}
              </div>
            </MobileFilterDrawer>
            {/* Mobile: always-visible row with filter toggle + playback */}
            <div className="ub-bar" style={{ position: 'sticky', top: 100, zIndex: 39, gap: 6, flexWrap: 'wrap' }}>
              <FilterToggleButton onClick={() => setFilterOpen(true)} label="⚙ Filter" />
              <div style={{ marginLeft: 'auto' }}>
                {playbackControls}
              </div>
            </div>
          </>
        ) : (
          /* Desktop: full sticky filter bar */
          <div className="ub-bar" style={{ position: 'sticky', top: 100, zIndex: 39, gap: 6, flexWrap: 'wrap' }}>
            {filterChipsContent}
            <div style={{ marginLeft: 'auto' }}>
              {playbackControls}
            </div>
          </div>
        );
      })()}

      {/* ── Verb grid ── */}
      {slice.length === 0 ? (
        <div className="ub-empty" style={{ paddingTop: 80 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔤</div>
          <div>Keine Verben gefunden</div>
        </div>
      ) : (
        <div className="verb-grid-wrap">
        <div className="verb-grid">
          {slice.map(verb => {
            const isActive = activeVerbId === verb.id;
            const forms = getForms(verb, tense);
            return (
              <div key={verb.id} data-verb-id={verb.id} style={{
                background: 'var(--bg)', borderRadius: 14,
                border: isActive ? '2px solid var(--blue)' : '1px solid var(--border)',
                boxShadow: isActive
                  ? '0 0 0 3px rgba(37,99,235,0.15), 0 6px 24px rgba(37,99,235,0.15)'
                  : 'var(--sh)',
                transform: isActive ? 'translateY(-2px)' : 'none',
                transition: 'all .25s', overflow: 'hidden',
              }}>
                {/* Card header */}
                <div style={{
                  padding: '14px 16px 10px',
                  background: isActive
                    ? 'linear-gradient(135deg, #bfdbfe 0%, var(--blue-bg) 100%)'
                    : 'linear-gradient(135deg, var(--blue-bg) 0%, var(--bg2) 100%)',
                  borderBottom: '1px solid var(--blue-bd)',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'var(--font-lora, Lora), serif', fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
                        {verb.verb}
                      </span>
                      {verb.irregular && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 100, background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}>
                          unreg.
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>{verb.meaning}</div>
                    <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                      <span className={`lvl lvl-${verb.level.toLowerCase()}`}>{verb.level}</span>
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, padding: '1.5px 7px', borderRadius: 100,
                        background: CAT_COLOR[verb.category].bg, color: CAT_COLOR[verb.category].color,
                      }}>{verb.category}</span>
                    </div>
                  </div>
                  <button onClick={() => playOne(verb)} title={isActive && isReading ? 'Stop' : 'Vorlesen'}
                    style={{
                      flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
                      border: isActive && isReading ? '1.5px solid var(--red)' : '1.5px solid var(--blue-bd)',
                      background: isActive && isReading ? 'var(--red)' : 'var(--blue-bg)',
                      color: isActive && isReading ? '#fff' : 'var(--blue)',
                      cursor: 'pointer', fontSize: 15,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}>
                    {isActive && isReading ? '⏹' : '🔊'}
                  </button>
                </div>

                {/* Start from here button */}
                <div style={{
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--blue-bd)',
                  background: isActive ? 'rgba(29,78,216,0.06)' : 'var(--bg)',
                  display: 'flex', justifyContent: 'flex-end',
                }}>
                  <button
                    onClick={() => startFromVerb(verb.id)}
                    title="Start reading from this card onwards"
                    style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                      border: '1px solid var(--blue-bd)',
                      background: isActive && isReading ? 'var(--blue)' : 'transparent',
                      color: isActive && isReading ? '#fff' : 'var(--blue)',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    ▶ Start from here
                  </button>
                </div>

                {/* Conjugation table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <tbody>
                    {PRONOUNS.map((pronoun, i) => {
                      const form = forms[pronoun];
                      const rowActive = isActive && activeRow === i;
                      return (
                        <tr key={pronoun} style={{
                          background: rowActive
                            ? 'var(--blue)'
                            : i % 2 === 0
                              ? '#ffffff'
                              : 'var(--blue-bg)',
                          transition: 'background .2s',
                        }}>
                          <td style={{
                            padding: '8px 14px', width: '38%',
                            color: rowActive ? 'rgba(255,255,255,0.8)' : 'var(--blue)',
                            fontWeight: 500, fontSize: 12.5,
                            borderBottom: i < PRONOUNS.length - 1 ? '1px solid var(--blue-bd)' : 'none',
                          }}>{pronoun}</td>
                          <td style={{
                            padding: '8px 14px',
                            color: rowActive ? '#fff' : 'var(--ink)',
                            fontWeight: rowActive ? 700 : 600,
                            borderBottom: i < PRONOUNS.length - 1 ? '1px solid var(--blue-bd)' : 'none',
                          }}>{form}</td>
                          {rowActive && (
                            <td style={{ padding: '8px 10px 8px 0', textAlign: 'right' }}>
                              <span style={{
                                display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                                background: '#fff', animation: 'pulse 1s ease-in-out infinite',
                              }} />
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {slice.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '24px 48px 32px', flexWrap: 'wrap',
          borderTop: '1px solid var(--border)',
        }}>
          {/* ← Prev */}
          <button onClick={() => goPage(-1)} disabled={safePage === 0} style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: safePage === 0 ? 'var(--border)' : 'var(--ink2)',
            borderRadius: 7, padding: '6px 14px', cursor: safePage === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', fontSize: 13, opacity: safePage === 0 ? 0.42 : 1,
          }}>←</button>

          {/* Page info */}
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, minWidth: 160, textAlign: 'center' }}>
            Seite {safePage + 1} / {totalPages} · {pool.length} Verben
          </span>

          {/* → Next */}
          <button onClick={() => goPage(1)} disabled={safePage >= totalPages - 1} style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: safePage >= totalPages - 1 ? 'var(--border)' : 'var(--ink2)',
            borderRadius: 7, padding: '6px 14px', cursor: safePage >= totalPages - 1 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', fontSize: 13, opacity: safePage >= totalPages - 1 ? 0.42 : 1,
          }}>→</button>

          {/* Jump to page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Seite</span>
            <input
              type="number" min={1} max={totalPages}
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && jumpPage()}
              style={{ width: 56, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: 'var(--bg)', color: 'var(--ink)', textAlign: 'center', fontFamily: 'inherit' }}
            />
            <button onClick={jumpPage} style={{
              background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink2)',
              borderRadius: 7, padding: '5px 10px', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit',
            }}>Los</button>
          </div>

          {/* Cards per page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Karten/Seite</span>
            <input
              type="number" min={1} max={100}
              value={perInput}
              onChange={e => setPerInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && changePerPage()}
              style={{ width: 52, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: 'var(--bg)', color: 'var(--ink)', textAlign: 'center', fontFamily: 'inherit' }}
            />
            <button onClick={changePerPage} style={{
              background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink2)',
              borderRadius: 7, padding: '5px 10px', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit',
            }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
