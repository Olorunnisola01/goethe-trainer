'use client';

/* "Schwache Wörter" — words the user repeatedly got wrong, with a mini practice
   launcher and per-word speak/remove controls. */
import { useGame } from '@/context/GamificationContext';
import { topWeakWords } from '@/lib/gamification';
import { speakDE } from '@/lib/cloudVoice';
import { Card } from '@/components/ui/Card';

export function WeakWordsPanel() {
  const { state, resetWeakWord } = useGame();
  const weak = topWeakWords(state, 30);
  if (!weak.length) return null;

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold" style={{ color: 'var(--ink)' }}>🩹 Schwache Wörter <span style={{ color: 'var(--muted)', fontWeight: 500 }}>· {weak.length}</span></div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
        Diese Wörter hast du mehrmals falsch beantwortet. Sie kommen in der Schnellübung & im Quiz häufiger vor.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {weak.map(w => (
          <div key={w.de} className="weak-chip">
            <button onClick={() => speakDE(w.de, 0.9)} title="Vorlesen"
              style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--red-bd)', background: 'var(--bg)', color: 'var(--red)', cursor: 'pointer', fontSize: 11, flexShrink: 0 }}>🔊</button>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{w.de}</span>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{w.en}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>{w.misses}× falsch</span>
            <button onClick={() => resetWeakWord(w.de)} title="Als gelernt markieren"
              style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--muted)', cursor: 'pointer', fontSize: 11, flexShrink: 0 }}>✓</button>
          </div>
        ))}
      </div>
    </Card>
  );
}
