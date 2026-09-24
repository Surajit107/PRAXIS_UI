import { ArrowRight, LoaderCircle, type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { SmartLink } from "./SmartLink";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const base =
  "group relative z-10 inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,translate] duration-200 ease-out will-change-transform active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background shadow-[0_1px_0_rgba(255,255,255,0.14),0_10px_24px_-12px_rgba(0,0,0,0.7)] hover:bg-white hover:translate-y-[-2px] hover:shadow-[0_1px_0_rgba(255,255,255,0.2),0_16px_32px_-14px_color-mix(in_srgb,var(--accent)_35%,transparent)]",
  secondary:
    "border border-border-strong bg-surface-2 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/30 hover:bg-surface-3 hover:translate-y-[-2px] hover:shadow-[0_12px_28px_-16px_rgba(0,0,0,0.7)]",
  ghost: "text-muted hover:bg-white/[0.06] hover:text-foreground",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

const iconSize: Record<ButtonSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-4 w-4",
};

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** Lucide icon rendered before the label. */
  icon?: LucideIcon;
  /** Appends an arrow that nudges forward on hover — use for navigational CTAs. */
  trailingArrow?: boolean;
  /** Open link in a new tab (docs shell, external tools). */
  newTab?: boolean;
};

type LinkButtonProps = CommonProps & { href: string };

type NativeButtonProps = CommonProps & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export type ButtonProps = LinkButtonProps | NativeButtonProps;

export function buttonClasses({
  variant = "primary",
  size = "md",
  className = "",
}: Pick<CommonProps, "variant" | "size" | "className"> = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

function Content({
  children,
  trailingArrow,
  icon: Icon,
  size = "md",
}: Pick<CommonProps, "children" | "trailingArrow" | "icon" | "size">) {
  return (
    <>
      {Icon ? (
        <Icon
          aria-hidden
          className={`${iconSize[size]} transition-transform duration-200 group-hover:scale-110`}
          strokeWidth={2.25}
        />
      ) : null}
      {children}
      {trailingArrow ? (
        <ArrowRight
          aria-hidden
          className={`${iconSize[size]} transition-transform duration-200 ease-out group-hover:translate-x-1`}
        />
      ) : null}
    </>
  );
}

export function Button(props: ButtonProps) {
  const classes = buttonClasses(props);
  const size = props.size ?? "md";

  if (props.href !== undefined) {
    return (
      <SmartLink href={props.href} className={classes} newTab={props.newTab}>
        <Content trailingArrow={props.trailingArrow} icon={props.icon} size={size}>
          {props.children}
        </Content>
      </SmartLink>
    );
  }

  const { type = "button", onClick, disabled, loading = false, trailingArrow, icon, children } = props;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {loading ? <LoaderCircle aria-hidden className={`${iconSize[size]} animate-spin`} /> : null}
      <Content trailingArrow={!loading && trailingArrow} icon={!loading ? icon : undefined} size={size}>
        {children}
      </Content>
    </button>
  );
}
