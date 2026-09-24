import docsManifest from "@/generated/docs-manifest.json";

export type DocsFrontmatter = {
  title: string;
  description: string;
  /** Optional override for sidebar label */
  navTitle?: string;
};

export type DocsHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type DocsDocument = {
  slug: string[];
  href: string;
  frontmatter: DocsFrontmatter;
  body: string;
  headings: DocsHeading[];
};

const DOCUMENTS: DocsDocument[] = docsManifest as DocsDocument[];

export function getAllDocsDocuments(): DocsDocument[] {
  return DOCUMENTS;
}

export function getDocsDocument(slug: string[]): DocsDocument | null {
  const key = slug.join("/");
  return DOCUMENTS.find((doc) => doc.slug.join("/") === key) ?? null;
}
