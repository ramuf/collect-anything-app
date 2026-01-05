"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type ActivityItem = {
    id: string;
    user: string;
    action: string;
    target: string;
    time: string;
    icon: LucideIcon;
    color: string;
    bg: string;
};

export default function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="mb-6 text-lg font-semibold text-[var(--foreground)]">Recent Activity</h3>

            {!activities.length ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-8 text-center">
                    <p className="text-sm text-[var(--muted-foreground)]">No recent activity yet.</p>
                </div>
            ) : (
                <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:h-[calc(100%-20px)] before:w-[1px] before:bg-[var(--border)]">
                    {activities.map((activity) => (
                        <div key={activity.id} className="relative flex items-start gap-4">
                            <div
                                className={cn(
                                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]",
                                    activity.color
                                )}
                            >
                                <activity.icon size={14} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm text-[var(--foreground)]">
                                    <span className="font-medium">{activity.user}</span>{" "}
                                    <span className="text-[var(--muted-foreground)]">{activity.action}</span>{" "}
                                    <span className="font-medium text-[var(--primary)]">{activity.target}</span>
                                </p>
                                <span className="text-xs text-[var(--muted-foreground)]">{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
