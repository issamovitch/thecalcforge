import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import BalanceTransferCalculator from "@/components/calculators/BalanceTransferCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/debt/balance-transfer-calculator`;
const pageTitle =
  "Balance Transfer Calculator - Savings & Fees";
const pageDescription =
  "Free balance transfer calculator. See if moving your balance to a 0% APR card saves money after the transfer fee, and how much faster you get debt-free.";

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
    question: "How do balance transfer fees work?",
    answer:
      "Most cards charge 3-5% of the transferred amount, either as a flat fee or minimum. The fee is added to your new card balance or charged separately. It is a one-time cost.",
  },
  {
    question:
      "What happens when the 0% APR promotional period ends?",
    answer:
      "Any remaining balance starts accruing interest at the post-promo APR (often the card's standard rate, 20-29%). If you have not paid off the balance, the post-promo interest can erase your savings. Some cards also charge retroactive interest if the balance is not fully paid.",
  },
  {
    question:
      "Is a balance transfer worth it if I cannot pay off the full balance during the promo?",
    answer:
      "It can still be worth it if the interest saved during the promo period exceeds the transfer fee. However, the savings diminish as more balance remains to accrue post-promo interest. The calculator above shows the exact net savings so you can decide.",
  },
  {
    question: "Can I transfer a balance from multiple cards?",
    answer:
      "Yes, you can transfer balances from multiple cards up to your new card's credit limit (minus the transfer fee). The total transferred amount including fees must not exceed the available credit line.",
  },
  {
    question: "Does a balance transfer affect my credit score?",
    answer:
      "Opening a new card causes a small, temporary dip (hard inquiry, lower average account age). But reducing your credit utilization on the old card(s) can offset this. If your overall utilization drops, your score may actually improve within a few months.",
  },
];

/* ─── Page Component ─── */

export default function BalanceTransferCalculatorPage() {
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
            name: "Balance Transfer Calculator",
            url: pageUrl,
          },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Balance Transfer Calculator"
        description="Free online balance transfer calculator. Enter your balance, APR, and transfer fee to see whether moving to a 0% APR card saves money and how much faster you can become debt-free."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Debt Calculators", href: "/debt" },
          { label: "Balance Transfer Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Balance Transfer Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A balance transfer calculator shows whether moving your credit card
        balance to a new card with a lower promotional APR saves you money after
        accounting for the transfer fee. Enter your current balance, APR,
        monthly payment, the promotional rate and duration, and the transfer fee
        percentage. The calculator compares your current payoff path against the
        transfer scenario and reports total interest, fees, and net savings so
        you can make an informed decision before applying.
      </p>

      {/* Calculator (client component, SSR with default values, no Suspense) */}
      <div className="mt-8">
        <BalanceTransferCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Balance Transfer Calculator with Fee */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Balance Transfer Calculator with Fee
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The single most important factor in deciding whether a balance
            transfer is worth it is the transfer fee. Most cards charge between
            3% and 5% of the transferred amount, and this fee is either added to
            your new balance or billed separately. The calculator factors in
            this cost from the start so your savings estimate reflects reality,
            not just the promotional rate.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Transfer Fee Example
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Balance: $6,000. Transfer fee: 3%. Fee amount: $6,000 x 0.03 =
                $180. Your new balance on the 0% card becomes $6,180. That
                $180 is a one-time cost that must be recouped through interest
                savings before the transfer generates a net benefit. The
                break-even point depends on how much interest you would have
                paid on the original balance versus the $180 fee.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            Some cards offer a lower fee (such as 2% or even 0% for a limited
            time) but may have a shorter promotional period. The calculator lets
            you compare different fee and promo combinations side by side so you
            can find the offer that maximizes your net savings given your
            specific balance and payment amount.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Credit Card Balance Transfer Savings Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Credit Card Balance Transfer Savings Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            To understand how much you can actually save, consider a concrete
            example. A $6,000 balance at 22% APR with $300 monthly payments
            takes roughly 23 months to pay off and costs about $1,150 in total
            interest. Now transfer that balance to a card offering 0% APR for 18
            months with a 3% fee. The fee is $180, and during the 18-month
            promotional period, your interest is $0. After 18 months at $300 per
            month, you have paid down $5,400, leaving a remaining balance of
            about $780 (the original $6,180 minus $5,400).
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Savings Comparison at Different Fee Levels
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                3% fee ($180): net savings around $800-900 after post-promo
                interest on the small remaining balance. 4% fee ($240): net
                savings drop to roughly $740-840. 5% fee ($300): net savings
                fall to roughly $680-780. Even at the highest common fee, the
                transfer still saves a meaningful amount because the interest
                avoided during the promo period far exceeds the fee cost.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The remaining $780 then accrues interest at the post-promo rate, but
            because the balance is small, the additional interest is minimal.
            In total, your net savings from the transfer come out to roughly
            $800 to $900, even after accounting for the fee. The calculator
            runs this full comparison automatically and shows you the exact
            numbers for your situation.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Can I Save with a Balance Transfer Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Can I Save with a Balance Transfer Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Balance transfers are most worthwhile when two conditions hold: your
            current APR is high and your payoff timeline is long. A higher APR
            means more interest accumulating each month, so the 0% promotional
            period prevents a larger dollar amount from compounding. A longer
            payoff timeline means more months of interest savings to offset the
            upfront fee.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                When Transfers Make Sense
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Good fit: $10,000 balance at 24% APR, paying $400/month.
                Interest savings over a 15-month 0% promo easily exceed a 3%
                ($300) fee. Poor fit: $2,000 balance at 15% APR, paying $500
                per month. You would pay off the balance in about 4 months with
                roughly $50 in interest. A 3% fee is $60, which actually costs
                more than the interest you would have paid anyway.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            A useful rule of thumb: if the interest you would save in the first
            four to six months of the promotional period exceeds the transfer
            fee, the transfer is likely worth it. On a $6,000 balance at 22%
            APR, monthly interest is about $110, so four months of saved
            interest is $440, which comfortably exceeds a 3% fee of $180. The
            calculator above does the precise math so you do not have to
            estimate.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: 0 APR Balance Transfer Payoff Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            0 APR Balance Transfer Payoff Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            During a true 0% APR promotional period, every dollar of your
            monthly payment goes directly toward reducing the principal. There
            is no interest eating into your payment, so your balance drops
            faster than it would on a card charging 20% or more. This is the
            core advantage of a balance transfer and the reason the strategy can
            be so powerful.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                0% Payoff Math Example
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Starting balance: $6,000. Transfer fee at 3%: $180. Transferred
                balance: $6,180. Monthly payment: $300. During the 18-month
                0% promo: $300 x 18 = $5,400 paid toward principal. Remaining
                balance after promo: $6,180 minus $5,400 = $780. That $780
                then accrues interest at the post-promo rate (say 22%). At
                $300/month, the remaining $780 is eliminated in about 2.6
                months with roughly $18 in additional interest. Total cost:
                $180 fee plus $18 post-promo interest equals $198, compared to
                about $1,150 staying put.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The key insight is that the post-promo balance is small because 18
            months of pure principal reduction eliminated most of the debt. The
            calculator shows this breakdown month by month, including exactly
            how much is paid during the promo period, what remains afterward,
            and how quickly the residual balance is cleared at the standard
            rate.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Balance Transfer Break Even Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Balance Transfer Break Even Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The break-even point is the month when your cumulative interest
            savings equal the transfer fee you paid upfront. Before that month,
            the fee has not been fully recouped. After that month, every dollar
            of avoided interest is pure savings. Understanding this timing helps
            you assess the risk if something changes and you cannot maintain your
            planned payments.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Break-Even Calculation
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Balance: $6,000 at 22% APR. Approximate monthly interest:
                $6,000 x (0.22 / 12) = $110. Transfer fee at 3%: $180.
                Break-even month: $180 / $110 = roughly 1.6 months, so by the
                end of month 2 you have already saved more in interest than the
                fee cost. However, if the promo period is short (say 6 months)
                and you cannot clear the balance, the remaining amount accrues
                post-promo interest and can erode savings significantly.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            A transfer becomes not worth it when the post-promo interest on
            the unpaid balance exceeds the interest you saved during the
            promotional window. For example, if you transfer $10,000 with a 5%
            fee ($500) to a 6-month 0% promo and can only pay $200 per month,
            you eliminate $1,200 during the promo but leave $9,300 to accrue
            interest at a high rate. In that case, the calculator would show
            minimal or even negative net savings, signaling that the transfer
            is a poor choice for your payment level.
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
              href="/debt/credit-card-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Credit Card Payoff Calculator
            </a>{" "}
            shows your current payoff timeline and total interest. The{" "}
            <a
              href="/debt/credit-card-minimum-payment-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Credit Card Minimum Payment Calculator
            </a>{" "}
            breaks down how much of each minimum goes to interest versus
            principal. The{" "}
            <a
              href="/debt/debt-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Payoff Calculator
            </a>{" "}
            handles multiple debt types with snowball and avalanche comparison.
            The{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            shows your debt-to-income ratio. The{" "}
            <a
              href="/loans/debt-consolidation-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Consolidation Calculator
            </a>{" "}
            compares consolidation loans against your current debt structure.
          </p>
        </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
      </div>
    </div>
  );
}
