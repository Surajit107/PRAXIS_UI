"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { EASE_OUT } from "@/components/motion/Reveal";
import { JsonHighlight } from "@/components/ui/JsonHighlight";
import type { MethodDemoKind, ResolvedHttpMethodLesson } from "@/lib/httpMethodLessons";
import { methodSoftClass } from "@/lib/httpMethodLessons";
import { methodToneClass, type HttpMethod } from "@/lib/praxis";

/**
 * Slow classroom pacing — each beat holds long enough to read.
 * Scrubber can pause / jump; autoplay still uses these holds.
 */
const TIMING = {
  readyHoldMs: 700,
  sendMs: 1600,
  arriveHoldMs: 1200,
  mutateMs: 1600,
  respondMs: 1600,
} as const;

const STEP_HOLD_MS = [TIMING.sendMs, TIMING.arriveHoldMs, TIMING.mutateMs, TIMING.respondMs] as const;

type Phase = "ready" | "sending" | "arrived" | "mutating" | "responding" | "settled";

type ShelfItem = {
  id: number;
  name: string;
  stock: number;
};

const INITIAL_SHELF: readonly ShelfItem[] = [
  { id: 1, name: "Alpha", stock: 12 },
  { id: 2, name: "Beta", stock: 4 },
  { id: 3, name: "Gamma", stock: 9 },
];

const ALLOWED_METHODS = ["GET", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"] as const;

const STEP_PHASE: readonly Phase[] = ["sending", "arrived", "mutating", "responding"];

const MUTATING_KINDS: ReadonlySet<MethodDemoKind> = new Set([
  "create",
  "replace",
  "patch",
  "remove",
]);

function cloneShelf(source: readonly ShelfItem[]): ShelfItem[] {
  return source.map((item) => ({ ...item }));
}

function applyMutation(kind: MethodDemoKind, shelf: ShelfItem[]): ShelfItem[] {
  switch (kind) {
    case "create":
      return [...shelf, { id: 4, name: "Delta", stock: 1 }];
    case "replace":
      return shelf.map((item) => (item.id === 2 ? { id: 2, name: "Beta", stock: 99 } : item));
    case "patch":
      return shelf.map((item) => (item.id === 2 ? { ...item, stock: 7 } : item));
    case "remove":
      return shelf.filter((item) => item.id !== 2);
    case "read":
    case "headers-only":
    case "capabilities":
    case "echo":
    case "tunnel":
      return shelf;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function shelfForStep(kind: MethodDemoKind, step: number): ShelfItem[] {
  const base = cloneShelf(INITIAL_SHELF);
  return step >= 2 ? applyMutation(kind, base) : base;
}

function isMutatingKind(kind: MethodDemoKind): boolean {
  return MUTATING_KINDS.has(kind);
}

function shelfRelevant(kind: MethodDemoKind): boolean {
  return kind !== "tunnel" && kind !== "echo";
}

type MethodFlowVisualProps = {
  lesson: ResolvedHttpMethodLesson;
  playKey: number;
};

function requestPath(focusId: ResolvedHttpMethodLesson["demo"]["focusId"]): string {
  if (focusId === "new" || focusId === "all" || focusId === null) return "/items";
  return `/items/${focusId}`;
}

/**
 * Slow, captioned HTTP verb demo with pause / step scrubbing.
 * Mutating verbs also surface an explicit before → after shelf diff.
 */
export function MethodFlowVisual({ lesson, playKey }: MethodFlowVisualProps) {
  const reduceMotion = useReducedMotion() === true;
  const [phase, setPhase] = useState<Phase>("ready");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [shelf, setShelf] = useState<ShelfItem[]>(() => cloneShelf(INITIAL_SHELF));
  const timers = useRef<number[]>([]);
  const playingRef = useRef(true);

  const kind = lesson.demo.kind;
  const focusId = lesson.demo.focusId;
  const tone = methodToneClass[lesson.method];
  const soft = methodSoftClass[lesson.method];
  const collectionFocus = focusId === "all";
  const mutating = isMutatingKind(kind);

  const caption =
    phase === "settled" ? lesson.demo.outcome : lesson.demo.steps[Math.min(step, 3)];

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const applyStep = useCallback(
    (nextStep: number, nextPhase?: Phase) => {
      const clamped = Math.max(0, Math.min(3, nextStep));
      setStep(clamped);
      setPhase(nextPhase ?? STEP_PHASE[clamped] ?? "sending");
      setShelf(shelfForStep(kind, clamped));
    },
    [kind],
  );

  const scheduleFrom = useCallback(
    (fromStep: number, initialDelayMs: number) => {
      clearTimers();
      playingRef.current = true;
      setPlaying(true);

      let delay = initialDelayMs;
      for (let s = fromStep; s < 3; s += 1) {
        const next = s + 1;
        const hold = STEP_HOLD_MS[s] ?? 1200;
        schedule(() => {
          if (!playingRef.current) return;
          applyStep(next);
        }, delay);
        delay += hold;
      }

      const lastHold = STEP_HOLD_MS[3] ?? 1600;
      schedule(() => {
        if (!playingRef.current) return;
        setPhase("settled");
        playingRef.current = false;
        setPlaying(false);
      }, delay + lastHold);
    },
    [applyStep, clearTimers, schedule],
  );

  const pause = useCallback(() => {
    clearTimers();
    playingRef.current = false;
    setPlaying(false);
    if (phase === "ready") {
      applyStep(0);
    }
  }, [applyStep, clearTimers, phase]);

  const play = useCallback(() => {
    if (reduceMotion) {
      applyStep(3, "settled");
      setPlaying(false);
      playingRef.current = false;
      return;
    }

    if (phase === "settled") {
      applyStep(0);
      scheduleFrom(0, STEP_HOLD_MS[0]);
      return;
    }

    const from = phase === "ready" ? 0 : step;
    if (phase === "ready") applyStep(0);
    scheduleFrom(from, STEP_HOLD_MS[from] ?? 1200);
  }, [applyStep, phase, reduceMotion, scheduleFrom, step]);

  const jumpToStep = useCallback(
    (nextStep: number) => {
      clearTimers();
      playingRef.current = false;
      setPlaying(false);
      applyStep(nextStep);
    },
    [applyStep, clearTimers],
  );

  const goPrev = useCallback(() => {
    jumpToStep(phase === "settled" ? 3 : Math.max(0, step - 1));
  }, [jumpToStep, phase, step]);

  const goNext = useCallback(() => {
    if (phase === "settled") return;
    if (step >= 3) {
      clearTimers();
      playingRef.current = false;
      setPlaying(false);
      setPhase("settled");
      setShelf(shelfForStep(kind, 3));
      return;
    }
    jumpToStep(step + 1);
  }, [clearTimers, jumpToStep, kind, phase, step]);

  useEffect(() => {
    clearTimers();

    if (reduceMotion) {
      applyStep(3, "settled");
      playingRef.current = false;
      setPlaying(false);
      return clearTimers;
    }

    setShelf(cloneShelf(INITIAL_SHELF));
    setPhase("ready");
    setStep(0);
    playingRef.current = true;
    setPlaying(true);

    schedule(() => {
      if (!playingRef.current) return;
      applyStep(0);
      scheduleFrom(0, STEP_HOLD_MS[0]);
    }, TIMING.readyHoldMs);

    return clearTimers;
  }, [applyStep, clearTimers, playKey, reduceMotion, schedule, scheduleFrom]);

  const showShelf = shelfRelevant(kind);
  const highlightPhase =
    phase === "arrived" || phase === "mutating" || phase === "responding" || phase === "settled";
  const highlightTarget =
    focusId !== null && focusId !== "new" && focusId !== "all" && highlightPhase;
  const highlightCollection = collectionFocus && highlightPhase;
  const showDiff =
    mutating && (phase === "mutating" || phase === "responding" || phase === "settled");

  const packetDirection: "out" | "back" | "idle" =
    phase === "sending" ? "out" : phase === "responding" ? "back" : "idle";

  const packetLabel =
    phase === "responding" || phase === "settled"
      ? kind === "headers-only"
        ? "headers"
        : kind === "capabilities"
          ? "Allow: …"
          : kind === "echo"
            ? "echo"
            : kind === "tunnel"
              ? "200 tunnel"
              : lesson.statusTypical.split(" ")[0]
      : lesson.method;

  const canPrev = !(step <= 0 && phase !== "settled");
  const canNext = phase !== "settled";

  return (
    <div className="relative rounded-[var(--radius-lg)] border border-border bg-surface-2">
      {/* Step rail + scrubber */}
      <div className="border-b border-hairline px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <ol className="flex flex-wrap gap-2" aria-label="Animation steps">
            {lesson.demo.steps.map((label, index) => {
              const active = step === index && phase !== "settled";
              const done = step > index || phase === "settled";
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => jumpToStep(index)}
                    aria-current={active ? "step" : undefined}
                    className={`rounded-full border px-3 py-2 font-mono text-[11px] tracking-wide transition-colors duration-300 sm:px-2.5 sm:py-1 sm:text-[10px] ${
                      active
                        ? `${soft} ${tone}`
                        : done
                          ? "border-border text-muted hover:text-foreground"
                          : "border-transparent text-subtle hover:border-border hover:text-muted"
                    }`}
                  >
                    {label.replace(/^\d\s·\s/, "")}
                  </button>
                </li>
              );
            })}
          </ol>

          <div
            role="group"
            aria-label="Demo playback"
            className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-border bg-surface p-0.5"
          >
            <ScrubButton label="Previous step" disabled={!canPrev} onClick={goPrev}>
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
            </ScrubButton>
            <ScrubButton
              label={playing ? "Pause demo" : phase === "settled" ? "Replay demo" : "Play demo"}
              onClick={() => (playing ? pause() : play())}
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5" strokeWidth={2.25} />
              ) : (
                <Play className="h-3.5 w-3.5" strokeWidth={2.25} />
              )}
            </ScrubButton>
            <ScrubButton label="Next step" disabled={!canNext} onClick={goNext}>
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </ScrubButton>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <m.p
            key={caption}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className={`mt-3 text-sm font-medium leading-snug ${phase === "settled" ? tone : "text-foreground"}`}
          >
            {caption}
          </m.p>
        </AnimatePresence>
      </div>

      {kind === "tunnel" ? (
        <div className="p-5 sm:p-6">
          <TunnelPanel method={lesson.method} phase={phase} tone={tone} soft={soft} />
        </div>
      ) : (
        <div className="relative grid gap-0 md:grid-cols-[1fr_minmax(7rem,9rem)_1fr]">
          {/* Client */}
          <div
            className={`flex flex-col justify-center gap-3 border-b border-hairline p-5 transition-opacity duration-500 md:border-b-0 md:border-r md:border-hairline ${
              phase === "sending" ? "opacity-100" : "opacity-80"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Client</p>
            <div
              className={`rounded-[var(--radius-sm)] border bg-surface px-3 py-3 transition-colors duration-500 ${
                phase === "ready" || phase === "sending" ? soft : "border-border"
              }`}
            >
              <p className={`font-mono text-sm font-semibold ${tone}`}>
                {lesson.method}{" "}
                <span className="font-normal text-muted">{requestPath(focusId)}</span>
              </p>
              {lesson.requestBody ? (
                <pre className="mt-2 min-w-0 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground/90">
                  <JsonHighlight source={lesson.requestBody} />
                </pre>
              ) : (
                <p className="mt-2 font-mono text-[11px] text-subtle">no body</p>
              )}
            </div>
          </div>

          {/* Wire + traveling packet */}
          <div className="relative flex min-h-[100px] items-center justify-center px-3 py-6 md:min-h-[220px] md:px-2">
            <div aria-hidden className="absolute inset-x-4 top-1/2 h-px bg-border md:inset-x-3" />
            <AnimatePresence mode="wait">
              {packetDirection !== "idle" ? (
                <m.span
                  key={`${lesson.method}-${phase}-packet`}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          x: packetDirection === "out" ? -40 : 40,
                          scale: 0.92,
                        }
                  }
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={
                    reduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          x: packetDirection === "out" ? 40 : -40,
                          scale: 0.92,
                        }
                  }
                  transition={{ duration: 1.35, ease: EASE_OUT }}
                  className={`relative z-10 whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)] ${soft} ${tone}`}
                >
                  {packetLabel}
                </m.span>
              ) : (
                <m.span
                  key={`dot-${phase}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="relative z-10 h-1.5 w-1.5 rounded-full bg-subtle"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Server panel */}
          <div className="flex min-w-0 flex-col gap-3 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Server store</p>

            {kind === "capabilities" ? (
              <CapabilitiesPanel phase={phase} tone={tone} soft={soft} />
            ) : kind === "echo" ? (
              <EchoPanel method={lesson.method} phase={phase} tone={tone} soft={soft} />
            ) : showShelf ? (
              <ul className="space-y-2.5" aria-live="polite">
                <AnimatePresence initial={false} mode="popLayout">
                  {shelf.map((item, index) => {
                    const isNew = item.id === 4;
                    const isFocus =
                      focusId === "new"
                        ? isNew &&
                          (phase === "mutating" || phase === "responding" || phase === "settled")
                        : collectionFocus
                          ? highlightCollection
                          : item.id === focusId &&
                            (highlightTarget ||
                              (isNew && phase !== "ready" && phase !== "sending"));

                    const dimOthers =
                      typeof focusId === "number" && highlightTarget && item.id !== focusId;
                    const stockPulse =
                      (kind === "patch" || kind === "replace") &&
                      isFocus &&
                      phase === "mutating";

                    return (
                      <m.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 14, scale: 0.96 }}
                        animate={{
                          opacity: dimOthers ? 0.35 : 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          x: 36,
                          scale: 0.92,
                          transition: { duration: 0.9, ease: EASE_OUT },
                        }}
                        transition={{
                          duration: 0.85,
                          ease: EASE_OUT,
                          delay: highlightCollection && phase === "arrived" ? index * 0.12 : 0,
                        }}
                        className={`flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border px-3 py-2.5 font-mono text-[12px] transition-[border-color,background-color,box-shadow] duration-700 ${
                          isFocus
                            ? `${soft} ${tone} shadow-[0_0_0_1px_color-mix(in_srgb,currentColor_25%,transparent)]`
                            : "border-border bg-surface text-muted"
                        }`}
                      >
                        <span>
                          <span className="text-subtle">#{item.id}</span>{" "}
                          <span className={isFocus ? "text-foreground" : ""}>{item.name}</span>
                        </span>
                        <m.span
                          key={`${item.id}-${item.stock}-${phase}`}
                          initial={stockPulse ? { scale: 1.45 } : false}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.9, ease: EASE_OUT }}
                          className={`tabular-nums ${stockPulse ? tone : ""}`}
                        >
                          stock {item.stock}
                        </m.span>
                      </m.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            ) : null}

            <AnimatePresence>
              {showDiff ? (
                <m.div
                  key="shelf-diff"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  <ShelfDiff kind={kind} tone={tone} soft={soft} />
                </m.div>
              ) : null}
            </AnimatePresence>

            {(kind === "read" || kind === "headers-only") &&
            (phase === "responding" || phase === "settled") ? (
              <m.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
                className={`font-mono text-[11px] leading-relaxed ${tone}`}
              >
                {kind === "read"
                  ? collectionFocus
                    ? "← full copy of the collection (array) in the response body"
                    : `← full copy of #${focusId} in the response body`
                  : `← headers for #${focusId} only — body omitted`}
              </m.p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function ScrubButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[calc(var(--radius-sm)-2px)] text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:pointer-events-none disabled:opacity-35 sm:h-8 sm:w-8"
    >
      {children}
    </button>
  );
}

/** Explicit before → after for mutating verbs — the part students miss in motion. */
function ShelfDiff({
  kind,
  tone,
  soft,
}: {
  kind: MethodDemoKind;
  tone: string;
  soft: string;
}) {
  const before = diffBeforeLabel(kind);
  const after = diffAfterLabel(kind);
  const note = diffNote(kind);

  return (
    <div className={`rounded-[var(--radius-sm)] border px-3 py-2.5 ${soft}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">Before → after</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <p className="font-mono text-[11px] leading-relaxed text-muted">
          <span className="text-subtle">before </span>
          {before}
        </p>
        <span aria-hidden className={`hidden text-center font-mono text-[11px] sm:block ${tone}`}>
          →
        </span>
        <p className={`font-mono text-[11px] leading-relaxed ${tone}`}>
          <span className="text-subtle">after </span>
          {after}
        </p>
      </div>
      {note ? <p className="mt-2 font-mono text-[10px] leading-relaxed text-subtle">{note}</p> : null}
    </div>
  );
}

function diffBeforeLabel(kind: MethodDemoKind): string {
  switch (kind) {
    case "create":
      return "shelf has Alpha, Beta, Gamma";
    case "replace":
      return "#2 Beta · stock 4";
    case "patch":
      return "#2 Beta · stock 4 · name Beta";
    case "remove":
      return "#2 Beta · stock 4";
    default:
      return "—";
  }
}

function diffAfterLabel(kind: MethodDemoKind): string {
  switch (kind) {
    case "create":
      return "+ #4 Delta · stock 1";
    case "replace":
      return "#2 Beta · stock 99";
    case "patch":
      return "#2 Beta · stock 7 · name Beta";
    case "remove":
      return "#2 removed";
    default:
      return "—";
  }
}

function diffNote(kind: MethodDemoKind): string | null {
  switch (kind) {
    case "replace":
      return "PUT replaces the whole resource — omitted fields are gone.";
    case "patch":
      return "PATCH only changes what you send — name stayed Beta.";
    case "create":
      return "POST adds a new identity; repeating it often duplicates.";
    case "remove":
      return "DELETE removes the target; a second DELETE should stay deleted.";
    default:
      return null;
  }
}

function CapabilitiesPanel({
  phase,
  tone,
  soft,
}: {
  phase: Phase;
  tone: string;
  soft: string;
}) {
  const reveal = phase === "mutating" || phase === "responding" || phase === "settled";
  return (
    <div className={`rounded-[var(--radius-sm)] border bg-surface px-3 py-3 ${reveal ? soft : "border-border"}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">Allow</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ALLOWED_METHODS.map((method, index) => (
          <m.span
            key={method}
            initial={{ opacity: 0.25 }}
            animate={{ opacity: reveal ? 1 : 0.25 }}
            transition={{ delay: reveal ? index * 0.12 : 0, duration: 0.5, ease: EASE_OUT }}
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${
              reveal ? `${soft} ${tone}` : "border-border text-subtle"
            }`}
          >
            {method}
          </m.span>
        ))}
      </div>
    </div>
  );
}

function EchoPanel({
  method,
  phase,
  tone,
  soft,
}: {
  method: HttpMethod;
  phase: Phase;
  tone: string;
  soft: string;
}) {
  const reveal = phase === "mutating" || phase === "responding" || phase === "settled";
  return (
    <m.pre
      animate={{ opacity: reveal ? 1 : 0.4 }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className={`overflow-x-auto rounded-[var(--radius-sm)] border bg-surface px-3 py-3 font-mono text-[11px] leading-relaxed text-muted ${
        reveal ? soft : "border-border"
      }`}
    >
      <span className={tone}>{method}</span> /items/2 HTTP/1.1{"\n"}
      Host: api.example.com{"\n"}
      <span className="text-subtle">(echoed request)</span>
    </m.pre>
  );
}

function TunnelPanel({
  method,
  phase,
  tone,
  soft,
}: {
  method: HttpMethod;
  phase: Phase;
  tone: string;
  soft: string;
}) {
  const reduceMotion = useReducedMotion() === true;
  const open = phase === "mutating" || phase === "responding" || phase === "settled";
  const requesting = phase === "sending" || phase === "arrived";

  return (
    <div
      className={`rounded-[var(--radius-md)] border bg-surface transition-colors duration-500 ${
        open ? soft : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">TCP tunnel</p>
          <p className="mt-1 font-mono text-sm text-muted">
            <span className={tone}>{method}</span>{" "}
            <span className="text-subtle">api.example.com:443</span>
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold ${
            open
              ? `${soft} ${tone}`
              : requesting
                ? "border-method-connect/30 text-method-connect"
                : "border-border text-subtle"
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${
              open
                ? "bg-method-connect animate-pulse-soft"
                : requesting
                  ? "bg-method-connect/60"
                  : "bg-subtle"
            }`}
          />
          {open ? "Established" : requesting ? "Connecting…" : "Waiting"}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:gap-2 sm:p-5">
        <TunnelEndpoint label="Client" sub="browser / app" active={open || requesting} />
        <div className="hidden sm:block">
          <TunnelSegmentHorizontal open={open} flowing={!reduceMotion && open} />
        </div>
        <div
          className={`flex min-h-[4.5rem] flex-col items-center justify-center rounded-[var(--radius-sm)] border px-4 py-3 text-center ${
            open ? soft : "border-dashed border-border bg-surface-2"
          }`}
        >
          <span className={`font-mono text-sm font-semibold ${open || requesting ? tone : "text-subtle"}`}>
            {method}
          </span>
          <span className="mt-1 font-mono text-[10px] text-subtle">proxy hop</span>
        </div>
        <div className="hidden sm:block">
          <TunnelSegmentHorizontal open={open} flowing={!reduceMotion && open} delay={0.45} />
        </div>
        <TunnelEndpoint label="Target :443" sub="api.example.com" active={open} />
      </div>

      <div className="border-t border-hairline px-4 py-3 sm:px-5">
        <p className={`font-mono text-[12px] leading-relaxed ${open ? tone : "text-subtle"}`}>
          {open
            ? "Tunnel open — raw bytes flow both ways."
            : requesting
              ? "CONNECT in flight — proxy is opening the pipe…"
              : "Waiting for CONNECT… pipe not open yet."}
        </p>
      </div>
    </div>
  );
}

function TunnelEndpoint({
  label,
  sub,
  active,
}: {
  label: string;
  sub: string;
  active: boolean;
}) {
  return (
    <div
      className={`min-h-[4.5rem] rounded-[var(--radius-sm)] border px-4 py-3 ${
        active ? "border-method-connect/40 bg-method-connect/10" : "border-border bg-surface-2"
      }`}
    >
      <p className={`font-mono text-[12px] font-semibold ${active ? "text-method-connect" : "text-muted"}`}>
        {label}
      </p>
      <p className="mt-1 font-mono text-[11px] text-subtle">{sub}</p>
    </div>
  );
}

function TunnelSegmentHorizontal({
  open,
  flowing,
  delay = 0,
}: {
  open: boolean;
  flowing: boolean;
  delay?: number;
}) {
  return (
    <div className="relative mx-auto flex h-10 w-full min-w-[2.5rem] max-w-[4.5rem] items-center justify-center sm:mx-0">
      <m.div
        initial={false}
        animate={{ scaleX: open ? 1 : 0.45, opacity: open ? 1 : 0.35 }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay }}
        className={`h-[2px] w-full origin-center rounded-full ${open ? "bg-method-connect/70" : "bg-border"}`}
      />
      {flowing ? (
        <>
          <m.span
            aria-hidden
            className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-method-connect shadow-[0_0_8px_var(--method-connect)]"
            animate={{ left: ["8%", "78%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.7, ease: "linear", repeat: Infinity, delay, repeatDelay: 0.25 }}
          />
          <m.span
            aria-hidden
            className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-method-connect/70"
            animate={{ left: ["78%", "8%"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.7,
              ease: "linear",
              repeat: Infinity,
              delay: delay + 0.85,
              repeatDelay: 0.25,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
