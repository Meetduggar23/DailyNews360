import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

/**
 * Text-based brand logo. "360" is subtly highlighted in accent.
 * Works on both light and dark backgrounds.
 */
export function Logo({ className, onClick }: LogoProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="DailyNews360 home"
      className={cn(
        "inline-flex items-baseline gap-0.5 font-serif text-xl font-bold tracking-tight text-ink transition-opacity hover:opacity-80 md:text-2xl",
        className,
      )}
    >
      DailyNews
      <span className="text-accent">360</span>
    </Link>
  );
}