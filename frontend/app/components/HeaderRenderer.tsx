"use client"

import { usePathname } from 'next/navigation';
import GlobalHeader from './GlobalHeader';

export default function HeaderRenderer() {
  const pathname = usePathname();

  // Hide the global header for all /dashboard routes since dashboard provides its own top bar
  if (pathname && pathname.startsWith('/dashboard')) return null;

  return <GlobalHeader />;
}
