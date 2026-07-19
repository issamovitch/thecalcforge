import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import HomeAffordabilityCalculator from "@/components/calculators/HomeAffordabilityCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/home-buying/home-affordability-calculator`;
const pageTitle =
  "Home Affordability Calculator \u2013 How Much House | CalcForge";
const pageDescription =
  "Free home affordability calculator. See how much house you can afford based on income, debts, down payment, and rate, using the 28/36 lender rule.";

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
    question: "What is the 28/36 rule for home affordability?",
    answer:
      "The 28/36 rule is a guideline many conventional lenders use to assess how much house you can afford. The front-end ratio (28%) says your total housing payment, including principal, interest, property taxes, and insurance (PITI), should not exceed 28% of your gross monthly income. The back-end ratio (36%) says your total monthly debt payments, including the new housing payment plus all existing debts like car loans, student loans, and credit card minimums, should not exceed 36% of gross monthly income. These are thresholds, not guarantees. Some lenders accept higher ratios with compensating factors like strong credit or large savings.",
  },
  {
    question: "Does FHA use different DTI limits than conventional loans?",
    answer:
      "Yes. FHA loans typically allow a front-end DTI up to 31% and a back-end DTI up to 43%. In some cases, FHA lenders may approve back-end ratios above 43% with strong compensating factors such as a credit score above 580, cash reserves, or a low loan-to-value ratio. The higher limits mean FHA borrowers can often qualify for a larger loan amount than they could with conventional guidelines. However, FHA loans require mortgage insurance premiums (1.75% upfront plus annual MIP of 0.15% to 0.75%) and a minimum 3.5% down payment for borrowers with credit scores of 580 or above.",
  },
  {
    question: "What is PITI and why does it matter for affordability?",
    answer:
      "PITI stands for Principal, Interest, Taxes, and Insurance. It represents the total monthly housing cost that lenders evaluate. Principal and interest are the loan payment itself, calculated from the loan amount, interest rate, and term. Property taxes vary by location and typically run 0.5% to 2.5% of the home value per year. Homeowner's insurance typically costs $80 to $200 per month depending on location, coverage, and deductible. If the down payment is below 20%, private mortgage insurance (PMI) is added on top of PITI. Lenders use the full PITI figure when applying the front-end DTI ratio.",
  },
  {
    question: "How does my existing debt affect how much house I can afford?",
    answer:
      "Existing monthly debt payments reduce the amount of income available for housing under the back-end DTI cap. For example, with $100,000 annual gross income ($8,333/month), the 36% back-end cap allows $3,000 in total debt. If you already pay $1,200/month in car loans, student loans, and credit card minimums, the maximum housing payment drops to $1,800/month. Reducing or paying off existing debts before applying for a mortgage can meaningfully increase the home price you qualify for. A borrower with $500 in monthly debts can afford roughly $70,000 to $90,000 more in home price than a borrower with $1,500 in monthly debts at the same income level.",
  },
  {
    question: "Can I afford more house with a larger down payment?",
    answer:
      "Yes, but the impact is smaller than most people expect. A larger down payment reduces the loan amount, which reduces the monthly principal and interest portion. However, the 28/36 DTI rule constrains affordability based on your income, not your cash. If you are already front-end limited (housing payment at 28% of income), a larger down payment will not increase the maximum price much because the payment cap stays the same. Where a larger down payment helps significantly is when it brings your LTV to 80% or below, eliminating PMI, or when it allows you to qualify for a lower interest rate, both of which improve the payment-to-price ratio.",
  },
];

/* ─── Page Component ─── */

export default function HomeAffordabilityCalculatorPage() {
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
          { name: "Home Affordability Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Home Affordability Calculator"
        description="Free online home affordability calculator. See how much house you can afford based on income, debts, down payment, and interest rate using the 28/36 lender rule."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Home Buying Calculators", href: "/home-buying" },
          { label: "Home Affordability Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Home Affordability Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A home affordability calculator estimates the maximum home price you can
        qualify for based on your income, existing debts, down payment savings,
        and the mortgage interest rate. Lenders use two debt-to-income (DTI)
        ratios to set this limit: the front-end ratio caps your total housing
        payment at 28% of gross monthly income, and the back-end ratio caps all
        debt payments (housing plus existing obligations) at 36%. FHA loans use
        higher limits of 31% and 43% respectively. This calculator applies those
        rules and back-solves the home price from the resulting maximum monthly
        payment.
      </p>

      {/* Calculator (client component) */}
      <div className="mt-8">
        <HomeAffordabilityCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: How Much House Can I Afford on 100k Salary */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much House Can I Afford on 100k Salary
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            With a $100,000 annual salary, your gross monthly income is $8,333.
            Under the conventional 28/36 rule, the maximum housing payment is
            28% of that, or $2,333 per month. If you have $500 in existing
            monthly debts, the back-end cap allows $3,000 total debt, leaving
            $2,500 for housing. The lower of the two ($2,333) is the binding
            limit. After subtracting estimated property tax and insurance of
            roughly $400 per month, $1,933 remains for principal and interest.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                $100,000 Salary Affordability (30-Year Fixed, 6.5%, $40K Down,
                $500/mo Debts)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Front-end cap:</strong> $2,333/mo PITI (28% of $8,333).
                <strong> Back-end cap:</strong> $2,500/mo (36% minus $500 debts).
                <strong> Limiting factor:</strong> front-end.{" "}
                <strong>Max P&I:</strong> $1,933/mo.{" "}
                <strong>Max loan:</strong> approximately $305,600.{" "}
                <strong>Max home price:</strong> approximately $345,600 (loan +
                $40,000 down). These figures assume 6.5% interest, 30-year term,
                and $400/mo in taxes and insurance.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            Switching to FHA guidelines (31/43) at the same income raises the
            front-end cap to $2,583 and the back-end cap to $3,083, allowing a
            higher maximum payment and therefore a higher home price. The tradeoff
            is FHA mortgage insurance, which adds to the monthly cost. Use the
            calculator above with the FHA mode toggle to compare the two
            scenarios side by side.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Home Affordability Calculator with Debt */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Home Affordability Calculator with Debt
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Existing debt is often the single largest factor that reduces how
            much house you can afford. Lenders count all recurring monthly
            obligations: auto loan payments, student loan payments, credit card
            minimums, personal loan payments, and court-ordered payments like
            alimony or child support. They do not count utilities, groceries,
            subscriptions, or the new housing payment itself (since that is what
            you are solving for).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            At $100,000 annual income with 6.5% interest, 30-year term, $40,000
            down, and $400/mo taxes and insurance, here is how different debt
            levels change the maximum home price:
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Impact of Monthly Debts on Affordability ($100K Income, 28/36
                Conventional)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>$0 debts:</strong> Back-end cap $3,000/mo, not binding.
                Front-end $2,333/mo limits. Max price: ~$345,600.{" "}
                <strong>$500 debts:</strong> Back-end $2,500/mo, front-end $2,333/mo.
                Front-end limits. Max price: ~$345,600.{" "}
                <strong>$1,000 debts:</strong> Back-end $2,000/mo, now lower than
                front-end. Back-end limits. Max price: ~$282,200.{" "}
                <strong>$1,500 debts:</strong> Back-end $1,500/mo, well below
                front-end. Max price: ~$180,800.{" "}
                <strong>$2,000 debts:</strong> Back-end $1,000/mo. Only $600 left
                for P&I after taxes/insurance. Max price: ~$63,400. The drop from
                $0 to $2,000 in monthly debts reduces buying power by over
                $280,000 at this income level.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            Paying down existing debts before applying for a mortgage is one of
            the most effective ways to increase your purchasing power. For a more
            detailed DTI analysis with front-end and back-end breakdowns against
            FHA, VA, and conventional thresholds, use the{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>
            .
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much House Can I Afford FHA Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much House Can I Afford FHA Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            FHA loans are insured by the Federal Housing Administration and are
            designed for borrowers who may not qualify for conventional financing.
            FHA uses a 31/43 DTI framework: the housing payment (PITI plus
            mortgage insurance) can reach 31% of gross monthly income, and total
            debt can reach 43%. With compensating factors such as a credit score
            above 620, cash reserves, or residual income above FHA thresholds,
            some lenders may approve DTI ratios as high as 50%.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Using the same $100,000 salary, $500 monthly debts, 6.5% rate, 30-year
            term, $40,000 down, and $400/mo taxes and insurance: the conventional
            28/36 rule limits housing to $2,333/mo, producing a max price around
            $345,600. Switching to FHA 31/43 rules: the front-end cap rises to
            $2,583/mo and the back-end cap rises to $3,083/mo. The front-end
            remains the binding limit at $2,583. After subtracting $400 in taxes
            and insurance, $2,183 is available for P&I and mortgage insurance.
            Factoring in FHA MIP (roughly $177/mo at 0.55% annual on a $340K
            loan), the net P&I is about $2,006, supporting a max loan around
            $317,000 and a max home price around $357,000.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The FHA advantage is more pronounced for borrowers with moderate
            credit scores (580 to 680) who face higher conventional PMI rates,
            or those with higher existing debts that push them close to the 36%
            back-end cap on conventional loans. The FHA minimum down payment is
            3.5% for borrowers with credit scores of 580 or above, which is
            lower than most conventional programs. Use the{" "}
            <a
              href="/home-buying/down-payment-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Down Payment Calculator
            </a>{" "}
            to plan the cash needed for the FHA minimum.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: House Affordability Calculator by Monthly Payment */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            House Affordability Calculator by Monthly Payment
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            If you already know the monthly payment you are comfortable with, you
            can work backward to find the home price that payment supports. The
            calculator above offers a &quot;By Monthly Payment&quot; mode for this
            purpose. Enter your target PITI payment, and the tool subtracts
            estimated taxes and insurance, then uses the present value of an
            annuity formula to determine the maximum loan amount at your chosen
            rate and term.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                What Home Price Does $2,000/mo Buy? (6.5%, 30-Year, $40K Down,
                $400/mo T&I)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Available for P&I:</strong> $2,000 minus $400 taxes and
                insurance = $1,600. <strong>Max loan:</strong> approximately
                $253,200. <strong>Max home price:</strong> approximately $293,200
                ($253,200 loan + $40,000 down). Your front-end DTI would be 24%
                on a $100,000 salary, and back-end DTI would be 30% with $500 in
                other debts. Both are well within conventional limits.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            This reverse approach is useful when you have a firm monthly budget
            and want to know what price range to shop in. Keep in mind that the
            actual mortgage payment is only one part of housing costs. Budget
            for maintenance (rule of thumb: 1% of home value per year), HOA fees
            if applicable, and any special assessments. The payment-based mode
            in the calculator also shows the resulting DTI ratios so you can
            confirm the payment fits within lender guidelines.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much House Can I Afford with 80k Salary */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much House Can I Afford with 80k Salary
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An $80,000 annual salary translates to $6,667 in gross monthly income.
            Under the conventional 28/36 rule, the maximum housing payment is
            28% of that, or $1,867 per month. With $500 in existing debts, the
            back-end cap allows $2,400 in total debt, leaving $1,900 for housing.
            The front-end limit of $1,867 is the binding constraint in this
            scenario.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                $80,000 Salary Affordability (30-Year Fixed, 6.5%, $30K Down,
                $350/mo Debts, $350/mo T&I)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Front-end cap:</strong> $1,867/mo.{" "}
                <strong>Back-end cap:</strong> $2,050/mo (36% minus $350).{" "}
                <strong>Limiting factor:</strong> front-end.{" "}
                <strong>Max P&I:</strong> $1,517/mo.{" "}
                <strong>Max loan:</strong> approximately $239,800.{" "}
                <strong>Max home price:</strong> approximately $269,800. With
                FHA 31/43 rules, the front-end cap rises to $2,067, supporting a
                max home price around $306,500. The FHA premium adds roughly
                $150/mo in MIP, partially offsetting the higher DTI allowance.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            At $80,000 income, reducing existing debts has an outsized impact
            because the back-end cap is lower in absolute dollars. Dropping from
            $500 to $0 in monthly debts frees $500 of capacity but may not
            change the result if the front-end cap remains the binding limit. The
            most effective levers at this income level are increasing the down
            payment (which reduces the loan amount and thus the P&I portion of
            PITI), shopping for a lower interest rate, or considering a less
            expensive market where property taxes are lower.
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
                className="group rounded-lg border bg-white dark:bg-card"
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
            hub. Once you know your max home price, use the{" "}
            <a
              href="/home-buying/down-payment-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Down Payment Calculator
            </a>{" "}
            to see how different down payment percentages affect your loan amount
            and PMI status. If your down payment is below 20%, the{" "}
            <a
              href="/home-buying/pmi-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              PMI Calculator
            </a>{" "}
            estimates the monthly insurance cost. For a detailed DTI analysis
            with visual thresholds, use the{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>
            . If you already own a home and want to tap equity, the{" "}
            <a
              href="/home-buying/heloc-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              HELOC Calculator
            </a>{" "}
            shows your available credit line, and the{" "}
            <a
              href="/home-buying/refinance-break-even-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Refinance Break-Even Calculator
            </a>{" "}
            evaluates whether refinancing your current mortgage saves money.
          </p>
        </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}