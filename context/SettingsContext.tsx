'use client';

/* ──────────────────────────────────────────────────────────────────────────
   SettingsContext — per-device UI preferences: colour theme + font scale.

   Applied to <html> via data-theme / data-font attributes (see globals.css).
   An inline script in app/layout.tsx applies the saved values before first
   paint to avoid a flash. Stored in localStorage (device-local by design).
   ────────────────────────────────────────────────────────────────────────── */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type FontScale = 'sm' | 'md' | 'lg';

interface SettingsValue {
  theme: Theme;
  fontScale: FontScale;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  setFontScale: (f: FontScale) => void;
}

const Ctx = createContext<SettingsValue | null>(null);
const LS_THEME = 'dl_theme';
const LS_FONT = 'dl_font';

function systemDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}
function apply(theme: Theme, font: FontScale) {
  if (typeof document === 'undefined') return;
  const resolved = theme === 'system' ? (systemDark() ? 'dark' : 'light') : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-font', font);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [fontScale, setFontState] = useState<FontScale>('md');
  const [resolvedTheme, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const t = (localStorage.getItem(LS_THEME) as Theme) || 'system';
    const f = (localStorage.getItem(LS_FONT) as FontScale) || 'md';
    setThemeState(t); setFontState(f);
    apply(t, f);
    setResolved(t === 'system' ? (systemDark() ? 'dark' : 'light') : t);
  }, []);

  // Track OS theme changes while on "system"
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { apply('system', fontScale); setResolved(systemDark() ? 'dark' : 'light'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, fontScale]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem(LS_THEME, t);
    apply(t, (localStorage.getItem(LS_FONT) as FontScale) || 'md');
    setResolved(t === 'system' ? (systemDark() ? 'dark' : 'light') : t);
  }, []);

  const setFontScale = useCallback((f: FontScale) => {
    setFontState(f);
    localStorage.setItem(LS_FONT, f);
    apply((localStorage.getItem(LS_THEME) as Theme) || 'system', f);
  }, []);

  return (
    <Ctx.Provider value={{ theme, fontScale, resolvedTheme, setTheme, setFontScale }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
