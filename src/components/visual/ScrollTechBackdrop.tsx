"use client";

import { m, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useId, useMemo, useState } from "react";
import { HEX_MARK_INNER, HEX_MARK_OUTER } from "@/components/visual/HexMark";

/** Honeycomb-scale viewBox — hairline strokes stay thin on any screen. */
const VIEW_W = 1920;
const VIEW_H = 1080;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
/** Central die half-size (the dark square hub in the reference). */
const DIE = 56;

function useDocumentScrollProgress(disabled: boolean) {
  const raw = useMotionValue(0);
  const progress = useSpring(raw, { stiffness: 90, damping: 32, mass: 0.35 });

  useEffect(() => {
    if (disabled) {
      raw.set(0);
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      raw.set(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
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

  return progress;
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmt = (n: number) => n.toFixed(1);
/** Stable SVG numbers — Node/browser float stringification otherwise mismatches on hydrate. */
const round = (n: number) => Math.round(n * 10) / 10;

type Trace = {
  id: number;
  d: string;
  /** 0 = near die, 1 = outer rim — drives scroll reveal order. */
  ring: number;
  weight: number;
};

type Component = {
  id: number;
  x: number;
  y: number;
  s: number;
  ring: number;
  bright: boolean;
};

type Glow = {
  id: number;
  x: number;
  y: number;
  r: number;
  ring: number;
};

type Board = {
  traces: Trace[];
  components: Component[];
  glows: Glow[];
  vias: { x: number; y: number; r: number }[];
};

/**
 * Radial motherboard: traces leave the die on 90° / 45° routes,
 * small square packages sit on the runs — matching the reference composition.
 */
function buildRadialBoard(seed: number): Board {
  const rand = mulberry32(seed);
  const traces: Trace[] = [];
  const components: Component[] = [];
  const glows: Glow[] = [];
  const vias: { x: number; y: number; r: number }[] = [];

  /** Pin on die rim → outward radial PCB route with elbows. */
  function radiate(angle: number, reach: number, bends: number): string {
    const x0 = CX + Math.cos(angle) * (DIE + 2);
    const y0 = CY + Math.sin(angle) * (DIE + 2);
    let x = x0;
    let y = y0;
    const parts = [`M ${fmt(x)} ${fmt(y)}`];

    const targetX = CX + Math.cos(angle) * reach;
    const targetY = CY + Math.sin(angle) * reach;

    // Alternate H/V segments toward the target (classic PCB fan-out).
    let horizFirst = Math.abs(Math.cos(angle)) >= Math.abs(Math.sin(angle));
    for (let b = 0; b < bends; b += 1) {
      const t = (b + 1) / (bends + 1);
      const nx = x0 + (targetX - x0) * t + (rand() - 0.5) * 36;
      const ny = y0 + (targetY - y0) * t + (rand() - 0.5) * 36;
      if (horizFirst) {
        parts.push(`H ${fmt(nx)}`);
        parts.push(`V ${fmt(ny)}`);
      } else {
        parts.push(`V ${fmt(ny)}`);
        parts.push(`H ${fmt(nx)}`);
      }
      x = nx;
      y = ny;
      horizFirst = !horizFirst;
    }
    parts.push(`H ${fmt(targetX)}`);
    parts.push(`V ${fmt(targetY)}`);
    return parts.join(" ");
  }

  // Primary rays from every side of the die (dense like the reference).
  const rayCount = 48;
  for (let i = 0; i < rayCount; i += 1) {
    const angle = (i / rayCount) * Math.PI * 2 + (rand() - 0.5) * 0.06;
    const reach = 280 + rand() * 520;
    traces.push({
      id: traces.length,
      d: radiate(angle, reach, 2 + Math.floor(rand() * 3)),
      ring: round(Math.min(1, (reach - DIE) / 700) * 100) / 100,
      weight: round(0.9 + rand() * 0.5),
    });

    // Square packages along the ray
    const packages = 2 + Math.floor(rand() * 3);
    for (let p = 0; p < packages; p += 1) {
      const t = 0.22 + (p / packages) * 0.55 + rand() * 0.06;
      const px = CX + Math.cos(angle) * (DIE + (reach - DIE) * t) + (rand() - 0.5) * 14;
      const py = CY + Math.sin(angle) * (DIE + (reach - DIE) * t) + (rand() - 0.5) * 14;
      const s = 5 + rand() * 7;
      components.push({
        id: components.length,
        x: round(px - s / 2),
        y: round(py - s / 2),
        s: round(s),
        ring: round(t * 100) / 100,
        bright: rand() > 0.7,
      });
    }

    // Occasional glow node (hotspot)
    if (rand() > 0.55) {
      const t = 0.3 + rand() * 0.45;
      glows.push({
        id: glows.length,
        x: round(CX + Math.cos(angle) * (DIE + (reach - DIE) * t)),
        y: round(CY + Math.sin(angle) * (DIE + (reach - DIE) * t)),
        r: round(2.2 + rand() * 2.4),
        ring: round(t * 100) / 100,
      });
    }
  }

  // Secondary finer traces — fill the field between primary rays
  for (let i = 0; i < 64; i += 1) {
    const angle = rand() * Math.PI * 2;
    const reach = 180 + rand() * 420;
    traces.push({
      id: traces.length,
      d: radiate(angle, reach, 1 + Math.floor(rand() * 2)),
      ring: round(Math.min(1, (reach - DIE) / 700) * 100) / 100,
      weight: round(0.6 + rand() * 0.35),
    });
  }

  // Concentric square rings + spurs (power-plane / bus look)
  for (const inset of [140, 220, 320, 420, 540]) {
    const left = CX - inset;
    const right = CX + inset;
    const top = CY - inset;
    const bottom = CY + inset;
    const ring = Math.min(1, inset / 700);

    for (const d of [
      `M ${fmt(left)} ${fmt(top)} H ${fmt(right)}`,
      `M ${fmt(right)} ${fmt(top)} V ${fmt(bottom)}`,
      `M ${fmt(right)} ${fmt(bottom)} H ${fmt(left)}`,
      `M ${fmt(left)} ${fmt(bottom)} V ${fmt(top)}`,
    ]) {
      traces.push({ id: traces.length, d, ring, weight: 0.75 });
    }

    for (let i = 0; i < 8; i += 1) {
      const side = Math.floor(rand() * 4);
      let x0 = CX;
      let y0 = CY;
      let x1 = CX;
      let y1 = CY;
      if (side === 0) {
        x0 = left + rand() * (inset * 2);
        y0 = top;
        x1 = x0 + (rand() - 0.5) * 80;
        y1 = top - 30 - rand() * 70;
      } else if (side === 1) {
        x0 = right;
        y0 = top + rand() * (inset * 2);
        x1 = right + 30 + rand() * 70;
        y1 = y0 + (rand() - 0.5) * 80;
      } else if (side === 2) {
        x0 = left + rand() * (inset * 2);
        y0 = bottom;
        x1 = x0 + (rand() - 0.5) * 80;
        y1 = bottom + 30 + rand() * 70;
      } else {
        x0 = left;
        y0 = top + rand() * (inset * 2);
        x1 = left - 30 - rand() * 70;
        y1 = y0 + (rand() - 0.5) * 80;
      }
      traces.push({
        id: traces.length,
        d: `M ${fmt(x0)} ${fmt(y0)} H ${fmt(x1)} V ${fmt(y1)}`,
        ring: round(Math.min(1, ring + 0.08) * 100) / 100,
        weight: 0.65,
      });
    }
  }

  // Vias near the die and mid-rings
  for (let i = 0; i < 36; i += 1) {
    const angle = rand() * Math.PI * 2;
    const dist = DIE + 24 + rand() * 380;
    vias.push({
      x: round(CX + Math.cos(angle) * dist),
      y: round(CY + Math.sin(angle) * dist),
      r: round(1.3 + rand() * 1.1),
    });
  }

  return { traces, components, glows, vias };
}

function ScrollTrace({
  trace,
  progress,
}: {
  trace: Trace;
  progress: MotionValue<number>;
}) {
  // Reveal from center outward as the page scrolls.
  const start = 0.05 + trace.ring * 0.55;
  const end = start + 0.12;
  const pathLength = useTransform(progress, [start, end], [0, 1]);
  const opacity = useTransform(progress, [start, end, Math.min(1, end + 0.4)], [0, 0.28, 0.1]);

  return (
    <m.path
      d={trace.d}
      fill="none"
      stroke="var(--accent)"
      strokeWidth={fmt(trace.weight)}
      strokeLinecap="square"
      strokeLinejoin="miter"
      style={{ pathLength, opacity }}
    />
  );
}

function ScrollComponent({
  item,
  progress,
}: {
  item: Component;
  progress: MotionValue<number>;
}) {
  const start = 0.06 + item.ring * 0.55;
  const opacity = useTransform(progress, [start - 0.02, start + 0.08, start + 0.45], [0, 0.7, 0.45]);

  return (
    <m.rect
      style={{ opacity }}
      x={fmt(item.x)}
      y={fmt(item.y)}
      width={fmt(item.s)}
      height={fmt(item.s)}
      rx="0.8"
      fill="var(--accent)"
      fillOpacity={item.bright ? 0.1 : 0.04}
      stroke="var(--accent)"
      strokeOpacity={item.bright ? 0.4 : 0.2}
      strokeWidth="1"
    />
  );
}

function ScrollGlow({
  glow,
  progress,
}: {
  glow: Glow;
  progress: MotionValue<number>;
}) {
  const start = 0.08 + glow.ring * 0.55;
  const opacity = useTransform(progress, [start, start + 0.1, start + 0.5], [0, 0.45, 0.15]);

  return (
    <m.circle
      style={{ opacity }}
      cx={fmt(glow.x)}
      cy={fmt(glow.y)}
      r={fmt(glow.r)}
      fill="var(--accent)"
      fillOpacity="0.4"
    />
  );
}

/**
 * Radial PCB backdrop — central die, fanning traces, square packages.
 * Honeycomb opacity language; scroll reveals from the core outward.
 */
export function ScrollTechBackdrop() {
  const reduceMotion = useReducedMotion() === true;
  const [mounted, setMounted] = useState(false);
  const progress = useDocumentScrollProgress(reduceMotion || !mounted);
  const board = useMemo(() => buildRadialBoard(47), []);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const logoGlowId = `die-logo-glow-${uid}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const stageOpacity = useTransform(progress, [0, 0.07, 0.22, 0.7, 0.92, 1], [0, 0.28, 0.58, 0.52, 0.32, 0.12]);
  const driftY = useTransform(progress, [0, 1], [20, -40]);
  const dieOpacity = useTransform(progress, [0.04, 0.14], [0, 0.75]);
  // Logo glow breathes with scroll — stronger mid-page, soft fade at ends.
  const logoGlow = useTransform(progress, [0.08, 0.25, 0.55, 0.85], [0.25, 0.75, 0.9, 0.35]);

  // Client-only: avoid SSR float / prefers-reduced-motion hydration mismatches.
  if (!mounted || reduceMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <m.div
        style={{
          opacity: stageOpacity,
          // Soft vignette — detail in center/mid, fade at corners (like the reference).
          maskImage: "radial-gradient(ellipse 62% 58% at 50% 46%, #000 18%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 62% 58% at 50% 46%, #000 18%, transparent 100%)",
        }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 38% 42% at 50% 46%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 72%)",
          }}
        />

        <m.svg
          style={{ y: driftY }}
          className="absolute inset-0 h-[115%] w-full"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id={logoGlowId} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id={`${logoGlowId}-bloom`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
              <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Traces fan out from the die */}
          {board.traces.map((trace) => (
            <ScrollTrace key={trace.id} trace={trace} progress={progress} />
          ))}

          {/* Square packages on the runs */}
          {board.components.map((item) => (
            <ScrollComponent key={item.id} item={item} progress={progress} />
          ))}

          {/* Hotspot nodes */}
          {board.glows.map((glow) => (
            <ScrollGlow key={glow.id} glow={glow} progress={progress} />
          ))}

          {/* Vias */}
          {board.vias.map((via, i) => (
            <circle
              key={`via-${i}`}
              cx={fmt(via.x)}
              cy={fmt(via.y)}
              r={fmt(via.r)}
              fill="none"
              stroke="var(--accent)"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
          ))}

          {/* Central die — logo hub */}
          <m.g style={{ opacity: dieOpacity }}>
            <rect
              x={CX - DIE - 6}
              y={CY - DIE - 6}
              width={(DIE + 6) * 2}
              height={(DIE + 6) * 2}
              rx="4"
              fill="var(--background)"
              stroke="var(--accent)"
              strokeOpacity="0.22"
              strokeWidth="1.25"
            />
            <rect
              x={CX - DIE}
              y={CY - DIE}
              width={DIE * 2}
              height={DIE * 2}
              rx="2"
              fill="var(--surface)"
              stroke="var(--accent)"
              strokeOpacity="0.22"
              strokeWidth="1"
            />

            {/* Soft bloom behind the mark — fades with scroll */}
            <m.circle
              cx={CX}
              cy={CY}
              r={DIE * 0.85}
              fill={`url(#${logoGlowId}-bloom)`}
              style={{ opacity: logoGlow }}
            />

            {/* Praxis hex mark */}
            <m.g
              filter={`url(#${logoGlowId})`}
              style={{ opacity: logoGlow }}
              transform={`translate(${CX} ${CY}) scale(2.85) translate(-16 -16)`}
            >
              <polygon
                points={HEX_MARK_OUTER}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeOpacity="0.9"
              />
              <m.polygon
                points={HEX_MARK_INNER}
                fill="var(--accent)"
                initial={{ opacity: 0.55 }}
                animate={{ opacity: [0.45, 0.95, 0.45] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </m.g>

            {/* Bond pads on the package rim */}
            {Array.from({ length: 9 }, (_, i) => {
              const t = (i / 8) * 2 - 1;
              return (
                <g key={`bond-${i}`}>
                  <rect
                    x={CX + t * DIE - 2.2}
                    y={CY - DIE - 5}
                    width="4.4"
                    height="3.2"
                    fill="var(--accent)"
                    fillOpacity="0.18"
                  />
                  <rect
                    x={CX + t * DIE - 2.2}
                    y={CY + DIE + 1.8}
                    width="4.4"
                    height="3.2"
                    fill="var(--accent)"
                    fillOpacity="0.18"
                  />
                  <rect
                    x={CX - DIE - 5}
                    y={CY + t * DIE - 2.2}
                    width="3.2"
                    height="4.4"
                    fill="var(--accent)"
                    fillOpacity="0.18"
                  />
                  <rect
                    x={CX + DIE + 1.8}
                    y={CY + t * DIE - 2.2}
                    width="3.2"
                    height="4.4"
                    fill="var(--accent)"
                    fillOpacity="0.18"
                  />
                </g>
              );
            })}
          </m.g>
        </m.svg>
      </m.div>
    </div>
  );
}
