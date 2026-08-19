import { X } from "lucide-react";
import { MagnifierOverlay } from "./MagnifierOverlay";

interface ReadingLensProps {
  active: boolean;
  onClose: () => void;
}

/**
 * Reading Lens — renders the magnifier overlay and a mobile close button.
 * The trigger button lives in the masthead (Navbar).
 */
export function ReadingLens({ active, onClose }: ReadingLensProps) {
  return (
    <>
      {/* Mobile close button — only visible when magnifier is active */}
      {active && (
        <button
          onClick={onClose}
          aria-label="Close magnifying glass"
          className="fixed right-5 top-5 z-[10002] flex h-[44px] w-[44px] items-center justify-center rounded-full border border-line bg-surface text-ink shadow-lg transition-all duration-200 hover:scale-105 sm:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {/* Magnifier overlay */}
      <MagnifierOverlay active={active} onClose={onClose} />
    </>
  );
}
