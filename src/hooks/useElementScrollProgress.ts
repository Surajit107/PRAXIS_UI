"use client";

import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";

type Options = {
  disabled?: boolean;
  stiffness?: number;
  damping?: number;
};

/**
 * Tracks how far an element has scrolled through the viewport as 0→1.
 * 0 = fully in view at top; 1 = mostly scrolled past.
 * Uses rAF coalescing; cleans up scroll listener + frame on unmount.
 */
export function useElementScrollProgress({
  disabled = false,
  stiffness = 90,
  damping = 24,
}: Options = {}): {
  ref: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
} {
  const ref = useRef<HTMLElement | null>(null);
  const raw = useMotionValue(0);
  const progress = useSpring(raw, { stiffness, damping, mass: 0.35 });

  useEffect(() => {
    if (disabled) {
      raw.set(0);
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = Math.max(rect.height * 0.65, 1);
      const value = Math.max(0, Math.min(1, -rect.top / travel));
      raw.set(value);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [disabled, raw]);

  return { ref, progress };
}
