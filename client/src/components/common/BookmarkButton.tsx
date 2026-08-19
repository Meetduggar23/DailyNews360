import * as React from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBookmarkStore } from "@/stores/bookmark.store";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types";

interface BookmarkButtonProps {
  article: NewsArticle;
  variant?: "icon" | "full";
  className?: string;
  size?: "sm" | "md";
}

export function BookmarkButton({
  article,
  variant = "icon",
  className,
  size = "md",
}: BookmarkButtonProps) {
  const isBookmarked = useBookmarkStore((state) => state.isBookmarked(article.id));
  const toggle = useBookmarkStore((state) => state.toggle);
  const hydrated = useBookmarkStore((state) => state.hydrated);
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  const onClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy || !hydrated) return;
    setBusy(true);
    try {
      await toggle(article);
      toast({
        title: isBookmarked ? "Bookmark removed" : "Bookmark added",
        description: isBookmarked ? `Removed "${article.title.slice(0, 60)}…"` : "Saved to your reading list.",
      });
    } catch {
      toast({
        title: "Couldn't update bookmark",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const Icon = isBookmarked ? BookmarkCheck : Bookmark;
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  if (variant === "full") {
    return (
      <button
        onClick={onClick}
        disabled={!hydrated || busy}
        aria-pressed={isBookmarked}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-line/40 disabled:opacity-50",
          isBookmarked && "border-accent/40 bg-accent/10 text-accent",
          className,
        )}
      >
        <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
        {isBookmarked ? "Saved" : "Bookmark"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!hydrated || busy}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this story"}
      aria-pressed={isBookmarked}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors hover:bg-line/50 disabled:opacity-50",
        dim,
        isBookmarked ? "text-accent" : "text-mist",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isBookmarked ? "saved" : "unsaved"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex"
        >
          <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}