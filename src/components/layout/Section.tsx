import { type ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

type SectionProps = {
  id?: string;
  /** Small editorial label above the title — never a numbered FreeAPI-style chip. */
  label?: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Two-tone display titles: first sentence white, remainder accent red.
 * Single-sentence titles get the white→red gradient instead.
 * Deliberately not FreeAPI’s numbered amber chips + two-column eyebrow chrome.
 */
function MixedSectionTitle({ title }: { title: ReactNode }) {
  if (typeof title !== "string") {
    return title;
  }

  const split = title.match(/^(.+?[.!?])\s+(.+)$/);
  if (!split) {
    return <span className="text-gradient">{title}</span>;
  }

  return (
    <>
      <span className="text-foreground">{split[1]}</span>{" "}
      <span className="text-accent">{split[2]}</span>
    </>
  );
}

/**
 * Landing section shell — quiet label rail + mixed red/white headline.
 * Header stack uses asteriq-style Reveal tones (badge → title → subtitle).
 */
export function Section({ id, label, title, description, children, className = "" }: SectionProps) {
  return (
    <section id={id} className={`relative scroll-mt-20 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-12 max-w-2xl sm:mb-14">
          {label ? (
            <Reveal tone="badge" className="mb-5 flex items-center gap-3">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
              />
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">{label}</p>
              <span
                aria-hidden
                className="h-px min-w-[2.5rem] flex-1 max-w-[5rem] bg-gradient-to-r from-accent/50 to-transparent"
              />
            </Reveal>
          ) : null}
          <Reveal tone="title">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-[40px] sm:leading-[1.08]">
              <MixedSectionTitle title={title} />
            </h2>
          </Reveal>
          {description ? (
            <Reveal tone="subtitle">
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">{description}</p>
            </Reveal>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
