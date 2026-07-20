import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  WebApplicationJsonLd,
} from "@/components/seo/JsonLd";
import HourlyToSalaryCalculator from "@/components/calculators/HourlyToSalaryCalculator";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/monetization/AdSlot";
import { FaqSection } from "@/components/shared/FaqSection";

/* ─── SEO Metadata ─── */

const pageUrl = `${siteConfig.url}/income/hourly-to-salary-calculator`;
const pageTitle =
  "Hourly to Salary Calculator \u2013 Annual Income From Your Wage | CalcForge";
const pageDescription =
  "Free hourly to salary calculator. Convert any hourly wage to annual salary, plus weekly, biweekly, and monthly gross pay based on your real hours.";

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
    question: "How do I convert my hourly wage to an annual salary?",
    answer:
      "Multiply your hourly wage by the number of hours you work per week, then multiply that by the number of weeks you work per year. For a standard full-time schedule of 40 hours per week and 52 weeks, that is 2,080 hours. A $20 hourly wage times 2,080 hours equals $41,600 per year. If you work a different schedule, use your actual hours and weeks for an accurate annual figure.",
  },
  {
    question: "Is $20 an hour is how much a year?",
    answer:
      "$20 an hour is $41,600 a year at 40 hours per week for 52 weeks (2,080 total hours). That breaks down to $800.00 per week, $1,600.00 biweekly, and $3,466.67 per month in gross pay. If you work 35 hours per week part-time, $20 an hour is $36,400 a year. With 5 weekly overtime hours at time and a half, it rises to $49,400 a year.",
  },
  {
    question: "How many work hours are in a year?",
    answer:
      "A standard full-time work year is 2,080 hours: 40 hours per week multiplied by 52 weeks. This is the number most hourly-to-salary calculators use by default. If you take two weeks of unpaid time off, your paid hours drop to 2,000 (40 times 50). Part-time schedules and reduced-week arrangements produce different totals, which is why the calculator lets you adjust both hours per week and weeks per year.",
  },
  {
    question: "Does overtime change my annual salary?",
    answer:
      "Yes. Overtime adds to your annual gross because it is paid at a higher rate than your regular wage. At $20 per hour with 5 weekly overtime hours at time and a half (1.5x), you earn an extra $150 per week ($20 times 1.5 times 5), which adds $7,800 to your annual gross over 52 weeks ($41,600 becomes $49,400). The calculator above includes an optional overtime block so you can see the with-OT and without-OT totals side by side.",
  },
  {
    question: "Do these figures include taxes?",
    answer:
      "No. All amounts shown by this calculator are gross figures before federal and state income tax, Social Security, Medicare, and any other deductions. Your actual take-home pay will be lower. The amount withheld depends on your filing status, dependents, deductions, and state of residence. Consult a tax professional or payroll department for net pay estimates.",
  },
];

/* ─── Page Component ─── */

export default function HourlyToSalaryPage() {
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
          { name: "Hourly to Salary Calculator", url: pageUrl },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <WebApplicationJsonLd
        name="Hourly to Salary Calculator"
        description="Free online hourly to salary calculator. Convert any hourly wage to annual salary, plus weekly, biweekly, and monthly gross pay with optional overtime."
        url={pageUrl}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Income Calculators", href: "/income" },
          { label: "Hourly to Salary Calculator" },
        ]}
        className="mb-8 print:hidden"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem]">
        Hourly to Salary Calculator
      </h1>

      {/* Intro paragraph (first 100 words answer the primary keyword) */}
      <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-3xl print:hidden">
        $20 an hour is $41,600 a year at 40 hours per week. This hourly to
        salary calculator converts any hourly wage into an annual salary using
        your real work hours, then shows the equivalent weekly, biweekly, and
        monthly gross pay. Enter your wage, hours per week, and weeks per year
        to see your annual total, with an optional overtime block and a live
        reference line that updates as you type.
      </p>

      {/* Calculator */}
      <div className="mt-8">
        <HourlyToSalaryCalculator />
      </div>

      <div className="print:hidden">
        <AdSlot slot="mid-content" />
      </div>

      {/* ─── Content Sections ─── */}

      <div className="print:hidden">
        <Separator className="my-12" />

        {/* H2: Hourly to Salary Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Hourly to Salary Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            An hourly to salary calculator multiplies your hourly wage by your
            annual work hours to produce an equivalent yearly salary. The
            standard full-time year is 2,080 hours, calculated as 40 hours per
            week multiplied by 52 weeks. At that baseline, a $15 hourly wage
            equals $31,200 per year, a $20 hourly wage equals $41,600 per year,
            and a $25 hourly wage equals $52,000 per year.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The conversion matters because hourly and salaried pay structures
            are not directly comparable without a common denominator. A job
            offering $20 per hour sounds modest next to a $50,000 salary, but
            at 40 hours per week for 52 weeks the hourly position pays $41,600,
            only $8,400 less. The calculator above lets you adjust hours per
            week and weeks per year so the annual figure reflects how much you
            actually work rather than a nominal 2,080-hour assumption.
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

        {/* H2: How the Hourly to Salary Conversion Works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How the Hourly to Salary Conversion Works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The formula is: annual salary equals hourly wage multiplied by
            hours per week multiplied by weeks per year. Written out, it is{" "}
            <strong>annual = wage &times; hours &times; weeks</strong>. For a
            $20 hourly wage at 40 hours per week over 52 weeks, the calculation
            is $20 &times; 40 &times; 52 = $41,600 per year.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The 2,080-hour standard year comes from the conventional full-time
            schedule: 40 hours per week, 52 weeks per year, with no unpaid time
            off. Most hourly-to-salary calculators use 2,080 as the default. If
            you work part-time at 35 hours per week, your annual hours fall to
            1,820 (35 times 52) and $20 per hour produces $36,400 per year. If
            you take two unpaid weeks, your paid weeks drop to 50 and the same
            wage produces $40,000 per year instead of $41,600.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Worked Example: $20 Per Hour
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                $20 &times; 40 &times; 52 = <strong>$41,600 annual gross</strong>.
                Weekly gross = $20 &times; 40 = <strong>$800.00</strong>.
                Biweekly gross = $800.00 &times; 2 = <strong>$1,600.00</strong>.
                Monthly gross = $41,600 &divide; 12 = <strong>$3,466.67</strong>.
                Every figure is exact to the cent.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* H2: $20 an Hour Is How Much a Year */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            $20 an Hour Is How Much a Year
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            $20 an hour is <strong>$41,600 a year</strong> at the standard
            2,080-hour work year (40 hours per week for 52 weeks). The math is
            $20 &times; 2,080 = $41,600. Your weekly gross is $800.00 ($20
            times 40), your biweekly gross is $1,600.00, and your monthly gross
            is $3,466.67.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you work part-time at 35 hours per week, $20 an hour produces{" "}
            <strong>$36,400 per year</strong> ($20 &times; 35 &times; 52). If
            you add 5 weekly overtime hours at time and a half (1.5x), your
            weekly gross rises to $950 ($800 regular plus $150 overtime) and
            your annual gross becomes <strong>$49,400 per year</strong>. The
            calculator above includes an optional overtime block so you can
            model both scenarios and see the with-OT and without-OT totals
            side by side.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            These are all gross figures. Federal income tax, state income tax,
            Social Security (6.2%), Medicare (1.45%), and any benefits
            contributions come out of the $41,600 before you see it. Net
            take-home pay on a $20 hourly wage varies significantly by state,
            filing status, and withholding allowances.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: $25 an Hour Is How Much a Year */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            $25 an Hour Is How Much a Year
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            $25 an hour is <strong>$52,000 a year</strong> at 40 hours per week
            for 52 weeks. The calculation is $25 &times; 2,080 = $52,000.
            Weekly gross pay is $1,000.00, biweekly gross is $2,000.00, and
            monthly gross is $4,333.33. A daily rate based on an 8-hour workday
            is $200.00.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you work part-time at 35 hours per week, $25 an hour produces{" "}
            <strong>$45,500 per year</strong> ($25 &times; 35 &times; 52). At
            30 hours per week, it falls to <strong>$39,000 per year</strong>{" "}
            ($25 &times; 30 &times; 52). Reduced schedules lower the annual
            total proportionally, which is why the calculator lets you adjust
            hours per week independently of the wage.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Use the calculator above to test your own scenario. Enter $25.00 as
            the hourly wage, then adjust the hours per week slider to see how
            the annual salary changes. The live reference line updates
            instantly with the exact figure, and the quick-reference table
            highlights the $25 row automatically when your inputs match the
            standard 40-hour, 52-week schedule.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: Hourly Wage to Annual Salary Calculator */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Hourly Wage to Annual Salary Calculator
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The general hourly wage to annual formula is{" "}
            <strong>annual = hourly wage &times; hours per week &times; weeks
            per year</strong>. For any wage, multiply by your annual hours to
            get the equivalent salary. The table below applies this formula to
            common hourly wages at the standard 40-hour, 52-week schedule.
          </p>
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-2">
                Hourly Wage to Annual Salary (40h / 52 weeks)
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>$12/hr:</strong> $24,960/yr.{" "}
                <strong>$15/hr:</strong> $31,200/yr.{" "}
                <strong>$18/hr:</strong> $37,440/yr.{" "}
                <strong>$20/hr:</strong> $41,600/yr.{" "}
                <strong>$22/hr:</strong> $45,760/yr.{" "}
                <strong>$25/hr:</strong> $52,000/yr.{" "}
                <strong>$30/hr:</strong> $62,400/yr.{" "}
                <strong>$35/hr:</strong> $72,800/yr.{" "}
                <strong>$40/hr:</strong> $83,200/yr.
              </p>
            </CardContent>
          </Card>
          <p className="text-muted-foreground leading-relaxed">
            Each value is computed by multiplying the wage by 2,080. The
            calculator above applies the same formula to whatever wage, hours,
            and weeks you enter, so the results stay exact even when you
            deviate from the standard schedule. The quick-reference table
            inside the calculator highlights your current row automatically
            when your inputs match a listed wage at 40 hours and 52 weeks.
          </p>
        </section>

        <Separator className="my-10" />

        {/* H2: How Much Is $15 an Hour Annually */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            How Much Is $15 an Hour Annually
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            $15 an hour is <strong>$31,200 a year</strong> at 40 hours per week
            for 52 weeks. The calculation is $15 &times; 2,080 = $31,200.
            Weekly gross is $600.00, biweekly gross is $1,200.00, and monthly
            gross is <strong>$2,600.00</strong>. A daily rate based on an
            8-hour workday is $120.00.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            At 35 hours per week, $15 an hour produces $27,300 per year. At 30
            hours per week, it falls to $23,400 per year. The annual figure
            scales linearly with hours, so a part-time schedule at the same
            wage produces a proportionally smaller salary.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether $31,200 a year is enough to live on depends on where you
            live and your household size. Housing is the largest expense for
            most households, and rent varies widely between regions, so a wage
            that covers essentials comfortably in one area may fall short in
            another. Common benchmarks like the federal poverty level and area
            median income provide context, but they are calibrated to specific
            household sizes and locations rather than to a single wage figure.
            Use the calculator above to see your exact gross, then subtract
            taxes and your real expenses to judge whether $15 an hour works for
            your situation.
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
            hub. If you are comparing a job offer stated as an annual salary,
            the{" "}
            <a
              href="/income/salary-to-hourly-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Salary to Hourly Calculator
            </a>{" "}
            converts in the opposite direction so you can see the underlying
            hourly rate. For hourly workers who regularly exceed 40 hours, the{" "}
            <a
              href="/income/overtime-calculator"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Overtime Pay Calculator
            </a>{" "}
            breaks out time and a half, double time, and the annualized impact
            of overtime on any wage.
          </p>
        </section>
      </div>
    </div>
  );
}
