import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import type { NewsArticle } from "@/types";

/**
 * Horizontally scrolling breaking-news ticker. Pauses on hover.
 * The track is duplicated so the animation loops seamlessly.
 */
export function BreakingTicker({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  const items = articles.slice(0, 10);
  const track = [...items, ...items];

  return (
    <div className="relative flex items-center overflow-hidden border-b border-line bg-surface">
      <div className="relative z-10 flex shrink-0 items-center gap-2 bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
        <Flame className="h-4 w-4" aria-hidden="true" />
        Breaking
      </div>
      <div className="group/ticker relative flex-1 overflow-hidden">
        <div className="flex w-max animate-ticker gap-10 py-2 pl-6 group-hover/ticker:[animation-play-state:paused]">
          {track.map((article, index) => (
            <Link
              key={`${article.id}-${index}`}
              to={`/article/${article.id}`}
              className="whitespace-nowrap text-sm text-ink transition-colors hover:text-accent"
            >
              <span className="mr-2 font-semibold uppercase tracking-wide text-mist">
                {article.category}
              </span>
              {article.title}
            </Link>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface to-transparent" />
      </div>
    </div>
  );
}