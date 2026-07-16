// ============================================================================
// CalcForge - Federal Tax Calculation Engine (2026)
// ============================================================================

import type {
  FilingStatus,
  FederalTaxConfig,
  TaxBracket,
  TaxBreakdownLine,
  StandardDeductions,
} from "@/types/calculator";

// ============================================================================
// 2026 Federal Tax Configuration
// Source: policyengine-us v1.771.2, parameter extraction 2025-07-15
// ============================================================================

/**
 * 2026 Standard Deduction amounts
 * Source: policyengine-us gov.irs.deductions.standard.amount
 * Verified: 2025-07-15 via policyengine-us
 */
const STANDARD_DEDUCTIONS_2026: StandardDeductions = {
  single: 16_100,
  married_filing_jointly: 32_200,
  head_of_household: 24_150,
};

/**
 * 2026 Federal Income Tax Brackets — Single
 * Source: policyengine-us gov.irs.income.bracket.thresholds/rates
 * Verified: 2025-07-15
 */
const BRACKETS_SINGLE_2026: TaxBracket[] = [
  { rate: 0.10, min: 0, max: 12_400 },
  { rate: 0.12, min: 12_400, max: 50_400 },
  { rate: 0.22, min: 50_400, max: 105_700 },
  { rate: 0.24, min: 105_700, max: 201_775 },
  { rate: 0.32, min: 201_775, max: 256_225 },
  { rate: 0.35, min: 256_225, max: 640_600 },
  { rate: 0.37, min: 640_600, max: null },
];

/**
 * 2026 Federal Income Tax Brackets — Married Filing Jointly
 * Source: policyengine-us gov.irs.income.bracket.thresholds/rates
 * Verified: 2025-07-15
 */
const BRACKETS_MFJ_2026: TaxBracket[] = [
  { rate: 0.10, min: 0, max: 24_800 },
  { rate: 0.12, min: 24_800, max: 100_800 },
  { rate: 0.22, min: 100_800, max: 211_400 },
  { rate: 0.24, min: 211_400, max: 403_550 },
  { rate: 0.32, min: 403_550, max: 512_450 },
  { rate: 0.35, min: 512_450, max: 768_700 },
  { rate: 0.37, min: 768_700, max: null },
];

/**
 * 2026 Federal Income Tax Brackets — Head of Household
 * Source: policyengine-us gov.irs.income.bracket.thresholds/rates
 * Verified: 2025-07-15
 */
const BRACKETS_HOH_2026: TaxBracket[] = [
  { rate: 0.10, min: 0, max: 17_700 },
  { rate: 0.12, min: 17_700, max: 67_450 },
  { rate: 0.22, min: 67_450, max: 105_700 },
  { rate: 0.24, min: 105_700, max: 201_750 },
  { rate: 0.32, min: 201_750, max: 256_200 },
  { rate: 0.35, min: 256_200, max: 640_600 },
  { rate: 0.37, min: 640_600, max: null },
];

// ============================================================================
// Exported Federal Tax Config
// ============================================================================

/** Complete 2026 federal tax configuration */
export const federalTaxConfig2026: FederalTaxConfig = {
  year: 2026,
  brackets: {
    single: BRACKETS_SINGLE_2026,
    married_filing_jointly: BRACKETS_MFJ_2026,
    head_of_household: BRACKETS_HOH_2026,
  },
  standardDeduction: STANDARD_DEDUCTIONS_2026,
  /**
   * Social Security employee rate
   * Source: policyengine-us gov.irs.payroll.social_security.rate.employee
   */
  socialSecurityRate: 0.062,
  /**
   * Social Security wage base (2026)
   * Source: policyengine-us gov.irs.payroll.social_security.cap
   * Verified: 2025-07-15
   */
  socialSecurityWageBase: 184_500,
  /**
   * Medicare employee rate
   * Source: policyengine-us gov.irs.payroll.medicare.rate.employee
   */
  medicareRate: 0.0145,
  /** Additional Medicare rate */
  medicareAdditionalRate: 0.009,
  /**
   * Additional Medicare thresholds
   * Source: policyengine-us gov.irs.payroll.medicare.additional.exclusion
   */
  medicareAdditionalThreshold: {
    single: 200_000,
    married_filing_jointly: 250_000,
    head_of_household: 200_000,
  },
};

// ============================================================================
// Progressive Bracket Calculation Helper
// ============================================================================

/**
 * Calculate tax using progressive brackets.
 * Returns the total tax and breakdown lines for each bracket hit.
 */
export function calculateProgressiveTax(
  taxableIncome: number,
  brackets: TaxBracket[]
): { tax: number; breakdownLines: TaxBreakdownLine[]; marginalRate: number } {
  let remainingIncome = Math.max(0, taxableIncome);
  let totalTax = 0;
  const breakdownLines: TaxBreakdownLine[] = [];
  let marginalRate = 0;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketWidth =
      bracket.max !== null ? bracket.max - bracket.min : Infinity;
    const taxableInBracket = Math.min(remainingIncome, bracketWidth);
    const taxInBracket = taxableInBracket * bracket.rate;

    if (taxableInBracket > 0) {
      totalTax += taxInBracket;
      marginalRate = bracket.rate;

      const bracketMinFormatted = bracket.min.toLocaleString("en-US");
      const bracketMaxFormatted =
        bracket.max !== null ? bracket.max.toLocaleString("en-US") : "+";

      breakdownLines.push({
        label: `${(bracket.rate * 100).toFixed(0)}% ($${bracketMinFormatted} – $${bracketMaxFormatted})`,
        amount: Math.round(taxInBracket * 100) / 100,
        rate: bracket.rate,
      });

      remainingIncome -= taxableInBracket;
    }
  }

  return {
    tax: Math.round(totalTax * 100) / 100,
    breakdownLines,
    marginalRate,
  };
}

// ============================================================================
// Federal Tax Calculation
// ============================================================================

/**
 * Calculate federal income tax for a given annual taxable income and filing status.
 */
export function calculateFederalTax(
  annualTaxableIncome: number,
  filingStatus: FilingStatus
): { tax: number; breakdownLines: TaxBreakdownLine[]; marginalRate: number } {
  const brackets = federalTaxConfig2026.brackets[filingStatus];
  return calculateProgressiveTax(annualTaxableIncome, brackets);
}

// ============================================================================
// FICA Calculation
// ============================================================================

/**
 * Calculate FICA taxes (Social Security + Medicare + Additional Medicare).
 */
export function calculateFICA(
  annualGrossWages: number,
  filingStatus: FilingStatus
): {
  socialSecurity: number;
  medicare: number;
  medicareAdditional: number;
  breakdownLines: TaxBreakdownLine[];
} {
  const config = federalTaxConfig2026;

  // Social Security: 6.2% up to wage base
  const ssTaxableWages = Math.min(
    annualGrossWages,
    config.socialSecurityWageBase
  );
  const socialSecurity = Math.round(ssTaxableWages * config.socialSecurityRate * 100) / 100;

  // Medicare: 1.45% on all wages
  const medicare = Math.round(annualGrossWages * config.medicareRate * 100) / 100;

  // Additional Medicare: 0.9% on wages over threshold
  const addMedicareThreshold =
    config.medicareAdditionalThreshold[filingStatus];
  const addMedicareWages = Math.max(
    0,
    annualGrossWages - addMedicareThreshold
  );
  const medicareAdditional =
    Math.round(addMedicareWages * config.medicareAdditionalRate * 100) / 100;

  const breakdownLines: TaxBreakdownLine[] = [];

  if (socialSecurity > 0) {
    breakdownLines.push({
      label: `Social Security (${(config.socialSecurityRate * 100).toFixed(1)}% up to $${config.socialSecurityWageBase.toLocaleString("en-US")})`,
      amount: socialSecurity,
      rate: config.socialSecurityRate,
    });
  }

  if (medicare > 0) {
    breakdownLines.push({
      label: `Medicare (${(config.medicareRate * 100).toFixed(2)}%)`,
      amount: medicare,
      rate: config.medicareRate,
    });
  }

  if (medicareAdditional > 0) {
    breakdownLines.push({
      label: `Additional Medicare (${(config.medicareAdditionalRate * 100).toFixed(1)}% over $${addMedicareThreshold.toLocaleString("en-US")})`,
      amount: medicareAdditional,
      rate: config.medicareAdditionalRate,
    });
  }

  return {
    socialSecurity,
    medicare,
    medicareAdditional,
    breakdownLines,
  };
}