'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/context/LanguageContext';

interface NavItem {
  href: string;
  labelKey: string;
  suffix?: string;       // appended after the translated label (e.g. " A1")
  icon: string;
  protected?: boolean;
  badge?: string;
}

const navGroups: { labelKey: string; items: NavItem[] }[] = [
  {
    labelKey: 'nav.group.overview',
    items: [
      { href: '/home',        labelKey: 'nav.home',       icon: '🏠' },
      { href: '/fortschritt', labelKey: 'nav.progress',   icon: '📊' },
      { href: '/favoriten',   labelKey: 'nav.favourites', icon: '⭐', protected: true },
      { href: '/notizen',     labelKey: 'nav.notes',      icon: '📓' },
    ],
  },
  {
    labelKey: 'nav.group.vocabGrammar',
    items: [
      { href: '/vocab/A1',          labelKey: 'nav.vocab', suffix: ' A1', icon: '📚', protected: true, badge: '720' },
      { href: '/vocab/A2',          labelKey: 'nav.vocab', suffix: ' A2', icon: '📚', protected: true, badge: '666' },
      { href: '/vocab/B1',          labelKey: 'nav.vocab', suffix: ' B1', icon: '📚', protected: true, badge: '1339' },
      { href: '/vocab/B2',          labelKey: 'nav.vocab', suffix: ' B2', icon: '📚', protected: true, badge: '2753' },
      { href: '/grammatik',         labelKey: 'nav.grammar',       icon: '🏗', protected: true },
      { href: '/konjugation',       labelKey: 'nav.conjugation',   icon: '🔡', protected: true, badge: '639' },
      { href: '/ueben/verb-quiz',    labelKey: 'nav.verbQuiz',      icon: '🔤', protected: true, badge: '6000' },
      { href: '/ueben/satzstellung', labelKey: 'nav.satzstellung',  icon: '🧩', protected: true, badge: '5000' },
    ],
  },
  {
    labelKey: 'nav.group.redemittel',
    items: [
      { href: '/redemittel/A1', labelKey: 'nav.redemittel', suffix: ' A1', icon: '💬', protected: true, badge: '134' },
      { href: '/redemittel/A2', labelKey: 'nav.redemittel', suffix: ' A2', icon: '💬', protected: true, badge: '247' },
      { href: '/redemittel/B1', labelKey: 'nav.redemittel', suffix: ' B1', icon: '💬', protected: true, badge: '265' },
      { href: '/redemittel/B2', labelKey: 'nav.redemittel', suffix: ' B2', icon: '💬', protected: true, badge: '80' },
    ],
  },
  {
    labelKey: 'nav.group.news',
    items: [
      { href: '/nachrichten', labelKey: 'nav.newsGerman', icon: '📰' },
    ],
  },
  {
    labelKey: 'nav.group.practice',
    items: [
      { href: '/pruefungsinfo',         labelKey: 'nav.examInfo',      icon: '📋' },
      { href: '/lernplan',              labelKey: 'nav.lernplan',      icon: '📅', protected: true },
      { href: '/ueben/karteikarten',    labelKey: 'nav.flashcards',    icon: '🃏', protected: true },
      { href: '/ueben/quiz',             labelKey: 'nav.vocabQuiz',     icon: '🎯', protected: true },
      { href: '/ueben/redemittel-quiz', labelKey: 'nav.redemittelQuiz', icon: '💬', protected: true },
      { href: '/ueben/grammatik-quiz',  labelKey: 'nav.grammarQuiz',   icon: '🏗', protected: true },
      { href: '/ueben/schreiben',       labelKey: 'nav.writing',       icon: '✍️', protected: true, badge: '200' },
      { href: '/ueben/lesen',           labelKey: 'nav.reading',       icon: '📖', protected: true, badge: '12' },
      { href: '/ueben/sprechen',        labelKey: 'nav.speaking',      icon: '🎙', protected: true },
      { href: '/ueben/hoeren',          labelKey: 'nav.listening',     icon: '🎧', protected: true },
      { href: '/ueben/konversation',    labelKey: 'nav.conversation',  icon: '💬', protected: true },
      { href: '/ueben/geschichten',     labelKey: 'nav.stories',       icon: '📚', protected: true, badge: '200' },
    ],
  },
];

interface SidebarProps {
  onAuthRequired?: () => void;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onAuthRequired, open, onClose }: SidebarProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useT();
  const pathname = usePathname();

  const handleProtectedClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.protected && !user) {
      e.preventDefault();
      onAuthRequired?.();
    }
    onClose?.();
  };

  return (
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`} style={{
      width: 256,
      flexShrink: 0,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      overflowY: 'auto',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ display: 'block', fontSize: 24, marginBottom: 4 }}>🇩🇪</span>
          <div style={{ fontFamily: 'var(--font-lora, Lora), serif', fontWeight: 700, color: 'var(--ink)', fontSize: 15, lineHeight: 1.3 }}>
            Deutsch Lernen
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.07em' }}>
            A1 · A2 · B1 · B2
          </div>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          type="button"
          onClick={onClose}
          className="sidebar-close-btn"
          aria-label="Menü schließen"
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg3)', color: 'var(--muted)', cursor: 'pointer',
            fontSize: 16, display: 'none', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit', flexShrink: 0,
          }}
        >✕</button>
      </div>

      {/* Global search trigger */}
      <div style={{ padding: '10px 12px 0' }}>
        <button
          type="button"
          onClick={() => { window.dispatchEvent(new CustomEvent('open-global-search')); onClose?.(); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5 }}
        >
          <span style={{ fontSize: 13 }}>🔍</span>
          <span style={{ flex: 1, textAlign: 'left' }}>{t('common.search')}</span>
          <kbd style={{ fontSize: 10, border: '1px solid var(--border)', borderRadius: 5, padding: '1px 5px' }}>⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {navGroups.map(group => (
          <div key={group.labelKey}>
            <div style={{ padding: '0 10px', marginBottom: 4, fontSize: 9.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              {t(group.labelKey)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {group.items.map(item => {
                const active = pathname === item.href || (item.href !== '/home' && item.href !== '/' && pathname.startsWith(item.href));
                // Don't flash the 🔒 while auth is still resolving (avoids the
                // logged-out → logged-in flicker for signed-in users).
                const locked = item.protected && !user && !authLoading;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleProtectedClick(e, item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      textDecoration: 'none',
                      background: active ? 'var(--blue)' : 'transparent',
                      color: active ? '#fff' : 'var(--ink2)',
                      transition: 'background .12s, color .12s',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: 13, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(item.labelKey)}{item.suffix ?? ''}</span>
                    {locked && <span style={{ fontSize: 10, opacity: 0.6 }}>🔒</span>}
                    {item.badge && !active && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 100, background: 'var(--bg3)', color: 'var(--muted)' }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User panel */}
      <div style={{ borderTop: '1px solid var(--border)', padding: 12 }}>
        {!user && authLoading ? (
          /* Neutral placeholder while Firebase auth resolves — prevents the
             login-button → user-panel flash on every app open. */
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: .6 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ height: 9, width: '70%', borderRadius: 4, background: 'var(--bg3)' }} />
              <div style={{ height: 8, width: '90%', borderRadius: 4, background: 'var(--bg3)' }} />
            </div>
          </div>
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
              {user.photoURL
                ? <img src={user.photoURL} alt={user.displayName ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : (user.displayName ?? user.email ?? '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName ?? user.email?.split('@')[0]}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
            <button
              onClick={signOut}
              style={{ flexShrink: 0, fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
              title={t('common.logout')}
            >
              {t('common.logout')}
            </button>
          </div>
        ) : (
          <button
            onClick={onAuthRequired}
            style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: 'var(--blue)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1e40af')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue)')}
          >
            {t('common.login')}
          </button>
        )}
        <div style={{ marginTop: 10, fontSize: 10, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
          A1 720 · A2 666 · B1 1339 · B2 2753<br/>
          532 Redemittel · 21 Grammatikkapitel
        </div>
      </div>
    </aside>
  );
}
