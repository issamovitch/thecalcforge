import { TAX_YEAR } from "@/config/site.config";
import type { StateTaxConfig } from "@/types/calculator";

export const stateTaxConfig: StateTaxConfig = {
  slug: "pennsylvania",
  name: "Pennsylvania",
  abbreviation: "PA",
  year: TAX_YEAR,
  meta: {
    title:
      `Pennsylvania Paycheck Calculator ${TAX_YEAR} | Take-Home Pay After Taxes`,
    description:
      "Calculate your Pennsylvania take-home pay for 2026. Includes the 3.07% flat state income tax, local EIT, and employee SUI. Free, instant paycheck breakdown for any salary.",
  },
  hasIncomeTax: true,

  flatRate: 0.0307,

  settings: {
    defaultLocalEitRate: 0.01,
  },

  faq: [
    {
      question: "How does Pennsylvania's flat income tax work?",
      answer:
        "Pennsylvania imposes a flat 3.07% state income tax on all taxable income, regardless of how much you earn. Unlike most states with progressive brackets, every Pennsylvania resident pays the same rate on every dollar of taxable income. There is no standard deduction or personal exemption at the state level, so your state taxable income is generally the same as your gross wages minus certain exclusions like contributions to Section 401(k) plans, health savings accounts, and certain pretax benefits. This simplicity makes Pennsylvania taxes straightforward to calculate.",
    },
    {
      question: "What is the local Earned Income Tax (EIT) in Pennsylvania?",
      answer:
        "Pennsylvania is somewhat unique in that nearly all municipalities and school districts impose a local Earned Income Tax (EIT) on residents and non-residents who work within their jurisdiction. The local EIT rate varies by location but is typically between 1% and 3%, with 1% being the most common rate for many municipalities. Employers are required to withhold this tax and remit it through the Pennsylvania local tax collection system (now largely centralized through Keystone Collections Group and other collectors). If you live and work in different localities, your employer withholds based on your work location, and you may need to file a local return to reconcile.",
    },
    {
      question: "Does Philadelphia have higher taxes than the rest of Pennsylvania?",
      answer:
        "Yes, Philadelphia imposes significantly higher local taxes compared to most Pennsylvania municipalities. The Philadelphia resident Earned Income Tax rate is approximately 3.75%, which is on top of the 3.07% state tax, resulting in a combined rate of about 6.82%. Non-residents who work in Philadelphia pay a lower non-resident rate of approximately 3.44%. This makes Philadelphia one of the more heavily taxed cities in Pennsylvania. By comparison, many other PA municipalities charge only 1% to 2% local EIT, so living in the Philadelphia suburbs but working in the city can create a meaningful tax difference.",
    },
    {
      question: "Why doesn't Pennsylvania have a standard deduction?",
      answer:
        "Pennsylvania's tax system is designed around simplicity with a flat rate and broad tax base, which is why it does not offer a standard deduction or personal exemption. Instead, Pennsylvania allows specific exclusions and deductions from gross income, such as contributions to employer-sponsored retirement plans (401(k), 403(b)), health savings accounts, and certain medical expenses. The trade-off is a low, flat rate applied to a wider base of income. While this means lower-income earners pay a higher effective rate compared to progressive tax states, the simplicity and predictability of the system are seen as benefits.",
    },
    {
      question: "Are Social Security and retirement income taxed in Pennsylvania?",
      answer:
        "Pennsylvania is very favorable for retirees when it comes to income taxes. Social Security benefits, pension income (both public and private), and withdrawals from IRAs and 401(k) plans are all exempt from Pennsylvania state income tax. This makes Pennsylvania one of the most tax-friendly states for retirees, despite the flat income tax rate on earned income. If you are retired and living solely on retirement income and Social Security, you would owe no Pennsylvania state income tax at all.",
    },
    {
      question: "How do I handle local EIT if I live and work in different Pennsylvania municipalities?",
      answer:
        "If you live and work in different Pennsylvania municipalities, your employer withholds local EIT based on where you work (your work location). When you file your annual local tax return, the tax is actually owed to your resident municipality. If the work location rate is higher than your resident rate, you generally do not receive a refund for the difference. If your resident rate is higher, you may owe additional tax. Pennsylvania's local tax system has moved toward centralized collection to make this process easier, but it is still important to verify your withholding and file a resident local return each year to ensure proper reconciliation.",
    },
    {
      question: "What is Act 32 in Pennsylvania?",
      answer:
        "Act 32 of 2005 authorized local taxing jurisdictions across Pennsylvania to levy the Earned Income Tax (EIT) under a more uniform framework. Under Act 32, employers are required to withhold local EIT based on the employee's residence rather than the workplace, and the tax is remitted to a single designated local tax collector for each county. Over 2,500 taxing jurisdictions participate in the system, which streamlined what was previously a fragmented patchwork of collection districts and made it easier for both employers and employees to manage local income tax withholding.",
    },
    {
      question: "What is a PSD code in Pennsylvania?",
      answer:
        "A PSD code stands for Political Subdivision code. It is a unique numeric identifier assigned to each Pennsylvania municipality for the purpose of local tax collection. Your employer uses this code to route your local Earned Income Tax (EIT) withholding to the correct jurisdiction. If you are unsure of your PSD code, the Pennsylvania Department of Community and Economic Development (DCED) publishes a searchable online directory where you can look up the code for any address in the state.",
    },
    {
      question: "How do I calculate my Pennsylvania net pay?",
      answer:
        "To calculate your Pennsylvania net pay, start with your gross wages and subtract federal income tax withholding, FICA taxes (Social Security at 6.2% and Medicare at 1.45%), the Pennsylvania flat state income tax of 3.07%, Pennsylvania State Unemployment Insurance (SUI) at 0.07%, and your local Earned Income Tax (EIT) which varies by municipality but is typically 1%. This paycheck calculator automates all of these deductions for you so you can see your exact take-home pay.",
    },
    {
      question: "How does the Pittsburgh local EIT work?",
      answer:
        "Pittsburgh's combined city and school district Earned Income Tax rate is approximately 2.80% for residents. This local tax stacks on top of Pennsylvania's 3.07% flat state income tax rate, for a combined state-plus-local income tax rate of roughly 5.87%. Pittsburgh residents can use the local EIT rate input on this calculator to see the exact impact on their take-home pay.",
    },
    {
      question: "Is there a Pennsylvania hourly paycheck calculator?",
      answer:
        "Yes — this calculator works for any pay frequency, including hourly. If you are an hourly worker, simply enter your hourly rate multiplied by the number of hours you work per pay period as your gross pay. The tax engine behind this Pennsylvania paycheck calculator will automatically apply PA's 3.07% flat state income tax rate plus your local EIT, along with all federal withholdings and FICA taxes, to give you an accurate net pay estimate.",
    },
    {
      question: "What is the Pennsylvania local earned income tax (EIT) rate for my area?",
      answer:
        "The local EIT rate in Pennsylvania varies by municipality. The most common default rate is 1%, but several cities charge significantly more: Philadelphia levies 3.75% for residents (3.44% for non-residents), Scranton charges 3.00%, and Pittsburgh's combined rate is approximately 2.80%. To find your exact rate, use the local EIT input field in this calculator or look up your municipality's rate through your county's designated tax collector.",
    },
  ],

  neighboringStates: ["new-york", "new-jersey", "delaware", "maryland", "ohio"],
};