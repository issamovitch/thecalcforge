import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import SalaryToHourlyCalculator from "@/components/calculators/SalaryToHourlyCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/income/salary-to-hourly-calculator`;
const pageTitle =
  "Salary to Hourly Calculator \u2013 Your Hourly Rate";
const pageDescription =
  "Free salary to hourly calculator. Convert any annual salary to an hourly wage, plus weekly, biweekly, and monthly pay, based on your real work hours.";

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
    question: "How do I convert my salary to an hourly rate?",
    answer:
      "Divide your annual salary by the number of hours you work in a year. For a standard full-time schedule of 40 hours per week and 52 weeks, that is 2,080 hours. A $60,000 salary divided by 2,080 hours equals $28.85 per hour. If you work a different number of hours or take unpaid time off, divide by your actual annual hours instead.",
  },
  {
    question: "Is $60,000 a year is how much an hour?",
    answer:
      "$60,000 a year is $28.85 an hour at 40 hours per week for 52 weeks (2,080 total hours). That breaks down to $1,153.85 per week, $2,307.69 biweekly, and $5,000.00 per month in gross pay. If you work 45 hours per week, the effective hourly rate drops to $25.64; at 50 hours it is $23.08.",
  },
  {
    question: "What is my hourly rate from my salary if I work unpaid overtime?",
    answer:
      "Unpaid overtime dilutes your true hourly rate because you are spreading the same salary over more hours. A $60,000 salary at 40 hours is $28.85 per hour. If you actually work 50 hours per week for the same pay, your real hourly rate falls to $23.08 ($60,000 divided by 2,600 hours). Salaried exempt employees often experience this gap between the nominal rate and the effective rate.",
  },
  {
    question: "How many work hours are in a year?",
    answer:
      "A standard full-time work year is 2,080 hours: 40 hours per week multiplied by 52 weeks. This is the number most salary-to-hourly calculators use by default. If you take two weeks of unpaid time off, your paid hours drop to 2,000 (40 times 50). Part-time schedules and alternative work arrangements produce different totals, which is why the calculator lets you adjust both hours per week and weeks per year.",
  },
  {
    question: "Do these figures include taxes?",
    answer:
      "No. All amounts shown by this calculator are gross figures before federal and state income tax, Social Security, Medicare, and any other deductions. Your actual take-home pay will be lower. The amount withheld depends on your filing status, dependents, deductions, and state of residence. Consult a tax professional or payroll department for net pay estimates.",
  },
];

/* ─── Page Component ─── */

export default function SalaryToHourlyPage() {
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
          { name: "Salary to Hourly Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Salary to Hourly Calculator"
        description="Free online salary to hourly calculator. Convert any annual salary to an hourly wage, plus daily, weekly, biweekly, and monthly gross pay."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Income Calculators", href: "/income" },
          { label: "Salary to Hourly Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Salary to Hourly Calculator
      </h1>

      {/* Intro paragraph (first 100 words answer the primary keyword) */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        A $60,000 a year salary is $28.85 an hour at 40 hours per week. This
        salary to hourly calculator converts any annual salary into an hourly
        wage using your real work hours, then shows the equivalent daily,
        weekly, biweekly, and monthly gross pay. Enter your salary, hours per
        week, and weeks per year to see your true hourly rate, with a live
        reference line and a quick-reference table for salaries from $30,000
        to $100,000.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <SalaryToHourlyCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Salary to Hourly Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Salary to Hourly Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A salary to hourly calculator divides your annual salary by the
            total hours you work in a year to produce your effective hourly
            wage. The standard full-time year is 2,080 hours, calculated as 40
            hours per week multiplied by 52 weeks. At that baseline, a $60,000
            salary equals $28.85 per hour, a $70,000 salary equals $33.65 per
            hour, and a $100,000 salary equals $48.08 per hour.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The conversion matters because salary figures obscure the real
            value of your time. Two jobs paying $60,000 per year are not
            equivalent if one expects 40 hours per week and the other expects
            50. The calculator above lets you adjust both hours per week and
            weeks per year, so the hourly rate reflects how much you actually
            work rather than a nominal 2,080-hour assumption.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            All outputs are labeled gross because they represent pay before
            federal and state income tax, Social Security, Medicare, and any
            other deductions. Your take-home pay will be lower. The calculator
            is designed for quick comparisons between job offers, pay
            structures, and work schedules, not for tax planning.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Salary to Hourly Conversion Works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How the Salary to Hourly Conversion Works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The formula is: hourly rate equals annual salary divided by
            annual hours. Annual hours equals hours per week times weeks per
            year. Written out, it is <strong>hourly = salary &divide; (hours
            &times; weeks)</strong>. For a $60,000 salary at 40 hours per week
            over 52 weeks, the calculation is $60,000 &divide; (40 &times; 52) =
            $60,000 &divide; 2,080 = $28.85 per hour.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The 2,080-hour standard year comes from the conventional full-time
            schedule: 40 hours per week, 52 weeks per year, with no unpaid
            time off. Most salary-to-hourly calculators use 2,080 as the
            default. If you work more than 40 hours per week for the same
            salary, your real hourly rate drops because the same pay is spread
            across more hours. If you take unpaid leave, your paid weeks fall
            below 52 and your effective rate over the weeks you do work rises.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $60,000 Salary
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                $60,000 &divide; 2,080 hours = <strong>$28.85 per hour</strong>.
                Weekly gross = $60,000 &divide; 52 = <strong>$1,153.85</strong>.
                Biweekly gross = $1,153.85 &times; 2 = <strong>$2,307.69</strong>.
                Monthly gross = $60,000 &divide; 12 = <strong>$5,000.00</strong>.
                Daily gross (8-hour day) = $28.85 &times; 8 = <strong>$230.77</strong>.
                Every figure is exact to the cent.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: $70,000 a Year Is How Much an Hour */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            $70,000 a Year Is How Much an Hour
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            $70,000 a year is <strong>$33.65 an hour</strong> at the standard
            2,080-hour work year (40 hours per week for 52 weeks). The math is
            $70,000 &divide; 2,080 = $33.65. Your weekly gross is $1,346.15
            ($70,000 &divide; 52), your biweekly gross is $2,692.31, and your
            monthly gross is $5,833.33.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you work more than 40 hours per week, the effective hourly rate
            falls. At 45 hours per week for 52 weeks (2,340 annual hours),
            $70,000 works out to <strong>$29.91 per hour</strong>. At 50 hours
            per week (2,600 annual hours), it drops to{" "}
            <strong>$26.92 per hour</strong>. This is why salaried exempt
            employees who regularly work long hours often earn less per hour
            than their nominal salary suggests.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Use the calculator above to test your own scenario. Enter $70,000
            as the annual salary, then adjust the hours per week slider to see
            how the hourly rate changes. The live reference line updates
            instantly with the exact figure.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: $60,000 a Year Is How Much an Hour */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            $60,000 a Year Is How Much an Hour
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            $60,000 a year is <strong>$28.85 an hour</strong> at 40 hours per
            week for 52 weeks. The calculation is $60,000 &divide; 2,080 =
            $28.85. Weekly gross pay is $1,153.85, biweekly gross is
            $2,307.69, and monthly gross is $5,000.00. A daily rate based on
            an 8-hour workday is $230.77.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Working more than 40 hours per week reduces the effective hourly
            rate. At 45 hours per week (2,340 annual hours), $60,000 becomes{" "}
            <strong>$25.64 per hour</strong>. At 50 hours per week (2,600
            annual hours), it falls to <strong>$23.08 per hour</strong>. The
            difference between the nominal 40-hour rate and the rate at your
            actual hours is the hidden cost of unpaid overtime for salaried
            workers.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            These are all gross figures. Federal income tax, state income tax,
            Social Security (6.2%), Medicare (1.45%), and any benefits
            contributions come out of the $60,000 before you see it. Net
            take-home pay on a $60,000 salary varies significantly by state
            and filing status.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Annual Salary to Hourly Wage Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Annual Salary to Hourly Wage Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The general annual salary to hourly formula is{" "}
            <strong>hourly = annual salary &divide; (hours per week &times;
            weeks per year)</strong>. For any salary, divide by your annual
            hours to get the hourly wage. The table below applies this formula
            to common salary levels at the standard 40-hour, 52-week schedule.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Annual Salary to Hourly Rate (40h / 52 weeks)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>$30,000:</strong> $14.42/hr.{" "}
                <strong>$40,000:</strong> $19.23/hr.{" "}
                <strong>$50,000:</strong> $24.04/hr.{" "}
                <strong>$60,000:</strong> $28.85/hr.{" "}
                <strong>$70,000:</strong> $33.65/hr.{" "}
                <strong>$80,000:</strong> $38.46/hr.{" "}
                <strong>$90,000:</strong> $43.27/hr.{" "}
                <strong>$100,000:</strong> $48.08/hr.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            Each value is computed by dividing the salary by 2,080. The
            calculator above applies the same formula to whatever salary,
            hours, and weeks you enter, so the results stay exact even when
            you deviate from the standard schedule. The quick-reference table
            inside the calculator highlights your current row automatically
            when your inputs match a $10,000 increment at 40 hours and 52
            weeks.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: What Is My Hourly Rate from My Salary */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            What Is My Hourly Rate from My Salary
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Your true hourly rate depends on how many hours you actually work,
            not just the 40-hour nominal week. If you are a salaried exempt
            employee who regularly puts in 45 or 50 hours, unpaid overtime
            dilutes your real rate. A $70,000 salary is $33.65 per hour at 40
            hours, but $29.91 at 45 hours and $26.92 at 50 hours. The gap
            widens as the extra hours add up over a year.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            To find your true hourly rate, enter your actual average hours per
            week in the calculator rather than the 40 your contract states.
            Track your hours for a few weeks if you are unsure. The weeks per
            year field accounts for unpaid time off: if you take two unpaid
            weeks, set it to 50 and the calculator divides your salary by
            2,000 paid hours instead of 2,080, which raises the rate for the
            weeks you do work.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Comparing your true hourly rate against an hourly job offer is the
            fairest way to evaluate pay. A $60,000 salary at 50 real hours per
            week ($23.08/hr) may be worth less than a $25/hour hourly position
            at 40 hours that pays overtime. The calculator gives you the
            numbers to make that comparison directly.
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
            hub. To convert in the opposite direction, the{" "}
            <a
              href="/income/hourly-to-salary-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Hourly to Salary Calculator
            </a>{" "}
            turns any hourly wage into an annual salary with optional overtime.
            If you earn an hourly wage and want to see how overtime affects your
            paycheck, the{" "}
            <a
              href="/income/overtime-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Overtime Pay Calculator
            </a>{" "}
            computes time and a half, double time, and annualized gross for any
            multiplier. For budgeting purposes, the{" "}
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
