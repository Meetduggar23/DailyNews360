import * as React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bookmark,
  LogIn,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { SearchOverlay } from "@/components/common/SearchBox";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_BAR } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const resolved = useThemeStore((state) => state.resolved);
  const toggle = useThemeStore((state) => state.toggle);
  const Icon = resolved === "dark" ? Sun : Moon;
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
      className="inline-flex h-8 w-8 items-center justify-center text-ink transition-colors hover:text-accent"
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
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Masthead */}
      <header className="border-b border-line bg-paper">
        <div className="container-news">
          {/* Top utility row */}
          <div className="flex items-center justify-between gap-4 py-2 text-[11px] uppercase tracking-wider text-mist">
            <p className="hidden md:block">{todayLine()}</p>
            <p className="hidden md:block">India Edition</p>

            {/* Mobile: hamburger + brand */}
            <div className="flex w-full items-center justify-between md:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="inline-flex h-8 w-8 items-center justify-center text-ink"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <Link to="/" aria-label="DailyNews360 home" className="font-times text-2xl font-bold uppercase tracking-tight text-ink">
                DailyNews360
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="inline-flex h-8 w-8 items-center justify-center text-ink"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
                <ThemeToggle />
              </div>
            </div>

            {/* Desktop: date left, actions right */}
            <div className="hidden items-center gap-4 md:flex">
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center gap-2 text-ink transition-colors hover:text-accent"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
              <ThemeToggle />
              <Link
                to="/bookmarks"
                aria-label="Bookmarks"
                className="inline-flex items-center gap-2 text-ink transition-colors hover:text-accent"
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                Saved
              </Link>
              <UserMenu />
            </div>
          </div>

          {/* Masthead brand */}
          <div className="flex justify-center border-y border-line py-5 md:py-6">
            <Logo showTagline />
          </div>
        </div>
      </header>

      {/* Sticky category navigation */}
      <nav
        aria-label="Sections"
        className={cn(
          "sticky top-0 z-50 border-b border-line bg-paper transition-shadow",
          scrolled && "bg-paper/95 shadow-sm backdrop-blur-md",
        )}
      >
        <div className="container-news">
          <div className="flex items-center justify-center gap-5 overflow-x-auto py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_BAR.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap text-[13px] font-semibold uppercase tracking-wide text-secondary transition-colors hover:text-ink",
                    isActive && "text-accent",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <nav
            aria-label="Mobile menu"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                aria-label="DailyNews360 home"
                className="font-times text-2xl font-bold uppercase tracking-tight text-ink"
              >
                DailyNews360
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center text-ink"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-2 py-3">
              {NAV_BAR.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block border-b border-line/60 px-3 py-3 text-sm font-semibold uppercase tracking-wide text-ink",
                        isActive && "text-accent",
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </Button>
            </div>
          </nav>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}