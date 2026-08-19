import { NavLink, useLocation } from "react-router-dom";
import { Home, Compass, Bookmark, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/category/top", label: "Explore", Icon: Compass },
  { to: "/bookmarks", label: "Saved", Icon: Bookmark },
  { to: "/for-you", label: "For You", Icon: Sparkles },
  { to: "/profile", label: "Profile", Icon: User },
];

/** Fixed bottom navigation for mobile. Hidden on desktop. */
export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl safe-bottom lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, Icon }) => {
          const active =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <li key={to}>
              <NavLink
                to={to}
                aria-label={label}
                className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-mist transition-colors"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                        (isActive || active) && "bg-accent/10 text-accent",
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className={(isActive || active) ? "text-accent" : ""}>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}