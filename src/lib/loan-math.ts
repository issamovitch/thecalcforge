// ── Types ────────────────────────────────────────────────────────────────────

export interface LoanInputs {
  loanAmount: number;
  apr: number;
  termMonths: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  schedule: AmortizationRow[];
}

export interface EarlyPayoffResult {
  result: LoanResult;
  baseResult: LoanResult;
  monthsSaved: number;
  interestSaved: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const r2 = (n: number): number => Math.round(n * 100) / 100;

function emptyResult(): LoanResult {
  return { monthlyPayment: 0, totalInterest: 0, totalCost: 0, schedule: [] };
}

// ── Core calculation ─────────────────────────────────────────────────────────

export function calculateLoan(inputs: LoanInputs): LoanResult {
  const { loanAmount, apr, termMonths } = inputs;

  // Validation
  if (loanAmount <= 0 || apr < 0 || termMonths <= 0) {
    return emptyResult();
  }

  const monthlyRate = apr / 100 / 12;

  // Step 1–2: compute monthly payment at full precision, then round
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
  }
  const roundedMonthly = r2(monthlyPayment);

  // Step 4: amortization loop using the ROUNDED payment
  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    const principal = roundedMonthly - interest;

    if (principal >= balance || month === termMonths) {
      // Final month – absorb rounding drift, force balance to 0
      const lastPrincipal = balance;
      const lastInterest = interest;
      const lastPayment = lastPrincipal + lastInterest;

      schedule.push({
        month,
        payment: r2(lastPayment),
        principal: r2(lastPrincipal),
        interest: r2(lastInterest),
        balance: 0,
      });
      break;
    }

    balance -= principal;

    schedule.push({
      month,
      payment: r2(roundedMonthly),
      principal: r2(principal),
      interest: r2(interest),
      balance: r2(balance),
    });
  }

  // Step 5–6: totals derived from rounded row data
  const totalCost = r2(schedule.reduce((sum, row) => sum + row.payment, 0));
  const totalInterest = r2(totalCost - loanAmount);

  return {
    monthlyPayment: roundedMonthly,
    totalInterest,
    totalCost,
    schedule,
  };
}

// ── Early payoff ─────────────────────────────────────────────────────────────

export function calculateEarlyPayoff(
  baseInputs: LoanInputs,
  extraMonthly: number,
  startFromMonth: number,
): EarlyPayoffResult {
  // Edge case: no extra payment → identical to base
  if (extraMonthly <= 0) {
    const baseResult = calculateLoan(baseInputs);
    return {
      result: baseResult,
      baseResult,
      monthsSaved: 0,
      interestSaved: 0,
    };
  }

  const baseResult = calculateLoan(baseInputs);
  const { loanAmount, apr, termMonths } = baseInputs;

  if (loanAmount <= 0 || apr < 0 || termMonths <= 0) {
    return {
      result: emptyResult(),
      baseResult,
      monthsSaved: 0,
      interestSaved: 0,
    };
  }

  const monthlyRate = apr / 100 / 12;

  // Base rounded monthly payment (same formula as calculateLoan)
  let baseMonthly: number;
  if (monthlyRate === 0) {
    baseMonthly = loanAmount / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    baseMonthly = (loanAmount * monthlyRate * factor) / (factor - 1);
  }
  const roundedBaseMonthly = r2(baseMonthly);

  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    const isEarlyStart = month >= startFromMonth;
    const extra = isEarlyStart ? extraMonthly : 0;
    const totalPayment = roundedBaseMonthly + extra;

    const principal = totalPayment - interest;

    if (principal >= balance || month === termMonths) {
      // Final month – force balance to 0
      const lastPrincipal = balance;
      const lastPayment = lastPrincipal + interest;
      schedule.push({
        month,
        payment: r2(lastPayment),
        principal: r2(lastPrincipal),
        interest: r2(interest),
        balance: 0,
      });
      break;
    }

    balance -= principal;

    schedule.push({
      month,
      payment: r2(totalPayment),
      principal: r2(principal),
      interest: r2(interest),
      balance: r2(balance),
    });
  }

  const totalCost = r2(schedule.reduce((sum, row) => sum + row.payment, 0));
  const totalInterest = r2(totalCost - loanAmount);

  const result: LoanResult = {
    monthlyPayment: roundedBaseMonthly,
    totalInterest,
    totalCost,
    schedule,
  };

  const monthsSaved = baseResult.schedule.length - schedule.length;
  const interestSaved = r2(baseResult.totalInterest - totalInterest);

  return {
    result,
    baseResult,
    monthsSaved,
    interestSaved,
  };
}

// ── Florida title-loan interest (Fla. Stat. 537.011, marginal tiers) ─────────

export interface FloridaTitleLoanResult {
  /** Monthly interest charge for one 30-day period */
  monthlyInterest: number;
  /** Blended effective annual rate, as a percentage */
  blendedAnnualRate: number;
  /** Total amount due to reclaim title after one 30-day period */
  totalRepayment: number;
  /** Per-tier interest breakdown for transparency */
  tiers: { cap: number; rate: number; portion: number; interest: number }[];
}

/**
 * Computes the statutory maximum interest on a Florida title loan
 * using the marginal-tier system in Fla. Stat. § 537.011.
 *
 * Tiers (per annum, applied as simple interest per month):
 *   - 30 % p.a. on the first $2,000
 *   - 24 % p.a. on the portion $2,000 – $3,000
 *   - 18 % p.a. on the portion above $3,000
 *
 * Florida title loans are single-payment instruments with a 30-day
 * maturity; the result reflects one period, not an amortized schedule.
 */
export function calculateFloridaTitleLoan(
  loanAmount: number,
): FloridaTitleLoanResult {
  let monthlyInterest = 0;
  const bracketStarts = [0, 2000, 3000];
  const rates = [30, 24, 18];
  const tiers: FloridaTitleLoanResult["tiers"] = [];

  for (let i = 0; i < 3; i++) {
    const start = bracketStarts[i];
    const end =
      i === 2 ? loanAmount : Math.min(loanAmount, bracketStarts[i + 1]);
    const portion = Math.max(0, end - start);
    const interest = portion * (rates[i] / 100 / 12);
    monthlyInterest += interest;
    tiers.push({
      cap: i === 2 ? Infinity : bracketStarts[i + 1],
      rate: rates[i],
      portion: r2(portion),
      interest: r2(interest),
    });
  }

  const blendedAnnualRate =
    loanAmount > 0 ? (monthlyInterest * 12 / loanAmount) * 100 : 0;

  return {
    monthlyInterest: r2(monthlyInterest),
    blendedAnnualRate: r2(blendedAnnualRate),
    totalRepayment: r2(loanAmount + monthlyInterest),
    tiers,
  };
}

// ── Payday loan (single-payment flat-fee model) ─────────────────────────────

export interface PaydayLoanInputs {
  loanAmount: number;
  fee: number; // flat dollar fee (convert from per-$100 in the component)
  termDays: number;
}

export interface RolloverCost {
  /** Number of times the loan is rolled over */
  times: number;
  /** Cumulative fees paid (original + each rollover) */
  totalFees: number;
  /** Total amount repaid */
  totalRepayment: number;
  /** Total days from origination to final due date */
  totalDays: number;
}

export interface PaydayLoanResult {
  /** Total amount due (principal + fee) */
  totalRepayment: number;
  /** The finance charge (fee) */
  financeCharge: number;
  /** Annualized percentage rate */
  apr: number;
  /** Cost per $100 borrowed */
  costPerHundred: number;
  /** Projected costs if rolled over 1, 2, and 4 times */
  rollovers: RolloverCost[];
}

/**
 * Computes the cost and APR of a single-payment payday loan.
 *
 * APR formula: (fee / amount) / days × 365 × 100
 * This annualizes a short-term flat fee into a comparable rate.
 */
export function calculatePaydayLoan(
  inputs: PaydayLoanInputs,
): PaydayLoanResult {
  const { loanAmount, fee, termDays } = inputs;

  if (loanAmount <= 0 || fee < 0 || termDays <= 0) {
    return {
      totalRepayment: 0,
      financeCharge: 0,
      apr: 0,
      costPerHundred: 0,
      rollovers: [],
    };
  }

  const totalRepayment = loanAmount + fee;
  const apr = (fee / loanAmount / termDays) * 365 * 100;
  const costPerHundred = (fee / loanAmount) * 100;

  const rollovers: RolloverCost[] = [1, 2, 4].map((n) => ({
    times: n,
    totalFees: r2(fee * (n + 1)),
    totalRepayment: r2(loanAmount + fee * (n + 1)),
    totalDays: termDays * (n + 1),
  }));

  return {
    totalRepayment: r2(totalRepayment),
    financeCharge: r2(fee),
    apr: r2(apr),
    costPerHundred: r2(costPerHundred),
    rollovers,
  };
}

// ── Loan with extra payments (unified, replaces calculateEarlyPayoff for UI) ──

export interface LoanWithExtraInputs extends LoanInputs {
  extraMonthly?: number;
  extraStartMonth?: number;
}

export interface LoanWithExtraResult {
  /** Base schedule without extra payments */
  baseResult: LoanResult;
  /** Schedule with extra payments applied */
  result: LoanResult;
  /** Number of months shortened */
  monthsSaved: number;
  /** Interest saved compared to base */
  interestSaved: number;
  /** Month the loan is fully paid off */
  actualPayoffMonth: number;
}

/**
 * Computes an amortizing loan schedule with optional extra monthly payments
 * starting from a given month. Every calculator that supports early payoff
 * should use this single function.
 */
export function calculateLoanWithExtra(
  inputs: LoanWithExtraInputs,
): LoanWithExtraResult {
  const { loanAmount, apr, termMonths, extraMonthly = 0, extraStartMonth = 1 } =
    inputs;

  const baseResult = calculateLoan({ loanAmount, apr, termMonths });

  if (
    extraMonthly <= 0 ||
    loanAmount <= 0 ||
    apr < 0 ||
    termMonths <= 0
  ) {
    return {
      baseResult,
      result: baseResult,
      monthsSaved: 0,
      interestSaved: 0,
      actualPayoffMonth: baseResult.schedule.length,
    };
  }

  const monthlyRate = apr / 100 / 12;
  const basePayment = baseResult.monthlyPayment;

  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    const extra = month >= extraStartMonth ? extraMonthly : 0;
    const totalPayment = basePayment + extra;
    const principal = totalPayment - interest;

    if (principal >= balance || month === termMonths) {
      const lastPrincipal = balance;
      const lastPayment = lastPrincipal + interest;
      schedule.push({
        month,
        payment: r2(lastPayment),
        principal: r2(lastPrincipal),
        interest: r2(interest),
        balance: 0,
      });
      break;
    }

    balance -= principal;

    schedule.push({
      month,
      payment: r2(totalPayment),
      principal: r2(principal),
      interest: r2(interest),
      balance: r2(balance),
    });
  }

  const totalCost = r2(schedule.reduce((sum, row) => sum + row.payment, 0));
  const totalInterest = r2(totalCost - loanAmount);
  const actualPayoffMonth = schedule.length;
  const monthsSaved = baseResult.schedule.length - actualPayoffMonth;
  const interestSaved = r2(baseResult.totalInterest - totalInterest);

  const result: LoanResult = {
    monthlyPayment: basePayment,
    totalInterest,
    totalCost,
    schedule,
  };

  return { baseResult, result, monthsSaved, interestSaved, actualPayoffMonth };
}

// ── Equipment / balloon loan ────────────────────────────────────────────────

export interface BalloonLoanInputs {
  loanAmount: number;
  downPayment: number;
  balloonAmount: number;
  apr: number;
  termMonths: number;
}

export interface BalloonLoanResult {
  /** Amount actually financed after down payment */
  financedAmount: number;
  downPayment: number;
  balloonAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  /** Down payment + all monthly payments + balloon */
  totalCost: number;
  schedule: AmortizationRow[];
}

/**
 * Computes an equipment/balloon loan.
 *
 * Convention: n regular monthly payments, then the balloon is paid as a
 * separate lump sum after the final payment.
 *
 * Formula:
 *   M = [P - B / (1 + r)^n] * r / (1 - (1 + r)^-n)
 *
 * P = financed amount, B = balloon, r = APR/12, n = months.
 * The balloon is discounted to present value before subtracting from P.
 * After n payments of M, the remaining balance equals B (within rounding).
 *
 * If balloonAmount >= PV(financedAmount), the payment is zero and the
 * full amount is due at maturity.
 */
export function calculateBalloonLoan(
  inputs: BalloonLoanInputs,
): BalloonLoanResult {
  const { loanAmount, downPayment, balloonAmount, apr, termMonths } = inputs;

  const financedAmount = r2(loanAmount - downPayment);

  if (financedAmount <= 0 || apr < 0 || termMonths <= 0) {
    return {
      financedAmount: Math.max(0, financedAmount),
      downPayment: r2(downPayment),
      balloonAmount: r2(balloonAmount),
      monthlyPayment: 0,
      totalInterest: 0,
      totalCost: r2(downPayment),
      schedule: [],
    };
  }

  const monthlyRate = apr / 100 / 12;

  // Discount balloon to present value
  const pvBalloon = balloonAmount / Math.pow(1 + monthlyRate, termMonths);
  const amortizingPrincipal = Math.max(0, financedAmount - pvBalloon);

  // Monthly payment on the PV-adjusted amortizing portion
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = amortizingPrincipal > 0 ? amortizingPrincipal / termMonths : 0;
  } else if (amortizingPrincipal <= 0) {
    monthlyPayment = 0;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = (amortizingPrincipal * monthlyRate * factor) / (factor - 1);
  }
  const roundedMonthly = r2(monthlyPayment);

  // Build schedule: n rows of regular payments.
  // Keep internal balance at full precision to avoid cumulative rounding drift.
  const schedule: AmortizationRow[] = [];
  let balance = financedAmount;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyRate;
    const principal = roundedMonthly - interest;

    if (principal >= balance) {
      // Paid off before term (unusual with balloon, but handle it)
      schedule.push({
        month,
        payment: r2(balance + interest),
        principal: r2(balance),
        interest: r2(interest),
        balance: 0,
      });
      break;
    }

    balance -= principal;

    schedule.push({
      month,
      payment: r2(roundedMonthly),
      principal: r2(principal),
      interest: r2(interest),
      balance: r2(balance),
    });
  }

  // Reconciliation: the full-precision balance after n payments must
  // equal the balloon (within $1.00 from payment-rounding drift).
  const balloonDiff = Math.abs(balance - balloonAmount);
  if (balloonDiff > 1.00) {
    console.error(
      `[calculateBalloonLoan] Reconciliation failure: final balance (${balance.toFixed(2)}) != balloon (${balloonAmount}), diff=${balloonDiff.toFixed(2)}`
    );
  }

  // Total cost = down payment + (n × monthly payment) + balloon
  const regularPaymentsTotal = r2(schedule.reduce((sum, row) => sum + row.payment, 0));
  const totalCost = r2(downPayment + regularPaymentsTotal + balloonAmount);
  const totalInterest = r2(totalCost - loanAmount);

  return {
    financedAmount,
    downPayment: r2(downPayment),
    balloonAmount: r2(balloonAmount),
    monthlyPayment: roundedMonthly,
    totalInterest,
    totalCost,
    schedule,
  };
}

// ── Merchant cash advance ──────────────────────────────────────────────────

export interface MCAInputs {
  advanceAmount: number;
  factorRate: number; // e.g. 1.4
  repaymentMonths: number;
}

export interface MCAResult {
  advanceAmount: number;
  totalPayback: number;
  financeCharge: number;
  /**
   * Simple annualized cost. NOT a true APR since MCAs are not loans.
   * Formula: (cost / advance) × (12 / months) × 100
   * Faster repayment = higher effective APR (opposite of a normal loan).
   */
  effectiveAPR: number;
  dailyPayment: number;
  weeklyPayment: number;
  /** Average monthly remittance (total payback / months) */
  monthlyPayment: number;
  repaymentMonths: number;
  /** Cost per dollar advanced */
  costPerDollar: number;
}

/**
 * Computes the cost structure of a merchant cash advance.
 *
 * An MCA is a receivables purchase, not a loan. The total payback
 * is fixed (advance × factor rate), but the effective cost rises
 * the faster you repay because the same total fee is compressed
 * into fewer days.
 *
 * Day-count convention: 365/12 ≈ 30.4167 days per month for both
 * daily and weekly calculations. Weekly = daily × 7 exactly.
 */
export function calculateMCA(inputs: MCAInputs): MCAResult {
  const { advanceAmount, factorRate, repaymentMonths } = inputs;

  if (advanceAmount <= 0 || factorRate <= 1 || repaymentMonths <= 0) {
    return {
      advanceAmount,
      totalPayback: 0,
      financeCharge: 0,
      effectiveAPR: 0,
      dailyPayment: 0,
      weeklyPayment: 0,
      monthlyPayment: 0,
      repaymentMonths,
      costPerDollar: 0,
    };
  }

  const totalPayback = r2(advanceAmount * factorRate);
  const financeCharge = r2(totalPayback - advanceAmount);
  const costPerDollar = r2(financeCharge / advanceAmount);

  // Simple annualized cost (the standard MCA disclosure approximation)
  const effectiveAPR = r2(
    (financeCharge / advanceAmount) * (12 / repaymentMonths) * 100,
  );

  // Consistent day-count: 365/12 days per month
  const daysPerMonth = 365 / 12;
  const repaymentDays = repaymentMonths * daysPerMonth;
  const dailyPayment = r2(totalPayback / repaymentDays);
  const weeklyPayment = r2(dailyPayment * 7);
  const monthlyPayment = r2(totalPayback / repaymentMonths);

  return {
    advanceAmount,
    totalPayback,
    financeCharge,
    effectiveAPR,
    dailyPayment,
    weeklyPayment,
    monthlyPayment,
    repaymentMonths,
    costPerDollar,
  };
}

// ── Effective APR (when net proceeds differ from loan amount) ─────────

/**
 * Computes the effective APR given net proceeds, the monthly payment,
 * and the term. Uses bisection to solve for the monthly rate r where:
 *   netProceeds = payment * [1 - (1+r)^(-n)] / r
 * then annualizes to a percentage.
 */
export function calculateEffectiveAPR(
  netProceeds: number,
  monthlyPayment: number,
  termMonths: number,
): number {
  if (netProceeds <= 0 || monthlyPayment <= 0 || termMonths <= 0) return 0;

  // Edge case: zero rate
  if (monthlyPayment * termMonths <= netProceeds) return 0;

  let lo = 0;
  let hi = 1; // 100% monthly = 1200% APR, well above any real loan

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const factor = Math.pow(1 + mid, -termMonths);
    const pv = monthlyPayment * (1 - factor) / mid;
    if (pv > netProceeds) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const monthlyRate = (lo + hi) / 2;
  return r2(monthlyRate * 12 * 100);
}

// ── Fixed-payment payoff (for debt consolidation comparison) ─────────────

export interface FixedPaymentPayoff {
  /** Number of months until balance reaches zero */
  monthsToPayoff: number;
  /** Total interest paid over the payoff period */
  totalInterest: number;
  /** Total amount paid (principal + interest) */
  totalCost: number;
  /** True if the monthly payment does not cover monthly interest */
  neverPayoff: boolean;
}

/**
 * Given a balance, APR, and fixed monthly payment, simulates
 * month-by-month until the balance is zero (or flags as never
 * paying off if the payment does not exceed monthly interest).
 *
 * Used by the debt consolidation calculator to evaluate each
 * existing debt at its current payment level.
 */
export function calculateFixedPaymentPayoff(
  balance: number,
  apr: number,
  monthlyPayment: number,
): FixedPaymentPayoff {
  if (balance <= 0) {
    return { monthsToPayoff: 0, totalInterest: 0, totalCost: 0, neverPayoff: false };
  }
  if (monthlyPayment <= 0) {
    return { monthsToPayoff: 0, totalInterest: 0, totalCost: 0, neverPayoff: true };
  }

  const monthlyRate = apr / 100 / 12;
  const firstMonthInterest = balance * monthlyRate;

  if (monthlyPayment <= firstMonthInterest) {
    return { monthsToPayoff: 0, totalInterest: 0, totalCost: 0, neverPayoff: true };
  }

  let remaining = balance;
  let totalPayments = 0;
  let months = 0;
  const maxMonths = 600; // 50-year safety cap

  while (remaining > 0 && months < maxMonths) {
    months++;
    const interest = remaining * monthlyRate;
    const principal = monthlyPayment - interest;

    if (principal >= remaining) {
      // Final month: pay remaining balance + accrued interest
      totalPayments += remaining + interest;
      remaining = 0;
      break;
    }

    remaining -= principal;
    totalPayments += monthlyPayment;
  }

  // If still positive after 600 months, treat as never paying off
  if (remaining > 0) {
    return { monthsToPayoff: 0, totalInterest: 0, totalCost: 0, neverPayoff: true };
  }

  const totalCost = r2(totalPayments);
  const totalInterest = r2(totalCost - balance);

  return { monthsToPayoff: months, totalInterest, totalCost, neverPayoff: false };
}

// ── Student loan payoff (fixed payment + extra + lump sum) ──────────────────

export interface StudentLoanPayoffResult {
  /** Number of months until balance reaches zero */
  months: number;
  /** Total interest paid over the payoff period */
  totalInterest: number;
  /** Total amount paid (lump sum + all monthly payments) */
  totalPaid: number;
  /** Month-by-month amortization schedule */
  schedule: AmortizationRow[];
  /** True if the monthly payment does not cover monthly interest */
  neverPayoff: boolean;
  /** Starting balance after lump sum is applied */
  effectiveStartingBalance: number;
  /** Lump sum amount actually applied (capped at balance) */
  lumpSumApplied: number;
}

/**
 * Given a balance, APR, fixed monthly payment, optional extra monthly payment,
 * and optional one-time lump sum applied in month 1, simulates month-by-month
 * until the balance is zero.
 *
 * Convention: the lump sum is applied to principal at the start of month 1,
 * before interest accrues, reducing the effective starting balance. The
 * amortization schedule then proceeds on the reduced balance with the total
 * monthly payment (base + extra).
 *
 * Guard: if the total monthly payment does not cover the first month's
 * interest on the effective balance, the loan will never pay off and
 * neverPayoff is set to true.
 */
export function calculateStudentLoanPayoff(
  balance: number,
  apr: number,
  monthlyPayment: number,
  extraMonthly: number = 0,
  lumpSum: number = 0,
): StudentLoanPayoffResult {
  if (balance <= 0) {
    return {
      months: 0, totalInterest: 0, totalPaid: 0, schedule: [],
      neverPayoff: false, effectiveStartingBalance: 0, lumpSumApplied: 0,
    };
  }

  const monthlyRate = apr / 100 / 12;

  // Apply lump sum first (month 1, before interest accrues)
  const effectiveLumpSum = Math.min(lumpSum, balance);
  const effectiveBalance = balance - effectiveLumpSum;

  // Lump sum covers the entire balance
  if (effectiveBalance <= 0) {
    return {
      months: 0, totalInterest: 0, totalPaid: effectiveLumpSum, schedule: [],
      neverPayoff: false, effectiveStartingBalance: 0, lumpSumApplied: effectiveLumpSum,
    };
  }

  // Guard: total monthly payment must exceed first month's interest
  const totalMonthly = monthlyPayment + extraMonthly;
  const firstMonthInterest = effectiveBalance * monthlyRate;

  if (totalMonthly <= firstMonthInterest) {
    return {
      months: 0, totalInterest: 0, totalPaid: effectiveLumpSum, schedule: [],
      neverPayoff: true, effectiveStartingBalance: effectiveBalance, lumpSumApplied: effectiveLumpSum,
    };
  }

  const schedule: AmortizationRow[] = [];
  let remaining = effectiveBalance;
  let totalInterest = 0;
  let totalPayments = effectiveLumpSum;
  const maxMonths = 600;

  for (let month = 1; month <= maxMonths; month++) {
    const interest = remaining * monthlyRate;
    const principal = totalMonthly - interest;

    if (principal >= remaining) {
      // Final month: pay exact remaining balance + interest
      const lastPayment = remaining + interest;
      totalInterest += interest;
      totalPayments += lastPayment;
      schedule.push({
        month,
        payment: r2(lastPayment),
        principal: r2(remaining),
        interest: r2(interest),
        balance: 0,
      });
      remaining = 0;
      break;
    }

    remaining -= principal;
    totalInterest += interest;
    totalPayments += totalMonthly;

    schedule.push({
      month,
      payment: r2(totalMonthly),
      principal: r2(principal),
      interest: r2(interest),
      balance: r2(remaining),
    });
  }

  if (remaining > 0) {
    return {
      months: 0, totalInterest: 0, totalPaid: r2(totalPayments), schedule: [],
      neverPayoff: true, effectiveStartingBalance: effectiveBalance, lumpSumApplied: effectiveLumpSum,
    };
  }

  return {
    months: schedule.length,
    totalInterest: r2(totalInterest),
    totalPaid: r2(totalPayments),
    schedule,
    neverPayoff: false,
    effectiveStartingBalance: effectiveBalance,
    lumpSumApplied: effectiveLumpSum,
  };
}

// ── Reverse-solve: max principal from a given monthly payment ────────────────

/**
 * Given a fixed monthly payment, APR, and term, computes the maximum
 * loan principal that payment can support.
 *
 * Formula (present value of an annuity):
 *   P = M × (1 − (1+r)^(−n)) / r
 *
 * where M = monthly payment, r = APR/100/12, n = term in months.
 * Returns 0 if inputs are invalid.
 */
export function reverseSolveMaxPrincipal(
  monthlyPayment: number,
  apr: number,
  termMonths: number,
): number {
  if (monthlyPayment <= 0 || apr < 0 || termMonths <= 0) return 0;

  const monthlyRate = apr / 100 / 12;

  if (monthlyRate === 0) {
    return r2(monthlyPayment * termMonths);
  }

  const factor = Math.pow(1 + monthlyRate, -termMonths);
  return r2(monthlyPayment * (1 - factor) / monthlyRate);
}

// ── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}