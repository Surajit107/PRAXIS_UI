import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Mostly-static marketing + docs site (force-static MDX / Scalar routes).
 *
 * staticAssetsIncrementalCache: required so SSG pages from generateStaticParams
 * are served from Workers Static Assets (dummy cache → /docs 404).
 *
 * enableCacheInterception MUST stay false on Next 16.3 + @opennextjs/cloudflare
 * 1.20.x — interception answers segment prefetches with full-page RSC payloads,
 * the App Router never settles the prefetch, and sidebar Links (first-request /
 * domains / api-usage / …) hammer `_rsc` forever.
 * @see https://github.com/opennextjs/opennextjs-cloudflare/issues/1334
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: false,
});
