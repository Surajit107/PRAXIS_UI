import { ChevronRight } from "lucide-react";
import { SmartLink } from "@/components/ui/SmartLink";
import { breadcrumbsForPath } from "@/lib/docs/navigation";

type DocsBreadcrumbsProps = {
  pathname: string;
};

export function DocsBreadcrumbs({ pathname }: DocsBreadcrumbsProps) {
  const crumbs = breadcrumbsForPath(pathname);

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 text-subtle" aria-hidden />
              ) : null}
              {crumb.href && !last ? (
                <SmartLink
                  href={crumb.href}
                  prefetch={false}
                  className="transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </SmartLink>
              ) : (
                <span
                  className={last ? "text-foreground" : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
