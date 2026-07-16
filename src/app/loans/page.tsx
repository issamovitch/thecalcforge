import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Loan Calculators — Coming Soon",
  description: "Loan calculators are coming soon to CalcForge. Estimate monthly payments, total interest, and amortization schedules.",
  alternates: { canonical: `${siteConfig.url}/loans` },
  openGraph: {
    title: "Loan Calculators — Coming Soon",
    description: "Loan calculators are coming soon to CalcForge.",
    url: `${siteConfig.url}/loans`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function LoansPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <CanonicalUrl path="/loans" />
      <BreadcrumbJsonLd items={[{ name: "Home", url: siteConfig.url }, { name: "Loan Calculators", url: `${siteConfig.url}/loans` }]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Loan Calculators" }]} className="mb-8" />
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Loan Calculators</h1>
        <Badge variant="secondary" className="text-xs font-medium shrink-0">Coming Soon</Badge>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed">Estimate monthly payments, total interest, and amortization schedules for any loan type. Our loan calculators will cover personal loans, auto loans, student loans, and more.</p>
      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">We&apos;re building these calculators now. <a href="/contact" className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors">Let us know</a> which loan tools matter most to you.</p>
      </div>
    </div>
  );
}