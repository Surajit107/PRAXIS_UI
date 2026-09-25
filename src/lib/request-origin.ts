import { headers } from "next/headers";

/**
 * Public request origin for the current render (Cloudflare / reverse proxies).
 * Returns null on loopback so local `next dev` keeps using localhost API defaults.
 */
export async function getRequestOrigin(): Promise<string | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;

  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;

  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
