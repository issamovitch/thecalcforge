// ============================================================================
// CalcForge - Main Tax Calculation Engine
// ============================================================================

import type {
  CalculatorInput,
  CalculatorResult,
  FilingStatus,
  StateTaxCalculator,
  StateTaxConfig,
  StateTaxResult,
  TaxBreakdownLine,
} from "@/types/calculator";
import { PERIODS_PER_YEAR } from "@/types/calculator";

import { federalTaxConfig2026, calculateFederalTax, calculateFICA } from "./federal";
import { californiaCalculator } from "./states/california";
import { texasCalculator } from "./states/texas";
import { floridaCalculator } from "./states/florida";
import { newYorkCalculator } from "./states/new-york";
import { pennsylvaniaCalculator } from "./states/pennsylvania";

// ============================================================================
// State Calculator Registry
// ============================================================================

/** Map of state slugs to their tax calculator implementations */
const STATE_CALCULATORS: Record<string, StateTaxCalculator> = {
  california: californiaCalculator,
  texas: texasCalculator,
  florida: floridaCalculator,
  "new-york": newYorkCalculator,
  pennsylvania: pennsylvaniaCalculator,
};

/**
 * Get the state tax calculator for a given state slug.
 * Returns null if no calculator is available for the state.
 *
 * @param slug - The state slug (e.g., "california", "texas")
 */
export function getStateCalculator(slug: string): StateTaxCalculator | null {
  return STATE_CALCULATORS[slug] ?? null;
}

// ============================================================================
// Local Tax Extraction Helper
// ============================================================================

/**
 * Extract local tax amounts from state tax breakdown lines.
 * Looks for lines labeled with "NYC Tax:" or "Local EIT" which represent
 * local/city taxes separate from the state income tax.
 */
function extractLocalTax(stateResult: StateTaxResult): number {
  let localTax = 0;
  for (const line of stateResult.breakdownLines) {
    if (line.label.includes("NYC Tax:") || line.label.includes("Local EIT")) {
      localTax += line.amount;
    }
  }
  return localTax;
}

// ============================================================================
// Main Paycheck Calculation
// ============================================================================

/**
 * Calculate a full paycheck breakdown.
 *
 * Steps:
 * 1. Convert gross pay to annual based on pay frequency
 * 2. Calculate pre-tax deductions (401k, HSA, other)
 * 3. Calculate federal taxable income (annual gross - pre-tax deductions - standard deduction)
 * 4. Calculate federal tax using progressive brackets
 * 5. Calculate FICA (SS + Medicare + additional Medicare)
 * 6. Calculate state tax using the appropriate state calculator
 * 7. Calculate per-period amounts
 * 8. Compute effective tax rate and marginal bracket
 * 9. Return full CalculatorResult
 *
 * @param input - Calculator input with gross pay, frequency, deductions, filing status
 * @param stateConfig - State tax configuration (slug, settings, etc.)
 * @param userStateOptions - Optional user-provided state options (e.g., nycResident, paLocalEitRate)
 * @returns Complete calculator result with annual, per-period, and breakdown data
 */
export function calculatePaycheck(
  input: CalculatorInput,
  stateConfig: StateTaxConfig,
  userStateOptions?: Record<string, unknown>
): CalculatorResult {
  // -----------------------------------------------------------------------
  // Step 1: Convert gross pay to annual
  // -----------------------------------------------------------------------
  let annualGrossPay: number;

  if (input.payFrequency === "hourly") {
    const hoursPerWeek = input.hoursPerWeek ?? 40;
    annualGrossPay = input.grossPay * hoursPerWeek * 52;
  } else {
    const periods = PERIODS_PER_YEAR[input.payFrequency];
    annualGrossPay = input.grossPay * periods;
  }

  // -----------------------------------------------------------------------
  // Step 2: Calculate pre-tax deductions (annual)
  // -----------------------------------------------------------------------
  let retirement401kAnnual: number;

  if (input.retirement401kType === "percent") {
    retirement401kAnnual = annualGrossPay * (input.retirement401kPercent / 100);
  } else {
    // For "fixed" type, the input could be per-period or annual
    // Assume it's annual for fixed type
    retirement401kAnnual = input.retirement401kFixed;
  }

  const totalPreTaxDeductions =
    retirement401kAnnual + input.hsaContribution + input.otherPreTax;

  // -----------------------------------------------------------------------
  // Step 3: Calculate federal taxable income
  // -----------------------------------------------------------------------
  const standardDeduction =
    federalTaxConfig2026.standardDeduction[input.filingStatus];
  const federalTaxableIncome = Math.max(
    0,
    annualGrossPay - totalPreTaxDeductions - standardDeduction
  );

  // -----------------------------------------------------------------------
  // Step 4: Calculate federal income tax
  // -----------------------------------------------------------------------
  const federalResult = calculateFederalTax(
    federalTaxableIncome,
    input.filingStatus
  );

  // -----------------------------------------------------------------------
  // Step 5: Calculate FICA (on gross wages, not taxable income)
  // -----------------------------------------------------------------------
  const ficaResult = calculateFICA(annualGrossPay, input.filingStatus);

  // -----------------------------------------------------------------------
  // Step 6: Calculate state tax
  // -----------------------------------------------------------------------
  const stateCalculator = getStateCalculator(stateConfig.slug);
  const stateOptions: Record<string, unknown> = {};

  // Pass through state config settings as options
  if (stateConfig.settings) {
    if (stateConfig.settings.sdiRate !== undefined) {
      stateOptions.sdiRate = stateConfig.settings.sdiRate;
    }
    if (stateConfig.settings.sdiWageBase !== undefined) {
      stateOptions.sdiWageBase = stateConfig.settings.sdiWageBase;
    }
    if (stateConfig.settings.mentalHealthRate !== undefined) {
      stateOptions.mentalHealthRate = stateConfig.settings.mentalHealthRate;
    }
    if (stateConfig.settings.mentalHealthThreshold !== undefined) {
      stateOptions.mentalHealthThreshold = stateConfig.settings.mentalHealthThreshold;
    }
    if (stateConfig.settings.nycBrackets !== undefined) {
      stateOptions.nycBrackets = stateConfig.settings.nycBrackets;
    }
    if (stateConfig.settings.defaultLocalEitRate !== undefined) {
      stateOptions.paLocalEitRate = stateConfig.settings.defaultLocalEitRate;
    }
  }

  // Merge user-provided state options (e.g., nycResident, paLocalEitRate override)
  if (userStateOptions) {
    Object.assign(stateOptions, userStateOptions);
  }

  let stateResult: StateTaxResult;

  if (stateCalculator) {
    stateResult = stateCalculator.calculateStateTax(
      annualGrossPay,
      input.filingStatus,
      stateOptions as Parameters<StateTaxCalculator["calculateStateTax"]>[2]
    );
  } else {
    // No calculator available for this state — assume no income tax
    stateResult = {
      tax: 0,
      breakdownLines: [
        {
          label: `${stateConfig.name} State Income Tax`,
          amount: 0,
        },
      ],
      effectiveRate: 0,
      marginalRate: 0,
    };
  }

  // Split state and local taxes
  const localTax = extractLocalTax(stateResult);
  const stateIncomeTax = stateResult.tax - localTax;

  // -----------------------------------------------------------------------
  // Step 7: Calculate per-period amounts
  // -----------------------------------------------------------------------
  const periods =
    input.payFrequency === "hourly"
      ? (input.hoursPerWeek ?? 40) * 52
      : PERIODS_PER_YEAR[input.payFrequency];

  // -----------------------------------------------------------------------
  // Step 8: Compute totals and rates
  // -----------------------------------------------------------------------
  const totalAnnualDeductions =
    federalResult.tax +
    ficaResult.socialSecurity +
    ficaResult.medicare +
    ficaResult.medicareAdditional +
    stateResult.tax +
    totalPreTaxDeductions +
    input.postTaxDeductions;

  const annualTakeHome = Math.max(0, annualGrossPay - totalAnnualDeductions);

  const effectiveTaxRate =
    annualGrossPay > 0
      ? Math.round(
          ((federalResult.tax +
            ficaResult.socialSecurity +
            ficaResult.medicare +
            ficaResult.medicareAdditional +
            stateResult.tax) /
            annualGrossPay) *
            10000
        ) / 10000
      : 0;

  // Marginal bracket: highest bracket rate hit for federal
  const marginalBracket = federalResult.marginalRate;

  // -----------------------------------------------------------------------
  // Step 9: Compute marginal FICA rate
  // -----------------------------------------------------------------------
  let ficaMarginal = 0;
  if (annualGrossPay < federalTaxConfig2026.socialSecurityWageBase) {
    ficaMarginal += federalTaxConfig2026.socialSecurityRate;
  }
  ficaMarginal += federalTaxConfig2026.medicareRate;
  if (
    annualGrossPay >
    federalTaxConfig2026.medicareAdditionalThreshold[input.filingStatus]
  ) {
    ficaMarginal += federalTaxConfig2026.medicareAdditionalRate;
  }

  // -----------------------------------------------------------------------
  // Build breakdown lines
  // -----------------------------------------------------------------------
  const breakdownLines: TaxBreakdownLine[] = [
    { label: "Gross Pay", amount: annualGrossPay },
    { label: "Federal Income Tax", amount: -federalResult.tax },
    ...ficaResult.breakdownLines.map((l) => ({
      ...l,
      amount: -l.amount,
    })),
    ...stateResult.breakdownLines.map((l) => ({
      ...l,
      // Keep the standard deduction line positive (it's a reduction, not a tax)
      amount: l.label.includes("Standard Deduction") ? l.amount : -l.amount,
    })),
    {
      label: "401(k) Contribution",
      amount: -retirement401kAnnual,
    },
    { label: "HSA Contribution", amount: -input.hsaContribution },
    { label: "Other Pre-Tax Deductions", amount: -input.otherPreTax },
    { label: "Post-Tax Deductions", amount: -input.postTaxDeductions },
    { label: "Net Take-Home Pay", amount: annualTakeHome },
  ];

  // -----------------------------------------------------------------------
  // Return full result
  // -----------------------------------------------------------------------
  return {
    annual: {
      grossPay: annualGrossPay,
      federalTax: federalResult.tax,
      socialSecurity: ficaResult.socialSecurity,
      medicare: ficaResult.medicare,
      medicareAdditional: ficaResult.medicareAdditional,
      stateTax: stateIncomeTax,
      localTax,
      preTaxDeductions: totalPreTaxDeductions,
      postTaxDeductions: input.postTaxDeductions,
      takeHomePay: annualTakeHome,
      effectiveTaxRate,
      marginalBracket,
    },
    perPeriod: {
      grossPay: Math.round((annualGrossPay / periods) * 100) / 100,
      federalTax: Math.round((federalResult.tax / periods) * 100) / 100,
      socialSecurity: Math.round((ficaResult.socialSecurity / periods) * 100) / 100,
      medicare: Math.round((ficaResult.medicare / periods) * 100) / 100,
      medicareAdditional:
        Math.round((ficaResult.medicareAdditional / periods) * 100) / 100,
      stateTax: Math.round((stateIncomeTax / periods) * 100) / 100,
      localTax: Math.round((localTax / periods) * 100) / 100,
      preTaxDeductions: Math.round((totalPreTaxDeductions / periods) * 100) / 100,
      postTaxDeductions: Math.round((input.postTaxDeductions / periods) * 100) / 100,
      takeHomePay: Math.round((annualTakeHome / periods) * 100) / 100,
    },
    breakdownLines,
    stateBreakdown: stateResult.breakdownLines,
    marginalInfo: {
      federal: federalResult.marginalRate,
      state: stateResult.marginalRate,
      fica: ficaMarginal,
    },
  };
}