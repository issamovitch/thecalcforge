import type { Metadata } from "next";
import Image from "next/image";
import { siteConfig, TAX_YEAR } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd, WebApplicationJsonLd } from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { AdSlot } from "@/components/monetization/AdSlot";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { RelatedCalculators } from "@/components/layout/RelatedCalculators";
import { STATES } from "@/lib/states-registry";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const pageTitle = `Federal Paycheck Calculator ${TAX_YEAR} — Take-Home Pay After Taxes`;
const pageDescription = `Free paycheck calculator for ${TAX_YEAR}. Calculate your net take-home pay after federal and state income taxes, FICA, and deductions. Select your state for accurate results.`;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: `${siteConfig.url}/paycheck/calculator` },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${siteConfig.url}/paycheck/calculator`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "CalcForge Paycheck Calculator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: `Free paycheck calculator for ${TAX_YEAR}. Calculate your net take-home pay after federal and state income taxes, FICA, and deductions.`,
    images: ["/og-default.png"],
  },
};

const FEDERAL_FAQS = [
  {
    question: "How much is taken out of my paycheck?",
    answer: "The total amount withheld from your paycheck depends on your gross wages, filing status, and state of residence. For most W-2 employees, the typical deductions are: federal income tax (varies by bracket, from 10% to 37%), Social Security tax (6.2% on wages up to $184,500 in " + TAX_YEAR + "), Medicare tax (1.45% on all wages, plus an additional 0.9% on income over $200,000 for single filers), and any applicable state income tax. Use our calculator above with your salary and state to see the exact breakdown.",
  },
  {
    question: "What is a paycheck withholding calculator and how does it work?",
    answer: "A paycheck withholding calculator estimates the taxes your employer deducts from each paycheck before you receive it. Your employer uses information from your W-4 form (filing status, allowances, additional withholding) to determine how much federal income tax to withhold. The calculator on this page works the same way — enter your salary, select your state and filing status, and it applies the current " + TAX_YEAR + " federal and state tax brackets to show your estimated net take-home pay.",
  },
  {
    question: "What is the difference between federal and state payroll taxes?",
    answer: "Federal payroll taxes are collected by the IRS and consist of three main components: federal income tax (based on progressive brackets), Social Security tax (6.2%), and Medicare tax (1.45%). State payroll taxes vary by state — some like Texas and Florida have zero state income tax, while others like California (up to 13.3%) and New York (up to 10.9%) have their own brackets. Your total payroll tax burden is the sum of all federal, state, and any local taxes withheld from your paycheck.",
  },
  {
    question: "How do I read my paycheck and understand each line item?",
    answer: "Your paycheck stub typically shows: Gross Pay (your total earnings before any deductions), then a series of deduction lines including Federal Income Tax (FIT), Social Security (OASDI), Medicare, State Income Tax (if applicable), and possibly local taxes, health insurance premiums, and 401(k) contributions. The final number is your Net Pay — what actually deposits into your bank account. This calculator shows you exactly how each deduction is calculated so you can verify the numbers on your pay stub.",
  },
  {
    question: "What is FICA and why does it appear on my paycheck?",
    answer: `FICA (Federal Insurance Contributions Act) is the federal payroll tax that funds Social Security and Medicare programs. It appears as two separate lines on your W-2: Social Security tax at 6.2% of wages up to $184,500 (the wage base for ${TAX_YEAR}), and Medicare tax at 1.45% on all wages with no cap. If your wages exceed $200,000 (single) or $250,000 (married filing jointly), an Additional Medicare Tax of 0.9% applies to the excess. Self-employed workers pay both the employee and employer portions (15.3% total) via SECA.`,
  },
];

export default function PaycheckCalculatorPage() {
  const defaultState = STATES[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <CanonicalUrl path="/paycheck/calculator" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Paycheck & Salary", url: `${siteConfig.url}/paycheck` },
          { name: "Paycheck Calculator", url: `${siteConfig.url}/paycheck/calculator` },
        ]}
      />
      <WebApplicationJsonLd
        name="CalcForge Paycheck Calculator"
        description={`Free paycheck calculator with ${TAX_YEAR} federal and state tax data for accurate take-home pay estimates.`}
        url={`${siteConfig.url}/paycheck/calculator`}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Paycheck & Salary", href: "/paycheck" },
          { label: "Paycheck Calculator" },
        ]}
        className="mb-8"
      />

      <div className="flex items-center gap-3.5 mb-8">
        <Image
          src="https://flagcdn.com/w80/us.png"
          alt=""
          width={48}
          height={32}
          className="shrink-0 rounded-sm border border-border"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Paycheck Calculator {TAX_YEAR}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Calculate your take-home pay after federal and state taxes. Select
            your state for location-accurate results.
          </p>
        </div>
      </div>

      <PaycheckCalculator
        stateSlug={defaultState.slug}
        stateName={defaultState.name}
        stateConfig={defaultState.config}
        showStateSelector={true}
      />

      <AdSlot id="paycheck-calculator-below-results" className="mt-8" />

      {/* Federal vs State vs Payroll Taxes — H2 keyword absorption */}
      <section className="mt-12 border-t border-border/50 pt-8">
        <h2 className="text-2xl font-bold text-foreground">
          Federal vs. State vs. Payroll Taxes: What Comes Out of Your Check
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Every paycheck is subject to three layers of taxes. <span className="text-foreground font-medium">Federal income tax</span> uses
          progressive brackets from 10% to 37% and is the same regardless of where you live. <span className="text-foreground font-medium">FICA</span>{" "}
          (Social Security and Medicare) is also federal and uniform across all states.{" "}
          <span className="text-foreground font-medium">State income tax</span> is where the biggest variation occurs — states like
          Texas and Florida levy zero, while California and New York can take over 10% of high incomes. Some
          cities add a fourth layer: local income taxes (NYC, Philadelphia, Yonkers). Use the calculator above
          with your state selected to see all layers applied to your salary.
        </p>
      </section>

      {/* How to Read Your Paycheck — H2 keyword absorption */}
      <section className="mt-12 border-t border-border/50 pt-8">
        <h2 className="text-2xl font-bold text-foreground">
          How to Read Your Paycheck Stub
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Understanding your paycheck stub is the first step to knowing whether your withholding is correct.
          Look for <span className="text-foreground font-medium">Gross Pay</span> at the top — this is your total earnings before deductions.
          Below it you&rsquo;ll see line items for Federal Income Tax (FIT), OASDI (Social Security, 6.2%), HI
          (Medicare, 1.45%), and State Income Tax if your state has one. Your <span className="text-foreground font-medium">Net Pay</span>{" "}
          at the bottom is what deposits into your account. If the numbers on your stub don&rsquo;t match
          this calculator, check your W-4 filing status and allowances — they directly control how much federal
          tax is withheld each pay period.
        </p>
      </section>

      {/* State quick-links for SEO */}
      <section className="mt-12 border-t border-border/50 pt-8">
        <h2 className="text-xl font-semibold text-foreground">
          State-Specific Paycheck Calculators
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Each state calculator includes local tax rules, standard deductions,
          and state-specific deductions like California SDI or New York City
          tax.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STATES.map((state) => (
            <a
              key={state.slug}
              href={`/paycheck/calculator/${state.slug}`}
              className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-ember/40 hover:bg-muted/50"
            >
              <span className="font-medium text-foreground group-hover:text-ember transition-colors">
                {state.name}
              </span>
              <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {state.abbreviation}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-12 border-t border-border/50 pt-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-muted-foreground">
          Common questions about paycheck taxes, withholding, and how the federal
          paycheck calculator works.
        </p>
        <Accordion type="single" collapsible className="mt-6">
          {FEDERAL_FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <RelatedCalculators excludeStateSlug={undefined} includeFederal={false} />
    </div>
  );
}