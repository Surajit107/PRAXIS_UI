import type { MetadataRoute } from "next";
import { getAllDocsDocuments } from "@/lib/docs/content";
import { absoluteSiteUrl } from "@/lib/docs/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const marketing: MetadataRoute.Sitemap = [
    { url: absoluteSiteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteSiteUrl("/methods"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteSiteUrl("/playground"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const docsPages: MetadataRoute.Sitemap = getAllDocsDocuments().map((doc) => ({
    url: absoluteSiteUrl(doc.href),
    lastModified: now,
    changeFrequency: "weekly",
    priority: doc.href === "/docs" ? 0.9 : 0.7,
  }));

  docsPages.push({
    url: absoluteSiteUrl("/docs/api"),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  });

  return [...marketing, ...docsPages];
}
