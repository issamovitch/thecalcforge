// ============================================================================
// CalcForge - New York State Tax Calculator (2026)
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
// 2026 New York Tax Configuration
// Source: policyengine-us v1.771.2, parameter extraction 2025-07-15
// ============================================================================

/**
 * New York Standard Deductions
 * Source: policyengine-us gov.states.ny.tax.income.deductions.standard.amount
 * Verified: 2025-07-15
 */
const NY_STANDARD_DEDUCTION: StandardDeductions = {
  single: 8_000,
  married_filing_jointly: 16_050,
  head_of_household: 11_200,
};

/**
 * New York Income Tax Brackets — Single
 * Source: policyengine-us gov.states.ny.tax.income.main.single
 * Note: NY enacted tax rate reductions phasing in through 2026 (FY2024 budget).
 * Verified: 2025-07-15
 */
const NY_BRACKETS_SINGLE: TaxBracket[] = [
  { rate: 0.039, min: 0, max: 8_500 },
  { rate: 0.044, min: 8_500, max: 11_700 },
  { rate: 0.0515, min: 11_700, max: 13_900 },
  { rate: 0.054, min: 13_900, max: 80_650 },
  { rate: 0.059, min: 80_650, max: 215_400 },
  { rate: 0.0685, min: 215_400, max: 1_077_550 },
  { rate: 0.0965, min: 1_077_550, max: 5_000_000 },
  { rate: 0.103, min: 5_000_000, max: 25_000_000 },
  { rate: 0.109, min: 25_000_000, max: null },
];

/**
 * New York Income Tax Brackets — Married Filing Jointly
 * Source: policyengine-us gov.states.ny.tax.income.main.joint
 * Verified: 2025-07-15
 */
const NY_BRACKETS_MFJ: TaxBracket[] = [
  { rate: 0.039, min: 0, max: 17_150 },
  { rate: 0.044, min: 17_150, max: 23_600 },
  { rate: 0.0515, min: 23_600, max: 27_900 },
  { rate: 0.054, min: 27_900, max: 161_550 },
  { rate: 0.059, min: 161_550, max: 323_200 },
  { rate: 0.0685, min: 323_200, max: 2_155_350 },
  { rate: 0.0965, min: 2_155_350, max: 5_000_000 },
  { rate: 0.103, min: 5_000_000, max: 25_000_000 },
  { rate: 0.109, min: 25_000_000, max: null },
];

/**
 * New York Income Tax Brackets — Head of Household
 * Source: policyengine-us gov.states.ny.tax.income.main.head_of_household
 * Verified: 2025-07-15
 */
const NY_BRACKETS_HOH: TaxBracket[] = [
  { rate: 0.039, min: 0, max: 12_800 },
  { rate: 0.044, min: 12_800, max: 17_650 },
  { rate: 0.0515, min: 17_650, max: 20_900 },
  { rate: 0.054, min: 20_900, max: 107_650 },
  { rate: 0.059, min: 107_650, max: 269_300 },
  { rate: 0.0685, min: 269_300, max: 1_616_450 },
  { rate: 0.0965, min: 1_616_450, max: 5_000_000 },
  { rate: 0.103, min: 5_000_000, max: 25_000_000 },
  { rate: 0.109, min: 25_000_000, max: null },
];

const NY_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: NY_BRACKETS_SINGLE,
  married_filing_jointly: NY_BRACKETS_MFJ,
  head_of_household: NY_BRACKETS_HOH,
};

// ============================================================================
// NYC Resident Tax Brackets
// ============================================================================

/**
 * New York City Resident Tax Brackets (same for all filing statuses)
 * Source: policyengine-us gov.local.ny.nyc.tax.income.rates.single
 * Verified: 2025-07-15
 */
const NYC_BRACKETS: TaxBracket[] = [
  { rate: 0.03078, min: 0, max: 12_000 },
  { rate: 0.03762, min: 12_000, max: 25_000 },
  { rate: 0.03819, min: 25_000, max: 50_000 },
  { rate: 0.03876, min: 50_000, max: null },
];

// ============================================================================
// NY Paid Family Leave (PFL) and Disability Benefits (DBL)
// ============================================================================

/**
 * NY Paid Family Leave — employee payroll deduction
 * Source: policyengine-us gov.states.ny.tax.payroll.paid_family_leave
 * Rate: 0.432%, annual maximum contribution: $411.91
 * Wage base: $411.91 / 0.00432 ≈ $95,356
 * Verified: 2025-07-15
 */
const NY_PFL_RATE = 0.00432;
const NY_PFL_ANNUAL_MAX = 411.91;
const NY_PFL_WAGE_BASE = Math.round(NY_PFL_ANNUAL_MAX / NY_PFL_RATE); // 95,356

/**
 * NY Disability Benefits Law (DBL) — employee payroll deduction
 * Source: policyengine-us gov.states.ny.tax.payroll.disability_benefits
 * Rate: 0.5%, annual maximum contribution: $31.20
 * Wage base: $31.20 / 0.005 = $6,240
 * Verified: 2025-07-15
 */
const NY_DBL_RATE = 0.005;
const NY_DBL_ANNUAL_MAX = 31.20;
const NY_DBL_WAGE_BASE = Math.round(NY_DBL_ANNUAL_MAX / NY_DBL_RATE); // 6,240

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
        label: `${(bracket.rate * 100).toFixed(3)}% ($${bracketMinFormatted} – $${bracketMaxFormatted})`,
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
// New York State Tax Calculator
// ============================================================================

export const newYorkCalculator: StateTaxCalculator = {
  calculateStateTax(
    annualGrossWages: number,
    filingStatus: FilingStatus,
    options: StateTaxOptions
  ): StateTaxResult {
    const breakdownLines: TaxBreakdownLine[] = [];
    let totalTax = 0;
    let marginalRate = 0;

    // 1. Standard deduction
    const standardDeduction = NY_STANDARD_DEDUCTION[filingStatus];

    breakdownLines.push({
      label: "Standard Deduction",
      amount: -standardDeduction,
    });

    // 2. State income tax on taxable income
    const taxableIncome = Math.max(0, annualGrossWages - standardDeduction);
    const incomeTaxResult = calculateProgressiveTax(
      taxableIncome,
      NY_BRACKETS[filingStatus]
    );

    for (const line of incomeTaxResult.breakdownLines) {
      breakdownLines.push({
        label: `NY State Tax: ${line.label}`,
        amount: line.amount,
        rate: line.rate,
      });
    }

    totalTax += incomeTaxResult.tax;
    marginalRate = incomeTaxResult.marginalRate;

    // 3. NYC Resident Tax (if applicable)
    const isNycResident = options.nycResident ?? false;
    let localTax = 0;

    if (isNycResident) {
      const nycResult = calculateProgressiveTax(taxableIncome, NYC_BRACKETS);

      for (const line of nycResult.breakdownLines) {
        breakdownLines.push({
          label: `NYC Tax: ${line.label}`,
          amount: line.amount,
          rate: line.rate,
        });
      }

      localTax = nycResult.tax;
      totalTax += localTax;
    }

    // 4. NY Paid Family Leave (PFL)
    const pflTaxable = Math.min(annualGrossWages, NY_PFL_WAGE_BASE);
    const pflTax = Math.min(
      Math.round(pflTaxable * NY_PFL_RATE * 100) / 100,
      NY_PFL_ANNUAL_MAX
    );

    if (pflTax > 0) {
      breakdownLines.push({
        label: `NY Paid Family Leave (${(NY_PFL_RATE * 100).toFixed(3)}% up to $${NY_PFL_WAGE_BASE.toLocaleString("en-US")})`,
        amount: pflTax,
        rate: NY_PFL_RATE,
      });
      totalTax += pflTax;
    }

    // 5. NY Disability Benefits (DBL)
    const dblTaxable = Math.min(annualGrossWages, NY_DBL_WAGE_BASE);
    const dblTax = Math.min(
      Math.round(dblTaxable * NY_DBL_RATE * 100) / 100,
      NY_DBL_ANNUAL_MAX
    );

    if (dblTax > 0) {
      breakdownLines.push({
        label: `NY Disability Benefits (${(NY_DBL_RATE * 100).toFixed(1)}% up to $${NY_DBL_WAGE_BASE.toLocaleString("en-US")})`,
        amount: dblTax,
        rate: NY_DBL_RATE,
      });
      totalTax += dblTax;
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