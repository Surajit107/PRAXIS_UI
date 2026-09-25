"use client";

import { AnimatePresence, m } from "motion/react";
import { Clock, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { JsonHighlight } from "@/components/ui/JsonHighlight";
import { Select, type SelectOption } from "@/components/ui/Select";
import { useResolvedApiDisplayOrigin } from "@/hooks/useResolvedApiUrls";
import {
  domains,
  getApiBaseUrl,
  isPlaygroundHttpMethod,
  kitchenSinkActions,
  methodToneClass,
  playgroundHttpMethods,
  resolveBrowserFetchMethod,
  statusCodePath,
  statusToneClass,
  type PlaygroundHttpMethod,
} from "@/lib/praxis";

type DomainId = (typeof domains)[number]["id"];

type Preset = { label: string; path: string; method: PlaygroundHttpMethod };

type RequestResult =
  | { kind: "idle" }
  | { kind: "success"; id: number; status: number; durationMs: number; body: string }
  | { kind: "error"; id: number; message: string };

type SnippetId = "curl" | "fetch" | "axios";

const SNIPPET_TABS: readonly { id: SnippetId; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "fetch", label: "fetch" },
  { id: "axios", label: "axios" },
];

const methodOptions: readonly SelectOption<PlaygroundHttpMethod>[] = playgroundHttpMethods.map(
  (method) => ({
    value: method,
    label: method,
    toneClass: `font-mono text-[13px] font-semibold ${methodToneClass[method]}`,
  }),
);

function isDomainId(value: string | undefined): value is DomainId {
  return domains.some((item) => item.id === value);
}

function resolveDomain(value: string | undefined): DomainId {
  return isDomainId(value) ? value : "public";
}

function getPresets(domain: DomainId): Preset[] {
  if (domain === "kitchen-sink") {
    return kitchenSinkActions.map(({ title, path, method }) => ({ label: title, path, method }));
  }
  const selected = domains.find((item) => item.id === domain);
  return (selected?.samples ?? []).map((sample) => {
    const [method, path] = sample.split(" ");
    return { label: path, path, method: isPlaygroundHttpMethod(method) ? method : "GET" };
  });
}

function resolveInitialRequest(domain: DomainId, code: string | undefined): Preset {
  const status = Number(code);
  if (domain === "kitchen-sink" && Number.isInteger(status) && status >= 100 && status <= 599) {
    return { label: `Status ${status}`, path: statusCodePath(status), method: "GET" };
  }
  return getPresets(domain)[0];
}

/** Fetch forbids TRACE/CONNECT — playground uses GET aliases on the same paths. */
function buildSnippets(method: PlaygroundHttpMethod, url: string): Record<SnippetId, string> {
  const fetchMethod = resolveBrowserFetchMethod(method);
  const fetchNote =
    fetchMethod !== method
      ? `\n// Note: browsers forbid ${method}; playground uses GET on this path. Prefer curl for the real verb.`
      : "";

  return {
    curl: `curl -X ${method} "${url}" \\\n  -H "Accept: application/json"`,
    fetch: `const res = await fetch("${url}", {\n  method: "${fetchMethod}",\n  headers: { Accept: "application/json" },\n});${fetchNote}\nconst data = await res.json();`,
    axios: `const { data } = await axios.request({\n  url: "${url}",\n  method: "${method.toLowerCase()}",\n  headers: { Accept: "application/json" },\n});`,
  };
}

async function readBody(response: Response): Promise<string> {
  const text = await response.text();
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text || "(empty response)";
  }
}

type PlaygroundProps = {
  initialDomain?: string;
  initialCode?: string;
};

export function PlaygroundClient({ initialDomain, initialCode }: PlaygroundProps) {
  const fetchBaseUrl = useMemo(() => getApiBaseUrl(), []);
  // Paths already include `/api/v1/...` — use origin/proxy prefix only (not `…/api/v1`).
  const displayBaseUrl = useResolvedApiDisplayOrigin();
  const [domain, setDomain] = useState<DomainId>(() => resolveDomain(initialDomain));
  const [request, setRequest] = useState<Preset>(() => resolveInitialRequest(resolveDomain(initialDomain), initialCode));
  const [result, setResult] = useState<RequestResult>({ kind: "idle" });
  const [pending, setPending] = useState(false);
  const [snippet, setSnippet] = useState<SnippetId>("curl");

  const controllerRef = useRef<AbortController | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const presets = useMemo(() => getPresets(domain), [domain]);
  const fetchUrl = `${fetchBaseUrl}${request.path}`;
  const displayUrl = `${displayBaseUrl}${request.path}`;
  const snippets = useMemo(
    () => buildSnippets(request.method, displayUrl),
    [request.method, displayUrl],
  );

  function selectDomain(next: DomainId) {
    setDomain(next);
    setRequest(getPresets(next)[0]);
  }

  async function runRequest(event?: FormEvent) {
    event?.preventDefault();
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const id = ++requestSeq.current;

    setPending(true);
    const startedAt = performance.now();
    try {
      const response = await fetch(fetchUrl, {
        method: resolveBrowserFetchMethod(request.method),
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const body = await readBody(response);
      const headerLines = [...response.headers.entries()]
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      const displayBody =
        request.method === "HEAD"
          ? `(no body — HEAD)\n\n${headerLines || "(no response headers)"}`
          : body;
      setResult({
        kind: "success",
        id,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
        body: displayBody,
      });
    } catch (err) {
      if (controller.signal.aborted) return;
      setResult({
        kind: "error",
        id,
        message: err instanceof Error ? `${err.message} — is PRAXIS_API running at ${displayBaseUrl}?` : "Request failed.",
      });
    } finally {
      if (requestSeq.current === id) setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div role="tablist" aria-label="API domain" className="mb-6 inline-flex rounded-[var(--radius-md)] border border-border bg-surface p-1">
        {domains.map((item) => {
          const active = domain === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectDomain(item.id)}
              className={`relative rounded-[var(--radius-sm)] px-4 py-1.5 text-sm font-medium transition-colors ${
                active ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {active ? (
                <m.span
                  layoutId="domain-pill"
                  className="absolute inset-0 rounded-[var(--radius-sm)] border border-border-strong bg-surface-3"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              ) : null}
              <span className="relative">{item.title}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={runRequest} className="panel mb-6 flex flex-col gap-2 p-2 sm:flex-row sm:items-center">
        <Select
          label="HTTP method"
          value={request.method}
          options={methodOptions}
          onChange={(method) => setRequest((current) => ({ ...current, method }))}
          className="sm:w-[136px]"
          triggerClassName="border-transparent bg-surface-3"
        />
        <label className="flex h-10 min-w-0 flex-1 items-center rounded-[var(--radius-sm)] border border-border bg-background px-3 font-mono text-[13px] transition-colors focus-within:border-accent-border">
          <span className="sr-only">Request path</span>
          <span className="hidden shrink-0 text-subtle lg:inline">{displayBaseUrl}</span>
          <input
            value={request.path}
            onChange={(event) => setRequest((current) => ({ ...current, path: event.target.value }))}
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-subtle"
            placeholder="/api/v1/…"
          />
        </label>
        <Button type="submit" loading={pending} className="sm:w-auto">
          {!pending ? <Send aria-hidden className="h-4 w-4" /> : null}
          {pending ? "Sending" : "Send"}
        </Button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="panel flex max-h-[min(70vh,560px)] flex-col overflow-hidden p-2 lg:max-h-[calc(100vh-12rem)]">
          <p className="shrink-0 px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-[0.14em] text-subtle">Presets</p>
          <AnimatePresence mode="wait" initial={false}>
            <m.ul
              key={domain}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.18 }}
              className="scrollbar-overlay flex min-h-0 flex-1 flex-col overflow-y-auto"
            >
              {presets.map((preset) => {
                const active = preset.path === request.path && preset.method === request.method;
                return (
                  <li key={`${preset.method}-${preset.path}`}>
                    <button
                      type="button"
                      onClick={() => setRequest(preset)}
                      className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition-colors ${
                        active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className={`w-14 shrink-0 font-mono text-[11px] font-semibold ${methodToneClass[preset.method]}`}>
                        {preset.method}
                      </span>
                      <span className="min-w-0 truncate font-mono text-xs text-foreground/85">{preset.label}</span>
                    </button>
                  </li>
                );
              })}
            </m.ul>
          </AnimatePresence>
        </aside>

        <div className="min-w-0 space-y-6">
          <section aria-label="Response" className="panel min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="text-sm font-medium">Response</p>
              {result.kind === "success" ? (
                <span className="flex items-center gap-3 font-mono text-xs">
                  <span className="flex items-center gap-1 text-subtle">
                    <Clock aria-hidden className="h-3.5 w-3.5" />
                    {result.durationMs} ms
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 ${statusToneClass(result.status)}`}>{result.status}</span>
                </span>
              ) : null}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={result.kind === "idle" ? "idle" : result.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                {result.kind === "error" ? (
                  <p role="alert" className="break-words p-4 text-sm text-danger">
                    {result.message}
                  </p>
                ) : (
                  <pre className="scrollbar-thin max-h-[420px] min-h-[220px] min-w-0 overflow-y-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-foreground/90">
                    {result.kind === "success" ? (
                      <JsonHighlight source={result.body} />
                    ) : (
                      "Send a request to see a live response."
                    )}
                  </pre>
                )}
              </m.div>
            </AnimatePresence>
          </section>

          <section aria-label="Code snippets" className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pl-2 pr-2">
              <div role="tablist" aria-label="Snippet language" className="flex">
                {SNIPPET_TABS.map((tab) => {
                  const active = snippet === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSnippet(tab.id)}
                      className={`relative px-3 py-3 text-xs font-medium transition-colors ${
                        active ? "text-foreground" : "text-subtle hover:text-muted"
                      }`}
                    >
                      {tab.label}
                      {active ? (
                        <m.span layoutId="snippet-underline" className="absolute inset-x-2 -bottom-px h-px bg-accent" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <CopyButton value={snippets[snippet]} label={`Copy ${snippet} snippet`} />
            </div>
            <pre className="scrollbar-thin overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground/85">{snippets[snippet]}</pre>
          </section>
        </div>
      </div>
    </div>
  );
}
