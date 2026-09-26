"use client";

import { AnimatePresence, animate, m, useReducedMotion, useTransform } from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { JsonHighlight } from "@/components/ui/JsonHighlight";
import { methodToneClass, statusTextClass } from "@/lib/praxis";
import { useElementScrollProgress } from "@/hooks/useElementScrollProgress";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { EASE_OUT } from "@/components/motion/Reveal";
import { callScenes, type CallScene } from "./callScenes";

type Phase = "idle" | "handoff" | "sending" | "resolving" | "settled";

/** Packet flight + path draw — keep these identical so motion stays locked. */
const FLIGHT_MS = 780;
const RESOLVE_MS = 320;
const SETTLE_AT_MS = FLIGHT_MS + RESOLVE_MS;
/** Dwell on settled response before auto-advancing to the next domain. */
const AUTO_DWELL_MS = 4200;
/** Path morph + hex crossfade — completes before the packet flies. */
const HANDOFF_MS = 560;
/** Smooth ease-in-out — no overshoot (EASE_OUT's y>1 reads as a bounce on position). */
const FLIGHT_EASE = [0.4, 0.0, 0.2, 1] as const;
/** Softer ease for honeycomb handoffs — reads as glide, not snap. */
const HANDOFF_EASE = [0.45, 0.05, 0.25, 1] as const;

const NODE_POSITIONS = [
  { x: 78, y: 28 },
  { x: 88, y: 48 },
  { x: 78, y: 68 },
  { x: 62, y: 82 },
] as const;

const ORIGIN = { x: 12, y: 42 } as const;

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

function previewToJson(preview: CallScene["preview"]): string {
  const record: Record<string, string | number | boolean> = {};
  for (const row of preview) {
    if (row.kind === "num") record[row.key] = Number(row.value);
    else if (row.kind === "bool") record[row.key] = row.value === "true";
    else record[row.key] = row.value;
  }
  return JSON.stringify(record, null, 2);
}

/**
 * Packet locked to the route path via getPointAtLength —
 * same curve as the stroke, constant radius, no mid-air bounce.
 */
function RequestPacket({
  pathD,
  glowId,
}: {
  pathD: string;
  glowId: string;
}) {
  const circleRef = useRef<SVGCircleElement>(null);
  const measureRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const circle = circleRef.current;
    const measure = measureRef.current;
    if (!circle || !measure) return;

    const length = measure.getTotalLength();
    if (length <= 0) return;

    const place = (t: number) => {
      const point = measure.getPointAtLength(Math.min(1, Math.max(0, t)) * length);
      circle.setAttribute("cx", point.x.toFixed(2));
      circle.setAttribute("cy", point.y.toFixed(2));
    };

    place(0);
    circle.setAttribute("opacity", "0");

    const fadeIn = animate(0, 1, {
      duration: 0.12,
      ease: "linear",
      onUpdate: (v) => circle.setAttribute("opacity", String(v)),
    });

    const flight = animate(0, 1, {
      duration: FLIGHT_MS / 1000,
      ease: FLIGHT_EASE,
      onUpdate: place,
    });

    return () => {
      fadeIn.stop();
      flight.stop();
    };
  }, [pathD]);

  return (
    <>
      <path ref={measureRef} d={pathD} fill="none" stroke="none" aria-hidden />
      <circle
        ref={circleRef}
        r="1.25"
        fill="var(--accent)"
        filter={`url(#${glowId})`}
        opacity="0"
      />
    </>
  );
}

/**
 * Interactive hero visual: request leaves the client, hits a Praxis domain node,
 * and settles as a production-shaped response envelope.
 * Separated from HeroSection so layout/copy stay independent of animation.
 */
export function HeroCallVisual() {
  const reduceMotion = useReducedMotion() === true;
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  /** When true, sending redraws the stroke with the packet. After a handoff the stroke stays full. */
  const [redrawStroke, setRedrawStroke] = useState(true);
  const [visibilityEpoch, setVisibilityEpoch] = useState(0);
  const timers = useRef<number[]>([]);
  const autoplayTimer = useRef<number | null>(null);
  const bootRef = useRef(false);
  const activeIndexRef = useRef(0);
  const gradientId = useId();
  const glowId = useId();

  activeIndexRef.current = activeIndex;

  const scene = callScenes[activeIndex] ?? callScenes[0];
  const previewJson = useMemo(() => previewToJson(scene.preview), [scene.preview]);

  const { ref: parallaxRef, x: px, y: py } = usePointerParallax({
    strength: 6,
    disabled: reduceMotion,
  });
  const { ref: scrollRef, progress } = useElementScrollProgress({
    disabled: reduceMotion,
  });

  const scrollY = useTransform(progress, [0, 1], [0, -28]);
  const scrollScale = useTransform(progress, [0, 1], [1, 0.96]);
  const scrollOpacity = useTransform(progress, [0, 0.85, 1], [1, 0.92, 0.75]);

  const layerFarX = useTransform(px, (v) => v * 0.35);
  const layerFarY = useTransform(py, (v) => v * 0.35);
  const layerMidX = useTransform(px, (v) => v * 0.7);
  const layerMidY = useTransform(py, (v) => v * 0.7);
  const layerNearX = useTransform(px, (v) => v * 1.15);
  const layerNearY = useTransform(py, (v) => v * 1.15);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const clearAutoplay = useCallback(() => {
    if (autoplayTimer.current !== null) {
      window.clearTimeout(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  }, []);

  const scheduleFlight = useCallback(
    (delayMs: number) => {
      timers.current.push(
        window.setTimeout(() => setPhase("sending"), delayMs),
        window.setTimeout(() => setPhase("resolving"), delayMs + FLIGHT_MS),
        window.setTimeout(() => setPhase("settled"), delayMs + SETTLE_AT_MS),
      );
    },
    [],
  );

  const runCall = useCallback(
    (index: number) => {
      clearAutoplay();

      if (reduceMotion) {
        setActiveIndex(index);
        setPhase("settled");
        return;
      }

      clearTimers();
      const needsHandoff = index !== activeIndexRef.current;
      setActiveIndex(index);

      if (needsHandoff) {
        // Morph the full stroke to the new hex — never retract pathLength.
        setRedrawStroke(false);
        setPhase("handoff");
        scheduleFlight(HANDOFF_MS);
      } else {
        // First boot / same-domain resend: draw stroke with the packet.
        setRedrawStroke(true);
        setPhase("sending");
        scheduleFlight(0);
      }
    },
    [clearAutoplay, clearTimers, reduceMotion, scheduleFlight],
  );

  useEffect(() => {
    if (reduceMotion) {
      setPhase("settled");
      return;
    }

    if (bootRef.current) return;
    bootRef.current = true;

    // Entrance: settle the first call shortly after mount.
    const boot = window.setTimeout(() => runCall(0), 480);
    timers.current.push(boot);

    return () => {
      bootRef.current = false;
      clearTimers();
      clearAutoplay();
    };
  }, [reduceMotion, runCall, clearTimers, clearAutoplay]);

  // Auto-advance through domains after each settled response.
  useEffect(() => {
    clearAutoplay();

    if (phase !== "settled") return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    autoplayTimer.current = window.setTimeout(() => {
      const next = (activeIndex + 1) % callScenes.length;
      runCall(next);
    }, reduceMotion ? AUTO_DWELL_MS * 1.25 : AUTO_DWELL_MS);

    return clearAutoplay;
  }, [activeIndex, clearAutoplay, phase, reduceMotion, runCall, visibilityEpoch]);

  // Pause the carousel while the tab is backgrounded; resume when visible again.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        clearAutoplay();
        return;
      }
      setVisibilityEpoch((n) => n + 1);
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [clearAutoplay]);

  const target = NODE_POSITIONS[activeIndex] ?? NODE_POSITIONS[0];
  const pathD = `M ${ORIGIN.x} ${ORIGIN.y} C 36 ${ORIGIN.y - 4}, 52 ${target.y}, ${target.x} ${target.y}`;

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      parallaxRef.current = node;
      scrollRef.current = node;
    },
    [parallaxRef, scrollRef],
  );

  const handoffTransition = reduceMotion
    ? { duration: 0 }
    : { duration: HANDOFF_MS / 1000, ease: HANDOFF_EASE };

  return (
    <m.div
      ref={setRefs}
      style={{ y: scrollY, scale: scrollScale, opacity: scrollOpacity }}
      className="relative isolate w-full select-none"
      aria-label="Interactive demo: a Praxis API request resolving into a response envelope"
    >
      {/* Ambient depth — restrained */}
      <m.div
        aria-hidden
        style={{ x: layerFarX, y: layerFarY }}
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-[radial-gradient(60%_50%_at_70%_40%,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_70%)]"
      />

      <div className="glass relative rounded-[20px] shadow-[0_28px_80px_-36px_rgba(0,0,0,0.85)]">
      <div className="relative overflow-hidden rounded-[20px]">
        {/* Stage */}
        <div className="relative aspect-[4/5] w-full min-[400px]:aspect-[5/4] sm:aspect-[16/11]">
          <m.svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            aria-hidden
            style={{ x: layerMidX, y: layerMidY }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.05" />
                <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.45" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
              </linearGradient>
              <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Route: handoff morphs full stroke only; sending never retracts after a switch */}
            <m.path
              d={pathD}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="0.35"
              strokeLinecap="round"
              initial={false}
              animate={
                reduceMotion
                  ? { d: pathD, pathLength: 1, opacity: 0.7 }
                  : phase === "idle"
                    ? { d: pathD, pathLength: 0.18, opacity: 0.3 }
                    : phase === "handoff"
                      ? { d: pathD, pathLength: 1, opacity: 0.72 }
                      : phase === "sending"
                        ? {
                            d: pathD,
                            pathLength: redrawStroke ? ([0.12, 1] as const) : 1,
                            opacity: 0.95,
                          }
                        : phase === "settled"
                          ? { d: pathD, pathLength: 1, opacity: [0.55, 0.8, 0.55] }
                          : { d: pathD, pathLength: 1, opacity: 0.85 }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : phase === "handoff"
                    ? {
                        d: handoffTransition,
                        pathLength: { duration: 0 },
                        opacity: handoffTransition,
                      }
                    : phase === "settled"
                      ? {
                          d: { duration: 0 },
                          opacity: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                          pathLength: { duration: 0 },
                        }
                      : phase === "sending"
                        ? {
                            d: { duration: 0 },
                            pathLength: redrawStroke
                              ? { duration: FLIGHT_MS / 1000, ease: FLIGHT_EASE }
                              : { duration: 0 },
                            opacity: { duration: 0.22, ease: FLIGHT_EASE },
                          }
                        : {
                            d: { duration: 0 },
                            pathLength: { duration: 0.3, ease: HANDOFF_EASE },
                            opacity: { duration: 0.3, ease: HANDOFF_EASE },
                          }
              }
            />

            {/* Client origin */}
            <g>
              <circle cx={ORIGIN.x} cy={ORIGIN.y} r="3.2" fill="var(--surface-3)" stroke="var(--border-strong)" strokeWidth="0.35" />
              <circle
                cx={ORIGIN.x}
                cy={ORIGIN.y}
                r="1.1"
                fill="var(--foreground)"
                className={phase === "sending" ? "animate-pulse-soft" : undefined}
              />
            </g>

            {/* Domain nodes — highlight during handoff; glow after the packet arrives */}
            {callScenes.map((item, index) => {
              const pos = NODE_POSITIONS[index]!;
              const active = index === activeIndex;
              const lit = active && (phase === "resolving" || phase === "settled");
              const aiming = active && phase === "handoff";
              return (
                <g key={item.id}>
                  <m.polygon
                    points={hexPoints(pos.x, pos.y, 5.4)}
                    initial={false}
                    animate={{
                      fill: active
                        ? "color-mix(in srgb, var(--accent) 14%, var(--surface))"
                        : "var(--surface-2)",
                      stroke: active ? "var(--accent)" : "var(--border-strong)",
                      strokeWidth: active ? 0.45 : 0.3,
                      opacity: active ? 1 : 0.48,
                    }}
                    filter={lit || aiming ? `url(#${glowId})` : undefined}
                    transition={handoffTransition}
                  />
                  <m.circle
                    cx={pos.x}
                    cy={pos.y}
                    initial={false}
                    animate={{
                      r: lit ? 1.35 : aiming ? 1.15 : active ? 1.05 : 0.7,
                      opacity: lit ? 1 : aiming ? 0.85 : active ? 0.65 : 0.22,
                      fill: active ? "var(--accent)" : "var(--border-strong)",
                    }}
                    transition={
                      lit
                        ? { duration: RESOLVE_MS / 1000, ease: HANDOFF_EASE }
                        : handoffTransition
                    }
                  />
                </g>
              );
            })}

            {/* Request packet — only after the honeycomb handoff has finished */}
            {!reduceMotion && phase === "sending" ? (
              <RequestPacket key={`${activeIndex}-${pathD}`} pathD={pathD} glowId={glowId} />
            ) : null}
          </m.svg>

          {/* Floating labels — near layer */}
          <m.div
            style={{ x: layerNearX, y: layerNearY }}
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute left-[6%] top-[28%] rounded-md border border-border bg-surface-2/90 px-2 py-1 font-mono text-[10px] text-muted shadow-sm backdrop-blur-sm sm:text-[11px]">
              Your app
            </div>
            <div className="absolute right-[4%] top-[10%] max-w-[46%] text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">Praxis surface</p>
              <AnimatePresence mode="wait" initial={false}>
                <m.p
                  key={scene.id}
                  className="mt-1 text-sm font-medium tracking-tight text-foreground sm:text-[15px]"
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={handoffTransition}
                >
                  {scene.label}
                </m.p>
              </AnimatePresence>
            </div>
          </m.div>

          {/* Domain controls */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2 sm:bottom-4 sm:left-4 sm:right-4 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Practice domain">
              {callScenes.map((item, index) => {
                const selected = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => runCall(index)}
                    className={`min-h-9 rounded-full border px-3 py-1.5 font-mono text-[11px] transition-[background-color,border-color,color,transform] duration-300 ease-[cubic-bezier(0.45,0.05,0.25,1)] sm:min-h-0 sm:px-2.5 sm:py-1 sm:text-[11px] ${
                      selected
                        ? "border-accent-border bg-accent-soft text-accent"
                        : "border-border bg-surface-2/80 text-muted hover:border-border-strong hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => runCall(activeIndex)}
              className="min-h-10 w-full rounded-full border border-border-strong bg-foreground px-4 py-2 text-xs font-semibold text-background transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_10px_24px_-12px_color-mix(in_srgb,var(--accent)_45%,transparent)] active:translate-y-0 sm:ml-auto sm:min-h-0 sm:w-auto sm:px-3 sm:py-1.5 sm:text-xs"
            >
              {phase === "handoff" || phase === "sending" || phase === "resolving" ? "Calling…" : "Send request"}
            </button>
          </div>
        </div>

        {/* Response envelope */}
        <m.div
          style={{ x: layerNearX, y: layerNearY }}
          className="border-t border-border bg-background/40"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span
              className={`rounded-[4px] bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] font-semibold ${methodToneClass[scene.method]}`}
            >
              {scene.method}
            </span>
            <span className="min-w-0 truncate font-mono text-xs text-white/80">{scene.path}</span>
            <span className="ml-auto flex shrink-0 items-center gap-2 font-mono text-[11px] text-muted">
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                {(phase === "settled" || reduceMotion) && (
                  <>
                    {!reduceMotion && (
                      <span className="absolute inset-0 animate-ping rounded-full bg-method-get opacity-50" />
                    )}
                    <span className="relative h-1.5 w-1.5 rounded-full bg-method-get" />
                  </>
                )}
                {phase !== "settled" && !reduceMotion && (
                  <span className="relative h-1.5 w-1.5 rounded-full bg-subtle" />
                )}
              </span>
              <AnimatePresence mode="wait">
                <m.span
                  key={`${scene.id}-${phase === "settled" ? "ok" : "wait"}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  {phase === "settled" || reduceMotion ? (
                    <>
                      <span className={statusTextClass(200)}>200</span>
                      {` · ${scene.latencyMs}ms`}
                    </>
                  ) : phase === "idle" ? (
                    "ready"
                  ) : (
                    "…"
                  )}
                </m.span>
              </AnimatePresence>
            </span>
          </div>

          {/* Fixed height — skeleton and JSON share the same box so the card never jumps. */}
          <div className="h-[152px] px-4 py-3.5 font-mono text-[12px] leading-[1.7] sm:h-[160px] sm:text-[12.5px]">
            <AnimatePresence mode="wait">
              <m.div
                key={phase === "settled" || reduceMotion ? scene.id : `pending-${scene.id}`}
                className="h-full"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
              >
                {phase === "settled" || reduceMotion ? (
                  <pre className="h-full whitespace-pre-wrap text-white/85">
                    <JsonHighlight source={previewJson} />
                  </pre>
                ) : (
                  <div className="flex h-full flex-col justify-center gap-2.5" aria-hidden>
                    {[78, 56, 64, 44].map((w, i) => (
                      <div
                        key={i}
                        className="h-2.5 rounded-full bg-white/[0.06]"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                )}
              </m.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 font-mono text-[11px] text-subtle">
            <span>application/json · Praxis envelope</span>
            <span>no API key · no login</span>
          </div>
        </m.div>
      </div>
      </div>

      {/* Screen-reader live region for phase changes */}
      <p className="sr-only" aria-live="polite">
        {phase === "settled"
          ? `${scene.method} ${scene.path} returned 200 in ${scene.latencyMs} milliseconds`
          : phase === "handoff" || phase === "sending" || phase === "resolving"
            ? `Calling ${scene.label}`
            : "Ready to send a practice request"}
      </p>
    </m.div>
  );
}
