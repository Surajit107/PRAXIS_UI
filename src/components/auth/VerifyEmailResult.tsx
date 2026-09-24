"use client";

import { CheckCircle2, LoaderCircle, ShieldAlert, XCircle } from "lucide-react";
import { AuthStandaloneShell } from "@/components/auth/AuthStandaloneShell";

export type VerifyEmailViewState =
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type VerifyEmailResultProps = {
  state: VerifyEmailViewState;
};

/** Standalone verification result — no leave CTAs / redirects. */
export function VerifyEmailResult({ state }: VerifyEmailResultProps) {
  if (state.kind === "loading") {
    return (
      <AuthStandaloneShell
        eyebrow="Email verification"
        title="Verifying your email"
        icon={<LoaderCircle className="h-8 w-8 animate-spin" strokeWidth={2} />}
        iconTone="pending"
      >
        <p className="text-center text-[15px] text-muted">
          Confirming your link with Praxis. This usually takes a moment.
        </p>
      </AuthStandaloneShell>
    );
  }

  if (state.kind === "success") {
    return (
      <AuthStandaloneShell
        eyebrow="Email verification"
        title="Email verified"
        icon={<CheckCircle2 className="h-8 w-8" strokeWidth={2} />}
        iconTone="success"
      >
        <p className="text-center text-[15px] text-muted">
          {state.message || "Your Praxis account email is confirmed."}
        </p>
        <p className="mt-3 text-center text-sm text-subtle">
          You can close this tab and sign in with your verified account.
        </p>
      </AuthStandaloneShell>
    );
  }

  return (
    <AuthStandaloneShell
      eyebrow="Email verification"
      title="Verification failed"
      icon={<XCircle className="h-8 w-8" strokeWidth={2} />}
      iconTone="error"
    >
      <div className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-danger/25 bg-danger/10 px-3 py-2.5 text-left text-sm text-danger">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>{state.message}</span>
      </div>
      <p className="mt-3 text-center text-sm text-subtle">
        Links expire quickly and can only be used once. Request a fresh verification email if this one is stale.
      </p>
    </AuthStandaloneShell>
  );
}
