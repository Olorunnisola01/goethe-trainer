'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { UbLayout } from '@/components/layout/UbLayout';
import { warmUpVoices, speakDE, speakAwait, stopAll } from '@/lib/cloudVoice';
import { translateDEtoEN } from '@/lib/translate';
import { WordTip, WordTipState, detectPOS } from '@/components/reader/WordTip';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/* ══════════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════════ */

interface RssItem {
  title: string; pubDate: string; link: string; guid: string;
  thumbnail: string; description: string; content: string;
  categories: string[]; enclosure?: { link?: string };
}

interface Article {
  id: string; title: string; date: string; ressort: string;
  category: string; categoryEmoji: string;
  source: string; sourceLabel: string;
  description: string; paragraphs: string[]; fullText: string; sentences: string[];
  difficulty: 'leicht' | 'mittel' | 'fortgeschritten';
  readingMinutes: number; imageUrl?: string; shareUrl?: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════════════ */

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';

interface FeedDef { url: string; source: string; label: string; }
const FEEDS: FeedDef[] = [
  { url: 'https://www.tagesschau.de/xml/rss2/',                source: 'tagesschau', label: 'Tagesschau' },
  { url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss', source: 'spiegel',    label: 'Spiegel' },
  { url: 'https://rss.dw.com/rdf/rss-de-all',                  source: 'dw',         label: 'DW' },
  { url: 'https://www.zdf.de/rss/zdf/nachrichten',            source: 'zdf',        label: 'ZDF heute' },
  { url: 'https://www.n-tv.de/rss',                           source: 'ntv',        label: 'n-tv' },
];

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
    .replace(/<br\s*\/?>/gi, ' ').replace(/<\/p>/gi, ' ').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\[mehr\]$/i, '').replace(/\s+/g, ' ').trim();
}

function detectRessort(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('/sport') || u.includes('sport-')) return 'sport';
  if (u.includes('/wirtschaft')) return 'wirtschaft';
  if (u.includes('/wissen') || u.includes('/wissenschaft') || u.includes('/nachhaltigkeit')) return 'wissenschaft';
  if (u.includes('/kultur') || u.includes('/unterhaltung') || u.includes('/panorama')) return 'kultur';
  if (u.includes('/wetter')) return 'wetter';
  if (u.includes('/faktenfinder')) return 'faktenfinder';
  if (u.includes('/ausland') || u.includes('/welt') || u.includes('/europa') ||
      u.includes('/amerika') || u.includes('/asien') || u.includes('/afrika') ||
      (u.includes('dw.com/de/') && /armenien|ukraine|usa|china|russland|iran|israel|gaza|nahost/.test(u)))
    return 'ausland';
  if (u.includes('/inland') || u.includes('/innenpolitik') || u.includes('/politik') || u.includes('/deutschland'))
    return 'inland';
  if (u.includes('/regional')) return 'regional';
  return 'inland';
}

function pickImage(item: RssItem): string | undefined {
  if (item.thumbnail && item.thumbnail.startsWith('http')) return item.thumbnail;
  if (item.enclosure?.link && item.enclosure.link.startsWith('http')) return item.enclosure.link;
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
  const bodyText = contentRaw.length > description.length ? contentRaw : description;
  const fullText = bodyText || title;
  const paragraphs = fullText.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const sentences = splitSentences(fullText);
  const difficulty = detectDifficulty(fullText);
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 180));
  const ressort = detectRessort(item.link || '');
  const meta = RESSORT_MAP[ressort] || { label: 'Aktuell', emoji: '📰' };
  return {
    id: item.guid || item.link || String(idx),
    title, date: item.pubDate || '', ressort, category: meta.label, categoryEmoji: meta.emoji,
    source, sourceLabel, description, paragraphs, fullText, sentences, difficulty, readingMinutes,
    imageUrl: pickImage(item), shareUrl: item.link || undefined,
  };
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

function diffColor(d: Article['difficulty']): string {
  return d === 'leicht' ? '#15803d' : d === 'mittel' ? '#1d4ed8' : '#7c3aed';
}

/* Clean raw proxy text into article sentences — strips the page chrome every
   news site wraps around the story (nav, login, share bar, photo credits,
   "read more" teasers, reading-time, etc.). Source-agnostic heuristics. */
function finalizeArticle(raw: string): string[] {
  let t = raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')       // markdown images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')     // markdown links → label
    .replace(/[*_`#>]+/g, ' ')                   // markdown emphasis / headings
    .replace(/\s+/g, ' ')
    .trim();

  // ── START: drop everything before the article body begins (use the LAST marker). ──
  let startIdx = 0;
  const startMarkers: RegExp[] = [
    /Folgen auf:\s*/gi,
    /\d{1,2}\.\d{1,2}\.\d{4},?\s*\d{1,2}[:.]\d{2}\s*Uhr/gi,                 // 20.06.2026, 15.34 Uhr
    /Stand:\s*\d{1,2}\.\d{1,2}\.\d{4}[^.]{0,30}Uhr/gi,
    /Zur Merkliste hinzufügen/gi,
    /Bild vergrößern/gi,
  ];
  for (const re of startMarkers) {
    re.lastIndex = 0; let m: RegExpExecArray | null, last = -1;
    while ((m = re.exec(t)) !== null) last = m.index + m[0].length;
    if (last > startIdx) startIdx = last;
  }
  if (startIdx > 0) t = t.slice(startIdx);

  // ── END: cut from the first footer / "read more" / related marker. ──
  let endIdx = t.length;
  const endMarkers = [
    /Quelle:\s*(?:ntv|dpa|AFP|Reuters|epd|KNA|AP|rtr|SPIEGEL)/i,
    /Dieses Thema im Programm/i, /Mehr zum Thema/i, /Mehr lesen über/i, /Mehr aus /i,
    /Zur Startseite/i, /Diese Nachricht wurde/i, /Über dieses Thema/i, /©\s*ARD/i,
    /Videos Videos/i, /Lesen Sie (?:hier |auch |dazu )?(?:mehr|auch)/i,
    /Newsletter/i, /Alle Kommentare/i, /Weitere Artikel/i, /Ähnliche Artikel/i,
  ];
  for (const re of endMarkers) { const m = t.match(re); if (m && m.index !== undefined) endIdx = Math.min(endIdx, m.index); }
  t = t.slice(0, endIdx);

  // ── INLINE noise removal (anywhere). ──
  t = t
    .replace(/\((?:Foto|Bild|Quelle|Symbolbild|Archivbild|Grafik|Video|Illustration)\s*:[^)]*\)/gi, ' ')
    .replace(/Foto:\s*[^.]{0,90}?(?:IMAGO|dpa|Reuters|AFP|AP|Getty|ddp|epd|picture alliance|Nachrichtenagentur|dts)[^.]{0,40}/gi, ' ')
    .replace(/Zum Inhalt springen/gi, ' ')
    .replace(/Bild vergrößern/gi, ' ')
    .replace(/SPIEGEL bei Google bevorzugen/gi, ' ')
    .replace(/Zur Merkliste hinzufügen/gi, ' ')
    .replace(/\bMerkliste\b/gi, ' ')
    .replace(/\b(?:Abonnement|Anmelden|Registrieren|Menü|Startseite|Suche öffnen|Suche schließen|Newsletter|Werbung|Anzeige|Feedback|Datenschutz|Impressum)\b/gi, ' ')
    .replace(/Artikel anhören\s*\([^)]*\)/gi, ' ')
    .replace(/(?:\d(?:\.\d)?x\s*){2,}/g, ' ')
    .replace(/\d{1,2}:\d{2}\s*\/\s*\d{1,2}:\d{2}/g, ' ')
    .replace(/Player:\s*(?:video|audio)[\s\S]{0,400}?\bmehr\b/gi, ' ')
    .replace(/Player:\s*(?:video|audio)/gi, ' ')
    // share bars — two or more share targets in a row
    .replace(/(?:X\.?\s*com|Facebook|WhatsApp|Threema|Telegram|Mastodon|Bluesky|E-?Mail|Link kopieren|Messenger)(?:\s+(?:X\.?\s*com|Facebook|WhatsApp|Threema|Telegram|Mastodon|Bluesky|E-?Mail|Link kopieren|Messenger))+/gi, ' ')
    .replace(/\bArtikel (?:drucken|teilen|anhören|merken)\b/gi, ' ')
    .replace(/\bFolgen auf:?/gi, ' ')
    .replace(/\b\d{1,2}\s*Min\b/g, ' ')          // reading time "7 Min"
    .replace(/\d{1,2}:\d{2}\s*LIVE/gi, ' ')
    .replace(/\b00:00\b/g, ' ')
    .replace(/\bMenü\b/g, ' ')
    .replace(/\[\s*mehr\s*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  let sents = splitSentences(t);
  const NOISE_RE = /(Folgen auf|Link kopieren|Artikel (?:drucken|teilen|merken)|jetzt teilen|^\s*Teilen\s*$|^\s*Drucken\s*$|^\s*E-?Mail\s*$|zur Startseite|Newsletter abonnieren|^\s*Anzeige\s*$|Cookie|Datenschutz|Mehr zum Thema|Lesen Sie|Bild vergrößern|Zur Merkliste|SPIEGEL bei Google|bevorzugen)/i;
  sents = sents.filter(s => {
    const c = s.trim();
    if (c.length < 2) return false;
    if (NOISE_RE.test(c)) return false;
    if (/^stand\s*:/i.test(c)) return false;
    if (/^(bildquelle|foto|quelle)\s*:/i.test(c)) return false;
    return true;
  });
  while (sents.length && !/[.!?…]["»")\]]?\s*$/.test(sents[sents.length - 1]) && sents[sents.length - 1].length < 70) sents.pop();
  return sents;
}

/* ══════════════════════════════════════════════════════════════════════════
   SIDEBAR — filter chips + compact article list
   ══════════════════════════════════════════════════════════════════════════ */

function FilterRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{children}</div>;
}

function ArticleListItem({ article, active, onClick }: { article: Article; active: boolean; onClick: () => void }) {
  const dc = diffColor(article.difficulty);
  return (
    <div
      className={`ub-item${active ? ' active' : ''}`}
      onClick={onClick}
      style={active ? { background: 'var(--blue)', borderColor: 'var(--blue)' } : {}}
    >
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
        {article.imageUrl && (
          <img src={article.imageUrl} alt="" loading="lazy"
            style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ub-item-t" style={{ color: active ? '#fff' : 'var(--ink)', whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: active ? 'rgba(255,255,255,.8)' : 'var(--muted)' }}>{article.sourceLabel}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100,
              background: active ? 'rgba(255,255,255,.22)' : dc + '18', color: active ? '#fff' : dc,
              border: `1px solid ${active ? 'rgba(255,255,255,.3)' : dc + '44'}` }}>
              {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ARTICLE READER
   ══════════════════════════════════════════════════════════════════════════ */

interface ReaderProps {
  article: Article; playing: boolean; sentIdx: number; speed: number;
  sentences: string[]; fullLoading: boolean; loadStatus: string;
  onBack: () => void; onTogglePlay: () => void; onSpeedChange: (s: number) => void;
  onWordClick: (clean: string, display: string, el: HTMLElement) => void;
  onSentenceClick: (idx: number) => void; tipVisible: boolean;
}

function ArticleReader({ article, playing, sentIdx, speed, sentences, fullLoading, loadStatus, onBack, onTogglePlay, onSpeedChange, onWordClick, onSentenceClick, tipVisible }: ReaderProps) {
  const sentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dc = diffColor(article.difficulty);

  useEffect(() => {
    if (sentIdx >= 0 && sentRefs.current[sentIdx]) sentRefs.current[sentIdx]!.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [sentIdx]);

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ position: 'sticky', top: 0, background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '10px 4px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 30 }}>
        <button onClick={onBack} className="ub-back-btn" style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>← Back</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: '#f3e8ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}>{article.sourceLabel}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-bd)' }}>{article.categoryEmoji} {article.category}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: dc + '18', color: dc, border: `1px solid ${dc}44` }}>{article.difficulty}</span>
        </div>
      </div>

      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block', borderRadius: 12, marginTop: 14 }} />
      )}

      <div style={{ padding: '20px 2px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-lora)', fontSize: 22, fontWeight: 700, lineHeight: 1.4, margin: '0 0 8px', color: 'var(--ink)' }}>{article.title}</h1>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 22 }}>{formatDate(article.date)} · {article.readingMinutes} Min. lesen</div>

        {/* TTS controls */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={onTogglePlay} className="btn-primary" style={{ minWidth: 130, fontWeight: 600 }}>
              {playing ? '⏸ Pause' : sentIdx >= 0 ? '▶ Weiter' : '▶ Vorlesen'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 160 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>🐢</span>
              <input type="range" min={0.55} max={1.05} step={0.05} value={speed} onChange={e => onSpeedChange(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--blue)' }} />
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

        {fullLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', fontSize: 13, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10 }}>
            <div style={{ width: 16, height: 16, border: '2.5px solid #bfdbfe', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin .9s linear infinite', flexShrink: 0 }} />
            <span style={{ fontWeight: 500 }}>{loadStatus || 'Loading full article …'}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>(up to 25 s)</span>
          </div>
        )}

        {/* Hint */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 22, fontSize: 12.5, color: '#92400e', lineHeight: 1.55 }}>
          💡 <strong>Tap a word</strong> for its translation &amp; part of speech &nbsp;·&nbsp; <strong>Tap a sentence</strong> to read from there
        </div>

        {/* Article text */}
        <div style={{ lineHeight: 1.9, fontSize: 15.5, color: 'var(--ink)', userSelect: 'text', fontFamily: 'var(--font-lora)' }}>
          {sentences.map((sentence, si) => {
            const active = sentIdx === si;
            return (
              <span key={si} ref={el => { sentRefs.current[si] = el; }}
                onClick={e => { e.stopPropagation(); onSentenceClick(si); }}
                style={{ display: 'inline', background: active ? '#fef3c7' : 'transparent', boxShadow: active ? '0 0 0 2px #f59e0b' : '0 0 0 2px transparent', borderRadius: 5, transition: 'background .25s, box-shadow .25s', cursor: 'pointer' }}>
                {sentence.split(/(\s+)/).map((token, ti) => {
                  if (/^\s+$/.test(token)) return <span key={ti}>{token}</span>;
                  const clean = token.replace(/^[^a-zA-ZäöüÄÖÜß]+|[^a-zA-ZäöüÄÖÜß]+$/g, '');
                  if (!clean || clean.length < 2) return <span key={ti}>{token}</span>;
                  return (
                    <span key={ti}
                      onClick={e => { e.stopPropagation(); if (!tipVisible) onWordClick(clean, token, e.currentTarget as HTMLElement); }}
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
            <a href={article.shareUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
              🔗 Read the full article on {article.sourceLabel} →
            </a>
          </div>
        )}
      </div>
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
  const [tip, setTip] = useState<WordTipState | null>(null);

  useEffect(() => { warmUpVoices(); }, []);

  /* Fetch all feeds in parallel, interleave round-robin. */
  useEffect(() => {
    Promise.allSettled(
      FEEDS.map(f =>
        fetch(RSS2JSON + encodeURIComponent(f.url))
          .then(r => r.json())
          .then((d: { status?: string; items?: RssItem[] }) => (d.status === 'ok' ? (d.items || []) : []))
          .then(items => ({ feed: f, items }))
          .catch(() => ({ feed: f, items: [] as RssItem[] }))
      )
    ).then(results => {
      const seen = new Set<string>();
      const perFeed: Article[][] = [];
      for (const r of results) {
        if (r.status !== 'fulfilled') continue;
        const { feed, items } = r.value;
        const arr: Article[] = [];
        items.forEach((item, i) => {
          const key = item.guid || item.link;
          if (key && !seen.has(key)) { seen.add(key); arr.push(processItem(item, i, feed.source, feed.label)); }
        });
        perFeed.push(arr);
      }
      const merged: Article[] = [];
      const maxLen = Math.max(0, ...perFeed.map(a => a.length));
      for (let i = 0; i < maxLen; i++) for (const arr of perFeed) if (i < arr.length) merged.push(arr[i]);
      if (!merged.length) setDataError('News could not be loaded. Please try again later.');
      else setArticles(merged);
      setDataLoading(false);
    });
  }, []);

  /* On article open: reset TTS + fetch the full text (jina + allorigins race). */
  useEffect(() => {
    stopTTS();
    setSentIdx(-1);
    setFullSentences(null);
    if (!selected?.shareUrl) return;
    const articleUrl = selected.shareUrl;
    const summaryLen = selected.fullText.length;
    let cancelled = false;
    setFullLoading(true);
    setLoadStatus('Loading full article …');

    const fetchWithTimeout = async (url: string, ms: number, headers?: HeadersInit): Promise<string> => {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), ms);
      try { const res = await fetch(url, { signal: ctrl.signal, headers }); if (!res.ok) throw new Error(`HTTP ${res.status}`); return await res.text(); }
      finally { clearTimeout(to); }
    };

    const tryJina = async (): Promise<string[] | null> => {
      try {
        const text = await fetchWithTimeout(`https://r.jina.ai/${articleUrl}`, 25000, { 'X-Target-Selector': 'article', 'X-Return-Format': 'text' });
        const sents = finalizeArticle(text);
        return sents.join(' ').length > summaryLen + 80 ? sents : null;
      } catch { return null; }
    };

    const tryAllOrigins = async (): Promise<string[] | null> => {
      try {
        const html = await fetchWithTimeout(`https://api.allorigins.win/raw?url=${encodeURIComponent(articleUrl)}`, 18000);
        const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
        for (const [, block] of blocks) {
          try {
            let obj = JSON.parse(block.trim());
            if (Array.isArray(obj)) obj = obj[0];
            if (obj?.['@graph']) obj = obj['@graph'].find((g: { articleBody?: string }) => g.articleBody) || obj;
            const body: string = obj?.articleBody || '';
            if (body.length > summaryLen + 80) { const sents = finalizeArticle(body); if (sents.length >= 2) return sents; }
          } catch { /* next block */ }
        }
        return null;
      } catch { return null; }
    };

    (async () => {
      let resolved = false;
      const handle = (sents: string[] | null) => {
        if (resolved || cancelled || !sents) return;
        resolved = true; setFullSentences(sents); setLoadStatus(''); setFullLoading(false);
      };
      const ticker = setInterval(() => {
        if (resolved || cancelled) { clearInterval(ticker); return; }
        setLoadStatus(prev => prev.endsWith('…') ? 'Loading full article' : prev + ' .');
      }, 700);
      await Promise.allSettled([tryJina().then(handle), tryAllOrigins().then(handle)]);
      clearInterval(ticker);
      if (!resolved && !cancelled) { setLoadStatus(''); setFullLoading(false); }
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

  function stopTTS() { playRef.current = false; stopAll(); setPlaying(false); }

  const playFrom = useCallback(async (article: Article, fromIdx: number, sents?: string[]) => {
    const sentences = sents ?? fullSentences ?? article.sentences;
    stopAll(); playRef.current = true; setPlaying(true);
    let idx = fromIdx;
    while (playRef.current && idx < sentences.length) {
      setSentIdx(idx);
      await speakAwait(sentences[idx], { lang: 'de', rate: speedRef.current });
      if (!playRef.current) return;
      await sleep(280); idx++;
    }
    if (playRef.current) stopTTS();
  }, [fullSentences]);

  const togglePlay = () => { if (!selected) return; if (playing) stopTTS(); else playFrom(selected, sentIdx >= 0 ? sentIdx : 0); };
  const handleSpeedChange = (s: number) => { setSpeed(s); speedRef.current = s; if (playing && selected) { stopTTS(); setTimeout(() => playFrom(selected, sentIdx >= 0 ? sentIdx : 0), 80); } };
  const handleSentenceClick = (idx: number) => { if (!selected) return; stopTTS(); setTimeout(() => playFrom(selected, idx), 50); };

  const handleWordClick = useCallback(async (clean: string, display: string, el: HTMLElement) => {
    if (!clean || clean.length < 2) return;
    const rect = el.getBoundingClientRect();
    const above = rect.top > 160;
    const pos = detectPOS(display);
    const cached = translationCache.current[clean.toLowerCase()];
    setTip({ cleanWord: clean, displayWord: display, translation: cached || '', pos, loading: !cached, x: rect.left + rect.width / 2, y: rect.top + window.scrollY, visible: true, above });
    if (!cached) {
      const tr = await translateDEtoEN(clean);
      if (tr && tr !== '—') translationCache.current[clean.toLowerCase()] = tr;
      setTip(prev => prev && prev.visible && prev.cleanWord === clean ? { ...prev, translation: tr, loading: false } : prev);
    }
  }, []);

  const activeSentences = selected ? (fullSentences ?? selected.sentences) : [];

  /* ── Sidebar (filters + list) ── */
  const sidebar = (close: () => void) => (
    <div style={{ padding: '14px 14px 24px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Quelle</div>
      <FilterRow>
        {SOURCE_FILTERS.map(f => {
          const on = srcFilter === f.key;
          return <button key={f.key} className={`chip${on ? ' on' : ''}`} onClick={() => setSrcFilter(f.key)} style={on ? { background: '#7c3aed', borderColor: '#7c3aed', color: '#fff' } : {}}>{f.emoji} {f.label}</button>;
        })}
      </FilterRow>

      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', margin: '10px 0 6px' }}>Ressort</div>
      <FilterRow>
        {CAT_FILTERS.map(f => {
          const on = catFilter === f.key;
          return <button key={f.key} className={`chip${on ? ' on' : ''}`} onClick={() => setCatFilter(f.key)}>{f.emoji} {f.label}</button>;
        })}
      </FilterRow>

      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', margin: '10px 0 6px' }}>Niveau</div>
      <FilterRow>
        {DIFF_FILTERS.map(f => {
          const on = diffFilter === f.key;
          return <button key={f.key} className={`chip${on ? ' on' : ''}`} onClick={() => setDiffFilter(f.key as typeof diffFilter)} style={on && f.key !== 'alle' ? { background: f.color, borderColor: f.color, color: '#fff' } : {}}>{f.label}</button>;
        })}
      </FilterRow>

      <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{filtered.length} Artikel</div>

      {dataLoading ? (
        Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 64, background: 'var(--bg2)', borderRadius: 10, marginBottom: 8, opacity: .6 }} />)
      ) : filtered.length === 0 ? (
        <p className="ub-empty">Keine Artikel für diesen Filter.</p>
      ) : filtered.map(a => (
        <ArticleListItem key={a.id} article={a} active={selected?.id === a.id} onClick={() => { setSelected(a); close(); }} />
      ))}
    </div>
  );

  return (
    <UbLayout sidebar={sidebar} drawerTitle="Filter & Artikel">
      <div style={{ overflowY: 'auto', padding: '20px 24px' }} onClick={() => tip?.visible && setTip(t => t ? { ...t, visible: false } : null)}>
        {dataError && !selected ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
            <div>{dataError}</div>
          </div>
        ) : !selected ? (
          <div className="ub-empty" style={{ paddingTop: 70 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📰</div>
            <div style={{ fontFamily: 'var(--font-lora)', fontWeight: 600, fontSize: 16, color: 'var(--ink2)', fontStyle: 'normal', marginBottom: 6 }}>Deutsche Nachrichten</div>
            <div>Pick an article from the list — read it, listen, and tap any word for its meaning.</div>
          </div>
        ) : (
          <ArticleReader
            article={selected} playing={playing} sentIdx={sentIdx} speed={speed}
            sentences={activeSentences} fullLoading={fullLoading} loadStatus={loadStatus}
            onBack={() => setSelected(null)} onTogglePlay={togglePlay} onSpeedChange={handleSpeedChange}
            onWordClick={handleWordClick} onSentenceClick={handleSentenceClick}
            tipVisible={tip?.visible ?? false}
          />
        )}
      </div>

      {tip?.visible && (
        <WordTip tip={tip} onClose={() => setTip(t => t ? { ...t, visible: false } : null)} onSpeak={w => { stopAll(); speakDE(w, 0.9); }} />
      )}
    </UbLayout>
  );
}
