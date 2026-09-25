import { NextRequest, NextResponse } from "next/server";
import {
  getAllowedApiOrigins,
  getApiProxyTarget,
  getRequestOriginFromHeaders,
  PRAXIS_API_BROWSER_PROXY_PATH,
} from "@/config/praxis-api";

export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

/**
 * Map UI path-proxy URLs back to the real API origin before the allowlist check.
 * Scalar must target the API host; this recovers if a build still advertised `/praxis-api`.
 */
function resolveUpstream(target: URL, requestOrigin: string | null): URL {
  if (!target.pathname.startsWith(PRAXIS_API_BROWSER_PROXY_PATH)) return target;

  const apiOrigin = getApiProxyTarget({ requestOrigin });
  const stripped =
    target.pathname.slice(PRAXIS_API_BROWSER_PROXY_PATH.length) || "/";
  return new URL(`${stripped}${target.search}`, `${apiOrigin}/`);
}

function filterRequestHeaders(source: Headers): Headers {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    headers.set(key, value);
  });
  return headers;
}

/**
 * Scalar CORS proxy protocol:
 *   /scalar-proxy?scalar_url=https%3A%2F%2Fapi.example.com%2Fpath
 * See @scalar/helpers redirectToProxy.
 */
async function proxy(request: NextRequest): Promise<Response> {
  const requestOrigin = getRequestOriginFromHeaders(request.headers);
  const scalarUrl = request.nextUrl.searchParams.get("scalar_url");
  if (!scalarUrl) {
    return NextResponse.json(
      {
        error: "missing_scalar_url",
        message: "Expected ?scalar_url=<absolute Praxis API URL>",
      },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(scalarUrl);
  } catch {
    return NextResponse.json(
      { error: "invalid_scalar_url", message: "scalar_url must be an absolute URL" },
      { status: 400 },
    );
  }

  const target = resolveUpstream(parsed, requestOrigin);
  const allowedOrigins = new Set(getAllowedApiOrigins({ requestOrigin }));

  if (!allowedOrigins.has(target.origin)) {
    return NextResponse.json(
      {
        error: "upstream_not_allowed",
        message: `Refusing to proxy to ${target.origin}`,
        allowed: [...allowedOrigins],
      },
      { status: 403 },
    );
  }

  let upstreamResponse: Response;
  try {
    const init: RequestInit = {
      method: request.method,
      headers: filterRequestHeaders(request.headers),
      redirect: "manual",
      cache: "no-store",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.arrayBuffer();
    }
    upstreamResponse = await fetch(target, init);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstream Praxis API unreachable";
    return NextResponse.json(
      {
        error: "proxy_upstream_unreachable",
        message,
        upstream: getApiProxyTarget({ requestOrigin }),
        hint: "Start PRAXIS_API (default http://localhost:8000) or set PRAXIS_API_PROXY_TARGET. API routes are under /api/v1.",
      },
      { status: 502 },
    );
  }

  const headers = new Headers();
  upstreamResponse.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    headers.set(key, value);
  });

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}

export async function GET(request: NextRequest) {
  return proxy(request);
}
export async function POST(request: NextRequest) {
  return proxy(request);
}
export async function PUT(request: NextRequest) {
  return proxy(request);
}
export async function PATCH(request: NextRequest) {
  return proxy(request);
}
export async function DELETE(request: NextRequest) {
  return proxy(request);
}
export async function HEAD(request: NextRequest) {
  return proxy(request);
}
export async function OPTIONS(request: NextRequest) {
  return proxy(request);
}
