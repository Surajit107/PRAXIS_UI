import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/**
 * Webpack symlink resolution off — this volume's `fs.readlink` is unreliable
 * (exFAT/SD). Combined with `scripts/patch-fs-readlink.cjs` in npm scripts.
 */
const nextConfig: NextConfig = {
  // Required by @opennextjs/cloudflare (Workers bundle expects standalone output).
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
