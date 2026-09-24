import type { Transition } from "motion/react";

/**
 * Scroll-appear presets aligned with asteriq-web / asteriq.in
 * (Framer enter: headers = y:50 tween, cards = y:60 spring + column delays).
 */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Badge / subtitle */
export const FRAMER_EASE_SMOOTH: [number, number, number, number] = [0.44, 0, 0.56, 1];

/** Title */
export const FRAMER_EASE_SOFT: [number, number, number, number] = [0.12, 0.23, 0.5, 1];

export const HEADER_DISTANCE_PX = 50;
export const CARD_DISTANCE_PX = 60;
export const SERVICE_SLIDE_PX = 80;

export const HEADER_DELAY = {
  badge: 0,
  title: 0.1,
  subtitle: 0.2,
} as const;

/** Desktop 3-column card delays */
export const CARD_COLUMN_DELAYS = [0.6, 0.8, 1] as const;

export type HeaderTone = "badge" | "title" | "subtitle";

export function headerTween(tone: HeaderTone, prefersReduced: boolean | null): Transition {
  if (prefersReduced) {
    return { duration: 0.01 };
  }

  return {
    type: "tween",
    duration: 0.4,
    delay: HEADER_DELAY[tone],
    ease: tone === "title" ? FRAMER_EASE_SOFT : FRAMER_EASE_SMOOTH,
  };
}

export const CARD_SPRING: Transition = {
  type: "spring",
  damping: 80,
  stiffness: 220,
  mass: 1,
};

export const CARD_SPRING_SOFT: Transition = {
  type: "spring",
  damping: 70,
  stiffness: 210,
  mass: 1,
};

export const SERVICE_SLIDE_SPRING: Transition = {
  type: "spring",
  damping: 80,
  stiffness: 250,
  mass: 1,
};

export type CardSpringKind = "default" | "soft" | "slide";

export function cardSpring(
  kind: CardSpringKind,
  prefersReduced: boolean | null,
  delay = 0,
): Transition {
  if (prefersReduced) {
    return { duration: 0.01, delay: 0 };
  }

  const base =
    kind === "soft" ? CARD_SPRING_SOFT : kind === "slide" ? SERVICE_SLIDE_SPRING : CARD_SPRING;

  return { ...base, delay };
}

export function columnDelay(
  index: number,
  columns: number,
  delays: readonly number[] = CARD_COLUMN_DELAYS,
): number {
  if (columns <= 1) return delays[0] ?? 0.6;
  return delays[index % columns] ?? delays[0] ?? 0.6;
}
