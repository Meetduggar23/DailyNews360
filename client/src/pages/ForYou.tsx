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
      <header className="mb-8 border-b border-line pb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">For You</h1>
            <p className="mt-1 text-sm text-mist">{BRAND.taglineAlternative}</p>
          </div>
        </div>
      </header>

      {/* Interest selector */}
      <section className="mb-10 rounded-xl bg-surface p-6 shadow-card" aria-label="Your interests">
        <h2 className="text-sm font-semibold text-ink">What are you interested in?</h2>
        <p className="mb-4 mt-1 text-xs text-mist">
          Pick topics and we'll surface the stories that matter most to you.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INTEREST_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => toggleInterest(category)}
              aria-pressed={selected.includes(category)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line/40",
                selected.includes(category) &&
                  "border-accent/40 bg-accent/10 text-accent",
              )}
            >
              {INTEREST_LABELS[category]}
              {selected.includes(category) && (
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
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
          <h2 className="mb-5 flex items-center gap-3 font-serif text-2xl font-bold text-ink">
            <span className="h-6 w-1 rounded-full bg-accent" aria-hidden="true" />
            Your daily feed
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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