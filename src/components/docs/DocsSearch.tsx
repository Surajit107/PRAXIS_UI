"use client";

import MiniSearch from "minisearch";
import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { DocsSearchRecord } from "@/lib/docs/search-index";

type DocsSearchProps = {
  records: DocsSearchRecord[];
  /** Compact control for the docs header; default fills available width. */
  variant?: "default" | "nav";
};

export function DocsSearch({ records, variant = "default" }: DocsSearchProps) {
  const router = useRouter();
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const isNav = variant === "nav";

  const index = useMemo(() => {
    const mini = new MiniSearch<DocsSearchRecord>({
      fields: ["title", "description", "headings"],
      storeFields: ["title", "description", "href"],
      searchOptions: { boost: { title: 3, description: 1.5 }, fuzzy: 0.2, prefix: true },
    });
    mini.addAll(records);
    return mini;
  }, [records]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [] as Array<DocsSearchRecord & { score: number }>;
    return index.search(q).slice(0, 8).map((hit) => {
      const stored = index.getStoredFields(hit.id) as
        | Partial<DocsSearchRecord>
        | null
        | undefined;
      return {
        id: String(hit.id),
        title: stored?.title ?? String(hit.id),
        description: stored?.description ?? "",
        href: stored?.href ?? String(hit.id),
        headings: stored?.headings ?? "",
        score: hit.score,
      };
    });
  }, [index, query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById(inputId)?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputId]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div
      ref={rootRef}
      className={isNav ? "relative w-full" : "relative w-full max-w-md"}
    >
      <label htmlFor={inputId} className="sr-only">
        Search documentation
      </label>
      <div
        className={`flex items-center gap-2 border bg-surface focus-within:border-border-strong ${
          isNav
            ? "rounded-full border-white/[0.1] px-3 py-1.5"
            : "rounded-[var(--radius-sm)] border-border px-3 py-2"
        }`}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
        <input
          id={inputId}
          type="text"
          role="searchbox"
          value={query}
          autoComplete="off"
          spellCheck={false}
          placeholder="Search docs…"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && results.length > 0}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (event.key === "Enter" && results[active]) {
              event.preventDefault();
              go(results[active]!.href);
            }
          }}
          className="docs-search-input w-full appearance-none border-0 bg-transparent text-sm text-foreground shadow-none outline-none ring-0 placeholder:text-subtle focus:border-0 focus:outline-none focus:ring-0"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="rounded p-0.5 text-subtle hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:inline">
            ⌘K
          </kbd>
        )}
      </div>
      {open && query.trim() ? (
        <ul
          id={listId}
          role="listbox"
          className={`scrollbar-thin absolute z-40 mt-2 max-h-80 w-full overflow-auto rounded-[var(--radius-md)] border border-border bg-surface-2 p-1 shadow-lg ${
            isNav ? "right-0 min-w-[18rem]" : ""
          }`}
        >
          {results.length === 0 ? (
            <li className="px-3 py-4 text-sm text-muted">No results</li>
          ) : (
            results.map((result, index) => (
              <li key={result.id} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(result.href)}
                  className={`flex w-full flex-col gap-0.5 rounded-[var(--radius-sm)] px-3 py-2 text-left ${
                    index === active ? "bg-accent-soft" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-sm font-medium text-foreground">
                    {result.title}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted">
                    {result.description}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
