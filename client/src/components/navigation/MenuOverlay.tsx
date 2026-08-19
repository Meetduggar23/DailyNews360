import { motion } from "framer-motion";

interface MenuOverlayProps {
  onClick: () => void;
}

/**
 * Full-screen backdrop behind the drawer. Clicking it closes the menu.
 * No blur — the site simply darkens to keep the editorial look.
 */
export function MenuOverlay({ onClick }: MenuOverlayProps) {
  return (
    <motion.button
      type="button"
      aria-label="Close navigation menu"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="fixed inset-0 z-[85] cursor-default bg-black/45"
    />
  );
}