import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import LifeInsuranceCalculator from "@/components/calculators/LifeInsuranceCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

export const dynamic = "force-static";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/insurance/life-insurance-calculator`;
const pageTitle =
  "Life Insurance Calculator \u2013 How Much Coverage?";
const pageDescription =
  "Free life insurance calculator. Estimate how much coverage you need using the DIME method: debts, income replacement, mortgage, and education costs.";

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
    question: "How much life insurance do I need?",
    answer:
      "The amount depends on your debts, income, mortgage, number of dependents, and what you already have in coverage and savings. The DIME method provides a structured way to calculate it: add your outstanding debts, the income your family needs for the years until they are self-sufficient, your remaining mortgage balance, education costs for your children, and final expenses. Then subtract any existing life insurance and liquid savings. The result is your coverage gap. Most working parents need between $500,000 and $1,500,000 in total coverage, though this varies widely based on income, debt, and family size.",
  },
  {
    question: "What is the DIME method for life insurance?",
    answer:
      "DIME stands for Debt, Income, Mortgage, and Education. It is a four-part formula that adds your outstanding non-mortgage debts, the income replacement need (annual income multiplied by the number of years your family would need support), your mortgage balance, and estimated education costs for your children. Final expenses such as funeral costs are often added as a fifth item. Compared to a flat rule like 10x income, the DIME method accounts for your actual financial obligations, making it more accurate for people with high debt, large mortgages, or multiple children, as well as for those with significant existing coverage or savings that reduce the gap.",
  },
  {
    question: "Does a stay-at-home parent need life insurance?",
    answer:
      "Yes. A stay-at-home parent provides services that would cost money to replace: childcare, cooking, house cleaning, transportation, and household management. The national average cost of full-time childcare alone exceeds $10,000 to $16,000 per year per child depending on your area, and adding household help can push total replacement costs to $30,000 or more annually. If a stay-at-home parent were to pass away, the surviving working parent would need to pay for these services while continuing to work. The calculator above has a stay-at-home parent mode that uses replacement-services costing instead of income replacement to estimate this need.",
  },
  {
    question: "How does age affect how much life insurance I need?",
    answer:
      "As you age, your life insurance need typically decreases. In your 20s and 30s, your need is often highest because you may have young children, a large mortgage, and student loans. By your 50s and 60s, children are often grown, the mortgage is paid down or paid off, and retirement savings reduce the income replacement gap. A 30-year-old with two young children and a 30-year mortgage might need $1,000,000 or more, while a 55-year-old with an empty nest and a small remaining mortgage might need $250,000 or less. However, insurability also decreases with age, so locking in a longer term while you are younger and healthier is often more affordable than purchasing coverage later.",
  },
  {
    question: "Is the 10x income rule accurate for life insurance?",
    answer:
      "The 10x income rule is a simple shortcut: buy a death benefit equal to ten times your annual salary. It works reasonably well as a starting point for a typical family with average debt and a mortgage, but it ignores several factors. A high-income earner with a modest mortgage and no children may need less than 10x, while someone with a large mortgage, three children, and significant student loans may need considerably more. The 10x rule also does not account for existing coverage or savings, which can reduce the gap. The DIME method used in this calculator is more precise because it starts from your actual obligations rather than a flat multiple.",
  },
];

/* ─── Page Component ─── */

export default function LifeInsuranceCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: "Insurance Calculators",
            url: `${siteConfig.url}/insurance`,
          },
          { name: "Life Insurance Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Life Insurance Calculator"
        description="Free online life insurance needs calculator using the DIME method. Estimate your total coverage need from debts, income replacement, mortgage, education, and final expenses, then find your coverage gap."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Insurance Calculators", href: "/insurance" },
          { label: "Life Insurance Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Life Insurance Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A life insurance calculator estimates the death benefit your
        dependents would need if you were no longer there to provide. This
        tool uses the DIME method, which adds your debts, the income your
        family would need for a set number of years, your remaining mortgage
        balance, and education costs for your children. It then subtracts
        any existing coverage and savings to show the coverage gap, rounded
        up to the nearest $50,000 band that term policies commonly use.
      </p>

      {/* Calculator (client component) */}
      <div className="mt-8">
        <LifeInsuranceCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: How Much Life Insurance Do I Need Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Life Insurance Do I Need Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The simplest way to estimate a life insurance need is to ask what
            your family would owe and how much income they would require if
            your paycheck disappeared tomorrow. Most online calculators, including
            this one, start with a structured formula rather than a single income
            multiple. The reason is straightforward: a 10x income rule works for
            an average scenario but breaks down at the extremes. A $200,000
            earner with no children, no mortgage, and substantial savings does
            not need $2,000,000 in coverage. Conversely, a $60,000 earner with
            three children, a $350,000 mortgage, and $40,000 in student loans
            likely needs more than $600,000.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $75,000 Income, 10-Year Replacement
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Debts:</strong> $20,000.{" "}
                <strong>Income replacement:</strong> $75,000 times 10 years
                equals $750,000.{" "}
                <strong>Mortgage:</strong> $250,000.{" "}
                <strong>Education:</strong> 2 children times $50,000 equals
                $100,000.{" "}
                <strong>Final expenses:</strong> $15,000.{" "}
                <strong>Total DIME need:</strong> $1,135,000.{" "}
                <strong>Existing coverage:</strong> $100,000.{" "}
                <strong>Savings:</strong> $35,000.{" "}
                <strong>Coverage gap:</strong> $1,135,000 minus $135,000
                equals $1,000,000. Rounded to nearest $50,000 band:
                $1,000,000 recommended additional coverage. The 10x income
                rule would suggest $750,000, which is $385,000 less than the
                DIME result in this case.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The calculator above shows both the DIME total and the 10x rule
            side by side so you can see how they compare for your situation.
            For many families, the DIME result is higher because it includes
            the mortgage and education costs that a flat income multiple
            overlooks. If you already have group life insurance through an
            employer or accumulated savings, the gap may be smaller than
            either method suggests.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Life Insurance Calculator DIME Method */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Life Insurance Calculator DIME Method
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The DIME method breaks your life insurance need into four
            categories, plus final expenses as a commonly added fifth item.
            Each letter stands for a specific financial obligation your
            beneficiary would face:
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>D (Debt):</strong> All outstanding debts excluding your
            mortgage. This includes credit card balances, auto loans, student
            loans, personal loans, and any other liabilities your estate would
            need to settle. If you have $15,000 in auto loans and $5,000 in
            credit card debt, the debt component is $20,000. Co-signed debts
            should be included because the co-signer remains responsible if
            you pass away.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>I (Income):</strong> The total income your family needs
            over a specified number of years. Multiply your annual take-home
            income (or gross income if you prefer a conservative estimate) by
            the number of years until your dependents are financially
            independent. For a $75,000 income over 10 years, this is $750,000.
            The number of years is the most important variable in this
            category. If your youngest child is 5, you might choose 13 to 18
            years to cover them through college.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>M (Mortgage):</strong> The outstanding principal balance on
            your home. This ensures your family can keep the house without
            needing to sell it or refinance under difficult circumstances. If
            you rent or own your home outright, this component is zero.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>E (Education):</strong> The estimated total education cost
            for each child. Multiply the number of children by the projected
            cost per child. For two children at $50,000 each, this is $100,000.
            Costs vary: in-state public universities average roughly $25,000 to
            $30,000 per year for tuition, fees, room, and board in current
            dollars, while private universities can exceed $55,000 per year.
            Adjust the per-child figure based on the type of institution you
            expect your children to attend.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            After summing these four components and adding final expenses,
            subtract your existing life insurance death benefit and liquid
            savings. The remainder, floored at zero, is your coverage gap.
            The calculator rounds this up to the nearest $50,000 because term
            life policies are most commonly sold in $50,000 increments.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Term Life Insurance Coverage Calculator by Age */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Term Life Insurance Coverage Calculator by Age
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Life insurance need changes significantly across different stages
            of life. In your 20s, the need is driven primarily by
            student-loan debt and the start of a mortgage, but income is often
            lower so the income-replacement component is modest. Term lengths
            of 20 to 30 years are common at this age because they lock in a
            low rate during peak health years and extend well past the point
            where children become independent.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            In your 30s and 40s, the need typically peaks. Incomes are
            higher, the mortgage is still substantial, and children may be
            young. A 35-year-old earning $90,000 with a $300,000 mortgage,
            two children, and $25,000 in non-mortgage debt might need
            $1,200,000 or more in total coverage. A 20-year term is the most
            common choice at this age because it covers the period until
            children finish college and the mortgage is significantly paid
            down.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            In your 50s, the need begins to decline. The mortgage balance is
            smaller, children are approaching or have reached financial
            independence, and retirement savings provide an additional safety
            net. A 55-year-old might need only $250,000 to $500,000. A 10-year
            term is often sufficient, and the premiums are higher than at
            younger ages because the probability of death during the term is
            greater. Some insurers cap new term policies at age 65 or 70, so
            securing coverage before those limits is important if you still
            have a need.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Typical Term Lengths by Age Group
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Ages 25-35:</strong> 20-30 year term, coverage $500K to $1.5M.
                Rates are the lowest you will ever qualify for.{" "}
                <strong>Ages 35-45:</strong> 15-20 year term, coverage $500K to
                $1.5M. Peak-need years with growing income and young
                dependents.{" "}
                <strong>Ages 45-55:</strong> 10-20 year term, coverage $250K to
                $750K. Need declining as debts shrink and kids approach
                independence.{" "}
                <strong>Ages 55-65:</strong> 10-15 year term, coverage $100K to
                $500K. Often focused on mortgage payoff and final expenses.
                Premiums are significantly higher than at younger ages.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Life Insurance Do I Need at 40 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Life Insurance Do I Need at 40
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Age 40 is often the peak of life insurance need. At this stage,
            many people have a well-established income, a mortgage with 20
            or more years remaining, school-age children, and accumulated
            debts from cars, student loans, or credit cards. The combination
            of high income (which means a large income-replacement need) and
            substantial obligations means the DIME total is frequently at its
            highest point in a person&apos;s life.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Mini-Example: 40-Year-Old, $100,000 Income, 15-Year Horizon
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Debts:</strong> $30,000 (auto loans + credit cards).{" "}
                <strong>Income replacement:</strong> $100,000 times 15 years
                equals $1,500,000.{" "}
                <strong>Mortgage:</strong> $280,000.{" "}
                <strong>Education:</strong> 2 children times $50,000 equals
                $100,000.{" "}
                <strong>Final expenses:</strong> $15,000.{" "}
                <strong>Total DIME need:</strong> $1,925,000.{" "}
                <strong>Existing coverage:</strong> $250,000 (employer group).{" "}
                <strong>Savings:</strong> $50,000.{" "}
                <strong>Gap:</strong> $1,625,000, rounded up to $1,650,000.
                A 20-year term at age 40 provides coverage through age 60,
                by which point the mortgage is paid down and children are
                grown.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            At 40, a 20-year term is the most common choice because it
            extends to age 60, covering the period when dependents are most
            vulnerable. Premiums are still reasonable compared to purchasing
            at 50, and most applicants in good health qualify without
            difficulty. If you plan to work until 65 or have children later
            in life, a 25-year term may be more appropriate. The key is to
            match the term length to the number of years your family depends
            on your income, not to an arbitrary age.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Life Insurance Needs Calculator for Stay at Home Parent */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Life Insurance Needs Calculator for Stay at Home Parent
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A stay-at-home parent does not earn a salary, but the services
            they provide have real economic value. If that parent were to
            pass away, the surviving parent would need to pay for childcare,
            after-school programs, meal preparation, house cleaning, and
            transportation that the stay-at-home parent previously handled.
            The cost of replacing these services is the basis for calculating
            life insurance need when there is no earned income.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            According to salary surveys, the median annual value of a
            stay-at-home parent&apos;s work exceeds $160,000 when all roles
            (childcare provider, cook, housekeeper, driver, tutor, laundry
            manager) are priced at market rates. However, not all of those
            services would need to be fully replaced. A practical estimate
            focuses on the most expensive and difficult-to-replace items:
            full-time childcare and household management. In most areas,
            full-time daycare for one child costs $10,000 to $16,000 per
            year, and hiring a housekeeper or part-time household help adds
            $5,000 to $15,000. A conservative replacement-services estimate
            of $30,000 per year per family is a common planning benchmark.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The calculator above handles this scenario through the
            stay-at-home parent toggle. When activated, the income
            replacement line switches to a replacement-services line that
            multiplies your chosen annual services cost by the same number
            of years. The D, M, E, and final-expenses components remain the
            same. A stay-at-home parent with $30,000 in annual replacement
            services, a $250,000 mortgage, $20,000 in debts, two children at
            $50,000 each for education, and $15,000 in final expenses would
            need $685,000 over a 10-year horizon ($300,000 + $250,000 +
            $20,000 + $100,000 + $15,000). This is not a small need, and
            it illustrates why life insurance for a non-working spouse is
            widely recommended by financial planners.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For dual-income households where one partner earns significantly
            less, the same principle applies. Even a part-time income of
            $20,000 per year contributes $200,000 or more over a 10-year
            replacement period, plus the portion of household services that
            partner provides. The calculator allows $0 income entry, which
            automatically activates the replacement-services logic with the
            default $30,000 annual cost. Adjust this figure up or down based
            on your local childcare market and the specific services your
            family relies on.
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
              href="/insurance"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Insurance Calculators
            </a>{" "}
            hub. If you are evaluating whether you can afford the premium
            payments, the{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            shows how a new premium affects your debt-to-income ratio. The{" "}
            <a
              href="/debt/debt-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Payoff Calculator
            </a>{" "}
            helps you see whether paying down debts first would reduce your
            life insurance need, and the{" "}
            <a
              href="/insurance/disability-insurance-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Disability Insurance Calculator
            </a>{" "}
            addresses the related but separate question of income protection
            during your lifetime. If you are planning retirement income, the{" "}
            <a
              href="/insurance/annuity-payout-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Annuity Payout Calculator
            </a>{" "}
            estimates how much monthly income a lump sum could generate.
          </p>
        </section>
      </div>
    </div>
  );
}
