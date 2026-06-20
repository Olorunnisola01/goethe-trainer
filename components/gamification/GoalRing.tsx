'use client';

/* Circular daily-goal progress ring (pure SVG). */
export function GoalRing({ value, max, size = 64, stroke = 7 }: { value: number; max: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const done = value >= max && max > 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle className="goal-ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
      <circle
        className="goal-ring-fill" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        style={{ stroke: done ? 'var(--green)' : 'var(--blue)' }}
      />
    </svg>
  );
}
