import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import AnnuityPayoutCalculator from "@/components/calculators/AnnuityPayoutCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/insurance/annuity-payout-calculator`;
const pageTitle =
  "Annuity Payout Calculator \u2013 Monthly Income | CalcForge";
const pageDescription =
  "Free annuity payout calculator. See how much monthly income a fixed or immediate annuity pays based on your premium, age, and payout option.";

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
    question: "How much does a $100,000 annuity pay per month?",
    answer:
      "A $100,000 single-premium immediate annuity (SPIA) for a 65-year-old male with a life-only payout option pays approximately $600 per month, or about $7,200 annually. That translates to a payout rate of roughly 7.2% of the premium. A 65-year-old female receives slightly less, around $570 per month, because women have longer life expectancies. These figures are based on recent market averages and change as interest rates shift. A 75-year-old male at the same premium would receive roughly $767 per month because the shorter expected payout period allows a higher rate. The calculator above uses a rate table to estimate payouts for various ages, sexes, and options.",
  },
  {
    question: "What is the difference between a fixed-period and a life annuity?",
    answer:
      "A fixed-period annuity pays income for a specific number of years (for example, 10 or 20 years) and then stops, regardless of whether you are alive at the end of the term. The monthly payment is calculated using a standard amortization formula based on the premium, the interest rate, and the number of months. A life annuity pays for as long as you live. If you die early, payments stop (or go to a beneficiary if you have a period-certain rider). If you live longer than average, you continue receiving payments, which is the fundamental risk transfer that makes annuities valuable. Life annuity payouts are determined by the insurer based on your age, sex, and life expectancy rather than a stated interest rate.",
  },
  {
    question: "Why do annuity payouts increase with age?",
    answer:
      "Annuity payouts increase with age because the insurer expects to make fewer total payments. A 75-year-old has a shorter remaining life expectancy than a 60-year-old, so the same premium is spread over fewer expected years, producing a higher monthly amount. The payout rate also reflects the interest rate environment: when long-term bond yields are higher, insurers can invest the premium at higher returns and pass some of that through as higher payouts. Conversely, in a low-rate environment, payouts are lower. The age effect is substantial: a 65-year-old male might receive a 7.2% payout rate, while an 80-year-old male could receive 10.6% on the same premium with the same life-only option.",
  },
  {
    question: "What is a period-certain rider on a life annuity?",
    answer:
      "A period-certain rider guarantees that payments will continue for a minimum number of years even if the annuitant dies before that period ends. A 10-year period certain on a life annuity means the insurer will pay for at least 120 months. If the annuitant dies in year 3, the remaining 84 months of payments go to the designated beneficiary. If the annuitant lives past 10 years, payments continue for life. Because this guarantee increases the insurer's expected total payout, the monthly payment is lower than a straight life-only annuity. A 20-year period certain reduces the payout further. The tradeoff is between a higher monthly payment (life only) and the security of knowing your beneficiaries will receive payments for a guaranteed minimum term.",
  },
  {
    question: "Are annuity payouts taxable?",
    answer:
      "Partially. If you purchase an annuity with after-tax dollars (non-qualified annuity), a portion of each payment is considered a return of your original premium and is not taxed. The remaining portion, which represents earnings, is taxed as ordinary income when received. The exclusion ratio determines the tax-free and taxable portions. For a $100,000 premium expected to produce $180,000 in total lifetime payments, roughly $100,000 divided by $180,000, or about 56%, of each payment would be tax-free return of principal. If the annuity is held inside a qualified retirement account like an IRA or 401(k), the entire payment is taxed as ordinary income because the contributions were tax-deferred. Consult a tax professional for guidance specific to your situation.",
  },
];

/* ─── Page Component ─── */

export default function AnnuityPayoutCalculatorPage() {
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
          { name: "Annuity Payout Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Annuity Payout Calculator"
        description="Free online annuity payout calculator. Estimate monthly and annual income from a fixed-period or immediate life annuity based on premium, age, sex, and payout option."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Insurance Calculators", href: "/insurance" },
          { label: "Annuity Payout Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Annuity Payout Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A $100,000 immediate annuity for a 65-year-old male with a
        life-only payout option pays approximately $600 per month, or
        about $7,200 per year. This annuity payout calculator estimates
        the monthly and annual income a single-premium annuity would
        provide based on your premium amount, age, sex, and payout
        option. It uses an amortization formula for fixed-period
        annuities and a market-based payout-rate table for life
        annuities, so you can compare options side by side.
      </p>

      {/* Calculator (client component) */}
      <div className="mt-8">
        <AnnuityPayoutCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Annuity Payout Calculator Monthly */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Annuity Payout Calculator Monthly
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The monthly payout from an annuity depends on the type of
            product, the premium paid, and the terms you select. For a
            fixed-period annuity, the monthly payment is calculated
            precisely using the amortization formula: the premium is
            divided into equal payments over the selected term, with
            each payment including both principal and interest. For a
            life annuity, the calculation is different. The insurer uses
            actuarial tables based on your age, sex, and life
            expectancy to determine a payout rate, then applies that
            rate to your premium to find the annual and monthly income.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The distinction matters because a fixed-period payment is
            mathematically exact and driven by the interest rate you
            select, while a life annuity payment is an estimate based on
            mortality probabilities. If you live longer than your life
            expectancy, the life annuity pays more in total than a
            fixed-period annuity of the same premium. If you die early,
            a life-only annuity pays less (or nothing beyond the premium
            if there is no refund). The calculator above handles both
            modes and shows the relevant output for each.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Monthly income from an annuity is typically lower than
            withdrawals from an investment portfolio of the same size,
            because the annuity provides mortality credits: the funds of
            annuitants who die early subsidize the payments to those who
            live longer. This pooling is what allows a life annuity to
            pay more per month than a safe withdrawal rate from a bond
            portfolio would support for an equivalent lifespan.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Immediate Annuity Income Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Immediate Annuity Income Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An immediate annuity begins paying income within one payment
            period (usually one month) after you pay the premium. This
            distinguishes it from a deferred annuity, which accumulates
            value for years before annuitization. Immediate annuities
            are also called single-premium immediate annuities, or SPIAs,
            and are the most straightforward type for generating retirement
            income.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            To use the calculator for an immediate annuity, select one of
            the life options (Life Only, Life with Period Certain, or
            Joint Life) and enter your premium, age, and sex. The payout
            rate table reflects what SPIA products have been paying in the
            current interest rate environment. If you are comparing an
            immediate annuity against a fixed-period product, switch the
            payout option to a fixed period to see the difference in
            monthly income and total amount received.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            A deferred annuity works differently: you make premium
            payments (or a single premium) during an accumulation phase,
            and the value grows tax-deferred. When you annuitize, the
            payout depends on the accumulated value at that point, not the
            original premium. This calculator does not model the
            accumulation phase. It estimates the income you would receive
            if you converted a lump sum into income today, which is the
            relevant question when comparing an annuity to a lump-sum
            investment or a pension buyout offer.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Does a $100,000 Annuity Pay per Month */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Does a $100,000 Annuity Pay per Month
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The payout on a $100,000 premium varies primarily by age and
            the payout option selected. Below is a reference table showing
            estimated monthly life-only payouts for male and female
            annuitants at four common ages. These figures are based on the
            rate table used in the calculator and represent market
            averages, not insurer-specific quotes.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                $100,000 Life-Only Annuity: Estimated Monthly Payout by Age
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Age 60:</strong> Male $533/mo ($6,400/yr, 6.40%),
                Female $508/mo ($6,100/yr, 6.10%).{" "}
                <strong>Age 65:</strong> Male $600/mo ($7,200/yr, 7.20%),
                Female $571/mo ($6,850/yr, 6.85%).{" "}
                <strong>Age 70:</strong> Male $675/mo ($8,100/yr, 8.10%),
                Female $642/mo ($7,700/yr, 7.70%).{" "}
                <strong>Age 75:</strong> Male $767/mo ($9,200/yr, 9.20%),
                Female $733/mo ($8,800/yr, 8.80%).
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            Adding a period-certain rider reduces these amounts. A
            65-year-old male with a 10-year period certain would receive
            approximately $558 per month instead of $600, and a 20-year
            period certain drops to roughly $483 per month. The reduction
            occurs because the insurer must guarantee payments to a
            beneficiary if the annuitant dies within the guarantee period,
            increasing the expected total payout.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For fixed-period annuities, the monthly payout is driven by
            the interest rate rather than age. A $100,000 premium at 4.5%
            over 20 years produces approximately $633 per month, for a
            total of $151,836 (of which $51,836 is interest). At 6% over
            20 years, the same premium pays approximately $716 per month.
            Fixed-period payouts are the same regardless of age or sex
            because there is no mortality risk for the insurer to price.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Annuity Payout Calculator by Age */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Annuity Payout Calculator by Age
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Age is the single most important factor in determining a life
            annuity payout. The reason is straightforward: the insurer
            estimates your remaining life expectancy and spreads the
            premium over that period, with adjustments for the interest
            it expects to earn on the reserve it holds to fund future
            payments. A 55-year-old male has a life expectancy of roughly
            24 more years, while an 80-year-old male has roughly 8 years.
            The same $100,000 premium therefore produces a much higher
            monthly payment at 80 than at 55.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The payout rate at age 65 for a male life-only annuity is
            approximately 7.2% annually, producing about $600 per month on
            a $100,000 premium. At age 70, the rate rises to roughly 8.1%
            ($675/month). At age 75, it climbs to about 9.2% ($767/month).
            At age 80, it reaches approximately 10.6% ($883/month). These
            are not guaranteed rates; they reflect market conditions at the
            time the rate table was compiled. When interest rates rise,
            annuity payout rates tend to increase because insurers can earn
            more on the premium reserve. When rates fall, payouts decrease.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The age-payout relationship is why many financial planners
            recommend annuitizing a portion of retirement savings in your
            late 60s or early 70s rather than at younger ages. The higher
            payout rate at older ages means more monthly income per dollar
            of premium, and the shorter expected payout period means less
            inflation risk (the purchasing power of fixed payments erodes
            over time). However, delaying annuitization also means
            forgoing the mortality credits you would have received during
            the waiting years.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Fixed Annuity Income Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Fixed Annuity Income Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A fixed-period annuity converts a lump sum into guaranteed
            monthly payments for a set number of years. The calculation
            uses the standard loan amortization formula, which is the same
            math used for a mortgage but in reverse: instead of borrowing
            money and repaying it, you are lending money (to the insurer)
            and receiving it back with interest in equal installments.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $100,000 Premium, 4.5% Annual Rate, 20-Year Fixed Period
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Monthly rate:</strong> 4.5% / 12 = 0.375%.{" "}
                <strong>Number of payments:</strong> 20 years times 12 = 240.{" "}
                <strong>Formula:</strong> $100,000 times 0.00375 divided by (1 minus (1.00375) to the -240).{" "}
                <strong>Monthly payment:</strong> $632.65.{" "}
                <strong>Annual income:</strong> $7,591.80.{" "}
                <strong>Total received:</strong> $632.65 times 240 = $151,836.{" "}
                <strong>Interest portion:</strong> $151,836 minus $100,000 = $51,836.{" "}
                <strong>Payout rate:</strong> 7.59%. These figures are exact for the
                stated assumptions.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The interest rate you choose in the calculator is a planning
            assumption. Actual fixed-period annuity rates depend on the
            insurer, the prevailing yield on bonds and other fixed-income
            investments at the time of purchase, and the duration of the
            payout period. Longer fixed periods typically offer slightly
            higher rates than shorter ones because the insurer can invest
            in longer-duration bonds. A 10-year fixed period at 4.0%
            might produce a payout rate around 12.2%, while a 25-year
            period at 4.5% might produce roughly 6.7%, reflecting the
            longer time over which interest accrues.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Unlike life annuities, fixed-period annuities do not provide
            longevity protection. If you outlive the payment period, the
            income stops. This makes them suitable for specific goals like
            funding a child&apos;s education over 10 years or bridging the gap
            between retirement and Social Security, rather than as a
            primary lifetime income source. The calculator shows the total
            received and interest portion so you can evaluate whether the
            effective return meets your objectives.
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
            hub. If you are deciding how much of your savings to annuitize,
            the{" "}
            <a
              href="/insurance/life-insurance-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Life Insurance Calculator
            </a>{" "}
            can help you determine whether your existing coverage is
            sufficient so you can free up premium dollars for income
            instead. The{" "}
            <a
              href="/insurance/disability-insurance-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Disability Insurance Calculator
            </a>{" "}
            addresses the separate question of protecting your income
            before retirement, which should typically be prioritized
            before purchasing an annuity.
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