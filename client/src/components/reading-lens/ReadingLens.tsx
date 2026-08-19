import React from "react";
import { ScanSearch } from "lucide-react";
import { MagnifierOverlay } from "./MagnifierOverlay";

/**
 * Reading Lens — real interactive magnifying glass for DailyNews360.
 * Click the button or press M to toggle the magnifier on/off.
 */
export function ReadingLens() {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isTyping) return;

      if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        setActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggle() {
    setActive((prev) => !prev);
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={toggle}
        aria-label={active ? "Close reading magnifier" : "Open reading magnifier"}
        aria-pressed={active}
        className={`fixed bottom-[100px] right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 sm:h-[48px] sm:w-[48px] ${
          active
            ? "border-accent bg-accent text-white shadow-lg"
            : "border-line bg-surface text-ink shadow-md hover:border-accent hover:text-accent dark:border-line dark:bg-surface dark:text-ink"
        }`}
      >
        <ScanSearch className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Magnifier overlay */}
      <MagnifierOverlay active={active} onClose={() => setActive(false)} />
    </>
  );
}
