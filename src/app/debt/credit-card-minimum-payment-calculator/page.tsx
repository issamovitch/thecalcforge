import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import CreditCardMinimumPaymentCalculator from "@/components/calculators/CreditCardMinimumPaymentCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

export const dynamic = "force-static";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/debt/credit-card-minimum-payment-calculator`;
const pageTitle =
  "Credit Card Minimum Payment Calculator";
const pageDescription =
  "See how your credit card minimum payment is calculated, how long payoff takes at minimums only, and the true cost. Compare minimum vs fixed payments.";

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
    question: "How do credit card companies calculate minimum payments?",
    answer:
      "Three common formulas: flat percentage of balance (1-3%), percentage plus monthly interest, or 1% of balance plus interest plus fees. All include a dollar floor, usually $25 to $35, so the minimum never drops below that amount. The specific formula is in your card agreement's terms and conditions.",
  },
  {
    question: "What happens if I only pay the minimum on my credit card?",
    answer:
      "You avoid late fees and protect your credit score, but you maximize the total interest paid. At typical rates, paying only the minimum can take 15 to 25 years to pay off a balance, and total interest often equals or exceeds the original charges. The balance declines very slowly because most of each payment covers that month's interest charge.",
  },
  {
    question: "Can my minimum payment go up?",
    answer:
      "Yes, in specific situations: if you make a large new purchase, your balance increases so the percentage-based minimum rises. If your APR increases (due to a penalty rate or variable rate adjustment), the interest portion of formulas that include interest will increase. Some issuers also raise the floor amount periodically.",
  },
  {
    question: "Is it bad to pay only the minimum?",
    answer:
      "It is not bad for your credit score itself, as long as you pay on time. However, it is the most expensive way to manage a balance. The longer you carry a balance while paying only the minimum, the more total interest accumulates. Paying even a modest fixed amount above the minimum can cut years off your timeline and save thousands in interest.",
  },
  {
    question: "What is the new CFPB minimum payment rule?",
    answer:
      "In 2025, the CFPB finalized a rule requiring credit card issuers to apply payments above the minimum to the highest-interest balance first. While this does not change how the minimum itself is calculated, it means that any extra payment you make reduces your most expensive debt faster. The rule also requires clearer disclosure of how long it takes to pay off at minimums.",
  },
];

/* ─── Page Component ─── */

export default function CreditCardMinimumPaymentCalculatorPage() {
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
            name: "Credit Card Minimum Payment Calculator",
            url: pageUrl,
          },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Credit Card Minimum Payment Calculator"
        description="Free online credit card minimum payment calculator. Enter your balance, APR, and issuer formula to see the exact declining minimum schedule, total interest, and payoff timeline."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Debt Calculators", href: "/debt" },
          { label: "Credit Card Minimum Payment Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Credit Card Minimum Payment Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A credit card minimum payment calculator shows how your issuer computes
        the minimum due and what happens when you pay only that amount each
        month. Most issuers set the minimum as a percentage of your balance
        (typically 1% to 3%) or a small percentage plus monthly interest, with a
        dollar floor around $25. Because the minimum declines as your balance
        drops, paying only the minimum stretches repayment to years or decades
        and causes total interest to rival or exceed the original charges. This
        calculator lets you pick your issuer&apos;s formula, see the exact
        declining minimum schedule, and compare it against a fixed monthly
        payment.
      </p>

      {/* Calculator (client component, SSR with default values, no Suspense) */}
      <div className="mt-8">
        <CreditCardMinimumPaymentCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Credit Card Minimum Payment Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Credit Card Minimum Payment Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Credit card issuers use one of three common formulas to determine
            your monthly minimum. Understanding which formula applies to your
            card matters because it directly affects how quickly the balance
            declines and how much total interest you pay over time.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                The Three Common Minimum Payment Formulas
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Formula 1: Flat percentage of balance.</strong> The
                simplest approach. Your minimum is a fixed percentage of your
                statement balance, usually 2%. Example: 2% of $5,000 = $100
                minimum.{"\n\n"}
                <strong>Formula 2: Percentage plus monthly interest.</strong>{" "}
                Your minimum equals a smaller percentage of the balance (often
                1%) plus that month&apos;s interest charge. Example: 1% of
                $5,000 ($50) plus $91.67 in interest = $141.67 minimum.{"\n\n"}
                <strong>Formula 3: 1% plus interest plus fees.</strong> The
                newest CFPB-influenced formula. Your minimum is 1% of the
                balance, plus monthly interest, plus any late fees or annual
                fees. This ensures at least a small portion always goes toward
                principal.{"\n\n"}All three formulas include a dollar floor,
                typically $25 to $35, which prevents the minimum from dropping
                below that threshold even as the balance shrinks.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The specific formula your issuer uses is stated in your card
            agreement under the section titled &quot;minimum payment
            disclosure&quot; or similar wording. Check your most recent statement
            or the issuer&apos;s website to confirm which applies. The
            calculator above lets you select the formula that matches your card
            so the results reflect your actual situation.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Long to Pay Off Credit Card Making Minimum Payments */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Long to Pay Off Credit Card Making Minimum Payments
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The declining minimum creates a trap that is easy to underestimate.
            Because the minimum drops each month as the balance decreases, your
            payment shrinks right along with it. The result is that nearly all of
            each payment goes toward interest, and the principal barely moves.
            This dynamic means the timeline stretches far beyond what most people
            expect.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $5,000 at 22% APR, 2% Minimum, $25 Floor
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Month 1:</strong> Balance $5,000. Minimum = 2% of
                $5,000 = $100.00. Interest = $5,000 x (22% / 12) = $91.67.
                Principal = $100.00 - $91.67 = $8.33. New balance: $4,991.67.{"\n\n"}
                <strong>Month 12:</strong> Balance is approximately $4,770.
                Minimum = 2% of $4,770 = $95.40. Interest = $4,770 x (22% /
                12) = $87.45. Principal = $95.40 - $87.45 = $7.95.{"\n\n"}
                After 5 years (60 months), the balance is still roughly $3,200.
                That means in five full years of making every payment on time,
                you have retired only $1,800 of the original $5,000
                balance.{"\n\n"}
                <strong>Total payoff:</strong> approximately 267 months (22+
                years) and total interest of roughly $6,100. You would end up
                paying over $11,000 for a $5,000 charge.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The reason the payoff takes so long is that the minimum payment
            declines in lockstep with the balance. As the balance gets smaller,
            so does the payment, and the ratio of interest to principal in each
            payment stays roughly the same. The balance never reaches zero on its
            own until the dollar floor kicks in at the very end. Use the
            calculator above to see the exact month-by-month breakdown for your
            own balance and rate.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Minimum Payment Calculator 2 Percent */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Minimum Payment Calculator 2 Percent
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A 2% minimum is the most widely used formula among major credit card
            issuers. At this rate, the monthly periodic interest on a 22% APR
            card is 22% / 12 = 1.833%. Because the 1.833% interest charge is
            very close to the 2% minimum, only about 0.167% of the balance
            actually gets reduced each month. In practical terms, roughly 92% of
            your first payment goes to interest and only 8% to principal.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                2% Minimum Comparison at 22% APR
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>$5,000 balance:</strong> Payoff takes approximately 267
                months (22 years). Total interest paid is roughly $6,100, for a
                total cost of about $11,100.{"\n\n"}
                <strong>$10,000 balance:</strong> Payoff takes approximately 326
                months (27 years). Total interest paid is roughly $13,200, for
                a total cost of about $23,200.{"\n\n"}
                The larger balance takes 59 additional months to pay off and
                accumulates more than double the interest. The reason is that at
                a 2% minimum, the ratio of interest to principal stays high
                throughout the schedule, and a larger starting balance means
                more months spent in that high-interest phase.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The pattern is clear: the larger the balance, the worse the interest
            to principal ratio becomes over the life of the repayment. A 2%
            minimum on a high-APR card is essentially an interest-only payment
            plan with a tiny principal reduction attached. If your card uses the
            2% formula, even a modest increase to a fixed payment of $150 or
            $200 per month can eliminate years of payments and thousands of
            dollars in interest.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Credit Card Interest Calculator Minimum Payment Only */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Credit Card Interest Calculator Minimum Payment Only
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            When you pay only the minimum, the split between interest and
            principal in each payment is heavily skewed toward interest for a
            very long time. The exact split depends on your APR and minimum
            formula, but the pattern is consistent across all scenarios.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Interest vs Principal Split Over Time ($5,000 at 22% APR, 2%
                Minimum)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Month 1:</strong> 92% interest ($91.67), 8% principal
                ($8.33).{"\n\n"}
                <strong>Year 1 (average):</strong> Approximately 91% interest,
                9% principal. The balance has barely moved.{"\n\n"}
                <strong>Year 5:</strong> Approximately 80% interest, 20%
                principal. A slight improvement, but the balance is still over
                60% of the original amount.{"\n\n"}
                <strong>Year 15:</strong> This is roughly the point where the
                split flips, with more of each payment going to principal than
                to interest. By this time you have already paid the vast
                majority of the total interest.{"\n\n"}
                The compounding effect is what makes this so expensive. Each
                month, you pay interest on the previous month&apos;s interest.
                Because the principal declines so slowly, the interest base
                remains large for a very long time, and the compounding cycle
                repeats month after month for decades.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            This is the core reason why paying only the minimum is so costly.
            The interest portion of each payment compounds on itself, and the
            declining minimum means you never apply enough to break the cycle
            until many years have passed. The calculator above displays the
            exact interest and principal amounts for every month so you can see
            precisely where your money goes.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: $5,000 Credit Card Minimum Payment Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            $5,000 Credit Card Minimum Payment Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A $5,000 balance is one of the most common scenarios people search
            for. Here is a complete breakdown at 22% APR with a 2% minimum and
            $25 floor, followed by a direct comparison against a fixed $200 per
            month payment plan.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                $5,000 at 22% APR: Minimum vs Fixed $200/Month
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Minimum payment schedule:</strong>{"\n"}
                Month 1: $100.00 minimum.{"\n"}
                Month 50: minimum drops to roughly $50 (balance approximately
                $2,500).{"\n"}
                Month 100: minimum drops to roughly $30 (balance approximately
                $1,400, approaching the floor).{"\n"}
                After month 100, the minimum hits the $25 floor and stays
                there, causing payoff to accelerate slightly.{"\n"}
                Total: approximately 267 months (22 years), roughly $6,100 in
                interest.{"\n\n"}
                <strong>Fixed $200/month:</strong>{"\n"}
                Payoff in approximately 33 months (under 3 years).{"\n"}
                Total interest: roughly $1,580.{"\n\n"}
                <strong>Savings:</strong> 234 fewer months (19.5 years) and
                $4,520 less in interest. The fixed payment eliminates the
                balance nearly 7 times faster and costs about one-quarter of
                the total interest.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The contrast is stark. A fixed $200 per month, which is only double
            the initial minimum, turns a 22-year ordeal into a sub-3-year plan
            and saves $4,520. The reason is straightforward: a fixed payment
            keeps a consistent and meaningful amount attacking the principal
            each month, so the interest base shrinks rapidly instead of barely
            moving. Use the calculator above to model your own $5,000 scenario
            and experiment with different fixed payment amounts to find the
            right balance between monthly cost and total savings.
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
            handles multiple cards with snowball and avalanche strategy
            comparison. The{" "}
            <a
              href="/debt/debt-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Payoff Calculator
            </a>{" "}
            compares snowball vs avalanche across all your debts. The{" "}
            <a
              href="/debt/balance-transfer-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Balance Transfer Calculator
            </a>{" "}
            estimates whether a 0% promotional offer saves money after transfer
            fees. The{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            shows your debt-to-income ratio and how it affects lending
            decisions.
          </p>
        </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
      </div>
    </div>
  );
}
