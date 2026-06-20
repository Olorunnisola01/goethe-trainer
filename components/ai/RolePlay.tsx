'use client';

/* KI-Rollenspiel — pick a real-life scenario and hold a German conversation
   with the AI playing a role (waiter, landlord, doctor…). Speak or type; the AI
   replies in German and gently corrects. "Feedback" ends the session with a
   scored summary. Awards XP per exchange. */

import { useState, useRef, useEffect, useCallback } from 'react';
import { askAi, extractJson, AiMessage } from '@/lib/ai';
import { useGame } from '@/context/GamificationContext';
import { speakDE, stopAll, warmUpVoices } from '@/lib/cloudVoice';

interface Scenario { id: string; emoji: string; title: string; you: string; ai: string; opener: string; }
const SCENARIOS: Scenario[] = [
  { id: 'restaurant', emoji: '🍽️', title: 'Im Restaurant', you: 'Gast', ai: 'Kellner/in', opener: 'Guten Abend! Haben Sie schon gewählt, oder darf ich Ihnen erst etwas zu trinken bringen?' },
  { id: 'shopping',   emoji: '🛍️', title: 'Einkaufen',     you: 'Kunde/Kundin', ai: 'Verkäufer/in', opener: 'Hallo! Kann ich Ihnen helfen? Suchen Sie etwas Bestimmtes?' },
  { id: 'doctor',     emoji: '🩺', title: 'Beim Arzt',     you: 'Patient/in', ai: 'Arzt/Ärztin', opener: 'Guten Tag, bitte setzen Sie sich. Was kann ich für Sie tun?' },
  { id: 'apartment',  emoji: '🏠', title: 'Wohnungssuche', you: 'Interessent/in', ai: 'Vermieter/in', opener: 'Schönen guten Tag! Sie interessieren sich für die Wohnung? Haben Sie Fragen?' },
  { id: 'directions', emoji: '🗺️', title: 'Nach dem Weg fragen', you: 'Tourist/in', ai: 'Passant/in', opener: 'Hallo, Sie sehen etwas verloren aus. Kann ich Ihnen weiterhelfen?' },
  { id: 'smalltalk',  emoji: '☕', title: 'Smalltalk im Café', you: 'Gast', ai: 'Bekannte/r', opener: 'Hey, schön dich zu sehen! Wie war dein Wochenende?' },
];

interface Turn { role: 'user' | 'ai'; text: string; }
interface Summary { score: number; good: string[]; improve: string[]; }

export function RolePlay() {
  const { record } = useGame();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns, busy]);

  const start = (s: Scenario) => {
    warmUpVoices();
    setScenario(s); setSummary(null); setInput('');
    setTurns([{ role: 'ai', text: s.opener }]);
    setTimeout(() => speakDE(s.opener, 0.92), 200);
  };

  const systemFor = (s: Scenario) =>
    `You are role-playing as a ${s.ai} in this scenario: "${s.title}". The user is the ${s.you}, a German learner (A2–B1). Stay in character and reply ONLY in natural, fairly simple German (1–3 sentences), always ending with a question or prompt to keep the conversation going. If the user makes a clear German mistake, append exactly one line starting "Korrektur:" with the corrected German and a 3–6 word English hint. Never break character otherwise. No markdown, no emojis.`;

  const send = useCallback(async (text: string) => {
    const said = text.trim();
    if (!said || busy || !scenario) return;
    setInput('');
    const history = [...turns, { role: 'user' as const, text: said }];
    setTurns(history);
    setBusy(true);
    try {
      const msgs: AiMessage[] = history.map(t => ({ role: t.role === 'ai' ? 'assistant' : 'user', content: t.text }));
      const reply = await askAi(msgs, { system: systemFor(scenario), maxTokens: 400 });
      setTurns(h => [...h, { role: 'ai', text: reply }]);
      record({ type: 'konv', correct: true });
      // Speak only the in-character part (strip the Korrektur line)
      const spoken = reply.split(/Korrektur:/i)[0].trim();
      if (spoken) speakDE(spoken, 0.92);
    } catch {
      setTurns(h => [...h, { role: 'ai', text: '(Entschuldigung, ich habe gerade keine Verbindung. Bitte versuche es erneut.)' }]);
    } finally {
      setBusy(false);
    }
  }, [busy, scenario, turns, record]);

  const getFeedback = async () => {
    if (!scenario || busy) return;
    setBusy(true);
    try {
      const convo = turns.map(t => `${t.role === 'user' ? 'Lerner' : 'Partner'}: ${t.text}`).join('\n');
      const reply = await askAi([{ role: 'user', content:
        `Here is a German role-play conversation (${scenario.title}). Assess only the LEARNER's German.\n\n${convo}\n\nRespond ONLY with JSON: {"score": <0-100>, "good": ["..."], "improve": ["..."]}. Keep items short, in English.` }],
        { maxTokens: 500 });
      const parsed = extractJson<Summary>(reply);
      if (parsed) setSummary(parsed);
    } catch { /* ignore */ }
    finally { setBusy(false); }
  };

  const toggleMic = () => {
    const SR = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!SR) { alert('Spracheingabe braucht Chrome/Edge oder die App.'); return; }
    if (listening) { try { recRef.current?.stop(); } catch { /* ignore */ } return; }
    stopAll();
    const rec = new SR();
    rec.lang = 'de-DE'; rec.interimResults = true; rec.continuous = false;
    let final = '';
    rec.onresult = (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const c = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += c; else interim += c;
      }
      setInput((final + interim).trim());
    };
    rec.onend = () => { setListening(false); const t = final.trim(); if (t) send(t); };
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setInput(''); setListening(true);
    try { rec.start(); } catch { setListening(false); }
  };

  /* ── Scenario picker ── */
  if (!scenario) {
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-lora, Lora), serif', fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>🎭 KI-Rollenspiel</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14 }}>Wähle eine Situation und sprich (oder tippe) auf Deutsch mit der KI. Sie bleibt in ihrer Rolle und korrigiert dich sanft.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => start(s)}
              style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 12px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <span style={{ fontSize: 26 }}>{s.emoji}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{s.title}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Du: {s.you}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Active role-play ── */
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{scenario.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{scenario.title}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>KI: {scenario.ai} · Du: {scenario.you}</div>
        </div>
        <button onClick={() => { stopAll(); setScenario(null); setTurns([]); setSummary(null); }}
          style={{ fontSize: 11.5, color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>✕ Beenden</button>
      </div>

      {/* Conversation */}
      <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {turns.map((t, i) => {
          const main = t.text.split(/Korrektur:/i)[0].trim();
          const corr = t.role === 'ai' && /Korrektur:/i.test(t.text) ? t.text.split(/Korrektur:/i)[1].trim() : '';
          return (
            <div key={i} style={{ alignSelf: t.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ padding: '8px 12px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
                  background: t.role === 'user' ? 'var(--blue)' : 'var(--bg)', color: t.role === 'user' ? '#fff' : 'var(--ink)',
                  border: t.role === 'user' ? 'none' : '1px solid var(--border)' }}>
                  {main}
                </div>
                {t.role === 'ai' && (
                  <button onClick={() => speakDE(main, 0.92)} title="Vorlesen"
                    style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--blue-bd)', background: 'var(--blue-bg)', color: 'var(--blue)', cursor: 'pointer', fontSize: 10 }}>🔊</button>
                )}
              </div>
              {corr && <div style={{ fontSize: 11.5, color: 'var(--amber)', marginTop: 3, paddingLeft: 4 }}>✏️ {corr}</div>}
            </div>
          );
        })}
        {busy && <div style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--muted)', padding: '4px 8px' }}>…</div>}
        <div ref={endRef} />
      </div>

      {summary ? (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-lora)', color: summary.score >= 70 ? 'var(--green)' : 'var(--amber)' }}>{summary.score}/100</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink2)' }}>Dein Rollenspiel-Ergebnis</div>
          </div>
          {summary.good?.length > 0 && <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 4 }}>✅ {summary.good.join(' · ')}</div>}
          {summary.improve?.length > 0 && <div style={{ fontSize: 12, color: 'var(--amber)' }}>💡 {summary.improve.join(' · ')}</div>}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button onClick={toggleMic} title={listening ? 'Stopp' : 'Sprechen'}
            style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 16,
              background: listening ? 'var(--red)' : 'var(--blue)', color: '#fff', animation: listening ? 'pulse 1s infinite' : undefined }}>
            {listening ? '⏹' : '🎤'}
          </button>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={1}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Antworte auf Deutsch…"
            style={{ flex: 1, resize: 'none', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={() => send(input)} disabled={busy || !input.trim()} className="btn-primary" style={{ flexShrink: 0 }}>➤</button>
        </div>
      )}

      {!summary && turns.length >= 4 && (
        <button onClick={getFeedback} disabled={busy}
          style={{ width: '100%', marginTop: 10, padding: '9px 0', borderRadius: 10, border: '1px solid var(--green-bd)', background: 'var(--green-bg)', color: 'var(--green)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          🏁 Feedback &amp; Bewertung
        </button>
      )}
    </div>
  );
}
