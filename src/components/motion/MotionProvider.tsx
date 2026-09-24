"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import { type ReactNode } from "react";

// Animation features (incl. layout/layoutId) are split into a lazy chunk; `m.*` renders without them first.
const loadFeatures = () => import("./features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
