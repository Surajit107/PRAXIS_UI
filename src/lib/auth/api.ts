import { getApiBaseUrl, getApiServerUrl } from "@/lib/praxis";
import { clearAuthTokens, getAuthTokens, setAuthTokens } from "./session";
import type { ApiEnvelope, AuthTokens, PraxisUser } from "./types";

export class AuthApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown = null) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.payload = payload;
  }
}

function usersPath(suffix: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}/api/v1/users/${suffix.replace(/^\//, "")}`;
}

/** Absolute API URLs for OAuth — must leave the UI origin (cookies + provider callbacks live on the API). */
export function getSocialLoginUrl(provider: "google" | "github"): string {
  return `${getApiServerUrl()}/users/${provider}`;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function envelopeMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

async function requestEnvelope<T>(
  path: string,
  init: RequestInit,
  fallbackError: string,
): Promise<ApiEnvelope<T>> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    throw new AuthApiError(envelopeMessage(payload, fallbackError), response.status, payload);
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new AuthApiError("Unexpected API response shape", response.status, payload);
  }

  return payload as ApiEnvelope<T>;
}

async function authorizedRequest<T>(
  path: string,
  init: RequestInit,
  fallbackError: string,
  retried = false,
): Promise<ApiEnvelope<T>> {
  const tokens = getAuthTokens();
  if (!tokens?.accessToken) {
    throw new AuthApiError("Not signed in", 401);
  }

  try {
    return await requestEnvelope<T>(
      path,
      {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
      fallbackError,
    );
  } catch (error) {
    if (!(error instanceof AuthApiError) || error.status !== 401 || retried) {
      throw error;
    }

    const refreshed = await refreshSession();
    if (!refreshed) throw error;
    return authorizedRequest<T>(path, init, fallbackError, true);
  }
}

const verifyEmailInflight = new Map<string, Promise<string>>();
const verifyEmailCache = new Map<string, string>();
const VERIFY_SESSION_PREFIX = "praxis.verify.email:";

function readVerifySessionCache(token: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(`${VERIFY_SESSION_PREFIX}${token}`);
  } catch {
    return null;
  }
}

function writeVerifySessionCache(token: string, message: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${VERIFY_SESSION_PREFIX}${token}`, message);
  } catch {
    // Ignore quota / private-mode failures — in-memory cache still applies.
  }
}

/**
 * Verify once per token for the lifetime of this tab.
 * React Strict Mode remounts effects and would otherwise burn a single-use token
 * on the first call, then surface 489 from the duplicate.
 */
export async function verifyEmailToken(verificationToken: string): Promise<string> {
  const token = verificationToken.trim();
  const memoryCached = verifyEmailCache.get(token);
  if (memoryCached) return memoryCached;

  const sessionCached = readVerifySessionCache(token);
  if (sessionCached) {
    verifyEmailCache.set(token, sessionCached);
    return sessionCached;
  }

  const inflight = verifyEmailInflight.get(token);
  if (inflight) return inflight;

  const request = (async () => {
    const envelope = await requestEnvelope<{ isEmailVerified: boolean }>(
      usersPath(`verify-email/${encodeURIComponent(token)}`),
      { method: "GET" },
      "Could not verify email",
    );
    const message = envelope.message || "Email is verified";
    verifyEmailCache.set(token, message);
    writeVerifySessionCache(token, message);
    return message;
  })().finally(() => {
    verifyEmailInflight.delete(token);
  });

  verifyEmailInflight.set(token, request);
  return request;
}

export async function requestPasswordReset(email: string): Promise<string> {
  const envelope = await requestEnvelope<Record<string, never>>(
    usersPath("forgot-password"),
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    },
    "Could not send password reset email",
  );
  return envelope.message;
}

export async function resetPassword(resetToken: string, newPassword: string): Promise<string> {
  const envelope = await requestEnvelope<Record<string, never>>(
    usersPath(`reset-password/${encodeURIComponent(resetToken)}`),
    {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    },
    "Could not reset password",
  );
  return envelope.message;
}

export async function loginWithPassword(input: {
  email?: string;
  username?: string;
  password: string;
}): Promise<{ user: PraxisUser; tokens: AuthTokens }> {
  const body: Record<string, string> = { password: input.password };
  if (input.email?.trim()) body.email = input.email.trim().toLowerCase();
  if (input.username?.trim()) body.username = input.username.trim().toLowerCase();

  const envelope = await requestEnvelope<{
    user: PraxisUser;
    accessToken: string;
    refreshToken: string;
  }>(
    usersPath("login"),
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    "Login failed",
  );

  const tokens: AuthTokens = {
    accessToken: envelope.data.accessToken,
    refreshToken: envelope.data.refreshToken,
  };
  setAuthTokens(tokens);
  return { user: envelope.data.user, tokens };
}

export async function fetchCurrentUser(): Promise<PraxisUser> {
  const envelope = await authorizedRequest<PraxisUser>(
    usersPath("current-user"),
    { method: "GET" },
    "Could not load current user",
  );
  return envelope.data;
}

export async function logoutSession(): Promise<void> {
  try {
    await authorizedRequest<Record<string, never>>(
      usersPath("logout"),
      { method: "POST" },
      "Logout failed",
    );
  } catch {
    // Always clear local session even if the API call fails (expired token, offline, etc.).
  } finally {
    clearAuthTokens();
  }
}

export async function refreshSession(): Promise<AuthTokens | null> {
  const current = getAuthTokens();
  if (!current?.refreshToken) {
    clearAuthTokens();
    return null;
  }

  try {
    const envelope = await requestEnvelope<{
      accessToken: string;
      refreshToken: string;
    }>(
      usersPath("refresh-token"),
      {
        method: "POST",
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      },
      "Session refresh failed",
    );

    const next: AuthTokens = {
      accessToken: envelope.data.accessToken,
      refreshToken: envelope.data.refreshToken,
    };
    setAuthTokens(next);
    return next;
  } catch {
    clearAuthTokens();
    return null;
  }
}

/** Capture SSO query tokens, persist them, and scrub them from the address bar. */
export function captureSsoTokensFromUrl(searchParams: URLSearchParams): AuthTokens | null {
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  if (!accessToken || !refreshToken) return null;

  const tokens: AuthTokens = { accessToken, refreshToken };
  setAuthTokens(tokens);

  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.delete("accessToken");
    url.searchParams.delete("refreshToken");
    const cleaned = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", cleaned);
  }

  return tokens;
}
