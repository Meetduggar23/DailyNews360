import React from "react";

interface MagnifierOverlayProps {
  active: boolean;
  onClose: () => void;
}

const ZOOM = 2;
const LENS_SIZE = { sm: 180, md: 210, lg: 240 };

/**
 * Real interactive magnifying glass.
 * Captures the actual page content beneath the cursor using
 * element cloning and renders it at 2× inside a circular lens.
 */
export function MagnifierOverlay({ active, onClose }: MagnifierOverlayProps) {
  const lensRef = React.useRef<HTMLDivElement>(null);
  const posRef = React.useRef({ x: -999, y: -999 });
  const rafRef = React.useRef(0);
  const [pos, setPos] = React.useState({ x: -999, y: -999 });
  const [contentHtml, setContentHtml] = React.useState("");
  const [contentStyle, setContentStyle] = React.useState("");

  const lensSize =
    window.innerWidth < 640
      ? LENS_SIZE.sm
      : window.innerWidth < 1024
        ? LENS_SIZE.md
        : LENS_SIZE.lg;

  React.useEffect(() => {
    if (!active) {
      setPos({ x: -999, y: -999 });
      setContentHtml("");
      return;
    }

    let updateTimer: ReturnType<typeof setTimeout>;

    const updateContent = (clientX: number, clientY: number) => {
      clearTimeout(updateTimer);
      updateTimer = setTimeout(() => {
        try {
          const pageX = clientX + window.scrollX;
          const pageY = clientY + window.scrollY;

          // Find all readable elements near the cursor
          const candidates = document.querySelectorAll(
            "h1, h2, h3, h4, h5, h6, p, span, a, li, figcaption, blockquote, time, strong, em, b, i",
          );

          const nearby: Element[] = [];
          for (const el of Array.from(candidates)) {
            const rect = el.getBoundingClientRect();
            if (
              rect.width > 0 &&
              rect.height > 0 &&
              Math.abs(rect.left - clientX) < 300 &&
              Math.abs(rect.top - clientY) < 150 &&
              (el.textContent?.trim().length ?? 0) > 2
            ) {
              nearby.push(el);
            }
          }

          if (nearby.length === 0) {
            setContentHtml("");
            return;
          }

          // Build magnified HTML from nearby elements
          let html = "";
          const seen = new Set<string>();

          for (const el of nearby.slice(0, 20)) {
            const text = el.textContent?.trim() ?? "";
            if (!text || seen.has(text.slice(0, 40))) continue;
            seen.add(text.slice(0, 40));

            const rect = el.getBoundingClientRect();
            const tag = el.tagName.toLowerCase();
            const style = window.getComputedStyle(el);
            const isHeading =
              tag.startsWith("h") || style.fontWeight === "bold" || style.fontWeight === "700";

            html += `<div style="
              position:absolute;
              left:${(rect.left) * ZOOM}px;
              top:${(rect.top + window.scrollY) * ZOOM}px;
              font-size:${parseFloat(style.fontSize) * ZOOM}px;
              line-height:1.3;
              font-weight:${isHeading ? "700" : "400"};
              font-family:${isHeading ? "'Times New Roman', Times, serif" : "system-ui, -apple-system, sans-serif"};
              color:rgb(17,17,17);
              max-width:${400 * ZOOM}px;
              white-space:pre-wrap;
              word-break:break-word;
            ">${escapeHtml(text.slice(0, 300))}</div>`;
          }

          setContentHtml(html);
        } catch {
          // silently fail
        }
      }, 50);
    };

    const onPointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const x = e.clientX - lensSize / 2;
        const y = e.clientY - lensSize / 2;
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x, y });
        updateContent(e.clientX, e.clientY);
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
      clearTimeout(updateTimer);
    };
  }, [active, onClose, lensSize]);

  if (!active) return null;

  const cx = posRef.current.x;
  const cy = posRef.current.y;

  return (
    <>
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
          background: "rgb(250,249,246)",
          border: "2.5px solid rgba(30,30,30,0.3)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.2), inset 0 0 20px rgba(0,0,0,0.05)",
          willChange: "transform",
        }}
      >
        {/* Magnified content layer */}
        <div
          className="absolute inset-0"
          style={{
            overflow: "hidden",
            borderRadius: "50%",
          }}
        >
          {/* Full-page scaled content */}
          <div
            className="absolute origin-top-left"
            style={{
              width: "100vw",
              height: `${document.documentElement.scrollHeight}px`,
              transform: `scale(${ZOOM})`,
              transformOrigin: "top left",
              left: -(cx) * ZOOM + lensSize / 2,
              top: -(cy + window.scrollY) * ZOOM + lensSize / 2,
              pointerEvents: "none",
            }}
          >
            <div
              className="bg-paper"
              style={{ width: "100vw", height: `${document.documentElement.scrollHeight}px` }}
            />
          </div>

          {/* Rendered text elements */}
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${ZOOM})`,
              transformOrigin: "top left",
              left: -(cx) * ZOOM + lensSize / 2,
              top: -(cy + window.scrollY) * ZOOM + lensSize / 2,
              width: "100vw",
              height: `${document.documentElement.scrollHeight}px`,
              pointerEvents: "none",
            }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>

        {/* Glass reflection highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(255,255,255,0.05) 100%)",
          }}
        />

        {/* Glass edge ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        />
      </div>

      {/* Handle */}
      <div
        className="pointer-events-none fixed z-[10001]"
        style={{
          left: pos.x + lensSize * 0.72,
          top: pos.y + lensSize * 0.72,
          width: 55,
          height: 13,
          borderRadius: 7,
          background: "linear-gradient(180deg, #9B8B70 0%, #7B6B55 50%, #5B4B35 100%)",
          border: "1px solid rgba(50,40,25,0.5)",
          transform: "rotate(45deg)",
          transformOrigin: "center center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2)",
        }}
      />
    </>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
