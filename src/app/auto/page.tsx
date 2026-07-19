import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";

/* ─── Auto calculators shown on this hub ─── */
const autoHubCalculators = [
  {
    label: "Auto Loan Calculator",
    href: "/loans/auto-loan-calculator",
    description:
      "Calculate car payments with trade-in equity, negative equity rollover, sales tax, and extra payments.",
  },
  {
    label: "Car Affordability Calculator",
    href: "/auto/car-affordability-calculator",
    description:
      "Find the maximum vehicle price you can afford based on income or target payment, with 20/4/10 rule analysis.",
  },
  {
    label: "Auto Lease Calculator",
    href: "/auto/auto-lease-payment-calculator",
    description:
      "Calculate monthly lease payments broken into depreciation, finance charge, and tax, with money factor conversion and buyout estimate.",
  },
];

/* ─── SEO Metadata ─── */
export const metadata: Metadata = {
  title: "Auto Calculators - Coming Soon",
  description: "Auto calculators are coming soon to CalcForge. Factor in car payments, insurance, depreciation, and total cost of ownership.",
  alternates: { canonical: `${siteConfig.url}/auto` },
  openGraph: {
    title: "Auto Calculators - Coming Soon",
    description: "Auto calculators are coming soon to CalcForge.",
    url: `${siteConfig.url}/auto`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function AutoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <BreadcrumbJsonLd items={[{ name: "Home", url: siteConfig.url }, { name: "Auto Calculators", url: `${siteConfig.url}/auto` }]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Auto Calculators" }]} className="mb-8" />
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Auto Calculators</h1>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Factor in car payments, insurance, depreciation, and total cost of ownership for any vehicle. Our auto calculators help you make informed car-buying decisions.</p>

      {/* Calculator cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {autoHubCalculators.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-ember/40 hover:bg-accent/50"
          >
            <h2 className="text-base font-semibold text-foreground group-hover:text-ember transition-colors">
              {calc.label}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {calc.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">More auto calculators are on the way. <a href="/contact" className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors">Let us know</a> which auto tools matter most to you.</p>
      </div>
    </div>
  );
}