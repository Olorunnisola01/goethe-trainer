'use client';

/* First-run onboarding: pick CEFR level, interests, and a daily goal.
   Shown once per user (after sign-in) until completed. */

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GamificationContext';
import { useT } from '@/context/LanguageContext';

const LEVELS = [
  { v: 'A1', labelKey: 'onb.lvl.A1', icon: '🌱' },
  { v: 'A2', labelKey: 'onb.lvl.A2', icon: '📗' },
  { v: 'B1', labelKey: 'onb.lvl.B1', icon: '📘' },
  { v: 'B2', labelKey: 'onb.lvl.B2', icon: '🎓' },
];
const INTERESTS = ['Alltag', 'Reisen', 'Beruf', 'Familie', 'Essen', 'Gesundheit', 'Technik', 'Kultur', 'Natur', 'Sport'];
const GOALS = [5, 10, 15, 20];

export function OnboardingModal() {
  const { user } = useAuth();
  const { state, ready, completeOnboarding } = useGame();
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [cefr, setCefr] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState(10);

  if (!user || !ready || state.onboarded) return null;

  const toggle = (i: string) => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const finish = () => completeOnboarding(cefr, interests, goal);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--sh-lg)', border: '1px solid var(--border)' }}>
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #1d4ed8, #4c1d95)', color: '#fff' }}>
          <div style={{ fontSize: 26 }}>🇩🇪</div>
          <div style={{ fontFamily: 'var(--font-lora, Lora), serif', fontSize: 20, fontWeight: 800, marginTop: 4 }}>{t('onb.welcome')}</div>
          <div style={{ fontSize: 13, opacity: .85 }}>{t('onb.subtitle', { n: step + 1 })}</div>
        </div>

        <div style={{ padding: 24 }}>
          {step === 0 && (
            <>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 12 }}>{t('onb.levelQ')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LEVELS.map(l => (
                  <button key={l.v} onClick={() => setCefr(l.v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, textAlign: 'left',
                      border: `2px solid ${cefr === l.v ? 'var(--blue)' : 'var(--border)'}`,
                      background: cefr === l.v ? 'var(--blue-bg)' : 'var(--bg)', color: cefr === l.v ? 'var(--blue)' : 'var(--ink2)' }}>
                    <span style={{ fontSize: 20 }}>{l.icon}</span> {t(l.labelKey)}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>{t('onb.interestsQ')}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{t('onb.interestsHint')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {INTERESTS.map(i => (
                  <button key={i} onClick={() => toggle(i)}
                    style={{ padding: '8px 14px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                      border: `1.5px solid ${interests.includes(i) ? 'var(--blue)' : 'var(--border)'}`,
                      background: interests.includes(i) ? 'var(--blue-bg)' : 'var(--bg)', color: interests.includes(i) ? 'var(--blue)' : 'var(--ink2)' }}>
                    {interests.includes(i) ? '✓ ' : ''}{i}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 4 }}>{t('onb.goalQ')}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{t('onb.goalHint')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {GOALS.map(g => (
                  <button key={g} onClick={() => setGoal(g)}
                    style={{ padding: '16px 0', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                      border: `2px solid ${goal === g ? 'var(--green)' : 'var(--border)'}`,
                      background: goal === g ? 'var(--green-bg)' : 'var(--bg)', color: goal === g ? 'var(--green)' : 'var(--ink2)' }}>
                    <div style={{ fontSize: 24 }}>{g}</div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{t('onb.exercises')}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ padding: '11px 18px', borderRadius: 11, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--ink2)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{t('common.back')}</button>
            )}
            <button onClick={() => { if (step < 2) setStep(s => s + 1); else finish(); }}
              disabled={step === 0 && !cefr}
              style={{ flex: 1, padding: '11px 0', borderRadius: 11, border: 'none', fontWeight: 700, fontSize: 14, cursor: step === 0 && !cefr ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                background: step === 0 && !cefr ? 'var(--bg3)' : 'var(--blue)', color: step === 0 && !cefr ? 'var(--muted)' : '#fff' }}>
              {step < 2 ? t('onb.next') : t('onb.start')}
            </button>
          </div>
          <button onClick={finish} style={{ width: '100%', marginTop: 10, fontSize: 11.5, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t('onb.skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
