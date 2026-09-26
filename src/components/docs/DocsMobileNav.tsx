"use client";

import { AnimatePresence, m } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { findDocsNavItem } from "@/lib/docs/navigation";

type DocsMobileNavProps = {
  pathname: string;
};

/**
 * Tablet/phone docs menu — left slide-over with scrim.
 * Portaled to `document.body` so `position:fixed` is not trapped by the
 * sticky header’s `backdrop-filter` containing block.
 */
export function DocsMobileNav({ pathname }: DocsMobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = findDocsNavItem(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(frame);
      triggerRef.current?.focus();
    };
  }, [open]);

  const drawer =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[100] lg:hidden" role="presentation">
            <m.button
              type="button"
              aria-label="Close documentation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-background/70"
              onClick={() => setOpen(false)}
            />

            <m.aside
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Documentation menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              className="absolute inset-y-0 left-0 flex h-dvh w-[min(100vw-3rem,20rem)] flex-col overflow-hidden border-r border-white/[0.08] bg-background shadow-[12px_0_40px_-18px_rgba(0,0,0,0.85)] sm:w-[min(100vw-4rem,22rem)]"
            >
              <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] bg-background px-4">
                <p className="min-w-0 truncate text-sm font-medium text-foreground">
                  Documentation
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="scrollbar-overlay min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background px-3 py-5">
                <DocsSidebar
                  pathname={pathname}
                  onNavigate={() => setOpen(false)}
                  density="touch"
                />
              </div>
            </m.aside>
          </div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 max-w-[11rem] shrink-0 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 text-sm text-foreground sm:max-w-[14rem] sm:px-3"
      >
        <Menu className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 truncate">
          <span className="text-muted">Menu</span>
          {current ? (
            <>
              <span className="mx-1.5 text-subtle" aria-hidden>
                ·
              </span>
              <span className="font-medium">{current.title}</span>
            </>
          ) : null}
        </span>
      </button>
      {drawer}
    </div>
  );
}
