'use client';

/* Global search (⌘/Ctrl+K, or the 🔍 button in the sidebar). Searches across
   app pages + the full vocabulary (German & English). Opens on a custom
   'open-global-search' event too. */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface PageEntry { label: string; href: string; icon: string; kw?: string }
const PAGES: PageEntry[] = [
  { label: 'Startseite', href: '/home', icon: '🏠' },
  { label: 'Mein Fortschritt', href: '/fortschritt', icon: '📊', kw: 'xp streak erfolge stufe einstellungen dark mode' },
  { label: 'Meine Favoriten', href: '/favoriten', icon: '⭐' },
  { label: 'Notizen', href: '/notizen', icon: '📓' },
  { label: 'Vokabeln A1', href: '/vocab/A1', icon: '📚' },
  { label: 'Vokabeln A2', href: '/vocab/A2', icon: '📚' },
  { label: 'Vokabeln B1', href: '/vocab/B1', icon: '📚' },
  { label: 'Vokabeln B2', href: '/vocab/B2', icon: '📚' },
  { label: 'Grammatik', href: '/grammatik', icon: '🏗' },
  { label: 'Konjugation', href: '/konjugation', icon: '🔡' },
  { label: 'Verb-Konjugations-Quiz', href: '/ueben/verb-quiz', icon: '🔤' },
  { label: 'Satzstellung', href: '/ueben/satzstellung', icon: '🧩' },
  { label: 'Redemittel A1', href: '/redemittel/A1', icon: '💬' },
  { label: 'Redemittel A2', href: '/redemittel/A2', icon: '💬' },
  { label: 'Redemittel B1', href: '/redemittel/B1', icon: '💬' },
  { label: 'Redemittel B2', href: '/redemittel/B2', icon: '💬' },
  { label: 'Deutsche Nachrichten', href: '/nachrichten', icon: '📰' },
  { label: 'Prüfungsinfo', href: '/pruefungsinfo', icon: '📋' },
  { label: 'Lernplan', href: '/lernplan', icon: '📅' },
  { label: 'Karteikarten', href: '/ueben/karteikarten', icon: '🃏' },
  { label: 'Vokabel-Quiz', href: '/ueben/quiz', icon: '🎯' },
  { label: 'Redemittel-Quiz', href: '/ueben/redemittel-quiz', icon: '💬' },
  { label: 'Grammatik-Quiz', href: '/ueben/grammatik-quiz', icon: '🏗' },
  { label: 'Schreibübungen', href: '/ueben/schreiben', icon: '✍️' },
  { label: 'Leseverstehen', href: '/ueben/lesen', icon: '📖' },
  { label: 'Sprechen', href: '/ueben/sprechen', icon: '🎙' },
  { label: 'Hören', href: '/ueben/hoeren', icon: '🎧' },
  { label: 'Konversation', href: '/ueben/konversation', icon: '💬' },
  { label: 'Kurzgeschichten', href: '/ueben/geschichten', icon: '📚' },
];

interface VHit { w: string; t: string; level: string }

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [vocab, setVocab] = useState<VHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => { setOpen(false); setQ(''); }, []);

  /* Open on ⌘/Ctrl+K or custom event; close on Esc. */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') close();
    };
    const evt = () => setOpen(true);
    window.addEventListener('keydown', key);
    window.addEventListener('open-global-search', evt as EventListener);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('open-global-search', evt as EventListener); };
  }, [close]);

  /* Lazy-load vocab the first time the palette opens. */
  useEffect(() => {
    if (!open || vocab.length) return;
    fetch('/data/vocab.json').then(r => r.json()).then((cats: { level: string; entries: { w: string; t: string }[] }[]) => {
      const out: VHit[] = [];
      cats.forEach(c => c.entries.forEach(e => out.push({ w: e.w, t: e.t, level: c.level })));
      setVocab(out);
    }).catch(() => { /* ignore */ });
  }, [open, vocab.length]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 40); }, [open]);

  const pageHits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PAGES.slice(0, 6);
    return PAGES.filter(p => p.label.toLowerCase().includes(s) || p.kw?.includes(s)).slice(0, 8);
  }, [q]);

  const vocabHits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return vocab.filter(v => v.w.toLowerCase().includes(s) || v.t.toLowerCase().includes(s)).slice(0, 12);
  }, [q, vocab]);

  if (!open) return null;

  const go = (href: string) => { close(); router.push(href); };

  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 680, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '12vh 16px 16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, background: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--sh-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 18, opacity: .6 }}>🔍</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Seiten oder Vokabeln suchen…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: 'var(--ink)', fontFamily: 'inherit' }} />
          <kbd style={{ fontSize: 11, color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 6px' }}>Esc</kbd>
        </div>

        <div style={{ maxHeight: '55vh', overflowY: 'auto', padding: 8 }}>
          {pageHits.length > 0 && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', padding: '6px 10px' }}>Seiten</div>
              {pageHits.map(p => (
                <button key={p.href} onClick={() => go(p.href)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: 'var(--ink2)', fontSize: 13.5 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span style={{ fontSize: 16 }}>{p.icon}</span>{p.label}
                </button>
              ))}
            </>
          )}

          {vocabHits.length > 0 && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', padding: '10px 10px 6px' }}>Vokabeln</div>
              {vocabHits.map((v, i) => (
                <button key={i} onClick={() => go(`/vocab/${v.level}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', fontSize: 13.5 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: 'var(--bg3)', color: 'var(--muted)' }}>{v.level}</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{v.w}</span>
                  <span style={{ color: 'var(--muted)' }}>{v.t}</span>
                </button>
              ))}
            </>
          )}

          {q.trim() && pageHits.length === 0 && vocabHits.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Nichts gefunden für „{q}“</div>
          )}
        </div>
      </div>
    </div>
  );
}
