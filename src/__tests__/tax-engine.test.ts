// ============================================================================
// CalcForge - Tax Engine Comprehensive Test Suite (2026 Tax Refresh)
// ============================================================================

import { describe, it, expect } from "bun:test";
import { calculateFederalTax, calculateFICA } from "../lib/tax/federal";
import { calculatePaycheck } from "../lib/tax/index";
import { californiaCalculator } from "../lib/tax/states/california";
import { texasCalculator } from "../lib/tax/states/texas";
import { floridaCalculator } from "../lib/tax/states/florida";
import { newYorkCalculator } from "../lib/tax/states/new-york";
import { pennsylvaniaCalculator } from "../lib/tax/states/pennsylvania";
import { stateTaxConfig as caConfig } from "../../content/paycheck/california/data";
import { stateTaxConfig as txConfig } from "../../content/paycheck/texas/data";
import { stateTaxConfig as flConfig } from "../../content/paycheck/florida/data";
import { stateTaxConfig as nyConfig } from "../../content/paycheck/new-york/data";
import { stateTaxConfig as paConfig } from "../../content/paycheck/pennsylvania/data";
import type { CalculatorInput } from "../types/calculator";

// ============================================================================
// Helper: standard single $60k input with zero deductions
// ============================================================================

function makeInput(overrides: Partial<CalculatorInput> = {}): CalculatorInput {
  return {
    grossPay: 60000,
    payFrequency: "annual" as const,
    filingStatus: "single" as const,
    retirement401kPercent: 0,
    retirement401kType: "percent" as const,
    retirement401kFixed: 0,
    hsaContribution: 0,
    otherPreTax: 0,
    postTaxDeductions: 0,
    ...overrides,
  };
}

// ============================================================================
// 1. Federal Tax — Single Filer $44,300 Taxable Income
// ============================================================================
// Federal standard deduction (single, 2026): $16,100
// Taxable income passed directly: $44,300
// Brackets (single, 2026):
//   10% on $0 – $12,400          = $1,240.00
//   12% on $12,400 – $44,300     = $31,900 × 0.12 = $3,828.00
// Total federal tax = $5,068.00

describe("Federal Tax", () => {
  it("calculates federal tax for single filer with $44,300 taxable income", () => {
    const result = calculateFederalTax(44300, "single");
    expect(result.tax).toBeCloseTo(5068, 0);
  });

  it("has correct marginal rate of 12% for $44,300 taxable income", () => {
    const result = calculateFederalTax(44300, "single");
    expect(result.marginalRate).toBe(0.12);
  });

  it("produces correct breakdown lines for $44,300 taxable income", () => {
    const result = calculateFederalTax(44300, "single");
    expect(result.breakdownLines).toHaveLength(2);
    expect(result.breakdownLines[0].amount).toBeCloseTo(1240, 0);
    expect(result.breakdownLines[1].amount).toBeCloseTo(3828, 0);
  });
});

// ============================================================================
// 2. FICA for $60,000 Single
// ============================================================================
// SS: 6.2% × $60,000 = $3,720.00 (under $184,500 wage base)
// Medicare: 1.45% × $60,000 = $870.00
// Additional Medicare: $0 (under $200,000 threshold)
// Total FICA: $4,590.00

describe("FICA", () => {
  it("calculates Social Security tax for $60,000", () => {
    const result = calculateFICA(60000, "single");
    expect(result.socialSecurity).toBeCloseTo(3720, 0);
  });

  it("calculates Medicare tax for $60,000", () => {
    const result = calculateFICA(60000, "single");
    expect(result.medicare).toBeCloseTo(870, 0);
  });

  it("has zero Additional Medicare for $60,000 single", () => {
    const result = calculateFICA(60000, "single");
    expect(result.medicareAdditional).toBe(0);
  });

  it("has correct total FICA of $4,590 for $60,000 single", () => {
    const result = calculateFICA(60000, "single");
    const totalFica = result.socialSecurity + result.medicare + result.medicareAdditional;
    expect(totalFica).toBeCloseTo(4590, 0);
  });
});

// ============================================================================
// 3. California State Tax for $60,000 Single
// ============================================================================
// CA standard deduction (single, 2026): $5,706
// CA taxable income: $60,000 - $5,706 = $54,294
// CA brackets (single, 2026) — 9 brackets with new thresholds:
//   Using 2026 bracket thresholds, state income tax ≈ $1,759.34
// SDI: 1.3% × $60,000 = $780.00
// Total CA tax ≈ $2,539.34
// Marginal rate: 6% (taxable $54,294 falls in the 6% bracket: $42,391–$58,846)

describe("California State Tax", () => {
  it("returns positive state tax for $60,000 single", () => {
    const result = californiaCalculator.calculateStateTax(60000, "single", {});
    expect(result.tax).toBeGreaterThan(0);
  });

  it("includes SDI in the breakdown", () => {
    const result = californiaCalculator.calculateStateTax(60000, "single", {});
    const hasSdi = result.breakdownLines.some((line) => line.label.includes("SDI"));
    expect(hasSdi).toBe(true);
  });

  it("calculates total state tax close to $2,539", () => {
    const result = californiaCalculator.calculateStateTax(60000, "single", {});
    expect(result.tax).toBeCloseTo(2539, 0);
  });

  it("has correct marginal rate of 6% for $60,000 single", () => {
    const result = californiaCalculator.calculateStateTax(60000, "single", {});
    expect(result.marginalRate).toBe(0.06);
  });
});

// ============================================================================
// 4. Texas State Tax for $60,000 Single — No Income Tax
// ============================================================================

describe("Texas State Tax", () => {
  it("returns exactly 0 state tax for $60,000 single", () => {
    const result = texasCalculator.calculateStateTax(60000, "single", {});
    expect(result.tax).toBe(0);
  });

  it("returns zero marginal rate", () => {
    const result = texasCalculator.calculateStateTax(60000, "single", {});
    expect(result.marginalRate).toBe(0);
  });
});

// ============================================================================
// 5. Florida State Tax for $60,000 Single — No Income Tax
// ============================================================================

describe("Florida State Tax", () => {
  it("returns exactly 0 state tax for $60,000 single", () => {
    const result = floridaCalculator.calculateStateTax(60000, "single", {});
    expect(result.tax).toBe(0);
  });

  it("returns zero marginal rate", () => {
    const result = floridaCalculator.calculateStateTax(60000, "single", {});
    expect(result.marginalRate).toBe(0);
  });
});

// ============================================================================
// 6. New York State Tax for $60,000 Single
// ============================================================================
// NY standard deduction (single): $8,000
// NY taxable income: $60,000 - $8,000 = $52,000
// NY brackets (single, 2026) with updated rates (e.g., 4% → 3.9%):
//   NY state income tax ≈ $2,643
// PFL: 0.432% × $60,000 = $259.20 (capped at $411.91)
// DBL: 0.5% × $60,000 = $31.20 (capped at $31.20)
// Total NY tax (no NYC) ≈ $2,933.20
//
// NYC tax on $52,000 taxable income adds more on top.

describe("New York State Tax", () => {
  it("returns positive state tax for $60,000 single without NYC", () => {
    const result = newYorkCalculator.calculateStateTax(60000, "single", {});
    expect(result.tax).toBeGreaterThan(0);
  });

  it("calculates total tax close to $2,933 without NYC (includes PFL + DBL)", () => {
    const result = newYorkCalculator.calculateStateTax(60000, "single", {});
    expect(result.tax).toBeCloseTo(2933, 0);
  });

  it("includes PFL in the breakdown", () => {
    const result = newYorkCalculator.calculateStateTax(60000, "single", {});
    const hasPfl = result.breakdownLines.some((line) =>
      line.label.toLowerCase().includes("pfl") || line.label.toLowerCase().includes("paid family")
    );
    expect(hasPfl).toBe(true);
  });

  it("includes DBL in the breakdown", () => {
    const result = newYorkCalculator.calculateStateTax(60000, "single", {});
    const hasDbl = result.breakdownLines.some((line) =>
      line.label.toLowerCase().includes("dbl") || line.label.toLowerCase().includes("disability")
    );
    expect(hasDbl).toBe(true);
  });

  it("calculates higher tax with NYC resident flag", () => {
    const withoutNyc = newYorkCalculator.calculateStateTax(60000, "single", {});
    const withNyc = newYorkCalculator.calculateStateTax(60000, "single", {
      nycResident: true,
    });
    expect(withNyc.tax).toBeGreaterThan(withoutNyc.tax);
  });

  it("includes NYC Tax lines in breakdown when nycResident is true", () => {
    const result = newYorkCalculator.calculateStateTax(60000, "single", {
      nycResident: true,
    });
    const hasNycTax = result.breakdownLines.some((line) =>
      line.label.includes("NYC Tax:")
    );
    expect(hasNycTax).toBe(true);
  });

  it("calculates total tax close to $4,824 with NYC resident (state + PFL + DBL + NYC)", () => {
    const result = newYorkCalculator.calculateStateTax(60000, "single", {
      nycResident: true,
    });
    expect(result.tax).toBeCloseTo(4824, 0);
  });
});

// ============================================================================
// 7. Pennsylvania State Tax for $60,000 Single
// ============================================================================
// PA flat rate: 3.07% × $60,000 = $1,842.00
// Local EIT: 1.0% × $60,000 = $600.00
// PA SUI: 0.07% × $60,000 = $42.00
// Total = $2,484.00

describe("Pennsylvania State Tax", () => {
  it("calculates total tax of $2,484 (state + local EIT + SUI)", () => {
    const result = pennsylvaniaCalculator.calculateStateTax(60000, "single", {
      paLocalEitRate: 0.01,
    });
    expect(result.tax).toBeCloseTo(2484, 0);
  });

  it("adds $600 local EIT at 1% rate", () => {
    const result = pennsylvaniaCalculator.calculateStateTax(60000, "single", {
      paLocalEitRate: 0.01,
    });
    const localEitLine = result.breakdownLines.find((line) =>
      line.label.includes("Local EIT")
    );
    expect(localEitLine).toBeDefined();
    expect(localEitLine!.amount).toBeCloseTo(600, 0);
  });

  it("includes PA SUI deduction of $42 in the breakdown", () => {
    const result = pennsylvaniaCalculator.calculateStateTax(60000, "single", {
      paLocalEitRate: 0.01,
    });
    const suiLine = result.breakdownLines.find((line) =>
      line.label.toLowerCase().includes("sui") || line.label.toLowerCase().includes("unemployment")
    );
    expect(suiLine).toBeDefined();
    expect(suiLine!.amount).toBeCloseTo(42, 0);
  });

  it("has marginal rate of 4.14% (3.07% state + 1% local + 0.07% SUI)", () => {
    const result = pennsylvaniaCalculator.calculateStateTax(60000, "single", {
      paLocalEitRate: 0.01,
    });
    expect(result.marginalRate).toBeCloseTo(0.0414, 4);
  });

  it("returns state + SUI when local EIT rate is 0", () => {
    const result = pennsylvaniaCalculator.calculateStateTax(60000, "single", {
      paLocalEitRate: 0,
    });
    // State tax $1,842 + SUI $42 = $1,884
    expect(result.tax).toBeCloseTo(1884, 0);
    const localEitLine = result.breakdownLines.find((line) =>
      line.label.includes("Local EIT")
    );
    // When localTax is 0, the PA calculator does not push the line
    expect(localEitLine).toBeUndefined();
  });
});

// ============================================================================
// 8. Full Paycheck Calculation — Integration Tests for All 5 States
// ============================================================================
// For all states: grossPay=60000, payFrequency="annual", filingStatus="single",
// all deductions = 0
//
// Federal std deduction (single, 2026): $16,100
// Taxable: $60,000 - $16,100 = $43,900
// Federal tax = $5,020 (10% on $0-$12,400 + 12% on $12,400-$43,900)
// SS = $3,720, Medicare = $870, Add Medicare = $0
// FICA total = $4,590
//
// Per-state expected annual take-home (approximate):
//   CA: 60000 - 5020 - 3720 - 870 - 2539 = $47,851
//   TX: 60000 - 5020 - 3720 - 870 - 0    = $50,390
//   FL: 60000 - 5020 - 3720 - 870 - 0    = $50,390
//   NY: 60000 - 5020 - 3720 - 870 - 2933  = $47,457
//   PA: 60000 - 5020 - 3720 - 870 - 2484  = $47,906

describe("Full Paycheck Calculation — Integration", () => {
  const baseInput = makeInput();

  it("California: take-home > 0 and < gross", () => {
    const result = calculatePaycheck(baseInput, caConfig);
    expect(result.annual.takeHomePay).toBeGreaterThan(0);
    expect(result.annual.takeHomePay).toBeLessThan(60000);
    expect(result.annual.takeHomePay).toBeCloseTo(47851, 0);
  });

  it("Texas: take-home > 0 and < gross", () => {
    const result = calculatePaycheck(baseInput, txConfig);
    expect(result.annual.takeHomePay).toBeGreaterThan(0);
    expect(result.annual.takeHomePay).toBeLessThan(60000);
    expect(result.annual.takeHomePay).toBeCloseTo(50390, 0);
  });

  it("Florida: take-home > 0 and < gross", () => {
    const result = calculatePaycheck(baseInput, flConfig);
    expect(result.annual.takeHomePay).toBeGreaterThan(0);
    expect(result.annual.takeHomePay).toBeLessThan(60000);
    expect(result.annual.takeHomePay).toBeCloseTo(50390, 0);
  });

  it("New York: take-home > 0 and < gross", () => {
    const result = calculatePaycheck(baseInput, nyConfig);
    expect(result.annual.takeHomePay).toBeGreaterThan(0);
    expect(result.annual.takeHomePay).toBeLessThan(60000);
    expect(result.annual.takeHomePay).toBeCloseTo(47457, 0);
  });

  it("Pennsylvania: take-home > 0 and < gross", () => {
    const result = calculatePaycheck(baseInput, paConfig);
    expect(result.annual.takeHomePay).toBeGreaterThan(0);
    expect(result.annual.takeHomePay).toBeLessThan(60000);
    expect(result.annual.takeHomePay).toBeCloseTo(47906, 0);
  });

  it("TX and FL take-home is significantly higher than CA", () => {
    const caResult = calculatePaycheck(baseInput, caConfig);
    const txResult = calculatePaycheck(baseInput, txConfig);
    const flResult = calculatePaycheck(baseInput, flConfig);

    // TX and FL should be at least $2,000 more than CA
    const caDiff = txResult.annual.takeHomePay - caResult.annual.takeHomePay;
    const flDiff = flResult.annual.takeHomePay - caResult.annual.takeHomePay;
    expect(caDiff).toBeGreaterThan(2000);
    expect(flDiff).toBeGreaterThan(2000);
  });

  it("TX and FL take-home are nearly identical (both no state tax)", () => {
    const txResult = calculatePaycheck(baseInput, txConfig);
    const flResult = calculatePaycheck(baseInput, flConfig);
    expect(txResult.annual.takeHomePay).toBe(flResult.annual.takeHomePay);
  });

  it("all states have correct federal tax of $5,020", () => {
    const states = [caConfig, txConfig, flConfig, nyConfig, paConfig];
    for (const state of states) {
      const result = calculatePaycheck(baseInput, state);
      expect(result.annual.federalTax).toBeCloseTo(5020, 0);
    }
  });

  it("all states have correct FICA: SS=$3,720, Medicare=$870", () => {
    const states = [caConfig, txConfig, flConfig, nyConfig, paConfig];
    for (const state of states) {
      const result = calculatePaycheck(baseInput, state);
      expect(result.annual.socialSecurity).toBeCloseTo(3720, 0);
      expect(result.annual.medicare).toBeCloseTo(870, 0);
      expect(result.annual.medicareAdditional).toBe(0);
    }
  });
});

// ============================================================================
// 9. Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  it("$0 income → $0 taxes and $0 take-home", () => {
    const input = makeInput({ grossPay: 0 });
    const states = [caConfig, txConfig, flConfig, nyConfig, paConfig];

    for (const state of states) {
      const result = calculatePaycheck(input, state);
      expect(result.annual.federalTax).toBe(0);
      expect(result.annual.socialSecurity).toBe(0);
      expect(result.annual.medicare).toBe(0);
      expect(result.annual.medicareAdditional).toBe(0);
      expect(result.annual.stateTax).toBe(0);
      expect(result.annual.takeHomePay).toBe(0);
      expect(result.annual.effectiveTaxRate).toBe(0);
    }
  });

  it("$1,000,000 income hits all 7 federal brackets (marginal = 37%)", () => {
    const input = makeInput({ grossPay: 1000000 });
    const result = calculatePaycheck(input, txConfig); // TX for cleanest view

    // Federal marginal should be 37% (highest bracket)
    expect(result.marginalInfo.federal).toBe(0.37);

    // Federal tax should be substantial
    // Taxable: $1,000,000 - $16,100 = $983,900
    // Expected: ~$320,000 (exact calculation with 2026 brackets)
    expect(result.annual.federalTax).toBeCloseTo(320000, -3); // within $500

    // Take-home should be positive but much less than gross
    expect(result.annual.takeHomePay).toBeGreaterThan(0);
    expect(result.annual.takeHomePay).toBeLessThan(1000000);
  });

  it("$1,000,000 income in CA hits top CA bracket (marginal = 12.3%)", () => {
    const input = makeInput({ grossPay: 1000000 });
    const result = calculatePaycheck(input, caConfig);

    // CA marginal should be 12.3% (9th bracket, top bracket for 2026)
    expect(result.marginalInfo.state).toBe(0.123);

    // State tax should be substantial
    expect(result.annual.stateTax).toBeGreaterThan(50000);
  });

  it("bi-weekly per-period amounts = annual / 26", () => {
    // Calculate with annual frequency
    const annualInput = makeInput({ payFrequency: "annual", grossPay: 60000 });
    const annualResult = calculatePaycheck(annualInput, txConfig);

    // Calculate with bi-weekly frequency (same annual equivalent)
    const biWeeklyGross = 60000 / 26;
    const biWeeklyInput = makeInput({
      payFrequency: "bi_weekly",
      grossPay: biWeeklyGross,
    });
    const biWeeklyResult = calculatePaycheck(biWeeklyInput, txConfig);

    // Annual figures should match
    expect(biWeeklyResult.annual.takeHomePay).toBeCloseTo(
      annualResult.annual.takeHomePay,
      0
    );
    expect(biWeeklyResult.annual.grossPay).toBeCloseTo(
      annualResult.annual.grossPay,
      0
    );

    // Per-period take-home should be annual / 26
    expect(biWeeklyResult.perPeriod.takeHomePay).toBeCloseTo(
      annualResult.annual.takeHomePay / 26,
      0
    );

    // Per-period gross should be annual / 26
    expect(biWeeklyResult.perPeriod.grossPay).toBeCloseTo(
      annualResult.annual.grossPay / 26,
      0
    );
  });

  it("FICA is capped at SS wage base for high income", () => {
    const input = makeInput({ grossPay: 500000 });
    const result = calculatePaycheck(input, txConfig);

    // SS should be capped at wage base: $184,500 × 6.2% = $11,439.00
    expect(result.annual.socialSecurity).toBeCloseTo(11439, 0);

    // Medicare should be uncapped: $500,000 × 1.45% = $7,250
    expect(result.annual.medicare).toBeCloseTo(7250, 0);

    // Additional Medicare should kick in: ($500,000 - $200,000) × 0.9% = $2,700
    expect(result.annual.medicareAdditional).toBeCloseTo(2700, 0);
  });
});

// ============================================================================
// 10. Effective Tax Rate Calculation
// ============================================================================

describe("Effective Tax Rate", () => {
  it("California $60,000 single: effective rate between 15% and 25%", () => {
    const input = makeInput();
    const result = calculatePaycheck(input, caConfig);
    const rate = result.annual.effectiveTaxRate;
    expect(rate).toBeGreaterThan(0.15);
    expect(rate).toBeLessThan(0.25);
  });

  it("Texas $60,000 single: effective rate between 15% and 18% (federal + FICA only)", () => {
    const input = makeInput();
    const result = calculatePaycheck(input, txConfig);
    const rate = result.annual.effectiveTaxRate;
    // Federal $5,020 + FICA $4,590 = $9,610 / $60,000 = 16.02%
    expect(rate).toBeGreaterThan(0.15);
    expect(rate).toBeLessThan(0.18);
  });

  it("New York $60,000 single: effective rate between 15% and 25%", () => {
    const input = makeInput();
    const result = calculatePaycheck(input, nyConfig);
    const rate = result.annual.effectiveTaxRate;
    expect(rate).toBeGreaterThan(0.15);
    expect(rate).toBeLessThan(0.25);
  });

  it("Pennsylvania $60,000 single: effective rate between 15% and 25%", () => {
    const input = makeInput();
    const result = calculatePaycheck(input, paConfig);
    const rate = result.annual.effectiveTaxRate;
    expect(rate).toBeGreaterThan(0.15);
    expect(rate).toBeLessThan(0.25);
  });

  it("effective rate is 0 for $0 income", () => {
    const input = makeInput({ grossPay: 0 });
    const result = calculatePaycheck(input, txConfig);
    expect(result.annual.effectiveTaxRate).toBe(0);
  });

  it("higher income has higher effective rate", () => {
    const lowInput = makeInput({ grossPay: 30000 });
    const highInput = makeInput({ grossPay: 200000 });
    const lowResult = calculatePaycheck(lowInput, caConfig);
    const highResult = calculatePaycheck(highInput, caConfig);
    expect(highResult.annual.effectiveTaxRate).toBeGreaterThan(
      lowResult.annual.effectiveTaxRate
    );
  });
});