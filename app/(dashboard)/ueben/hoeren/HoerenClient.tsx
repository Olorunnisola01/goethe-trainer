'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { UbLayout } from '@/components/layout/UbLayout';
import { warmUpVoices, speakDE } from '@/lib/cloudVoice';
import { DictationPanel } from '@/components/dictation/DictationPanel';

type Level = 'A1' | 'A2' | 'B1' | 'B2';

interface MCQDialog {
  script?: string;          // optional — some teils share one audioScript
  q: string;
  opts: string[];
  a: number;
}
interface TFDialog {
  script?: string;          // optional — TF teils share one audioScript
  statement: string;
  correct: boolean;
}
interface ExamTeil {
  num: number;
  type: 'mc' | 'tf';
  maxPlays: number;
  title: string;
  instructions: string;
  audioScript?: string;     // shared audio for the whole teil (A2/B1 TF + MC-block teils)
  dialogs?: (MCQDialog | TFDialog)[];   // per-dialog audio (A1 style)
  questions?: MCQDialog[];              // shared-audio MC questions (A2/B1 teil 2)
}
interface ListenExam {
  id: string;
  level: Level;
  title: string;
  teile: ExamTeil[];
}
interface ListenItem {
  id: string;
  level: Level;
  part: string;
  title: string;
  instructions: string;
  audioScript: string;
  duration: number;
  questions: { q: string; opts: string[]; a: number; exp: string }[];
}

const LEVEL_LABELS: Record<string, string> = { A1: '#15803d', A2: '#1d4ed8', B1: '#7c3aed' };

export function HoerenClient() {
  const [exams, setExams] = useState<ListenExam[]>([]);
  const [basics, setBasics] = useState<ListenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<Level | 'ALL'>('ALL');
  const [mode, setMode] = useState<'exams' | 'basics'>('exams');
  const [selectedExam, setSelectedExam] = useState<ListenExam | null>(null);
  const [selectedBasic, setSelectedBasic] = useState<ListenItem | null>(null);

  // Exam answers: examId → teilNum → dialogIdx → answer (boolean for TF, number for MC)
  const [answers, setAnswers] = useState<Record<string, Record<number, Record<number, boolean | number>>>>({});
  const [plays, setPlays] = useState<Record<string, Record<number, Record<number, number>>>>({});
  const [showScript, setShowScript] = useState<Record<string, boolean>>({});
  const [speaking, setSpeaking] = useState(false);

  // Basic answers
  const [basicAnswers, setBasicAnswers] = useState<Record<number, number>>({});
  const [basicChecked, setBasicChecked] = useState(false);

  useEffect(() => { warmUpVoices(); }, []);

  useEffect(() => {
    Promise.all([
      fetch('/data/listen_exams.json').then(r => r.json()),
      fetch('/data/listen.json').then(r => r.json()),
    ]).then(([ex, bas]) => {
      setExams(ex);
      setBasics(bas);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredExams = useMemo(
    () => levelFilter === 'ALL' ? exams : exams.filter(e => e.level === levelFilter),
    [exams, levelFilter]
  );
  const filteredBasics = useMemo(
    () => levelFilter === 'ALL' ? basics : basics.filter(b => b.level === levelFilter),
    [basics, levelFilter]
  );

  const getAnswer = (examId: string, teilNum: number, dIdx: number) =>
    answers[examId]?.[teilNum]?.[dIdx];

  const setAnswer = (examId: string, teilNum: number, dIdx: number, val: boolean | number) => {
    setAnswers(prev => ({
      ...prev,
      [examId]: { ...(prev[examId] ?? {}), [teilNum]: { ...(prev[examId]?.[teilNum] ?? {}), [dIdx]: val } },
    }));
  };

  const playCount = (examId: string, teilNum: number, dIdx: number) =>
    plays[examId]?.[teilNum]?.[dIdx] ?? 0;

  const incrementPlay = (examId: string, teilNum: number, dIdx: number, script: string, maxPlays: number) => {
    const cnt = playCount(examId, teilNum, dIdx);
    if (cnt >= maxPlays) return;
    setPlays(prev => ({
      ...prev,
      [examId]: { ...(prev[examId] ?? {}), [teilNum]: { ...(prev[examId]?.[teilNum] ?? {}), [dIdx]: cnt + 1 } },
    }));
    setSpeaking(true);
    speakDE(script, 0.85, { onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  const toggleScript = (key: string) =>
    setShowScript(prev => ({ ...prev, [key]: !prev[key] }));

  const examScore = (exam: ListenExam) => {
    let correct = 0, total = 0;
    exam.teile.forEach(teil => {
      // A2/B1 teil 2 uses "questions" instead of "dialogs"
      const items: Array<{ correct?: boolean; a?: number }> =
        (teil.dialogs ?? teil.questions ?? []) as Array<{ correct?: boolean; a?: number }>;
      items.forEach((d, dIdx) => {
        const ans = getAnswer(exam.id, teil.num, dIdx);
        if (ans === undefined) return;
        total++;
        if (teil.type === 'tf') {
          if (ans === (d as TFDialog).correct) correct++;
        } else {
          if (ans === (d as MCQDialog).a) correct++;
        }
      });
    });
    return { correct, total };
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
        <div style={{ height: 20, width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button
          className={`chip${mode === 'exams' ? ' on' : ''}`}
          onClick={() => setMode('exams')}
        >📋 Prüfungssätze</button>
        <button
          className={`chip${mode === 'basics' ? ' on' : ''}`}
          onClick={() => setMode('basics')}
        >🎧 Übungen</button>
        <span className="ub-note">{mode === 'exams' ? filteredExams.length : filteredBasics.length} Einheiten</span>
      </div>

      {/* Selection list (inside resizable sidebar / mobile drawer) */}
      <div style={{ padding: '14px 12px' }}>
          {mode === 'exams' ? (
            filteredExams.length === 0 ? (
              <p className="ub-empty">Keine Prüfungssätze</p>
            ) : filteredExams.map(exam => (
              <div
                key={exam.id}
                className={`ub-item${selectedExam?.id === exam.id ? ' active' : ''}`}
                onClick={() => { setSelectedExam(exam); setSelectedBasic(null); close(); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="ub-item-t">{exam.title}</div>
                    <div className="ub-item-s">
                      <span className={`ub-item-tag lvl-${exam.level.toLowerCase()}`}>{exam.level}</span>
                      {exam.teile.length} Teile
                    </div>
                  </div>
                  {(() => { const s = examScore(exam); return s.total > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.correct === s.total ? 'var(--green)' : 'var(--blue)' }}>
                      {s.correct}/{s.total}
                    </span>
                  ); })()}
                </div>
              </div>
            ))
          ) : (
            filteredBasics.length === 0 ? (
              <p className="ub-empty">Keine Übungen</p>
            ) : filteredBasics.map(item => (
              <div
                key={item.id}
                className={`ub-item${selectedBasic?.id === item.id ? ' active' : ''}`}
                onClick={() => { setSelectedBasic(item); setSelectedExam(null); setBasicAnswers({}); setBasicChecked(false); close(); }}
              >
                <div className="ub-item-t">{item.title}</div>
                <div className="ub-item-s">
                  <span className={`ub-item-tag lvl-${item.level.toLowerCase()}`}>{item.level}</span>
                  {item.part} · {item.questions.length} Fragen
                </div>
              </div>
            ))
          )}
      </div>
      </>
    )}>
        {/* Right pane */}
        <div style={{ overflowY: 'auto', padding: '28px 36px' }}>
          {!selectedExam && !selectedBasic ? (
            <div className="ub-empty" style={{ paddingTop: 80 }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🎧</div>
              <div style={{ fontFamily: 'var(--font-lora)', fontWeight: 600, fontSize: 16, color: 'var(--ink2)', fontStyle: 'normal', marginBottom: 6 }}>Hörverstehen üben</div>
              <div>Wähle eine Einheit aus der Liste</div>
            </div>
          ) : selectedExam ? (
            <ExamPane
              exam={selectedExam}
              getAnswer={getAnswer}
              setAnswer={setAnswer}
              playCount={playCount}
              incrementPlay={incrementPlay}
              showScript={showScript}
              toggleScript={toggleScript}
              speaking={speaking}
            />
          ) : selectedBasic ? (
            <BasicPane
              item={selectedBasic}
              answers={basicAnswers}
              setAnswers={setBasicAnswers}
              checked={basicChecked}
              setChecked={setBasicChecked}
            />
          ) : null}
        </div>
    </UbLayout>
  );
}

/* ── Exam pane ── */
function ExamPane({
  exam, getAnswer, setAnswer, playCount, incrementPlay, showScript, toggleScript, speaking,
}: {
  exam: ListenExam;
  getAnswer: (examId: string, teilNum: number, dIdx: number) => boolean | number | undefined;
  setAnswer: (examId: string, teilNum: number, dIdx: number, val: boolean | number) => void;
  playCount: (examId: string, teilNum: number, dIdx: number) => number;
  incrementPlay: (examId: string, teilNum: number, dIdx: number, script: string, maxPlays: number) => void;
  showScript: Record<string, boolean>;
  toggleScript: (key: string) => void;
  speaking: boolean;
}) {
  const totalQ = exam.teile.reduce((acc, t) =>
    acc + (t.dialogs?.length ?? t.questions?.length ?? 0), 0);
  let answered = 0;
  let correct = 0;
  exam.teile.forEach(t => {
    const items = (t.dialogs ?? t.questions ?? []) as Array<TFDialog | MCQDialog>;
    items.forEach((d, di) => {
      const ans = getAnswer(exam.id, t.num, di);
      if (ans !== undefined) {
        answered++;
        if (t.type === 'tf' && ans === (d as TFDialog).correct) correct++;
        if (t.type === 'mc' && ans === (d as MCQDialog).a) correct++;
      }
    });
  });

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className={`lvl lvl-${exam.level.toLowerCase()}`}>{exam.level}</span>
          <span style={{ fontFamily: 'var(--font-lora)', fontSize: 20, fontWeight: 700 }}>{exam.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--muted)' }}>
          <span>📋 {exam.teile.length} Teile</span>
          <span>❓ {totalQ} Fragen</span>
          {answered > 0 && <span style={{ color: 'var(--blue)', fontWeight: 600 }}>✓ {correct}/{answered} richtig</span>}
        </div>
      </div>

      {exam.teile.map(teil => {
        // Normalise: dialogs (per-audio) OR questions (shared-audio MC) OR TF with audioScript
        const hasSharedAudio = !!teil.audioScript;
        const dialogItems = teil.dialogs ?? [];
        const questionItems = teil.questions ?? [];

        return (
        <div key={teil.num} className="lst-teil">
          {/* Teil header */}
          <div className="lst-teil-head">
            <span style={{ background: 'var(--blue)', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
              Teil {teil.num}
            </span>
            <span>{teil.title}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', background: 'var(--faint)', padding: '2px 8px', borderRadius: 100 }}>
              Max. {teil.maxPlays}× anhören
            </span>
          </div>
          <div className="lst-teil-instr">{teil.instructions}</div>

          {/* Shared audio player (A2/B1 TF teils + MC-block teils) */}
          {hasSharedAudio && (() => {
            const sharedKey = `${exam.id}-${teil.num}-audio`;
            const pc = playCount(exam.id, teil.num, -1);
            const canPlay = pc < teil.maxPlays;
            const scriptVisible = showScript[sharedKey];
            return (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16,
                background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px' }}>
                <button
                  onClick={() => incrementPlay(exam.id, teil.num, -1, teil.audioScript!, teil.maxPlays)}
                  disabled={!canPlay}
                  title={canPlay ? `Anhören (${pc + 1}/${teil.maxPlays})` : 'Maximale Wiedergaben erreicht'}
                  style={{
                    flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--blue-bd)',
                    background: canPlay ? '#fff' : 'var(--bg2)', color: canPlay ? 'var(--blue)' : 'var(--muted)',
                    cursor: canPlay ? 'pointer' : 'not-allowed', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}
                >🔊</button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>
                    Audio für diesen Teil · {pc}/{teil.maxPlays} gehört
                  </div>
                  {scriptVisible && (
                    <div className="lst-dialog-script">{teil.audioScript}</div>
                  )}
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 10.5, padding: '3px 10px', marginTop: 3 }}
                    onClick={() => toggleScript(sharedKey)}
                  >
                    {scriptVisible ? '▲ Skript verbergen' : '▼ Skript lesen'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* TF statements (shared-audio teils) */}
          {teil.type === 'tf' && dialogItems.map((dialog, dIdx) => {
            const d = dialog as TFDialog;
            const ans = getAnswer(exam.id, teil.num, dIdx);
            const isAnswered = ans !== undefined;
            const isCorrect = isAnswered && ans === d.correct;
            return (
              <div key={dIdx} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: dIdx < dialogItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.5 }}>
                  {dIdx + 1}. {d.statement}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([true, false] as const).map(val => {
                    const isSelected = ans === val;
                    const isGoodAnswer = isAnswered && val === d.correct;
                    const isWrong = isAnswered && isSelected && !isGoodAnswer;
                    return (
                      <button
                        key={String(val)}
                        className={`lst-tf-btn${isGoodAnswer ? ' correct' : isWrong ? ' incorrect' : isSelected ? ' selected' : ''}`}
                        disabled={isAnswered}
                        onClick={() => setAnswer(exam.id, teil.num, dIdx, val)}
                      >
                        {val ? 'Richtig' : 'Falsch'}
                      </button>
                    );
                  })}
                </div>
                {isAnswered && (
                  <div className="lst-ans-badge" style={{
                    background: isCorrect ? 'var(--green-bg)' : 'var(--red-bg)',
                    color: isCorrect ? 'var(--green)' : 'var(--red)',
                    marginTop: 7,
                  }}>
                    {isCorrect ? '✓ Richtig!' : `✗ Falsch — Richtige Antwort: ${d.correct ? 'Richtig' : 'Falsch'}`}
                  </div>
                )}
              </div>
            );
          })}

          {/* MC questions with shared audio (A2/B1 teil 2 "questions" format) */}
          {teil.type === 'mc' && questionItems.length > 0 && questionItems.map((q, qIdx) => {
            const ans = getAnswer(exam.id, teil.num, qIdx);
            const isAnswered = ans !== undefined;
            const isCorrect = isAnswered && ans === q.a;
            return (
              <div key={qIdx} className="ub-q" style={{ margin: '0 0 12px', boxShadow: 'none', border: '1px solid var(--border2)', borderRadius: 8 }}>
                <div className="ub-q-num">Frage {qIdx + 1}</div>
                <div className="ub-q-text">{q.q}</div>
                <div className="ub-q-opts">
                  {q.opts.map((opt, oIdx) => {
                    const isSelected = ans === oIdx;
                    const isGoodAnswer = isAnswered && oIdx === q.a;
                    const isWrong = isAnswered && isSelected && !isGoodAnswer;
                    return (
                      <button
                        key={oIdx}
                        className={`ub-q-opt${isGoodAnswer ? ' correct' : isWrong ? ' incorrect' : isSelected ? ' selected' : ''}`}
                        disabled={isAnswered}
                        onClick={() => setAnswer(exam.id, teil.num, qIdx, oIdx)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {isAnswered && (
                  <div className="ub-q-exp">
                    {isCorrect ? '✓ Richtig!' : `✗ Richtige Antwort: ${q.opts[q.a]}`}
                  </div>
                )}
              </div>
            );
          })}

          {/* MC dialogs with per-dialog audio (A1 style) */}
          {teil.type === 'mc' && dialogItems.length > 0 && dialogItems.map((dialog, dIdx) => {
            const d = dialog as MCQDialog;
            const ans = getAnswer(exam.id, teil.num, dIdx);
            const isAnswered = ans !== undefined;
            const pc = playCount(exam.id, teil.num, dIdx);
            const canPlay = pc < teil.maxPlays;
            const scriptKey = `${exam.id}-${teil.num}-${dIdx}`;
            const scriptVisible = showScript[scriptKey];
            const isCorrect = isAnswered && ans === d.a;

            return (
              <div key={dIdx} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: dIdx < dialogItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                  <button
                    onClick={() => incrementPlay(exam.id, teil.num, dIdx, d.script ?? '', teil.maxPlays)}
                    disabled={!canPlay}
                    title={canPlay ? `Anhören (${pc + 1}/${teil.maxPlays})` : 'Maximale Wiedergaben erreicht'}
                    style={{
                      flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--blue-bd)',
                      background: canPlay ? '#fff' : 'var(--bg2)', color: canPlay ? 'var(--blue)' : 'var(--muted)',
                      cursor: canPlay ? 'pointer' : 'not-allowed', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}
                  >🔊</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>
                      Frage {dIdx + 1} · {pc}/{teil.maxPlays} gehört
                    </div>
                    {scriptVisible && d.script && (
                      <div className="lst-dialog-script">{d.script}</div>
                    )}
                    {d.script && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: 10.5, padding: '3px 10px', marginTop: 3 }}
                        onClick={() => toggleScript(scriptKey)}
                      >
                        {scriptVisible ? '▲ Skript verbergen' : '▼ Skript lesen'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="ub-q" style={{ margin: 0, boxShadow: 'none', border: '1px solid var(--border2)', borderRadius: 8 }}>
                  <div className="ub-q-text">{d.q}</div>
                  <div className="ub-q-opts">
                    {d.opts.map((opt, oIdx) => {
                      const isSelected = ans === oIdx;
                      const isGoodAnswer = isAnswered && oIdx === d.a;
                      const isWrong = isAnswered && isSelected && !isGoodAnswer;
                      return (
                        <button
                          key={oIdx}
                          className={`ub-q-opt${isGoodAnswer ? ' correct' : isWrong ? ' incorrect' : isSelected ? ' selected' : ''}`}
                          disabled={isAnswered}
                          onClick={() => setAnswer(exam.id, teil.num, dIdx, oIdx)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {isAnswered && (
                    <div className="ub-q-exp">
                      {isCorrect ? '✓ Richtig!' : `✗ Richtige Antwort: ${d.opts[d.a]}`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        );
      })}

      {/* Score summary */}
      {answered > 0 && (
        <div className="ub-result">
          <div className="ub-result-score">{correct} / {totalQ}</div>
          <div className="ub-result-text">
            {correct === totalQ ? '🎉 Perfekt! Alle Fragen richtig.' : `${answered} von ${totalQ} Fragen beantwortet`}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Basic listening pane ── */
function BasicPane({
  item, answers, setAnswers, checked, setChecked,
}: {
  item: ListenItem;
  answers: Record<number, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [scriptOpen, setScriptOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [dictation, setDictation] = useState(false);

  const doSpeak = () => {
    setSpeaking(true);
    speakDE(item.audioScript, 0.82, { onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  const score = item.questions.reduce((acc, q, i) => acc + (answers[i] === q.a ? 1 : 0), 0);
  const allAnswered = item.questions.length > 0 && Object.keys(answers).length === item.questions.length;

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span className={`lvl lvl-${item.level.toLowerCase()}`}>{item.level}</span>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{item.part}</span>
      </div>
      <div className="ub-prompt">
        <div className="ub-prompt-t">🎧 {item.title}</div>
        <div className="ub-prompt-s">{item.instructions}</div>
      </div>

      {/* Mode toggle: comprehension questions vs. dictation */}
      <div style={{ display: 'flex', gap: 8, margin: '14px 0 4px' }}>
        <button className={`chip${!dictation ? ' on' : ''}`} onClick={() => setDictation(false)}>❓ Fragen</button>
        <button className={`chip${dictation ? ' on' : ''}`} onClick={() => setDictation(true)}>📝 Diktat</button>
      </div>

      {dictation ? (
        <div className="ub-section">
          <div className="ub-section-h">📝 Diktat — tippe, was du hörst</div>
          <DictationPanel script={item.audioScript} />
        </div>
      ) : (<>
      {/* Audio player (TTS) */}
      <div className="ub-section">
        <div className="ub-section-h">Audio</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 16px', boxShadow: 'var(--sh)' }}>
          <button
            className={`speak-btn${speaking ? ' speaking' : ''}`}
            onClick={doSpeak}
            title="Audio abspielen"
            style={{ width: 42, height: 42, fontSize: 20 }}
          >🔊</button>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)' }}>
              {speaking ? '▶ Spielt ab…' : 'Audio abspielen (TTS)'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {Math.ceil(item.duration / 60)} Min · Deutsch
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ marginLeft: 'auto', fontSize: 11 }}
            onClick={() => setScriptOpen(s => !s)}
          >
            {scriptOpen ? '▲ Transkript' : '▼ Transkript'}
          </button>
        </div>
        {scriptOpen && (
          <div className="lst-dialog-script" style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.75 }}>
            {item.audioScript}
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="ub-section">
        <div className="ub-section-h">{item.questions.length} Verständnisfragen</div>
        {item.questions.map((q, qIdx) => {
          const ans = answers[qIdx];
          const answered = ans !== undefined;
          const isRight = answered && ans === q.a;
          const isWrong = answered && ans !== q.a;
          return (
            <div key={qIdx} className={`ub-q${answered ? ' graded' : ''}`} style={isRight ? { borderColor: 'var(--green-bd)', background: 'var(--green-bg)' } : isWrong ? { borderColor: 'var(--red-bd)', background: 'var(--red-bg)' } : {}}>
              <div className="ub-q-num">Frage {qIdx + 1}</div>
              <div className="ub-q-text">{q.q}</div>
              <div className="ub-q-opts">
                {q.opts.map((opt, oIdx) => {
                  const isSel = ans === oIdx;
                  const isGood = answered && oIdx === q.a;
                  const isBad = answered && isSel && !isGood;
                  return (
                    <button
                      key={oIdx}
                      className={`ub-q-opt${isGood ? ' correct' : isBad ? ' incorrect' : isSel ? ' selected' : ''}`}
                      disabled={answered}
                      onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                    >
                      <span style={{ fontWeight: 700, marginRight: 6, opacity: .6 }}>{String.fromCharCode(65 + oIdx)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div className="ub-q-exp">
                  {isRight ? '✓ Richtig! ' : '✗ Falsch. '}{q.exp}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final score */}
      {allAnswered && (
        <div className="ub-result">
          <div className="ub-result-score">{score} / {item.questions.length}</div>
          <div className="ub-result-text">
            {score === item.questions.length ? '🎉 Perfekt! Alle Antworten richtig!' : `${score} von ${item.questions.length} Fragen richtig`}
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
