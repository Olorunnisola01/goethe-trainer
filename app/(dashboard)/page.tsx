import { notFound } from 'next/navigation';

/**
 * This file prevents a routing conflict.
 * "/" is served by app/page.tsx (landing page).
 * Dashboard home is at app/(dashboard)/home/page.tsx → URL /home
 */
export default function DashboardRootFallback() {
  notFound();
}
