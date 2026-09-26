import { type CSSProperties, type ReactNode } from "react";
import { HoneycombBackground, type QuietZone } from "@/components/visual/HoneycombBackground";

// Keeps lit cells out from behind the left-aligned title block.
const TITLE_QUIET_ZONE: QuietZone = { x0: 0.18, x1: 0.52, y0: 0, y1: 0.9 };
const ACTIONS_DELAY: CSSProperties = { "--rise-delay": "0.1s" } as CSSProperties;

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

/** Above-the-fold header — CSS entrance (not motion) so the title paints before hydration. */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden">
      <HoneycombBackground height={340} litCount={7} focusX={0.72} seed={21} quietZone={TITLE_QUIET_ZONE} interactive />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-[calc(var(--nav-float-offset)+2.25rem)] pb-12 sm:px-6 md:flex-row md:items-end md:justify-between md:pb-16">
        <div className="animate-rise">
          <p className="chip mb-1 w-fit">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" aria-hidden />
            <span className="uppercase tracking-[0.16em] text-muted">{eyebrow}</span>
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h1>
          {description ? <div className="mt-3 max-w-xl text-[15px] text-muted">{description}</div> : null}
        </div>
        {actions ? (
          <div style={ACTIONS_DELAY} className="animate-rise flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:[&_a]:w-auto sm:[&_button]:w-auto [&_a]:w-full [&_button]:w-full">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
