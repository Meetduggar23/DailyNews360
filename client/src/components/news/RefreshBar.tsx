import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { relativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";

interface RefreshBarProps {
  /** ISO timestamp of when the latest data was fetched. */
  updatedAt: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
  className?: string;
}

/**
 * "Updated X minutes ago ↻ Refresh" editorial status line.
 * Shows the age of the data and lets readers pull the latest stories.
 */
export function RefreshBar({ updatedAt, onRefresh, isRefreshing = false, className }: RefreshBarProps) {
  const [, setTick] = useState(0);

  // Re-render every minute so the "Updated X ago" label stays accurate.
  useEffect(() => {
    const interval = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex items-center gap-3 border-y border-line py-2", className)}>
      <span className="font-sans text-xs uppercase tracking-wide text-mist">
        {isRefreshing ? "Updating…" : relativeTime(updatedAt).startsWith("Just") ? "Updated just now" : `Updated ${relativeTime(updatedAt)}`}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="group inline-flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-accent transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw
          className={cn("h-3.5 w-3.5 transition-transform", isRefreshing && "animate-spin")}
          aria-hidden="true"
        />
        {isRefreshing ? "Refreshing" : "Refresh"}
      </button>
    </div>
  );
}