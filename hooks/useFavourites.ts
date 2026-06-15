'use client';

import { useState, useEffect, useCallback } from 'react';
import { FavouriteItem } from '@/types';

function storageKey(uid: string) { return `dlfavs_${uid}`; }

export function useFavourites(uid: string | null) {
  const [favs, setFavs] = useState<FavouriteItem[]>([]);

  useEffect(() => {
    if (!uid) { setFavs([]); return; }
    try {
      const raw = localStorage.getItem(storageKey(uid));
      if (raw) setFavs(JSON.parse(raw));
    } catch { setFavs([]); }
  }, [uid]);

  const persist = useCallback((items: FavouriteItem[]) => {
    setFavs(items);
    if (!uid) return;
    try { localStorage.setItem(storageKey(uid), JSON.stringify(items)); } catch { /* ignore */ }
  }, [uid]);

  const add = useCallback((de: string, en: string, ex?: string) => {
    const id = de.trim().toLowerCase().replace(/\s+/g, '_');
    setFavs(prev => {
      if (prev.find(f => f.id === id)) return prev;
      const next = [...prev, { id, de: de.trim(), en: en.trim(), ex: ex?.trim(), addedAt: Date.now() }];
      if (uid) try { localStorage.setItem(storageKey(uid), JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [uid]);

  const remove = useCallback((id: string) => {
    setFavs(prev => {
      const next = prev.filter(f => f.id !== id);
      if (uid) try { localStorage.setItem(storageKey(uid), JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [uid]);

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const has = useCallback((de: string) => {
    const id = de.trim().toLowerCase().replace(/\s+/g, '_');
    return favs.some(f => f.id === id);
  }, [favs]);

  return { favs, add, remove, clear, has };
}
