'use client';

/* UI language (de/en) for the app chrome. Persisted per device in localStorage.
   Learning content stays German — see lib/i18n.ts. */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Lang, translate } from '@/lib/i18n';

interface LanguageValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<LanguageValue | null>(null);
const LS = 'dl_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('de');

  useEffect(() => {
    const saved = localStorage.getItem(LS) as Lang | null;
    if (saved === 'de' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LS, l); } catch { /* ignore */ }
    if (typeof document !== 'undefined') document.documentElement.setAttribute('lang', l);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useT() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useT must be used within LanguageProvider');
  return ctx;
}
