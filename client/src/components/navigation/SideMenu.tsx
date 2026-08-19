import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MenuButton } from "./MenuButton";
import { MenuOverlay } from "./MenuOverlay";
import { SideMenuSection } from "./SideMenuSection";
import { CategoryNavigation } from "./CategoryNavigation";
import {
  ACCOUNT_ITEMS_LOGGED_IN,
  ACCOUNT_ITEMS_LOGGED_OUT,
  EXPLORE_ITEMS,
  FOOTER_ITEMS,
  MORE_CATEGORIES,
  PRIMARY_CATEGORIES,
  SOCIAL_LINKS,
  type AccountItem,
} from "./navigationConfig";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/components/ui/toaster";
import { BRAND } from "@/constants";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

const PANEL_CLASSES =
  "fixed inset-y-0 right-0 z-[90] flex w-[min(520px,95vw)] flex-col bg-surface shadow-2xl";

/**
 * Right-side editorial navigation drawer (hamburger mega menu).
 *
 * Opens from the right with a subtle slide, dims the page, locks body
 * scrolling, traps focus, closes on Escape / backdrop / route change.
 */
export function SideMenu({ open, onClose }: SideMenuProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { toast } = useToast();

  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);
  const location = useLocation();
  const previousLocation = React.useRef(location.pathname + location.search + location.hash);

  // Remember where focus came from and move it into the drawer.
  React.useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [open]);

  // Restore focus after the drawer closes.
  React.useEffect(() => {
    if (!open) {
      previouslyFocused.current?.focus?.();
      previouslyFocused.current = null;
    }
  }, [open]);

  // Lock background scrolling while open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close automatically after navigating to another route.
  React.useEffect(() => {
    const current = location.pathname + location.search + location.hash;
    if (open && current !== previousLocation.current) {
      onClose();
    }
    previousLocation.current = current;
  }, [location, open, onClose]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;

    const focusables = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleLogout() {
    onClose();
    void logout();
    toast({ title: "Signed out", description: "See you soon." });
  }

  function handleAccountNavigate(item: AccountItem) {
    if (item.action === "logout") {
      handleLogout();
    } else {
      onClose();
    }
  }

  const accountItems = user ? ACCOUNT_ITEMS_LOGGED_IN : ACCOUNT_ITEMS_LOGGED_OUT;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <MenuOverlay onClick={onClose} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onKeyDown={handleKeyDown}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={PANEL_CLASSES}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b-2 border-ink px-6 py-5 dark:border-ink/80">
              <div>
                <p className="whitespace-nowrap font-times text-3xl font-bold uppercase leading-none tracking-[0.04em] text-ink" style={{ wordSpacing: "0.12em" }}>
                  DAILY NEWS360
                </p>
                <p className="mt-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-mist">
                  {BRAND.tagline}
                </p>
              </div>
              <MenuButton ref={closeRef} open onClick={onClose} className="mt-1" />
            </div>

            {/* Scrollable body */}
            <div className="side-menu-scroll flex-1 overflow-y-auto py-2">
              <SideMenuSection>
                <CategoryNavigation items={PRIMARY_CATEGORIES} onNavigate={onClose} />
              </SideMenuSection>

              <SideMenuSection title="More" className="border-t border-line">
                <CategoryNavigation items={MORE_CATEGORIES} onNavigate={onClose} compact />
              </SideMenuSection>

              <SideMenuSection title="Explore" className="border-t border-line">
                <CategoryNavigation items={EXPLORE_ITEMS} onNavigate={onClose} compact />
              </SideMenuSection>

              {/* Account */}
              <SideMenuSection title="Account" className="border-t border-line">
                <CategoryNavigation
                  items={accountItems}
                  onNavigate={handleAccountNavigate}
                  compact
                />
              </SideMenuSection>

              {SOCIAL_LINKS.length > 0 ? (
                <SideMenuSection title="Connect with us" className="border-t border-line">
                  <ul className="flex flex-wrap gap-3">
                    {SOCIAL_LINKS.map(({ label, Icon, url }) => (
                      <li key={label}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-secondary transition-colors hover:border-accent hover:text-accent"
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </SideMenuSection>
              ) : null}
            </div>

            {/* Footer */}
            <div className="border-t border-line px-6 py-4">
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {FOOTER_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className="font-sans text-xs font-medium uppercase tracking-wide text-secondary transition-colors hover:text-accent"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-sans text-[11px] text-mist">
                © 2025 Daily News360 All Rights Reserved By Duggar Pvt Ltd.
              </p>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}