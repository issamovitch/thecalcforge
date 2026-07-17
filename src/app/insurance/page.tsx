import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Insurance Calculators - Coming Soon",
  description: "Insurance calculators are coming soon to CalcForge. Estimate coverage needs and premiums for health, life, auto, and homeowners insurance.",
  alternates: { canonical: `${siteConfig.url}/insurance` },
  openGraph: {
    title: "Insurance Calculators - Coming Soon",
    description: "Insurance calculators are coming soon to CalcForge.",
    url: `${siteConfig.url}/insurance`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function InsurancePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <CanonicalUrl path="/insurance" />
      <BreadcrumbJsonLd items={[{ name: "Home", url: siteConfig.url }, { name: "Insurance Calculators", url: `${siteConfig.url}/insurance` }]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Insurance Calculators" }]} className="mb-8" />
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Insurance Calculators</h1>
        <Badge variant="secondary" className="text-xs font-medium shrink-0">Coming Soon</Badge>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed">Estimate coverage needs and premiums for health, life, auto, and homeowners insurance. Our insurance calculators will help you find the right coverage at the right price.</p>
      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">We&apos;re building these calculators now. <a href="/contact" className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors">Let us know</a> which insurance tools matter most to you.</p>
      </div>
    </div>
  );
}