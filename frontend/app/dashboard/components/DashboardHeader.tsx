"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardHeader({ userName }: { userName?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const name = userName ?? "Alex";

  async function handleLogout() {
    setLoading(true);
    try {
      try {
        localStorage.removeItem('dev_access_token')
      } catch (e) {
        // ignore
      }
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || "http://127.0.0.1:8000";
      await fetch(`${base}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
      router.push("/auth/login");
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold">Welcome back, {name} 👋</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Here's what's happening with your workspace today.</p>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/new" className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]">
          New Collection
        </Link>
      </div>
    </div>
  );
}
