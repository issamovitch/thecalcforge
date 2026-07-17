import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import PaydayLoanCalculator from "@/components/calculators/PaydayLoanCalculator";
import {
  calculatePaydayLoan,
  calculateLoan,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ─── Build-time computed examples (single source of truth) ─── */

const EX = {
  /* Single-payment: $500, $75 fee, 14 days — the canonical worked example */
  single: calculatePaydayLoan({ loanAmount: 500, fee: 75, termDays: 14 }),
  /* Cost table: all at $15 per $100, 14-day term */
  cost100: calculatePaydayLoan({ loanAmount: 100, fee: 15, termDays: 14 }),
  cost300: calculatePaydayLoan({ loanAmount: 300, fee: 45, termDays: 14 }),
  cost500: calculatePaydayLoan({ loanAmount: 500, fee: 75, termDays: 14 }),
  cost1k: calculatePaydayLoan({ loanAmount: 1000, fee: 150, termDays: 14 }),
  /* Installment: $500 @ 400% APR, 6 months */
  installment: calculateLoan({ loanAmount: 500, apr: 400, termMonths: 6 }),
  costAmounts: [100, 300, 500, 1000],
};

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/payday-loan-calculator`;
const pageTitle = "Payday Loan APR Calculator – Estimate Fees & Total Cost";
const pageDescription =
  "Free payday loan APR calculator. Convert flat fees into annualized rates, see total repayment cost, and compare rollover scenarios before you borrow.";

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
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
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
    question: "How is payday loan APR calculated?",
    answer:
      "Payday loan APR is computed by annualizing the flat fee over the loan term. The formula is: (fee ÷ loan amount) ÷ days × 365 × 100. A $75 fee on a $500 loan due in 14 days, for example, produces an APR of 391.1%. This high number reflects the fact that a two-week fee is being multiplied by roughly 26 to express it as an annual rate — it does not mean you pay 391% in interest, but it does make the cost comparable to credit cards and personal loans.",
  },
  {
    question: "What happens if I roll over a payday loan?",
    answer:
      "Rolling over a payday loan means paying only the fee to extend the due date, typically by another 14 days. The original principal is not reduced. Each rollover adds another full fee, so rolling over a $500 loan with a $75 fee four times means paying $375 in fees alone — 75% of the amount you originally borrowed — over 70 days, and you still owe the full $500.",
  },
  {
    question: "How is a payday loan different from an installment loan?",
    answer:
      "A traditional payday loan is a single-payment product: you borrow a lump sum and repay it plus a flat fee on your next payday (usually 14 days). An installment payday loan spreads repayment over multiple months, using an amortizing schedule where each payment covers both interest and principal. Installment loans carry APRs similar to single-payment loans but break the cost into smaller, more manageable payments.",
  },
  {
    question: "What happens if I default on a payday loan?",
    answer:
      "Defaulting on a payday loan triggers late fees (in Texas, 5% of the payment amount or $7.50, whichever is greater, after 10 days), collections activity, and potential bank account debits if you authorized electronic access. The lender may also report the default to credit bureaus. Unlike title loans, payday loans are unsecured, so your property cannot be repossessed, but the fees and collection costs can quickly exceed the original loan amount.",
  },
  {
    question: "Can I pay off a payday loan early?",
    answer:
      "Yes. Because single-payment payday loans charge a flat fee rather than accruing daily interest, there is no prepayment savings — the total due is the same whether you pay on day 1 or day 14. For installment payday loans, early repayment can reduce total interest, since interest accrues on the outstanding balance each month. Check your loan agreement for any prepayment penalties, though these are uncommon in payday lending.",
  },
];

/* ─── Page Component ─── */

export default function PaydayLoanCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <CanonicalUrl path="/loans/payday-loan-calculator" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "Payday Loan APR Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Payday Loan APR Calculator"
        description="Free online payday loan APR calculator. Convert flat fees into annualized rates, see total repayment cost, and compare rollover scenarios."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "Payday Loan APR Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Payday Loan APR Calculator
      </h1>

      {/* Intro — targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A payday loan APR calculator converts a flat fee on a short-term loan
        into an annualized percentage rate so you can compare the cost against
        credit cards and personal loans. Enter the loan amount, the fee, and
        the repayment term to see the true APR, total cost, and what happens
        if the loan is rolled over.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <PaydayLoanCalculator />
      </div>

      {/* ─── SEO Content (hidden from print) ─── */}
      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: How to Calculate Payday Loan APR */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How to Calculate Payday Loan APR
          </h2>
          <p>
            Payday loans do not charge interest in the traditional sense. Instead,
            the lender charges a flat finance fee that is due along with the
            principal on your next payday. Because the fee is expressed as a
            dollar amount rather than a percentage, borrowers often
            underestimate the true cost. The APR formula annualizes that fee
            into a rate that can be compared across all loan products.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Payday Loan APR Formula
              </p>
              <p className="font-mono text-sm text-ember break-all">
                APR = (Fee &divide; Loan Amount) &divide; Days &times; 365
                &times; 100
              </p>
            </CardContent>
          </Card>
          <p>
            <strong>Worked example (computed by engine):</strong> A $500
            payday loan with a $75 fee due in 14 days produces an APR of{" "}
            <strong>{formatPercent(EX.single.apr)}</strong>, a total repayment
            of {formatCurrency(EX.single.totalRepayment)}, and a cost of{" "}
            {formatCurrency(EX.single.costPerHundred)} per $100 borrowed.
          </p>
          <p>
            That 391% APR does not mean you pay 391% in interest. It means that
            if you paid a $75 fee every two weeks for an entire year, the
            cumulative fees would equal roughly 391% of the $500 principal. The
            APR is a standardized comparison tool, not a prediction of what you
            will actually pay — unless you roll the loan over repeatedly, which
            is where the real financial damage occurs.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Payday Loan Payoff Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Payday Loan Payoff Calculator
          </h2>
          <p>
            A payday loan payoff calculator projects what happens when you
            cannot repay the full amount on the due date and instead roll the
            loan over — paying only the fee to buy more time. Each rollover
            charges the full fee again on the original principal. The principal
            balance never decreases unless you pay more than the fee.
          </p>
          <p>
            <strong>Rollover projection (computed by engine, $500 loan, $75
            fee, 14-day term):</strong>
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>
                  <strong>1 rollover</strong> (28 days): cumulative fees{" "}
                  {formatCurrency(EX.single.rollovers[0].totalFees)}, total
                  due {formatCurrency(EX.single.rollovers[0].totalRepayment)}{" "}
                  — you have paid more in fees than a credit card would charge
                  in interest on the same amount.
                </li>
                <li>
                  <strong>2 rollovers</strong> (42 days): cumulative fees{" "}
                  {formatCurrency(EX.single.rollovers[1].totalFees)}, total
                  due {formatCurrency(EX.single.rollovers[1].totalRepayment)}{" "}
                  — nearly half the loan amount is now fees alone.
                </li>
                <li>
                  <strong>4 rollovers</strong> (70 days): cumulative fees{" "}
                  {formatCurrency(EX.single.rollovers[2].totalFees)}, total
                  due {formatCurrency(EX.single.rollovers[2].totalRepayment)}{" "}
                  — you have paid {formatCurrency(EX.single.rollovers[2].totalFees - EX.single.financeCharge)} in rollover fees
                  alone, and the original $500 is still outstanding.
                </li>
              </ul>
            </CardContent>
          </Card>
          <p>
            This is why regulators focus on rollovers. A single two-week payday
            loan is expensive but finite. Rolling it over converts a short-term
            expense into a long-term debt trap where fees compound without
            reducing the balance. Many states restrict or ban rollovers
            entirely.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Does a $500 Payday Loan Cost */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Does a $500 Payday Loan Cost
          </h2>
          <p>
            The table below shows the cost of payday loans at four common loan
            sizes, using a $15-per-$100 fee structure and a standard 14-day
            term. The APR is identical across all sizes because the fee scales
            proportionally with the loan amount.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3">
                Payday Loan Cost Comparison ($15 per $100, 14-day term)
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="font-medium">{formatCurrency(EX.costAmounts[0])} loan, 14 days</span>
                  <span>{formatCurrency(EX.cost100.totalRepayment)} due ({formatPercent(EX.cost100.apr)} APR)</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">{formatCurrency(EX.costAmounts[1])} loan, 14 days</span>
                  <span>{formatCurrency(EX.cost300.totalRepayment)} due ({formatPercent(EX.cost300.apr)} APR)</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">{formatCurrency(EX.costAmounts[2])} loan, 14 days</span>
                  <span>{formatCurrency(EX.cost500.totalRepayment)} due ({formatPercent(EX.cost500.apr)} APR)</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">{formatCurrency(EX.costAmounts[3])} loan, 14 days</span>
                  <span>{formatCurrency(EX.cost1k.totalRepayment)} due ({formatPercent(EX.cost1k.apr)} APR)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <p>
            At this fee structure, a $500 borrower pays {formatCurrency(EX.cost500.financeCharge)} in fees
            over 14 days. That is a significant cost for a short-term advance.
            Actual fees vary by lender and state, and many states impose lower
            caps or prohibit payday lending entirely.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Installment Payday Loan Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Installment Payday Loan Calculator
          </h2>
          <p>
            Some states permit installment payday loans, which spread repayment
            over several months using an amortizing schedule. Unlike a
            single-payment payday loan (which has no monthly payment — the full
            amount is due at once), an installment loan breaks the cost into
            equal monthly payments. The APR, however, remains extremely high.
          </p>
          <p>
            According to the Texas Office of Consumer Credit
            Commissioner&apos;s{" "}
            <a
              href="https://www.occc.texas.gov/publications/reports"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              2025 Report on Availability, Quality and Pricing of Certain
              Financial Services and Consumer Loan Products
            </a>{" "}
            (published December&nbsp;1, 2025, covering 2024 data), payday loan
            APRs in Texas range from 365% to 496%. The OCCC&apos;s benchmark:
            a $1,500 payday loan carries 11 monthly payments of $457 plus a
            final payment of $1,957, with a finance charge of $5,486 and total
            repayment of $6,986 — 4.7 times the amount borrowed.
          </p>
          <p>
            The report also documents that Credit Access Business (CAB) fees
            are uncapped by state law, that the third-party lender&apos;s
            interest rate is 10% or less, that typical loan amounts range from
            $400 to $1,200, and that 2024 installment CAB fees totaled $1.3
            billion statewide compared to $42.6 million in single-payment CAB
            fees.
          </p>
          <p>
            <strong>Worked example (computed by engine):</strong> A $500
            installment payday loan at 400% APR over 6 months produces a
            monthly payment of {formatCurrency(EX.installment.monthlyPayment)},
            total interest of {formatCurrency(EX.installment.totalInterest)},
            and a total repayment of {formatCurrency(EX.installment.totalCost)}.
            Switch the calculator above to &ldquo;Installment&rdquo; mode to
            see the full amortization schedule.
          </p>
          <p className="text-xs text-muted-foreground">
            Source:{" "}
            <a
              href="https://www.occc.texas.gov/publications/reports"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember hover:text-ember-hover underline underline-offset-4"
            >
              Texas OCCC, 2025 Report on Availability, Quality and Pricing of
              Certain Financial Services and Consumer Loan Products
            </a>{" "}
            (Dec.&nbsp;1, 2025, covering 2024 data),{" "}
            <a
              href="https://www.occc.texas.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember hover:text-ember-hover underline underline-offset-4"
            >
              occc.texas.gov
            </a>
            . Last verified: July&nbsp;2025.
          </p>
        </section>

        <Separator className="my-12" />

        {/* ─── FAQ Section ─── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-lg border bg-card"
              >
                <summary className="cursor-pointer select-none px-5 py-4 text-sm font-semibold text-foreground hover:text-ember transition-colors list-none flex items-center justify-between">
                  {faq.question}
                  <ChevronIcon />
                </summary>
                <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* ─── Related Calculators ─── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Related Calculators
          </h2>
          <p className="text-muted-foreground">
            Compare payday loan costs against secured title loans with our{" "}
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
    </div>
  );
}

/* ─── Sub-components ─── */

function ChevronIcon() {
  return (
    <svg
      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}