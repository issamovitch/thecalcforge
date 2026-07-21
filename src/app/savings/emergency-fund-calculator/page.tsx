import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import EmergencyFundCalculator from "@/components/calculators/EmergencyFundCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";
import { calculateEmergencyFund } from "@/lib/emergency-fund-math";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/savings/emergency-fund-calculator`;
const pageTitle =
  "Emergency Fund Calculator – How Much You Need";
const pageDescription =
  "Free emergency fund calculator. See how much you need based on your monthly expenses, and how long it will take to build at your savings pace.";

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

// Default worked example: $3,500 expenses, 6 months, $2,000 current, $400/mo, 4.00%
const ex = calculateEmergencyFund({
  monthlyExpenses: 3500,
  months: 6,
  currentSavings: 2000,
  monthlySavings: 400,
  annualRate: 0.04,
});

// How long to build a $21,000 fund from $0 at 4.00% at three monthly paces
const build_200 = calculateEmergencyFund({
  monthlyExpenses: 3500, months: 6, currentSavings: 0, monthlySavings: 200, annualRate: 0.04,
});
const build_400 = calculateEmergencyFund({
  monthlyExpenses: 3500, months: 6, currentSavings: 0, monthlySavings: 400, annualRate: 0.04,
});
const build_800 = calculateEmergencyFund({
  monthlyExpenses: 3500, months: 6, currentSavings: 0, monthlySavings: 800, annualRate: 0.04,
});

/* ─── FAQ Data ─── */

const faqs = [
  {
    question: "How much emergency fund do I need?",
    answer:
      `Multiply your monthly essential expenses by the number of months you want the fund to cover. With $3,500 in essential monthly expenses and a 6-month target, your emergency fund goal is ${f(ex.target)}. The calculator above computes this directly from your expense input and your chosen coverage period, then shows the remaining gap after your current savings and the exact time to reach the target at your monthly savings pace and assumed APY.`,
  },
  {
    question: "How many months of expenses should I save for emergencies?",
    answer:
      "A common convention is three to six months of essential expenses. Three months is defensible when you have dual stable incomes, low fixed costs, and a short list of dependents. Six to twelve months fits better for a single income, variable or commission income, dependents, health conditions, or homeownership where a major repair can run thousands of dollars. The calculator above lets you slide the coverage period from 3 to 12 months so you can see how the target changes with your circumstances.",
  },
  {
    question: "How long will it take to build my emergency fund?",
    answer:
      `It depends on your starting balance, your monthly contribution, and the APY you earn. Starting from $2,000 and targeting ${f(ex.target)} at $400 per month and a 4.00% APY, the calculator shows you reach the target in ${ex.years} years and ${ex.remainingMonths} months. Starting from $0, the same target at $200 per month takes ${build_200.years} years and ${build_200.remainingMonths} months, at $400 per month it takes ${build_400.years} years and ${build_400.remainingMonths} months, and at $800 per month it takes ${build_800.years} years and ${build_800.remainingMonths} months. Enter your own numbers above for your exact timeline.`,
  },
  {
    question: "Should I count my full income or just essential expenses?",
    answer:
      "Essential expenses, not full income. The fund exists to keep a roof over your head, the lights on, and food on the table during a stretch with no income. Discretionary spending such as dining out, entertainment, vacations, and non-essential shopping drops to zero in a true emergency, so it should not be part of the target. The calculator asks for monthly essential expenses (rent or mortgage, utilities, groceries, transportation, insurance, and minimum debt payments) and multiplies that by your chosen coverage period.",
  },
  {
    question: "Where should I keep my emergency fund?",
    answer:
      "In a liquid, FDIC-insured account where you can withdraw the money within a day or two without penalty. A high-yield savings account or a money market account at a bank or credit union is the standard choice. Avoid investing the fund in stocks, because a market drop can hit at the same moment you lose your job (sequence risk). Avoid locking it in a CD, because breaking a CD early triggers a penalty that eats into your principal. If you are weighing whether to break a CD to access cash, the CD Early Withdrawal Penalty Calculator shows the penalty in dollars.",
  },
];

/* ─── Page Component ─── */

export default function EmergencyFundPage() {
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
          { name: "Emergency Fund Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Emergency Fund Calculator"
        description="Free online emergency fund calculator. See how much you need based on your monthly essential expenses, and how long it will take to build at your savings pace, with monthly compounding."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Savings Calculators", href: "/savings" },
          { label: "Emergency Fund Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Emergency Fund Calculator
      </h1>

      {/* Intro paragraph (first ~100 words answer the primary keyword) */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        An emergency fund calculator tells you how big a financial cushion you
        need and how long it will take to build it. With $3,500 in monthly
        essential expenses and a 6-month coverage target, your goal is{" "}
        <strong>{f(ex.target)}</strong>. Starting from $2,000 already saved and
        adding $400 per month at a 4.00% APY, you reach that target in{" "}
        <strong>{ex.years} years and {ex.remainingMonths} months</strong>. The
        remaining gap is {f(ex.gap)}, and compounding contributes about{" "}
        {f(ex.growthFromReturns)} of the growth while you save. Enter your own
        expenses, current savings, and monthly pace above to see your timeline
        and target date.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <EmergencyFundCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Emergency Fund Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Emergency Fund Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An emergency fund calculator takes your monthly essential expenses,
            multiplies them by the number of months you want the fund to cover,
            and tells you the target dollar amount. It then subtracts what you
            already have saved to show the remaining gap, and uses the same
            monthly-compounding math as the{" "}
            <a
              href="/savings/savings-goal-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Savings Goal Calculator
            </a>{" "}
            to compute the exact number of months it will take to close that gap
            at your savings pace and assumed APY. The result is a single target
            number, a gap, a timeline, and the calendar month and year you
            would reach it.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The inputs are deliberately simple. Monthly essential expenses are
            the bills you must pay every month to keep your household running:
            rent or mortgage, utilities, groceries, transportation, insurance,
            and minimum debt payments. Months of coverage is how long the fund
            should bridge if your income stopped tomorrow. Current savings is
            what you have set aside today. Monthly savings is how much you add
            each month. The APY is the rate your emergency-fund account
            actually pays, compounded monthly. The optional category breakdown
            lets you itemize expenses so the total is built from real line
            items instead of a guess.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $3,500 Expenses, 6-Month Target, $2,000 Saved
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Target = $3,500 &times; 6 = <strong>{f(ex.target)}</strong>.
                Gap = {f(ex.target)} &minus; $2,000 ={" "}
                <strong>{f(ex.gap)}</strong>. At $400 per month and a 4.00% APY
                (monthly rate i = 0.04 &divide; 12 = 0.003333), the
                solve-for-months formula gives n ={" "}
                <strong>{ex.months} months</strong> ({ex.years} years and{" "}
                {ex.remainingMonths} months). Total contributed by then = $2,000
                + $400 &times; {ex.months} ={" "}
                <strong>{f(ex.totalContributed)}</strong>. Growth from returns
                = <strong>{f(ex.growthFromReturns)}</strong>. Final balance when
                the target is reached ={" "}
                <strong>{f(ex.finalAmount)}</strong>. Every figure matches the
                calculator above.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Emergency Fund Do I Need */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Emergency Fund Do I Need
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The size of your emergency fund depends on how long you expect an
            income gap to last and how much it costs to run your household
            during that gap. The standard convention is three to six months of
            essential expenses. Three months is defensible when you have dual
            stable incomes, low fixed costs, no dependents, and a strong
            professional network that shortens a job search. Six months fits a
            single income, variable or commission income, one or more
            dependents, a health condition, or a profession with a longer
            typical job search. Twelve months is worth considering when your
            income is highly variable, you are self-employed, or you carry a
            large mortgage and property-tax burden where a single missed
            payment has serious consequences.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The calculator above lets you slide the coverage period from 3 to
            12 months and instantly see the target change. With $3,500 in
            monthly essential expenses, the 3-month target is{" "}
            <strong>{f(ex.target3)}</strong>, the 6-month target is{" "}
            <strong>{f(ex.target6)}</strong>, and the 12-month target is{" "}
            <strong>{f(ex.target12)}</strong>. Those three numbers appear in the
            strip below the calculator so you can compare the most common
            targets side by side from the same expense base. The right size is
            not a universal number; it is a function of your income stability,
            your fixed costs, and the downside risk you are insuring against.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Many Months of Expenses Should I Save */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Many Months of Expenses Should I Save
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The unit is expenses, not income, and the distinction matters. If
            you earn $6,000 a month but your essential bills are $3,500, your
            emergency fund needs to cover $3,500 a month, not $6,000. The fund
            replaces the spending you cannot cut, not the income you are used
            to. In a real emergency you stop dining out, cancel subscriptions,
            and defer discretionary purchases, so including those costs in your
            target over-saves by the amount of your discretionary spending.
            Using expenses keeps the target as lean as it needs to be to do its
            job, which means you reach it sooner and can redirect money to
            other goals sooner.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3">
                Emergency Fund Targets at Three Monthly Expense Levels
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">Monthly Essential Expenses</th>
                      <th className="text-right py-2 px-3 font-medium">3 Months</th>
                      <th className="text-right py-2 px-3 font-medium">6 Months</th>
                      <th className="text-right py-2 pl-3 font-medium">12 Months</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 tabular-nums">$2,500</td>
                      <td className="py-2 px-3 text-right tabular-nums">{f(2500 * 3)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{f(2500 * 6)}</td>
                      <td className="py-2 pl-3 text-right tabular-nums">{f(2500 * 12)}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 tabular-nums">$3,500</td>
                      <td className="py-2 px-3 text-right tabular-nums">{f(3500 * 3)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{f(3500 * 6)}</td>
                      <td className="py-2 pl-3 text-right tabular-nums">{f(3500 * 12)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 tabular-nums">$5,000</td>
                      <td className="py-2 px-3 text-right tabular-nums">{f(5000 * 3)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{f(5000 * 6)}</td>
                      <td className="py-2 pl-3 text-right tabular-nums">{f(5000 * 12)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Each target is the monthly expense figure times the coverage
                period. The same products drive the calculator above: change the
                expense input or the months slider and every figure updates.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The table shows that doubling expenses doubles every target, and
            doubling the coverage period doubles each target for a given
            expense level. The two inputs are independent and multiplicative,
            so a household with $5,000 in essential expenses that wants 12
            months of coverage needs a fund four times larger than a household
            with $2,500 in expenses and a 3-month target. Use the calculator
            above with your own expense figure and preferred coverage period to
            get your exact number.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Long to Build an Emergency Fund */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Long to Build an Emergency Fund
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Once you know your target, the next question is how long it takes
            to get there. The calculator uses the same closed-form solve-for-n
            math as the Savings Goal Calculator: it finds the exact month the
            growing balance first reaches your target, accounting for your
            starting savings, your monthly contribution, and the APY you earn,
            all compounded monthly. The table below shows the time to build a{" "}
            {f(ex.target)} fund from $0 at a 4.00% APY at three monthly savings
            paces.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3">
                Time to Build {f(ex.target)} from $0 at 4.00% APY
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium">Monthly Savings</th>
                      <th className="text-right py-2 px-4 font-medium">Time to Target</th>
                      <th className="text-right py-2 px-4 font-medium">Total Contributed</th>
                      <th className="text-right py-2 pl-4 font-medium">Growth from Returns</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 tabular-nums">$200</td>
                      <td className="py-2 px-4 text-right tabular-nums">{build_200.years} yr {build_200.remainingMonths} mo</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(build_200.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(build_200.growthFromReturns)}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pr-4 tabular-nums">$400</td>
                      <td className="py-2 px-4 text-right tabular-nums">{build_400.years} yr {build_400.remainingMonths} mo</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(build_400.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(build_400.growthFromReturns)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 tabular-nums">$800</td>
                      <td className="py-2 px-4 text-right tabular-nums">{build_800.years} yr {build_800.remainingMonths} mo</td>
                      <td className="py-2 px-4 text-right tabular-nums">{f(build_800.totalContributed)}</td>
                      <td className="py-2 pl-4 text-right tabular-nums">{f(build_800.growthFromReturns)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Doubling the monthly contribution from $200 to $400 cuts the
                timeline from {build_200.years} years and {build_200.remainingMonths}{" "}
                months to {build_400.years} years and {build_400.remainingMonths}{" "}
                months. Doubling again to $800 cuts it to {build_800.years} years
                and {build_800.remainingMonths} months. More contribution does
                more work than compounding at these short horizons.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            A practical note: pausing contributions does not restart the clock
            from zero. The balance you have already built keeps earning
            interest every month, so when you resume contributions you are
            adding to a larger base than when you started. That is the upside of
            keeping the fund in an interest-bearing account rather than under
            the mattress. The calculator accounts for this automatically: the
            solve-for-n formula treats your current savings as a growing
            starting balance, not a static one.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: 6 Month Emergency Fund Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            6 Month Emergency Fund Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A 6-month emergency fund is the most common target, and the math is
            direct: take your monthly essential expenses and multiply by six.
            With $3,500 in essential expenses, a 6-month fund is{" "}
            <strong>{f(ex.target6)}</strong>. Set the months slider to 6 in the
            calculator above and that is the number you will see, with the gap
            and timeline computed from your current savings and monthly pace.
            The 6-month target is the default because it covers the median
            duration of an unemployment spell for many households while staying
            achievable for people who do not have the income to fund a full year
            of expenses in a savings account.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            What counts as essential for the 6-month target is the same list
            the calculator uses: rent or mortgage, utilities (electricity, gas,
            water, internet, phone), groceries, transportation (car payment,
            gas, insurance, or transit), health and property insurance
            premiums, and minimum payments on credit cards and loans. What
            drops out in an emergency is discretionary spending: dining out,
            entertainment, subscriptions, vacations, clothing beyond
            essentials, and gifts. The optional category breakdown in the
            calculator above lets you itemize these essential lines so your
            total is built from real bills rather than a rough estimate.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Where you keep the fund matters as much as the size. The money
            needs to be liquid and accessible within a day or two, so a
            high-yield savings account or a money market account at an
            FDIC-insured bank or NCUA-insured credit union is the standard
            choice. Do not invest the fund in stocks: a market downturn can
            hit at the same moment you lose your income, forcing you to sell at
            a loss to pay rent (sequence risk). Do not lock it in a CD: breaking
            a CD early triggers a penalty that can eat into your principal. If
            you are weighing whether to break an existing CD to free up cash for
            emergencies, the{" "}
            <a
              href="/savings/cd-early-withdrawal-penalty-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              CD Early Withdrawal Penalty Calculator
            </a>{" "}
            shows the penalty in dollars and whether reinvesting the net
            proceeds at a higher rate beats keeping the CD to maturity.
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
            hub. If you are working toward a specific savings target beyond your
            emergency fund, the{" "}
            <a
              href="/savings/savings-goal-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Savings Goal Calculator
            </a>{" "}
            solves for the monthly contribution or the time to reach any dollar
            goal. To see whether your savings put you ahead of or behind the
            typical household your age, the{" "}
            <a
              href="/savings/net-worth-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Net Worth by Age Calculator
            </a>{" "}
            compares your number to the median and average for your age bracket
            from the Federal Reserve&apos;s 2022 Survey of Consumer Finances.
            And if carrying high-interest debt is competing with your ability
            to build the fund, the{" "}
            <a
              href="/debt/debt-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Payoff Calculator
            </a>{" "}
            shows the fastest path to clear it.
          </p>
        </section>
      </div>
    </div>
  );
}
