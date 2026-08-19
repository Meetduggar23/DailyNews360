import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import { relativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/lib/categories";
import type { NewsArticle } from "@/types";

interface ArticleCardProps {
  article: NewsArticle;
  variant?: "standard" | "featured" | "list" | "compact";
  showImage?: boolean;
  className?: string;
}

/**
 * Newspaper-style article blocks. Headline-first, serif typography,
 * integrated images, compact metadata. No decorative "Read more" buttons.
 */
export function ArticleCard({
  article,
  variant = "standard",
  showImage = true,
  className,
}: ArticleCardProps) {
  if (variant === "featured") {
    return (
      <article className={cn("group", className)}>
        <Link to={`/article/${article.id}`} className="block">
          <div className="overflow-hidden">
            <ImageWithFallback
              src={article.imageUrl}
              alt={article.title}
              aspect="aspect-[16/9]"
              className="transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <p className="mt-4 font-sans text-xs font-bold uppercase tracking-widest text-accent">
            {categoryLabel(article.category)}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold leading-tight text-ink transition-colors group-hover:text-accent md:text-4xl">
            {article.title}
          </h2>
          {article.description ? (
            <p className="mt-3 line-clamp-3 max-w-3xl font-serif text-[17px] leading-relaxed text-secondary">
              {article.description}
            </p>
          ) : null}
          <p className="mt-3 font-sans text-xs text-mist">
            By {article.author ?? article.sourceName} • {relativeTime(article.publishedAt)}
          </p>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group flex items-baseline justify-between gap-3", className)}>
        <Link to={`/article/${article.id}`} className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
            {article.title}
          </h3>
          <p className="mt-1 font-sans text-xs text-mist">
            {relativeTime(article.publishedAt)}
          </p>
        </Link>
        <BookmarkButton article={article} size="sm" className="shrink-0" />
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className={cn("group flex gap-4", className)}>
        <Link to={`/article/${article.id}`} className="flex min-w-0 flex-1 gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
              {categoryLabel(article.category)}
            </p>
            <h3 className="mt-1 line-clamp-3 font-serif text-lg font-bold leading-snug text-ink transition-colors group-hover:text-accent">
              {article.title}
            </h3>
            {article.description ? (
              <p className="mt-1.5 line-clamp-2 font-sans text-sm leading-relaxed text-secondary">
                {article.description}
              </p>
            ) : null}
            <p className="mt-2 font-sans text-xs text-mist">
              {article.sourceName} • {relativeTime(article.publishedAt)}
            </p>
          </div>
          {showImage ? (
            <div className="h-20 w-28 shrink-0 overflow-hidden sm:h-24 sm:w-36">
              <ImageWithFallback
                src={article.imageUrl}
                alt={article.title}
                aspect="aspect-[4/3]"
                className="h-full"
              />
            </div>
          ) : null}
        </Link>
        <BookmarkButton article={article} size="sm" className="shrink-0" />
      </article>
    );
  }

  // standard editorial block
  return (
    <article className={cn("group", className)}>
      <Link to={`/article/${article.id}`} className="block">
        {showImage ? (
          <div className="mb-3 overflow-hidden">
            <ImageWithFallback
              src={article.imageUrl}
              alt={article.title}
              aspect="aspect-[16/10]"
              className="transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        ) : null}
        <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
          {categoryLabel(article.category)}
        </p>
        <h3 className="mt-1.5 line-clamp-3 font-serif text-[19px] font-bold leading-snug text-ink transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        {article.description ? (
          <p className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-secondary">
            {article.description}
          </p>
        ) : null}
        <p className="mt-2 font-sans text-xs text-mist">
          {article.sourceName} • {relativeTime(article.publishedAt)}
        </p>
      </Link>
    </article>
  );
}