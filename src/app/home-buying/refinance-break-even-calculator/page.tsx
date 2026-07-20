import type { Metadata } from "next";
import { siteConfig, VERIFIED_DATE } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import RefinanceBreakEvenCalculator from "@/components/calculators/RefinanceBreakEvenCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/home-buying/refinance-break-even-calculator`;
const pageTitle =
  "Refinance Break-Even Calculator \u2013 Is It Worth It | CalcForge";
const pageDescription =
  "Free refinance break-even calculator. See how many months to recoup closing costs, your monthly savings, and whether refinancing your mortgage is worth it.";

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
    question: "How much does it cost to refinance a mortgage?",
    answer:
      "Typical closing costs range from 2% to 6% of the loan amount, or roughly $6,000 to $18,000 on a $300,000 mortgage. Common fees include an appraisal ($300 to $500), title and escrow services ($1,500 to $3,000), loan origination (0.5% to 1% of the loan), and recording fees ($50 to $500). Many lenders offer lender credits that reduce or eliminate upfront costs in exchange for a slightly higher interest rate. These are estimates and actual costs vary by lender and location as of " +
      VERIFIED_DATE +
      ".",
  },
  {
    question: "Does refinancing reset my loan term?",
    answer:
      "Yes, if you choose a new 30-year term, the amortization clock starts over. You can select a shorter term (15 or 20 years) to match or beat your current payoff schedule. A term reset lowers your monthly payments but can increase total interest paid because you are stretching the remaining balance over more years. The calculator flags this situation so you can weigh the lower payment against the higher lifetime cost.",
  },
  {
    question: "When is refinancing not worth it?",
    answer:
      "Refinancing may not be worthwhile when the break-even period exceeds your planned time in the home, when the new rate is not low enough to offset closing costs, when you extend the term significantly and lose the interest savings, or when your credit score has declined since the original loan. It is also generally not worth it if you plan to move within two to three years or if your closing costs are unusually high relative to the monthly savings you would gain.",
  },
  {
    question: "How do I calculate break-even on a refinance?",
    answer:
      "Divide total closing costs by the monthly savings. For example, $6,000 in closing costs and $185 per month in savings produces a break-even of approximately 32 months ($6,000 / $185 = 32.4). If you plan to stay in the home longer than 33 months, you come out ahead. If you sell or refinance again before that point, you lose money on the deal. This is the core formula the calculator uses.",
  },
  {
    question: "Can I roll closing costs into the refinance loan?",
    answer:
      "Yes, most lenders allow you to finance closing costs by adding them to the new loan balance. This increases your principal, which means a slightly higher monthly payment and more interest over the life of the loan. Because your monthly savings are smaller, the break-even point shifts. The calculator accounts for this when closing costs are entered as a percentage of the loan. Keep in mind that rolling costs in means you are paying interest on those fees for the entire loan term.",
  },
];

/* ─── Page Component ─── */

export default function RefinanceBreakEvenCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: "Home Buying Calculators",
            url: `${siteConfig.url}/home-buying`,
          },
          { name: "Refinance Break-Even Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Refinance Break-Even Calculator"
        description="Free online refinance break-even calculator. See how many months it takes to recoup closing costs, your monthly savings, and whether refinancing your mortgage is worth it."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Home Buying Calculators", href: "/home-buying" },
          { label: "Refinance Break-Even Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Refinance Break-Even Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        The break-even formula is straightforward: divide your total closing costs
        by your monthly savings to find the number of months it takes to recoup
        the cost of refinancing. If you sell or move before reaching that point,
        you lose money on the deal. This calculator computes your exact break-even
        month and shows whether refinancing is worth it based on how long you plan
        to stay. Keep in mind that while refinancing to a lower rate usually
        reduces your monthly payment, choosing a longer new term can increase your
        total interest paid over the life of the loan. All rate and cost figures
        used here are estimates.
      </p>

      {/* Calculator (client component) */}
      <div className="mt-8">
        <RefinanceBreakEvenCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Refinance Break Even Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Refinance Break Even Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The core formula behind every refinance break-even calculator is:
            closing costs divided by monthly savings equals break-even months. If
            your refinancing fees total $6,000 and you save $185 per month, the
            break-even point is roughly 32 months. Every month after that, the
            savings are pure gain.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This number matters because selling or relocating before you reach
            break-even means the refinance cost you money rather than saving it.
            Lenders do not refund closing costs if you move early. The break-even
            calculation gives you a clear threshold: stay past it and you win,
            leave before it and you lose.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $300,000 Balance at 7% Refinanced to 6%
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Current payment (30-year at 7%):</strong> roughly
                $1,996/month.{" "}
                <strong>New payment (30-year at 6%):</strong> roughly $1,799/month.
                Monthly savings: approximately $197. With $6,000 in closing costs,
                break-even is about 30 months ($6,000 / $197 = 30.5). If you plan
                to stay in the home for more than two and a half years, the
                refinance puts you ahead. These are estimates and actual figures
                depend on your specific loan terms.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: Mortgage Refinance Savings Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Mortgage Refinance Savings Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your monthly savings come from the difference between your current
            mortgage payment and the new payment after refinancing. The new
            payment depends on the new interest rate and the new loan term. A
            larger rate drop produces larger savings, but shortening the term can
            reduce or even eliminate the monthly savings despite a lower rate.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The table below shows how different rate drops affect savings on a
            $300,000 balance with a 30-year term and $6,000 in closing costs:
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Rate Drop Comparison: $300,000 Balance, 30-Year Term, $6,000
                Closing Costs
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>7% to 6.5%:</strong> Payment drops from ~$1,996 to
                ~$1,896. Monthly savings: ~$100. Break-even: ~60 months.{" "}
                <strong>7% to 6%:</strong> Payment drops from ~$1,996 to
                ~$1,799. Monthly savings: ~$197. Break-even: ~30 months.{" "}
                <strong>7% to 5.5%:</strong> Payment drops from ~$1,996 to
                ~$1,703. Monthly savings: ~$293. Break-even: ~20 months. A full
                1.5 percentage point drop cuts the break-even period to under two
                years, making refinancing worthwhile even for homeowners who might
                move in the near future. All figures are estimates as of{" "}
                {VERIFIED_DATE}.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: Is It Worth Refinancing Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Is It Worth Refinancing Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The decision comes down to comparing your break-even months against
            your planned stay in the home. If you intend to stay for ten or more
            years, even a modest rate drop of 0.25% can be worth it because you
            have decades to recoup the costs and accumulate savings. The longer
            you stay past break-even, the more you benefit.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you plan to move within two to three years, you need substantial
            monthly savings to justify the closing costs. A break-even of 24
            months or less is generally considered a safe threshold for a short
            timeline. Anything beyond 36 months becomes risky if your plans are
            uncertain.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            One common pitfall is the term-reset warning. If you are ten years
            into a 30-year mortgage and refinance into a new 30-year loan, your
            monthly payment drops but you have added ten more years of interest
            payments. Extending from 20 remaining years back to 30 can increase
            total interest despite the lower rate. The calculator flags this when
            it detects a term extension, so you can decide whether the lower
            monthly payment justifies the higher lifetime cost.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Refinance Break Even Point Calculator with Closing Costs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Refinance Break Even Point Calculator with Closing Costs
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Closing costs are the single largest factor in determining your
            break-even point. They typically include an appraisal fee ($300 to
            $500), title and escrow services ($1,500 to $3,000), loan origination
            (0.5% to 1% of the loan amount), and recording fees ($50 to $500).
            Together, these costs usually total 2% to 6% of the loan balance, or
            $6,000 to $18,000 on a $300,000 mortgage.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            You can minimize these costs by shopping multiple lenders, negotiating
            fees, and asking about lender credits. Lender credits reduce or
            eliminate your upfront costs in exchange for a slightly higher
            interest rate, which can make sense if you plan to move before the
            higher rate erodes your savings.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Rolling closing costs into the new loan means you pay no money at
            closing, but it increases your loan balance. A higher balance means a
            higher monthly payment, which reduces your monthly savings and pushes
            the break-even point further out. Paying costs upfront shortens
            break-even, while financing them extends it. The calculator lets you
            compare both approaches.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Typical Closing Cost Breakdown on a $300,000 Refinance
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Appraisal fee:</strong> $300 to $500.{" "}
                <strong>Title and escrow:</strong> $1,500 to $3,000.{" "}
                <strong>Origination fee (0.5%-1%):</strong> $1,500 to $3,000.{" "}
                <strong>Recording fee:</strong> $50 to $500.{" "}
                <strong>Other costs (credit report, underwriting, survey):</strong>{" "}
                $500 to $2,000.{" "}
                <strong>Total typical range:</strong> $3,850 to $9,000, with
                higher-cost markets reaching 4-6% of the loan. These are
                estimates as of {VERIFIED_DATE} and vary by lender and location.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: Cash Out Refinance Break Even Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Cash Out Refinance Break Even Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A cash-out refinance lets you borrow against your home equity by
            taking a new loan that is larger than your current balance. The
            difference is paid to you in cash. For example, if you owe $200,000
            on a home worth $400,000, you might refinance into a $280,000 loan
            and receive $80,000 in cash after closing costs.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This larger loan balance affects the break-even calculation in two
            ways. First, closing costs are higher because they are based on a
            bigger loan amount. Second, your new monthly payment may be closer to
            (or even higher than) your old payment, depending on how much cash
            you take out and what the new rate is. When monthly savings are small
            or negative, the break-even point extends dramatically or never
            arrives.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Cash-out refinancing can make sense when the proceeds fund home
            improvements that increase property value or when they consolidate
            higher-interest debt into a lower mortgage rate. It is generally not
            advisable to use home equity for consumption, such as vacations or
            luxury purchases, because you are converting unsecured spending into
            debt secured by your home. The calculator helps you see the real cost
            by showing how the cash-out amount shifts your break-even month and
            total interest.
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
              href="/home-buying"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Home Buying Calculators
            </a>{" "}
            hub. If your refinanced loan requires private mortgage insurance, use
            our{" "}
            <a
              href="/home-buying/pmi-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              PMI Calculator
            </a>{" "}
            to estimate that cost. For homeowners considering a cash-out refinance
            to pay off high-interest debt, the{" "}
            <a
              href="/loans/debt-consolidation-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Consolidation Calculator
            </a>{" "}
            compares strategies. You can also check your qualification odds with
            the{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            or compare borrowing options with the{" "}
            <a
              href="/loans/personal-loan-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Personal Loan Calculator
            </a>
            .
          </p>
        </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
      </div>
    </div>
  );
}
