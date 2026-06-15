/* ──────────────────────────────────────────────────────────────────────────
   translate.ts — German → English translation for word-click tooltips.

   Uses three CORS-friendly free endpoints in order of accuracy, falling back
   automatically if one is slow or down:

     1. Google Translate (gtx)  — most accurate; "Festnahme" → "arrest"
     2. Lingva                  — open-source Google frontend
     3. MyMemory                — translation-memory service (last resort)

   All three return `Access-Control-Allow-Origin: *`, so they work directly
   from the browser with no proxy or API key.
   ────────────────────────────────────────────────────────────────────────── */

/** fetch() with a hard timeout (works on all mobile browsers). */
async function fetchJson(url: string, ms: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Translate German text to English.
 * Returns the best translation, or '—' only if every provider fails.
 */
export async function translateDEtoEN(text: string): Promise<string> {
  const q = text.trim();
  if (!q) return '';

  // 1. Google Translate — free gtx endpoint. Response is a nested array:
  //    [[["arrest","Festnahme",…]], …]  → join all segments for multi-word input.
  try {
    const data = await fetchJson(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=en&dt=t&q=${encodeURIComponent(q)}`,
      6000,
    );
    if (Array.isArray(data) && Array.isArray((data as unknown[])[0])) {
      const segs = (data as [Array<[string]>])[0];
      const out = segs.map(s => (Array.isArray(s) ? s[0] : '')).join('').trim();
      if (out) return out;
    }
  } catch { /* fall through */ }

  // 2. Lingva — open-source Google Translate frontend.
  try {
    const data = await fetchJson(`https://lingva.ml/api/v1/de/en/${encodeURIComponent(q)}`, 6000) as { translation?: string };
    if (data?.translation) return String(data.translation).trim();
  } catch { /* fall through */ }

  // 3. MyMemory — last resort.
  try {
    const data = await fetchJson(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=de|en`, 6000) as { responseData?: { translatedText?: string } };
    const t = data?.responseData?.translatedText;
    if (t && t.trim() && t.trim() !== '—') return String(t).trim();
  } catch { /* fall through */ }

  return '—';
}
