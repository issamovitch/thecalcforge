/**
 * CalcForge - Centralized Site Configuration
 * Domain: thecalcforge.com
 *
 * Edit this single file to change branding, colors, links across the entire site.
 */

// ─── Shared legal/source constants ───────────────────────────────────
/** Update this single value when re-verifying any sourced legal/rate data. */
export const VERIFIED_DATE = "July 2026";

/** Direct link to the OCCC 2025 Report PDF (Dec 1, 2025, covering 2024 data). */
export const OCCC_REPORT_URL =
  "https://occc.texas.gov/wp-content/uploads/2025/12/2025_study_consumer_loan_products.pdf";

/** OCCC homepage (no www. prefix). */
export const OCCC_BASE_URL = "https://occc.texas.gov";

// ─── Built calculator pages (single source of truth) ─────────────────
/**
 * Every calculator that has been built and is live.
 * Header nav dropdown, footer "Loan Tools", and hub pages
 * all derive from this array. Add a new entry here and every
 * navigation surface updates automatically.
 */
export const calculatorPages = [
  {
    label: "Title Loan Calculator",
    href: "/loans/title-loan-calculator",
    description:
      "Estimate your monthly title loan payment, total interest, and full amortization schedule. See how vehicle value and loan term affect what you actually pay.",
    longDescription:
      "Estimate your monthly title loan payment, total interest, and full amortization schedule. See how vehicle value and loan term affect what you actually pay.",
    typesCopy:
      "helps you estimate monthly payments and total cost for title loans, compare lender offers, and plan early payoff strategies",
    primaryKeyword: "title loan calculator",
    category: "loans",
  },
  {
    label: "Payday Loan APR Calculator",
    href: "/loans/payday-loan-calculator",
    description:
      "Reveal the true APR behind a flat payday loan fee. Compare single-payment and installment structures to see what the borrowing really costs per year.",
    longDescription:
      "Reveal the true APR behind a flat payday loan fee. Compare single-payment and installment structures to see what the borrowing really costs per year.",
    typesCopy:
      "reveals the true APR and total cost of single-payment and installment payday loans, including rollover impact",
    primaryKeyword: "payday loan APR calculator",
    category: "loans",
  },
  {
    label: "Business Loan Calculator",
    href: "/loans/business-loan-calculator",
    description:
      "Calculate monthly payments and total cost for business term loans, equipment financing, and merchant cash advances. Compare financing structures using the correct math for each product.",
    longDescription:
      "Calculate monthly payments and total cost for business term loans, equipment financing, and merchant cash advances. Compare financing structures using the correct math for each product.",
    typesCopy:
      "supports term loans, equipment financing with balloon payments, and merchant cash advance cost analysis",
    primaryKeyword: "business loan calculator",
    category: "loans",
  },
  {
    label: "Boat, RV & Motorcycle Loan Calculator",
    href: "/loans/boat-rv-motorcycle-loan-calculator",
    description:
      "Figure your monthly payment and total cost for a boat, RV, or motorcycle loan. Factor in trade-in value and sales tax to see the true financed amount.",
    longDescription:
      "Figure your monthly payment and total cost for a boat, RV, or motorcycle loan. Factor in trade-in value and sales tax to see the true financed amount.",
    typesCopy:
      "calculates monthly payments for boat, RV, and motorcycle loans with trade-in, down payment, and sales tax support",
    primaryKeyword: "boat loan calculator",
    category: "loans",
  },
  {
    label: "Personal Loan Calculator",
    href: "/loans/personal-loan-calculator",
    description:
      "Estimate monthly payments and total interest for a personal loan. See how an origination fee changes your true borrowing cost and how extra payments shorten the term.",
    longDescription:
      "Estimate monthly payments and total interest for a personal loan. See how an origination fee changes your true borrowing cost and how extra payments shorten the term.",
    typesCopy:
      "calculates monthly payments for personal loans with origination fee, effective APR, and extra payment support",
    primaryKeyword: "personal loan calculator",
    category: "loans",
  },
  {
    label: "Auto Loan Calculator",
    href: "/loans/auto-loan-calculator",
    description:
      "Project your monthly car payment and total interest. See how trade-in value and negative equity rollover change what you actually finance.",
    longDescription:
      "Project your monthly car payment and total interest. See how trade-in value and negative equity rollover change what you actually finance.",
    typesCopy:
      "calculates car payments with trade-in equity, negative equity rollover, sales tax, and extra monthly payment support",
    primaryKeyword: "auto loan calculator",
    category: "loans",
  },
  {
    label: "Debt Consolidation Calculator",
    href: "/loans/debt-consolidation-calculator",
    description:
      "Compare keeping your current debts against a single consolidation loan. See whether consolidation saves money or costs more, and by how much.",
    longDescription:
      "Compare keeping your current debts against a single consolidation loan. See whether consolidation saves money or costs more, and by how much.",
    typesCopy:
      "compares current debts against a consolidation loan with verdict on total cost, monthly savings, and payoff timeline",
    primaryKeyword: "debt consolidation calculator",
    category: "loans",
  },
  {
    label: "Car Affordability Calculator",
    href: "/auto/car-affordability-calculator",
    description:
      "Find the maximum vehicle price you can afford from your income or target monthly payment. Check your numbers against the 20/4/10 rule.",
    longDescription:
      "Find the maximum vehicle price you can afford from your income or target monthly payment. Check your numbers against the 20/4/10 rule.",
    typesCopy:
      "finds the maximum vehicle price you can afford based on income, target payment, or the 20/4/10 rule with full constraint checking",
    primaryKeyword: "how much car can I afford calculator",
    category: "auto",
  },
  {
    label: "Auto Lease Calculator",
    href: "/auto/auto-lease-payment-calculator",
    description:
      "See your monthly car lease payment with each component shown separately. Convert the money factor to APR and check the end-of-lease buyout price.",
    longDescription:
      "See your monthly car lease payment with each component shown separately. Convert the money factor to APR and check the end-of-lease buyout price.",
    typesCopy:
      "calculates monthly lease payments broken into depreciation, finance charge, and tax, with money factor to APR conversion and end-of-lease buyout estimate",
    primaryKeyword: "auto lease calculator",
    category: "auto",
  },
  {
    label: "Lease vs Buy Calculator",
    href: "/auto/lease-vs-buy-calculator",
    description:
      "Compare the total cost of leasing versus buying the same car over your ownership period. See which option is cheaper and the month the buy side pulls ahead.",
    longDescription:
      "Compare the total cost of leasing versus buying the same car over your ownership period. See which option is cheaper and the month the buy side pulls ahead.",
    typesCopy:
      "compares total cost of leasing versus buying a car over the same period, including resale equity, loan balance, and break-even month",
    primaryKeyword: "lease vs buy calculator",
    category: "auto",
  },
  {
    label: "Debt Payoff Calculator",
    href: "/debt/debt-payoff-calculator",
    description:
      "Weigh snowball against avalanche payoff across all your debts. See your exact debt-free date and how extra payments accelerate it.",
    longDescription:
      "Weigh snowball against avalanche payoff across all your debts. See your exact debt-free date and how extra payments accelerate it.",
    typesCopy:
      "compares snowball and avalanche payoff strategies across multiple debts, showing interest saved, debt-free date, and a full month-by-month schedule",
    primaryKeyword: "debt payoff calculator",
    category: "debt",
  },
  {
    label: "DTI Calculator",
    href: "/debt/dti-calculator",
    description:
      "Calculate your front-end and back-end debt-to-income ratio. See exactly where you land against FHA, VA, and conventional lender thresholds before you apply.",
    longDescription:
      "Calculate your front-end and back-end debt-to-income ratio. See exactly where you land against FHA, VA, and conventional lender thresholds before you apply.",
    typesCopy:
      "calculates front-end and back-end DTI ratios, compares against FHA, VA, and conventional lender thresholds, and estimates maximum affordable housing payment",
    primaryKeyword: "DTI calculator",
    category: "debt",
  },
  {
    label: "Credit Card Payoff Calculator",
    href: "/debt/credit-card-payoff-calculator",
    description:
      "See how long it takes to pay off your credit cards and how much interest you pay. Find out how much extra payments save.",
    longDescription:
      "See how long it takes to pay off your credit cards and how much interest you pay. Find out how much extra payments save.",
    typesCopy:
      "estimates credit card payoff timeline and total interest, compares minimum vs fixed payment strategies, and supports snowball/avalanche across multiple cards",
    primaryKeyword: "credit card payoff calculator",
    category: "debt",
  },
  {
    label: "Credit Card Minimum Payment Calculator",
    href: "/debt/credit-card-minimum-payment-calculator",
    description:
      "Understand how your issuer calculates the minimum payment and what paying only the minimum actually costs. Compare minimum-only repayment against a fixed monthly payment.",
    longDescription:
      "Understand how your issuer calculates the minimum payment and what paying only the minimum actually costs. Compare minimum-only repayment against a fixed monthly payment.",
    typesCopy:
      "shows how credit card minimum payments are calculated, total interest and payoff timeline at minimums only, and compares against fixed monthly payments",
    primaryKeyword: "credit card minimum payment calculator",
    category: "debt",
  },
  {
    label: "Balance Transfer Calculator",
    href: "/debt/balance-transfer-calculator",
    description:
      "Decide whether a balance transfer saves money after the transfer fee. Find your break-even month and whether the promo period is long enough.",
    longDescription:
      "Decide whether a balance transfer saves money after the transfer fee. Find your break-even month and whether the promo period is long enough.",
    typesCopy:
      "compares staying on your current card against a balance transfer with promo APR, transfer fee, and post-promo rate to show net savings and break-even point",
    primaryKeyword: "balance transfer calculator",
    category: "debt",
  },
  {
    label: "PMI Calculator",
    href: "/home-buying/pmi-calculator",
    description:
      "Estimate your monthly PMI cost and the exact month it drops off at 78 to 80 percent LTV. Compare conventional PMI against FHA MIP.",
    longDescription:
      "Estimate your monthly PMI cost and the exact month it drops off at 78 to 80 percent LTV. Compare conventional PMI against FHA MIP.",
    typesCopy:
      "estimates monthly PMI cost by credit score and down payment, shows when PMI drops off at 78-80% LTV, and compares conventional PMI vs FHA MIP",
    primaryKeyword: "PMI calculator",
    category: "home-buying",
  },
  {
    label: "Refinance Break-Even Calculator",
    href: "/home-buying/refinance-break-even-calculator",
    description:
      "See how many months it takes to recoup refinance closing costs from your monthly savings. Find out whether refinancing is worth it for your planned stay.",
    longDescription:
      "See how many months it takes to recoup refinance closing costs from your monthly savings. Find out whether refinancing is worth it for your planned stay.",
    typesCopy:
      "compares current mortgage against a refinance offer, shows break-even months, monthly savings, total interest saved, and a worth-it verdict based on planned stay",
    primaryKeyword: "refinance break-even calculator",
    category: "home-buying",
  },
  {
    label: "HELOC Calculator",
    href: "/home-buying/heloc-calculator",
    description:
      "Project your maximum HELOC credit line and the payment jump from interest-only draw to full repayment. See how extra payments soften the jump.",
    longDescription:
      "Project your maximum HELOC credit line and the payment jump from interest-only draw to full repayment. See how extra payments soften the jump.",
    typesCopy:
      "estimates your maximum HELOC credit line, interest-only draw payments, repayment-period payments, and the payment jump between phases with extra payment support",
    primaryKeyword: "HELOC calculator",
    category: "home-buying",
  },
  {
    label: "Down Payment Calculator",
    href: "/home-buying/down-payment-calculator",
    description:
      "See how your down payment changes the loan amount, LTV, and PMI status. Get total cash needed at closing with VA, FHA, and conventional presets.",
    longDescription:
      "See how your down payment changes the loan amount, LTV, and PMI status. Get total cash needed at closing with VA, FHA, and conventional presets.",
    typesCopy:
      "calculates down payment, loan amount, LTV, PMI status, and total cash to close with loan-program presets for VA, FHA, and conventional loans",
    primaryKeyword: "down payment calculator",
    category: "home-buying",
  },
  {
    label: "Home Affordability Calculator",
    href: "/home-buying/home-affordability-calculator",
    description:
      "See how much house you can afford under the 28/36 conventional or 31/43 FHA DTI rules. Back-solve from a target monthly payment if you prefer.",
    longDescription:
      "See how much house you can afford under the 28/36 conventional or 31/43 FHA DTI rules. Back-solve from a target monthly payment if you prefer.",
    typesCopy:
      "calculates how much house you can afford based on income, debts, down payment, and rate with conventional 28/36 and FHA 31/43 DTI rule modes and a reverse monthly-payment mode",
    primaryKeyword: "home affordability calculator",
    category: "home-buying",
  },
  {
    label: "Disability Insurance Calculator",
    href: "/insurance/disability-insurance-calculator",
    description:
      "Find the disability insurance coverage gap between your essential expenses and any employer LTD benefit. See the recommended supplemental benefit to fill it.",
    longDescription:
      "Find the disability insurance coverage gap between your essential expenses and any employer LTD benefit. See the recommended supplemental benefit to fill it.",
    typesCopy:
      "estimates disability insurance coverage needs based on salary, essential expenses, and existing employer LTD, with premium ranges and coverage gap analysis",
    primaryKeyword: "disability insurance calculator",
    category: "insurance",
  },
  {
    label: "Life Insurance Calculator",
    href: "/insurance/life-insurance-calculator",
    description:
      "Estimate how much life insurance you need using the DIME method. A stay-at-home parent mode prices the cost of replacing the services that parent provides.",
    longDescription:
      "Estimate how much life insurance you need using the DIME method. A stay-at-home parent mode prices the cost of replacing the services that parent provides.",
    typesCopy:
      "calculates life insurance coverage needs using the DIME method with stay-at-home parent mode, 10x income comparison, and $50K band rounding",
    primaryKeyword: "life insurance calculator",
    category: "insurance",
  },
  {
    label: "Annuity Payout Calculator",
    href: "/insurance/annuity-payout-calculator",
    description:
      "Project monthly and annual income from a fixed-period or immediate life annuity. See your break-even age and how the payout option changes the number.",
    longDescription:
      "Project monthly and annual income from a fixed-period or immediate life annuity. See your break-even age and how the payout option changes the number.",
    typesCopy:
      "estimates annuity payout amounts for life and fixed-period options using SPIA rate tables and amortization math, with break-even age and total interest calculations",
    primaryKeyword: "annuity payout calculator",
    category: "insurance",
  },
  {
    label: "Overtime Pay Calculator",
    href: "/income/overtime-calculator",
    description:
      "Calculate your overtime pay for any wage and multiplier, from time-and-a-half to double time. See your total gross paycheck and the annualized equivalent.",
    longDescription:
      "Calculate your overtime pay for any wage and multiplier, from time-and-a-half to double time. See your total gross paycheck and the annualized equivalent.",
    typesCopy:
      "calculates time and a half, double time, and custom overtime pay with pay period scaling, annualized totals, and a live reference rate line",
    primaryKeyword: "overtime pay calculator",
    category: "income",
  },
  {
    label: "Salary to Hourly Calculator",
    href: "/income/salary-to-hourly-calculator",
    description:
      "Convert any annual salary to an hourly wage using your real work hours. See the daily, weekly, biweekly, and monthly gross equivalents at a glance.",
    longDescription:
      "Convert any annual salary to an hourly wage using your real work hours. See the daily, weekly, biweekly, and monthly gross equivalents at a glance.",
    typesCopy:
      "converts an annual salary to an hourly wage using actual work hours with daily, weekly, biweekly, and monthly gross pay, a live reference line, and a quick-reference table",
    primaryKeyword: "salary to hourly calculator",
    category: "income",
  },
  {
    label: "Hourly to Salary Calculator",
    href: "/income/hourly-to-salary-calculator",
    description:
      "Turn any hourly wage into an annual salary using your real hours. Add overtime to see how extra hours lift your yearly gross.",
    longDescription:
      "Turn any hourly wage into an annual salary using your real hours. Add overtime to see how extra hours lift your yearly gross.",
    typesCopy:
      "converts an hourly wage to an annual salary using actual work hours with optional overtime, weekly, biweekly, and monthly gross pay, a live reference line, and a quick-reference table",
    primaryKeyword: "hourly to salary calculator",
    category: "income",
  },
  {
    label: "CD Early Withdrawal Penalty Calculator",
    href: "/savings/cd-early-withdrawal-penalty-calculator",
    description:
      "See what breaking your CD early costs in dollars and whether the penalty is worth paying to reinvest at a higher rate.",
    longDescription:
      "See what breaking your CD early costs in dollars and whether the penalty is worth paying to reinvest at a higher rate.",
    typesCopy:
      "computes the CD early withdrawal penalty in dollars, net proceeds, and a keep-versus-break comparison so you can see whether cashing a CD early is worth it",
    primaryKeyword: "cd early withdrawal penalty calculator",
    category: "savings",
  },
  {
    label: "Net Worth by Age Calculator",
    href: "/savings/net-worth-calculator",
    description:
      "Add your assets, subtract your debts, and compare your net worth to the U.S. median and average for your age group.",
    longDescription:
      "Add your assets, subtract your debts, and compare your net worth to the U.S. median and average for your age group.",
    typesCopy:
      "computes net worth from assets and liabilities with add-or-remove rows, breaks out home equity and net worth excluding home equity, and compares your number to the median and average for your age bracket from the Federal Reserve SCF 2022",
    primaryKeyword: "net worth by age calculator",
    category: "savings",
  },
  {
    label: "Student Loan Payoff Calculator",
    href: "/loans/student-loan-payoff-calculator",
    description:
      "See your student loan payoff date, total interest, and how much time and money extra payments or a lump sum can save.",
    longDescription:
      "See your student loan payoff date, total interest, and how much time and money extra payments or a lump sum can save.",
    typesCopy:
      "computes student loan payoff time, total interest, and debt-free date with optional extra monthly payments and a one-time lump sum applied in month 1",
    primaryKeyword: "student loan payoff calculator",
    category: "loans",
  },
] as const;

// ─── Core site config ────────────────────────────────────────────────
export const siteConfig = {
  name: "CalcForge",
  tagline: "Precision-crafted financial calculators",
  description:
    "Free, accurate financial calculators for loans, debt, auto, home buying, and insurance. Plan your finances with confidence.",
  domain: "thecalcforge.com",
  url: "https://thecalcforge.com" as const,
  ogImage: "/og-default.png",

  // Branding colors (CSS custom properties are set in globals.css)
  colors: {
    primary: "slate",
    accent: "ember",
    accentHex: "#00786f",
    accentHover: "#005f58",
  },

  // Navigation
  nav: {
    pages: [
      { label: "About", href: "/about" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Contact", href: "/contact" },
    ],
  },

  // Monetization placeholders
  ads: {
    enabled: false,
    clientId: "",
  },

  // Affiliate CTA config per page (key = page path)
  affiliateCta: {
  } as Record<string, { html: string }>,
} as const;

export type SiteConfig = typeof siteConfig;