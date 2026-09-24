import type { ReactNode } from "react";
import { DocsChrome } from "@/components/docs/DocsChrome";
import { buildDocsSearchRecords } from "@/lib/docs/search-index";

/** Bake MDX search index at build time — no Node fs on Workers at request time. */
export const dynamic = "force-static";
export const revalidate = false;

export default function DocsLayout({ children }: { children: ReactNode }) {
  const searchRecords = buildDocsSearchRecords();

  return <DocsChrome searchRecords={searchRecords}>{children}</DocsChrome>;
}
