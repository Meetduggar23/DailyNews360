import * as React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Clock, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { useBookmarkStore } from "@/stores/bookmark.store";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeTime } from "@/lib/date";
import { INTEREST_CATEGORIES } from "@/constants";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const bookmarks = useBookmarkStore((state) => state.serverBookmarks);

  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: () => api.preferences(),
    enabled: Boolean(user),
  });

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: () => api.history(10),
    enabled: Boolean(user),
  });

  if (!user) {
    return (
      <div className="container-news py-16">
        <EmptyState
          title="Sign in to see your profile"
          message="Create a free account to bookmark stories, save interests and build your feed."
          action={{ label: "Create an account", onClick: () => (window.location.href = "/register") }}
        />
      </div>
    );
  }

  const interests = preferencesQuery.data?.categories ?? [];

  return (
    <div className="container-news py-8">
      <header className="mb-8 flex flex-col items-start gap-4 rounded-xl bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} className="h-14 w-14 text-lg" />
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink">{user.name}</h1>
            <p className="text-sm text-mist">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link to="/settings">
            <SettingsIcon className="h-4 w-4" aria-hidden="true" />
            Account settings
          </Link>
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Interests */}
        <section className="rounded-xl bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              Your interests
            </h2>
            <Link to="/for-you" className="text-xs font-medium text-accent hover:underline">
              Manage
            </Link>
          </div>
          {preferencesQuery.isLoading ? (
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          ) : interests.length === 0 ? (
            <p className="text-sm text-mist">
              No interests selected yet.{" "}
              <Link to="/for-you" className="text-accent hover:underline">
                Choose topics
              </Link>{" "}
              to personalize your feed.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span key={interest} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  {INTEREST_CATEGORIES.find((c) => c === interest) ?? interest}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Reading history */}
        <section className="rounded-xl bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
              Recent reading
            </h2>
            <Link to="/settings" className="text-xs font-medium text-accent hover:underline">
              Manage
            </Link>
          </div>
          {historyQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (historyQuery.data?.history.length ?? 0) === 0 ? (
            <p className="text-sm text-mist">No reading history yet. Open a story to get started.</p>
          ) : (
            <ul className="divide-y divide-line">
              {historyQuery.data?.history.slice(0, 5).map((entry) => (
                <li key={entry.articleId} className="flex items-center justify-between py-2">
                  <Link
                    to={`/article/${entry.articleId}`}
                    className="min-w-0 truncate text-sm text-ink hover:text-accent"
                  >
                    {entry.category ?? "Story"}
                  </Link>
                  <span className="shrink-0 pl-3 text-xs text-mist">
                    {relativeTime(entry.viewedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Saved articles summary */}
      <section className="mt-6 rounded-xl bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Bookmark className="h-4 w-4 text-accent" aria-hidden="true" />
            Saved articles
          </h2>
          <Link to="/bookmarks" className="text-xs font-medium text-accent hover:underline">
            View all ({bookmarks.length})
          </Link>
        </div>
      </section>
    </div>
  );
}