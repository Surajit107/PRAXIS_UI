import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { CodeTabs } from "@/components/docs/CodeTabs";
import { SmartLink } from "@/components/ui/SmartLink";

function getText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode };
    return getText(props.children);
  }
  return "";
}

function Pre(props: ComponentPropsWithoutRef<"pre">) {
  const child = Array.isArray(props.children)
    ? props.children[0]
    : props.children;

  if (child && typeof child === "object" && "props" in child) {
    const codeProps = child.props as {
      className?: string;
      children?: ReactNode;
    };
    const className = codeProps.className ?? "";
    const language = /language-([\w-]+)/.exec(className)?.[1] ?? "text";
    const code = getText(codeProps.children).replace(/\n$/, "");
    return <CodeBlock code={code} language={language} />;
  }

  return (
    <pre className="my-5 overflow-x-auto rounded-[var(--radius-md)] border border-border bg-surface-2 p-4 font-mono text-[13px]">
      {props.children}
    </pre>
  );
}

function Callout({
  type = "note",
  children,
}: {
  type?: "note" | "warning";
  children: ReactNode;
}) {
  const styles =
    type === "warning"
      ? "border-method-put/40 bg-method-put/10"
      : "border-accent-border bg-accent-soft";
  return (
    <aside
      className={`my-5 rounded-[var(--radius-md)] border px-4 py-3 text-sm text-foreground ${styles}`}
    >
      {children}
    </aside>
  );
}

export const mdxComponents: MDXComponents = {
  CodeTabs,
  Callout,
  a: ({ href = "", children }) => (
    <SmartLink
      href={href}
      prefetch={false}
      className="font-medium text-accent underline-offset-4 hover:underline"
    >
      {children}
    </SmartLink>
  ),
  h1: ({ children, ...rest }) => (
    <h1
      className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground"
      {...rest}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...rest }) => (
    <h2
      className="mt-10 scroll-mt-24 border-b border-hairline pb-2 font-display text-xl font-semibold text-foreground"
      {...rest}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...rest }) => (
    <h3
      className="mt-8 scroll-mt-24 font-display text-lg font-semibold text-foreground"
      {...rest}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...rest }) => (
    <p className="mt-4 text-[15px] leading-relaxed text-muted" {...rest}>
      {children}
    </p>
  ),
  ul: ({ children, ...rest }) => (
    <ul
      className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-muted"
      {...rest}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...rest }) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-5 text-[15px] text-muted"
      {...rest}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...rest }) => (
    <li className="leading-relaxed [&>p]:mt-0" {...rest}>
      {children}
    </li>
  ),
  strong: ({ children, ...rest }) => (
    <strong className="font-semibold text-foreground" {...rest}>
      {children}
    </strong>
  ),
  code: ({ className, children, ...rest }) => {
    // Fenced blocks are handled by `pre` → CodeBlock; skip chrome on those.
    if (typeof className === "string" && className.includes("language-")) {
      return (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-foreground"
        {...rest}
      >
        {children}
      </code>
    );
  },
  pre: Pre,
  table: ({ children, ...rest }) => (
    <div className="my-5 overflow-x-auto rounded-[var(--radius-md)] border border-border">
      <table className="w-full border-collapse text-left text-sm" {...rest}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...rest }) => (
    <thead className="bg-surface-2 text-foreground" {...rest}>
      {children}
    </thead>
  ),
  th: ({ children, ...rest }) => (
    <th
      className="border-b border-border px-3 py-2 font-medium"
      {...rest}
    >
      {children}
    </th>
  ),
  td: ({ children, ...rest }) => (
    <td className="border-b border-hairline px-3 py-2 text-muted" {...rest}>
      {children}
    </td>
  ),
  blockquote: ({ children, ...rest }) => (
    <blockquote
      className="my-5 border-l-2 border-accent pl-4 text-[15px] text-muted"
      {...rest}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-hairline" />,
};
