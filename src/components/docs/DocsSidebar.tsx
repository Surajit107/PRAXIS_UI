"use client";

import { SmartLink } from "@/components/ui/SmartLink";
import { docsNavigation } from "@/lib/docs/navigation";

type DocsSidebarProps = {
  pathname: string;
  onNavigate?: () => void;
  /** `touch` = larger hit targets for the mobile/tablet drawer. */
  density?: "default" | "touch";
};

export function DocsSidebar({
  pathname,
  onNavigate,
  density = "default",
}: DocsSidebarProps) {
  const normalized = pathname.replace(/\/$/, "") || "/docs";
  const touch = density === "touch";

  return (
    <nav aria-label="Documentation" className={touch ? "space-y-8" : "space-y-7"}>
      {docsNavigation.map((group) => (
        <div key={group.title}>
          <p
            className={`px-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-subtle ${
              touch ? "mb-0.5" : ""
            }`}
          >
            {group.title}
          </p>
          <ul className={`mt-2.5 ${touch ? "space-y-1" : "space-y-0.5"}`}>
            {group.items.map((item) => {
              const active = item.href === normalized;
              return (
                <li key={item.href}>
                  <SmartLink
                    href={item.href}
                    prefetch={false}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-2.5 text-sm transition-colors ${
                      touch ? "min-h-11 py-2.5 leading-snug" : "py-1.5"
                    } ${
                      active
                        ? "bg-accent-soft font-medium text-foreground"
                        : "text-muted hover:bg-white/[0.04] hover:text-foreground"
                    }`}
                  >
                    {item.title}
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
