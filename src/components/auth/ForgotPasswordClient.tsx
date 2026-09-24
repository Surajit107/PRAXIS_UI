"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthStandaloneShell } from "@/components/auth/AuthStandaloneShell";
import { Button } from "@/components/ui/Button";
import { AuthApiError, requestPasswordReset, resetPassword } from "@/lib/auth/api";

/**
 * Single forgot-password surface.
 * - no `token` → request reset email
 * - `?token=` → set new password
 * Success stays on-page (no redirect / back CTA).
 */
export function ForgotPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordsMatch = password.length > 0 && password === confirm;
  const confirmMismatch = useMemo(() => {
    if (!confirmTouched && !confirm) return null;
    if (!confirm) return "Confirm password is required";
    if (password !== confirm) return "Passwords do not match";
    return null;
  }, [confirm, confirmTouched, password]);

  async function onRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email is required");
      return;
    }

    setPending(true);
    try {
      const message = await requestPasswordReset(trimmed);
      setSuccess(message || "Password reset mail has been sent on your mail id");
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Could not send reset email");
    } finally {
      setPending(false);
    }
  }

  async function onResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setConfirmTouched(true);

    if (!token) {
      setError("Reset token is missing from this link");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (!confirm) {
      setError("Confirm password is required");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    try {
      const message = await resetPassword(token, password);
      setSuccess(message || "Password reset successfully");
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Could not reset password");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <AuthStandaloneShell
        eyebrow="Password reset"
        title={token ? "Password updated" : "Check your email"}
        icon={<CheckCircle2 className="h-8 w-8" strokeWidth={2} />}
        iconTone="success"
      >
        <p className="text-center text-[15px] text-muted">{success}</p>
        <p className="mt-3 text-center text-sm text-subtle">
          {token
            ? "You can close this tab and sign in with your new password."
            : "Use the link in the email to choose a new password. The link expires in 20 minutes."}
        </p>
      </AuthStandaloneShell>
    );
  }

  if (token) {
    return (
      <AuthStandaloneShell eyebrow="Password reset" title="Choose a new password">
        <p className="mb-5 text-center text-sm text-muted">
          Set a new password for your Praxis practice account. This link is single-use.
        </p>
        <form onSubmit={onResetSubmit} className="space-y-4 text-left" noValidate>
          <AuthField
            id="new-password"
            label="New password"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            required
            revealable
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(null);
            }}
            placeholder="••••••••"
          />
          <AuthField
            id="confirm-password"
            label="Confirm password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            revealable
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
              setError(null);
            }}
            onBlur={() => setConfirmTouched(true)}
            error={confirmMismatch ?? undefined}
            hint={
              passwordsMatch ? (
                <span className="text-success">Passwords match</span>
              ) : undefined
            }
            placeholder="••••••••"
            aria-invalid={confirmMismatch ? true : undefined}
          />
          {error ? (
            <div
              className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-danger/25 bg-danger/10 px-3 py-2.5 text-sm text-danger"
              role="alert"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          ) : null}
          <Button
            type="submit"
            loading={pending}
            disabled={Boolean(confirmMismatch) || !password || !confirm}
            className="w-full"
          >
            {pending ? "Saving" : "Update password"}
          </Button>
        </form>
      </AuthStandaloneShell>
    );
  }

  return (
    <AuthStandaloneShell eyebrow="Password reset" title="Forgot password">
      <p className="mb-5 text-center text-sm text-muted">
        Enter the email on your Praxis account. We’ll send a reset link that expires in 20 minutes.
      </p>
      <form onSubmit={onRequestSubmit} className="space-y-4 text-left" noValidate>
        <AuthField
          id="forgot-email"
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        {error ? (
          <div
            className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-danger/25 bg-danger/10 px-3 py-2.5 text-sm text-danger"
            role="alert"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : null}
        <Button type="submit" loading={pending} className="w-full">
          {pending ? "Sending" : "Send reset link"}
        </Button>
      </form>
    </AuthStandaloneShell>
  );
}
