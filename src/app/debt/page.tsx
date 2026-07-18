import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Debt Calculators - Coming Soon",
  description: "Debt payoff calculators and strategies are coming soon to CalcForge. Compare snowball vs. avalanche, see your debt-free date, and more.",
  alternates: { canonical: `${siteConfig.url}/debt` },
  openGraph: {
    title: "Debt Calculators - Coming Soon",
    description: "Debt payoff calculators and strategies are coming soon to CalcForge.",
    url: `${siteConfig.url}/debt`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function DebtPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <BreadcrumbJsonLd items={[{ name: "Home", url: siteConfig.url }, { name: "Debt Calculators", url: `${siteConfig.url}/debt` }]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Debt Calculators" }]} className="mb-8" />
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Debt Calculators</h1>
        <Badge variant="secondary" className="text-xs font-medium shrink-0">Coming Soon</Badge>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed">Build payoff strategies, compare snowball vs. avalanche methods, and see your debt-free date. Our debt calculators will help you create a clear path to becoming debt-free.</p>
      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">We&apos;re building these calculators now. <a href="/contact" className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors">Let us know</a> which debt tools matter most to you.</p>
      </div>
    </div>
  );
}