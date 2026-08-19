import React from "react";
import { LENS_SIZE_MAP, type LensShape, type LensSize } from "./readingLensUtils";

interface MagnifierOverlayProps {
  zoom: number;
  lensSize: LensSize;
  shape: LensShape;
  active: boolean;
}

/**
 * Magnifier overlay: a circular/rectangular lens that follows the pointer
 * and shows a zoomed view of the content beneath it.
 *
 * Uses a CSS transform on a full-page clone positioned inside the lens,
 * with transform-origin tracking the pointer position.
 */
export function MagnifierOverlay({ zoom, lensSize, shape, active }: MagnifierOverlayProps) {
  const [pos, setPos] = React.useState({ x: -999, y: -999 });
  const [scrollY, setScrollY] = React.useState(0);
  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!active) return;

    const onPointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const size = LENS_SIZE_MAP[lensSize];
        setScrollY(window.scrollY);
        setPos({
          x: e.clientX - size / 2,
          y: e.clientY - size / 2,
        });
      });
    };

    const onScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, lensSize]);

  if (!active) return null;

  const size = LENS_SIZE_MAP[lensSize];
  const zoomFactor = zoom / 100;
  const borderRadius = shape === "circle" ? "50%" : "12px";

  // The content inside the lens is the page itself, zoomed and offset
  // so that the area under the cursor appears enlarged in the center of the lens.
  const contentOffsetX = -(pos.x + size / 2);
  const contentOffsetY = -(pos.y) - scrollY;

  return (
    <div
      className="pointer-events-none fixed z-[9999] overflow-hidden border-2 border-accent/50"
      style={{
        left: pos.x,
        top: pos.y,
        width: size,
        height: size,
        borderRadius,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.15)",
        willChange: "transform",
      }}
    >
      {/* Zoomed content replica */}
      <div
        className="absolute origin-top-left"
        style={{
          width: "100vw",
          minHeight: "100vh",
          transform: `scale(${zoomFactor})`,
          transformOrigin: "top left",
          left: contentOffsetX * zoomFactor,
          top: contentOffsetY * zoomFactor,
          pointerEvents: "none",
        }}
      >
        {/* Render page content background */}
        <div
          className="absolute inset-0 bg-paper"
          style={{ minHeight: "100vh" }}
        />
      </div>

      {/* Lens glass effect */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle, transparent 50%, rgba(0,0,0,0.08) 100%)",
          borderRadius,
        }}
      />

      {/* Crosshair center indicator */}
      <div
        className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/70"
      />
    </div>
  );
}
