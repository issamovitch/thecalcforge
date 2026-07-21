import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import DebtPayoffCalculator from "@/components/calculators/DebtPayoffCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/debt/debt-payoff-calculator`;
const pageTitle = "Debt Payoff Calculator – Snowball & Avalanche";
const pageDescription =
  "Free debt payoff calculator. Compare snowball vs avalanche, add extra payments, and see your exact debt-free date. Instant, accurate results.";

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
    question: "What is the difference between debt avalanche and debt snowball?",
    answer:
      "Avalanche targets highest APR first (saves most interest), snowball targets lowest balance first (psychological wins). Avalanche is mathematically optimal. Snowball works better for people who need quick wins to stay motivated. Both require paying at least the minimum on all debts.",
  },
  {
    question: "How does extra monthly payment affect debt payoff?",
    answer:
      "Extra payments go toward the priority debt after all minimums are covered. This reduces the principal faster, which reduces future interest charges. Even small extra amounts compound: $100/month extra on a $10,000 credit card at 22.9% APR can cut roughly 25 months and save over $2,600 in interest.",
  },
  {
    question:
      "How long does it take to pay off $10,000 in credit card debt?",
    answer:
      "At 22.9% APR with a $250 monthly minimum payment, paying off $10,000 in credit card debt takes approximately 62 months (over 5 years) and costs about $5,400 in interest, for a total of roughly $15,400. Adding $100 extra per month shortens it to about 37 months and saves over $2,600 in interest.",
  },
  {
    question: "How is the debt-free date calculated?",
    answer:
      "The calculator starts from the current month and adds the total number of months computed by the payoff engine. For example, if the engine determines 28 months of payments and today is July 2026, the projected debt-free date is November 2028. Extra payments reduce the total months and move the date forward. The date is a projection based on fixed rates and fixed payment amounts.",
  },
  {
    question:
      "Can I use this calculator for multiple credit cards and loans?",
    answer:
      "Yes. Add each debt as a separate row with its name, balance, APR, and minimum payment. The calculator handles any combination of credit cards, personal loans, student loans, auto loans, and medical debt. It pays the minimum on every debt each month and directs any extra payment to the priority debt based on your chosen method (snowball or avalanche). As each debt is paid off, its minimum payment rolls to the next debt, accelerating your payoff.",
  },
];

/* ─── Page Component ─── */

export default function DebtPayoffCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: "Debt Calculators",
            url: `${siteConfig.url}/debt`,
          },
          { name: "Debt Payoff Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Debt Payoff Calculator"
        description="Free online debt payoff calculator. Compare snowball vs avalanche strategies, add extra payments, and see your exact debt-free date with a full month-by-month schedule."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Debt Calculators", href: "/debt" },
          { label: "Debt Payoff Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Debt Payoff Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A debt payoff calculator shows you exactly when you will become
        debt-free by analyzing each balance, interest rate, and minimum payment
        you enter. It runs two popular payoff strategies, snowball and
        avalanche, so you can compare total interest saved and pick the
        approach that fits your goals. You can also add an extra monthly
        payment to see how even a small amount shortens your timeline and
        reduces the total cost of borrowing.
      </p>

      {/* Calculator (client component, SSR with default values, no Suspense) */}
      <div className="mt-8">
        <DebtPayoffCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Debt Avalanche vs Snowball Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Debt Avalanche vs Snowball Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The two most widely recommended payoff strategies differ in how
            they sort your debts, and the sorting logic directly determines
            how much interest you pay over time.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Debt avalanche</strong> sorts every balance by APR in
            descending order and attacks the highest-rate debt first. Mathematically,
            this minimizes total interest because the balance accruing the most
            expensive interest shrinks fastest. After that debt is eliminated, its
            minimum payment is freed up and added to the next-highest-APR debt,
            and so on.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Debt snowball</strong> sorts by balance in ascending order and
            targets the smallest debt first. The idea is behavioral: knocking out a
            small balance quickly creates momentum and motivation to keep going. The
            tradeoff is that you may pay more total interest than avalanche, because a
            low-balance, low-rate card might be prioritized over a high-rate card with
            a larger balance.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This calculator runs both strategies simultaneously, so you can
            compare the total months, total interest paid, and final debt-free
            date side by side before committing to a payoff plan.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Debt Snowball Calculator with Extra Payment */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Debt Snowball Calculator with Extra Payment
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Adding an extra monthly payment to the snowball method accelerates
            every debt in the chain. Here is how the math works: after covering
            all minimum payments, the remaining budget goes entirely to the
            smallest balance. That extra amount reduces the principal faster,
            which means less interest accrues next month, which means even
            more of the next payment goes to principal.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            When the smallest debt reaches zero, two things happen. First, you
            no longer owe its minimum payment. Second, that freed-up minimum
            is added to the extra payment pool and redirected to the new
            smallest balance. This compounding effect is why extra payments
            feel slow at first and then accelerate dramatically toward the end
            of your plan.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">Snowball Extra Payment Example</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Three debts: Card A ($2,000 at 19%), Card B ($5,000 at 24%),
                Card C ($8,000 at 15%). Minimums total $350. With $150 extra,
                Card A receives $200/month (its $50 minimum plus $150 extra)
                and is paid off in roughly 11 months. In month 12, that $200
                rolls to Card B, which now gets $350/month. After Card B is
                cleared, all $580 goes to Card C. The final months are
                significantly shorter than if you had paid only minimums.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The calculator handles this waterfall automatically. You enter
            your extra budget once, and the engine distributes it correctly
            for every month of the schedule.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Long to Pay Off $10,000 Credit Card Debt */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Long to Pay Off $10,000 Credit Card Debt
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To illustrate how the numbers work in practice, consider a single
            credit card with a $10,000 balance and a 22.9% APR. The monthly
            rate is 1.9083%. With a minimum payment of $250 per month, the
            first month charges $190.83 in interest and applies only $59.17
            toward principal. This slow start means the balance lingers for a
            long time.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Paying $250/month only:</strong> At this pace, paying off
            $10,000 in credit card debt takes approximately 62 months (just
            over 5 years). Total interest paid is roughly $5,400, bringing
            the overall cost to about $15,400.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Adding $100 extra ($350/month):</strong> The extra payment
            goes straight to principal each month. At $350/month, the payoff
            timeline drops to approximately 37 months (just over 3 years) and
            total interest falls to roughly $2,800. That extra $100 per month
            saves you about $2,600 in interest and eliminates 25 months of
            payments.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The gap widens further with larger extra payments or higher rates.
            Use the calculator above to model your own balances and see the
            exact numbers for your situation.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Debt Free Date Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Debt Free Date Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The debt-free date is a projection computed by adding the total
            number of payoff months to the current calendar month. The engine
            works backward: it first determines how many months are required
            to reduce every balance to zero given your payment amounts and
            rates, then it counts forward from today to produce a specific
            target date.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Extra payments shift this date forward because they reduce the
            number of months in the schedule. For instance, if a no-extra
            plan shows a debt-free date of March 2031, adding $200/month
            might pull that date back to June 2029, saving nearly two years
            of payments. The calculator shows the date for both the snowball
            and avalanche strategies so you can see which method gets you
            there sooner.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Keep in mind that the date assumes fixed rates and fixed payment
            amounts. If your card issuer changes your APR or your minimum
            payment, the actual date could differ. The projection is most
            accurate for fixed-rate debts like personal loans and less
            precise for variable-rate credit cards over long timelines.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Credit Card Debt Payoff Calculator Multiple Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Credit Card Debt Payoff Calculator Multiple Cards
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            When you have more than one card, the payoff engine follows a
            specific allocation order every month. First, it pays the minimum
            required amount on every single debt to keep all accounts current
            and avoid penalties. Then, it takes whatever budget remains (your
            minimums plus any extra payment you specified) and directs 100% of
            it to the priority debt based on your chosen method.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The key moment comes when a card is fully paid off. At that point,
            two things change: the minimum payment you were sending to that
            card is freed up, and the extra payment you were applying to it is
            also freed up. Both amounts are added together and redirected to
            the next debt in the priority order. This is often called the
            "waterfall" or "snowball" effect, because your payment power grows
            with each card eliminated.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">How the Waterfall Works</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Suppose you have four cards with minimums totaling $400 and
                you add $200 extra. The priority card gets its $75 minimum
                plus $200 extra ($275 total). Once that card is paid off, the
                next card now receives its own $100 minimum plus the freed-up
                $275, for a total of $375 per month. After the second card
                is gone, the third gets $475, and so on. Each payoff
                accelerates the next one.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The calculator supports credit cards, personal loans, student
            loans, auto loans, and medical debt in any combination. Enter each
            debt separately with its balance, APR, and minimum, then choose
            snowball or avalanche to see the optimized schedule.
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
              href="/debt"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Calculators
            </a>{" "}
            hub, or explore our{" "}
            <a
              href="/loans/debt-consolidation-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Consolidation Calculator
            </a>{" "}
            to see whether a single consolidation loan saves you money compared
            to keeping your debts separate. Additional tools coming soon
            include the{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>
            ,{" "}
            <a
              href="/debt/credit-card-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Credit Card Payoff Calculator
            </a>
            ,{" "}
            <a
              href="/debt/credit-card-minimum-payment-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Credit Card Minimum Payment Calculator
            </a>
            , and{" "}
            <a
              href="/debt/balance-transfer-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Balance Transfer Calculator
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
