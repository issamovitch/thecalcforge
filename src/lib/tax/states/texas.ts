// ============================================================================
// CalcForge - Texas State Tax Calculator (2026)
// ============================================================================

import type {
  FilingStatus,
  StateTaxCalculator,
  StateTaxResult,
  StateTaxOptions,
} from "@/types/calculator";

// ============================================================================
// Texas has no state income tax
// ============================================================================

export const texasCalculator: StateTaxCalculator = {
  calculateStateTax(
    _annualGrossWages: number,
    _filingStatus: FilingStatus,
    _options: StateTaxOptions
  ): StateTaxResult {
    return {
      tax: 0,
      breakdownLines: [
        {
          label: "Texas State Income Tax",
          amount: 0,
        },
        {
          label: "Note: Texas does not levy a state income tax",
          amount: 0,
        },
      ],
      effectiveRate: 0,
      marginalRate: 0,
    };
  },
};