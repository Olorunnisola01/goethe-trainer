'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { useGame } from '@/context/GamificationContext';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { SettingsPanel } from '@/components/gamification/SettingsPanel';
import { WeakWordsPanel } from '@/components/gamification/WeakWordsPanel';
import { ACHIEVEMENTS, rankForXp, activityWindow } from '@/lib/gamification';
import { clsx } from 'clsx';

function pct(a: number, b: number) { return b > 0 ? Math.round((a / b) * 100) : 0; }

function Section({ label, icon, value, total, weight }: { label: string; icon: string; value: number; total: number; weight: string }) {
  const p = pct(value, total);
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1">
          <div className="text-sm font-semibold" style={{ color: 'var(--ink2)' }}>{label}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>Gewichtung: {weight}</div>
        </div>
        <div className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{p}%</div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
        <div className={clsx('h-full rounded-full transition-all', p >= 80 ? 'bg-green-500' : p >= 60 ? 'bg-blue-500' : p >= 40 ? 'bg-amber-500' : 'bg-red-400')} style={{ width: `${p}%` }} />
      </div>
      <div className="text-xs" style={{ color: 'var(--muted)' }}>{value} / {total} richtig</div>
    </Card>
  );
}

/* 14-day activity bar chart (exercises per day) */
function ActivityChart({ days }: { days: { date: string; exercises: number; correct: number; total: number }[] }) {
  const max = Math.max(1, ...days.map(d => d.exercises));
  const fmt = (s: string) => { const d = new Date(s + 'T00:00:00'); return d.toLocaleDateString('de-DE', { weekday: 'narrow' }); };
  return (
    <div>
      <div className="chart-row">
        {days.map(d => (
          <div key={d.date} title={`${d.date}: ${d.exercises} Übungen, ${pct(d.correct, d.total)}% richtig`}
            className={`chart-bar${d.exercises === 0 ? ' empty' : ''}`}
            style={{ height: `${(d.exercises / max) * 100}%` }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
        {days.map(d => (
          <div key={d.date} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--muted)' }}>{fmt(d.date)}</div>
        ))}
      </div>
    </div>
  );
}

export function FortschrittClient() {
  const { user } = useAuth();
  const { progress, overall } = useProgress(user?.uid ?? null);
  const { state, ready } = useGame();

  const { rank, next, intoLevel, levelSpan } = rankForXp(state.xp);
  const xpPct = next ? Math.round((intoLevel / levelSpan) * 100) : 100;
  const days = useMemo(() => activityWindow(state, 14), [state]);
  const unlocked = state.achievements.length;

  return (
    <>
      <Topbar title="Mein Fortschritt" />
      <div className="flex-1 p-7" style={{ maxWidth: 880 }}>

        {/* Rank hero */}
        <div className="smooth-in mb-7 p-6 rounded-2xl text-white" style={{ background: 'linear-gradient(135deg, #1d4ed8, #4c1d95)' }}>
          <div className="flex items-center gap-5">
            <div style={{ fontSize: 52, lineHeight: 1, flexShrink: 0 }}>{rank.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, opacity: .8 }}>Deine Stufe</div>
              <div style={{ fontFamily: 'var(--font-lora, Lora), serif', fontSize: 28, fontWeight: 800 }}>{rank.name}</div>
              <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>{state.xp.toLocaleString('de-DE')} XP · Gesamtnote {overall}%</div>
              <div style={{ height: 7, borderRadius: 100, background: 'rgba(255,255,255,.2)', overflow: 'hidden', marginTop: 10 }}>
                <div style={{ height: '100%', borderRadius: 100, background: '#fff', width: `${xpPct}%`, transition: 'width .6s ease' }} />
              </div>
              <div style={{ fontSize: 11, opacity: .8, marginTop: 5 }}>
                {next ? `Noch ${(next.min - state.xp).toLocaleString('de-DE')} XP bis ${next.name}` : 'Höchste Stufe erreicht 👑'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="stat-strip" style={{ marginBottom: 24 }}>
          <div className="stat-card"><span className="stat-emoji">🔥</span><div><div className="stat-num">{state.streak}</div><div className="stat-lbl">Tage Streak</div></div></div>
          <div className="stat-card"><span className="stat-emoji">🏅</span><div><div className="stat-num">{unlocked}/{ACHIEVEMENTS.length}</div><div className="stat-lbl">Erfolge</div></div></div>
          <div className="stat-card"><span className="stat-emoji">✅</span><div><div className="stat-num">{state.totalCorrect}</div><div className="stat-lbl">Richtig gesamt</div></div></div>
        </div>

        {/* Activity chart */}
        <Card className="mb-6">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--ink)' }}>📈 Aktivität (14 Tage)</div>
          <ActivityChart days={days} />
        </Card>

        {/* Achievements */}
        <div className="mb-7">
          <div className="text-sm font-bold mb-3" style={{ color: 'var(--ink)' }}>🏅 Erfolge <span style={{ color: 'var(--muted)', fontWeight: 500 }}>· {unlocked} von {ACHIEVEMENTS.length}</span></div>
          <div className="ach-grid">
            {ACHIEVEMENTS.map(a => {
              const has = state.achievements.includes(a.id);
              return (
                <div key={a.id} className={`ach-card${has ? '' : ' locked'}`} title={a.desc}>
                  <span className="ach-ico">{has ? a.icon : '🔒'}</span>
                  <div className="ach-name">{a.name}</div>
                  <div className="ach-desc">{a.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak words */}
        <WeakWordsPanel />

        {/* Skill breakdown */}
        <div className="text-sm font-bold mb-3 mt-2" style={{ color: 'var(--ink)' }}>🎯 Genauigkeit nach Übungsart</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
          <Section label="Quiz"           icon="🎯" value={progress.quiz.correct}     total={progress.quiz.attempts}     weight="30%" />
          <Section label="Grammatik-Quiz" icon="🏗" value={progress.gramQuiz.correct}  total={progress.gramQuiz.attempts}  weight="25%" />
          <Section label="Karteikarten"   icon="🃏" value={progress.flash.known}       total={progress.flash.seen}         weight="20%" />
          <Section label="Schreiben"      icon="✍️" value={progress.write.correct}     total={progress.write.done}         weight="12%" />
          <Section label="Leseverstehen"  icon="📖" value={progress.read.correct}      total={progress.read.done}          weight="13%" />
        </div>

        {/* Settings */}
        <SettingsPanel />

        {!user && (
          <p className="mt-6 text-sm text-center" style={{ color: 'var(--muted)' }}>Melde dich an, um deinen Fortschritt dauerhaft auf allen Geräten zu speichern.</p>
        )}
        {!ready && null}
      </div>
    </>
  );
}
