import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { HubPage, type HubCalculator, type HubFaqItem } from "@/components/hub/HubPage";

/* ─── SEO Metadata ─── */
export const metadata: Metadata = {
  title: "Debt Calculators: Payoff, DTI & Credit Card Tools",
  description:
    "Free debt calculators to compare snowball vs avalanche payoff strategies, calculate your debt-to-income ratio, and plan credit card payoff. Accurate, instant results at CalcForge.",
  alternates: { canonical: `${siteConfig.url}/debt` },
  openGraph: {
    title: "Debt Calculators: Payoff, DTI & Credit Card Tools",
    description:
      "Free debt calculators to compare snowball vs avalanche payoff strategies, calculate your debt-to-income ratio, and plan credit card payoff at CalcForge.",
    url: `${siteConfig.url}/debt`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
};

/* ─── Hub data ─── */

const debtCalculators: readonly HubCalculator[] = [
  {
    label: "Debt Payoff Calculator",
    href: "/debt/debt-payoff-calculator",
    longDescription:
      "Compare snowball vs avalanche payoff strategies for multiple debts. Add extra monthly payments, see your exact debt-free date, and view a full month-by-month payoff schedule with per-debt breakdowns.",
    typesCopy:
      "compares snowball and avalanche payoff strategies across multiple debts, showing interest saved, debt-free date, and a full month-by-month schedule",
    primaryKeyword: "debt payoff calculator",
  },
  {
    label: "DTI Calculator",
    href: "/debt/dti-calculator",
    longDescription:
      "Calculate your debt-to-income ratio by entering your monthly debt payments and gross monthly income. See whether you meet common lender thresholds for mortgages and other loans.",
    typesCopy: "calculates your front-end and back-end debt-to-income ratios to evaluate loan eligibility",
    primaryKeyword: "DTI calculator",
  },
  {
    label: "Credit Card Payoff Calculator",
    href: "/debt/credit-card-payoff-calculator",
    longDescription:
      "Estimate how long it takes to pay off a credit card and how much interest you will pay. Compare minimum payments against fixed monthly payments and see the total cost difference.",
    typesCopy: "estimates credit card payoff timeline and total interest for minimum vs fixed payment strategies",
    primaryKeyword: "credit card payoff calculator",
  },
  {
    label: "Credit Card Minimum Payment Calculator",
    href: "/debt/credit-card-minimum-payment-calculator",
    longDescription:
      "See how credit card minimum payments are calculated and how long it takes to pay off a balance making only minimums. Understand the true cost of minimum payments.",
    typesCopy: "shows how minimum payments are calculated, total interest paid, and payoff timeline when paying only minimums",
    primaryKeyword: "credit card minimum payment calculator",
  },
  {
    label: "Balance Transfer Calculator",
    href: "/debt/balance-transfer-calculator",
    longDescription:
      "Compare the cost of keeping a balance on your current card versus transferring it to a new card with a promotional APR. Factor in transfer fees and the promotional period length.",
    typesCopy: "compares keeping a balance versus transferring to a promotional APR card, factoring in transfer fees and promo period",
    primaryKeyword: "balance transfer calculator",
  },
];

const faq: HubFaqItem[] = [
  {
    question: "What is the debt snowball method?",
    answer:
      "The debt snowball method orders your debts from smallest balance to largest. You pay the minimum on every debt and put any extra money toward the smallest balance. When that debt is paid off, you roll its minimum payment into the next-smallest debt. The approach builds psychological momentum from quick early wins.",
  },
  {
    question: "What is the debt avalanche method?",
    answer:
      "The debt avalanche method orders your debts from highest interest rate to lowest. You pay the minimum on every debt and direct extra money toward the debt with the highest APR. Mathematically, this minimizes the total interest you pay over the life of your debts, making it the most cost-efficient strategy.",
  },
  {
    question: "Which method saves more money, snowball or avalanche?",
    answer:
      "The avalanche method always saves more in total interest because it attacks the most expensive debt first. However, the snowball method can save money in practice if it keeps you motivated and prevents you from quitting. Studies show that people who use the snowball method are more likely to become completely debt-free.",
  },
  {
    question: "How does a debt-to-income ratio affect loan approval?",
    answer:
      "Lenders use your debt-to-income (DTI) ratio to assess whether you can afford a new loan payment. Most mortgage lenders prefer a back-end DTI below 43%, and some set the ceiling at 36%. A lower DTI means more of your income is available for a new payment, which improves your approval odds and may qualify you for better rates.",
  },
  {
    question: "Should I pay off debt or save first?",
    answer:
      "It depends on your situation. Building a small emergency fund (one month of expenses) before aggressive debt payoff prevents you from adding new debt when unexpected costs arise. After that, high-interest debt (credit cards above 15% APR) usually should be prioritized over savings because the interest cost exceeds what most savings accounts earn.",
  },
];

/* ─── Page ─── */
export default function DebtPage() {
  return (
    <HubPage
      breadcrumbLabel="Debt Calculators"
      path="/debt"
      collectionDescription="Free debt calculators to compare payoff strategies, calculate your debt-to-income ratio, and plan credit card payoff."
      intro="Debt calculators help you build a clear path to becoming debt-free. CalcForge's free debt tools cover the two most popular payoff strategies (snowball and avalanche), credit card payoff planning, minimum payment analysis, balance transfer comparisons, and debt-to-income ratio calculation. Enter your actual balances, rates, and payments to see exactly when you will be debt-free, how much interest you will pay, and which strategy saves the most money."
      calculators={debtCalculators}
      howToTitle="How to Create a Debt Payoff Plan"
      howToContent={
        <>
          <p className="text-muted-foreground leading-relaxed">
            A debt payoff plan starts by listing every debt you owe: credit cards, personal
            loans, student loans, auto loans, and medical bills. For each debt, you need the
            current balance, the annual percentage rate (APR), and the minimum monthly payment.
            These three numbers determine how long it takes to become debt-free and how much
            total interest you will pay.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            With your debts listed, you choose a payoff strategy. The snowball method sorts debts
            from lowest balance to highest, prioritizing quick wins. The avalanche method sorts by
            highest APR first, minimizing total interest. In both cases, you pay at least the
            minimum on every debt and direct any remaining funds to the priority debt. When a
            debt is paid off, its minimum payment is freed up and added to the next priority
            debt, creating an accelerating payoff effect.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Adding an extra monthly payment, even a small one, can dramatically shorten your
            timeline. Because extra payments reduce the principal immediately, they stop future
            interest from accruing on that amount. Over months and years, this compounds into
            significant savings.
          </p>
        </>
      }
      typesTitle="Types of Debt Calculators"
      typesIntro="CalcForge offers specialized debt calculators for different aspects of debt management. Each tool addresses a specific question so you get precise, actionable numbers."
      costsTitle="Understanding Debt Costs"
      costsContent={
        <>
          <p className="text-muted-foreground leading-relaxed">
            The cost of debt is determined by the interest rate, the balance, and how long you
            take to repay. A higher rate means more of each payment goes toward interest rather
            than reducing the principal. Credit card debt is typically the most expensive form of
            consumer debt, with average APRs around 22% to 24%.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Making only minimum payments on credit cards is particularly costly. Minimum payments
            are usually a small percentage of the balance (often 1% to 3%) or a fixed floor
            amount. At high APRs, most of a minimum payment covers interest, leaving very little
            to reduce the principal. This can stretch repayment to years or even decades and
            cause total interest to exceed the original balance.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Balance transfer cards offer a temporary escape: a promotional 0% APR period (usually
            12 to 21 months) during which every payment goes toward principal. However, transfer
            fees (typically 3% to 5% of the transferred balance) reduce the benefit, and the
            standard rate applies once the promotional period ends. A balance transfer calculator
            helps determine whether the transfer actually saves money.
          </p>
        </>
      }
      faq={faq}
    />
  );
}