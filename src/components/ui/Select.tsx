"use client";

import { AnimatePresence, m } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  /** Secondary line shown in the menu only. */
  hint?: string;
  /** Tailwind text colour class applied to the label (e.g. HTTP method tones). */
  toneClass?: string;
};

type SelectProps<T extends string> = {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  /** Accessible name — required because the trigger may show only the value. */
  label: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  renderValue?: (option: SelectOption<T>) => ReactNode;
};

const TYPEAHEAD_RESET_MS = 500;

/** Select-only combobox (WAI-ARIA APG pattern) with animated listbox. */
export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  renderValue,
}: SelectProps<T>) {
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-opt-${index}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ query: "", timer: 0 });

  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${baseId}-opt-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, baseId]);

  useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

  function openMenu(index = selectedIndex) {
    setActiveIndex(index);
    setOpen(true);
  }

  function commit(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function matchTypeahead(char: string) {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.query += char.toLowerCase();
    state.timer = window.setTimeout(() => {
      state.query = "";
    }, TYPEAHEAD_RESET_MS);
    const match = options.findIndex((option) => option.label.toLowerCase().startsWith(state.query));
    return match === -1 ? null : match;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(last, index + 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        return;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        return;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        return;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        return;
      case "Tab":
        setOpen(false);
        return;
      default:
        if (event.key.length === 1) {
          const match = matchTypeahead(event.key);
          if (match !== null) setActiveIndex(match);
        }
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-border-strong bg-surface-2 px-3 text-sm transition-colors hover:border-[#444] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-expanded:border-accent-border ${triggerClassName}`}
      >
        <span className={`truncate ${selected?.toneClass ?? ""}`}>
          {selected ? (renderValue ? renderValue(selected) : selected.label) : null}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-subtle transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <m.ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className={`scrollbar-thin absolute left-0 top-[calc(100%+6px)] z-40 max-h-72 min-w-full origin-top overflow-auto rounded-[var(--radius-md)] border border-border-strong bg-surface-2 p-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] ${menuClassName}`}
          >
            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActiveIndex(index)}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => commit(index)}
                  className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm ${
                    isActive ? "bg-white/[0.07]" : ""
                  }`}
                >
                  <span className="flex-1">
                    <span className={`block ${option.toneClass ?? "text-foreground"}`}>{option.label}</span>
                    {option.hint ? <span className="mt-0.5 block text-xs text-subtle">{option.hint}</span> : null}
                  </span>
                  <Check aria-hidden className={`h-4 w-4 text-accent ${isSelected ? "opacity-100" : "opacity-0"}`} />
                </li>
              );
            })}
          </m.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
