import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordClient } from "@/components/auth/ForgotPasswordClient";
import { AuthStandaloneShell } from "@/components/auth/AuthStandaloneShell";
import { LoaderCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request or complete a Praxis password reset.",
};

/** Single standalone page — request (`/forgot-password`) or reset (`?token=`). */
export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthStandaloneShell
          eyebrow="Password reset"
          title="Loading"
          icon={<LoaderCircle className="h-8 w-8 animate-spin" strokeWidth={2} />}
          iconTone="pending"
        >
          <p className="text-center text-sm text-muted">Please wait…</p>
        </AuthStandaloneShell>
      }
    >
      <ForgotPasswordClient />
    </Suspense>
  );
}
