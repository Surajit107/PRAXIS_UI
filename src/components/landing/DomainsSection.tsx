"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
            <div className="grid lg:grid-cols-[minmax(0,240px)_1fr]">
              <nav
                aria-label="Practice domains"
                className="border-b border-white/[0.08] lg:border-b-0 lg:border-r lg:border-white/[0.08]"
              >
                <ul className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3">
                  {domainCatalog.map((domain) => {
                    const selected = domain.id === active.id;
                    return (
                      <li key={domain.id} className="shrink-0 lg:shrink">
                        <button
                          type="button"
                          onClick={() => setActiveId(domain.id)}
                          aria-current={selected ? "true" : undefined}
                          className={`flex w-full items-center justify-between gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition-colors ${
                            selected
                              ? "bg-white/[0.08] text-foreground"
                              : "text-muted hover:bg-white/[0.04] hover:text-foreground"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-2.5">
                            <DomainIcon
                              id={domain.icon}
                              live={false}
                              className={`h-5 w-5 shrink-0 transition-opacity ${selected ? "opacity-100" : "opacity-55"}`}
                            />
                            <span className="truncate text-sm font-medium tracking-tight">{domain.title}</span>
                          </span>
                          <span className="font-mono text-[11px] tabular-nums text-subtle">{domain.endpoints}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="flex flex-col gap-8 p-6 sm:p-8 lg:p-10">
                <div className="flex items-start gap-5">
                  <div className="hidden shrink-0 sm:block">
                    <DomainIcon id={active.icon} className="h-14 w-14" animated />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">{active.title}</h3>
                      <span className="font-mono text-sm tabular-nums text-subtle">
                        {active.endpoints} endpoints
                      </span>
                    </div>
                    <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">{active.summary}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">Sample routes</p>
                  <ul className="glass-inset space-y-0 divide-y divide-white/[0.06] rounded-[var(--radius-md)]">
                    {active.samples.map((sample) => {
                      const [method, ...pathParts] = sample.split(" ");
                      const path = pathParts.join(" ");
                      return (
                        <li
                          key={sample}
                          className="flex items-baseline gap-3 px-4 py-3 font-mono text-[13px]"
                        >
                          <span
                            className={`w-12 shrink-0 ${isHttpMethod(method) ? methodToneClass[method] : "text-muted"}`}
                          >
                            {method}
                          </span>
                          <span className="min-w-0 truncate text-foreground/80">{path}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <Link
                    href={active.playground}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
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
