import * as React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { useFeed } from "@/hooks/useNews";
import { ArticleCard } from "@/components/news/ArticleCard";
import { SkeletonGrid } from "@/components/common/SkeletonStates";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { INTEREST_CATEGORIES, BRAND } from "@/constants";
import { cn } from "@/lib/utils";

const INTEREST_LABELS: Record<string, string> = {
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

export function ForYouPage() {
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: () => api.preferences(),
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  });

  const feedQuery = useFeed();

  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (preferencesQuery.data) {
      setSelected(preferencesQuery.data.categories);
    }
  }, [preferencesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (categories: string[]) => api.updatePreferences(categories),
    onSuccess: () => {
      toast({ title: "Preferences saved", description: "Your feed has been updated." });
      void queryClient.invalidateQueries({ queryKey: ["preferences"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: () => {
      toast({ title: "Couldn't save preferences", variant: "destructive" });
    },
  });

  if (!user) {
    return (
      <div className="container-news py-16">
        <EmptyState
          title="Sign in to build your feed"
          message="Choose your interests and we'll curate a personalized feed of stories."
          action={{
            label: "Create an account",
            onClick: () => (window.location.href = "/register"),
          }}
        />
      </div>
    );
  }

  const toggleInterest = (category: string) => {
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const hasPreferences = (preferencesQuery.data?.categories.length ?? 0) > 0;

  return (
    <div className="container-news py-8">
      <header className="mb-8 border-b-2 border-ink pb-4 dark:border-ink/80">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-4xl font-bold uppercase tracking-wide text-ink">
              For You
            </h1>
            <p className="mt-1 font-serif text-base italic text-secondary">{BRAND.taglineAlternative}</p>
          </div>
        </div>
      </header>

      {/* Interest selector */}
      <section className="mb-10 border border-line bg-surface p-6" aria-label="Your interests">
        <h2 className="border-b border-line pb-3 font-serif text-xl font-bold uppercase tracking-wide text-ink">
          Choose Your Interests
        </h2>
        <p className="mb-4 mt-3 text-sm text-secondary">
          Pick topics and we'll surface the stories that matter most to you.
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          {INTEREST_CATEGORIES.map((category) => {
            const active = selected.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleInterest(category)}
                aria-pressed={active}
                className={cn(
                  "flex items-center justify-between gap-2 border-b border-line/60 py-2.5 text-left font-sans text-sm font-medium transition-colors",
                  active ? "text-accent" : "text-ink hover:text-accent",
                )}
              >
                {INTEREST_LABELS[category]}
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center border",
                    active ? "border-accent bg-accent" : "border-line",
                  )}
                >
                  {active && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button
            onClick={() => saveMutation.mutate(selected)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving…" : "Save interests"}
          </Button>
          {selected.length === 0 && (
            <span className="text-xs text-mist">Select at least one topic to personalize.</span>
          )}
        </div>
      </section>

      {/* Feed */}
      {hasPreferences ? (
        <>
          <h2 className="mb-5 border-b-2 border-ink pb-2 font-serif text-2xl font-bold uppercase tracking-wide text-ink dark:border-ink/80">
            Your Daily Feed
          </h2>

          {feedQuery.isLoading && <SkeletonGrid count={6} />}

          {!feedQuery.isLoading && feedQuery.isError && (
            <EmptyState kind="error" onRetry={() => void feedQuery.refetch()} />
          )}

          {!feedQuery.isLoading &&
            !feedQuery.isError &&
            (feedQuery.data?.articles.length ?? 0) === 0 && (
              <EmptyState
                kind="empty"
                message="Your feed is warming up. Check back soon for personalized stories."
              />
            )}

          {!feedQuery.isLoading &&
            !feedQuery.isError &&
            feedQuery.data &&
            feedQuery.data.articles.length > 0 && (
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {feedQuery.data.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
        </>
      ) : (
        <EmptyState
          title="Your feed starts here."
          message="Select a few topics above to begin personalizing your DailyNews360 feed."
          action={{
            label: "Browse all news",
            onClick: () => (window.location.href = "/"),
          }}
        />
      )}

      <div className="mt-10 flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/settings">Manage feed preferences in settings</Link>
        </Button>
      </div>
    </div>
  );
}