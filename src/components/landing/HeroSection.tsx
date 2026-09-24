import { BookOpen, Terminal } from "lucide-react";
import { type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { HoneycombBackground, type QuietZone } from "@/components/visual/HoneycombBackground";
import { apiCounts } from "@/lib/praxis";
import { HeroCallVisual } from "./hero/HeroCallVisual";
import { HeroDomainRail } from "./hero/HeroDomainRail";

/** Headline column in viewBox space (max-w-7xl container centred in 1920). */
const HEADLINE_QUIET_ZONE: QuietZone = { x0: 0.12, x1: 0.48, y0: 0.08, y1: 0.92 };

const riseDelay = (seconds: number) => ({ "--rise-delay": `${seconds}s` }) as CSSProperties;

export function HeroSection() {
  return (
    <section className="relative flex min-h-[min(100svh,920px)] flex-col overflow-hidden">
      <div className="aurora" aria-hidden />
      <HoneycombBackground height={920} litCount={14} quietZone={HEADLINE_QUIET_ZONE} seed={11} interactive />

      <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 pb-14 pt-[calc(var(--nav-float-offset)+1.25rem)] sm:gap-14 sm:px-6 sm:pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-20 lg:pt-[calc(var(--nav-float-offset)+2.5rem)]">
        <div className="max-w-xl">
          <p
            style={riseDelay(0)}
            className="animate-rise font-mono text-[11px] tracking-[0.18em] text-accent"
          >
            <span className="text-foreground/90">Praxis</span>
            <span className="text-accent/80">.app</span>
          </p>

          <h1
            style={riseDelay(0.06)}
            className="animate-rise mt-4 font-display text-[42px] font-semibold leading-[1.02] tracking-[-0.048em] text-balance sm:text-6xl lg:text-[72px]"
          >
            <span className="text-gradient">Practice on APIs</span>
            <span className="mt-1 block text-white/38">that behave like production.</span>
          </h1>

          <p style={riseDelay(0.12)} className="animate-rise mt-6 max-w-md text-[17px] leading-relaxed text-muted sm:text-lg">
            Auth, ecommerce, social, chat, and {apiCounts.publicResources} public resources — real backends,
            real responses, no keys.
          </p>

          <div style={riseDelay(0.18)} className="animate-rise relative z-10 mt-10 flex flex-wrap gap-3">
            <Button href="/playground" size="lg" icon={Terminal} trailingArrow>
              Start building
            </Button>
            <Button href="/docs" variant="secondary" size="lg" icon={BookOpen} newTab>
              Read the docs
            </Button>
          </div>

          <p
            style={riseDelay(0.24)}
            className="animate-rise mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs tracking-wide text-subtle"
          >
            <span>No signup</span>
            <span className="text-border-strong" aria-hidden>
              ·
            </span>
            <span>No API key</span>
            <span className="text-border-strong" aria-hidden>
              ·
            </span>
            <span>{apiCounts.totalEndpoints} live endpoints</span>
          </p>
        </div>

        <div style={riseDelay(0.14)} className="animate-rise lg:justify-self-end lg:w-full lg:max-w-[520px]">
          <HeroCallVisual />
        </div>
      </div>

      <div style={riseDelay(0.28)} className="animate-rise">
        <HeroDomainRail />
      </div>
    </section>
  );
}
