import Link from "next/link";
import { type MouseEventHandler, type ReactNode } from "react";

const EXTERNAL_HREF = /^(https?:|mailto:)/;
/** Static assets (e.g. /openapi.yaml) must bypass client-side routing. */
const FILE_HREF = /\.[a-z0-9]+$/i;

type SmartLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  /** Open in a new browsing context (docs shell, external tools, etc.). */
  newTab?: boolean;
  /**
   * Next.js Link prefetch. Prefer false on dense docs nav until OpenNext
   * serves segment prefetches correctly on Next 16.3.
   */
  prefetch?: boolean;
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | "true" | "false";
};

/** Routes internal paths through next/link, everything else through a plain anchor. */
export function SmartLink({
  href,
  className,
  children,
  onClick,
  newTab = false,
  prefetch,
  "aria-current": ariaCurrent,
}: SmartLinkProps) {
  const tabProps = newTab ? ({ target: "_blank", rel: "noreferrer" } as const) : {};

  if (EXTERNAL_HREF.test(href)) {
    const externalNewTab = newTab || href.startsWith("http");
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        aria-current={ariaCurrent}
        {...(externalNewTab ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  if (FILE_HREF.test(href) || newTab) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        aria-current={ariaCurrent}
        {...tabProps}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      prefetch={prefetch}
      aria-current={ariaCurrent}
    >
      {children}
    </Link>
  );
}
