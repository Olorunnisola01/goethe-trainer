/* ──────────────────────────────────────────────────────────────────────────
   shareCard.ts — render a quiz result into a shareable PNG (canvas), then use
   the Web Share API (with files) when available, else download the image.
   No dependencies; works in the Android WebView and modern browsers.
   ────────────────────────────────────────────────────────────────────────── */

export async function shareScoreCard(opts: { score: number; total: number; title: string; subtitle?: string }) {
  const { score, total, title } = opts;
  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background gradient
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#1d4ed8'); g.addColorStop(1, '#4c1d95');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const emoji = pct >= 90 ? '🏆' : pct >= 60 ? '👍' : '💪';

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '600 40px Georgia, serif';
  ctx.fillText('🇩🇪  Deutsch Trainer', W / 2, 150);

  ctx.font = '160px sans-serif';
  ctx.fillText(emoji, W / 2, 380);

  ctx.fillStyle = '#fff';
  ctx.font = '800 220px Georgia, serif';
  ctx.fillText(`${score}/${total}`, W / 2, 620);

  ctx.font = '700 64px Georgia, serif';
  ctx.fillText(`${pct}% richtig`, W / 2, 720);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '500 46px sans-serif';
  wrap(ctx, title, W / 2, 830, W - 160, 58);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '500 36px sans-serif';
  ctx.fillText('teach-me-german-app.web.app', W / 2, 1000);

  const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/png'));
  if (!blob) return;
  const file = new File([blob], 'deutsch-quiz-ergebnis.png', { type: 'image/png' });
  const text = `Ich habe ${score}/${total} (${pct}%) im Deutsch-Quiz erreicht! 🇩🇪`;

  // Prefer native share sheet with the image
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], title: 'Mein Deutsch-Quiz Ergebnis', text }); return; }
    catch { /* user cancelled or unsupported — fall through to download */ }
  }
  // Fallback: download the PNG
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'deutsch-quiz-ergebnis.png';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; }
    else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}
