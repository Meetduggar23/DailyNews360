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
      <div className="flex shrink-0 items-center gap-1.5 border-r border-line px-2.5 py-2 sm:gap-2 sm:px-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-accent sm:text-xs">
          Live
        </span>
      </div>
      <div className="group/ticker relative flex-1 overflow-hidden">
        <div className="flex w-max animate-ticker items-center gap-8 py-2 pl-5 group-hover/ticker:[animation-play-state:paused]">
          {track.map((article, index) => (
            <Link
              key={`${article.id}-${index}`}
              to={`/article/${article.id}`}
              className="whitespace-nowrap font-serif text-[13px] italic text-ink transition-colors hover:text-accent sm:text-[15px]"
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