import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for CalcForge financial calculators. Free to use, no account required.",
  alternates: { canonical: `${siteConfig.url}/terms` },
  openGraph: {
    title: "Terms of Service",
    description: "Terms of service for CalcForge financial calculators.",
    url: `${siteConfig.url}/terms`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary" as const,
    title: "Terms of Service",
    images: [siteConfig.ogImage],
  },
};

const LAST_UPDATED = "June 15, 2025";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
        className="mb-8"
      />

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 max-w-[72ch] space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            1. Acceptance of Terms
          </h2>
          <p className="mt-3">
            By accessing and using CalcForge (the &quot;Service&quot;), you
            agree to be bound by these Terms of Service. If you do not agree to
            these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. Description of Service
          </h2>
          <p className="mt-3">
            CalcForge provides free, web-based financial calculators including
            loan calculators, debt payoff tools, auto calculators, and
            related utilities. The Service is provided &quot;as is&quot; and is
            intended for informational and educational purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. Use of the Service
          </h2>
          <p className="mt-3">
            You may use CalcForge for personal, non-commercial purposes. You
            agree not to:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Use automated scripts or bots to scrape or mass-query the Service.</li>
            <li>Attempt to reverse-engineer, decompile, or modify the calculator source code.</li>
            <li>Misrepresent the source of calculations or present them as professional financial advice.</li>
            <li>Use the Service in any way that violates applicable law or regulation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. Accuracy Disclaimer
          </h2>
          <p className="mt-3">
            While we strive for accuracy using published rates and
            official data, CalcForge calculators provide estimates only. Individual
            circumstances can significantly affect actual results. You should not
            rely on CalcForge as your sole source of financial planning information.
            Consult a qualified financial professional for advice specific to your
            situation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. Intellectual Property
          </h2>
          <p className="mt-3">
            All content, design, code, and branding on CalcForge is the
            intellectual property of CalcForge and its contributors. You may not
            copy, redistribute, or create derivative works from our calculator
            code or content without express written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            6. Limitation of Liability
          </h2>
          <p className="mt-3">
            To the fullest extent permitted by law, CalcForge and its
            contributors shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages arising from your use of
            the Service, including but not limited to financial decisions made
            based on calculator results.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            7. Modifications
          </h2>
          <p className="mt-3">
            We reserve the right to modify these terms at any time. Continued
            use of the Service after modifications constitutes acceptance of the
            revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            8. Contact
          </h2>
          <p className="mt-3">
            Questions about these terms? Reach us at{" "}
            <a
              href="mailto:hello@thecalcforge.com"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              hello@thecalcforge.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}