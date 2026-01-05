"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_KEY = "site-theme";

type ThemeState = "light" | "dark";

function applyTheme(theme: ThemeState) {
  const el = document.documentElement;
  el.classList.remove("dark");
  if (theme === "dark") el.classList.add("dark");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeState>("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as ThemeState | null;
      if (saved === "dark") {
        setTheme(saved);
        applyTheme(saved);
        return;
      }
    } catch (e) {
      // ignore
    }
    setTheme("light");
    applyTheme("light");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    applyTheme(theme);
  }, [theme]);

  function selectTheme(t: ThemeState) {
    setTheme(t);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] p-2 text-sm font-medium text-[var(--foreground)] shadow-sm">
          <span className="sr-only">Select theme</span>
          {theme === "light" ? (
            <Sun className="h-4 w-4 text-[var(--muted-foreground)]" />
          ) : (
            <Moon className="h-4 w-4 text-[var(--muted-foreground)]" />
          )}
          <ChevronDown className="h-3 w-3 text-[var(--muted-foreground)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => selectTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
