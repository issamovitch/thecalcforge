import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import OvertimePayCalculator from "@/components/calculators/OvertimePayCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/income/overtime-calculator`;
const pageTitle =
  "Overtime Pay Calculator \u2013 Time and a Half & Double Time | CalcForge";
const pageDescription =
  "Free overtime pay calculator. See your time and a half rate, double time, and total paycheck with overtime hours for any hourly wage.";

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
    question: "How much is time and a half for $18 an hour?",
    answer:
      "Time and a half for $18 per hour is $27.00 per hour ($18 multiplied by 1.5). If you work 5 overtime hours at that rate, you earn $135.00 in overtime pay on top of your $720.00 in regular pay, for a weekly gross of $855.00. Annualized, that comes to $44,460 per year in gross income before taxes.",
  },
  {
    question: "Is overtime required by federal law?",
    answer:
      "Yes, for non-exempt employees. The Fair Labor Standards Act (FLSA) requires employers to pay at least 1.5 times the regular rate for hours worked beyond 40 in a workweek. Exempt employees, generally those in executive, administrative, or professional roles earning above the salary threshold, are not entitled to overtime. Some states have additional daily overtime requirements that go beyond the federal standard.",
  },
  {
    question: "What is double time and when does it apply?",
    answer:
      "Double time means you are paid twice your regular hourly rate (2x). Federal law does not require double time. It applies in specific situations depending on state law, union contracts, or employer policy. California requires double time for hours worked beyond 12 in a single day and for the first 8 hours on the 7th consecutive day of work. Some employers offer double time for holidays as a company benefit.",
  },
  {
    question: "How is overtime calculated for salaried employees?",
    answer:
      "For non-exempt salaried employees, the weekly salary is first converted to an hourly rate by dividing by the number of regular hours worked. For example, a $800 weekly salary with 40 regular hours yields a $20 per hour regular rate. Overtime is then calculated at 1.5 times that hourly rate, or $30 per hour, for any hours beyond 40. Exempt salaried employees do not receive overtime under federal law.",
  },
  {
    question: "Do these figures include taxes?",
    answer:
      "No. All amounts shown by this calculator are gross figures before federal and state income tax, Social Security, Medicare, and any other deductions. Your actual take-home pay will be lower. The amount of tax withheld depends on your filing status, deductions, and other factors specific to your situation. Consult a tax professional or payroll department for net pay estimates.",
  },
];

/* ─── Page Component ─── */

export default function OvertimeCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: "Income Calculators",
            url: `${siteConfig.url}/income`,
          },
          { name: "Overtime Pay Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Overtime Pay Calculator"
        description="Free online overtime pay calculator. Calculate time and a half, double time, and custom overtime pay for any hourly wage with pay period scaling."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Income Calculators", href: "/income" },
          { label: "Overtime Pay Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Overtime Pay Calculator
      </h1>

      {/* Intro paragraph */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        Time and a half for $18 an hour is $27 per hour. This overtime pay
        calculator computes your overtime hourly rate, regular pay, overtime
        pay, and total gross paycheck for any wage, hours, and overtime
        multiplier. Select your pay period to see weekly, biweekly, or
        monthly totals, plus an annualized gross income estimate.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <OvertimePayCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Overtime Pay Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Overtime Pay Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An overtime pay calculator converts your regular hourly wage into
            an overtime rate using a multiplier, then applies that rate to
            your overtime hours. The most common multiplier is 1.5x (time
            and a half), which is the federal minimum under the Fair Labor
            Standards Act. The calculator above also supports double time
            (2x) and any custom multiplier your employer or state law
            requires.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The math is simple. Your overtime hourly rate equals your regular
            wage multiplied by the overtime multiplier. Overtime pay equals
            that rate times the number of overtime hours. Regular pay equals
            your regular wage times your regular hours. Total gross pay is
            the sum of regular and overtime pay. The calculator handles the
            pay period scaling (weekly, biweekly, or monthly) and computes
            annualized gross by multiplying the weekly total by 52.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            All figures are gross, meaning before any taxes, deductions, or
            withholdings. Overtime laws and exempt classifications vary by
            state, so the results are estimates for informational purposes.
            Consult your payroll department or the Department of Labor for
            guidance specific to your situation.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Time and a Half Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Time and a Half Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Time and a half means your overtime rate is 1.5 times your regular
            hourly wage. It is the standard overtime rate required by the
            federal FLSA for non-exempt employees who work more than 40 hours
            in a single workweek. To calculate it, multiply your hourly wage
            by 1.5. For example, $18 per hour times 1.5 equals $27 per hour.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Time and a Half Rates for Common Hourly Wages
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>$15/hr:</strong> $22.50 OT rate.{" "}
                <strong>$18/hr:</strong> $27.00 OT rate.{" "}
                <strong>$20/hr:</strong> $30.00 OT rate.{" "}
                <strong>$22/hr:</strong> $33.00 OT rate.{" "}
                <strong>$25/hr:</strong> $37.50 OT rate.{" "}
                <strong>$28/hr:</strong> $42.00 OT rate.{" "}
                <strong>$30/hr:</strong> $45.00 OT rate.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            To use the calculator for time and a half, select &quot;Time and a
            Half (1.5x)&quot; from the Overtime Multiplier dropdown. The
            calculator will instantly show your overtime rate, overtime pay,
            regular pay, and total gross for the selected pay period. The
            annualized gross estimate shows what you would earn in a full year
            at the same hours and wage.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Is Time and a Half for $18 an Hour */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Is Time and a Half for $18 an Hour
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Time and a half for $18 an hour is <strong>$27.00 per hour</strong>.
            If you work 5 overtime hours at that rate in a single week, your
            overtime pay is $135.00 (5 hours times $27). Your regular pay for
            40 hours at $18 is $720.00. Combined, your weekly gross pay is
            <strong> $855.00</strong>.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Over a full year of 52 weeks with consistent overtime, that weekly
            gross of $855 translates to <strong>$44,460 per year</strong> in
            gross income. Without the 5 overtime hours, the same $18 wage
            produces $37,440 annually (40 hours times $18 times 52). The 5
            weekly overtime hours add $7,020 to annual gross earnings.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            These figures represent gross income before federal income tax,
            state income tax, Social Security (6.2%), Medicare (1.45%), and
            any other deductions like health insurance or retirement
            contributions. Actual take-home pay will be lower.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Double Time Pay Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Double Time Pay Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Double time means you earn twice your regular hourly rate for
            qualifying hours. At $18 per hour, double time is $36 per hour.
            Five overtime hours at double time produces $180 in overtime pay,
            compared to $135 at time and a half. The calculator above handles
            double time by selecting &quot;Double Time (2x)&quot; from the
            multiplier dropdown.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Federal law does not require double time. It is mandated in
            certain situations by state law or contract. California requires
            double time for any hours worked beyond 12 in a single day, and
            for the first 8 hours worked on the 7th consecutive day in a
            workweek. Some union collective bargaining agreements specify
            double time for holidays, weekends, or night shifts, but these
            are contractual benefits, not legal requirements in most states.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The calculator also supports custom multipliers. If your employer
            or state law requires a rate other than 1.5x or 2x (for example,
            2.5x for certain penalty rates), select &quot;Custom
            Multiplier&quot; and enter the exact value.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Holiday Pay Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Holiday Pay Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Federal law does not require employers to pay extra for work
            performed on holidays. Holiday premium pay is entirely a matter of
            employer policy, union contract, or state statute. Many employers
            offer 1.5x pay for holiday work as a benefit, and some offer
            double time. The overtime pay calculator above can estimate
            holiday earnings by selecting the multiplier that matches your
            employer&apos;s policy.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            It is important to distinguish holiday pay from overtime pay.
            Holiday premium pay applies to hours worked on a specific date
            regardless of how many total hours you have worked that week.
            Overtime pay under the FLSA is based on exceeding 40 total hours
            in the workweek. In some cases, both can apply: holiday hours
            count toward the 40-hour weekly total, so if your holiday shift
            pushes you over 40 hours, those hours may qualify for both
            holiday premium and overtime rates depending on your employer&apos;s
            policy.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Some states have additional holiday pay protections. For example,
            Massachusetts requires premium pay for retail employees who work
            on certain holidays. Rhode Island has similar provisions. Most
            states, however, leave holiday pay to employer discretion. Check
            with your state labor department and your employee handbook for
            the rules that apply to your situation.
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
              href="/income"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Income Calculators
            </a>{" "}
            hub. If you are evaluating job offers with different pay structures,
            the{" "}
            <a
              href="/income/salary-to-hourly-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Salary to Hourly Calculator
            </a>{" "}
            converts an annual salary into an hourly wage so you can compare
            them on an equal basis. For budgeting purposes, the{" "}
            <a
              href="/debt/dti-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              DTI Calculator
            </a>{" "}
            uses your gross income to determine whether you meet lender
            thresholds for mortgages and other loans.
          </p>
        </section>
      </div>
    </div>
  );
}
