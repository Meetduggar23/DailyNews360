import { useTrending } from "@/hooks/useNews";
import { ArticleCard } from "@/components/news/ArticleCard";
import { SkeletonGrid } from "@/components/common/SkeletonStates";
import { EmptyState } from "@/components/common/EmptyState";

export function TrendingPage() {
  const query = useTrending(20);

  return (
    <div className="container-news py-8">
      <header className="mb-8 border-b border-line pb-6">
        <h1 className="font-serif text-3xl font-bold text-ink md:text-4xl">Trending</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">
          The stories gaining momentum right now, ranked by freshness and reader interest.
        </p>
      </header>

      {query.isLoading && <SkeletonGrid count={6} />}

      {!query.isLoading && query.isError && (
        <EmptyState kind="error" onRetry={() => void query.refetch()} />
      )}

      {!query.isLoading && !query.isError && (query.data?.articles.length ?? 0) === 0 && (
        <EmptyState kind="empty" />
      )}

      {!query.isLoading && !query.isError && query.data && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.articles.map((article, index) => (
            <div key={article.id} className="relative">
              {index < 3 && (
                <span
                  className="absolute -left-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-accent font-serif text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
              )}
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}