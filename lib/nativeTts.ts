/* ──────────────────────────────────────────────────────────────────────────
   nativeTts.ts — Native Android TTS via @capacitor-community/text-to-speech.

   The Web Speech API (`window.speechSynthesis`) is unreliable/silent inside
   Capacitor's Android WebView (no voices ever load, `speak()` is a no-op).
   On native platforms we route speech through the device's native
   `android.speech.tts.TextToSpeech` engine instead.
   ────────────────────────────────────────────────────────────────────────── */

import { Capacitor } from '@capacitor/core';

export type NativeTtsLang = 'de' | 'en';

export function isNative(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

// The @capacitor-community/text-to-speech package touches `window` at module
// scope, which crashes Next.js SSR/prerendering. Load it lazily, client-side only.
const loadTts = () => import('@capacitor-community/text-to-speech').then(m => m.TextToSpeech);

/**
 * Speak `text` using the device's native TTS engine.
 * Resolves when playback finishes (or fails).
 */
export async function nativeSpeak(
  text: string,
  lang: NativeTtsLang,
  rate = 1.0,
): Promise<void> {
  const TextToSpeech = await loadTts();
  await TextToSpeech.speak({
    text,
    lang: lang === 'de' ? 'de-DE' : 'en-US',
    rate,
    pitch: 1.0,
    volume: 1.0,
    category: 'ambient',
  });
}

/** Stop any in-progress native speech. */
export function nativeStop(): void {
  loadTts().then(TextToSpeech => TextToSpeech.stop()).catch(() => { /* ignore */ });
}
