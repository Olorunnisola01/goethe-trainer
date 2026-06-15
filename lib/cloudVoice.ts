/* ──────────────────────────────────────────────────────────────────────────
   cloudVoice.ts — Local Web Speech API TTS (germanVoice.ts) wrapped behind
   the same handle-based API the components already use.

     speak(text, { lang, voice, rate, onStart, onEnd, onError }) → handle
     speakDE(text, rate?, opts?)      → German (best on-device voice)
     speakEN(text, rate?, opts?)      → English (best on-device voice)
     speakDEMale(text, rate?, opts?)  → German, distinct "male" voice for
                                         Konversation dialogue when available
     speakAwait(text, opts?)          → Promise that resolves on end/error
     stopAll()                        → stop whatever is currently playing
     pauseSpeaking() / resumeSpeaking()
   ────────────────────────────────────────────────────────────────────────── */

import { applyGermanVoice, applyEnglishVoice, getGermanVoicePair } from './germanVoice';
import { isNative, nativeSpeak, nativeStop } from './nativeTts';

export {
  warmUpVoices,
  warmUpEnglishVoice,
  waitForGermanVoice,
  getGermanVoicePair,
  getGermanVoice,
  getEnglishVoice,
} from './germanVoice';

export type SpeakLang = 'de' | 'en';
export type SpeakVoiceGender = 'female' | 'male';

export interface SpeakOptions {
  lang?: SpeakLang;
  voice?: SpeakVoiceGender;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
}

export interface SpeakHandle {
  stop(): void;
  pause(): void;
  resume(): void;
}

/* ── Global "now playing" tracking ───────────────────────────────────────── */

let _activeHandle: SpeakHandle | null = null;

/** Stop whatever is currently playing. */
export function stopAll(): void {
  if (_activeHandle) {
    _activeHandle.stop();
    return;
  }
  if (isNative()) {
    nativeStop();
    return;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  }
}

/** Pause the currently playing utterance. */
export function pauseSpeaking(): void {
  _activeHandle?.pause();
}

/** Resume previously paused playback. */
export function resumeSpeaking(): void {
  _activeHandle?.resume();
}

/* ── Core speak() ─────────────────────────────────────────────────────────── */

/**
 * Speak `text` using the best available on-device Web Speech voice.
 * Cancels any currently-playing speech first.
 */
export function speak(text: string, opts: SpeakOptions = {}): SpeakHandle {
  const lang: SpeakLang = opts.lang ?? 'de';
  const voiceGender: SpeakVoiceGender = opts.voice ?? 'female';
  const rate = opts.rate ?? (lang === 'de' ? 0.9 : 0.92);

  stopAll();

  let stopped = false;
  let settled = false;

  const settle = () => {
    if (settled) return;
    settled = true;
    if (_activeHandle === handle) _activeHandle = null;
    opts.onEnd?.();
  };

  const handle: SpeakHandle = {
    stop() {
      stopped = true;
      if (isNative()) {
        nativeStop();
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
      }
      settle();
    },
    pause() {
      if (isNative()) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.pause(); } catch { /* ignore */ }
      }
    },
    resume() {
      if (isNative()) return;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.resume(); } catch { /* ignore */ }
      }
    },
  };

  _activeHandle = handle;

  if (isNative()) {
    opts.onStart?.();
    nativeSpeak(text, lang, rate)
      .then(() => { if (!stopped) settle(); })
      .catch(() => { if (!stopped) { opts.onError?.(); settle(); } });
    return handle;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    opts.onError?.();
    settle();
    return handle;
  }
  if (stopped) return handle;

  const utt = new SpeechSynthesisUtterance(text);
  if (lang === 'de') {
    applyGermanVoice(utt, rate);
    if (voiceGender === 'male') {
      const { male } = getGermanVoicePair();
      if (male) utt.voice = male;
      else utt.pitch = 0.82; // pitch-shift the female voice for a distinct dialogue speaker
    }
  } else {
    applyEnglishVoice(utt, rate);
  }
  utt.onstart = () => opts.onStart?.();
  utt.onend = () => settle();
  utt.onerror = () => { opts.onError?.(); settle(); };
  window.speechSynthesis.speak(utt);

  return handle;
}

/** German voice. Mirrors the old `speakDE(text, rate)` signature. */
export function speakDE(text: string, rate = 0.9, opts: Omit<SpeakOptions, 'lang' | 'voice' | 'rate'> = {}): SpeakHandle {
  return speak(text, { ...opts, lang: 'de', voice: 'female', rate });
}

/** English voice. Mirrors the old `speakEN(text, rate)` signature. */
export function speakEN(text: string, rate = 0.92, opts: Omit<SpeakOptions, 'lang' | 'voice' | 'rate'> = {}): SpeakHandle {
  return speak(text, { ...opts, lang: 'en', voice: 'female', rate });
}

/** German voice, second speaker — used for the other side of Konversation dialogues. */
export function speakDEMale(text: string, rate = 0.9, opts: Omit<SpeakOptions, 'lang' | 'voice' | 'rate'> = {}): SpeakHandle {
  return speak(text, { ...opts, lang: 'de', voice: 'male', rate });
}

/**
 * Speak `text` and resolve once playback ends (or errors / a generous safety
 * timeout elapses). For sequential/playlist-style playback that previously
 * awaited `utt.onend`.
 */
export function speakAwait(text: string, opts: SpeakOptions = {}): Promise<void> {
  return new Promise(resolve => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    speak(text, {
      ...opts,
      onEnd: () => { opts.onEnd?.(); finish(); },
      onError: (e) => { opts.onError?.(e); finish(); },
    });
    // Safety net: never block forever even if no event fires.
    const safetyMs = Math.max(8000, text.length * 180);
    setTimeout(finish, safetyMs);
  });
}
