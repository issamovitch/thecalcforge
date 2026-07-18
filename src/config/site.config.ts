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
    href: "/loans/car-affordability-calculator",
    description:
      "Find the maximum vehicle price you can afford based on income or target payment, with 20/4/10 rule analysis.",
    longDescription:
      "Reverse-solve from your income or target monthly payment to find the maximum vehicle price you can finance. Includes a dedicated 20/4/10 rule mode that enforces the 20% down, 48-month term, and 10% income thresholds simultaneously, with user-entered insurance, fuel, and maintenance estimates.",
    typesCopy:
      "finds the maximum vehicle price you can afford based on income, target payment, or the 20/4/10 rule with full constraint checking",
    primaryKeyword: "how much car can I afford calculator",
    category: "loans",
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