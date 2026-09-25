"use client";

import { useEffect, useState } from "react";
import {
  getApiDisplayOrigin,
  getApiServerUrl,
  type ApiUrlResolveOptions,
} from "@/lib/praxis";

/**
 * Resolves display API URLs after mount so a loopback value baked at SSR/build
 * is replaced with the live public host (window.location / SITE_URL) in the browser.
 */
export function useResolvedApiServerUrl(options?: ApiUrlResolveOptions): string {
  const [url, setUrl] = useState(() => getApiServerUrl(options));

  useEffect(() => {
    setUrl(getApiServerUrl(options));
  }, [options?.requestOrigin]);

  return url;
}

export function useResolvedApiDisplayOrigin(options?: ApiUrlResolveOptions): string {
  const [url, setUrl] = useState(() => getApiDisplayOrigin(options));

  useEffect(() => {
    setUrl(getApiDisplayOrigin(options));
  }, [options?.requestOrigin]);

  return url;
}
