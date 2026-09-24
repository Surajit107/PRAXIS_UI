import type { ReactNode } from "react";
import { DocsChrome } from "@/components/docs/DocsChrome";
import { buildDocsSearchRecords } from "@/lib/docs/search-index";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const searchRecords = buildDocsSearchRecords();

  return <DocsChrome searchRecords={searchRecords}>{children}</DocsChrome>;
}
