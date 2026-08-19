import { AlertTriangle, RefreshCw, SearchX, BookmarkX, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type StateKind = "error" | "empty" | "offline" | "noResults" | "noBookmarks";

const CONTENT: Record<StateKind, { title: string; message: string }> = {
  error: {
    title: "News is temporarily unavailable.",
    message: "Please try again in a moment. We're having trouble reaching our news sources.",
  },
  offline: {
    title: "You're offline.",
    message: "Showing the latest available stories. Reconnect to see fresh news.",
  },
  noResults: {
    title: "No stories found for this search.",
    message: "Try a different keyword or clear your filters.",
  },
  noBookmarks: {
    title: "Your reading list is empty.",
    message: "Bookmark stories to save them here.",
  },
  empty: {
    title: "Nothing here yet.",
    message: "Check back soon for new stories.",
  },
};

interface StateProps {
  kind?: StateKind;
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ kind = "empty", title, message, onRetry, action }: StateProps) {
  const copy = CONTENT[kind];
  const Icon =
    kind === "error"
      ? AlertTriangle
      : kind === "offline"
        ? WifiOff
        : kind === "noResults"
          ? SearchX
          : kind === "noBookmarks"
            ? BookmarkX
            : SearchX;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-line/50">
        <Icon className="h-7 w-7 text-mist" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-ink">{title ?? copy.title}</h3>
      <p className="max-w-sm text-sm text-mist">{message ?? copy.message}</p>
      {(onRetry || action) && (
        <div className="mt-5 flex gap-3">
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          ) : null}
          {action ? (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}