import * as React from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { useCategoryNews } from "@/hooks/useNews";
import { ArticleCard } from "@/components/news/ArticleCard";
import { SkeletonGrid } from "@/components/common/SkeletonStates";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORIES, SORT_OPTIONS } from "@/constants";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  top: "The most important stories from across the world, updated constantly.",
  technology: "AI, chips, gadgets, startups and the future of computing.",
  business: "Markets, companies, economy and the world of work.",
  sports: "Match results, transfers, records and the stories behind the games.",
  entertainment: "Movies, music, television and everything in between.",
  health: "Medical breakthroughs, wellness and public health news.",
  science: "Space, discovery and the questions we're still answering.",
  world: "Global events and international affairs.",
  india: "News from across India — politics, business and culture.",
  politics: "Government, policy and the political landscape.",
  trending: "The stories everyone is talking about right now.",
};

interface Filters {
  sources: string;
  from: string;
  to: string;
  country: string;
  language: string;
}

export function CategoryPage() {
  const { category = "top" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const topic = searchParams.get("topic");
  const [sort, setSort] = React.useState("latest");
  const [limit, setLimit] = React.useState(9);
  const [filters, setFilters] = React.useState<Filters>({
    sources: "",
    from: "",
    to: "",
    country: "",
    language: "",
  });
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const query = useCategoryNews(category, {
    pageSize: limit,
    sort,
    sources: filters.sources || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    country: filters.country || undefined,
    language: filters.language || undefined,
  });

  const allArticles = query.data?.articles ?? [];
  // Sub-category (topic) filtering happens client-side over the fetched pool.
  const articles = topic
    ? allArticles.filter((article) =>
        [article.title, article.description ?? "", article.category]
          .join(" ")
          .toLowerCase()
          .includes(topic.toLowerCase()),
      )
    : allArticles;
  const hasMore = query.data?.hasMore ?? false;
  const total = query.data?.total ?? 0;

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const label = CATEGORIES.find((c) => c.slug === category)?.label ?? category;

  usePageMeta({
    title: label,
    description: CATEGORY_DESCRIPTIONS[category],
  });

  const resetFilters = () => {
    setFilters({ sources: "", from: "", to: "", country: "", language: "" });
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const FilterControls = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-source" className="text-xs font-medium text-mist">
          Source
        </label>
        <Input
          id="filter-source"
          placeholder="e.g. TechRadar"
          value={filters.sources}
          onChange={(e) => updateFilter("sources", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-from" className="text-xs font-medium text-mist">
          From date
        </label>
        <Input
          id="filter-from"
          type="date"
          value={filters.from}
          onChange={(e) => updateFilter("from", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-to" className="text-xs font-medium text-mist">
          To date
        </label>
        <Input
          id="filter-to"
          type="date"
          value={filters.to}
          onChange={(e) => updateFilter("to", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-country" className="text-xs font-medium text-mist">
          Country
        </label>
        <Input
          id="filter-country"
          placeholder="e.g. us, in, gb"
          value={filters.country}
          onChange={(e) => updateFilter("country", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-language" className="text-xs font-medium text-mist">
          Language
        </label>
        <Input
          id="filter-language"
          placeholder="e.g. en"
          value={filters.language}
          onChange={(e) => updateFilter("language", e.target.value)}
        />
      </div>
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container-news py-8">
      {/* Category masthead */}
      <header className="mb-8 border-b-2 border-ink pb-4 dark:border-ink/80">
        <p className="font-sans text-xs font-bold uppercase tracking-widest text-accent">
          DailyNews360 — {label}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold uppercase tracking-wide text-ink md:text-5xl">
          {label}
        </h1>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="max-w-2xl font-serif text-base italic text-secondary">
            {CATEGORY_DESCRIPTIONS[category] ?? "The latest stories in this category."}
          </p>
          {total > 0 && <p className="font-sans text-xs text-mist">{total} stories found</p>}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filter sidebar - desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 border border-line bg-surface p-5">
            <div className="mb-4 flex items-center gap-2 border-b border-line pb-3 text-sm font-semibold uppercase tracking-wide text-ink">
              <SlidersHorizontal className="h-4 w-4 text-accent" aria-hidden="true" />
              Filters
            </div>
            {FilterControls}
          </div>
        </aside>

        <div className="lg:col-span-3">
          {/* Sort + mobile filters */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex items-center gap-5 border-b border-line"
              role="group"
              aria-label="Sort stories"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSort(option.value)}
                  aria-pressed={sort === option.value}
                  className={cn(
                    "-mb-px border-b-2 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                    sort === option.value
                      ? "border-accent text-ink"
                      : "border-transparent text-mist hover:text-ink",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile filter drawer */}
          <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
                <DialogDescription>
                  Narrow down stories in {label.toLowerCase()}.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2">{FilterControls}</div>
            </DialogContent>
          </Dialog>

          {topic && (
            <div className="mb-4 inline-flex items-center gap-2 border border-accent/40 bg-accent/5 px-3 py-1.5">
              <span className="font-sans text-xs font-semibold uppercase tracking-wide text-ink">
                Topic: <span className="text-accent">{topic}</span>
              </span>
              <button
                onClick={() => setSearchParams({})}
                aria-label="Clear topic filter"
                className="inline-flex h-5 w-5 items-center justify-center text-mist transition-colors hover:text-accent"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {query.isLoading && <SkeletonGrid count={6} />}

          {!query.isLoading && query.isError && (
            <EmptyState kind="error" onRetry={() => void query.refetch()} />
          )}

          {!query.isLoading && !query.isError && articles.length === 0 && (
            <EmptyState kind="noResults" message="No stories match these filters." />
          )}

          {!query.isLoading && !query.isError && articles.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center border-t border-line pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setLimit((prev) => prev + 9)}
                    disabled={query.isFetching}
                  >
                    {query.isFetching ? "Loading…" : "Load more stories"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Category quick links */}
      <div className="mt-12 border-t border-line pt-6">
        <p className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-mist">
          More sections
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {CATEGORIES.filter((c) => c.slug !== category).map((c, index) => (
            <React.Fragment key={c.slug}>
              {index > 0 && <span className="text-line" aria-hidden="true">|</span>}
              <Link
                to={`/category/${c.slug}`}
                className="font-sans text-sm font-medium text-secondary transition-colors hover:text-accent"
              >
                {c.label}
              </Link>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}