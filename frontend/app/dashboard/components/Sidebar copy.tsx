"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Layers, PlusCircle, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
  { key: 'collections', label: 'Collections', href: '/dashboard/collections', icon: <Layers size={20} /> },
  { key: 'new', label: 'New', href: '/dashboard/new', icon: <PlusCircle size={20} /> },
  { key: 'settings', label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('dashboard_sidebar_collapsed');
      if (v !== null) setCollapsed(v === '1');
    } catch (e) {}
  }, []);

  useEffect(() => {
    function onEvent(e: Event) {
      const ce = e as CustomEvent<{ collapsed: boolean }>;
      if (ce?.detail?.collapsed !== undefined) setCollapsed(ce.detail.collapsed);
    }

    window.addEventListener('dashboard:sidebar-toggle', onEvent as EventListener);
    return () => window.removeEventListener('dashboard:sidebar-toggle', onEvent as EventListener);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dashboard_sidebar_collapsed', collapsed ? '1' : '0');
    } catch (e) {}
    // expose the current width as a CSS variable so layout can offset content
    try {
      const w = collapsed ? '72px' : '224px';
      document.documentElement.style.setProperty('--dashboard-sidebar-width', w);
    } catch (e) {}
  }, [collapsed]);

  // also set initial CSS var on mount
  useEffect(() => {
    try {
      const w = (localStorage.getItem('dashboard_sidebar_collapsed') === '1') ? '72px' : '224px';
      document.documentElement.style.setProperty('--dashboard-sidebar-width', w);
    } catch (e) {}
  }, []);

  return (
    <aside
      style={{ top: 'calc(var(--header-height) + 1px)', height: 'calc(100vh - var(--header-height) - 1px)', width: collapsed ? '72px' : '224px' }}
      className={`fixed left-0 z-40 flex flex-shrink-0 border-r bg-[var(--card)] text-[var(--card-foreground)] border-[var(--border)] transition-all duration-200`}
    >
      <div className="flex h-full flex-col">
        <nav className="mt-2 flex-1 overflow-auto">
          <ul className="space-y-0 px-0 py-2">
            {navItems.map((it) => (
              <li key={it.key}>
                <Link
                  href={it.href}
                  className={`group flex w-full items-center px-0 py-1 text-sm ${collapsed ? 'justify-center' : ''}`}
                  title={it.label}
                >
                  <div className={`${collapsed ? 'justify-center w-full' : 'w-4/5 ml-0'} flex items-center gap-3 rounded-md px-4 py-1 group-hover:bg-[var(--background)]`}>
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center text-[var(--muted-foreground)] ${collapsed ? 'rounded-md group-hover:bg-[var(--background)]' : ''}`}>
                      {it.icon}
                    </div>
                    <span className={collapsed ? 'w-0 overflow-hidden opacity-0 transition-all' : 'flex-1'}>{it.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="border-t px-0 py-2">
          <li>
            <Link
              href="/profile"
              className={`group flex w-full items-center px-0 py-1 text-sm ${collapsed ? 'justify-center' : ''}`}
              title="Profile"
            >
              <div className={`${collapsed ? 'justify-center w-full' : 'w-4/5 ml-0'} flex items-center gap-3 rounded-md px-4 py-1 group-hover:bg-[var(--background)]`}>
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold">P</div>
                <span className={collapsed ? 'w-0 overflow-hidden opacity-0 transition-all' : 'flex-1'}>Profile</span>
              </div>
            </Link>
          </li>
          <li className="mt-1">
            <LogoutButton collapsed={collapsed} asNav />
          </li>
        </ul>

      </div>
    </aside>
  );
}

function LogoutButton({ collapsed, asNav }: { collapsed: boolean; asNav?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      try { localStorage.removeItem('dev_access_token') } catch (e) {}
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || "http://127.0.0.1:8000";
      await fetch(`${base}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
      router.push('/auth/login');
    }
  }

  if (asNav) {
    return (
      <Link
        href="/auth/login"
        onClick={async (e) => {
          e.preventDefault();
          if (loading) return;
          await handleLogout();
        }}
        className={`group flex w-full items-center px-0 py-1 text-sm ${collapsed ? 'justify-center' : ''}`}
        title="Log out"
      >
        <div className={`${collapsed ? 'justify-center w-full' : 'w-4/5 ml-0'} flex items-center gap-3 rounded-md px-4 py-1 group-hover:bg-[var(--background)]`}>
          <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center text-[var(--muted-foreground)] ${collapsed ? 'rounded-md group-hover:bg-[var(--background)]' : ''}`}>
            ⎋
          </div>
          <span className={collapsed ? 'w-0 overflow-hidden opacity-0 transition-all' : 'flex-1'}>Log out</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/auth/login"
      onClick={async (e) => {
        e.preventDefault();
        if (loading) return;
        await handleLogout();
      }}
      className={`rounded-md border px-2 py-1 text-sm text-[var(--muted-foreground)] ${collapsed ? 'w-8 h-8 flex items-center justify-center' : ''}`}
      title="Log out"
    >
      {loading ? '…' : (collapsed ? '⎋' : 'Log out')}
    </Link>
  );
}
