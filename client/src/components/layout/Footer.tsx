import { Link } from "react-router-dom";
import { Github, Twitter, Facebook, Linkedin } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { BRAND, NAV_LINKS } from "@/constants";

const SOCIALS = [
  { label: "Twitter / X", href: "https://twitter.com", Icon: Twitter },
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "GitHub", href: "https://github.com", Icon: Github },
];

const PAGES = [
  { to: "/about", label: "About" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/sources", label: "Sources" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container-news grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-mist">{BRAND.taglineSecondary}</p>
          <p className="mt-1 text-xs text-mist/80">
            Your world, one feed. Aggregating headlines from trusted sources across the globe.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">News</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {NAV_LINKS.slice(0, 8).map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-mist transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">DailyNews360</h3>
          <ul className="space-y-2">
            {PAGES.map((page) => (
              <li key={page.to}>
                <Link
                  to={page.to}
                  className="text-sm text-mist transition-colors hover:text-accent"
                >
                  {page.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/trending" className="text-sm text-mist transition-colors hover:text-accent">
                Trending
              </Link>
            </li>
            <li>
              <Link to="/for-you" className="text-sm text-mist transition-colors hover:text-accent">
                For You
              </Link>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-mist ring-1 ring-line transition-colors hover:bg-line/40 hover:text-ink"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line py-6">
        <div className="container-news flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="text-xs text-mist">
            © 2026 DailyNews360. All rights reserved.
          </p>
          <p className="max-w-xl text-xs text-mist/80">
            News aggregated from third-party sources. Original reporting belongs to respective
            publishers.
          </p>
        </div>
      </div>
    </footer>
  );
}