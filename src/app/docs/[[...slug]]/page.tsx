import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsBreadcrumbs } from "@/components/docs/DocsBreadcrumbs";
import { DocsPager } from "@/components/docs/DocsPager";
import { DocsToc } from "@/components/docs/DocsToc";
import { getAllDocsDocuments, getDocsDocument } from "@/lib/docs/content";
import { compileDocsMdx } from "@/lib/docs/mdx";
import { docsPageMetadata } from "@/lib/docs/metadata";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

/** Fully static — no Node fs at request time on Cloudflare Workers. */
export const dynamic = "force-static";
export const revalidate = false;

export function generateStaticParams() {
  return getAllDocsDocuments().map((doc) =>
    doc.slug.length === 0 ? {} : { slug: doc.slug },
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const doc = getDocsDocument(slug);
  if (!doc) return {};
  return docsPageMetadata({
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    path: doc.href,
  });
}

export default async function DocsSlugPage({ params }: PageProps) {
  const { slug = [] } = await params;

  if (slug[0] === "api") notFound();

  const doc = getDocsDocument(slug);
  if (!doc) notFound();

  const { content } = await compileDocsMdx(doc.body);

  return (
    <div className="flex gap-12 xl:gap-16">
      <article className="min-w-0 max-w-3xl flex-1">
        <DocsBreadcrumbs pathname={doc.href} />
        <div className="docs-prose">{content}</div>
        <DocsPager pathname={doc.href} />
      </article>
      <aside className="sticky top-[calc(3.5rem+1.5rem)] hidden h-fit w-48 shrink-0 xl:block">
        <DocsToc headings={doc.headings} />
      </aside>
    </div>
  );
}
