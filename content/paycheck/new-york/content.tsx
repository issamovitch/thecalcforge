"use client";

import type { StateTaxConfig } from "@/types/calculator";

interface Props {
  stateConfig: StateTaxConfig;
}

export default function NewYorkContent({ stateConfig }: Props) {
  return (
    <div className="prose prose-slate max-w-none space-y-10 mt-10">
      {/* Section 1: The layered tax system — NY state + NYC + Yonkers */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Understanding New York&rsquo;s Layered Paycheck Tax System
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            New York State imposes a progressive income tax with{" "}
            {stateConfig.brackets?.single?.length ?? 9} tax brackets, but the headline state tax
            rate only tells part of the story. What makes New York truly distinctive is the{" "}
            <span className="text-ember font-medium">layering of multiple income taxes</span>{" "}
            on the same paycheck. If you live or work in New York City, your wages are hit by
            state income tax, city income tax, and potentially even the Yonkers income tax — all
            on top of federal withholding, FICA, and mandatory state payroll deductions like Paid
            Family Leave (PFL) and Disability Benefits Law (DBL) insurance. This multi-tiered
            structure is rare among states and can significantly reduce take-home pay for workers
            in the New York metropolitan area.
          </p>
          <p>
            New York also requires two mandatory payroll deductions that appear on every
            paycheck: <span className="text-ember font-medium">Paid Family Leave (PFL)</span>,
            deducted at 0.432% of gross wages, and{" "}
            <span className="text-ember font-medium">Disability Benefits Law (DBL)</span>{" "}
            insurance, deducted at 0.5% up to a small annual cap. Together these add roughly
            $56 per month for a $60,000 earner. While small individually, they are non-negotiable
            withholdings that every New York employee sees on their pay stub.
          </p>
          <p>
            New York City residents face an additional tax with{" "}
            {stateConfig.settings?.nycBrackets?.length ?? 6} progressive brackets of its own,
            ranging from 3.078% to 3.876%. For a single filer earning $60,000 who lives in NYC,
            the city tax alone adds roughly $1,800 to the annual tax bill. Commuters who work in
            the city but live elsewhere (in New Jersey, Connecticut, or upstate New York) are
            generally exempt from the NYC resident tax, though they may still face reciprocal
            withholding agreements with their home states. This resident-versus-commuter
            distinction is one of the most important factors for anyone considering where to live
            relative to their workplace in the tri-state area.
          </p>
          <p>
            Beyond NYC, residents of the city of{" "}
            <span className="text-ember font-medium">Yonkers</span> are subject to a separate
            Yonkers income tax surcharge, which functions as an additional withholding on top of
            state and city taxes. While smaller than the NYC tax, it further illustrates how
            localized New York&rsquo;s tax structure can be. When comparing New York to
            neighboring states like New Jersey (which has its own progressive system) or
            Pennsylvania (with its flat 3.07% rate), the overall tax burden in the NYC metro area
            is among the highest in the nation — comparable in impact to California, though
            arrived at through a very different mechanism of layered jurisdictions.
          </p>
          <p>
            New York also offers a range of tax credits that can meaningfully reduce liability
            for lower- and middle-income workers, including the Empire State Child Credit, the
            Earned Income Credit (which supplements the federal EITC), and the NYC School Tax
            Credit. However, for single filers without dependents earning a moderate salary,
            these credits have limited impact, and the combined state-plus-city withholding
            dominates the paycheck.
          </p>
        </div>
      </section>

      {/* Section 2: Worked example (placed before brackets for NY — different structure) */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Take-Home Pay on a $60,000 Salary in New York State (Outside NYC)
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          This breakdown shows a single filer earning $60,000 per year who lives in New York
          State but outside New York City. State tax is calculated using marginal brackets on
          taxable income after the New York standard deduction ($8,000 for single filers). Mandatory
          Paid Family Leave (0.432%) and Disability Benefits (0.5%) are included. No NYC or
          Yonkers tax applies here.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200 rounded-lg overflow-hidden max-w-lg">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="p-3 font-medium">Gross Annual Pay</td>
                <td className="p-3 text-right font-semibold">$60,000.00</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 pl-6 text-muted-foreground">Federal Income Tax</td>
                <td className="p-3 text-right text-muted-foreground">–$5,020.00</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 pl-6 text-muted-foreground">Social Security (6.2%)</td>
                <td className="p-3 text-right text-muted-foreground">–$3,720.00</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 pl-6 text-muted-foreground">Medicare (1.45%)</td>
                <td className="p-3 text-right text-muted-foreground">–$870.00</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 pl-6 text-muted-foreground">NYS Income Tax</td>
                <td className="p-3 text-right text-muted-foreground">–$2,643.00</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 pl-6 text-muted-foreground">NY Paid Family Leave (0.432%)</td>
                <td className="p-3 text-right text-muted-foreground">–$259.20</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 pl-6 text-muted-foreground">NY Disability Benefits (0.5%)</td>
                <td className="p-3 text-right text-muted-foreground">–$31.20</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-3 font-semibold">Total Deductions</td>
                <td className="p-3 text-right font-semibold">–$12,543.40</td>
              </tr>
              <tr className="border-t-2 border-slate-300">
                <td className="p-3 text-lg font-bold text-ember">Net Annual Take-Home Pay</td>
                <td className="p-3 text-right text-lg font-bold text-ember">$47,456.60</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 text-muted-foreground">Effective Tax Rate</td>
                <td className="p-3 text-right text-muted-foreground">~20.9%</td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground">Bi-Weekly Take-Home</td>
                <td className="p-3 text-right text-muted-foreground">~$1,825.25</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-ember/5 border border-ember/20 rounded-lg">
          <h3 className="text-xl font-semibold text-slate-deep mb-2">
            NYC Residents: Add ~$1,800 More
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            If the same $60,000 earner lives in New York City, the NYC personal income tax
            (approximately 3.078%–3.876% progressive) would subtract an additional{" "}
            <span className="text-ember font-medium">~$1,800</span> from the annual take-home
            pay, bringing the net down to roughly $45,600. Always use our calculator above with
            the NYC resident option enabled for accurate results.
          </p>
        </div>
      </section>

      {/* Section 3: New York tax brackets table */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          New York State Income Tax Brackets (2026)
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          New York&rsquo;s state tax brackets are progressive and apply to taxable income after
          deductions. These are the rates for single filers. Note that taxpayers with income over
          $107,650 also pay a supplemental tax based on a different rate schedule.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left font-semibold text-slate-700 border-b border-slate-200">
                  Tax Rate
                </th>
                <th className="p-3 text-left font-semibold text-slate-700 border-b border-slate-200">
                  Single Filers — Taxable Income
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="p-3">3.90%</td>
                <td className="p-3">$0 – $8,500</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3">4.40%</td>
                <td className="p-3">$8,501 – $11,700</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3">5.15%</td>
                <td className="p-3">$11,701 – $13,900</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3">5.40%</td>
                <td className="p-3">$13,901 – $80,650</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3">5.90%</td>
                <td className="p-3">$80,651 – $215,400</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3">6.85%</td>
                <td className="p-3">$215,401 – $1,077,550</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3">9.65%</td>
                <td className="p-3">$1,077,551 – $5,000,000</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3">10.30%</td>
                <td className="p-3">$5,000,001 – $25,000,000</td>
              </tr>
              <tr className="bg-ember/5">
                <td className="p-3 font-semibold text-ember">10.90%</td>
                <td className="p-3 font-semibold text-ember">$25,000,001+</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Commuter vs resident considerations */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Resident vs. Commuter: Where You Live Matters Enormously
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            One of the biggest financial decisions for anyone working in the New York City
            metropolitan area is whether to live in the city, in a nearby suburb like Yonkers,
            or in a different state entirely. New York City residents pay the NYC personal income
            tax on all income regardless of where it&rsquo;s earned. Non-residents who work in
            the city generally do not, though their home state will tax them instead.
          </p>
          <p>
            For example, a $100,000 earner living in Stamford, Connecticut and commuting to
            Manhattan avoids the NYC resident tax entirely, but pays Connecticut&rsquo;s own
            progressive state tax. Someone earning the same salary in Newark, New Jersey faces
            New Jersey&rsquo;s graduated rates. And someone living in Philadelphia? They&rsquo;d
            pay Pennsylvania&rsquo;s flat 3.07% plus Philadelphia&rsquo;s local wage tax — a
            very different calculation. The interplay between these jurisdictions is one of the
            most complex payroll tax scenarios in the United States.
          </p>
        </div>
      </section>

      {/* Section 5: NYC and Metro Area take-home pay */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          New York City and Metro Area Take-Home Pay
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            One of the most common questions workers in the New York area ask is how take-home
            pay varies across different parts of the state. The answer largely comes down to one
            factor: <span className="text-ember font-medium">local income tax</span>. New York
            State tax rates are uniform whether you live in Manhattan, Brooklyn, or Buffalo — the
            progressive brackets of 3.9% to 10.9% apply equally across the entire state.
          </p>
          <p>
            The key differentiator is the NYC personal income tax. Residents of Manhattan, Brooklyn,
            Queens, the Bronx, and Staten Island all pay the same NYC tax brackets (3.078% to
            3.876%), which means a worker earning $80,000 in Manhattan will see nearly identical
            take-home pay to one earning the same salary in Brooklyn. The difference between
            boroughs is negligible from a tax perspective — it is the city boundary itself that
            matters.
          </p>
          <p>
            Buffalo and other upstate cities like Rochester, Syracuse, and Albany have no local
            income tax on top of the state rate. For a $60,000 earner, living in Buffalo instead of
            NYC can mean roughly $1,800 more in annual take-home pay simply by avoiding the city
            tax. Workers considering a move from the NYC metro area to upstate should factor in this
            difference alongside cost-of-living changes when evaluating total compensation.
          </p>
          <p>
            Yonkers residents occupy a middle ground: they pay a smaller surcharge (16.75% of net
            NYS tax liability) rather than the full NYC tax rate. Commuters who work in NYC or
            Yonkers but live in New Jersey, Connecticut, or upstate New York generally avoid these
            local taxes entirely, though they will still owe NY State non-resident tax on income
            earned within the state and may face reciprocal taxation in their home state.
          </p>
        </div>
      </section>

      {/* Section 6: Comparison links */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Compare New York to Other States
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          New York&rsquo;s combined tax burden can be eye-opening. Use these comparison
          calculators to see how take-home pay differs across states.
        </p>
        <ul className="space-y-2">
          <li>
            <a
              href="/paycheck/calculator/california"
              className="text-primary hover:underline font-medium"
            >
              California Paycheck Calculator
            </a>{" "}
            — The only state with a higher top marginal rate than New York&rsquo;s.
          </li>
          <li>
            <a
              href="/paycheck/calculator/pennsylvania"
              className="text-primary hover:underline font-medium"
            >
              Pennsylvania Paycheck Calculator
            </a>{" "}
            — A flat 3.07% rate makes PA a significantly cheaper option for many earners.
          </li>
          <li>
            <a
              href="/paycheck/calculator/texas"
              className="text-primary hover:underline font-medium"
            >
              Texas Paycheck Calculator
            </a>{" "}
            — No state income tax at all — the polar opposite of New York&rsquo;s layered system.
          </li>
          <li>
            <a
              href="/paycheck/calculator/florida"
              className="text-primary hover:underline font-medium"
            >
              Florida Paycheck Calculator
            </a>{" "}
            — Another zero-income-tax state that many New Yorkers consider for relocation.
          </li>
        </ul>
      </section>
    </div>
  );
}