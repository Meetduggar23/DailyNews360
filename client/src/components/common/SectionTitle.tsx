import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  viewAllTo?: string;
  className?: string;
}

export function SectionTitle({ title, viewAllTo, className }: SectionTitleProps) {
  return (
    <div className={cn("mb-5 flex items-center justify-between gap-4", className)}>
      <h2 className="flex items-center gap-3 font-serif text-2xl font-bold text-ink">
        <span className="h-6 w-1 rounded-full bg-accent" aria-hidden="true" />
        {title}
      </h2>
      {viewAllTo ? (
        <Link
          to={viewAllTo}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent/80"
        >
          View all
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}