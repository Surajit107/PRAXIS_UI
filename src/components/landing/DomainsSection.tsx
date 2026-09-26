"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/layout/Section";
import { Reveal } from "@/components/motion/Reveal";
import { DomainIcon } from "@/components/visual/DomainIcons";
import { apiCounts, domainCatalog, isHttpMethod, methodToneClass } from "@/lib/praxis";

/**
 * Interactive surface index — not a FreeAPI-style grid of identical cards
 * titled “N lanes. M live endpoints.”
 */
export function DomainsSection() {
  const [activeId, setActiveId] = useState<(typeof domainCatalog)[number]["id"]>(domainCatalog[0].id);
  const active = domainCatalog.find((domain) => domain.id === activeId) ?? domainCatalog[0];
  const railRef = useRef<HTMLUListElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const node = tabRefs.current.get(activeId);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <Section
      id="domains"
      label="Catalog"
      title="Every surface. One host."
      description={`The full index — ecommerce, auth, social, chat, public data, and todos. ${apiCounts.totalEndpoints} live routes, plus HTTP utilities when you need edge cases.`}
    >
      <Reveal distance={60}>
        <div className="glass rounded-[var(--radius-lg)]">
          <div className="overflow-hidden rounded-[var(--radius-lg)]">
            {/* min-w-0 on both columns — without it the chip rail expands the grid and never scrolls */}
            <div className="grid min-w-0 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)]">
              <nav
                aria-label="Practice domains"
                className="relative min-w-0 border-b border-white/[0.08] lg:border-b-0 lg:border-r lg:border-white/[0.08]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-[color-mix(in_srgb,var(--surface)_80%,transparent)] to-transparent lg:hidden"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[color-mix(in_srgb,var(--surface)_80%,transparent)] to-transparent lg:hidden"
                />

                <ul
                  ref={railRef}
                  className="flex min-w-0 gap-1 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory px-3 py-2.5 touch-pan-x sm:px-4 sm:py-3 lg:flex-col lg:gap-0.5 lg:overflow-x-visible lg:overflow-y-visible lg:snap-none lg:px-3 lg:py-3 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]"
                >
                  {domainCatalog.map((domain) => {
                    const selected = domain.id === active.id;
                    return (
                      <li key={domain.id} className="shrink-0 snap-center lg:w-full">
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) tabRefs.current.set(domain.id, el);
                            else tabRefs.current.delete(domain.id);
                          }}
                          onClick={() => setActiveId(domain.id)}
                          aria-current={selected ? "true" : undefined}
                          className={`flex min-h-11 items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition-colors focus-visible:outline-offset-[-2px] lg:w-full ${
                            selected
                              ? "bg-white/[0.08] text-foreground ring-1 ring-inset ring-white/[0.1]"
                              : "text-muted hover:bg-white/[0.04] hover:text-foreground"
                          }`}
                        >
                          <DomainIcon
                            id={domain.icon}
                            live={false}
                            className={`h-5 w-5 shrink-0 transition-opacity ${selected ? "opacity-100" : "opacity-55"}`}
                          />
                          <span className="whitespace-nowrap text-sm font-medium tracking-tight">
                            {domain.title}
                          </span>
                          <span className="font-mono text-[11px] tabular-nums text-subtle">
                            {domain.endpoints}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="flex min-w-0 flex-col gap-5 p-4 sm:gap-7 sm:p-7 lg:gap-8 lg:p-10">
                <div className="flex items-start gap-3.5 sm:gap-5">
                  <div className="shrink-0">
                    <DomainIcon id={active.icon} className="h-10 w-10 sm:h-14 sm:w-14" animated />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        {active.title}
                      </h3>
                      <span className="font-mono text-xs tabular-nums text-subtle sm:text-sm">
                        {active.endpoints} endpoints
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted sm:mt-3 sm:text-[15px]">
                      {active.summary}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
                    Sample routes
                  </p>
                  <ul className="glass-inset min-w-0 divide-y divide-white/[0.06] rounded-[var(--radius-md)]">
                    {active.samples.map((sample) => {
                      const [method, ...pathParts] = sample.split(" ");
                      const path = pathParts.join(" ");
                      return (
                        <li
                          key={sample}
                          className="flex min-w-0 items-start gap-2.5 px-3 py-3 font-mono text-[12px] sm:items-baseline sm:gap-3 sm:px-4 sm:text-[13px]"
                        >
                          <span
                            className={`w-11 shrink-0 pt-0.5 sm:w-12 sm:pt-0 ${
                              isHttpMethod(method) ? methodToneClass[method] : "text-muted"
                            }`}
                          >
                            {method}
                          </span>
                          <span className="min-w-0 flex-1 break-all text-foreground/80 sm:break-normal sm:truncate">
                            {path}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <Link
                    href={active.playground}
                    className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent sm:min-h-0"
                  >
                    Open in playground
                    <ArrowRight
                      aria-hidden
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
