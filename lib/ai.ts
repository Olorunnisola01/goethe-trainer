/* ──────────────────────────────────────────────────────────────────────────
   ai.ts — tiny shared client for one-shot AI completions.

   Reuses the same built-in Hugging Face inference router + auto model chain as
   the AI Tutor, so features like AI example sentences, writing correction and
   conversation role-play can call the model with a single function.

   The token ships client-side by design (low-scope inference-only); it mirrors
   the one in components/ai/AiTutor.tsx.
   ────────────────────────────────────────────────────────────────────────── */

const DEFAULT_HF_TOKEN = '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';
const HF_AUTO_CHAIN = [
  'meta-llama/Llama-3.3-70B-Instruct',
  'deepseek-ai/DeepSeek-V3-0324',
  'Qwen/Qwen2.5-72B-Instruct',
  'mistralai/Mistral-Large-Instruct-2407',
];

function hdr(v: string): string { return v.replace(/[^ -ÿ]/g, ''); }

/* Strip reasoning blocks + non-Latin leakage (same as the tutor's sanitiser). */
function sanitize(text: string): string {
  let out = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
  out = out.replace(/[　-〿぀-ヿㇰ-ㇿ㐀-䶿一-鿿豈-﫿＀-￯가-힯Ѐ-ӿԀ-ԯ؀-ۿݐ-ݿ]/g, '');
  return out.replace(/[ \t]{2,}/g, ' ').replace(/ +([.,!?;:])/g, '$1').trim();
}

export interface AiMessage { role: 'system' | 'user' | 'assistant'; content: string; }

/** One-shot chat completion. Tries the auto chain until a model answers. */
export async function askAi(messages: AiMessage[], opts?: { maxTokens?: number; system?: string }): Promise<string> {
  const sys = opts?.system;
  const body = (model: string) => JSON.stringify({
    model,
    messages: sys ? [{ role: 'system', content: sys }, ...messages] : messages,
    max_tokens: opts?.maxTokens ?? 700,
  });
  let lastErr = 'no model responded';
  for (const model of HF_AUTO_CHAIN) {
    try {
      const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${hdr(DEFAULT_HF_TOKEN)}` },
        body: body(model),
      });
      const data = await res.json();
      if (!res.ok) { lastErr = data.error?.message ?? data.error ?? `HTTP ${res.status}`; continue; }
      const reply = data.choices?.[0]?.message?.content;
      if (!reply) { lastErr = 'empty response'; continue; }
      return sanitize(reply);
    } catch (e) {
      lastErr = e instanceof Error ? e.message : 'network error';
    }
  }
  throw new Error(lastErr);
}

/** Parse a fenced/loose JSON object out of a model reply. */
export function extractJson<T = unknown>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{'); const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(raw.slice(start, end + 1)) as T; } catch { return null; }
}
