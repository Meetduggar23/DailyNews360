import { Link } from "react-router-dom";
import { useTrending } from "@/hooks/useNews";
import { ArticleCard } from "@/components/news/ArticleCard";
import { SkeletonGrid } from "@/components/common/SkeletonStates";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionTitle } from "@/components/common/SectionTitle";
import { usePageMeta } from "@/hooks/usePageMeta";

export function TrendingPage() {
  const query = useTrending(20);

  usePageMeta({
    title: "Trending",
    description: "The stories gaining momentum right now, ranked by freshness and reader interest.",
  });

  const articles = query.data?.articles ?? [];
  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="container-news py-8">
      <header className="mb-8 border-b-2 border-ink pb-4 dark:border-ink/80">
        <p className="font-sans text-xs font-bold uppercase tracking-widest text-accent">
          DailyNews360 — Most Read
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-wide text-ink md:text-5xl">
          Trending
        </h1>
        <p className="mt-2 max-w-2xl font-serif text-base italic text-secondary">
          The stories gaining momentum right now, ranked by freshness and reader interest.
        </p>
      </header>

      {query.isLoading && <SkeletonGrid count={6} />}

      {!query.isLoading && query.isError && (
        <EmptyState kind="error" onRetry={() => void query.refetch()} />
      )}

      {!query.isLoading && !query.isError && articles.length === 0 && (
        <EmptyState kind="empty" />
      )}

      {!query.isLoading && !query.isError && articles.length > 0 && (
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Lead story */}
          <div className="lg:col-span-2">
            {lead ? <ArticleCard article={lead} variant="featured" showImage /> : null}
          </div>

          {/* Ranked list */}
          <ol className="border-l-2 border-line pl-6">
            {rest.slice(0, 6).map((article, index) => (
              <li key={article.id} className="border-b border-line/70 last:border-b-0">
                <Link
                  to={`/article/${article.id}`}
                  className="group flex items-baseline gap-4 py-3"
                >
                  <span className="font-serif text-3xl font-bold leading-none text-line transition-colors group-hover:text-accent">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-serif text-[16px] font-semibold leading-snug text-ink group-hover:text-accent">
                      {article.title}
                    </h3>
                    <p className="mt-0.5 font-sans text-xs text-mist">{article.sourceName}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>

          {/* Remainder grid */}
          {rest.length > 6 ? (
            <div className="mt-6 lg:col-span-3">
              <SectionTitle title="More Trending" />
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {rest.slice(6, 15).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}