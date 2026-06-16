'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { warmUpVoices, warmUpEnglishVoice, speakDE, speakEN, stopAll } from '@/lib/cloudVoice';

interface PronunciationPanelProps {
  open: boolean;
  onClose: () => void;
}

const NAME: Record<'de' | 'en', string> = { de: 'Deutsch', en: 'Englisch' };

/* Floating, draggable + resizable translate & pronounce window.
   - Drag the header to move; drag the bottom-right grip to resize.
   - Source (left) and target (right) shown side by side; ⇄ swaps direction.
   - 🎤 dictates into the source box (Web Speech) then auto-translates.
   - 🔊 speaks each side with the app's high-quality voices. */
export function PronunciationPanel({ open, onClose }: PronunciationPanelProps) {
  const [text, setText]         = useState('');
  const [translation, setTrans] = useState('');
  const [src, setSrc]           = useState<'de' | 'en'>('de');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [listening, setListening] = useState(false);
  const [pos, setPos]           = useState<{ x: number; y: number } | null>(null);
  const [size, setSize]         = useState<{ w: number; h: number }>({ w: 430, h: 450 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragRef   = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const resizeRef = useRef({ active: false, startX: 0, startY: 0, origW: 0, origH: 0 });
  const recRef    = useRef<any>(null);

  const tgt: 'de' | 'en' = src === 'de' ? 'en' : 'de';
  const SR = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : undefined;

  /* Warm up voices + focus when opened; set initial position/size once,
     clamped to fit inside the viewport (important on mobile). */
  useEffect(() => {
    if (!open) return;
    warmUpVoices();
    warmUpEnglishVoice();
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    setSize(s => ({ w: Math.min(s.w, vw - 16), h: Math.min(s.h, vh - 24) }));
    setPos(p => p ?? { x: Math.max(8, vw - Math.min(size.w, vw - 16) - 24), y: 84 });
    const t = setTimeout(() => textareaRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Stop dictation when the panel closes / unmounts. */
  useEffect(() => { if (!open && recRef.current) { try { recRef.current.stop(); } catch {} } }, [open]);
  useEffect(() => () => { if (recRef.current) { try { recRef.current.stop(); } catch {} } }, []);

  /* Esc to close */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  /* Global pointer handlers for drag + resize (mouse, touch, pen). */
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (dragRef.current.active) {
        const w = window.innerWidth, hgt = window.innerHeight;
        let nx = dragRef.current.origX + (e.clientX - dragRef.current.startX);
        let ny = dragRef.current.origY + (e.clientY - dragRef.current.startY);
        // Keep the whole panel within the viewport — it must stay reachable.
        nx = Math.min(Math.max(nx, 0), Math.max(0, w - size.w));
        ny = Math.min(Math.max(ny, 0), Math.max(0, hgt - size.h));
        setPos({ x: nx, y: ny });
      } else if (resizeRef.current.active) {
        const w = window.innerWidth, hgt = window.innerHeight;
        const maxW = Math.max(300, w - (pos?.x ?? 0) - 8);
        const maxH = Math.max(250, hgt - (pos?.y ?? 0) - 8);
        setSize({
          w: Math.min(maxW, Math.max(300, resizeRef.current.origW + (e.clientX - resizeRef.current.startX))),
          h: Math.min(maxH, Math.max(250, resizeRef.current.origH + (e.clientY - resizeRef.current.startY))),
        });
      }
    };
    const up = () => {
      dragRef.current.active = false;
      resizeRef.current.active = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [size.w, size.h, pos]);

  const startDrag = (e: React.PointerEvent) => {
    if (!pos) return;
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    document.body.style.userSelect = 'none';
  };
  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    resizeRef.current = { active: true, startX: e.clientX, startY: e.clientY, origW: size.w, origH: size.h };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'nwse-resize';
  };

  const speak = (t: string, lang: 'de' | 'en') => {
    if (!t.trim()) return;
    stopAll();
    if (lang === 'en') speakEN(t.trim(), 0.9); else speakDE(t.trim(), 0.9);
  };

  const translate = async (override?: string) => {
    const q = (override ?? text).trim();
    if (!q) return;
    setLoading(true); setError(''); setTrans('');
    let result = '';
    // 1) Google translate engine (high quality, CORS-accessible)
    try {
      const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${tgt}&dt=t&q=${encodeURIComponent(q)}`);
      if (r.ok) {
        const d = await r.json();
        // d[0] = [[translatedChunk, originalChunk, ...], ...]
        if (Array.isArray(d?.[0])) result = d[0].map((s: any) => (s && s[0]) ? s[0] : '').join('').trim();
      }
    } catch { /* fall through to backup */ }
    // 2) Fallback: MyMemory (only if Google is unreachable)
    if (!result) {
      try {
        const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${src}|${tgt}`);
        const d = await r.json();
        result = d?.responseData?.translatedText || '';
      } catch { /* ignore */ }
    }
    if (result) setTrans(result);
    else setError('Übersetzung fehlgeschlagen. Bitte versuche es erneut.');
    setLoading(false);
  };

  const swap = () => {
    if (listening) { try { recRef.current?.stop(); } catch {} }
    setSrc(tgt);
    setText(translation);
    setTrans(text);
    setError('');
  };

  const toggleMic = async () => {
    if (!SR) { setError('Spracherkennung wird in diesem Browser nicht unterstützt (Chrome/Edge nutzen).'); return; }
    if (listening) { try { recRef.current?.stop(); } catch {} return; }
    setError('');
    // Ensure microphone permission first, with a clear message if it's blocked.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      }
    } catch {
      setError('Kein Mikrofonzugriff. Bitte erlaube das Mikrofon (Schloss-Symbol in der Adressleiste).');
      return;
    }
    const rec = new SR();
    rec.lang = src === 'de' ? 'de-DE' : 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setText((finalText + interim).trim());
    };
    rec.onerror = (e: any) => {
      const c = e?.error;
      if (c === 'no-speech') setError('Nichts gehört — bitte noch einmal sprechen.');
      else if (c === 'not-allowed' || c === 'service-not-allowed') setError('Mikrofon ist blockiert. Bitte im Browser erlauben.');
      else if (c === 'network') setError('Netzwerkfehler — die Spracherkennung benötigt eine Internetverbindung.');
      else if (c !== 'aborted') setError('Spracherkennung fehlgeschlagen. Bitte erneut versuchen.');
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      const t = finalText.trim();
      if (t) { setText(t); translate(t); }
    };
    recRef.current = rec;
    setText('');
    setTrans('');
    setListening(true);
    try { rec.start(); } catch { setListening(false); setError('Aufnahme konnte nicht gestartet werden.'); }
  };

  if (!open || !pos) return null;

  const srcMic = (
    <button
      onClick={toggleMic}
      disabled={!SR}
      title={SR ? (listening ? 'Aufnahme stoppen' : `Sprechen (${NAME[src]})`) : 'Spracherkennung wird in diesem Browser nicht unterstützt'}
      style={{
        border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, padding: '1px 7px', lineHeight: 1.4,
        cursor: SR ? 'pointer' : 'not-allowed',
        background: listening ? 'var(--red, #dc2626)' : 'var(--bg,#fff)',
        color: listening ? '#fff' : 'inherit',
        animation: listening ? 'pulse 1s ease-in-out infinite' : undefined,
      }}
    >🎤</button>
  );

  return (
    <div
      className="aussprache-panel"
      style={{
        position: 'fixed', left: pos.x, top: pos.y, width: size.w, height: size.h,
        boxSizing: 'border-box', zIndex: 600, borderRadius: 16, overflow: 'hidden',
        border: '1px solid var(--border)', background: '#fff',
        boxShadow: '0 14px 44px rgba(0,0,0,.28)', display: 'flex', flexDirection: 'column',
      }}
      role="dialog" aria-label="Aussprache und Übersetzung"
    >
      {/* Header = drag handle */}
      <div
        onPointerDown={startDrag}
        style={{
          cursor: 'move', flexShrink: 0, padding: '10px 12px',
          background: 'linear-gradient(90deg, var(--green), #15803d)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          touchAction: 'none', userSelect: 'none',
        }}
      >
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span aria-hidden>⠿</span> 🔊 Aussprache &amp; Übersetzung
        </span>
        <button onClick={onClose} aria-label="Schließen"
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,.85)', fontSize: 16, lineHeight: 1, cursor: 'pointer' }}>
          ✕
        </button>
      </div>

      {/* Body — source (left) and target (right) side by side, with ⇄ between */}
      <div style={{ padding: 12, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="aussprache-cols" style={{ display: 'flex', gap: 6, flex: 1, minHeight: 96 }}>
          {/* Source (input) */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)' }}>{NAME[src]}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {srcMic}
                <button onClick={() => speak(text, src)} disabled={!text.trim()} title={`Vorlesen (${src.toUpperCase()})`}
                  style={{ border: '1px solid var(--border)', background: 'var(--bg,#fff)', borderRadius: 6, fontSize: 12, padding: '1px 7px', cursor: text.trim() ? 'pointer' : 'not-allowed', lineHeight: 1.4 }}>🔊</button>
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={listening ? 'Sprich jetzt…' : (src === 'de' ? 'Deutschen Text eingeben…' : 'Englischen Text eingeben…')}
              style={{
                width: '100%', flex: 1, minHeight: 70, resize: 'none', padding: '8px 10px',
                fontSize: 14, lineHeight: 1.4, border: '1px solid var(--border)', borderRadius: 8,
                background: 'var(--bg2, #f8fafc)', color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {/* Swap direction */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <button onClick={swap} title="Sprachen tauschen"
              style={{ border: '1px solid var(--border)', background: 'var(--bg,#fff)', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 13, color: 'var(--ink2)' }}>⇄</button>
          </div>

          {/* Target (translation) */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--blue)' }}>{NAME[tgt]}</span>
              <button onClick={() => speak(translation, tgt)} disabled={!translation.trim()} title={`Vorlesen (${tgt.toUpperCase()})`}
                style={{ border: '1px solid var(--blue-bd)', background: 'var(--blue-bg)', borderRadius: 6, fontSize: 12, padding: '1px 7px', cursor: translation.trim() ? 'pointer' : 'not-allowed', lineHeight: 1.4 }}>🔊</button>
            </div>
            <div style={{
              width: '100%', flex: 1, minHeight: 70, overflowY: 'auto', padding: '8px 10px',
              fontSize: 14, lineHeight: 1.5, border: '1px solid var(--blue-bd)', borderRadius: 8,
              background: 'var(--blue-bg)', color: translation ? 'var(--ink)' : 'var(--muted)', whiteSpace: 'pre-wrap',
            }}>
              {loading ? 'Übersetze…' : (translation || 'Übersetzung erscheint hier.')}
            </div>
          </div>
        </div>

        <Button variant="green" className="w-full" onClick={() => translate()} loading={loading} disabled={!text.trim()}>
          🌐 Übersetzen
        </Button>

        {error && (
          <p style={{ fontSize: 11.5, color: 'var(--red)', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 10px', margin: 0 }}>{error}</p>
        )}
      </div>

      {/* Resize grip (bottom-right) — hidden on mobile */}
      <div
        className="aussprache-resize"
        onPointerDown={startResize}
        title="Ziehen zum Vergrößern"
        style={{
          position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, cursor: 'nwse-resize',
          touchAction: 'none',
          background: 'linear-gradient(135deg, transparent 50%, var(--border2, #94a3b8) 50%)',
          borderBottomRightRadius: 14,
        }}
      />
    </div>
  );
}
