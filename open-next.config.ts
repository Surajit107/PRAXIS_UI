import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Mostly-static marketing + docs site (force-static MDX / Scalar routes).
 *
 * Default `defineCloudflareConfig({})` uses a dummy incremental cache — SSG
 * pages from `generateStaticParams` (all `/docs/*` MDX guides) then 404 at
 * runtime because prerendered HTML is never served from ASSETS.
 *
 * Static-assets cache copies `.open-next/cache` → `assets/cdn-cgi/_next_cache`
 * during `preview` / `deploy` / `upload` (no R2 / KV / revalidation needed).
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
