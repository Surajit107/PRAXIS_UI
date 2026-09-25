import type { Metadata } from "next";
import { DocsBreadcrumbs } from "@/components/docs/DocsBreadcrumbs";
import { DocsPager } from "@/components/docs/DocsPager";
import { ScalarReferenceLoader } from "@/components/docs/ScalarReferenceLoader";
import { docsPageMetadata } from "@/lib/docs/metadata";
import { getApiServerUrl } from "@/lib/praxis";

/**
 * Shell can be static; Scalar still rewrites servers client-side via
 * `getApiServerUrl()` (SITE_URL / window) so Cloudflare never shows localhost.
 */
export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = docsPageMetadata({
  title: "API Reference",
  description:
    "Interactive OpenAPI reference for Praxis — every route, schema, example, and Try It console.",
  path: "/docs/api",
});

export default function DocsApiPage() {
  const serverUrl = getApiServerUrl();

  return (
    <div className="relative z-0">
      <div className="mb-4 max-w-3xl">
        <DocsBreadcrumbs pathname="/docs/api" />
        <header className="mt-2">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">
            API Reference
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            Live OpenAPI for the Praxis backend. Try It targets{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-foreground">
              {serverUrl}
            </code>
            .
          </p>
        </header>
      </div>
      <ScalarReferenceLoader />
      <DocsPager pathname="/docs/api" />
    </div>
  );
}
