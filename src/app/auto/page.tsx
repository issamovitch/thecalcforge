import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CalculatorCard } from "@/components/shared/CalculatorCard";
import { Calculator } from "lucide-react";

export const dynamic = "force-static";

/* ─── Auto calculators shown on this hub ─── */
const autoHubCalculators = [
  {
    label: "Auto Loan Calculator",
    href: "/loans/auto-loan-calculator",
    description:
      "Project your monthly car payment and total interest. See how trade-in value and negative equity rollover change what you actually finance.",
  },
  {
    label: "Car Affordability Calculator",
    href: "/auto/car-affordability-calculator",
    description:
      "Find the maximum vehicle price you can afford from your income or target monthly payment. Check your numbers against the 20/4/10 rule.",
  },
  {
    label: "Auto Lease Calculator",
    href: "/auto/auto-lease-payment-calculator",
    description:
      "See your monthly car lease payment with each component shown separately. Convert the money factor to APR and check the end-of-lease buyout price.",
  },
  {
    label: "Lease vs Buy Calculator",
    href: "/auto/lease-vs-buy-calculator",
    description:
      "Compare the total cost of leasing versus buying the same car over your ownership period. See which option is cheaper and the month the buy side pulls ahead.",
  },
];

/* ─── SEO Metadata ─── */
export const metadata: Metadata = {
  title: "Auto Calculators - Car Payments, Lease, Affordability",
  description:
    "Free auto calculators for car payments, lease comparisons, affordability, and lease vs buy analysis. Plan your next vehicle purchase with confidence.",
  alternates: { canonical: `${siteConfig.url}/auto` },
  openGraph: {
    title: "Auto Calculators - Car Payments, Lease, Affordability",
    description:
      "Free auto calculators for car payments, lease comparisons, affordability, and lease vs buy analysis.",
    url: `${siteConfig.url}/auto`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  robots: { index: true, follow: true },
};

export default function AutoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <BreadcrumbJsonLd items={[{ name: "Home", url: siteConfig.url }, { name: "Auto Calculators", url: `${siteConfig.url}/auto` }]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Auto Calculators" }]} className="mb-8" />
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Auto Calculators</h1>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">Factor in car payments, insurance, depreciation, and total cost of ownership for any vehicle. Our auto calculators help you make informed car-buying decisions.</p>

      {/* Calculator cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {autoHubCalculators.map((calc) => (
          <CalculatorCard
            key={calc.href}
            title={calc.label}
            description={calc.description}
            href={calc.href}
            icon={<Calculator className="h-7 w-7" />}
          />
        ))}
      </div>
    </div>
  );
}
