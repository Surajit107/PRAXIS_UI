import { getAllDocsDocuments } from "@/lib/docs/content";
import { flattenDocsNav } from "@/lib/docs/navigation";

export type DocsSearchRecord = {
  id: string;
  title: string;
  description: string;
  href: string;
  headings: string;
};

/** Flat records for MiniSearch — built on the server, serialized to the client. */
export function buildDocsSearchRecords(): DocsSearchRecord[] {
  const mdx = getAllDocsDocuments().map((doc) => ({
    id: doc.href,
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    href: doc.href,
    headings: doc.headings.map((h) => h.text).join(" "),
  }));

  const apiNav = flattenDocsNav().find((item) => item.href === "/docs/api");
  if (apiNav) {
    mdx.push({
      id: "/docs/api",
      title: apiNav.title,
      description:
        "Interactive OpenAPI reference — every route, schema, and Try It console.",
      href: "/docs/api",
      headings: "openapi scalar endpoints schemas try it",
    });
  }

  return mdx;
}
