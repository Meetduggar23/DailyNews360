import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { relativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  top: "Top Stories",
  technology: "Technology",
  business: "Business",
  sports: "Sports",
  entertainment: "Entertainment",
  health: "Health",
  science: "Science",
  world: "World",
  india: "India",
  politics: "Politics",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

interface EditorialRowProps {
  article: NewsArticle;
  /** When set, renders a numbered ranking instead of the category kicker. */
  rank?: number;
  showThumbnail?: boolean;
  className?: string;
}

/**
 * Compact editorial row used by the LATEST NEWS and MOST READ sections:
 * timestamp + category kicker (or ranking number) + headline + source.
 */
export function EditorialRow({
  article,
  rank,
  showThumbnail = false,
  className,
}: EditorialRowProps) {
  return (
    <article className={cn("group flex items-center gap-4", className)}>
      <Link to={`/article/${article.id}`} className="flex min-w-0 flex-1 items-center gap-4">
        {rank !== undefined ? (
          <span className="w-7 shrink-0 text-right font-serif text-2xl font-bold leading-none text-line transition-colors group-hover:text-accent">
            {String(rank).padStart(2, "0")}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          {rank === undefined ? (
            <p className="flex items-baseline gap-2 font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
              {categoryLabel(article.category)}
              <span className="font-normal normal-case tracking-normal text-mist">
                {relativeTime(article.publishedAt)}
              </span>
            </p>
          ) : null}
          <h3 className="mt-0.5 line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent sm:text-base">
            {article.title}
          </h3>
          <p className="mt-0.5 font-sans text-xs text-mist">
            {article.sourceName}
            {rank !== undefined ? ` • ${relativeTime(article.publishedAt)}` : ""}
          </p>
        </div>
        {showThumbnail ? (
          <div className="h-14 w-20 shrink-0 overflow-hidden sm:h-16 sm:w-24">
            <ImageWithFallback
              src={article.imageUrl}
              alt={article.title}
              aspect="aspect-[3/2]"
              className="h-full"
            />
          </div>
        ) : null}
      </Link>
    </article>
  );
}