import { Link } from "react-router-dom";
import type { NewsArticle } from "@/types";

/**
 * Subtle breaking-news ticker in newspaper style. Slow, professional,
 * pauses on hover. The track is duplicated for a seamless loop.
 */
export function BreakingTicker({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  const items = articles.slice(0, 12);
  const track = [...items, ...items];

  return (
    <div className="flex items-stretch overflow-hidden border-b border-line bg-surface">
      <div className="flex shrink-0 items-center gap-2 border-r border-line px-4 py-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
        <span className="font-sans text-xs font-bold uppercase tracking-widest text-accent">
          Breaking
        </span>
      </div>
      <div className="group/ticker relative flex-1 overflow-hidden">
        <div className="flex w-max animate-ticker items-center gap-8 py-2 pl-5 group-hover/ticker:[animation-play-state:paused]">
          {track.map((article, index) => (
            <Link
              key={`${article.id}-${index}`}
              to={`/article/${article.id}`}
              className="whitespace-nowrap font-serif text-[15px] italic text-ink transition-colors hover:text-accent"
            >
              {article.title}
            </Link>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-surface to-transparent" />
      </div>
    </div>
  );
}