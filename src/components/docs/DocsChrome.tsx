"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DocsMobileNav } from "@/components/docs/DocsMobileNav";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { BrandLogo } from "@/components/layout/BrandLogo";
import type { DocsSearchRecord } from "@/lib/docs/search-index";

type DocsChromeProps = {
  searchRecords: DocsSearchRecord[];
  children: ReactNode;
};

export function DocsChrome({ searchRecords, children }: DocsChromeProps) {
  const pathname = usePathname() || "/docs";
  const isApi = pathname === "/docs/api" || pathname.startsWith("/docs/api/");
  const isTry = pathname === "/docs/try" || pathname.startsWith("/docs/try/");
  const hideDocsSidebar = isApi || isTry;

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#docs-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-[var(--radius-sm)] focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to documentation content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[90rem] items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <div className="min-w-0 shrink">
            <BrandLogo markClassName="h-5 w-5" />
          </div>

          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            {/*
              Search takes remaining space on tablet+; on phones it stays usable
              but yields to the menu control so both fit without clipping.
            */}
            <div className="min-w-0 flex-1 sm:max-w-xs md:max-w-sm lg:max-w-md">
              <DocsSearch records={searchRecords} variant="nav" />
            </div>
            {!hideDocsSidebar ? <DocsMobileNav pathname={pathname} /> : null}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full min-w-0 max-w-[90rem]">
        {!hideDocsSidebar ? (
          <aside className="scrollbar-overlay sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto lg:block">
            <div className="h-full border-r border-white/[0.06] py-8 pl-6 pr-4">
              <DocsSidebar pathname={pathname} />
            </div>
          </aside>
        ) : null}

        <div
          id="docs-main"
          className={
            isApi
              ? "min-w-0 flex-1 px-3 pb-6 pt-4 sm:px-6 lg:px-8"
              : "min-w-0 flex-1 px-3 pb-16 pt-5 sm:px-6 sm:pt-6 lg:px-10 lg:pt-8"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
