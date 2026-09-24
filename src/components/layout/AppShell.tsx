"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNav } from "@/components/layout/SiteNav";
import { ScrollTechBackdrop } from "@/components/visual/ScrollTechBackdrop";

type AppShellProps = {
  children: ReactNode;
};

/** Marketing chrome (floating nav + footer). Docs use a dedicated sidebar shell. */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() || "";
  const isDocs = pathname === "/docs" || pathname.startsWith("/docs/");

  if (isDocs) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <ScrollTechBackdrop />
      <SiteNav />
      <main className="relative z-10">{children}</main>
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </>
  );
}
