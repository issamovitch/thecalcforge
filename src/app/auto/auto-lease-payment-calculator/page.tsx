import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import AutoLeaseCalculator from "@/components/calculators/AutoLeaseCalculator";
import { formatCurrency } from "@/lib/loan-math";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

export const dynamic = "force-static";

/* ─── Build-time computed examples ─── */

function leaseCalc(
  price: number,
  down: number,
  resPct: number,
  mf: number,
  term: number,
  tax: number,
) {
  const cap = price - down;
  const res = Math.round((price * resPct) / 100 * 100) / 100;
  const dep = Math.round((Math.max(0, cap - res) / term) * 100) / 100;
  const fin = Math.round((cap + res) * mf * 100) / 100;
  const pre = Math.round((dep + fin) * 100) / 100;
  const tx = Math.round(pre * (tax / 100) * 100) / 100;
  const total = Math.round((pre + tx) * 100) / 100;
  const leaseCost = Math.round(total * term * 100) / 100;
  return { cap, res, dep, fin, pre, tx, total, leaseCost, apr: Math.round(mf * 2400 * 10000) / 10000 };
}

// S1: Money factor example - $35K, $2K down, 55% residual, MF 0.00125, 36mo, 7% tax
const S1 = leaseCalc(35000, 2000, 55, 0.00125, 36, 7);

// S2a: Low residual (50%) - same base
const S2A = leaseCalc(35000, 2000, 50, 0.00125, 36, 7);

// S2b: High residual (60%) - same base
const S2B = leaseCalc(35000, 2000, 60, 0.00125, 36, 7);

// S5: Buyout example
const S5_BUYOUT = Math.round((S1.res + 350) * 100) / 100;

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/auto/auto-lease-payment-calculator`;
const pageTitle = "Auto Lease Calculator \u2013 Monthly Lease Payment";

export const metadata: Metadata = {
  title: pageTitle,
  description:
    "Free car lease calculator. Enter price, residual, money factor, and term to see your monthly lease payment broken into depreciation, finance, and tax.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: pageTitle,
    description:
      "Free car lease calculator. Enter price, residual, money factor, and term to see your monthly lease payment.",
    url: pageUrl,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description:
      "Free car lease calculator with money factor, residual value, and buyout estimate.",
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
    question: "What is a good money factor on a car lease?",
    answer:
      "A money factor below 0.00200 (equivalent to 4.80% APR) is generally considered competitive for a new-vehicle lease. Manufacturers frequently offer subvented rates through their captive finance companies, which can push the money factor as low as 0.00004 (0.10% APR) on promoted models. The exact threshold for a \"good\" rate depends on the vehicle, the lease term, and your credit profile. The calculator above converts between money factor and APR so you can compare the lease rate to a conventional loan rate.",
  },
  {
    question: "Can I negotiate the residual value on a lease?",
    answer:
      "The residual value is set by the leasing company (often the manufacturer's captive finance arm) using industry depreciation guides like ALG. In practice, the residual is not a negotiation point the way the selling price is. However, you can choose a vehicle or trim level with a higher published residual, which directly lowers the monthly payment. A higher residual means the lessor expects the car to retain more value, so less depreciation is passed to you as the lessee.",
  },
  {
    question: "What fees should I expect on a car lease beyond the monthly payment?",
    answer:
      "Common lease fees include an acquisition fee (also called a bank fee, typically $300 to $1,000), a disposition fee at lease end ($200 to $500), a purchase option fee if you buy the car, and documentation or registration fees. Some of these are negotiable or can be rolled into the cap cost. The calculator above includes a purchase option fee input so you can see the total buyout price, but does not add acquisition or disposition fees to the monthly payment.",
  },
  {
    question: "What happens if I exceed the mileage limit on my lease?",
    answer:
      "Most leases include an annual mileage allowance, commonly 10,000 or 12,000 miles per year. If you exceed the total allowance, the lessor charges an excess-mileage penalty, typically $0.15 to $0.30 per mile. On a 36-month lease with a 12,000-mile-per-year allowance (36,000 total), driving 45,000 miles would mean 9,000 excess miles. At $0.20 per mile, that adds $1,800 to the cost of the lease. This cost is not included in the calculator above, so factor it in separately if you expect to exceed your mileage limit.",
  },
  {
    question: "Is it better to lease or buy a car?",
    answer:
      "Leasing and buying serve different situations. Leasing typically produces a lower monthly payment than financing a purchase because you are paying for depreciation rather than the full vehicle price. However, at lease end you do not own the car. Buying costs more per month but builds equity. The better choice depends on how long you keep vehicles, your annual mileage, whether you can deduct lease payments for business use, and whether you want to avoid the risk of negative equity on a long loan term. Use the calculator above for the lease side, then compare with the Auto Loan Calculator to see the purchase side.",
  },
];

/* ─── Page Component ─── */

export default function AutoLeasePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Auto Calculators", url: `${siteConfig.url}/auto` },
          { name: "Auto Lease Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Auto Lease Calculator"
        description="Free car lease calculator. Enter price, residual, money factor, and term to see your monthly lease payment broken into depreciation, finance, and tax."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Auto Calculators", href: "/auto" },
          { label: "Auto Lease Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Auto Lease Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        An auto lease calculator computes the monthly payment by breaking it
        into three components: depreciation, a finance charge (also called the
        rent charge), and tax. Unlike a purchase loan where each payment
        reduces a principal balance, a lease payment covers the vehicle&apos;s
        expected drop in value over the term, plus a finance cost on the
        capitalized amount, plus applicable sales tax. The key inputs are the
        negotiated price (adjusted cap cost), the residual value, the money
        factor, and the lease term.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <AutoLeaseCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── SEO Content (hidden from print) ─── */}
      <div className="print:hidden">

      <Separator className="my-12" />

      {/* H2: Car Lease Payment Calculator with Money Factor */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Car Lease Payment Calculator with Money Factor
        </h2>
        <p>
          The money factor is the lease industry&apos;s way of expressing the
          interest component of a lease. It is a small decimal (for example,
          0.00125) that converts to an annual percentage rate by multiplying
          by 2,400. A money factor of 0.00125 equals a 3.00% APR. The finance
          charge portion of each monthly payment is calculated by multiplying
          the sum of the adjusted cap cost and the residual value by the money
          factor. A lower money factor produces a lower finance charge and a
          lower total monthly payment.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(35000)} vehicle with{" "}
          {formatCurrency(2000)} down, a 55% residual value, a money factor
          of 0.00125 ({S1.apr}% APR), a 36-month term, and 7% sales tax
          produces an adjusted cap cost of {formatCurrency(S1.cap)}. The
          residual value is {formatCurrency(S1.res)}. Monthly depreciation
          is {formatCurrency(S1.dep)}, the finance charge is{" "}
          {formatCurrency(S1.fin)}, pre-tax payment is{" "}
          {formatCurrency(S1.pre)}, tax is {formatCurrency(S1.tx)}, and the
          total monthly lease payment is {formatCurrency(S1.total)}. Over
          36 months the total lease cost is {formatCurrency(S1.leaseCost)}.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Lease Payment Calculator Residual Value */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Lease Payment Calculator Residual Value
        </h2>
        <p>
          The residual value is the leasing company&apos;s estimate of what the
          vehicle will be worth at the end of the lease term, expressed as a
          percentage of MSRP. It is set by the lessor using industry
          depreciation data and is not typically negotiable. A higher residual
          value means the vehicle is expected to retain more of its worth,
          which reduces the amount of depreciation you pay each month.
        </p>
        <p>
          <strong>Comparison (computed by engine):</strong> Using the same{" "}
          {formatCurrency(35000)} vehicle with{" "}
          {formatCurrency(2000)} down, MF 0.00125, 36 months, and 7% tax:
          at a 50% residual ({formatCurrency(S2A.res)}), the monthly payment
          is {formatCurrency(S2A.total)} for a total cost of{" "}
          {formatCurrency(S2A.leaseCost)}. At a 60% residual
          ({formatCurrency(S2B.res)}), the payment drops to{" "}
          {formatCurrency(S2B.total)} for a total of{" "}
          {formatCurrency(S2B.leaseCost)}. The 10-percentage-point
          difference in residual value changes the monthly payment by{" "}
          {formatCurrency(Math.abs(S2A.total - S2B.total))} and saves{" "}
          {formatCurrency(Math.abs(S2A.leaseCost - S2B.leaseCost))} over the
          full lease term.
        </p>
        <p>
          Note that a higher residual also means a higher buyout price at
          lease end. If you plan to purchase the vehicle, the lower payment
          from a high residual is offset by a larger final payment.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: How to Calculate a Car Lease Payment */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          How to Calculate a Car Lease Payment
        </h2>
        <p>
          The standard lease payment formula has three steps. First, calculate
          the monthly depreciation by subtracting the residual value from the
          adjusted cap cost and dividing by the lease term. Second, calculate
          the monthly finance charge by adding the adjusted cap cost and
          residual value together and multiplying by the money factor. Third,
          add applicable sales tax, which in most states is applied to the
          combined depreciation and finance charge.
        </p>
        <p>
          <strong>Step-by-step with numbers:</strong> Using a{" "}
          {formatCurrency(35000)} MSRP, {formatCurrency(2000)} down
          (adjusted cap cost = {formatCurrency(S1.cap)}), 55% residual
          ({formatCurrency(S1.res)}), money factor 0.00125, and 36-month
          term:
        </p>
        <p>
          Depreciation = ({formatCurrency(S1.cap)} -{" "}
          {formatCurrency(S1.res)}) / 36 = {formatCurrency(S1.dep)} per
          month. Finance charge = ({formatCurrency(S1.cap)} +{" "}
          {formatCurrency(S1.res)}) x 0.00125 = {formatCurrency(S1.fin)} per
          month. Pre-tax payment = {formatCurrency(S1.dep)} +{" "}
          {formatCurrency(S1.fin)} = {formatCurrency(S1.pre)}. Tax ={" "}
          {formatCurrency(S1.pre)} x 7% = {formatCurrency(S1.tx)}. Total
          monthly payment = {formatCurrency(S1.total)}.
        </p>
        <p>
          This formula is the same one used by dealerships and leasing
          companies. The calculator above applies it automatically and shows
          each component separately.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Car Lease Calculator with Tax by State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Car Lease Calculator with Tax by State
        </h2>
        <p>
          Lease tax treatment varies by state and affects the total cost of the
          lease. The most common approach, used by the majority of states, is
          to apply the sales tax rate to each monthly payment. Under this
          method, the tax is included in the payment shown by the calculator
          above.
        </p>
        <p>
          Some states require tax to be paid on the total of all lease
          payments upfront. In those states (including Texas and Illinois in
          many cases), the total tax is added to the capitalized cost at the
          start of the lease, which increases the monthly payment slightly
          because the finance charge is then calculated on a larger base.
          Other states tax the full selling price of the vehicle rather than
          the depreciation, which can produce a significantly higher tax
          amount.
        </p>
        <p>
          Because the rules differ, the calculator uses the most common
          method (tax on the monthly payment). If your state uses a different
          approach, consult your lease agreement or your state&apos;s
          department of revenue for the exact treatment.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Lease Buyout Payment Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Lease Buyout Payment Calculator
        </h2>
        <p>
          At the end of a closed-end lease, you typically have the option to
          purchase the vehicle for its residual value plus any purchase option
          fee stated in the contract. The buyout price is therefore the
          residual value plus the purchase option fee. Using the worked
          example above, the residual is {formatCurrency(S1.res)} and a
          typical purchase option fee of {formatCurrency(350)} produces a
          buyout price of {formatCurrency(S5_BUYOUT)}.
        </p>
        <p>
          Whether buying out the lease makes financial sense depends on the
          vehicle&apos;s actual market value at that point compared to the
          buyout price. If the car is worth more than the buyout price on the
          open market, purchasing it and immediately selling could produce a
          profit. If it is worth less, returning the vehicle and walking away
          avoids the loss. The calculator shows the buyout price in the
          results so you can compare it against third-party valuations when
          the time comes.
        </p>
      </section>

      <FaqSection faqs={faqs} />

      <Separator className="my-12" />

      {/* ─── Related Calculators ─── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Related Calculators</h2>
        <p className="text-muted-foreground">
          Comparing lease versus purchase? Use the{" "}
          <a
            href="/loans/auto-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Auto Loan Calculator
          </a>{" "}
          to compute the monthly payment and total cost of financing the same
          vehicle. To determine how much vehicle you can afford in the first
          place, see the{" "}
          <a
            href="/auto/car-affordability-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Car Affordability Calculator
          </a>
          . Browse all auto tools on the{" "}
          <a
            href="/auto"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Auto Calculators
          </a>{" "}
          hub.
        </p>
      </section>
      </div>

      <div className="print:hidden">
        <AdSlot slot="footer" lazy />
      </div>
    </div>
  );
}
