"use client";

import { m } from "motion/react";
import { EASE_OUT } from "./Reveal";

/** Hairline that draws left→right on first view (connector between steps). */
export function DrawLine({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none h-px bg-hairline ${className}`}>
      <m.div
        className="h-px origin-left bg-[linear-gradient(90deg,var(--accent),transparent)]"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "0px 0px -80px 0px" }}
        transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.2 }}
      />
    </div>
  );
}
