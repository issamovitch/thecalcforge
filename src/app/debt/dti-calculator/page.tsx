import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import DTICalculator from "@/components/calculators/DTICalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/debt/dti-calculator`;
const pageTitle = "DTI Calculator – Debt-to-Income Ratio | CalcForge";
const pageDescription =
  "Free debt-to-income (DTI) calculator. Enter your income and debts to get your front-end and back-end ratio and see if you meet lender thresholds.";

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
    question: "What is a good debt-to-income ratio?",
    answer:
      "Most lenders consider a back-end DTI of 36% or lower ideal. Conventional loans typically cap at 45%, FHA at 43% to 50%, and VA at around 41%. A DTI below 28% is considered excellent and gives you the most options.",
  },
  {
    question: "Does DTI include utilities and groceries?",
    answer:
      "No. DTI only includes recurring debt obligations reported on your credit report: mortgage or rent, auto loans, student loans, credit card minimum payments, personal loans, child support, and alimony. Utilities, groceries, insurance premiums (unless included in mortgage), and other living expenses are not part of the DTI calculation.",
  },
  {
    question: "Can I get a mortgage with a 50% DTI?",
    answer:
      "It is difficult but possible with certain loan programs. FHA loans may allow up to 50% DTI with strong compensating factors like significant cash reserves, a high credit score, or a low loan-to-value ratio. Conventional lenders rarely approve above 45% without exceptional circumstances. VA loans technically have no DTI cap but use residual income requirements instead.",
  },
  {
    question: "How do I lower my DTI quickly?",
    answer:
      "The fastest way is to increase your gross monthly income (raise, second job, side income) or reduce your monthly debt payments. Paying off a credit card balance eliminates that minimum payment from the DTI calculation. Refinancing a high-rate loan to a lower monthly payment also helps. Do not close credit cards with zero balance, as this can lower your credit score.",
  },
  {
    question: "What is the difference between front-end and back-end DTI?",
    answer:
      "Front-end DTI (also called housing ratio) includes only your housing costs: mortgage principal and interest, property taxes, homeowners insurance, and HOA fees. Back-end DTI includes all monthly debt obligations plus housing. Most lenders evaluate both, but the back-end ratio carries more weight in the approval decision because it reflects your total debt burden.",
  },
];

/* ─── Page Component ─── */

export default function DTICalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Debt Calculators", url: `${siteConfig.url}/debt` },
          { name: "DTI Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="DTI Calculator"
        description="Free online debt-to-income ratio calculator. Calculate front-end and back-end DTI, compare against FHA, VA, and conventional lender thresholds, and see how much house you can afford."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Debt Calculators", href: "/debt" },
          { label: "DTI Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        DTI Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A DTI calculator measures your debt-to-income ratio, which is the
        percentage of your gross monthly income that goes toward recurring debt
        payments. The formula is straightforward: total monthly debt payments
        divided by gross monthly income, multiplied by 100. Lenders split this
        into a front-end ratio (housing costs only) and a back-end ratio (all
        debts combined). Mortgage lenders, auto lenders, and credit card
        companies all use DTI to evaluate whether you can comfortably take on
        new debt without overextending your finances.
      </p>

      {/* Calculator (client component, SSR with default values, no Suspense) */}
      <div className="mt-8">
        <DTICalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: How to Calculate Your Debt-to-Income Ratio */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How to Calculate Your Debt-to-Income Ratio
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The debt-to-income ratio formula is simple: take your total monthly
            debt payments, divide by your gross monthly income (your pay before
            taxes and deductions), then multiply by 100 to get a percentage.
            Lenders use gross income, not take-home pay, because it provides a
            consistent, pre-tax baseline that applies the same way regardless
            of your tax bracket or withholdings.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">DTI Formula</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DTI = (Total Monthly Debt Payments / Gross Monthly Income) x
                100
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            For example, if you earn $6,000 per month before taxes and your
            monthly debts include a $1,500 mortgage, a $350 car loan, a $200
            student loan payment, and $100 in credit card minimums, your total
            debt is $2,150. Dividing $2,150 by $6,000 gives 0.358, or a 35.8%
            back-end DTI. That falls within the acceptable range for most
            conventional lenders and well within FHA guidelines.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The key distinction is that gross income includes your salary,
            bonuses, commissions, and any other regular income before
            deductions. Do not use your net paycheck amount, as this will
            artificially inflate your DTI and misrepresent your true borrowing
            capacity.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Front-End vs Back-End DTI Ratio */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Front-End vs Back-End DTI Ratio
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Lenders evaluate two separate DTI figures, and understanding the
            difference matters when you apply for a mortgage or refinance.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Front-end DTI</strong> (also called the housing ratio or
            housing expense ratio) includes only your housing-related costs:
            mortgage principal and interest, property taxes, homeowners
            insurance, and HOA dues if applicable. Renters use their monthly
            rent payment instead. Conventional lenders generally prefer a
            front-end ratio at or below 28%.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Back-end DTI</strong> includes all recurring monthly debt
            obligations: housing costs plus auto loans, student loans, credit
            card minimum payments, personal loans, child support, and alimony.
            This is the number most lenders focus on because it reflects your
            total monthly debt burden relative to your income.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Conventional lenders typically review both ratios, while FHA and VA
            programs place more emphasis on the back-end figure. A borrower
            might have a 25% front-end ratio (well within limits) but a 44%
            back-end ratio (approaching the conventional cap) if they carry
            significant non-housing debt.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: DTI Calculator for FHA Loan */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            DTI Calculator for FHA Loan
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            FHA loans are insured by the Federal Housing Administration and are
            popular among first-time homebuyers because they allow lower credit
            scores and smaller down payments than conventional financing. When
            it comes to DTI, FHA guidelines allow a back-end ratio of up to 43%
            for loans processed through automated underwriting systems
            (Desktop Underwriter or Loan Product Advisor).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            In some cases, FHA will approve a back-end DTI as high as 50%, but
            only when the borrower has strong compensating factors. These are
            financial strengths that offset the higher risk of a tight debt
            burden. Common compensating factors include significant cash
            reserves (enough to cover several months of housing payments), a
            low loan-to-value ratio (meaning a larger down payment), a credit
            score well above the minimum, or a history of increasing income.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                FHA DTI Worked Example
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monthly gross income: $5,000. Total monthly debts (including
                proposed housing): $1,800. Back-end DTI = $1,800 / $5,000 x
                100 = 36%. This is well below the 43% FHA threshold, so the
                borrower qualifies without needing compensating factors. If
                debts rose to $2,400, the DTI would hit 48%, which would
                require documented compensating factors for approval.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            If you are planning an FHA purchase, use the calculator above to
            see where your current DTI stands. If you are close to the limit,
            paying down even one credit card or choosing a less expensive home
            can bring the ratio into a comfortable range.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: VA Loan DTI Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            VA Loan DTI Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            VA loans, available to eligible veterans, active-duty service
            members, and certain surviving spouses, do not require a down
            payment and do not carry private mortgage insurance. Because the
            loan carries zero down payment, the VA places extra emphasis on
            DTI to ensure the borrower can handle the full loan amount.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The VA guideline sets a preferred back-end DTI ceiling of 41%.
            However, unlike FHA or conventional programs, the VA does not have
            a hard maximum DTI. If your ratio exceeds 41%, the lender looks at
            residual income, which is the money left over each month after all
            major expenses are paid: housing costs, taxes, debts, utilities,
            and a maintenance allowance.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The VA publishes residual income tables based on family size,
            loan amount, and region of the country. If your residual income
            meets or exceeds the VA threshold, a DTI above 41% can still be
            approved. For example, a veteran in the Midwest with a family of
            four and a $200,000 loan might need at least $1,003 in residual
            income per month. Strong residual income effectively replaces the
            DTI cap as the primary qualification metric.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Because the VA does not require a down payment, keeping your DTI
            and overall debt load manageable is especially important. The
            calculator above can help you determine whether your current income
            and debts position you well for VA loan approval.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Debt to Income Calculator for Car Loan */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Debt to Income Calculator for Car Loan
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Auto lenders evaluate your DTI to decide whether you can afford a
            new car payment on top of your existing obligations. Most
            conventional auto lenders prefer a total back-end DTI below 36%,
            though some will approve up to 43% for borrowers with strong credit
            profiles. Subprime lenders may tolerate higher ratios but charge
            significantly higher interest rates.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Adding a car payment changes your DTI immediately. For example, if
            you earn $4,500 per month and currently have $1,200 in monthly
            debts, your DTI is 26.7%. A new car payment of $450 per month
            would raise your total debts to $1,650, pushing your DTI to 36.7%.
            That crosses the preferred 36% threshold, which could limit your
            lender options or result in a higher interest rate.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Car Loan DTI Example
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Income: $4,500/mo. Existing debts: $1,200/mo (rent, student
                loan, credit card minimums). Current DTI = 26.7%. Adding a
                $450/mo car payment brings total debts to $1,650 and DTI to
                36.7%. To stay at 36%, the maximum car payment would be
                $420/mo ($4,500 x 0.36 - $1,200).
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            Before visiting a dealership, run your numbers through the
            calculator above to find your current DTI. This tells you the
            maximum monthly car payment you can take on without exceeding
            common lender thresholds, helping you set a realistic budget
            before you start shopping.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much House Can I Afford with $50,000 Salary DTI */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much House Can I Afford with $50,000 Salary DTI
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A $50,000 annual salary translates to $4,167 per month in gross
            income ($50,000 / 12). Lenders use this figure to calculate the
            maximum housing payment you can carry under standard DTI
            guidelines.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Using the 28% front-end rule:</strong> The maximum housing
            expense is $4,167 x 0.28 = $1,167 per month. This covers principal
            and interest, property taxes, homeowners insurance, and HOA dues.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Using the 36% back-end rule with existing debt:</strong> If
            you already have $500 per month in non-housing debts (a car
            payment, student loan, and credit card minimums combined), the
            maximum housing payment becomes $4,167 x 0.36 - $500 = $1,000 per
            month. In this scenario, the back-end constraint is tighter than
            the front-end one, so $1,000 is your practical limit.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Translating Monthly Payment to Home Price
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Assuming a 30-year fixed mortgage at approximately 7% interest
                and a 20% down payment, a $1,000 monthly principal and
                interest payment supports a loan of approximately $150,000. With
                20% down, the home price would be approximately $187,500. A
                $1,167 payment supports a loan of approximately $175,000, or a
                home price of approximately $218,750 with 20% down. These are
                approximate figures; actual amounts depend on property tax
                rates, insurance costs, and HOA fees in your area.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The takeaway is that on a $50,000 salary, you are generally looking
            at a home price in the range of roughly $160,000 to $200,000,
            assuming you keep other debts moderate and put at least 20% down.
            If you have less existing debt, the front-end limit becomes the
            binding constraint and your maximum home price increases. Use the
            calculator above to model your exact income and debt numbers and
            see where your DTI falls relative to each loan program.
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
            Explore the full{" "}
            <a
              href="/debt"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Calculators
            </a>{" "}
            hub, or try these related tools. The{" "}
            <a
              href="/debt/debt-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Payoff Calculator
            </a>{" "}
            helps you compare snowball vs avalanche strategies for eliminating
            debt. The{" "}
            <a
              href="/debt/credit-card-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Credit Card Payoff Calculator
            </a>{" "}
            shows how quickly you can wipe out card balances with extra
            payments. The{" "}
            <a
              href="/debt/balance-transfer-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Balance Transfer Calculator
            </a>{" "}
            estimates whether a balance transfer card saves you money after
            fees. If your DTI is driven by mortgage goals, visit the{" "}
            <a
              href="/home-buying"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Home Buying Calculators
            </a>{" "}
            section for tools designed around the home purchase process.
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}