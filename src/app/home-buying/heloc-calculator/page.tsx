import type { Metadata } from "next";
import { siteConfig, VERIFIED_DATE } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import HELOCCalculator from "@/components/calculators/HELOCCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

export const dynamic = "force-static";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/home-buying/heloc-calculator`;
const pageTitle =
  "HELOC Calculator \u2013 Home Equity Line Payment";
const pageDescription =
  "Free HELOC calculator. Estimate how much you can borrow, interest-only draw payments, and full repayment-period payments on your home equity line of credit.";

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
    question: "How is the maximum HELOC amount calculated?",
    answer:
      "Lenders determine your maximum HELOC credit line using the combined loan-to-value (CLTV) ratio. The formula is: home value multiplied by the maximum CLTV percentage, minus your existing mortgage balance. For example, a $400,000 home with a $250,000 mortgage at 80% CLTV gives a maximum line of $70,000. Some lenders allow CLTV up to 85% or 90%, which would increase the available amount, but a lower CLTV generally means a better rate and lower risk for both you and the lender.",
  },
  {
    question: "What happens when the HELOC draw period ends?",
    answer:
      "When the draw period ends, you can no longer borrow from the line and the repayment period begins. Your payment jumps from interest-only to a fully amortizing payment that covers both principal and interest. This payment increase can be significant. For example, a $50,000 HELOC at 8.5% has an interest-only payment of about $354/month. If the repayment period is 20 years, the new payment rises to roughly $434/month, an increase of about 23%. Budgeting for this jump before it happens is critical to avoid payment shock.",
  },
  {
    question: "Are HELOC interest rates fixed or variable?",
    answer:
      "Most HELOCs carry variable interest rates tied to a benchmark such as the prime rate. When the prime rate changes, your HELOC rate adjusts accordingly, typically within one billing cycle. Some lenders offer a fixed-rate conversion option that lets you lock a portion of your balance at a fixed rate, but the underlying line remains variable. Because of this variability, the payment estimates from any HELOC calculator are based on the rate you enter and may differ from actual future payments. Always plan for the possibility of higher rates when deciding how much to draw.",
  },
  {
    question: "Can I pay off a HELOC early?",
    answer:
      "Yes. Most HELOCs do not charge prepayment penalties, so you can make extra payments toward the principal at any time during either the draw or repayment period. Paying down the balance during the draw period is especially effective because it reduces the amount on which interest accrues and lowers your required repayment payment when the draw period ends. Some HELOCs allow you to re-borrow funds you have repaid during the draw period, making it a flexible revolving credit source.",
  },
  {
    question: "Is HELOC interest tax deductible?",
    answer:
      "Under current tax law, interest on a home equity line of credit is deductible only if the funds are used to buy, build, or substantially improve the home that secures the loan. If you use HELOC proceeds for other purposes such as debt consolidation, education, or vacation, the interest is not deductible. The deduction is subject to the same itemization requirements and AGI limits as mortgage interest. Consult a tax professional for guidance specific to your situation, as IRS rules can change.",
  },
];

/* ─── Page Component ─── */

export default function HELOCCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: "Home Buying Calculators",
            url: `${siteConfig.url}/home-buying`,
          },
          { name: "HELOC Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="HELOC Calculator"
        description="Free online HELOC calculator. Estimate how much you can borrow from a home equity line of credit, interest-only draw payments, and full repayment-period payments."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Home Buying Calculators", href: "/home-buying" },
          { label: "HELOC Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        HELOC Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A home equity line of credit (HELOC) lets you borrow against the equity
        in your home using a revolving credit line. During the draw period,
        typically 5 to 10 years, you pay only interest on the amount you have
        drawn. When the draw period ends, the repayment period begins and you
        must repay the full balance with principal and interest over 10 to 20
        years. This HELOC calculator estimates your maximum credit line based on
        your home value, mortgage balance, and lender CLTV limit, then
        calculates the interest-only payment during the draw period and the
        higher payment required during repayment. Because HELOC rates are
        variable, actual payments may differ from these estimates.
      </p>

      {/* Calculator (client component) */}
      <div className="mt-8">
        <HELOCCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: HELOC Payment Calculator Interest Only */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            HELOC Payment Calculator Interest Only
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            During the draw period of a home equity line of credit, most
            borrowers make interest-only payments. This means your monthly
            obligation is simply the drawn balance multiplied by the monthly
            rate. The formula is straightforward: monthly interest payment equals
            the HELOC balance times the annual percentage rate divided by 12.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For a $50,000 balance at 8.5% APR, the interest-only payment is
            approximately $354.17 per month. If rates rise to 9.5%, the same
            balance costs $395.83 per month, an increase of about $42. Because
            HELOC rates are variable, your payment can change from month to
            month as the underlying index moves. The calculator above uses the
            rate you enter, so you can model different rate scenarios by
            adjusting the rate slider.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            During the interest-only period, your principal balance does not
            decrease unless you voluntarily make extra payments. This means the
            full drawn amount must still be repaid once the repayment period
            begins. Understanding this is essential for budgeting, because the
            transition from interest-only to amortizing payments is the single
            largest source of payment shock for HELOC borrowers.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: HELOC Calculator Draw and Repayment Period */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            HELOC Calculator Draw and Repayment Period
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A HELOC has two distinct phases. The draw period, usually 5 to 10
            years, is when you can access funds from the credit line up to your
            approved limit. During this phase, the minimum required payment is
            typically interest only on the outstanding balance. Some lenders
            require a small principal payment (often 1% to 2% of the balance),
            but the standard structure is interest-only.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The repayment period, typically 10 to 20 years, begins immediately
            after the draw period closes. At that point, you can no longer
            withdraw additional funds, and your payment jumps to a fully
            amortizing level that covers both principal and interest. The new
            payment is calculated using the standard loan amortization formula
            applied to the remaining balance over the repayment term.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $50,000 HELOC at 8.5%, 10-Year Draw, 20-Year
                Repayment
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Draw period (120 months):</strong> Interest-only payment
                of approximately $354.17/month. Total interest paid during the
                draw: $42,500.{" "}
                <strong>Repayment period (240 months):</strong> Monthly payment
                jumps to approximately $433.62/month (principal + interest). Total
                repayment cost: $104,069.{" "}
                <strong>Payment jump:</strong> from $354.17 to $433.62, an
                increase of $79.45 per month (about 22%).{" "}
                <strong>Total interest over both periods:</strong> roughly
                $96,569 on a $50,000 draw. These figures assume a constant rate
                and are for illustration only.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The draw and repayment structure means a HELOC is not comparable to
            a standard fixed-rate home equity loan. With a home equity loan, you
            receive a lump sum and begin repaying immediately with a predictable
            payment. A HELOC offers flexibility during the draw period but
            introduces uncertainty about the eventual repayment cost because of
            variable rates and the deferred principal obligation.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much HELOC Can I Get Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much HELOC Can I Get Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The amount you can borrow through a HELOC is governed by your
            combined loan-to-value (CLTV) ratio. CLTV is the total of all
            mortgage debt on the property (your first mortgage plus the HELOC)
            divided by the home&apos;s appraised value, expressed as a
            percentage. Most lenders set a maximum CLTV between 80% and 90%.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The borrowing limit formula is: maximum HELOC equals (home value
            multiplied by CLTV percentage) minus your current mortgage balance.
            For a $400,000 home with a $250,000 first mortgage, an 80% CLTV cap
            yields a maximum HELOC of $70,000 ($400,000 multiplied by 0.80 minus
            $250,000). The same home at 85% CLTV would allow up to $90,000, and
            at 90% CLTV, up to $110,000.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Lenders also evaluate your credit score, debt-to-income ratio,
            payment history, and the amount of equity you have built. Borrowers
            with higher credit scores and lower DTI ratios tend to qualify for
            higher CLTV limits and better rates. Most lenders require at least
            15% to 20% equity before approving a HELOC. If your home value has
            appreciated since purchase, a new appraisal may increase your
            available credit line. The calculator above computes the maximum
            based on the CLTV you enter, so you can see how different CLTV
            levels affect your borrowing capacity.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: HELOC Payoff Calculator with Extra Payments */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            HELOC Payoff Calculator with Extra Payments
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Making extra payments toward your HELOC balance is one of the most
            effective ways to reduce total interest and shorten your repayment
            timeline. Because most HELOCs have no prepayment penalty, you can
            apply extra funds at any time. The impact depends on whether you pay
            extra during the draw period or the repayment period.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            During the draw period, extra payments reduce the outstanding
            principal. Since interest accrues on the daily balance, every dollar
            of principal reduction lowers your interest charge going forward. A
            $200/month extra payment on a $50,000 HELOC at 8.5% during a 10-year
            draw period reduces the balance by approximately $24,000 in
            principal (before interest savings are factored), which means the
            repayment-period starting balance is substantially lower and the
            required amortizing payment drops accordingly.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            During the repayment period, extra payments accelerate the
            amortization schedule. The same $200/month extra on a 20-year
            repayment schedule can shave roughly 3 to 4 years off the payoff
            timeline and save thousands in interest. The calculator above models
            both scenarios. Select &quot;Draw Period&quot; or &quot;Repayment
            Period&quot; in the extra payments section to compare the impact.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: HELOC Monthly Payment Calculator on $50,000 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            HELOC Monthly Payment Calculator on $50,000
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A $50,000 HELOC is a common draw amount for home improvements, debt
            consolidation, or major expenses. The monthly payment depends on the
            rate, the draw period length, and whether you are in the draw or
            repayment phase. Below is a breakdown at several rate levels,
            assuming a 10-year draw and 20-year repayment.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                $50,000 HELOC Monthly Payments at Various Rates (10-Year Draw,
                20-Year Repayment)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>At 7.0%:</strong> Interest-only draw payment $291.67/month.
                Repayment payment $387.65/month. Payment jump: +$95.98 (33%
                increase).{" "}
                <strong>At 8.5%:</strong> Interest-only draw payment $354.17/month.
                Repayment payment $433.62/month. Payment jump: +$79.45 (22%
                increase).{" "}
                <strong>At 10.0%:</strong> Interest-only draw payment $416.67/month.
                Repayment payment $482.51/month. Payment jump: +$65.84 (16%
                increase). These are estimates based on a constant rate. Variable
                rates may produce different results.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            One important pattern is that the percentage payment jump actually
            decreases at higher rates, even though the dollar amounts increase.
            This happens because the interest-only payment is proportionally
            larger at higher rates, leaving a smaller gap to the amortizing
            payment. However, the total cost of the HELOC rises significantly at
            higher rates. At 8.5%, total interest over the full 30-year span is
            roughly $96,569. At 10.0%, total interest jumps to roughly
            $116,101, an increase of nearly $20,000 on the same $50,000 draw.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            When planning a $50,000 draw, consider both the monthly payment you
            can afford during repayment and the total interest cost. Shorter
            repayment periods reduce total interest but raise the monthly
            payment. Use the calculator above to experiment with different term
            combinations and find a structure that fits your budget while
            minimizing total cost.
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
              href="/home-buying"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Home Buying Calculators
            </a>{" "}
            hub. Use the{" "}
            <a
              href="/home-buying/pmi-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              PMI Calculator
            </a>{" "}
            to estimate private mortgage insurance costs, or the{" "}
            <a
              href="/home-buying/refinance-break-even-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Refinance Break-Even Calculator
            </a>{" "}
            to evaluate whether refinancing your first mortgage saves money
            overall. The{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            can help you check whether adding a HELOC payment keeps your total
            debt-to-income ratio within lender limits, and the{" "}
            <a
              href="/debt/debt-payoff-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Debt Payoff Calculator
            </a>{" "}
            is useful if you plan to use HELOC proceeds for debt consolidation.
          </p>
        </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
      </div>
    </div>
  );
}
