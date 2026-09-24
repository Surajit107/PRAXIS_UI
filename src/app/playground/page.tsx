import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlaygroundClient } from "@/components/playground/PlaygroundClient";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Playground",
  description: `Live multi-domain ${siteConfig.name} playground.`,
};

type PlaygroundPageProps = {
  searchParams: Promise<{ domain?: string; code?: string }>;
};

export default async function PlaygroundPage({ searchParams }: PlaygroundPageProps) {
  const { domain, code } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Live playground"
        title={`Hit ${siteConfig.name} for real`}
        description="Real fetches against the live API — pick a domain, tweak the path, and copy the request into your own code."
        actions={
          <Button href="/docs" variant="secondary" size="sm" icon={BookOpen} trailingArrow newTab>
            API reference
          </Button>
        }
      />
      <PlaygroundClient key={`${domain ?? ""}:${code ?? ""}`} initialDomain={domain} initialCode={code} />
    </>
  );
}
