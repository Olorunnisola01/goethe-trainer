'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useT } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  redirectMessage?: string;
}

export function AuthModal({ open, onClose, redirectMessage }: AuthModalProps) {
  const { signInWithGoogle, signInEmail, registerEmail, loading, error, clearError } = useAuth();
  const { t: tr } = useT();
  const [tab, setTab]         = useState<'login' | 'register'>('login');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [submitting, setSub]  = useState(false);
  const emailRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { clearError(); setTimeout(() => emailRef.current?.focus(), 50); }
  }, [open, clearError]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const handleEmail = async () => {
    if (!email.trim() || !password.trim()) return;
    setSub(true);
    if (tab === 'login') await signInEmail(email, password);
    else await registerEmail(email, password);
    setSub(false);
    if (!error) onClose();
  };

  const handleGoogle = async () => {
    setSub(true);
    await signInWithGoogle();
    setSub(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-6 py-5 text-white">
          <div className="text-2xl mb-1">🇩🇪</div>
          <h2 className="text-lg font-bold">Deutsch Trainer</h2>
          <p className="text-blue-200 text-sm mt-0.5">
            {redirectMessage ?? tr('auth.subtitle')}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200">
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); clearError(); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'login' ? tr('auth.login') : tr('auth.register')}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-3">
          <Button variant="secondary" onClick={handleGoogle} loading={submitting && !error} className="w-full">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {tr('auth.google')}
          </Button>

          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <div className="flex-1 h-px bg-gray-200"/>
            <span>{tr('auth.orEmail')}</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          {/* Email inputs */}
          <input
            ref={emailRef}
            type="email"
            placeholder={tr('auth.email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50"
          />
          <input
            type="password"
            placeholder={tr('auth.password')}
            value={password}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-gray-50"
          />

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button onClick={handleEmail} loading={submitting} className="w-full mt-1">
            {tab === 'login' ? tr('auth.login') : tr('auth.createAccount')}
          </Button>

          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 text-center mt-1">
            {tr('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
