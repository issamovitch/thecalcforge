import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import AmortizationScheduleCalculator from "@/components/calculators/AmortizationScheduleCalculator";
import {
  calculateAmortization,
  compareAmortization,
  computeMonthlyPayment,
  formatCurrency,
  formatPercent,
  formatMonthYear,
  formatYearsMonths,
} from "@/lib/amortization-math";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── Build-time computed examples (single source of truth) ─── */

const BAL = 250000;
const APR = 6.5;
const TERM = 30;

// Default loan: $250,000 at 6.50% for 30 years (baseline, no extras)
const exBase = calculateAmortization({
  loanAmount: BAL,
  apr: APR,
  termYears: TERM,
  extraMonthly: 0,
  extraAnnual: 0,
  oneTimeAmount: 0,
  oneTimeMonth: 1,
});

// With $200/mo extra
const exExtra200 = compareAmortization({
  loanAmount: BAL,
  apr: APR,
  termYears: TERM,
  extraMonthly: 200,
  extraAnnual: 0,
  oneTimeAmount: 0,
  oneTimeMonth: 1,
});

// 15-year version of the same loan, for the total-interest contrast
const ex15yr = calculateAmortization({
  loanAmount: BAL,
  apr: APR,
  termYears: 15,
  extraMonthly: 0,
  extraAnnual: 0,
  oneTimeAmount: 0,
  oneTimeMonth: 1,
});

const f = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/amortization-schedule-calculator`;
const pageTitle =
  "Amortization Schedule Calculator – With Extra Payments | CalcForge";
const pageDescription =
  "Free amortization schedule calculator with extra payments. See every payment's interest and principal split, plus a printable full schedule.";

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
    question: "How is the monthly payment on an amortizing loan calculated?",
    answer:
      `The monthly payment comes from the standard amortization formula: M = P × (r/12) / (1 − (1 + r/12)^(−n)), where P is the loan amount, r is the annual rate as a decimal, and n is the term in months. For a ${f(BAL)} loan at ${formatPercent(APR)} over 30 years, that works out to ${formatCurrency(exBase.monthlyPayment)} per month. That payment stays the same every month for the full term; what changes is how each payment splits between interest and principal.`,
  },
  {
    question: "Why are early payments mostly interest?",
    answer:
      `Interest is charged on the remaining balance, which is at its highest in month 1. On the default ${f(BAL)} loan at ${formatPercent(APR)}, the first month's interest is ${formatCurrency(exBase.schedule[0].interest)} and only ${formatCurrency(exBase.schedule[0].principal)} goes to principal. As the balance shrinks, the interest share of each payment shrinks too, so more of the same payment goes to principal. The crossover point, where the principal portion first exceeds the interest portion, arrives in month ${exBase.crossoverMonth}, about year ${Math.ceil((exBase.crossoverMonth ?? 0) / 12)} of the loan.`,
  },
  {
    question: "How do extra payments change the schedule?",
    answer:
      `Every dollar paid above the regular monthly payment goes straight to principal, which lowers the balance the next month's interest is calculated on. Adding ${formatCurrency(200)} per month to the default ${f(BAL)} loan at ${formatPercent(APR)} cuts the payoff from ${formatYearsMonths(exBase.payoffMonths)} to ${formatYearsMonths(exExtra200.withExtras.payoffMonths)}, saving ${exExtra200.monthsSaved} months and ${formatCurrency(exExtra200.interestSaved)} in interest. The schedule above recalculates automatically when you enter any extra monthly, annual, or one-time payment.`,
  },
  {
    question: "Does this calculator work for adjustable-rate mortgages (ARMs)?",
    answer:
      "No. This calculator uses fixed-rate amortization math, where the rate stays constant for the entire term. Adjustable-rate mortgages reset periodically based on an index plus a margin, which changes the payment each adjustment period. Modeling an ARM requires knowing the index, margin, caps, and adjustment schedule, none of which this tool asks for. For a fixed-rate mortgage, personal loan, auto loan, or student loan, the math here is exact.",
  },
  {
    question: "Can I print the full amortization schedule?",
    answer:
      "Yes. Click the Print Schedule button above and the schedule opens in a clean print view with no navigation, ads, or input controls. Every month's payment, interest, principal, and running balance prints in full, grouped by year. This is useful for keeping a paper copy alongside your loan documents, sharing with a co-borrower, or reviewing the year-by-year interest total for tax planning.",
  },
];

/* ─── Page Component ─── */

export default function AmortizationSchedulePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "Amortization Schedule Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Amortization Schedule Calculator"
        description="Free amortization schedule calculator with extra payments. See every payment's interest and principal split, plus a printable full schedule."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "Amortization Schedule Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Amortization Schedule Calculator
      </h1>

      {/* Intro paragraph (first 100 words answer the primary keyword) */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A {formatCurrency(BAL)} loan at {formatPercent(APR)} for {TERM} years
        has a monthly payment of{" "}
        {formatCurrency(exBase.monthlyPayment)} and costs{" "}
        {formatCurrency(exBase.totalInterest)} in total interest over the full
        term. This amortization schedule calculator shows every monthly
        payment&apos;s interest and principal split, the running balance, and
        the exact payoff date, then recomputes the whole schedule when you add
        extra monthly, annual, or one-time payments.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <AmortizationScheduleCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Amortization Schedule Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Amortization Schedule Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An amortization schedule is the month-by-month breakdown of every
            payment on a fixed-rate loan. Each row shows the payment number,
            the date, the interest charged that month, the principal paid, and
            the remaining balance. The calculator above generates the full
            schedule for any loan amount, interest rate, and term, then
            regenerates it the moment you add extra payments so you can see
            exactly how each dollar changes the payoff timeline.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The math behind each row is straightforward. The monthly payment
            itself comes from the standard amortization formula:{" "}
            <strong>M = P &times; (r &divide; 12) &divide; (1 &minus; (1 + r
            &divide; 12)<sup>&minus;n</sup>)</strong>, where P is the loan
            amount, r is the annual rate as a decimal, and n is the term in
            months. For the default loan that yields a payment of{" "}
            {formatCurrency(exBase.monthlyPayment)}. Each month, interest is
            computed as balance &times; (r &divide; 12), and the rest of the
            payment reduces principal. The final month pays the exact remaining
            balance plus that month&apos;s interest, so the schedule always
            ends at zero.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: {f(BAL)} at {formatPercent(APR)} for {TERM} years
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monthly payment:{" "}
                <strong>{formatCurrency(exBase.monthlyPayment)}</strong>. Total
                interest paid over {formatYearsMonths(exBase.payoffMonths)}:{" "}
                <strong>{formatCurrency(exBase.totalInterest)}</strong>. Total
                paid (principal + interest):{" "}
                <strong>{formatCurrency(exBase.totalPaid)}</strong>. Month 1
                splits into{" "}
                <strong>{formatCurrency(exBase.schedule[0].interest)} interest</strong>{" "}
                and{" "}
                <strong>{formatCurrency(exBase.schedule[0].principal)} principal</strong>,
                leaving a balance of{" "}
                {formatCurrency(exBase.schedule[0].balance)}. By month 120
                (year 10), the split shifts to{" "}
                {formatCurrency(exBase.schedule[119].interest)} interest and{" "}
                {formatCurrency(exBase.schedule[119].principal)} principal.
                Every figure is computed by the same engine that powers the
                calculator above.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: Amortization Schedule with Extra Payments */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Amortization Schedule with Extra Payments
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An amortization schedule with extra payments shows how the same
            loan shortens when you pay more than the required minimum each
            month. Extra payments are applied directly to principal, which
            means every extra dollar reduces the balance that future interest
            is calculated on. Because interest is computed as balance times
            rate divided by 12, paying down an extra dollar of principal
            removes one month of interest on that dollar for every remaining
            month of the loan. On a {formatPercent(APR)} loan, that is roughly
            6.5 cents per year per dollar, compounding across thousands of
            dollars and hundreds of months.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: {f(BAL)} at {formatPercent(APR)} + {formatCurrency(200)}/month extra
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Adding {formatCurrency(200)} per month (total payment{" "}
                {formatCurrency(exBase.monthlyPayment + 200)}) shortens the
                loan from {formatYearsMonths(exBase.payoffMonths)} to{" "}
                <strong>{formatYearsMonths(exExtra200.withExtras.payoffMonths)}</strong>,
                saving{" "}
                <strong>{exExtra200.monthsSaved} months</strong> of payments.
                Total interest drops from{" "}
                {formatCurrency(exBase.totalInterest)} to{" "}
                <strong>{formatCurrency(exExtra200.withExtras.totalInterest)}</strong>,
                saving{" "}
                <strong>{formatCurrency(exExtra200.interestSaved)}</strong> in
                interest. The extra {formatCurrency(200 * exExtra200.withExtras.payoffMonths)}{" "}
                you paid saves {formatCurrency(exExtra200.interestSaved)} in
                interest, a return no savings account can match.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            One practical step matters more than the math: confirm with your
            servicer that extra payments are applied to principal, not pushed
            forward as an advance on next month&apos;s due date. Some servicers
            default to advancing the due date, which holds your balance steady
            and saves no interest. Instruct them in writing or in your online
            account settings to apply anything above the regular payment as a
            principal reduction.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Loan Amortization Calculator with Extra Payments */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Loan Amortization Calculator with Extra Payments
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The calculator above accepts three kinds of extra payments, and
            each affects the balance differently. An extra monthly payment is
            added to every payment from month one forward, so it compounds the
            longest and saves the most interest per dollar. An extra annual
            payment is applied once every 12 months, which is useful if you
            receive a yearly bonus, tax refund, or commission check you want to
            direct at the loan. A one-time payment is a single lump sum applied
            in the month you specify, useful for an inheritance, sale proceeds,
            or a single windfall.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            A lump sum applied early saves more than the same total spread
            across monthly extras, because the entire amount stops accruing
            interest from that month forward. A ${"500"} lump sum in month 12
            saves more interest than adding about ${"42"} per month for a year,
            because the lump sum hits the balance all at once and the
            month-by-month extras only reduce the balance gradually. The
            calculator&apos;s comparison block shows the exact months and
            interest saved for whatever combination of extras you enter.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The schedule table itself is the page&apos;s core feature, not an
            afterthought. Every month is listed with its payment, extra,
            interest, principal, and running balance, grouped by year with a
            year-summary row showing the total interest and principal paid that
            year. Use the Expand All button to see every month at once, or
            click a single year to drill into its 12 rows. The year-summary
            view alone is enough to see how the interest share drops over time
            without scrolling through 360 individual rows.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Interest Will I Pay on My Loan */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Interest Will I Pay on My Loan
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Total interest on a fixed-rate loan is the sum of every month&apos;s
            interest charge across the full term. On the default {f(BAL)} loan
            at {formatPercent(APR)} over {TERM} years, that sum is{" "}
            <strong>{formatCurrency(exBase.totalInterest)}</strong>, which
            means you pay more in interest than the loan itself cost. That
            happens because the rate, applied to a high starting balance over
            360 months, accrues faster than the payment reduces the principal
            in the early years.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The single most effective way to cut total interest is to shorten
            the term. The same {f(BAL)} at {formatPercent(APR)} on a 15-year
            schedule has a monthly payment of{" "}
            {formatCurrency(ex15yr.monthlyPayment)} (versus{" "}
            {formatCurrency(exBase.monthlyPayment)} for 30 years) but total
            interest of only{" "}
            <strong>{formatCurrency(ex15yr.totalInterest)}</strong>, a savings
            of {formatCurrency(exBase.totalInterest - ex15yr.totalInterest)}.
            The shorter term costs more per month but less than half the
            interest, because the balance is retired twice as fast and interest
            has half as many months to accrue.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3">
                {f(BAL)} at {formatPercent(APR)}: 30-Year vs 15-Year
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-1.5 text-left font-semibold">Term</th>
                      <th className="px-2 py-1.5 text-right font-semibold">Monthly Payment</th>
                      <th className="px-2 py-1.5 text-right font-semibold">Total Interest</th>
                      <th className="px-2 py-1.5 text-right font-semibold">Total Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-2 py-1.5">30 years</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(exBase.monthlyPayment)}</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(exBase.totalInterest)}</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(exBase.totalPaid)}</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5">15 years</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(ex15yr.monthlyPayment)}</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(ex15yr.totalInterest)}</td>
                      <td className="px-2 py-1.5 text-right">{formatCurrency(ex15yr.totalPaid)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The 15-year term costs{" "}
                {formatCurrency(ex15yr.monthlyPayment - exBase.monthlyPayment)}{" "}
                more per month but saves{" "}
                {formatCurrency(exBase.totalInterest - ex15yr.totalInterest)}{" "}
                in interest. Both figures come from the same amortization
                engine.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: Printable Amortization Schedule */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Printable Amortization Schedule
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A printable amortization schedule is a paper copy of every payment
            on your loan, useful for keeping alongside your loan documents,
            sharing with a co-borrower or financial advisor, or reviewing the
            year-by-year interest total for tax planning. The Print Schedule
            button above opens a clean print view with no navigation, ads, or
            input controls. Every month prints in full, grouped by year, with
            the payment, extra, interest, principal, and running balance on
            each row.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            When you review a printed schedule, check four things on at least
            the first and last rows. First, the payment number should run from
            1 to the total month count with no gaps. Second, the date column
            should advance by one month per row, starting from your first
            payment date. Third, the interest plus principal on each row should
            equal the payment (plus any extra that month). Fourth, the running
            balance should start at the loan amount, decrease every month, and
            land on exactly zero in the final row. If any of those fail, the
            schedule does not match your loan terms.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The year-summary rows are the most useful part of a printed
            schedule for tax purposes. Mortgage interest is often deductible,
            and the year-summary row gives you the total interest paid in each
            calendar year without having to add up 12 monthly interest charges
            by hand. If you made extra payments, the extra column on the
            schedule shows exactly how much above the regular payment you paid
            each month, which is useful for tracking your payoff progress.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Extra Payment Loan Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Extra Payment Loan Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An extra payment loan calculator shows the precise time and
            interest savings from paying more than the required minimum. The
            calculator above is that tool: enter any combination of extra
            monthly, extra annual, and one-time payments, and the schedule
            regenerates instantly with a comparison block showing the baseline
            versus your plan, the months saved, and the interest saved.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The strategy that saves the most interest per dollar is to apply
            extra payments as principal reductions as early as possible. A
            dollar paid down in year one of a 30-year loan saves 30 years of
            interest on that dollar. The same dollar paid down in year 25
            saves only 5 years. This is why a lump sum in the early years of a
            mortgage has an outsized effect, and why even a modest extra
            monthly payment started at the beginning of the loan can cut years
            off the term.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            One caveat worth repeating: this calculator computes fixed-rate
            amortization math only. It does not model adjustable-rate
            mortgages, closing costs, escrow impounds for taxes and insurance,
            or private mortgage insurance. If your down payment is under 20%,
            PMI adds to your monthly cost until you reach 20% equity; see the{" "}
            <a
              href="/home-buying/pmi-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              PMI Calculator
            </a>{" "}
            to estimate that separately. This page does not recommend any
            specific loan product or refinancing strategy; it only computes the
            math of paying off a fixed-rate loan on schedule or ahead of it.
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
            hub. If you are paying down a student loan and want a payoff-date
            view rather than a full schedule, the{" "}
            <a
              href="/loans/student-loan-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Student Loan Payoff Calculator
            </a>{" "}
            computes your debt-free month from a fixed payment. For a vehicle
            loan, the{" "}
            <a
              href="/loans/auto-loan-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Auto Loan Calculator
            </a>{" "}
            handles trade-ins and sales tax. If your mortgage payment includes
            PMI, the{" "}
            <a
              href="/home-buying/pmi-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              PMI Calculator
            </a>{" "}
            shows when it drops off, and if you are weighing a refinance, the{" "}
            <a
              href="/home-buying/refinance-break-even-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Refinance Break-Even Calculator
            </a>{" "}
            shows how many months it takes to recoup closing costs.
          </p>
        </section>
      </div>
    </div>
  );
}
