import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Moon, Sun, Monitor, Trash2, Check } from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore, type ThemeMode } from "@/stores/theme.store";
import { useBookmarkStore, mergeLocalBookmarksIntoAccount } from "@/stores/bookmark.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { INTEREST_CATEGORIES, LOCAL_STORAGE_KEYS } from "@/constants";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

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

export function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);
  const clearLocalBookmarks = useBookmarkStore((state) => state.clearLocal);

  const [name, setName] = React.useState(user?.name ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [password, setPassword] = React.useState("");

  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: () => api.preferences(),
    enabled: Boolean(user),
  });

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: () => api.history(200),
    enabled: Boolean(user),
  });

  const savePrefs = useMutation({
    mutationFn: (categories: string[]) => api.updatePreferences(categories),
    onSuccess: () => {
      toast({ title: "Feed preferences saved" });
      void queryClient.invalidateQueries({ queryKey: ["preferences"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const saveProfile = useMutation({
    mutationFn: (data: { name?: string; email?: string; password?: string }) =>
      api.updateProfile(data),
    onSuccess: () => {
      toast({ title: "Profile updated" });
      setPassword("");
      void queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
    onError: (error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const clearHistory = useMutation({
    mutationFn: () => api.clearHistory(),
    onSuccess: () => {
      toast({ title: "Reading history cleared" });
      void queryClient.invalidateQueries({ queryKey: ["history"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const toggleInterest = (category: string) => {
    const current = preferencesQuery.data?.categories ?? [];
    const next = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    savePrefs.mutate(next);
  };

  const clearLocalData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.bookmarks);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.recentSearches);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.mergedBookmarks);
    clearLocalBookmarks();
    toast({ title: "Local data cleared" });
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Signed out", description: "See you soon." });
    navigate("/");
  };

  return (
    <div className="container-news max-w-3xl py-8">
      <h1 className="mb-8 font-serif text-3xl font-bold text-ink">Settings</h1>

      {/* Appearance */}
      <section className="mb-6 rounded-xl bg-surface p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-ink">Appearance</h2>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setThemeMode(value)}
              aria-pressed={themeMode === value}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border border-line px-3 py-4 text-sm font-medium text-ink transition-colors hover:bg-line/40",
                themeMode === value && "border-accent/40 bg-accent/10 text-accent",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
              {themeMode === value && <Check className="h-4 w-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </section>

      {/* Account */}
      {user && (
        <section className="mb-6 rounded-xl bg-surface p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-ink">Account</h2>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-mist">Name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-mist">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-mist">
                New password <span className="text-mist/60">(optional)</span>
              </span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </label>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => saveProfile.mutate({ name, email, password: password || undefined })}
                disabled={saveProfile.isPending}
              >
                {saveProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="outline" onClick={() => void handleLogout()}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Feed preferences */}
      <section className="mb-6 rounded-xl bg-surface p-6 shadow-card">
        <h2 className="mb-1 text-sm font-semibold text-ink">Feed preferences</h2>
        <p className="mb-4 text-xs text-mist">
          Choose topics to personalize your For You feed. Changes apply immediately.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {INTEREST_CATEGORIES.map((category) => {
            const active = (preferencesQuery.data?.categories ?? []).includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleInterest(category)}
                aria-pressed={active}
                className={cn(
                  "rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-line/40",
                  active && "border-accent/40 bg-accent/10 text-accent",
                )}
              >
                {INTEREST_LABELS[category]}
              </button>
            );
          })}
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-6 rounded-xl bg-surface p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-ink">Privacy</h2>
        <div className="flex flex-col gap-3">
          {user && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">Clear reading history</p>
                <p className="text-xs text-mist">
                  {historyQuery.data?.history.length ?? 0} entries recorded.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearHistory.mutate()}
                disabled={clearHistory.isPending || (historyQuery.data?.history.length ?? 0) === 0}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">Clear local data</p>
              <p className="text-xs text-mist">
                Removes bookmarks and recent searches stored on this device.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearLocalData}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>
      </section>

      {!user && (
        <Button
          variant="outline"
          onClick={() => {
            // Trigger a merge when the user signs in later.
            void mergeLocalBookmarksIntoAccount();
            navigate("/login");
          }}
        >
          Sign in to sync bookmarks
        </Button>
      )}
    </div>
  );
}