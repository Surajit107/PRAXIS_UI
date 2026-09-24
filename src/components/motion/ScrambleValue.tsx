"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const GLYPHS = "0123456789ABCDEF" as const;

type ScrambleValueProps = {
  value: number | string;
  /** Total scramble + settle time. Ignored when value is 0. */
  duration?: number;
  className?: string;
  onSettled?: () => void;
};

function formatValue(n: number): string {
  return Math.round(n).toString();
}

function scrambleFrame(target: string, progress: number): string {
  const reveal = Math.floor(progress * target.length);
  let out = "";
  for (let i = 0; i < target.length; i += 1) {
    if (i < reveal) {
      out += target[i];
      continue;
    }
    out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "0";
  }
  return out;
}

/**
 * Technical readout motion:
 * - Numeric non-zero: hex glyphs scramble → count settle (never rests on a fake 0).
 * - String (e.g. "100+"): scramble → settle on the literal.
 * - Zero: lock-in only — value stays 0 the entire time.
 */
export function ScrambleValue({ value, duration = 1.35, className, onSettled }: ScrambleValueProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;
  const inView = useInView(ref, { once: true, margin: "0px 0px 120px 0px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;

    const isNumeric = typeof value === "number";
    const finalText = isNumeric ? formatValue(value) : value;

    if (reduceMotion) {
      node.textContent = finalText;
      settledRef.current?.();
      return;
    }

    // Zero locks immediately — never scramble or count through noise.
    if (isNumeric && value === 0) {
      node.textContent = "0";
      const lock = window.setTimeout(() => settledRef.current?.(), 220);
      return () => window.clearTimeout(lock);
    }

    const scrambleMs = duration * 450;
    let cancelled = false;
    let raf = 0;
    let scrambleStart = 0;
    let stopCount: (() => void) | undefined;

    const runScramble = (now: number) => {
      if (cancelled) return;
      if (!scrambleStart) scrambleStart = now;
      const t = Math.min(1, (now - scrambleStart) / scrambleMs);
      node.textContent = scrambleFrame(finalText, t * 0.55);
      if (t < 1) {
        raf = requestAnimationFrame(runScramble);
        return;
      }

      if (!isNumeric) {
        node.textContent = finalText;
        settledRef.current?.();
        return;
      }

      const countSec = duration * 0.55;
      const controls = animate(0, value, {
        duration: countSec,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          const next = Math.round(latest);
          // Avoid painting a resting 0 over a real metric mid-transition.
          if (next === 0 && value > 0) {
            node.textContent = scrambleFrame(finalText, 0.65);
            return;
          }
          node.textContent = formatValue(next);
        },
        onComplete: () => {
          node.textContent = finalText;
          settledRef.current?.();
        },
      });
      stopCount = () => controls.stop();
    };

    raf = requestAnimationFrame(runScramble);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stopCount?.();
    };
  }, [inView, reduceMotion, value, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
