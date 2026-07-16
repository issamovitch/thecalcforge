"use client";

import type { StateTaxConfig } from "@/types/calculator";

interface Props {
  stateConfig: StateTaxConfig;
}

export default function CaliforniaContent({ stateConfig }: Props) {
  const sdiRate = stateConfig.settings?.sdiRate ?? 0.013;
  const sdiWageBase = stateConfig.settings?.sdiWageBase ?? 153164;
  const mentalHealthRate = stateConfig.settings?.mentalHealthRate ?? 0.01;
  const mentalHealthThreshold = stateConfig.settings?.mentalHealthThreshold ?? 1000000;

  return (
    <div className="prose prose-slate max-w-none space-y-10 mt-10">
      {/* Section 1: How California taxes your paycheck */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          How California Taxes Your Paycheck
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            California operates one of the most aggressive progressive income tax systems in the
            nation, with {stateConfig.brackets?.single?.length ?? 9} tax brackets for single
            filers stretching from a low of 1% all the way up to 12.3% on the highest earners.
            Unlike many states that top out at 5% or 6%, California&rsquo;s top marginal rate is
            among the highest of any state in the country — a distinction that has real
            consequences for your take-home pay, especially as your income climbs into the upper
            brackets.
          </p>
          <p>
            Beyond the standard income tax brackets, California paychecks are subject to two
            additional payroll deductions that are unique to the state. The first is the{" "}
            <span className="text-ember font-medium">State Disability Insurance (SDI)</span> tax,
            also known as CASDI, which is deducted at a rate of {(sdiRate * 100).toFixed(1)}% on
            wages up to ${sdiWageBase.toLocaleString()}. This program provides short-term
            disability benefits, Paid Family Leave, and non-industrial disability insurance to
            eligible California workers. For someone earning $60,000 annually, the SDI deduction
            amounts to roughly ${(60000 * sdiRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} per year.
          </p>
          <p>
            The second distinctive withholding is the{" "}
            <span className="text-ember font-medium">Mental Health Services Tax</span>, a 1%
            surcharge that applies only to taxpayers with taxable income exceeding{" "}
            ${mentalHealthThreshold.toLocaleString()}. While this tax does not affect the
            majority of workers, it is automatically withheld from paychecks for high earners and
            funds mental health programs across the state. This combination of high marginal
            rates and mandatory SDI contributions is why California consistently ranks among the
            states with the heaviest total tax burden on wage earners.
          </p>
          <p>
            California does offer a standard deduction that reduces your taxable income before
            the progressive bracket rates are applied. The state also provides a range of
            additional credits — including the earned income tax credit (CalEITC), the child and
            dependent care credit, and various itemized deductions — which can further reduce
            your tax liability. For most middle-income filers, the standard deduction combined
            with the progressive bracket structure determines the bulk of their state tax
            liability.
          </p>
        </div>
      </section>

      {/* Section 2: California tax brackets table */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          California Income Tax Brackets (2026)
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          California&rsquo;s progressive brackets mean each additional dollar of income is taxed
          at a higher rate. Below are the brackets for single filers. Married filing jointly
          brackets are approximately double these thresholds.
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
                <td className="p-3">1.0%</td>
                <td className="p-3">$0 – $11,330</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3">2.0%</td>
                <td className="p-3">$11,331 – $26,859</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3">4.0%</td>
                <td className="p-3">$26,860 – $42,391</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3">6.0%</td>
                <td className="p-3">$42,392 – $58,846</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3">8.0%</td>
                <td className="p-3">$58,847 – $74,372</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3">9.3%</td>
                <td className="p-3">$74,373 – $379,898</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3">10.3%</td>
                <td className="p-3">$379,899 – $455,873</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3">11.3%</td>
                <td className="p-3">$455,874 – $759,790</td>
              </tr>
              <tr className="bg-ember/5">
                <td className="p-3 font-semibold text-ember">12.3%</td>
                <td className="p-3 font-semibold text-ember">$759,791+</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Note: These are marginal rates. Only income within each bracket is taxed at that
          bracket&rsquo;s rate.
        </p>
      </section>

      {/* Section 3: Worked example */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Take-Home Pay on a $60,000 Salary in California
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Here&rsquo;s a detailed breakdown of what a single filer earning $60,000 per year
          takes home in California after all federal and state withholdings. This assumes the
          standard deduction, no pre-tax contributions, and no additional local taxes.
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
                <td className="p-3 pl-6 text-muted-foreground">California State Income Tax</td>
                <td className="p-3 text-right text-muted-foreground">–$1,602.86</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 pl-6 text-muted-foreground">CA SDI (1.3%)</td>
                <td className="p-3 text-right text-muted-foreground">–$780.00</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-3 font-semibold">Total Deductions</td>
                <td className="p-3 text-right font-semibold">–$11,992.86</td>
              </tr>
              <tr className="border-t-2 border-slate-300">
                <td className="p-3 text-lg font-bold text-ember">Net Annual Take-Home Pay</td>
                <td className="p-3 text-right text-lg font-bold text-ember">$48,007.14</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 text-muted-foreground">Effective Tax Rate</td>
                <td className="p-3 text-right text-muted-foreground">~20.0%</td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground">Monthly Take-Home</td>
                <td className="p-3 text-right text-muted-foreground">~$4,000.60</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          California state tax calculated using marginal brackets on taxable income after the
          federal standard deduction ($16,100 for 2026). SDI deducted on gross wages. Figures are
          approximate and may vary based on W-4 allowances, credits, and deductions.
        </p>
      </section>

      {/* Section 4: California City Salary Calculators */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          California City Salary Calculators
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Whether you&rsquo;re calculating your take-home pay in Los Angeles, San Francisco,
            San Diego, San Jose, Sacramento, or any other California city, the state tax brackets
            and payroll deductions are exactly the same. California does not levy local or city
            income taxes — the progressive state brackets (1% to 12.3%), the 1.3% SDI rate, and
            the standard deductions are uniform across the entire state. That means this California
            salary calculator works for every city and metro area in California. The only factors
            that vary by location are federal tax treatment and voluntary deductions like 401(k)
            contributions — your state tax liability will be identical whether you live in LA or San
            Francisco.
          </p>
        </div>
      </section>

      {/* Section 5: Comparison links */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Compare California to Other States
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Wondering how California&rsquo;s tax burden stacks up? California has among the
          highest state income tax rates in the country, which is especially noticeable when
          compared to states with flat taxes or no income tax at all.
        </p>
        <ul className="space-y-2">
          <li>
            <a
              href="/paycheck/calculator/texas"
              className="text-primary hover:underline font-medium"
            >
              Texas Paycheck Calculator
            </a>{" "}
            — Texas has no state income tax, meaning a $60,000 earner keeps significantly more
            than in California.
          </li>
          <li>
            <a
              href="/paycheck/calculator/florida"
              className="text-primary hover:underline font-medium"
            >
              Florida Paycheck Calculator
            </a>{" "}
            — Like Texas, Florida levies zero state income tax, making it a popular destination
            for high earners leaving California.
          </li>
          <li>
            <a
              href="/paycheck/calculator/new-york"
              className="text-primary hover:underline font-medium"
            >
              New York Paycheck Calculator
            </a>{" "}
            — New York&rsquo;s combined state and city taxes rival California&rsquo;s, but
            the bracket structure differs significantly.
          </li>
          <li>
            <a
              href="/paycheck/calculator/pennsylvania"
              className="text-primary hover:underline font-medium"
            >
              Pennsylvania Paycheck Calculator
            </a>{" "}
            — Pennsylvania uses a flat 3.07% rate, which is dramatically lower than
            California&rsquo;s marginal rates for most earners.
          </li>
        </ul>
      </section>
    </div>
  );
}