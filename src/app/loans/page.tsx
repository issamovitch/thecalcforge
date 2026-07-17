import type { Metadata } from "next";
import { siteConfig, calculatorPages } from "@/config/site.config";
import { HubPage, type HubCalculator, type HubFaqItem } from "@/components/hub/HubPage";
import { calculateLoan, formatCurrency, formatPercent } from "@/lib/loan-math";

/* ─── Computed example (module scope, static generation) ─── */
const EX = calculateLoan({ loanAmount: 5000, apr: 10, termMonths: 36 });

/* ─── SEO Metadata ─── */
export const metadata: Metadata = {
  title: "Loan Calculators – Free Payment, APR & Amortization Tools | CalcForge",
  description:
    "Loan calculators to estimate payments, APR, and total cost for any loan type. Free amortization tools for title loans, payday loans, and more at CalcForge.",
  alternates: { canonical: `${siteConfig.url}/loans` },
  openGraph: {
    title: "Loan Calculators – Free Payment, APR & Amortization Tools | CalcForge",
    description:
      "Loan calculators to estimate payments, APR, and total cost for any loan type. Free amortization tools at CalcForge.",
    url: `${siteConfig.url}/loans`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
};

/* ─── Hub data ─── */
const loansCalculators: readonly HubCalculator[] = calculatorPages
  .filter((p) => p.category === "loans")
  .map((p) => ({
    label: p.label,
    href: p.href,
    longDescription: p.longDescription,
    typesCopy: p.typesCopy,
    primaryKeyword: p.primaryKeyword,
  }));

const faq: HubFaqItem[] = [
  {
    question: "How accurate are online loan calculators?",
    answer:
      "CalcForge's loan calculators use the standard amortizing formula and produce results that match lender disclosures, rounded to the nearest cent. They assume fixed rates and fixed payments. Actual loan costs may differ if the loan includes variable rates, origination fees, or late charges not entered into the calculator.",
  },
  {
    question: "What is the difference between APR and interest rate?",
    answer:
      "The interest rate is the cost of borrowing the principal, typically expressed as an annual percentage. APR includes the interest rate plus certain fees, giving a broader view of the total yearly cost. For payday and title loans, the APR can be significantly higher than a stated interest rate because credit access business fees and other charges are included in the calculation.",
  },
  {
    question: "How does loan term affect total cost?",
    answer:
      "A longer loan term reduces each individual payment but increases the total interest paid over the life of the loan. A shorter term means higher monthly payments but less total cost. CalcForge's calculators show both the monthly payment and the total repayment so you can compare terms side by side.",
  },
  {
    question: "Can I use a loan calculator for early payoff planning?",
    answer:
      "Yes. The title loan calculator includes an early payoff feature that lets you add extra monthly payments starting from any month. The tool recalculates the amortization schedule and shows how much interest you save and how many months you shorten the loan. Switch to the amortizing calculator on any tool page and adjust the inputs.",
  },
  {
    question: "What is an amortization schedule?",
    answer:
      "An amortization schedule is a table showing every payment over the life of the loan. Each row breaks down how much of the payment goes toward principal and how much goes toward interest. Early in the loan, most of each payment covers interest. Over time, more goes toward principal until the balance reaches zero. Every CalcForge loan calculator generates this schedule automatically.",
  },
];

/* ─── Page ─── */
export default function LoansPage() {
  return (
    <HubPage
      breadcrumbLabel="Loan Calculators"
      path="/loans"
      collectionDescription="Free loan calculators to estimate payments, APR, and total cost for title loans, payday loans, and other loan types."
      intro="Loan calculators let you estimate monthly payments, total interest, and the true cost of borrowing before you sign. CalcForge's free loan calculators cover title loans, payday loans, and other high-cost lending products. Each tool produces a full amortization schedule so you can compare lenders, test different terms, and avoid overpaying. Whether you are evaluating a title loan offer, checking a payday loan APR, or planning an early payoff, these calculators give you the numbers you need."
      calculators={loansCalculators}
      howToTitle="How to Calculate Loan Payments"
      howToContent={
        <>
          <p className="text-muted-foreground leading-relaxed">
            The standard amortizing loan formula calculates a fixed monthly
            payment that repays both principal and interest over the loan term.
            The formula is: M = P &times; [r(1+r)<sup>n</sup>] / [(1+r)<sup>n</sup>
            &minus; 1], where P is the loan amount, r is the monthly interest
            rate (APR divided by 12), and n is the total number of payments.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            As an example, a {formatCurrency(5000)} loan at {formatPercent(10)}{" "}
            APR over 36 months produces a monthly payment of{" "}
            <strong>{formatCurrency(EX.monthlyPayment)}</strong>, total interest
            of <strong>{formatCurrency(EX.totalInterest)}</strong>, and a total
            repayment of <strong>{formatCurrency(EX.totalCost)}</strong>. The
            amortization schedule shows how each payment splits between
            principal and interest, with the interest portion decreasing over
            time.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            APR, or annual percentage rate, expresses the total yearly cost of
            borrowing including fees and interest. For high-cost loans like title
            and payday loans, the APR can far exceed the stated interest rate
            because of added fees. That is why comparing total repayment, not
            just the monthly payment, is essential when evaluating any loan
            offer.
          </p>
        </>
      }
      typesTitle="Types of Loan Calculators"
      typesIntro="CalcForge offers specialized loan calculators for different borrowing products. Each tool is built for a specific loan type so the math matches how that loan actually works."
      costsTitle="Understanding Loan Costs"
      costsContent={
        <>
          <p className="text-muted-foreground leading-relaxed">
            Loan cost is determined by three factors: the principal (the amount
            borrowed), the interest rate or fee, and the loan term. The
            principal is repaid in full, but interest and fees add to the total
            cost. A longer term lowers each individual payment but increases the
            total interest paid over the life of the loan.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Secured loans, such as title loans, use an asset as collateral. If
            you default, the lender can repossess the asset. Unsecured loans,
            such as many payday loans, rely on the borrower&apos;s income and
            have no collateral, which often means higher rates to offset the
            lender&apos;s risk.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Fee-based loans, like single-payment payday loans, charge a flat
            dollar fee rather than an interest rate. A small fee on a
            two-week loan sounds manageable, but annualized it equates to a much
            higher APR. Amortizing loans, like most title loans, spread
            repayment across equal monthly payments with interest calculated on
            the declining balance. Both structures are supported by
            CalcForge&apos;s calculators so you can see the true cost in either
            format.
          </p>
        </>
      }
      faq={faq}
    />
  );
}