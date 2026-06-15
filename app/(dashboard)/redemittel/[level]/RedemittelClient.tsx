'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from '@/components/layout/MobileFilterDrawer';
import { warmUpVoices, speakDE, speakAwait, stopAll } from '@/lib/cloudVoice';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface Phrase { de: string; en: string; }
interface RedemittelCategory {
  cat: string; en: string; topic: string; level: Level; phrases: Phrase[];
  presentationHeavy?: boolean;   // true for advanced presentation scaffolding (mainly A2) — hidden in "Strictly Goethe" mode
}
interface Props { level: Level; }

/* ── Single card ── */
function RedemittelCard({
  cat, globalSpeakingId, onGlobalSpeakingChange,
}: {
  cat: RedemittelCategory;
  globalSpeakingId: string | null;
  onGlobalSpeakingChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const playRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If another category takes over global speaking, stop ours
  const isPlaying = globalSpeakingId === cat.cat;

  useEffect(() => {
    if (!isPlaying) {
      playRef.current = false;
      setSpeakingIdx(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isPlaying]);

  const handlePlayAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopAll();
      playRef.current = false;
      setSpeakingIdx(null);
      onGlobalSpeakingChange(null);
      return;
    }
    setOpen(true);
    playRef.current = true;
    onGlobalSpeakingChange(cat.cat);
    (async () => {
      for (let i = 0; i < cat.phrases.length; i++) {
        if (!playRef.current) break;
        setSpeakingIdx(i);
        await speakAwait(cat.phrases[i].de, { lang: 'de', rate: 0.88 });
        if (!playRef.current) break;
        await new Promise<void>(resolve => { timerRef.current = setTimeout(resolve, 900); });
      }
      setSpeakingIdx(null);
      playRef.current = false;
      onGlobalSpeakingChange(null);
    })();
  };

  const handlePhraseSpeak = (e: React.MouseEvent, phrase: string, idx: number) => {
    e.stopPropagation();
    if (isPlaying) { stopAll(); playRef.current = false; onGlobalSpeakingChange(null); }
    setSpeakingIdx(idx);
    speakDE(phrase, 0.88, {
      onEnd: () => setSpeakingIdx(null),
      onError: () => setSpeakingIdx(null),
    });
  };

  return (
    <div
      className={`rcard${open ? ' open' : ''}`}
      style={!open ? { background: 'var(--blue-bg)', borderColor: 'var(--blue-bd)' } : {}}
    >
      <div
        className="rcard-hd"
        onClick={() => setOpen(o => !o)}
        style={!open ? { background: 'transparent' } : {}}
      >
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

        <span
          className="rch-cnt"
          style={!open ? { background: 'var(--blue-bd)', color: 'var(--blue)' } : {}}
        >
          {cat.phrases.length}
        </span>

        {/* Per-category play-all */}
        <button
          className={`rch-read${isPlaying ? ' playing' : ''}`}
          onClick={handlePlayAll}
          title={isPlaying ? 'Stoppen' : 'Alle vorlesen'}
        >
          {isPlaying ? '■' : '▶'}
        </button>

        <span style={{
          transition: 'transform .2s',
          transform: open ? 'rotate(180deg)' : 'none',
          fontSize: 18, lineHeight: 1,
          color: open ? '#fff' : 'var(--blue)',
        }}>▾</span>
      </div>

      {open && (
        <div>
          {cat.phrases.map((ph, i) => {
            const isSpeakingThis = speakingIdx === i;
            return (
              <div key={i} className="rph" style={isSpeakingThis ? { background: 'var(--blue-bg)' } : {}}>
                <div className="rph-de">
                  <button
                    className={`rph-speak${isSpeakingThis ? ' speaking' : ''}`}
                    onClick={e => handlePhraseSpeak(e, ph.de, i)}
                    title="Vorlesen"
                  >
                    🔊
                  </button>
                  {/* Bold the phrase text while it's being spoken */}
                  <span
                    className="rph-de-text"
                    style={isSpeakingThis ? { fontWeight: 700, color: 'var(--blue)' } : {}}
                  >
                    {ph.de}
                  </span>
                </div>
                <div className="rph-en" style={isSpeakingThis ? { color: 'var(--ink2)' } : {}}>{ph.en}</div>
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
  const [globalSpeakingId, setGlobalSpeakingId] = useState<string | null>(null);
  const [levelPlaying, setLevelPlaying] = useState(false);
  const levelPlayRef = useRef(false);
  const levelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/data/redemittel.json')
      .then(r => r.json())
      .then((data: RedemittelCategory[]) => { setAllCategories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Persist view mode (All vs Strictly Goethe) per level
  useEffect(() => {
    const key = `redemittel-view-${level}`;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (saved === 'all' || saved === 'strict') setViewMode(saved);
  }, [level]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`redemittel-view-${level}`, viewMode);
    }
  }, [viewMode, level]);

  const categories = useMemo(() => {
    let list = allCategories.filter(c => c.level === level);

    // "Strictly Goethe" filter: hide advanced presentation-heavy categories (mainly relevant for A2)
    if (viewMode === 'strict' && level === 'A2') {
      list = list.filter(c => !c.presentationHeavy);
    }
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

  // Play ALL phrases across ALL categories for this level
  const handleLevelPlayAll = () => {
    if (levelPlaying) {
      stopAll();
      levelPlayRef.current = false;
      setLevelPlaying(false);
      setGlobalSpeakingId(null);
      if (levelTimerRef.current) clearTimeout(levelTimerRef.current);
      return;
    }
    const allPhrases: string[] = filtered.flatMap(c => c.phrases.map(p => p.de));
    if (allPhrases.length === 0) return;
    levelPlayRef.current = true;
    setLevelPlaying(true);
    setGlobalSpeakingId('__level__');

    (async () => {
      for (let i = 0; i < allPhrases.length; i++) {
        if (!levelPlayRef.current) break;
        await speakAwait(allPhrases[i], { lang: 'de', rate: 0.88 });
        if (!levelPlayRef.current) break;
        await new Promise<void>(resolve => { levelTimerRef.current = setTimeout(resolve, 700); });
      }
      setLevelPlaying(false);
      levelPlayRef.current = false;
      setGlobalSpeakingId(null);
    })();
  };

  useEffect(() => {
    warmUpVoices();   // preload best German voice so the FIRST play isn't robotic
    return () => {
      levelPlayRef.current = false;
      if (levelTimerRef.current) clearTimeout(levelTimerRef.current);
      stopAll();
    };
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

          {/* View mode filter — especially important for A2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexBasis: '100%', marginTop: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginRight: 2 }}>Ansicht:</span>
            <div style={{ display: 'inline-flex', background: 'var(--blue-bg)', borderRadius: 999, padding: 2, border: '1px solid var(--blue-bd)' }}>
              <button
                onClick={() => setViewMode('all')}
                style={{
                  padding: '3px 12px', fontSize: 11.5, fontWeight: 700, borderRadius: 999,
                  background: viewMode === 'all' ? 'var(--blue)' : 'transparent',
                  color: viewMode === 'all' ? '#fff' : 'var(--ink)',
                  border: 'none', cursor: 'pointer', transition: 'all .15s'
                }}
              >
                Alle
              </button>
              <button
                onClick={() => setViewMode('strict')}
                style={{
                  padding: '3px 12px', fontSize: 11.5, fontWeight: 700, borderRadius: 999,
                  background: viewMode === 'strict' ? 'var(--blue)' : 'transparent',
                  color: viewMode === 'strict' ? '#fff' : 'var(--ink)',
                  border: 'none', cursor: 'pointer', transition: 'all .15s'
                }}
                title="Nur Redemittel, die direkt für die Goethe-Prüfung (Sprechen + Schreiben) relevant sind"
              >
                Strictly Goethe
              </button>
            </div>
            {viewMode === 'strict' && level === 'A2' && (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Präsentations-Strukturen ausgeblendet</span>
            )}
          </div>

          <button
            onClick={handleLevelPlayAll}
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px',
              background: levelPlaying ? 'var(--red)' : 'var(--blue)',
              color: '#fff', border: 'none', borderRadius: 9,
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'background .15s',
              boxShadow: 'var(--sh-md)',
            }}
            title={levelPlaying ? 'Wiedergabe stoppen' : `Alle ${totalPhrases} Phrasen vorlesen`}
          >
            {levelPlaying ? '⏹ Stoppen' : `▶ Alle ${totalPhrases} Phrasen`}
          </button>
        </div>
        {levelPlaying && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-ring .9s ease-in-out infinite' }} />
            <span style={{ fontSize: 11.5, color: 'var(--green)', fontWeight: 600 }}>
              Alle Phrasen werden vorgelesen…
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
                <input
                  type="search"
                  placeholder="Phrasen suchen…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {totalPhrases} Phrasen
              </span>
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
            <input
              type="search"
              placeholder="Phrasen suchen…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8, whiteSpace: 'nowrap' }}>
            {totalPhrases} Phrasen
          </span>
        </div>
      )}

      {/* Accordion sections */}
      <div style={{ padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(cat => (
          <RedemittelCard
            key={cat.cat}
            cat={cat}
            globalSpeakingId={globalSpeakingId}
            onGlobalSpeakingChange={setGlobalSpeakingId}
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
