import { Link } from "react-router-dom";
import { BRAND } from "@/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  showTagline?: boolean;
  /** Wide masthead layout: logo far left, wordmark centered with large gap. */
  wide?: boolean;
  /** Content rendered in the right column of the wide masthead layout. */
  rightSlot?: React.ReactNode;
}

/**
 * Brand lockup:
 *
 * Default (compact):
 *   [LOGO]  DAILY NEWS360
 *           Every Story. Every Angle.
 *
 * Wide (masthead):
 *   [LOGO]                         DAILY NEWS360
 *                                  Every Story. Every Angle.
 */
export function Logo({ className, onClick, showTagline = false, wide = false, rightSlot }: LogoProps) {
  const wordmark = (
    <span className="whitespace-nowrap font-times text-xl font-bold uppercase leading-none tracking-[0.04em] text-ink sm:text-3xl md:text-5xl" style={{ wordSpacing: "0.12em" }}>
      DAILY NEWS360
    </span>
  );

  if (wide) {
    return (
      <div
        className={cn(
          "grid w-full grid-cols-[auto_1fr_auto] items-center",
          className,
        )}
      >
        {/* Left: logo anchored to the far left */}
        <Link
          to="/"
          onClick={onClick}
          aria-label="DailyNews360 home"
          className="justify-self-start transition-opacity hover:opacity-80"
        >
          <img
            src="/logo360.png"
            alt="DailyNews360 logo"
            className="h-10 w-10 object-contain sm:h-12 sm:w-12 md:h-14 md:w-14"
          />
        </Link>

        {/* Center: wordmark + tagline */}
        <div className="flex min-w-0 flex-col items-center justify-self-center">
          <Link
            to="/"
            onClick={onClick}
            aria-label="DailyNews360 home"
            className="transition-opacity hover:opacity-80"
          >
            {wordmark}
          </Link>
          {showTagline && (
            <p className="mt-1 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-mist sm:text-[11px]">
              {BRAND.tagline}
            </p>
          )}
        </div>

        {/* Right: optional slot to push wordmark toward center */}
        <div className="justify-self-end">
          {rightSlot}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center gap-3 sm:gap-4", className)}>
      <Link
        to="/"
        onClick={onClick}
        aria-label="DailyNews360 home"
        className="flex-shrink-0 transition-opacity hover:opacity-80"
      >
        <img
          src="/logo360.png"
          alt="DailyNews360 logo"
          className="h-10 w-10 object-contain sm:h-12 sm:w-12 md:h-14 md:w-14"
        />
      </Link>
      <div className="flex flex-col items-start">
        <Link
          to="/"
          onClick={onClick}
          aria-label="DailyNews360 home"
          className="transition-opacity hover:opacity-80"
        >
          {wordmark}
        </Link>
        {showTagline && (
          <p className="mt-1 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-mist sm:text-[11px]">
            {BRAND.tagline}
          </p>
        )}
      </div>
    </div>
  );
}
