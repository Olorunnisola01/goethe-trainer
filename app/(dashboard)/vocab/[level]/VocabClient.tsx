'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { VocabCard } from '@/components/vocab/VocabCard';
import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/hooks/useFavourites';
import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from '@/components/layout/MobileFilterDrawer';
import { warmUpVoices, warmUpEnglishVoice, speakAwait, stopAll } from '@/lib/cloudVoice';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface VocabEntry {
  w: string; t: string;
  ex?: string; exT?: string;
  de?: string; en?: string;
  cat?: string; emoji?: string; level?: Level;
}

interface VocabCategory {
  id: string; emoji: string; title: string; level: Level;
  entries: { w: string; t: string; ex?: string; exT?: string; de?: string; en?: string }[];
}

interface Props { level: Level; }

const LEVEL_COLOR: Record<string, string> = {
  A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed', B2: '#b45309',
};

export function VocabClient({ level }: Props) {
  const { user } = useAuth();
  const { add, remove, has } = useFavourites(user?.uid ?? null);

  const [allCategories, setAllCategories] = useState<VocabCategory[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [activeCat, setActiveCat]         = useState<string>('all');
  const [page, setPage]                   = useState(0);
  const [perPage, setPerPage]             = useState(4);
  const [pageInput, setPageInput]         = useState('1');
  const [perInput, setPerInput]           = useState('4');
  const gridRef    = useRef<HTMLDivElement>(null);

  /* Mobile filter drawer + 1-card-per-page ── declared early so effectivePerPage
     is available before totalPages / safePage / slice computations below */
  const { filterOpen, setFilterOpen, isMobile } = useMobileFilter();

  /* Desktop TOC sidebar resize */
  const [tocWidth, setTocWidth] = useState(210);
  const [tocHidden, setTocHidden] = useState(true); // Hide filters by default (as requested)
  const tocDragRef = useRef<{ active: boolean; startX: number; startW: number }>({ active: false, startX: 0, startW: 210 });
  const effectivePerPage = isMobile ? 1 : perPage;

  /* TTS playlist state */
  const [isReading,    setIsReading]    = useState(false);
  const [isPaused,     setIsPaused]     = useState(false);
  const [readingIdx,   setReadingIdx]   = useState(-1);
  const [readingPhase, setReadingPhase] = useState<'word' | 'example' | null>(null);
  const [readingLang,  setReadingLang]  = useState<'de' | 'en'>('de'); // language currently being read → drives DE/EN highlight
  const stopRef         = useRef(false);
  const userPausedRef   = useRef(false);
  const playlistPaging  = useRef(false);   // true while playlist itself changes the page
  // Keep live refs so the async playlist always sees current values
  const poolRef    = useRef<VocabEntry[]>([]);
  const perPageRef = useRef(4);
  const pageRef    = useRef(0);

  /* ── NEW: Bilingual DE-EN reading state (completely separate from existing German playlist) ── */
  const [isBilingualReading, setIsBilingualReading] = useState(false);
  const bilingualStopRef = useRef(false);
  const bilingualReadingRef = useRef(false); // to prevent overlapping runs
  const [isBilingualPaused, setIsBilingualPaused] = useState(false);
  const bilingualPausedRef = useRef(false);

  useEffect(() => {
    warmUpVoices();        // German
    warmUpEnglishVoice();  // English for bilingual DE-EN reading
    fetch('/data/vocab.json')
      .then(r => r.json())
      .then((data: VocabCategory[]) => { setAllCategories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* Categories for this level */
  const categories = useMemo(
    () => allCategories.filter(c => c.level === level),
    [allCategories, level]
  );

  /* Flat ALL array for this level */
  const flat = useMemo<VocabEntry[]>(() => {
    const out: VocabEntry[] = [];
    categories.forEach(cat =>
      cat.entries.forEach(e =>
        out.push({ ...e, ex: e.ex ?? e.de, exT: e.exT ?? e.en, cat: cat.title, emoji: cat.emoji, level: cat.level })
      )
    );
    return out;
  }, [categories]);

  /* Filtered pool — by category chip + search */
  const pool = useMemo<VocabEntry[]>(() => {
    let items = activeCat === 'all' ? flat : flat.filter(e => e.cat === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(e => e.w.toLowerCase().includes(q) || e.t.toLowerCase().includes(q));
    }
    return items;
  }, [flat, activeCat, search]);

  const totalPages = Math.max(1, Math.ceil(pool.length / effectivePerPage));
  const safePage   = Math.min(page, totalPages - 1);
  const slice      = pool.slice(safePage * effectivePerPage, safePage * effectivePerPage + effectivePerPage);

  // Keep live refs so the async playlist always sees current values
  useEffect(() => { poolRef.current    = pool;             }, [pool]);
  useEffect(() => { perPageRef.current = effectivePerPage; }, [effectivePerPage]);
  useEffect(() => { pageRef.current    = safePage;         }, [safePage]);

  /* Reset to page 0 when filter changes */
  const selectCat = (cat: string) => { setActiveCat(cat); setPage(0); setPageInput('1'); };
  const doSearch  = (q: string)   => { setSearch(q); setPage(0); setPageInput('1'); };

  const goPage = (delta: number) => {
    const next = Math.max(0, Math.min(totalPages - 1, safePage + delta));
    setPage(next);
    setPageInput(String(next + 1));
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const jumpPage = () => {
    const n = parseInt(pageInput, 10);
    if (!isNaN(n)) {
      const next = Math.max(0, Math.min(totalPages - 1, n - 1));
      setPage(next); setPageInput(String(next + 1));
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const changePerPage = () => {
    const n = Math.max(1, Math.min(50, parseInt(perInput, 10) || 4));
    setPerPage(n); setPerInput(String(n)); setPage(0); setPageInput('1');
  };

  /* Sidebar drag-to-resize */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!tocDragRef.current.active) return;
      const { startX, startW } = tocDragRef.current;
      setTocWidth(Math.max(160, Math.min(400, startW + (e.clientX - startX))));
    };
    const onUp = () => {
      if (!tocDragRef.current.active) return;
      tocDragRef.current.active = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  /* Stop when filter/search changes — but NOT when the playlist itself changes page */
  useEffect(() => {
    if (isReading && !playlistPaging.current) {
      stopRef.current = true;
      userPausedRef.current = false;
      stopAll();
      setIsReading(false);
      setIsPaused(false);
      setReadingIdx(-1);
    }

    // Also stop the bilingual DE-EN reader when the filter/search changes.
    // Check the LIVE ref (not the isBilingualReading state) and keep that state
    // OUT of the dependency array below. If isBilingualReading were a dependency,
    // this effect would re-run the instant a read starts (false→true) and call
    // stopBilingual() on its own freshly-started utterance — which made the
    // "DE-EN speak" button silent. (Mirrors how the German playlist reads
    // isReading here without listing it as a dependency.)
    if (bilingualReadingRef.current) stopBilingual();

    playlistPaging.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat, search]);

  /** Clean text for TTS: replace "/" with " oder " */
  // Strip everything from the first "/" onward — abbreviations like "/kg" should not be read aloud
  const forSpeech = (text: string) => text.split('/')[0].trim();

  /** Skip entries that are pure grammatical gender abbreviations like "r/s", "r/e", "e/s" */
  const shouldSkip = (word: string) =>
    /^[rse]\/[rse]$/i.test(word.trim()) || word.toLowerCase().includes('r/s');

  /* ── Stop ────────────────────────────────────────────────────── */
  const stopPlaylist = useCallback(() => {
    stopRef.current = true;
    userPausedRef.current = false;
    stopAll();
    setIsReading(false);
    setIsPaused(false);
    setReadingIdx(-1);
    setReadingPhase(null);
  }, []);

  /* ── Pause / Resume ──────────────────────────────────────────── */
  const pausePlaylist = useCallback(() => {
    userPausedRef.current = true;
    setIsPaused(true);
    // Stop current playback — the runFrom loop will spin-wait until resumePlaylist() clears the flag.
    stopAll();
  }, []);

  const resumePlaylist = useCallback(() => {
    userPausedRef.current = false;
    setIsPaused(false);
    // No resume() call needed — the spin-wait in runFrom wakes up automatically.
  }, []);

  /* ── Core loop helper ────────────────────────────────────────── */
  const runFrom = useCallback(async (startIdx: number) => {
    const allCards = poolRef.current;
    const pp       = perPageRef.current;
    setReadingLang('de'); // German-only playlist always highlights the German side

    for (let i = startIdx; i < allCards.length; i++) {
      if (stopRef.current) break;
      const entry = allCards[i];
      if (shouldSkip(entry.w)) continue;

      const targetPage = Math.floor(i / pp);
      const localIdx   = i % pp;

      if (pageRef.current !== targetPage) {
        playlistPaging.current = true;
        setPage(targetPage);
        setPageInput(String(targetPage + 1));
        setReadingIdx(-1);
        setReadingPhase(null);   // clear stale highlight so the new page's card doesn't flash the old phase
        await sleep(600);
      }

      if (stopRef.current) break;
      setReadingIdx(localIdx);

      const card = document.querySelector(`[data-read-idx="${localIdx}"]`);
      if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); await sleep(350); }

      if (stopRef.current) break;
      // ── Speak the German word twice (yellow highlight on word) ──
      setReadingPhase('word');
      await speakAwait(forSpeech(entry.w), { lang: 'de', rate: 0.85 });
      if (stopRef.current) break;
      while (userPausedRef.current && !stopRef.current) await sleep(80);
      if (stopRef.current) break;
      await sleep(650);
      await speakAwait(forSpeech(entry.w), { lang: 'de', rate: 0.85 });
      if (stopRef.current) break;
      while (userPausedRef.current && !stopRef.current) await sleep(80);
      if (stopRef.current) break;
      await sleep(1000);

      const ex = entry.ex ?? entry.de;
      if (ex && !stopRef.current) {
        const exClean = forSpeech(ex);
        // ── Speak the example phrase (yellow underline on example) ──
        setReadingPhase('example');
        await speakAwait(exClean, { lang: 'de', rate: 0.85 });
        if (stopRef.current) break;
        while (userPausedRef.current && !stopRef.current) await sleep(80);
        if (stopRef.current) break;
        await sleep(750);
        await speakAwait(exClean, { lang: 'de', rate: 0.85 });
        if (stopRef.current) break;
        while (userPausedRef.current && !stopRef.current) await sleep(80);
        if (stopRef.current) break;
      }

      setReadingPhase(null);
      await sleep(1300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Play all (from beginning) ───────────────────────────────── */
  const togglePlaylist = useCallback(async () => {
    stopBilingual(); // ensure bilingual mode is stopped when starting German playlist
    if (isReading) { stopPlaylist(); return; }

    stopRef.current = false;
    setIsReading(true);

    await runFrom(0);

    if (!stopRef.current) { setIsReading(false); setIsPaused(false); setReadingIdx(-1); }
  }, [isReading, stopPlaylist, runFrom]);

  /* ── Start from a specific pool index ───────────────────────── */
  const startFromEntry = useCallback(async (globalIdx: number) => {
    stopBilingual(); // ensure no bilingual is running
    stopRef.current = true;
    userPausedRef.current = false;
    stopAll();
    setIsReading(false);
    setIsPaused(false);
    setReadingIdx(-1);

    await sleep(180);

    stopRef.current = false;
    setIsReading(true);

    await runFrom(globalIdx);

    if (!stopRef.current) { setIsReading(false); setIsPaused(false); setReadingIdx(-1); }
  }, [runFrom]);

  /* ═══════════════════════════════════════════════════════════════════════
     NEW FEATURE: Bilingual DE-EN Read Aloud (completely independent)
     - New button "DE-EN speak"
     - Immediately starts from the CURRENT page (respects active filters/search/category)
     - Uses two distinct high-quality voices (German + English)
     - For each vocab: (German word + English word) x2 , then (German phrase + English phrase) x2
     - Uses the existing yellow highlight + card glow while reading
     - Does NOT touch the existing German-only playlist system
  ═══════════════════════════════════════════════════════════════════════ */

  const stopBilingual = useCallback(() => {
    bilingualStopRef.current = true;
    bilingualPausedRef.current = false;
    bilingualReadingRef.current = false;
    stopAll();
    setIsBilingualReading(false);
    setIsBilingualPaused(false);
    setReadingIdx(-1);
    setReadingPhase(null);
  }, []);

  /* Pause / resume the DE-EN reader. Pause stops the current playback;
     the read loop spin-waits on bilingualPausedRef and continues from the
     next item on resume. */
  const pauseBilingual = useCallback(() => {
    bilingualPausedRef.current = true;
    setIsBilingualPaused(true);
    stopAll();
  }, []);
  const resumeBilingual = useCallback(() => {
    bilingualPausedRef.current = false;
    setIsBilingualPaused(false);
  }, []);

  const startBilingualReading = useCallback(async () => {
    if (bilingualReadingRef.current) return;

    // Stop German playlist cleanly
    stopPlaylist();
    await sleep(150);

    // Use live refs to get the *current* page and per-page (avoids stale closure)
    const currentPage = pageRef.current;
    const currentPP = perPageRef.current;
    const currentPool = poolRef.current;

    // Start from the first item of the CURRENT page in the filtered list
    let startIdx = currentPage * currentPP;

    if (startIdx >= currentPool.length) {
      startIdx = 0; // fallback to beginning if the current page is beyond the filtered results
    }

    if (startIdx >= currentPool.length) return; // nothing to read after fallback

    bilingualStopRef.current = false;
    bilingualPausedRef.current = false;
    bilingualReadingRef.current = true;
    setIsBilingualReading(true);
    setIsBilingualPaused(false);

    const items = poolRef.current;

    for (let i = startIdx; i < items.length; i++) {
      if (bilingualStopRef.current) break;

      const entry = items[i];
      const wordDE = entry.w || '';
      const wordEN = entry.t || '';
      const exDE = entry.de || entry.ex || '';
      const exEN = entry.en || entry.exT || '';

      if (!wordDE && !wordEN && !exDE && !exEN) continue;

      const localIdx = i % currentPP;

      // Make sure the view is on the correct page for this item
      const itemTargetPage = Math.floor(i / currentPP);
      if (pageRef.current !== itemTargetPage) {
        playlistPaging.current = true;
        setReadingIdx(-1);       // clear the outgoing card's highlight BEFORE the page swaps
        setReadingPhase(null);   // → fixes the micro-flash of the old phase on the next card (esp. mobile, 1 card/page)
        setPage(itemTargetPage);
        setPageInput(String(itemTargetPage + 1));
        await sleep(350);
      }

      // --- WORD PAIR (twice) ---
      for (let rep = 0; rep < 2; rep++) {
        if (bilingualStopRef.current) break;

        // German word - highlight the German word
        if (wordDE) {
          setReadingIdx(localIdx);
          setReadingLang('de');
          setReadingPhase('word');
          await speakAwait(wordDE, { lang: 'de', rate: 0.87 });
          if (bilingualStopRef.current) break;
          while (bilingualPausedRef.current && !bilingualStopRef.current) await sleep(80);
          if (bilingualStopRef.current) break;
          await sleep(160);
        }

        // English word - highlight the English translation
        if (wordEN && !bilingualStopRef.current) {
          setReadingIdx(localIdx);
          setReadingLang('en');
          setReadingPhase('word');
          await speakAwait(wordEN, { lang: 'en', rate: 0.87 });
          if (bilingualStopRef.current) break;
          while (bilingualPausedRef.current && !bilingualStopRef.current) await sleep(80);
          if (bilingualStopRef.current) break;
          await sleep(200);
        }
      }

      if (bilingualStopRef.current) break;

      // --- EXAMPLE / PHRASE PAIR (twice) ---
      for (let rep = 0; rep < 2; rep++) {
        if (bilingualStopRef.current) break;

        // German example - highlight the German example
        if (exDE) {
          setReadingIdx(localIdx);
          setReadingLang('de');
          setReadingPhase('example');
          await speakAwait(exDE, { lang: 'de', rate: 0.87 });
          if (bilingualStopRef.current) break;
          while (bilingualPausedRef.current && !bilingualStopRef.current) await sleep(80);
          if (bilingualStopRef.current) break;
          await sleep(160);
        }

        // English example - highlight the English example
        if (exEN && !bilingualStopRef.current) {
          setReadingIdx(localIdx);
          setReadingLang('en');
          setReadingPhase('example');
          await speakAwait(exEN, { lang: 'en', rate: 0.87 });
          if (bilingualStopRef.current) break;
          while (bilingualPausedRef.current && !bilingualStopRef.current) await sleep(80);
          if (bilingualStopRef.current) break;
          await sleep(220);
        }
      }
    }

    // Cleanup
    bilingualReadingRef.current = false;
    setIsBilingualReading(false);
    setReadingIdx(-1);
    setReadingPhase(null);
    stopAll();
  }, [stopPlaylist]); // only stable dependency now; page info comes from refs at runtime

  const lvColor = LEVEL_COLOR[level] ?? '#1d4ed8';

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', background: 'var(--bg2)' }}>
        <div style={{ height: 40, background: 'var(--border)', borderRadius: 12, marginBottom: 18, width: 256, opacity: 0.5 }} />
        <div className="vocab-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 220, background: 'var(--border)', borderRadius: 12, opacity: 0.4 }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Shared playback controls (used in both desktop bar and mobile row) ── */
  const playbackControls = (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Existing German-only playlist (untouched) */}
      {!isReading ? (
        <button
          style={{ background: 'var(--bg)', border: '1px solid var(--blue-bd)', color: 'var(--blue)', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit', whiteSpace: 'nowrap' }}
          onClick={togglePlaylist} title="Alle Karten vorlesen (nur Deutsch)"
        >🔊 Read out loud</button>
      ) : (
        <>
          <button onClick={isPaused ? resumePlaylist : pausePlaylist}
            style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: isPaused ? '#16a34a' : '#d97706', color: '#fff', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            {isPaused ? '▶ Weiter' : '⏸ Pause'}
          </button>
          <button onClick={stopPlaylist}
            style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'var(--red)', color: '#fff', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            ⏹ Stop
          </button>
        </>
      )}

      {/* NEW: Separate DE-EN bilingual reader - does NOT interfere with the button above */}
      {!isBilingualReading ? (
        <button
          onClick={() => startBilingualReading()}
          style={{
            background: 'var(--bg)',
            border: '1px solid #16a34a',
            color: '#16a34a',
            padding: '5px 11px',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: 'inherit',
            whiteSpace: 'nowrap'
          }}
          title="Bilingual reading: German + English with two high-quality voices. Starts from the current page with yellow highlights."
        >
          🗣 DE-EN speak
        </button>
      ) : (
        <>
          <button
            onClick={isBilingualPaused ? resumeBilingual : pauseBilingual}
            style={{
              padding: '5px 12px',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: isBilingualPaused ? '#16a34a' : '#d97706',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap'
            }}
          >
            {isBilingualPaused ? '▶ Weiter' : '⏸ Pause'}
          </button>
          <button
            onClick={stopBilingual}
            style={{
              padding: '5px 12px',
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              background: '#dc2626',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap'
            }}
          >
            ⏹ Stop DE-EN
          </button>
        </>
      )}
    </div>
  );

  /* ── Shared card grid + pager ── */
  const cardGrid = (
    <>
      <div ref={gridRef}>
        {slice.length > 0 ? (
          <div className="vocab-grid">
            {slice.map((entry, i) => (
              <div key={`${safePage}-${i}`} data-read-idx={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <VocabCard
                  entry={entry}
                  onAddFavourite={e => add(e.w, e.t, e.ex)}
                  onRemoveFavourite={id => remove(id)}
                  isFavourite={has(entry.w ?? '')}
                  isActive={readingIdx === i}
                  readingPhase={readingIdx === i ? readingPhase : null}
                  readingLang={readingIdx === i ? readingLang : null}
                />
                <button
                  onClick={() => startFromEntry(safePage * effectivePerPage + i)}
                  title="Start reading from this card onwards"
                  style={{ padding: '5px 10px', marginTop: -2, border: '1px solid var(--blue-bd)', borderTop: 'none', borderRadius: '0 0 12px 12px', background: readingIdx === i && isReading ? 'var(--blue)' : 'rgba(239,246,255,0.85)', color: readingIdx === i && isReading ? '#fff' : 'var(--blue)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >▶ Start from here</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--muted)' }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="var(--border2)" strokeWidth="1.5">
              <circle cx="16" cy="16" r="11"/><path d="M25 25l11 11"/>
            </svg>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink2)', marginTop: 10, marginBottom: 3 }}>Keine Wörter gefunden</h4>
            <p style={{ fontSize: 12 }}>Anderen Suchbegriff versuchen</p>
          </div>
        )}
      </div>

      {/* Pager */}
      {slice.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '20px 24px 28px', flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => goPage(-1)} disabled={safePage === 0}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: safePage === 0 ? 'var(--border2)' : 'var(--ink2)', borderRadius: 8, padding: '8px 18px', cursor: safePage === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, opacity: safePage === 0 ? 0.35 : 1 }}>←</button>

          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.4 }}>
            {safePage + 1} / {totalPages}<br />
            <span style={{ fontSize: 10, fontWeight: 400 }}>{pool.length} Wörter</span>
          </span>

          <button onClick={() => goPage(1)} disabled={safePage >= totalPages - 1}
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: safePage >= totalPages - 1 ? 'var(--border2)' : 'var(--ink2)', borderRadius: 8, padding: '8px 18px', cursor: safePage >= totalPages - 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, opacity: safePage >= totalPages - 1 ? 0.35 : 1 }}>→</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: isMobile ? 0 : 8 }}>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Seite</span>
            <input type="number" min={1} max={totalPages} value={pageInput}
              onChange={e => setPageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && jumpPage()}
              style={{ width: 56, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: 'var(--bg)', color: 'var(--ink)', textAlign: 'center', fontFamily: 'inherit' }} />
            <button onClick={jumpPage} style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink2)', borderRadius: 7, padding: '5px 10px', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit' }}>Los</button>
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Karten/Seite</span>
              <input type="number" min={1} max={50} value={perInput}
                onChange={e => setPerInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && changePerPage()}
                style={{ width: 52, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: 'var(--bg)', color: 'var(--ink)', textAlign: 'center', fontFamily: 'inherit' }} />
              <button onClick={changePerPage} style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--ink2)', borderRadius: 7, padding: '5px 10px', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit' }}>OK</button>
            </div>
          )}
        </div>
      )}
    </>
  );

  /* Title Case: capitalise first letter of every word */
  const toTitleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const catLabel = (title: string) => toTitleCase(title.replace(/\s*\(A[12B1]+\)/g, ''));

  return (
    <div>
      {/* ── Desktop: sticky top bar — title + word count + playback ── */}
      {!isMobile && (
        <div className="filter-bar" style={{ top: 51 }}>
          <span style={{ fontFamily: 'var(--font-lora, Lora), serif', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>
            Vokabeln {level}
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--muted)', marginLeft: 6 }}>
            {pool.length} Wörter{activeCat !== 'all' ? ` · ${catLabel(activeCat)}` : ''}
          </span>

          <button
            onClick={() => setTocHidden(!tocHidden)}
            style={{
              marginLeft: 10,
              padding: '3px 8px',
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid var(--border)',
              borderRadius: 6,
              background: 'var(--bg)',
              color: 'var(--ink2)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap'
            }}
            title={tocHidden ? 'Show category filters' : 'Hide category filters'}
          >
            {tocHidden ? '☰' : '⟨'} {tocHidden ? 'Show Filters' : 'Hide Filters'}
          </button>

          <div style={{ marginLeft: 'auto' }}>{playbackControls}</div>
        </div>
      )}

      {/* ── Mobile: section header + drawer + playback row ── */}
      {isMobile && (
        <>
          <div className="sec-head">
            <h3>Vokabeln {level}</h3>
            <p>{pool.length} Wörter{activeCat !== 'all' ? ` · ${catLabel(activeCat)}` : ''}{search ? ` · "${search}"` : ''}</p>
          </div>
          <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Vokabel-Filter">
            <div style={{ padding: '10px 14px 6px' }}>
              <div className="srchbox" style={{ width: '100%' }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>🔍</span>
                <input type="search" placeholder="Wort suchen…" value={search} onChange={e => doSearch(e.target.value)} />
              </div>
            </div>
            <div style={{ padding: '10px 14px 4px', fontSize: 9.5, fontWeight: 600, color: 'var(--muted)', letterSpacing: '.04em' }}>Thema</div>
            <button className={`gtoc-it${activeCat === 'all' ? ' active' : ''}`} onClick={() => { selectCat('all'); setFilterOpen(false); }}>
              Alle Themen
            </button>
            {categories.map(c => (
              <button key={c.id}
                className={`gtoc-it${activeCat === c.title ? ' active' : ''}`}
                style={{ fontSize: 12 }}
                onClick={() => { selectCat(activeCat === c.title ? 'all' : c.title); setFilterOpen(false); }}>
                {catLabel(c.title)}
              </button>
            ))}
          </MobileFilterDrawer>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
            <FilterToggleButton onClick={() => setFilterOpen(true)} label="⚙ Filter" />
            {playbackControls}
          </div>
        </>
      )}

      {/* ── Main layout ── */}
      {isMobile ? (
        cardGrid
      ) : (
        /* Desktop: sidebar TOC + drag handle + cards — mirrors Grammatik layout */
        <div className="gram-layout">

          {!tocHidden && (
            <>
              {/* Left sidebar — same sticky behaviour as Grammatik gram-toc */}
              <aside className="gram-toc" style={{ width: tocWidth, flexShrink: 0, minWidth: 160, maxWidth: 400 }}>

                {/* Level badge */}
                <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`lvl lvl-${level.toLowerCase()}`}>{level}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{pool.length} Wörter</span>
                </div>

                {/* Search */}
                <div style={{ padding: '10px 10px 8px', borderBottom: '1px solid var(--border)' }}>
                  <div className="srchbox" style={{ width: '100%' }}>
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>🔍</span>
                    <input type="search" placeholder="Suchen…" value={search}
                      onChange={e => doSearch(e.target.value)} style={{ fontSize: 12 }} />
                  </div>
                </div>

                {/* All themes */}
                <button
                  className={`gtoc-it${activeCat === 'all' ? ' active' : ''}`}
                  onClick={() => selectCat('all')}
                  style={activeCat === 'all' ? { borderLeftColor: lvColor, color: lvColor, background: 'var(--blue-bg)' } : {}}
                >
                  📚 Alle Themen
                </button>

                {/* Category list — emoji + Title Case */}
                {categories.map(c => {
                  const label = catLabel(c.title);
                  const isOn  = activeCat === c.title;
                  return (
                    <button key={c.id}
                      className={`gtoc-it${isOn ? ' active' : ''}`}
                      onClick={() => selectCat(isOn ? 'all' : c.title)}
                      style={isOn ? { borderLeftColor: lvColor, color: lvColor, background: 'var(--blue-bg)' } : {}}
                      title={label}
                    >
                      {c.emoji} {label}
                    </button>
                  );
                })}
              </aside>

              {/* Drag handle */}
              <div
                onMouseDown={e => {
                  e.preventDefault();
                  document.body.style.userSelect = 'none';
                  document.body.style.cursor = 'col-resize';
                  tocDragRef.current = { active: true, startX: e.clientX, startW: tocWidth };
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-bd)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
                title="Drag to resize"
                style={{ width: 5, flexShrink: 0, cursor: 'col-resize', background: 'var(--border)', transition: 'background .15s', zIndex: 5 }}
              />
            </>
          )}

          {/* Right: cards */}
          <div className="gram-content" style={{ flex: 1, minWidth: 0 }}>
            {cardGrid}
          </div>
        </div>
      )}
    </div>
  );
}
