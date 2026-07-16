"use client";

import type { StateTaxConfig } from "@/types/calculator";

interface Props {
  stateConfig: StateTaxConfig;
}

export default function PennsylvaniaContent({ stateConfig }: Props) {
  const flatRate = stateConfig.flatRate ?? 0.0307;
  const defaultLocalEit = stateConfig.settings?.defaultLocalEitRate ?? 0.01;

  return (
    <div className="prose prose-slate max-w-none space-y-10 mt-10">
      {/* Section 1: The simplicity of the flat rate + the complexity of local EIT */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          How Pennsylvania Taxes Your Paycheck
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Pennsylvania takes a refreshingly straightforward approach to state income tax:{" "}
            <span className="text-ember font-medium">a flat {(flatRate * 100).toFixed(2)}% rate
            on all taxable income</span>, regardless of how much you earn. Unlike California and
            New York, where climbing into a higher bracket means each additional dollar is taxed
            at a steeper rate, Pennsylvania treats every dollar of income the same. A teacher
            earning $45,000 and a software engineer earning $200,000 both pay the same 3.07%
            state tax rate on their earnings. This simplicity makes it easy to estimate your
            state tax liability — just multiply your taxable income by 0.0307.
          </p>
          <p>
            However, the apparent simplicity of the flat rate conceals a more complex reality at
            the local level. Pennsylvania is somewhat unusual in that it authorizes municipalities
            and school districts to levy their own{" "}
            <span className="text-ember font-medium">Earned Income Tax (EIT)</span> on top of the
            state rate. Over 2,500 local taxing jurisdictions across Pennsylvania impose an EIT,
            and the rates vary widely. The default local EIT rate is{" "}
            {(defaultLocalEit * 100).toFixed(1)}% (split between the municipality and school
            district), but in many areas it runs higher — particularly in the Philadelphia region
            and other populated counties.
          </p>
          <p>
            <span className="text-ember font-medium">Philadelphia</span> is the most significant
            exception. The city imposes a resident wage tax (functionally equivalent to a local
            EIT) of approximately <span className="font-medium">3.75%</span> for residents and
            <span className="font-medium"> 3.44%</span> for non-residents who work in the city.
            For a Philadelphia resident, this means the effective local-plus-state income tax
            rate on wages is roughly 6.82% (3.07% + 3.75%) — dramatically higher than the
            headline 3.07% state rate alone. Similarly, Scranton levies a 3.0% resident EIT,
            and Pittsburgh&rsquo;s combined rate (city + school district) approaches 3%. These
            local taxes are typically withheld directly from your paycheck by your employer, so
            they show up alongside the state withholding.
          </p>
          <p>
            In addition to state income tax and local EIT, Pennsylvania employees are also subject
            to a <span className="text-ember font-medium">State Unemployment Insurance (SUI)
            contribution of 0.07%</span> on wages, withheld directly from each paycheck. Though
            small, it is a mandatory deduction that applies to virtually all W-2 employees in the
            state.
          </p>
          <p>
            Pennsylvania also has a relatively limited set of deductions and credits compared to
            other states. There is no standard deduction at the state level. Instead, taxpayers
            can claim a personal exemption and certain itemized deductions, but these are more
            restricted than the federal equivalents. The state does offer a Tax Forgiveness
            program (also called the &ldquo;Tax Back&rdquo; program) for very low-income
            households, which can eliminate state tax liability entirely for eligible filers.
          </p>
        </div>
      </section>

      {/* Section 2: Worked example — Pennsylvania outside Philadelphia */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Take-Home Pay on a $60,000 Salary in Pennsylvania
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          This example assumes a single filer earning $60,000 per year living in a typical
          Pennsylvania municipality (outside Philadelphia) with a 1% local EIT rate. The state
          tax is simply 3.07% of gross wages, and the local EIT adds another 1%.
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
                <td className="p-3 pl-6 text-muted-foreground">PA State Income Tax (3.07%)</td>
                <td className="p-3 text-right text-muted-foreground">–$1,842.00</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 pl-6 text-muted-foreground">PA Employee SUI (0.07%)</td>
                <td className="p-3 text-right text-muted-foreground">–$42.00</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 pl-6 text-muted-foreground">Local EIT (1.00%)</td>
                <td className="p-3 text-right text-muted-foreground">–$600.00</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-3 font-semibold">Total Deductions</td>
                <td className="p-3 text-right font-semibold">–$12,274.00</td>
              </tr>
              <tr className="border-t-2 border-slate-300">
                <td className="p-3 text-lg font-bold text-ember">Net Annual Take-Home Pay</td>
                <td className="p-3 text-right text-lg font-bold text-ember">$47,726.00</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 text-muted-foreground">Effective Tax Rate</td>
                <td className="p-3 text-right text-muted-foreground">~20.5%</td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground">Semi-Monthly Take-Home</td>
                <td className="p-3 text-right text-muted-foreground">~$1,988.58</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-ember/5 border border-ember/20 rounded-lg">
          <h3 className="text-xl font-semibold text-slate-deep mb-2">
            Philadelphia Residents: Expect ~$2,250 Less Per Year
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            A Philadelphia resident earning $60,000 pays the 3.07% state tax plus a 3.75% city
            resident wage tax, totaling <span className="text-ember font-medium">6.82%</span> in
            state and local income taxes — about $4,092 combined, plus an additional $42 in PA
            employee SUI. That&rsquo;s roughly{" "}
            <span className="text-ember font-medium">$1,692 more per year</span> than a
            non-Philadelphia PA resident with a 1% local EIT and the same PA SUI withholding.
            Use the local EIT rate input above to calculate your exact situation.
          </p>
        </div>
      </section>

      {/* Section: How to find your local EIT rate */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Pennsylvania Local EIT: How to Find Your Rate
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Under <span className="text-ember font-medium">Act 32 of 2005</span>,
            Pennsylvania consolidated the collection of local Earned Income Tax into
            county-wide tax collection districts. This law standardized how local EIT is
            withheld and remitted, requiring employers to use a{}
            <span className="text-ember font-medium">Political Subdivision (PSD) code</span>{}
            to identify the correct municipality for each employee&rsquo;s withholding.
          </p>
          <p>
            To find your local EIT rate, start by locating your PSD code. The Pennsylvania
            Department of Community and Economic Development (DCED) maintains a{}
            <span className="text-ember font-medium">searchable PSD code directory</span>{}
            on its website where you can enter your home address and retrieve both your PSD
            code and the corresponding local tax rate. Alternatively, check your pay stub —
            your employer is required to print your PSD code on your wage statement.
          </p>
          <p>
            Once you have your rate, enter it in the <span className="text-ember font-medium">Local EIT Rate</span> input
            field above to get an accurate take-home pay calculation tailored to your
            municipality. The table below shows common rates across Pennsylvania for reference.
          </p>
        </div>
      </section>

      {/* Section 3: Local EIT rates comparison table */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Pennsylvania Local EIT Rates: A Patchwork System
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Because Pennsylvania local taxes are set by individual municipalities and school
          districts, your total rate depends on exactly where you live. Here are some common
          examples of combined local EIT rates across the state.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-3 text-left font-semibold text-slate-700 border-b border-slate-200">
                  Location
                </th>
                <th className="p-3 text-left font-semibold text-slate-700 border-b border-slate-200">
                  Status
                </th>
                <th className="p-3 text-left font-semibold text-slate-700 border-b border-slate-200">
                  Local Tax Rate
                </th>
                <th className="p-3 text-left font-semibold text-slate-700 border-b border-slate-200">
                  Combined with State (3.07%)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="p-3 font-medium">Philadelphia</td>
                <td className="p-3">Resident</td>
                <td className="p-3">3.75%</td>
                <td className="p-3 font-semibold">6.82%</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 font-medium">Philadelphia</td>
                <td className="p-3">Non-Resident Worker</td>
                <td className="p-3">3.44%</td>
                <td className="p-3 font-semibold">6.51%</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 font-medium">Scranton</td>
                <td className="p-3">Resident</td>
                <td className="p-3">3.00%</td>
                <td className="p-3 font-semibold">6.07%</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 font-medium">Pittsburgh</td>
                <td className="p-3">Resident</td>
                <td className="p-3">~2.80%</td>
                <td className="p-3 font-semibold">~5.87%</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 font-medium">Allentown</td>
                <td className="p-3">Resident</td>
                <td className="p-3">~1.75%</td>
                <td className="p-3 font-semibold">~4.82%</td>
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-3 font-medium">Harrisburg</td>
                <td className="p-3">Resident</td>
                <td className="p-3">~1.60%</td>
                <td className="p-3 font-semibold">~4.67%</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="p-3 font-medium">Typical PA Municipality</td>
                <td className="p-3">Resident</td>
                <td className="p-3">~1.00%</td>
                <td className="p-3 font-semibold">~4.07%</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="p-3 font-medium">Some Rural Areas</td>
                <td className="p-3">Resident</td>
                <td className="p-3">0.00%</td>
                <td className="p-3 font-semibold">3.07%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Local rates are approximate and may include both municipal and school district portions.
          Always verify your exact rate with your local tax collector or employer&rsquo;s payroll
          department.
        </p>
      </section>

      {/* Section 4: Comparison links */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Compare Pennsylvania to Other States
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Pennsylvania&rsquo;s flat 3.07% state rate is one of the lowest among states that do
          levy an income tax. But how does the total picture — including local EIT — compare to
          other states?
        </p>
        <ul className="space-y-2">
          <li>
            <a
              href="/paycheck/calculator/california"
              className="text-primary hover:underline font-medium"
            >
              California Paycheck Calculator
            </a>{" "}
            — California&rsquo;s top bracket of 13.3% dwarfs PA&rsquo;s 3.07%, though the
            progressive structure means lower earners pay less than they would in some flat-tax
            states.
          </li>
          <li>
            <a
              href="/paycheck/calculator/new-york"
              className="text-primary hover:underline font-medium"
            >
              New York Paycheck Calculator
            </a>{" "}
            — New York&rsquo;s state tax alone exceeds PA&rsquo;s for most earners, and NYC
            residents pay even more on top.
          </li>
          <li>
            <a
              href="/paycheck/calculator/texas"
              className="text-primary hover:underline font-medium"
            >
              Texas Paycheck Calculator
            </a>{" "}
            — Texas charges zero state income tax but compensates with higher property taxes.
            A direct comparison of total tax burden is more nuanced than it appears.
          </li>
          <li>
            <a
              href="/paycheck/calculator/florida"
              className="text-primary hover:underline font-medium"
            >
              Florida Paycheck Calculator
            </a>{" "}
            — Another no-income-tax state popular with Pennsylvanians considering relocation,
            especially retirees heading south.
          </li>
        </ul>
      </section>
    </div>
  );
}