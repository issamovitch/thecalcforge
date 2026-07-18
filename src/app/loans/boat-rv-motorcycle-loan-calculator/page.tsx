import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import BoatRVCalculator from "@/components/calculators/BoatRVCalculator";
import {
  calculateLoan,
  calculateLoanWithExtra,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ─── Build-time computed examples (single source of truth) ─── */

function financed(price: number, taxPct: number, tradeIn: number, down: number) {
  return Math.max(0, price + (price * taxPct / 100) - tradeIn - down);
}

const EX = {
  // Boat: $75K, $15K trade-in, $10K down, 0% tax, 8.5% APR, 120mo
  boat: calculateLoan({
    loanAmount: financed(75000, 0, 15000, 10000),
    apr: 8.5,
    termMonths: 120,
  }),
  boatFinanced: financed(75000, 0, 15000, 10000),
  // Boat with extra: $200/mo from month 1
  boatExtra: calculateLoanWithExtra({
    loanAmount: financed(75000, 0, 15000, 10000),
    apr: 8.5,
    termMonths: 120,
    extraMonthly: 200,
    extraStartMonth: 1,
  }),
  // RV: $120K, $0 trade-in, $20K down, 7% tax, 7% APR, 240mo
  rv: calculateLoan({
    loanAmount: financed(120000, 7, 0, 20000),
    apr: 7,
    termMonths: 240,
  }),
  rvFinanced: financed(120000, 7, 0, 20000),
  rvTax: Math.round(120000 * 7) / 100,
  // Motorcycle: $15K, $3K down, 0% tax, 9% APR, 60mo
  moto: calculateLoan({
    loanAmount: financed(15000, 0, 0, 3000),
    apr: 9,
    termMonths: 60,
  }),
  motoFinanced: financed(15000, 0, 0, 3000),
  // Used boat: $35K, $5K trade-in, $5K down, 8% tax, 9.5% APR, 144mo
  used: calculateLoan({
    loanAmount: financed(35000, 8, 5000, 5000),
    apr: 9.5,
    termMonths: 144,
  }),
  usedFinanced: financed(35000, 8, 5000, 5000),
  usedTax: Math.round(35000 * 8) / 100,
  // RV 15yr: $100K, $15K down, 6.5% tax, 6.5% APR, 180mo
  rv15: calculateLoan({
    loanAmount: financed(100000, 6.5, 0, 15000),
    apr: 6.5,
    termMonths: 180,
  }),
  rv15Financed: financed(100000, 6.5, 0, 15000),
  rv15Tax: Math.round(100000 * 6.5) / 100,
};

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/boat-rv-motorcycle-loan-calculator`;
const pageTitle = "Boat Loan Calculator: Payments & Amortization";
const pageDescription =
  "Free boat, RV, and motorcycle loan calculator. Factor in trade-in, down payment, and sales tax to see your true monthly payment and total cost.";

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
    question: "How does trade-in value affect my loan payment?",
    answer:
      "The trade-in value is subtracted directly from the amount you finance. If you buy a $75,000 boat and trade in a vessel worth $15,000, you only need to finance $60,000 (minus any down payment and plus any sales tax). A higher trade-in value means a lower monthly payment and less total interest paid over the life of the loan.",
  },
  {
    question: "Should I include sales tax in my loan calculation?",
    answer:
      "Yes, if your state charges sales tax on vehicle purchases. Sales tax rates vary by state and locality, and some states tax only the difference between the purchase price and the trade-in value rather than the full price. Enter your actual rate in the calculator to see the true financed amount. The calculator applies the tax to the full purchase price; if your state exempts trade-in, enter the effective rate on the taxable portion instead.",
  },
  {
    question: "How do extra payments help on a boat or RV loan?",
    answer:
      "Extra monthly payments go directly toward reducing your principal balance. Because interest is calculated on the remaining balance each month, every extra dollar stops future interest from accruing on that amount. On a long-term loan like an RV or boat loan, even a modest extra payment can save thousands in interest and shave months or years off the term.",
  },
  {
    question: "Is the math different for boats, RVs, and motorcycles?",
    answer:
      "No. All three use the same standard amortizing loan formula. The monthly payment is calculated on the financed amount (purchase price plus tax, minus trade-in and down payment) using the APR and term you enter. The only practical difference is the typical loan term: longer terms are common for RVs, while motorcycle loans tend to be shorter.",
  },
  {
    question: "Can I use this calculator for a used boat or motorcycle?",
    answer:
      "Yes. Enter the actual purchase price of the used vehicle, any trade-in or down payment, and the rate and term offered by your lender. The calculator does not distinguish between new and used; it computes the payment based on the numbers you provide. Used vehicles may have higher APRs and shorter terms than new ones, depending on the lender.",
  },
];

/* ─── Page Component ─── */

export default function BoatRVLoanCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <CanonicalUrl path="/loans/boat-rv-motorcycle-loan-calculator" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "Boat Loan Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Boat, RV & Motorcycle Loan Calculator"
        description="Free loan calculator for boats, RVs, and motorcycles with trade-in, down payment, and sales tax support."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "Boat Loan Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Boat Loan Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A boat loan calculator estimates your monthly payment by factoring in the
        purchase price, trade-in value, down payment, and sales tax rate.
        CalcForge&apos;s free calculator supports boats, RVs, and motorcycles
        with a full amortization schedule and an optional early payoff feature
        so you can compare financing offers accurately.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <BoatRVCalculator />
      </div>

      {/* ─── SEO Content (hidden from print) ─── */}
      <div className="print:hidden">

      <Separator className="my-12" />

      {/* H2: Boat Loan Calculator with Trade In */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Boat Loan Calculator with Trade In
        </h2>
        <p>
          Trading in an existing boat reduces the amount you need to finance,
          which lowers your monthly payment and the total interest you pay. The
          financed amount equals the purchase price plus any sales tax, minus the
          trade-in value and your down payment. The calculator displays the
          financed amount as a separate result tile so you can see exactly how
          the trade-in and down payment reduce the loan balance.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(75000)} boat with a {formatCurrency(15000)} trade-in
          and a {formatCurrency(10000)} down payment at 8.5% APR for 120 months
          finances {formatCurrency(EX.boatFinanced)}. The monthly payment is{" "}
          {formatCurrency(EX.boat.monthlyPayment)}, total interest is{" "}
          {formatCurrency(EX.boat.totalInterest)}, and the total cost over the
          120-month term is {formatCurrency(EX.boat.totalCost)}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: RV Loan Calculator 20 Year */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          RV Loan Calculator 20 Year
        </h2>
        <p>
          Recreational vehicle loans often carry longer terms than auto or
          motorcycle loans because the loan amounts are larger and the vehicles
          hold value over time. A 20-year (240-month) term produces a lower
          monthly payment than a shorter term, but the total interest paid will
          be higher because the principal is outstanding for longer.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(120000)} RV with {formatCurrency(20000)} down and 7%
          sales tax at 7% APR over 240 months. The sales tax adds{" "}
          {formatCurrency(EX.rvTax)}, making the financed amount{" "}
          {formatCurrency(EX.rvFinanced)}. The monthly payment is{" "}
          {formatCurrency(EX.rv.monthlyPayment)}, and total interest over the
          full 240 months is {formatCurrency(EX.rv.totalInterest)}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Motorcycle Loan Calculator with Down Payment */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Motorcycle Loan Calculator with Down Payment
        </h2>
        <p>
          A down payment on a motorcycle loan works the same way as on any
          other vehicle loan: it reduces the principal you borrow, which lowers
          both the monthly payment and the total interest. Because motorcycles
          cost less than boats or RVs, the loan amounts and monthly payments
          are typically smaller, but the APR can vary widely depending on
          whether the loan is secured by the motorcycle or unsecured.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(15000)} motorcycle with a {formatCurrency(3000)}{" "}
          down payment at 9% APR for 60 months finances{" "}
          {formatCurrency(EX.motoFinanced)}. The monthly payment is{" "}
          {formatCurrency(EX.moto.monthlyPayment)}, total interest is{" "}
          {formatCurrency(EX.moto.totalInterest)}, and the total cost is{" "}
          {formatCurrency(EX.moto.totalCost)}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Used Boat Loan Payment Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Used Boat Loan Payment Calculator
        </h2>
        <p>
          Financing a used boat follows the same amortizing formula as a new
          boat. The key difference is that the purchase price is typically
          lower, which means a smaller loan and lower monthly payment. However,
          used-boat loans may carry higher APRs than new-boat loans from the
          same lender. Enter the actual purchase price, your offered rate, and
          the term to see the payment.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(35000)} used boat with a {formatCurrency(5000)}{" "}
          trade-in, {formatCurrency(5000)} down, and 8% sales tax at 9.5% APR
          for 144 months. The sales tax adds {formatCurrency(EX.usedTax)}, and
          the financed amount is {formatCurrency(EX.usedFinanced)}. The monthly
          payment is {formatCurrency(EX.used.monthlyPayment)}, total interest
          is {formatCurrency(EX.used.totalInterest)}, and total cost is{" "}
          {formatCurrency(EX.used.totalCost)}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: RV Loan Calculator 15 Year with Tax */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          RV Loan Calculator 15 Year with Tax
        </h2>
        <p>
          Sales tax on an RV purchase is applied to the purchase price and can
          add a significant amount to the total you finance. The rate varies by
          state and locality, and some states exempt trade-in value from the
          taxable amount while others do not. The calculator lets you enter
          your actual sales tax rate so the financed amount reflects your
          specific situation.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(100000)} RV with {formatCurrency(15000)} down and
          6.5% sales tax at 6.5% APR for 180 months. The sales tax adds{" "}
          {formatCurrency(EX.rv15Tax)}, making the financed amount{" "}
          {formatCurrency(EX.rv15Financed)}. The monthly payment is{" "}
          {formatCurrency(EX.rv15.monthlyPayment)}, total interest is{" "}
          {formatCurrency(EX.rv15.totalInterest)}, and the total cost is{" "}
          {formatCurrency(EX.rv15.totalCost)}.
        </p>
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-3">
              Sales Tax Note
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                Sales tax rates vary by state, county, and city. The
                calculator applies your entered rate to the full purchase
                price.
              </li>
              <li>
                Some states tax only the difference between the purchase price
                and the trade-in value. If your state does this, calculate the
                taxable amount yourself and enter the effective rate that
                produces the correct tax on the purchase price field.
              </li>
              <li>
                Dealer documentation fees, registration, and title fees are
                not included in the financed amount. These are typically paid
                separately at closing.
              </li>
            </ul>
          </CardContent>
        </Card>
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
          Compare vehicle loan costs against other borrowing products with our{" "}
          <a
            href="/loans/title-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Title Loan Calculator
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