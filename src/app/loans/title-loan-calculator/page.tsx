import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { TitleLoanCalculator } from "@/components/calculators/TitleLoanCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/loans/title-loan-calculator`;
const pageTitle = "Title Loan Calculator – Estimate Payments & Interest";
const pageDescription =
  "Free title loan calculator to estimate monthly payments, total interest, and amortization. See how much a title loan costs before you borrow.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: pageUrl },
  keywords: [
    "title loan calculator",
    "title loan payment calculator",
    "title loan interest calculator",
    "car title loan calculator",
    "title loan amortization",
    "how much does a title loan cost",
    "title loan estimator",
    "auto title loan calculator",
  ],
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
      {/* JSON-LD */}
      <CanonicalUrl path="/loans/title-loan-calculator" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loan Calculators", url: `${siteConfig.url}/loans` },
          {
            name: "Title Loan Calculator",
            url: pageUrl,
          },
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
        className="mb-8"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Title Loan Calculator
      </h1>
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl">
        Estimate your title loan monthly payments, total interest, and finance
        charges before you sign. Enter your vehicle value, desired loan amount,
        and interest rate to see a complete amortization schedule.
      </p>

      {/* Calculator (client component, wrapped in Suspense for useSearchParams) */}
      <div className="mt-8">
        <Suspense
          fallback={
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground">
                  Loading calculator&hellip;
                </p>
              </CardContent>
            </Card>
          }
        >
          <TitleLoanCalculator />
        </Suspense>
      </div>

      {/* ─── Content Sections (H2 long-tail keywords) ─── */}

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
          &asymp; <strong>$662.31 per month</strong>. The total interest paid
          would be approximately $2,947.73, bringing the total cost to
          $7,947.73.
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
          in total interest charges of approximately $3,855, making the total
          repayment around $6,855. That means you pay more in interest than the
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
          While both title loans and{" "}
          <a
            href="/loans/payday-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            payday loans
          </a>{" "}
          offer fast access to cash without a credit check, they differ
          significantly in structure. Title loans are secured by your vehicle
          and typically offer larger amounts ($100 to $50,000) with longer
          repayment terms (up to 48 months). Payday loans are unsecured, usually
          limited to $500, and must be repaid on your next payday (two to four
          weeks).
        </p>
        <p>
          The main risk with a title loan is vehicle repossession if you
          default. With a payday loan, the risk is a cycle of debt caused by
          rollovers and extremely high fees. Both are expensive forms of credit
          and should be considered only after exhausting all other options. Use
          each respective calculator to estimate costs and compare which option
          is less expensive for your situation.
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

      {/* ─── Related Calculators ─── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Related Calculators</h2>
        <p className="text-muted-foreground">
          Explore other loan calculators to compare options and find the right
          fit for your financial situation.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <RelatedCalcLink
            href="/loans/payday-loan-calculator"
            label="Payday Loan Calculator"
          />
          <RelatedCalcLink
            href="/loans/personal-loan-calculator"
            label="Personal Loan Calculator"
          />
          <RelatedCalcLink
            href="/loans/auto-loan-calculator"
            label="Auto Loan Calculator"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Browse all calculators in our{" "}
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

function RelatedCalcLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-ember/40 hover:bg-ember/5"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-ember/10 text-ember">
        <svg
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
          />
        </svg>
      </div>
      <span className="text-sm font-medium group-hover:text-ember transition-colors">
        {label}
      </span>
    </a>
  );
}