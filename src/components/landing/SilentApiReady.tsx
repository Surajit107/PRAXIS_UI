"use client";

import { useEffect } from "react";

import { getApiBaseUrl, PRAXIS_API_PATH_PREFIX } from "@/config/praxis-api";

/**
 * Fire-and-forget GET /ready so a cold Render API instance can wake while
 * visitors browse the landing page. Never blocks paint or surfaces errors.
 */
export function SilentApiReady() {
  useEffect(() => {
    const url = `${getApiBaseUrl()}${PRAXIS_API_PATH_PREFIX}/ready`;
    void fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      keepalive: true,
    }).catch(() => {
      // Warm-up only — failures must stay silent.
    });
  }, []);

  return null;
}
