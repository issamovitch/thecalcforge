import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import AutoLoanCalculator from "@/components/calculators/AutoLoanCalculator";
import {
  calculateLoan,
  calculateLoanWithExtra,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ─── Build-time computed examples (single source of truth) ─── */

function financed(
  price: number,
  tradeIn: number,
  owed: number,
  down: number,
  taxPct: number,
) {
  const equity = tradeIn - owed;
  return Math.max(0, price + (price * taxPct / 100) - equity - down);
}

// S1: Car Payment Calculator with Trade In and Taxes
// $35K car, $12K trade-in, $0 owed, $3K down, 7% tax, 6.5% APR, 60mo
const S1_FIN = financed(35000, 12000, 0, 3000, 7);
const S1_TAX = Math.round(35000 * 7) / 100;
const S1 = calculateLoan({ loanAmount: S1_FIN, apr: 6.5, termMonths: 60 });

// S2: Auto Loan Calculator with Extra Payments
// $30K car, $0 trade-in, $5K down, 6% tax, 7% APR, 60mo, $75/mo extra
const S2_FIN = financed(30000, 0, 0, 5000, 6);
const S2 = calculateLoan({ loanAmount: S2_FIN, apr: 7, termMonths: 60 });
const S2X = calculateLoanWithExtra({
  loanAmount: S2_FIN, apr: 7, termMonths: 60,
  extraMonthly: 75, extraStartMonth: 1,
});

// S3: Car Loan Payoff Calculator with Extra Payments (negative equity focus)
// $32K car, $10K trade-in, $14K owed (negative equity!), $2K down, 8% tax, 6.5% APR, 72mo
const S3_EQUITY = 10000 - 14000; // -$4,000
const S3_FIN = financed(32000, 10000, 14000, 2000, 8);
const S3_TAX = Math.round(32000 * 8) / 100;
const S3 = calculateLoan({ loanAmount: S3_FIN, apr: 6.5, termMonths: 72 });
const S3_NO_NEG = calculateLoan({
  loanAmount: financed(32000, 10000, 0, 2000, 8),
  apr: 6.5, termMonths: 72,
});
const S3_EXTRA_INTEREST = Math.round((S3.totalInterest - S3_NO_NEG.totalInterest) * 100) / 100;
const S3X = calculateLoanWithExtra({
  loanAmount: S3_FIN, apr: 6.5, termMonths: 72,
  extraMonthly: 100, extraStartMonth: 1,
});

// S5: 72 Month Car Loan Calculator - $35K at 6.5% across terms
const S5_36 = calculateLoan({ loanAmount: 35000, apr: 6.5, termMonths: 36 });
const S5_48 = calculateLoan({ loanAmount: 35000, apr: 6.5, termMonths: 48 });
const S5_60 = calculateLoan({ loanAmount: 35000, apr: 6.5, termMonths: 60 });
const S5_72 = calculateLoan({ loanAmount: 35000, apr: 6.5, termMonths: 72 });
const S5_84 = calculateLoan({ loanAmount: 35000, apr: 6.5, termMonths: 84 });

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/auto-loan-calculator`;
const pageTitle = "Auto Loan Calculator: Car Payments & Amortization";
const pageDescription =
  "Free auto loan calculator with trade-in, negative equity rollover, sales tax, and extra payments. See your monthly car payment and full amortization schedule.";

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
    question: "What happens when I have negative equity on my trade-in?",
    answer:
      "If you owe more on your current car than it is worth, the difference (negative equity) is typically added to your new loan balance. You end up financing the old debt on top of the new purchase. The calculator shows this separately as a \"Negative Equity Rollover\" tile so you can see exactly how much is being added and what it costs in extra interest over the life of the new loan.",
  },
  {
    question: "Does sales tax apply to the full vehicle price or the price after trade-in?",
    answer:
      "That depends on the state. Some states tax the full purchase price regardless of trade-in. Others exempt the trade-in value and tax only the difference (price minus trade-in). Because the rules vary, the calculator applies your entered rate to the full vehicle price. If your state only taxes the net amount, calculate the effective rate yourself and enter that instead.",
  },
  {
    question: "Is an 84-month car loan a bad idea?",
    answer:
      "An 84-month term lowers your monthly payment, but it extends the period during which you owe more than the car is worth (being \"upside down\"). It also increases the total interest paid. Whether it makes sense depends on your budget and how long you plan to keep the vehicle. The calculator shows the total cost at each term so you can decide whether the lower payment is worth the extra interest.",
  },
  {
    question: "How do extra payments change my car loan payoff?",
    answer:
      "Extra payments reduce the principal balance faster. Since interest is calculated on the remaining balance each month, every extra dollar eliminates future interest on that amount. The calculator recalculates the full schedule and shows how many months you shorten the loan and how much interest you save. You can also choose which month to start the extra payments.",
  },
  {
    question: "Should I pay off my car loan early?",
    answer:
      "Paying off a car loan early saves interest, but consider whether the money would be better used elsewhere. If your auto loan has a lower APR than what you could earn on savings or investments, or if you have higher-interest debt, directing money there first may save more overall. The calculator shows the exact interest savings so you can compare against other uses for that money.",
  },
];

/* ─── Page Component ─── */

export default function AutoLoanCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <CanonicalUrl path="/loans/auto-loan-calculator" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "Auto Loan Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Auto Loan Calculator"
        description="Free auto loan calculator with trade-in equity, negative equity rollover, sales tax, and extra payment planning."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "Auto Loan Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Auto Loan Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        An auto loan calculator computes the monthly payment on a car purchase
        by accounting for the vehicle price, trade-in equity or negative equity
        rollover, down payment, sales tax, and the lender&apos;s APR.
        CalcForge&apos;s calculator also supports extra monthly payments for
        early payoff planning and shows the full amortization schedule.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <AutoLoanCalculator />
      </div>

      {/* ─── SEO Content (hidden from print) ─── */}
      <div className="print:hidden">

      <Separator className="my-12" />

      {/* H2: Car Payment Calculator with Trade In and Taxes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Car Payment Calculator with Trade In and Taxes
        </h2>
        <p>
          When you trade in a vehicle, the net equity (trade-in value minus any
          remaining loan balance) is applied toward the new purchase. If you
          owe less than the car is worth, the equity reduces the amount you
          need to finance. Sales tax is then calculated on the vehicle price and
          added to the loan. The financed amount is the total after subtracting
          net trade equity and down payment from the price-plus-tax total.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(35000)} vehicle with a {formatCurrency(12000)}{" "}
          trade-in (owned outright), {formatCurrency(3000)} down, and 7% sales
          tax at 6.5% APR for 60 months. The sales tax adds{" "}
          {formatCurrency(S1_TAX)}, net trade equity is{" "}
          {formatCurrency(12000)}, and the financed amount is{" "}
          {formatCurrency(S1_FIN)}. The monthly payment is{" "}
          {formatCurrency(S1.monthlyPayment)}, total interest is{" "}
          {formatCurrency(S1.totalInterest)}, and total cost is{" "}
          {formatCurrency(S1.totalCost)}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Auto Loan Calculator with Extra Payments */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Auto Loan Calculator with Extra Payments
        </h2>
        <p>
          Paying more than the required amount each month directs the surplus
          toward principal. Because auto loan interest is computed on the
          declining balance, reducing the balance ahead of schedule means less
          interest accrues in every subsequent month. The result is a shorter
          loan term and lower total interest, even though the required monthly
          payment stays the same.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(30000)} vehicle with {formatCurrency(5000)} down and
          6% sales tax at 7% APR for 60 months finances{" "}
          {formatCurrency(S2_FIN)}. The base monthly payment is{" "}
          {formatCurrency(S2.monthlyPayment)} and total interest is{" "}
          {formatCurrency(S2.totalInterest)}. Adding {formatCurrency(75)} per
          month from month 1 shortens the loan by {S2X.monthsSaved} months and
          saves {formatCurrency(S2X.interestSaved)} in interest, bringing the
          total cost from {formatCurrency(S2.totalCost)} to{" "}
          {formatCurrency(S2X.result.totalCost)}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Car Loan Payoff Calculator with Extra Payments */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Car Loan Payoff Calculator with Extra Payments
        </h2>
        <p>
          Negative equity on a trade-in is one of the costliest aspects of
          auto financing. If your current car is worth less than the loan
          balance, the dealer rolls the shortfall into the new loan. You are
          now paying interest on old debt in addition to the new vehicle. The
          calculator handles this automatically: enter the trade-in value and
          the amount still owed, and it adds the difference to the financed
          amount.
        </p>
        <p>
          <strong>Worked example with negative equity (computed by engine):</strong>{" "}
          A {formatCurrency(32000)} vehicle with a {formatCurrency(10000)}{" "}
          trade-in that still has {formatCurrency(14000)} owed. Net trade
          equity is {formatCurrency(S3_EQUITY)}, meaning{" "}
          {formatCurrency(Math.abs(S3_EQUITY))} of old debt rolls into the
          new loan. With {formatCurrency(2000)} down and 8% sales tax at 6.5%
          APR for 72 months, the financed amount is {formatCurrency(S3_FIN)}.
          The monthly payment is {formatCurrency(S3.monthlyPayment)} and total
          interest is {formatCurrency(S3.totalInterest)}.
        </p>
        <p>
          Without the negative equity, the same deal would finance{" "}
          {formatCurrency(financed(32000, 10000, 0, 2000, 8))} and carry{" "}
          {formatCurrency(S3_NO_NEG.totalInterest)} in interest. The{" "}
          {formatCurrency(Math.abs(S3_EQUITY))} rollover adds{" "}
          {formatCurrency(S3_EXTRA_INTEREST)} in extra interest over the
          72-month term. Adding {formatCurrency(100)} per month in extra
          payments shortens this loan by {S3X.monthsSaved} months and saves{" "}
          {formatCurrency(S3X.interestSaved)} in interest.
        </p>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-3">
              Negative Equity Warning
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                When your trade-in is worth less than the loan balance, the
                shortfall is added to your new loan. You pay interest on the
                old debt for the entire new loan term.
              </li>
              <li>
                A {formatCurrency(Math.abs(S3_EQUITY))} rollover at 6.5% APR
                over 72 months costs an extra {formatCurrency(S3_EXTRA_INTEREST)}
                in interest compared to the same deal with no rollover.
              </li>
              <li>
                The calculator displays the rollover as a separate result tile
                so you can see exactly how much old debt is being financed.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-10" />

      {/* H2: Auto Loan Calculator with Sales Tax by State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Auto Loan Calculator with Sales Tax by State
        </h2>
        <p>
          Sales tax on a vehicle purchase is determined by the state, county,
          and sometimes the city where the car is registered. The rate you pay
          can vary by several percentage points depending on where you live, and
          some jurisdictions add additional fees on top of the base rate.
        </p>
        <p>
          Beyond the rate itself, states differ on what the tax applies to.
          Some states tax the full purchase price. Others allow you to deduct
          the trade-in value and tax only the net amount. This distinction
          materially changes the financed amount. On a {formatCurrency(35000)}{" "}
          vehicle with a {formatCurrency(12000)} trade-in and 7% tax, taxing
          the full price adds {formatCurrency(Math.round(35000 * 7) / 100)}.
          Taxing only the net would add{" "}
          {formatCurrency(Math.round(23000 * 7) / 100)}, a difference of{" "}
          {formatCurrency(Math.round(12000 * 7) / 100)}.
        </p>
        <p>
          Because these rules are set at the state level and change over time,
          the calculator does not include a state rate lookup. Enter your
          actual combined rate in the Sales Tax Rate field. If your state
          exempts trade-in value from taxation, calculate the effective rate
          that produces the correct tax amount on the full purchase price, and
          enter that instead.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: 72 Month Car Loan Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          72 Month Car Loan Calculator
        </h2>
        <p>
          A 72-month (6-year) term is common for new and used car purchases.
          Extending the term from 36 months to 84 months lowers each monthly
          payment but raises the total interest paid, and it extends the window
          during which the borrower owes more than the car is worth. The table
          below shows how the term affects a {formatCurrency(35000)} loan at
          6.5% APR.
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
                <td className="px-4 py-2">36 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_36.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_36.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_36.totalCost)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">48 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_48.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_48.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_48.totalCost)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">60 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_60.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_60.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_60.totalCost)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">72 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_72.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_72.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_72.totalCost)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">84 months</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_84.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_84.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S5_84.totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Moving from 36 months to 84 months drops the payment from{" "}
          {formatCurrency(S5_36.monthlyPayment)} to{" "}
          {formatCurrency(S5_84.monthlyPayment)}, but total interest rises from{" "}
          {formatCurrency(S5_36.totalInterest)} to{" "}
          {formatCurrency(S5_84.totalInterest)}. The longer term also extends
          the period during which the loan balance exceeds the vehicle&apos;s
          resale value, which matters if you sell or total the car before the
          loan is paid off.
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
        <h2 className="text-2xl font-bold tracking-tight">Related Calculators</h2>
        <p className="text-muted-foreground">
          Compare auto loan costs against other borrowing products with our{" "}
          <a
            href="/loans/personal-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Personal Loan Calculator
          </a>
          ,{" "}
          <a
            href="/loans/boat-rv-motorcycle-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Boat, RV &amp; Motorcycle Loan Calculator
          </a>
          , or{" "}
          <a
            href="/loans/business-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Business Loan Calculator
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