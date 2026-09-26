"use client";

import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { JsonHighlight } from "@/components/ui/JsonHighlight";
import { Select, type SelectOption } from "@/components/ui/Select";
import { SmartLink } from "@/components/ui/SmartLink";
import { useResolvedApiServerUrl } from "@/hooks/useResolvedApiUrls";
import {
  getApiBaseUrl,
  isPlaygroundHttpMethod,
  methodToneClass,
  playgroundHttpMethods,
  resolveBrowserFetchMethod,
  statusToneClass,
  type PlaygroundHttpMethod,
} from "@/lib/praxis";

const methodOptions: readonly SelectOption<PlaygroundHttpMethod>[] = playgroundHttpMethods.map(
  (method) => ({
    value: method,
    label: method,
    toneClass: `font-mono text-[13px] font-semibold ${methodToneClass[method]}`,
  }),
);

type ApiTryClientProps = {
  initialMethod?: string;
  initialPath?: string;
};

type Result =
  | { kind: "idle" }
  | { kind: "success"; status: number; durationMs: number; body: string }
  | { kind: "error"; message: string };

async function readBody(response: Response): Promise<string> {
  const text = await response.text();
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text || "(empty response)";
  }
}

export function ApiTryClient({ initialMethod, initialPath }: ApiTryClientProps) {
  const fetchBase = useMemo(() => getApiBaseUrl(), []);
  const displayBase = useResolvedApiServerUrl();
  const [method, setMethod] = useState<PlaygroundHttpMethod>(() =>
    isPlaygroundHttpMethod(initialMethod ?? "") ? (initialMethod as PlaygroundHttpMethod) : "GET",
  );
  // OpenAPI paths are relative to /api/v1 (e.g. /healthcheck).
  const [path, setPath] = useState(() =>
    initialPath?.startsWith("/") ? initialPath : initialPath ? `/${initialPath}` : "/healthcheck",
  );
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const [pending, setPending] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const autoRan = useRef(false);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function toProxyPath(rawPath: string): string {
    const normalized = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    // Path proxy hits API origin; OpenAPI paths need the /api/v1 prefix.
    if (normalized.startsWith("/api/v1")) return normalized;
    return `/api/v1${normalized}`;
  }

  async function runRequest(event?: FormEvent) {
    event?.preventDefault();
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setPending(true);
    const startedAt = performance.now();
    const url = `${fetchBase}${toProxyPath(path)}`;
    try {
      const response = await fetch(url, {
        method: resolveBrowserFetchMethod(method),
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const body = await readBody(response);
      const headerLines = [...response.headers.entries()]
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      const displayBody =
        method === "HEAD"
          ? `(no body — HEAD)\n\n${headerLines || "(no response headers)"}`
          : body;
      setResult({
        kind: "success",
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
        body: displayBody,
      });
    } catch (err) {
      if (controller.signal.aborted) return;
      setResult({
        kind: "error",
        message:
          err instanceof Error
            ? `${err.message} — is PRAXIS_API running at ${displayBase}?`
            : "Request failed.",
      });
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (autoRan.current) return;
    if (!initialPath) return;
    autoRan.current = true;
    void runRequest();
    // Intentionally once on mount when deep-linked from API Reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <SmartLink
        href="/docs/api"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to API Reference
      </SmartLink>

      <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">
        Test request
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        Runs against{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-foreground">
          {displayBase}
        </code>
        .
      </p>

      <form onSubmit={runRequest} className="panel mt-8 flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
        <Select
          label="HTTP method"
          value={method}
          options={methodOptions}
          onChange={setMethod}
          className="sm:w-[136px]"
          triggerClassName="border-transparent bg-surface-3"
        />
        <label className="flex h-10 min-w-0 flex-1 items-center rounded-[var(--radius-sm)] border border-border bg-background px-3 font-mono text-[13px] transition-colors focus-within:border-border-strong">
          <span className="sr-only">Request path</span>
          <span className="hidden shrink-0 text-subtle lg:inline">{displayBase}</span>
          <input
            value={path}
            onChange={(event) => setPath(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-subtle"
            placeholder="/healthcheck"
          />
        </label>
        <Button type="submit" loading={pending} className="w-full sm:w-auto">
          {!pending ? <Send aria-hidden className="h-4 w-4" /> : null}
          Send
        </Button>
      </form>

      <div className="panel mt-4 min-h-48 overflow-hidden">
        {result.kind === "idle" ? (
          <p className="p-5 text-sm text-muted">Send a request to see the response.</p>
        ) : null}
        {result.kind === "error" ? (
          <p className="p-5 text-sm text-method-delete">{result.message}</p>
        ) : null}
        {result.kind === "success" ? (
          <div>
            <div className="flex items-center gap-3 border-b border-hairline px-4 py-2.5 text-sm">
              <span
                className={`rounded border px-2 py-0.5 font-mono text-[12px] font-semibold ${statusToneClass(result.status)}`}
              >
                {result.status}
              </span>
              <span className="text-subtle">{result.durationMs} ms</span>
            </div>
            <pre className="scrollbar-thin max-h-[min(60vh,32rem)] min-w-0 overflow-y-auto whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed text-foreground/90">
              <JsonHighlight source={result.body} />
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
