import type { AuthTokens } from "./types";

const STORAGE_KEY = "praxis.auth.session";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isTokens(value: unknown): value is AuthTokens {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.accessToken === "string" && typeof record.refreshToken === "string";
}

/**
 * Read JWT pair from sessionStorage (SSO / login handoff).
 * Prefer sessionStorage over localStorage: tokens die with the tab and are not
 * shared across tabs. Still XSS-readable — not as safe as httpOnly cookies.
 */
export function getAuthTokens(): AuthTokens | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isTokens(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function setAuthTokens(tokens: AuthTokens): void {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearAuthTokens(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
