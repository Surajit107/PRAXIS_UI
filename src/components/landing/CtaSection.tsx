import { BookOpen, Terminal } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { HoneycombBackground } from "@/components/visual/HoneycombBackground";
import { apiCounts, getApiServerUrl } from "@/lib/praxis";

/** Path relative to OpenAPI server base (`…/api/v1`). */
const SAMPLE_PATH = "/public/randomusers?limit=5";

export function CtaSection() {
  const command = `curl ${getApiServerUrl()}${SAMPLE_PATH}`;

  return (
    <section className="relative overflow-hidden pb-4">
      <HoneycombBackground anchor="bottom" height={640} litCount={14} seed={42} interactive />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center sm:px-6 sm:py-32">
        <Reveal tone="title">
          <h2 className="font-display text-[clamp(2rem,8vw,3.5rem)] font-semibold tracking-[-0.04em] text-balance sm:text-[56px] sm:leading-[1.02]">
            <span className="text-gradient">Ready when you are.</span>
          </h2>
        </Reveal>

        <Reveal tone="subtitle">
          <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-muted">
            {apiCounts.totalEndpoints} endpoints, zero signup. Open the playground or curl from your terminal.
          </p>
        </Reveal>

        <Reveal delay={0.35} className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
          <Button href="/playground" size="lg" icon={Terminal} trailingArrow className="w-full sm:w-auto">
            Open playground
          </Button>
          <Button href="/docs" variant="secondary" size="lg" icon={BookOpen} newTab className="w-full sm:w-auto">
            Read the docs
          </Button>
        </Reveal>

        <Reveal delay={0.45} className="mt-10 w-full max-w-xl">
          <div className="glass flex min-w-0 items-center gap-2 rounded-[var(--radius-md)] py-1.5 pl-3 pr-1.5 text-left sm:gap-3 sm:pl-4">
            <span aria-hidden className="shrink-0 font-mono text-sm text-accent">
              $
            </span>
            <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground/85 sm:text-[13px]">{command}</code>
            <CopyButton value={command} label="Copy curl command" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
