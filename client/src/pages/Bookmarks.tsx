import * as React from "react";
import { Link } from "react-router-dom";
import { Bookmark, Search } from "lucide-react";
import { useBookmarkStore } from "@/stores/bookmark.store";
import { useAuthStore } from "@/stores/auth.store";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/date";
import { CATEGORIES } from "@/constants";

interface BookmarkItem {
  articleId: string;
  title: string;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string | null;
  savedAt: string;
}

export function BookmarksPage() {
  const user = useAuthStore((state) => state.user);
  const serverBookmarks = useBookmarkStore((state) => state.serverBookmarks);
  const localBookmarks = useBookmarkStore((state) => state.localBookmarks);
  const hydrated = useBookmarkStore((state) => state.hydrated);

  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");

  const items: BookmarkItem[] = user
    ? serverBookmarks.map((b) => ({
        articleId: b.articleId,
        title: b.title,
        imageUrl: b.imageUrl,
        sourceName: b.sourceName,
        publishedAt: b.publishedAt,
        savedAt: b.createdAt,
      }))
    : localBookmarks;

  const filtered = items.filter((item) => {
    const matchesQuery =
      !query.trim() || item.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      category === "all" || item.sourceName.toLowerCase().includes(category.toLowerCase());
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="container-news py-8">
      <header className="mb-8 border-b border-line pb-6">
        <div className="flex items-center gap-3">
          <Bookmark className="h-6 w-6 text-accent" aria-hidden="true" />
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">Bookmarks</h1>
            <p className="mt-1 text-sm text-mist">
              {user
                ? "Your saved stories, synced to your account."
                : "Stories you've saved on this device."}
            </p>
          </div>
        </div>
        {!user && (
          <p className="mt-3 text-xs text-mist">
            <Link to="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>{" "}
            to sync your bookmarks across devices.
          </p>
        )}
      </header>

      {/* Search + filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bookmarks…"
            aria-label="Search bookmarks"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCategory("all")}
            className={
              category === "all"
                ? "rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-full border border-line px-3 py-1.5 text-xs font-medium text-mist"
            }
          >
            All
          </button>
          {CATEGORIES.slice(0, 6).map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.label)}
              className={
                category === c.label
                  ? "rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white"
                  : "rounded-full border border-line px-3 py-1.5 text-xs font-medium text-mist"
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {!hydrated ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          kind="noBookmarks"
          title={query ? "No bookmarks match your search." : "Your reading list is empty."}
          message={
            query
              ? "Try a different search term or clear your filter."
              : "Bookmark stories to save them here."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => (
            <article
              key={item.articleId}
              className="flex flex-col gap-4 rounded-xl bg-surface p-3 shadow-card sm:flex-row sm:items-center"
            >
              <Link to={`/article/${item.articleId}`} className="flex flex-1 gap-4">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                  <ImageWithFallback src={item.imageUrl} alt={item.title} aspect="aspect-[4/3]" className="h-full" />
                </div>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-ink hover:text-accent">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-mist">
                    {item.sourceName} •{" "}
                    {item.publishedAt ? relativeTime(item.publishedAt) : "Saved story"}
                  </p>
                </div>
              </Link>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={item.articleUrl} target="_blank" rel="noopener noreferrer">
                    Source
                  </a>
                </Button>
                <BookmarkRemoveButton articleId={item.articleId} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkRemoveButton({ articleId }: { articleId: string }) {
  const toggle = useBookmarkStore((state) => state.toggle);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        const item = useBookmarkStore
          .getState()
          .serverBookmarks.find((b) => b.articleId === articleId);
        const local = useBookmarkStore
          .getState()
          .localBookmarks.find((b) => b.articleId === articleId);
        if (item || local) {
          void toggle({
            id: articleId,
            title: item?.title ?? local?.title ?? "",
            articleUrl: item?.articleUrl ?? local?.articleUrl ?? "",
            imageUrl: item?.imageUrl ?? local?.imageUrl ?? null,
            sourceName: item?.sourceName ?? local?.sourceName ?? "",
            publishedAt: item?.publishedAt ?? local?.publishedAt ?? null,
            description: null,
            content: null,
            sourceUrl: item?.articleUrl ?? local?.articleUrl ?? "",
            author: null,
            category: "top",
            country: null,
            language: null,
            provider: "bookmark",
          });
        }
      }}
    >
      Remove
    </Button>
  );
}