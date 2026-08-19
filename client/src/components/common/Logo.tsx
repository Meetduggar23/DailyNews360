import { Link } from "react-router-dom";
import { BRAND } from "@/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  showTagline?: boolean;
}

/**
 * Brand wordmark: DAILYNEWS360 set in a large Times Roman-style serif.
 * Used in the masthead and footer; works on light and dark backgrounds.
 */
export function Logo({ className, onClick, showTagline = false }: LogoProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Link
        to="/"
        onClick={onClick}
        aria-label="DailyNews360 home"
        className="transition-opacity hover:opacity-80"
      >
        <span className="font-times text-4xl font-bold uppercase leading-none tracking-tight text-ink sm:text-5xl md:text-6xl">
          DailyNews360
        </span>
      </Link>
      {showTagline && (
        <p className="mt-2 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
          {BRAND.tagline}
        </p>
      )}
    </div>
  );
}