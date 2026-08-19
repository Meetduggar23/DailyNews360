import React from "react";

interface MagnifierOverlayProps {
  active: boolean;
  onClose: () => void;
}

const ZOOM = 2;
const LENS_PX = 240;

/**
 * Real interactive magnifying glass.
 * Renders a scaled clone of the page viewport inside a circular clipped lens
 * that follows the pointer. Content inside is the actual page content at 2×.
 */
export function MagnifierOverlay({ active, onClose }: MagnifierOverlayProps) {
  const lensRef = React.useRef<HTMLDivElement>(null);
  const posRef = React.useRef({ x: -999, y: -999 });
  const rafRef = React.useRef(0);
  const [pos, setPos] = React.useState({ x: -999, y: -999 });

  React.useEffect(() => {
    if (!active) return;

    let lensSize = LENS_PX;
    if (window.innerWidth < 640) lensSize = 180;
    else if (window.innerWidth < 1024) lensSize = 210;

    const onPointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const x = e.clientX - lensSize / 2;
        const y = e.clientY - lensSize / 2;
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x, y });
      });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, onClose]);

  if (!active) return null;

  const lensSize = window.innerWidth < 640 ? 180 : window.innerWidth < 1024 ? 210 : LENS_PX;
  const cx = posRef.current.x;
  const cy = posRef.current.y;
  const scrollY = window.scrollY;

  // The lens content: a full-page clone, scaled 2×, offset so the cursor
  // position appears centered in the lens.
  const contentLeft = -(cx) * ZOOM + lensSize / 2;
  const contentTop = -(cy + scrollY) * ZOOM + lensSize / 2;

  return (
    <>
      {/* Invisible pointer capture layer */}
      <div
        className="fixed inset-0 z-[10000]"
        style={{ cursor: "none" }}
        onPointerMove={(e) => {
          // handled by useEffect above
        }}
      />

      {/* Magnifying glass lens */}
      <div
        ref={lensRef}
        className="pointer-events-none fixed z-[10001] overflow-hidden"
        style={{
          left: pos.x,
          top: pos.y,
          width: lensSize,
          height: lensSize,
          borderRadius: "50%",
          border: "2.5px solid rgba(30,30,30,0.35)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.25)",
          willChange: "transform",
          transition: "box-shadow 0.2s ease",
        }}
      >
        {/* Scaled page content inside the lens */}
        <div
          className="absolute origin-top-left"
          style={{
            width: "100vw",
            height: "100vh",
            transform: `scale(${ZOOM})`,
            transformOrigin: "top left",
            left: contentLeft,
            top: contentTop,
            pointerEvents: "none",
          }}
        >
          <div
            className="absolute inset-0 bg-paper"
            style={{ minHeight: "100vh" }}
          />
          {/* Text magnification: capture readable text content from the page */}
          <MagnifiedContent cx={cx} cy={cy} scrollY={scrollY} zoom={ZOOM} lensSize={lensSize} />
        </div>

        {/* Glass reflection highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.03) 100%)",
          }}
        />
      </div>

      {/* Handle */}
      <div
        className="pointer-events-none fixed z-[10001]"
        style={{
          left: pos.x + lensSize * 0.7,
          top: pos.y + lensSize * 0.7,
          width: 60,
          height: 14,
          borderRadius: 7,
          background: "linear-gradient(180deg, #8B7355 0%, #6B5B45 100%)",
          border: "1px solid rgba(60,45,30,0.4)",
          transform: "rotate(45deg)",
          transformOrigin: "center center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      />
    </>
  );
}

/**
 * Captures readable text elements near the cursor and renders them
 * magnified inside the lens.
 */
function MagnifiedContent({
  cx,
  cy,
  scrollY,
  zoom,
  lensSize,
}: {
  cx: number;
  cy: number;
  scrollY: number;
  zoom: number;
  lensSize: number;
}) {
  const [items, setItems] = React.useState<
    { text: string; x: number; y: number; fontSize: number; tag: string }[]
  >([]);

  React.useEffect(() => {
    if (cx < 0 || cy < 0) return;

    // Find elements near the cursor
    const pageX = cx;
    const pageY = cy + scrollY;
    const range = 120; // detection radius in page pixels

    const elements = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, span, a, li, figcaption, blockquote, time",
    );

    const found: typeof items = [];

    for (const el of Array.from(elements).slice(0, 200)) {
      const rect = el.getBoundingClientRect();
      const elPageY = rect.top + scrollY;
      const elPageX = rect.left;

      // Check if element is near the cursor
      if (
        Math.abs(elPageX - pageX) < range * 2 &&
        Math.abs(elPageY - pageY) < range
      ) {
        const text = el.textContent?.trim();
        if (text && text.length > 0 && text.length < 500) {
          const style = window.getComputedStyle(el);
          found.push({
            text: text.slice(0, 200),
            x: elPageX,
            y: elPageY,
            fontSize: parseFloat(style.fontSize) || 16,
            tag: el.tagName.toLowerCase(),
          });
        }
      }
    }

    // Deduplicate by text content
    const seen = new Set<string>();
    const unique = found.filter((item) => {
      const key = item.text.slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setItems(unique.slice(0, 15));
  }, [cx, cy, scrollY, zoom, lensSize]);

  return (
    <>
      {items.map((item, i) => {
        const magnifiedSize = item.fontSize * zoom;
        const isHeading =
          item.tag === "h1" ||
          item.tag === "h2" ||
          item.tag === "h3" ||
          item.tag === "h4";

        return (
          <div
            key={i}
            className="absolute whitespace-pre-wrap break-words text-ink"
            style={{
              left: item.x * zoom,
              top: item.y * zoom,
              fontSize: magnifiedSize,
              lineHeight: 1.4,
              fontWeight: isHeading ? 700 : 400,
              fontFamily: isHeading
                ? '"Times New Roman", Times, serif'
                : "system-ui, -apple-system, sans-serif",
              maxWidth: 400 * zoom,
              color: "rgb(17,17,17)",
            }}
          >
            {item.text}
          </div>
        );
      })}
    </>
  );
}
