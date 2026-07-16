// ============================================================================
// CalcForge - Florida State Tax Calculator (2026)
// ============================================================================

import type {
  FilingStatus,
  StateTaxCalculator,
  StateTaxResult,
  StateTaxOptions,
} from "@/types/calculator";

// ============================================================================
// Florida has no state income tax
// ============================================================================

export const floridaCalculator: StateTaxCalculator = {
  calculateStateTax(
    _annualGrossWages: number,
    _filingStatus: FilingStatus,
    _options: StateTaxOptions
  ): StateTaxResult {
    return {
      tax: 0,
      breakdownLines: [
        {
          label: "Florida State Income Tax",
          amount: 0,
        },
        {
          label: "Note: Florida does not levy a state income tax",
          amount: 0,
        },
      ],
      effectiveRate: 0,
      marginalRate: 0,
    };
  },
};