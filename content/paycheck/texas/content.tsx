"use client";

import type { StateTaxConfig } from "@/types/calculator";

interface Props {
  stateConfig: StateTaxConfig;
}

export default function TexasContent({ stateConfig }: Props) {
  return (
    <div className="prose prose-slate max-w-none space-y-10 mt-10">
      {/* Section 1: The no-income-tax advantage */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          How Texas Taxes Your Paycheck (Hint: It Doesn&rsquo;t)
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Texas is one of nine states in the U.S. that{" "}
            <span className="text-ember font-medium">does not levy a personal income tax</span>.
            When you look at your Texas paycheck, you&rsquo;ll see federal income tax withholding,
            Social Security, and Medicare — but the state tax line will be conspicuously absent.
            For a single filer earning $60,000, that missing state tax line means keeping roughly
            $1,800 to $3,800 more per year compared to living in a state like Pennsylvania,
            New York, or California. Over a career, the difference compounds into tens of
            thousands of dollars in additional take-home pay.
          </p>
          <p>
            But &ldquo;no income tax&rdquo; does not mean &ldquo;no taxes.&rdquo; Texas
            generates its revenue through a fundamentally different structure — one that shifts
            the burden from your paycheck to your property and your purchases. Understanding this
            trade-off is essential for anyone considering a move to the Lone Star State or trying
            to compare their total tax burden against income-tax states.
          </p>
        </div>
      </section>

      {/* Section 2: What replaces income tax — the trade-offs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          If Not Income Tax, Then What? The Texas Revenue Picture
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Texas relies heavily on two primary revenue sources to fund state and local
            government:{" "}
            <span className="text-ember font-medium">property taxes</span> and{" "}
            <span className="text-ember font-medium">sales taxes</span>. Property taxes in
            Texas are among the highest in the nation. While the state itself does not levy a
            property tax, local taxing entities — counties, cities, school districts, and special
            districts — collectively impose rates that frequently exceed 2% of a home&rsquo;s
            appraised value. In high-demand areas like the Dallas-Fort Worth metroplex, Austin
            suburbs, or the Houston area, a homeowner with a $400,000 house might pay $8,000 to
            $12,000 annually in property taxes alone.
          </p>
          <p>
            On the sales tax side, Texas imposes a{" "}
            <span className="font-medium">6.25% state sales tax</span>, and local jurisdictions
            can add up to 2% more, bringing the maximum combined rate to 8.25%. Texas applies
            sales tax broadly — it is one of the few states that taxes motor vehicle sales at
            the full rate and does not exempt many service categories. This means day-to-day
            spending in Texas is generally more expensive than in states like Oregon or Delaware
            (which have no sales tax), though comparable to or slightly below states like
            California (7.25%–10.25% combined).
          </p>
          <p>
            The net effect of this trade-off depends heavily on your personal financial profile.
            A high earner with a modest home benefits enormously from the lack of income tax —
            the savings on state income tax far exceed what they pay in additional property and
            sales taxes. Conversely, a lower-income earner who rents (and thus doesn&rsquo;t
            directly pay property tax, though it&rsquo;s factored into rent prices) may find
            that the sales tax burden consumes a larger share of their income than a modest
            income tax would have. For the typical salaried worker, however, the no-income-tax
            advantage is the defining feature of a Texas paycheck.
          </p>
        </div>
      </section>

      {/* Section 3: Worked example */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Take-Home Pay on a $60,000 Salary in Texas
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          With zero state income tax, a Texas paycheck keeps more of every dollar earned. This
          breakdown assumes a single filer with no pre-tax contributions and the standard
          federal deduction.
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
                <td className="p-3 text-right text-muted-foreground">–$5,608.00</td>
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
                <td className="p-3 pl-6 text-muted-foreground">
                  Texas State Income Tax
                </td>
                <td className="p-3 text-right text-ember font-medium">$0.00</td>
              </tr>
              <tr className="bg-slate-50">
                <td className="p-3 font-semibold">Total Deductions</td>
                <td className="p-3 text-right font-semibold">–$10,198.00</td>
              </tr>
              <tr className="border-t-2 border-slate-300">
                <td className="p-3 text-lg font-bold text-ember">Net Annual Take-Home Pay</td>
                <td className="p-3 text-right text-lg font-bold text-ember">$49,802.00</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 text-muted-foreground">Effective Tax Rate</td>
                <td className="p-3 text-right text-muted-foreground">~17.0%</td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground">Bi-Weekly Take-Home</td>
                <td className="p-3 text-right text-muted-foreground">~$1,915.46</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-ember/5 border border-ember/20 rounded-lg">
          <h3 className="text-xl font-semibold text-slate-deep mb-2">
            Compared to California: ~$4,464 More Per Year
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            The same $60,000 salary in California yields approximately $45,338 in take-home pay
            (including state tax and SDI). In Texas, you&rsquo;d take home{" "}
            <span className="text-ember font-medium">$49,802</span> — an extra{" "}
            <span className="text-ember font-medium">$4,464 per year</span>, or about $372 more
            per month. That said, higher property taxes and sales tax in Texas partially offset
            this advantage depending on your spending and housing situation.
          </p>
        </div>
      </section>

      {/* Section 4: Metro area breakdown */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Texas Take-Home Pay: Houston, Dallas, Austin, and San Antonio
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            One of the most common questions about Texas paychecks is whether take-home pay
            varies by city. The short answer for state income tax is no — Texas has no state
            income tax, and that applies equally whether you work in Houston, Dallas, Austin, San
            Antonio, or any smaller city. Your federal deductions will be identical regardless of
            where in Texas you live, because there are no local income taxes either.
          </p>
          <p>
            However, the overall financial picture does shift depending on your metro area.
            <span className="text-ember font-medium"> Property taxes</span> differ
            significantly across Texas counties and school districts. Harris County (Houston)
            and Dallas County (Dallas) tend to have higher effective property tax rates than
            Bexar County (San Antonio), while Travis County (Austin) has seen rapid assessment
            growth that can push tax bills up even when rates hold steady. Combined sales tax
            rates also vary — most major Texas cities sit at 8.25%, but some jurisdictions add
            extra charges for specific purposes like transit or economic development.
          </p>
          <p>
            Cost of living is the real differentiator. Housing costs in Austin have risen
            sharply and now rival some coastal cities, while Houston and San Antonio remain
            among the most affordable large metro areas in the country. Dallas–Fort Worth falls
            somewhere in between. When evaluating a job offer in Texas, use this Texas take-home
            pay calculator for the paycheck number, but also factor in local property tax rates,
            sales tax, and housing costs to get a true comparison between metros.
          </p>
        </div>
      </section>

      {/* Section 5: Comparison links */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Compare Texas to Other States
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Texas is frequently compared to other no-income-tax states as well as high-tax states
          that workers often leave behind. See the real numbers below.
        </p>
        <ul className="space-y-2">
          <li>
            <a
              href="/paycheck/calculator/florida"
              className="text-primary hover:underline font-medium"
            >
              Florida Paycheck Calculator
            </a>{" "}
            — Florida also has no income tax, making it Texas&rsquo;s most direct comparison
            point. Florida, however, has no state property tax and a lower sales tax in many areas.
          </li>
          <li>
            <a
              href="/paycheck/calculator/california"
              className="text-primary hover:underline font-medium"
            >
              California Paycheck Calculator
            </a>{" "}
            — California&rsquo;s 13.3% top rate makes it a frequent source of
            &ldquo;tax refugee&rdquo; relocations to Texas.
          </li>
          <li>
            <a
              href="/paycheck/calculator/new-york"
              className="text-primary hover:underline font-medium"
            >
              New York Paycheck Calculator
            </a>{" "}
            — Between state tax and NYC tax, New York can be even more expensive than
            California for city residents.
          </li>
          <li>
            <a
              href="/paycheck/calculator/pennsylvania"
              className="text-primary hover:underline font-medium"
            >
              Pennsylvania Paycheck Calculator
            </a>{" "}
            — Pennsylvania&rsquo;s flat 3.07% is modest, but it&rsquo;s still 3.07% more than
            Texas charges.
          </li>
        </ul>
      </section>
    </div>
  );
}