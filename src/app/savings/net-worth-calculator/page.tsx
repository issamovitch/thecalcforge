import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import NetWorthCalculator from "@/components/calculators/NetWorthCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

export const dynamic = "force-static";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/savings/net-worth-calculator`;
const pageTitle =
  "Net Worth by Age Calculator – How You Compare";
const pageDescription =
  "Free net worth calculator. Add your assets, subtract your debts, and compare your net worth to the U.S. median and average for your age group.";

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
    question: "What is the formula for net worth?",
    answer:
      "Net worth equals total assets minus total liabilities. Add up everything you own that has value (cash, retirement accounts, investment accounts, home value, vehicles, and other assets), then subtract everything you owe (mortgage balance, auto loans, student loans, credit cards, and other debts). The result is your net worth. The calculator above does this automatically as you type.",
  },
  {
    question: "What is the median U.S. household net worth?",
    answer:
      "The median U.S. household net worth is $192,700 according to the Federal Reserve's 2022 Survey of Consumer Finances, released in October 2023 (the latest available). The average (mean) is much higher at $1,063,700 because wealth is concentrated at the top, which pulls the mean up. Median is the better comparison for a typical household because half of households are above it and half are below.",
  },
  {
    question: "How does net worth compare by age bracket?",
    answer:
      "Net worth rises with age as households accumulate savings and home equity. Per the Federal Reserve SCF 2022, median net worth is $39,000 for under 35, $135,600 for 35-44, $247,200 for 45-54, $364,500 for 55-64, $409,900 for 65-74, and $335,600 for 75 and older. The 75+ bracket dips because retirees spend down savings. The calculator above shows your bracket's median and average automatically when you enter your age.",
  },
  {
    question: "Should I include home equity in my net worth?",
    answer:
      "Yes. Home equity (home value minus mortgage balance) is part of your net worth and is the largest asset for most U.S. households. The calculator above includes it automatically and also shows your net worth excluding home equity separately, because some lenders and analysts prefer that view when assessing liquid wealth. Both numbers are useful for different purposes.",
  },
  {
    question: "Where do the benchmark numbers come from?",
    answer:
      "All benchmark figures on this page come from the Federal Reserve's 2022 Survey of Consumer Finances, released in October 2023, which is the latest available. The numbers are in 2022 dollars. The Federal Reserve conducts the Survey of Consumer Finances every three years; the next release is expected in late 2026. We do not invent any percentile or top-1% dollar figures beyond what the Fed publishes (median and average by age bracket).",
  },
];

/* ─── Page Component ─── */

export default function NetWorthPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: "Savings Calculators",
            url: `${siteConfig.url}/savings`,
          },
          { name: "Net Worth by Age Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Net Worth by Age Calculator"
        description="Free online net worth calculator. Add your assets, subtract your debts, and compare your net worth to the U.S. median and average for your age group based on Federal Reserve SCF 2022 data."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Savings Calculators", href: "/savings" },
          { label: "Net Worth by Age Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Net Worth by Age Calculator
      </h1>

      {/* Intro paragraph (first 100 words answer the primary keyword) */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A net worth by age calculator adds up your assets, subtracts your
        liabilities, and tells you whether your number is above or below the
        median for your age bracket. The formula is{" "}
        <strong>net worth = total assets &minus; total liabilities</strong>.
        The median U.S. household net worth is $192,700, and for ages 35-44 it
        is $135,600, per the Federal Reserve&apos;s 2022 Survey of Consumer
        Finances. Enter your assets, debts, and age above to see your net worth,
        your home equity, and how you compare to your age group.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <NetWorthCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Net Worth by Age Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Net Worth by Age Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A net worth by age calculator does two things: it computes your
            personal net worth from your assets and liabilities, and it places
            that number next to the median and average for your age bracket so
            you can see whether you are ahead of, behind, or in line with your
            peers. The calculator above uses the Federal Reserve&apos;s 2022
            Survey of Consumer Finances (SCF), released in October 2023, as the
            benchmark source. The SCF is the most authoritative household wealth
            survey in the United States and is conducted every three years; the
            next release is expected in late 2026.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Net worth itself is a single subtraction: total assets minus total
            liabilities. Assets include cash, retirement accounts, investment
            accounts, home value, vehicles, and anything else you own that has
            monetary value. Liabilities include your mortgage balance, auto
            loans, student loans, credit card balances, and any other debts.
            The result can be negative, which means you owe more than you own;
            the calculator shows negative net worth in red.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Why median beats average for comparison: wealth is heavily
            concentrated, so the average (mean) is pulled sharply upward by
            households at the very top. The median is the middle value, with
            half of households above and half below, so it reflects a typical
            household in your bracket. The calculator shows both, but the
            plain-English verdict above your result uses the median.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How It Works + Worked Example + Benchmark Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How the Net Worth Calculation Works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The calculation is a straight subtraction. The calculator sums
            every asset row you enter, sums every liability row, and subtracts
            the second total from the first. It also identifies your home value
            and mortgage balance by row label (any row whose label contains
            &quot;home&quot; or &quot;mortgage&quot;) to compute home equity
            separately, then subtracts home equity from net worth to show net
            worth excluding home equity. You can rename, add, or delete any row,
            and every preset row is deletable.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $225,000 Net Worth at Age 40
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Assets:</strong> $50,000 cash + $80,000 retirement +
                $350,000 home + $15,000 car = <strong>$495,000</strong>.{" "}
                <strong>Liabilities:</strong> $250,000 mortgage + $12,000 auto
                + $8,000 cards = <strong>$270,000</strong>.{" "}
                <strong>Net worth:</strong> $495,000 &minus; $270,000 ={" "}
                <strong>$225,000</strong>.{" "}
                <strong>Home equity:</strong> $350,000 &minus; $250,000 ={" "}
                <strong>$100,000</strong>.{" "}
                <strong>Net worth excluding home equity:</strong> $225,000
                &minus; $100,000 = <strong>$125,000</strong>. Every figure is
                exact and matches the calculator&apos;s default values.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            At age 40, this household falls in the 35-44 bracket, where the
            median is $135,600. With $225,000, they are above the median, which
            puts them in the top half of their age group. The calculator shows
            this verdict in a plain sentence so you do not have to do the
            comparison yourself.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3">
                U.S. Net Worth by Age Bracket (Federal Reserve SCF 2022)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">Age Bracket</th>
                      <th className="text-right py-2 px-4 font-medium">Median</th>
                      <th className="text-right py-2 pl-4 font-medium">Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">Under 35</td>
                      <td className="py-2 px-4 text-right tabular-nums">$39,000</td>
                      <td className="py-2 pl-4 text-right tabular-nums">$183,500</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">35-44</td>
                      <td className="py-2 px-4 text-right tabular-nums">$135,600</td>
                      <td className="py-2 pl-4 text-right tabular-nums">$549,600</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">45-54</td>
                      <td className="py-2 px-4 text-right tabular-nums">$247,200</td>
                      <td className="py-2 pl-4 text-right tabular-nums">$975,800</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">55-64</td>
                      <td className="py-2 px-4 text-right tabular-nums">$364,500</td>
                      <td className="py-2 pl-4 text-right tabular-nums">$1,566,900</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">65-74</td>
                      <td className="py-2 px-4 text-right tabular-nums">$409,900</td>
                      <td className="py-2 pl-4 text-right tabular-nums">$1,794,600</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4">75+</td>
                      <td className="py-2 px-4 text-right tabular-nums">$335,600</td>
                      <td className="py-2 pl-4 text-right tabular-nums">$1,624,100</td>
                    </tr>
                    <tr className="font-medium">
                      <td className="py-2 pr-4">All households</td>
                      <td className="py-2 px-4 text-right tabular-nums">$192,700</td>
                      <td className="py-2 pl-4 text-right tabular-nums">$1,063,700</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Source: Federal Reserve Survey of Consumer Finances 2022,
                released October 2023. Figures are in 2022 dollars. The next
                SCF release is expected late 2026.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: Net Worth Percentile Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Net Worth Percentile Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A net worth percentile calculator tells you what percentage of
            households have a lower net worth than you. The Federal Reserve
            publishes median (the 50th percentile) and average by age bracket
            from the SCF, but it does not publish official by-age percentile
            cutoffs for the 90th, 95th, or 99th percentile. Percentile tables
            you see online that break down net worth by age and percentile are
            third-party estimates produced by analyzing the SCF microdata, and
            should be treated as approximations rather than official figures.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The most reliable comparison the SCF directly supports is against
            the median for your age bracket, which is what the calculator above
            uses. Being above the median puts you in the top half of your
            bracket; being below puts you in the bottom half. That is a clean,
            defensible comparison. If you want a finer percentile estimate, use
            a tool that explicitly cites the SCF microdata and discloses its
            methodology, and treat the result as approximate.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            A useful sanity check: the gap between median and average within
            each bracket tells you how skewed the distribution is. For the
            55-64 bracket, the median is $364,500 and the average is
            $1,566,900, which means a small number of very high-wealth
            households pull the average far above the typical household. This
            is exactly why median is the better benchmark for &quot;how am I
            doing compared to a typical household my age.&quot;
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Net Worth to Be in the Top 1% by Age */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Net Worth to Be in the Top 1% by Age
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The Federal Reserve does not publish an official by-age top 1%
            net worth threshold from the Survey of Consumer Finances. National
            analyses of the SCF 2022 microdata put the overall top 1%
            household net worth threshold (across all ages) in the low teens
            of millions of dollars, commonly cited around $13 to $14 million.
            Treat this as an estimate range, not an official figure.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            That threshold varies strongly by age because wealth accumulates
            over a lifetime. A top 1% net worth at age 30 is much lower than a
            top 1% net worth at age 60, simply because a 30-year-old has had
            far less time to accumulate. Third-party estimates of by-age top
            1% thresholds exist, but they are derived from the same SCF
            microdata with different methodologies and produce different
            numbers, so we do not cite a specific dollar figure by age here.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For most households, the more useful question is not &quot;am I in
            the top 1%&quot; but &quot;am I above the median for my age,&quot;
            which the calculator above answers directly. The median is the
            cleanest published benchmark, and being above it puts you in the
            top half of your bracket, which is a meaningful milestone on its
            own.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Net Worth Calculator with Home Equity */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Net Worth Calculator with Home Equity
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Home equity is the largest asset for most U.S. households, so any
            accurate net worth calculator must include it. The calculator above
            treats home value as an asset and mortgage balance as a liability,
            then computes home equity as home value minus mortgage balance and
            shows it on a dedicated line. It also shows net worth excluding
            home equity, which is your liquid (or at least non-housing) wealth:
            cash, retirement, investments, vehicles, and other assets minus
            all debts.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Why show both? Lenders and some analysts look at net worth
            excluding home equity when assessing whether you can cover
            obligations without selling your home. A household with $300,000
            of home equity and $10,000 of other savings is in a very different
            liquidity position from one with $310,000 of liquid investments
            and no home equity, even though both have the same total net
            worth. The two numbers together give a fuller picture.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Using the worked example above: total net worth is $225,000, home
            equity is $100,000 ($350,000 home minus $250,000 mortgage), and
            net worth excluding home equity is $125,000. That $125,000 is the
            household&apos;s non-housing wealth, spread across cash,
            retirement, and a vehicle. The calculator updates all three
            numbers live as you edit any row.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Am I Above Average Net Worth for My Age */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Am I Above Average Net Worth for My Age
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To answer &quot;am I above average net worth for my age,&quot;
            compare your net worth to the median for your age bracket, not the
            average. Median is the better test because the average is skewed
            upward by high-wealth households. In the 35-44 bracket, for
            example, the median is $135,600 and the average is $549,600; a
            household with $200,000 of net worth is well above the median but
            well below the average, so the answer depends entirely on which
            benchmark you use.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The calculator above settles this by giving you a plain sentence:
            it tells you whether you are above or below the median for your
            bracket, and it shows the median and average side by side so you
            can see both. Being above the median puts you in the top half of
            your age group, which is a solid, defensible answer to the
            above-average question. The average is shown for context, but the
            verdict uses the median.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            One caveat: the benchmark figures are from the 2022 SCF, in 2022
            dollars. If your assets have appreciated since then (especially
            home value), your real standing may be slightly different in 2024
            dollars, but the SCF remains the most recent authoritative survey
            until the 2025 SCF is published in late 2026. Use the numbers as
            a snapshot, not a real-time update.
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
              href="/savings"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Savings Calculators
            </a>{" "}
            hub. If you are weighing whether to break a CD to free up cash,
            the{" "}
            <a
              href="/savings/cd-early-withdrawal-penalty-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              CD Early Withdrawal Penalty Calculator
            </a>{" "}
            shows the penalty, your net proceeds, and whether breaking the CD
            beats keeping it to maturity. If your net worth is weighed down by
            high-interest debt, the{" "}
            <a
              href="/debt/debt-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Payoff Calculator
            </a>{" "}
            compares snowball and avalanche strategies and shows your debt-free
            date. If home equity is a big part of your net worth and you are
            considering buying more house, the{" "}
            <a
              href="/home-buying/home-affordability-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Home Affordability Calculator
            </a>{" "}
            applies the 28/36 DTI rule to find the home price your income
            supports.
          </p>
        </section>
      </div>
    </div>
  );
}
