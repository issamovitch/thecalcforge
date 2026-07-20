/**
 * Emergency Fund Calculator — shared math engine.
 *
 * Used by:
 *   - src/components/calculators/EmergencyFundCalculator.tsx (live client math)
 *   - src/app/savings/emergency-fund-calculator/page.tsx    (server-rendered
 *     numbers in the content sections and worked examples)
 *
 * The target emergency fund is simply:
 *   target = monthlyEssentialExpenses × monthsOfCoverage
 *
 * The time-to-reach calculation reuses the exact same closed-form solve-for-n
 * math as the Savings Goal Calculator (monthly compounding, exact to the
 * month, handles rate 0 cleanly). See src/lib/savings-goal-math.ts.
 *
 * All math is exact to the cent for the worked examples in the page content.
 */

import { solveTime, type SolveTimeResult } from "./savings-goal-math";

export interface ExpenseLine {
  id: string;
  label: string;
  amount: number;
}

export interface EmergencyFundInputs {
  /** Total monthly essential expenses (housing, utilities, food, etc.). */
  monthlyExpenses: number;
  /** Months of coverage the fund should bridge (typically 3-12). */
  months: number;
  /** Emergency savings already on hand. */
  currentSavings: number;
  /** Amount added to the fund each month. */
  monthlySavings: number;
  /** Annual savings rate (decimal, e.g. 0.04 for 4%). */
  annualRate: number;
}

export interface EmergencyFundResult {
  /** Target fund size = monthlyExpenses × months. */
  target: number;
  /** Remaining gap to the target, floored at $0. */
  gap: number;
  /** Surplus when current savings exceed the target, $0 otherwise. */
  surplus: number;
  /** True when current savings already meet or exceed the target. */
  alreadyFunded: boolean;
  /** Whole months until the fund reaches the target. Null if unreachable. */
  months: number | null;
  /** Whole years component (months // 12). */
  years: number;
  /** Remaining whole months (months % 12). */
  remainingMonths: number;
  /** Calendar date the fund is reached. Null if never. */
  targetDate: Date | null;
  /** Projected balance in the month the target is reached. */
  finalAmount: number;
  /** Total principal contributed by the time the target is reached. */
  totalContributed: number;
  /** Investment growth by the time the target is reached. */
  growthFromReturns: number;
  /** Human-readable explanation when months is null. */
  reason: string;
  /** Target at 3 months of coverage (same expenses). */
  target3: number;
  /** Target at 6 months of coverage (same expenses). */
  target6: number;
  /** Target at 12 months of coverage (same expenses). */
  target12: number;
}

/**
 * Compute the emergency fund target, gap, and time to reach.
 *
 * The time-to-reach math delegates to `solveTime` from savings-goal-math so
 * the two calculators share identical monthly-compounding conventions and
 * edge-case handling (rate 0, contribution 0, current 0).
 */
export function calculateEmergencyFund(
  inputs: EmergencyFundInputs,
  today: Date = new Date()
): EmergencyFundResult {
  const target = inputs.monthlyExpenses * inputs.months;
  const alreadyFunded = inputs.currentSavings >= target;
  const gap = Math.max(0, target - inputs.currentSavings);
  const surplus = Math.max(0, inputs.currentSavings - target);

  const target3 = inputs.monthlyExpenses * 3;
  const target6 = inputs.monthlyExpenses * 6;
  const target12 = inputs.monthlyExpenses * 12;

  if (alreadyFunded) {
    return {
      target,
      gap: 0,
      surplus,
      alreadyFunded: true,
      months: 0,
      years: 0,
      remainingMonths: 0,
      targetDate: today,
      finalAmount: inputs.currentSavings,
      totalContributed: inputs.currentSavings,
      growthFromReturns: 0,
      reason: "Your current savings already cover your target emergency fund.",
      target3,
      target6,
      target12,
    };
  }

  const t: SolveTimeResult = solveTime(
    target,
    inputs.currentSavings,
    inputs.monthlySavings,
    inputs.annualRate,
    today
  );

  return {
    target,
    gap,
    surplus: 0,
    alreadyFunded: false,
    months: t.months,
    years: t.years,
    remainingMonths: t.remainingMonths,
    targetDate: t.targetDate,
    finalAmount: t.finalAmount,
    totalContributed: t.totalContributed,
    growthFromReturns: t.growthFromReturns,
    reason: t.reason,
    target3,
    target6,
    target12,
  };
}

/* ─── Default expense lines (sum to the default $3,500 total) ─── */

export const DEFAULT_EXPENSE_LINES: ExpenseLine[] = [
  { id: "housing", label: "Housing (rent or mortgage)", amount: 1400 },
  { id: "utilities", label: "Utilities", amount: 250 },
  { id: "food", label: "Food and groceries", amount: 600 },
  { id: "transport", label: "Transportation", amount: 300 },
  { id: "insurance", label: "Insurance", amount: 250 },
  { id: "debts", label: "Minimum debt payments", amount: 700 },
];
