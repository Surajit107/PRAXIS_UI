"use client";

import { useId, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { JsonHighlight, isJsonLanguage } from "@/components/ui/JsonHighlight";

export type CodeTabExample = {
  label: string;
  language: string;
  code: string;
};

type CodeTabsProps = {
  examples: CodeTabExample[];
};

export function CodeTabs({ examples }: CodeTabsProps) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const current = examples[active] ?? examples[0];
  if (!current) return null;

  return (
    <div className="my-5 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-2">
      <div
        role="tablist"
        aria-label="Code languages"
        className="flex flex-wrap items-center gap-1 border-b border-hairline px-2 py-1.5"
      >
        {examples.map((example, index) => {
          const selected = index === active;
          return (
            <button
              key={example.label}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              className={`rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium transition-colors ${
                selected
                  ? "bg-accent-soft text-foreground"
                  : "text-muted hover:bg-white/[0.04] hover:text-foreground"
              }`}
            >
              {example.label}
            </button>
          );
        })}
        <div className="ml-auto">
          <CopyButton value={current.code.trimEnd()} label="Copy code" />
        </div>
      </div>
      {examples.map((example, index) => {
        const trimmed = example.code.trimEnd();
        const highlightJson = isJsonLanguage(example.language);
        return (
          <div
            key={example.label}
            role="tabpanel"
            id={`${baseId}-panel-${index}`}
            aria-labelledby={`${baseId}-tab-${index}`}
            hidden={index !== active}
            className="overflow-x-auto p-4"
          >
            <pre className="m-0 min-w-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-foreground">
              {highlightJson ? <JsonHighlight source={trimmed} /> : <code>{trimmed}</code>}
            </pre>
          </div>
        );
      })}
    </div>
  );
}
