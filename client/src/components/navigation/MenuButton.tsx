import * as React from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MenuButtonProps {
  open: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Hamburger toggle that morphs between ☰ and × with a smooth rotation.
 * Keyboard accessible with a visible focus ring.
 */
export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton({ open, onClick, className }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        title={open ? "Close menu" : "Open menu"}
        className={cn(
          "relative inline-flex h-8 w-8 items-center justify-center text-ink transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          className,
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "menu"}
            initial={{ rotate: open ? -90 : 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: open ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    );
  },
);