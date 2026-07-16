import type { StateTaxConfig } from "@/types/calculator";
import { TAX_YEAR } from "@/config/site.config";

export const stateTaxConfig: StateTaxConfig = {
  slug: "california",
  name: "California",
  abbreviation: "CA",
  year: TAX_YEAR,
  meta: {
    title:
      `California Paycheck Calculator ${TAX_YEAR} | Take-Home Pay After Taxes`,
    description:
      "Calculate your California take-home pay for 2026. Includes state income tax, SDI, and mental health services tax. Free, instant results for any salary.",
  },
  hasIncomeTax: true,

  brackets: {
    single: [
      { rate: 0.01, min: 0, max: 11_330 },
      { rate: 0.02, min: 11_330, max: 26_859 },
      { rate: 0.04, min: 26_859, max: 42_391 },
      { rate: 0.06, min: 42_391, max: 58_846 },
      { rate: 0.08, min: 58_846, max: 74_372 },
      { rate: 0.093, min: 74_372, max: 379_898 },
      { rate: 0.103, min: 379_898, max: 455_873 },
      { rate: 0.113, min: 455_873, max: 759_790 },
      { rate: 0.123, min: 759_790, max: null },
    ],
    married_filing_jointly: [
      { rate: 0.01, min: 0, max: 22_660 },
      { rate: 0.02, min: 22_660, max: 53_718 },
      { rate: 0.04, min: 53_718, max: 84_783 },
      { rate: 0.06, min: 84_783, max: 117_692 },
      { rate: 0.08, min: 117_692, max: 148_744 },
      { rate: 0.093, min: 148_744, max: 759_796 },
      { rate: 0.103, min: 759_796, max: 911_747 },
      { rate: 0.113, min: 911_747, max: 1_519_581 },
      { rate: 0.123, min: 1_519_581, max: null },
    ],
    head_of_household: [
      { rate: 0.01, min: 0, max: 22_676 },
      { rate: 0.02, min: 22_676, max: 53_720 },
      { rate: 0.04, min: 53_720, max: 69_251 },
      { rate: 0.06, min: 69_251, max: 85_704 },
      { rate: 0.08, min: 85_704, max: 101_233 },
      { rate: 0.093, min: 101_233, max: 516_657 },
      { rate: 0.103, min: 516_657, max: 619_990 },
      { rate: 0.113, min: 619_990, max: 1_033_316 },
      { rate: 0.123, min: 1_033_316, max: null },
    ],
  },

  standardDeduction: {
    single: 5_706,
    married_filing_jointly: 11_412,
    head_of_household: 11_412,
  },

  settings: {
    sdiRate: 0.013,
    sdiWageBase: 99_999_999,
    mentalHealthRate: 0.01,
    mentalHealthThreshold: 1_000_000,
  },

  faq: [
    {
      question: "What is California SDI and is it required?",
      answer:
        "California State Disability Insurance (SDI) is a mandatory payroll deduction for most employees, funded through the Employment Development Department (EDD). The SDI program provides short-term disability, paid family leave, and non-industrial disability insurance benefits. For 2026, the SDI tax rate is 1.3% on wages. Most California workers cannot opt out unless they are covered by a voluntary plan approved by the state.",
    },
    {
      question: "What is the California Mental Health Services Tax?",
      answer:
        "The Mental Health Services Tax (MHST) is a 1% surtax on California taxable income exceeding $1 million. It was enacted through Proposition 63 (2004) and is sometimes called the \"millionaire's tax.\" The revenue funds mental health programs across the state. For example, if you have $1.5 million in California taxable income as a single filer, you would pay an additional 1% (or $5,000) on the $500,000 above the threshold.",
    },
    {
      question: "Does California have the highest state income tax in the country?",
      answer:
        "California has one of the highest top marginal state income tax rates in the nation at 12.3%, which applies to income over approximately $759,790 for single filers. Hawaii's top rate of 11% and New York's top rate of 10.9% are also among the highest. However, California's tax brackets are progressive, so lower and middle-income earners pay significantly less. The effective tax rate for most Californians is much lower than the top marginal rate suggests, especially after accounting for the standard deduction.",
    },
    {
      question: "How does California's standard deduction compare to the federal standard deduction?",
      answer:
        "California's standard deduction is considerably smaller than the federal one. For 2026, California allows $5,706 for single filers and $11,412 for married filing jointly, while the federal standard deduction is $16,100 and $32,200 respectively. This difference means a larger portion of your income is subject to California state tax compared to federal tax. Some taxpayers benefit from itemizing deductions on their California return if their itemized deductions exceed the state standard deduction, even if they take the standard deduction federally.",
    },
    {
      question: "What is the CA SDI rate for 2026?",
      answer:
        `The CA SDI (California State Disability Insurance) rate for ${TAX_YEAR} is 1.3% on wages up to $153,164. This rate is set by the California Employment Development Department (EDD) and applies to most W-2 employees in the state. The SDI program funds short-term disability, Paid Family Leave (PFL), and non-industrial disability insurance benefits. If your annual wages exceed $153,164, SDI is no longer withheld for the rest of the year.`,
    },
    {
      question: "What is CASDI withholding on my paycheck?",
      answer:
        "CASDI (California State Disability Insurance) withholding is a mandatory payroll deduction that appears as a line item on every California paycheck. It is set at 1.3% of your gross wages and is automatically withheld by your employer — you do not need to opt in. The CASDI deduction funds California's short-term disability insurance and Paid Family Leave programs, which provide partial wage replacement if you are unable to work due to a non-work-related illness, injury, or to bond with a new child.",
    },
    {
      question: "How do I calculate my California net pay?",
      answer:
        "To calculate your California net pay, start with your gross wages and subtract: (1) federal income tax based on your W-4 elections and IRS brackets, (2) FICA taxes — Social Security at 6.2% up to the wage base and Medicare at 1.45%, (3) California state income tax using the state's progressive brackets (1% to 12.3%), (4) CA SDI at 1.3% on wages up to $153,164, and (5) the 1% Mental Health Services Tax if your California taxable income exceeds $1 million. This California payroll tax calculator handles all of these deductions automatically to give you an accurate estimate of your take-home pay.",
    },
    {
      question: "Is there a California daily overtime calculator?",
      answer:
        "California has unique daily overtime rules: hours worked beyond 8 in a single day are paid at 1.5x your regular rate, and hours beyond 12 in a day are paid at 2x. This is in addition to the standard weekly overtime rules (over 40 hours = 1.5x). However, this paycheck calculator for California is designed for weekly and biweekly pay periods and does not perform daily overtime calculations. If you frequently work more than 8 hours in a day, you should consult a specialized California overtime calculator or your employer's payroll department for an accurate figure.",
    },
    {
      question: "How much more do I take home in Los Angeles vs. San Francisco?",
      answer:
        "Your California income tax rate is the same whether you work in Los Angeles, San Francisco, San Diego, or any other city in the state — California does not impose local or city income taxes. The difference in take-home pay between LA and San Francisco comes entirely from differences in cost of living and housing costs, not from income tax. This California salary calculator works for all California cities, since the state tax brackets, SDI rate, and standard deductions are uniform statewide.",
    },
    {
      question: "Are California payroll taxes different for non-residents working in California?",
      answer:
        "Yes, non-residents who earn income in California are generally subject to California state income tax on that income. California taxes all income sourced within the state, regardless of where you live. However, non-residents may be able to claim a credit on their home state return for taxes paid to California. If you live in a state with no income tax (like Nevada) but work in California, you will still pay California income tax on wages earned there, though you won't owe additional tax to your home state.",
    },
    {
      question: "What additional deductions are available on California state tax returns?",
      answer:
        "California offers several deductions and credits that can reduce your state tax liability. Common ones include the renter's credit (up to $60 for single filers with income under certain limits), college access tax credit, and credits for child and dependent care expenses. California does not conform to all federal deductions — for example, it does not allow the federal deduction for state and local taxes (SALT). California also has its own rules for retirement contributions and HSA deductions that may differ from federal treatment.",
    },
  ],

  neighboringStates: ["nevada", "arizona", "oregon"],
};