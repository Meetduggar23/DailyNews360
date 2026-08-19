import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useSearchNews } from "@/hooks/useNews";
import { ArticleCard } from "@/components/news/ArticleCard";
import { SkeletonGrid } from "@/components/common/SkeletonStates";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, SORT_OPTIONS } from "@/constants";
import { usePageMeta } from "@/hooks/usePageMeta";
import { debounce, cn } from "@/lib/utils";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";

  usePageMeta({
    title: q ? `Search: ${q}` : "Search news",
    description: "Search across thousands of headlines from trusted news sources.",
  });
  const [input, setInput] = React.useState(q);
  const [debounced, setDebounced] = React.useState(q);

  const category = searchParams.get("category") ?? "";
  const source = searchParams.get("source") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const sort = searchParams.get("sort") ?? "relevance";

  // Debounce search input so we don't fire an API request on every keystroke.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("q", input.trim());
            return next;
          },
          { replace: true },
        );
        setDebounced(input.trim());
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [input, setSearchParams]);

  const query = useSearchNews(
    {
      q: debounced || q,
      category: category || undefined,
      sources: source || undefined,
      from: from || undefined,
      to: to || undefined,
      sort,
      pageSize: 18,
    },
    Boolean(q || debounced),
  );

  const articles = query.data?.articles ?? [];
  const total = query.data?.total ?? 0;

  const setParam = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  const clearAll = () => {
    setInput("");
    setDebounced("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const hasActiveFilters = Boolean(category || source || from || to);

  return (
    <div className="container-news py-8">
      <h1 className="font-serif text-3xl font-bold text-ink">Search news</h1>

      {/* Search field */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            setDebounced(input.trim());
            setParam("q", input.trim());
          }
        }}
        className="relative mt-5"
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
          aria-hidden="true"
        />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search news…"
          aria-label="Search news"
          className="h-12 pl-10 pr-10 text-base"
          autoFocus
        />
        {input ? (
          <button
            type="button"
            onClick={() => setInput("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-mist hover:bg-line/50 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </form>

      {/* Suggestions */}
      <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Suggested searches">
        <span className="text-xs font-medium text-mist">Suggestions:</span>
        {["AI", "markets", "climate", "space", "cricket", "elections"].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setInput(suggestion);
              setDebounced(suggestion);
              setParam("q", suggestion);
            }}
            className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-mist transition-colors hover:border-accent hover:text-accent"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Category / source / date filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge variant="neutral">Category</Badge>
        <select
          value={category}
          onChange={(e) => setParam("category", e.target.value)}
          aria-label="Filter by category"
          className="h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink"
        >
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>

        <Input
          value={source}
          onChange={(e) => setParam("source", e.target.value)}
          placeholder="Source"
          aria-label="Filter by source"
          className="h-9 w-32"
        />

        <Input
          type="date"
          value={from}
          onChange={(e) => setParam("from", e.target.value)}
          aria-label="From date"
          className="h-9 w-40"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => setParam("to", e.target.value)}
          aria-label="To date"
          className="h-9 w-40"
        />

        <div className="flex items-center gap-1 rounded-lg bg-line/50 p-1" role="group" aria-label="Sort">
          {SORT_OPTIONS.filter((s) => s.value !== "latest").map((option) => (
            <button
              key={option.value}
              onClick={() => setParam("sort", option.value)}
              aria-pressed={sort === option.value}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium text-mist transition-colors",
                sort === option.value && "bg-surface text-ink shadow-sm",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="mt-8">
        {q || debounced ? (
          <>
            <div className="mb-5 flex items-baseline gap-2">
              <h2 className="font-serif text-lg font-bold text-ink">
                Results for “{debounced || q}”
              </h2>
              {total > 0 && <span className="text-xs text-mist">({total} stories)</span>}
            </div>

            {query.isLoading && <SkeletonGrid count={6} />}

            {!query.isLoading && query.isError && (
              <EmptyState kind="error" onRetry={() => void query.refetch()} />
            )}

            {!query.isLoading && !query.isError && articles.length === 0 && (
              <EmptyState kind="noResults" />
            )}

            {!query.isLoading && !query.isError && articles.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="Start searching"
            message="Type a keyword above to search across thousands of headlines."
          />
        )}
      </div>
    </div>
  );
}