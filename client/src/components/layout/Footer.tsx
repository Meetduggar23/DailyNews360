import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import {
  FOOTER_NEWS,
  FOOTER_EXPLORE,
  FOOTER_COMPANY,
} from "@/components/navigation/navigationData";

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

          {/* Navigation columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {/* News */}
            <nav aria-label="News">
              <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-mist">
                News
              </h3>
              <ul className="space-y-2">
                {FOOTER_NEWS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="font-sans text-sm text-secondary transition-colors hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Explore */}
            <nav aria-label="Explore">
              <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-mist">
                Explore
              </h3>
              <ul className="space-y-2">
                {FOOTER_EXPLORE.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="inline-flex items-center gap-1.5 font-sans text-sm text-secondary transition-colors hover:text-accent"
                    >
                      {item.label === "For You" && (
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                      )}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Company */}
            <nav aria-label="Company">
              <h3 className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-mist">
                Company
              </h3>
              <ul className="space-y-2">
                {FOOTER_COMPANY.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="font-sans text-sm text-secondary transition-colors hover:text-accent"
                    >
                      {item.label}
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
            Made by Duggar Pvt Ltd
          </p>
        </div>
      </div>
    </footer>
  );
}