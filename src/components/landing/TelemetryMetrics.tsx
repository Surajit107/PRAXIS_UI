"use client";

import { m, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DrawLine } from "@/components/motion/DrawLine";
import { EASE_OUT, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ScrambleValue } from "@/components/motion/ScrambleValue";
import { stats, type PraxisStat } from "@/lib/praxis";

function LiveDot({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="relative inline-flex size-1.5" aria-hidden>
      <span className="absolute inset-0 animate-pulse-soft rounded-full bg-success/70" />
      <span className="relative size-1.5 rounded-full bg-success" />
    </span>
  );
}

function MetricCell({ stat, index }: { stat: PraxisStat; index: number }) {
  const [settled, setSettled] = useState(false);
  const reduceMotion = useReducedMotion();
  const isZero = stat.value === 0;

  return (
    <StaggerItem as="div" className="group relative min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
        <LiveDot active={stat.live} />
        <span className="truncate">{stat.key}</span>
        <span className="ml-auto hidden tabular-nums text-subtle/70 sm:inline">
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <m.span
          className={`font-display text-4xl font-semibold tracking-[-0.045em] tabular-nums sm:text-5xl ${
            isZero ? "text-success" : "text-foreground"
          }`}
          initial={false}
          animate={
            reduceMotion
              ? undefined
              : settled
                ? { opacity: 1, filter: "blur(0px)", scale: 1 }
                : { opacity: 0.72, filter: "blur(0.4px)", scale: 0.985 }
          }
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <ScrambleValue
            value={stat.value}
            duration={1.15 + index * 0.12}
            onSettled={() => setSettled(true)}
          />
        </m.span>

        <m.span
          className="font-mono text-[11px] tracking-wide text-subtle"
          initial={{ opacity: 0, x: -6 }}
          animate={settled || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
          transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.05 }}
        >
          {stat.unit}
        </m.span>
      </div>

      <p className="mt-1.5 text-[12px] text-muted">{stat.label}</p>

      <div className="mt-4">
        <DrawLine />
      </div>

      {!reduceMotion && settled ? (
        <m.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--accent)_16%,transparent),transparent)]"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "320%", opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.85, ease: EASE_OUT }}
        />
      ) : null}

      {isZero ? (
        <m.span
          className="mt-3 inline-flex font-mono text-[10px] tracking-[0.14em] text-success uppercase"
          initial={{ opacity: 0, y: 4 }}
          animate={settled || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
          transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.1 }}
        >
          open · no key
        </m.span>
      ) : null}
    </StaggerItem>
  );
}

/**
 * Instrumentation strip — key paths, scramble decode, unit suffixes.
 * Not a card grid. Zero metrics lock at 0 (never counted through noise).
 */
export function TelemetryMetrics() {
  return (
    <div className="mt-14">
      <m.div
        className="mb-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.16em] text-subtle uppercase"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -60px 0px" }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <span className="text-accent">//</span>
        <span>praxis.telemetry</span>
        <span className="h-px flex-1 bg-hairline" />
        <span className="tabular-nums text-subtle/80">4 signals</span>
      </m.div>

      <Stagger as="div" columns={4} stagger={0.12} className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
        {stats.map((stat, index) => (
          <MetricCell key={stat.id} stat={stat} index={index} />
        ))}
      </Stagger>
    </div>
  );
}
