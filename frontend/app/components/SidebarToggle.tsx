"use client"

import { useEffect, useState } from "react";
import { ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function SidebarToggle() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('dashboard_sidebar_collapsed');
      setCollapsed(v === '1');
    } catch (e) {}

    function onEvent(e: Event) {
      const ce = e as CustomEvent<{ collapsed: boolean }>;
      if (ce?.detail?.collapsed !== undefined) setCollapsed(ce.detail.collapsed);
    }

    window.addEventListener('dashboard:sidebar-toggle', onEvent as EventListener);
    return () => window.removeEventListener('dashboard:sidebar-toggle', onEvent as EventListener);
  }, []);

  function toggle() {
    const next = !collapsed;
    try {
      localStorage.setItem('dashboard_sidebar_collapsed', next ? '1' : '0');
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent('dashboard:sidebar-toggle', { detail: { collapsed: next } }));
    } catch (e) {}
    setCollapsed(next);
  }

  return (
    <button
      aria-label="Toggle sidebar"
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-transparent text-[var(--muted-foreground)]"
    >
      {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
    </button>
  );
}
