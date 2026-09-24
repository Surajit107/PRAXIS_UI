export type DocsNavItem = {
  title: string;
  href: string;
  /** MDX slug segments; null for non-MDX routes (e.g. Scalar). */
  slug: string[] | null;
};

export type DocsNavGroup = {
  title: string;
  items: DocsNavItem[];
};

/**
 * Sidebar tree + linear order for prev/next.
 * API Reference is Scalar-backed — not MDX.
 */
export const docsNavigation: DocsNavGroup[] = [
  {
    title: "Getting started",
    items: [
      { title: "Introduction", href: "/docs", slug: [] },
      { title: "Quickstart", href: "/docs/quickstart", slug: ["quickstart"] },
      {
        title: "Authentication",
        href: "/docs/authentication",
        slug: ["authentication"],
      },
    ],
  },
  {
    title: "Guides",
    items: [
      {
        title: "Making your first request",
        href: "/docs/guides/first-request",
        slug: ["guides", "first-request"],
      },
      {
        title: "API usage",
        href: "/docs/guides/api-usage",
        slug: ["guides", "api-usage"],
      },
      {
        title: "Working with domains",
        href: "/docs/guides/domains",
        slug: ["guides", "domains"],
      },
    ],
  },
  {
    title: "API",
    items: [
      { title: "API Reference", href: "/docs/api", slug: null },
      { title: "Errors", href: "/docs/errors", slug: ["errors"] },
      {
        title: "Rate limits",
        href: "/docs/rate-limits",
        slug: ["rate-limits"],
      },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "SDKs", href: "/docs/sdks", slug: ["sdks"] },
      { title: "Changelog", href: "/docs/changelog", slug: ["changelog"] },
    ],
  },
];

export function flattenDocsNav(): DocsNavItem[] {
  return docsNavigation.flatMap((group) => group.items);
}

export function findDocsNavItem(pathname: string): DocsNavItem | undefined {
  const normalized = pathname.replace(/\/$/, "") || "/docs";
  return flattenDocsNav().find((item) => item.href === normalized);
}

export function getDocsPager(pathname: string): {
  prev: DocsNavItem | null;
  next: DocsNavItem | null;
} {
  const items = flattenDocsNav();
  const normalized = pathname.replace(/\/$/, "") || "/docs";
  const index = items.findIndex((item) => item.href === normalized);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? items[index - 1]! : null,
    next: index < items.length - 1 ? items[index + 1]! : null,
  };
}

export function breadcrumbsForPath(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [
    { label: "Docs", href: "/docs" },
  ];
  const item = findDocsNavItem(pathname);
  if (!item) return crumbs;
  if (item.href === "/docs") return crumbs;
  if (item.href.startsWith("/docs/guides/")) {
    crumbs.push({ label: "Guides" });
  }
  crumbs.push({ label: item.title });
  return crumbs;
}
