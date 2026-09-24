import { type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

type AuthStandaloneShellProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Optional status icon above the title (success / error / pending). */
  icon?: ReactNode;
  iconTone?: "success" | "error" | "pending" | "neutral";
  wide?: boolean;
};

const iconToneClass: Record<NonNullable<AuthStandaloneShellProps["iconTone"]>, string> = {
  success: "border-method-get/35 bg-method-get/10 text-method-get",
  error: "border-danger/35 bg-danger/10 text-danger",
  pending: "border-border bg-surface-3 text-muted",
  neutral: "border-border bg-surface-3 text-foreground",
};

/**
 * Full-viewport auth surface — no site nav/footer, no back chrome.
 * Brand mark is non-navigating so the page stays a dead-end practice screen.
 */
export function AuthStandaloneShell({
  eyebrow,
  title,
  children,
  footer,
  icon,
  iconTone = "neutral",
  wide = false,
}: AuthStandaloneShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="relative z-10 mb-8">
        <BrandLogo link={false} />
      </div>
      <section
        className={`panel relative z-10 w-full overflow-hidden ${wide ? "max-w-lg" : "max-w-md"}`}
      >
        <div className="flex flex-col items-center px-6 pb-2 pt-10 text-center sm:px-8">
          {icon ? (
            <div
              className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full border ${iconToneClass[iconTone]}`}
              aria-hidden
            >
              {icon}
            </div>
          ) : null}
          <p className="chip mb-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="uppercase tracking-[0.16em] text-muted">{eyebrow}</span>
          </p>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] sm:text-[1.75rem]">
            {title}
          </h1>
        </div>
        <div className="px-6 pb-8 pt-2 sm:px-8">{children}</div>
        {footer ? (
          <div className="border-t border-border px-6 py-4 text-sm text-muted sm:px-8">{footer}</div>
        ) : null}
      </section>
    </div>
  );
}
