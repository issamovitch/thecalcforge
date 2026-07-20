import type { Metadata } from "next";
import { siteConfig, calculatorPages } from "@/config/site.config";
import { HubPage, type HubCalculator, type HubFaqItem } from "@/components/hub/HubPage";

/* ─── SEO Metadata ─── */
export const metadata: Metadata = {
  title: "Savings Calculators: CDs, Penalties & Yield Tools",
  description:
    "Savings calculators to estimate CD early withdrawal penalties, net proceeds, and whether breaking a CD early is worth it. Free tools at CalcForge.",
  alternates: { canonical: `${siteConfig.url}/savings` },
  openGraph: {
    title: "Savings Calculators: CDs, Penalties & Yield Tools",
    description:
      "Savings calculators to estimate CD early withdrawal penalties, net proceeds, and whether breaking a CD early is worth it at CalcForge.",
    url: `${siteConfig.url}/savings`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
};

/* ─── Hub data ─── */
const savingsCalculators: readonly HubCalculator[] = calculatorPages
  .filter((p) => p.category === "savings")
  .map((p) => ({
    label: p.label,
    href: p.href,
    longDescription: p.longDescription,
    typesCopy: p.typesCopy,
    primaryKeyword: p.primaryKeyword,
  }));

const faq: HubFaqItem[] = [
  {
    question: "How is a CD early withdrawal penalty calculated?",
    answer:
      "Most banks calculate the penalty as a number of months of simple interest on the principal, using the CD's APY. For example, a 6-month interest penalty on a $10,000 CD at 4.50% APY is $225 ($10,000 times 0.045 times 6 divided by 12). Common schedules are 3 months of interest for terms under 1 year, 6 months for 1 to 2 year terms, and 12 months for longer terms, but the exact penalty is set by your bank and disclosed in the deposit agreement.",
  },
  {
    question: "Can a CD penalty eat into my principal?",
    answer:
      "It depends on the bank. Some banks cap the penalty at the interest earned so far, so your principal is protected. Others allow the penalty to exceed accrued interest and deduct the difference from principal, which means you could receive back less than you deposited. Check your deposit agreement or Truth in Savings disclosure to confirm which policy applies to your CD before breaking it.",
  },
  {
    question: "Is it ever worth breaking a CD early?",
    answer:
      "It can be, if the new rate available elsewhere is high enough to offset the penalty over the remaining term. The calculator on the CD Early Withdrawal Penalty Calculator page compares keeping your CD to maturity against breaking it, paying the penalty, and reinvesting the net proceeds at a new APY for the same remaining months. If the break-and-reinvest option produces a higher final value, breaking wins.",
  },
  {
    question: "What is the difference between a CD penalty and the 10% IRA penalty?",
    answer:
      "A CD early withdrawal penalty is a bank charge for cashing a certificate of deposit before maturity. The 10% penalty on early withdrawals from an IRA or 401k is a tax penalty imposed by the IRS on retirement account distributions taken before age 59 and a half. They are separate mechanisms: a CD held inside an IRA can trigger both the bank's CD penalty and the IRS retirement penalty, while a CD held in a taxable account only faces the bank penalty.",
  },
  {
    question: "Are CD penalties deductible?",
    answer:
      "Historically, early withdrawal penalties on CDs were deductible as an above-the-line adjustment to income on your federal tax return. Tax law changes periodically affect this treatment, so confirm the current rules with the IRS or a tax professional for the tax year in question. State tax treatment may differ from federal.",
  },
];

/* ─── Page ─── */
export default function SavingsPage() {
  return (
    <HubPage
      breadcrumbLabel="Savings Calculators"
      path="/savings"
      collectionDescription="Free savings calculators to estimate CD early withdrawal penalties, net proceeds, and whether breaking a CD early is worth it."
      intro="Savings calculators help you understand the real cost of accessing locked-in cash before a term ends. CalcForge's free savings calculators cover CD early withdrawal penalties, net proceeds after penalties, and a side-by-side comparison of keeping a CD to maturity versus breaking it and reinvesting at a higher rate. Whether you are weighing a penalty against a better yield elsewhere or checking whether accrued interest covers the penalty, these tools give you the numbers quickly."
      calculators={savingsCalculators}
      howToTitle="How CD Early Withdrawal Penalties Are Calculated"
      howToContent={
        <>
          <p className="text-muted-foreground leading-relaxed">
            Most banks calculate a CD early withdrawal penalty as a number of
            months of simple interest on the principal, using the CD's annual
            percentage yield (APY). The formula is{" "}
            <strong>penalty = principal &times; APY &times; penalty months
            &divide; 12</strong>. For a $10,000 CD at 4.50% APY with a 6-month
            interest penalty, the calculation is $10,000 &times; 0.045 &times; 6
            &divide; 12 = $225.00.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Common penalty schedules are 3 months of interest for terms under 1
            year, 6 months for 1 to 2 year terms, and 12 months for longer
            terms, but the exact schedule varies by bank and product. Some
            banks use a flat dollar amount or a custom day count for certain
            CDs. The penalty terms are disclosed in the deposit agreement and
            Truth in Savings disclosure you received when you opened the CD.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Interest earned so far is calculated the same way:{" "}
            <strong>interest = principal &times; APY &times; months held
            &divide; 12</strong>. If the penalty exceeds the interest earned,
            some banks cap the penalty at accrued interest while others deduct
            the difference from principal. The calculator on the CD Early
            Withdrawal Penalty Calculator page shows both the penalty and the
            interest earned so you can see whether principal is at risk.
          </p>
        </>
      }
      typesTitle="Types of Savings Calculators"
      typesIntro="CalcForge offers savings calculators for specific CD and penalty questions. Each tool is built for a single calculation so the result matches how bank penalties actually work."
      costsTitle="Understanding CD Penalty Policies"
      costsContent={
        <>
          <p className="text-muted-foreground leading-relaxed">
            CD early withdrawal penalties are set by the issuing bank and
            disclosed in the deposit agreement and Truth in Savings
            disclosure. Federal regulation does not mandate a specific penalty
            amount, but most banks use a months-of-interest convention because
            it scales predictably with the CD's rate and term. The most common
            schedules are 3 months of interest for short-term CDs, 6 months for
            intermediate terms, and 12 months for long-term CDs.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            A critical distinction is whether the bank caps the penalty at
            interest earned. Some banks limit the penalty to accrued interest,
            protecting your principal. Others permit the penalty to exceed
            accrued interest and deduct the shortfall from principal, which
            means you can receive back less than you deposited. This policy
            varies by bank and sometimes by product, so confirm it in your
            deposit agreement before breaking a CD.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Special CDs, such as no-penalty CDs and bump-up CDs, waive or limit
            the early withdrawal penalty in exchange for a lower APY. Brokered
            CDs, sold through brokerage accounts, do not use a
            months-of-interest penalty at all; instead you sell them on the
            secondary market, where the price depends on prevailing rates. The
            calculator above applies the months-of-interest convention used by
            most direct bank CDs.
          </p>
        </>
      }
      faq={faq}
    />
  );
}
