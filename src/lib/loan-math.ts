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