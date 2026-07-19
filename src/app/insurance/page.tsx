import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, calculatorPages } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          <Link key={calc.href} href={calc.href} className="group">
            <Card className="h-full transition-shadow hover:shadow-md hover:border-ember/40">
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="mt-0.5 shrink-0 text-muted-foreground">
                  <Calculator className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">{calc.label}</CardTitle>
                </div>
                <Badge className="bg-ember/10 text-ember border-ember/20 text-xs font-medium shrink-0">
                  Live
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {calc.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-ember transition-colors">
                  Open calculator
                  <svg
                    className="size-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Coming soon note for remaining calculators */}
      <div className="mt-10 rounded-lg border bg-muted/30 p-5">
        <p className="text-sm text-muted-foreground">
          <strong>Coming soon:</strong> Life Insurance Calculator and Annuity
          Payout Calculator. Each tool will follow the same accurate,
          shareable, print-ready format you see above.
        </p>
      </div>
    </div>
  );
}