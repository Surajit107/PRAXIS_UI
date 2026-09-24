import { isPlaygroundHttpMethod, type HttpMethod } from "./praxis";

export type MethodProperty = "safe" | "idempotent" | "hasBody";

/** How the shelf demo visualises this verb. */
export type MethodDemoKind =
  | "read"
  | "headers-only"
  | "create"
  | "replace"
  | "patch"
  | "remove"
  | "capabilities"
  | "echo"
  | "tunnel";

export type MethodDemoFocusId = number | "new" | "all" | null;

export type MethodDemoConfig = {
  kind: MethodDemoKind;
  /** Plain-English beat captions — one per animation step students should notice. */
  steps: readonly [string, string, string, string];
  focusId: MethodDemoFocusId;
  outcome: string;
};

/** Alternate demo for the same verb (e.g. GET collection vs GET by id). */
export type MethodLessonVariant = {
  id: string;
  label: string;
  title?: string;
  tagline?: string;
  path: string;
  responsePreview: string;
  demo: MethodDemoConfig;
};

export type HttpMethodLesson = {
  method: HttpMethod;
  title: string;
  tagline: string;
  summary: string;
  /** What the verb does to server state, in one blunt sentence. */
  mutates: string;
  properties: Record<MethodProperty, boolean>;
  statusTypical: string;
  path: string;
  requestBody: string | null;
  responsePreview: string;
  /** Playground deep-link — only for verbs the lab can fire. */
  playgroundHref: string | null;
  demo: MethodDemoConfig;
  /** Optional alternate demos under the same method tab. */
  variants?: readonly MethodLessonVariant[];
};

/** Lesson fields that change when a variant is selected. */
export type ResolvedHttpMethodLesson = Omit<HttpMethodLesson, "variants" | "title" | "tagline"> & {
  title: string;
  tagline: string;
  activeVariantId: string | null;
};

export function resolveLessonVariant(
  lesson: HttpMethodLesson,
  variantId: string | null,
): ResolvedHttpMethodLesson {
  const variant =
    variantId && lesson.variants
      ? (lesson.variants.find((entry) => entry.id === variantId) ?? null)
      : null;

  return {
    method: lesson.method,
    title: variant?.title ?? lesson.title,
    tagline: variant?.tagline ?? lesson.tagline,
    summary: lesson.summary,
    mutates: lesson.mutates,
    properties: lesson.properties,
    statusTypical: lesson.statusTypical,
    path: variant?.path ?? lesson.path,
    requestBody: lesson.requestBody,
    responsePreview: variant?.responsePreview ?? lesson.responsePreview,
    playgroundHref: lesson.playgroundHref,
    demo: variant?.demo ?? lesson.demo,
    activeVariantId: variant?.id ?? null,
  };
}

/**
 * Student-facing curriculum for all nine HTTP methods.
 * Colours stay on methodToneClass / --method-* tokens.
 */
export const httpMethodLessons: readonly HttpMethodLesson[] = [
  {
    method: "GET",
    title: "Read a resource",
    tagline: "Fetch a collection or one resource.",
    summary:
      "Asks the server for a copy of a resource. Same verb, two common shapes: the whole collection (`GET /items`) or one row (`GET /items/:id`). Caches and browsers treat GET as a pure read — never put side effects here.",
    mutates: "Does not change the shelf. Response carries the body.",
    properties: { safe: true, idempotent: true, hasBody: false },
    statusTypical: "200 OK",
    path: "/items/2",
    requestBody: null,
    responsePreview: `{
  "statusCode": 200,
  "data": { "id": 2, "name": "Beta", "stock": 4 },
  "message": "OK",
  "success": true
}`,
    playgroundHref: "/playground?domain=kitchen-sink",
    demo: {
      kind: "read",
      steps: [
        "1 · Client sends GET /items/2",
        "2 · Server finds item #2",
        "3 · Shelf stays the same",
        "4 · One object returns",
      ],
      focusId: 2,
      outcome: "Shelf unchanged — you got a copy of Beta only.",
    },
    variants: [
      {
        id: "all",
        label: "Get all",
        title: "Read a collection",
        tagline: "Fetch every item on the shelf.",
        path: "/items",
        responsePreview: `{
  "statusCode": 200,
  "data": [
    { "id": 1, "name": "Alpha", "stock": 12 },
    { "id": 2, "name": "Beta", "stock": 4 },
    { "id": 3, "name": "Gamma", "stock": 9 }
  ],
  "message": "OK",
  "success": true
}`,
        demo: {
          kind: "read",
          steps: [
            "1 · Client sends GET /items",
            "2 · Server scans the whole shelf",
            "3 · Shelf stays the same",
            "4 · Array of all items returns",
          ],
          focusId: "all",
          outcome: "Shelf unchanged — you got a copy of every item.",
        },
      },
      {
        id: "one",
        label: "Get by ID",
        title: "Read a resource",
        tagline: "Fetch one item by id.",
        path: "/items/2",
        responsePreview: `{
  "statusCode": 200,
  "data": { "id": 2, "name": "Beta", "stock": 4 },
  "message": "OK",
  "success": true
}`,
        demo: {
          kind: "read",
          steps: [
            "1 · Client sends GET /items/2",
            "2 · Server finds item #2",
            "3 · Shelf stays the same",
            "4 · One object returns",
          ],
          focusId: 2,
          outcome: "Shelf unchanged — you got a copy of Beta only.",
        },
      },
    ],
  },
  {
    method: "HEAD",
    title: "Headers only",
    tagline: "Same as GET, without the body.",
    summary:
      "Like GET, but the server returns headers only — no response body. Useful to check size, ETag, or existence without downloading the payload.",
    mutates: "Does not change the shelf. Response has headers, empty body.",
    properties: { safe: true, idempotent: true, hasBody: false },
    statusTypical: "200 OK",
    path: "/api/v1/kitchen-sink/http-methods/head",
    requestBody: null,
    responsePreview: `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 420
ETag: W/"praxis-head-420"

(no body)`,
    playgroundHref: "/playground?domain=kitchen-sink",
    demo: {
      kind: "headers-only",
      steps: [
        "1 · Client sends HEAD",
        "2 · Server finds item #2",
        "3 · Shelf stays the same",
        "4 · Headers return — no body",
      ],
      focusId: 2,
      outcome: "Shelf unchanged — only metadata came back.",
    },
  },
  {
    method: "POST",
    title: "Create a resource",
    tagline: "Submit new data. Expect a new identity.",
    summary:
      "Sends a payload the server will process — usually creating a row. Repeating the same POST often creates duplicates.",
    mutates: "Adds a new item to the shelf.",
    properties: { safe: false, idempotent: false, hasBody: true },
    statusTypical: "201 Created",
    path: "/api/v1/kitchen-sink/http-methods/post",
    requestBody: `{ "name": "Delta", "stock": 1 }`,
    responsePreview: `{
  "statusCode": 201,
  "data": { "id": 4, "name": "Delta", "stock": 1 },
  "message": "Created",
  "success": true
}`,
    playgroundHref: "/playground?domain=kitchen-sink",
    demo: {
      kind: "create",
      steps: [
        "1 · Client sends POST + body",
        "2 · Server accepts the payload",
        "3 · New item Delta appears",
        "4 · 201 Created returns",
      ],
      focusId: "new",
      outcome: "A fourth item — Delta — is now on the shelf.",
    },
  },
  {
    method: "PUT",
    title: "Replace a resource",
    tagline: "Overwrite the whole document.",
    summary:
      "Sends a complete replacement for the target. Missing fields are gone — the body is the new truth for that URI.",
    mutates: "Replaces the entire focused item.",
    properties: { safe: false, idempotent: true, hasBody: true },
    statusTypical: "200 OK",
    path: "/api/v1/kitchen-sink/http-methods/put",
    requestBody: `{ "name": "Beta", "stock": 99 }`,
    responsePreview: `{
  "statusCode": 200,
  "data": { "id": 2, "name": "Beta", "stock": 99 },
  "message": "Replaced",
  "success": true
}`,
    playgroundHref: "/playground?domain=kitchen-sink",
    demo: {
      kind: "replace",
      steps: [
        "1 · Client sends PUT + full body",
        "2 · Server targets item #2",
        "3 · Entire item is replaced",
        "4 · Updated resource returns",
      ],
      focusId: 2,
      outcome: "Beta was replaced in full — stock is now 99.",
    },
  },
  {
    method: "PATCH",
    title: "Partial update",
    tagline: "Change only what you send.",
    summary:
      "Applies a delta: only listed fields move. Unlike PUT, PATCH is not idempotent by default — depends on the patch format.",
    mutates: "Updates selected fields; other fields stay put.",
    properties: { safe: false, idempotent: false, hasBody: true },
    statusTypical: "200 OK",
    path: "/api/v1/kitchen-sink/http-methods/patch",
    requestBody: `{ "stock": 7 }`,
    responsePreview: `{
  "statusCode": 200,
  "data": { "id": 2, "name": "Beta", "stock": 7 },
  "message": "Patched",
  "success": true
}`,
    playgroundHref: "/playground?domain=kitchen-sink",
    demo: {
      kind: "patch",
      steps: [
        "1 · Client sends PATCH + delta",
        "2 · Server targets item #2",
        "3 · Only stock changes",
        "4 · Patched resource returns",
      ],
      focusId: 2,
      outcome: "Only stock changed (4 → 7). Name stayed Beta.",
    },
  },
  {
    method: "DELETE",
    title: "Remove a resource",
    tagline: "Delete the target URI.",
    summary:
      "Asks the server to remove the resource. A second DELETE should not recreate it — that's idempotency.",
    mutates: "Removes the focused item from the shelf.",
    properties: { safe: false, idempotent: true, hasBody: false },
    statusTypical: "200 / 204",
    path: "/api/v1/kitchen-sink/http-methods/delete",
    requestBody: null,
    responsePreview: `{
  "statusCode": 200,
  "data": { "id": 2, "deleted": true },
  "message": "Deleted",
  "success": true
}`,
    playgroundHref: "/playground?domain=kitchen-sink",
    demo: {
      kind: "remove",
      steps: [
        "1 · Client sends DELETE",
        "2 · Server targets item #2",
        "3 · Beta is removed",
        "4 · Confirmation returns",
      ],
      focusId: 2,
      outcome: "Beta is gone from the shelf.",
    },
  },
  {
    method: "OPTIONS",
    title: "Ask what is allowed",
    tagline: "Discover allowed methods for a URI.",
    summary:
      "Asks the server which methods are allowed on this path (CORS preflight is the common case). Does not fetch or mutate the resource.",
    mutates: "Does not change the shelf. Response lists allowed verbs.",
    properties: { safe: true, idempotent: true, hasBody: false },
    statusTypical: "200 OK",
    path: "/api/v1/kitchen-sink/http-methods/options",
    requestBody: null,
    responsePreview: `{
  "statusCode": 200,
  "data": {
    "method": "OPTIONS",
    "allow": ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "TRACE", "CONNECT"]
  },
  "message": "OPTIONS request",
  "success": true
}`,
    playgroundHref: "/playground?domain=kitchen-sink",
    demo: {
      kind: "capabilities",
      steps: [
        "1 · Client asks OPTIONS",
        "2 · Server inspects the route",
        "3 · Shelf stays untouched",
        "4 · Allowed methods list returns",
      ],
      focusId: null,
      outcome: "No data moved — you learned what verbs this URI accepts.",
    },
  },
  {
    method: "TRACE",
    title: "Echo the request",
    tagline: "Diagnostics — see what proxies saw.",
    summary:
      "Asks intermediate proxies to echo the received request back. Rare in modern APIs; often disabled for security. Safe and idempotent, but almost never used in apps.",
    mutates: "Does not change the shelf. Response mirrors the request.",
    properties: { safe: true, idempotent: true, hasBody: false },
    statusTypical: "200 OK",
    path: "/api/v1/kitchen-sink/http-methods/trace",
    requestBody: null,
    responsePreview: `HTTP/1.1 200 OK
Content-Type: message/http

TRACE /api/v1/kitchen-sink/http-methods/trace HTTP/1.1
Host: localhost:8000
…`,
    playgroundHref: "/playground?domain=kitchen-sink",
    demo: {
      kind: "echo",
      steps: [
        "1 · Client sends TRACE",
        "2 · Packet reaches the server",
        "3 · Shelf stays untouched",
        "4 · Request is echoed back",
      ],
      focusId: null,
      outcome: "Shelf unchanged — you got your own request reflected.",
    },
  },
  {
    method: "CONNECT",
    title: "Open a tunnel",
    tagline: "Proxy switch for HTTPS / websockets.",
    summary:
      "Asks a proxy to open a raw TCP tunnel to a target host (how HTTPS through HTTP proxies works). Not a resource CRUD verb — you will almost never send CONNECT from app code.",
    mutates: "Does not touch the shelf. Opens a tunnel through a proxy.",
    properties: { safe: false, idempotent: false, hasBody: false },
    statusTypical: "200 OK (simulated)",
    path: "/api/v1/kitchen-sink/http-methods/connect",
    requestBody: null,
    responsePreview: `{
  "statusCode": 200,
  "data": {
    "method": "CONNECT",
    "tunnel": { "established": true, "target": "localhost:8000" }
  },
  "message": "CONNECT request (simulated tunnel)",
  "success": true
}`,
    playgroundHref: "/playground?domain=kitchen-sink",
    demo: {
      kind: "tunnel",
      steps: [
        "1 · Client asks CONNECT",
        "2 · Proxy opens a tunnel",
        "3 · Shelf is irrelevant here",
        "4 · Tunnel stays open",
      ],
      focusId: null,
      outcome: "No shelf change — a pipe opened through the proxy.",
    },
  },
] as const;

export function lessonHasPlayground(lesson: Pick<HttpMethodLesson, "method" | "playgroundHref">): boolean {
  return lesson.playgroundHref !== null && isPlaygroundHttpMethod(lesson.method);
}

/** Soft chip / panel surfaces keyed by verb. */
export const methodSoftClass: Record<HttpMethod, string> = {
  GET: "bg-method-get/12 border-method-get/35",
  HEAD: "bg-method-head/12 border-method-head/35",
  POST: "bg-method-post/12 border-method-post/35",
  PUT: "bg-method-put/12 border-method-put/35",
  PATCH: "bg-method-patch/12 border-method-patch/35",
  DELETE: "bg-method-delete/12 border-method-delete/35",
  OPTIONS: "bg-method-options/12 border-method-options/35",
  TRACE: "bg-method-trace/12 border-method-trace/35",
  CONNECT: "bg-method-connect/12 border-method-connect/35",
};

export const methodPropertyLabels: Record<MethodProperty, { label: string; hint: string }> = {
  safe: {
    label: "Safe",
    hint: "Must not change server state. GET, HEAD, OPTIONS, TRACE.",
  },
  idempotent: {
    label: "Idempotent",
    hint: "Same request N times = same server effect as once.",
  },
  hasBody: {
    label: "Body",
    hint: "Typically carries a JSON payload in the request.",
  },
};
