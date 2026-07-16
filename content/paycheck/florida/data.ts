import { TAX_YEAR } from "@/config/site.config";
import type { StateTaxConfig } from "@/types/calculator";

export const stateTaxConfig: StateTaxConfig = {
  slug: "florida",
  name: "Florida",
  abbreviation: "FL",
  year: TAX_YEAR,
  meta: {
    title:
      `Florida Paycheck Calculator ${TAX_YEAR} | Take-Home Pay After Taxes`,
    description:
      "Calculate your Florida take-home pay for 2026. Florida has no state income tax — see your full paycheck breakdown instantly. Free and easy to use.",
  },
  hasIncomeTax: false,

  faq: [
    {
      question: "Does Florida have a state income tax?",
      answer:
        "No, Florida is one of nine states in the U.S. that does not levy a personal income tax on wages, salaries, or other earned income. This means your Florida paycheck is only subject to federal income tax, Social Security, and Medicare (FICA) withholdings. Florida's constitution explicitly prohibits a state income tax, which has been the case since the state was admitted to the Union. This policy makes Florida particularly attractive for workers, retirees, and businesses looking to minimize their tax burden.",
    },
    {
      question: "Is Florida a tax-friendly state for retirees?",
      answer:
        "Florida is widely considered one of the most tax-friendly states for retirees. In addition to having no state income tax, Florida does not tax Social Security benefits, pension income, 401(k) withdrawals, or IRA distributions. There is also no state estate tax or inheritance tax. The state's homestead exemption can significantly reduce property tax bills for primary residences, providing additional savings for retired homeowners. These factors, combined with Florida's warm climate, make it one of the top retirement destinations in the country.",
    },
    {
      question: "How does Florida fund government services without an income tax?",
      answer:
        "Florida relies primarily on sales tax to fund state and local government services. The state sales tax rate is 6%, and individual counties can impose additional surtaxes of up to 1.5%, bringing the maximum combined rate to 7.5%. Florida also collects substantial revenue from tourism-related taxes, including a 6% hotel occupancy tax and various tourist development levies. Documentary stamp taxes on real estate transactions, corporate income taxes, and fees also contribute to state revenue. Florida's growing population and robust tourism industry help sustain its tax base despite the lack of an income tax.",
    },
    {
      question: "What is the sales tax rate in Florida and are there exemptions?",
      answer:
        "Florida's base state sales tax rate is 6%, with county-level surtaxes potentially adding up to 1.5% depending on the county. Most tangible personal property and many services are taxable. However, Florida exempts several essential categories, including groceries (unprepared food), prescription medications, and some medical devices. Residential rent, most professional services (like legal and accounting), and certain agricultural products are also exempt. Online purchases from out-of-state retailers are subject to Florida sales tax if the retailer meets economic nexus thresholds.",
    },
    {
      question: "Why are so many people relocating to Florida for work?",
      answer:
        "The combination of no state income tax, no tax on retirement income, and a relatively low cost of living compared to states like California and New York has driven significant migration to Florida. Remote workers in particular benefit, as they can earn salaries comparable to high-tax states while keeping substantially more of their income. Florida also has no state-level estate or inheritance tax, which appeals to high-net-worth individuals. The state's business-friendly environment, warm climate, and growing tech and finance sectors in cities like Miami, Tampa, and Jacksonville further contribute to its appeal as a relocation destination.",
    },
    {
      question: "Are there any local taxes I should know about in Florida?",
      answer:
        "While Florida has no state income tax, there are some local tax considerations. Property taxes are administered at the county level and vary significantly depending on your location and the value of your home. Florida offers a homestead exemption of up to $50,000 for primary residences, which can substantially lower your property tax bill. Some tourist-heavy counties impose higher local option sales taxes to fund infrastructure and tourism promotion. Additionally, some municipalities levy business taxes and occupational licenses, though these generally do not affect individual wage earners' take-home pay.",
    },
    {
      question: "How do I calculate my Florida net pay?",
      answer:
        "To calculate your Florida net pay, subtract three federal deductions from your gross pay: federal income tax (based on progressive tax brackets), Social Security tax at 6.2%, and Medicare tax at 1.45%. Because Florida adds zero state income tax, your net pay is higher than in most states. For example, on a $60,000 salary as a single filer, you would subtract roughly $5,608 in federal income tax, $3,720 in Social Security, and $870 in Medicare — leaving approximately $49,802 in take-home pay with no state withholding at all.",
    },
    {
      question: "Does Florida have a no-income-tax payroll calculator?",
      answer:
        "Yes — since Florida has no state income tax, your paycheck only shows federal deductions (federal income tax, Social Security, and Medicare). This calculator handles that automatically when you select Florida. There is no state tax line item to subtract, which means the calculator gives you a cleaner, simpler paycheck breakdown than it would for states like California or New York. Simply enter your salary or hourly rate, and the tool computes your net pay with the correct zero-state-tax treatment.",
    },
    {
      question: "How much more take-home pay do I get in Florida vs. California?",
      answer:
        "A $60,000 earner in Florida takes home about $49,802 per year, compared to approximately $48,007 in California — that is roughly $1,795 more per year in your pocket. The gap widens significantly at higher incomes because California's top marginal tax rate is 13.3%, the highest in the nation. At $150,000, the difference grows to roughly $8,000–$10,000 more in Florida. For six-figure earners considering relocation, Florida's zero state income tax can translate to tens of thousands in additional take-home pay over just a few years.",
    },
    {
      question: "How much more take-home pay do I get in Florida vs. New York?",
      answer:
        "A $60,000 earner in Florida takes home about $49,802 per year. In New York State (outside New York City), take-home is approximately $47,457. If you work in New York City, it drops further to around $45,600 after the city's own income tax. That means you keep $2,345 to $4,202 more per year in Florida — and that is not even counting NYC's additional local tax, higher cost of living, and higher property taxes. For higher earners, the savings are even more dramatic, often exceeding $10,000 per year at six-figure salaries.",
    },
    {
      question: "Is there a Florida hourly paycheck calculator?",
      answer:
        "Yes — enter your hourly rate and the number of hours you work per pay period, and the calculator will compute your gross pay and all applicable deductions. Florida's zero state tax means hourly workers keep more per hour than in most other states. For instance, if you earn $30/hour and work 40 hours per week, your gross pay is $62,400/year and your net pay in Florida is approximately $52,100 — versus noticeably less in states that withhold state income tax from every paycheck.",
    },
  ],

  neighboringStates: ["georgia", "alabama"],
};