import { NavLink, useLocation } from "react-router-dom";
import { Home, Compass, Search, Bookmark, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/category/top", label: "Explore", Icon: Compass },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/bookmarks", label: "Saved", Icon: Bookmark },
  { to: "/for-you", label: "For You", Icon: Sparkles },
];

/** Minimal fixed bottom navigation for mobile. */
export function MobileNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur safe-bottom lg:hidden"
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
                className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-mist"
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn("h-5 w-5", (isActive || active) && "text-accent")}
                      aria-hidden="true"
                    />
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