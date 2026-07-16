import type { StateTaxConfig } from "@/types/calculator";
import { TAX_YEAR } from "@/config/site.config";

export const stateTaxConfig: StateTaxConfig = {
  slug: "texas",
  name: "Texas",
  abbreviation: "TX",
  year: TAX_YEAR,
  meta: {
    title:
      `Texas Paycheck Calculator ${TAX_YEAR} | Take-Home Pay After Taxes`,
    description:
      "Calculate your Texas take-home pay for 2026. Texas has no state income tax — see exactly how much more you keep compared to other states. Free, instant results.",
  },
  hasIncomeTax: false,

  faq: [
    {
      question: "Does Texas really have no state income tax?",
      answer:
        "Yes, Texas is one of nine states in the U.S. with no state income tax on wages. This means your paycheck is only subject to federal income tax, FICA (Social Security and Medicare), and any local taxes. For most Texas workers, this results in a significantly higher take-home pay compared to states like California or New York. Texas has not had a state income tax since its constitution was adopted, and eliminating it would require a constitutional amendment approved by voters.",
    },
    {
      question: "How does Texas make up for not having an income tax?",
      answer:
        "Texas relies heavily on sales tax and property tax to fund government services. The state sales tax rate is 6.25%, and local jurisdictions can add up to 2%, making the combined rate as high as 8.25% in some areas. Texas also has some of the highest property tax rates in the country, though property values in many parts of Texas are lower than coastal states. Additionally, the state benefits from oil and gas production taxes, franchise taxes on businesses, and various fees and licenses.",
    },
    {
      question: "Are there any payroll deductions specific to Texas?",
      answer:
        "Beyond the standard federal deductions (federal income tax, Social Security, and Medicare), Texas does not impose any state-level payroll taxes. However, some Texas cities and school districts impose local property taxes that indirectly affect homeowners. Employers may also deduct for state unemployment insurance (SUI), which all employers must pay, though this is not deducted from employee paychecks. If you work in certain industries like oil and gas, there may be industry-specific garnishments or deductions.",
    },
    {
      question: "Is Texas a good state to live in for high earners?",
      answer:
        "Texas is often considered very favorable for high earners because there is no state income tax, allowing them to keep more of each dollar earned. For someone earning $200,000 annually, the difference between living in Texas versus a state with a top rate of 12.3% (like California) can be tens of thousands of dollars per year. However, high earners should also consider Texas property taxes, which can be substantial depending on the county and home value. The lack of a state income tax combined with a relatively low cost of living in many Texas cities makes it an attractive option for professionals and remote workers.",
    },
    {
      question: "What is the Texas sales tax rate and what items are exempt?",
      answer:
        "The Texas state sales tax rate is 6.25%, with local jurisdictions able to add up to 2% for a maximum combined rate of 8.25%. Most tangible personal property and taxable services are subject to sales tax. However, Texas exempts several categories from sales tax, including groceries (unprepared food), prescription drugs, over-the-counter medicine, and certain agricultural items. Some services like professional services (legal, accounting) and residential utilities are also exempt or partially exempt from state sales tax.",
    },
    {
      question: "Do Texas residents pay taxes on retirement income?",
      answer:
        "Texas does not tax any form of retirement income, including Social Security benefits, pension income, 401(k) withdrawals, and IRA distributions. This makes Texas particularly attractive for retirees looking to maximize their retirement income. Combined with the lack of state income tax on wages, Texas is consistently ranked as one of the most tax-friendly states for retirees. Retirees should still consider property taxes and sales tax when budgeting, as these can represent a significant portion of living expenses in Texas.",
    },
    {
      question: "Is there a Texas hourly paycheck calculator?",
      answer:
        "Yes — this Texas salary calculator works for hourly workers too. Simply enter your hourly rate and the number of hours you work per pay period (for example, 80 hours for bi-weekly pay). Because Texas has no state income tax, only federal income tax and FICA taxes (Social Security and Medicare) are withheld from hourly workers' paychecks, making it straightforward to estimate your take-home pay whether you're paid hourly or on a salary.",
    },
    {
      question: "How do I calculate my Texas net pay?",
      answer:
        "To calculate your Texas net pay, start with your gross pay and subtract three things: federal income tax (using the progressive federal tax brackets), Social Security tax at 6.2% on wages up to $184,500, and Medicare tax at 1.45% on all wages (plus an additional 0.9% on earnings above $200,000). Texas adds zero state income tax to that equation, so your net pay in Texas is simply gross pay minus those federal deductions. This Texas net pay calculator handles all of that automatically.",
    },
    {
      question: "Does Texas have a no-income-tax payroll calculator?",
      answer:
        "Yes — that's exactly what this tool is. Texas is one of nine states with no state income tax, so a Texas paycheck calculator shows only federal deductions on your pay stub: federal income tax, Social Security, and Medicare. With no state tax line to worry about, your paycheck is simpler to read and understand than in most other states. Just enter your salary or hourly rate and this Texas no-income-tax payroll calculator does the rest.",
    },
    {
      question: "How much take-home pay do I keep in Texas vs. California?",
      answer:
        "A $60,000 earner in Texas takes home approximately $49,802 per year after federal taxes, compared to about $48,007 in California after federal and state taxes plus California's State Disability Insurance (SDI) deduction. That's a difference of roughly $1,795 per year, or about $150 more per month in your pocket. The gap widens significantly at higher income levels because California's top marginal rate reaches 13.3% while Texas charges nothing at the state level.",
    },
  ],

  neighboringStates: ["oklahoma", "louisiana", "arkansas", "new-mexico"],
};