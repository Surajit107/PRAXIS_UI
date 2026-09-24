"use client";

import { useMotionValue, useSpring, type MotionValue } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";

type Options = {
  /** Max translate in px at the edges of the element. Keep tiny for premium feel. */
  strength?: number;
  /** Spring stiffness / damping — higher stiffness = snappier. */
  stiffness?: number;
  damping?: number;
  /** When true, values stay at 0 and listeners are not attached. */
  disabled?: boolean;
};

/**
 * Subtle pointer-driven parallax for a single container.
 * Returns spring-smoothed x/y in roughly [-strength, strength].
 * Cleans up listeners and cancels lingering pointer state on unmount.
 */
export function usePointerParallax({
  strength = 8,
  stiffness = 120,
  damping = 22,
  disabled = false,
}: Options = {}): {
  ref: RefObject<HTMLDivElement | null>;
  x: MotionValue<number>;
  y: MotionValue<number>;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness, damping, mass: 0.4 });
  const y = useSpring(rawY, { stiffness, damping, mass: 0.4 });

  useEffect(() => {
    if (disabled) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;
    let dirty = false;

    const flush = () => {
      frame = 0;
      dirty = false;
      rawX.set(nextX);
      rawY.set(nextY);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      nextX = Math.max(-1, Math.min(1, nx)) * strength;
      nextY = Math.max(-1, Math.min(1, ny)) * strength;
      if (!dirty) {
        dirty = true;
        frame = requestAnimationFrame(flush);
      }
    };

    const onLeave = () => {
      nextX = 0;
      nextY = 0;
      if (!dirty) {
        dirty = true;
        frame = requestAnimationFrame(flush);
      }
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [disabled, strength, rawX, rawY]);

  return { ref, x, y };
}
