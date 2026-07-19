import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, calculatorPages } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

      <div className="mt-10 rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">
          More home buying tools are in development, including a{" "}
          <strong>Down Payment Calculator</strong>,{" "}
          <strong>Home Affordability Calculator</strong>, and{" "}
          <strong>Mortgage Refinance Break-Even Calculator</strong>.{" "}
          <Link
            href="/contact"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Let us know
          </Link>{" "}
          which tools matter most to you.
        </p>
      </div>
    </div>
  );
}