import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types";

function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
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
  return labels[category] ?? category;
}

interface ArticleCardProps {
  article: NewsArticle;
  variant?: "standard" | "featured" | "compact" | "horizontal";
  className?: string;
}

export function ArticleCard({ article, variant = "standard", className }: ArticleCardProps) {
  if (variant === "featured") {
    return (
      <motion.article
        whileHover="hover"
        initial="rest"
        animate="rest"
        className={cn("group relative overflow-hidden rounded-xl bg-surface shadow-card", className)}
      >
        <Link to={`/article/${article.id}`} className="block">
          <div className="relative overflow-hidden">
            <ImageWithFallback src={article.imageUrl} alt={article.title} aspect="aspect-[16/9]" />
            <motion.div
              variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 bg-black/20"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
            <Badge variant="soft" className="mb-2 bg-white/20 text-white">
              {categoryLabel(article.category)}
            </Badge>
            <h2 className="font-serif text-xl font-bold leading-snug md:text-2xl">
              {article.title}
            </h2>
            <p className="mt-2 text-sm text-white/80">
              {article.sourceName} • {relativeTime(article.publishedAt)}
            </p>
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === "compact") {
    return (
      <motion.article
        whileHover="hover"
        initial="rest"
        animate="rest"
        className={cn("group flex gap-3", className)}
      >
        <Link to={`/article/${article.id}`} className="flex min-w-0 flex-1 gap-3">
          <div className="relative w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
            <ImageWithFallback src={article.imageUrl} alt={article.title} aspect="aspect-[4/3]" />
          </div>
          <div className="flex min-w-0 flex-col justify-center">
            <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-accent">
              {categoryLabel(article.category)}
            </span>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-accent">
              {article.title}
            </h3>
            <p className="mt-1 text-xs text-mist">
              {article.sourceName} • {relativeTime(article.publishedAt)}
            </p>
          </div>
        </Link>
        <BookmarkButton article={article} size="sm" className="mt-1 shrink-0" />
      </motion.article>
    );
  }

  if (variant === "horizontal") {
    return (
      <motion.article
        whileHover="hover"
        initial="rest"
        animate="rest"
        className={cn(
          "group flex gap-4 rounded-xl bg-surface p-3 shadow-card transition-shadow hover:shadow-lifted",
          className,
        )}
      >
        <Link to={`/article/${article.id}`} className="flex min-w-0 flex-1 gap-4">
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
            <ImageWithFallback src={article.imageUrl} alt={article.title} aspect="aspect-[4/3]" className="h-full" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-accent">
              {categoryLabel(article.category)}
            </span>
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink group-hover:text-accent">
              {article.title}
            </h3>
            <p className="mt-auto pt-1 text-xs text-mist">
              {article.sourceName} • {relativeTime(article.publishedAt)}
            </p>
          </div>
        </Link>
        <BookmarkButton article={article} size="sm" className="shrink-0" />
      </motion.article>
    );
  }

  // standard
  return (
    <motion.article
      whileHover="hover"
      initial="rest"
      animate="rest"
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-surface shadow-card transition-shadow hover:shadow-lifted",
        className,
      )}
    >
      <Link to={`/article/${article.id}`} className="flex flex-1 flex-col">
        <div className="relative overflow-hidden">
          <ImageWithFallback src={article.imageUrl} alt={article.title} aspect="aspect-[16/10]" />
          <motion.div
            variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="soft">{categoryLabel(article.category)}</Badge>
            <span className="text-xs text-mist">{relativeTime(article.publishedAt)}</span>
          </div>
          <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-ink group-hover:text-accent">
            {article.title}
          </h3>
          {article.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-mist">{article.description}</p>
          ) : null}
          <p className="mt-auto flex items-center gap-1 pt-3 text-xs font-medium text-mist">
            {article.sourceName}
            <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </p>
        </div>
      </Link>
      <div className="absolute right-2.5 top-2.5 rounded-full bg-surface/90 shadow-sm backdrop-blur">
        <BookmarkButton article={article} size="sm" />
      </div>
    </motion.article>
  );
}