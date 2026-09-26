"use client";

import { LoaderCircle, LogOut, Mail, ShieldAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthStandaloneShell } from "@/components/auth/AuthStandaloneShell";
import { Button, buttonClasses } from "@/components/ui/Button";
import {
  AuthApiError,
  captureSsoTokensFromUrl,
  fetchCurrentUser,
  getSocialLoginUrl,
  loginWithPassword,
  logoutSession,
} from "@/lib/auth/api";
import { getAuthTokens } from "@/lib/auth/session";
import type { PraxisUser } from "@/lib/auth/types";

type LoadState =
  | { kind: "boot" }
  | { kind: "ready"; user: PraxisUser }
  | { kind: "anon" }
  | { kind: "error"; message: string };

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Standalone SSO / profile surface — no site chrome, no leave CTAs. */
export function UserProfileClient() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<LoadState>({ kind: "boot" });
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      captureSsoTokensFromUrl(new URLSearchParams(searchParams.toString()));

      if (!getAuthTokens()) {
        if (!cancelled) setState({ kind: "anon" });
        return;
      }

      try {
        const user = await fetchCurrentUser();
        if (!cancelled) setState({ kind: "ready", user });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof AuthApiError && error.status === 401) {
          setState({ kind: "anon" });
          return;
        }
        setState({
          kind: "error",
          message: error instanceof AuthApiError ? error.message : "Could not load profile",
        });
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmed = identity.trim();
    if (!trimmed || !password) {
      setFormError("Email/username and password are required");
      return;
    }

    setLoginPending(true);
    try {
      const looksLikeEmail = trimmed.includes("@");
      const { user } = await loginWithPassword({
        password,
        ...(looksLikeEmail ? { email: trimmed } : { username: trimmed }),
      });
      setPassword("");
      setState({ kind: "ready", user });
    } catch (error) {
      setFormError(error instanceof AuthApiError ? error.message : "Login failed");
    } finally {
      setLoginPending(false);
    }
  }

  async function onLogout() {
    setLogoutPending(true);
    try {
      await logoutSession();
      setState({ kind: "anon" });
    } finally {
      setLogoutPending(false);
    }
  }

  if (state.kind === "boot") {
    return (
      <AuthStandaloneShell
        eyebrow="Account"
        title="Loading session"
        icon={<LoaderCircle className="h-8 w-8 animate-spin" strokeWidth={2} />}
        iconTone="pending"
      >
        <p className="text-center text-sm text-muted">
          Checking for access tokens from SSO or a saved login.
        </p>
      </AuthStandaloneShell>
    );
  }

  if (state.kind === "error") {
    return (
      <AuthStandaloneShell
        eyebrow="Account"
        title="Session error"
        icon={<ShieldAlert className="h-8 w-8" strokeWidth={2} />}
        iconTone="error"
      >
        <div
          className="mb-4 flex items-start gap-2 rounded-[var(--radius-sm)] border border-danger/25 bg-danger/10 px-3 py-2.5 text-left text-sm text-danger"
          role="alert"
        >
          <span>{state.message}</span>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            void logoutSession().then(() => setState({ kind: "anon" }));
          }}
        >
          Clear session
        </Button>
      </AuthStandaloneShell>
    );
  }

  if (state.kind === "anon") {
    return (
      <AuthStandaloneShell eyebrow="Account" title="Sign in">
        <p className="mb-5 text-center text-sm text-muted">
          SSO lands here with tokens in the query string. Password login works for email/password accounts.
        </p>
        <form onSubmit={onLogin} className="space-y-4 text-left" noValidate>
          <AuthField
            id="login-identity"
            label="Email or username"
            name="identity"
            autoComplete="username"
            required
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
            placeholder="demo or demo@example.com"
          />
          <AuthField
            id="login-password"
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
          {formError ? (
            <div
              className="flex items-start gap-2 rounded-[var(--radius-sm)] border border-danger/25 bg-danger/10 px-3 py-2.5 text-sm text-danger"
              role="alert"
            >
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{formError}</span>
            </div>
          ) : null}
          <Button type="submit" loading={loginPending} className="w-full" icon={Mail}>
            {loginPending ? "Signing in" : "Sign in with password"}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.14em]">
            <span className="bg-[var(--surface)] px-2 text-subtle">or continue with</span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={getSocialLoginUrl("google")}
            className={buttonClasses({ variant: "secondary", className: "w-full" })}
          >
            Google
          </a>
          <a
            href={getSocialLoginUrl("github")}
            className={buttonClasses({ variant: "secondary", className: "w-full" })}
          >
            GitHub
          </a>
        </div>
      </AuthStandaloneShell>
    );
  }

  const { user } = state;
  const avatarUrl = user.avatar?.url;

  return (
    <AuthStandaloneShell eyebrow="Account" title="Signed in" wide>
      <div className="flex flex-col gap-4 text-left sm:flex-row sm:items-start">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote avatar URLs vary by provider
          <img
            src={avatarUrl}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-surface-3 font-display text-lg font-semibold">
            {(user.username || user.email || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold tracking-[-0.03em]">
            {user.username}
          </p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          loading={logoutPending}
          icon={LogOut}
          onClick={() => void onLogout()}
          className="w-full sm:w-auto"
        >
          Sign out
        </Button>
      </div>

      <dl className="mt-6 grid gap-4 text-left text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-subtle">Role</dt>
          <dd className="mt-1 font-mono text-foreground/90">{user.role ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-subtle">Login type</dt>
          <dd className="mt-1 font-mono text-foreground/90">{user.loginType ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-subtle">Email verified</dt>
          <dd className="mt-1 font-mono text-foreground/90">
            {user.isEmailVerified ? "yes" : "no"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-subtle">User id</dt>
          <dd className="mt-1 truncate font-mono text-foreground/90" title={user._id}>
            {user._id}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-[0.14em] text-subtle">Created</dt>
          <dd className="mt-1 font-mono text-foreground/90">{formatDate(user.createdAt)}</dd>
        </div>
      </dl>

      <p className="mt-6 text-left text-sm text-muted">
        Tokens stay in sessionStorage for this tab. Call app-domain endpoints with{" "}
        <span className="font-mono text-xs text-foreground/80">Authorization: Bearer</span>.
      </p>
    </AuthStandaloneShell>
  );
}
