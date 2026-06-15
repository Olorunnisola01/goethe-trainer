'use client';

import { useState } from 'react';
import { PronunciationPanel } from '@/components/pronunciation/PronunciationPanel';

interface TopbarProps {
  title: string;
  children?: React.ReactNode;
}

export function Topbar({ title, children }: TopbarProps) {
  const [pronOpen, setPronOpen] = useState(false);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255,255,255,.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-lora, Lora), serif',
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--ink)',
          flex: 1,
          margin: 0,
        }}>
          {title}
        </h1>
        {children}
        <button
          onClick={() => setPronOpen(true)}
          style={{
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: '1px solid var(--green-bd)',
            background: 'var(--green-bg)',
            color: 'var(--green)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all .15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--green)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--green-bg)';
            e.currentTarget.style.color = 'var(--green)';
          }}
        >
          🔊 Aussprache
        </button>
      </header>

      <PronunciationPanel open={pronOpen} onClose={() => setPronOpen(false)} />
    </>
  );
}
