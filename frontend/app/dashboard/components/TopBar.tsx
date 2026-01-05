"use client";

import { Bell, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopBar() {
    return (
        <header
            className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 px-6 backdrop-blur-xl transition-all duration-300"
            style={{
                left: 'var(--sidebar-width, 16rem)',
                width: 'calc(100vw - var(--sidebar-width, 16rem))'
            }}
        >
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="h-10 w-64 rounded-full border border-[var(--border)] bg-[var(--secondary)]/50 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]">
                    <Bell size={20} />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--destructive)] ring-2 ring-[var(--background)]" />
                </button>

                <div className="h-8 w-[1px] bg-[var(--border)]" />

                <button className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--secondary)]/30 p-1 pr-4 transition-colors hover:bg-[var(--secondary)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-xs font-bold text-white">
                        JD
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-medium text-[var(--foreground)]">John Doe</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">Pro Plan</p>
                    </div>
                </button>
            </div>
        </header>
    );
}
