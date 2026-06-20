'use client';

/* Registers the offline service worker (production only). Failures are silent —
   the app works identically without it. */

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    const onLoad = () => { navigator.serviceWorker.register('/sw.js').catch(() => { /* ignore */ }); };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
  }, []);
  return null;
}
