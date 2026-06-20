'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from '@/components/layout/MobileFilterDrawer';
import { warmUpVoices, warmUpEnglishVoice, speakAwait, stopAll } from '@/lib/cloudVoice';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface Phrase { de: string; en: string; }
interface RedemittelCategory {
  cat: string; en: string; topic: string; level: Level; phrases: Phrase[];
  presentationHeavy?: boolean;
}
interface Props { level: Level; }

/* What is currently being read aloud — drives the highlight across all cards. */
type Reading = { cat: string; idx: number; lang: 'de' | 'en' } | null;

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/* ── Single category card (presentational; playback is driven by the parent) ── */
function RedemittelCard({
  cat, reading, playingScope, onToggleCategory, onSpeakOne,
}: {
  cat: RedemittelCategory;
  reading: Reading;
  playingScope: string | null;
  onToggleCategory: (cat: RedemittelCategory) => void;
  onSpeakOne: (cat: RedemittelCategory, idx: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const isPlaying = playingScope === cat.cat;
  const activeIdx  = reading && reading.cat === cat.cat ? reading.idx : null;
  const activeLang = reading && reading.cat === cat.cat ? reading.lang : null;

  // Auto-open this card while it is being read (e.g. during a level-wide play).
  useEffect(() => {
    if (reading && reading.cat === cat.cat) setOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reading?.cat, reading?.idx]);

  return (
    <div
      className={`rcard${open ? ' open' : ''}`}
      style={!open ? { background: 'var(--blue-bg)', borderColor: 'var(--blue-bd)' } : {}}
    >
      <div className="rcard-hd" onClick={() => setOpen(o => !o)} style={!open ? { background: 'transparent' } : {}}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3, color: open ? '#fff' : 'var(--blue)' }}>
            {cat.cat}
          </div>
          {cat.en && (
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 1, color: open ? 'rgba(255,255,255,.8)' : 'var(--muted)' }}>
              {cat.en}
            </div>
          )}
        </div>

        <span className="rch-cnt" style={!open ? { background: 'var(--blue-bd)', color: 'var(--blue)' } : {}}>
          {cat.phrases.length}
        </span>

        {/* Per-category play-all (German, or DE+EN when the mode is on) */}
        <button
          className={`rch-read${isPlaying ? ' playing' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleCategory(cat); }}
          title={isPlaying ? 'Stop' : 'Read all'}
        >
          {isPlaying ? '■' : '▶'}
        </button>

        <span style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', fontSize: 18, lineHeight: 1, color: open ? '#fff' : 'var(--blue)' }}>▾</span>
      </div>

      {open && (
        <div>
          {cat.phrases.map((ph, i) => {
            const isActive = activeIdx === i;
            return (
              <div key={i} className="rph" style={isActive ? { background: 'var(--blue-bg)' } : {}}>
                <div className="rph-de">
                  <button
                    className={`rph-speak${isActive && activeLang === 'de' ? ' speaking' : ''}`}
                    onClick={e => { e.stopPropagation(); onSpeakOne(cat, i); }}
                    title="Read aloud"
                  >
                    🔊
                  </button>
                  <span
                    className="rph-de-text"
                    style={isActive
                      ? { fontWeight: 700, color: 'var(--blue)', background: activeLang === 'de' ? 'var(--reading-highlight)' : 'transparent', borderRadius: 4, padding: '0 3px', transition: 'background .2s' }
                      : {}}
                  >
                    {ph.de}
                  </span>
                </div>
                <div className="rph-en" style={isActive ? { color: 'var(--ink2)' } : {}}>
                  <span style={isActive && activeLang === 'en'
                    ? { background: 'var(--reading-highlight)', borderRadius: 4, padding: '0 3px', transition: 'background .2s' }
                    : {}}>
                    {ph.en}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main client ── */
export function RedemittelClient({ level }: Props) {
  const [allCategories, setAllCategories] = useState<RedemittelCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'strict'>('all');

  // Unified playback state
  const [reading, setReading]           = useState<Reading>(null);
  const [playingScope, setPlayingScope] = useState<string | null>(null); // cat name · '__level__' · '__one__'
  const [bilingual, setBilingual]       = useState(false);
  const genRef = useRef(0);
  const bilingualRef = useRef(false);
  useEffect(() => { bilingualRef.current = bilingual; }, [bilingual]);

  useEffect(() => {
    fetch('/data/redemittel.json')
      .then(r => r.json())
      .then((data: RedemittelCategory[]) => { setAllCategories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`redemittel-view-${level}`) : null;
    if (saved === 'all' || saved === 'strict') setViewMode(saved);
  }, [level]);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(`redemittel-view-${level}`, viewMode);
  }, [viewMode, level]);

  const categories = useMemo(() => {
    let list = allCategories.filter(c => c.level === level);
    if (viewMode === 'strict' && level === 'A2') list = list.filter(c => !c.presentationHeavy);
    return list;
  }, [allCategories, level, viewMode]);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map(c => ({ ...c, phrases: c.phrases.filter(p => p.de.toLowerCase().includes(q) || p.en.toLowerCase().includes(q)) }))
      .filter(c => c.phrases.length > 0);
  }, [categories, search]);

  const totalPhrases = useMemo(() => filtered.reduce((s, c) => s + c.phrases.length, 0), [filtered]);
  const { filterOpen, setFilterOpen, isMobile } = useMobileFilter();

  /* ── Playback engine ── */
  const stopPlay = useCallback(() => {
    genRef.current++;
    stopAll();
    setReading(null);
    setPlayingScope(null);
  }, []);

  const playItems = useCallback(async (items: { cat: string; idx: number; de: string; en: string }[], scope: string) => {
    const gen = ++genRef.current;
    stopAll();
    setPlayingScope(scope);
    for (const it of items) {
      if (genRef.current !== gen) return;
      setReading({ cat: it.cat, idx: it.idx, lang: 'de' });
      await speakAwait(it.de, { lang: 'de', rate: 0.88 });
      if (genRef.current !== gen) return;
      if (bilingualRef.current && it.en) {
        setReading({ cat: it.cat, idx: it.idx, lang: 'en' });
        await speakAwait(it.en, { lang: 'en', rate: 0.96 });
        if (genRef.current !== gen) return;
      }
      await sleep(420);
    }
    if (genRef.current === gen) { setReading(null); setPlayingScope(null); }
  }, []);

  const toggleCategory = useCallback((cat: RedemittelCategory) => {
    if (playingScope === cat.cat) { stopPlay(); return; }
    playItems(cat.phrases.map((p, i) => ({ cat: cat.cat, idx: i, de: p.de, en: p.en })), cat.cat);
  }, [playingScope, playItems, stopPlay]);

  const speakOne = useCallback((cat: RedemittelCategory, idx: number) => {
    const p = cat.phrases[idx];
    playItems([{ cat: cat.cat, idx, de: p.de, en: p.en }], '__one__');
  }, [playItems]);

  const playLevel = useCallback(() => {
    if (playingScope === '__level__') { stopPlay(); return; }
    const items = filtered.flatMap(c => c.phrases.map((p, i) => ({ cat: c.cat, idx: i, de: p.de, en: p.en })));
    if (items.length) playItems(items, '__level__');
  }, [playingScope, filtered, playItems, stopPlay]);

  const levelPlaying = playingScope === '__level__';

  useEffect(() => {
    warmUpVoices();
    warmUpEnglishVoice();   // preload the English voice for DE+EN reading
    return () => { genRef.current++; stopAll(); };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: 56, background: 'var(--blue-bg)', borderRadius: 10, opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="sec-head" style={{ padding: '20px 32px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h3>Redemittel {level}</h3>
            <p>{totalPhrases} Phrasen in {filtered.length} Kategorien</p>
          </div>

          {/* View mode filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexBasis: '100%', marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginRight: 2 }}>Ansicht:</span>
            <div style={{ display: 'inline-flex', background: 'var(--blue-bg)', borderRadius: 999, padding: 2, border: '1px solid var(--blue-bd)' }}>
              <button onClick={() => setViewMode('all')}
                style={{ padding: '3px 12px', fontSize: 11.5, fontWeight: 700, borderRadius: 999, background: viewMode === 'all' ? 'var(--blue)' : 'transparent', color: viewMode === 'all' ? '#fff' : 'var(--ink)', border: 'none', cursor: 'pointer', transition: 'all .15s' }}>
                Alle
              </button>
              <button onClick={() => setViewMode('strict')}
                style={{ padding: '3px 12px', fontSize: 11.5, fontWeight: 700, borderRadius: 999, background: viewMode === 'strict' ? 'var(--blue)' : 'transparent', color: viewMode === 'strict' ? '#fff' : 'var(--ink)', border: 'none', cursor: 'pointer', transition: 'all .15s' }}
                title="Only phrases directly relevant to the Goethe exam (speaking + writing)">
                Strictly Goethe
              </button>
            </div>

            {/* Read-aloud language: German only vs. German + English */}
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginLeft: 6, marginRight: 2 }}>Vorlesen:</span>
            <div style={{ display: 'inline-flex', background: 'var(--blue-bg)', borderRadius: 999, padding: 2, border: '1px solid var(--blue-bd)' }}>
              <button onClick={() => setBilingual(false)}
                style={{ padding: '3px 12px', fontSize: 11.5, fontWeight: 700, borderRadius: 999, background: !bilingual ? 'var(--blue)' : 'transparent', color: !bilingual ? '#fff' : 'var(--ink)', border: 'none', cursor: 'pointer', transition: 'all .15s' }}
                title="Read German only">
                🔊 DE
              </button>
              <button onClick={() => setBilingual(true)}
                style={{ padding: '3px 12px', fontSize: 11.5, fontWeight: 700, borderRadius: 999, background: bilingual ? 'var(--blue)' : 'transparent', color: bilingual ? '#fff' : 'var(--ink)', border: 'none', cursor: 'pointer', transition: 'all .15s' }}
                title="Read German, then English">
                🇩🇪🇬🇧 DE+EN
              </button>
            </div>
          </div>

          <button
            onClick={playLevel}
            style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px',
              background: levelPlaying ? 'var(--red)' : 'var(--blue)', color: '#fff', border: 'none', borderRadius: 9,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s', boxShadow: 'var(--sh-md)',
            }}
            title={levelPlaying ? 'Stop playback' : `Read all ${totalPhrases} phrases${bilingual ? ' (DE+EN)' : ''}`}
          >
            {levelPlaying ? '⏹ Stoppen' : `▶ Alle ${totalPhrases} Phrasen${bilingual ? ' · DE+EN' : ''}`}
          </button>
        </div>
        {levelPlaying && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-ring .9s ease-in-out infinite' }} />
            <span style={{ fontSize: 11.5, color: 'var(--green)', fontWeight: 600 }}>
              {bilingual ? 'Alle Phrasen werden vorgelesen (DE + EN)…' : 'Alle Phrasen werden vorgelesen…'}
            </span>
          </div>
        )}
      </div>

      {/* Filter bar / drawer */}
      {isMobile ? (
        <>
          <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Suche">
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="srchbox">
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>🔍</span>
                <input type="search" placeholder="Phrasen suchen…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{totalPhrases} Phrasen</span>
            </div>
          </MobileFilterDrawer>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
            <FilterToggleButton onClick={() => setFilterOpen(true)} label="🔍 Suche" />
          </div>
        </>
      ) : (
        <div className="filter-bar" style={{ padding: '12px 32px', top: 51 }}>
          <div className="srchbox">
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>🔍</span>
            <input type="search" placeholder="Phrasen suchen…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8, whiteSpace: 'nowrap' }}>{totalPhrases} Phrasen</span>
        </div>
      )}

      {/* Accordion sections */}
      <div style={{ padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(cat => (
          <RedemittelCard
            key={cat.cat}
            cat={cat}
            reading={reading}
            playingScope={playingScope}
            onToggleCategory={toggleCategory}
            onSpeakOne={speakOne}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14 }}>Keine Ergebnisse für &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}
