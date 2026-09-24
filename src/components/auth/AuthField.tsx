"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";

const fieldClass =
  "w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-subtle focus:border-accent-border";

type AuthFieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  /** Adds a show/hide toggle when the field is a password input. */
  revealable?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

export function AuthField({
  id,
  label,
  hint,
  error,
  revealable = false,
  type = "text",
  ...inputProps
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const showToggle = revealable && isPassword;
  const resolvedType = showToggle && visible ? "text" : type;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground/90">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={resolvedType}
          className={showToggle ? `${fieldClass} pr-11` : fieldClass}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...inputProps}
        />
        {showToggle ? (
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-[var(--radius-sm)] text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      {error ? (
        <span id={`${id}-error`} className="mt-1.5 block text-xs text-danger" role="alert">
          {error}
        </span>
      ) : null}
      {!error && hint ? (
        <span id={`${id}-hint`} className="mt-1.5 block text-xs text-subtle">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
