import * as React from "react";
import { Link } from "react-router-dom";
import { Clock, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/date";
import { usePageMeta } from "@/hooks/usePageMeta";
import { categoryLabel } from "@/lib/categories";
import type { NewsArticle } from "@/types";

export function HistoryPage() {
  usePageMeta({ title: "Reading History", description: "Your recently read stories on DailyNews360." });
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: () => api.history(100),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  const clearMutation = useMutation({
    mutationFn: () => api.clearHistory(),
    onSuccess: () => queryClient.setQueryData(["history"], { history: [] }),
  });

  const entries = historyQuery.data?.history ?? [];

  return (
    <div className="container-news py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-4 dark:border-ink/80">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-accent" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl font-bold uppercase tracking-wide text-ink md:text-5xl">
              Reading History
            </h1>
            <p className="mt-1 font-serif text-base italic text-secondary">
              Stories you&rsquo;ve read, most recent first.
            </p>
          </div>
        </div>
        {entries.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {clearMutation.isPending ? "Clearing…" : "Clear history"}
          </Button>
        ) : null}
      </header>

      {historyQuery.isLoading ? (
        <div className="grid grid-cols-1 divide-y divide-line">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="py-5">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton mt-2 h-5 w-full" />
              <div className="skeleton mt-1 h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          kind="empty"
          title="No reading history yet."
          message="Open a story and it will show up here so you can find it again."
        />
      ) : (
        <div className="grid grid-cols-1 divide-y divide-line">
          {entries.map((entry) => (
            <article key={`${entry.articleId}-${entry.viewedAt}`} className="py-4">
              <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-accent">
                {entry.category ? categoryLabel(entry.category) : "Story"}
                {entry.source ? ` • ${entry.source}` : ""}
              </p>
              <Link
                to={`/article/${entry.articleId}`}
                className="group mt-1 block font-serif text-lg font-bold leading-snug text-ink transition-colors hover:text-accent"
              >
                {historyTitle(entry.articleId)}
              </Link>
              <p className="mt-1 font-sans text-xs text-mist">
                {formatDateTime(entry.viewedAt)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/** Local fallback title when history has no stored title (server stores ids only). */
function historyTitle(articleId: string): string {
  try {
    const cache = window.localStorage.getItem("dn360:historyTitles");
    if (cache) {
      const titles = JSON.parse(cache) as Record<string, string>;
      if (titles[articleId]) return titles[articleId];
    }
  } catch {
    // ignore
  }
  return articleId;
}

export type { NewsArticle };