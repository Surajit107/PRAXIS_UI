/** All nine HTTP methods from RFC 9110 + PATCH (RFC 5789). */
export const httpMethods = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "TRACE",
  "CONNECT",
] as const;

export type HttpMethod = (typeof httpMethods)[number];

/**
 * Verbs the kitchen-sink / playground can fire.
 * TRACE and CONNECT use GET aliases in the browser (Fetch forbids those methods);
 * curl/Postman hit the real verbs on the same paths.
 */
export const playgroundHttpMethods = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "TRACE",
  "CONNECT",
] as const;

export type PlaygroundHttpMethod = (typeof playgroundHttpMethods)[number];

export function isHttpMethod(value: string): value is HttpMethod {
  return (httpMethods as readonly string[]).includes(value);
}

export function isPlaygroundHttpMethod(value: string): value is PlaygroundHttpMethod {
  return (playgroundHttpMethods as readonly string[]).includes(value);
}

/**
 * Fetch Living Standard forbids CONNECT / TRACE / TRACK in the browser.
 * Kitchen-sink exposes GET aliases on those paths for playground demos.
 */
const BROWSER_FORBIDDEN_METHODS = new Set<PlaygroundHttpMethod>(["TRACE", "CONNECT"]);

export function resolveBrowserFetchMethod(method: PlaygroundHttpMethod): string {
  return BROWSER_FORBIDDEN_METHODS.has(method) ? "GET" : method;
}

/**
 * Text colour per verb — shared by playground, console and docs chips.
 * Uses fixed --method-* tokens so brand accent changes never recolour verbs.
 */
export const methodToneClass: Record<HttpMethod, string> = {
  GET: "text-method-get",
  HEAD: "text-method-head",
  POST: "text-method-post",
  PUT: "text-method-put",
  PATCH: "text-method-patch",
  DELETE: "text-method-delete",
  OPTIONS: "text-method-options",
  TRACE: "text-method-trace",
  CONNECT: "text-method-connect",
};

/**
 * Status badge colours — reuse --method-* tokens (not brand --accent / --info).
 * 2xx→GET, 3xx→POST, 4xx→PUT, 5xx→DELETE. Accent theme changes must not recolour these.
 */
export function statusTextClass(status: number): string {
  if (status >= 500) return "text-method-delete";
  if (status >= 400) return "text-method-put";
  if (status >= 300) return "text-method-post";
  return "text-method-get";
}

export function statusToneClass(status: number): string {
  if (status >= 500) return "text-method-delete border-method-delete/30 bg-method-delete/10";
  if (status >= 400) return "text-method-put border-method-put/30 bg-method-put/10";
  if (status >= 300) return "text-method-post border-method-post/30 bg-method-post/10";
  return "text-method-get border-method-get/30 bg-method-get/10";
}

/**
 * Counts derived from mounted PRAXIS_API routes (src/app.js + src/routes).
 * YouTube public routes exist but are intentionally unmounted — excluded.
 */
export const apiCounts = {
  /** Mounted public collections under /api/v1/public/* */
  publicResources: 22,
  /** Route handlers in public/* excluding youtube.routes.js */
  publicEndpoints: 66,
  /** Auth / users handlers */
  authEndpoints: 16,
  /** Ecommerce handlers */
  ecommerceEndpoints: 42,
  /** Social-media handlers */
  socialEndpoints: 24,
  /** Chat-app handlers */
  chatEndpoints: 14,
  /** Todo handlers */
  todoEndpoints: 6,
  /** Sum of app domain handlers (users + ecommerce + social + chat + todos) */
  appEndpoints: 102,
  /** Distinct kitchen-sink modules mounted */
  kitchenSinkModules: 7,
  /** Kitchen-sink route handlers (all nine HTTP methods + TRACE/CONNECT GET aliases) */
  kitchenSinkEndpoints: 32,
  /** Health / live / ready / version */
  systemEndpoints: 4,
  /**
   * Live surface excluding unmounted youtube (7) and seed helpers on app.js.
   * 211 total route-file handlers − 7 youtube = 204.
   */
  totalEndpoints: 204,
  /** Product surface lanes marketed on the landing page */
  productDomains: 6,
  /** Auth + ecommerce + social + chat + todos */
  appDomains: 5,
  /** Public business-shaped collections (companies → appointments) */
  businessResources: 12,
} as const;

export type DomainIconId =
  | "public"
  | "auth"
  | "ecommerce"
  | "social"
  | "chat"
  | "todos"
  | "kitchen-sink";

/**
 * Mounted public collections. Order matches marketing/catalog preference:
 * business surfaces first, then market data, then lighter datasets.
 * `geo` is excluded from playground presets — sqlite-backed and slow on cold hit.
 */
const publicResources = [
  "invoices",
  "shipments",
  "tickets",
  "orders",
  "inventory",
  "projects",
  "subscriptions",
  "transactions",
  "appointments",
  "companies",
  "customers",
  "employees",
  "stocks",
  "books",
  "quotes",
  "meals",
  "randomproducts",
  "randomusers",
  "randomjokes",
  "dogs",
  "cats",
  "geo",
] as const;

const PUBLIC_PRESET_SKIP = new Set<string>(["geo"]);

const publicPresets = publicResources
  .filter((resource) => !PUBLIC_PRESET_SKIP.has(resource))
  .map((resource) => `GET /api/v1/public/${resource}?limit=5`);

/** Playground domain switcher — three buckets; kitchen-sink stays available as a utility tab. */
export const domains = [
  {
    id: "public" as const,
    icon: "public" as const satisfies DomainIconId,
    title: "Public",
    summary: "Ready-to-hit resources — business datasets, market data, and open collections.",
    endpointCount: apiCounts.publicEndpoints,
    countLabel: `${apiCounts.publicEndpoints} endpoints`,
    samples: publicPresets,
  },
  {
    id: "apps" as const,
    icon: "ecommerce" as const satisfies DomainIconId,
    title: "Apps",
    summary: "Auth, ecommerce, social, chat, and todos — full practice surfaces.",
    endpointCount: apiCounts.appEndpoints,
    countLabel: `${apiCounts.appEndpoints} endpoints`,
    samples: [
      "GET /api/v1/ecommerce/products",
      "GET /api/v1/ecommerce/categories",
      "GET /api/v1/social-media/posts",
      "GET /api/v1/todos",
    ],
  },
  {
    id: "kitchen-sink" as const,
    icon: "kitchen-sink" as const satisfies DomainIconId,
    title: "HTTP utilities",
    summary: "Status codes, cookies, redirects, and request inspection when you need them.",
    endpointCount: apiCounts.kitchenSinkEndpoints,
    countLabel: `${apiCounts.kitchenSinkEndpoints} endpoints`,
    samples: [
      "GET /api/v1/kitchen-sink/status-codes/200",
      "GET /api/v1/kitchen-sink/cookies/get",
      "GET /api/v1/kitchen-sink/request/headers",
    ],
  },
] as const;

/** Full catalog for the domains browser — production surfaces first, utilities last. */
export const domainCatalog = [
  {
    id: "ecommerce",
    icon: "ecommerce" as const satisfies DomainIconId,
    title: "E-commerce",
    endpoints: apiCounts.ecommerceEndpoints,
    playground: "/playground?domain=apps",
    summary: "Products, carts, orders, coupons, and addresses — a storefront backend to lean on.",
    samples: ["GET /api/v1/ecommerce/products", "POST /api/v1/ecommerce/cart", "POST /api/v1/ecommerce/orders"],
  },
  {
    id: "auth",
    icon: "auth" as const satisfies DomainIconId,
    title: "Authentication",
    endpoints: apiCounts.authEndpoints,
    playground: "/playground?domain=apps",
    summary: "Register, login, refresh, and OAuth flows with real JWT behaviour.",
    samples: ["POST /api/v1/users/register", "POST /api/v1/users/login", "POST /api/v1/users/refresh-token"],
  },
  {
    id: "social",
    icon: "social" as const satisfies DomainIconId,
    title: "Social media",
    endpoints: apiCounts.socialEndpoints,
    playground: "/playground?domain=apps",
    summary: "Posts, comments, likes, bookmarks, and follows for feed-style clients.",
    samples: ["GET /api/v1/social-media/posts", "POST /api/v1/social-media/comments", "POST /api/v1/social-media/follow"],
  },
  {
    id: "chat",
    icon: "chat" as const satisfies DomainIconId,
    title: "Chat",
    endpoints: apiCounts.chatEndpoints,
    playground: "/playground?domain=apps",
    summary: "Rooms and messages over Socket.IO — practice live UI, not polling loops.",
    samples: ["GET /api/v1/chat-app/chats", "POST /api/v1/chat-app/chats", "GET /api/v1/chat-app/messages"],
  },
  {
    id: "public",
    icon: "public" as const satisfies DomainIconId,
    title: "Public data",
    endpoints: apiCounts.publicEndpoints,
    playground: "/playground?domain=public",
    summary: "Quotes, jokes, meals, books, geo, and business-shaped datasets — readable without auth.",
    samples: ["GET /api/v1/public/quotes", "GET /api/v1/public/companies", "GET /api/v1/public/invoices"],
  },
  {
    id: "todos",
    icon: "todos" as const satisfies DomainIconId,
    title: "Todos",
    endpoints: apiCounts.todoEndpoints,
    playground: "/playground?domain=apps",
    summary: "Classic CRUD for warm-ups — create, update, complete, and delete.",
    samples: ["GET /api/v1/todos", "POST /api/v1/todos", "PATCH /api/v1/todos/:id"],
  },
  {
    id: "kitchen-sink",
    icon: "kitchen-sink" as const satisfies DomainIconId,
    title: "HTTP utilities",
    endpoints: apiCounts.kitchenSinkEndpoints,
    playground: "/playground?domain=kitchen-sink",
    summary: "Status codes, cookies, redirects, and request inspection — edge cases when you need them.",
    samples: ["GET /api/v1/kitchen-sink/status-codes/404", "GET /api/v1/kitchen-sink/cookies/get"],
  },
] as const;

/**
 * Landing use-case narratives — outcomes visitors can practice, not another route index.
 * Kitchen-sink stays out; it is a utility, not a product story.
 */
export const useCases = [
  {
    id: "storefront",
    icon: "ecommerce" as const satisfies DomainIconId,
    title: "Ship a storefront",
    body: "Catalogue, cart, checkout, coupons, and addresses — the ecommerce flow portfolios and interviews actually expect.",
    outcome: "Product list → cart → order",
    href: "/playground?domain=apps",
    cta: "Open ecommerce",
  },
  {
    id: "sessions",
    icon: "auth" as const satisfies DomainIconId,
    title: "Wire real sessions",
    body: "Register, login, refresh, and OAuth against live JWT endpoints — practice auth the way production clients do.",
    outcome: "Register → login → refresh",
    href: "/docs/authentication",
    cta: "Auth guide",
  },
  {
    id: "feed",
    icon: "social" as const satisfies DomainIconId,
    title: "Build a social feed",
    body: "Posts, comments, likes, bookmarks, and follows — enough surface to ship a credible feed UI.",
    outcome: "Feed → engage → follow",
    href: "/playground?domain=apps",
    cta: "Open social",
  },
  {
    id: "realtime",
    icon: "chat" as const satisfies DomainIconId,
    title: "Add live chat",
    body: "Rooms and messages over Socket.IO — build realtime UI against a live bus, not a polling demo.",
    outcome: "Join room → send → receive",
    href: "/playground?domain=apps",
    cta: "Open chat",
  },
  {
    id: "dashboard",
    icon: "public" as const satisfies DomainIconId,
    title: "Prototype a business dashboard",
    body: "Companies, invoices, shipments, appointments — datasets that make dashboards look like work, not todos.",
    outcome: "Fetch → filter → chart",
    href: "/playground?domain=public",
    cta: "Open public data",
  },
] as const;

/**
 * Hero Live surfaces rail — short names + a live sample route each.
 * Product domains deep-link the catalog.
 */
export const domainTicker = [
  {
    id: "public",
    name: "Public",
    icon: "public" as const satisfies DomainIconId,
    endpoints: apiCounts.publicEndpoints,
    href: "/#domains",
    sample: { method: "GET" as const, path: "/api/v1/public/quotes" },
  },
  {
    id: "geo",
    name: "Geo",
    icon: "public" as const satisfies DomainIconId,
    endpoints: 3,
    href: "/#domains",
    sample: { method: "GET" as const, path: "/api/v1/public/geo" },
  },
  {
    id: "kitchen-sink",
    name: "Kitchen Sink",
    icon: "kitchen-sink" as const satisfies DomainIconId,
    endpoints: apiCounts.kitchenSinkEndpoints,
    href: "/#domains",
    sample: { method: "GET" as const, path: "/api/v1/kitchen-sink/status-codes/200" },
  },
  {
    id: "auth",
    name: "Auth",
    icon: "auth" as const satisfies DomainIconId,
    endpoints: apiCounts.authEndpoints,
    href: "/#domains",
    sample: { method: "POST" as const, path: "/api/v1/users/login" },
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    icon: "ecommerce" as const satisfies DomainIconId,
    endpoints: apiCounts.ecommerceEndpoints,
    href: "/#domains",
    sample: { method: "GET" as const, path: "/api/v1/ecommerce/products" },
  },
  {
    id: "todos",
    name: "Todos",
    icon: "todos" as const satisfies DomainIconId,
    endpoints: apiCounts.todoEndpoints,
    href: "/#domains",
    sample: { method: "GET" as const, path: "/api/v1/todos" },
  },
  {
    id: "social",
    name: "Social",
    icon: "social" as const satisfies DomainIconId,
    endpoints: apiCounts.socialEndpoints,
    href: "/#domains",
    sample: { method: "GET" as const, path: "/api/v1/social-media/posts" },
  },
  {
    id: "chat",
    name: "Chat",
    icon: "chat" as const satisfies DomainIconId,
    endpoints: apiCounts.chatEndpoints,
    href: "/#domains",
    sample: { method: "GET" as const, path: "/api/v1/chat-app/chats" },
  },
] as const;

/**
 * Guided onboarding for `/` — concrete next moves into docs and playground.
 * Replaces the vague Read / Write / Ship strip.
 */
export const startGuides = [
  {
    level: "01",
    title: "Make your first request",
    description: "Hit a public endpoint with curl or the playground — no signup, no API key.",
    href: "/docs/guides/first-request",
    cta: "First request guide",
  },
  {
    level: "02",
    title: "Pick a domain",
    description: "Public datasets, auth-backed apps, or ecommerce — choose the lane that matches what you are building.",
    href: "/docs/guides/domains",
    cta: "Domains guide",
  },
  {
    level: "03",
    title: "Add authentication",
    description: "Register, login, and refresh JWT sessions when your client needs a real user.",
    href: "/docs/authentication",
    cta: "Auth guide",
  },
  {
    level: "04",
    title: "Try it live",
    description: "Fire the same routes in the playground — inspect the envelope, status, and payloads.",
    href: "/playground",
    cta: "Open playground",
  },
] as const;

/**
 * Landing telemetry readouts — technical key paths, not marketing fluff.
 * `keys` stays 0 on purpose: public surface needs no API key.
 */
export const stats = [
  {
    id: "endpoints",
    label: "Live endpoints",
    key: "routes.mounted",
    unit: "handlers",
    value: "100+",
    live: true,
  },
  {
    id: "resources",
    label: "Public resources",
    key: "public.collections",
    unit: "datasets",
    value: "20+",
    live: false,
  },
  {
    id: "domains",
    label: "App domains",
    key: "apps.surfaces",
    unit: "modules",
    value: apiCounts.appDomains,
    live: false,
  },
  {
    id: "keys",
    label: "Keys required",
    key: "auth.api_key",
    unit: "required",
    value: 0,
    live: false,
  },
] as const;

export type PraxisStat = (typeof stats)[number];

export const kitchenSinkActions: readonly {
  id: string;
  title: string;
  path: string;
  method: PlaygroundHttpMethod;
}[] = [
    { id: "status", title: "Status codes", path: "/api/v1/kitchen-sink/status-codes/200", method: "GET" },
    { id: "headers", title: "Request inspection", path: "/api/v1/kitchen-sink/request/headers", method: "GET" },
    { id: "cookies", title: "Cookies", path: "/api/v1/kitchen-sink/cookies/get", method: "GET" },
    { id: "get", title: "GET method", path: "/api/v1/kitchen-sink/http-methods/get", method: "GET" },
    { id: "head", title: "HEAD method", path: "/api/v1/kitchen-sink/http-methods/head", method: "HEAD" },
    { id: "post", title: "POST method", path: "/api/v1/kitchen-sink/http-methods/post", method: "POST" },
    { id: "put", title: "PUT method", path: "/api/v1/kitchen-sink/http-methods/put", method: "PUT" },
    { id: "patch", title: "PATCH method", path: "/api/v1/kitchen-sink/http-methods/patch", method: "PATCH" },
    { id: "delete", title: "DELETE method", path: "/api/v1/kitchen-sink/http-methods/delete", method: "DELETE" },
    { id: "options", title: "OPTIONS method", path: "/api/v1/kitchen-sink/http-methods/options", method: "OPTIONS" },
    { id: "trace", title: "TRACE method", path: "/api/v1/kitchen-sink/http-methods/trace", method: "TRACE" },
    { id: "connect", title: "CONNECT method", path: "/api/v1/kitchen-sink/http-methods/connect", method: "CONNECT" },
  ];

export function statusCodePath(code: number): string {
  return `/api/v1/kitchen-sink/status-codes/${code}`;
}

/** Same-origin path proxy used when the configured API target is loopback. */
export const API_PATH_PROXY_PREFIX = "/praxis-api";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLoopbackHttpUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(url);
}

function toHttpOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return stripTrailingSlash(url);
  }
}

function getConfiguredApiUrl(): string {
  return process.env.NEXT_PUBLIC_PRAXIS_API_URL
    ? stripTrailingSlash(process.env.NEXT_PUBLIC_PRAXIS_API_URL)
    : "";
}

function withApiV1Mount(url: string): string {
  if (/\/api\/v1$/i.test(url)) return url;
  return `${toHttpOrigin(url)}/api/v1`;
}

export type ApiUrlResolveOptions = {
  /** Incoming request origin (e.g. from `x-forwarded-host`) when resolving on the server. */
  requestOrigin?: string | null;
};

/**
 * Non-loopback site origin if known — build env, request host, or browser location.
 * Used to advertise the public `/praxis-api` surface when NEXT_PUBLIC still points at localhost.
 */
export function getPublicSiteOrigin(options?: ApiUrlResolveOptions): string | null {
  const candidates = [
    options?.requestOrigin,
    process.env.NEXT_PUBLIC_SITE_URL,
    typeof window !== "undefined" ? window.location.origin : "",
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const origin = toHttpOrigin(stripTrailingSlash(raw));
    if (origin && !isLoopbackHttpUrl(origin)) return origin;
  }

  return null;
}

/** Default Praxis API base (OpenAPI `servers.url` + Scalar Try It). */
export const DEFAULT_API_SERVER_URL = "http://localhost:8000/api/v1";

/** Host origin only — playground paths already include `/api/v1/...`. */
export const DEFAULT_API_ORIGIN = "http://localhost:8000";

/**
 * Real Praxis API base URL shown in API Reference / CTA / OAuth start.
 * Matches backend mount: `{host}/api/v1`.
 *
 * When `NEXT_PUBLIC_PRAXIS_API_URL` is missing or still loopback but the site is
 * served from a public host (Cloudflare), advertise the same-origin path proxy
 * so curl/docs never tell users to hit localhost.
 */
export function getApiServerUrl(options?: ApiUrlResolveOptions): string {
  const configured = getConfiguredApiUrl();

  if (configured && !isLoopbackHttpUrl(configured)) {
    return withApiV1Mount(configured);
  }

  const siteOrigin = getPublicSiteOrigin(options);
  if (siteOrigin) {
    return `${siteOrigin}${API_PATH_PROXY_PREFIX}/api/v1`;
  }

  if (!configured) return DEFAULT_API_SERVER_URL;
  return withApiV1Mount(configured);
}

/**
 * Origin prefix for URLs that already include `/api/v1/...` (playground chrome/snippets).
 * Strips the trailing `/api/v1` mount from {@link getApiServerUrl}.
 */
export function getApiDisplayOrigin(options?: ApiUrlResolveOptions): string {
  return getApiServerUrl(options).replace(/\/api\/v1$/i, "");
}

/**
 * Browser fetch base for the playground. Loopback targets go through the
 * same-origin path proxy to avoid CORS; remote URLs use the API host origin.
 * Playground / try-it request paths already include `/api/v1/...`, so this
 * must never include the `/api/v1` mount (use {@link getApiServerUrl} for that).
 */
export function getApiBaseUrl(): string {
  const configured = getConfiguredApiUrl();

  if (!configured || isLoopbackHttpUrl(configured)) {
    return API_PATH_PROXY_PREFIX;
  }

  return toHttpOrigin(configured);
}

/** Scalar Try It CORS proxy (`?scalar_url=` protocol). */
export function getScalarProxyUrl(): string {
  return "/scalar-proxy";
}

/**
 * Upstream host for `/praxis-api/*` path proxy.
 * Must be the API origin only — playground paths are `/api/v1/...`.
 */
export function getApiProxyTarget(): string {
  const explicit = process.env.PRAXIS_API_PROXY_TARGET
    ? stripTrailingSlash(process.env.PRAXIS_API_PROXY_TARGET)
    : "";
  if (explicit) return toHttpOrigin(explicit);

  const publicUrl = getConfiguredApiUrl();
  if (publicUrl && /^https?:\/\//i.test(publicUrl) && !isLoopbackHttpUrl(publicUrl)) {
    return toHttpOrigin(publicUrl);
  }

  return DEFAULT_API_ORIGIN;
}
