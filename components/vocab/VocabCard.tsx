'use client';
import { useState, useEffect } from 'react';
import { speakDE } from '@/lib/germanVoice';

interface VocabEntry {
  w: string;
  t: string;
  ex?: string;
  exT?: string;
  de?: string;
  en?: string;
  cat?: string;
  emoji?: string;
  level?: string;
}

interface VocabCardProps {
  entry: VocabEntry;
  onAddFavourite?: (entry: VocabEntry) => void;
  onRemoveFavourite?: (word: string) => void;
  isFavourite?: boolean;
  isActive?: boolean;                           // true while this card is being read aloud
  readingPhase?: 'word' | 'example' | null;    // which part is currently being spoken
  readingLang?: 'de' | 'en' | null;            // which language is being spoken (DE-EN reader); null/de = German
}

/** Scale font-size down gracefully for long German words / phrases */
function wordFontSize(word: string): number {
  const len = word.length;
  if (len <=  8) return 30;
  if (len <= 11) return 26;
  if (len <= 14) return 22;
  if (len <= 18) return 18;
  if (len <= 22) return 15;
  return 13;
}

function speak(text: string, _lang: string) {
  speakDE(text, 0.9);
}

export function VocabCard({ entry, onAddFavourite, onRemoveFavourite, isFavourite, isActive, readingPhase, readingLang }: VocabCardProps) {
  const [showEx, setShowEx] = useState(true);   // example shown by default (toggle to hide)
  const [speaking, setSpeaking] = useState(false);

  // Auto-expand example while the playlist is reading this card,
  // and keep it open when the example phrase specifically is being spoken
  useEffect(() => {
    if (isActive || readingPhase === 'example') setShowEx(true);
  }, [isActive, readingPhase]);

  // Normalise example fields: support both ex/exT and de/en
  const exampleDE = entry.ex ?? entry.de;
  const exampleEN = entry.exT ?? entry.en;

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeaking(true);
    speak(entry.w, 'de-DE');
    setTimeout(() => setSpeaking(false), 2500);
  };

  const levelClass =
    entry.level === 'A1' ? 'lvl lvl-a1' :
    entry.level === 'A2' ? 'lvl lvl-a2' :
    'lvl lvl-b1';

  return (
    <div
      className="vcard"
      style={isActive ? {
        boxShadow: '0 0 0 3px var(--blue), 0 6px 28px rgba(37,99,235,0.25)',
        transform: 'translateY(-2px)',
        transition: 'box-shadow .25s, transform .25s',
      } : {
        transition: 'box-shadow .25s, transform .25s',
      }}
    >
      {/* Active reading indicator */}
      {isActive && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 10,
          fontSize: 9, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase',
          color: 'var(--blue)', background: 'rgba(255,255,255,.85)',
          border: '1px solid var(--blue-bd)', borderRadius: 100,
          padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)', animation: 'pulse 1s ease-in-out infinite' }} />
          Wird vorgelesen
        </div>
      )}

      {/* Top: German word with gradient — speak + favourite both anchored top-right */}
      <div className="vip-word" style={{ position: 'relative', justifyContent: 'center', flexDirection: 'column', gap: 0 }}>
        {entry.w.includes('/') ? (
          /* Split on "/" → pick the smallest font size across all parts and use it for all */
          (() => {
            const parts = entry.w.split('/').map(p => p.trim());
            const fontSize = Math.min(...parts.map(p => wordFontSize(p)));
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, maxWidth: 'calc(100% - 88px)', textAlign: 'center' }}>
                {parts.map((part, i) => (
                  <span key={i} style={{
                    fontSize: i === 0 ? fontSize : Math.min(fontSize - 2, 13),
                    lineHeight: 1.25,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    color: i > 0 ? 'var(--ink2)' : undefined,
                    userSelect: 'text',
                  }}>
                    {i === 0 ? part : `(${part})`}
                  </span>
                ))}
              </div>
            );
          })()
        ) : (
          <span style={{
            fontSize: wordFontSize(entry.w),
            lineHeight: 1.25,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            maxWidth: 'calc(100% - 88px)',
            textAlign: 'center',
            userSelect: 'text',
          }}>
            {entry.w}
          </span>
        )}

        {/* 🔊 Speak button — top-right corner */}
        <button
          className={`speak-btn${speaking ? ' speaking' : ''}`}
          onClick={handleSpeak}
          title="Vorlesen (DE)"
        >
          🔊
        </button>

        {/* ☆ Favourite button — beside speak button */}
        {(onAddFavourite || onRemoveFavourite) && (
          <button
            onClick={e => {
              e.stopPropagation();
              if (isFavourite) {
                const id = entry.w.trim().toLowerCase().replace(/\s+/g, '_');
                onRemoveFavourite?.(id);
              } else {
                onAddFavourite?.(entry);
              }
            }}
            title={isFavourite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            style={{
              position: 'absolute', top: 8, right: 48, zIndex: 10,
              width: 32, height: 32, minWidth: 32, minHeight: 32,
              borderRadius: '50%', aspectRatio: '1/1', overflow: 'hidden',
              border: isFavourite ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.6)',
              background: isFavourite ? '#fef3c7' : 'rgba(255,255,255,0.75)',
              color: isFavourite ? '#d97706' : 'var(--muted)',
              fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}
          >
            {isFavourite ? '⭐' : '☆'}
          </button>
        )}
      </div>

      {/* Bottom: translation + meta + example */}
      <div className="vb">
        {/* Word + translation — plain selectable text */}
        <div
          className="vw"
          style={{
            userSelect: 'text',
            background: readingPhase === 'word' && readingLang !== 'en' ? 'var(--reading-highlight)' : 'transparent',
            borderRadius: 5,
            padding: '1px 6px',
            transition: 'background .25s',
            display: 'inline-block',
            alignSelf: 'center',
          }}
        >{entry.w.includes('/') ? entry.w.split('/').map((p, i) => i === 0 ? p.trim() : ` (${p.trim()})`).join('') : entry.w}</div>
        <div className="vt" style={{ userSelect: 'text' }}>
          <span style={{
            background: readingPhase === 'word' && readingLang === 'en' ? 'var(--reading-highlight)' : 'transparent',
            borderRadius: 5,
            padding: '1px 6px',
            transition: 'background .25s',
          }}>{entry.t}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {entry.cat && (
            <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '100px', background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-bd)' }}>
              {entry.emoji} {entry.cat}
            </span>
          )}
          {entry.level && <span className={levelClass}>{entry.level}</span>}
        </div>

        {(exampleDE || exampleEN) && (
          <>
            {showEx && (
              <div className="vex" style={{ textAlign: 'center' }}>
                {exampleDE && (
                  <div className="vex-de" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <button
                      title="Beispiel vorlesen"
                      onClick={e => { e.stopPropagation(); speak(exampleDE, 'de-DE'); }}
                      style={{
                        flexShrink: 0,
                        width: 20, height: 20, minWidth: 20, minHeight: 20,
                        borderRadius: '50%', aspectRatio: '1/1', overflow: 'hidden',
                        border: '1px solid var(--blue-bd)', background: 'var(--blue-bg)',
                        color: 'var(--blue)', fontSize: 10, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1,
                      }}
                    >🔊</button>
                    {/* Plain span so browser extensions can see + translate the example sentence */}
                    <span style={{
                      userSelect: 'text',
                      background: readingPhase === 'example' && readingLang !== 'en' ? 'var(--reading-highlight)' : 'transparent',
                      borderRadius: 4,
                      padding: '1px 4px',
                      transition: 'background .25s',
                    }}>{exampleDE}</span>
                  </div>
                )}
                {exampleEN && (
                  <div className="vex-en" style={{ textAlign: 'center', userSelect: 'text' }}>
                    <span style={{
                      background: readingPhase === 'example' && readingLang === 'en' ? 'var(--reading-highlight)' : 'transparent',
                      borderRadius: 4,
                      padding: '1px 4px',
                      transition: 'background .25s',
                    }}>{exampleEN}</span>
                  </div>
                )}
              </div>
            )}
            <button
              className={`vex-toggle-btn${showEx ? ' secondary' : ''}`}
              style={{ marginTop: 'auto', alignSelf: 'center' }}
              onClick={() => setShowEx(s => !s)}
            >
              {showEx ? '▲ Ausblenden' : '▼ Beispiel'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
