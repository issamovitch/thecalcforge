import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import DebtConsolidationCalculator from "@/components/calculators/DebtConsolidationCalculator";
import {
  calculateLoan,
  calculateFixedPaymentPayoff,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── Build-time computed examples (single source of truth) ─── */

// Section 2: Credit Card Consolidation Loan Calculator
// 3 cards: $8K@22% $250/mo, $7K@19% $200/mo, $5K@24% $150/mo
const S2_CARDS = [
  { name: "Card A", balance: 8000, apr: 22, monthlyPayment: 250 },
  { name: "Card B", balance: 7000, apr: 19, monthlyPayment: 200 },
  { name: "Card C", balance: 5000, apr: 24, monthlyPayment: 150 },
];
const S2_PAYOFFS = S2_CARDS.map((c) => ({
  ...c,
  result: calculateFixedPaymentPayoff(c.balance, c.apr, c.monthlyPayment),
}));
const S2_TOTAL_BAL = S2_CARDS.reduce((s, c) => s + c.balance, 0);
const S2_TOTAL_PAY = S2_CARDS.reduce((s, c) => s + c.monthlyPayment, 0);
const S2_TOTAL_INT = S2_PAYOFFS.reduce((s, c) => s + c.result.totalInterest, 0);
const S2_TOTAL_COST = S2_PAYOFFS.reduce((s, c) => s + c.result.totalCost, 0);
const S2_MAX_MO = Math.max(...S2_PAYOFFS.map((c) => c.result.monthsToPayoff));

// Consolidated at 12% for 48 months, no fee
const S2_CONS = calculateLoan({ loanAmount: S2_TOTAL_BAL, apr: 12, termMonths: 48 });

// Section 3: Is Debt Consolidation Worth It
// Case A (saves): same $20K, consolidated at 12% for 36 months
const S3A_CONS = calculateLoan({ loanAmount: S2_TOTAL_BAL, apr: 12, termMonths: 36 });

// Case B (costs more): aggressive payers, same $20K total
// $5K@18% $500/mo, $3K@15% $300/mo, $2K@20% $200/mo
const S3B_DEBTS = [
  { balance: 5000, apr: 18, monthlyPayment: 500 },
  { balance: 3000, apr: 15, monthlyPayment: 300 },
  { balance: 2000, apr: 20, monthlyPayment: 200 },
];
const S3B_PAYOFFS = S3B_DEBTS.map((d) => ({
  ...d,
  result: calculateFixedPaymentPayoff(d.balance, d.apr, d.monthlyPayment),
}));
const S3B_TOTAL_INT = S3B_PAYOFFS.reduce((s, d) => s + d.result.totalInterest, 0);
const S3B_TOTAL_COST = S3B_PAYOFFS.reduce((s, d) => s + d.result.totalCost, 0);
const S3B_MAX_MO = Math.max(...S3B_PAYOFFS.map((d) => d.result.monthsToPayoff));
const S3B_TOTAL_PAY = S3B_DEBTS.reduce((s, d) => s + d.monthlyPayment, 0);
// Same $10K consolidated at 12% for 48 months
const S3B_CONS = calculateLoan({ loanAmount: 10000, apr: 12, termMonths: 48 });
const S3B_EXTRA_COST = S3B_CONS.totalCost - S3B_TOTAL_COST;

// Section 4: Illustrative APRs at $20K, 48mo
const S4_APR_8 = calculateLoan({ loanAmount: 20000, apr: 8, termMonths: 48 });
const S4_APR_12 = calculateLoan({ loanAmount: 20000, apr: 12, termMonths: 48 });
const S4_APR_18 = calculateLoan({ loanAmount: 20000, apr: 18, termMonths: 48 });

// Section 5: Consolidate $20,000 in Debt
// Same 3 cards as section 2, consolidated at 12% over 60 months
const S5_CONS = calculateLoan({ loanAmount: S2_TOTAL_BAL, apr: 12, termMonths: 60 });
const S5_MONTHLY_SAVE = S2_TOTAL_PAY - S5_CONS.monthlyPayment;
const S5_INT_DIFF = S2_TOTAL_INT - S5_CONS.totalInterest;
const S5_MO_DIFF = S2_MAX_MO - 60;

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/debt-consolidation-calculator`;
const pageTitle = "Debt Consolidation Calculator: Compare & Save";
const pageDescription =
  "Free debt consolidation calculator. Compare your current debts against a consolidation loan to see total cost, monthly payment, and whether you save or overpay.";

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
    question:
      "How is a debt consolidation calculator different from a regular loan calculator?",
    answer:
      "A regular loan calculator computes a monthly payment from a loan amount, rate, and term. A debt consolidation calculator does something different: it takes your existing debts with their current payments and rates, then compares the total cost of keeping them against combining them into a single new loan. The comparison includes total interest, monthly cash flow, and payoff timeline, and it states explicitly whether consolidation saves money or costs more.",
  },
  {
    question: "Can debt consolidation increase my total cost?",
    answer:
      "Yes. If the new loan has a longer term than your current payoff timeline, you may pay more total interest even at a lower rate. For example, debts that would be paid off in 11 months at current payments, consolidated into a 48-month loan at a lower rate, can produce a higher total interest charge. The calculator shows both sides so you can see the trade-off.",
  },
  {
    question:
      "What happens if my current payment does not cover the monthly interest?",
    answer:
      "If the monthly payment on a debt is less than or equal to the interest that accrues each month, the balance will never reach zero. The calculator flags that debt as \"never pays off\" and excludes it from the total-cost comparison, because there is no finite total to compare against.",
  },
  {
    question:
      "Does consolidating credit cards into a secured loan carry additional risk?",
    answer:
      "Yes. Credit card debt is unsecured, meaning no asset backs it. If you consolidate into a home equity loan or another secured product, the collateral (your home, car, or other asset) is at risk if you default. Additionally, paying off credit cards without addressing the spending pattern that created the balances can result in both the new loan and new card balances.",
  },
  {
    question: "Should I include an origination fee in the consolidation comparison?",
    answer:
      "If the lender charges an origination fee, enter it. The fee is deducted from the loan proceeds, so you receive less than the total balance. The calculator shows the amount you actually receive and computes the effective APR, which is higher than the stated rate when a fee is present. This lets you compare the true cost, not just the advertised rate.",
  },
];

/* ─── Page Component ─── */

export default function DebtConsolidationCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "Debt Consolidation Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Debt Consolidation Calculator"
        description="Compare current debts against a consolidation loan. See total cost, monthly payment, and whether you save or overpay."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "Debt Consolidation Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Debt Consolidation Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A debt consolidation calculator compares the total cost of keeping
        multiple debts separate against combining them into one loan. Instead of
        showing only a monthly payment, CalcForge&apos;s tool evaluates the
        full timeline: how long each debt takes to pay off at its current
        payment, how much total interest you pay, and whether a consolidation
        loan actually saves money or costs more when the term stretches.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <DebtConsolidationCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── SEO Content (hidden from print) ─── */}
      <div className="print:hidden">

      <Separator className="my-12" />

      {/* H2: Debt Consolidation Savings Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Debt Consolidation Savings Calculator
        </h2>
        <p>
          The savings from debt consolidation depend on three variables: the
          interest rate on the new loan, the term of the new loan, and how
          quickly your current debts would be paid off at their existing
          payments. A lower rate alone does not guarantee savings. If the new
          loan extends repayment far beyond your current payoff timeline, the
          extra months of interest can outweigh the rate reduction. The
          calculator handles this comparison by computing each debt
          individually at its current payment level, then measuring the
          consolidated loan against the sum of those individual outcomes.
        </p>
        <p>
          The tool also accounts for origination fees. When a fee is deducted
          from the loan proceeds, the amount you actually receive is less than
          the total balance you are consolidating. The calculator computes the
          effective APR (the true cost of borrowing including the fee) so you
          can compare it against the stated rate and against the rates on your
          existing debts.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Credit Card Consolidation Loan Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Credit Card Consolidation Loan Calculator
        </h2>
        <p>
          Consolidation replaces multiple balances with a single loan. The
          appeal is straightforward: if the new loan has a lower rate, each
          payment covers more principal and less interest. But whether this
          reduces your total cost depends on the term.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> Three cards with
          balances of {formatCurrency(8000)} at {formatPercent(22)},
          {formatCurrency(7000)} at {formatPercent(19)}, and {formatCurrency(5000)}
          at {formatPercent(24)}, with current monthly payments of{" "}
          {formatCurrency(250)}, {formatCurrency(200)}, and {formatCurrency(150)}
          respectively (total {formatCurrency(S2_TOTAL_PAY)}/month). At those
          payments, the cards pay off individually in{" "}
          {S2_PAYOFFS[0].result.monthsToPayoff},{" "}
          {S2_PAYOFFS[1].result.monthsToPayoff}, and{" "}
          {S2_PAYOFFS[2].result.monthsToPayoff} months, with total interest of{" "}
          {formatCurrency(S2_TOTAL_INT)} across all three. The longest payoff
          is {S2_MAX_MO} months.
        </p>
        <p>
          Consolidated into a single {formatCurrency(S2_TOTAL_BAL)} loan at{" "}
          {formatPercent(12)} for 48 months, the payment drops to{" "}
          {formatCurrency(S2_CONS.monthlyPayment)}/month and total interest is{" "}
          {formatCurrency(S2_CONS.totalInterest)}. That saves{" "}
          {formatCurrency(S2_TOTAL_INT - S2_CONS.totalInterest)} in interest
          over the 48-month term, because the rate reduction is large enough
          to overcome the term extension from {S2_MAX_MO} months (the longest
          individual payoff) to 48 months.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Is Debt Consolidation Worth It */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Is Debt Consolidation Worth It
        </h2>
        <p>
          A lower monthly payment is not the same as a lower total cost.
          Consolidation is sold on the payment reduction, but the relevant
          question is what you pay in total over the full repayment period.
          Two examples with the same {formatCurrency(S2_TOTAL_BAL)} balance
          illustrate the difference.
        </p>
        <p>
          <strong>Case 1: Consolidation saves (shorter term).</strong> The
          three cards from the previous section ({formatCurrency(S2_TOTAL_BAL)}
          total) are consolidated at {formatPercent(12)} for 36 months. The
          payment is {formatCurrency(S3A_CONS.monthlyPayment)}/month and total
          interest is {formatCurrency(S3A_CONS.totalInterest)}. Compared to{" "}
          {formatCurrency(S2_TOTAL_INT)} in interest on the current debts,
          consolidation saves{" "}
          {formatCurrency(S2_TOTAL_INT - S3A_CONS.totalInterest)}.
        </p>
        <p>
          <strong>Case 2: Consolidation costs more (longer term).</strong> A
          borrower has three debts totaling {formatCurrency(10000)}:{" "}
          {formatCurrency(5000)} at {formatPercent(18)} paying{" "}
          {formatCurrency(500)}/month, {formatCurrency(3000)} at{" "}
          {formatPercent(15)} paying {formatCurrency(300)}/month, and{" "}
          {formatCurrency(2000)} at {formatPercent(20)} paying{" "}
          {formatCurrency(200)}/month. These aggressive payments retire the
          debts in approximately {S3B_MAX_MO} months each, with total interest
          of {formatCurrency(S3B_TOTAL_INT)}.
        </p>
        <p>
          Consolidated into a {formatCurrency(10000)} loan at {formatPercent(12)}
          for 48 months, the payment is {formatCurrency(S3B_CONS.monthlyPayment)}
          /month and total interest is {formatCurrency(S3B_CONS.totalInterest)}.
          The total cost rises from {formatCurrency(S3B_TOTAL_COST)} to{" "}
          {formatCurrency(S3B_CONS.totalCost)}, an increase of{" "}
          {formatCurrency(S3B_EXTRA_COST)}. The rate dropped, but the term
          stretched from {S3B_MAX_MO} months to 48 months. The borrower pays{" "}
          {formatCurrency(S3B_EXTRA_COST)} more in exchange for a lower
          monthly payment.
        </p>
        <Card className="bg-muted/50 border">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-2">The key distinction</p>
            <p className="text-sm text-muted-foreground">
              A lower monthly payment improves cash flow. A lower total cost
              saves money. These are different outcomes. The calculator
              reports both so you can decide which matters more for your
              situation.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-10" />

      {/* H2: Debt Consolidation Calculator with Credit Score */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Debt Consolidation Calculator with Credit Score
        </h2>
        <p>
          Credit score affects the rate a lender offers on a consolidation
          loan. The table below shows how different rates change the cost of
          a {formatCurrency(20000)} consolidation loan over 48 months. These
          rates are illustrative inputs, not quotes from any lender or
          credit-scoring model.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2.5 text-left font-semibold">
                  Input APR
                </th>
                <th className="px-4 py-2.5 text-right font-semibold">
                  Monthly Payment
                </th>
                <th className="px-4 py-2.5 text-right font-semibold">
                  Total Interest
                </th>
                <th className="px-4 py-2.5 text-right font-semibold">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2">{formatPercent(8)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S4_APR_8.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S4_APR_8.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S4_APR_8.totalCost)}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">{formatPercent(12)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S4_APR_12.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S4_APR_12.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S4_APR_12.totalCost)}</td>
              </tr>
              <tr>
                <td className="px-4 py-2">{formatPercent(18)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S4_APR_18.monthlyPayment)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S4_APR_18.totalInterest)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(S4_APR_18.totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          At {formatPercent(8)}, total interest is{" "}
          {formatCurrency(S4_APR_8.totalInterest)}. At {formatPercent(18)},
          it rises to {formatCurrency(S4_APR_18.totalInterest)}, a difference
          of {formatCurrency(S4_APR_18.totalInterest - S4_APR_8.totalInterest)}.
          The rate you qualify for determines whether consolidation saves money
          compared to your current debts. Enter your actual offer in the
          calculator above to get a precise comparison.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Consolidate $20,000 in Debt */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Consolidate {formatCurrency(20000)} in Debt
        </h2>
        <p>
          Using the same three cards from the earlier example ({formatCurrency(8000)}
          at {formatPercent(22)}, {formatCurrency(7000)} at {formatPercent(19)},
          {formatCurrency(5000)} at {formatPercent(24)}, total{" "}
          {formatCurrency(S2_TOTAL_PAY)}/month), the total balance is{" "}
          {formatCurrency(S2_TOTAL_BAL)}. At the current payments, total
          interest across all cards is {formatCurrency(S2_TOTAL_INT)} and the
          longest individual payoff is {S2_MAX_MO} months.
        </p>
        <p>
          Consolidated at {formatPercent(12)} over 60 months, the monthly
          payment is {formatCurrency(S5_CONS.monthlyPayment)}, which is{" "}
          {formatCurrency(S5_MONTHLY_SAVE)} less per month than the current{" "}
          {formatCurrency(S2_TOTAL_PAY)}. Total interest on the consolidation
          loan is {formatCurrency(S5_CONS.totalInterest)}.
        </p>
        <p>
          Comparing total interest: the current debts cost{" "}
          {formatCurrency(S2_TOTAL_INT)} in interest. The 60-month
          consolidation loan costs {formatCurrency(S5_CONS.totalInterest)} in
          interest. The difference is{" "}
          {formatCurrency(Math.abs(S5_INT_DIFF))}.
          {S5_INT_DIFF >= 0
            ? " Consolidation saves that amount in interest."
            : " Consolidation costs that amount more in interest because the 60-month term stretches repayment beyond the current payoff timeline."}
          {" "}The monthly payment drops by {formatCurrency(S5_MONTHLY_SAVE)},
          freeing up cash flow each month. The payoff timeline{" "}
          {S5_MO_DIFF >= 0
            ? `is shortened by ${S5_MO_DIFF} months.`
            : `extends by ${Math.abs(S5_MO_DIFF)} months.`}
        </p>
        <p>
          Whether this trade-off works for you depends on whether you need the
          lower payment for monthly cash flow or whether minimizing total cost
          is the priority. The calculator lets you adjust the term and rate to
          find the crossover point where consolidation switches from saving
          money to costing more.
        </p>
      </section>

      <FaqSection faqs={faqs} />

      <Separator className="my-12" />

      {/* ─── Related Calculators ─── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Related Calculators</h2>
        <p className="text-muted-foreground">
          If you are evaluating a personal loan for consolidation, use our{" "}
          <a
            href="/loans/personal-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Personal Loan Calculator
          </a>
          {" "}to see the amortization schedule and effective APR with an
          origination fee. Compare against vehicle financing with our{" "}
          <a
            href="/loans/auto-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Auto Loan Calculator
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
