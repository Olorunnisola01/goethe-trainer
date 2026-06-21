'use client';

/* ──────────────────────────────────────────────────────────────────────────
   SettingsContext — per-device UI preferences: colour theme + font scale.

   Applied to <html> via data-theme / data-font attributes (see globals.css).
   An inline script in app/layout.tsx applies the saved values before first
   paint to avoid a flash. Stored in localStorage (device-local by design).
   ────────────────────────────────────────────────────────────────────────── */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type Theme = 'light' | 'dark';   // white default, with a true dark mode
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

function apply(theme: Theme, font: FontScale) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
  document.documentElement.setAttribute('data-font', font);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');   // default = white theme
  const [fontScale, setFontState] = useState<FontScale>('md');

  useEffect(() => {
    const saved = localStorage.getItem(LS_THEME);
    const th: Theme = saved === 'dark' ? 'dark' : 'light';   // anything but explicit "dark" → light
    const f = (localStorage.getItem(LS_FONT) as FontScale) || 'md';
    setThemeState(th); setFontState(f);
    apply(th, f);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    const th: Theme = t === 'dark' ? 'dark' : 'light';
    setThemeState(th);
    try { localStorage.setItem(LS_THEME, th); } catch { /* ignore */ }
    apply(th, (localStorage.getItem(LS_FONT) as FontScale) || 'md');
  }, []);

  const setFontScale = useCallback((f: FontScale) => {
    setFontState(f);
    localStorage.setItem(LS_FONT, f);
    apply(theme, f);
  }, [theme]);

  return (
    <Ctx.Provider value={{ theme, fontScale, resolvedTheme: theme, setTheme, setFontScale }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
