import { Link } from "react-router-dom";
import { BRAND } from "@/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  showTagline?: boolean;
}

/**
 * Brand logo: the DailyNews360 mark with the approved primary tagline.
 * Rendered from the brand image asset; works on light and dark backgrounds.
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
        <img
          src="/logo360.png"
          alt="DailyNews360"
          width={220}
          height={220}
          className="h-auto w-32 max-w-[11rem] md:w-40"
        />
      </Link>
      {showTagline && (
        <p className="mt-1 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-mist">
          {BRAND.tagline}
        </p>
      )}
    </div>
  );
}