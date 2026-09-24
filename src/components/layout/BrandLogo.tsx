import Link from "next/link";
import { HexMark } from "@/components/visual/HexMark";
import { siteConfig } from "@/lib/site";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
};

/**
 * Wordmark: Praxis.app — product name + muted domain suffix.
 * Same pattern as linear.app / vercel.app: readable brand, quiet TLD.
 */
export function BrandLogo({ className = "", markClassName = "h-6 w-6" }: BrandLogoProps) {
  return (
    <Link href="/" aria-label={`${siteConfig.name} home`} className={`flex items-center gap-2.5 ${className}`}>
      <HexMark className={markClassName} />
      <span className="font-brand text-[15px] tracking-[-0.03em]">
        Praxis<span className="text-muted">.app</span>
      </span>
    </Link>
  );
}
