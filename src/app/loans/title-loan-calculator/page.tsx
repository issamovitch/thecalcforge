import type { Metadata } from "next";
import { siteConfig, VERIFIED_DATE, OCCC_REPORT_URL, OCCC_BASE_URL } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { TitleLoanCalculator } from "@/components/calculators/TitleLoanCalculator";
import {
  calculateLoan,
  calculateEarlyPayoff,
  calculateFloridaTitleLoan,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ─── Build-time computed examples (single source of truth) ─── */

const EX = {
  formula: calculateLoan({ loanAmount: 5000, apr: 120, termMonths: 12 }),
  cost3k: calculateLoan({ loanAmount: 3000, apr: 200, termMonths: 12 }),
  /* Florida: single-payment, 30-day, computed from Fla. Stat. § 537.011 tiers */
  florida2k: calculateFloridaTitleLoan(2000),
  florida5k: calculateFloridaTitleLoan(5000),
  /* Texas: amortizing, 180-day max term, per OCCC data */
  texas: calculateLoan({ loanAmount: 1500, apr: 300, termMonths: 6 }),
  payoff: calculateEarlyPayoff(
    { loanAmount: 5000, apr: 120, termMonths: 12 },
    200,
    7,
  ),
  paymentAmounts: [1000, 2500, 5000, 10000],
  payments: [
    calculateLoan({ loanAmount: 1000, apr: 120, termMonths: 12 }),
    calculateLoan({ loanAmount: 2500, apr: 120, termMonths: 12 }),
    calculateLoan({ loanAmount: 5000, apr: 120, termMonths: 12 }),
    calculateLoan({ loanAmount: 10000, apr: 120, termMonths: 24 }),
  ],
};

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/title-loan-calculator`;
const pageTitle = "Title Loan Calculator – Estimate Payments & Interest";
const pageDescription =
  "Free title loan calculator to estimate monthly payments, total interest, and amortization. See how much a title loan costs before you borrow.";

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
    question: "How much can I borrow with a title loan?",
    answer:
      "Most title lenders offer 25% to 50% of your vehicle's appraised value. For example, if your car is worth $10,000, you could borrow between $2,500 and $5,000. The exact amount depends on the lender, your state's regulations, your income, and the vehicle's condition and mileage.",
  },
  {
    question: "What is the average interest rate on a title loan?",
    answer:
      "Title loan annual percentage rates (APRs) typically range from 100% to 300%, which is significantly higher than traditional personal loans or credit cards. Some states cap the maximum rate, while others do not. Always compare rates from multiple lenders and read the loan agreement carefully.",
  },
  {
    question: "Can I pay off my title loan early?",
    answer:
      "Yes, most title loans allow early repayment, and many states require lenders to prorate interest charges. Paying off your loan ahead of schedule can substantially reduce the total interest you pay. Check your specific loan agreement for any prepayment penalties.",
  },
  {
    question: "What happens if I default on a title loan?",
    answer:
      "If you fail to make payments, the lender may repossess your vehicle, sell it, and apply the sale proceeds to your outstanding balance. You may also be responsible for any deficiency (the remaining amount owed after the sale). Defaulting can severely damage your credit score. Contact your lender immediately if you anticipate difficulty making payments.",
  },
  {
    question: "How is a title loan different from a personal loan?",
    answer:
      "A title loan is secured by your vehicle's title, which allows lenders to offer loans without checking your credit score. Personal loans are typically unsecured and require good credit. Title loans carry much higher interest rates and shorter repayment terms, but are easier to qualify for. Personal loans generally offer lower rates and longer terms.",
  },
];

/* ─── Page Component ─── */

export default function TitleLoanCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <CanonicalUrl path="/loans/title-loan-calculator" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          { name: "Title Loan Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Title Loan Calculator"
        description="Free online title loan calculator. Estimate monthly payments, total interest, and view a full amortization schedule for any title loan."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loan Calculators", href: "/loans" },
          { label: "Title Loan Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Title Loan Calculator
      </h1>

      {/* Intro paragraph — targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A title loan calculator is a free online tool that estimates your
        monthly payment, total interest, and total repayment cost based on your
        vehicle&apos;s value, the loan amount, the interest rate, and the
        repayment term. It tells you exactly how much borrowing against your car
        title will cost before you sign, so you can compare lenders and avoid
        overpaying.
      </p>

      {/* Calculator (client component — SSR with default values, no Suspense) */}
      <div className="mt-8">
        <TitleLoanCalculator />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords) — hidden from print ─── */}

      <div className="print:hidden">

      <Separator className="my-12" />

      {/* H2: How to Calculate Title Loan Interest */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          How to Calculate Title Loan Interest
        </h2>
        <p>
          Title loan interest is calculated using the standard amortizing loan
          formula. The lender applies a monthly interest rate to your remaining
          principal balance, meaning you pay more interest in the early months
          and more principal toward the end of the loan term.
        </p>
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-2">Monthly Payment Formula</p>
            <p className="font-mono text-sm text-ember break-all">
              M = P &times; [r(1 + r)<sup>n</sup>] / [(1 + r)<sup>n</sup> &minus;
              1]
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>
                <strong>M</strong> = Monthly payment
              </li>
              <li>
                <strong>P</strong> = Loan principal (borrowed amount)
              </li>
              <li>
                <strong>r</strong> = Monthly interest rate (APR &divide; 12)
              </li>
              <li>
                <strong>n</strong> = Total number of payments (months)
              </li>
            </ul>
          </CardContent>
        </Card>
        <p>
          For example, a $5,000 title loan at 120% APR for 12 months would have
          a monthly rate of 10%. Applying the formula: M = $5,000 &times;
          [0.10 &times; (1.10)<sup>12</sup>] / [(1.10)<sup>12</sup> &minus; 1]
          &asymp; <strong>{formatCurrency(EX.formula.monthlyPayment)} per month</strong>. The total interest paid
          would be approximately {formatCurrency(EX.formula.totalInterest)}, bringing the total cost to{" "}
          {formatCurrency(EX.formula.totalCost)}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Title Loan Payment Calculator with Amortization */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Title Loan Payment Calculator with Amortization
        </h2>
        <p>
          The calculator above generates a full amortization schedule showing how
          each monthly payment is split between principal and interest. This is
          essential for understanding the true cost of borrowing. In the early
          months of a title loan, the majority of your payment goes toward
          interest rather than reducing the principal balance.
        </p>
        <p>
          By reviewing the amortization table, you can see exactly how much of
          each payment reduces your outstanding balance. This helps you plan for
          early repayment — even a small additional payment toward the principal
          each month can save significant money over the life of the loan.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: How Much Does a Title Loan Cost? */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          How Much Does a Title Loan Cost?
        </h2>
        <p>
          The total cost of a title loan depends on three factors: the amount
          you borrow, the interest rate, and the repayment term. Because title
          loan APRs are typically very high — often 100% to 300% — the finance
          charges can exceed the original loan amount.
        </p>
        <p>
          For instance, borrowing $3,000 at 200% APR for 12 months would result
          in total interest charges of approximately {formatCurrency(EX.cost3k.totalInterest)}, making the total
          repayment around {formatCurrency(EX.cost3k.totalCost)}. That means you pay more in interest than the
          amount you originally borrowed. Always use a title loan calculator to
          compare the total cost before committing.
        </p>
        <p>
          Additionally, some lenders charge origination fees, lien fees, or
          documentation fees that add to the total cost. These fees vary by
          state and lender, so be sure to ask for a complete breakdown of all
          charges before signing.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Title Loan vs Payday Loan */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Title Loan vs Payday Loan: Key Differences
        </h2>
        <p>
          While both title loans and payday loans offer fast access to cash
          without a credit check, they differ significantly in structure. Title
          loans are secured by your vehicle and typically offer larger amounts
          ($100 to $50,000) with longer repayment terms (up to 48 months).
          Payday loans are unsecured, usually limited to $500, and must be
          repaid on your next payday (two to four weeks).
        </p>
        <p>
          The main risk with a title loan is vehicle repossession if you
          default. With a payday loan, the risk is a cycle of debt caused by
          rollovers and extremely high fees. Both are expensive forms of credit
          and should be considered only after exhausting all other options.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Title Loan Calculator Florida */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Title Loan Calculator Florida
        </h2>
        <p>
          Florida regulates title loans under the Florida Title Loan Act,{" "}
          <a
            href="https://www.flsenate.gov/Laws/Statutes/2024/537.011"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Fla. Stat. §&nbsp;537.011
          </a>
          , administered by the{" "}
          <a
            href="https://www.flofr.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Florida Office of Financial Regulation (OFR)
          </a>
          . Florida caps interest on title loans using a marginal-tier system
          — three per-annum rates that apply to different portions of the
          principal simultaneously:
        </p>
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-3">
              Statutory Maximum Interest Rates (per Fla. Stat. §&nbsp;537.011)
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                <strong>30% per annum</strong> on the first $2,000
              </li>
              <li>
                <strong>24% per annum</strong> on the portion from $2,000 to
                $3,000
              </li>
              <li>
                <strong>18% per annum</strong> on the portion above $3,000
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              These are marginal tiers, not brackets selected by loan size. A
              $5,000 loan triggers all three rates simultaneously, producing a
              blended annual rate lower than 30%.
            </p>
          </CardContent>
        </Card>
        <p>
          Florida title loans mature 30&nbsp;days from execution. Borrowers may
          extend the loan in additional 30-day periods by mutual consent, but
          the lender may not capitalize unpaid interest into an extension. Any
          interest charged in excess of the statutory cap violates{" "}
          <a
            href="https://www.flsenate.gov/Laws/Statutes/2024/687"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Fla. Stat. ch.&nbsp;687
          </a>{" "}
          (Florida&apos;s usury statute); if the lender acted to circumvent
          the cap, the agreement is void.
        </p>
        <p>
          Florida caps title loan rates far below states like Texas. For
          context, the calculator&apos;s default of 120% APR would be illegal
          in Florida — the statutory maximum blended rate on any loan size is
          30% per annum.
        </p>
        <p>
          <strong>Important:</strong> Florida title loans are single-payment
          instruments. The borrower pays the full principal plus interest in one
          lump sum at the end of each 30-day period. The amortizing calculator
          above models monthly installment loans, which is a different product
          than what Florida law permits.
        </p>
        <p>
          <strong>Worked example (computed from statute):</strong> A $2,000
          Florida title loan for 30&nbsp;days falls entirely in the first tier
          (30% per annum = 2.5% per month). Interest ={" "}
          {formatCurrency(EX.florida2k.monthlyInterest)}, total to reclaim the
          title = {formatCurrency(EX.florida2k.totalRepayment)}.
        </p>
        <p>
          <strong>Blended-tier example (computed from statute):</strong> A
          $5,000 Florida title loan for 30&nbsp;days crosses all three tiers:{" "}
          {formatCurrency(EX.florida5k.tiers[0].interest)} on the first $2,000
          (30% p.a.), {formatCurrency(EX.florida5k.tiers[1].interest)} on the
          next $1,000 (24% p.a.), and {formatCurrency(EX.florida5k.tiers[2].interest)}{" "}
          on the remaining $2,000 (18% p.a.). Total interest ={" "}
          {formatCurrency(EX.florida5k.monthlyInterest)}, blended effective
          rate = {formatPercent(EX.florida5k.blendedAnnualRate)}, total to
          reclaim = {formatCurrency(EX.florida5k.totalRepayment)}.
        </p>
        <p className="text-xs text-muted-foreground">
          Sources: Fla. Stat. §&nbsp;537.011 (2024),{" "}
          <a
            href="https://www.flofr.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-hover underline underline-offset-4"
          >
            flofr.gov
          </a>
          . Last verified: {VERIFIED_DATE}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Title Loan Calculator Texas */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Title Loan Calculator Texas
        </h2>
        <p>
          Texas regulates title loans through the{" "}
          <a
            href={OCCC_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Office of Consumer Credit Commissioner (OCCC)
          </a>
          . Most Texas title lenders operate as Credit Access Businesses (CABs)
          or Credit Services Organizations (CSOs). In this model, a third-party
          lender provides the actual loan funds at 10% APR or less, while the CAB
          charges a separate fee that is{" "}
          <strong>not capped by state law</strong>.
        </p>
        <p>
          According to the OCCC&apos;s{" "}
          <a
            href={OCCC_REPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            2025 Report on Availability, Quality and Pricing of Certain
            Financial Services and Consumer Loan Products
          </a>{" "}
          (published December&nbsp;1, 2025, covering 2024 data), effective APRs
          on Texas title loans routinely exceed 400%. Typical loan amounts range
          from $400 to $1,200, and there is no statutory maximum loan amount.
          CAB agreement terms are limited to 180&nbsp;days or less.
        </p>
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-2">
              Key Texas Title Loan Facts (OCCC 2025 Report)
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                Third-party lender interest: 10% APR or less
              </li>
              <li>
                CAB fees: uncapped by state law
              </li>
              <li>
                Effective APR: routinely exceeds 400%
              </li>
              <li>
                Typical loan amounts: $400 to $1,200; no statutory maximum
              </li>
              <li>
                Maximum term: 180 days (6 months)
              </li>
              <li>
                Late charge: 5% of payment amount or $7.50, whichever is
                greater, after 10 days
              </li>
              <li>
                Repossessions: approximately 9,700 per quarter, roughly 4.2% of
                active title loans
              </li>
            </ul>
          </CardContent>
        </Card>
        <p>
          The OCCC&apos;s own benchmark illustrates the cost: a $1,500 title
          loan carries an effective APR of 262% to 366%, with 11 monthly
          payments of $327 plus a final payment of $1,827. The finance charge
          totals $3,921, and the total repayment is $5,421 — nearly 3.6 times
          the amount borrowed.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A $1,500 title
          loan in Texas at 300% APR over the maximum 180-day (6-month) term
          produces a monthly payment of {formatCurrency(EX.texas.monthlyPayment)}.
          Total interest reaches {formatCurrency(EX.texas.totalInterest)},
          making the total repayment {formatCurrency(EX.texas.totalCost)} —
          roughly double the original loan. Enter 300% APR and $1,500 in the
          calculator above with a 6-month term to see the full amortization.
        </p>
        <p className="text-xs text-muted-foreground">
          Source:{" "}
          <a
            href={OCCC_REPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-hover underline underline-offset-4"
          >
            Texas OCCC, 2025 Report on Availability, Quality and Pricing of
            Certain Financial Services and Consumer Loan Products
          </a>{" "}
          (Dec.&nbsp;1, 2025, covering 2024 data),{" "}
          <a
            href={OCCC_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember hover:text-ember-hover underline underline-offset-4"
          >
            occc.texas.gov
          </a>
          . Last verified: {VERIFIED_DATE}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Car Title Loan Calculator with Payments */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Car Title Loan Calculator with Payments
        </h2>
        <p>
          A car title loan uses your vehicle as collateral, and the monthly
          payment schedule depends entirely on the loan size, interest rate, and
          term. Because title loans amortize, each payment includes both
          interest and principal — but the ratio shifts over time. In month
          one, the vast majority of your payment covers interest. By the final
          months, nearly the entire payment goes toward principal.
        </p>
        <p>
          Here is what monthly payments typically look like at common loan sizes
          (assuming a 120% APR):
        </p>
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="font-medium">$1,000 loan, 12 months</span>
                <span className="font-semibold text-ember">{formatCurrency(EX.payments[0].monthlyPayment)}/mo</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">$2,500 loan, 12 months</span>
                <span className="font-semibold text-ember">{formatCurrency(EX.payments[1].monthlyPayment)}/mo</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">$5,000 loan, 12 months</span>
                <span className="font-semibold text-ember">{formatCurrency(EX.payments[2].monthlyPayment)}/mo</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">$10,000 loan, 24 months</span>
                <span className="font-semibold text-ember">{formatCurrency(EX.payments[3].monthlyPayment)}/mo</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <p>
          At 120% APR, the total interest on these loans ranges from{" "}
          {`${Math.round(EX.payments[0].totalInterest / EX.paymentAmounts[0] * 100)}%`}
          {" "}to{" "}
          {`${Math.round(EX.payments[3].totalInterest / EX.paymentAmounts[3] * 100)}%`}
          {" "}of the original borrowed amount. Shortening the term lowers
          total interest but raises the monthly payment, while extending the
          term does the opposite. Use the calculator to experiment with
          different combinations and find a payment you can afford.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Title Loan Payoff Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Title Loan Payoff Calculator
        </h2>
        <p>
          Paying off a title loan early is one of the most effective ways to
          reduce its total cost. Because title loan interest is calculated on
          the remaining balance each month, every extra dollar you pay toward
          principal immediately stops future interest from accruing on that
          dollar. Most states require lenders to prorate interest, meaning you
          only pay interest for the days the loan is outstanding.
        </p>
        <p>
          <strong>How early payoff works:</strong> Suppose you have a $5,000
          title loan at 120% APR for 12 months with a {formatCurrency(EX.payoff.baseResult.monthlyPayment)} monthly payment.
          After month six, your remaining balance is approximately {formatCurrency(EX.payoff.baseResult.schedule[5].balance)}. If
          you then add an extra $200 per month to your regular payment for the
          remaining six months, the additional $1,200 in principal payments
          would shorten your loan by roughly {EX.payoff.monthsSaved} month{EX.payoff.monthsSaved !== 1 ? "s" : ""} and save{" "}
          approximately {formatCurrency(EX.payoff.interestSaved)} in interest — cutting your total cost from {formatCurrency(EX.payoff.baseResult.totalCost)}{" "}
          to around {formatCurrency(EX.payoff.result.totalCost)}.
        </p>
        <p>
          To calculate your own early payoff savings, look at the amortization
          table in the calculator above. Find your current month and remaining
          balance, then compare the remaining interest on your current schedule
          versus a shorter term. Even a single extra payment of $100–$200 can
          make a meaningful dent in total interest charges.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Factors That Affect Your Title Loan Amount */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Factors That Affect Your Title Loan Amount
        </h2>
        <p>
          Several factors determine how much you can borrow with a title loan.
          The most important is your vehicle&apos;s appraised value — lenders
          typically offer 25% to 50% of that value. A car worth $15,000 might
          qualify you for a loan of $3,750 to $7,500, depending on the lender.
        </p>
        <p>
          Other factors include your ability to repay the loan (verified through
          income documentation), your state&apos;s legal limits on title loan
          amounts and interest rates, and the vehicle&apos;s age, mileage, and
          condition. Some lenders may also consider whether you own the vehicle
          outright or still have an existing auto loan balance.
        </p>
        <p>
          To get the best terms, shop around with multiple lenders and use this
          calculator to compare the total cost at different rates and terms
          before signing any agreement.
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

      {/* ─── Related Calculators (only links to existing pages) ─── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Related Calculators</h2>
        <p className="text-muted-foreground">
          Compare title loan costs against unsecured payday loans with our{" "}
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