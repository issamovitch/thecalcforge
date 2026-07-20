/**
 * Savings Goal Calculator — shared math engine.
 *
 * Used by:
 *   - src/components/calculators/SavingsGoalCalculator.tsx (live client math)
 *   - src/app/savings/savings-goal-calculator/page.tsx      (server-rendered
 *     numbers in the content sections and worked examples)
 *
 * Both solve directions use monthly compounding:
 *   FV = current * (1+i)^n + monthly * ((1+i)^n - 1) / i
 * where i = annualRate / 12 and n = number of months.
 *
 * Tab 1 (How much per month) solves for `monthly`.
 * Tab 2 (How long will it take) solves for `n`.
 *
 * All math is exact to the cent for the worked examples in the page content.
 */

export interface SolveMonthlyResult {
  /** Required monthly contribution to reach the goal. */
  monthlyContribution: number;
  /** Current savings plus every monthly contribution over the term. */
  totalContributed: number;
  /** Final amount minus total contributed (i.e. investment growth). */
  growthFromReturns: number;
  /** Projected balance at the end of the term. */
  finalAmount: number;
  /** True if current savings alone (with growth) already reach the goal. */
  alreadyReached: boolean;
}

export interface SolveTimeResult {
  /** Whole months until the balance first reaches the goal. Null if never. */
  months: number | null;
  /** Whole years component (months // 12). */
  years: number;
  /** Remaining whole months (months % 12). */
  remainingMonths: number;
  /** Total principal contributed by the time the goal is reached. */
  totalContributed: number;
  /** Investment growth by the time the goal is reached. */
  growthFromReturns: number;
  /** Projected balance in the month the goal is reached. */
  finalAmount: number;
  /** Calendar date the goal is reached. Null if never. */
  targetDate: Date | null;
  /** Human-readable explanation when months is null. */
  reason: string;
}

/**
 * Future value of a starting balance plus a level monthly contribution,
 * compounded monthly, after `months` periods.
 */
export function futureValue(
  current: number,
  monthly: number,
  annualRate: number,
  months: number
): number {
  const i = annualRate / 12;
  if (i === 0) {
    return current + monthly * months;
  }
  const factor = Math.pow(1 + i, months);
  return current * factor + (monthly * (factor - 1)) / i;
}

/**
 * Tab 1 — solve for the level monthly contribution required to reach `goal`
 * in `years` years, given `current` savings and `annualRate`.
 *
 * Closed form (i > 0):
 *   M = (goal - current * (1+i)^n) * i / ((1+i)^n - 1)
 *
 * With i = 0 it degenerates to simple division: M = (goal - current) / n.
 */
export function solveMonthly(
  goal: number,
  current: number,
  annualRate: number,
  years: number
): SolveMonthlyResult {
  const months = Math.round(years * 12);
  const i = annualRate / 12;

  // Project current savings forward with growth.
  const currentGrown =
    i === 0 ? current : current * Math.pow(1 + i, months);

  if (currentGrown >= goal) {
    return {
      monthlyContribution: 0,
      totalContributed: current,
      growthFromReturns: currentGrown - current,
      finalAmount: currentGrown,
      alreadyReached: true,
    };
  }

  const needed = goal - currentGrown;
  let monthlyContribution: number;
  if (i === 0) {
    monthlyContribution = months > 0 ? needed / months : 0;
  } else {
    const factor = Math.pow(1 + i, months);
    monthlyContribution = (needed * i) / (factor - 1);
  }
  if (monthlyContribution < 0) monthlyContribution = 0;

  const finalAmount = futureValue(current, monthlyContribution, annualRate, months);
  const totalContributed = current + monthlyContribution * months;
  const growthFromReturns = finalAmount - totalContributed;

  return {
    monthlyContribution,
    totalContributed,
    growthFromReturns,
    finalAmount,
    alreadyReached: false,
  };
}

/**
 * Tab 2 — solve for the number of whole months until the balance first
 * reaches `goal`, given `current` savings, `monthlyContribution`, and
 * `annualRate`. Returns null months with a reason if the goal is unreachable.
 *
 * Closed form (i > 0, M > 0):
 *   (1+i)^n = (goal + M/i) / (current + M/i)
 *   n = ln(ratio) / ln(1 + i)
 */
export function solveTime(
  goal: number,
  current: number,
  monthlyContribution: number,
  annualRate: number,
  today: Date = new Date()
): SolveTimeResult {
  // Already at or above the goal.
  if (current >= goal) {
    return {
      months: 0,
      years: 0,
      remainingMonths: 0,
      totalContributed: current,
      growthFromReturns: 0,
      finalAmount: current,
      targetDate: today,
      reason: "You have already reached your goal.",
    };
  }

  const i = annualRate / 12;

  // 0% return: balance only grows via contributions.
  if (i === 0) {
    if (monthlyContribution <= 0) {
      return {
        months: null,
        years: 0,
        remainingMonths: 0,
        totalContributed: current,
        growthFromReturns: 0,
        finalAmount: current,
        targetDate: null,
        reason:
          "With a 0% return and no monthly contribution, your balance will never grow, so the goal is unreachable.",
      };
    }
    const n = Math.ceil((goal - current) / monthlyContribution);
    const finalAmount = current + monthlyContribution * n;
    return {
      months: n,
      years: Math.floor(n / 12),
      remainingMonths: n % 12,
      totalContributed: current + monthlyContribution * n,
      growthFromReturns: 0,
      finalAmount,
      targetDate: addMonths(today, n),
      reason: "",
    };
  }

  // i > 0, M = 0: depends on current > 0 (current grows geometrically).
  if (monthlyContribution <= 0) {
    if (current <= 0) {
      return {
        months: null,
        years: 0,
        remainingMonths: 0,
        totalContributed: 0,
        growthFromReturns: 0,
        finalAmount: 0,
        targetDate: null,
        reason:
          "With no current savings and no monthly contribution, your balance will never grow, so the goal is unreachable.",
      };
    }
    const n = Math.ceil(Math.log(goal / current) / Math.log(1 + i));
    const finalAmount = futureValue(current, 0, annualRate, n);
    return {
      months: n,
      years: Math.floor(n / 12),
      remainingMonths: n % 12,
      totalContributed: current,
      growthFromReturns: finalAmount - current,
      finalAmount,
      targetDate: addMonths(today, n),
      reason: "",
    };
  }

  // General case: i > 0, M > 0.
  // (1+i)^n = (goal + M/i) / (current + M/i)
  const B = monthlyContribution / i;
  const numerator = goal + B;
  const denominator = current + B;
  if (denominator <= 0) {
    return {
      months: null,
      years: 0,
      remainingMonths: 0,
      totalContributed: current,
      growthFromReturns: 0,
      finalAmount: current,
      targetDate: null,
      reason: "Cannot reach the goal with the given inputs.",
    };
  }
  const ratio = numerator / denominator;
  if (ratio <= 1) {
    // Already at goal — guarded above, but defensive.
    return {
      months: 0,
      years: 0,
      remainingMonths: 0,
      totalContributed: current,
      growthFromReturns: 0,
      finalAmount: current,
      targetDate: today,
      reason: "You have already reached your goal.",
    };
  }
  const nExact = Math.log(ratio) / Math.log(1 + i);
  // Use ceil with a tiny epsilon to absorb floating-point noise, then verify
  // by computing the actual FV. If FV is still short of goal, bump by one.
  let n = Math.ceil(nExact - 1e-9);
  let finalAmount = futureValue(current, monthlyContribution, annualRate, n);
  if (finalAmount < goal) {
    n += 1;
    finalAmount = futureValue(current, monthlyContribution, annualRate, n);
  }
  const totalContributed = current + monthlyContribution * n;
  return {
    months: n,
    years: Math.floor(n / 12),
    remainingMonths: n % 12,
    totalContributed,
    growthFromReturns: finalAmount - totalContributed,
    finalAmount,
    targetDate: addMonths(today, n),
    reason: "",
  };
}

/**
 * Add `months` calendar months to `date`, clamping the day to month-end when
 * the target month is shorter (e.g. Jan 31 + 1 month → Feb 28/29).
 */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) {
    d.setDate(0); // roll back to last day of previous month
  }
  return d;
}
