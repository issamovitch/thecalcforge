import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import PersonalLoanCalculator from "@/components/calculators/PersonalLoanCalculator";
import {
  calculateLoan,
  calculateLoanWithExtra,
  calculateEffectiveAPR,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

export const dynamic = "force-static";

/* ─── Build-time computed examples (single source of truth) ─── */

function loanFromPayment(pmt: number, apr: number, months: number): number {
  const r = apr / 100 / 12;
  if (r === 0) return pmt * months;
  return Math.round(pmt * (1 - Math.pow(1 + r, -months)) / r * 100) / 100;
}

const LOAN = 20000;
const APR = 12;
const TERM = 60;
const FEE = 5;

// Base loan: $20K, 12%, 60mo
const exBase = calculateLoan({ loanAmount: LOAN, apr: APR, termMonths: TERM });

// With $100/mo extra from month 1
const exExtra = calculateLoanWithExtra({
  loanAmount: LOAN, apr: APR, termMonths: TERM,
  extraMonthly: 100, extraStartMonth: 1,
});

// With 5% origination fee
const exFee = calculateLoan({ loanAmount: LOAN, apr: APR, termMonths: TERM });
const exNetProceeds = LOAN * (1 - FEE / 100);
const exEffectiveAPR = calculateEffectiveAPR(exNetProceeds, exFee.monthlyPayment, TERM);

// By APR (for "by credit score" section)
const ex8 = calculateLoan({ loanAmount: LOAN, apr: 8, termMonths: TERM });
const ex12 = calculateLoan({ loanAmount: LOAN, apr: 12, termMonths: TERM });
const ex18 = calculateLoan({ loanAmount: LOAN, apr: 18, termMonths: TERM });
const ex24 = calculateLoan({ loanAmount: LOAN, apr: 24, termMonths: TERM });

// By term (for "$20,000 personal loan" section)
const ex24mo = calculateLoan({ loanAmount: LOAN, apr: APR, termMonths: 24 });
const ex36mo = calculateLoan({ loanAmount: LOAN, apr: APR, termMonths: 36 });
const ex48mo = calculateLoan({ loanAmount: LOAN, apr: APR, termMonths: 48 });
const ex60mo = calculateLoan({ loanAmount: LOAN, apr: APR, termMonths: 60 });
const ex72mo = calculateLoan({ loanAmount: LOAN, apr: APR, termMonths: 72 });

// Reverse: what loan does a $500/mo payment support at 12% for 60mo?
const reverseLoan = loanFromPayment(500, APR, TERM);

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/personal-loan-calculator`;
const pageTitle = "Personal Loan Calculator: Payment & Amortization";
const pageDescription =
  "Free personal loan calculator with amortization, origination fee, and extra payments. See monthly payment, total cost, and effective APR.";

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
    question: "What is an origination fee on a personal loan?",
    answer:
      "An origination fee is a percentage of the loan amount that the lender deducts before disbursing the funds. For example, a 5% fee on a $20,000 loan means you receive $19,000, but your monthly payments are calculated on the full $20,000. The calculator shows the net amount you receive and the effective APR based on those net proceeds, so you can see the real cost of borrowing.",
  },
  {
    question: "How do extra payments affect a personal loan?",
    answer:
      "Extra monthly payments reduce your principal balance faster than the standard amortization schedule. Because interest accrues on the remaining balance each month, every extra dollar you pay eliminates future interest on that amount. The calculator shows how many months you shorten the loan and how much total interest you save when you add an extra payment.",
  },
  {
    question: "Why is the effective APR higher than the stated APR?",
    answer:
      "When a lender charges an origination fee, you receive less money than the loan amount but still repay the full amount with interest. The effective APR accounts for this gap. It is the rate that makes the present value of your monthly payments equal to the net proceeds you actually received. The higher the origination fee, the larger the gap between the stated APR and the effective APR.",
  },
  {
    question: "How does loan term affect the total cost of a personal loan?",
    answer:
      "A longer term reduces each monthly payment but increases the total interest paid because the principal is outstanding for more months. A shorter term means higher monthly payments but less total interest. The calculator shows both the monthly payment and the total cost for any term you enter, so you can compare the tradeoff directly.",
  },
  {
    question: "Can I use this calculator for debt consolidation loans?",
    answer:
      "Yes. Enter the total amount you want to borrow, the APR offered by the lender, and the repayment term. If the lender charges an origination fee, enter it as well. The calculator will show your monthly payment, total interest, and effective APR. Compare the total cost against the sum of your current monthly payments to decide whether consolidation saves you money.",
  },
];

/* ─── Page Component ─── */

export default function PersonalLoanCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "Personal Loan Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Personal Loan Calculator"
        description="Free personal loan calculator with amortization schedule, origination fee support, and extra payment planning."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "Personal Loan Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Personal Loan Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A personal loan calculator shows your monthly payment, total interest,
        and full amortization schedule based on the loan amount, APR, and term.
        CalcForge&apos;s free calculator also supports an optional origination
        fee and extra monthly payments, so you can see the amount you actually
        receive and plan an early payoff.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <PersonalLoanCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── SEO Content (hidden from print) ─── */}
      <div className="print:hidden">

      <Separator className="my-12" />

      {/* H2: Personal Loan Payoff Calculator with Extra Payments */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Personal Loan Payoff Calculator with Extra Payments
        </h2>
        <p>
          Adding extra monthly payments to a personal loan reduces the
          principal balance faster, which means less interest accrues in
          subsequent months and the loan is retired sooner. The extra payment
          amount is applied directly to principal, so every dollar you add
          above the regular payment eliminates future interest on that dollar.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(LOAN)} loan at {formatPercent(APR)} APR for {TERM}{" "}
          months has a base monthly payment of {formatCurrency(exBase.monthlyPayment)}{" "}
          and total interest of {formatCurrency(exBase.totalInterest)}. Adding{" "}
          {formatCurrency(100)} per month from month 1 shortens the loan by{" "}
          {exExtra.monthsSaved} months and saves {formatCurrency(exExtra.interestSaved)}{" "}
          in interest, reducing the total cost from {formatCurrency(exBase.totalCost)}{" "}
          to {formatCurrency(exExtra.result.totalCost)}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Personal Loan Calculator with Amortization */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Personal Loan Calculator with Amortization
        </h2>
        <p>
          An amortization schedule breaks down every payment into its principal
          and interest components. In the early months, most of each payment
          covers interest because the outstanding balance is at its highest.
          As the balance declines, a larger share of each payment goes toward
          principal. The schedule continues until the balance reaches zero at
          the end of the term.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> On a{" "}
          {formatCurrency(LOAN)} loan at {formatPercent(APR)} APR for {TERM}{" "}
          months, the first payment of {formatCurrency(exBase.monthlyPayment)}{" "}
          covers {formatCurrency(exBase.schedule[0].interest)} in interest and{" "}
          {formatCurrency(exBase.schedule[0].principal)} in principal. By month
          {" "}{Math.floor(TERM / 2)}, the interest portion drops while the
          principal portion grows. Total interest over the full term is{" "}
          {formatCurrency(exBase.totalInterest)}, for a total repayment of{" "}
          {formatCurrency(exBase.totalCost)}.
        </p>
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-3">
              Origination Fee Note
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                An origination fee is deducted from the loan amount before
                disbursement. You receive less than the stated loan amount but
                repay the full amount with interest.
              </li>
              <li>
                The calculator displays an effective APR based on the net
                proceeds you receive, which is the true cost of borrowing.
              </li>
              <li>
                For a {formatCurrency(LOAN)} loan at {formatPercent(APR)} APR
                with a {FEE}% fee, you receive {formatCurrency(exNetProceeds)},
                the monthly payment is {formatCurrency(exFee.monthlyPayment)},
                and the effective APR is {formatPercent(exEffectiveAPR)}.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-10" />

      {/* H2: How Much Personal Loan Can I Get */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          How Much Personal Loan Can I Get
        </h2>
        <p>
          The loan amount a lender will approve depends on your income, existing
          debts, and credit profile, not a fixed formula you can compute in
          advance. Rather than asking &quot;how much can I get,&quot; the more
          useful question is: what loan amount fits your budget? If you know the
          monthly payment you can afford, the APR a lender might offer, and a
          comfortable repayment term, you can reverse-calculate the maximum
          principal that payment will support.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> If your budget
          supports a {formatCurrency(500)} monthly payment at {formatPercent(APR)}{" "}
          APR for {TERM} months, the loan amount that produces that payment is{" "}
          {formatCurrency(reverseLoan)}. Total interest would be{" "}
          {formatCurrency(calculateLoan({ loanAmount: reverseLoan, apr: APR, termMonths: TERM }).totalInterest)},
          and the total repayment would be{" "}
          {formatCurrency(500 * TERM)}. Use the calculator above by entering
          different loan amounts until the monthly payment matches your target.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Personal Loan Monthly Payment Calculator by Credit Score */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Personal Loan Monthly Payment Calculator by Credit Score
        </h2>
        <p>
          The APR a lender offers on a personal loan depends on the borrower&apos;s
          credit profile, income, and debt-to-income ratio. A stronger credit
          profile typically qualifies for a lower APR, which reduces both the
          monthly payment and the total interest paid. The table below shows how
          the same loan amount produces different payments at illustrative APRs,
          using {formatCurrency(LOAN)} over {TERM} months.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2.5 text-left font-semibold">Illustrative APR</th>
                <th className="px-4 py-2.5 text-right font-semibold">Monthly Payment</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total Interest</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2">{formatPercent(8)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex8.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex8.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex8.totalCost)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">{formatPercent(12)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex12.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex12.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex12.totalCost)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">{formatPercent(18)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex18.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex18.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex18.totalCost)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">{formatPercent(24)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex24.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex24.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex24.totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          These APRs are illustrative inputs, not rate quotes. Actual rates
          depend on your credit profile, the lender, and market conditions.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: $20,000 Personal Loan Payment Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {formatCurrency(LOAN)} Personal Loan Payment Calculator
        </h2>
        <p>
          Choosing the right term is a tradeoff between affordability and total
          cost. A shorter term means higher monthly payments but significantly
          less total interest. A longer term fits a tighter budget but adds
          thousands in interest over the life of the loan. The table below shows
          the payment, total interest, and total cost for a{" "}
          {formatCurrency(LOAN)} loan at {formatPercent(APR)} APR across common
          terms.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2.5 text-left font-semibold">Term</th>
                <th className="px-4 py-2.5 text-right font-semibold">Monthly Payment</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total Interest</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2">24 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex24mo.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex24mo.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex24mo.totalCost)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">36 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex36mo.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex36mo.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex36mo.totalCost)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">48 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex48mo.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex48mo.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex48mo.totalCost)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">60 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex60mo.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex60mo.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex60mo.totalCost)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">72 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex72mo.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex72mo.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(ex72mo.totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Extending the term from 24 months to 72 months drops the monthly
          payment from {formatCurrency(ex24mo.monthlyPayment)} to{" "}
          {formatCurrency(ex72mo.monthlyPayment)}, but total interest rises from{" "}
          {formatCurrency(ex24mo.totalInterest)} to {formatCurrency(ex72mo.totalInterest)}.
          The difference, {formatCurrency(ex72mo.totalInterest - ex24mo.totalInterest)},
          is the cost of the lower payment over those additional 48 months.
        </p>
      </section>

      <FaqSection faqs={faqs} />

      <Separator className="my-12" />

      {/* ─── Related Calculators ─── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Related Calculators</h2>
        <p className="text-muted-foreground">
          Compare personal loan costs against other borrowing products with our{" "}
          <a
            href="/loans/boat-rv-motorcycle-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Boat, RV &amp; Motorcycle Loan Calculator
          </a>
          ,{" "}
          <a
            href="/loans/business-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Business Loan Calculator
          </a>
          , or{" "}
          <a
            href="/loans/title-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Title Loan Calculator
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
