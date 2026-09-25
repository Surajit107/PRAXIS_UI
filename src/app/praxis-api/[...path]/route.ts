import { NextRequest, NextResponse } from "next/server";
import { getApiProxyTarget, getRequestOriginFromHeaders } from "@/config/praxis-api";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

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

function buildUpstreamUrl(request: NextRequest, path: string[]): string {
  const requestOrigin = getRequestOriginFromHeaders(request.headers);
  const base = getApiProxyTarget({ requestOrigin });
  const suffix = path.map(encodeURIComponent).join("/");
  const search = request.nextUrl.search;
  return suffix ? `${base}/${suffix}${search}` : `${base}/${search}`;
}

function filterRequestHeaders(source: Headers): Headers {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    headers.set(key, value);
  });
  return headers;
}

async function proxy(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path = [] } = await context.params;
  const upstream = buildUpstreamUrl(request, path);

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

    upstreamResponse = await fetch(upstream, init);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstream Praxis API unreachable";
    return NextResponse.json(
      {
        error: "proxy_upstream_unreachable",
        message,
        upstream: getApiProxyTarget({
          requestOrigin: getRequestOriginFromHeaders(request.headers),
        }),
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

export async function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function HEAD(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxy(request, context);
}
