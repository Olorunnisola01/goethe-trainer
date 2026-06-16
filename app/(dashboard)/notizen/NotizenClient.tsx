'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/* ── Types ───────────────────────────────────────────────────── */
interface Note {
  id: string;
  title: string;
  body: string;
  cover: string;     // key into COVERS
  texture?: string;  // key into TEXTURES (default 'lines')
  category?: string; // folder name ('' = Allgemein)
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

const GENERAL = 'Allgemein';

/* ── Journal cover palette ───────────────────────────────────── */
const COVERS: Record<string, { name: string; accent: string; bg: string; bd: string; tint: string }> = {
  white:  { name: 'Weiß',     accent: '#64748b', bg: '#ffffff', bd: '#e2e8f0', tint: 'rgba(100,116,139,0.06)' },
  sand:   { name: 'Sand',     accent: '#b45309', bg: '#fffbeb', bd: '#fde68a', tint: 'rgba(180,83,9,0.05)' },
  cream:  { name: 'Creme',    accent: '#a16207', bg: '#fefce8', bd: '#fef08a', tint: 'rgba(161,98,7,0.05)' },
  peach:  { name: 'Pfirsich', accent: '#ea580c', bg: '#fff7ed', bd: '#fed7aa', tint: 'rgba(234,88,12,0.05)' },
  rose:   { name: 'Rose',     accent: '#be185d', bg: '#fdf2f8', bd: '#fbcfe8', tint: 'rgba(190,24,93,0.05)' },
  plum:   { name: 'Pflaume',  accent: '#7c3aed', bg: '#f5f3ff', bd: '#ddd6fe', tint: 'rgba(124,58,237,0.05)' },
  sky:    { name: 'Himmel',   accent: '#1d4ed8', bg: '#eff6ff', bd: '#bfdbfe', tint: 'rgba(29,78,216,0.05)' },
  aqua:   { name: 'Aqua',     accent: '#0284c7', bg: '#f0f9ff', bd: '#bae6fd', tint: 'rgba(2,132,199,0.05)' },
  mint:   { name: 'Minze',    accent: '#0d9488', bg: '#f0fdfa', bd: '#99f6e4', tint: 'rgba(13,148,136,0.05)' },
  moss:   { name: 'Moos',     accent: '#15803d', bg: '#f0fdf4', bd: '#bbf7d0', tint: 'rgba(21,128,61,0.05)' },
  slate:  { name: 'Schiefer', accent: '#475569', bg: '#f8fafc', bd: '#cbd5e1', tint: 'rgba(71,85,105,0.05)' },
  graphite:{ name: 'Graphit', accent: '#334155', bg: '#f1f5f9', bd: '#cbd5e1', tint: 'rgba(51,65,85,0.06)' },
};
const COVER_KEYS = Object.keys(COVERS);

/* ── Paper textures ──────────────────────────────────────────── */
const TEXTURES: { key: string; name: string }[] = [
  { key: 'lines', name: 'Liniert' },
  { key: 'plain', name: 'Blanko' },
  { key: 'grid',  name: 'Kariert' },
  { key: 'dots',  name: 'Gepunktet' },
];
/* Background CSS for a texture (used inline in PDF export). `bd` = line color. */
function textureCss(tex: string | undefined, bd: string): string {
  switch (tex) {
    case 'plain':
      return 'background-image:none;';
    case 'grid':
      return `background-image:linear-gradient(to bottom, ${bd} 1px, transparent 1px),linear-gradient(to right, ${bd} 1px, transparent 1px);background-size:26px 32px;`;
    case 'dots':
      return `background-image:radial-gradient(${bd} 1.3px, transparent 1.5px);background-size:26px 32px;background-position:13px 16px;`;
    case 'lines':
    default:
      return `background-image:repeating-linear-gradient(to bottom, transparent 0, transparent 31px, ${bd} 31px, ${bd} 32px);`;
  }
}

/* ── Time helper (German relative) ───────────────────────────── */
function relTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'gerade eben';
  const m = Math.floor(s / 60);
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  if (d < 7) return `vor ${d} Tag${d > 1 ? 'en' : ''}`;
  return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fullDate(ts: number): string {
  return new Date(ts).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}
/* Strip HTML tags → plain text (for previews, word/char counts) */
function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}
function wordCount(s: string): number {
  const t = stripHtml(s).replace(/\s+/g, ' ').trim();
  return t ? t.split(' ').length : 0;
}
function charCount(s: string): number {
  return stripHtml(s).replace(/\s+/g, ' ').trim().length;
}
/* "rgb(185, 28, 28)" → "#b91c1c" (lowercase); transparent/black-alpha → null */
function rgbToHex(rgb: string): string | null {
  const m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/.exec(rgb || '');
  if (!m) return null;
  if (m[4] !== undefined && Number(m[4]) === 0) return null; // fully transparent
  const h = (n: string) => Number(n).toString(16).padStart(2, '0');
  return `#${h(m[1])}${h(m[2])}${h(m[3])}`.toLowerCase();
}

const uid = () => `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

/* ── PDF export (native print-to-PDF, zero deps) ─────────────── */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/\n/g, '<br/>');
}

function exportNotesToPdf(list: Note[]) {
  if (!list.length) return;
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  const pages = list.map((n, i) => {
    const c = COVERS[n.cover] ?? COVERS.sand;
    const words = wordCount(n.body);
    const bodyHtml = stripHtml(n.body).trim() ? n.body : '<span class="empty">Leere Notiz …</span>';
    const texStyle = textureCss(n.texture, c.bd);
    return `
      <section class="paper" style="--ac:${c.accent};--bd:${c.bd};--tint:${c.bg};${i < list.length - 1 ? 'page-break-after:always;' : ''}">
        <div class="date">${esc(fullDate(n.createdAt))}</div>
        <h1 class="title">${esc(n.title.trim() || 'Ohne Titel')}</h1>
        <div class="body" style="${texStyle}">${bodyHtml}</div>
        <div class="foot">
          <span>${words} Wörter · ${charCount(n.body)} Zeichen</span>
          <span>Notiz ${i + 1} von ${list.length}</span>
        </div>
      </section>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"/>
    <title>${list.length === 1 ? esc(list[0].title.trim() || 'Notiz') : `Notizen (${list.length})`}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Comic+Neue:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
      @page { size: A4; margin: 10mm; }
      :root { --font-comic: 'Comic Neue'; }
      * { box-sizing: border-box; }
      html, body { margin: 0; }
      body {
        font-family: 'Lora', Georgia, 'Times New Roman', serif; color: #1a1714;
        background: #f8f7f4;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }
      /* Cover page (multi-note export) */
      .cover { text-align: center; padding: 90px 0 70px; page-break-after: always; }
      .cover .flag { font-size: 52px; }
      .cover h2 { font-family: 'Lora', serif; font-size: 30px; font-weight: 700; margin: 18px 0 8px; color: #1a1714; }
      .cover .sub { font-size: 13px; color: #887f74; letter-spacing: .04em; }
      .cover .rule { width: 60px; height: 3px; background: #1d4ed8; margin: 20px auto 0; border-radius: 2px; }

      /* Journal paper — mirrors the on-screen .paper exactly */
      .paper {
        position: relative;
        background-color: var(--tint);
        border: 1px solid #e8e3dc; border-top: 4px solid var(--ac);
        border-radius: 4px 4px 8px 8px;
        padding: 36px 48px 28px;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }
      .paper::before {
        content: ''; position: absolute; top: 0; bottom: 0; left: 38px; width: 1px;
        background: var(--bd); opacity: .55;
      }
      .date {
        font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
        color: var(--ac); opacity: .9; margin-bottom: 12px;
      }
      .title {
        font-family: 'Lora', serif; font-size: 27px; font-weight: 700; color: #1a1714;
        line-height: 1.25; margin: 0 0 16px; padding: 0;
      }
      .body {
        font-family: 'Comic Sans MS', 'Comic Neue', 'Comic Sans', cursive;
        font-size: 16.5px; line-height: 32px; color: #3d3830;
        white-space: pre-wrap; word-wrap: break-word;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
      }
      .body [style*="font-size"] { line-height: 1.35; }
      .body ul, .body ol { margin: 0; padding-left: 30px; }
      .body li { line-height: 32px; }
      .body ul { list-style-type: disc; }
      .body ul ul { list-style-type: circle; }
      .body ul ul ul { list-style-type: square; }
      .body ol ol { list-style-type: lower-alpha; }
      .body ol ol ol { list-style-type: lower-roman; }
      .body .empty { color: #cec8bf; font-style: italic; }
      .body table.paper-table {
        width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 14px;
        font-family: 'Lora', serif; line-height: 1.4;
      }
      .body table.paper-table th {
        background: var(--ac); color: #fff; padding: 7px 10px; font-weight: 600;
        text-align: left; font-size: 12px; letter-spacing: .02em; border: 1px solid var(--bd);
      }
      .body table.paper-table td { padding: 7px 10px; border: 1px solid var(--bd); vertical-align: top; }
      .body table.paper-table tr:nth-child(even) td { background: rgba(0,0,0,0.025); }
      .foot {
        display: flex; justify-content: space-between; gap: 12px;
        margin-top: 22px; padding-top: 14px; border-top: 1px dashed var(--bd);
        font-size: 11px; color: #887f74; font-weight: 600;
      }
    </style></head>
    <body>
      ${list.length > 1 ? `<div class="cover"><div class="flag">🇩🇪📓</div>
        <h2>Mein Lern-Journal</h2>
        <div class="sub">${list.length} Notizen · exportiert am ${esc(today)}</div>
        <div class="rule"></div></div>` : ''}
      ${pages}
      <script>
        (function () {
          var done = false;
          function go () { if (done) return; done = true; try { window.focus(); window.print(); } catch (e) {} }
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { setTimeout(go, 120); });
            setTimeout(go, 1500); /* fallback if fonts hang */
          } else {
            window.onload = function () { setTimeout(go, 400); };
          }
        })();
      </script>
    </body></html>`;

  const w = window.open('', '_blank');
  if (!w) { alert('Bitte Pop-ups für diese Seite erlauben, um als PDF zu exportieren.'); return; }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/* ── Component ───────────────────────────────────────────────── */
export function NotizenClient() {
  const { user } = useAuth();
  const storageKey = `notizen_${user?.uid ?? 'guest'}`;
  const catKey     = `notizen_cats_${user?.uid ?? 'guest'}`;

  const [notes, setNotes]       = useState<Note[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [mobileView, setMobile] = useState<'list' | 'editor'>('list');
  const [loaded, setLoaded]     = useState(false);
  const [savedFlash, setSaved]  = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);
  const [listHidden, setListHidden] = useState(false);
  const [cloud, setCloud] = useState<'off' | 'syncing' | 'synced'>('off');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cloudReady = useRef(false); // becomes true once cloud has been read for this user

  /* Load */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed: Note[] = JSON.parse(raw);
        setNotes(parsed);
        if (parsed.length) setActiveId(parsed.slice().sort(sortFn)[0].id);
      }
      const rawCats = localStorage.getItem(catKey);
      if (rawCats) setCategories(JSON.parse(rawCats));
    } catch { /* ignore */ }
    setLoaded(true);
  }, [storageKey, catKey]);

  /* Persist categories */
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(catKey, JSON.stringify(categories)); } catch { /* ignore */ }
  }, [categories, loaded, catKey]);

  /* ── Cloud sync: load this user's notebook from Firestore on sign-in ── */
  useEffect(() => {
    cloudReady.current = false;
    if (!user) { setCloud('off'); return; }
    let cancelled = false;
    setCloud('syncing');
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data() as { notes?: Note[]; categories?: string[] };
          if (Array.isArray(data.notes)) {
            setNotes(data.notes);
            setActiveId(data.notes.length ? [...data.notes].sort(sortFn)[0].id : null);
          }
          if (Array.isArray(data.categories)) setCategories(data.categories);
        }
        // If the doc doesn't exist, keep whatever loaded from localStorage; the
        // save effect below will seed the cloud with it.
        cloudReady.current = true;
        setCloud('synced');
      } catch {
        if (!cancelled) setCloud('off'); // offline / blocked — local-only this session
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  /* ── Cloud sync: write changes back to Firestore (debounced) ── */
  useEffect(() => {
    if (!user || !loaded || !cloudReady.current) return;
    const t = setTimeout(() => {
      setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        notes,
        categories,
        updatedAt: Date.now(),
      }).then(() => setCloud('synced')).catch(() => { /* keep local */ });
    }, 700);
    return () => clearTimeout(t);
  }, [notes, categories, user, loaded]);

  /* Persist (debounced) */
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(notes));
        setSaved(true);
        setTimeout(() => setSaved(false), 1400);
      } catch { /* ignore */ }
    }, 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [notes, loaded, storageKey]);

  const active = notes.find(n => n.id === activeId) ?? null;

  /* Sorted + filtered list */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes
      .filter(n => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      .sort(sortFn);
  }, [notes, search]);

  /* Ordered category list: General first, then custom folders, then any orphan cats. */
  const orderedCats = useMemo(() => {
    const out = [GENERAL, ...categories.filter(c => c && c !== GENERAL)];
    notes.forEach(n => {
      const c = (n.category || '').trim();
      if (c && !out.includes(c)) out.push(c);
    });
    return out;
  }, [categories, notes]);

  /* Group the visible notes by category. */
  const groups = useMemo(() => {
    const searching = !!search.trim();
    return orderedCats.map(cat => ({
      cat,
      items: visible.filter(n => ((n.category || '').trim() || GENERAL) === cat),
    })).filter(g => g.items.length > 0 || (!searching && g.cat !== GENERAL));
  }, [orderedCats, visible, search]);

  /* ── Actions ──────────────────────────────────────────────── */
  const createNote = useCallback(() => {
    const now = Date.now();
    const note: Note = {
      id: uid(), title: '', body: '',
      cover: COVER_KEYS[Math.floor(Math.random() * COVER_KEYS.length)],
      texture: 'lines',
      pinned: false, createdAt: now, updatedAt: now,
    };
    setNotes(prev => [note, ...prev]);
    setActiveId(note.id);
    setMobile('editor');
  }, []);

  const patch = useCallback((id: string, p: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...p, updatedAt: Date.now() } : n));
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  }, []);

  const remove = useCallback((id: string) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      if (activeId === id) setActiveId(next.length ? next.slice().sort(sortFn)[0].id : null);
      return next;
    });
  }, [activeId]);

  /* ── Categories / folders ─────────────────────────────────── */
  const addCategory = useCallback(() => {
    const name = window.prompt('Name der neuen Kategorie:')?.trim();
    if (!name || name === GENERAL) return;
    setCategories(prev => prev.includes(name) ? prev : [...prev, name]);
  }, []);

  const assignCategory = useCallback((id: string, value: string) => {
    if (value === '__new__') {
      const name = window.prompt('Name der neuen Kategorie:')?.trim();
      if (!name || name === GENERAL) return;
      setCategories(prev => prev.includes(name) ? prev : [...prev, name]);
      patch(id, { category: name });
      return;
    }
    patch(id, { category: value === GENERAL ? '' : value });
  }, [patch]);

  const deleteCategory = useCallback((cat: string) => {
    if (cat === GENERAL) return;
    if (!window.confirm(`Kategorie „${cat}" löschen? Die Notizen wandern nach „${GENERAL}".`)) return;
    setNotes(prev => prev.map(n => (n.category || '').trim() === cat ? { ...n, category: '' } : n));
    setCategories(prev => prev.filter(c => c !== cat));
  }, []);

  const toggleCat = useCallback((cat: string) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const exitSelect = useCallback(() => { setSelectMode(false); setSelected(new Set()); }, []);

  const exportSelected = useCallback(() => {
    const chosen = notes.filter(n => selected.has(n.id)).sort(sortFn);
    if (chosen.length) { exportNotesToPdf(chosen); exitSelect(); }
    setExportOpen(false);
  }, [notes, selected, exitSelect]);

  const exportAll = useCallback(() => {
    exportNotesToPdf(notes.slice().sort(sortFn));
    setExportOpen(false);
  }, [notes]);

  const exportCurrent = useCallback(() => {
    if (active) exportNotesToPdf([active]);
    setExportOpen(false);
  }, [active]);

  /* ── Render ───────────────────────────────────────────────── */
  const totalWords = notes.reduce((a, n) => a + wordCount(n.body), 0);

  return (
    <div className="notes-wrap">
      {/* Toolbar */}
      <div className="notes-toolbar">
        <button
          className="notes-ghost notes-collapse"
          onClick={() => setListHidden(h => !h)}
          title={listHidden ? 'Notizliste einblenden' : 'Notizliste ausblenden'}
        >
          {listHidden ? '⮞' : '⮜'}
        </button>
        <button className="notes-new" onClick={createNote}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Neue Notiz
        </button>
        <div className="notes-search-box">
          <span style={{ opacity: 0.5, fontSize: 13 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Notizen durchsuchen…"
            className="notes-search-input"
          />
        </div>
        {selectMode ? (
          <div className="notes-select-actions">
            <span className="notes-stat" style={{ marginLeft: 0 }}>{selected.size} ausgewählt</span>
            <button className="notes-ghost" disabled={selected.size === 0} onClick={exportSelected}>
              ⬇ {selected.size} als PDF
            </button>
            <button className="notes-ghost" onClick={exitSelect}>Abbrechen</button>
          </div>
        ) : (
          <div className="notes-export-wrap">
            <button className="notes-ghost" onClick={() => setExportOpen(o => !o)} disabled={notes.length === 0}>
              ⬇ Export ▾
            </button>
            {exportOpen && (
              <>
                <div className="notes-menu-backdrop" onClick={() => setExportOpen(false)} />
                <div className="notes-menu">
                  <button onClick={exportCurrent} disabled={!active}>
                    📄 Diese Notiz
                  </button>
                  <button onClick={() => { setSelectMode(true); setExportOpen(false); }} disabled={notes.length < 2}>
                    ☑️ Notizen auswählen…
                  </button>
                  <button onClick={exportAll}>
                    📚 Alle Notizen ({notes.length})
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        <div className="notes-stat">
          {cloud !== 'off' && (
            <span className="cloud-badge" title={cloud === 'synced' ? 'Über die Cloud auf allen Geräten synchronisiert' : 'Synchronisiere…'}>
              {cloud === 'synced' ? '☁ Synchronisiert' : '☁ Sync…'}
            </span>
          )}
          {notes.length} {notes.length === 1 ? 'Notiz' : 'Notizen'} · {totalWords} Wörter
        </div>
      </div>

      <div className={`notes-layout view-${mobileView}${listHidden ? ' list-hidden' : ''}`}>
        {/* ── List pane ── */}
        <aside className="notes-list">
          <div className="cat-toolbar">
            <span className="cat-toolbar-lbl">Kategorien</span>
            <button className="cat-add-btn" onClick={addCategory} title="Neue Kategorie anlegen">+ Ordner</button>
          </div>
          {visible.length === 0 && notes.length === 0 ? (
            <div className="notes-list-empty">
              <div style={{ fontSize: 40, marginBottom: 8 }}>📓</div>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Noch keine Notizen</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                Halte Vokabeln, Grammatikregeln oder Gedanken fest.<br/>Tippe auf <b>+ Neue Notiz</b>.
              </div>
            </div>
          ) : visible.length === 0 ? (
            <div className="notes-list-empty">
              <div style={{ fontSize: 32, marginBottom: 6 }}>🔍</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Nichts gefunden für „{search}“</div>
            </div>
          ) : groups.map(g => {
            const collapsed = collapsedCats.has(g.cat);
            return (
              <div key={g.cat} className="cat-group">
                <div className="cat-head">
                  <button className="cat-head-main" onClick={() => toggleCat(g.cat)}>
                    <span className="cat-caret">{collapsed ? '▸' : '▾'}</span>
                    <span className="cat-name">{g.cat === GENERAL ? '📋 ' + g.cat : '📁 ' + g.cat}</span>
                    <span className="cat-count">{g.items.length}</span>
                  </button>
                  {g.cat !== GENERAL && (
                    <button className="cat-del" onClick={() => deleteCategory(g.cat)} title="Kategorie löschen">✕</button>
                  )}
                </div>
                {!collapsed && (
                  g.items.length === 0 ? (
                    <div className="cat-empty">Leerer Ordner — weise einer Notiz diese Kategorie zu.</div>
                  ) : g.items.map(n => {
                    const c = COVERS[n.cover] ?? COVERS.sand;
                    const checked = selected.has(n.id);
                    const sel = selectMode ? checked : n.id === activeId;
                    const preview = stripHtml(n.body).replace(/\s+/g, ' ').trim().slice(0, 90);
                    return (
                      <button
                        key={n.id}
                        onClick={() => { if (selectMode) { toggleSelect(n.id); } else { setActiveId(n.id); setMobile('editor'); } }}
                        className={`note-card${sel ? ' sel' : ''}`}
                        style={{ '--spine': c.accent, '--cardtint': sel ? c.tint : 'transparent' } as React.CSSProperties}
                      >
                        {selectMode && (
                          <span className={`note-check${checked ? ' on' : ''}`} style={{ '--spine': c.accent } as React.CSSProperties}>
                            {checked ? '✓' : ''}
                          </span>
                        )}
                        <span className="note-card-spine" />
                        <div className="note-card-body">
                          <div className="note-card-top">
                            <span className="note-card-title">{n.title.trim() || 'Ohne Titel'}</span>
                            {n.pinned && <span title="Angepinnt" style={{ fontSize: 11 }}>📌</span>}
                          </div>
                          <div className="note-card-preview">{preview || 'Leere Notiz …'}</div>
                          <div className="note-card-meta">
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.accent, display: 'inline-block' }} />
                            {relTime(n.updatedAt)}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            );
          })}
        </aside>

        {/* ── Editor pane ── */}
        <section className="notes-editor">
          {!active ? (
            <div className="notes-editor-empty">
              <div style={{ fontSize: 56, marginBottom: 14, opacity: 0.85 }}>🖋️</div>
              <div style={{ fontFamily: 'var(--font-lora, Lora), serif', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                Dein Journal
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', maxWidth: 320, lineHeight: 1.7 }}>
                Wähle links eine Notiz aus oder erstelle eine neue, um mit dem Schreiben zu beginnen.
              </div>
              <button className="notes-new" style={{ marginTop: 20 }} onClick={createNote}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Erste Notiz schreiben
              </button>
            </div>
          ) : (
            <EditorPane
              key={active.id}
              note={active}
              categories={categories}
              onAssignCategory={v => assignCategory(active.id, v)}
              onPatch={patch}
              onPin={() => togglePin(active.id)}
              onDelete={() => remove(active.id)}
              onBack={() => setMobile('list')}
              onExport={() => exportNotesToPdf([active])}
              savedFlash={savedFlash}
            />
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Sort: pinned first, then most-recent ─────────────────────── */
function sortFn(a: Note, b: Note) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return b.updatedAt - a.updatedAt;
}

/* ── Rich-text toolbar presets ────────────────────────────────── */
type FontFamily = { label: string; css: string; weight?: number };
const FONT_FAMILIES: FontFamily[] = [
  { label: 'Lora',            css: "'Lora', Georgia, serif" },
  { label: 'Georgia',         css: "Georgia, 'Times New Roman', serif" },
  { label: 'Times New Roman', css: "'Times New Roman', Times, serif" },
  { label: 'Garamond',        css: "Garamond, 'Times New Roman', serif" },
  { label: 'Palatino',        css: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { label: 'Arial',           css: "Arial, Helvetica, sans-serif" },
  { label: 'Helvetica',       css: "Helvetica, Arial, sans-serif" },
  { label: 'Verdana',         css: "Verdana, Geneva, sans-serif" },
  { label: 'Tahoma',          css: "Tahoma, Geneva, sans-serif" },
  { label: 'Trebuchet MS',    css: "'Trebuchet MS', Tahoma, sans-serif" },
  { label: 'Calibri',         css: "Calibri, Candara, sans-serif" },
  { label: 'Segoe UI',        css: "'Segoe UI', Roboto, sans-serif" },
  { label: 'Courier New',     css: "'Courier New', Courier, monospace" },
  { label: 'Comic Sans MS',      css: "'Comic Sans MS', var(--font-comic), 'Comic Sans', cursive" },
  { label: 'Comic Sans MS Fett', css: "'Comic Sans MS', var(--font-comic), 'Comic Sans', cursive", weight: 700 },
  { label: 'Brush Script MT', css: "'Brush Script MT', 'Segoe Script', cursive" },
];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const TEXT_COLORS = ['#1a1714', '#b91c1c', '#b45309', '#15803d', '#1d4ed8', '#7c3aed', '#be185d'];
const HIGHLIGHT_COLORS = ['#ffff00', '#fde047', '#86efac', '#7dd3fc', '#f9a8d4', '#fdba74', '#c4b5fd', '#e5e7eb', '#ffffff'];

const DEFAULT_FONT = 'Comic Sans MS';
type ListType = { key: string; name: string; tag: 'ul' | 'ol' | ''; style: string };
const LIST_TYPES: ListType[] = [
  { key: 'none',        name: 'Keine Liste',   tag: '',   style: '' },
  { key: 'disc',        name: '•  Punkte',     tag: 'ul', style: 'disc' },
  { key: 'decimal',     name: '1.  Zahlen',    tag: 'ol', style: 'decimal' },
  { key: 'lower-alpha', name: 'a.  Buchstaben', tag: 'ol', style: 'lower-alpha' },
  { key: 'upper-roman', name: 'I.  Römisch',   tag: 'ol', style: 'upper-roman' },
];

/* ── Editor pane ──────────────────────────────────────────────── */
function EditorPane({
  note, categories, onAssignCategory, onPatch, onPin, onDelete, onBack, onExport, savedFlash,
}: {
  note: Note;
  categories: string[];
  onAssignCategory: (value: string) => void;
  onPatch: (id: string, p: Partial<Note>) => void;
  onPin: () => void;
  onDelete: () => void;
  onBack: () => void;
  onExport: () => void;
  savedFlash: boolean;
}) {
  const c = COVERS[note.cover] ?? COVERS.sand;
  const [confirmDel, setConfirmDel] = useState(false);
  const [fmtOpen, setFmtOpen] = useState(false);
  const [stats, setStats] = useState(() => ({ w: wordCount(note.body), ch: charCount(note.body) }));
  const [fontSel, setFontSel] = useState(DEFAULT_FONT);
  const [sizeSel, setSizeSel] = useState(16);
  const [sizeInput, setSizeInput] = useState('16');
  const [focusMode, setFocusMode] = useState(false);
  const [fmt, setFmt] = useState<{ bold: boolean; italic: boolean; underline: boolean; fore: string | null; hilite: string | null }>(
    { bold: false, italic: false, underline: false, fore: null, hilite: null }
  );
  const bodyRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  /* Load the note's HTML into the editable surface once (key remount per note). */
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.innerHTML = note.body || '';
    try { document.execCommand('defaultParagraphSeparator', false, 'div'); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncBody = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const html = el.innerHTML;
    onPatch(note.id, { body: html });
    setStats({ w: wordCount(html), ch: charCount(html) });
  }, [note.id, onPatch]);

  /* Reflect the caret/selection's formatting in the toolbar. */
  const refreshState = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !bodyRef.current?.contains(sel.anchorNode)) return;
    const q = (cmd: string) => { try { return document.queryCommandState(cmd); } catch { return false; } };
    let fore: string | null = null, hilite: string | null = null;
    try { fore = rgbToHex(String(document.queryCommandValue('foreColor'))); } catch { /* ignore */ }
    try { hilite = rgbToHex(String(document.queryCommandValue('backColor'))); } catch { /* ignore */ }
    setFmt({ bold: q('bold'), italic: q('italic'), underline: q('underline'), fore, hilite });
    try {
      const fn = String(document.queryCommandValue('fontName') || '').replace(/['"]/g, '').toLowerCase();
      if (fn) {
        const norm = (s: string) => s.toLowerCase().replace(/['"]/g, '');
        const matches = FONT_FAMILIES.filter(f => norm(f.css) === fn || fn.includes(f.label.toLowerCase()));
        if (matches.length) {
          let node: Node | null = sel.anchorNode;
          if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
          const w = node instanceof Element ? parseInt(getComputedStyle(node).fontWeight, 10) || 400 : 400;
          const pick = (w >= 600 && matches.find(f => f.weight)) || matches.find(f => !f.weight) || matches[0];
          setFontSel(pick.label);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', refreshState);
    return () => document.removeEventListener('selectionchange', refreshState);
  }, [refreshState]);

  const exec = useCallback((cmd: string, val?: string) => {
    bodyRef.current?.focus();
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
    try { document.execCommand(cmd, false, val); } catch { /* ignore */ }
    syncBody();
    refreshState();
  }, [syncBody, refreshState]);

  /* preventDefault on mousedown keeps the text selection while clicking toolbar buttons */
  const keepSel = (e: React.MouseEvent) => e.preventDefault();

  /* Dropdowns (select) steal focus, so we save the selection on open and restore it. */
  const saveSel = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && bodyRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);
  const restoreSel = useCallback(() => {
    const sel = window.getSelection();
    bodyRef.current?.focus();
    if (savedRange.current && sel) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
  }, []);

  const applyFont = useCallback((label: string) => {
    const f = FONT_FAMILIES.find(x => x.label === label);
    if (!f) return;
    setFontSel(label);
    restoreSel();
    const root = bodyRef.current;
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
    try { document.execCommand('fontName', false, f.css); } catch { /* ignore */ }
    // Stamp a font-weight (e.g. for the "Fett" thicker variant) via the same
    // <font size=7> marker trick used by applySize, so weight survives independently.
    if (root) {
      try { document.execCommand('styleWithCSS', false, 'false'); } catch { /* ignore */ }
      try { document.execCommand('fontSize', false, '7'); } catch { /* ignore */ }
      root.querySelectorAll('font[size="7"]').forEach(node => {
        const span = document.createElement('span');
        span.style.fontWeight = f.weight ? String(f.weight) : 'normal';
        while (node.firstChild) span.appendChild(node.firstChild);
        node.replaceWith(span);
      });
      try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
    }
    syncBody();
  }, [restoreSel, syncBody]);

  /* Insert an editable table (styled like the Grammatik tables). */
  const insertTable = useCallback(() => {
    const rowsStr = window.prompt('Anzahl Zeilen (ohne Kopfzeile):', '3');
    if (rowsStr === null) return;
    const colsStr = window.prompt('Anzahl Spalten:', '3');
    if (colsStr === null) return;
    const rows = Math.min(30, Math.max(1, parseInt(rowsStr, 10) || 1));
    const cols = Math.min(12, Math.max(1, parseInt(colsStr, 10) || 1));
    restoreSel();
    bodyRef.current?.focus();
    let html = '<table class="paper-table"><thead><tr>';
    for (let c = 0; c < cols; c++) html += `<th>Spalte ${c + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += '<td><br></td>';
      html += '</tr>';
    }
    html += '</tbody></table><div><br></div>';
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
    try { document.execCommand('insertHTML', false, html); } catch { /* ignore */ }
    syncBody();
  }, [restoreSel, syncBody]);

  /* Exact px size: the native command only allows 1–7, so we drop a <font size=7>
     marker (styleWithCSS off) then rewrite those nodes to a precise px span. */
  const applySize = useCallback((px: number) => {
    setSizeSel(px);
    setSizeInput(String(px));
    restoreSel();
    const root = bodyRef.current;
    if (!root) return;
    try { document.execCommand('styleWithCSS', false, 'false'); } catch { /* ignore */ }
    try { document.execCommand('fontSize', false, '7'); } catch { /* ignore */ }
    root.querySelectorAll('font[size="7"]').forEach(f => {
      const span = document.createElement('span');
      span.style.fontSize = `${px}px`;
      while (f.firstChild) span.appendChild(f.firstChild);
      f.replaceWith(span);
    });
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
    syncBody();
  }, [restoreSel, syncBody]);

  /* Find the nearest UL/OL ancestor of the caret (or null). */
  const nearestList = useCallback((): HTMLElement | null => {
    const sel = window.getSelection();
    let node: Node | null | undefined = sel?.anchorNode;
    const root = bodyRef.current;
    while (node && node !== root) {
      if (node.nodeType === 1) {
        const tag = (node as HTMLElement).tagName;
        if (tag === 'UL' || tag === 'OL') return node as HTMLElement;
      }
      node = node.parentNode;
    }
    return null;
  }, []);

  const applyList = useCallback((key: string) => {
    if (!key) return;
    restoreSel();
    bodyRef.current?.focus();
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
    const def = LIST_TYPES.find(l => l.key === key);
    if (!def) return;
    if (def.key === 'none') {
      const list = nearestList();
      if (list) document.execCommand(list.tagName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');
    } else {
      document.execCommand(def.tag === 'ol' ? 'insertOrderedList' : 'insertUnorderedList');
      const list = nearestList();
      if (list) list.style.listStyleType = def.style;
    }
    syncBody();
  }, [restoreSel, nearestList, syncBody]);

  /* Tab = indent / nest list; Shift+Tab = outdent. Outside a list, insert a tab stop. */
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    try { document.execCommand('styleWithCSS', false, 'true'); } catch { /* ignore */ }
    if (e.shiftKey) {
      document.execCommand('outdent');
    } else if (nearestList()) {
      document.execCommand('indent');
    } else {
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
    syncBody();
  }, [nearestList, syncBody]);

  return (
    <div className={`editor-inner${focusMode ? ' focus-mode' : ''}`} style={{ '--accent': c.accent, '--accent-bg': c.bg, '--accent-bd': c.bd } as React.CSSProperties}>
      {focusMode && (
        <button className="focus-exit" onClick={() => setFocusMode(false)} title="Werkzeugleisten einblenden">⤢</button>
      )}
      {/* Editor toolbar */}
      <div className="editor-bar">
        <button className="editor-back" onClick={onBack} title="Zurück zur Liste">←</button>

        <div className="editor-covers">
          {COVER_KEYS.map(k => {
            const cv = COVERS[k];
            return (
              <button
                key={k}
                title={cv.name}
                onClick={() => onPatch(note.id, { cover: k })}
                className={`cover-dot${note.cover === k ? ' on' : ''}`}
                style={{ background: cv.accent }}
              />
            );
          })}
        </div>

        <select
          className="fmt-select editor-texture"
          value={note.texture ?? 'lines'}
          onChange={e => onPatch(note.id, { texture: e.target.value })}
          title="Papier-Textur"
        >
          {TEXTURES.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
        </select>

        <select
          className="fmt-select editor-category"
          value={(note.category || '').trim() || GENERAL}
          onChange={e => onAssignCategory(e.target.value)}
          title="Kategorie / Ordner"
        >
          <option value={GENERAL}>📋 {GENERAL}</option>
          {categories.map(cat => <option key={cat} value={cat}>📁 {cat}</option>)}
          <option value="__new__">➕ Neue Kategorie…</option>
        </select>

        <div className="editor-bar-right">
          <span className={`save-pill${savedFlash ? ' show' : ''}`}>✓ Gespeichert</span>
          <button className={`editor-icon${fmtOpen ? ' active' : ''}`} onClick={() => setFmtOpen(o => !o)} title={fmtOpen ? 'Formatierungsleiste ausblenden' : 'Formatierungsleiste einblenden'}>Aa</button>
          <button className="editor-icon" onClick={() => setFocusMode(true)} title="Werkzeugleisten ausblenden">⤡</button>
          <button className="editor-icon" onClick={onExport} title="Als PDF exportieren">⬇</button>
          <button className={`editor-icon${note.pinned ? ' active' : ''}`} onClick={onPin} title={note.pinned ? 'Lösen' : 'Anpinnen'}>
            📌
          </button>
          {confirmDel ? (
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <button className="editor-del-confirm" onClick={onDelete}>Löschen</button>
              <button className="editor-icon" onClick={() => setConfirmDel(false)} title="Abbrechen">✕</button>
            </span>
          ) : (
            <button className="editor-icon danger" onClick={() => setConfirmDel(true)} title="Notiz löschen">🗑</button>
          )}
        </div>
      </div>

      {/* Formatting toolbar — hidden by default; toggled with the Aa button */}
      {fmtOpen && <div className="fmt-bar">
        {/* Font family */}
        <select
          className="fmt-select fmt-font"
          value={fontSel}
          onMouseDown={saveSel}
          onChange={e => applyFont(e.target.value)}
          title="Schriftart"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.label} value={f.label} style={{ fontFamily: f.css }}>{f.label}</option>
          ))}
        </select>

        {/* Font size presets */}
        <select
          className="fmt-select fmt-sizesel"
          value={sizeSel}
          onMouseDown={saveSel}
          onChange={e => applySize(Number(e.target.value))}
          title="Schriftgröße (px)"
        >
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Exact font size (any px value) */}
        <input
          type="number"
          className="fmt-select fmt-sizeinput"
          min={6}
          max={300}
          value={sizeInput}
          onMouseDown={saveSel}
          onChange={e => setSizeInput(e.target.value)}
          onBlur={() => { const v = parseInt(sizeInput, 10); if (v >= 6 && v <= 300) applySize(v); else setSizeInput(String(sizeSel)); }}
          onKeyDown={e => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const v = parseInt(sizeInput, 10);
            if (v >= 6 && v <= 300) applySize(v); else setSizeInput(String(sizeSel));
          }}
          title="Exakte Schriftgröße in px (Enter zum Anwenden)"
        />

        <span className="fmt-sep" />
        <button className={`fmt-btn${fmt.bold ? ' active' : ''}`} style={{ fontWeight: 800 }} onMouseDown={keepSel} onClick={() => exec('bold')} title="Fett (Strg+B)">B</button>
        <button className={`fmt-btn${fmt.italic ? ' active' : ''}`} style={{ fontStyle: 'italic' }} onMouseDown={keepSel} onClick={() => exec('italic')} title="Kursiv (Strg+I)">I</button>
        <button className={`fmt-btn${fmt.underline ? ' active' : ''}`} style={{ textDecoration: 'underline' }} onMouseDown={keepSel} onClick={() => exec('underline')} title="Unterstrichen (Strg+U)">U</button>

        <span className="fmt-sep" />
        {/* Lists */}
        <select
          className="fmt-select fmt-list"
          value=""
          onMouseDown={saveSel}
          onChange={e => applyList(e.target.value)}
          title="Liste (Tab = einrücken)"
        >
          <option value="" disabled>≣ Liste</option>
          {LIST_TYPES.map(l => <option key={l.key} value={l.key}>{l.name}</option>)}
        </select>
        <button className="fmt-btn" onMouseDown={keepSel} onClick={() => exec('outdent')} title="Ausrücken (Umschalt+Tab)">⇤</button>
        <button className="fmt-btn" onMouseDown={keepSel} onClick={() => exec('indent')} title="Einrücken (Tab)">⇥</button>

        <span className="fmt-sep" />
        <button className="fmt-btn" onMouseDown={keepSel} onClick={insertTable} title="Tabelle einfügen">⊞</button>

        <span className="fmt-sep" />
        <span className="fmt-ico" title="Textfarbe">A</span>
        {TEXT_COLORS.map(col => (
          <button key={col} className={`fmt-swatch${fmt.fore === col.toLowerCase() ? ' on' : ''}`} style={{ background: col }} onMouseDown={keepSel} onClick={() => exec('foreColor', col)} title="Textfarbe" />
        ))}

        <span className="fmt-sep" />
        <span className="fmt-ico" title="Markierungsfarbe">🖍</span>
        {HIGHLIGHT_COLORS.map(col => (
          <button key={col} className={`fmt-swatch fmt-hl${fmt.hilite === col.toLowerCase() ? ' on' : ''}`} style={{ background: col }} onMouseDown={keepSel} onClick={() => exec('hiliteColor', col)} title="Markieren" />
        ))}
        <button className="fmt-swatch fmt-hl fmt-hl-none" onMouseDown={keepSel} onClick={() => exec('hiliteColor', 'transparent')} title="Markierung entfernen">⌀</button>

        <span className="fmt-sep" />
        <button className="fmt-btn" onMouseDown={keepSel} onClick={() => exec('removeFormat')} title="Formatierung entfernen">⌫</button>
      </div>}

      {/* Paper */}
      <div className="editor-scroll">
        <div className="paper">
          <div className="paper-date">{fullDate(note.createdAt)}</div>
          <input
            className="paper-title"
            value={note.title}
            onChange={e => onPatch(note.id, { title: e.target.value })}
            placeholder="Titel der Notiz…"
            autoFocus={!note.title}
          />
          <div
            ref={bodyRef}
            className={`paper-body tex-${note.texture ?? 'lines'}`}
            contentEditable
            suppressContentEditableWarning
            onInput={syncBody}
            onKeyDown={onKeyDown}
            data-placeholder="Schreibe hier deine Gedanken, Vokabeln oder Notizen…"
            spellCheck={false}
          />
          <div className="paper-footer">
            <span>{stats.w} Wörter · {stats.ch} Zeichen</span>
            <span>Zuletzt bearbeitet {relTime(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
