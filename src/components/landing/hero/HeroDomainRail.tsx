"use client";

import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { DomainIcon } from "@/components/visual/DomainIcons";
import { domainTicker, methodToneClass } from "@/lib/praxis";

const CYCLE_MS = 2800;

/**
 * Hero footer rail — cycles live sample routes across product surfaces.
 * Each beat proves a real endpoint; names jump the catalog into view.
 */
export function HeroDomainRail() {
  const prefersReduced = useReducedMotion() === true;
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const active = domainTicker[activeIndex] ?? domainTicker[0];

  const goTo = useCallback((index: number) => {
    setActiveIndex(((index % domainTicker.length) + domainTicker.length) % domainTicker.length);
  }, []);

  useEffect(() => {
    if (prefersReduced || paused) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % domainTicker.length);
    }, CYCLE_MS);

    return () => window.clearInterval(id);
  }, [paused, prefersReduced]);

  return (
    <div
      className="relative border-t border-hairline"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 sm:gap-x-7">
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inset-0 rounded-full bg-accent/70 domain-rail-pulse" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
              Live surfaces
            </p>
          </div>

          <nav aria-label="API surfaces" className="min-w-0 flex-1">
            <ul className="flex flex-wrap items-center gap-x-0.5 gap-y-1">
              {domainTicker.map((item, index) => {
                const selected = index === activeIndex;
                return (
                  <li key={item.id} className="relative">
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-current={selected ? "true" : undefined}
                      aria-label={
                        item.id === "geo"
                          ? `${item.name} dataset`
                          : `${item.name}, ${item.endpoints} endpoints`
                      }
                      className={`relative rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm tracking-tight transition-colors duration-300 ${
                        selected ? "text-foreground" : "text-subtle hover:text-muted"
                      }`}
                    >
                      {item.name}
                      {selected ? (
                        <span className="absolute inset-x-2.5 bottom-0.5 h-px overflow-hidden" aria-hidden>
                          {prefersReduced || paused ? (
                            <span className="block h-full origin-left scale-x-100 bg-accent" />
                          ) : (
                            <span
                              key={activeIndex}
                              className="domain-rail-progress block h-full origin-left bg-accent"
                            />
                          )}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex min-h-[1.5rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-hairline pt-3">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={active.id}
              initial={prefersReduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex min-w-0 items-center gap-3"
            >
              <DomainIcon
                id={active.icon}
                live={false}
                className="hidden h-5 w-5 shrink-0 opacity-70 sm:block"
              />
              <p className="flex min-w-0 items-baseline gap-2.5 font-mono text-[12px] sm:text-[13px]">
                <span className={`shrink-0 ${methodToneClass[active.sample.method]}`}>
                  {active.sample.method}
                </span>
                <span className="truncate text-foreground/75">{active.sample.path}</span>
              </p>
            </m.div>
          </AnimatePresence>

          <Link
            href={active.href}
            className="group inline-flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-subtle transition-colors hover:text-accent"
          >
            <span className="tabular-nums uppercase tracking-[0.14em]">
              {active.id === "geo" ? "Dataset" : `${active.endpoints} routes`}
            </span>
            <span
              aria-hidden
              className="text-border-strong transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent/70"
            >
              →
            </span>
            <span className="text-muted group-hover:text-accent">Catalog</span>
          </Link>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {active.name}: {active.sample.method} {active.sample.path}
      </span>
    </div>
  );
}
