import * as React from "react";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MenuButtonProps {
  open: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Hamburger toggle: 3 horizontal lines when closed, 3 vertical lines when open.
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
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex items-center gap-[3px]"
              aria-hidden="true"
            >
              <span className="h-4 w-[1.5px] rounded-full bg-current" />
              <span className="h-4 w-[1.5px] rounded-full bg-current" />
              <span className="h-4 w-[1.5px] rounded-full bg-current" />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex items-center justify-center"
              aria-hidden="true"
            >
              <Menu className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  },
);