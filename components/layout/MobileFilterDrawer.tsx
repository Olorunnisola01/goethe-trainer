'use client';

import { useState, useEffect, ReactNode } from 'react';

/* ── Hook ── */
export function useMobileFilter() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return { filterOpen, setFilterOpen, isMobile };
}

/* ── Toggle button ── */
export function FilterToggleButton({ onClick, label = '⚙ Filter' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 8,
        border: '1.5px solid var(--blue-bd)', background: 'var(--blue-bg)',
        color: 'var(--blue)', fontSize: 12, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

/* ── Drawer ── */
export function MobileFilterDrawer({
  open,
  onClose,
  title = 'Filter',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 198 }}
        />
      )}
      {/* Sliding drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: open ? 0 : -240,
          height: '100vh',
          width: 228,
          zIndex: 199,
          transition: 'left .25s cubic-bezier(.4,0,.2,1)',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          overflowX: 'hidden',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
        }}
      >
        {/* Drawer header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 10px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg2)',
          position: 'sticky', top: 0, zIndex: 2,
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            ⚙ {title}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7,
              border: '1px solid var(--border)', background: 'var(--bg)',
              cursor: 'pointer', fontSize: 13, fontWeight: 700,
              color: 'var(--ink2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >✕</button>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {children}
        </div>
      </div>
    </>
  );
}
