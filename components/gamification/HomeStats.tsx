'use client';

/* Home dashboard strip: daily streak · XP + rank progress · daily-goal ring. */
import Link from 'next/link';
import { useGame } from '@/context/GamificationContext';
import { rankForXp } from '@/lib/gamification';
import { GoalRing } from './GoalRing';

export function HomeStats() {
  const { state, ready } = useGame();
  if (!ready) return null;

  const { rank, next, intoLevel, levelSpan } = rankForXp(state.xp);
  const xpPct = next ? Math.round((intoLevel / levelSpan) * 100) : 100;

  return (
    <div className="stat-strip">
      {/* Streak */}
      <div className="stat-card">
        <span className="stat-emoji">{state.streak > 0 ? '🔥' : '🌙'}</span>
        <div style={{ minWidth: 0 }}>
          <div className="stat-num">{state.streak}</div>
          <div className="stat-lbl">Tage in Folge</div>
          {state.bestStreak > 0 && (
            <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>Rekord: {state.bestStreak}</div>
          )}
        </div>
      </div>

      {/* XP + rank */}
      <Link href="/fortschritt" className="stat-card" style={{ textDecoration: 'none', flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="stat-emoji">{rank.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div className="stat-num">{state.xp.toLocaleString('de-DE')}</div>
            <div className="stat-lbl">XP · {rank.name}</div>
          </div>
        </div>
        <div className="xp-track"><div className="xp-fill" style={{ width: `${xpPct}%` }} /></div>
        <div style={{ fontSize: 10, color: 'var(--muted)' }}>
          {next ? `Noch ${(next.min - state.xp).toLocaleString('de-DE')} XP bis ${next.name}` : 'Höchste Stufe erreicht 👑'}
        </div>
      </Link>

      {/* Daily goal */}
      <div className="stat-card">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <GoalRing value={state.todayCount} max={state.dailyGoal} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>
            {state.todayCount}/{state.dailyGoal}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="stat-lbl" style={{ marginTop: 0 }}>Tagesziel</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink2)', fontWeight: 600, marginTop: 3 }}>
            {state.todayCount >= state.dailyGoal ? '✅ Geschafft!' : `${state.dailyGoal - state.todayCount} übrig`}
          </div>
        </div>
      </div>
    </div>
  );
}
