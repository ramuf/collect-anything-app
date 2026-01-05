"use client"

import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import SidebarToggle from "../components/SidebarToggle";
import NewProjectDialog from "./components/NewProjectDialog";

export default function DashboardTopBar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
      await fetch(`${base}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      // Clear local storage
      try {
        localStorage.removeItem('dev_access_token');
      } catch (e) {}
      // Redirect to login
      router.push('/auth/login');
    } catch (err) {
      // Ignore errors, still redirect
      router.push('/auth/login');
    }
  };

  return (
    <header style={{ height: 'var(--header-height, 80px)' }} className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-black">
      <div className="mx-auto max-w-screen-2xl px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <NewProjectDialog />
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="absolute left-0 top-1/2 z-50 -translate-y-1/2 pl-3 flex items-center gap-3">
        <SidebarToggle />
        <div className="text-lg font-semibold">Collect Anything</div>
      </div>
    </header>
  );
}

// ensure global header height CSS var is set for the sidebar to align
DashboardTopBar.displayName = 'DashboardTopBar';

