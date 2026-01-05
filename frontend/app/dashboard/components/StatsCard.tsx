"use client";

import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: any;
  color?: string; // e.g. "text-violet-500"
}

export default function StatsCard({ title, value, subtitle, trend = "neutral", trendValue, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--primary)]/50 hover:shadow-lg hover:shadow-[var(--primary)]/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--secondary)]", color)}>
              <Icon size={16} />
            </div>
          )}
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">{title}</h3>
        </div>
        <button className="text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--foreground)]">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold text-[var(--foreground)]">{value}</div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {trend !== "neutral" && (
            <span
              className={cn(
                "flex items-center font-medium",
                trend === "up" ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trendValue}
            </span>
          )}
          <span className="text-[var(--muted-foreground)]">{subtitle}</span>
        </div>
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--primary)]/5 blur-2xl transition-all group-hover:bg-[var(--primary)]/10" />
    </div>
  );
}
