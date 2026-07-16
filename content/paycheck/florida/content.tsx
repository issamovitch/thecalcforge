"use client";

import type { StateTaxConfig } from "@/types/calculator";

interface Props {
  stateConfig: StateTaxConfig;
}

export default function FloridaContent({ stateConfig }: Props) {
  return (
    <div className="prose prose-slate max-w-none space-y-10 mt-10">
      {/* Section 1: Worked example — leading with the money, different structure */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Take-Home Pay on a $60,000 Salary in Florida
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Florida has no state income tax, which means your paycheck is only subject to federal
          withholding and FICA. For a single filer earning $60,000 per year with the standard
          deduction and no pre-tax contributions, here&rsquo;s what lands in your bank account.
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
                  Florida State Income Tax
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
                <td className="p-3 text-muted-foreground">Monthly Take-Home</td>
                <td className="p-3 text-right text-muted-foreground">~$4,150.17</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          The $49,802 take-home is identical to Texas at the same salary, since both states
          have zero income tax. The differences between the two states emerge in property taxes,
          sales taxes, and cost of living.
        </p>
      </section>

      {/* Section 2: Why Florida is the retiree relocation destination */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Why Florida Is a Magnet for Relocating Workers and Retirees
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Florida&rsquo;s lack of a state income tax is not a new policy — it&rsquo;s
            enshrined in the state constitution, which has prohibited a personal income tax
            since 1924. This long-standing commitment to tax-free wage income has made Florida one
            of the fastest-growing states in the nation, attracting not only retirees from the
            Northeast and Midwest but also working-age professionals in industries like technology,
            finance, and healthcare.
          </p>
          <p>
            For retirees specifically, Florida offers a{" "}
            <span className="text-ember font-medium">triple tax advantage</span>: no state
            income tax on pensions, Social Security benefits, or 401(k)/IRA withdrawals. A
            retiree pulling $70,000 per year from a combination of Social Security and retirement
            accounts pays zero state income tax on every dollar — a benefit that can add up to
            thousands in annual savings compared to states that tax retirement income (like
            California, which does not tax Social Security but does tax other retirement income,
            or New York, which partially taxes pensions).
          </p>
          <p>
            The state&rsquo;s population boom — Florida surpassed New York in population in 2014
            and recently became the third-most-populous state — is directly tied to this tax
            structure. Major employers have taken notice, with companies like Citadel, hedge funds,
            and financial services firms relocating operations from New York and Chicago to Miami
            specifically to take advantage of the income tax environment for their highly
            compensated employees.
          </p>
        </div>
      </section>

      {/* Section 3: How Florida funds itself — the tourism-driven economy */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          How Florida Funds Government Without an Income Tax
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Florida&rsquo;s ability to sustain government services without a personal income tax
            rests largely on its unique economy — specifically,{" "}
            <span className="text-ember font-medium">tourism</span>. With over 140 million
            visitors per year, Florida collects substantial revenue from a{" "}
            <span className="font-medium">6.0% state sales tax</span> (plus local surtaxes up to
            1.5%, for a maximum combined rate of 7.5%). Tourists pay sales tax on hotel rooms,
            restaurant meals, rental cars, theme park tickets, and retail purchases — effectively
            subsidizing the services used by residents. This &ldquo;tourist tax&rdquo; model
            means that a significant portion of Florida&rsquo;s revenue comes from people who
            don&rsquo;t live there year-round.
          </p>
          <p>
            Beyond sales tax, Florida also relies on{" "}
            <span className="font-medium">documentary stamp taxes</span> on real estate
            transactions (a $0.70 per $100 tax on deeds, plus an additional $0.45 surtax in many
            counties), corporate income taxes, and various fees and licenses. Property taxes in
            Florida are administered at the county level and, while higher than some states, are
            generally lower than Texas due to Florida&rsquo;s Save Our Homes cap, which limits
            annual assessment increases on homesteaded properties to 3% or the Consumer Price
            Index, whichever is lower.
          </p>
          <p>
            The result is a tax structure that is relatively favorable for wage earners and
            retirees, though it does mean that consumption is taxed more heavily than in some
            other states. For a typical salaried employee, the absence of any state withholding
            from their paycheck is the most visible — and most appreciated — feature of
            Florida&rsquo;s tax system.
          </p>
        </div>
      </section>

      {/* Section 4: Metro take-home pay breakdown */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Florida Take-Home Pay: Miami, Orlando, Tampa, and Jacksonville
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            One of the biggest advantages of using a Florida salary calculator is that the
            state income tax is <span className="font-medium">zero everywhere</span> — whether
            you work in Miami, Orlando, Tampa, or Jacksonville, your paycheck looks exactly the
            same from a state-tax perspective. Florida is prohibited by its constitution from
            levying a personal income tax, so there are no city or municipal income taxes to
            worry about anywhere in the state.
          </p>
          <p>
            That said, your real purchasing power does vary by metro area. Miami-Dade County has
            a higher combined sales tax rate (7%) due to tourist-area surtaxes that fund
            infrastructure and transit projects, and its housing costs are among the highest in
            the state. Orlando and Tampa offer a lower cost of living, meaning your Florida
            take-home pay stretches further even though your net paycheck amount is the same.
            Jacksonville generally has the lowest cost of living among Florida&rsquo;s four
            largest metros, with a combined sales tax rate of 6.5% and more affordable housing.
          </p>
          <p>
            The bottom line: your <span className="text-ember font-medium">net pay is identical</span>{" "}
            across all Florida cities, but how far that money goes depends on local costs. Use
            the calculator above to find your exact take-home, then factor in your city&rsquo;s
            cost of living to understand your true financial picture.
          </p>
        </div>
      </section>

      {/* Section 5: Comparison links */}
      <section>
        <h2 className="text-2xl font-bold text-slate-deep mb-4">
          Compare Florida to Other States
        </h2>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          Considering a move to Florida? Here&rsquo;s how it compares to other states in our
          calculator, so you can see the real dollar impact on your take-home pay.
        </p>
        <ul className="space-y-2">
          <li>
            <a
              href="/paycheck/calculator/texas"
              className="text-primary hover:underline font-medium"
            >
              Texas Paycheck Calculator
            </a>{" "}
            — Texas and Florida both have no income tax, but Texas has higher property taxes.
            Your net financial picture depends on whether you own a home and how much you spend.
          </li>
          <li>
            <a
              href="/paycheck/calculator/new-york"
              className="text-primary hover:underline font-medium"
            >
              New York Paycheck Calculator
            </a>{" "}
            — Many Florida transplants come from New York. The difference in take-home pay can
            be staggering — often $5,000+ per year for a $60,000 salary.
          </li>
          <li>
            <a
              href="/paycheck/calculator/california"
              className="text-primary hover:underline font-medium"
            >
              California Paycheck Calculator
            </a>{" "}
            — California-to-Florida relocations have accelerated. See exactly how much more you
            keep when California&rsquo;s 13.3% top bracket disappears from your W-2.
          </li>
          <li>
            <a
              href="/paycheck/calculator/pennsylvania"
              className="text-primary hover:underline font-medium"
            >
              Pennsylvania Paycheck Calculator
            </a>{" "}
            — Even Pennsylvania&rsquo;s modest 3.07% flat rate is more than Florida charges.
            Compare the numbers for your specific salary.
          </li>
        </ul>
      </section>
    </div>
  );
}