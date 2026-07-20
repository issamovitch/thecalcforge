import type { Metadata } from "next";
import { siteConfig, calculatorPages } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CalculatorCard } from "@/components/shared/CalculatorCard";
import { Calculator } from "lucide-react";

const homeBuyingCalcs = calculatorPages.filter(
  (p) => p.category === "home-buying",
);

export const metadata: Metadata = {
  title: "Home Buying Calculators | CalcForge",
  description:
    "Free home buying calculators. Estimate PMI, down payments, closing costs, and affordability to plan your home purchase with confidence.",
  alternates: { canonical: `${siteConfig.url}/home-buying` },
  openGraph: {
    title: "Home Buying Calculators | CalcForge",
    description:
      "Free home buying calculators. Estimate PMI, down payments, closing costs, and affordability.",
    url: `${siteConfig.url}/home-buying`,
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

export default function HomeBuyingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: "Home Buying Calculators",
            url: `${siteConfig.url}/home-buying`,
          },
        ]}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Home Buying Calculators" },
        ]}
        className="mb-8"
      />

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Home Buying Calculators
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl">
        Plan your home purchase with tools that break down PMI, down payments,
        affordability, and closing costs. Each calculator produces instant,
        accurate estimates you can share or print.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {homeBuyingCalcs.map((calc) => (
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
