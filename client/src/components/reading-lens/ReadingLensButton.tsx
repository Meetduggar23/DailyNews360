import { ScanSearch } from "lucide-react";

interface ReadingLensButtonProps {
  active: boolean;
  onClick: () => void;
}

export function ReadingLensButton({ active, onClick }: ReadingLensButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={active ? "Close Reading Lens" : "Open Reading Lens"}
      className={`fixed bottom-[100px] right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 sm:h-[48px] sm:w-[48px] ${
        active
          ? "border-accent bg-accent text-white shadow-lg"
          : "border-line bg-surface text-ink shadow-md hover:border-accent hover:text-accent dark:border-line dark:bg-surface dark:text-ink"
      }`}
    >
      <ScanSearch className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
