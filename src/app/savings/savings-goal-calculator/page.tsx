import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import SavingsGoalCalculator from "@/components/calculators/SavingsGoalCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";
import { solveMonthly, solveTime } from "@/lib/savings-goal-math";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/savings/savings-goal-calculator`;
const pageTitle =
  "Savings Goal Calculator – Monthly & Time to Goal";
const pageDescription =
  "Free savings goal calculator. See how much to save per month to hit any goal, or how long your current monthly savings will take to get there.";

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

/* ─── Computed examples (module scope, static generation) ─── */
/* Every figure in the content below comes from the same engine that powers the
   interactive calculator above. No hardcoded numbers. */

const f = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
const fc = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Intro / worked example — Tab 1 defaults: $50k goal, $5k current, 5y, 4.00%
const ex1 = solveMonthly(50000, 5000, 0.04, 5);

// Tab 2 — million-dollar timeline from $0 at 7%
const t2_500 = solveTime(1_000_000, 0, 500, 0.07);
const t2_1000 = solveTime(1_000_000, 0, 1000, 0.07);
const t2_2000 = solveTime(1_000_000, 0, 2000, 0.07);

// Tab 1 — required monthly to reach $1M from $0 at 7%
const m_30y = solveMonthly(1_000_000, 0, 0.07, 30);
const m_20y = solveMonthly(1_000_000, 0, 0.07, 20);
const m_10y = solveMonthly(1_000_000, 0, 0.07, 10);
const m_40y = solveMonthly(1_000_000, 0, 0.07, 40);

// Sub-figures used in the worked-example card
// Current savings grown forward at the assumed rate for the full term:
// $5,000 × (1 + 0.04/12)^60 ≈ $6,105
const ex1_currentGrown = 5000 * Math.pow(1 + 0.04 / 12, 60);
const ex1_gap = 50000 - ex1_currentGrown;

/* ─── FAQ Data ─── */

const faqs = [
  {
    question: "How much do I need to save per month to reach my goal?",
    answer:
      `Take your goal, subtract what you already have saved (grown forward at your assumed rate for the full term), and divide the gap by the future value of a $1 monthly contribution over the same term. For a $50,000 goal with $5,000 already saved, 5 years to go, and a 4.00% annual return, the calculator above computes a required monthly contribution of ${fc(ex1.monthlyContribution)}. You will contribute ${f(ex1.totalContributed)} in total (current savings plus every monthly contribution), earn ${f(ex1.growthFromReturns)} in growth from returns, and end with ${f(ex1.finalAmount)}.`,
  },
  {
    question: "How long will it take to save a million dollars?",
    answer:
      `It depends on your monthly contribution and your assumed return. Starting from $0 at a 7.00% annual return, the calculator above shows that $500 per month reaches $1,000,000 in ${t2_500.years} years and ${t2_500.remainingMonths} months; $1,000 per month reaches it in ${t2_1000.years} years and ${t2_1000.remainingMonths} months; and $2,000 per month reaches it in ${t2_2000.years} years and ${t2_2000.remainingMonths} months. Switch to the "How long will it take" tab above and enter your own goal, current savings, contribution, and rate to see your timeline and the calendar month and year you would reach it.`,
  },
  {
    question: "Does the calculator compound monthly or annually?",
    answer:
      "Monthly. The calculator divides the annual return by 12 to get a monthly rate and applies it every month. Contributions are added at the end of each month (an ordinary annuity). This matches how most savings accounts and many investment projections work, and it is slightly conservative versus annual compounding because each contribution starts earning interest in the month it is made.",
  },
  {
    question: "What return rate should I enter?",
    answer:
      "It depends on where the money will live. A high-yield savings account might pay around 4 to 5 percent in a high-rate environment and can drop near zero when the Federal Reserve cuts rates. A diversified stock and bond portfolio is often modeled at a long-term historical real return around 5 to 7 percent, but actual returns vary every year and can be negative. Use a conservative number for must-hit goals (a down payment you need in two years) and a higher, growth-oriented assumption for long-horizon goals (retirement decades away). The rate is an assumption, not a guarantee.",
  },
  {
    question: "What if my current savings already exceed my goal?",
    answer:
      "The calculator tells you so. In the How-much-per-month tab, if your current savings grown forward at the entered rate already reaches the goal within the term, the required monthly contribution shows as $0.00 and a note explains that no additional contribution is needed. In the How-long-will-it-take tab, the time to goal shows as zero months and the target date is today.",
  },
];

/* ─── Page Component ─── */

export default function SavingsGoalPage() {
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
          { name: "Savings Goal Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Savings Goal Calculator"
        description="Free online savings goal calculator. See how much to save per month to reach any goal, or how long your current monthly savings will take to get there, with monthly compounding."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Savings Calculators", href: "/savings" },
          { label: "Savings Goal Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Savings Goal Calculator
      </h1>

      {/* Intro paragraph (first ~100 words answer the primary keyword) */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A savings goal calculator answers two questions: how much to save per
        month to hit a target by a set date, or how long your current monthly
        savings will take to get there. Starting from $5,000 and aiming for
        $50,000 in 5 years at a 4.00% annual return, you need to save{" "}
        <strong>{fc(ex1.monthlyContribution)} per month</strong>. You will
        contribute {f(ex1.totalContributed)} in total and earn{" "}
        {f(ex1.growthFromReturns)} in growth from returns. Enter your own
        goal, current savings, timeline, and rate above to see your number.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <SavingsGoalCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Savings Goal Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Savings Goal Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A savings goal calculator takes four inputs: a target dollar
            amount, what you have saved today, a monthly contribution or a time
            horizon, and an assumed annual return. It then answers one of two
            questions. Pick &quot;How much per month&quot; and the calculator
            solves for the level monthly contribution that hits the goal exactly
            by the end of the term. Pick &quot;How long will it take&quot; and it
            solves for the number of months until the growing balance first
            reaches the goal, then converts that into years and months and
            names the calendar month and year you would cross the finish line.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Both tabs share the same engine and the same monthly compounding,
            so the answers are consistent with each other. Switch tabs and your
            goal, current savings, and rate carry over, so you can test a
            monthly amount and a timeline back to back without re-entering the
            shared inputs. Every result also shows total contributed, growth
            from returns, and final amount, so you can see how much of the goal
            comes from saving versus compounding.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How the Savings Goal Calculation Works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How the Savings Goal Calculation Works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Both tabs use the standard future-value formula with monthly
            compounding. Let <strong>i</strong> be the monthly rate (annual
            rate divided by 12) and <strong>n</strong> be the number of months.
            The balance after n months, starting from current savings and
            adding a level monthly contribution M, is{" "}
            <strong>FV = current &times; (1+i)<sup>n</sup> + M &times;
            ((1+i)<sup>n</sup> &minus; 1) &divide; i</strong>. The first term
            is your starting savings grown forward; the second is the future
            value of the stream of monthly contributions (an ordinary annuity).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The two tabs solve this same equation in different directions. The
            &quot;How much per month&quot; tab fixes n (your years to goal
            times 12) and solves for M:{" "}
            <strong>M = (goal &minus; current &times; (1+i)<sup>n</sup>)
            &times; i &divide; ((1+i)<sup>n</sup> &minus; 1)</strong>. The
            &quot;How long will it take&quot; tab fixes M and solves for n:{" "}
            <strong>n = ln((goal + M&divide;i) &divide; (current + M&divide;i))
            &divide; ln(1+i)</strong>, then rounded up to the next whole month
            so the balance actually reaches the goal. When the rate is zero,
            both directions degenerate to plain arithmetic: M = (goal
            &minus; current) &divide; n, or n = (goal &minus; current)
            &divide; M, with no divide-by-zero.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $50,000 Goal from $5,000 in 5 Years at 4.00%
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monthly rate i = 0.04 &divide; 12 = 0.003333. Number of months
                n = 5 &times; 12 = 60. (1+i)<sup>n</sup> &asymp; 1.2210.
                Current savings grown forward = $5,000 &times; 1.2210 ={" "}
                <strong>{f(ex1_currentGrown)}</strong>. Gap to goal = $50,000
                &minus; <strong>{f(ex1_currentGrown)}</strong> ={" "}
                <strong>{f(ex1_gap)}</strong>. Annuity factor
                ((1+i)<sup>n</sup> &minus; 1) &divide; i &asymp; 66.30.
                Required monthly = gap &divide; factor ={" "}
                <strong>{fc(ex1.monthlyContribution)}</strong>. Total
                contributed = $5,000 + {fc(ex1.monthlyContribution)} &times; 60
                = <strong>{f(ex1.totalContributed)}</strong>. Growth from
                returns = <strong>{f(ex1.growthFromReturns)}</strong>. Final
                amount = <strong>{f(ex1.finalAmount)}</strong>. Every figure
                matches the calculator above.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: How Long to Save a Million Dollars */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Long to Save a Million Dollars
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The &quot;How long will it take&quot; tab answers this directly.
            Starting from $0 and earning a 7.00% annual return (a common
            long-term assumption for a diversified portfolio, and an
            assumption, not a guarantee), the calculator produces the following
            timelines for three monthly contribution levels. Each row shows
            how many months it takes, expressed in years and months, plus the
            total you actually contributed and the dollar amount of growth that
            got you the rest of the way.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3">
                Time to $1,000,000 from $0 at 7.00% Annual Return
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">Monthly Contribution</th>
                      <th className="text-right py-2 px-4 font-medium">Time to Goal</th>
                      <th className="text-right py-2 px-4 font-medium">Total Contributed</th>
                      <th className="text-right py-2 pl-4 font-medium">Growth from Returns</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 tabular-nums">$500</td>
                      <td className="py-2 px-4 text-right tabular-nums">{t2_500.years} yr {t2_500.remainingMonths} mo</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(t2_500.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(t2_500.growthFromReturns)}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 tabular-nums">$1,000</td>
                      <td className="py-2 px-4 text-right tabular-nums">{t2_1000.years} yr {t2_1000.remainingMonths} mo</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(t2_1000.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(t2_1000.growthFromReturns)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 tabular-nums">$2,000</td>
                      <td className="py-2 px-4 text-right tabular-nums">{t2_2000.years} yr {t2_2000.remainingMonths} mo</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(t2_2000.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(t2_2000.growthFromReturns)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Growth from returns is the difference between the final balance
                (just over $1,000,000 in each row) and the total contributed.
                Doubling the contribution from $500 to $1,000 cuts the timeline
                from {t2_500.years} years and {t2_500.remainingMonths} months
                to {t2_1000.years} years and {t2_1000.remainingMonths} months.
                That is not in half, because more of the work is done by
                contributions and less by compounding.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            A 7.00% return is a long-term assumption for a growth-oriented
            portfolio, not a promise. Real returns swing every year and can be
            negative. The point of the table is the shape of the relationship
            between contributions and time, not a forecast of what you will
            actually earn. Run your own numbers in the calculator above with a
            rate that matches where your money will actually live.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much to Save Per Month to Reach My Goal */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much to Save Per Month to Reach My Goal
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The &quot;How much per month&quot; tab flips the question: instead
            of asking how long a fixed contribution takes, it asks what level
            monthly contribution hits the goal in a fixed term. The closed-form
            answer is M = (goal &minus; current &times; (1+i)<sup>n</sup>)
            &times; i &divide; ((1+i)<sup>n</sup> &minus; 1), with i equal to
            the annual rate divided by 12 and n equal to the term in months.
            The shorter the runway, the larger the required monthly amount,
            because there is less time for compounding to do the work.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Two illustrations from the same engine, both starting from $0 and
            targeting $1,000,000 at a 7.00% annual return. With 30 years to
            go, the required monthly contribution is{" "}
            <strong>{fc(m_30y.monthlyContribution)}</strong>, with total
            contributed {f(m_30y.totalContributed)} and growth from returns{" "}
            {f(m_30y.growthFromReturns)}. Compress the runway to 20 years and
            the required monthly jumps to{" "}
            <strong>{fc(m_20y.monthlyContribution)}</strong>, with total
            contributed {f(m_20y.totalContributed)} and growth from returns{" "}
            {f(m_20y.growthFromReturns)}. Cutting the term by a third more than
            doubles the required monthly contribution, because you lose both
            the years of contributions and the years of compounding on the
            earlier contributions.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Save a Million Dollars Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Save a Million Dollars Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The table below shows the required monthly contribution to reach
            $1,000,000 from $0 at a 7.00% annual return across four time
            horizons, all computed by the same engine that powers the
            calculator above. The pattern is what matters: every extra decade
            you give yourself roughly halves the required monthly contribution,
            because compounding has more time to work.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3">
                Monthly Contribution to Reach $1,000,000 from $0 at 7.00%
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">Time Horizon</th>
                      <th className="text-right py-2 px-4 font-medium">Required Monthly</th>
                      <th className="text-right py-2 px-4 font-medium">Total Contributed</th>
                      <th className="text-right py-2 pl-4 font-medium">Growth from Returns</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 tabular-nums">10 years</td>
                      <td className="py-2 px-4 text-right tabular-nums">{fc(m_10y.monthlyContribution)}</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(m_10y.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(m_10y.growthFromReturns)}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 tabular-nums">20 years</td>
                      <td className="py-2 px-4 text-right tabular-nums">{fc(m_20y.monthlyContribution)}</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(m_20y.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(m_20y.growthFromReturns)}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 tabular-nums">30 years</td>
                      <td className="py-2 px-4 text-right tabular-nums">{fc(m_30y.monthlyContribution)}</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(m_30y.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(m_30y.growthFromReturns)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 tabular-nums">40 years</td>
                      <td className="py-2 px-4 text-right tabular-nums">{fc(m_40y.monthlyContribution)}</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(m_40y.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(m_40y.growthFromReturns)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Growth from returns is final amount ($1,000,000 in every row)
                minus total contributed. At 40 years, more than 80% of the
                final balance comes from returns; at 10 years, less than a
                third does.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Do I Need to Save Each Month */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Do I Need to Save Each Month
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The general formula for the required monthly contribution is{" "}
            <strong>M = (goal &minus; current &times; (1+i)<sup>n</sup>)
            &times; i &divide; ((1+i)<sup>n</sup> &minus; 1)</strong>, with i
            equal to your assumed annual return divided by 12 and n equal to
            the number of months until the goal. If your current savings grown
            forward at the assumed rate already exceeds the goal, the formula
            returns zero (or a negative number that the calculator clamps to
            zero). If the rate is zero, the formula simplifies to M = (goal
            &minus; current) &divide; n.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Picking a rate assumption is the most consequential input. Money in
            a high-yield savings account or a certificate of deposit earns a
            stated APY that you can read off the bank&apos;s rate sheet. In
            a high-rate environment that might be around 4 to 5 percent, and
            it can fall quickly when the Federal Reserve cuts rates. Money in
            a diversified portfolio of stocks and bonds does not have a stated
            rate; long-term historical averages are often modeled around 5 to
            7 percent real, but actual yearly returns swing widely and can be
            negative. For must-hit goals with a short horizon (a down payment
            you need in two years), use the rate a savings account or CD
            actually pays, because investment volatility could leave you short.
            For long-horizon goals (retirement decades away), a growth-oriented
            assumption is reasonable, but understand it is an assumption, not a
            forecast.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whichever rate you choose, treat the output as a plan, not a
            prediction. The calculator uses future value, compound growth,
            monthly contribution, time horizon, and rate of return as the
            working vocabulary; the target date in the &quot;How long will it
            take&quot; tab is the month and year the balance first crosses your
            goal, assuming your inputs hold exactly. Real life will not match
            the assumption line for line, so revisit your inputs whenever your
            rate, your contributions, or your goal changes.
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
            hub. If you are weighing whether to break a CD to free up cash for
            your goal, the{" "}
            <a
              href="/savings/cd-early-withdrawal-penalty-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              CD Early Withdrawal Penalty Calculator
            </a>{" "}
            shows the penalty in dollars, your net proceeds, and whether
            breaking the CD beats keeping it to maturity. To see whether your
            savings put you ahead of or behind the typical household your age,
            the{" "}
            <a
              href="/savings/net-worth-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Net Worth by Age Calculator
            </a>{" "}
            compares your number to the median and average for your age bracket
            from the Federal Reserve&apos;s 2022 Survey of Consumer Finances.
          </p>
        </section>
      </div>
    </div>
  );
}
