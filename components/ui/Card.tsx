import { ReactNode, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' };

export function Card({ children, hover = false, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border shadow-sm',
        hover && 'transition-shadow hover:shadow-md cursor-pointer',
        paddings[padding],
        className,
      )}
      style={{ background: 'var(--bg)', borderColor: 'var(--border)', ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
}
