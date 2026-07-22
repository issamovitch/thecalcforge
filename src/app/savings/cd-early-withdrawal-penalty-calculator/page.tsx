import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import CdEarlyWithdrawalCalculator from "@/components/calculators/CdEarlyWithdrawalCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

export const dynamic = "force-static";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/savings/cd-early-withdrawal-penalty-calculator`;
const pageTitle =
  "CD Early Withdrawal Penalty Calculator";
const pageDescription =
  "Free CD early withdrawal penalty calculator. See the penalty in dollars, your net proceeds, and whether breaking your CD early is worth it.";

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
    question: "How much is the penalty for cashing a CD early?",
    answer:
      "It depends on your bank's penalty schedule, which is disclosed in your deposit agreement. A common schedule is 3 months of interest for terms under 1 year, 6 months for 1 to 2 year terms, and 12 months for longer terms. On a $10,000 CD at 4.50% APY, that works out to a $112.50 penalty for 3 months, $225.00 for 6 months, or $450.00 for 12 months. The calculator above computes the exact dollar penalty for any principal, APY, and penalty type you enter.",
  },
  {
    question: "Can a CD early withdrawal penalty eat into my principal?",
    answer:
      "It can, depending on your bank. Some banks cap the penalty at the interest earned so far, so your principal is protected. Others allow the penalty to exceed accrued interest and deduct the difference from principal, which means you could receive back less than you deposited. The calculator shows a warning when the penalty exceeds interest earned, but you must check your deposit agreement or Truth in Savings disclosure to confirm whether your bank caps the penalty at interest.",
  },
  {
    question: "Is the CD penalty the same as the 10% IRA early withdrawal penalty?",
    answer:
      "No. A CD early withdrawal penalty is a bank charge for cashing a certificate of deposit before its maturity date. The 10% penalty on early withdrawals from an IRA or 401k is a tax penalty imposed by the IRS on retirement account distributions taken before age 59 and a half. They are separate mechanisms. A CD held inside an IRA can trigger both the bank's CD penalty and the IRS retirement penalty, while a CD held in a taxable account only faces the bank penalty. This page does not provide tax advice; consult a tax professional for retirement account questions.",
  },
  {
    question: "How is the penalty calculated if my bank uses custom days?",
    answer:
      "Some banks use a custom day count instead of whole months of interest. The formula is penalty = principal times APY times days divided by 365. For example, a 90-day penalty on a $10,000 CD at 4.50% APY is $10,000 times 0.045 times 90 divided by 365, which is $110.96. The calculator above supports custom days by selecting 'Custom days of interest' from the penalty type dropdown.",
  },
  {
    question: "Is it worth breaking a CD early to chase a higher rate?",
    answer:
      "It depends on the penalty, the remaining term, and the new rate available. The calculator above runs the comparison: it computes the value of keeping your CD to maturity versus breaking it, paying the penalty, and reinvesting the net proceeds at a new APY for the same remaining months. If the break-and-reinvest option produces a higher final value, breaking wins. Generally, breaking makes sense when the rate difference is large enough and the remaining term is long enough to recoup the penalty.",
  },
];

/* ─── Page Component ─── */

export default function CdEarlyWithdrawalPage() {
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
          { name: "CD Early Withdrawal Penalty Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="CD Early Withdrawal Penalty Calculator"
        description="Free online CD early withdrawal penalty calculator. Compute the penalty in dollars, interest earned, net proceeds, and whether breaking a CD early is worth it."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Savings Calculators", href: "/savings" },
          { label: "CD Early Withdrawal Penalty Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        CD Early Withdrawal Penalty Calculator
      </h1>

      {/* Intro paragraph (first 100 words answer the primary keyword) */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A 6-month interest penalty on a $10,000 CD at 4.50% APY is $225. This
        CD early withdrawal penalty calculator computes the penalty in dollars,
        the interest earned so far, your net gain or loss, and your net
        proceeds if you break the CD now. It also compares keeping the CD to
        maturity against breaking it and reinvesting the proceeds at a new APY,
        so you can see whether breaking is worth it.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <CdEarlyWithdrawalCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: CD Early Withdrawal Penalty Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            CD Early Withdrawal Penalty Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A CD early withdrawal penalty calculator converts your bank&apos;s
            penalty schedule into a dollar amount so you can see exactly what
            breaking your certificate of deposit will cost. Most banks express
            the penalty as a number of months of simple interest on the
            principal, using the CD&apos;s APY. The calculator above supports
            the three most common schedules (3, 6, and 12 months of interest)
            plus a custom days option for banks that use a day count instead.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The conversion matters because penalty schedules sound small in
            months but add up in dollars. A 6-month interest penalty on a
            $10,000 CD at 4.50% APY is $225, which wipes out six months of
            interest. On a $50,000 CD at 5.00% APY with a 12-month penalty,
            the penalty is $2,500. The calculator shows the penalty alongside
            the interest you have actually earned, so you can see whether the
            penalty eats into principal.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            All outputs use a simple-interest approximation, which matches how
            most banks compute the penalty. Penalty policies vary by bank and
            product, and some banks cap the penalty at accrued interest while
            others do not. Always confirm the exact terms in your deposit
            agreement or Truth in Savings disclosure before breaking a CD.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How the CD Penalty Calculation Works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How the CD Penalty Calculation Works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The months-of-interest convention uses simple interest. The formula
            is <strong>penalty = principal &times; APY &times; penalty months
            &divide; 12</strong>. For a $10,000 CD at 4.50% APY with a 6-month
            penalty, the calculation is $10,000 &times; 0.045 &times; 6
            &divide; 12 = $225.00. For a custom day count, the formula is{" "}
            <strong>penalty = principal &times; APY &times; days &divide;
            365</strong>.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Interest earned so far uses the same convention:{" "}
            <strong>interest = principal &times; APY &times; months held
            &divide; 12</strong>. If you have held a $10,000 CD at 4.50% APY
            for 6 months, interest earned is $10,000 &times; 0.045 &times; 6
            &divide; 12 = $225.00. Net gain from breaking now is interest
            earned minus penalty; net proceeds is principal plus interest
            earned minus penalty.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $10,000 at 4.50%, 6-Month Penalty, Held 6 of 12 Months
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Penalty = $10,000 &times; 0.045 &times; 6 &divide; 12 = <strong>$225.00</strong>.
                Interest earned = $10,000 &times; 0.045 &times; 6 &divide; 12 = <strong>$225.00</strong>.
                Net gain = $225.00 &minus; $225.00 = <strong>$0.00</strong>.
                Net proceeds = $10,000 + $225.00 &minus; $225.00 = <strong>$10,000.00</strong>.
                Every figure is exact to the cent.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: Early Withdrawal Penalty Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Early Withdrawal Penalty Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The calculator above is an early withdrawal penalty calculator
            built specifically for certificates of deposit. It is important to
            distinguish the CD early withdrawal penalty from other early
            withdrawal penalties in finance. The CD penalty is a bank charge
            set by your deposit agreement, calculated as months or days of
            interest. A separate and unrelated penalty is the 10% additional
            tax the IRS imposes on early distributions from an IRA or 401k
            taken before age 59 and a half; that is a tax penalty on retirement
            accounts, not a bank charge on a CD.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            A CD held inside an IRA can trigger both: the bank&apos;s CD
            penalty for breaking the term early, and the IRS retirement penalty
            for taking a distribution from the IRA. A CD held in a taxable
            account only faces the bank penalty. This page covers only the bank
            CD penalty and does not provide tax advice. For retirement account
            questions, consult a tax professional or the IRS rules for your
            specific situation.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Outside of CDs and retirement accounts, early withdrawal penalties
            also appear on annuities (surrender charges), life insurance cash
            value, and some savings accounts with bonus rates. Each product has
            its own penalty structure, so use a calculator built for the
            specific product rather than generalizing.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Is the Penalty for Cashing a CD Early */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Is the Penalty for Cashing a CD Early
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The penalty for cashing a CD early depends on your principal, your
            APY, and your bank&apos;s penalty schedule. On a $10,000 CD at
            4.50% APY, the three most common penalties are <strong>$112.50</strong>{" "}
            for 3 months of interest, <strong>$225.00</strong> for 6 months,
            and <strong>$450.00</strong> for 12 months. Each is computed as
            $10,000 &times; 0.045 &times; penalty months &divide; 12.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Typical Penalties on a $10,000 CD at 4.50% APY
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>3 months:</strong> $112.50.{" "}
                <strong>6 months:</strong> $225.00.{" "}
                <strong>12 months:</strong> $450.00.{" "}
                <strong>Custom 90 days:</strong> $110.96 ($10,000 &times; 0.045 &times; 90 &divide; 365).
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            These are dollar penalties, not reductions in your interest rate.
            The bank deducts the penalty from your accrued interest first, and
            if the penalty exceeds accrued interest, some banks then deduct
            the difference from principal while others cap the penalty at
            interest earned. The calculator above flags the case where the
            penalty exceeds interest earned so you know to check your bank&apos;s
            policy.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: CD Penalty Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            CD Penalty Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The CD penalty calculator above uses a simple-interest approximation,
            which matches how most direct banks compute the early withdrawal
            penalty. The penalty terms are set by your bank and disclosed in
            two documents you received when you opened the CD: the deposit
            agreement and the Truth in Savings disclosure. These documents
            specify the penalty schedule (months or days of interest), whether
            the penalty is capped at accrued interest, and any special rules
            for no-penalty or bump-up CDs.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Penalty schedules vary by term and by bank. A typical schedule is
            3 months of interest for CDs with terms under 1 year, 6 months for
            terms of 1 to 2 years, and 12 months for terms over 2 years. Some
            banks charge more, some less, and a few offer no-penalty CDs that
            waive the early withdrawal fee entirely in exchange for a lower
            APY. Brokered CDs, sold through brokerage accounts, do not use a
            months-of-interest penalty; instead you sell them on the secondary
            market, where the price moves with prevailing rates.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            When comparison shopping for CDs, the penalty schedule matters as
            much as the APY. A CD with a slightly higher APY but a 12-month
            penalty can cost more than a lower-APY CD with a 6-month penalty
            if you end up breaking it. Read the Truth in Savings disclosure
            before opening any CD, and use the calculator above to model the
            worst-case penalty for the principal and APY you are considering.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Is It Worth Breaking a CD Early */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Is It Worth Breaking a CD Early
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Whether breaking a CD is worth it depends on the penalty, the
            remaining term, and the new rate available elsewhere. The
            calculator above runs the comparison automatically using the same
            simple-interest math. To decide, compare two end values: the value
            of keeping the CD to maturity, and the value of breaking it now,
            paying the penalty, and reinvesting the net proceeds at the new APY
            for the same remaining months.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $10,000 at 3.00% APY, 12 Months Remaining, 6-Month Penalty, New CD at 5.00%
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Penalty = $10,000 &times; 0.03 &times; 6 &divide; 12 = <strong>$150.00</strong>.
                Interest earned so far (0 months held) = <strong>$0.00</strong>.
                Net proceeds after breaking = $10,000 + $0.00 &minus; $150.00 = <strong>$9,850.00</strong>.
                <br /><br />
                Keep to maturity: remaining interest = $10,000 &times; 0.03 &times; 12 &divide; 12 = <strong>$300.00</strong>.
                Final value = $10,000 + $0.00 + $300.00 = <strong>$10,300.00</strong>.
                <br /><br />
                Break and reinvest: reinvest $9,850.00 at 5.00% for 12 months =
                $9,850.00 &times; 0.05 &times; 12 &divide; 12 = <strong>$492.50</strong> in new interest.
                Final value = $9,850.00 + $492.50 = <strong>$10,342.50</strong>.
                <br /><br />
                Difference = $10,342.50 &minus; $10,300.00 = <strong>$42.50</strong>.
                Breaking the CD and reinvesting at the higher rate wins by $42.50,
                because the extra 2.00% of yield on $9,850 over 12 months ($197.00)
                exceeds the $150.00 penalty.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The break-even point depends on how the new rate compares to the
            current rate, the size of the penalty, and the length of the
            remaining term. A larger rate gap, a smaller penalty, and a longer
            remaining term all favor breaking. A smaller gap, a larger penalty,
            and a shorter remaining term all favor keeping the CD. Use the
            calculator above with your own numbers to see which option wins and
            by how much.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            One caveat: the calculator assumes you can actually reinvest the net
            proceeds at the new APY for the full remaining term. If the new rate
            is a promotional rate that drops after a few months, or if rates
            fall before you lock in the new CD, the break option may
            underperform the calculation. The comparison is a point-in-time
            estimate based on the rates you enter.
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
            hub. If you are weighing guaranteed income from an annuity against
            CD interest, the{" "}
            <a
              href="/insurance/annuity-payout-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Annuity Payout Calculator
            </a>{" "}
            estimates monthly and annual payouts for life and fixed-period
            annuities. If breaking a CD frees up cash to pay down high-rate
            debt, the{" "}
            <a
              href="/debt/debt-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Payoff Calculator
            </a>{" "}
            compares snowball and avalanche strategies and shows your debt-free
            date, so you can see whether the interest saved on debt beats the
            interest lost on the CD penalty.
          </p>
        </section>
      </div>
    </div>
  );
}
