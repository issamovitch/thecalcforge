import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the CalcForge team. Report bugs, request features, or ask questions about our financial calculators.",
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: "Contact Us",
    description: "Get in touch with the CalcForge team. Report bugs, request features, or ask questions.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary" as const,
    title: "Contact Us",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        className="mb-8"
      />

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Contact Us
      </h1>

      <div className="mt-8 max-w-[72ch] space-y-6 text-muted-foreground leading-relaxed">
        <p>
          We&apos;re a small team and we read every message. Whether
          you&apos;ve found a bug, have a feature request, or just want to say
          hi — we&apos;d love to hear from you.
        </p>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Email</h2>
          <p className="mt-2 text-foreground">
            <a
              href="mailto:hello@thecalcforge.com"
              className="text-ember hover:text-ember-hover transition-colors"
            >
              hello@thecalcforge.com
            </a>
          </p>
          <p className="mt-1 text-sm">
            We typically respond within one business day.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Report a Calculation Issue
          </h2>
          <p className="mt-2">
            If you notice an inaccuracy in one of our calculators — a wrong
            rate, missing factor, or outdated data — please email us with
            the calculator name, the inputs you used, and what you expected
            versus what we showed. We take accuracy seriously and will
            investigate promptly.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Request a New Calculator
          </h2>
          <p className="mt-2">
            Have an idea for a calculator you&apos;d like to see on CalcForge?
            We&apos;re building out loan, debt, auto, home, and insurance
            calculators next. Let us know which ones matter most to you and
            we&apos;ll prioritize accordingly.
          </p>
        </div>
      </div>
    </div>
  );
}