"use client";

import dynamic from "next/dynamic";

const ScalarReference = dynamic(
  () =>
    import("@/components/docs/ScalarReference").then((mod) => mod.ScalarReference),
  {
    ssr: false,
    loading: () => (
      <p className="px-1 py-16 text-sm text-muted">Loading API reference…</p>
    ),
  },
);

export function ScalarReferenceLoader() {
  return <ScalarReference />;
}
