/* On-demand German→English translation that reuses the AI Tutor's saved
   provider/key (localStorage 'aiSettings_v5') when available for higher
   quality, with a free, keyless fallback (MyMemory) so translation always
   works — and a localStorage cache so each sentence is translated once. */

const EN_CACHE_KEY = 'de_en_cache_v2';

function readCache(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(EN_CACHE_KEY) || '{}'); } catch { return {}; }
}
function writeCache(map: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(EN_CACHE_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

function cleanReply(reply: string): string {
  return reply
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/^["'“”\s]+|["'“”\s]+$/g, '')
    .trim();
}

/** Translate via the user's configured AI provider/key. Returns '' if not configured or on failure. */
async function llmTranslate(de: string): Promise<string> {
  let provider = '', model = 'auto', apiKey = '';
  try {
    const s = JSON.parse(localStorage.getItem('aiSettings_v5') || '{}');
    provider = s.provider || '';
    apiKey   = s.apiKey   || '';
    if (s.model && s.model !== 'auto') model = s.model;
  } catch { /* not configured */ }
  if (!provider || !apiKey) return '';

  const sys = 'You are a translator. Translate the German sentence into natural, correct English. Reply with ONLY the English translation — no quotes, no notes, Latin script only.';
  const messages = [{ role: 'system', content: sys }, { role: 'user', content: de }];

  let reply = '';
  if (provider === 'google') {
    const m = model === 'auto' ? 'gemini-2.0-flash' : model;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: sys + '\n\n' + de }] }] }),
    });
    if (!res.ok) throw new Error('translate failed');
    const data = await res.json();
    reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } else {
    const endpoint =
      provider === 'groq'       ? 'https://api.groq.com/openai/v1/chat/completions'
    : provider === 'openai'     ? 'https://api.openai.com/v1/chat/completions'
    : provider === 'openrouter' ? 'https://openrouter.ai/api/v1/chat/completions'
    : provider === 'huggingface' ? 'https://router.huggingface.co/v1/chat/completions'
    : '';
    if (!endpoint) return '';
    const m = model === 'auto' ? 'meta-llama/Llama-3.3-70B-Instruct' : model;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: m, messages, max_tokens: 200 }),
    });
    if (!res.ok) throw new Error('translate failed');
    const data = await res.json();
    reply = data.choices?.[0]?.message?.content ?? '';
  }

  return cleanReply(reply);
}

/** Free, keyless German→English translation via the MyMemory API. */
async function myMemoryTranslate(de: string): Promise<string> {
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(de)}&langpair=de|en`);
  if (!res.ok) throw new Error('translate failed');
  const data = await res.json();

  const clean = (s: string) =>
    cleanReply(String(s).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'));

  // MyMemory's top-level translatedText is just whichever entry in `matches`
  // has the highest `match` score — even if its `quality` is 0 (an
  // unreviewed community submission that can be wholly unrelated to the
  // source sentence). Prefer an exact segment match (match === 1, a real
  // translation-memory hit for this sentence) or, failing that, the
  // highest-scoring entry that has an actual quality rating, before falling
  // back to the raw translatedText.
  const matches: Array<{ translation?: string; match?: number; quality?: number | string }> =
    Array.isArray(data?.matches) ? data.matches : [];

  const exact = matches.find((m) => m.match === 1 && m.translation);
  if (exact?.translation) return clean(exact.translation);

  const rated = matches.filter((m) => Number(m.quality) > 0 && m.translation);
  if (rated.length) {
    rated.sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    return clean(rated[0].translation!);
  }

  const text = data?.responseData?.translatedText;
  if (!text || /^\s*$/.test(text)) throw new Error('empty translation');
  return clean(text);
}

export async function translateToEnglish(de: string): Promise<string> {
  const cache = readCache();
  if (cache[de]) return cache[de];

  let reply = '';
  try { reply = await llmTranslate(de); } catch { /* fall through */ }
  if (!reply) reply = await myMemoryTranslate(de);

  cache[de] = reply; writeCache(cache);
  return reply;
}
