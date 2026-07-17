import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, calculatorPages } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export const metadata: Metadata = {
  title: "Loan Calculators — CalcForge",
  description:
    "Free loan calculators: title loans, payday loans, and more. Estimate monthly payments, total interest, and amortization schedules.",
  alternates: { canonical: `${siteConfig.url}/loans` },
  openGraph: {
    title: "Loan Calculators — CalcForge",
    description: "Free loan calculators for title loans, payday loans, and more.",
    url: `${siteConfig.url}/loans`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
};

export default function LoansPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <CanonicalUrl path="/loans" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
        ]}
      />
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Loan Calculators" }]}
        className="mb-8"
      />

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Loan Calculators
      </h1>
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        Free, accurate loan calculators. Estimate monthly payments, total
        interest, and amortization schedules for any loan type.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {calculatorPages.map((calc) => (
          <Link key={calc.href} href={calc.href} className="group">
            <Card className="h-full transition-colors hover:border-ember/40 hover:bg-muted/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2.5">
                  <Calculator className="size-5 text-ember" />
                  <CardTitle className="text-base font-semibold group-hover:text-ember transition-colors">
                    {calc.label}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {calc.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {calculatorPages.length === 0 && (
        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">
            More loan calculators are on the way.{" "}
            <Link
              href="/contact"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Let us know
            </Link>{" "}
            which loan tools matter most to you.
          </p>
        </div>
      )}
    </div>
  );
}