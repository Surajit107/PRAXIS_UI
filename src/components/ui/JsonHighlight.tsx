import type { ReactNode } from "react";
import { statusTextClass } from "@/lib/praxis";

/**
 * Shared JSON highlighter — safe for Server and Client Components.
 * Palette: keys → muted, strings → accent, bools → success, null → info,
 * numbers → method-post (statusCode values use statusTextClass).
 */
const JSON_TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\],]/g;

type JsonHighlightProps = {
  source: string;
};

export function isJsonLanguage(language: string | undefined): boolean {
  if (!language) return false;
  const normalized = language.toLowerCase();
  return normalized === "json" || normalized === "jsonc";
}

function looksLikeJson(source: string): boolean {
  const trimmed = source.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function highlightJson(source: string): ReactNode {
  if (!looksLikeJson(source)) return source;

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let pendingStatusCode = false;
  let nodeKey = 0;

  JSON_TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = JSON_TOKEN.exec(source)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(source.slice(lastIndex, match.index));
    }

    const [full, stringLiteral, colonAfter, keyword] = match;

    if (stringLiteral !== undefined) {
      if (colonAfter !== undefined) {
        let keyName = stringLiteral.slice(1, -1);
        try {
          keyName = JSON.parse(stringLiteral) as string;
        } catch {
          /* keep raw slice */
        }
        pendingStatusCode = keyName === "statusCode";
        nodes.push(
          <span key={nodeKey++}>
            <span className="text-muted">{stringLiteral}</span>
            <span className="text-subtle">{colonAfter}</span>
          </span>,
        );
      } else {
        pendingStatusCode = false;
        nodes.push(
          <span key={nodeKey++} className="text-accent">
            {stringLiteral}
          </span>,
        );
      }
    } else if (keyword !== undefined) {
      pendingStatusCode = false;
      nodes.push(
        <span key={nodeKey++} className={keyword === "null" ? "text-info" : "text-success"}>
          {keyword}
        </span>,
      );
    } else if (/^-?\d/.test(full)) {
      const tone = pendingStatusCode ? statusTextClass(Number(full)) : "text-method-post";
      pendingStatusCode = false;
      nodes.push(
        <span key={nodeKey++} className={tone}>
          {full}
        </span>,
      );
    } else {
      pendingStatusCode = false;
      nodes.push(
        <span key={nodeKey++} className="text-subtle">
          {full}
        </span>,
      );
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < source.length) {
    nodes.push(source.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : source;
}

export function JsonHighlight({ source }: JsonHighlightProps) {
  return <>{highlightJson(source)}</>;
}
