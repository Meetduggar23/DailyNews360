import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { cn } from "@/lib/utils";

const RECENT_KEY = LOCAL_STORAGE_KEYS.recentSearches;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, 8) : [];
  } catch {
    return [];
  }
}

function saveRecent(query: string): void {
  const existing = loadRecent().filter((item) => item.toLowerCase() !== query.toLowerCase());
  localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...existing].slice(0, 8)));
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_KEY);
}

interface SearchBoxProps {
  autoFocus?: boolean;
  onSearch?: () => void;
  className?: string;
}

export function SearchBox({ autoFocus, onSearch, className }: SearchBoxProps) {
  const navigate = useNavigate();
  const [value, setValue] = React.useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    saveRecent(q);
    setValue("");
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onSearch?.();
  };

  return (
    <form role="search" onSubmit={submit} className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoFocus={autoFocus}
        placeholder="Search news…"
        aria-label="Search news"
        className="pl-9 pr-16"
      />
      <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex">
        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear search"
            className="rounded p-1 text-mist hover:bg-line/50 hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
        <kbd className="rounded border border-line bg-line/40 px-1.5 py-0.5 text-[10px] text-mist">
          /
        </kbd>
      </div>
    </form>
  );
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/** Full-screen search overlay used on mobile and via keyboard shortcut. */
export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const navigate = useNavigate();
  const [recent, setRecent] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (open) setRecent(loadRecent());
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const goToQuery = (q: string) => {
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search news"
      className="fixed inset-0 z-[70] flex flex-col bg-paper"
    >
      <div className="container-news flex items-center gap-3 pt-4">
        <SearchBox autoFocus onSearch={onClose} className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>

      <div className="container-news mt-6 flex-1 overflow-y-auto pb-24">
        {recent.length > 0 ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Clock className="h-4 w-4 text-mist" aria-hidden="true" />
                Recent searches
              </h2>
              <button
                onClick={() => {
                  clearRecentSearches();
                  setRecent([]);
                }}
                className="text-xs font-medium text-mist hover:text-ink"
              >
                Clear
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {recent.map((query) => (
                <li key={query}>
                  <button
                    onClick={() => goToQuery(query)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-line/40"
                  >
                    <Search className="h-4 w-4 text-mist" aria-hidden="true" />
                    {query}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-10 text-center">
            <TrendingUp className="h-8 w-8 text-mist/60" aria-hidden="true" />
            <p className="text-sm text-mist">
              Search across thousands of headlines from trusted sources.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}