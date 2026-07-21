import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import StudentLoanPayoffCalculator from "@/components/calculators/StudentLoanPayoffCalculator";
import {
  calculateStudentLoanPayoff,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── Build-time computed examples (single source of truth) ─── */

const BAL = 30000;
const APR = 6.5;
const PMT = 350;

// Default: $30,000 at 6.50% with $350/month
const exBase = calculateStudentLoanPayoff(BAL, APR, PMT);

// With $100/mo extra ($450 total)
const exExtra = calculateStudentLoanPayoff(BAL, APR, PMT, 100, 0);

// With $5,000 lump sum in month 1
const exLump = calculateStudentLoanPayoff(BAL, APR, PMT, 0, 5000);

// How-fast table: $350 / $500 / $750
const ex350 = calculateStudentLoanPayoff(BAL, APR, 350);
const ex500 = calculateStudentLoanPayoff(BAL, APR, 500);
const ex750 = calculateStudentLoanPayoff(BAL, APR, 750);

function formatYearsMonths(totalMonths: number): string {
  if (totalMonths <= 0) return "0 months";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
}

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/student-loan-payoff-calculator`;
const pageTitle =
  "Student Loan Payoff Calculator – Extra Payments";
const pageDescription =
  "Free student loan payoff calculator. See your payoff date, total interest, and how much time and money extra payments or a lump sum can save.";

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
    question: "How is student loan interest calculated each month?",
    answer:
      "Each month, interest accrues on your remaining principal balance at your annual rate divided by 12. For example, a $30,000 balance at 6.50% APR accrues $162.50 in interest the first month ($30,000 times 0.065 divided by 12). Your monthly payment first covers that interest, and anything left over reduces the principal. As the balance shrinks, the interest portion of each payment shrinks too, so more of each payment goes to principal.",
  },
  {
    question: "Do extra payments go toward principal on a student loan?",
    answer:
      "They should, but you must confirm with your servicer. By default, some servicers apply extra money to next month's payment instead of to principal, which saves no interest. Contact your servicer and instruct them to apply any amount above the regular payment to principal reduction. The calculator above assumes extra payments go directly to principal, which is the scenario that actually saves you time and interest.",
  },
  {
    question: "How do I find my debt-free date?",
    answer:
      "The calculator computes your payoff month by simulating standard amortization: each month, interest accrues on the remaining balance, then your payment (plus any extra) reduces the balance. The payoff date is today's date plus the number of months the simulation takes to reach zero. Enter your balance, rate, and monthly payment above to see your exact debt-free month and year.",
  },
  {
    question: "Does this calculator work for income-driven repayment plans?",
    answer:
      "No. This calculator computes fixed-payment payoff math only. Federal student loans offer income-driven repayment (IDR) plans, forgiveness programs, and deferment or forbearance options that this tool does not model. If you are on an IDR plan, your payment changes with your income and any remaining balance may be forgiven after 20 or 25 years, so a fixed-payment calculator will not reflect your real timeline.",
  },
  {
    question: "Does a lump sum payment save more than extra monthly payments?",
    answer:
      "A lump sum applied early saves more than the same total spread across extra monthly payments, because the lump sum stops interest from accruing on that amount from day one. The calculator above lets you compare: on a $30,000 loan at 6.50% with a $350 payment, a $5,000 lump sum in month 1 saves more interest than adding roughly $42 per month over the life of the loan, because the entire $5,000 stops accruing interest immediately rather than gradually.",
  },
];

/* ─── Page Component ─── */

export default function StudentLoanPayoffPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "Student Loan Payoff Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Student Loan Payoff Calculator"
        description="Free student loan payoff calculator. See your payoff date, total interest, and how much time and money extra payments or a lump sum can save."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "Student Loan Payoff Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Student Loan Payoff Calculator
      </h1>

      {/* Intro paragraph (first 100 words answer the primary keyword) */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A {formatCurrency(BAL)} student loan at {formatPercent(APR)} with a{" "}
        {formatCurrency(PMT)} monthly payment is paid off in{" "}
        {formatYearsMonths(exBase.months)} with{" "}
        {formatCurrency(exBase.totalInterest)} in total interest. This student
        loan payoff calculator computes your exact payoff date, total interest,
        and total amount paid using standard monthly amortization, then shows
        how much time and money extra monthly payments or a one-time lump sum
        can save.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <StudentLoanPayoffCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Student Loan Payoff Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Student Loan Payoff Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A student loan payoff calculator takes three numbers, your balance,
            your interest rate, and your monthly payment, and simulates
            month-by-month amortization until the balance reaches zero. The
            result is your payoff timeline expressed in years and months, your
            total interest paid, and the actual month and year you will be
            debt-free. The calculator above uses the same amortization math your
            servicer applies: each month, interest accrues on the remaining
            principal at your annual rate divided by 12, then your payment
            covers that interest first, and whatever is left reduces the
            principal.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The formula behind each month is straightforward.{" "}
            <strong>Monthly interest = remaining balance &times; (APR &divide;
            12)</strong>. Your payment is split into an interest portion (equal
            to that month&apos;s accrued interest) and a principal portion
            (payment minus interest). The principal portion is subtracted from
            the balance, and the cycle repeats. In the early months, most of
            your payment covers interest because the balance is at its highest.
            As the balance declines, the interest share shrinks and the
            principal share grows, accelerating the payoff. The final month&apos;s
            payment is smaller than the others because it only needs to cover
            the remaining balance plus that month&apos;s interest, not the full
            payment amount.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: {formatCurrency(BAL)} at {formatPercent(APR)} with {formatCurrency(PMT)}/month
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Payoff time: <strong>{formatYearsMonths(exBase.months)}</strong>
                {" "}({exBase.months} monthly payments). Total interest paid:{" "}
                <strong>{formatCurrency(exBase.totalInterest)}</strong>. Total
                amount paid: <strong>{formatCurrency(exBase.totalPaid)}</strong>{" "}
                ({formatCurrency(BAL)} principal +{" "}
                {formatCurrency(exBase.totalInterest)} interest). Every figure
                is computed by the same amortization engine the calculator above
                uses.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: Student Loan Payoff Calculator with Extra Payments */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Student Loan Payoff Calculator with Extra Payments
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Adding extra money to your monthly student loan payment is the
            single most effective way to shorten your payoff timeline without
            committing to a large one-time payment. Every dollar you pay above
            the regular monthly payment goes directly to principal, which means
            that dollar stops accruing interest for the rest of the loan&apos;s
            life. The effect compounds: each extra dollar reduces the balance,
            which reduces future interest, which means more of your regular
            payment goes to principal in subsequent months.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            One critical step: confirm with your servicer that extra payments
            are applied to principal, not advanced to next month&apos;s payment.
            Some servicers default to pushing the due date forward, which holds
            your balance steady and saves no interest. You want the extra
            amount applied as a principal reduction so the balance drops
            immediately.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: {formatCurrency(BAL)} at {formatPercent(APR)}, {formatCurrency(PMT)}/month + {formatCurrency(100)} extra
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Adding {formatCurrency(100)} per month (total payment{" "}
                {formatCurrency(PMT + 100)}) shortens the loan from{" "}
                {formatYearsMonths(exBase.months)} to{" "}
                <strong>{formatYearsMonths(exExtra.months)}</strong>, saving{" "}
                <strong>{exBase.months - exExtra.months} months</strong> of
                payments. Total interest drops from{" "}
                {formatCurrency(exBase.totalInterest)} to{" "}
                <strong>{formatCurrency(exExtra.totalInterest)}</strong>, saving{" "}
                <strong>{formatCurrency(exBase.totalInterest - exExtra.totalInterest)}</strong>{" "}
                in interest. The extra {formatCurrency(100 * exExtra.months)} you
                paid saves {formatCurrency(exBase.totalInterest - exExtra.totalInterest)}{" "}
                in interest, a return far exceeding any savings account.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: How Fast Can I Pay Off My Student Loans */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Fast Can I Pay Off My Student Loans
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            How fast you pay off your student loans is driven almost entirely by
            your monthly payment relative to your balance and rate. The
            calculator above is payment-driven: you enter what you can afford to
            pay each month, and it computes the payoff time. A higher payment
            means less interest accrues over the life of the loan and the
            principal is retired sooner, so the payoff time drops sharply as you
            increase the payment.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The table below shows the same {formatCurrency(BAL)} loan at{" "}
            {formatPercent(APR)} at three different monthly payments. The
            standard 10-year plan on this loan would be about{" "}
            {formatCurrency(340)}/month, so {formatCurrency(PMT)} is slightly
            above standard, {formatCurrency(500)} is a meaningful acceleration,
            and {formatCurrency(750)} is aggressive.
          </p>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-semibold">Monthly Payment</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Payoff Time</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total Interest</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total Paid</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2">{formatCurrency(350)}</td>
                  <td className="px-4 py-2 text-right">{formatYearsMonths(ex350.months)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(ex350.totalInterest)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(ex350.totalPaid)}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2">{formatCurrency(500)}</td>
                  <td className="px-4 py-2 text-right">{formatYearsMonths(ex500.months)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(ex500.totalInterest)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(ex500.totalPaid)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">{formatCurrency(750)}</td>
                  <td className="px-4 py-2 text-right">{formatYearsMonths(ex750.months)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(ex750.totalInterest)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(ex750.totalPaid)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Going from {formatCurrency(350)} to {formatCurrency(500)} per month
            cuts the payoff time from {formatYearsMonths(ex350.months)} to{" "}
            {formatYearsMonths(ex500.months)} and saves{" "}
            {formatCurrency(ex350.totalInterest - ex500.totalInterest)} in
            interest. Going from {formatCurrency(500)} to {formatCurrency(750)}
            {" "}cuts it further to {formatYearsMonths(ex750.months)}. The
            marginal benefit shrinks as the payment rises (because there is less
            interest left to save), but every additional dollar above the
            interest portion still goes to principal.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Extra Payment Student Loan Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Extra Payment Student Loan Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An extra payment student loan calculator shows exactly how much time
            and interest each extra dollar saves. The calculator above has an
            extra monthly payment field: enter any amount above your regular
            payment and the tool recomputes the payoff timeline, total interest,
            and total paid, then compares them side by side against the baseline
            (no extra payment) in a comparison block.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The mechanism is simple. Extra payments are applied to principal,
            which reduces the balance the next month&apos;s interest is computed
            on. Because interest is calculated as balance times rate divided by
            12, every dollar of principal you eliminate removes one month of
            interest on that dollar for the rest of the loan. On a 6.50% loan,
            paying down $100 of principal early saves roughly $6.50 per year
            for every remaining year of the loan, which compounds across
            thousands of dollars and dozens of months.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            One practical point: confirm with your servicer that extra payments
            are applied to principal, not treated as an advance on next month&apos;s
            payment. Some servicers default to advancing the due date, which
            keeps your balance unchanged and negates the interest savings. You
            can usually set this preference in your online account or by
            submitting written instructions with each extra payment.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Student Loan Lump Sum Payment Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Student Loan Lump Sum Payment Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A lump sum payment is a one-time extra payment applied to your
            student loan principal, typically from a bonus, tax refund,
            inheritance, or savings. Because it reduces the principal
            immediately, it stops interest from accruing on that amount from day
            one, making it more powerful than spreading the same total across
            monthly extra payments. The calculator above has a lump sum field:
            enter the amount and the tool applies it in month 1, before the
            first month&apos;s interest accrues, then runs the amortization on
            the reduced balance.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: {formatCurrency(BAL)} at {formatPercent(APR)}, {formatCurrency(PMT)}/month + {formatCurrency(5000)} lump sum in month 1
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The {formatCurrency(5000)} lump sum reduces the starting balance
                from {formatCurrency(BAL)} to{" "}
                {formatCurrency(exLump.effectiveStartingBalance)}. Payoff time
                drops from {formatYearsMonths(exBase.months)} to{" "}
                <strong>{formatYearsMonths(exLump.months)}</strong>, saving{" "}
                <strong>{exBase.months - exLump.months} months</strong>. Total
                interest drops from {formatCurrency(exBase.totalInterest)} to{" "}
                <strong>{formatCurrency(exLump.totalInterest)}</strong>, saving{" "}
                <strong>{formatCurrency(exBase.totalInterest - exLump.totalInterest)}</strong>{" "}
                in interest. The {formatCurrency(5000)} lump sum saves{" "}
                {formatCurrency(exBase.totalInterest - exLump.totalInterest)} in
                interest, a return of roughly{" "}
                {formatPercent(
                  ((exBase.totalInterest - exLump.totalInterest) / 5000) * 100
                )}{" "}
                on the lump sum over the life of the loan.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            As with extra monthly payments, ask your servicer to apply the lump
            sum to principal, not to advance your due date. Most servicers will
            apply a lump sum to principal by default, but it is worth confirming,
            especially if you also want to keep your regular monthly payment
            amount unchanged rather than having the servicer recalculate it
            downward.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This calculator computes fixed-payment payoff math. Federal student
            loans offer income-driven repayment plans, forgiveness programs, and
            deferment or forbearance options that this tool does not model.
            Refinancing federal loans into a private loan removes those federal
            protections permanently. This page does not recommend refinancing or
            any specific product; it only computes the math of paying off a
            fixed-rate loan at a fixed monthly payment.
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
              href="/loans"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Loan Calculators
            </a>{" "}
            hub. If you are juggling multiple debts alongside your student
            loans, the{" "}
            <a
              href="/debt/debt-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Payoff Calculator
            </a>{" "}
            compares snowball and avalanche strategies across all your balances
            and shows your overall debt-free date. If you are weighing a single
            consolidation loan against keeping separate debts, the{" "}
            <a
              href="/loans/debt-consolidation-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Consolidation Calculator
            </a>{" "}
            shows whether consolidation saves money or costs more. If your
            student loan payment affects your mortgage readiness, the{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            shows exactly where you land against lender thresholds.
          </p>
        </section>
      </div>
    </div>
  );
}
