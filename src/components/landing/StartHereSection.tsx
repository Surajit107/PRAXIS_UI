import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { startGuides } from "@/lib/praxis";

/**
 * Guided onboarding — concrete next moves into docs and playground.
 * One job: tell a first-time visitor what to do after the hero.
 */
export function StartHereSection() {
  return (
    <Section
      id="learn"
      label="Start here"
      title="Four moves. You are productive in minutes."
      description="Guides first, then the live playground — not another inventory of endpoints."
    >
      <Stagger
        as="ol"
        columns={1}
        spring="soft"
        className="glass divide-y divide-white/[0.06] rounded-[var(--radius-lg)]"
      >
        {startGuides.map((step, index) => (
          <StaggerItem as="li" key={step.level} index={index}>
            <Link
              href={step.href}
              className="group grid gap-3 px-5 py-6 outline-none transition-colors focus-visible:bg-white/[0.04] sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-8 sm:px-7 hover:bg-white/[0.03]"
            >
              <span className="font-mono text-sm tabular-nums text-accent">{step.level}</span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-foreground">{step.title}</h3>
                <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-muted">{step.description}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/65 transition-colors group-hover:text-accent sm:justify-self-end">
                {step.cta}
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
