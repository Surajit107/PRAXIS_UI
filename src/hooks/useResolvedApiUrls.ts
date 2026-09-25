"use client";

import { useEffect, useState } from "react";
import {
  getApiDisplayOrigin,
  getApiServerUrl,
  type PraxisApiConfig,
  type ApiUrlResolveOptions,
} from "@/lib/praxis";

/**
 * Resolves API URLs from the runtime Worker config after mount.
 * This prevents stale build-time NEXT_PUBLIC values from leaking into docs.
 */
export function useResolvedApiServerUrl(options?: ApiUrlResolveOptions): string {
  const [url, setUrl] = useState(() => getApiServerUrl(options));

  useEffect(() => {
    const controller = new AbortController();

    async function resolveRuntimeConfig() {
      try {
        const response = await fetch("/api-config", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const config = (await response.json()) as PraxisApiConfig;
        setUrl(config.serverUrl);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    void resolveRuntimeConfig();
    return () => controller.abort();
  }, [options?.requestOrigin]);

  return url;
}

export function useResolvedApiDisplayOrigin(options?: ApiUrlResolveOptions): string {
  const [url, setUrl] = useState(() => getApiDisplayOrigin(options));

  useEffect(() => {
    const controller = new AbortController();

    async function resolveRuntimeConfig() {
      try {
        const response = await fetch("/api-config", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const config = (await response.json()) as PraxisApiConfig;
        setUrl(config.displayOrigin);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    void resolveRuntimeConfig();
    return () => controller.abort();
  }, [options?.requestOrigin]);

  return url;
}
