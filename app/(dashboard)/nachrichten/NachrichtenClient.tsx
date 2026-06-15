'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { warmUpVoices, speakDE, speakAwait, stopAll } from '@/lib/cloudVoice';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
import { translateDEtoEN } from '@/lib/translate';

/* ══════════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════════ */

interface RssItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  thumbnail: string;
  description: string;
  content: string;
  categories: string[];
  enclosure?: { link?: string };
}

interface Article {
  id: string;
  title: string;
  date: string;
  ressort: string;
  category: string;
  categoryEmoji: string;
  source: string;            // which outlet (tagesschau, spiegel, dw, zdf, ntv)
  sourceLabel: string;       // display name
  description: string;       // 2-4 sentence summary
  paragraphs: string[];
  fullText: string;
  sentences: string[];
  difficulty: 'leicht' | 'mittel' | 'fortgeschritten';
  readingMinutes: number;
  imageUrl?: string;
  shareUrl?: string;
}

interface TooltipState {
  cleanWord: string;
  displayWord: string;
  translation: string;
  loading: boolean;
  x: number;
  y: number;
  visible: boolean;
  above: boolean;
}

/* ══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════════════ */

// rss2json.com is a browser-CORS-friendly RSS-to-JSON proxy (free, no API key needed).
// Note: the "count" parameter requires a paid key — omit it for the free tier (10 items/feed).
// We fetch five feeds in parallel (~50 articles), merged + deduplicated.
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

interface FeedDef { url: string; source: string; label: string; }
const FEEDS: FeedDef[] = [
  { url: 'https://www.tagesschau.de/xml/rss2/',           source: 'tagesschau', label: 'Tagesschau' },
  { url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss', source: 'spiegel', label: 'Spiegel' },
  { url: 'https://rss.dw.com/rdf/rss-de-all',             source: 'dw',         label: 'DW' },
  { url: 'https://www.zdf.de/rss/zdf/nachrichten',        source: 'zdf',        label: 'ZDF heute' },
  { url: 'https://www.n-tv.de/rss',                       source: 'ntv',        label: 'n-tv' },
];

// Source filter chips
const SOURCE_FILTERS = [
  { key: 'alle',       label: 'Alle Quellen', emoji: '📡' },
  { key: 'tagesschau', label: 'Tagesschau',   emoji: '📺' },
  { key: 'spiegel',    label: 'Spiegel',      emoji: '🔵' },
  { key: 'dw',         label: 'DW',           emoji: '🌍' },
  { key: 'zdf',        label: 'ZDF heute',    emoji: '🟧' },
  { key: 'ntv',        label: 'n-tv',         emoji: '🔴' },
];

const RESSORT_MAP: Record<string, { label: string; emoji: string }> = {
  inland:       { label: 'Politik',      emoji: '🏛️' },
  ausland:      { label: 'Welt',         emoji: '🌍' },
  wirtschaft:   { label: 'Wirtschaft',   emoji: '💼' },
  sport:        { label: 'Sport',        emoji: '⚽' },
  wetter:       { label: 'Wetter',       emoji: '🌤️' },
  wissenschaft: { label: 'Wissenschaft', emoji: '🔬' },
  kultur:       { label: 'Kultur',       emoji: '🎭' },
  faktenfinder: { label: 'Fakten',       emoji: '✅' },
  regional:     { label: 'Regional',     emoji: '📍' },
};

const CAT_FILTERS = [
  { key: 'alle',         label: 'Alle',         emoji: '📋' },
  { key: 'inland',       label: 'Politik',       emoji: '🏛️' },
  { key: 'ausland',      label: 'Welt',          emoji: '🌍' },
  { key: 'wirtschaft',   label: 'Wirtschaft',    emoji: '💼' },
  { key: 'sport',        label: 'Sport',         emoji: '⚽' },
  { key: 'wissenschaft', label: 'Wissenschaft',  emoji: '🔬' },
  { key: 'kultur',       label: 'Kultur',        emoji: '🎭' },
  { key: 'wetter',       label: 'Wetter',        emoji: '🌤️' },
];

const DIFF_FILTERS = [
  { key: 'alle',            label: 'Alle Niveaus',   color: 'var(--blue)' },
  { key: 'leicht',          label: 'Leicht',          color: '#15803d' },
  { key: 'mittel',          label: 'Mittel',          color: '#1d4ed8' },
  { key: 'fortgeschritten', label: 'Fortgeschritten', color: '#7c3aed' },
] as const;

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\[mehr\]$/i, '')   // strip Tagesschau's "[mehr]" trailer
    .replace(/\s+/g, ' ')
    .trim();
}

/** Detect article category from its URL path (Tagesschau, Spiegel, DW, ZDF, n-tv). */
function detectRessort(url: string): string {
  const u = url.toLowerCase();
  // Sport
  if (u.includes('/sport') || u.includes('sport-'))              return 'sport';
  // Wirtschaft / economy
  if (u.includes('/wirtschaft'))                                 return 'wirtschaft';
  // Wissenschaft / science
  if (u.includes('/wissen') || u.includes('/wissenschaft') || u.includes('/nachhaltigkeit')) return 'wissenschaft';
  // Kultur
  if (u.includes('/kultur') || u.includes('/unterhaltung') || u.includes('/panorama')) return 'kultur';
  // Wetter
  if (u.includes('/wetter'))                                     return 'wetter';
  if (u.includes('/faktenfinder'))                               return 'faktenfinder';
  // Ausland / world (check before inland since some contain both)
  if (u.includes('/ausland') || u.includes('/welt') || u.includes('/europa') ||
      u.includes('/amerika') || u.includes('/asien') || u.includes('/afrika') ||
      u.includes('dw.com/de/') && /armenien|ukraine|usa|china|russland|iran|israel|gaza|nahost/.test(u))
    return 'ausland';
  // Inland / domestic
  if (u.includes('/inland') || u.includes('/innenpolitik') || u.includes('/politik') || u.includes('/deutschland'))
    return 'inland';
  if (u.includes('/regional'))                                   return 'regional';
  return 'inland';
}

/** Pick the best available image URL from an RSS item. */
function pickImage(item: RssItem): string | undefined {
  if (item.thumbnail && item.thumbnail.startsWith('http')) return item.thumbnail;
  if (item.enclosure?.link && item.enclosure.link.startsWith('http')) return item.enclosure.link;
  // Some feeds embed an <img> in the content HTML
  const m = (item.content || '').match(/<img[^>]+src="([^"]+)"/i);
  if (m && m[1].startsWith('http')) return m[1];
  return undefined;
}

function detectDifficulty(text: string): Article['difficulty'] {
  const words = text.split(/\s+/).filter(Boolean);
  const sents = text.match(/[^.!?]+[.!?]+/g) || [];
  if (!words.length) return 'mittel';
  const avgSent = sents.length ? words.length / sents.length : 10;
  const avgWord = words.reduce((s, w) => s + w.replace(/[^a-zA-ZäöüÄÖÜß]/g, '').length, 0) / words.length;
  if (avgSent <= 11 && avgWord <= 5.5) return 'leicht';
  if (avgSent <= 19 && avgWord <= 7.2) return 'mittel';
  return 'fortgeschritten';
}

function splitSentences(text: string): string[] {
  const raw = text.match(/[^.!?…]+[.!?…]+["»")\]]*\s*/g) || [];
  const cleaned = raw.map(s => s.trim()).filter(s => s.length > 2);
  return cleaned.length ? cleaned : [text];
}

function processItem(item: RssItem, idx: number, source: string, sourceLabel: string): Article {
  const title = stripHtml(item.title || '');
  const description = stripHtml(item.description || '');
  const contentRaw = stripHtml(item.content || '');

  // Use whichever is longer — description or content
  const bodyText = contentRaw.length > description.length ? contentRaw : description;
  const fullText = bodyText || title;

  const paragraphs = fullText
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  const sentences = splitSentences(fullText);
  const difficulty = detectDifficulty(fullText);
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 180));

  const ressort = detectRessort(item.link || '');
  const meta = RESSORT_MAP[ressort] || { label: 'Aktuell', emoji: '📰' };

  return {
    id: item.guid || item.link || String(idx),
    title,
    date: item.pubDate || '',
    ressort,
    category: meta.label,
    categoryEmoji: meta.emoji,
    source,
    sourceLabel,
    description,
    paragraphs,
    fullText,
    sentences,
    difficulty,
    readingMinutes,
    imageUrl: pickImage(item),
    shareUrl: item.link || undefined,
  };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('de-DE', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  } catch { return ''; }
}

function diffColor(d: Article['difficulty']): string {
  return d === 'leicht' ? '#15803d' : d === 'mittel' ? '#1d4ed8' : '#7c3aed';
}

/* ══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const dc = diffColor(article.difficulty);
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        transition: 'box-shadow .15s, transform .15s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 18px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
    >
      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title}
          style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }}
          loading="lazy" />
      )}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: '#f3e8ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
            {article.sourceLabel}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-bd)' }}>
            {article.categoryEmoji} {article.category}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 100, background: dc + '18', color: dc, border: `1px solid ${dc}44` }}>
            {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)', padding: '2px 6px' }}>
            🕐 {article.readingMinutes} Min.
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 16.5, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 8 }}>
          {article.title}
        </div>
        {article.description && (
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.description}
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--muted)' }}>
          {formatDate(article.date)}
        </div>
      </div>
    </div>
  );
}

function WordTooltip({ tip, onClose, onSpeak }: { tip: TooltipState; onClose: () => void; onSpeak: (w: string) => void }) {
  if (!tip.visible) return null;
  const W = 216;
  const safeLeft = Math.max(8, Math.min(tip.x - W / 2, (typeof window !== 'undefined' ? window.innerWidth : 400) - W - 8));
  const top = tip.above ? tip.y - 96 : tip.y + 34;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1200 }} />
      <div style={{
        position: 'fixed', left: safeLeft, top, width: W,
        background: 'var(--bg)', border: '1.5px solid var(--blue-bd)',
        borderRadius: 12, padding: '12px 14px',
        boxShadow: '0 6px 28px rgba(0,0,0,0.18)', zIndex: 1201,
        animation: 'fadeIn .12s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>
              🇩🇪 {tip.displayWord}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', minHeight: 18 }}>
              {tip.loading
                ? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>wird übersetzt…</span>
                : <><span style={{ marginRight: 4 }}>🇬🇧</span>{tip.translation}</>}
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onSpeak(tip.cleanWord); }}
            style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--blue-bd)', background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🔊
          </button>
        </div>
      </div>
    </>
  );
}

interface ReaderProps {
  article: Article; playing: boolean; sentIdx: number; speed: number; tip: TooltipState;
  sentences: string[];   // may be fullSentences or article.sentences
  fullLoading: boolean;       // true while fetching full article
  loadStatus: string;          // animated status text shown while loading
  onBack: () => void; onTogglePlay: () => void; onSpeedChange: (s: number) => void;
  onWordClick: (clean: string, display: string, el: HTMLElement) => void;
  onCloseTip: () => void; onSentenceClick: (idx: number) => void; onSpeakWord: (w: string) => void;
}

function ArticleReader({ article, playing, sentIdx, speed, tip, sentences, fullLoading, loadStatus, onBack, onTogglePlay, onSpeedChange, onWordClick, onCloseTip, onSentenceClick, onSpeakWord }: ReaderProps) {
  const sentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dc = diffColor(article.difficulty);

  useEffect(() => {
    if (sentIdx >= 0 && sentRefs.current[sentIdx]) {
      sentRefs.current[sentIdx]!.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [sentIdx]);

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', paddingBottom: 80 }} onClick={() => tip.visible && onCloseTip()}>
      {/* Sticky top bar */}
      <div style={{ position: 'sticky', top: 0, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '4px 0' }}>← Zurück</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: '#f3e8ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>
            {article.sourceLabel}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-bd)' }}>
            {article.categoryEmoji} {article.category}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: dc + '18', color: dc, border: `1px solid ${dc}44` }}>
            {article.difficulty}
          </span>
        </div>
      </div>

      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }} />
      )}

      <div style={{ padding: '22px 18px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: 22, fontWeight: 700, lineHeight: 1.4, margin: '0 0 8px', color: 'var(--ink)' }}>
          {article.title}
        </h1>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 22 }}>
          {formatDate(article.date)} · {article.readingMinutes} Min. lesen
        </div>

        {/* TTS Controls */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={onTogglePlay} className="btn-primary" style={{ minWidth: 130, fontWeight: 600 }}>
              {playing ? '⏸ Pause' : sentIdx >= 0 ? '▶ Weiter' : '▶ Vorlesen'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 160 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>🐢</span>
              <input type="range" min={0.55} max={1.05} step={0.05} value={speed}
                onChange={e => onSpeedChange(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--blue)' }} />
              <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>🏃 Normal</span>
            </div>
          </div>
          {sentIdx >= 0 && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Satz {sentIdx + 1}/{sentences.length}</span>
              <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${((sentIdx + 1) / sentences.length) * 100}%`, background: 'var(--blue)', borderRadius: 2, transition: 'width .3s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Full-article loading indicator — visible & reassuring on slow mobile connections */}
        {fullLoading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 16, padding: '10px 14px',
            fontSize: 13, color: '#1e40af',
            background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
          }}>
            <div style={{ width: 16, height: 16, border: '2.5px solid #bfdbfe', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin .9s linear infinite', flexShrink: 0 }} />
            <span style={{ fontWeight: 500 }}>
              {loadStatus || 'Vollständigen Artikel wird geladen …'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>
              (kann bis zu 25 s dauern)
            </span>
          </div>
        )}

        {/* Hint */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 22, fontSize: 12.5, color: '#92400e', lineHeight: 1.55 }}>
          💡 <strong>Tippe auf ein Wort</strong> für die Übersetzung &nbsp;·&nbsp; <strong>Tippe auf einen Satz</strong> um von dort zu lesen
        </div>

        {/* Clickable article text */}
        <div style={{ lineHeight: 1.9, fontSize: 15.5, color: 'var(--ink)', userSelect: 'text' }}>
          {sentences.map((sentence, si) => {
            const active = sentIdx === si;
            return (
              <span key={si}
                ref={el => { sentRefs.current[si] = el; }}
                onClick={e => { e.stopPropagation(); onSentenceClick(si); }}
                style={{
                  display: 'inline',
                  background: active ? '#fef3c7' : 'transparent',
                  outline: active ? '2px solid #f59e0b' : 'none',
                  outlineOffset: 3, borderRadius: 5,
                  padding: active ? '1px 3px' : '0',
                  cursor: 'pointer', transition: 'background .2s',
                }}
              >
                {sentence.split(/(\s+)/).map((token, ti) => {
                  if (/^\s+$/.test(token)) return <span key={ti}>{token}</span>;
                  const clean = token.replace(/^[^a-zA-ZäöüÄÖÜß]+|[^a-zA-ZäöüÄÖÜß]+$/g, '');
                  if (!clean || clean.length < 2) return <span key={ti}>{token}</span>;
                  return (
                    <span key={ti}
                      onClick={e => { e.stopPropagation(); onWordClick(clean, token, e.currentTarget as HTMLElement); }}
                      style={{ cursor: 'pointer', borderBottom: '1px dotted rgba(0,0,0,0.28)', display: 'inline' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--blue)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ''; }}
                    >{token}</span>
                  );
                })}
                {' '}
              </span>
            );
          })}
        </div>

        {article.shareUrl && (
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
            <a href={article.shareUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12.5, color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
              🔗 Vollständigen Artikel auf {article.sourceLabel} lesen →
            </a>
          </div>
        )}
      </div>

      <WordTooltip tip={tip} onClose={onCloseTip} onSpeak={onSpeakWord} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN CLIENT
   ══════════════════════════════════════════════════════════════════════════ */

export function NachrichtenClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [catFilter, setCatFilter] = useState('alle');
  const [srcFilter, setSrcFilter] = useState('alle');
  const [diffFilter, setDiffFilter] = useState<'alle' | 'leicht' | 'mittel' | 'fortgeschritten'>('alle');
  const [selected, setSelected] = useState<Article | null>(null);
  // Full article content fetched lazily when an article is opened
  const [fullSentences, setFullSentences] = useState<string[] | null>(null);
  const [fullLoading, setFullLoading] = useState(false);
  const [loadStatus, setLoadStatus] = useState('');
  const [playing, setPlaying] = useState(false);
  const [sentIdx, setSentIdx] = useState(-1);
  const [speed, setSpeed] = useState(0.85);
  const playRef = useRef(false);
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const translationCache = useRef<Record<string, string>>({});
  const [tip, setTip] = useState<TooltipState>({ cleanWord: '', displayWord: '', translation: '', loading: false, x: 0, y: 0, visible: false, above: true });

  useEffect(() => { warmUpVoices(); }, []);

  useEffect(() => {
    // Fetch all feeds in parallel — rss2json free tier gives 10 items per feed
    Promise.allSettled(
      FEEDS.map(f =>
        fetch(RSS2JSON + encodeURIComponent(f.url))
          .then(r => r.json())
          .then((d: { status?: string; items?: RssItem[] }) =>
            d.status === 'ok' ? (d.items || []) : []
          )
          .then(items => ({ feed: f, items }))
          .catch(() => ({ feed: f, items: [] as RssItem[] }))
      )
    ).then(results => {
      // Process each feed's items WITH its source label, then merge round-robin
      // so the list interleaves outlets instead of grouping them.
      const seen = new Set<string>();
      const perFeed: Article[][] = [];

      for (const r of results) {
        if (r.status !== 'fulfilled') continue;
        const { feed, items } = r.value;
        const arr: Article[] = [];
        items.forEach((item, i) => {
          const key = item.guid || item.link;
          if (key && !seen.has(key)) {
            seen.add(key);
            arr.push(processItem(item, i, feed.source, feed.label));
          }
        });
        perFeed.push(arr);
      }

      // Round-robin interleave: one from each source in turn → balanced mix
      const merged: Article[] = [];
      const maxLen = Math.max(0, ...perFeed.map(a => a.length));
      for (let i = 0; i < maxLen; i++) {
        for (const arr of perFeed) {
          if (i < arr.length) merged.push(arr[i]);
        }
      }

      if (!merged.length) {
        setDataError('Nachrichten konnten nicht geladen werden. Bitte versuche es später.');
      } else {
        setArticles(merged);
      }
      setDataLoading(false);
    });
  }, []);

  // When article changes: reset TTS + fetch full text.
  //
  // Strategy:
  //   1. Primary: r.jina.ai — purpose-built article reader, returns clean
  //      Markdown. Quality is excellent but it can be slow (10–20s) on free
  //      tier, especially when called over a mobile network.
  //   2. Fallback: allorigins.win/raw — fetches full HTML, extracts JSON-LD
  //      articleBody. Less reliable but useful when jina is slow.
  //
  // Mobile devices and slow networks need a generous timeout — 25s — otherwise
  // the fetch is aborted before jina has time to respond and the user only
  // ever sees the RSS summary. We also accept a result as soon as it's longer
  // than the RSS summary, rather than waiting for both proxies to finish.
  useEffect(() => {
    stopTTS();
    setSentIdx(-1);
    setFullSentences(null);

    if (!selected?.shareUrl) return;
    const articleUrl = selected.shareUrl;
    const summaryLen = selected.fullText.length;
    let cancelled = false;
    setFullLoading(true);
    setLoadStatus('Vollständigen Artikel laden …');

    /**
     * Turn raw proxy text into clean article sentences. Source-agnostic — works
     * across Tagesschau, Spiegel, DW, ZDF and n-tv by removing the page chrome
     * every news site wraps around the actual story:
     *   • leading category / byline / audio-player / photo-caption / share bar
     *   • embedded video & audio teasers
     *   • trailing source attribution, keyword tags and "related videos" lists
     */
    const finalize = (raw: string) => {
      let t = raw
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')     // markdown images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // markdown links → link text
        .replace(/[*_`#>]+/g, ' ')                // markdown emphasis / headings
        .replace(/\s+/g, ' ')
        .trim();

      // ── 1. START: cut everything BEFORE the article body begins ──────────
      // Use the LAST matching marker so we skip category/headline/byline/player.
      let startIdx = 0;
      const startMarkers = [
        /Folgen auf:\s*/i,                                                   // n-tv
        /Stand:\s*\d{1,2}\.\d{1,2}\.\d{4}\s*[•·]?\s*\d{1,2}:\d{2}\s*Uhr/i,    // Tagesschau
      ];
      for (const re of startMarkers) {
        const m = t.match(re);
        if (m && m.index !== undefined) startIdx = Math.max(startIdx, m.index + m[0].length);
      }
      if (startIdx > 0) t = t.slice(startIdx);

      // ── 2. END: cut everything from the first footer / related marker ────
      let endIdx = t.length;
      const endMarkers = [
        /Quelle:\s*(?:ntv|dpa|AFP|Reuters|epd|KNA|AP|rtr)/i,  // n-tv / agencies
        /Dieses Thema im Programm/i,
        /Mehr zum Thema/i,
        /Zur Startseite/i,
        /Diese Nachricht wurde/i,
        /Über dieses Thema/i,
        /©\s*ARD/i,
        /Videos Videos/i,                                      // n-tv related-video list
      ];
      for (const re of endMarkers) {
        const m = t.match(re);
        if (m && m.index !== undefined) endIdx = Math.min(endIdx, m.index);
      }
      t = t.slice(0, endIdx);

      // ── 3. INLINE noise removal (anywhere in the text) ──────────────────
      t = t
        // photo / image / source credits in parentheses
        .replace(/\((?:Foto|Bild|Quelle|Symbolbild|Archivbild|Grafik|Video|Illustration)\s*:[^)]*\)/gi, ' ')
        // audio player ("Artikel anhören (05:58 min)" + speed buttons + scrubber)
        .replace(/Artikel anhören\s*\([^)]*\)/gi, ' ')
        .replace(/(?:\d(?:\.\d)?x\s*){2,}/g, ' ')              // 0.5x 0.8x 1.0x …
        .replace(/\d{1,2}:\d{2}\s*\/\s*\d{1,2}:\d{2}/g, ' ')   // 00:00 / 05:58
        // embedded media teasers
        .replace(/Player:\s*(?:video|audio)[\s\S]{0,400}?\bmehr\b/gi, ' ')
        .replace(/Player:\s*(?:video|audio)/gi, ' ')
        // share / follow buttons
        .replace(/Facebook\s*X?\s*WhatsApp/gi, ' ')
        .replace(/\bLink kopieren\b/gi, ' ')
        .replace(/\bArtikel (?:drucken|teilen|anhören|merken)\b/gi, ' ')
        .replace(/\bFolgen auf:?/gi, ' ')
        // player / live artefacts
        .replace(/\d{1,2}:\d{2}\s*LIVE/gi, ' ')
        .replace(/\b00:00\b/g, ' ')
        .replace(/\bMenü\b/g, ' ')
        .replace(/\[\s*mehr\s*\]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      let sents = splitSentences(t);

      // ── 4. SENTENCE-level noise filter ──────────────────────────────────
      const NOISE_RE = /(Folgen auf|Link kopieren|Artikel (?:drucken|teilen|merken)|jetzt teilen|^\s*Teilen\s*$|^\s*Drucken\s*$|^\s*E-?Mail\s*$|zur Startseite|Newsletter abonnieren|^\s*Anzeige\s*$|Cookie-Einstellungen|Datenschutzerklärung|Mehr zum Thema)/i;
      sents = sents.filter(s => {
        const c = s.trim();
        if (c.length < 2) return false;
        if (NOISE_RE.test(c)) return false;
        if (/^stand\s*:/i.test(c)) return false;
        if (/^bildquelle\s*:/i.test(c)) return false;
        return true;
      });

      // ── 5. Drop trailing short fragments without sentence punctuation ────
      //    (keyword tags like "Gender Pay Gap EU Prien" or teaser titles)
      while (sents.length && !/[.!?…]["»")\]]?\s*$/.test(sents[sents.length - 1]) && sents[sents.length - 1].length < 70) {
        sents.pop();
      }

      return sents;
    };

    /** Fetch with timeout + optional headers. */
    const fetchWithTimeout = async (url: string, ms: number, headers?: HeadersInit): Promise<string> => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      try {
        const res = await fetch(url, { signal: ctrl.signal, headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
      } finally { clearTimeout(t); }
    };

    /**
     * Strategy 1: r.jina.ai with X-Target-Selector: article.
     * This tells jina to extract ONLY the <article> element, so we get the real
     * article body instead of the whole page (nav, menu, footer, link lists).
     */
    const tryJina = async (): Promise<string[] | null> => {
      try {
        const text = await fetchWithTimeout(
          `https://r.jina.ai/${articleUrl}`,
          25000,
          { 'X-Target-Selector': 'article', 'X-Return-Format': 'text' },
        );
        const sents = finalize(text);
        const totalLen = sents.join(' ').length;
        return totalLen > summaryLen + 80 ? sents : null;
      } catch { return null; }
    };

    /** Strategy 2: allorigins.win/raw → JSON-LD articleBody (already clean prose). */
    const tryAllOrigins = async (): Promise<string[] | null> => {
      try {
        const html = await fetchWithTimeout(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(articleUrl)}`,
          18000,
        );
        const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
        for (const [, block] of blocks) {
          try {
            let obj = JSON.parse(block.trim());
            if (Array.isArray(obj)) obj = obj[0];
            // Some sites nest articles under @graph
            if (obj?.['@graph']) {
              obj = obj['@graph'].find((g: { articleBody?: string }) => g.articleBody) || obj;
            }
            const body: string = obj?.articleBody || '';
            if (body.length > summaryLen + 80) {
              // Run through the same cleaner for consistency
              const sents = finalize(body);
              if (sents.length >= 2) return sents;
            }
          } catch { /* try next block */ }
        }
        return null;
      } catch { return null; }
    };

    /* Race jina.ai (primary) and allorigins (secondary) IN PARALLEL.
       Whichever returns a longer-than-summary result first wins; the loser is
       ignored. This is far faster than running them sequentially because on a
       slow mobile connection a 25-second jina call no longer blocks the
       allorigins backup. */
    (async () => {
      let resolved = false;

      const handle = (sents: string[] | null) => {
        if (resolved || cancelled || !sents) return;
        resolved = true;
        setFullSentences(sents);
        setLoadStatus('');
        setFullLoading(false);
      };

      // Status updates so the user can SEE the loader is still working.
      const statusTicker = setInterval(() => {
        if (resolved || cancelled) { clearInterval(statusTicker); return; }
        setLoadStatus(prev =>
          prev.includes('…')        ? 'Vollständigen Artikel laden'
          : prev.endsWith('laden')   ? 'Vollständigen Artikel laden .'
          : prev.endsWith('.')       ? prev + '.'
          : prev.endsWith('..')      ? prev + '.'
          : 'Vollständigen Artikel laden …'
        );
      }, 700);

      const [jinaResult, aoResult] = await Promise.allSettled([
        tryJina().then(handle),
        tryAllOrigins().then(handle),
      ]);
      void jinaResult; void aoResult;

      clearInterval(statusTicker);
      if (!resolved && !cancelled) {
        // Both proxies failed — keep summary visible, hide spinner.
        setLoadStatus('');
        setFullLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  useEffect(() => () => stopTTS(), []);

  const filtered = useMemo(() => articles.filter(a => {
    const catOk = catFilter === 'alle' || a.ressort === catFilter;
    const srcOk = srcFilter === 'alle' || a.source === srcFilter;
    const diffOk = diffFilter === 'alle' || a.difficulty === diffFilter;
    return catOk && srcOk && diffOk;
  }), [articles, catFilter, srcFilter, diffFilter]);

  function stopTTS() {
    playRef.current = false;
    stopAll();
    setPlaying(false);
  }

  async function playFrom(article: Article, fromIdx: number, sents?: string[]) {
    const sentences = sents ?? fullSentences ?? article.sentences;
    stopAll();
    playRef.current = true;
    setPlaying(true);
    let idx = fromIdx;
    while (playRef.current && idx < sentences.length) {
      setSentIdx(idx);
      await speakAwait(sentences[idx], { lang: 'de', rate: speedRef.current });
      if (!playRef.current) return;
      await sleep(280);
      idx++;
    }
    if (playRef.current) stopTTS();
  }

  function togglePlay() {
    if (!selected) return;
    if (playing) stopTTS();
    else playFrom(selected, sentIdx >= 0 ? sentIdx : 0);
  }

  function handleSpeedChange(s: number) {
    setSpeed(s); speedRef.current = s;
    if (playing && selected) { stopTTS(); setTimeout(() => playFrom(selected, sentIdx >= 0 ? sentIdx : 0), 80); }
  }

  function handleSentenceClick(idx: number) {
    if (!selected) return;
    stopTTS();
    setTimeout(() => playFrom(selected, idx), 50);
  }

  const handleWordClick = useCallback(async (clean: string, display: string, el: HTMLElement) => {
    if (!clean || clean.length < 2) return;
    const rect = el.getBoundingClientRect();
    const above = rect.top > 110;
    const cached = translationCache.current[clean.toLowerCase()];
    setTip({ cleanWord: clean, displayWord: display, translation: cached || '', loading: !cached, x: rect.left + rect.width / 2, y: rect.top + window.scrollY, visible: true, above });
    if (!cached) {
      const tr = await translateDEtoEN(clean);
      if (tr && tr !== '—') translationCache.current[clean.toLowerCase()] = tr;
      setTip(prev => prev.visible && prev.cleanWord === clean ? { ...prev, translation: tr, loading: false } : prev);
    }
  }, []);

  if (selected) {
    const activeSentences = fullSentences ?? selected.sentences;
    return (
      <ArticleReader
        article={selected} playing={playing} sentIdx={sentIdx} speed={speed} tip={tip}
        sentences={activeSentences} fullLoading={fullLoading} loadStatus={loadStatus}
        onBack={() => setSelected(null)} onTogglePlay={togglePlay} onSpeedChange={handleSpeedChange}
        onWordClick={handleWordClick} onCloseTip={() => setTip(t => ({ ...t, visible: false }))}
        onSentenceClick={handleSentenceClick} onSpeakWord={w => speakDE(w, 0.88)} />
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)', padding: '28px 20px 26px' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📰</div>
        <div style={{ fontFamily: 'var(--font-lora)', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Deutsche Nachrichten</div>
        <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
          Aktuelle Artikel von Tagesschau · Lesen &amp; Anhören · Wort antippen für Übersetzung
        </div>
      </div>

      <div style={{ padding: '20px 16px 60px' }}>
        {/* Source filter */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: 8, paddingBottom: 4, marginBottom: 10, scrollbarWidth: 'none' }}>
          {SOURCE_FILTERS.map(f => {
            const active = srcFilter === f.key;
            return (
              <button key={f.key} onClick={() => setSrcFilter(f.key)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 100, border: `1.5px solid ${active ? '#7c3aed' : 'var(--border)'}`, background: active ? '#7c3aed' : 'var(--bg)', color: active ? '#fff' : 'var(--ink2)', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}>
                {f.emoji} {f.label}
              </button>
            );
          })}
        </div>

        {/* Category filter */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: 8, paddingBottom: 4, marginBottom: 14, scrollbarWidth: 'none' }}>
          {CAT_FILTERS.map(f => {
            const active = catFilter === f.key;
            return (
              <button key={f.key} onClick={() => setCatFilter(f.key)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 100, border: `1.5px solid ${active ? 'var(--blue)' : 'var(--border)'}`, background: active ? 'var(--blue)' : 'var(--bg)', color: active ? '#fff' : 'var(--ink2)', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}>
                {f.emoji} {f.label}
              </button>
            );
          })}
        </div>

        {/* Difficulty filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {DIFF_FILTERS.map(f => {
            const active = diffFilter === f.key;
            return (
              <button key={f.key} onClick={() => setDiffFilter(f.key as typeof diffFilter)} style={{ padding: '4px 13px', borderRadius: 100, fontSize: 12, border: `1.5px solid ${active ? f.color : 'var(--border)'}`, background: active ? f.color : 'var(--bg)', color: active ? '#fff' : 'var(--ink2)', fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}>
                {f.label}
              </button>
            );
          })}
        </div>

        {dataLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 60 }}>
            <div style={{ width: 36, height: 36, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Nachrichten werden geladen…</div>
          </div>
        )}

        {!dataLoading && dataError && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
            <div>{dataError}</div>
          </div>
        )}

        {!dataLoading && !dataError && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div>Keine Artikel für diesen Filter.</div>
          </div>
        )}

        {!dataLoading && filtered.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
              {filtered.length} Artikel · aktualisiert täglich von tagesschau.de
            </div>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}>
              {filtered.map(article => (
                <ArticleCard key={article.id} article={article} onClick={() => setSelected(article)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
