import * as React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bookmark,
  ChevronDown,
  LayoutGrid,
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
import { SearchBox, SearchOverlay } from "@/components/common/SearchBox";
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
import { NAV_LINKS } from "@/constants";
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-line/50"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
          <Link to="/login">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign in
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/register">Join free</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="flex h-9 items-center gap-2 rounded-full ring-line transition-shadow hover:ring-1"
        >
          <Avatar name={user.name} />
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

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-transparent transition-all duration-300",
          scrolled
            ? "border-line bg-paper/80 shadow-sm backdrop-blur-xl"
            : "bg-paper/40 backdrop-blur-md",
        )}
      >
        <div className="container-news flex h-16 items-center justify-between gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line/50 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Logo />

          {/* Desktop search */}
          <div className="hidden flex-1 justify-center px-6 md:flex md:max-w-md">
            <SearchBox
              className="w-full"
              onSearch={() => navigate("/search")}
            />
          </div>

          <nav className="flex items-center gap-1 md:gap-2" aria-label="Primary">
            {/* Categories */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Browse categories"
                  className="hidden h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-ink transition-colors hover:bg-line/50 lg:inline-flex"
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                  Categories
                  <ChevronDown className="h-3.5 w-3.5 text-mist" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                {NAV_LINKS.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link to={link.to}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink
              to="/bookmarks"
              aria-label="Bookmarks"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-line/50"
            >
              <Bookmark className="h-5 w-5" aria-hidden="true" />
            </NavLink>

            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-line/50 md:hidden"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            <ThemeToggle />
            <UserMenu />
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <nav
            aria-label="Mobile menu"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-lifted"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo onClick={() => setMobileOpen(false)} />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line/50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-3 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line/40",
                        isActive && "bg-line/60 text-accent",
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