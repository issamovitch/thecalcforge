// ============================================================================
// CalcForge - Pennsylvania State Tax Calculator (2026)
// ============================================================================

import type {
  FilingStatus,
  StateTaxCalculator,
  StateTaxResult,
  StateTaxOptions,
  TaxBreakdownLine,
} from "@/types/calculator";

// ============================================================================
// 2026 Pennsylvania Tax Configuration
// Source: policyengine-us v1.771.2, parameter extraction 2025-07-15
// ============================================================================

/**
 * Pennsylvania flat income tax rate
 * Source: policyengine-us gov.states.pa.tax.income.rate
 * Verified: 2025-07-15
 */
const PA_FLAT_RATE = 0.0307; // 3.07%

// Pennsylvania has no standard deduction for state income tax purposes

/**
 * Pennsylvania Employee State Unemployment Insurance (SUI) contribution
 * Source: policyengine-us gov.states.pa.tax.payroll.unemployment.employee_rate
 * Rate: 0.07%
 * TODO: Verify official PA SUI wage base. policyengine-us provides a
 *       taxable_wage_base parameter of $10,000 but the PA SUI variable does
 *       not apply the cap in its calculation. We match PE behavior (no cap)
 *       for probe comparison consistency.
 * Verified: 2025-07-15
 */
const PA_SUI_RATE = 0.0007; // 0.07%

// ============================================================================
// Pennsylvania State Tax Calculator
// ============================================================================

export const pennsylvaniaCalculator: StateTaxCalculator = {
  calculateStateTax(
    annualGrossWages: number,
    _filingStatus: FilingStatus,
    options: StateTaxOptions
  ): StateTaxResult {
    const breakdownLines: TaxBreakdownLine[] = [];
    let totalTax = 0;
    let marginalRate = 0;

    // 1. State flat income tax (no standard deduction)
    const stateIncomeTax = Math.round(annualGrossWages * PA_FLAT_RATE * 100) / 100;

    breakdownLines.push({
      label: `PA State Income Tax (${(PA_FLAT_RATE * 100).toFixed(2)}% flat rate)`,
      amount: stateIncomeTax,
      rate: PA_FLAT_RATE,
    });

    totalTax += stateIncomeTax;
    marginalRate = PA_FLAT_RATE;

    // 2. Local Earned Income Tax (EIT)
    const localEitRate = options.paLocalEitRate ?? 0.01; // Default 1%
    const localTax = Math.round(annualGrossWages * localEitRate * 100) / 100;

    if (localTax > 0) {
      breakdownLines.push({
        label: `Local EIT (${(localEitRate * 100).toFixed(2)}%)`,
        amount: localTax,
        rate: localEitRate,
      });

      totalTax += localTax;
      marginalRate += localEitRate;
    }

    // 3. PA Employee SUI (State Unemployment Insurance) contribution
    const suiTax = Math.round(annualGrossWages * PA_SUI_RATE * 100) / 100;

    if (suiTax > 0) {
      breakdownLines.push({
        label: `PA Employee SUI (${(PA_SUI_RATE * 100).toFixed(2)}%)`,
        amount: suiTax,
        rate: PA_SUI_RATE,
      });

      totalTax += suiTax;
      marginalRate += PA_SUI_RATE;
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