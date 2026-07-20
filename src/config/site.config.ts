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
      "Estimate title loan payments, total interest, and amortization schedules.",
    longDescription:
      "Estimate monthly payments, total interest, and full amortization for title loans. This tool is for borrowers comparing lender offers, checking whether an early payoff saves money, or understanding how vehicle value affects loan terms.",
    typesCopy:
      "helps you estimate monthly payments and total cost for title loans, compare lender offers, and plan early payoff strategies",
    primaryKeyword: "title loan calculator",
    category: "loans",
  },
  {
    label: "Payday Loan APR Calculator",
    href: "/loans/payday-loan-calculator",
    description:
      "Calculate payday loan APR for single-payment and installment payday loans.",
    longDescription:
      "Calculate the true APR and total repayment for single-payment and installment payday loans. This tool is for anyone evaluating a payday loan offer, comparing rollover costs, or understanding how a flat fee translates to an annualized rate.",
    typesCopy:
      "reveals the true APR and total cost of single-payment and installment payday loans, including rollover impact",
    primaryKeyword: "payday loan APR calculator",
    category: "loans",
  },
  {
    label: "Business Loan Calculator",
    href: "/loans/business-loan-calculator",
    description:
      "Calculate payments for term loans, equipment financing, and merchant cash advances.",
    longDescription:
      "Estimate monthly payments, total cost, and effective APR for business term loans, equipment loans with balloon payments, and merchant cash advances. This tool supports three loan types so you can compare financing structures using the correct math for each product.",
    typesCopy:
      "supports term loans, equipment financing with balloon payments, and merchant cash advance cost analysis",
    primaryKeyword: "business loan calculator",
    category: "loans",
  },
  {
    label: "Boat, RV & Motorcycle Loan Calculator",
    href: "/loans/boat-rv-motorcycle-loan-calculator",
    description:
      "Calculate payments for boat, RV, and motorcycle loans with trade-in, down payment, and sales tax.",
    longDescription:
      "Estimate monthly payments and total cost for boat, RV, and motorcycle loans. Enter the purchase price, trade-in value, down payment, and sales tax rate to see the financed amount and full amortization schedule. Includes an early payoff option.",
    typesCopy:
      "calculates monthly payments for boat, RV, and motorcycle loans with trade-in, down payment, and sales tax support",
    primaryKeyword: "boat loan calculator",
    category: "loans",
  },
  {
    label: "Personal Loan Calculator",
    href: "/loans/personal-loan-calculator",
    description:
      "Calculate personal loan payments with amortization, origination fee, and extra payments.",
    longDescription:
      "Estimate monthly payments, total interest, effective APR, and full amortization for personal loans. This tool factors in an optional origination fee to show the net amount you receive and the true borrowing cost, plus extra monthly payments for early payoff planning.",
    typesCopy:
      "calculates monthly payments for personal loans with origination fee, effective APR, and extra payment support",
    primaryKeyword: "personal loan calculator",
    category: "loans",
  },
  {
    label: "Auto Loan Calculator",
    href: "/loans/auto-loan-calculator",
    description:
      "Calculate car payments with trade-in equity, negative equity rollover, sales tax, and extra payments.",
    longDescription:
      "Estimate monthly payments for auto loans with trade-in, negative equity rollover, down payment, and sales tax. Shows the financed amount, total interest, and full amortization schedule. Includes an early payoff option and a negative equity warning when old debt is rolled into the new loan.",
    typesCopy:
      "calculates car payments with trade-in equity, negative equity rollover, sales tax, and extra monthly payment support",
    primaryKeyword: "auto loan calculator",
    category: "loans",
  },
  {
    label: "Debt Consolidation Calculator",
    href: "/loans/debt-consolidation-calculator",
    description:
      "Compare current debts against a consolidation loan to see total cost, monthly payment, and whether you save or overpay.",
    longDescription:
      "Enter your existing debts with balances, rates, and current payments, then compare keeping them against a single consolidation loan. The tool shows a side-by-side verdict: total interest, monthly payment, payoff timeline, and whether consolidation saves money or costs more. Supports origination fees and flags debts that will never pay off at their current payment level.",
    typesCopy:
      "compares current debts against a consolidation loan with verdict on total cost, monthly savings, and payoff timeline",
    primaryKeyword: "debt consolidation calculator",
    category: "loans",
  },
  {
    label: "Car Affordability Calculator",
    href: "/auto/car-affordability-calculator",
    description:
      "Find the maximum vehicle price you can afford based on income or target payment, with 20/4/10 rule analysis.",
    longDescription:
      "Reverse-solve from your income or target monthly payment to find the maximum vehicle price you can finance. Includes a dedicated 20/4/10 rule mode that enforces the 20% down, 48-month term, and 10% income thresholds simultaneously, with user-entered insurance, fuel, and maintenance estimates.",
    typesCopy:
      "finds the maximum vehicle price you can afford based on income, target payment, or the 20/4/10 rule with full constraint checking",
    primaryKeyword: "how much car can I afford calculator",
    category: "auto",
  },
  {
    label: "Auto Lease Calculator",
    href: "/auto/auto-lease-payment-calculator",
    description:
      "Calculate monthly lease payments broken into depreciation, finance charge, and tax, with money factor conversion and buyout estimate.",
    longDescription:
      "Calculate your monthly car lease payment by entering the vehicle price, down payment, residual value percentage, money factor (with APR conversion), lease term, and sales tax rate. Shows depreciation, finance charge, and tax portions separately, plus the end-of-lease buyout price including purchase option fee.",
    typesCopy:
      "calculates monthly lease payments broken into depreciation, finance charge, and tax, with money factor to APR conversion and end-of-lease buyout estimate",
    primaryKeyword: "auto lease calculator",
    category: "auto",
  },
  {
    label: "Lease vs Buy Calculator",
    href: "/auto/lease-vs-buy-calculator",
    description:
      "Compare the total cost of leasing versus buying a car over the same period, including resale equity and break-even analysis.",
    longDescription:
      "Enter lease terms (down payment, residual, money factor) and purchase terms (down payment, loan APR, loan term, estimated resale value) for the same vehicle. The calculator compares total cost of leasing versus financing over your chosen comparison period, nets out resale equity on the buy side, and shows which option is cheaper and by how much, plus a break-even month estimate.",
    typesCopy:
      "compares total cost of leasing versus buying a car over the same period, including resale equity, loan balance, and break-even month",
    primaryKeyword: "lease vs buy calculator",
    category: "auto",
  },
  {
    label: "Debt Payoff Calculator",
    href: "/debt/debt-payoff-calculator",
    description:
      "Compare snowball vs avalanche payoff strategies, add extra payments, and see your debt-free date.",
    longDescription:
      "Compare snowball vs avalanche payoff strategies for multiple debts. Add extra monthly payments, see your exact debt-free date, and view a full month-by-month payoff schedule with per-debt breakdowns. Includes side-by-side comparison of both methods.",
    typesCopy:
      "compares snowball and avalanche payoff strategies across multiple debts, showing interest saved, debt-free date, and a full month-by-month schedule",
    primaryKeyword: "debt payoff calculator",
    category: "debt",
  },
  {
    label: "DTI Calculator",
    href: "/debt/dti-calculator",
    description:
      "Calculate your front-end and back-end debt-to-income ratio and see if you meet lender thresholds.",
    longDescription:
      "Calculate your front-end and back-end debt-to-income ratio by entering your gross monthly income and monthly debt payments. See where you fall against FHA, VA, and conventional lender thresholds with a visual meter. Includes a how-much-house-can-I-afford mini-calculator.",
    typesCopy:
      "calculates front-end and back-end DTI ratios, compares against FHA, VA, and conventional lender thresholds, and estimates maximum affordable housing payment",
    primaryKeyword: "DTI calculator",
    category: "debt",
  },
  {
    label: "Credit Card Payoff Calculator",
    href: "/debt/credit-card-payoff-calculator",
    description:
      "See how long to pay off credit cards, total interest, and how extra payments save time and money.",
    longDescription:
      "Estimate how long it takes to pay off one or more credit cards and how much interest you will pay. Compare minimum-only payments against fixed or extra monthly payments. Supports snowball and avalanche strategies across multiple cards with a full month-by-month payoff schedule.",
    typesCopy:
      "estimates credit card payoff timeline and total interest, compares minimum vs fixed payment strategies, and supports snowball/avalanche across multiple cards",
    primaryKeyword: "credit card payoff calculator",
    category: "debt",
  },
  {
    label: "Credit Card Minimum Payment Calculator",
    href: "/debt/credit-card-minimum-payment-calculator",
    description:
      "See how minimum payments are calculated and the true cost of paying only minimums on credit cards.",
    longDescription:
      "Understand how credit card issuers calculate your minimum payment using common formulas like percentage of balance, percentage plus interest, or the CFPB 1% plus interest method. See the declining minimum schedule, total interest paid, and compare minimum-only repayment against a fixed monthly payment.",
    typesCopy:
      "shows how credit card minimum payments are calculated, total interest and payoff timeline at minimums only, and compares against fixed monthly payments",
    primaryKeyword: "credit card minimum payment calculator",
    category: "debt",
  },
  {
    label: "Balance Transfer Calculator",
    href: "/debt/balance-transfer-calculator",
    description:
      "See if a balance transfer saves money after the transfer fee, compare total cost, and find your break-even point.",
    longDescription:
      "Compare keeping your current card against transferring to a promotional APR card. Factors in the balance transfer fee, promotional period length, and post-promo rate to show net savings, break-even month, and whether the promo period is long enough to clear the balance.",
    typesCopy:
      "compares staying on your current card against a balance transfer with promo APR, transfer fee, and post-promo rate to show net savings and break-even point",
    primaryKeyword: "balance transfer calculator",
    category: "debt",
  },
  {
    label: "PMI Calculator",
    href: "/home-buying/pmi-calculator",
    description:
      "Estimate monthly private mortgage insurance cost by credit score and down payment, and see when PMI drops off at 78-80% LTV.",
    longDescription:
      "Estimate your monthly private mortgage insurance cost based on home price, down payment, credit score band, and mortgage term. Shows the PMI rate, monthly and annual cost, the month and date when PMI drops off at 80% LTV (borrower-request) and 78% LTV (automatic termination), and total PMI paid. Includes an FHA MIP comparison mode showing upfront and annual MIP costs over the full loan term.",
    typesCopy:
      "estimates monthly PMI cost by credit score and down payment, shows when PMI drops off at 78-80% LTV, and compares conventional PMI vs FHA MIP",
    primaryKeyword: "PMI calculator",
    category: "home-buying",
  },
  {
    label: "Refinance Break-Even Calculator",
    href: "/home-buying/refinance-break-even-calculator",
    description:
      "See how many months to recoup closing costs, your monthly savings, and whether refinancing your mortgage is worth it.",
    longDescription:
      "Compare your current mortgage against a refinance offer. Enter your balance, current rate, new rate, closing costs, and optional cash-out amount. The calculator shows your new monthly payment, monthly savings, break-even point in months, total interest saved or lost, and whether refinancing is worth it given how long you plan to stay in the home. Flags the term-reset trap when a longer new term increases total interest.",
    typesCopy:
      "compares current mortgage against a refinance offer, shows break-even months, monthly savings, total interest saved, and a worth-it verdict based on planned stay",
    primaryKeyword: "refinance break-even calculator",
    category: "home-buying",
  },
  {
    label: "HELOC Calculator",
    href: "/home-buying/heloc-calculator",
    description:
      "Estimate your maximum HELOC credit line, interest-only draw payments, and repayment-period payments with extra payment support.",
    longDescription:
      "Calculate how much you can borrow with a home equity line of credit based on your home value, mortgage balance, and lender CLTV limit. See interest-only payments during the draw period, the higher principal-and-interest payment during the repayment period, and the payment jump between them. Includes extra payment modeling for both draw and repayment phases.",
    typesCopy:
      "estimates your maximum HELOC credit line, interest-only draw payments, repayment-period payments, and the payment jump between phases with extra payment support",
    primaryKeyword: "HELOC calculator",
    category: "home-buying",
  },
  {
    label: "Down Payment Calculator",
    href: "/home-buying/down-payment-calculator",
    description:
      "See how much to put down on a house, your loan amount, LTV, PMI status, and total cash needed at closing with loan-program presets.",
    longDescription:
      "Enter a home price and adjust the down payment by percentage or dollar amount to see the loan amount, loan-to-value ratio, and whether you avoid PMI at 20%. Includes closing costs for total cash-to-close calculation and loan-program presets (VA 0%, FHA 3.5%, Conventional 3%/5%/20%) for instant minimum comparison.",
    typesCopy:
      "calculates down payment, loan amount, LTV, PMI status, and total cash to close with loan-program presets for VA, FHA, and conventional loans",
    primaryKeyword: "down payment calculator",
    category: "home-buying",
  },
  {
    label: "Home Affordability Calculator",
    href: "/home-buying/home-affordability-calculator",
    description:
      "See how much house you can afford based on income, debts, down payment, and rate, with 28/36 and FHA 31/43 DTI rule modes.",
    longDescription:
      "Enter your income, existing monthly debts, down payment savings, interest rate, loan term, and estimated property tax and insurance. The calculator applies the 28/36 conventional DTI rule (or 31/43 FHA) to find your maximum monthly housing payment, then back-solves the home price that payment supports. Includes a by-monthly-payment reverse mode and FHA comparison.",
    typesCopy:
      "calculates how much house you can afford based on income, debts, down payment, and rate with conventional 28/36 and FHA 31/43 DTI rule modes and a reverse monthly-payment mode",
    primaryKeyword: "home affordability calculator",
    category: "home-buying",
  },
  {
    label: "Disability Insurance Calculator",
    href: "/insurance/disability-insurance-calculator",
    description:
      "Estimate how much disability insurance coverage you need based on salary, essential expenses, and existing employer LTD coverage.",
    longDescription:
      "Enter your gross annual income, monthly essential expenses, employer LTD coverage percentage, and other benefits to find your coverage gap. The calculator compares your actual expense needs against the standard 60% of gross income policy cap and shows the recommended supplemental benefit. Includes estimated premium ranges and own-occupation vs any-occupation guidance.",
    typesCopy:
      "estimates disability insurance coverage needs based on salary, essential expenses, and existing employer LTD, with premium ranges and coverage gap analysis",
    primaryKeyword: "disability insurance calculator",
    category: "insurance",
  },
  {
    label: "Life Insurance Calculator",
    href: "/insurance/life-insurance-calculator",
    description:
      "Estimate how much life insurance you need using the DIME method: debts, income replacement, mortgage, education, and final expenses.",
    longDescription:
      "Enter your income, debts, mortgage, children, and education costs to calculate your total coverage need using the DIME method. Subtracts existing coverage and savings to find the gap, rounds up to the nearest $50,000 policy band. Includes stay-at-home parent mode with replacement-services costing, 10x income comparison, and full DIME breakdown.",
    typesCopy:
      "calculates life insurance coverage needs using the DIME method with stay-at-home parent mode, 10x income comparison, and $50K band rounding",
    primaryKeyword: "life insurance calculator",
    category: "insurance",
  },
  {
    label: "Annuity Payout Calculator",
    href: "/insurance/annuity-payout-calculator",
    description:
      "Estimate monthly and annual income from a fixed-period or immediate life annuity based on premium, age, sex, and payout option.",
    longDescription:
      "Enter your premium amount and select a payout option (life only, life with period certain, fixed period, or joint life) to see estimated monthly and annual income. Life annuities use a market-based SPIA payout rate table by age and sex with interpolation. Fixed-period annuities use exact amortization math with a configurable interest rate.",
    typesCopy:
      "estimates annuity payout amounts for life and fixed-period options using SPIA rate tables and amortization math, with break-even age and total interest calculations",
    primaryKeyword: "annuity payout calculator",
    category: "insurance",
  },
  {
    label: "Overtime Pay Calculator",
    href: "/income/overtime-calculator",
    description:
      "Calculate your overtime hourly rate, overtime pay, regular pay, and total gross paycheck for any hourly wage and overtime multiplier.",
    longDescription:
      "Enter your regular hourly wage, regular hours, overtime hours, and overtime multiplier to see your overtime hourly rate, overtime pay, regular pay, total gross pay for the period, and annualized gross. Supports time and a half (1.5x), double time (2x), and custom multipliers, with weekly, biweekly, and monthly pay period scaling.",
    typesCopy:
      "calculates time and a half, double time, and custom overtime pay with pay period scaling, annualized totals, and a live reference rate line",
    primaryKeyword: "overtime pay calculator",
    category: "income",
  },
  {
    label: "Salary to Hourly Calculator",
    href: "/income/salary-to-hourly-calculator",
    description:
      "Convert any annual salary to an hourly wage, plus daily, weekly, biweekly, and monthly gross pay based on your real work hours.",
    longDescription:
      "Enter your annual salary, hours per week, and weeks per year to see your hourly rate, daily gross (8h), weekly, biweekly, and monthly gross pay. Includes a live reference line and a quick-reference table of hourly equivalents for salaries from $30,000 to $100,000 at the standard 2,080-hour year.",
    typesCopy:
      "converts an annual salary to an hourly wage using actual work hours with daily, weekly, biweekly, and monthly gross pay, a live reference line, and a quick-reference table",
    primaryKeyword: "salary to hourly calculator",
    category: "income",
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