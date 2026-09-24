"use client";

import { m } from "motion/react";
import { useEffect, useId, useMemo, useRef, type CSSProperties } from "react";

/** Pointy-top hex geometry. One viewBox unit === 1 CSS px up to VIEW_WIDTH wide viewports. */
const RADIUS = 34;
const HEX_WIDTH = Math.sqrt(3) * RADIUS;
const ROW_STEP = 1.5 * RADIUS;
const TILE_HEIGHT = 3 * RADIUS;
const VIEW_WIDTH = 1920;
/** Shifts the grid so a hex column is centred on the viewport (symmetry on every width). */
const GRID_OFFSET_X = (VIEW_WIDTH / 2 - HEX_WIDTH / 2) % HEX_WIDTH;
const MIN_CELL_GAP = HEX_WIDTH * 2.4;
const MAX_ATTEMPTS = 600;
const SPOTLIGHT_RADIUS_PX = 220;

const fmt = (n: number) => n.toFixed(2);

// One hex plus the connector down to the next row; neighbouring tiles complete the offset row.
const TILE_PATH = [
  `M${fmt(HEX_WIDTH / 2)} ${fmt(2 * RADIUS)}`,
  `L0 ${fmt(1.5 * RADIUS)}`,
  `L0 ${fmt(0.5 * RADIUS)}`,
  `L${fmt(HEX_WIDTH / 2)} 0`,
  `L${fmt(HEX_WIDTH)} ${fmt(0.5 * RADIUS)}`,
  `L${fmt(HEX_WIDTH)} ${fmt(1.5 * RADIUS)}`,
  `L${fmt(HEX_WIDTH / 2)} ${fmt(2 * RADIUS)}`,
  `L${fmt(HEX_WIDTH / 2)} ${fmt(TILE_HEIGHT)}`,
].join("");

const hw = HEX_WIDTH / 2;
const HEX_POINTS = [
  [0, -RADIUS],
  [hw, -RADIUS / 2],
  [hw, RADIUS / 2],
  [0, RADIUS],
  [-hw, RADIUS / 2],
  [-hw, -RADIUS / 2],
]
  .map(([x, y]) => `${fmt(x)},${fmt(y)}`)
  .join(" ");

type Anchor = "top" | "bottom";

/** Normalised (0–1) viewBox rectangle where lit cells must not land, e.g. behind a headline. */
export type QuietZone = { x0: number; x1: number; y0: number; y1: number };

type LitCell = { x: number; y: number; bright: boolean; delay: number; duration: number };

type HoneycombBackgroundProps = {
  anchor?: Anchor;
  /** Height of the pattern band in px (viewBox height). */
  height?: number;
  litCount?: number;
  /** Horizontal centre of the fade ellipse, 0–1. */
  focusX?: number;
  quietZone?: QuietZone;
  seed?: number;
  interactive?: boolean;
  className?: string;
};

/** Deterministic PRNG so server and client render identical cells (no hydration mismatch). */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cellCenter(col: number, row: number) {
  return {
    x: GRID_OFFSET_X + col * HEX_WIDTH + HEX_WIDTH / 2 + (row % 2 === 1 ? HEX_WIDTH / 2 : 0),
    y: RADIUS + row * ROW_STEP,
  };
}

function generateLitCells(options: {
  height: number;
  count: number;
  seed: number;
  anchor: Anchor;
  focusX: number;
  quietZone?: QuietZone;
}): LitCell[] {
  const { height, count, seed, anchor, focusX, quietZone } = options;
  const random = mulberry32(seed);
  const cols = Math.ceil(VIEW_WIDTH / HEX_WIDTH);
  const rows = Math.ceil(height / ROW_STEP);
  const cells: LitCell[] = [];

  for (let attempt = 0; attempt < MAX_ATTEMPTS && cells.length < count; attempt += 1) {
    const { x, y } = cellCenter(Math.floor(random() * cols), Math.floor(random() * rows));
    const u = x / VIEW_WIDTH;
    const v = anchor === "top" ? y / height : 1 - y / height;

    if (quietZone && u > quietZone.x0 && u < quietZone.x1 && v > quietZone.y0 && v < quietZone.y1) continue;

    // Probability follows the visible part of the fade mask, so cells never hide in the dark.
    const visibility = 1 - ((u - focusX) / 0.42) ** 2 - (v / 0.85) ** 2;
    if (visibility <= 0 || random() > visibility) continue;

    if (cells.some((cell) => Math.hypot(cell.x - x, cell.y - y) < MIN_CELL_GAP)) continue;

    cells.push({
      x,
      y,
      bright: random() < 0.25,
      delay: random() * 6,
      duration: 5 + random() * 4,
    });
  }
  return cells;
}

/**
 * Writes pointer coords as CSS vars on the band (inherited by the spotlight layer).
 * Listens on the band's parent because the band itself is pointer-events: none.
 */
function usePointerSpotlight(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    const host = node?.parentElement;
    if (!enabled || !node || !host) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let lastX = 0;
    let lastY = 0;

    const paint = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--hx", `${lastX - rect.left}px`);
      node.style.setProperty("--hy", `${lastY - rect.top}px`);
      node.style.setProperty("--ho", "1");
    };

    const handleMove = (event: PointerEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const handleLeave = () => node.style.setProperty("--ho", "0");

    host.addEventListener("pointermove", handleMove, { passive: true });
    host.addEventListener("pointerleave", handleLeave);
    return () => {
      host.removeEventListener("pointermove", handleMove);
      host.removeEventListener("pointerleave", handleLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return ref;
}

function HexGrid({ id, height, strokeOpacity }: { id: string; height: number; strokeOpacity: number }) {
  return (
    <>
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width={HEX_WIDTH} height={TILE_HEIGHT} x={GRID_OFFSET_X}>
          <path d={TILE_PATH} fill="none" stroke="var(--accent)" strokeOpacity={strokeOpacity} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={VIEW_WIDTH} height={height} fill={`url(#${id})`} />
    </>
  );
}

export function HoneycombBackground({
  anchor = "top",
  height = 760,
  litCount = 12,
  focusX = 0.5,
  quietZone,
  seed = 7,
  interactive = false,
  className = "",
}: HoneycombBackgroundProps) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const spotlightRef = usePointerSpotlight(interactive);

  const cells = useMemo(
    () => generateLitCells({ height, count: litCount, seed, anchor, focusX, quietZone }),
    [height, litCount, seed, anchor, focusX, quietZone],
  );

  const ellipseAt = `${focusX * 100}% ${anchor === "top" ? "0%" : "100%"}`;
  /* Top: fade out downward. Bottom: stay solid at the section edge so no black dead-zone before the footer. */
  const fadeMask =
    anchor === "top"
      ? `radial-gradient(ellipse 62% 100% at ${ellipseAt}, #000 25%, transparent 100%)`
      : `linear-gradient(to top, #000 55%, transparent 100%)`;
  const aspect = anchor === "top" ? "xMidYMin slice" : "xMidYMax slice";
  const viewBox = `0 0 ${VIEW_WIDTH} ${height}`;

  const bandStyle: CSSProperties = {
    height,
    maskImage: fadeMask,
    WebkitMaskImage: fadeMask,
  };
  const spotlightMask = `radial-gradient(${SPOTLIGHT_RADIUS_PX}px circle at var(--hx, -999px) var(--hy, -999px), #000, transparent)`;

  return (
    <m.div
      ref={spotlightRef}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={`pointer-events-none absolute inset-x-0 ${anchor === "top" ? "top-0" : "bottom-0"} overflow-hidden ${className}`}
      style={bandStyle}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 45% 70% at ${ellipseAt}, color-mix(in srgb, var(--accent) 9%, transparent), transparent 70%)`,
        }}
      />

      <svg className="absolute inset-0 h-full w-full" viewBox={viewBox} preserveAspectRatio={aspect}>
        <HexGrid id={`hc-${reactId}`} height={height} strokeOpacity={0.1} />
        {cells.map((cell) => (
          <polygon
            key={`${cell.x.toFixed(0)}-${cell.y.toFixed(0)}`}
            points={HEX_POINTS}
            transform={`translate(${fmt(cell.x)} ${fmt(cell.y)})`}
            fill="var(--accent)"
            fillOpacity={cell.bright ? 0.12 : 0.045}
            stroke="var(--accent)"
            strokeOpacity={cell.bright ? 0.65 : 0.35}
            strokeWidth="1"
            className="animate-hex-pulse"
            style={{ "--hex-delay": `${cell.delay.toFixed(2)}s`, "--hex-duration": `${cell.duration.toFixed(2)}s` } as CSSProperties}
          />
        ))}
      </svg>

      {interactive ? (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: "var(--ho, 0)", maskImage: spotlightMask, WebkitMaskImage: spotlightMask }}
        >
          <svg className="h-full w-full" viewBox={viewBox} preserveAspectRatio={aspect}>
            <HexGrid id={`hcl-${reactId}`} height={height} strokeOpacity={0.55} />
          </svg>
        </div>
      ) : null}
    </m.div>
  );
}
