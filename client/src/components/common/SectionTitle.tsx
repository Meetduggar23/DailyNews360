import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  viewAllTo?: string;
  className?: string;
}

/**
 * Newspaper section heading: uppercase serif label over a full rule,
 * with an understated "View all" link on the right.
 */
export function SectionTitle({ title, viewAllTo, className }: SectionTitleProps) {
  return (
    <div className={cn("mb-4 border-b-2 border-ink pb-2 dark:border-ink/80", className)}>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wide text-ink md:text-[1.65rem]">
          {title}
        </h2>
        {viewAllTo ? (
          <Link
            to={viewAllTo}
            className="shrink-0 pb-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-mist transition-colors hover:text-accent"
          >
            View all →
          </Link>
        ) : null}
      </div>
    </div>
  );
}