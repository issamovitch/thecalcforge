import type { Metadata } from "next";
import { siteConfig, calculatorPages } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CalculatorCard } from "@/components/shared/CalculatorCard";
import { Calculator } from "lucide-react";

const insuranceCalcs = calculatorPages.filter(
  (p) => p.category === "insurance",
);

export const metadata: Metadata = {
  title: "Insurance Calculators | CalcForge",
  description:
    "Free insurance calculators. Estimate disability insurance coverage needs, life insurance amounts, and annuity payouts to protect your financial future.",
  alternates: { canonical: `${siteConfig.url}/insurance` },
  openGraph: {
    title: "Insurance Calculators | CalcForge",
    description:
      "Free insurance calculators. Estimate disability insurance coverage needs, life insurance amounts, and annuity payouts.",
    url: `${siteConfig.url}/insurance`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function InsurancePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: "Insurance Calculators",
            url: `${siteConfig.url}/insurance`,
          },
        ]}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Insurance Calculators" },
        ]}
        className="mb-8"
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Insurance Calculators
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl">
        Protect your income and plan for the unexpected. These calculators help
        you estimate disability insurance coverage needs, life insurance
        amounts, and annuity payout options so you can make informed decisions
        about your financial protection.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {insuranceCalcs.map((calc) => (
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
