"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { RotateCcw, Terminal } from "lucide-react";
import { useState } from "react";
import { MethodFlowVisual } from "@/components/methods/MethodFlowVisual";
import { EASE_OUT, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { JsonHighlight } from "@/components/ui/JsonHighlight";
import {
  httpMethodLessons,
  lessonHasPlayground,
  methodPropertyLabels,
  methodSoftClass,
  resolveLessonVariant,
  type MethodProperty,
} from "@/lib/httpMethodLessons";
import { httpMethods, methodToneClass, type HttpMethod } from "@/lib/praxis";

const PROPERTY_ORDER: readonly MethodProperty[] = ["safe", "idempotent", "hasBody"];

/**
 * Interactive HTTP verbs classroom — all nine methods, slow shelf demos, semantics matrix.
 */
export function MethodsExplorer() {
  const reduceMotion = useReducedMotion() === true;
  const [active, setActive] = useState<HttpMethod>("GET");
  const [variantId, setVariantId] = useState<string | null>("all");
  const [playKey, setPlayKey] = useState(0);

  const baseLesson = httpMethodLessons.find((entry) => entry.method === active) ?? httpMethodLessons[0];
  const variants = baseLesson.variants;
  const resolvedVariantId =
    variants && variants.length > 0
      ? (variants.some((entry) => entry.id === variantId) ? variantId : (variants[0]?.id ?? null))
      : null;
  const lesson = resolveLessonVariant(baseLesson, resolvedVariantId);
  const canPlay = lessonHasPlayground(lesson);

  const selectMethod = (method: HttpMethod) => {
    const next = httpMethodLessons.find((entry) => entry.method === method);
    setActive(method);
    setVariantId(next?.variants?.[0]?.id ?? null);
    setPlayKey((key) => key + 1);
  };

  const selectVariant = (id: string) => {
    setVariantId(id);
    setPlayKey((key) => key + 1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <Reveal>
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
          <div
            role="tablist"
            aria-label="HTTP methods"
            className="flex flex-wrap gap-1 border-b border-border p-2 sm:p-3"
          >
            {httpMethods.map((method) => {
              const selected = method === active;
              return (
                <button
                  key={method}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => selectMethod(method)}
                  className={`relative shrink-0 rounded-[var(--radius-sm)] px-3 py-2.5 font-mono text-[13px] font-semibold tracking-wide transition-colors min-h-10 ${
                    selected
                      ? `${methodToneClass[method]} ${methodSoftClass[method]}`
                      : "text-muted hover:bg-white/[0.04] hover:text-foreground"
                  }`}
                >
                  {selected && !reduceMotion ? (
                    <m.span
                      layoutId="method-tab-glow"
                      className="absolute inset-0 rounded-[var(--radius-sm)] border border-current/20"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  ) : selected ? (
                    <span className="absolute inset-0 rounded-[var(--radius-sm)] border border-current/20" />
                  ) : null}
                  <span className="relative">{method}</span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 p-4 sm:gap-8 sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] lg:gap-10">
            <AnimatePresence mode="wait">
              <m.div
                key={`${lesson.method}-${lesson.activeVariantId ?? "default"}`}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="flex flex-col gap-5"
              >
                <div>
                  <p
                    className={`font-mono text-xs font-semibold uppercase tracking-[0.18em] ${methodToneClass[lesson.method]}`}
                  >
                    {lesson.method}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {lesson.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{lesson.tagline}</p>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted">{lesson.summary}</p>
                  <p className="mt-3 text-sm text-foreground/80">{lesson.mutates}</p>
                </div>

                {variants && variants.length > 0 ? (
                  <div
                    role="group"
                    aria-label={`${lesson.method} request shape`}
                    className="flex flex-wrap gap-1 rounded-[var(--radius-sm)] border border-border bg-surface-2 p-1"
                  >
                    {variants.map((variant) => {
                      const selected = variant.id === resolvedVariantId;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => selectVariant(variant.id)}
                          className={`rounded-[calc(var(--radius-sm)-2px)] px-3 py-1.5 font-mono text-[12px] font-semibold tracking-wide transition-colors ${
                            selected
                              ? `${methodToneClass[lesson.method]} ${methodSoftClass[lesson.method]}`
                              : "text-muted hover:text-foreground"
                          }`}
                        >
                          {variant.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <dl className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {PROPERTY_ORDER.map((key) => {
                    const meta = methodPropertyLabels[key];
                    const on = lesson.properties[key];
                    return (
                      <div
                        key={key}
                        title={meta.hint}
                        className={`rounded-[var(--radius-sm)] border px-2 py-2.5 sm:px-3 ${
                          on ? methodSoftClass[lesson.method] : "border-border bg-surface-2"
                        }`}
                      >
                        <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-subtle sm:text-[10px] sm:tracking-[0.14em]">
                          {meta.label}
                        </dt>
                        <dd
                          className={`mt-1 text-sm font-semibold ${
                            on ? methodToneClass[lesson.method] : "text-subtle"
                          }`}
                        >
                          {on ? "Yes" : "No"}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={RotateCcw}
                    onClick={() => setPlayKey((key) => key + 1)}
                  >
                    Replay slowly
                  </Button>
                  {canPlay && lesson.playgroundHref ? (
                    <Button href={lesson.playgroundHref} size="sm" icon={Terminal} trailingArrow>
                      Try in playground
                    </Button>
                  ) : (
                    <p className="self-center font-mono text-[11px] text-subtle">
                      Live lab — coming soon
                    </p>
                  )}
                </div>
              </m.div>
            </AnimatePresence>

            <div className="flex flex-col gap-4">
              <MethodFlowVisual lesson={lesson} playKey={playKey} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-md)] border border-border bg-surface-2 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">Request</p>
                  <pre className="mt-2 min-w-0 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-foreground/90">
                    <span className={methodToneClass[lesson.method]}>{lesson.method}</span>{" "}
                    {lesson.path}
                    {lesson.requestBody ? (
                      <>
                        {"\n\n"}
                        <JsonHighlight source={lesson.requestBody} />
                      </>
                    ) : null}
                  </pre>
                </div>
                <div className="rounded-[var(--radius-md)] border border-border bg-surface-2 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                    Typical response · {lesson.statusTypical}
                  </p>
                  <pre className="mt-2 min-w-0 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground/90">
                    <JsonHighlight source={lesson.responsePreview} />
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="mt-16 sm:mt-20">
        <div className="mb-8 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
            />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Semantics matrix</p>
            <span
              aria-hidden
              className="h-px min-w-[2.5rem] flex-1 max-w-[5rem] bg-gradient-to-r from-accent/50 to-transparent"
            />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            <span className="text-foreground">All nine verbs.</span>{" "}
            <span className="text-accent">Safe vs idempotent.</span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Safe = zero side effects (GET, HEAD, OPTIONS, TRACE). Idempotent = repeating doesn&apos;t
            stack mutations. POST, PATCH, and CONNECT fail the idempotent test by default.
          </p>
        </div>

        {/* Mobile: card list — table requires sideways scroll on phones */}
        <ul className="flex flex-col gap-2 md:hidden">
          {httpMethodLessons.map((row) => (
            <li key={row.method}>
              <button
                type="button"
                onClick={() => selectMethod(row.method)}
                className={`w-full rounded-[var(--radius-md)] border p-4 text-left transition-colors ${
                  row.method === active
                    ? "border-border-strong bg-white/[0.04]"
                    : "border-border bg-surface hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-mono text-sm font-semibold ${methodToneClass[row.method]}`}>
                    {row.method}
                  </span>
                  <span className="text-xs text-muted">{row.tagline}</span>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2">
                  {PROPERTY_ORDER.map((key) => (
                    <div key={key}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                        {methodPropertyLabels[key].label}
                      </dt>
                      <dd
                        className={`mt-0.5 font-mono text-xs ${
                          row.properties[key] ? "text-success" : "text-subtle"
                        }`}
                      >
                        {row.properties[key] ? "yes" : "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-border md:block">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
                  Method
                </th>
                {PROPERTY_ORDER.map((key) => (
                  <th
                    key={key}
                    title={methodPropertyLabels[key].hint}
                    className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-subtle"
                  >
                    {methodPropertyLabels[key].label}
                  </th>
                ))}
                <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
                  Typical use
                </th>
              </tr>
            </thead>
            <tbody>
              {httpMethodLessons.map((row) => (
                <tr
                  key={row.method}
                  className={`border-b border-hairline last:border-b-0 transition-colors ${
                    row.method === active ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => selectMethod(row.method)}
                      className={`font-mono text-sm font-semibold ${methodToneClass[row.method]}`}
                    >
                      {row.method}
                    </button>
                  </td>
                  {PROPERTY_ORDER.map((key) => (
                    <td key={key} className="px-4 py-3 font-mono text-xs">
                      <span className={row.properties[key] ? "text-success" : "text-subtle"}>
                        {row.properties[key] ? "yes" : "—"}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-muted">{row.tagline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Stagger stagger={0.08} columns={3} className="mt-16 grid gap-4 sm:grid-cols-3 sm:mt-20">
        {[
          {
            title: "Pause and step through",
            body: "Use prev / pause / next — or click a step chip. Mutating verbs show an explicit before → after.",
          },
          {
            title: "All nine verbs are live",
            body: "Every method hits kitchen-sink. TRACE and CONNECT use a browser-safe GET alias — curl still fires the real verbs.",
          },
          {
            title: "Then practice on domains",
            body: "Todos, ecommerce, and auth reuse the same verbs on production-shaped resources.",
          },
        ].map((card) => (
          <StaggerItem key={card.title}>
            <div className="h-full border-t border-border pt-5">
              <h3 className="text-base font-semibold tracking-tight text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{card.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
