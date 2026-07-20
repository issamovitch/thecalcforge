import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import LeaseVsBuyCalculator from "@/components/calculators/LeaseVsBuyCalculator";
import { formatCurrency } from "@/lib/loan-math";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── Build-time math helpers ─── */

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

function leaseMonthly(
  price: number,
  down: number,
  resPct: number,
  mf: number,
  term: number,
  tax: number,
) {
  const cap = price - down;
  const res = r2((price * resPct) / 100);
  const dep = r2(Math.max(0, (cap - res) / term));
  const fin = r2((cap + res) * mf);
  const pre = r2(dep + fin);
  const tx = r2(pre * (tax / 100));
  return { cap, res, dep, fin, pre, tx, total: r2(pre + tx) };
}

function loanMonthly(amount: number, apr: number, term: number) {
  if (apr <= 0) return r2(amount / term);
  const r = apr / 100 / 12;
  return r2(amount * (r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1));
}

function remBalance(principal: number, apr: number, term: number, paid: number) {
  if (paid >= term) return 0;
  if (apr <= 0) return r2(principal - (principal / term) * paid);
  const r = apr / 100 / 12;
  const f = Math.pow(1 + r, term);
  return r2(principal * (f - Math.pow(1 + r, paid)) / (f - 1));
}

function compare(
  price: number,
  tax: number,
  comp: number,
  lDown: number,
  resPct: number,
  mf: number,
  lTerm: number,
  bDown: number,
  apr: number,
  bTerm: number,
  resale: number,
) {
  const lp = leaseMonthly(price, lDown, resPct, mf, lTerm, tax);
  let totalLease = 0;
  let rem = comp;
  while (rem > 0) {
    const mc = Math.min(rem, lTerm);
    totalLease += lDown + lp.total * mc;
    rem -= lTerm;
  }
  totalLease = r2(totalLease);

  const purchaseTax = r2(price * (tax / 100));
  const loan = price - bDown + purchaseTax;
  const bm = loanMonthly(loan, apr, bTerm);
  const monthsPaid = Math.min(comp, bTerm);
  const totalBuy = r2(bDown + bm * monthsPaid);
  const bal = remBalance(loan, apr, bTerm, monthsPaid);
  const equity = Math.max(0, resale - bal);
  const netBuy = r2(totalBuy - equity);
  const diff = r2(totalLease - netBuy);
  const winner = Math.abs(diff) < 1 ? "tie" : diff > 0 ? "buy" : "lease";
  return { lp, bm, totalLease, totalBuy, bal, equity, netBuy, diff, winner };
}

/* ─── Computed examples ─── */

// S1: Main worked example - $35K, 7% tax, 36mo comparison
const S1 = compare(35000, 7, 36, 2000, 55, 0.00125, 36, 3500, 6.5, 60, 21000);

// S2: 60-month comparison (same terms, longer hold)
const S2 = compare(35000, 7, 60, 2000, 55, 0.00125, 36, 3500, 6.5, 60, 16000);

// S3a: Zero-tax state
const S3A = compare(35000, 0, 36, 2000, 55, 0.00125, 36, 3500, 6.5, 60, 21000);

// S3b: High-tax state (10%)
const S3B = compare(35000, 10, 36, 2000, 55, 0.00125, 36, 3500, 6.5, 60, 21000);

// S4: EV example - $45K EV, 60% residual, $7500 credit as cap reduction
const S4_LEASE = leaseMonthly(45000, 7500, 60, 0.001, 36, 7);
const S4_LEASE_TOTAL = r2(7500 + S4_LEASE.total * 36);
const S4_PURCHASE_TAX = r2(45000 * 0.07); // tax on full vehicle price
const S4_LOAN = loanMonthly(45000 - 7500 + S4_PURCHASE_TAX, 5.9, 60);
const S4_BUY_TOTAL = r2(7500 + S4_LOAN * 36); // credit acts as down payment
const S4_BAL = remBalance(45000 - 7500 + S4_PURCHASE_TAX, 5.9, 60, 36);
const S4_EQUITY = Math.max(0, 27000 - S4_BAL);
const S4_NET_BUY = r2(S4_BUY_TOTAL - S4_EQUITY);
const S4_DIFF = r2(S4_LEASE_TOTAL - S4_NET_BUY);

// S5: 24-month comparison (shorter hold, higher resale)
const S5 = compare(35000, 7, 24, 2000, 55, 0.00125, 36, 3500, 6.5, 60, 24000);

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/auto/lease-vs-buy-calculator`;
const pageTitle = "Lease vs Buy Car Calculator \u2013 Compare Total Cost | CalcForge";

export const metadata: Metadata = {
  title: pageTitle,
  description:
    "Free lease vs buy car calculator. Compare the true total cost of leasing versus financing over the same period, including resale value and equity.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: pageTitle,
    description:
      "Free lease vs buy car calculator. Compare the true total cost of leasing versus financing over the same period.",
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
      "Compare leasing vs buying a car. See total cost, equity, and break-even point.",
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
    question: "Is it always cheaper to lease than to buy?",
    answer:
      "No. A lease typically has a lower monthly payment because you are paying for depreciation rather than the full vehicle price. However, at the end of the lease you do not own anything, while a buyer retains equity in the car. Over a longer holding period, the equity advantage of buying usually makes it the lower total-cost option. The calculator above compares both sides over the same period and accounts for resale value so you can see which is actually cheaper for your situation.",
  },
  {
    question: "How does the resale value affect the lease vs buy decision?",
    answer:
      "Resale value is the single biggest factor that swings the decision toward buying. When you buy a car, the difference between what you paid and what the car is worth at the end is the real cost of ownership. If the vehicle retains a large portion of its value (for example, certain trucks, SUVs, or vehicles with strong brand demand), buying can be significantly cheaper than leasing even though the monthly loan payment is higher. The calculator lets you enter an estimated resale or trade-in value to see exactly how much equity you build.",
  },
  {
    question: "Does sales tax work differently for leases versus purchases?",
    answer:
      "In most states, lease tax is applied to each monthly payment, while purchase tax is applied to the full selling price up front. This means the lease tax is spread over the term and slightly reduced because you are only taxed on the depreciation portion. However, some states (such as Texas) require lease tax on the full selling price. The calculator applies tax to the monthly lease payment, which is the most common approach. If your state uses a different method, adjust your inputs accordingly.",
  },
  {
    question: "Is leasing or buying better for an electric vehicle?",
    answer:
      "Leasing can be attractive for electric vehicles because the federal EV tax credit of up to $7,500 can often be applied as a capitalized cost reduction on a lease, lowering the monthly payment even if your tax liability is too low to claim the credit on a purchase. On the buy side, the same credit is claimed on your tax return, which may not be fully usable. However, EV depreciation can be steep, and a buyer who qualifies for the full credit and holds the car long enough to benefit from lower fuel and maintenance costs may still come out ahead. The calculator lets you model both sides with your actual numbers.",
  },
  {
    question: "What is the break-even point between leasing and buying?",
    answer:
      "The break-even point is the month at which the cumulative net cost of buying (total payments minus equity) drops below the cumulative cost of leasing. Before this point, leasing is typically cheaper on a month-to-month basis because of the lower payment. After the break-even, the equity you have built by buying outweighs the higher loan payments. The calculator estimates this month automatically. In many cases the break-even falls within the first 24 to 48 months, which is why the decision is often close for a typical three-year comparison.",
  },
];

/* ─── Page Component ─── */

export default function LeaseVsBuyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD (server-rendered, no JS required) */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Auto Calculators", url: `${siteConfig.url}/auto` },
          { name: "Lease vs Buy Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Lease vs Buy Calculator"
        description="Free lease vs buy car calculator. Compare the true total cost of leasing versus financing over the same period, including resale value and equity."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Auto Calculators", href: "/auto" },
          { label: "Lease vs Buy Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Lease vs Buy Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A lease vs buy calculator compares the true total cost of leasing a
        vehicle versus financing a purchase over the same holding period. The
        core tradeoff is straightforward: a lease usually produces a lower
        monthly payment because you pay only for the vehicle&apos;s
        depreciation, while a purchase builds equity that you recoup when you
        sell or trade in. The calculator below accounts for down payments,
        interest rates, money factor, sales tax, loan balance, and resale value
        to show which option costs less in total and at what month buying
        breaks even.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <LeaseVsBuyCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── SEO Content (hidden from print) ─── */}
      <div className="print:hidden">

      <Separator className="my-12" />

      {/* H2: Lease vs Buy Car Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Lease vs Buy Car Calculator
        </h2>
        <p>
          The lease vs buy decision comes down to total cost of ownership over
          the period you plan to keep the vehicle. Leasing means lower monthly
          payments but zero equity at the end. Buying means higher payments but
          you own the car and can sell it. The net cost of buying is the total
          of all payments minus the resale value you receive when you sell. The
          net cost of leasing is simply the sum of all lease payments, because
          you return the vehicle with nothing to show for it.
        </p>
        <p>
          <strong>Worked example (computed by engine):</strong> A{" "}
          {formatCurrency(35000)} vehicle at 7% sales tax, compared over 36
          months. The lease uses {formatCurrency(2000)} down, a 55% residual
          value, a money factor of 0.00125 (3% APR), and a 36-month term.
          The lease payment is {formatCurrency(S1.lp.total)}/month, for a
          total lease cost of {formatCurrency(S1.totalLease)}. The purchase
          uses {formatCurrency(3500)} down, a 6.5% loan APR, and a 60-month
          term. The loan payment is {formatCurrency(S1.bm)}/month, total
          payments over 36 months are {formatCurrency(S1.totalBuy)}, the
          remaining loan balance is {formatCurrency(S1.bal)}, and the
          estimated resale value of {formatCurrency(21000)} leaves equity of{" "}
          {formatCurrency(S1.equity)}. Net cost of buying is{" "}
          {formatCurrency(S1.netBuy)}, which is{" "}
          {formatCurrency(Math.abs(S1.diff))}{" "}
          {S1.winner === "buy" ? "less" : "more"} than leasing.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Is It Better to Lease or Buy a Car Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Is It Better to Lease or Buy a Car Calculator
        </h2>
        <p>
          Whether leasing or buying is the better financial choice depends on
          three variables: how long you keep the car, how well the car holds
          its value, and what you pay in interest or money factor. If you
          replace your car every three years, leasing can be competitive because
          the lease payment covers only the steepest part of the depreciation
          curve. If you keep a car five years or longer, buying almost always
          wins because the depreciation slows while the loan is paid off, and
          you accumulate meaningful resale equity.
        </p>
        <p>
          <strong>Longer holding period example:</strong> Using the same{" "}
          {formatCurrency(35000)} vehicle with identical lease and loan terms
          but extending the comparison to 60 months, the lease requires two
          consecutive 36-month terms (with a second down payment of{" "}
          {formatCurrency(2000)}). The total lease cost rises to{" "}
          {formatCurrency(S2.totalLease)}. The purchase side: 60 months of
          loan payments of {formatCurrency(S2.bm)}/month plus{" "}
          {formatCurrency(3500)} down equals {formatCurrency(S2.totalBuy)}.
          With a 60-month resale estimate of {formatCurrency(16000)} and the
          loan fully paid off, the net cost of buying drops to{" "}
          {formatCurrency(S2.netBuy)}. Buying saves{" "}
          {formatCurrency(Math.abs(S2.diff))} over the 60-month period, a
          larger gap than at 36 months, confirming that longer holding periods
          favor purchasing.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Lease vs Finance Calculator with Tax */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Lease vs Finance Calculator with Tax
        </h2>
        <p>
          Sales tax treatment differs between leases and purchases and can shift
          the comparison by a meaningful amount. On a lease, most states apply
          tax to each monthly payment, so you are taxed only on the depreciation
          portion rather than the full vehicle price. On a purchase, tax is
          typically applied to the selling price up front and either paid in
          cash or rolled into the loan, increasing the financed amount. The net
          effect is that leasing often results in less total tax paid over the
          same period.
        </p>
        <p>
          <strong>Tax comparison (computed by engine):</strong> The base{" "}
          {formatCurrency(35000)} vehicle over 36 months, same lease and loan
          terms. In a zero-tax state (0% sales tax), the lease total is{" "}
          {formatCurrency(S3A.totalLease)} and the net buy cost is{" "}
          {formatCurrency(S3A.netBuy)}, with buying cheaper by{" "}
          {formatCurrency(Math.abs(S3A.diff))}. In a 7% tax state, the lease
          total rises to {formatCurrency(S1.totalLease)} and the net buy cost
          to {formatCurrency(S1.netBuy)}, with buying cheaper by{" "}
          {formatCurrency(Math.abs(S1.diff))}. In a 10% tax state, the lease
          total is {formatCurrency(S3B.totalLease)} and the net buy cost is{" "}
          {formatCurrency(S3B.netBuy)}, with buying cheaper by{" "}
          {formatCurrency(Math.abs(S3B.diff))}. The tax difference between 0%
          and 10% is {formatCurrency(Math.abs(S3B.totalLease - S3A.totalLease))}{" "}
          on the lease side. Note that some states (such as Texas) tax leases
          on the full selling price, which would narrow this gap.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Lease vs Buy Calculator Electric Car */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Lease vs Buy Calculator Electric Car
        </h2>
        <p>
          Electric vehicles add a layer of complexity to the lease versus buy
          calculation because of the federal EV tax credit (up to{" "}
          {formatCurrency(7500)} for qualifying vehicles). On a lease, the
          lessor (the finance company) claims the credit and typically passes it
          through as a capitalized cost reduction, which lowers the monthly
          payment for any lessee regardless of their tax liability. On a
          purchase, you must have enough federal tax liability in the year you
          buy the car to claim the full credit. If your liability is too low,
          you may not benefit from the full amount.
        </p>
        <p>
          <strong>EV example (computed by engine):</strong> A{" "}
          {formatCurrency(45000)} electric vehicle with the full{" "}
          {formatCurrency(7500)} credit applied. Lease side:{" "}
          {formatCurrency(7500)} cap cost reduction (the credit), 60% residual
          (EVs with strong demand hold value well), money factor 0.00100 (2.4%
          APR), 36-month term, 7% tax. The monthly lease payment is{" "}
          {formatCurrency(S4_LEASE.total)} for a total lease cost of{" "}
          {formatCurrency(S4_LEASE_TOTAL)}. Purchase side: the{" "}
          {formatCurrency(7500)} credit applied as a down payment equivalent,
          {formatCurrency(37500)} financed at 5.9% for 60 months. Monthly
          payment is {formatCurrency(S4_LOAN)}. Over 36 months, total
          payments are {formatCurrency(S4_BUY_TOTAL)}, remaining balance is{" "}
          {formatCurrency(S4_BAL)}, and with an estimated {formatCurrency(27000)}{" "}
          resale value the equity is {formatCurrency(S4_EQUITY)}. Net cost of
          buying is {formatCurrency(S4_NET_BUY)}.{" "}
          {S4_DIFF > 0
            ? `Leasing costs ${formatCurrency(Math.abs(S4_DIFF))} more than buying in this scenario.`
            : S4_DIFF < 0
            ? `Buying costs ${formatCurrency(Math.abs(S4_DIFF))} more than leasing in this scenario.`
            : "Both options cost roughly the same."}{" "}
          The higher residual value on the EV strengthens the equity case for
          buying if you plan to hold the car beyond the lease term.
        </p>
      </section>

      <Separator className="my-10" />

      {/* H2: Lease vs Buy Break Even Calculator */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Lease vs Buy Break Even Calculator
        </h2>
        <p>
          The break-even point between leasing and buying is the month at which
          the cumulative net cost of buying drops below the cumulative cost of
          leasing. Before break-even, leasing is cheaper month by month. After
          break-even, the equity you have accumulated by owning the vehicle
          outweighs the higher loan payments. The calculator estimates this
          month by interpolating the resale value over time and comparing
          cumulative costs at each month.
        </p>
        <p>
          <strong>Short-hold example:</strong> Comparing the same{" "}
          {formatCurrency(35000)} vehicle over just 24 months, with a higher
          estimated resale of {formatCurrency(24000)} (less time for
          depreciation). The lease total is {formatCurrency(S5.totalLease)}.
          The buy total payments are {formatCurrency(S5.totalBuy)}, remaining
          balance is {formatCurrency(S5.bal)}, equity is{" "}
          {formatCurrency(S5.equity)}, and net cost of buying is{" "}
          {formatCurrency(S5.netBuy)}.{" "}
          {S5.winner === "buy"
            ? `Buying is cheaper by ${formatCurrency(Math.abs(S5.diff))} even at 24 months because the car has depreciated very little.`
            : S5.winner === "lease"
            ? `Leasing is still cheaper by ${formatCurrency(Math.abs(S5.diff))} at 24 months. The break-even would come later.`
            : "Both are nearly identical at 24 months."}{" "}
          In most scenarios with typical residuals and interest rates, the
          break-even falls between months 24 and 48. If your planned holding
          period is shorter than the break-even month, leasing is the lower-cost
          option. If it is longer, buying wins.
        </p>
      </section>

      <FaqSection faqs={faqs} />

      <Separator className="my-12" />

      {/* ─── Related Calculators ─── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Related Calculators</h2>
        <p className="text-muted-foreground">
          To compute the lease payment alone, use the{" "}
          <a
            href="/auto/auto-lease-payment-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Auto Lease Calculator
          </a>
          . For the purchase side, the{" "}
          <a
            href="/loans/auto-loan-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Auto Loan Calculator
          </a>{" "}
          provides a detailed amortization schedule. If you have not yet
          decided on a vehicle price, the{" "}
          <a
            href="/auto/car-affordability-calculator"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            Car Affordability Calculator
          </a>{" "}
          helps you find the maximum price that fits your budget. Browse all
          auto tools on the{" "}
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
