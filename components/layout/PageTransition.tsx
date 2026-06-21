'use client';

/* Fades each route in cleanly. Keyed on the pathname so the old page unmounts
   and the new one fades up over the (solid) app background — no more brief
   superimposition of the previous page. Opacity-only so it never breaks the
   sticky Topbar / fixed elements during the animation. */

import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
