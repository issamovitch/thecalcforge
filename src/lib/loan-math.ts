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