import * as React from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  LogIn,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { SearchOverlay } from "@/components/common/SearchBox";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MenuButton } from "@/components/navigation/MenuButton";
import { SideMenu } from "@/components/navigation/SideMenu";
import { CategoryNavbar } from "@/components/navigation/CategoryNavbar";
import { ReadingLens } from "@/components/reading-lens/ReadingLens";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import { ScanSearch, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { useToast } from "@/components/ui/toaster";

function ThemeToggle() {
  const resolved = useThemeStore((state) => state.resolved);
  const toggle = useThemeStore((state) => state.toggle);
  const Icon = resolved === "dark" ? Sun : Moon;
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
      className="inline-flex h-8 w-8 items-center justify-center text-ink transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Signed out", description: "See you soon." });
  };

  if (!user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link to="/login">
          <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
          Sign in
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="flex h-8 items-center rounded-full ring-line transition-shadow hover:ring-1"
        >
          <Avatar name={user.name} className="h-8 w-8 text-xs" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {user.name}
          <span className="block text-xs font-normal text-mist">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="h-4 w-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleLogout()}>
          <LogIn className="h-4 w-4 rotate-180" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function todayLine(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [lensActive, setLensActive] = React.useState(false);
  const [hintVisible, setHintVisible] = React.useState(false);
  const hintTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show first-use magnifier hint once per browser
  React.useEffect(() => {
    const dismissed = localStorage.getItem(LOCAL_STORAGE_KEYS.magnifierHintDismissed);
    if (!dismissed) {
      // Small delay so the masthead renders first
      const t = setTimeout(() => setHintVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Auto-dismiss hint after ~7 seconds
  React.useEffect(() => {
    if (!hintVisible) return;
    hintTimerRef.current = setTimeout(() => setHintVisible(false), 7000);
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    }
  }, [hintVisible]);

  function dismissHint() {
    setHintVisible(false);
    localStorage.setItem(LOCAL_STORAGE_KEYS.magnifierHintDismissed, "true");
  }

  function toggleLens() {
    setLensActive((prev) => !prev);
    if (hintVisible) dismissHint();
  }

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key.toLowerCase() === "m" && !isTyping) {
        event.preventDefault();
        setLensActive((prev) => !prev);
        if (hintVisible) dismissHint();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hintVisible]);

  return (
    <>
      {/* Masthead */}
      <header className="border-b border-line bg-paper">
        <div className="container-news">
          {/* Top utility row */}
          <div className="relative flex items-center justify-between gap-4 py-2 text-[11px] uppercase tracking-wider text-mist">
            {/* Mobile: brand left, actions right */}
            <div className="flex w-full items-center justify-between md:hidden">
              <Link
                to="/"
                aria-label="DailyNews360 home"
                className="whitespace-nowrap font-times text-xl font-bold uppercase tracking-[0.04em] text-ink"
                style={{ wordSpacing: "0.12em" }}
              >
                DAILY NEWS360
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="inline-flex h-8 w-8 items-center justify-center text-ink transition-colors hover:text-accent"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
                <ThemeToggle />
                <MenuButton open={menuOpen} onClick={() => setMenuOpen((value) => !value)} />
              </div>
            </div>

            {/* Desktop: date left, tagline center, actions right */}
            <p className="hidden md:block">{todayLine()}</p>
            <p className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-[11px] uppercase tracking-wider text-mist md:block">
              Every Story. Every Angle.
            </p>
            <div className="hidden items-center gap-4 md:flex">
              <span aria-hidden="true" className="hidden h-4 w-px bg-line lg:block" />
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center gap-2 text-ink transition-colors hover:text-accent"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
              <Link
                to="/bookmarks"
                aria-label="Bookmarks"
                className="inline-flex items-center gap-2 text-ink transition-colors hover:text-accent"
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                Saved
              </Link>
              <ThemeToggle />
              <UserMenu />
              <span aria-hidden="true" className="h-5 w-px bg-line" />
              <MenuButton open={menuOpen} onClick={() => setMenuOpen((value) => !value)} />
            </div>
          </div>

          {/* Masthead brand */}
          <div className="border-y border-line py-5 md:py-6">
            <Logo
              wide
              rightSlot={
                <div className="relative">
                  <button
                    onClick={toggleLens}
                    aria-label={lensActive ? "Close reading magnifier" : "Open reading magnifier"}
                    aria-pressed={lensActive}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 ${
                      lensActive
                        ? "border-accent bg-accent text-white shadow-lg"
                        : "border-line bg-surface text-ink shadow-sm hover:border-accent hover:text-accent"
                    }`}
                  >
                    <ScanSearch className="h-[18px] w-[18px]" aria-hidden="true" />
                  </button>

                  {/* First-use magnifier hint tooltip */}
                  {hintVisible && !lensActive && (
                    <div
                      role="tooltip"
                      className="absolute right-0 top-full z-[60] mt-3 w-[260px] animate-in fade-in slide-in-from-top-1 rounded-lg border border-line bg-surface px-4 py-3 shadow-lg"
                      style={{ animationDuration: "180ms" }}
                    >
                      {/* Arrow pointing up to the button */}
                      <div className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l border-t border-line bg-surface" />

                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-sm font-bold text-ink">
                          Read with Magnifier
                        </h3>
                        <button
                          onClick={dismissHint}
                          aria-label="Dismiss magnifier tip"
                          className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-mist transition-colors hover:text-ink"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="mt-1.5 font-sans text-xs leading-relaxed text-secondary">
                        Move the magnifying glass over any news to zoom in and read it more clearly.
                      </p>
                      <p className="mt-2 font-sans text-[11px] text-mist">
                        Click <span className="font-medium text-ink">&#128269;</span> to start
                      </p>
                    </div>
                  )}
                </div>
              }
            />
          </div>
        </div>
      </header>

      <CategoryNavbar />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Reading Lens overlay */}
      <ReadingLens active={lensActive} onClose={() => setLensActive(false)} />

      {/* Hidden affordance: skip link for keyboard users to open the menu. */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-[100] focus:rounded focus:bg-accent focus:px-3 focus:py-1 focus:text-sm focus:text-white"
      >
        Open navigation menu
      </button>
    </>
  );
}