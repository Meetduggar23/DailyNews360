import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { CATEGORY_NAV_ITEMS } from "./categoryNavigationData";

/**
 * Centered category navigation strip below the masthead.
 * Horizontally scrollable on narrow viewports with hidden scrollbar.
 */
export function CategoryNavbar() {
  const location = useLocation();

  return (
    <nav
      aria-label="Category navigation"
      className="category-navbar border-b border-line bg-paper"
    >
      <div className="mx-auto flex w-full justify-center">
        <ul className="flex items-center gap-x-5 whitespace-nowrap px-4 py-2.5 sm:gap-x-6 md:gap-x-7">
          {CATEGORY_NAV_ITEMS.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);

            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-widest transition-colors duration-150 hover:text-accent sm:text-xs ${
                    isActive ? "text-accent" : "text-secondary"
                  }`}
                >
                  {item.icon && (
                    <Sparkles
                      className="h-3 w-3"
                      aria-hidden="true"
                    />
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
