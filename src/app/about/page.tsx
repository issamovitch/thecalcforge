import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about CalcForge's mission: building free, accurate, and private financial calculators for everyone.",
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: "About",
    description: "Learn about CalcForge's mission: building free, accurate, and private financial calculators for everyone.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary" as const,
    title: "About",
    images: [siteConfig.ogImage],
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
          access to clear, accurate financial tools, completely free.
        </p>

        <p>
          Every calculator on CalcForge is built from the ground up using
          reliable data sources and industry-standard formulas. We don&apos;t
          approximate or round away the details that matter. Whether you&apos;re
          planning a mortgage, comparing loan options, or mapping out a debt
          payoff strategy, our tools give you the clarity you need to make
          informed financial decisions.
        </p>

        <p>
          Privacy is part of our foundation, not an afterthought. All
          calculations run entirely in your browser. We never collect, store, or
          transmit your financial information. There are no accounts, no tracking
          pixels on the calculator forms, and no data leaving your device. Your
          financial life stays yours.
        </p>

        <p>
          CalcForge is a small, independent project. We&apos;re not a fintech
          startup looking to monetize your data, and we&apos;re not a bank trying
          to sell you products. We&apos;re engineers and personal finance
          enthusiasts who got tired of the ad-riddled, inaccurate calculators
          that dominate search results. If you find our tools useful, the
          greatest thing you can do is share them with a friend or colleague
          who&apos;s trying to make sense of their finances.
        </p>

        <p className="text-foreground font-medium">
          Questions or feedback?{" "}
          <a
            href="/contact"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Get in touch
          </a>
          : we&apos;d love to hear from you.
        </p>
      </div>
    </div>
  );
}