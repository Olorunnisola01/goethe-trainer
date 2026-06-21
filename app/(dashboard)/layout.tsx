'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthModal } from '@/components/auth/AuthModal';
import { AiTutor } from '@/components/ai/AiTutor';
import { OnboardingModal } from '@/components/gamification/OnboardingModal';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { PageTransition } from '@/components/layout/PageTransition';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">

      {/* Mobile overlay — dims page when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 49,
          }}
        />
      )}

      {/* Mobile topbar — fixed at top, only visible on mobile */}
      <div className="mobile-topbar">
        <button
          type="button"
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            width: 40, height: 40, borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 5, cursor: 'pointer', flexShrink: 0,
          }}
          aria-label="Menü öffnen"
        >
          <span style={{ width: 18, height: 2, background: 'var(--ink2)', borderRadius: 2, display: 'block' }} />
          <span style={{ width: 18, height: 2, background: 'var(--ink2)', borderRadius: 2, display: 'block' }} />
          <span style={{ width: 18, height: 2, background: 'var(--ink2)', borderRadius: 2, display: 'block' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🇩🇪</span>
          <div style={{ fontFamily: 'var(--font-lora, Lora), serif', fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>
            Deutsch Lernen
          </div>
        </div>
      </div>

      <Sidebar
        onAuthRequired={() => setAuthOpen(true)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="dashboard-main flex-1 flex flex-col min-h-screen" style={{ minWidth: 0 }}>
        <PageTransition>{children}</PageTransition>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <AiTutor />
      <OnboardingModal />
      <GlobalSearch />
    </div>
  );
}
