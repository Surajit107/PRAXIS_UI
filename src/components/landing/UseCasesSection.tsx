import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { DomainIcon } from "@/components/visual/DomainIcons";
import { useCases } from "@/lib/praxis";

/**
 * Marketing use-case narratives — what visitors practice building.
 * Not a route browser; Catalog owns the full index.
 */
export function UseCasesSection() {
  return (
    <Section
      id="build"
      label="What to build"
      title="Practice the projects that get you hired."
      description="Storefront, auth, social feed, realtime chat, business dashboards — each backed by a live API you can hit today."
    >
      <Stagger
        as="ul"
        columns={1}
        spring="soft"
        className="glass divide-y divide-white/[0.06] rounded-[var(--radius-lg)]"
      >
        {useCases.map((useCase, index) => (
          <StaggerItem as="li" key={useCase.id} index={index}>
            <Link
              href={useCase.href}
              className="group grid gap-4 px-5 py-6 outline-none transition-colors focus-visible:bg-white/[0.04] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-8 sm:px-7 hover:bg-white/[0.03]"
            >
              <DomainIcon
                id={useCase.icon}
                className="h-10 w-10 shrink-0 opacity-80 transition-opacity group-hover:opacity-100"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">{useCase.title}</h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                    {useCase.outcome}
                  </span>
                </div>
                <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-muted">{useCase.body}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/65 transition-colors group-hover:text-accent sm:justify-self-end">
                {useCase.cta}
                <ArrowRight
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
