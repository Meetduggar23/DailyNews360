import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { useCategoryNews } from "@/hooks/useNews";
import { ArticleCard } from "@/components/news/ArticleCard";
import { SkeletonGrid } from "@/components/common/SkeletonStates";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
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

  const articles = query.data?.articles ?? [];
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
      {/* Category hero */}
      <header className="mb-8 border-b border-line pb-6">
        <Badge variant="soft" className="mb-3">
          {label}
        </Badge>
        <h1 className="font-serif text-3xl font-bold text-ink md:text-4xl">{label}</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">
          {CATEGORY_DESCRIPTIONS[category] ?? "The latest stories in this category."}
        </p>
        {total > 0 && <p className="mt-3 text-xs text-mist">{total} stories found</p>}
      </header>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Filter sidebar - desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
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
              className="flex items-center gap-1 rounded-lg bg-line/50 p-1"
              role="group"
              aria-label="Sort stories"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSort(option.value)}
                  aria-pressed={sort === option.value}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium text-mist transition-colors",
                    sort === option.value && "bg-surface text-ink shadow-sm",
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

          {query.isLoading && <SkeletonGrid count={6} />}

          {!query.isLoading && query.isError && (
            <EmptyState kind="error" onRetry={() => void query.refetch()} />
          )}

          {!query.isLoading && !query.isError && articles.length === 0 && (
            <EmptyState kind="noResults" message="No stories match these filters." />
          )}

          {!query.isLoading && !query.isError && articles.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setLimit((prev) => prev + 9)}
                    disabled={query.isFetching}
                  >
                    {query.isFetching ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Category quick links */}
      <div className="mt-12 flex flex-wrap gap-2">
        {CATEGORIES.filter((c) => c.slug !== category).map((c) => (
          <Link
            key={c.slug}
            to={`/category/${c.slug}`}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-mist transition-colors hover:border-accent hover:text-accent"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}