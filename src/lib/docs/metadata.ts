import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export function docsPageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = `${SITE_URL}${input.path}`;
  const title = input.title;
  return {
    title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${siteConfig.name}`,
      description: input.description,
      url: canonical,
      siteName: siteConfig.name,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${title} · ${siteConfig.name}`,
      description: input.description,
    },
  };
}

export function absoluteSiteUrl(path = ""): string {
  return `${SITE_URL}${path}`;
}
