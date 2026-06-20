'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { UbLayout } from '@/components/layout/UbLayout';
import { warmUpVoices, speakDE, stopAll } from '@/lib/cloudVoice';
import { askAi, extractJson } from '@/lib/ai';
import { useGame } from '@/context/GamificationContext';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface SpeakItem {
  id: string;
  level: Level;
  part: string;
  title: string;
  instructions: string;
  instructionsEn: string;
  examplePrompt: string;
  duration: number;
  rubric: string;
}

const LEVEL_LABELS: Record<string, string> = { A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed' };

function speak(text: string, _lang = 'de-DE') {
  speakDE(text, 0.88);
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface SpeakFeedback { score: number; strengths: string[]; improvements: string[]; corrected: { from: string; to: string }[]; }

export function SprechenClient() {
  const { record } = useGame();
  const [items, setItems] = useState<SpeakItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<Level | 'ALL'>('ALL');
  const [selected, setSelected] = useState<SpeakItem | null>(null);

  // AI speaking feedback
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<SpeakFeedback | null>(null);
  const [aiError, setAiError] = useState('');

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recording/feedback state
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recError, setRecError]   = useState('');
  const [showScript, setShowScript] = useState(false);
  const [showRubric, setShowRubric] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => { warmUpVoices(); }, []);

  useEffect(() => {
    fetch('/data/speak.json')
      .then(r => r.json())
      .then((d: SpeakItem[]) => { setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => levelFilter === 'ALL' ? items : items.filter(i => i.level === levelFilter),
    [items, levelFilter]
  );

  const selectItem = (item: SpeakItem) => {
    stopTimer();
    setSelected(item);
    setTimeLeft(item.duration);
    setTimerActive(false);
    setTimerDone(false);
    setTranscript('');
    setRecError('');
    setShowScript(false);
    setShowRubric(false);
    setRecording(false);
    setAiFeedback(null);
    setAiError('');
    stopAll();
  };

  /* Send the transcript to the AI for a structured speaking assessment. */
  const getAiFeedback = async () => {
    if (!selected || !transcript.trim() || aiLoading) return;
    setAiLoading(true); setAiError(''); setAiFeedback(null);
    try {
      const reply = await askAi([{
        role: 'user',
        content: `A German learner (level ${selected.level}) was given this speaking task:\nTask: "${selected.examplePrompt}"\n\nThey said (auto-transcribed from speech):\n"${transcript.trim()}"\n\nAssess their spoken answer for: task completion, grammar, vocabulary and sentence structure. Be encouraging but honest. Respond ONLY with JSON: {"score": <0-100 integer>, "strengths": ["...","..."], "improvements": ["...","..."], "corrected": [{"from":"their German phrase","to":"corrected German"}]}. Keep each string short. Strengths/improvements in English; corrected phrases in German.`,
      }], { maxTokens: 700 });
      const parsed = extractJson<SpeakFeedback>(reply);
      if (parsed && typeof parsed.score === 'number') {
        setAiFeedback(parsed);
        record({ type: 'speak', correct: parsed.score >= 60 });
      } else setAiError('Keine Bewertung erhalten. Bitte erneut versuchen.');
    } catch {
      setAiError('KI nicht erreichbar. Bitte später erneut versuchen.');
    } finally {
      setAiLoading(false);
    }
  };

  // Timer logic
  const startTimer = () => {
    if (!selected || timerActive) return;
    setTimerActive(true);
    setTimerDone(false);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setTimerActive(false);
          setTimerDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerActive(false);
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(selected?.duration ?? 0);
    setTimerDone(false);
  };

  useEffect(() => () => stopTimer(), []);

  // Speech recognition
  const startRecording = async () => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { setRecError('Spracherkennung wird in diesem Browser nicht unterstützt. Bitte Chrome oder Edge verwenden.'); return; }
    setRecError('');
    // Ensure microphone permission first, with a clear message if it's blocked.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      }
    } catch {
      setRecError('Kein Mikrofonzugriff. Bitte erlaube das Mikrofon (Schloss-Symbol in der Adressleiste).');
      return;
    }
    const rec = new SR();
    rec.lang = 'de-DE';
    rec.continuous = true;
    rec.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      // include interim results so text appears live while speaking
      let out = '';
      for (let i = 0; i < e.results.length; i++) out += e.results[i][0].transcript + ' ';
      setTranscript(out.trim());
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      const c = e?.error;
      if (c === 'no-speech') setRecError('Nichts gehört — bitte lauter/näher sprechen und erneut versuchen.');
      else if (c === 'not-allowed' || c === 'service-not-allowed') setRecError('Mikrofon ist blockiert. Bitte im Browser erlauben.');
      else if (c === 'network') setRecError('Netzwerkfehler — die Spracherkennung benötigt eine Internetverbindung.');
      else if (c !== 'aborted') setRecError('Spracherkennung fehlgeschlagen. Bitte erneut versuchen.');
      setRecording(false);
    };
    rec.onend = () => setRecording(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setRecording(true);
      if (!timerActive && !timerDone) startTimer();
    } catch {
      setRecError('Aufnahme konnte nicht gestartet werden. Bitte erneut versuchen.');
      setRecording(false);
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
    stopTimer();
  };

  const timerClass = () => {
    if (!selected) return 'ub-timer';
    const pct = timeLeft / selected.duration;
    if (pct <= 0.15) return 'ub-timer danger';
    if (pct <= 0.33) return 'ub-timer warning';
    return 'ub-timer';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
        <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .9s linear infinite' }} />
      </div>
    );
  }

  return (
    <UbLayout sidebar={close => (
      <>
      {/* Filter bar */}
      <div className="ub-bar" style={{ position: 'static', flexShrink: 0 }}>
        <span className="fl-lbl">Level:</span>
        {(['ALL', 'A1', 'A2', 'B1', 'B2'] as (Level | 'ALL')[]).map(lv => (
          <button
            key={lv}
            className={`chip${levelFilter === lv ? ' on' : ''}`}
            onClick={() => setLevelFilter(lv)}
            style={levelFilter === lv && lv !== 'ALL' ? { background: LEVEL_LABELS[lv], borderColor: LEVEL_LABELS[lv], color: '#fff' } : {}}
          >
            {lv === 'ALL' ? 'Alle' : <span className={`lvl lvl-${lv.toLowerCase()}`}>{lv}</span>}
          </button>
        ))}
        <span className="ub-note">{filtered.length} Aufgaben</span>
      </div>

      {/* Selection list (inside resizable sidebar / mobile drawer) */}
      <div className="ub-list" style={{ border: 'none', position: 'static', maxHeight: 'none', background: 'transparent' }}>
          {filtered.length === 0 ? (
            <p className="ub-empty">Keine Aufgaben</p>
          ) : filtered.map(item => (
            <div
              key={item.id}
              className={`ub-item${selected?.id === item.id ? ' active' : ''}`}
              onClick={() => { selectItem(item); close(); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="ub-item-t">{item.title}</div>
                  <div className="ub-item-s">
                    <span className={`ub-item-tag lvl-${item.level.toLowerCase()}`}>{item.level}</span>
                    {item.part} · {Math.ceil(item.duration / 60)} Min
                  </div>
                </div>
                <span style={{ fontSize: 15, flexShrink: 0 }}>🎙</span>
              </div>
            </div>
          ))}
      </div>
      </>
    )}>
      {/* Right pane */}
      <div className="ub-pane">
          {!selected ? (
            <div className="ub-empty" style={{ paddingTop: 80 }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🎙</div>
              <div style={{ fontFamily: 'var(--font-lora)', fontWeight: 600, fontSize: 16, color: 'var(--ink2)', fontStyle: 'normal', marginBottom: 6 }}>Sprechen üben</div>
              <div>Wähle eine Aufgabe aus der Liste</div>
            </div>
          ) : (
            <div style={{ maxWidth: 680 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span className={`lvl lvl-${selected.level.toLowerCase()}`}>{selected.level}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{selected.part}</span>
              </div>

              {/* Prompt card */}
              <div className="ub-prompt">
                <div className="ub-prompt-t">🎙 {selected.title}</div>
                <div className="ub-prompt-s">{selected.instructions}</div>
                <div className="ub-prompt-en">{selected.instructionsEn}</div>
              </div>

              {/* Example prompt + TTS */}
              <div className="ub-section">
                <div className="ub-section-h">Aufgabenstellung</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 14px', boxShadow: 'var(--sh)' }}>
                  <div style={{ flex: 1, fontFamily: 'var(--font-lora)', fontSize: 15, color: 'var(--ink)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    „{selected.examplePrompt}"
                  </div>
                  <button
                    className="speak-btn"
                    onClick={() => speak(selected.examplePrompt)}
                    title="Aufgabe vorlesen"
                    style={{ marginTop: 2, flexShrink: 0 }}
                  >🔊</button>
                </div>
              </div>

              {/* Timer + record */}
              <div className="ub-section">
                <div className="ub-section-h">Timer &amp; Aufnahme</div>
                <div className="ub-btn-row">
                  <div className={timerClass()}>
                    ⏱ {formatTime(timeLeft)}
                  </div>
                  {!timerActive && !timerDone && (
                    <button className="btn-primary" onClick={startTimer}>▶ Timer starten</button>
                  )}
                  {timerActive && (
                    <button className="btn-secondary" onClick={stopTimer}>⏸ Pausieren</button>
                  )}
                  {(timerActive || timerDone) && (
                    <button className="btn-secondary" onClick={resetTimer}>↺ Reset</button>
                  )}
                </div>
                {timerDone && (
                  <div style={{ fontSize: 12.5, color: 'var(--amber)', fontWeight: 600, marginBottom: 10 }}>
                    ⏰ Zeit abgelaufen!
                  </div>
                )}

                {/* Mic button */}
                <div className="ub-btn-row" style={{ alignItems: 'center', gap: 16 }}>
                  <button
                    className={`ub-mic${recording ? ' recording' : ''}`}
                    onClick={recording ? stopRecording : startRecording}
                    title={recording ? 'Aufnahme stoppen' : 'Aufnahme starten'}
                  >
                    {recording ? '⏹' : '🎤'}
                  </button>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: recording ? 'var(--red)' : 'var(--ink2)' }}>
                      {recording ? '🔴 Aufnahme läuft…' : 'Zum Sprechen klicken'}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>
                      Spracherkennungs-API (Chrome empfohlen)
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div className="ub-section-h" style={{ marginTop: 14 }}>Deine Antwort</div>
                <div className={`ub-transcript${!transcript ? ' empty' : ''}`}>
                  {transcript || 'Deine gesprochene Antwort erscheint hier…'}
                </div>
                {recError && (
                  <div style={{ fontSize: 12, color: 'var(--red)', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '7px 10px', marginTop: 8 }}>
                    {recError}
                  </div>
                )}

                {/* AI speaking feedback */}
                {transcript.trim() && (
                  <button className="btn-primary" style={{ marginTop: 12 }} onClick={getAiFeedback} disabled={aiLoading}>
                    {aiLoading ? '⏳ KI bewertet…' : '🤖 KI-Feedback erhalten'}
                  </button>
                )}
                {aiError && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{aiError}</div>}
                {aiFeedback && (
                  <div className="ub-feedback" style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-lora)', color: aiFeedback.score >= 75 ? 'var(--green)' : aiFeedback.score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                        {aiFeedback.score}<span style={{ fontSize: 15, color: 'var(--muted)' }}>/100</span>
                      </div>
                      <div style={{ flex: 1, height: 8, borderRadius: 100, background: 'var(--bg3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${aiFeedback.score}%`, borderRadius: 100, background: aiFeedback.score >= 75 ? 'var(--green)' : aiFeedback.score >= 50 ? 'var(--amber)' : 'var(--red)' }} />
                      </div>
                    </div>
                    {aiFeedback.strengths?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 3 }}>✅ Stärken</div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6 }}>
                          {aiFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {aiFeedback.improvements?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', marginBottom: 3 }}>💡 Verbesserungen</div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6 }}>
                          {aiFeedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    )}
                    {aiFeedback.corrected?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 3 }}>✍️ Korrekturen</div>
                        {aiFeedback.corrected.map((c, i) => (
                          <div key={i} style={{ fontSize: 12.5, marginBottom: 3 }}>
                            <span style={{ color: 'var(--red)', textDecoration: 'line-through' }}>{c.from}</span>
                            {' → '}
                            <span style={{ color: 'var(--green)', fontWeight: 600 }}>{c.to}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Rubric toggle */}
              <div className="ub-section">
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowRubric(s => !s)}
                  >
                    {showRubric ? '▲ Bewertungskriterien' : '▼ Bewertungskriterien'}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowScript(s => !s)}
                  >
                    {showScript ? '▲ Beispielantwort' : '▼ Beispielantwort'}
                  </button>
                </div>

                {showRubric && (
                  <div className="ub-feedback" style={{ marginTop: 12 }}>
                    <h4>📋 Bewertungskriterien</h4>
                    <p style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.65 }}>{selected.rubric}</p>
                  </div>
                )}

                {showScript && (
                  <div className="ub-feedback good" style={{ marginTop: 12 }}>
                    <h4>✏️ Leitfragen für deine Antwort</h4>
                    <p style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.65 }}>
                      Beantworte die Aufgabe vollständig und strukturiert. Nutze vollständige Sätze auf Deutsch.
                      Überprüfe danach deine Antwort mit den Bewertungskriterien.
                    </p>
                    <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
                      💡 Tipp: Übe zuerst ohne Zeitlimit, dann mit Timer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
    </UbLayout>
  );
}
