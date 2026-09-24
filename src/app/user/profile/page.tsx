import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthStandaloneShell } from "@/components/auth/AuthStandaloneShell";
import { UserProfileClient } from "@/components/auth/UserProfileClient";
import { LoaderCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile",
  description: "Praxis SSO landing and session for app-domain practice.",
};

/** Single standalone SSO / profile page. */
export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <AuthStandaloneShell
          eyebrow="Account"
          title="Loading session"
          icon={<LoaderCircle className="h-8 w-8 animate-spin" strokeWidth={2} />}
          iconTone="pending"
        >
          <p className="text-center text-sm text-muted">Please wait…</p>
        </AuthStandaloneShell>
      }
    >
      <UserProfileClient />
    </Suspense>
  );
}
