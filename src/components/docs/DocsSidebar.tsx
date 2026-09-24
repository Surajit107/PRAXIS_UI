"use client";

import { SmartLink } from "@/components/ui/SmartLink";
import { docsNavigation } from "@/lib/docs/navigation";

type DocsSidebarProps = {
  pathname: string;
  onNavigate?: () => void;
};

export function DocsSidebar({ pathname, onNavigate }: DocsSidebarProps) {
  const normalized = pathname.replace(/\/$/, "") || "/docs";

  return (
    <nav aria-label="Documentation" className="space-y-7">
      {docsNavigation.map((group) => (
        <div key={group.title}>
          <p className="px-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
            {group.title}
          </p>
          <ul className="mt-2.5 space-y-0.5">
            {group.items.map((item) => {
              const active = item.href === normalized;
              return (
                <li key={item.href}>
                  <SmartLink
                    href={item.href}
                    prefetch={false}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-2.5 py-1.5 text-sm transition-colors ${
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
