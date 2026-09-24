import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext → Cloudflare Workers.
 * Incremental cache defaults are fine for a mostly-static marketing + docs site.
 * Enable R2 later via wrangler `NEXT_INC_CACHE_R2_BUCKET` if you add ISR.
 */
export default defineCloudflareConfig({});
