import type { DocsHeading } from "@/lib/docs/content";

type DocsTocProps = {
  headings: DocsHeading[];
};

export function DocsToc({ headings }: DocsTocProps) {
  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
        On this page
      </p>
      <ul className="space-y-1 border-l border-white/[0.08]">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`-ml-px block border-l border-transparent text-[13px] text-muted transition-colors hover:border-white/25 hover:text-foreground ${
                heading.level === 3 ? "pl-5" : "pl-3"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
