"use client"

import Link from "next/link";
import SidebarToggle from './SidebarToggle';

export default function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">Collect Anything</div>
          <nav className="hidden md:flex gap-3 text-sm text-[var(--muted-foreground)]">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/signup" className="hover:underline">Get started</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-[var(--muted-foreground)] hover:underline">Log in</Link>
        </div>
      </div>

      {/* Sidebar toggle positioned at the extreme left of the header */}
      <div className="absolute left-0 top-1/2 z-50 -translate-y-1/2 pl-3">
        <SidebarToggle />
      </div>
    </header>
  );
}
