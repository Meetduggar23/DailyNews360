import * as React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { mergeLocalBookmarksIntoAccount, useBookmarkStore } from "@/stores/bookmark.store";

/**
 * Initializes the app once:
 * - applies the persisted theme
 * - hydrates the auth session
 * - loads server bookmarks (authenticated) and merges any local ones
 */
export function useAppInit() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const refreshBookmarks = useBookmarkStore((state) => state.refresh);
  const initTheme = useThemeStore((state) => state.init);

  React.useEffect(() => {
    initTheme();
  }, [initTheme]);

  React.useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  React.useEffect(() => {
    if (!initialized) return;
    if (user) {
      void (async () => {
        await mergeLocalBookmarksIntoAccount();
        await refreshBookmarks();
      })();
    } else {
      void refreshBookmarks();
    }
  }, [initialized, user, refreshBookmarks]);
}