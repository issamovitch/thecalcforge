// ============================================================================
// CalcForge - Calculator Type Definitions
// ============================================================================

/** Filing status for federal and state taxes */
export type FilingStatus = "single" | "married_filing_jointly" | "head_of_household";

/** Pay frequency options */
export type PayFrequency =
  | "annual"
  | "monthly"
  | "semi_monthly"
  | "bi_weekly"
  | "weekly"
  | "hourly";

/** How many pay periods per year for each frequency */
export const PERIODS_PER_YEAR: Record<PayFrequency, number> = {
  annual: 1,
  monthly: 12,
  semi_monthly: 24,
  bi_weekly: 26,
  weekly: 52,
  hourly: 52, // assumed hours/week * 52, handled separately
};

/** Human-readable labels for filing status */
export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: "Single",
  married_filing_jointly: "Married Filing Jointly",
  head_of_household: "Head of Household",
};

/** Human-readable labels for pay frequency */
export const PAY_FREQUENCY_LABELS: Record<PayFrequency, string> = {
  annual: "Annual Salary",
  monthly: "Monthly",
  "semi_monthly": "Semi-Monthly (twice/month)",
  bi_weekly: "Bi-Weekly (every 2 weeks)",
  weekly: "Weekly",
  hourly: "Hourly Wage",
};

// ============================================================================
// Tax Bracket Types
// ============================================================================

/** A single tax bracket: min is inclusive, max is exclusive (null = no cap) */
export interface TaxBracket {
  rate: number;       // decimal, e.g. 0.22 for 22%
  min: number;        // minimum taxable income for this bracket
  max: number | null; // maximum taxable income (null = unlimited)
}

/** Standard deduction amounts per filing status */
export interface StandardDeductions {
  single: number;
  married_filing_jointly: number;
  head_of_household: number;
}

// ============================================================================
// Federal Tax Configuration
// ============================================================================

/** Full federal tax configuration for a given tax year */
export interface FederalTaxConfig {
  year: number;
  brackets: {
    single: TaxBracket[];
    married_filing_jointly: TaxBracket[];
    head_of_household: TaxBracket[];
  };
  standardDeduction: StandardDeductions;
  // FICA
  socialSecurityRate: number;    // employee portion
  socialSecurityWageBase: number; // annual cap
  medicareRate: number;          // base 1.45%
  medicareAdditionalRate: number; // 0.9% over threshold
  medicareAdditionalThreshold: {
    single: number;
    married_filing_jointly: number;
    head_of_household: number;
  };
}

// ============================================================================
// State Tax Configuration
// ============================================================================

/** A single line in a tax breakdown (for display) */
export interface TaxBreakdownLine {
  label: string;
  amount: number;
  rate?: number; // optional, for showing the rate used
}

/** Result from a state tax calculator */
export interface StateTaxResult {
  tax: number;               // total state tax (annual)
  breakdownLines: TaxBreakdownLine[];
  effectiveRate: number;     // effective state tax rate
  marginalRate: number;      // highest bracket rate hit
}

/** Pluggable state tax calculator interface */
export interface StateTaxCalculator {
  /** Calculate state income tax for the given parameters */
  calculateStateTax(
    annualGrossWages: number,
    filingStatus: FilingStatus,
    options: StateTaxOptions
  ): StateTaxResult;
}

/** Options passed to state calculators */
export interface StateTaxOptions {
  /** NY: whether the taxpayer is a NYC resident */
  nycResident?: boolean;
  /** PA: local EIT rate (decimal, e.g. 0.01 for 1%) */
  paLocalEitRate?: number;
  /** Number of allowances/exemptions (state-specific) */
  allowances?: number;
  /** Any additional state-specific options */
  [key: string]: unknown;
}

/** Full state configuration (from data.ts) */
export interface StateTaxConfig {
  slug: string;
  name: string;
  abbreviation: string;
  year: number;

  /** SEO metadata */
  meta: {
    title: string;
    description: string;
  };

  /** Whether this state has income tax */
  hasIncomeTax: boolean;

  /** Progressive brackets (null for flat-tax or no-tax states) */
  brackets?: {
    single?: TaxBracket[];
    married_filing_jointly?: TaxBracket[];
    head_of_household?: TaxBracket[];
  };

  /** Flat tax rate (for flat-tax states like PA) */
  flatRate?: number;

  /** Standard deduction or personal exemption per filing status */
  standardDeduction?: StandardDeductions;

  /** State-specific settings */
  settings?: {
    /** CA: SDI rate and wage base */
    sdiRate?: number;
    sdiWageBase?: number;
    /** CA: Mental Health Services Tax rate and threshold */
    mentalHealthRate?: number;
    mentalHealthThreshold?: number;
    /** NY: NYC tax brackets */
    nycBrackets?: TaxBracket[];
    /** PA: default local EIT rate */
    defaultLocalEitRate?: number;
  };

  /** FAQ pairs for the state page */
  faq: Array<{
    question: string;
    answer: string;
  }>;

  /** Neighboring states for comparison section */
  neighboringStates?: string[];
}

// ============================================================================
// Calculator Input
// ============================================================================

export interface CalculatorInput {
  /** Gross pay amount */
  grossPay: number;
  /** Pay frequency */
  payFrequency: PayFrequency;
  /** Hours per week (only for hourly) */
  hoursPerWeek?: number;
  /** Filing status */
  filingStatus: FilingStatus;
  /** 401(k) deduction - percentage (0-100) if contributionType is 'percent' */
  retirement401kPercent: number;
  /** 401(k) contribution type: 'percent' or 'fixed' */
  retirement401kType: "percent" | "fixed";
  /** 401(k) deduction - fixed annual amount if contributionType is 'fixed' */
  retirement401kFixed: number;
  /** HSA annual contribution */
  hsaContribution: number;
  /** Other pre-tax deductions (annual) */
  otherPreTax: number;
  /** Post-tax deductions (annual) */
  postTaxDeductions: number;
}

// ============================================================================
// Calculator Result
// ============================================================================

export interface CalculatorResult {
  // Annual figures
  annual: {
    grossPay: number;
    federalTax: number;
    socialSecurity: number;
    medicare: number;
    medicareAdditional: number;
    stateTax: number;
    localTax: number;
    preTaxDeductions: number;
    postTaxDeductions: number;
    takeHomePay: number;
    effectiveTaxRate: number;
    marginalBracket: number;
  };
  // Per-period figures
  perPeriod: {
    grossPay: number;
    federalTax: number;
    socialSecurity: number;
    medicare: number;
    medicareAdditional: number;
    stateTax: number;
    localTax: number;
    preTaxDeductions: number;
    postTaxDeductions: number;
    takeHomePay: number;
  };
  // Breakdown lines for display
  breakdownLines: TaxBreakdownLine[];
  // State-specific breakdown
  stateBreakdown: TaxBreakdownLine[];
  // Marginal tax bracket info
  marginalInfo: {
    federal: number;
    state: number;
    fica: number;
  };
}

// ============================================================================
// Content types
// ============================================================================

/** A state content module (exported from content.tsx) */
export interface StateContentModule {
  default: React.ComponentType<{ stateConfig: StateTaxConfig }>;
}