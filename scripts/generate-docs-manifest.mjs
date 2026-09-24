/**
 * Bake MDX docs into a JSON manifest at build time.
 * Cloudflare Workers cannot read `content/docs` via fs at request time;
 * Next's generateStaticParams must also not depend on a live filesystem walk
 * (empty/invalid params → /docs[[...slug]] never prerenders → production 404).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content", "docs");
const outDir = path.join(root, "src", "generated");
const outFile = path.join(outDir, "docs-manifest.json");

function walkMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
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

function filePathToSlug(filePath) {
  const relative = path.relative(contentDir, filePath).replace(/\\/g, "/");
  const withoutExt = relative.replace(/\.mdx$/, "");
  if (withoutExt === "introduction") return [];
  return withoutExt.split("/");
}

function slugToHref(slug) {
  return slug.length === 0 ? "/docs" : `/docs/${slug.join("/")}`;
}

function extractHeadings(body) {
  const headings = [];
  const re = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = re.exec(body)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/`/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }
  return headings;
}

const docs = walkMdxFiles(contentDir)
  .map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    if (!data.title || !data.description) {
      throw new Error(`Missing title/description in ${filePath}`);
    }
    const slug = filePathToSlug(filePath);
    return {
      slug,
      href: slugToHref(slug),
      frontmatter: {
        title: data.title,
        description: data.description,
        ...(data.navTitle ? { navTitle: data.navTitle } : {}),
      },
      body: content,
      headings: extractHeadings(content),
    };
  })
  .sort((a, b) => a.href.localeCompare(b.href));

if (docs.length === 0) {
  throw new Error(`No MDX docs found under ${contentDir}`);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(docs, null, 2)}\n`, "utf8");
console.log(`✓ docs-manifest.json — ${docs.length} pages`);
