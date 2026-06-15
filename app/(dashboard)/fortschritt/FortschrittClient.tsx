'use client';

import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';

const gradeColor: Record<string, string> = {
  'A': 'bg-green-100 text-green-800 border-green-300',
  'B': 'bg-blue-100 text-blue-800 border-blue-300',
  'C': 'bg-amber-100 text-amber-800 border-amber-300',
  'D': 'bg-orange-100 text-orange-800 border-orange-300',
  'E': 'bg-red-100 text-red-800 border-red-300',
  '—': 'bg-gray-100 text-gray-500 border-gray-200',
};

function pct(a: number, b: number) { return b > 0 ? Math.round((a / b) * 100) : 0; }

function Section({ label, icon, value, total, weight }: { label: string; icon: string; value: number; total: number; weight: string }) {
  const p = pct(value, total);
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-800">{label}</div>
          <div className="text-xs text-gray-400">Gewichtung: {weight}</div>
        </div>
        <div className="text-lg font-bold text-gray-900">{p}%</div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', p >= 80 ? 'bg-green-500' : p >= 60 ? 'bg-blue-500' : p >= 40 ? 'bg-amber-500' : 'bg-red-400')}
          style={{ width: `${p}%` }}
        />
      </div>
      <div className="text-xs text-gray-400">{value} / {total} richtig</div>
    </Card>
  );
}

export function FortschrittClient() {
  const { user } = useAuth();
  const { progress, overall, grade } = useProgress(user?.uid ?? null);

  return (
    <>
      <Topbar title="Mein Fortschritt" />
      <div className="flex-1 p-7 max-w-3xl">
        {/* Overall grade */}
        <div className="flex items-center gap-6 mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white">
          <div className={clsx('w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl font-bold shrink-0', gradeColor[grade])}>
            {grade}
          </div>
          <div>
            <div className="text-blue-200 text-sm mb-1">Gesamtnote</div>
            <div className="text-4xl font-bold">{overall}%</div>
            <div className="text-blue-200 text-sm mt-1">
              {overall >= 90 ? 'Exzellent! Du bist fast ein Experte.' :
               overall >= 75 ? 'Sehr gut! Weiter so.' :
               overall >= 60 ? 'Gut! Du machst Fortschritte.' :
               overall >= 45 ? 'Weiter üben – du schaffst das!' :
               overall > 0   ? 'Fang an zu üben – du bist auf dem richtigen Weg!' :
               'Noch keine Übungen absolviert.'}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Section label="Quiz"           icon="🎯" value={progress.quiz.correct}     total={progress.quiz.attempts}     weight="30%" />
          <Section label="Grammatik-Quiz" icon="🏗" value={progress.gramQuiz.correct}  total={progress.gramQuiz.attempts}  weight="25%" />
          <Section label="Karteikarten"   icon="🃏" value={progress.flash.known}       total={progress.flash.seen}         weight="20%" />
          <Section label="Schreiben"      icon="✍️" value={progress.write.correct}     total={progress.write.done}         weight="12%" />
          <Section label="Leseverstehen"  icon="📖" value={progress.read.correct}      total={progress.read.done}          weight="13%" />
        </div>

        {!user && (
          <p className="mt-6 text-sm text-gray-400 text-center">Melde dich an, um deinen Fortschritt dauerhaft zu speichern.</p>
        )}
      </div>
    </>
  );
}
