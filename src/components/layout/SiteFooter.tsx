"use client";

import { usePathname } from "next/navigation";
import { SmartLink } from "@/components/ui/SmartLink";
import { siteConfig } from "@/lib/site";
import { BrandLogo } from "./BrandLogo";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/playground", label: "Playground" },
      { href: "/docs", label: "API reference", newTab: true },
      { href: "/#domains", label: "Catalog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/#learn", label: "Start here" },
      { href: "/#build", label: "What to build" },
      { href: "/methods", label: "HTTP methods" },
      { href: "/openapi.yaml", label: "OpenAPI spec" },
    ],
  },
  {
    title: "Company",
    links: [{ href: siteConfig.company.url, label: siteConfig.company.name }],
  },
] as const;

export function SiteFooter() {
  const pathname = usePathname() || "";
  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    return null;
  }

  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <BrandLogo markClassName="h-5 w-5" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {siteConfig.description}
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
              {column.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <SmartLink
                    href={link.href}
                    newTab={"newTab" in link ? link.newTab : false}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-hairline px-4 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Built by{" "}
          <a
            href={siteConfig.company.url}
            target="_blank"
            rel="noreferrer"
            className="text-muted hover:text-foreground"
          >
            {siteConfig.company.name}
          </a>
          .
        </p>
        <p className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft"
            aria-hidden
          />
          Free forever · no keys required
        </p>
      </div>
    </footer>
  );
}
