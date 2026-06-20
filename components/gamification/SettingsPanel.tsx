'use client';

/* Settings: colour theme · font size · daily goal. Lives on the Fortschritt page. */
import { useSettings, Theme, FontScale } from '@/context/SettingsContext';
import { useGame } from '@/context/GamificationContext';
import { Card } from '@/components/ui/Card';

export function SettingsPanel() {
  const { theme, fontScale, setTheme, setFontScale } = useSettings();
  const { state, setDailyGoal } = useGame();

  const themes: { v: Theme; label: string; icon: string }[] = [
    { v: 'light', label: 'Hell', icon: '☀️' },
    { v: 'dark', label: 'Dunkel', icon: '🌙' },
    { v: 'system', label: 'Auto', icon: '💻' },
  ];
  const fonts: { v: FontScale; label: string }[] = [
    { v: 'sm', label: 'A−' }, { v: 'md', label: 'A' }, { v: 'lg', label: 'A+' },
  ];
  const goals = [5, 10, 15, 20, 30];

  return (
    <Card className="mb-6">
      <div className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>⚙️ Einstellungen</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>🎨 Erscheinungsbild</span>
          <div className="seg">
            {themes.map(t => (
              <button key={t.v} className={theme === t.v ? 'on' : ''} onClick={() => setTheme(t.v)}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>🔠 Schriftgröße</span>
          <div className="seg">
            {fonts.map(f => (
              <button key={f.v} className={fontScale === f.v ? 'on' : ''} onClick={() => setFontScale(f.v)} style={{ fontSize: f.v === 'sm' ? 12 : f.v === 'lg' ? 17 : 14 }}>{f.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>🎯 Tagesziel (Übungen)</span>
          <div className="seg">
            {goals.map(g => (
              <button key={g} className={state.dailyGoal === g ? 'on' : ''} onClick={() => setDailyGoal(g)}>{g}</button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
