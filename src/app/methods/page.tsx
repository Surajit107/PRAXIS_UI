import { BookOpen, Terminal } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { MethodsExplorer } from "@/components/methods/MethodsExplorer";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "HTTP Methods",
  description: `Learn all nine HTTP methods — GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, TRACE, CONNECT — with slow animated demos for ${siteConfig.name} students.`,
};

export default function MethodsPage() {
  return (
    <>
      <PageHeader
        eyebrow="HTTP fundamentals"
        title="All nine verbs, explained slowly"
        description="GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, TRACE, CONNECT. Watch each step hold — request, target, change, response — then try every verb live in the lab."
        actions={
          <>
            <Button href="/docs" variant="secondary" size="sm" icon={BookOpen} newTab>
              API reference
            </Button>
            <Button href="/playground?domain=kitchen-sink" size="sm" icon={Terminal} trailingArrow>
              Open lab
            </Button>
          </>
        }
      />
      <MethodsExplorer />
    </>
  );
}
