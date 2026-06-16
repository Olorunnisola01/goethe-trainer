/* ──────────────────────────────────────────────────────────────────────────
   nativeTts.ts — Android TTS via a direct JavascriptInterface bridge.

   Web Speech API (`window.speechSynthesis`) is silent inside Capacitor's
   Android WebView — no voices ever load. We use window.AndroidTts, which is
   registered by TtsInterface.java in MainActivity.onCreate() via
   WebView.addJavascriptInterface(). This bypasses the Capacitor plugin bridge
   entirely and calls android.speech.tts.TextToSpeech directly.

   The @capacitor-community/text-to-speech plugin is kept as a fallback for
   any future iOS build where window.AndroidTts won't exist.
   ────────────────────────────────────────────────────────────────────────── */

export type NativeTtsLang = 'de' | 'en';

// window.AndroidTts is present only when running inside our APK.
function getAndroidTts(): { speak(t: string, l: string, r: number, id: string): void; stop(): void } | null {
  if (typeof window === 'undefined') return null;
  return (window as any).AndroidTts ?? null;
}

export function isNative(): boolean {
  if (getAndroidTts()) return true;
  // Fallback: Capacitor platform check (used when window.AndroidTts not yet injected)
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  return cap?.isNativePlatform?.() === true || cap?.getPlatform?.() === 'android';
}

// --- Promise bridge for AndroidTts callbacks ----------------------------------
let _cbId = 0;
const _cbs: Record<string, { resolve: () => void; reject: (e: Error) => void }> = {};

if (typeof window !== 'undefined') {
  (window as any)._ttsOnDone  = (id: string) => { _cbs[id]?.resolve();          delete _cbs[id]; };
  (window as any)._ttsOnError = (id: string) => { _cbs[id]?.reject(new Error('TTS error')); delete _cbs[id]; };
}
// ------------------------------------------------------------------------------

// Capacitor plugin: loaded lazily to avoid the SSR crash from its top-level `window` access.
const loadCapPlugin = () =>
  import('@capacitor-community/text-to-speech').then(m => m.TextToSpeech);

export async function nativeSpeak(text: string, lang: NativeTtsLang, rate = 1.0): Promise<void> {
  const androidTts = getAndroidTts();
  if (androidTts) {
    return new Promise<void>((resolve, reject) => {
      const id = 'tts_' + (++_cbId);
      _cbs[id] = { resolve, reject };
      androidTts.speak(text, lang === 'de' ? 'de-DE' : 'en-US', rate, id);
    });
  }
  // Fallback: Capacitor plugin (iOS / future platforms)
  const TTS = await loadCapPlugin();
  await TTS.speak({ text, lang: lang === 'de' ? 'de-DE' : 'en-US', rate, pitch: 1.0, volume: 1.0, category: 'ambient' });
}

export function nativeStop(): void {
  const androidTts = getAndroidTts();
  if (androidTts) { try { androidTts.stop(); } catch { /* ignore */ } return; }
  loadCapPlugin().then(TTS => TTS.stop()).catch(() => { /* ignore */ });
}
