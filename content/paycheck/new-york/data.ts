import type { StateTaxConfig } from "@/types/calculator";
import { TAX_YEAR } from "@/config/site.config";

export const stateTaxConfig: StateTaxConfig = {
  slug: "new-york",
  name: "New York",
  abbreviation: "NY",
  year: TAX_YEAR,
  meta: {
    title:
      `New York Paycheck Calculator ${TAX_YEAR} | Take-Home Pay After Taxes`,
    description:
      "Calculate your New York take-home pay for 2026. Includes state income tax, NYC and Yonkers tax options, PFL, and DBL. Free, instant paycheck breakdown for any salary.",
  },
  hasIncomeTax: true,

  brackets: {
    single: [
      { rate: 0.039, min: 0, max: 8_500 },
      { rate: 0.044, min: 8_500, max: 11_700 },
      { rate: 0.0515, min: 11_700, max: 13_900 },
      { rate: 0.054, min: 13_900, max: 80_650 },
      { rate: 0.059, min: 80_650, max: 215_400 },
      { rate: 0.0685, min: 215_400, max: 1_077_550 },
      { rate: 0.0965, min: 1_077_550, max: 5_000_000 },
      { rate: 0.103, min: 5_000_000, max: 25_000_000 },
      { rate: 0.109, min: 25_000_000, max: null },
    ],
    married_filing_jointly: [
      { rate: 0.039, min: 0, max: 17_150 },
      { rate: 0.044, min: 17_150, max: 23_600 },
      { rate: 0.0515, min: 23_600, max: 27_900 },
      { rate: 0.054, min: 27_900, max: 161_550 },
      { rate: 0.059, min: 161_550, max: 323_200 },
      { rate: 0.0685, min: 323_200, max: 2_155_350 },
      { rate: 0.0965, min: 2_155_350, max: 5_000_000 },
      { rate: 0.103, min: 5_000_000, max: 25_000_000 },
      { rate: 0.109, min: 25_000_000, max: null },
    ],
    head_of_household: [
      { rate: 0.039, min: 0, max: 12_800 },
      { rate: 0.044, min: 12_800, max: 17_650 },
      { rate: 0.0515, min: 17_650, max: 20_900 },
      { rate: 0.054, min: 20_900, max: 107_650 },
      { rate: 0.059, min: 107_650, max: 269_300 },
      { rate: 0.0685, min: 269_300, max: 1_616_450 },
      { rate: 0.0965, min: 1_616_450, max: 5_000_000 },
      { rate: 0.103, min: 5_000_000, max: 25_000_000 },
      { rate: 0.109, min: 25_000_000, max: null },
    ],
  },

  standardDeduction: {
    single: 8_000,
    married_filing_jointly: 16_050,
    head_of_household: 11_200,
  },

  settings: {
    nycBrackets: [
      { rate: 0.03078, min: 0, max: 12_000 },
      { rate: 0.03762, min: 12_000, max: 25_000 },
      { rate: 0.03819, min: 25_000, max: 50_000 },
      { rate: 0.03876, min: 50_000, max: null },
    ],
  },

  faq: [
    {
      question: "What is the difference between New York State tax and New York City tax?",
      answer:
        "New York State imposes a progressive income tax on all residents, with rates ranging from 3.9% to 10.9% depending on your income and filing status. New York City imposes an additional local income tax on city residents only, with rates between approximately 3.078% and 3.876%. If you live and work in NYC, you pay both the state and city taxes. If you live in NYC but work in New Jersey or Connecticut, you still owe NYC resident tax on all your income, though you may receive a credit for taxes paid to your work state.",
    },
    {
      question: "Do I owe NYC tax if I commute into the city for work?",
      answer:
        "No, New York City income tax is based on residency, not where you work. If you commute into Manhattan from New Jersey, Westchester, or Long Island, you do not pay NYC income tax. You would only pay New York State tax on income earned while working in the state (as a non-resident). However, some commuters choose to live in NYC precisely to avoid being taxed as non-residents in multiple states. The key distinction is that NYC tax follows where you live, while NY State tax follows where you earn income.",
    },
    {
      question: "Does Yonkers have its own income tax?",
      answer:
        "Yes, Yonkers imposes a resident income tax on top of New York State tax. The Yonkers resident tax rate is equal to 16.75% of your net New York State tax liability. This effectively adds roughly 0.7% to 1.8% to your total tax burden depending on your state tax bracket. If you are a Yonkers resident, your employer should be withholding this tax from your paycheck. Non-residents who work in Yonkers pay a lower non-resident earnings tax at a much reduced rate.",
    },
    {
      question: "How does New York's standard deduction work?",
      answer:
        "New York State allows a standard deduction that reduces your taxable income before state tax is calculated. For 2026, the standard deduction is $8,000 for single filers, $16,050 for married filing jointly, and $11,200 for head of household. New York's standard deduction is significantly lower than the federal one, meaning more of your income is subject to state tax. You cannot take the federal standard deduction on your New York return — you must use the New York amounts whether you itemize federally or not.",
    },
    {
      question: "Are there any tax credits available to reduce my New York tax bill?",
      answer:
        "New York offers several tax credits that can reduce your state tax liability. The Empire State Child Credit provides up to $330 per qualifying child for households with income under certain limits. The New York City School Tax Credit gives residents a refundable credit of up to $125 depending on income. Other credits include the college tuition credit, earned income credit, and real property tax credit for homeowners and renters. These credits can be claimed when you file your New York State tax return and can significantly lower your effective tax rate.",
    },
    {
      question: "How do New York taxes compare to neighboring states like New Jersey and Connecticut?",
      answer:
        "New York has some of the highest tax rates in the region, especially for high earners. New Jersey's top rate is 10.75%, slightly lower than New York's 10.9%, but New Jersey applies its top rate at a lower income threshold. Connecticut's top rate is 6.99%, making it noticeably lower for high-income earners. However, all three states have relatively high property taxes and cost of living. For moderate-income earners, the differences may be smaller, and factors like local taxes (especially NYC tax), property values, and available credits can make the effective tax burden vary significantly between these neighboring states.",
    },
    {
      question: "What is the Yonkers income tax surcharge?",
      answer:
        "The Yonkers income tax surcharge is an additional local tax levied on residents of the city of Yonkers, New York. It is calculated as 16.75% of your net New York State tax liability, which effectively adds roughly 0.7% to 1.8% to your total tax burden depending on your state tax bracket. For Yonkers residents, this surcharge is automatically withheld by your employer alongside state and federal taxes. Non-residents who work in Yonkers pay a separate, much lower non-resident earnings tax. If you are using a paycheck calculator, make sure to enable the Yonkers resident option to see the accurate impact on your take-home pay.",
    },
    {
      question: "How do I calculate my New York net pay?",
      answer:
        "To calculate your New York net pay, start with your gross wages and subtract all applicable deductions in order: federal income tax (based on your W-4 selections and the federal brackets), FICA taxes (6.2% for Social Security and 1.45% for Medicare), New York State progressive income tax (3.9% to 10.9% depending on taxable income and filing status), New York Paid Family Leave (0.432% of gross wages), and Disability Benefits Law insurance (0.5% up to the annual cap). If you are a New York City resident, also subtract the NYC personal income tax (3.078% to 3.876%). Yonkers residents subtract the Yonkers surcharge as well. The result is your net take-home pay.",
    },
    {
      question: "What is NY Paid Family Leave (PFL) and how much is deducted?",
      answer:
        "New York Paid Family Leave (PFL) is a state-mandated insurance program that provides wage replacement benefits when you need time away from work to bond with a new child, care for a seriously ill family member, or handle qualifying military family events. The PFL deduction is 0.432% of your gross wages and is automatically withheld from every paycheck by your employer. For a worker earning $60,000 per year, the annual PFL deduction comes to about $259. This is a relatively small but mandatory deduction that every New York employee sees on their pay stub, separate from federal and state income taxes.",
    },
    {
      question: "What is IT-2104 withholding?",
      answer:
        "Form IT-2104 is New York State's equivalent of the federal W-4 form. Employees use IT-2104 to tell their employer how much New York State income tax should be withheld from each paycheck. On this form, you report your filing status, number of allowances, and any additional withholding amount you want. The information on your IT-2104 directly affects how much New York State tax is deducted from your gross pay before you receive it. If you find you owe a large balance at tax time or receive a big refund, updating your IT-2104 with your employer can help align your withholding with your actual tax liability.",
    },
    {
      question: "How much more tax do NYC residents pay?",
      answer:
        "New York City residents pay an additional progressive local income tax on top of New York State tax, with brackets ranging from 3.078% to 3.876%. For a typical earner making $60,000 per year, the NYC tax adds approximately $1,800 more in annual city tax compared to someone living in upstate New York. This is on top of the state income tax, federal tax, and FICA that all New York residents pay. Importantly, commuters who work in NYC but live outside the city — for example in New Jersey, Connecticut, or Westchester — are generally exempt from the NYC resident income tax, which is one reason many workers choose to commute rather than live in the city.",
    },
    {
      question: "How does take-home pay differ in Manhattan, Brooklyn, and Buffalo?",
      answer:
        "Take-home pay in Manhattan and Brooklyn is generally lower than in Buffalo because residents of Manhattan and Brooklyn are subject to the New York City personal income tax, while Buffalo and other upstate residents are not. New York State tax is the same regardless of where you live within the state — the difference is entirely driven by local taxes. Manhattan and Brooklyn residents both fall under the NYC tax brackets (3.078%–3.876%), so their take-home pay is very similar for the same salary. Buffalo residents, living outside the five boroughs, avoid the city tax entirely, which can mean hundreds or even thousands of dollars more in annual net pay depending on income level. When using a New York salary calculator, always select the correct locality to get an accurate take-home pay estimate.",
    },
  ],

  neighboringStates: ["new-jersey", "connecticut", "pennsylvania", "massachusetts"],
};