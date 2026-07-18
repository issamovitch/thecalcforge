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