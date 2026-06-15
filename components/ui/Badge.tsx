import { ReactNode } from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'A1' | 'A2' | 'B1' | 'B2' | 'blue' | 'green' | 'amber' | 'red' | 'gray';

const styles: Record<BadgeVariant, string> = {
  A1:    'bg-green-50 text-green-800 border-green-200',
  A2:    'bg-blue-50 text-blue-800 border-blue-200',
  B1:    'bg-violet-50 text-violet-800 border-violet-200',
  B2:    'bg-amber-50 text-amber-800 border-amber-200',
  blue:  'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red:   'bg-red-50 text-red-700 border-red-200',
  gray:  'bg-gray-100 text-gray-600 border-gray-200',
};

export function Badge({ variant = 'gray', className, children }: { variant?: BadgeVariant; className?: string; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-700 border', styles[variant], className)}>
      {children}
    </span>
  );
}
