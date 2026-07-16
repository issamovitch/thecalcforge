import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "CalcForge disclaimer: our calculators provide estimates, not professional tax or financial advice.",
  alternates: { canonical: `${siteConfig.url}/disclaimer` },
  openGraph: {
    title: "Disclaimer",
    description: "CalcForge calculators provide estimates, not professional tax or financial advice.",
    url: `${siteConfig.url}/disclaimer`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary" as const,
    title: "Disclaimer",
  },
};

const LAST_UPDATED = "June 15, 2025";

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Disclaimer" }]}
        className="mb-8"
      />

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Disclaimer
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 max-w-[72ch] space-y-6 text-muted-foreground leading-relaxed">
        <div className="rounded-lg border border-ember/30 bg-ember/5 p-5">
          <p className="font-semibold text-foreground">
            CalcForge calculators are for informational and educational purposes
            only. They are not a substitute for professional tax, financial, or
            legal advice.
          </p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Estimates, Not Guarantees
          </h2>
          <p className="mt-3">
            The results provided by CalcForge calculators are estimates based on
            published federal and state tax brackets, standard deductions, and
            FICA rates for the 2026 tax year. While we make every effort to
            ensure accuracy, actual take-home pay may differ due to factors
            including but not limited to:
          </p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Additional state or local taxes not modeled in our calculators</li>
            <li>Tax credits, itemized deductions, or special circumstances</li>
            <li>Employer-specific benefits, garnishments, or wage attachments</li>
            <li>Changes to tax law that occur after our last data update</li>
            <li>Rounding differences between annual and per-paycheck calculations</li>
            <li>Self-employment tax, which is not covered by our W-2 paycheck calculator</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Not Tax Advice
          </h2>
          <p className="mt-3">
            Nothing on CalcForge constitutes tax advice, financial advice, or
            legal counsel. Every taxpayer&apos;s situation is unique, and the
            information presented here may not apply to your specific
            circumstances. For guidance on filing your taxes, optimizing your
            withholding, or making financial decisions, please consult a
            qualified Certified Public Accountant (CPA), Enrolled Agent, or
            licensed financial advisor.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Data Accuracy
          </h2>
          <p className="mt-3">
            Tax rates and brackets are sourced from official government
            publications and are annotated with verification dates. Tax law is
            subject to change, and some provisions may be updated retroactively.
            CalcForge strives to update its data promptly when changes are
            announced, but we cannot guarantee real-time accuracy. Always verify
            critical figures against official IRS and state revenue department
            publications.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            No Warranties
          </h2>
          <p className="mt-3">
            CalcForge is provided &quot;as is&quot; without warranties of any
            kind, either express or implied, including but not limited to
            warranties of merchantability, fitness for a particular purpose, or
            non-infringement. We do not warrant that the Service will be
            uninterrupted, error-free, or free of harmful components.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            Your Responsibility
          </h2>
          <p className="mt-3">
            By using CalcForge, you accept full responsibility for any decisions
            you make based on our calculator results. We encourage you to
            cross-reference our estimates with official tax resources and, when
            in doubt, seek professional guidance. A quick check with a CPA can
            save you from costly surprises come tax season.
          </p>
        </section>
      </div>
    </div>
  );
}