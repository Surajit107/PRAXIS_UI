import { CopyButton } from "@/components/ui/CopyButton";
import { JsonHighlight, isJsonLanguage } from "@/components/ui/JsonHighlight";

type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
};

/**
 * Server-rendered code frame with copy control.
 * JSON fences use shared JsonHighlight; other languages stay plain monospace
 * (Shiki skipped — Turbopack junctions fail on this volume).
 */
export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const trimmed = code.trimEnd();
  const label = filename ?? language ?? "code";
  const highlightJson = isJsonLanguage(language);

  return (
    <div className="docs-code group relative my-5 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-2">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-3 py-1.5">
        <span className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
          {label}
        </span>
        <CopyButton value={trimmed} label="Copy code" />
      </div>
      <pre className="m-0 min-w-0 overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-relaxed text-foreground">
        {highlightJson ? <JsonHighlight source={trimmed} /> : <code>{trimmed}</code>}
      </pre>
    </div>
  );
}
