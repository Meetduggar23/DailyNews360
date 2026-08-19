import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NavItem } from "./navigationConfig";

interface CategoryNavigationProps {
  items: NavItem[];
  onNavigate: (item: NavItem) => void;
  className?: string;
  /** Smaller text used for secondary sections (e.g. EXPLORE). */
  compact?: boolean;
}

/**
 * Editorial category list: serif, uppercase, hover translate + accent arrow,
 * active indicator, optional expandable subcategories.
 */
export function CategoryNavigation({
  items,
  onNavigate,
  className,
  compact = false,
}: CategoryNavigationProps) {
  return (
    <ul className={cn("grid", className)}>
      {items.map((item) => (
        <CategoryItem
          key={item.to}
          item={item}
          onNavigate={onNavigate}
          compact={compact}
        />
      ))}
    </ul>
  );
}

function CategoryItem({
  item,
  onNavigate,
  compact,
}: {
  item: NavItem;
  onNavigate: (item: NavItem) => void;
  compact: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const isHashLink = item.to.includes("#");

  const label = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        {item.Icon ? <item.Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" /> : null}
        <span className="min-w-0 flex-1">{item.label}</span>
      </span>
      {item.children?.length ? (
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-mist transition-transform duration-200",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      ) : (
        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 -translate-x-1 text-accent opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
    </>
  );

  const sharedClasses = cn(
    "group flex w-full items-center gap-1 border-b border-line/60 py-3 text-left font-serif font-bold uppercase tracking-wide text-ink transition-all duration-200 hover:translate-x-1 hover:text-accent",
    compact ? "text-[13px]" : "text-[15px]",
  );

  return (
    <li>
      {isHashLink ? (
        <Link to={item.to} onClick={() => onNavigate(item)} className={sharedClasses}>
          {label}
        </Link>
      ) : item.children?.length ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className={sharedClasses}
        >
          {label}
        </button>
      ) : (
        <NavLink
          to={item.to}
          end={item.to === "/"}
          onClick={() => onNavigate(item)}
          className={({ isActive }) =>
            cn(
              sharedClasses,
              isActive &&
                "border-b-2 border-accent text-accent hover:translate-x-0 hover:text-accent",
            )
          }
        >
          {label}
        </NavLink>
      )}

      <AnimatePresence initial={false}>
        {item.children?.length && expanded ? (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {item.children.map((child) =>
              child.to.includes("#") ? (
                <li key={child.to}>
                  <Link
                    to={child.to}
                    onClick={() => onNavigate(child)}
                    className="block border-b border-line/40 py-2.5 pl-6 pr-3 font-sans text-sm text-secondary transition-colors hover:text-accent"
                  >
                    {child.label}
                  </Link>
                </li>
              ) : (
                <li key={child.to}>
                  <NavLink
                    to={child.to}
                    onClick={() => onNavigate(child)}
                    className={({ isActive }) =>
                      cn(
                        "block border-b border-line/40 py-2.5 pl-6 pr-3 font-sans text-sm text-secondary transition-colors hover:text-accent",
                        isActive && "text-accent",
                      )
                    }
                  >
                    {child.label}
                  </NavLink>
                </li>
              ),
            )}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </li>
  );
}