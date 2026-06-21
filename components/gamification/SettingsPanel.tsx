'use client';

/* Settings: colour theme · font size · daily goal. Lives on the Fortschritt page. */
import { useSettings, FontScale, Theme } from '@/context/SettingsContext';
import { useGame } from '@/context/GamificationContext';
import { useT } from '@/context/LanguageContext';
import { Lang } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';

export function SettingsPanel() {
  const { theme, fontScale, setTheme, setFontScale } = useSettings();
  const { state, setDailyGoal } = useGame();
  const { t, lang, setLang } = useT();

  const langs: { v: Lang; label: string }[] = [
    { v: 'de', label: '🇩🇪 Deutsch' },
    { v: 'en', label: '🇬🇧 English' },
  ];
  const themes: { v: Theme; label: string; icon: string }[] = [
    { v: 'light', label: t('settings.light'), icon: '☀️' },
    { v: 'dark',  label: t('settings.dark'),  icon: '🌙' },
  ];
  const fonts: { v: FontScale; label: string }[] = [
    { v: 'sm', label: 'A−' }, { v: 'md', label: 'A' }, { v: 'lg', label: 'A+' },
  ];
  const goals = [5, 10, 15, 20, 30];

  return (
    <Card className="mb-6">
      <div className="text-sm font-bold mb-4" style={{ color: 'var(--ink)' }}>{t('settings.title')}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>{t('settings.language')}</span>
          <div className="seg">
            {langs.map(l => (
              <button key={l.v} className={lang === l.v ? 'on' : ''} onClick={() => setLang(l.v)}>{l.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>{t('settings.appearance')}</span>
          <div className="seg">
            {themes.map(th => (
              <button key={th.v} className={theme === th.v ? 'on' : ''} onClick={() => setTheme(th.v)}>{th.icon} {th.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>{t('settings.fontSize')}</span>
          <div className="seg">
            {fonts.map(f => (
              <button key={f.v} className={fontScale === f.v ? 'on' : ''} onClick={() => setFontScale(f.v)} style={{ fontSize: f.v === 'sm' ? 12 : f.v === 'lg' ? 17 : 14 }}>{f.label}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 600 }}>{t('settings.dailyGoal')}</span>
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
