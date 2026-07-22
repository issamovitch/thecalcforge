import type { Metadata } from "next";
import { siteConfig, VERIFIED_DATE } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import BusinessLoanCalculator from "@/components/calculators/BusinessLoanCalculator";
import {
  calculateLoan,
  calculateLoanWithExtra,
  calculateBalloonLoan,
  calculateMCA,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

export const dynamic = "force-static";

/* ─── Build-time computed examples (single source of truth) ─── */

const EX = {
  // Term loan example: $100K at 9% for 60 months
  term: calculateLoan({ loanAmount: 100000, apr: 9, termMonths: 60 }),
  // Term loan with extra: $100K at 9% 60mo + $500/mo from month 1
  termExtra: calculateLoanWithExtra({ loanAmount: 100000, apr: 9, termMonths: 60, extraMonthly: 500, extraStartMonth: 1 }),
  // Equipment: $50K equipment, $10K down, $15K balloon, 9% 60mo
  equipment: calculateBalloonLoan({ loanAmount: 50000, downPayment: 10000, balloonAmount: 15000, apr: 9, termMonths: 60 }),
  // MCA: $50K advance, 1.4 factor, 12 months
  mca: calculateMCA({ advanceAmount: 50000, factorRate: 1.4, repaymentMonths: 12 }),
};

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/business-loan-calculator`;
const pageTitle = "Business Loan Calculator: Payments & APR";
const pageDescription =
  "Free business loan calculator for term loans, equipment financing, and merchant cash advances. Estimate payments, total cost, and effective APR at CalcForge.";

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
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
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
    question: "How is a business loan different from a personal loan?",
    answer:
      "Business loans typically offer higher amounts, longer terms, and may use business assets as collateral. Interest rates vary widely depending on the lender, loan type, and the borrower's credit profile. SBA loans offer the most favorable rates, while merchant cash advances carry the highest effective costs.",
  },
  {
    question: "What is a balloon payment on an equipment loan?",
    answer:
      "A balloon payment is a large lump sum due at the end of the loan term. The monthly payments are calculated on the loan amount minus the balloon, so each payment is lower than it would be on a fully amortizing loan. At maturity, the remaining balance (the balloon) must be paid in full or refinanced.",
  },
  {
    question: "Why does a merchant cash advance have a higher APR when repaid faster?",
    answer:
      "Because the total payback amount is fixed in advance. Whether you repay in 6 months or 12 months, you pay the same total. Shortening the repayment period means the same fee is spread over fewer days, which raises the annualized cost. This is the opposite of a traditional loan, where paying faster always reduces total cost.",
  },
  {
    question: "Should I use the Term Loan or Equipment Loan mode?",
    answer:
      "Use Term Loan for standard business loans with no balloon payment. Use Equipment Loan when financing equipment with a residual or buyout value at the end of the term. If your equipment lease quotes a residual value, enter it as the balloon amount.",
  },
  {
    question: "What is an SBA 7(a) loan?",
    answer:
      "The SBA 7(a) program is the SBA's primary loan product for small businesses. The SBA guarantees a portion of the loan, which reduces the lender's risk and often results in lower rates. Rates are tied to the prime rate plus a statutory spread. Not all businesses qualify, and the application process can take several weeks.",
  },
];

/* ─── Page Component ─── */

export default function BusinessLoanCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "Business Loan Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Business Loan Calculator"
        description="Free business loan calculator for term loans, equipment financing, and merchant cash advances. Estimate payments, total cost, and effective APR."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "Business Loan Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Business Loan Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        Business loan calculator tools let you estimate monthly payments, total
        cost, and effective APR before committing to financing. CalcForge&apos;s
        free business loan calculator supports three common business lending
        products: term loans with amortization schedules, equipment loans with
        balloon payments, and merchant cash advances with factor-rate pricing.
        Each mode uses the correct math for its loan type so your estimates are
        accurate.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <BusinessLoanCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── SEO Content (hidden from print) ─── */}
      <div className="print:hidden">

      <Separator className="my-12" />

      {/* H2: Business Loan Calculator with Extra Payments */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Business Loan Calculator with Extra Payments
        </h2>
        <p>
          Adding even small extra payments to a term loan can significantly
          reduce total interest over the life of the loan. Because interest is
          calculated on the remaining balance each month, every additional dollar
          applied to principal immediately stops future interest from accruing on
          that amount. Over a multi-year business term loan, the savings can be
          substantial.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A $100,000
          business term loan at 9% APR for 60 months has a base monthly payment
          of {formatCurrency(EX.term.monthlyPayment)}. By adding an extra{" "}
          {formatCurrency(500)} per month starting from month 1, you would
          save {EX.termExtra.monthsSaved} month{EX.termExtra.monthsSaved !== 1 ? "s" : ""} and{" "}
          {formatCurrency(EX.termExtra.interestSaved)} in total interest. The
          total payoff drops to {formatCurrency(EX.termExtra.result.totalCost)}{" "}
          compared to {formatCurrency(EX.term.totalCost)} without extra
          payments. Use the extra payment fields in the calculator above to
          model your own early payoff scenario.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Business Loan Calculator Amortization */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Business Loan Calculator Amortization
        </h2>
        <p>
          Amortization refers to how each monthly payment on a business loan is
          split between interest and principal. In the early months, the
          majority of the payment covers interest. As the balance declines, the
          interest portion shrinks and the principal portion grows. By the final
          months, nearly the entire payment goes toward reducing the principal.
        </p>
        <p>
          The calculator above generates a full amortization schedule so you can
          see this shift month by month. For the $100,000 term loan at 9% APR
          over 60 months, the monthly payment is{" "}
          {formatCurrency(EX.term.monthlyPayment)}, total interest is{" "}
          {formatCurrency(EX.term.totalInterest)}, and the total cost over the
          full 60-month term is {formatCurrency(EX.term.totalCost)}. Reviewing
          the schedule helps you understand exactly how much of each payment
          reduces your outstanding balance.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: SBA Loan Calculator Monthly Payment */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          SBA Loan Calculator Monthly Payment
        </h2>
        <p>
          The U.S. Small Business Administration (SBA) does not lend money
          directly. Instead, it guarantees a portion of loans made by approved
          lenders, which reduces the lender&apos;s risk and typically results
          in lower rates for the borrower.
        </p>
        <p>
          Current SBA 7(a) rates are set at prime plus a statutory spread
          (capped by the SBA) and change as the prime rate changes. For the
          latest rates, see the SBA&apos;s official fee schedule at{" "}
          <a
            href="https://www.sba.gov/document/sba--7a-loan-program-interest-rate-fee-schedule-form-3507"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            sba.gov
          </a>
          . You can model any SBA loan in the Term Loan mode above by entering
          the offered rate.
        </p>
        <p className="text-xs text-muted-foreground">
          Source: U.S. Small Business Administration, 7(a) Loan Program Interest
          Rate &amp; Fee Schedule. Last verified: {VERIFIED_DATE}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Equipment Loan Payment Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Equipment Loan Payment Calculator
        </h2>
        <p>
          Equipment loans often include a balloon payment, which is a large lump
          sum due at the end of the loan term. The monthly payments are
          calculated on the financed amount minus the balloon, so each payment
          is lower than it would be on a fully amortizing loan. At maturity, the
          remaining balance must be paid in full or refinanced. This structure
          is common when equipment retains significant resale or residual value
          at the end of the financing term.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A $50,000
          equipment purchase with $10,000 down and a $15,000 balloon at 9% APR
          for 60 months. The amount financed is{" "}
          {formatCurrency(EX.equipment.financedAmount)}, producing monthly
          payments of {formatCurrency(EX.equipment.monthlyPayment)}. The{" "}
          {formatCurrency(EX.equipment.balloonAmount)} balloon is due at month
          60. Total cost of the financing is{" "}
          {formatCurrency(EX.equipment.totalCost)}, with total interest of{" "}
          {formatCurrency(EX.equipment.totalInterest)}. Note that the balloon
          reduces the monthly payment compared to a standard term loan on the
          same amount.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Merchant Cash Advance Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Merchant Cash Advance Calculator
        </h2>
        <p>
          A merchant cash advance (MCA) is not a loan. It is a purchase of
          future receivables. The funder provides an upfront cash advance in
          exchange for a fixed total payback amount, expressed as a factor rate
          (for example, 1.4 means you repay $1.40 for every $1.00 advanced). The
          cost is therefore a fixed finance charge, not an interest rate that
          accrues on a declining balance.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A $50,000
          advance at a 1.4 factor rate over 12 months. Total payback is{" "}
          {formatCurrency(EX.mca.totalPayback)}, finance charge is{" "}
          {formatCurrency(EX.mca.financeCharge)}, and the effective APR is{" "}
          {formatPercent(EX.mca.effectiveAPR)}. Daily remittance is{" "}
          {formatCurrency(EX.mca.dailyPayment)} and weekly remittance is{" "}
          {formatCurrency(EX.mca.weeklyPayment)} (weekly is exactly 7 times
          daily).
        </p>
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-3">
              Important: MCA Cost Disclosure Limitations
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                Factor rates are not APRs and cannot be directly compared to
                interest rates on traditional loans.
              </li>
              <li>
                MCAs are largely unregulated at the federal level and in many
                states, meaning there are no caps on factor rates or mandatory
                disclosures.
              </li>
              <li>
                Faster repayment means a higher effective APR because the same
                fixed fee is compressed into fewer months.
              </li>
              <li>
                Daily ACH withholdings create cash flow pressure, since the
                remittance is pulled automatically every business day regardless
                of your actual sales volume on that day.
              </li>
              <li>
                The &ldquo;effective APR&rdquo; shown is a simple annualized
                approximation, not a Truth in Lending Act disclosure.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <FaqSection faqs={faqs} />

      <Separator className="my-12" />

      {/* ─── Related Calculators ─── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Related Calculators</h2>
        <p className="text-muted-foreground">
          Compare business loan costs against other short-term lending products
          with our{" "}
          <a
            href="/loans/title-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Title Loan Calculator
          </a>{" "}
          or{" "}
          <a
            href="/loans/payday-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Payday Loan APR Calculator
          </a>
          , or browse all tools on the{" "}
          <a
            href="/loans"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Loan Calculators
          </a>{" "}
          hub.
        </p>
      </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
      </div>
    </div>
  );
}
