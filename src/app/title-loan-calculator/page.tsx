import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site.config";
import { TitleLoanCalculator } from "@/components/calculators/TitleLoanCalculator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-static";

/* ─── SEO Metadata ─── */
export const metadata: Metadata = {
  title: "Title Loan Calculator",
  description:
    "Estimate your title loan monthly payment, total interest, and payoff cost. Free calculator with amortization — enter your vehicle value and loan terms.",
  alternates: {
    canonical: `${siteConfig.url}/title-loan-calculator`,
  },
  openGraph: {
    title: "Title Loan Calculator | CalcForge",
    description:
      "Estimate your title loan monthly payment, total interest, and payoff cost. Free calculator with amortization schedule.",
    url: `${siteConfig.url}/title-loan-calculator`,
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
    card: "summary_large_image" as const,
    title: "Title Loan Calculator",
    description:
      "Estimate your title loan monthly payment, total interest, and payoff cost.",
    images: [siteConfig.ogImage],
  },
};

/* ─── FAQ data ─── */
const faqs = [
  {
    question: "How much does a title loan cost in Florida?",
    answer:
      "Under the Florida Title Loan Act, licensed lenders may charge up to 25% per month on loans up to $2,000 (a 300% APR) and up to 18% per month (216% APR) on loans between $2,000 and $5,000. On a $2,000 loan at the maximum rate, the monthly charge is $500. Florida also requires pro-rata interest refunds if you pay off the loan early. Always compare offers from multiple licensed lenders before signing.",
  },
  {
    question: "How are title loan monthly payments calculated?",
    answer:
      "Most title lenders use a simple monthly fee rather than a declining-balance amortization. For example, a 25% monthly fee on a $1,000 loan means you owe $250 in interest each month regardless of how much principal you've repaid. Our calculator above uses standard amortization, which is more common for installment-style title loans. Ask your lender which method they use — the difference in total cost can be significant.",
  },
  {
    question: "Can I pay off my title loan early to save on interest?",
    answer:
      "It depends on your state and your loan agreement. States like Florida mandate that lenders refund a pro-rata portion of interest when you prepay. In many other states, however, lenders charge the full agreed-upon interest regardless of early repayment. Check your contract for a prepayment penalty clause or a \"precomputed interest\" disclosure. If early payoff is allowed without penalty, even small extra payments each month can meaningfully reduce your total cost.",
  },
  {
    question: "How much money can I get with a title loan?",
    answer:
      "Lenders typically offer 25% to 50% of your vehicle's wholesale market value. For a car worth $10,000, that translates to a loan range of $2,500 to $5,000. The exact amount depends on the vehicle's age, mileage, condition, and your ability to repay. Some lenders cap loans at statutory maximums — Florida, for instance, limits title loans to $2,000 for the lowest tier. Use the value table in the section below to estimate your borrowing range.",
  },
  {
    question: "What are the title loan rates in Texas?",
    answer:
      "Texas does not impose a cap on title loan interest rates. APRs of 200% to 500% are common. On a $4,000 loan at 300% APR over 12 months, the monthly payment would be approximately $1,074, and total interest would reach nearly $8,900 — more than double the borrowed amount. Texas also permits lenders to charge additional lien and processing fees. Because of these high costs, borrowers in Texas should consider credit union loans, employer advances, or local assistance programs as alternatives.",
  },
];

/* ─── Page ─── */
export default function TitleLoanCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Loans", url: `${siteConfig.url}/loans` },
          {
            name: "Title Loan Calculator",
            url: `${siteConfig.url}/title-loan-calculator`,
          },
        ]}
      />
      <WebApplicationJsonLd
        name="Title Loan Calculator"
        description="Free online title loan calculator. Estimate monthly payments, total interest, and full payoff cost for vehicle title loans."
        url={`${siteConfig.url}/title-loan-calculator`}
      />
      <FaqJsonLd faqs={faqs} />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Loans", href: "/loans" },
          { label: "Title Loan Calculator" },
        ]}
        className="mb-8"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Title Loan Calculator
      </h1>

      {/* Intro — featured snippet target (~100 words) */}
      <p className="mt-6 text-muted-foreground leading-relaxed max-w-3xl">
        A title loan calculator estimates your monthly payment, total interest,
        and full repayment cost when borrowing against your vehicle. Title loans
        use your car, truck, or motorcycle as collateral, with loan amounts
        typically ranging from 25% to 50% of the vehicle&apos;s market value.
        Because annual percentage rates (APRs) on title loans often exceed
        100%—and can reach 300% in some states—understanding the exact cost
        before you sign is essential. Enter your vehicle value, desired loan
        amount, interest rate, and repayment term above to see a detailed
        breakdown including a complete amortization schedule.
      </p>

      {/* Calculator */}
      <div className="my-8">
        <TitleLoanCalculator />
      </div>

      {/* ─── Formula section ─── */}
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          How the Calculation Works
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Title loans that use installment repayment follow the standard
          amortization formula. Your monthly payment is calculated as:
        </p>
        <div className="rounded-lg border bg-muted/30 p-5 font-mono text-sm text-foreground text-center">
          M = P &times; [r(1 + r)<sup>n</sup>] / [(1 + r)<sup>n</sup> &minus;
          1]
        </div>
        <ul className="list-none space-y-1 text-sm text-muted-foreground pl-4">
          <li>
            <strong className="text-foreground">P</strong> = loan principal
            (the amount borrowed)
          </li>
          <li>
            <strong className="text-foreground">r</strong> = monthly interest
            rate (APR &divide; 12 &divide; 100)
          </li>
          <li>
            <strong className="text-foreground">n</strong> = total number of
            monthly payments
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Worked example:</strong> A $3,000
          loan at 150% APR repaid over 12 months.
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-sm text-muted-foreground">
          <li>
            Monthly rate: 150 &divide; 12 &divide; 100 = 0.125 (12.5% per
            month)
          </li>
          <li>
            Monthly payment: $3,000 &times; [0.125 &times; (1.125)<sup>12</sup>]
            / [(1.125)<sup>12</sup> &minus; 1] =&nbsp;{" "}
            <strong className="text-foreground">$495.68</strong>
          </li>
          <li>
            Total repaid: $495.68 &times; 12 =&nbsp;{" "}
            <strong className="text-foreground">$5,948.16</strong>
          </li>
          <li>
            Total interest: $5,948.16 &minus; $3,000 =&nbsp;{" "}
            <strong className="text-foreground">$2,948.16</strong>
          </li>
        </ol>
        <p className="text-muted-foreground leading-relaxed">
          Interest charges in this scenario represent 98% of the original
          principal — which illustrates why comparing offers from multiple
          lenders and understanding the full cost before signing is so
          important.
        </p>
      </section>

      {/* ─── H2: Title Loan Calculator Florida ─── */}
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Title Loan Calculator Florida
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Florida regulates title lending under the Florida Title Loan Act
          (Chapter 537, Florida Statutes). Licensed lenders may charge a
          maximum monthly fee of 25% on loans up to $2,000, equating to a 300%
          APR. For loans between $2,000 and $5,000, the cap drops to 18% per
          month (216% APR). Florida also requires a written agreement
          disclosing all fees, the total of payments, and the APR before
          signing. Borrowers have the right to prepay at any time without
          penalty and must receive a pro-rata refund of interest charges. To
          model a Florida loan, set the calculator APR to 300% for loans under
          $2,000, or 216% for larger amounts.
        </p>
      </section>

      {/* ─── H2: Car Title Loan Calculator with Payments ─── */}
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Car Title Loan Calculator with Payments
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Your monthly payment on a car title loan depends on three variables:
          the amount borrowed, the interest rate, and the repayment term. Most
          title lenders quote a monthly percentage rather than an annual
          rate — a &ldquo;25% per month&rdquo; offer translates to 300% APR.
          Shorter terms produce higher monthly payments but lower total
          interest, while extending the term does the opposite. For instance,
          a $2,000 loan at 150% APR costs $493.44/month over 6 months ($960.64
          in interest) versus $330.45/month over 12 months ($1,965.40 in
          interest) — an extra $1,004.76 in total interest for the longer
          timeline. Use the amortization schedule above to see exactly how
          each payment splits between principal and interest.
        </p>
      </section>

      {/* ─── H2: Title Loan Payoff Calculator ─── */}
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Title Loan Payoff Calculator
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Understanding the full payoff amount on a title loan means looking
          beyond the monthly payment. A $3,000 loan at 150% APR over 12
          months carries a monthly payment of $495.68, but the total repayment
          is $5,948.16 — with $2,948.16 going to interest alone. Adding even a
          modest extra payment each month can make a material difference. Enter
          a value in the &ldquo;Extra Monthly Payment&rdquo; field above to
          see how additional principal payments shorten your term and reduce
          total interest. The collapsible amortization table shows the exact
          month-by-month breakdown, including the declining interest portion
          as your balance decreases.
        </p>
      </section>

      {/* ─── H2: How Much Can You Get for a Title Loan ─── */}
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          How Much Can You Get for a Title Loan
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The amount a title lender will offer depends primarily on your
          vehicle&apos;s wholesale value — not its retail listing price. Most
          lenders extend 25% to 50% of that value. The table below shows
          typical borrowing ranges at common car values.
        </p>

        <div className="rounded-lg border overflow-hidden my-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-sm font-semibold">
                  Vehicle Value
                </TableHead>
                <TableHead className="text-sm font-semibold text-right">
                  25% LTV
                </TableHead>
                <TableHead className="text-sm font-semibold text-right">
                  50% LTV
                </TableHead>
                <TableHead className="text-sm font-semibold text-right">
                  Typical Range
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                [2500, 625, 1250],
                [5000, 1250, 2500],
                [10000, 2500, 5000],
              ].map(([value, low, high]) => (
                <TableRow key={value}>
                  <TableCell className="font-medium">
                    ${value.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    ${low.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    ${high.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    ${low.toLocaleString()} – ${high.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Lenders also factor in your vehicle&apos;s age, mileage, condition,
          and your repayment ability. Older cars with high mileage typically
          qualify for the lower end of the range. Keep in mind that some states
          impose maximum loan caps — Florida limits the lowest tier to $2,000,
          for example — which may restrict borrowing regardless of your
          vehicle&apos;s value.
        </p>
      </section>

      {/* ─── H2: Title Loan Monthly Payment Calculator Texas ─── */}
      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Title Loan Monthly Payment Calculator Texas
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Texas does not cap title loan interest rates, making it one of the
          most expensive states for this type of borrowing. Typical APRs range
          from 200% to over 500%. A $4,000 loan in Texas at 300% APR over 12
          months would carry a monthly payment of approximately $1,074.05, with
          total interest of $8,888.60 — more than double the original loan
          amount. Texas also allows lenders to charge additional lien fees and
          processing fees on top of the interest. Borrowers in Texas should
          explore credit union personal loans (which often start near 10% APR),
          employer paycheck advances, or local emergency-assistance programs
          before committing to a title loan.
        </p>
      </section>

      {/* ─── FAQ ─── */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* ─── Internal links ─── */}
      <section className="mt-16 rounded-lg border bg-muted/20 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Related Loan Calculators
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Auto Loan Calculator",
              href: "/auto-loan-calculator",
              desc: "Estimate car payments with trade-in, taxes, and extra payments.",
            },
            {
              label: "Personal Loan Calculator",
              href: "/personal-loan-calculator",
              desc: "Calculate personal loan payments by credit score and term.",
            },
            {
              label: "Payday Loan Calculator",
              href: "/payday-loan-calculator",
              desc: "See the true APR and cost of a payday loan or cash advance.",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-ember/40 hover:bg-muted/50"
            >
              <span className="text-sm font-medium text-foreground group-hover:text-ember transition-colors">
                {link.label}
              </span>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {link.desc}
              </p>
            </Link>
          ))}
        </div>
        <Link
          href="/loans"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ember hover:text-ember-hover transition-colors mt-2"
        >
          View all loan calculators
          <ArrowRight className="size-3.5" />
        </Link>
      </section>
    </div>
  );
}