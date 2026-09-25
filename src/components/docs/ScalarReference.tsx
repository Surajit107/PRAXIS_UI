"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useEffect, useState } from "react";
import { stripOpenApiEmojis } from "@/lib/docs/clean-openapi";
import { useResolvedApiServerUrl } from "@/hooks/useResolvedApiUrls";
import { getScalarProxyUrl } from "@/lib/praxis";
import { themeColors } from "@/lib/theme";

const SPEC_URL =
  process.env.NEXT_PUBLIC_PRAXIS_OPENAPI_URL || "/openapi.yaml";

/** Force OpenAPI `servers.url` to the configured Praxis base (`…/api/v1`). */
function withApiServerUrl(yaml: string, serverUrl: string): string {
  const serversBlock = /^servers:\s*\n(?:\s+-\s+url:\s*.+\n(?:\s+description:\s*.+\n)?)+/m;
  const nextServers = `servers:\n  - url: ${serverUrl}\n    description: Praxis API\n`;

  if (serversBlock.test(yaml)) {
    return yaml.replace(
      serversBlock,
      nextServers,
    );
  }
  return `${nextServers}${yaml}`;
}

export function ScalarReference() {
  const [spec, setSpec] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const serverUrl = useResolvedApiServerUrl();
  const proxyUrl = getScalarProxyUrl();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(SPEC_URL, { cache: "force-cache" });
        if (!response.ok) {
          throw new Error(`Failed to load OpenAPI (${response.status})`);
        }
        const raw = await response.text();
        if (!cancelled) {
          setSpec(withApiServerUrl(stripOpenApiEmojis(raw), serverUrl));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load OpenAPI");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [serverUrl]);

  if (error) {
    return (
      <p className="rounded-[var(--radius-md)] border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-foreground">
        {error}
      </p>
    );
  }

  if (!spec) {
    return <p className="px-1 py-16 text-sm text-muted">Loading API reference…</p>;
  }

  return (
    <div className="docs-scalar relative z-0 isolate min-h-[70vh] w-full">
      <ApiReferenceReact
        configuration={{
          content: spec,
          darkMode: true,
          hideDarkModeToggle: true,
          forceDarkModeState: "dark",
          hideClientButton: false,
          hideTestRequestButton: false,
          showDeveloperTools: "never",
          layout: "modern",
          servers: [
            {
              url: serverUrl,
              description: "Praxis API",
            },
          ],
          proxyUrl,
          theme: "none",
          customCss: `
            .scalar-app,
            .scalar-api-reference {
              --scalar-background-1: ${themeColors.background};
              --scalar-background-2: ${themeColors.surface};
              --scalar-background-3: ${themeColors.surface2};
              --scalar-color-1: ${themeColors.foreground};
              --scalar-color-2: ${themeColors.muted};
              --scalar-color-3: ${themeColors.muted};
              --scalar-color-accent: ${themeColors.accent};
              --scalar-border-color: ${themeColors.border};
              --scalar-font: var(--font-inter), system-ui, sans-serif;
              --scalar-font-code: var(--font-geist-mono), ui-monospace, monospace;
              --scalar-radius: 10px;
              --scalar-radius-lg: 14px;
              background: transparent;
              min-height: 70vh;
            }

            .scalar-app .section,
            .scalar-app .section-container,
            .scalar-app .section-content,
            .scalar-app .operation-details,
            .scalar-app .tag-section-container,
            .scalar-app [id]:focus,
            .scalar-app [id]:focus-visible,
            .scalar-app *:focus,
            .scalar-app *:focus-visible {
              outline: none !important;
              outline-offset: 0 !important;
            }

            .scalar-app .sidebar,
            .scalar-app .t-doc__sidebar {
              background: ${themeColors.background} !important;
            }

            .scalar-app .sidebar ul ul {
              border-left: 1px solid rgba(255, 255, 255, 0.08);
              margin-left: 0.65rem;
              padding-left: 0.65rem;
            }
          `,
        }}
      />
    </div>
  );
}
