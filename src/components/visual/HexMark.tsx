/** Shared geometry — also used by app/icon.svg and app/apple-icon.tsx. Keep in sync. */
export const HEX_MARK_VIEWBOX = "0 0 32 32";
export const HEX_MARK_OUTER = "16,2 28,9 28,23 16,30 4,23 4,9";
export const HEX_MARK_INNER = "16,10 21,13 21,19 16,22 11,19 11,13";

type HexMarkProps = {
  className?: string;
};

export function HexMark({ className = "h-7 w-7" }: HexMarkProps) {
  return (
    <svg viewBox={HEX_MARK_VIEWBOX} className={className} aria-hidden>
      <polygon
        points={HEX_MARK_OUTER}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
      <polygon points={HEX_MARK_INNER} fill="var(--accent)" className="animate-pulse-soft origin-center" />
    </svg>
  );
}
