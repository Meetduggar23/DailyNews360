import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { relativeTime } from "@/lib/date";
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

interface HeroSectionProps {
  main: NewsArticle;
  secondary: NewsArticle[];
}

export function HeroSection({ main, secondary }: HeroSectionProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-3" aria-label="Top stories">
      {/* Main story */}
      <Link
        to={`/article/${main.id}`}
        className="group relative overflow-hidden rounded-xl bg-surface shadow-card lg:col-span-2"
      >
        <div className="relative overflow-hidden">
          <ImageWithFallback src={main.imageUrl} alt={main.title} aspect="aspect-[16/9]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity group-hover:opacity-80" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
          <Badge variant="soft" className="mb-3 bg-white/20 text-white">
            {categoryLabel(main.category)}
          </Badge>
          <h1 className="font-serif text-2xl font-bold leading-tight md:text-4xl">
            {main.title}
          </h1>
          {main.description ? (
            <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-white/85 md:text-base">
              {main.description}
            </p>
          ) : null}
          <p className="mt-4 flex items-center gap-2 text-xs text-white/80 md:text-sm">
            {main.sourceName}
            <span aria-hidden="true">•</span>
            {relativeTime(main.publishedAt)}
          </p>
        </div>
      </Link>

      {/* Secondary stories */}
      <div className="flex flex-col gap-4">
        {secondary.slice(0, 3).map((story) => (
          <Link
            key={story.id}
            to={`/article/${story.id}`}
            className="group flex gap-4 rounded-xl bg-surface p-3 shadow-card transition-shadow hover:shadow-lifted"
          >
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
              <ImageWithFallback src={story.imageUrl} alt={story.title} aspect="aspect-[4/3]" className="h-full" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-accent">
                {categoryLabel(story.category)}
              </span>
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-accent">
                {story.title}
              </h3>
              <p className="mt-auto flex items-center gap-1 pt-1 text-xs text-mist">
                {story.sourceName} • {relativeTime(story.publishedAt)}
              </p>
            </div>
          </Link>
        ))}

        <Link
          to="/category/top"
          className="group mt-auto flex items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm font-medium text-mist transition-colors hover:border-accent hover:text-accent"
        >
          Browse all top stories
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}