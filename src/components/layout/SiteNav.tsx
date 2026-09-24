"use client";

import { AnimatePresence, m, type Variants } from "motion/react";
import {
  BookOpen,
  GraduationCap,
  Hammer,
  LayoutGrid,
  Menu,
  Route,
  Terminal,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "./BrandLogo";

const links = [
  { href: "/#learn", label: "Start", icon: GraduationCap },
  { href: "/#build", label: "Build", icon: Hammer },
  { href: "/methods", label: "Methods", icon: Route },
  { href: "/#domains", label: "Catalog", icon: LayoutGrid },
  { href: "/docs", label: "Documentation", icon: BookOpen, newTab: true },
] as const;

const SECTION_IDS = links
  .map((link) => {
    const hash = link.href.includes("#") ? link.href.split("#")[1] : undefined;
    return hash || null;
  })
  .filter((id): id is string => Boolean(id));

const iconMotion: Variants = {
  rest: { scale: 1, y: 0, rotate: 0 },
  hover: { scale: 1.14, y: -1.5, rotate: -8 },
  active: { scale: 1.06, y: 0, rotate: 0 },
};

const SPRING = { type: "spring" as const, stiffness: 480, damping: 28, mass: 0.55 };

/** Path routes + home-section hashes (scroll-spy / URL hash). */
function isActive(pathname: string, href: string, activeSection: string | null) {
  if (href.includes("#")) {
    if (pathname !== "/") return false;
    const section = href.slice(href.indexOf("#") + 1);
    return Boolean(section) && section === activeSection;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Which landing section is in view (or matches location.hash). */
function useActiveSection(pathname: string) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }

    const readHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      return SECTION_IDS.includes(raw) ? raw : null;
    };

    setActiveSection(readHash());

    const onHashChange = () => setActiveSection(readHash());
    window.addEventListener("hashchange", onHashChange);

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );

    if (elements.length === 0) {
      return () => window.removeEventListener("hashchange", onHashChange);
    }

    // Bias toward the section under the floating nav.
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
        }

        if (visible.size === 0) {
          // Above first section (hero) — clear highlight unless URL hash pins one.
          setActiveSection(readHash());
          return;
        }

        let bestId: string | null = null;
        let bestRatio = -1;
        for (const id of SECTION_IDS) {
          const ratio = visible.get(id);
          if (ratio !== undefined && ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) setActiveSection(bestId);
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const el of elements) observer.observe(el);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      observer.disconnect();
    };
  }, [pathname]);

  return activeSection;
}

function NavIcon({
  icon: Icon,
  active,
  size = "sm",
}: {
  icon: LucideIcon;
  active: boolean;
  size?: "sm" | "md";
}) {
  return (
    <m.span
      variants={iconMotion}
      transition={SPRING}
      className={`inline-flex shrink-0 ${active ? "text-accent" : "text-subtle"}`}
      aria-hidden
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.75} />
    </m.span>
  );
}

export function SiteNav() {
  const pathname = usePathname() || "";
  const activeSection = useActiveSection(pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const close = () => setOpen(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-5 sm:pt-4">
      {/*
        Backdrop layer is separate from overflow clipping — Chromium drops
        backdrop-filter when both live on the same node.
      */}
      <div className="pointer-events-auto relative w-full max-w-[56rem]">
        <div className="nav-shell absolute inset-0 rounded-[20px]" aria-hidden />

        <div className="relative overflow-hidden rounded-[20px]">
          <div className="flex h-12 items-center gap-2 px-2.5 sm:h-[52px] sm:gap-3 sm:px-3">
            <div className="shrink-0 pl-1.5 sm:pl-2">
              <BrandLogo />
            </div>

            <nav
              aria-label="Primary"
              className="ml-1 hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
            >
              {links.map((link) => {
                const active = isActive(pathname, link.href, activeSection);
                return (
                  <m.div
                    key={link.href}
                    initial="rest"
                    animate={active ? "active" : "rest"}
                    whileHover="hover"
                    className="relative"
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      {...("newTab" in link && link.newTab
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                      className={`relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] transition-colors ${
                        active ? "text-foreground" : "text-muted hover:text-foreground"
                      }`}
                    >
                      {active ? (
                        <m.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-inset ring-white/[0.06]"
                          transition={{ type: "spring", stiffness: 520, damping: 42 }}
                        />
                      ) : null}
                      <span className="relative flex items-center gap-1.5">
                        <NavIcon icon={link.icon} active={active} />
                        <span>{link.label}</span>
                      </span>
                    </Link>
                  </m.div>
                );
              })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <Button href="/playground" size="sm" icon={Terminal} trailingArrow className="hidden sm:inline-flex">
                Get started
              </Button>
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-nav"
                onClick={() => setOpen((value) => !value)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {open ? (
              <m.nav
                id="mobile-nav"
                aria-label="Mobile"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-t border-white/[0.06] lg:hidden"
              >
                <ul className="flex flex-col gap-0.5 px-2.5 py-2.5">
                  {links.map((link, index) => {
                    const active = isActive(pathname, link.href, activeSection);
                    return (
                      <m.li
                        key={link.href}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.03 * index, duration: 0.2 }}
                      >
                        <m.div
                          initial="rest"
                          animate={active ? "active" : "rest"}
                          whileHover="hover"
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link
                            href={link.href}
                            onClick={close}
                            aria-current={active ? "page" : undefined}
                            {...("newTab" in link && link.newTab
                              ? { target: "_blank", rel: "noreferrer" }
                              : {})}
                            className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px] text-muted transition-colors hover:bg-white/[0.04] hover:text-foreground aria-[current=page]:bg-white/[0.06] aria-[current=page]:text-foreground"
                          >
                            <NavIcon icon={link.icon} active={active} size="md" />
                            <span>{link.label}</span>
                          </Link>
                        </m.div>
                      </m.li>
                    );
                  })}
                  <li className="pt-1.5">
                    <Button href="/playground" icon={Terminal} trailingArrow className="w-full">
                      Get started
                    </Button>
                  </li>
                </ul>
              </m.nav>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
