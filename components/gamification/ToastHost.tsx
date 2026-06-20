'use client';

/* Floating reward toasts (XP / achievements / goal / rank-up). Driven by
   GamificationContext. Bottom-centre on mobile, bottom-right on desktop. */

import { useGame } from '@/context/GamificationContext';

export function ToastHost() {
  const { toasts, dismissToast } = useGame();
  if (!toasts.length) return null;
  return (
    <div className="toast-host">
      {toasts.map(t => (
        <button key={t.id} className={`toast toast-${t.kind}`} onClick={() => dismissToast(t.id)}>
          <span className="toast-ico" aria-hidden>{t.icon}</span>
          <span className="toast-body">
            <span className="toast-title">{t.title}</span>
            {t.sub && <span className="toast-sub">{t.sub}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
