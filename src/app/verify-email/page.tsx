import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailClient } from "@/components/auth/VerifyEmailClient";
import { VerifyEmailResult } from "@/components/auth/VerifyEmailResult";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Confirm your Praxis account email address.",
};

/** Single standalone verification page — `?token=` or `?status=`. */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailResult state={{ kind: "loading" }} />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
