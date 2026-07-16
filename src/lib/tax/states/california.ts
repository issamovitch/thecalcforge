// ============================================================================
// CalcForge - California State Tax Calculator (2026)
// ============================================================================

import type {
  FilingStatus,
  StateTaxCalculator,
  StateTaxResult,
  StateTaxOptions,
  TaxBracket,
  TaxBreakdownLine,
  StandardDeductions,
} from "@/types/calculator";

// ============================================================================
// 2026 California Tax Configuration
// Source: policyengine-us v1.771.2, parameter extraction 2025-07-15
// ============================================================================

/**
 * California Standard Deductions
 * Source: policyengine-us gov.states.ca.tax.income.deductions.standard.amount
 * TODO: Verify CA HOH standard deduction against CA FTB official publication.
 *       policyengine-us returns the same value for JOINT and HOH (11,412), which
 *       may be a modeling artifact. CA FTB typically sets HOH ~1.5x single.
 * Verified: 2025-07-15
 */
const CA_STANDARD_DEDUCTION: StandardDeductions = {
  single: 5_706,
  married_filing_jointly: 11_412,
  head_of_household: 11_412,
};

/**
 * California Income Tax Brackets — Single
 * Source: policyengine-us gov.states.ca.tax.income.rates.single
 * Thresholds are CPI-indexed floats rounded to nearest whole dollar.
 * Verified: 2025-07-15
 */
const CA_BRACKETS_SINGLE: TaxBracket[] = [
  { rate: 0.01, min: 0, max: 11_330 },
  { rate: 0.02, min: 11_330, max: 26_859 },
  { rate: 0.04, min: 26_859, max: 42_391 },
  { rate: 0.06, min: 42_391, max: 58_846 },
  { rate: 0.08, min: 58_846, max: 74_372 },
  { rate: 0.093, min: 74_372, max: 379_898 },
  { rate: 0.103, min: 379_898, max: 455_873 },
  { rate: 0.113, min: 455_873, max: 759_790 },
  { rate: 0.123, min: 759_790, max: null },
];

/**
 * California Income Tax Brackets — Married Filing Jointly
 * Source: policyengine-us gov.states.ca.tax.income.rates.joint
 * Verified: 2025-07-15
 */
const CA_BRACKETS_MFJ: TaxBracket[] = [
  { rate: 0.01, min: 0, max: 22_660 },
  { rate: 0.02, min: 22_660, max: 53_718 },
  { rate: 0.04, min: 53_718, max: 84_783 },
  { rate: 0.06, min: 84_783, max: 117_692 },
  { rate: 0.08, min: 117_692, max: 148_744 },
  { rate: 0.093, min: 148_744, max: 759_796 },
  { rate: 0.103, min: 759_796, max: 911_747 },
  { rate: 0.113, min: 911_747, max: 1_519_581 },
  { rate: 0.123, min: 1_519_581, max: null },
];

/**
 * California Income Tax Brackets — Head of Household
 * Source: policyengine-us gov.states.ca.tax.income.rates.head_of_household
 * Verified: 2025-07-15
 */
const CA_BRACKETS_HOH: TaxBracket[] = [
  { rate: 0.01, min: 0, max: 22_676 },
  { rate: 0.02, min: 22_676, max: 53_720 },
  { rate: 0.04, min: 53_720, max: 69_251 },
  { rate: 0.06, min: 69_251, max: 85_704 },
  { rate: 0.08, min: 85_704, max: 101_233 },
  { rate: 0.093, min: 101_233, max: 516_657 },
  { rate: 0.103, min: 516_657, max: 619_990 },
  { rate: 0.113, min: 619_990, max: 1_033_316 },
  { rate: 0.123, min: 1_033_316, max: null },
];

const CA_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: CA_BRACKETS_SINGLE,
  married_filing_jointly: CA_BRACKETS_MFJ,
  head_of_household: CA_BRACKETS_HOH,
};

/**
 * California SDI (State Disability Insurance)
 * Source: policyengine-us gov.states.ca.tax.payroll.disability.employee_rate
 * Rate: 1.3% for 2026
 * TODO: Verify official CA SDI wage base from edd.ca.gov. policyengine-us does not
 *       model a wage base cap for CA SDI. The official CA EDD typically publishes
 *       a taxable wage base (e.g., $153,164 for prior years). Currently uncapped
 *       to match policyengine-us probe values.
 * Verified: 2025-07-15
 */
const CA_SDI_RATE = 0.013;
const CA_SDI_WAGE_BASE = 99_999_999; // Effectively uncapped; see TODO above

/**
 * California Mental Health Services Tax
 * Source: policyengine-us gov.states.ca.tax.income.mental_health_services
 * Verified: 2025-07-15
 */
const CA_MENTAL_HEALTH_RATE = 0.01;
const CA_MENTAL_HEALTH_THRESHOLD = 1_000_000;

// ============================================================================
// Progressive Bracket Helper
// ============================================================================

function calculateProgressiveTax(
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
        label: `${(bracket.rate * 100).toFixed(1)}% ($${bracketMinFormatted} – $${bracketMaxFormatted})`,
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
// California State Tax Calculator
// ============================================================================

export const californiaCalculator: StateTaxCalculator = {
  calculateStateTax(
    annualGrossWages: number,
    filingStatus: FilingStatus,
    _options: StateTaxOptions
  ): StateTaxResult {
    const breakdownLines: TaxBreakdownLine[] = [];
    let totalTax = 0;
    let marginalRate = 0;

    // 1. Standard deduction
    const standardDeduction = CA_STANDARD_DEDUCTION[filingStatus];

    breakdownLines.push({
      label: "Standard Deduction",
      amount: -standardDeduction,
    });

    // 2. State income tax on taxable income
    const taxableIncome = Math.max(0, annualGrossWages - standardDeduction);
    const incomeTaxResult = calculateProgressiveTax(
      taxableIncome,
      CA_BRACKETS[filingStatus]
    );

    for (const line of incomeTaxResult.breakdownLines) {
      breakdownLines.push({
        label: `CA Income Tax: ${line.label}`,
        amount: line.amount,
        rate: line.rate,
      });
    }

    totalTax += incomeTaxResult.tax;
    marginalRate = incomeTaxResult.marginalRate;

    // 3. SDI (State Disability Insurance)
    const sdiTaxable = Math.min(annualGrossWages, CA_SDI_WAGE_BASE);
    const sdiTax = Math.round(sdiTaxable * CA_SDI_RATE * 100) / 100;

    if (sdiTax > 0) {
      breakdownLines.push({
        label: `CA SDI (${(CA_SDI_RATE * 100).toFixed(1)}%)`,
        amount: sdiTax,
        rate: CA_SDI_RATE,
      });
      totalTax += sdiTax;
    }

    // 4. Mental Health Services Tax (1% on income over $1M)
    if (annualGrossWages > CA_MENTAL_HEALTH_THRESHOLD) {
      const mentalHealthTaxable = annualGrossWages - CA_MENTAL_HEALTH_THRESHOLD;
      const mentalHealthTax = Math.round(mentalHealthTaxable * CA_MENTAL_HEALTH_RATE * 100) / 100;

      breakdownLines.push({
        label: `Mental Health Services Tax (${(CA_MENTAL_HEALTH_RATE * 100).toFixed(0)}% over $${CA_MENTAL_HEALTH_THRESHOLD.toLocaleString("en-US")})`,
        amount: mentalHealthTax,
        rate: CA_MENTAL_HEALTH_RATE,
      });

      totalTax += mentalHealthTax;
      marginalRate = Math.max(marginalRate, CA_MENTAL_HEALTH_RATE + incomeTaxResult.marginalRate);
    }

    const effectiveRate =
      annualGrossWages > 0
        ? Math.round((totalTax / annualGrossWages) * 10000) / 10000
        : 0;

    return {
      tax: Math.round(totalTax * 100) / 100,
      breakdownLines,
      effectiveRate,
      marginalRate,
    };
  },
};