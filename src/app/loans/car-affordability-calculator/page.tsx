import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import CarAffordabilityCalculator from "@/components/calculators/CarAffordabilityCalculator";
import {
  reverseSolveMaxPrincipal,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── Helper: compute max price from a given monthly payment ─── */

function maxPriceFromPayment(
  payment: number,
  apr: number,
  termMonths: number,
  down: number,
  tradeIn: number,
  taxPct: number,
) {
  const principal = reverseSolveMaxPrincipal(payment, apr, termMonths);
  const price = Math.max(0, (principal + down + tradeIn) / (1 + taxPct / 100));
  const tax = Math.round(price * taxPct) / 100;
  const totalCost = Math.round(payment * termMonths * 100) / 100;
  const totalInterest = Math.round((totalCost - principal) * 100) / 100;
  return { price, tax, principal, totalCost, totalInterest, payment };
}

/* ─── Build-time computed examples ─── */

// Section 1: How Much Car Can I Afford Based on Salary
// $60K gross, $500 existing debt, 15% target, $5K down, $0 trade-in, 7% tax, 6.5% APR, 60mo
const S1_MONTHLY_GROSS = Math.round(60000 / 12 * 100) / 100;
const S1_MAX_DEBT = Math.round(S1_MONTHLY_GROSS * 0.15 * 100) / 100;
const S1_PAYMENT = Math.round((S1_MAX_DEBT - 500) * 100) / 100;
const S1 = maxPriceFromPayment(S1_PAYMENT, 6.5, 60, 5000, 0, 7);

// Section 3: How Much Car Can I Afford on 60k Salary (same assumptions, shown in more detail)
const S3_MONTHLY_GROSS = S1_MONTHLY_GROSS;
const S3_MAX_DEBT = S1_MAX_DEBT;
const S3_PAYMENT = S1_PAYMENT;
const S3 = S1;

// Section 3b: 60K under 20/4/10 rule (stricter)
// $60K gross, 10% = $500/mo budget, $150 insurance, $120 fuel, $50 maintenance = $320 non-loan
// Available for loan = $500 - $320 = $180
// 20% down required, 48-month term, 6.5% APR, 7% tax
const S3B_BUDGET = Math.round(60000 / 12 * 0.10 * 100) / 100;
const S3B_NON_LOAN = 150 + 120 + 50;
const S3B_AVAILABLE = Math.round((S3B_BUDGET - S3B_NON_LOAN) * 100) / 100;
const S3B_PRINCIPAL = reverseSolveMaxPrincipal(S3B_AVAILABLE, 6.5, 48);
const S3B_PRICE = Math.round(S3B_PRINCIPAL / (0.80 + 0.07) * 100) / 100;
const S3B_DOWN = Math.round(S3B_PRICE * 0.20 * 100) / 100;
const S3B_TAX = Math.round(S3B_PRICE * 0.07 * 100) / 100;
const S3B_TOTAL_COST = Math.round(S3B_AVAILABLE * 48 * 100) / 100;
const S3B_TOTAL_INTEREST = Math.round((S3B_TOTAL_COST - S3B_PRINCIPAL) * 100) / 100;

// Section 4: Car Payment Calculator Based on Income
// $80K gross, $700 debt, 15% target, $8K down, $3K trade-in, 6% tax, 7% APR, 60mo
const S4_MONTHLY = Math.round(80000 / 12 * 100) / 100;
const S4_MAX_DEBT = Math.round(S4_MONTHLY * 0.15 * 100) / 100;
const S4_PAYMENT = Math.round((S4_MAX_DEBT - 700) * 100) / 100;
const S4 = maxPriceFromPayment(S4_PAYMENT, 7, 60, 8000, 3000, 6);

// Section 5: Affordable Car Price Calculator by Monthly Payment
// Target $400/mo, $4K down, $2K trade-in, 8% tax, 6.5% APR, 48mo
const S5 = maxPriceFromPayment(400, 6.5, 48, 4000, 2000, 8);

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/car-affordability-calculator`;
const pageTitle = "How Much Car Can I Afford Calculator";

export const metadata: Metadata = {
  title: pageTitle,
  description:
    "Free car affordability calculator. Enter your income or target payment to find the maximum vehicle price you can finance, with the 20/4/10 rule analysis.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: pageTitle,
    description:
      "Free car affordability calculator. Enter your income or target payment to find the maximum vehicle price you can finance.",
    url: pageUrl,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description:
      "Free car affordability calculator with income-based and 20/4/10 rule analysis.",
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
    question: "How is the maximum vehicle price calculated?",
    answer:
      "The calculator first determines the maximum monthly loan payment you can afford, then uses the present-value-of-annuity formula to find the largest loan principal that payment supports. It then adds your down payment and trade-in value, and solves for the vehicle price such that the sales tax on that price, minus the down payment and trade-in, equals the loan principal. This produces the tax-inclusive maximum price rather than an approximation.",
  },
  {
    question: "What is the 20/4/10 rule for car buying?",
    answer:
      "The 20/4/10 rule is a commonly cited guideline with three parts: put down at least 20 percent of the vehicle price, choose a loan term no longer than 4 years (48 months), and keep total monthly transportation costs at or below 10 percent of gross monthly income. The 10 percent covers the loan payment, insurance, fuel, and maintenance combined, not just the loan. This calculator lets you test all three constraints and shows whether your inputs satisfy them simultaneously.",
  },
  {
    question: "Why does this calculator use gross income instead of take-home pay?",
    answer:
      "Affordability rules like 20/4/10 and debt-to-income targets are conventionally expressed against gross (pre-tax) income. Your take-home pay is lower after taxes, insurance premiums, retirement contributions, and other deductions, so a payment sized as a percentage of gross income consumes a larger share of your actual take-home than the percentage suggests. This calculator uses gross income because that is how these rules are defined, and does not attempt to estimate net income or tax withholdings.",
  },
  {
    question: "What is the difference between this calculator and the auto loan calculator?",
    answer:
      "This tool works in the opposite direction. The auto loan calculator takes a vehicle price and computes the monthly payment. This affordability calculator takes your income or a target payment and computes the maximum vehicle price you can finance. Use this tool when you are setting a budget and deciding how much car to shop for. Use the auto loan calculator when you already have a specific deal or price in mind and want to know the payment.",
  },
  {
    question: "What happens if my existing debt is too high to afford any car payment?",
    answer:
      "If your existing monthly debt obligations already meet or exceed your target debt-to-income percentage, the calculator shows a message that no budget remains for a car payment. You would need to either reduce existing debt, increase your income, or raise the target percentage. The percentage is your choice, not a fixed recommendation, so you can adjust it to see what changes.",
  },
];

/* ─── Page Component ─── */

export default function CarAffordabilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "How Much Car Can I Afford Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="How Much Car Can I Afford Calculator"
        description="Free car affordability calculator. Enter income or target payment to find the maximum vehicle price you can finance, including 20/4/10 rule analysis."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "How Much Car Can I Afford Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        How Much Car Can I Afford Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A how much car can I afford calculator reverses the usual loan math:
        instead of starting with a vehicle price and computing the payment, it
        starts with your income (or a target payment) and solves for the
        maximum vehicle price that payment can support. CalcForge&apos;s tool
        includes a dedicated 20/4/10 rule mode that enforces all three
        constraints simultaneously.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <CarAffordabilityCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── SEO Content (hidden from print) ─── */}
      <div className="print:hidden">

      <Separator className="my-12" />

      {/* H2: How Much Car Can I Afford Based on Salary */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          How Much Car Can I Afford Based on Salary
        </h2>
        <p>
          Salary-based affordability works by converting your annual gross
          income into a monthly figure, applying a target debt-to-income
          percentage, and subtracting any existing monthly debt obligations.
          What remains is the maximum amount available for a car payment. The
          calculator then reverse-solves the loan formula to find the largest
          vehicle price that payment can finance.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> With a{" "}
          {formatCurrency(60000)} gross annual salary, a 15% total
          debt-to-income target, and {formatCurrency(500)} in existing monthly
          debt, the monthly gross is {formatCurrency(S1_MONTHLY_GROSS)} and
          the maximum total monthly debt is {formatCurrency(S1_MAX_DEBT)}.
          After subtracting existing debt, the maximum car payment is{" "}
          {formatCurrency(S1_PAYMENT)}. At 6.5% APR for 60 months with{" "}
          {formatCurrency(5000)} down and 7% sales tax, this payment supports
          a maximum vehicle price of {formatCurrency(S1.price)}.
        </p>
        <p>
          These figures use gross income. Actual take-home pay is lower after
          taxes and deductions, so a {formatCurrency(S1_PAYMENT)} payment
          consumes a larger share of take-home than 15% of gross might suggest.
          The calculator does not estimate net income because tax withholdings
          vary by filing status, deductions, and jurisdiction.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Car Affordability Calculator 20/4/10 Rule */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Car Affordability Calculator 20/4/10 Rule
        </h2>
        <p>
          The 20/4/10 rule is a commonly cited guideline with three parts: put
          down at least 20 percent of the purchase price, finance for no longer
          than 4 years (48 months), and keep total monthly transportation
          costs at or below 10 percent of gross monthly income. The 10 percent
          ceiling covers the loan payment, insurance, fuel, and maintenance
          combined, not the loan payment alone.
        </p>
        <p>
          Because insurance, fuel, and maintenance vary by vehicle, location,
          and driving habits, this calculator lets you enter your own estimates
          for those three costs. It subtracts them from the 10 percent budget
          and shows what remains for the loan payment. If you leave them at
          zero, the result assumes those costs are zero, which is not
          realistic. The calculator displays a warning when that happens.
        </p>
        <p>
          The 20/4/10 mode in the calculator above enforces all three
          constraints: the term is locked at 48 months, and if your entered
          down payment is less than 20 percent of the resulting price, the
          calculator shows the lower price that satisfies the 20 percent down
          requirement alongside the price computed with your actual down
          payment.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: How Much Car Can I Afford on 60k Salary */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          How Much Car Can I Afford on 60k Salary
        </h2>
        <p>
          A {formatCurrency(60000)} gross annual salary translates to{" "}
          {formatCurrency(S3_MONTHLY_GROSS)} per month. The maximum vehicle
          price depends on what percentage of that income you allocate to debt,
          how much existing debt you carry, and the loan terms. Below are two
          scenarios using the same income, each with every assumption stated
          explicitly.
        </p>
        <p>
          <strong>Scenario A: Flexible budget (15% target).</strong> A 15%
          debt-to-income target allows {formatCurrency(S3_MAX_DEBT)} in total
          monthly debt. With {formatCurrency(500)} in existing monthly debt,
          the maximum car payment is {formatCurrency(S3_PAYMENT)}. At 6.5%
          APR for 60 months, {formatCurrency(5000)} down, {formatCurrency(0)}
          trade-in, and 7% sales tax, the maximum vehicle price is{" "}
          {formatCurrency(S3.price)}. Total interest over the loan is{" "}
          {formatCurrency(S3.totalInterest)}, and the total loan cost is{" "}
          {formatCurrency(S3.totalCost)}.
        </p>
        <p>
          <strong>Scenario B: 20/4/10 rule (10% budget, stricter).</strong> A
          10% gross-monthly budget gives {formatCurrency(S3B_BUDGET)}.
          Subtracting {formatCurrency(150)} for insurance, {formatCurrency(120)}
          {" "}for fuel, and {formatCurrency(50)} for maintenance leaves{" "}
          {formatCurrency(S3B_AVAILABLE)} for the loan payment. The term is
          capped at 48 months and the down payment must be at least 20% of
          the price. At 6.5% APR and 7% sales tax, the maximum price
          satisfying all three constraints is {formatCurrency(S3B_PRICE)},
          with a required {formatCurrency(S3B_DOWN)} down payment. Total
          interest over 48 months is {formatCurrency(S3B_TOTAL_INTEREST)}.
        </p>
        <p>
          The flexible 15% budget allows a {formatCurrency(S3.price)} vehicle.
          The 20/4/10 rule tightens the maximum to {formatCurrency(S3B_PRICE)}.
          The difference comes from two sources: the lower income percentage
          (10% versus 15%), and the non-loan transportation costs that consume
          part of that budget.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Car Payment Calculator Based on Income */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Car Payment Calculator Based on Income
        </h2>
        <p>
          An income-based car payment calculator works backward from what you
          earn rather than forward from what a vehicle costs. You provide your
          gross annual income, existing monthly obligations, and a target
          debt-to-income percentage. The calculator determines the maximum
          monthly payment, then reverse-solves for the loan principal, then
          for the vehicle price including tax.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> With{" "}
          {formatCurrency(80000)} gross annual income ({formatCurrency(S4_MONTHLY)}{" "}
          monthly), a 15% debt-to-income target, and {formatCurrency(700)} in
          existing monthly debt, the maximum car payment is{" "}
          {formatCurrency(S4_PAYMENT)}. At 7% APR for 60 months,{" "}
          {formatCurrency(8000)} down, {formatCurrency(3000)} trade-in, and
          6% sales tax, the maximum vehicle price is{" "}
          {formatCurrency(S4.price)}. The financed amount is{" "}
          {formatCurrency(S4.principal)}, and total interest over the loan is{" "}
          {formatCurrency(S4.totalInterest)}.
        </p>
        <p>
          The target percentage is a user-chosen input, not a recommendation.
          Some borrowers are comfortable allocating a higher percentage of
          income to a car payment, while others prefer to keep it lower. The
          calculator shows the result for whatever percentage you enter so you
          can compare scenarios.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Affordable Car Price Calculator by Monthly Payment */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Affordable Car Price Calculator by Monthly Payment
        </h2>
        <p>
          If you already know the maximum monthly payment you can handle, the
          &ldquo;From Monthly Payment&rdquo; mode in the calculator skips the
          income step entirely. You enter the payment, and the calculator
          reverse-solves for the largest loan principal and corresponding
          vehicle price.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A target
          payment of {formatCurrency(400)} per month at 6.5% APR for 48 months
          supports a maximum loan principal of{" "}
          {formatCurrency(S5.principal)}. With {formatCurrency(4000)} down,
          {formatCurrency(2000)} trade-in, and 8% sales tax, the maximum
          vehicle price is {formatCurrency(S5.price)}. Sales tax on that
          price is {formatCurrency(S5.tax)}, and total interest over the loan
          is {formatCurrency(S5.totalInterest)}.
        </p>
        <p>
          This mode is useful when you have already decided on a payment
          amount through your own budgeting and want to know what vehicle
          price range to shop in. Combine it with the income-based mode to
          verify that your target payment is consistent with your income and
          existing obligations.
        </p>
      </section>

      <FaqSection faqs={faqs} />

      <Separator className="my-12" />

      {/* ─── Related Calculators ─── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Related Calculators</h2>
        <p className="text-muted-foreground">
          Once you know your budget, use the{" "}
          <a
            href="/loans/auto-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Auto Loan Calculator
          </a>{" "}
          to compute the exact monthly payment on a specific vehicle price and
          compare financing offers. For other borrowing needs, see the{" "}
          <a
            href="/loans/personal-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Personal Loan Calculator
          </a>
          ,{" "}
          <a
            href="/loans/debt-consolidation-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Debt Consolidation Calculator
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
