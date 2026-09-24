"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  VerifyEmailResult,
  type VerifyEmailViewState,
} from "@/components/auth/VerifyEmailResult";
import { AuthApiError, verifyEmailToken } from "@/lib/auth/api";

/**
 * Single verify-email surface.
 * - `?token=` → call API once (deduped) and show result
 * - `?status=success|error` → API browser redirect after GET /users/verify-email/:token
 */
export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const status = searchParams.get("status");
  const statusMessage = searchParams.get("message")?.trim() ?? "";

  const [state, setState] = useState<VerifyEmailViewState>(() => {
    if (status === "success") {
      return {
        kind: "success",
        message: statusMessage || "Your Praxis account email is confirmed.",
      };
    }
    if (status === "error") {
      return {
        kind: "error",
        message: statusMessage || "Token is invalid or expired",
      };
    }
    if (token) return { kind: "loading" };
    return {
      kind: "error",
      message: "Open the verification link from your email. This page expects a token query parameter.",
    };
  });

  useEffect(() => {
    if (status === "success" || status === "error") return;
    if (!token) return;

    let cancelled = false;

    void (async () => {
      try {
        const message = await verifyEmailToken(token);
        if (!cancelled) {
          setState({
            kind: "success",
            message: message || "Your Praxis account email is confirmed.",
          });
        }
      } catch (error) {
        if (cancelled) return;
        setState({
          kind: "error",
          message:
            error instanceof AuthApiError
              ? error.message
              : "Could not verify this email link",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, status]);

  return <VerifyEmailResult state={state} />;
}
