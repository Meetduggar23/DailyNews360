import { useEffect, useRef } from "react";

interface MagnifierOverlayProps {
  active: boolean;
  onClose: () => void;
}

const ZOOM = 2;

/** Responsive lens sizes — large enough to cover roughly half the page */
const LENS_SIZE = { sm: 280, md: 400, lg: 520 };

/**
 * Realistic physical magnifying glass.
 *
 * Clones the page body into a circular lens viewport and renders it at 2×
 * scale, wrapped in a photorealistic metal-rimmed, glass-fronted housing
 * with a premium dark-walnut handle.
 */
export function MagnifierOverlay({ active, onClose }: MagnifierOverlayProps) {
  const rafRef = useRef(0);
  const cloneRef = useRef<HTMLElement | null>(null);
  const reflectionRef = useRef<HTMLDivElement | null>(null);
  const isDarkRef = useRef(false);

  const lensSize =
    window.innerWidth < 640
      ? LENS_SIZE.sm
      : window.innerWidth < 1024
        ? LENS_SIZE.md
        : LENS_SIZE.lg;

  useEffect(() => {
    if (!active) return;

    // Detect dark mode
    isDarkRef.current = document.documentElement.classList.contains("dark");
    const dk = isDarkRef.current;

    const rim = 8; // metal rim thickness — substantial for realism

    // ── Main lens housing ────────────────────────────────────────────
    const container = document.createElement("div");
    container.setAttribute("data-magnifier", "true");
    container.style.cssText = [
      "position:fixed",
      "pointer-events:none",
      "z-index:10001",
      "will-change:transform",
      "left:-9999px",
      "top:-9999px",
      `width:${lensSize + rim * 2}px`,
      `height:${lensSize + rim * 2}px`,
      "border-radius:50%",
      // Multi-layer outer shadow for realistic depth
      dk
        ? "box-shadow:0 1px 2px rgba(0,0,0,0.5),0 4px 12px rgba(0,0,0,0.45),0 12px 32px rgba(0,0,0,0.4),0 24px 56px rgba(0,0,0,0.25)"
        : "box-shadow:0 1px 2px rgba(0,0,0,0.2),0 4px 12px rgba(0,0,0,0.15),0 12px 32px rgba(0,0,0,0.1),0 24px 56px rgba(0,0,0,0.06)",
    ].join(";");
    document.body.appendChild(container);


    // ── Metal rim (outer ring) — premium brushed metal ───────────────
    const rimEl = document.createElement("div");
    rimEl.style.cssText = [
      "position:absolute",
      "inset:0",
      "border-radius:50%",
      // Realistic brushed-metal gradient with specular highlight
      dk
        ? "background:conic-gradient(from 160deg,#3a3a3a,#555,#3a3a3a,#4a4a4a,#333,#4a4a4a,#3a3a3a)"
        : "background:conic-gradient(from 160deg,#aaa,#d0d0d0,#aaa,#bbb,#999,#bbb,#aaa)",
      // Inner bevel highlight (top-left light, bottom-right shadow)
      "box-shadow:inset 0 2px 3px rgba(255,255,255,0.25),inset 0 -2px 3px rgba(0,0,0,0.3),inset 2px 0 3px rgba(255,255,255,0.1),inset -2px 0 3px rgba(0,0,0,0.15)",
      // Thin outer highlight for edge catching
      dk
        ? "border:1px solid rgba(80,80,80,0.5)"
        : "border:1px solid rgba(200,200,200,0.6)",
    ].join(";");
    container.appendChild(rimEl);

    // ── Inner bevel ring — metal→glass transition ────────────────────
    const innerBevel = document.createElement("div");
    innerBevel.style.cssText = [
      "position:absolute",
      `inset:${rim - 2}px`,
      "border-radius:50%",
      // Inner bevel edge — top bright, bottom dark
      "box-shadow:inset 0 1px 1px rgba(255,255,255,0.3),inset 0 -1px 2px rgba(0,0,0,0.2)",
      dk
        ? "border:1px solid rgba(70,70,70,0.7)"
        : "border:1px solid rgba(170,170,170,0.5)",
    ].join(";");
    container.appendChild(innerBevel);

    // ── Inner rim / glass edge ring ──────────────────────────────────
    const innerRim = document.createElement("div");
    innerRim.style.cssText = [
      "position:absolute",
      `inset:${rim}px`,
      "border-radius:50%",
      // Thin bright line at the glass edge — catches light
      dk
        ? "border:1px solid rgba(100,100,100,0.4)"
        : "border:1px solid rgba(220,220,220,0.6)",
      // Subtle inset shadow for glass-seat depth
      "box-shadow:inset 0 0 4px rgba(0,0,0,0.1),inset 0 1px 2px rgba(255,255,255,0.08)",
    ].join(";");
    container.appendChild(innerRim);

    // ── Glass viewport (clips the clone to a circle) ─────────────────
    const viewport = document.createElement("div");
    viewport.style.cssText = [
      "position:absolute",
      `inset:${rim}px`,
      "border-radius:50%",
      "overflow:hidden",
      // Ultra-transparent glass tint — never opaque
      dk
        ? "background:rgba(255,255,255,0.015)"
        : "background:rgba(240,245,255,0.025)",
    ].join(";");
    container.appendChild(viewport);

    // ── Clone the page body ──────────────────────────────────────────
    const clone = document.body.cloneNode(true) as HTMLElement;

    // Remove the magnifier overlay itself from the clone
    clone.querySelectorAll("[data-magnifier]").forEach((el) => el.remove());

    // Remove position:fixed / sticky elements — they break coordinate mapping
    clone.querySelectorAll("*").forEach((el) => {
      const cs = window.getComputedStyle(el);
      if (cs.position === "fixed" || cs.position === "sticky") {
        el.remove();
      }
    });

    clone.style.cssText = [
      "position:absolute",
      "top:0",
      "left:0",
      "margin:0",
      "padding:0",
      "width:100vw",
      `height:${document.documentElement.scrollHeight}px`,
      "overflow:visible",
      "pointer-events:none",
      "transform-origin:0 0",
    ].join(";");

    viewport.appendChild(clone);
    cloneRef.current = clone;

    // ── Glass reflection — primary diagonal highlight ────────────────
    // Realistic curved glass reflection: broad soft sweep across upper-left
    const reflection = document.createElement("div");
    reflection.style.cssText = [
      "position:absolute",
      "inset:0",
      "border-radius:50%",
      "pointer-events:none",
      "background:radial-gradient(ellipse 70% 55% at 30% 25%,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.08) 40%,transparent 70%)",
      "mix-blend-mode:screen",
    ].join(";");
    container.appendChild(reflection);
    reflectionRef.current = reflection;

    // ── Glass reflection — secondary crescent (lower-right) ──────────
    const reflection2 = document.createElement("div");
    reflection2.style.cssText = [
      "position:absolute",
      "inset:0",
      "border-radius:50%",
      "pointer-events:none",
      "background:radial-gradient(ellipse 50% 40% at 72% 75%,rgba(255,255,255,0.06) 0%,transparent 60%)",
      "mix-blend-mode:screen",
    ].join(";");
    container.appendChild(reflection2);

    // ── Glass reflection — thin bright arc (rim catch light) ─────────
    const reflectionArc = document.createElement("div");
    reflectionArc.style.cssText = [
      "position:absolute",
      "inset:0",
      "border-radius:50%",
      "pointer-events:none",
      "box-shadow:inset 3px 3px 8px rgba(255,255,255,0.12),inset -2px -2px 6px rgba(0,0,0,0.06)",
    ].join(";");
    container.appendChild(reflectionArc);

    // ── Chromatic edge — very subtle optical fringing ────────────────
    const chromatic = document.createElement("div");
    chromatic.style.cssText = [
      "position:absolute",
      "inset:0",
      "border-radius:50%",
      "pointer-events:none",
      "box-shadow:inset 0 0 0 1px rgba(100,130,255,0.04),inset 0 0 0 2px rgba(255,170,100,0.03)",
    ].join(";");
    container.appendChild(chromatic);

    // ── Handle ───────────────────────────────────────────────────────
    const handle = document.createElement("div");
    handle.setAttribute("data-magnifier", "true");
    const handleW = 72;
    const handleH = 20;
    const handleRot = 45;
    handle.style.cssText = [
      "position:fixed",
      "z-index:10001",
      "pointer-events:none",
      `width:${handleW}px`,
      `height:${handleH}px`,
      // Rounded ends for a turned-wood look
      "border-radius:5px 5px 10px 10px",
      // Dark walnut cylindrical gradient — 7 stops for realism
      "background:linear-gradient(180deg,#1e140c 0%,#3d2815 10%,#6b4423 25%,#8b5e34 40%,#7a5230 55%,#5c3a1e 75%,#2a1a0e 100%)",
      // Cylindrical shadow + highlight
      "box-shadow:0 3px 10px rgba(0,0,0,0.4),inset 0 1px 1px rgba(255,220,160,0.15),inset 0 -1px 1px rgba(0,0,0,0.4)",
      // Dark border for edge definition
      "border:1px solid rgba(20,12,5,0.7)",
      `transform:rotate(${handleRot}deg)`,
      "transform-origin:center center",
      "left:-9999px",
      "top:-9999px",
    ].join(";");
    document.body.appendChild(handle);

    // ── Handle end cap (butt end) — turned wood ──────────────────────
    const handleCap = document.createElement("div");
    handleCap.setAttribute("data-magnifier", "true");
    handleCap.style.cssText = [
      "position:fixed",
      "z-index:10001",
      "pointer-events:none",
      "width:24px",
      "height:24px",
      "border-radius:50%",
      // Radial gradient — wood end grain appearance
      "background:radial-gradient(circle at 42% 38%,#8b5e34 0%,#6b4423 35%,#3d2815 70%,#1e140c 100%)",
      // Realistic depth
      "box-shadow:0 2px 6px rgba(0,0,0,0.35),inset 0 1px 2px rgba(255,220,160,0.12),inset 0 -1px 2px rgba(0,0,0,0.3)",
      "border:1px solid rgba(20,12,5,0.6)",
      "left:-9999px",
      "top:-9999px",
    ].join(";");
    document.body.appendChild(handleCap);

    // ── Handle connector (ferrule / metal joint) ─────────────────────
    const ferrule = document.createElement("div");
    ferrule.setAttribute("data-magnifier", "true");
    ferrule.style.cssText = [
      "position:fixed",
      "z-index:10001",
      "pointer-events:none",
      "width:26px",
      "height:14px",
      "border-radius:3px",
      // Brushed metal ferrule
      dk
        ? "background:linear-gradient(180deg,#555 0%,#3a3a3a 30%,#4a4a4a 60%,#3a3a3a 100%)"
        : "background:linear-gradient(180deg,#bbb 0%,#999 30%,#aaa 60%,#999 100%)",
      "box-shadow:0 2px 5px rgba(0,0,0,0.3),inset 0 1px 1px rgba(255,255,255,0.2),inset 0 -1px 1px rgba(0,0,0,0.15)",
      dk
        ? "border:1px solid rgba(60,60,60,0.5)"
        : "border:1px solid rgba(140,140,140,0.4)",
      "transform:rotate(45deg)",
      "transform-origin:center center",
      "left:-9999px",
      "top:-9999px",
    ].join(";");
    document.body.appendChild(ferrule);

    // ── ESC key handler ──────────────────────────────────────────────
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    // ── Pointer move — update lens position + clone transform ────────
    const onPointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const cx = e.clientX;
        const cy = e.clientY;
        const sx = window.scrollX;
        const sy = window.scrollY;

        const totalSize = lensSize + rim * 2;
        const halfTotal = totalSize / 2;

        // Position the lens housing centered on cursor
        container.style.left = `${cx - halfTotal}px`;
        container.style.top = `${cy - halfTotal}px`;

        // Handle position: connects to the rim at ~45° (lower-right)
        const handleAttachX = cx + halfTotal * Math.cos((Math.PI * handleRot) / 180);
        const handleAttachY = cy + halfTotal * Math.sin((Math.PI * handleRot) / 180);
        handle.style.left = `${handleAttachX - handleW / 2}px`;
        handle.style.top = `${handleAttachY - handleH / 2}px`;

        // Ferrule: sits between rim and handle
        ferrule.style.left = `${handleAttachX - 13}px`;
        ferrule.style.top = `${handleAttachY - 7}px`;

        // Handle cap: at the far end of the handle
        const capDist = handleW * 0.88;
        const capX = handleAttachX + capDist * Math.cos((Math.PI * handleRot) / 180);
        const capY = handleAttachY + capDist * Math.sin((Math.PI * handleRot) / 180);
        handleCap.style.left = `${capX - 12}px`;
        handleCap.style.top = `${capY - 12}px`;

        // Subtle reflection shift based on cursor position — simulates light angle
        const rx = ((cx / window.innerWidth) - 0.5) * 8;
        const ry = ((cy / window.innerHeight) - 0.5) * 8;
        if (reflectionRef.current) {
          reflectionRef.current.style.transform = `translate(${rx}px,${ry}px)`;
        }

        // Transform clone to show correct region at 2× magnification
        const tx = lensSize / 2 - (cx + sx) * ZOOM;
        const ty = lensSize / 2 - (cy + sy) * ZOOM;
        if (clone) {
          clone.style.transform = `translate(${tx}px,${ty}px) scale(${ZOOM})`;
        }
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(rafRef.current);
      container.remove();
      handle.remove();
      handleCap.remove();
      ferrule.remove();
      cloneRef.current = null;
      reflectionRef.current = null;
    };
  }, [active, onClose, lensSize]);

  if (!active) return null;

  return null;
}
