import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import CreditCardPayoffCalculator from "@/components/calculators/CreditCardPayoffCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/debt/credit-card-payoff-calculator`;
const pageTitle =
  "Credit Card Payoff Calculator - Interest & Time | CalcForge";
const pageDescription =
  "Free credit card payoff calculator. See how long to clear your balance, total interest, and how much faster extra or fixed payments get you debt-free.";

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
    question: "How is credit card interest calculated?",
    answer:
      "Daily periodic rate = APR / 365. Each day, interest = balance x daily rate. Charges compound daily. Monthly interest shown on statements is the sum of 30-31 days of daily compounding. This is why paying mid-cycle saves money: it reduces the average daily balance.",
  },
  {
    question: "What happens if I only pay the minimum on my credit card?",
    answer:
      "Most issuers set minimum at 1-3% of balance or $25-35 floor. At typical APRs (20-25%), most of the minimum covers interest with very little going to principal. A $5,000 balance at 22% APR with 2% minimum takes about 22 years and costs roughly $4,300 in interest. You end up paying nearly double the original charges.",
  },
  {
    question:
      "Should I use the snowball or avalanche method for credit cards?",
    answer:
      "Avalanche (highest APR first) always saves the most in total interest. Snowball (smallest balance first) provides faster psychological wins. For credit cards specifically, avalanche is often more impactful because APR differences between cards can be significant (e.g., 28% vs 15%), making the interest savings substantial.",
  },
  {
    question: "Does paying off credit cards improve credit score?",
    answer:
      "Paying down credit card balances lowers your credit utilization ratio (balance / credit limit), which is the second-largest factor in your FICO score (30% weight). Reducing utilization below 30%, and ideally below 10%, can significantly boost your score. The payoff itself does not directly affect score, but the lower utilization does.",
  },
  {
    question: "Can I negotiate a lower APR on my credit card?",
    answer:
      "Yes. Call your issuer and request a rate reduction, especially if you have a strong payment history and your credit score has improved since you opened the card. Cite competing offers. A 3-5 percentage point reduction is common. Even a small APR drop saves significant money over time: on a $5,000 balance, dropping from 24% to 20% APR saves roughly $400 in interest over a 3-year payoff.",
  },
];

/* ─── Page Component ─── */

export default function CreditCardPayoffCalculatorPage() {
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
          {
            name: "Credit Card Payoff Calculator",
            url: pageUrl,
          },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Credit Card Payoff Calculator"
        description="Free online credit card payoff calculator. Enter your balance and APR to see your payoff timeline, total interest, and how extra or fixed payments accelerate your debt-free date."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Debt Calculators", href: "/debt" },
          { label: "Credit Card Payoff Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Credit Card Payoff Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A credit card payoff calculator estimates how long it takes to eliminate
        your credit card balance and how much total interest you will pay. Enter
        your balance, APR, and monthly payment to see your payoff date. The
        calculator also compares minimum-only payments against a higher fixed
        payment so you can see exactly how much time and interest you save by
        paying more each month. For multiple cards, the snowball option applies
        extra payments to the smallest balance first, while the avalanche option
        targets the highest APR to minimize total cost.
      </p>

      {/* Calculator (client component, SSR with default values, no Suspense) */}
      <div className="mt-8">
        <CreditCardPayoffCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Credit Card Payoff Calculator with Extra Payments */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Credit Card Payoff Calculator with Extra Payments
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Extra payments reduce your principal faster, which means less
            balance is left to accrue interest the following month. Because
            credit card interest compounds daily, every dollar you pay above
            the minimum stops a chain of future interest charges from ever
            being created. Over time, this compounding effect turns a modest
            monthly increase into thousands of dollars in interest saved.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Extra Payment Savings Example
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Balance: $15,000 at 22% APR. Minimum payment of 2% of balance
                (or $25 floor): takes roughly 22 years to pay off, total
                interest paid is approximately $12,980. Add $200 per month in
                extra payments: payoff drops to roughly 4.5 years, total
                interest falls to about $3,100. You save roughly $9,880 in
                interest and eliminate about 17 years of payments.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The savings are so large because credit card interest is
            compounded, not simple. When you carry a balance, each day&apos;s
            interest is added to the principal and then earns its own interest
            the next day. Extra payments break this cycle by shrinking the base
            that compounds. Even an extra $50 per month on a moderate balance
            can cut years off your timeline and save thousands in total cost.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Long to Pay Off $15,000 in Credit Card Debt */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Long to Pay Off $15,000 in Credit Card Debt
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A $15,000 credit card balance at 22% APR is a common scenario that
            illustrates why minimum payments are so costly. The monthly periodic
            rate is 22% / 12 = 1.833%. In the very first month, interest alone
            equals $15,000 x 0.01833 = $275. If your minimum payment is 2% of
            the balance, that is $300 for month one. After the $275 in interest
            is covered, only $25 goes toward reducing the actual balance. The
            new balance is $14,975, and the cycle repeats.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Because such a tiny fraction of each payment attacks the principal,
            the balance declines very slowly. In month two, interest is still
            $274.53 (only 47 cents less than month one). At this rate, the
            balance takes roughly 22 years to reach zero and you pay nearly
            $13,000 in interest on top of the original $15,000.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Minimum vs Fixed Payment at $15,000 (22% APR)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Minimum payment (2% or $25 floor): ~22 years, ~$12,980
                interest. Fixed payment of $500/month: ~3.5 years, ~$1,740
                interest. Fixed payment of $750/month: ~2 years, ~$980
                interest. Switching from minimums to a fixed $500 payment saves
                about $11,240 in interest and nearly 19 years of payments.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The key takeaway is that minimum payments are designed to keep you
            paying for a very long time. Any fixed monthly amount you can
            sustain, even if it is not a large increase, dramatically shortens
            the timeline and reduces the total cost. Use the calculator above
            to model your exact balance, rate, and payment to see the precise
            numbers.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Credit Card Payoff Calculator Snowball */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Credit Card Payoff Calculator Snowball
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The snowball method applied to credit cards works the same way it
            does for any debts: you pay the minimum on every card, then direct
            any extra money to the card with the smallest balance. Once that
            card is paid off, you roll its entire payment into the next
            smallest balance. This creates a snowball effect where your monthly
            payment power grows with each card eliminated.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Snowball Order Example (3 Cards)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Card A: $1,200 at 28% APR. Card B: $3,000 at 19% APR. Card
                C: $5,000 at 22% APR. Snowball order: Card A first (smallest
                balance, quick win), then Card B, then Card C. Card A might be
                eliminated in roughly 8-10 months with a $300 total monthly
                budget. That $300 is then added to Card B&apos;s minimum,
                accelerating its payoff. Finally, all available funds go to
                Card C.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            It is worth noting that the avalanche method would target Card A
            first as well in this particular example, because its 28% APR is
            the highest. In cases where the smallest balance does not have the
            highest rate, avalanche will save more total interest but may
            require longer before you see your first card reach zero. For
            credit cards specifically, the interest rate gap between cards can
            be substantial, so the savings from avalanche are often worth
            considering.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Payoff Calculator for Multiple Credit Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Payoff Calculator for Multiple Credit Cards
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            When you have more than one credit card, the calculator handles
            each card individually. You enter the balance, APR, and current
            minimum payment for every card you carry. The engine then pays the
            minimum on all cards to keep each account in good standing and
            applies your extra payment or fixed budget to the priority card
            based on your chosen strategy, snowball or avalanche.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The critical mechanic is what happens when a card reaches a zero
            balance. Its minimum payment is no longer needed, so that money is
            freed up and added to the extra payment pool. The next card in the
            priority order now receives a larger monthly payment than before.
            When that card is paid off, the same thing happens again. This
            snowball effect means your payment power accelerates with every
            card you eliminate.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The month-by-month schedule in the calculator shows exactly where
            each dollar goes. You can see how much interest each card accrues
            per month, how much principal is reduced, and when each card will
            be fully paid off. This level of detail helps you understand the
            tradeoff between strategies and decide whether the psychological
            boost of snowball is worth the extra interest cost compared to
            avalanche.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Credit Card Payoff Calculator Fixed Payment */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Credit Card Payoff Calculator Fixed Payment
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The fixed payment mode lets you set a total monthly budget for your
            credit card debt, regardless of what the issuer calculates as the
            minimum. The calculator determines how many months it will take to
            bring every card balance to zero at that fixed level. This is
            often more practical than following declining minimums because you
            lock in a consistent outflow from your bank account each month.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Some calculators also offer a "target months" mode, where you set a
            deadline (for example, you want to be debt-free in 24 months) and
            the tool computes the required monthly payment. Both approaches are
            useful: fixed payment is better for budgeting, while target months
            is better when you have a specific date in mind.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Fixed Payment Comparison ($15,000 at 22% APR)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                $300/month: roughly 9 years to pay off, approximately $5,700 in
                total interest. $500/month: roughly 3.5 years, approximately
                $1,740 in total interest. $750/month: roughly 2 years,
                approximately $980 in total interest. Raising the payment from
                $300 to $750 cuts nearly 7 years off the timeline and saves
                about $4,720 in interest.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The exponential nature of compound interest means that higher
            payments deliver disproportionate savings. Going from $300 to $500
            per month (a 67% increase) cuts the timeline by more than 60%. The
            calculator above lets you experiment with different fixed payment
            amounts so you can find the level that balances debt elimination
            speed with your monthly cash flow constraints.
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
            handles multiple debt types (credit cards, loans, medical debt)
            with snowball and avalanche comparison. The{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            shows your debt-to-income ratio and how it affects lending
            decisions. The{" "}
            <a
              href="/debt/credit-card-minimum-payment-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Credit Card Minimum Payment Calculator
            </a>{" "}
            breaks down exactly how much of each minimum goes to interest
            versus principal. The{" "}
            <a
              href="/debt/balance-transfer-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Balance Transfer Calculator
            </a>{" "}
            estimates whether moving your balance to a lower-rate card saves
            money after accounting for transfer fees.
          </p>
        </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
      </div>
    </div>
  );
}
