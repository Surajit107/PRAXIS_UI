"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

type DocsMobileNavProps = {
  pathname: string;
};

export function DocsMobileNav({ pathname }: DocsMobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="docs-mobile-nav"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-sm text-foreground"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        Menu
      </button>
      {open ? (
        <div
          id="docs-mobile-nav"
          className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto border-t border-border bg-background p-5"
        >
          <DocsSidebar pathname={pathname} onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
