import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "About CalcForge",
  description:
    "Learn about CalcForge's mission: building free, accurate, and private financial calculators for everyone.",
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: "About CalcForge",
    description: "Learn about CalcForge's mission: building free, accurate, and private financial calculators for everyone.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary" as const,
    title: "About CalcForge",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "About" }]}
        className="mb-8"
      />

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        About CalcForge
      </h1>

      <div className="mt-8 max-w-[72ch] space-y-6 text-muted-foreground leading-relaxed">
        <p>
          CalcForge was built on a simple belief: understanding your money
          shouldn&apos;t require a finance degree, an expensive CPA, or a
          subscription to a budgeting app. Our mission is to give everyone
          access to clear, accurate financial tools — completely free.
        </p>

        <p>
          Every calculator on CalcForge is built from the ground up using
          official tax brackets, FICA rates, and state-specific rules. We don&apos;t
          approximate or round away the details that matter. When you calculate
          your California take-home pay, our engine walks through every
          progressive bracket, factors in SDI deductions and the mental health
          services tax, and shows you exactly where each dollar goes. When you
          check Texas, we show you why your take-home is higher — and what
          trade-offs come with no state income tax.
        </p>

        <p>
          Privacy is part of our foundation, not an afterthought. All
          calculations run entirely in your browser. We never collect, store, or
          transmit your salary, deductions, or any personal financial
          information. There are no accounts, no tracking pixels on the
          calculator forms, and no data leaving your device. Your financial
          life stays yours.
        </p>

        <p>
          CalcForge is a small, independent project. We&apos;re not a fintech
          startup looking to monetize your data, and we&apos;re not a bank trying
          to sell you products. We&apos;re engineers and personal finance
          enthusiasts who got tired of the ad-riddled, inaccurate calculators
          that dominate search results. If you find our tools useful, the
          greatest thing you can do is share them with a friend or colleague
          who&apos;s trying to figure out their next paycheck.
        </p>

        <p className="text-foreground font-medium">
          Questions or feedback?{" "}
          <a
            href="/contact"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Get in touch
          </a>
          — we&apos;d love to hear from you.
        </p>
      </div>
    </div>
  );
}