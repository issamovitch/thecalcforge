import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";

interface AffiliateCtaProps {
  pagePath: string;
  className?: string;
}

export function AffiliateCta({ pagePath, className }: AffiliateCtaProps) {
  const ctaConfig = siteConfig.affiliateCta[pagePath];

  if (!ctaConfig) {
    return null;
  }

  return (
    <div
      className={cn(
        "my-6 rounded-lg border border-border bg-card p-6 shadow-sm",
        className
      )}
      dangerouslySetInnerHTML={{ __html: ctaConfig.html }}
    />
  );
}