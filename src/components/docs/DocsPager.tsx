import { ArrowLeft, ArrowRight } from "lucide-react";
import { SmartLink } from "@/components/ui/SmartLink";
import { getDocsPager } from "@/lib/docs/navigation";

type DocsPagerProps = {
  pathname: string;
};

export function DocsPager({ pathname }: DocsPagerProps) {
  const { prev, next } = getDocsPager(pathname);

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Documentation pagination"
      className="mt-14 grid gap-3 border-t border-hairline pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <SmartLink
          href={prev.href}
          className="group flex flex-col gap-1 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-2"
        >
          <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Previous
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-accent">
            {prev.title}
          </span>
        </SmartLink>
      ) : (
        <div />
      )}
      {next ? (
        <SmartLink
          href={next.href}
          className="group flex flex-col items-end gap-1 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-right transition-colors hover:border-border-strong hover:bg-surface-2"
        >
          <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
            Next
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-accent">
            {next.title}
          </span>
        </SmartLink>
      ) : null}
    </nav>
  );
}
