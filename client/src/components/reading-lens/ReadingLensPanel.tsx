import React from "react";
import {
  ZOOM_LEVELS,
  LENS_SIZE_MAP,
  type ReadingLensState,
  type LensSize,
  type TextSize,
  type LensShape,
  type ReadingTheme,
} from "./readingLensUtils";

interface ReadingLensPanelProps {
  state: ReadingLensState;
  onZoomChange: (zoom: number) => void;
  onLensSizeChange: (size: LensSize) => void;
  onLensShapeChange: (shape: LensShape) => void;
  onTextSizeChange: (size: TextSize) => void;
  onReadingModeToggle: () => void;
  onFocusLineToggle: () => void;
  onReadingRulerToggle: () => void;
  onHighContrastToggle: () => void;
  onReadingThemeChange: (theme: ReadingTheme) => void;
  onReset: () => void;
  onClose: () => void;
}

const LENS_SIZES: { label: string; value: LensSize }[] = [
  { label: "S", value: "small" },
  { label: "M", value: "medium" },
  { label: "L", value: "large" },
  { label: "XL", value: "xl" },
];

const TEXT_SIZES: { label: string; value: TextSize }[] = [
  { label: "A-", value: "small" },
  { label: "A", value: "normal" },
  { label: "A+", value: "large" },
  { label: "A++", value: "xl" },
];

export function ReadingLensPanel({
  state,
  onZoomChange,
  onLensSizeChange,
  onLensShapeChange,
  onTextSizeChange,
  onReadingModeToggle,
  onFocusLineToggle,
  onReadingRulerToggle,
  onHighContrastToggle,
  onReadingThemeChange,
  onReset,
  onClose,
}: ReadingLensPanelProps) {
  const zoomIndex = Math.max(0, ZOOM_LEVELS.indexOf(state.zoom as typeof ZOOM_LEVELS[number]));

  const cycleZoom = (dir: number) => {
    const next = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, zoomIndex + dir));
    const val = ZOOM_LEVELS[next];
    if (val !== undefined) onZoomChange(val);
  };

  return (
    <div className="fixed bottom-[160px] right-5 z-[9998] w-72 rounded-lg border border-line bg-surface p-4 shadow-xl dark:border-line/60 dark:bg-surface sm:w-80">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-ink">
          Reading Lens
        </h2>
        <button
          onClick={onClose}
          className="text-mist transition-colors hover:text-ink"
          aria-label="Close Reading Lens"
        >
          ×
        </button>
      </div>

      {/* Magnification */}
      <div className="mb-3">
        <label className="mb-1 block font-sans text-[10px] font-semibold uppercase tracking-wider text-mist">
          Magnification
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => cycleZoom(-1)}
            disabled={zoomIndex === 0}
            className="flex h-7 w-7 items-center justify-center rounded border border-line text-xs font-bold text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center font-sans text-sm font-semibold text-ink">
            {state.zoom}%
          </span>
          <button
            onClick={() => cycleZoom(1)}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            className="flex h-7 w-7 items-center justify-center rounded border border-line text-xs font-bold text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {/* Lens Size */}
      <div className="mb-3">
        <label className="mb-1 block font-sans text-[10px] font-semibold uppercase tracking-wider text-mist">
          Lens Size
        </label>
        <div className="flex gap-1.5">
          {LENS_SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => onLensSizeChange(s.value)}
              className={`flex h-7 flex-1 items-center justify-center rounded border text-xs font-semibold transition-colors ${
                state.lensSize === s.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lens Shape */}
      <div className="mb-3">
        <label className="mb-1 block font-sans text-[10px] font-semibold uppercase tracking-wider text-mist">
          Lens Shape
        </label>
        <div className="flex gap-1.5">
          {(["circle", "rectangle"] as const).map((shape) => (
            <button
              key={shape}
              onClick={() => onLensShapeChange(shape)}
              className={`flex h-7 flex-1 items-center justify-center rounded border text-xs font-semibold capitalize transition-colors ${
                state.lensShape === shape
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      {/* Text Size */}
      <div className="mb-3">
        <label className="mb-1 block font-sans text-[10px] font-semibold uppercase tracking-wider text-mist">
          Text Size
        </label>
        <div className="flex gap-1.5">
          {TEXT_SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => onTextSizeChange(s.value)}
              className={`flex h-7 flex-1 items-center justify-center rounded border text-xs font-semibold transition-colors ${
                state.textSize === s.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Theme */}
      <div className="mb-3">
        <label className="mb-1 block font-sans text-[10px] font-semibold uppercase tracking-wider text-mist">
          Theme
        </label>
        <div className="flex gap-1.5">
          {(["normal", "sepia", "high-contrast", "dark"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => onReadingThemeChange(theme)}
              className={`flex h-7 flex-1 items-center justify-center rounded border text-[10px] font-semibold capitalize transition-colors ${
                state.readingTheme === theme
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {theme === "high-contrast" ? "Hi-Con" : theme}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="mb-3 space-y-2 border-t border-line pt-3">
        {[
          { label: "Reading Mode", checked: state.readingMode, onChange: onReadingModeToggle },
          { label: "Focus Line", checked: state.focusLine, onChange: onFocusLineToggle },
          { label: "Reading Ruler", checked: state.readingRuler, onChange: onReadingRulerToggle },
          { label: "High Contrast", checked: state.highContrast, onChange: onHighContrastToggle },
        ].map((toggle) => (
          <label key={toggle.label} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={toggle.checked}
              onChange={toggle.onChange}
              className="h-3.5 w-3.5 rounded border-line accent-accent"
            />
            <span className="font-sans text-xs text-secondary">{toggle.label}</span>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-line pt-3">
        <button
          onClick={onReset}
          className="flex-1 rounded border border-line py-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          Reset
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded bg-accent py-1.5 font-sans text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent/90"
        >
          Close
        </button>
      </div>
    </div>
  );
}
