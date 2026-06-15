/* ──────────────────────────────────────────────────────────────────────────
   germanVoice.ts — High-quality TTS voice picker (German + English)

   PROBLEMS THIS SOLVES:
   1. getVoices() is empty right after page load — the first play would fall
      back to a robotic / wrong-language voice.
   2. On desktop the first German voice can be a low-quality local one even
      when a better online/neural voice is installed.
   3. On MOBILE (Edge/Chrome/Safari) the biggest issue: online/neural voices
      load LATE — 5-10 s after page load. The old code cached the first voice
      it found and never looked again, so mobile was permanently stuck with
      the weakest local voice.

   SOLUTIONS:
   • Upgrade-only cache: _deScore / _enScore track the best score seen so
     far. Every _pickBest*() call scans ALL voices and replaces the cached
     entry only when a HIGHER-scoring one appears — we always converge toward
     the best voice, never regress to a worse one.
   • Mobile online bonus (+35): On mobile, "online / natural / neural" voices
     score 35 points higher than on desktop because the gap between a mobile
     local voice and an online neural one is far larger.
   • Longer polling on mobile: 60 ticks × 250 ms = 15 s vs 20 × 250 = 5 s
     on desktop. Mobile Edge "Online (Natural)" voices can take 8-10 s to
     appear in getVoices().
   • Dummy-utterance wake-up: Some Android Chromium builds leave getVoices()
     empty until at least one speechSynthesis.speak() call is made.
     warmUpVoices() fires a zero-volume, instantly-cancelled utterance on
     mobile to trigger the system to populate the voice list.
   • speakDE() / speakEN(): convenience wrappers (cancel → create → apply →
     speak) so every component shares one code path and automatically picks
     up every quality improvement here.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Platform helper ──────────────────────────────────────────────────── */
function _isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /android|iphone|ipad|ipod|mobile|tablet/i.test(navigator.userAgent);
}

/**
 * Extra score added to cloud/online voices on mobile.
 * Local mobile voices are dramatically worse than local desktop voices,
 * so the premium tier matters much more there.
 */
const MOBILE_ONLINE_BONUS = 35;

/* ═══════════════════════════════════════════════════════════════════════
   GERMAN VOICE
   ═══════════════════════════════════════════════════════════════════════ */

function _scoreDE(v: SpeechSynthesisVoice): number {
  const lang = (v.lang || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  if (!lang.startsWith('de')) return -Infinity;

  let score = 0;

  // Locale: de-DE > bare "de" > de-AT / de-CH
  if (lang === 'de-de') score += 40;
  else if (lang === 'de') score += 20;
  else score += 10;

  const onB = _isMobile() ? MOBILE_ONLINE_BONUS : 0;

  // ── Tier 1 — best cloud / neural / online engines ──────────────────────
  // Examples: "Microsoft Katja Online (Natural)", Google WaveNet, Edge Neural
  if (/(natural|neural)/.test(name))                score += 60 + onB;
  if (/online/.test(name))                          score += 52 + onB;
  if (/(premium|enhanced)/.test(name))              score += 46 + onB;
  if (/wavenet|journey|studio|polyglot/.test(name)) score += 55 + onB;

  // ── Tier 2 — known-good named / engine family ──────────────────────────
  if (/google/.test(name))                                              score += 50; // Google Deutsch solid everywhere
  if (/(katja|conrad|amala|killian|louisa|seraphina)/.test(name))      score += 30; // Microsoft Windows/Edge
  if (/(anna|helena|markus|petra|viktor|martin|yannick)/.test(name))   score += 22; // Apple iOS/macOS
  if (/(hedda|stefan)/.test(name))                                      score += 18; // older Microsoft

  // ── Penalise low-quality engines ───────────────────────────────────────
  if (/(compact|espeak|pico|festival)/.test(name)) score -= 60;
  // "Microsoft Stefan Desktop", "Microsoft Hedda Desktop" etc. — old offline SAPI voices
  if (/\bdesktop\b/.test(name)) score -= 50;

  if (v.default) score += 5;
  return score;
}

/* Upgrade-only cache — _deScore only ever increases */
let _deVoice: SpeechSynthesisVoice | null = null;
let _deScore = -Infinity;

/** Scan voice list and upgrade cache if any voice scores higher than before. */
function _pickBestDE(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  for (const v of window.speechSynthesis.getVoices()) {
    const s = _scoreDE(v);
    if (s > _deScore) { _deScore = s; _deVoice = v; }
  }
}

let _deWarmUpDone = false;

/**
 * Begin loading voices as early as possible. Safe to call repeatedly.
 * Call once on app/page mount so the list is ready before the first play.
 */
export function warmUpVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || _deWarmUpDone) return;
  _deWarmUpDone = true;

  // Android Chromium: voice list stays empty until the first speak() call.
  // Fire a silent utterance to wake the system's TTS engine and populate the
  // voice list. We wait 200 ms before cancelling so the engine has enough time
  // to register its voices (0 ms is too fast on some Samsung / Pixel builds).
  if (_isMobile()) {
    try {
      const silent = new SpeechSynthesisUtterance(' ');
      silent.volume = 0;
      silent.rate = 10;
      window.speechSynthesis.speak(silent);
      setTimeout(() => {
        try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
      }, 200);
    } catch { /* some browsers block programmatic speech — safe to ignore */ }
  }

  const refreshAll = () => { _pickBestDE(); _pickBestPair(); };

  refreshAll();
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshAll);

  // Keep polling until the window expires.
  // Mobile: 15 s (60 × 250 ms)   Desktop: 5 s (20 × 250 ms)
  const maxTries = _isMobile() ? 60 : 20;
  let tries = 0;
  const poll = setInterval(() => {
    refreshAll();
    if (++tries >= maxTries) clearInterval(poll);
  }, 250);
}

/**
 * Return the best German voice available right now.
 * Always re-checks so late-loading online voices are used the moment they appear.
 */
export function getGermanVoice(): SpeechSynthesisVoice | null {
  _pickBestDE();
  return _deVoice;
}

/**
 * Configure an utterance with the best German voice + sensible defaults.
 * Always re-picks before applying so online voices are used as soon as loaded.
 */
export function applyGermanVoice(utt: SpeechSynthesisUtterance, rate = 0.9): void {
  utt.lang = 'de-DE';
  utt.rate = rate;
  utt.pitch = 1;
  _pickBestDE();
  if (_deVoice) utt.voice = _deVoice;
}

/* ── Male / female voice pair for dialogue (Konversation) ─────────────── */

/**
 * Minimum score a dedicated male voice must reach to be used as a distinct
 * voice in dialogue. Scores below this threshold mean the voice is likely an
 * offline/local voice (Stefan Desktop, Markus) that sounds robotic.
 * In that case we return male=null and let the caller pitch-shift the
 * high-quality female voice instead — it sounds considerably better.
 *
 * Conrad/Killian Online (Natural) score ~207 → well above threshold ✓
 * Stefan Desktop scores ~8 after Desktop penalty → rejected ✓
 * Markus scores ~87 → rejected ✓
 */
const MALE_QUALITY_THRESHOLD = 88;

/** Score how "female" a German voice is (higher = more female). */
function _scoreFemaleDE(v: SpeechSynthesisVoice): number {
  const base = _scoreDE(v);
  if (base <= -Infinity) return -Infinity;
  const name = (v.name || '').toLowerCase();
  if (/(katja|amala|louisa|seraphina|hedda|anna|helena|petra)/.test(name)) return base + 25;
  if (/google/.test(name)) return base + 10; // Google Deutsch is female-sounding
  if (/(conrad|killian|stefan|markus|viktor)/.test(name)) return base - 40;
  return base;
}

/** Score how "male" a German voice is (higher = more male). */
function _scoreMaleDE(v: SpeechSynthesisVoice): number {
  const base = _scoreDE(v);
  if (base <= -Infinity) return -Infinity;
  const name = (v.name || '').toLowerCase();
  if (/(conrad|killian|stefan|markus|viktor)/.test(name)) return base + 25;
  if (/(katja|amala|louisa|seraphina|hedda|anna|helena|petra)/.test(name)) return base - 40;
  if (/google/.test(name)) return base - 15; // Google Deutsch is female-sounding
  return base;
}

/* Upgrade-only caches for the dialogue pair — updated on every voiceschanged
   event so Conrad Online (Natural) is picked up the moment it loads. */
let _feVoice: SpeechSynthesisVoice | null = null;
let _feScore = -Infinity;
let _maVoice: SpeechSynthesisVoice | null = null;
let _maScore = -Infinity;

function _pickBestPair(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  for (const v of window.speechSynthesis.getVoices()) {
    const fs = _scoreFemaleDE(v);
    if (fs > _feScore) { _feScore = fs; _feVoice = v; }
    const ms = _scoreMaleDE(v);
    if (ms > _maScore) { _maScore = ms; _maVoice = v; }
  }
  // If both pickers chose the same voice, only one German voice exists → clear male
  if (_feVoice && _maVoice && _feVoice.name === _maVoice.name) {
    _maVoice = null;
    _maScore = -Infinity;
  }
}

/**
 * Pick the best female and best male German voice independently.
 *
 * Used by Konversation to give each dialogue speaker a distinct voice.
 *
 * `male` is null when:
 * - No dedicated male voice is available (only one German voice installed), OR
 * - The best male candidate scores below MALE_QUALITY_THRESHOLD (offline/
 *   robotic voice like Stefan Desktop or Markus). In both cases the caller
 *   should pitch-shift the female voice (pitch ≈ 0.82) — a high-quality neural
 *   voice at a lower pitch sounds far better than a robotic local male voice.
 */
export function getGermanVoicePair(): {
  female: SpeechSynthesisVoice | null;
  male: SpeechSynthesisVoice | null;
} {
  _pickBestPair(); // apply any newly loaded voices

  const useRealMale = _maVoice !== null && _maScore >= MALE_QUALITY_THRESHOLD;
  return {
    female: _feVoice,
    male: useRealMale ? _maVoice : null,
  };
}

/**
 * Speak German text with the best available voice.
 * Convenience wrapper — safe to call from any component.
 */
export function speakDE(text: string, rate = 0.9): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  applyGermanVoice(utt, rate);
  window.speechSynthesis.speak(utt);
}

/**
 * Wait until a German voice with at least `minScore` quality is available,
 * or until `maxMs` elapses — whichever comes first.
 *
 * Use this before starting dialogue playback on mobile so the online/neural
 * voice has time to load before the first line is spoken.
 *
 * minScore guide:
 *   40  = any German-language voice (even a basic system TTS)
 *   88  = online / neural quality (Katja Online, Google Deutsch, etc.)
 *  130  = best neural pair member (Conrad Online, etc.)
 */
export function waitForGermanVoice(maxMs = 3000, minScore = 40): Promise<boolean> {
  return new Promise(resolve => {
    _pickBestDE();
    _pickBestPair();
    if (_deScore >= minScore) { resolve(true); return; }

    const deadline = Date.now() + maxMs;
    const timer = setInterval(() => {
      _pickBestDE();
      _pickBestPair();
      if (_deScore >= minScore || Date.now() >= deadline) {
        clearInterval(timer);
        resolve(_deScore >= minScore);
      }
    }, 150);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   ENGLISH VOICE  (for bilingual DE-EN reading)
   Same philosophy: online-first scoring, upgrade-only cache, mobile bonus.
   ═══════════════════════════════════════════════════════════════════════ */

type VoiceProvider = 'google' | 'natural' | 'premium' | 'local' | 'other';

function _providerOf(name: string): VoiceProvider {
  const n = (name || '').toLowerCase();
  if (/google/.test(n)) return 'google';
  if (/(natural|neural|online|wavenet|journey|studio|polyglot)/.test(n)) return 'natural';
  if (/(premium|enhanced)/.test(n)) return 'premium';
  if (/(desktop|compact|espeak|pico|festival|\bdavid\b|\bzira\b|\bmark\b|\bhazel\b)/.test(n)) return 'local';
  return 'other';
}

function _scoreEN(v: SpeechSynthesisVoice, preferProvider?: VoiceProvider): number {
  const lang = (v.lang || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  if (!lang.startsWith('en')) return -Infinity;

  let score = 0;
  if (lang === 'en-us') score += 50;
  else if (lang === 'en-gb') score += 45;
  else score += 20;

  const onB = _isMobile() ? MOBILE_ONLINE_BONUS : 0;

  // Tier 1 — cloud / neural / online
  if (/(natural|neural|wavenet|journey|studio|polyglot)/.test(name)) score += 80 + onB;
  if (/(premium|enhanced|online|cloud)/.test(name))                   score += 55 + onB;
  if (/google/.test(name))                                             score += 60;

  // Tier 2 — named quality voices
  // Microsoft neural (Edge "Online (Natural)") + Windows 11
  if (/(aria|jenny|guy|davis|jason|tony|sara|nancy|amber|ashley|andrew|emma|brian|ava|libby|ryan|sonia|michelle|roger|eric|christopher|jacob|monica)/.test(name)) score += 32;
  // Apple iOS/macOS (including Enhanced/Premium variants)
  if (/(samantha|alex|allison|susan|zoe|tom|nathan|evan|joelle|serena|karen|moira|daniel|oliver|fiona)/.test(name)) score += 28;

  // Penalise low-quality engines
  if (/(compact|espeak|pico|festival|robotic)/.test(name)) score -= 90;
  if (/\bdesktop\b/.test(name)) score -= 60;
  if (/\b(david|zira|mark|hazel)\b/.test(name) && !/(natural|neural|online)/.test(name)) score -= 45;

  // Prefer same engine family as the German voice (Google↔Google, Natural↔Natural)
  if (preferProvider && preferProvider !== 'local' && preferProvider !== 'other'
      && _providerOf(name) === preferProvider) score += 45;

  if (v.default) score += 3;
  return score;
}

/* Upgrade-only cache */
let _enVoice: SpeechSynthesisVoice | null = null;
let _enScore = -Infinity;

function _pickBestEN(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const prefer = _deVoice ? _providerOf(_deVoice.name || '') : undefined;
  for (const v of window.speechSynthesis.getVoices()) {
    const s = _scoreEN(v, prefer);
    if (s > _enScore) { _enScore = s; _enVoice = v; }
  }
}

let _enWarmUpDone = false;

export function warmUpEnglishVoice(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || _enWarmUpDone) return;
  _enWarmUpDone = true;
  _pickBestEN();
  window.speechSynthesis.addEventListener?.('voiceschanged', _pickBestEN);
  const maxTries = _isMobile() ? 60 : 20;
  let tries = 0;
  const poll = setInterval(() => {
    _pickBestEN();
    if (++tries >= maxTries) clearInterval(poll);
  }, 250);
}

/**
 * Return the best English voice available right now.
 * Always re-checks so late-loading online voices are used the moment they appear.
 */
export function getEnglishVoice(): SpeechSynthesisVoice | null {
  _pickBestEN();
  return _enVoice;
}

/**
 * Configure an utterance with the best English voice + sensible defaults.
 */
export function applyEnglishVoice(utt: SpeechSynthesisUtterance, rate = 0.92): void {
  utt.rate = rate;
  utt.pitch = 1.0;
  _pickBestEN();
  if (_enVoice) {
    utt.voice = _enVoice;
    utt.lang = _enVoice.lang || 'en-US';
  } else {
    utt.lang = 'en-US';
  }
}

/**
 * Speak English text with the best available voice.
 * Convenience wrapper — safe to call from any component.
 */
export function speakEN(text: string, rate = 0.92): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  applyEnglishVoice(utt, rate);
  window.speechSynthesis.speak(utt);
}
