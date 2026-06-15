'use client';

import { useState, useRef, useEffect } from 'react';

/* ─── Reusable draggable-width sidebar (desktop) ───────────────
   Mirrors the Vokabeln A1 sidebar: a flexible, drag-to-resize left column.
   Returns the current width, the inline style for the <aside>, and a ready-made
   drag-handle element to drop between the sidebar and the content. */
export function useResizableSidebar(initial = 230, min = 170, max = 440, initialCollapsed = true) {
  const [width, setWidth] = useState(initial);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const dragRef = useRef<{ active: boolean; startX: number; startW: number }>({ active: false, startX: 0, startW: initial });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      const { startX, startW } = dragRef.current;
      setWidth(Math.max(min, Math.min(max, startW + (e.clientX - startX))));
    };
    const onUp = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [min, max]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    dragRef.current = { active: true, startX: e.clientX, startW: width };
  };

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const asideStyle: React.CSSProperties = collapsed
    ? { width: 0, flexShrink: 0, overflow: 'hidden' }
    : { width, flexShrink: 0, minWidth: min, maxWidth: max };

  const DragHandle = () => {
    if (collapsed) return null;
    return (
      <div
        onMouseDown={startDrag}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-bd)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--border)')}
        title="Drag to resize"
        style={{ width: 5, flexShrink: 0, cursor: 'col-resize', background: 'var(--border)', transition: 'background .15s', zIndex: 5 }}
      />
    );
  };

  // Nice compact toggle button (chevron style)
  const SidebarToggle = () => (
    <button
      onClick={toggleCollapsed}
      style={{
        padding: '3px 7px',
        fontSize: 13,
        fontWeight: 600,
        border: '1px solid var(--border)',
        borderRadius: 6,
        background: 'var(--bg)',
        color: 'var(--ink2)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        lineHeight: 1,
      }}
      title={collapsed ? 'Show Filters' : 'Hide Filters'}
    >
      {collapsed ? '☰' : '⟨'} {collapsed ? 'Show Filters' : 'Hide Filters'}
    </button>
  );

  return { width, asideStyle, DragHandle, collapsed, toggleCollapsed, SidebarToggle };
}
