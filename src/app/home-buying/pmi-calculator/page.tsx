import type { Metadata } from "next";
import { siteConfig, VERIFIED_DATE } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import PMICalculator from "@/components/calculators/PMICalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

export const dynamic = "force-static";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/home-buying/pmi-calculator`;
const pageTitle =
  "PMI Calculator \u2013 Private Mortgage Insurance Cost";
const pageDescription =
  "Free PMI calculator. Estimate your monthly private mortgage insurance by credit score and down payment, and see when PMI drops off at 78-80% LTV.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: pageUrl,
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
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
};

/* ─── FAQ Data ─── */

const faqs = [
  {
    question: "Is PMI tax deductible?",
    answer:
      "Mortgage insurance premiums are tax deductible through the end of 2025 under the Tax Cuts and Jobs Act extension, but only if you itemize deductions. The deduction phases out at adjusted gross income (AGI) levels above $100,000 for single filers and $50,000 for married filing separately. Consult a tax professional to confirm eligibility for your situation, as IRS rules change periodically.",
  },
  {
    question: "Can I avoid PMI with less than 20% down?",
    answer:
      "Yes, several strategies exist. A piggyback loan (such as an 80-10-10 structure) uses a second mortgage to cover part of the down payment so the first mortgage stays at or below 80% LTV, eliminating PMI. Lender-paid PMI is another option where the lender covers the cost in exchange for a slightly higher interest rate. VA loans and USDA loans do not require PMI at all, though they have their own funding fees and guarantee fees.",
  },
  {
    question: "How do I get PMI removed?",
    answer:
      "You can request PMI removal once your loan-to-value ratio reaches 80% based on the original property value or a new appraisal. Submit a written request to your loan servicer. The servicer may require a current appraisal to confirm the home value has not declined. Federal law requires automatic cancellation at 78% LTV, provided you are current on payments. For FHA loans with less than 10% down originated after June 2013, MIP generally lasts for the life of the loan.",
  },
  {
    question: "Does PMI affect my credit score?",
    answer:
      "Private mortgage insurance does not appear on your credit report and has no direct impact on your credit score. However, the mortgage payment itself (including the PMI portion) does affect your credit if you make late payments. Consistent on-time mortgage payments help build a positive payment history, which is the largest factor in credit scoring. PMI itself is simply a cost added to your monthly obligation.",
  },
  {
    question: "What is the average PMI rate?",
    answer:
      "PMI rates typically range from 0.30% to 1.50% of the original loan amount per year, depending primarily on your credit score and down payment. Borrowers with excellent credit (760+) and a 10% down payment might pay around 0.30% to 0.55% annually, while those with fair credit (680-719) and 5% down could pay 0.80% to 1.20%. These are estimates and actual rates vary by insurer and lender. Rates were last reviewed in " +
      VERIFIED_DATE +
      ".",
  },
];

/* ─── Page Component ─── */

export default function PMICalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: "Home Buying Calculators",
            url: `${siteConfig.url}/home-buying`,
          },
          { name: "PMI Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="PMI Calculator"
        description="Free online PMI calculator. Estimate monthly private mortgage insurance cost by credit score and down payment, and see when PMI drops off at 78-80% LTV."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Home Buying Calculators", href: "/home-buying" },
          { label: "PMI Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        PMI Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        Private mortgage insurance (PMI) is a policy that protects the lender
        when a home buyer puts down less than 20% on a conventional mortgage.
        Lenders require PMI because loans above 80% loan-to-value (LTV) carry
        higher default risk. This PMI calculator estimates your monthly PMI cost
        based on your home price, down payment, credit score, and mortgage term.
        It also shows the month and year when PMI automatically drops off as
        your balance declines to 78% LTV. Keep in mind that actual PMI rates
        vary by insurer and lender, so the figures here are estimates.
      </p>

      {/* Calculator (client component) */}
      <div className="mt-8">
        <PMICalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: PMI Calculator by Credit Score */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            PMI Calculator by Credit Score
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            PMI rates are determined primarily by two factors: your credit score
            and your loan-to-value ratio. Insurers price policies using credit
            score bands that reflect the statistical likelihood of default. A
            higher score signals lower risk, which translates into a lower
            annual premium.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The typical credit score bands and their approximate annual PMI rate
            ranges (as of {VERIFIED_DATE}) are:
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Credit Score Impact on PMI: $300,000 Home, 10% Down ($270,000
                Loan, 90% LTV)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Excellent (760+):</strong> 0.30% to 0.55% annually,
                roughly $68 to $124/month.{" "}
                <strong>Good (720-759):</strong> 0.55% to 0.78% annually,
                roughly $124 to $176/month.{" "}
                <strong>Fair (680-719):</strong> 0.78% to 1.05% annually,
                roughly $176 to $236/month.{" "}
                <strong>Below Average (640-679):</strong> 1.05% to 1.50%
                annually, roughly $236 to $338/month. These are estimates and
                actual premiums vary by insurer.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The difference between the lowest and highest band can exceed $200
            per month on a $270,000 loan. Improving your credit score before
            applying is one of the most effective ways to reduce PMI costs. Even
            a modest score increase that moves you from one band to the next can
            save thousands over the life of the insurance.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Is PMI on a $300,000 Mortgage */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Is PMI on a $300,000 Mortgage
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To illustrate how PMI works with real numbers, consider a $300,000
            home purchase with a 30-year fixed-rate mortgage at 6.5% and a
            credit score in the good range (720-759). The PMI cost changes
            depending on how much you put down.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>5% down ($15,000):</strong> Loan amount $285,000 at 95%
            LTV. Estimated PMI rate 0.78% to 1.05%, producing a monthly PMI of
            roughly $186 to $249. Annual cost: $2,228 to $2,993.{" "}
            <strong>10% down ($30,000):</strong> Loan amount $270,000 at 90%
            LTV. Estimated PMI rate 0.55% to 0.78%, producing a monthly PMI of
            roughly $124 to $176. Annual cost: $1,485 to $2,106.{" "}
            <strong>15% down ($45,000):</strong> Loan amount $255,000 at 85%
            LTV. Estimated PMI rate 0.35% to 0.55%, producing a monthly PMI of
            roughly $74 to $117. Annual cost: $893 to $1,403.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Using the 10% down scenario, the monthly principal and interest
            payment on $270,000 at 6.5% is approximately $1,706. Adding PMI of
            roughly $150 brings the total to about $1,856 before taxes and
            insurance. At this payment level, the loan balance reaches 78% LTV
            (about $234,000) in approximately year 7. Total PMI paid over that
            period would be roughly $12,600. These are estimates; actual amounts
            depend on your specific PMI rate and amortization schedule.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: When Does PMI Drop Off Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            When Does PMI Drop Off Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Federal law establishes two key thresholds for PMI termination. At
            80% LTV, you have the right to request cancellation in writing.
            Your servicer must honor the request if you have a good payment
            history, are current on the mortgage, and the home value has not
            declined. An appraisal may be required to verify current value.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            At 78% LTV, the Homeowners Protection Act (HPA) requires the
            servicer to cancel PMI automatically on the date the scheduled
            principal balance first reaches that level. No request or appraisal
            is needed at this point. This automatic termination applies to
            conventional loans originated after July 29, 1999.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            As an example, a $270,000 loan at 6.5% over 30 years reaches 80%
            LTV ($216,000 balance) at approximately month 84 (year 7) and 78%
            LTV ($210,600 balance) at approximately month 93 (year 8). These
            timelines shorten significantly if you make extra principal
            payments. For FHA loans with less than 10% down originated after
            June 2013, mortgage insurance premium (MIP) generally lasts for the
            entire loan term and cannot be removed in the same way.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: FHA MIP vs PMI Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            FHA MIP vs PMI Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            FHA mortgage insurance premium (MIP) differs from conventional PMI
            in both structure and duration. FHA charges an upfront MIP of 1.75%
            of the loan amount at closing, plus an annual MIP that ranges from
            0.15% to 0.75% depending on the loan term and LTV ratio. For a
            $270,000 FHA loan, the upfront cost alone is $4,725.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The most significant difference is duration. For most conventional
            loans, PMI drops off once the balance reaches 78% LTV, typically
            within 7 to 10 years. For FHA loans with less than 10% down
            originated after June 2013, the annual MIP lasts for the life of
            the loan. This means you could pay mortgage insurance for 30 years
            on an FHA loan, compared to roughly 8 years on a comparable
            conventional loan.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Side-by-Side Comparison: $300,000 Home, 10% Down, 30-Year Term
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Conventional PMI:</strong> $270,000 loan, estimated
                0.65% annual rate. Monthly PMI roughly $146. Drops off at 78%
                LTV around year 8. Total PMI paid: approximately $12,000 to
                $14,000 over the life of the insurance.{" "}
                <strong>FHA MIP:</strong> $270,000 loan, 1.75% upfront MIP
                ($4,725 at closing) plus 0.55% annual MIP ($124/month). MIP
                continues for 30 years. Total MIP paid: roughly $49,400
                ($4,725 upfront plus $44,650 over 30 years). FHA may still be
                worth it if the interest rate is substantially lower or if your
                credit score makes conventional PMI prohibitively expensive.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: PMI Removal Calculator LTV */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            PMI Removal Calculator LTV
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To request PMI removal at 80% LTV, contact your loan servicer in
            writing. The servicer will review your payment history to confirm
            you have been current for the prior 12 months (or 24 months for
            high-risk loans). If your original appraisal does not show
            sufficient equity, the servicer may require a new appraisal at your
            expense to verify the home value has not declined.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Once your scheduled principal balance hits 78% LTV, federal law
            requires the servicer to cancel PMI automatically. This happens on
            the date your amortization schedule first reaches that threshold.
            At that point, no action is required on your part. If you reach the
            midpoint of the loan term (15 years on a 30-year mortgage) and PMI
            has not been canceled, the servicer must terminate it automatically
            as long as you are current.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Refinancing is another path to eliminating PMI. If your home has
            appreciated or you have paid down the balance enough to reach 20%
            equity, a new conventional loan at 80% or lower LTV will not
            require PMI. Making extra principal payments accelerates this
            timeline. Even an additional $100 per month toward principal can
            shave months or years off your PMI obligation. Home appreciation
            also helps: if your $300,000 home increases in value to $350,000
            and your balance is $260,000, your LTV drops to roughly 74%, which
            may qualify you for immediate PMI removal with a new appraisal.
          </p>
        </section>

        <FaqSection faqs={faqs} />

        <Separator className="my-12" />

        {/* ─── Related Calculators ─── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Related Calculators
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Browse all tools on the{" "}
            <a
              href="/home-buying"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Home Buying Calculators
            </a>{" "}
            hub. A{" "}
            <a
              href="/home-buying"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Down Payment Calculator
            </a>{" "}
            and{" "}
            <a
              href="/home-buying"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Home Affordability Calculator
            </a>{" "}
            are coming soon. You can also use our{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            to check whether your total debt payments, including the new
            mortgage and PMI, fit within lender qualification limits, or the{" "}
            <a
              href="/loans/auto-loan-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Auto Loan Calculator
            </a>{" "}
            to compare your existing auto debt against your projected housing
            costs.
          </p>
        </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
      </div>
    </div>
  );
}
