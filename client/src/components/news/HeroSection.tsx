import { Link } from "react-router-dom";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
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

/**
 * Editorial lead-news grid: one large main story (50-60% of the area),
 * a secondary story with image, then a row of smaller compact stories.
 * Uses thin dividers, not cards.
 */
export function HeroSection({ main, secondary }: HeroSectionProps) {
  const [second, ...rest] = secondary;

  return (
    <section aria-label="Lead stories">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main story */}
        <Link to={`/article/${main.id}`} className="group block lg:col-span-2">
          <div className="overflow-hidden">
            <ImageWithFallback
              src={main.imageUrl}
              alt={main.title}
              aspect="aspect-[16/9]"
              className="transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <p className="mt-4 font-sans text-xs font-bold uppercase tracking-widest text-accent">
            {categoryLabel(main.category)}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-ink transition-colors group-hover:text-accent md:text-[2.6rem] md:leading-[1.1]">
            {main.title}
          </h1>
          {main.description ? (
            <p className="mt-3 line-clamp-3 max-w-3xl font-serif text-[17px] leading-relaxed text-secondary">
              {main.description}
            </p>
          ) : null}
          <p className="mt-3 font-sans text-xs text-mist">
            By {main.author ?? main.sourceName} • {relativeTime(main.publishedAt)}
          </p>
        </Link>

        {/* Secondary story */}
        {second ? (
          <Link
            to={`/article/${second.id}`}
            className="group block border-t-2 border-ink pt-4 dark:border-ink/80"
          >
            <div className="overflow-hidden">
              <ImageWithFallback
                src={second.imageUrl}
                alt={second.title}
                aspect="aspect-[16/10]"
                className="transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <p className="mt-3 font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
              {categoryLabel(second.category)}
            </p>
            <h2 className="mt-1.5 font-serif text-xl font-bold leading-snug text-ink transition-colors group-hover:text-accent">
              {second.title}
            </h2>
            {second.description ? (
              <p className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed text-secondary">
                {second.description}
              </p>
            ) : null}
            <p className="mt-2 font-sans text-xs text-mist">
              {second.sourceName} • {relativeTime(second.publishedAt)}
            </p>
          </Link>
        ) : null}
      </div>

      {/* Compact secondary row */}
      {rest.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(0, 3).map((story) => (
            <Link
              key={story.id}
              to={`/article/${story.id}`}
              className="group flex gap-3 border-l-2 border-line pl-4 transition-colors hover:border-accent"
            >
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
                  {categoryLabel(story.category)}
                </p>
                <h3 className="mt-1 line-clamp-3 font-serif text-[16px] font-bold leading-snug text-ink transition-colors group-hover:text-accent">
                  {story.title}
                </h3>
                <p className="mt-1.5 font-sans text-xs text-mist">
                  {story.sourceName} • {relativeTime(story.publishedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}