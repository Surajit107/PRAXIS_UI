"use client";

import { m, useReducedMotion } from "motion/react";
import { useEffect, useId, useState, type ComponentType, type ReactNode } from "react";
import type { DomainIconId } from "@/lib/praxis";

type IconProps = {
  className?: string;
  /** Continuous micro-motion. Off for dense nav rails. */
  live?: boolean;
};

const EASE = [0.16, 1, 0.3, 1] as const;

function IconShell({
  className,
  children,
  gid,
}: {
  className: string;
  children: ReactNode;
  gid: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      <defs>
        <linearGradient id={`${gid}-stroke`} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#a1a1aa" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#52525b" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${gid}-fill`} x1="16" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#95f547" stopOpacity="0.06" />
        </linearGradient>
        <filter id={`${gid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {children}
    </svg>
  );
}

function useIconMotion(live: boolean) {
  const reduce = useReducedMotion() === true;
  return live && !reduce;
}

/** Catalogue plate + barcode + floating price — storefront API, not a cart emoji. */
function IconEcommerce({ className = "h-12 w-12", live = true }: IconProps) {
  const gid = useId().replace(/:/g, "");
  const motionOn = useIconMotion(live);

  return (
    <IconShell className={className} gid={gid}>
      <rect
        x="12"
        y="14"
        width="40"
        height="36"
        rx="6"
        fill={`url(#${gid}-fill)`}
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="1.5"
      />
      <rect x="18" y="20" width="18" height="14" rx="2.5" stroke="rgba(212,212,216,0.45)" strokeWidth="1.2" />
      <path d="M18 40h16M18 44h10" stroke="rgba(161,161,170,0.55)" strokeWidth="1.4" strokeLinecap="round" />
      <g stroke="rgba(161,161,170,0.7)" strokeWidth="1.2" strokeLinecap="round">
        <path d="M40 22v16M43 22v16M46 22v16" />
        <path d="M41.5 22v16M44.5 22v16" strokeWidth="0.8" opacity="0.55" />
      </g>
      <m.g
        filter={`url(#${gid}-glow)`}
        animate={motionOn ? { y: [0, -2.5, 0] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="34" y="12" width="18" height="12" rx="3" fill="var(--accent)" />
        <text
          x="43"
          y="20.5"
          textAnchor="middle"
          fill="var(--accent-foreground)"
          fontSize="7"
          fontFamily="var(--font-mono)"
          fontWeight="600"
        >
          $48
        </text>
      </m.g>
    </IconShell>
  );
}

/** Identity shield with scanning beam — JWT / session surface. */
function IconAuth({ className = "h-12 w-12", live = true }: IconProps) {
  const gid = useId().replace(/:/g, "");
  const motionOn = useIconMotion(live);

  return (
    <IconShell className={className} gid={gid}>
      <path
        d="M32 10 L48 16 V30 C48 42 40 50 32 54 C24 50 16 42 16 30 V16 Z"
        fill={`url(#${gid}-fill)`}
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="30" r="5.5" stroke="rgba(212,212,216,0.55)" strokeWidth="1.3" />
      <path d="M32 35.5 V40" stroke="rgba(212,212,216,0.55)" strokeWidth="1.3" strokeLinecap="round" />
      {motionOn ? (
        <m.rect
          x="20"
          width="24"
          height="1.5"
          rx="0.75"
          fill="var(--accent)"
          filter={`url(#${gid}-glow)`}
          animate={{ y: [18, 44, 18], opacity: [0.25, 0.95, 0.25] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : (
        <rect x="20" y="28" width="24" height="1.5" rx="0.75" fill="var(--accent)" opacity="0.75" />
      )}
    </IconShell>
  );
}

/** Stacked feed cards with live engagement pulse. */
function IconSocial({ className = "h-12 w-12", live = true }: IconProps) {
  const gid = useId().replace(/:/g, "");
  const motionOn = useIconMotion(live);

  return (
    <IconShell className={className} gid={gid}>
      {/* Back card — SVG attr `y` so the peek is obvious */}
      <m.rect
        x="18"
        width="32"
        height="18"
        rx="4"
        stroke="rgba(161,161,170,0.45)"
        strokeWidth="1.2"
        initial={false}
        animate={motionOn ? { y: [8, 4, 8], opacity: [0.4, 0.75, 0.4] } : { y: 8, opacity: 0.45 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <rect
        x="14"
        y="20"
        width="36"
        height="28"
        rx="5"
        fill={`url(#${gid}-fill)`}
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="1.5"
      />
      <circle cx="24" cy="30" r="4" stroke="rgba(212,212,216,0.5)" strokeWidth="1.2" />
      <path d="M32 28h12M32 33h8" stroke="rgba(161,161,170,0.55)" strokeWidth="1.3" strokeLinecap="round" />
      {/* Heart pulse via opacity + vertical nudge — scale on SVG paths is unreliable */}
      <m.path
        d="M22 42 C22 40 24 39 26 41 C28 39 30 40 30 42 C30 44.5 26 47 26 47 C26 47 22 44.5 22 42 Z"
        fill="var(--accent)"
        filter={`url(#${gid}-glow)`}
        initial={false}
        animate={
          motionOn
            ? { opacity: [0.55, 1, 0.55], y: [0, -1.5, 0] }
            : { opacity: 0.85, y: 0 }
        }
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <path d="M36 42h8M36 45.5h5" stroke="rgba(161,161,170,0.45)" strokeWidth="1.2" strokeLinecap="round" />
    </IconShell>
  );
}

/** Dual message panes + live signal bars — Socket.IO chat. */
function IconChat({ className = "h-12 w-12", live = true }: IconProps) {
  const gid = useId().replace(/:/g, "");
  const motionOn = useIconMotion(live);

  return (
    <IconShell className={className} gid={gid}>
      <path
        d="M12 16h26a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H22l-6 5v-5h-4a5 5 0 0 1-5-5V21a5 5 0 0 1 5-5z"
        fill={`url(#${gid}-fill)`}
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M26 28h26a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5h-4v5l-6-5H26a5 5 0 0 1-5-5V33a5 5 0 0 1 5-5z"
        stroke="rgba(212,212,216,0.4)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {[0, 1, 2].map((i) => (
        <m.rect
          key={i}
          x={18 + i * 6}
          y={motionOn ? undefined : 23}
          height={motionOn ? undefined : 8}
          width="3"
          rx="1.5"
          fill={i === 1 ? "var(--accent)" : "rgba(161,161,170,0.7)"}
          filter={i === 1 ? `url(#${gid}-glow)` : undefined}
          animate={
            motionOn
              ? {
                y: [26, 22, 26],
                height: [4, 10, 4],
              }
              : undefined
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </IconShell>
  );
}

/** Layered data cylinder + orbiting node — public / business datasets. */
function IconPublic({ className = "h-12 w-12", live = true }: IconProps) {
  const gid = useId().replace(/:/g, "");
  const motionOn = useIconMotion(live);

  return (
    <IconShell className={className} gid={gid}>
      <ellipse cx="32" cy="18" rx="16" ry="6" stroke={`url(#${gid}-stroke)`} strokeWidth="1.5" fill={`url(#${gid}-fill)`} />
      <path
        d="M16 18 V42 C16 45.5 23 48 32 48 C41 48 48 45.5 48 42 V18"
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="1.5"
      />
      <ellipse cx="32" cy="30" rx="16" ry="6" stroke="rgba(161,161,170,0.4)" strokeWidth="1.2" />
      <ellipse cx="32" cy="42" rx="16" ry="6" stroke="rgba(161,161,170,0.35)" strokeWidth="1.2" />
      {/*
        Orbit via cx/cy attrs — CSS rotate on <g> spins the dot around itself (invisible).
        Keyframes trace the mid ellipse (rx=16, ry=6) around center 32,30.
      */}
      <m.circle
        r="3.2"
        fill="var(--accent)"
        filter={`url(#${gid}-glow)`}
        initial={false}
        animate={
          motionOn
            ? {
              cx: [48, 32, 16, 32, 48],
              cy: [30, 18, 30, 42, 30],
            }
            : { cx: 48, cy: 30 }
        }
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
    </IconShell>
  );
}

/** Progress ring completing a task — CRUD warm-up surface. */
function IconTodos({ className = "h-12 w-12", live = true }: IconProps) {
  const gid = useId().replace(/:/g, "");
  const motionOn = useIconMotion(live);
  const circumference = 2 * Math.PI * 16;

  return (
    <IconShell className={className} gid={gid}>
      <circle cx="32" cy="32" r="16" stroke="rgba(82,82,91,0.55)" strokeWidth="2.5" />
      <m.circle
        cx="32"
        cy="32"
        r="16"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={motionOn ? undefined : circumference * 0.28}
        filter={`url(#${gid}-glow)`}
        transform="rotate(-90 32 32)"
        animate={
          motionOn
            ? { strokeDashoffset: [circumference * 0.85, circumference * 0.15, circumference * 0.85] }
            : undefined
        }
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.path
        d="M24 32.5 L29.5 38 L40 26"
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="22"
        strokeDashoffset={motionOn ? undefined : 0}
        animate={motionOn ? { strokeDashoffset: [22, 0, 0, 22] } : undefined}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.7, 1] }}
      />
    </IconShell>
  );
}

const HTTP_STATUSES = ["200", "201", "404", "500"] as const;

/** Request → response pipeline with cycling status — HTTP utilities. */
function IconKitchen({ className = "h-12 w-12", live = true }: IconProps) {
  const gid = useId().replace(/:/g, "");
  const motionOn = useIconMotion(live);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!motionOn) {
      setStatusIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % HTTP_STATUSES.length);
    }, 1200);
    return () => window.clearInterval(id);
  }, [motionOn]);

  const status = HTTP_STATUSES[statusIndex] ?? HTTP_STATUSES[0];

  return (
    <IconShell className={className} gid={gid}>
      <rect
        x="10"
        y="22"
        width="18"
        height="20"
        rx="4"
        fill={`url(#${gid}-fill)`}
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="1.5"
      />
      <rect x="36" y="22" width="18" height="20" rx="4" stroke="rgba(212,212,216,0.45)" strokeWidth="1.4" />
      <path d="M16 29h6M16 34h4" stroke="rgba(161,161,170,0.55)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M42 29h6M42 34h4" stroke="rgba(161,161,170,0.4)" strokeWidth="1.3" strokeLinecap="round" />

      <path d="M29 32 H35" stroke="rgba(161,161,170,0.45)" strokeWidth="1.4" strokeLinecap="round" />
      <polygon points="35,29.5 39,32 35,34.5" fill="rgba(161,161,170,0.55)" />

      {/* Packet traveling request → response */}
      <m.circle
        cy="32"
        r="2.4"
        fill="var(--accent)"
        filter={`url(#${gid}-glow)`}
        initial={false}
        animate={
          motionOn
            ? { cx: [28, 38, 28], opacity: [0.35, 1, 0.35] }
            : { cx: 33, opacity: 0.85 }
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />

      <rect x="38" y="12" width="16" height="10" rx="2.5" fill="var(--accent)" filter={`url(#${gid}-glow)`} />
      <m.text
        key={status}
        x="46"
        y="19.5"
        textAnchor="middle"
        fill="var(--accent-foreground)"
        fontSize="6.5"
        fontFamily="var(--font-mono)"
        fontWeight="600"
        initial={motionOn ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {status}
      </m.text>
    </IconShell>
  );
}

const icons: Record<DomainIconId, ComponentType<IconProps>> = {
  public: IconPublic,
  auth: IconAuth,
  ecommerce: IconEcommerce,
  social: IconSocial,
  chat: IconChat,
  todos: IconTodos,
  "kitchen-sink": IconKitchen,
};

type DomainIconProps = {
  id: DomainIconId;
  className?: string;
  /** Cross-fade when the active domain changes (detail panes). */
  animated?: boolean;
  /** Continuous micro-motion. Defaults on for marks, off for rails. */
  live?: boolean;
};

/**
 * Product-surface marks — distinct metaphors, continuous micro-motion.
 * Motion respects prefers-reduced-motion.
 */
export function DomainIcon({ id, className, animated = false, live = true }: DomainIconProps) {
  const Icon = icons[id];
  const reduce = useReducedMotion() === true;
  const mark = <Icon className={className} live={live} />;

  if (!animated || reduce) {
    return mark;
  }

  return (
    <m.div
      key={id}
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="inline-flex"
    >
      {mark}
    </m.div>
  );
}
