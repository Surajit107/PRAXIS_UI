"use client";

import { m, useReducedMotion, type Variants } from "motion/react";
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  CARD_DISTANCE_PX,
  HEADER_DISTANCE_PX,
  SERVICE_SLIDE_PX,
  cardSpring,
  columnDelay,
  headerTween,
  type CardSpringKind,
  type HeaderTone,
} from "./reveal-presets";

export { EASE_OUT } from "./reveal-presets";

const tags = {
  div: m.div,
  ul: m.ul,
  ol: m.ol,
  li: m.li,
  dl: m.dl,
  article: m.article,
  section: m.section,
  span: m.span,
} as const;

type MotionTag = keyof typeof tags;

type BaseProps = {
  children: ReactNode;
  className?: string;
  as?: MotionTag;
};

function resolveTag(as: MotionTag) {
  return tags[as] as typeof m.div;
}

type RevealDirection = "up" | "down" | "left" | "right" | "none";

const OFFSET: Record<RevealDirection, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

type RevealProps = BaseProps & {
  direction?: RevealDirection;
  /** Header role — badge / title / subtitle delays + easing. */
  tone?: HeaderTone;
  delay?: number;
  distance?: number;
  once?: boolean;
  /** Animate on mount (hero / above-the-fold). */
  immediate?: boolean;
  viewportMargin?: string;
};

/**
 * Scroll-reveal — asteriq-style header fade-up (y:50 tween by default).
 */
export function Reveal({
  children,
  className,
  as = "div",
  direction = "up",
  tone,
  delay = 0,
  distance = HEADER_DISTANCE_PX,
  once = true,
  immediate = false,
  viewportMargin = "0px",
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const base = OFFSET[direction];
  const Tag = resolveTag(as);

  const transition = tone
    ? headerTween(tone, prefersReduced)
    : prefersReduced
      ? { duration: 0.01, delay: 0 }
      : {
          type: "tween" as const,
          duration: 0.4,
          delay,
          ease: [0.44, 0, 0.56, 1] as [number, number, number, number],
        };

  const variants: Variants = {
    hidden: prefersReduced
      ? { opacity: 0 }
      : {
          opacity: 0,
          x: base.x * distance,
          y: base.y * distance,
        },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition,
    },
  };

  if (immediate) {
    return (
      <Tag className={className} variants={variants} initial="hidden" animate="visible">
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0, margin: viewportMargin }}
    >
      {children}
    </Tag>
  );
}

type StaggerContextValue = {
  columns: number;
  spring: CardSpringKind;
  once: boolean;
  /** Legacy sequential delay step (seconds). When set, overrides column delays. */
  staggerStep: number | null;
  register: () => number;
};

const StaggerContext = createContext<StaggerContextValue | null>(null);

type StaggerProps = BaseProps & {
  columns?: number;
  spring?: CardSpringKind;
  once?: boolean;
  /**
   * Legacy sequential delay between children (MethodsExplorer / older call sites).
   * Prefer `columns` for asteriq column delays.
   */
  stagger?: number;
};

/**
 * Index context for card enters. Each `StaggerItem` observes the viewport itself
 * (asteriq/Framer pattern — not parent staggerChildren).
 */
export function Stagger({
  children,
  className,
  as = "div",
  columns = 3,
  spring = "default",
  once = true,
  stagger,
}: StaggerProps) {
  const indexRef = useRef(0);
  indexRef.current = 0;

  const value = useMemo<StaggerContextValue>(
    () => ({
      columns,
      spring,
      once,
      staggerStep: stagger ?? null,
      register: () => {
        const current = indexRef.current;
        indexRef.current += 1;
        return current;
      },
    }),
    [columns, spring, once, stagger],
  );

  const Tag = as === "ul" ? "ul" : as === "ol" ? "ol" : as === "dl" ? "dl" : "div";

  return (
    <StaggerContext.Provider value={value}>
      <Tag className={className}>{children}</Tag>
    </StaggerContext.Provider>
  );
}

type StaggerItemProps = BaseProps & {
  distance?: number;
  direction?: "up" | "left" | "right";
  index?: number;
  delay?: number;
};

/**
 * Card enter — asteriq spring fade-up (y:60) or horizontal slide.
 */
export function StaggerItem({
  children,
  className,
  as = "div",
  distance,
  direction = "up",
  index: indexProp,
  delay: delayProp,
}: StaggerItemProps) {
  const prefersReduced = useReducedMotion();
  const ctx = useContext(StaggerContext);
  const Tag = resolveTag(as);

  const columns = ctx?.columns ?? 3;
  const springKind = ctx?.spring ?? "default";
  const once = ctx?.once ?? true;
  const staggerStep = ctx?.staggerStep ?? null;

  const index = indexProp ?? (ctx !== null ? ctx.register() : 0);

  const resolvedDistance =
    distance ?? (direction === "up" ? CARD_DISTANCE_PX : SERVICE_SLIDE_PX);

  const delay =
    delayProp ??
    (staggerStep !== null
      ? index * staggerStep
      : springKind === "slide"
        ? 0
        : columnDelay(index, columns));

  const transition = cardSpring(springKind, prefersReduced, delay);

  const hiddenOffset =
    direction === "left"
      ? { x: -resolvedDistance, y: 0 }
      : direction === "right"
        ? { x: resolvedDistance, y: 0 }
        : { x: 0, y: resolvedDistance };

  const variants: Variants = {
    hidden: prefersReduced ? { opacity: 0 } : { opacity: 0, ...hiddenOffset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition,
    },
  };

  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0, margin: "0px" }}
    >
      {children}
    </Tag>
  );
}
