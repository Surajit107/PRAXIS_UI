export const PRAXIS_API_PATH_PREFIX = "/api/v1";
export const PRAXIS_API_BROWSER_PROXY_PATH = "/praxis-api";
export const PRAXIS_SCALAR_PROXY_PATH = "/scalar-proxy";

export const LOCAL_PRAXIS_API_ORIGIN = "http://localhost:8000";
export const LOCAL_PRAXIS_API_ORIGIN_ALT = "http://127.0.0.1:8000";
export const PRODUCTION_PRAXIS_API_ORIGIN = "https://praxis-api-kjrf.onrender.com";

export type PraxisApiConfig = {
  /** Real backend API base. Safe for curl, Scalar server URL, OAuth redirects. */
  serverUrl: string;
  /** Real backend API origin. Safe for proxy allowlists. */
  upstreamOrigin: string;
  /** Same-origin browser proxy base. Safe for frontend fetch calls. */
  browserBaseUrl: string;
  /** Display origin for paths that already include /api/v1. */
  displayOrigin: string;
  scalarProxyUrl: string;
};

export type ApiUrlResolveOptions = {
  requestOrigin?: string | null;
};

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function toUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function toOrigin(value: string): string | null {
  const url = toUrl(value);
  return url ? stripTrailingSlash(url.origin) : null;
}

function isLoopbackOrigin(origin: string): boolean {
  const url = toUrl(origin);
  if (!url) return false;
  return url.hostname === "localhost" || url.hostname === "127.0.0.1";
}

function isPublicOrigin(origin: string | null | undefined): boolean {
  return Boolean(origin && !isLoopbackOrigin(origin));
}

function withApiPrefix(originOrUrl: string): string {
  const normalized = stripTrailingSlash(originOrUrl);
  if (normalized.toLowerCase().endsWith(PRAXIS_API_PATH_PREFIX)) return normalized;
  const origin = toOrigin(normalized) ?? normalized;
  return `${origin}${PRAXIS_API_PATH_PREFIX}`;
}

function envValue(key: string): string {
  return process.env[key]?.trim() ?? "";
}

function configuredPublicApiUrl(): string {
  return stripTrailingSlash(envValue("NEXT_PUBLIC_PRAXIS_API_URL"));
}

function configuredProxyTarget(): string {
  return stripTrailingSlash(envValue("PRAXIS_API_PROXY_TARGET"));
}

function isProductionRuntime(hints?: ApiUrlResolveOptions): boolean {
  if (process.env.NEXTJS_ENV === "development") return false;
  if (isPublicOrigin(hints?.requestOrigin)) return true;
  if (typeof window !== "undefined" && isPublicOrigin(window.location.origin)) return true;
  return process.env.NODE_ENV === "production";
}

function resolveUpstreamOrigin(hints?: ApiUrlResolveOptions): string {
  const explicitProxyOrigin = toOrigin(configuredProxyTarget());
  if (explicitProxyOrigin && !isLoopbackOrigin(explicitProxyOrigin)) return explicitProxyOrigin;

  const publicApiOrigin = toOrigin(configuredPublicApiUrl());
  if (publicApiOrigin && !isLoopbackOrigin(publicApiOrigin)) return publicApiOrigin;

  if (isProductionRuntime(hints)) return PRODUCTION_PRAXIS_API_ORIGIN;

  return explicitProxyOrigin ?? publicApiOrigin ?? LOCAL_PRAXIS_API_ORIGIN;
}

export function resolvePraxisApiConfig(hints?: ApiUrlResolveOptions): PraxisApiConfig {
  const upstreamOrigin = resolveUpstreamOrigin(hints);
  const configuredApiUrl = configuredPublicApiUrl();
  const configuredApiOrigin = toOrigin(configuredApiUrl);
  const useConfiguredApi =
    configuredApiUrl && configuredApiOrigin && !isLoopbackOrigin(configuredApiOrigin);

  const serverUrl = useConfiguredApi
    ? withApiPrefix(configuredApiUrl)
    : `${upstreamOrigin}${PRAXIS_API_PATH_PREFIX}`;

  return {
    serverUrl,
    upstreamOrigin,
    browserBaseUrl: PRAXIS_API_BROWSER_PROXY_PATH,
    displayOrigin: serverUrl.replace(new RegExp(`${PRAXIS_API_PATH_PREFIX}$`, "i"), ""),
    scalarProxyUrl: PRAXIS_SCALAR_PROXY_PATH,
  };
}

export function getApiServerUrl(hints?: ApiUrlResolveOptions): string {
  return resolvePraxisApiConfig(hints).serverUrl;
}

export function getApiDisplayOrigin(hints?: ApiUrlResolveOptions): string {
  return resolvePraxisApiConfig(hints).displayOrigin;
}

export function getApiBaseUrl(): string {
  return PRAXIS_API_BROWSER_PROXY_PATH;
}

export function getScalarProxyUrl(): string {
  return PRAXIS_SCALAR_PROXY_PATH;
}

export function getApiProxyTarget(hints?: ApiUrlResolveOptions): string {
  return resolvePraxisApiConfig(hints).upstreamOrigin;
}

export function getAllowedApiOrigins(hints?: ApiUrlResolveOptions): string[] {
  return Array.from(
    new Set([
      resolvePraxisApiConfig(hints).upstreamOrigin,
      LOCAL_PRAXIS_API_ORIGIN,
      LOCAL_PRAXIS_API_ORIGIN_ALT,
    ]),
  );
}

export function getRequestOriginFromHeaders(headers: Headers): string | null {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return null;
  const protocol = headers.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}
