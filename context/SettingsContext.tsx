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

/* Dark theme has been retired — the app is always light. We keep the Theme API
   so existing callers compile, but every code path resolves to 'light'. */
function apply(_theme: Theme, font: FontScale) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.setAttribute('data-font', font);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const theme: Theme = 'light';
  const [fontScale, setFontState] = useState<FontScale>('md');
  const resolvedTheme = 'light' as const;

  useEffect(() => {
    const f = (localStorage.getItem(LS_FONT) as FontScale) || 'md';
    setFontState(f);
    apply('light', f);
    // Clear any previously-saved dark/system preference.
    try { localStorage.setItem(LS_THEME, 'light'); } catch { /* ignore */ }
  }, []);

  // Theme is fixed to light; setTheme is a no-op kept for API compatibility.
  const setTheme = useCallback((_t: Theme) => { apply('light', (localStorage.getItem(LS_FONT) as FontScale) || 'md'); }, []);

  const setFontScale = useCallback((f: FontScale) => {
    setFontState(f);
    localStorage.setItem(LS_FONT, f);
    apply('light', f);
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
