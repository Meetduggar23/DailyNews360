import React from "react";
import { ReadingLensButton } from "./ReadingLensButton";
import { ReadingLensPanel } from "./ReadingLensPanel";
import { MagnifierOverlay } from "./MagnifierOverlay";
import {
  DEFAULT_STATE,
  TEXT_SIZE_MAP,
  LINE_HEIGHT_MAP,
  loadReadingLensState,
  saveReadingLensState,
  resetReadingLensState,
  type ReadingLensState,
  type LensSize,
  type LensShape,
  type TextSize,
  type ReadingTheme,
} from "./readingLensUtils";

/**
 * Reading Lens — premium accessibility feature for DailyNews360.
 * Provides a magnifying glass overlay, reading mode, text size controls,
 * focus line, reading ruler, and theme options.
 */
export function ReadingLens() {
  const [state, setState] = React.useState<ReadingLensState>(() => ({
    ...DEFAULT_STATE,
    ...loadReadingLensState(),
  }));
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [rulerY, setRulerY] = React.useState(-999);

  // Persist preferences
  React.useEffect(() => {
    saveReadingLensState(state);
  }, [state]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isTyping) return;

      switch (e.key.toLowerCase()) {
        case "m":
          e.preventDefault();
          toggleActive();
          break;
        case "+":
        case "=":
          if (state.active) {
            e.preventDefault();
            cycleZoom(1);
          }
          break;
        case "-":
          if (state.active) {
            e.preventDefault();
            cycleZoom(-1);
          }
          break;
        case "r":
          if (state.active) {
            e.preventDefault();
            update({ readingMode: !state.readingMode });
          }
          break;
        case "h":
          if (state.active) {
            e.preventDefault();
            update({ highContrast: !state.highContrast });
          }
          break;
        case "escape":
          if (state.active) {
            e.preventDefault();
            update({ active: false });
            setPanelOpen(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  // Reading ruler: follow pointer Y
  React.useEffect(() => {
    if (!state.active || !state.readingRuler) {
      setRulerY(-999);
      return;
    }

    const onMove = (e: PointerEvent) => {
      setRulerY(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [state.active, state.readingRuler]);

  function update(partial: Partial<ReadingLensState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function toggleActive() {
    setState((prev) => ({ ...prev, active: !prev.active }));
    setPanelOpen((prev) => !state.active ? true : prev);
  }

  const zoomLevels = [100, 125, 150, 175, 200, 250, 300];
  function cycleZoom(dir: number) {
    const idx = zoomLevels.indexOf(state.zoom);
    const next = Math.max(0, Math.min(zoomLevels.length - 1, idx + dir));
    update({ zoom: zoomLevels[next] });
  }

  function handleReset() {
    setState(resetReadingLensState());
    setPanelOpen(false);
  }

  // Apply reading features via CSS custom properties on the page
  React.useEffect(() => {
    const root = document.documentElement;
    if (state.active && state.textSize !== "normal") {
      root.style.setProperty("--reading-text-size", TEXT_SIZE_MAP[state.textSize]);
      root.style.setProperty("--reading-line-height", LINE_HEIGHT_MAP[state.textSize]);
      root.classList.add("reading-lens-text-active");
    } else {
      root.style.removeProperty("--reading-text-size");
      root.style.removeProperty("--reading-line-height");
      root.classList.remove("reading-lens-text-active");
    }

    if (state.active && state.readingMode) {
      root.classList.add("reading-mode-active");
    } else {
      root.classList.remove("reading-mode-active");
    }

    if (state.active && state.highContrast) {
      root.classList.add("high-contrast-active");
    } else {
      root.classList.remove("high-contrast-active");
    }

    if (state.active && state.readingTheme !== "normal") {
      root.classList.add(`reading-theme-${state.readingTheme}`);
    } else {
      root.classList.remove("reading-theme-sepia", "reading-theme-dark", "reading-theme-high-contrast");
    }

    return () => {
      root.classList.remove(
        "reading-lens-text-active",
        "reading-mode-active",
        "high-contrast-active",
        "reading-theme-sepia",
        "reading-theme-dark",
        "reading-theme-high-contrast",
      );
      root.style.removeProperty("--reading-text-size");
      root.style.removeProperty("--reading-line-height");
    };
  }, [state.active, state.textSize, state.readingMode, state.highContrast, state.readingTheme]);

  return (
    <>
      {/* Floating button */}
      <ReadingLensButton active={state.active} onClick={toggleActive} />

      {/* Control panel */}
      {state.active && panelOpen && (
        <ReadingLensPanel
          state={state}
          onZoomChange={(zoom) => update({ zoom })}
          onLensSizeChange={(lensSize: LensSize) => update({ lensSize })}
          onLensShapeChange={(lensShape: LensShape) => update({ lensShape })}
          onTextSizeChange={(textSize: TextSize) => update({ textSize })}
          onReadingModeToggle={() => update({ readingMode: !state.readingMode })}
          onFocusLineToggle={() => update({ focusLine: !state.focusLine })}
          onReadingRulerToggle={() => update({ readingRuler: !state.readingRuler })}
          onHighContrastToggle={() => update({ highContrast: !state.highContrast })}
          onReadingThemeChange={(readingTheme: ReadingTheme) => update({ readingTheme })}
          onReset={handleReset}
          onClose={() => setPanelOpen(false)}
        />
      )}

      {/* Magnifier lens */}
      <MagnifierOverlay
        zoom={state.zoom}
        lensSize={state.lensSize}
        shape={state.lensShape}
        active={state.active && !panelOpen}
      />

      {/* Reading ruler */}
      {state.active && state.readingRuler && (
        <div
          className="pointer-events-none fixed inset-x-0 z-[9998] h-8"
          style={{
            top: rulerY - 16,
            background: "linear-gradient(to bottom, transparent, rgba(166,27,27,0.06) 30%, rgba(166,27,27,0.06) 70%, transparent)",
            borderBottom: "1px solid rgba(166,27,27,0.15)",
            borderTop: "1px solid rgba(166,27,27,0.15)",
          }}
        />
      )}

      {/* Focus line */}
      {state.active && state.focusLine && (
        <div
          className="pointer-events-none fixed inset-x-0 z-[9997] h-[2px]"
          style={{
            top: rulerY,
            background: "rgba(166,27,27,0.4)",
            boxShadow: "0 0 8px rgba(166,27,27,0.2)",
          }}
        />
      )}
    </>
  );
}
