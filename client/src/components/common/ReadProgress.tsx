import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/** Reading progress bar shown on article pages. */
export function ReadProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent"
      aria-hidden="true"
    />
  );
}