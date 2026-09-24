"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNav } from "@/components/layout/SiteNav";
import { ScrollTechBackdrop } from "@/components/visual/ScrollTechBackdrop";

type AppShellProps = {
  children: ReactNode;
};

/** Marketing chrome (floating nav + footer). Auth + docs use standalone shells. */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() || "";
  const isDocs = pathname === "/docs" || pathname.startsWith("/docs/");
  const isStandaloneAuth =
    pathname === "/verify-email" ||
    pathname.startsWith("/verify-email/") ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/forgot-password/") ||
    pathname === "/user/profile" ||
    pathname.startsWith("/user/profile/");

  if (isDocs) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (isStandaloneAuth) {
    return (
      <>
        <ScrollTechBackdrop mode="static" />
        <main className="relative z-10 min-h-screen">{children}</main>
      </>
    );
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
