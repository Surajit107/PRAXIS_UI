import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

export type DocsFrontmatter = {
  title: string;
  description: string;
  /** Optional override for sidebar label */
  navTitle?: string;
};

export type DocsDocument = {
  slug: string[];
  href: string;
  frontmatter: DocsFrontmatter;
  body: string;
  headings: DocsHeading[];
};

export type DocsHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugToHref(slug: string[]): string {
  return slug.length === 0 ? "/docs" : `/docs/${slug.join("/")}`;
}

function filePathToSlug(filePath: string): string[] {
  const relative = path.relative(CONTENT_DIR, filePath).replace(/\\/g, "/");
  const withoutExt = relative.replace(/\.mdx$/, "");
  if (withoutExt === "introduction") return [];
  return withoutExt.split("/");
}

function extractHeadings(body: string): DocsHeading[] {
  const headings: DocsHeading[] = [];
  const re = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    const level = match[1]!.length as 2 | 3;
    const text = match[2]!.replace(/`/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }
  return headings;
}

function walkMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMdxFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(full);
    }
  }
  return files;
}

export function getAllDocsDocuments(): DocsDocument[] {
  return walkMdxFiles(CONTENT_DIR)
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      const frontmatter = data as DocsFrontmatter;
      if (!frontmatter.title || !frontmatter.description) {
        throw new Error(`Missing title/description in ${filePath}`);
      }
      const slug = filePathToSlug(filePath);
      return {
        slug,
        href: slugToHref(slug),
        frontmatter,
        body: content,
        headings: extractHeadings(content),
      };
    })
    .sort((a, b) => a.href.localeCompare(b.href));
}

export function getDocsDocument(slug: string[]): DocsDocument | null {
  const key = slug.join("/");
  return (
    getAllDocsDocuments().find((doc) => doc.slug.join("/") === key) ?? null
  );
}
