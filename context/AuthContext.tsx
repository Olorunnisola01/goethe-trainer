'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  AuthError,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleAuthError = (e: unknown) => {
    const code = (e as AuthError)?.code ?? '';
    const msgs: Record<string, string> = {
      'auth/user-not-found':       'Kein Konto mit dieser E-Mail gefunden.',
      'auth/wrong-password':       'Falsches Passwort.',
      'auth/email-already-in-use': 'Diese E-Mail ist bereits registriert.',
      'auth/weak-password':        'Passwort muss mindestens 6 Zeichen haben.',
      'auth/invalid-email':        'Ungültige E-Mail-Adresse.',
      'auth/popup-closed-by-user': 'Anmeldung abgebrochen.',
      'auth/too-many-requests':    'Zu viele Versuche. Bitte warte kurz.',
    };
    setError(msgs[code] ?? 'Fehler bei der Anmeldung. Bitte versuche es erneut.');
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) { handleAuthError(e); }
  };

  const signInEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) { handleAuthError(e); }
  };

  const registerEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) { handleAuthError(e); }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, signInWithGoogle, signInEmail, registerEmail, signOut,
      error, clearError: () => setError(null),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
