import type { Metadata } from "next";
import { ApiTryClient } from "@/components/docs/ApiTryClient";
import { docsPageMetadata } from "@/lib/docs/metadata";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = docsPageMetadata({
  title: "Test request",
  description: "Send a live request against the Praxis API.",
  path: "/docs/try",
});

type PageProps = {
  searchParams: Promise<{ method?: string; path?: string }>;
};

export default async function DocsTryPage({ searchParams }: PageProps) {
  const { method, path } = await searchParams;

  return (
    <ApiTryClient
      key={`${method ?? ""}:${path ?? ""}`}
      initialMethod={method}
      initialPath={path}
    />
  );
}
