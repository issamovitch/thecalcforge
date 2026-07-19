import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import DisabilityInsuranceCalculator from "@/components/calculators/DisabilityInsuranceCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/insurance/disability-insurance-calculator`;
const pageTitle =
  "Disability Insurance Calculator \u2013 Coverage Needs | CalcForge";
const pageDescription =
  "Free disability insurance calculator. Estimate how much coverage you need to replace your income if you cannot work, based on salary and expenses.";

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
    question: "How much disability insurance do I need?",
    answer:
      "Most financial advisors recommend a benefit that covers your essential monthly expenses, typically 60% of gross income. The 60% cap exists because disability benefits are generally tax-free for individually owned policies, so 60% of pre-tax income roughly equals your after-tax take-home pay. Start by listing your non-negotiable monthly costs: housing, food, utilities, insurance, and minimum debt payments. Subtract any existing employer-provided LTD coverage and other income replacement. The remainder is your coverage gap. Use the calculator above to estimate this gap and compare it to the standard 60% rule.",
  },
  {
    question: "What is the difference between own-occupation and any-occupation disability insurance?",
    answer:
      "Own-occupation disability insurance pays benefits if you cannot perform the specific duties of your own occupation, even if you are able to work in a different field. This is especially important for physicians, surgeons, dentists, and other highly specialized professionals who earn significantly more in their specialty than in alternative work. Any-occupation disability insurance pays only if you are unable to work in any occupation for which you are reasonably qualified by education, training, or experience. Because the bar to qualify is higher, any-occupation policies cost less. The benefit amount is the same between the two types; the difference lies in when you qualify to receive payments.",
  },
  {
    question: "How is disability insurance premium calculated?",
    answer:
      "Disability insurance premiums are typically 1% to 3% of your annual salary, though the exact rate depends on several factors. Age is a major factor: a 25-year-old might pay 1-1.5% while a 50-year-old could pay 2-3% for the same coverage. Occupation class matters: office workers in low-risk jobs receive lower rates than construction workers or surgeons. Health status, gender, smoking, and the benefit period and elimination period you choose also affect cost. Own-occupation policies cost roughly 20-40% more than any-occupation policies. The estimates in this calculator use a flat percentage of salary and are for general planning only. Actual quotes require underwriting.",
  },
  {
    question: "What is the elimination period in disability insurance?",
    answer:
      "The elimination period is the waiting time between when you become disabled and when benefit payments begin. Common options are 30, 60, 90, 180, and 365 days. A shorter elimination period means benefits start sooner, but the premium is higher. A 90-day elimination period is the most common choice. When selecting your elimination period, consider how much emergency savings you have to cover expenses during the wait. If you have three to six months of expenses saved, a 90-day elimination period may be appropriate. If your savings are thin, a 30-day period provides faster protection at a higher cost.",
  },
  {
    question: "Does employer-provided LTD cover my full income replacement need?",
    answer:
      "Usually not. Most employer group long-term disability plans cover 50-60% of base salary, and many have a monthly cap between $5,000 and $10,000. If your base salary is $100,000, a 60% plan pays $5,000/month. But if your essential expenses are $6,000/month, you have a $1,000/month gap. Additionally, employer LTD benefits are taxable if the employer paid the premiums, which further reduces the effective replacement rate. High earners are often most affected by the monthly cap. An individual supplemental disability policy can fill this gap. Use the calculator above to see your specific coverage shortfall after employer LTD and other benefits.",
  },
];

/* ─── Page Component ─── */

export default function DisabilityInsuranceCalculatorPage() {
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
          { name: "Disability Insurance Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Disability Insurance Calculator"
        description="Free online disability insurance needs calculator. Estimate your coverage gap, recommended benefit amount, and estimated premium based on salary, expenses, and existing coverage."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Insurance Calculators", href: "/insurance" },
          { label: "Disability Insurance Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Disability Insurance Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A disability insurance calculator helps you estimate how much income
        replacement coverage you need if an illness or injury prevents you from
        working. Most individual disability policies cap the benefit at
        approximately 60% of your gross income, because the benefit is
        tax-free and should approximate your take-home pay. This tool compares
        that standard cap against your actual monthly essential expenses to
        find your coverage gap, then subtracts any employer-provided long-term
        disability (LTD) and other benefits to show the supplemental coverage
        you may need. Premiums vary by age, health, and occupation class, so
        the cost estimates provided are rough ranges for planning purposes.
      </p>

      {/* Calculator (client component) */}
      <div className="mt-8">
        <DisabilityInsuranceCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Disability Insurance Needs Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Disability Insurance Needs Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Calculating your disability insurance need starts with a simple
            question: if you could not work tomorrow, how much monthly income
            would you need to maintain your household? The answer is not your
            full salary. It is the amount required to cover your essential
            obligations: mortgage or rent, utilities, food, insurance premiums,
            minimum debt payments, and childcare. Discretionary spending like
            dining out, vacations, and entertainment can be reduced, but the
            essentials cannot.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The standard benchmark used by insurers and financial planners is
            60% of gross income. This figure is not arbitrary. Because
            individually owned disability insurance benefits are received
            tax-free, a 60% benefit on pre-tax income roughly equals the
            after-tax take-home pay for most tax brackets. The calculator above
            computes both the 60% rule and your actual expense-based need, then
            shows the recommended benefit as the lower of the two, since
            insurers rarely approve a benefit above 60% of gross income.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The gap between what you need and what you already have is where
            supplemental disability insurance fits. If your employer provides
            40% of salary in LTD coverage and your essential expenses equal 55%
            of salary, you have a 15% gap. For a $6,667 monthly gross income
            ($80,000 annually), that gap is roughly $1,000 per month. The
            calculator quantifies this gap precisely based on the numbers you
            enter.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Disability Insurance Do I Need Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Disability Insurance Do I Need Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The amount of disability insurance you need depends on three
            factors: your monthly essential expenses, your existing income
            replacement sources, and the maximum benefit an insurer will
            issue. Insurers cap individual policies at roughly 60% of gross
            monthly income, though the exact percentage can range from 50% to
            70% depending on the carrier and your income level. High earners
            may face a monthly dollar cap rather than a percentage cap.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $80,000 Salary, $4,000/Month Expenses, 40%
                Employer LTD
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Monthly gross income:</strong> $6,667.{" "}
                <strong>Standard 60% rule:</strong> $4,000/month maximum
                benefit.{" "}
                <strong>Employer LTD (40%):</strong> $2,667/month.{" "}
                <strong>Coverage gap:</strong> $4,000 minus $2,667 equals
                $1,333/month.{" "}
                <strong>Recommended benefit:</strong> $1,333/month (capped at
                the 60% rule, which is also $4,000 in this case, so the gap
                amount applies).{" "}
                <strong>Benefit as % of income:</strong> 20.0%.{" "}
                <strong>Estimated monthly premium (2% of salary):</strong>{" "}
                roughly $133/month or $1,600/year. These figures assume a
                benefit period to age 65 and do not reflect actual insurer
                quotes.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            When determining your need, also consider the benefit period. A
            two-year benefit period is the least expensive option but may not
            be sufficient if you face a long-term or permanent disability. A
            benefit period to age 65 (or 67 for those planning to retire later)
            provides the most comprehensive protection but costs significantly
            more. Most financial advisors recommend covering at least through
            your planned retirement age.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Do not forget to account for taxes on employer-provided LTD. If
            your employer pays the premiums, the benefit is taxable as
            ordinary income. On a $2,667 monthly employer LTD benefit, federal
            and state taxes could reduce the net amount by 20-30%, leaving you
            with closer to $1,867 to $2,134. This tax reduction effectively
            widens your coverage gap, which is why the calculator asks for
            your pre-tax employer LTD percentage and why individual policies
            (which are tax-free) are often a valuable supplement.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Long Term Disability Benefit Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Long Term Disability Benefit Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Long-term disability (LTD) insurance is designed to replace a
            portion of your income when a disability lasts beyond the
            elimination period, typically 90 days or longer. LTD benefits
            continue for the duration of the benefit period you selected at
            purchase, which could be two years, five years, ten years, or
            until you reach retirement age.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The benefit amount is usually expressed as a monthly dollar figure
            and is calculated as a percentage of your pre-disability earnings,
            subject to the policy cap. For example, a policy with a 60%
            benefit on an $80,000 salary provides a maximum of $4,000 per
            month. If the policy also has a $10,000 monthly cap, a
            $250,000 earner would still be limited to $10,000 per month even
            though 60% of their salary is $12,500. This is why high earners
            often need multiple policies or specialized high-limit coverage.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The total benefit you receive over the life of the claim depends on
            the monthly amount and the duration. At $4,000 per month for 30
            years (age 35 to 65), the total benefit is $1,440,000. Even a
            modest $2,000/month benefit over 30 years totals $720,000. These
            figures illustrate why disability insurance is often described as
            income protection rather than merely insurance: the benefit pool
            is frequently the largest financial asset a working-age person
            has, exceeding the value of their home or retirement accounts in
            many cases.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Short-term disability (STD) covers the initial weeks or months
            before LTD kicks in. STD typically lasts 3 to 6 months and pays a
            higher percentage of income, often 60-70%. The calculator above
            focuses on long-term needs because the financial risk of a
            long-term disability is far greater than a short one, but if you
            have no STD coverage, consider whether your emergency savings can
            bridge the elimination period before LTD begins.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Own Occupation Disability Insurance Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Own Occupation Disability Insurance Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Own-occupation disability insurance provides the broadest
            definition of disability in the industry. Under an own-occupation
            policy, you are considered disabled if you cannot perform the
            material and substantial duties of your specific occupation, even
            if you are capable of working in another field. A surgeon who loses
            fine motor control, for instance, would qualify for benefits under
            an own-occupation policy even if they could still teach or
            consult.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The benefit calculation works the same way as any-occupation
            coverage: the monthly benefit is a percentage of your income, capped
            at the insurer limit. The difference is not in the amount you
            receive but in the likelihood of qualifying. Own-occupation policies
            have higher claim rates because the threshold to qualify is lower,
            which is why they cost 20-40% more than any-occupation policies with
            identical benefit amounts and terms.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For physicians, surgeons, dentists, attorneys, and other
            high-income professionals, own-occupation coverage is typically
            worth the additional cost. The income differential between their
            specialty and alternative work is large enough that a disability
            under an any-occupation definition could force them into a
            completely different career at a fraction of their former earnings.
            For example, a physician earning $300,000 annually whose benefit
            is capped at $15,000/month ($180,000/year) would face a
            significant income reduction, but an own-occupation policy ensures
            they receive that benefit even if they transition to teaching or
            administration.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            When using the calculator, the benefit amount and coverage gap
            calculations apply equally to own-occupation and any-occupation
            policies. The premium estimates in the calculator are generic and
            do not distinguish between the two. In practice, expect to pay
            roughly 20-40% more for own-occupation coverage than the mid-range
            estimate shown. Some insurers offer hybrid definitions that start
            as own-occupation for the first few years and transition to
            any-occupation afterward, which provides a middle ground on cost.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Disability Insurance Cost Calculator by Salary */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Disability Insurance Cost Calculator by Salary
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Disability insurance premiums are most commonly expressed as a
            percentage of annual salary. For individual policies, the typical
            range is 1% to 3% of gross income per year. A $60,000 earner might
            pay $600 to $1,800 annually, while a $120,000 earner might pay
            $1,200 to $3,600. These ranges are broad because the actual rate
            depends on factors beyond income alone.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Estimated Annual Premiums by Salary (2% Mid-Range, Any-Occupation, to Age 65)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>$50,000 salary:</strong> approximately $1,000/year ($83/month).{" "}
                <strong>$80,000 salary:</strong> approximately $1,600/year ($133/month).{" "}
                <strong>$100,000 salary:</strong> approximately $2,000/year ($167/month).{" "}
                <strong>$150,000 salary:</strong> approximately $3,000/year ($250/month).{" "}
                <strong>$200,000 salary:</strong> approximately $4,000/year ($333/month).
                Own-occupation policies at these salary levels typically add 20-40% to these
                figures. Actual quotes vary by age, health, gender, smoking status, and
                occupation class.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            Age is one of the strongest cost drivers. A 30-year-old non-smoking
            office worker might pay closer to 1% of salary, while a 50-year-old
            in the same occupation could pay 2-2.5%. This is why most advisors
            recommend purchasing disability insurance as early in your career
            as possible. Locking in coverage at a younger age secures a lower
            rate for the duration of the policy, assuming you choose a
            level-premium structure (which keeps the premium fixed rather than
            increasing each year).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Occupation class is the other major factor. Insurers classify
            occupations into categories based on physical risk and claim
            history. Class 1 (professional, sedentary office work) receives the
            lowest rates. Class 4 or 5 (heavy manual labor, construction,
            roofing) pays the highest. A surgeon may be Class 2 despite the
            sedentary nature of the work because the precision required and
            the high income replacement cost affect the rate. When comparing
            quotes, make sure each insurer has classified your occupation
            correctly, as a single class difference can change the premium by
            15-25%.
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
              href="/insurance"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Insurance Calculators
            </a>{" "}
            hub. Understanding your income replacement needs is closely tied to
            your overall debt picture. Use the{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            to see how a disability would affect your debt-to-income ratio, or
            the{" "}
            <a
              href="/home-buying/home-affordability-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Home Affordability Calculator
            </a>{" "}
            to understand the income level required to support your mortgage
            payment, which is a key input when determining how much disability
            coverage you need.
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