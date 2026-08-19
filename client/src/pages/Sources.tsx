import { useSources } from "@/hooks/useNews";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageMeta } from "@/hooks/usePageMeta";

export function SourcesPage() {
  const query = useSources();

  usePageMeta({
    title: "News sources",
    description:
      "DailyNews360 aggregates headlines from trusted news sources. Original reporting belongs to each publisher.",
  });

  return (
    <div className="container-news py-8">
      <header className="mb-8 border-b-2 border-ink pb-4 dark:border-ink/80">
        <p className="font-sans text-xs font-bold uppercase tracking-widest text-accent">
          DailyNews360 — Masthead
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-wide text-ink md:text-5xl">
          News Sources
        </h1>
        <p className="mt-2 max-w-2xl font-serif text-base italic text-secondary">
          DailyNews360 aggregates headlines from the sources below. Original reporting belongs
          to each publisher.
        </p>
      </header>

      {query.isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded" />
          ))}
        </div>
      )}

      {!query.isLoading && query.isError && (
        <EmptyState kind="error" onRetry={() => void query.refetch()} />
      )}

      {!query.isLoading && query.data && (
        <>
          <div className="mb-6 font-sans text-xs uppercase tracking-widest text-mist">
            Active providers:{" "}
            <span className="font-bold text-ink">
              {query.data.providers.map((p) => p.name).join(", ")}
            </span>
          </div>

          {query.data.sources.length === 0 ? (
            <EmptyState kind="empty" />
          ) : (
            <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {query.data.sources.map((source) => (
                <li
                  key={source.name}
                  className="flex items-center justify-between gap-4 bg-paper p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-serif text-base font-bold text-ink">
                      {source.name}
                    </p>
                    <p className="font-sans text-xs text-mist">via {source.provider}</p>
                  </div>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 font-sans text-xs font-semibold uppercase tracking-wide text-accent hover:underline"
                    >
                      Visit
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