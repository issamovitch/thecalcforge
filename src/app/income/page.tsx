import type { Metadata } from "next";
import { siteConfig, calculatorPages } from "@/config/site.config";
import { HubPage, type HubCalculator, type HubFaqItem } from "@/components/hub/HubPage";

/* ─── SEO Metadata ─── */
export const metadata: Metadata = {
  title: "Income Calculators: Overtime Pay, Salary & Wage Tools",
  description:
    "Income calculators to estimate overtime pay, convert between salary and hourly rates, and understand your take-home pay. Free tools at CalcForge.",
  alternates: { canonical: `${siteConfig.url}/income` },
  openGraph: {
    title: "Income Calculators: Overtime Pay, Salary & Wage Tools",
    description:
      "Income calculators to estimate overtime pay, convert between salary and hourly rates, and understand your take-home pay at CalcForge.",
    url: `${siteConfig.url}/income`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
};

/* ─── Hub data ─── */
const incomeCalculators: readonly HubCalculator[] = calculatorPages
  .filter((p) => p.category === "income")
  .map((p) => ({
    label: p.label,
    href: p.href,
    longDescription: p.longDescription,
    typesCopy: p.typesCopy,
    primaryKeyword: p.primaryKeyword,
  }));

const faq: HubFaqItem[] = [
  {
    question: "How is overtime pay calculated?",
    answer:
      "Under the federal Fair Labor Standards Act (FLSA), non-exempt employees must receive at least 1.5 times their regular hourly rate for any hours worked beyond 40 in a single workweek. The overtime rate is your hourly wage multiplied by the overtime multiplier. For example, at $18 per hour with time and a half, the overtime rate is $27 per hour. Some states and employers require higher multipliers or have additional daily overtime rules.",
  },
  {
    question: "What is the difference between exempt and non-exempt employees?",
    answer:
      "Non-exempt employees are entitled to overtime pay under the FLSA when they work more than 40 hours in a workweek. Exempt employees, typically those in executive, administrative, or professional roles who earn above a salary threshold, are not entitled to federal overtime. The exemption rules are based on job duties and salary level, not just job title. State laws may have additional or different exemption criteria.",
  },
  {
    question: "Does overtime pay apply to salaried employees?",
    answer:
      "It depends on whether the employee is classified as exempt or non-exempt. A salaried employee who is non-exempt still receives overtime. Salaried non-exempt employees have their overtime calculated by converting the weekly salary to an hourly rate first: divide the weekly salary by the number of regular hours. That hourly rate is then multiplied by 1.5 (or the applicable multiplier) for overtime hours.",
  },
  {
    question: "Are there daily overtime rules?",
    answer:
      "Federal law only requires overtime after 40 hours in a workweek, not after 8 hours in a day. However, several states have daily overtime rules. California, for example, requires 1.5x pay for hours worked beyond 8 in a single day, and double time for hours beyond 12. Alaska, Nevada, and Colorado also have daily overtime provisions. Check your state labor department for rules that apply in your jurisdiction.",
  },
  {
    question: "Is holiday pay required by law?",
    answer:
      "No. Under federal law, employers are not required to pay extra for work performed on holidays, weekends, or nights. Any holiday premium pay (such as 1.5x or 2x) is a matter of employer policy, union contract, or state law. Many employers do offer holiday pay as a benefit, but the rate and which holidays qualify vary widely.",
  },
];

/* ─── Page ─── */
export default function IncomePage() {
  return (
    <HubPage
      breadcrumbLabel="Income Calculators"
      path="/income"
      collectionDescription="Free income calculators to estimate overtime pay, convert salary to hourly rates, and understand your gross earnings."
      intro="Income calculators help you understand exactly how much you earn and how different pay structures affect your paycheck. CalcForge's free income calculators cover overtime pay at any multiplier, salary-to-hourly conversions, and gross pay estimates across weekly, biweekly, and monthly pay periods. Whether you are checking whether a paycheck is correct, comparing a salaried offer against an hourly one, or planning how overtime will affect your annual income, these tools give you the numbers quickly."
      calculators={incomeCalculators}
      howToTitle="How Overtime Pay Is Calculated"
      howToContent={
        <>
          <p className="text-muted-foreground leading-relaxed">
            The federal Fair Labor Standards Act (FLSA) requires that non-exempt
            employees receive overtime pay at a rate of at least 1.5 times their
            regular hourly wage for all hours worked beyond 40 in a single
            workweek. The formula is straightforward: overtime hourly rate equals
            your regular hourly wage multiplied by the overtime multiplier (1.5
            for time and a half, 2 for double time, or a custom rate set by your
            employer or state law).
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For example, an employee earning $18 per hour who works 45 hours in
            a week at time and a half earns: $720 in regular pay (40 hours times
            $18) plus $135 in overtime pay (5 hours times $27), for a total
            weekly gross of $855. The calculator on this site performs this
            calculation instantly for any wage, hours, and multiplier you enter.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Pay period scaling works by multiplying the weekly result: biweekly
            pay is the weekly total times 26 paychecks per year, and monthly pay
            is the weekly total times 52 divided by 12. Annualized gross income
            is the weekly total times 52. All figures shown by CalcForge
            calculators are gross (before taxes and deductions).
          </p>
        </>
      }
      typesTitle="Types of Income Calculators"
      typesIntro="CalcForge offers income calculators for different pay structures and questions. Each tool is built for a specific calculation so the result matches how pay actually works."
      costsTitle="Understanding Overtime Laws"
      costsContent={
        <>
          <p className="text-muted-foreground leading-relaxed">
            Overtime requirements in the United States are set by the Fair Labor
            Standards Act (FLSA) at the federal level, with additional rules in
            many states. The federal standard is time and a half (1.5x) for hours
            over 40 in a workweek. Some states, like California, also impose
            daily overtime: 1.5x after 8 hours in a day and 2x after 12 hours.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Not all employees are covered. Exempt employees, generally those in
            executive, administrative, or professional roles earning above a
            salary threshold, are not entitled to overtime under federal law.
            The exemption rules consider both salary level and job duties.
            Some states set higher salary thresholds than the federal minimum,
            expanding overtime coverage to more workers.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Holiday pay, shift differentials, and weekend premiums are not
            required by federal law. They are determined by employer policy,
            collective bargaining agreements, or state statute. When an employer
            does offer holiday premium pay, the overtime calculator can estimate
            the earnings by selecting the appropriate multiplier.
          </p>
        </>
      }
      faq={faq}
    />
  );
}