import { useSources } from "@/hooks/useNews";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export function SourcesPage() {
  const query = useSources();

  return (
    <div className="container-news py-8">
      <header className="mb-8 border-b border-line pb-6">
        <h1 className="font-serif text-3xl font-bold text-ink">News sources</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">
          DailyNews360 aggregates headlines from the sources below. Original reporting belongs
          to each publisher.
        </p>
      </header>

      {query.isLoading && (
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-48 rounded-xl" />
          ))}
        </div>
      )}

      {!query.isLoading && query.isError && (
        <EmptyState kind="error" onRetry={() => void query.refetch()} />
      )}

      {!query.isLoading && query.data && (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <p className="text-sm text-mist">
              Active providers:{" "}
              <span className="font-medium text-ink">
                {query.data.providers.map((p) => p.name).join(", ")}
              </span>
            </p>
          </div>

          {query.data.sources.length === 0 ? (
            <EmptyState kind="empty" />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {query.data.sources.map((source) => (
                <li
                  key={source.name}
                  className="flex items-center justify-between rounded-xl bg-surface p-4 shadow-card"
                >
                  <div className="min-w-0">
                    <p className="truncate font-serif text-base font-bold text-ink">
                      {source.name}
                    </p>
                    <p className="text-xs text-mist">via {source.provider}</p>
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-medium text-accent hover:underline"
                    >
                      Visit site
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}