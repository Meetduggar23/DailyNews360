import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const NEWS_LINKS = [
  { to: "/", label: "Home" },
  { to: "/category/india", label: "India" },
  { to: "/category/world", label: "World" },
  { to: "/category/politics", label: "Politics" },
  { to: "/category/business", label: "Business" },
  { to: "/category/technology", label: "Technology" },
  { to: "/category/sports", label: "Sports" },
  { to: "/category/entertainment", label: "Entertainment" },
  { to: "/category/science", label: "Science" },
  { to: "/category/health", label: "Health" },
] as const;

const EXPLORE_LINKS = [
  { to: "/category/top", label: "Top Stories" },
  { to: "/trending", label: "Trending" },
  { to: "/for-you", label: "For You" },
  { to: "/saved", label: "Saved" },
  { to: "/history", label: "Reading History" },
  { to: "/sources", label: "Sources" },
  { to: "/search", label: "Search" },
] as const;

const COMPANY_LINKS = [
  { to: "/about", label: "About" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/settings", label: "Settings" },
] as const;

export function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-ink bg-surface dark:border-ink/80">
      <div className="container-news py-10">
        {/* Brand row */}
        <div className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Logo showTagline />
            <p className="mt-3 font-sans text-sm leading-relaxed text-secondary">
              Your World, Updated Daily. Real-time news from trusted sources —
              aggregated, verified and presented in one place.
            </p>
          </div>

          {/* Sections */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <nav aria-label="News sections">
              <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-mist">
                News
              </h3>
              <ul className="space-y-2">
                {NEWS_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="font-sans text-sm text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Explore">
              <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-mist">
                Explore
              </h3>
              <ul className="space-y-2">
                {EXPLORE_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="font-sans text-sm text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Company">
              <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-mist">
                Company
              </h3>
              <ul className="space-y-2">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="font-sans text-sm text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-3 pt-6 text-center">
          <p className="font-sans text-xs text-mist">
            © 2026 DAILY NEWS360. All rights reserved. News content remains the property of its original publishers.
          </p>
          <p className="flex items-center gap-1 font-sans text-xs text-mist">
            Made with
            <Heart className="h-3 w-3 text-accent" aria-hidden="true" />
            by Duggar Pvt Ltd
          </p>
        </div>
      </div>
    </footer>
  );
}