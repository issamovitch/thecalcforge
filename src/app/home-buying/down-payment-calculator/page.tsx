import type { Metadata } from "next";
import { siteConfig, VERIFIED_DATE } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import DownPaymentCalculator from "@/components/calculators/DownPaymentCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/home-buying/down-payment-calculator`;
const pageTitle =
  "Down Payment Calculator \u2013 How Much to Put Down | CalcForge";
const pageDescription =
  "Free down payment calculator. See how much to put down on a house, your loan amount, whether you avoid PMI at 20%, and the cash you need at closing.";

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
    question: "How much should I put down on a house?",
    answer:
      "The ideal down payment depends on your loan program, financial situation, and goals. Conventional loans require as little as 3% down, FHA loans require 3.5%, and VA and USDA loans offer 0% down for eligible borrowers. Putting 20% down on a conventional loan eliminates the private mortgage insurance requirement, which can save $100 to $300 or more per month. However, waiting to save 20% means delaying homeownership and potentially facing higher home prices. Many buyers find that a 5% to 10% down payment strikes a reasonable balance between upfront cost and monthly obligation.",
  },
  {
    question: "Can my down payment come from a gift?",
    answer:
      "Yes. Conventional, FHA, VA, and USDA loan programs all allow down payment gifts from family members, though the rules differ. For conventional loans backed by Fannie Mae or Freddie Mac, the entire down payment can be a gift on one-unit primary residences. FHA loans allow gifts from relatives, employers, charitable organizations, and government agencies. VA loans permit gifts from nearly any source. In all cases, the gift must be documented with a gift letter stating that no repayment is expected. Cash gifts must be traceable; lenders will want to see the donor's bank statements showing the funds transferring to your account.",
  },
  {
    question: "What is the difference between down payment and closing costs?",
    answer:
      "The down payment is the portion of the home price you pay upfront, which reduces the loan amount. Closing costs are separate fees charged by lenders, title companies, appraisers, and local governments to process the transaction. Closing costs typically range from 2% to 5% of the home price and include lender origination fees, title insurance, appraisal fees, escrow deposits, and prepaid items like property taxes and homeowner's insurance. Both are due at closing, so total cash to close is the down payment plus closing costs. For a $400,000 home with 10% down and 3% closing costs, you would need $40,000 (down) plus $12,000 (closing) for a total of $52,000 at closing.",
  },
  {
    question: "Does a larger down payment get a better interest rate?",
    answer:
      "Generally yes. Lenders price loans based on risk, and a higher down payment lowers the loan-to-value ratio, which reduces the lender's exposure. Borrowers who put 20% or more down typically receive better rates than those putting 5% or less. The difference is usually modest, often 0.125% to 0.375% in rate. On a $320,000 loan (20% down on $400,000), a 0.25% rate improvement saves roughly $50 per month and about $18,000 in total interest over 30 years. However, the opportunity cost of tying up extra cash should also be considered. If that cash could earn more invested elsewhere, a smaller down payment at a slightly higher rate might make financial sense.",
  },
  {
    question: "What are down payment assistance programs?",
    answer:
      "Down payment assistance (DPA) programs are offered by state and local housing finance agencies, nonprofits, and some employers to help buyers cover the upfront cost. Programs vary by location but commonly provide grants (no repayment required), forgivable second mortgages (forgiven after a set period if you remain in the home), or low-interest deferred-payment loans. Eligibility typically depends on income limits, purchase price limits, and first-time homebuyer status. The National Council of State Housing Agencies (NCSHA) maintains a directory of state housing finance agencies where you can search for programs in your area.",
  },
];

/* ─── Page Component ─── */

export default function DownPaymentCalculatorPage() {
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
          { name: "Down Payment Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Down Payment Calculator"
        description="Free online down payment calculator. See how much to put down on a house, your loan amount, whether you avoid PMI, and total cash needed at closing."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Home Buying Calculators", href: "/home-buying" },
          { label: "Down Payment Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Down Payment Calculator
      </h1>

      {/* Intro paragraph: targets featured snippet */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A down payment is the cash you pay upfront when buying a home. It
        reduces the mortgage loan amount and determines your loan-to-value
        ratio (LTV), which affects whether you need private mortgage insurance,
        the interest rate you qualify for, and the total cost of the loan. This
        down payment calculator lets you enter a home price and adjust the down
        payment by percentage or dollar amount, then shows the loan amount, LTV,
        PMI status, closing costs, and total cash needed at closing. Loan-program
        presets (VA, FHA, conventional) let you compare minimums instantly.
      </p>

      {/* Calculator (client component) */}
      <div className="mt-8">
        <DownPaymentCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections (H2 long-tail keywords), hidden from print ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Down Payment Calculator by Home Price */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Down Payment Calculator by Home Price
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The down payment amount scales directly with the home price. At a
            fixed percentage, a more expensive home requires proportionally more
            cash upfront, and closing costs increase in parallel. The calculator
            above handles any home price between $50,000 and $2,000,000, so you
            can compare scenarios across price points.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Down Payment at Various Home Prices (20% Down, 3% Closing Costs)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>$300,000 home:</strong> $60,000 down, $240,000 loan
                (80% LTV), $9,000 closing costs, $69,000 cash to close.{" "}
                <strong>$400,000 home:</strong> $80,000 down, $320,000 loan
                (80% LTV), $12,000 closing costs, $92,000 cash to close.{" "}
                <strong>$500,000 home:</strong> $100,000 down, $400,000 loan
                (80% LTV), $15,000 closing costs, $115,000 cash to close.{" "}
                <strong>$600,000 home:</strong> $120,000 down, $480,000 loan
                (80% LTV), $18,000 closing costs, $138,000 cash to close. All
                assume 20% down with no PMI.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            As home prices rise, the gap between what lenders require (3% to 5%
            for conventional) and the 20% PMI-free threshold widens in dollar
            terms. On a $600,000 home, the difference between 5% down ($30,000)
            and 20% down ($120,000) is $90,000. For buyers who cannot bridge
            that gap, a lower down payment with PMI is the practical path, with
            the understanding that PMI can be removed later once equity reaches
            20% through appreciation or principal paydown.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Down Payment for a $400,000 House */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Down Payment for a $400,000 House
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            For a $400,000 home, the down payment depends on the loan program
            and how much you want to put down. Below is a comparison of common
            scenarios, including estimated closing costs at 3%.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                $400,000 Home: Down Payment Comparison (3% Closing Costs)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>VA/USDA (0% down):</strong> $0 down, $400,000 loan
                (100% LTV), $12,000 closing costs, $12,000 total cash to close.
                No PMI, but VA has a funding fee (2.15% to 3.3% of loan).{" "}
                <strong>Conventional 3%:</strong> $12,000 down, $388,000 loan
                (97% LTV), $12,000 closing costs, $24,000 total cash. PMI
                required.{" "}
                <strong>FHA 3.5%:</strong> $14,000 down, $386,000 loan (96.5%
                LTV), $12,000 closing costs, $26,000 total cash. FHA MIP
                required (1.75% upfront plus annual premium).{" "}
                <strong>Conventional 5%:</strong> $20,000 down, $380,000 loan
                (95% LTV), $12,000 closing costs, $32,000 total cash. PMI
                required.{" "}
                <strong>Conventional 20%:</strong> $80,000 down, $320,000 loan
                (80% LTV), $12,000 closing costs, $92,000 total cash. No PMI.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            The jump from 5% to 20% down on a $400,000 home is $60,000 in
            additional upfront cash. Whether that extra outlay makes sense
            depends on whether you have the funds available, whether the PMI
            savings over time outweigh the opportunity cost of locking up that
            cash, and how long you plan to stay in the home. If you expect to
            stay fewer than 5 to 7 years, PMI may cost less than the interest
            you would earn on that $60,000 invested elsewhere.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: FHA Down Payment Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            FHA Down Payment Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            FHA loans require a minimum down payment of 3.5% of the purchase
            price for borrowers with credit scores of 580 or above. Borrowers
            with scores between 500 and 579 must put at least 10% down. FHA
            loans are insured by the Federal Housing Administration and are
            available through FHA-approved lenders.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            In addition to the down payment, FHA loans carry a mortgage
            insurance premium (MIP). There is an upfront MIP of 1.75% of the
            loan amount, which can be rolled into the loan balance, plus an
            annual MIP that ranges from 0.15% to 0.75% depending on the loan
            term and LTV. For a $400,000 home with 3.5% down, the down payment
            is $14,000, the base loan is $386,000, the upfront MIP is $6,755
            (often financed), and the annual MIP adds roughly $177 to $290 per
            month depending on the term.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            FHA mortgage insurance generally lasts for the life of the loan if
            the down payment is less than 10% (for loans originated after June
            2013). With 10% or more down, MIP cancels after 11 years. This is
            a key difference from conventional PMI, which drops off at 78% LTV.
            Use the calculator above with the FHA 3.5% preset to see the down
            payment and LTV, then switch to the{" "}
            <a
              href="/home-buying/pmi-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              PMI Calculator
            </a>{" "}
            to compare FHA MIP against conventional PMI costs.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: 3 Percent Down Payment Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            3 Percent Down Payment Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A 3% down conventional loan is the lowest down payment option
            available outside of VA and USDA programs. Fannie Mae HomeReady and
            Freddie Mac Home Possible programs both offer 3% down for qualified
            borrowers, with income limits that vary by location. Standard
            conventional 3% down products without income restrictions are also
            available from many lenders.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            At 3% down, the loan-to-value ratio is 97%, which means private
            mortgage insurance is required. Using a $400,000 home as an example,
            a 3% down payment is $12,000, producing a loan of $388,000. The
            PMI cost at 97% LTV depends on credit score, but a borrower in the
            good credit range (720-759) might pay roughly 0.80% to 1.05%
            annually on the loan amount, or approximately $259 to $340 per
            month. At the same rate, a borrower with excellent credit (760+)
            might pay 0.30% to 0.55%, or roughly $97 to $178 per month.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The advantage of 3% down is the lower upfront cash requirement,
            which makes homeownership accessible sooner. The tradeoff is higher
            monthly costs (PMI plus interest on a larger loan) and slower
            equity growth. If home prices appreciate, the higher leverage works
            in your favor, but if prices decline, you could end up owing more
            than the home is worth. Setting the calculator to 3% and then
            comparing against 5%, 10%, and 20% shows the exact dollar impact at
            each level.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Down Payment and Closing Cost Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Down Payment and Closing Cost Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The total cash you need at closing is the down payment plus all
            closing costs. This combined figure, often called cash to close, is
            what buyers must have available on the day of settlement. Many
            buyers focus on the down payment alone and are surprised by the
            additional 2% to 5% needed for closing costs.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Closing costs include lender origination fees (typically 0.5% to 1%
            of the loan), appraisal fees ($300 to $600), title insurance
            ($1,000 to $2,500 depending on location and loan amount), attorney
            fees where applicable, recording fees, escrow deposits for
            property taxes and insurance (usually 2 to 6 months of each), and
            prepaid interest from the closing date to the first payment date.
            Some of these costs, such as escrow deposits and prepaid interest,
            are not true fees but still require cash at closing.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Cash to Close Examples at 3% Estimated Closing Costs
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>$300,000 home, 5% down:</strong> $15,000 down + $9,000
                closing = $24,000 total.{" "}
                <strong>$400,000 home, 10% down:</strong> $40,000 down +
                $12,000 closing = $52,000 total.{" "}
                <strong>$500,000 home, 20% down:</strong> $100,000 down +
                $15,000 closing = $115,000 total. Closing cost percentage can
                vary; some markets run 4% to 5%. Always request a Loan Estimate
                from your lender for an itemized breakdown.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            In some cases, you can negotiate for the seller to pay a portion of
            your closing costs through a seller concession, typically up to 3%
            of the purchase price on conventional loans and up to 6% on FHA
            loans. This does not reduce your total cost but shifts some of it
            to the seller, reducing the cash you need at closing. Lender credits
            in exchange for a slightly higher interest rate are another option.
            The calculator above includes the closing cost field so you can
            model these scenarios and see the exact cash-to-close figure for
            any combination of home price, down payment, and closing cost
            estimate.
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
              href="/home-buying"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Home Buying Calculators
            </a>{" "}
            hub. If your down payment is below 20%, use the{" "}
            <a
              href="/home-buying/pmi-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              PMI Calculator
            </a>{" "}
            to estimate the monthly insurance cost and see when it drops off. The{" "}
            <a
              href="/home-buying/refinance-break-even-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Refinance Break-Even Calculator
            </a>{" "}
            helps you evaluate whether refinancing to eliminate PMI or lower
            your rate saves money. The{" "}
            <a
              href="/home-buying/heloc-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              HELOC Calculator
            </a>{" "}
            shows how much you can borrow against home equity after building
            equity through your down payment and mortgage payments. The{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            checks whether your total monthly debt payments, including the new
            mortgage, fit within lender qualification limits.
          </p>
        </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
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