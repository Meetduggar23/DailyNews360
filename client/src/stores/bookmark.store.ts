import { create } from "zustand";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { api } from "@/services/api";
import type { Bookmark, LocalBookmark, NewsArticle } from "@/types";
import { useAuthStore } from "./auth.store";

const LOCAL_KEY = LOCAL_STORAGE_KEYS.bookmarks;
const MERGED_KEY = LOCAL_STORAGE_KEYS.mergedBookmarks;

function loadLocal(): LocalBookmark[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as LocalBookmark[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(bookmarks: LocalBookmark[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(bookmarks));
}

function toLocal(article: NewsArticle): LocalBookmark {
  return {
    articleId: article.id,
    articleUrl: article.articleUrl,
    title: article.title,
    imageUrl: article.imageUrl,
    sourceName: article.sourceName,
    publishedAt: article.publishedAt,
    savedAt: new Date().toISOString(),
  };
}

function fromBookmark(b: Bookmark): LocalBookmark {
  return {
    articleId: b.articleId,
    articleUrl: b.articleUrl,
    title: b.title,
    imageUrl: b.imageUrl,
    sourceName: b.sourceName,
    publishedAt: b.publishedAt,
    savedAt: b.createdAt,
  };
}

interface BookmarkState {
  serverBookmarks: Bookmark[];
  localBookmarks: LocalBookmark[];
  loading: boolean;
  hydrated: boolean;
  isBookmarked: (articleId: string) => boolean;
  toggle: (article: NewsArticle) => Promise<void>;
  refresh: () => Promise<void>;
  clearLocal: () => void;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => {
  const refreshServer = async () => {
    if (!useAuthStore.getState().user) {
      set({ serverBookmarks: [], loading: false });
      return;
    }
    try {
      const { bookmarks } = await api.bookmarks();
      set({ serverBookmarks: bookmarks });
    } catch {
      set({ serverBookmarks: [] });
    }
  };

  return {
    serverBookmarks: [],
    localBookmarks: loadLocal(),
    loading: false,
    hydrated: false,

    isBookmarked: (articleId) => {
      const { serverBookmarks, localBookmarks, hydrated } = get();
      if (!hydrated) return false;
      if (useAuthStore.getState().user) {
        return serverBookmarks.some((b) => b.articleId === articleId);
      }
      return localBookmarks.some((b) => b.articleId === articleId);
    },

    toggle: async (article) => {
      const authed = Boolean(useAuthStore.getState().user);
      const { serverBookmarks, localBookmarks, refresh } = get();

      if (authed) {
        const existing = serverBookmarks.some((b) => b.articleId === article.id);
        if (existing) {
          await api.removeBookmark(article.id);
        } else {
          await api.addBookmark({
            articleId: article.id,
            articleUrl: article.articleUrl,
            title: article.title,
            imageUrl: article.imageUrl,
            sourceName: article.sourceName,
            publishedAt: article.publishedAt,
          });
        }
        await refresh();
        return;
      }

      const existing = localBookmarks.some((b) => b.articleId === article.id);
      const next = existing
        ? localBookmarks.filter((b) => b.articleId !== article.id)
        : [toLocal(article), ...localBookmarks];
      saveLocal(next);
      set({ localBookmarks: next });
    },

    refresh: async () => {
      await refreshServer();
      set({ hydrated: true, loading: false });
    },

    clearLocal: () => {
      localStorage.removeItem(LOCAL_KEY);
      set({ localBookmarks: [] });
    },
  };
});

/**
 * Merges local bookmarks into the account when a user signs in.
 * Uses a persisted flag so the same local bookmarks are not re-uploaded
 * on every page load.
 */
export async function mergeLocalBookmarksIntoAccount(): Promise<void> {
  const auth = useAuthStore.getState();
  if (!auth.user) return;

  const store = useBookmarkStore.getState();
  const local = store.localBookmarks;
  if (local.length === 0) return;

  const alreadyMerged = localStorage.getItem(MERGED_KEY) === "true";
  if (alreadyMerged) {
    // Ensure local list matches what's in the account after merge.
    store.clearLocal();
    return;
  }

  for (const bookmark of local) {
    try {
      await api.addBookmark({
        articleId: bookmark.articleId,
        articleUrl: bookmark.articleUrl,
        title: bookmark.title,
        imageUrl: bookmark.imageUrl,
        sourceName: bookmark.sourceName,
        publishedAt: bookmark.publishedAt,
      });
    } catch {
      // Ignore per-item failures; continue merging the rest.
    }
  }

  localStorage.setItem(MERGED_KEY, "true");
  store.clearLocal();
  await store.refresh();
}