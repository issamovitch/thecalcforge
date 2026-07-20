// ── Types ────────────────────────────────────────────────────────────────────

export interface AmortizationInputs {
  /** Loan principal in dollars */
  loanAmount: number;
  /** Annual percentage rate, e.g. 6.5 for 6.50% */
  apr: number;
  /** Term in years */
  termYears: number;
  /** Extra amount added to every monthly payment */
  extraMonthly: number;
  /** Extra amount applied once per year, on the 12th month */
  extraAnnual: number;
  /** One-time extra payment, applied in the given month number (1-indexed) */
  oneTimeAmount: number;
  /** Month number (1-indexed) when the one-time payment is applied */
  oneTimeMonth: number;
}

export interface AmortizationScheduleRow {
  /** 1-indexed month number from the original start date */
  month: number;
  /** Calendar date as ISO yyyy-mm-dd (first of month) */
  date: string;
  /** Total payment made this month (base + all extras), final month may be smaller */
  payment: number;
  /** Extra portion of this month's payment (extraMonthly + extraAnnual + one-time if applicable) */
  extra: number;
  /** Interest portion of this month's payment */
  interest: number;
  /** Principal portion of this month's payment (payment - interest) */
  principal: number;
  /** Remaining balance after this month's payment */
  balance: number;
}

export interface YearSummary {
  /** 1-indexed year number */
  year: number;
  /** Calendar year (e.g. 2025) */
  calendarYear: number;
  /** First month number in this year */
  startMonth: number;
  /** Last month number in this year */
  endMonth: number;
  /** Total interest paid this year */
  interest: number;
  /** Total principal paid this year */
  principal: number;
  /** Total payments this year (including extras) */
  totalPaid: number;
  /** Balance at end of year (0 if loan paid off during this year) */
  endingBalance: number;
  /** The schedule rows that belong to this year */
  rows: AmortizationScheduleRow[];
}

export interface AmortizationResult {
  /** Rounded base monthly payment (principal + interest, no extras) */
  monthlyPayment: number;
  /** Total interest paid over the life of the loan, with extras applied */
  totalInterest: number;
  /** Total amount paid (principal + interest + all extras) */
  totalPaid: number;
  /** Number of months to pay off (may be less than termYears * 12 with extras) */
  payoffMonths: number;
  /** Payoff date as ISO yyyy-mm-dd, or null if never */
  payoffDate: string | null;
  /** Full per-month schedule */
  schedule: AmortizationScheduleRow[];
  /** Year-grouped summaries */
  years: YearSummary[];
  /** The month number (1-indexed) where principal first exceeds interest */
  crossoverMonth: number | null;
}

export interface AmortizationComparison {
  /** Baseline result (no extras) */
  baseline: AmortizationResult;
  /** Result with extras applied */
  withExtras: AmortizationResult;
  /** Months saved by extras (baseline.payoffMonths - withExtras.payoffMonths) */
  monthsSaved: number;
  /** Interest saved by extras */
  interestSaved: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Standard amortizing monthly payment formula:
 *   M = P × (r/12) / (1 − (1 + r/12)^(−n))
 *
 * where P = principal, r = APR as a decimal (e.g. 0.065), n = term in months.
 * Returns the unrounded payment; callers round to cents for display.
 */
export function computeMonthlyPayment(
  principal: number,
  aprPercent: number,
  termMonths: number,
): number {
  if (principal <= 0 || aprPercent < 0 || termMonths <= 0) return 0;
  const r = aprPercent / 100 / 12;
  if (r === 0) return principal / termMonths;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Given a month index (1-indexed) and a start Date, returns the ISO date
 * string (yyyy-mm-dd) for the first day of that month. Month 1 = start month.
 */
function monthToDate(start: Date, monthIndex: number): string {
  const d = new Date(start.getFullYear(), start.getMonth() + monthIndex - 1, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function emptyResult(): AmortizationResult {
  return {
    monthlyPayment: 0,
    totalInterest: 0,
    totalPaid: 0,
    payoffMonths: 0,
    payoffDate: null,
    schedule: [],
    years: [],
    crossoverMonth: null,
  };
}

// ── Core calculation ─────────────────────────────────────────────────────────

/**
 * Computes a full amortization schedule with optional extra payments.
 *
 * Inputs:
 *  - loanAmount, apr, termYears define the base loan.
 *  - extraMonthly is added to every payment.
 *  - extraAnnual is applied on every 12th month (month 12, 24, 36, ...).
 *  - oneTimeAmount is applied in oneTimeMonth (1-indexed).
 *
 * The base monthly payment is always derived from the amortization formula
 * (P × r / (1 − (1+r)^−n)), rounded to cents, so the loan always amortizes
 * on schedule and negative amortization is impossible under normal inputs.
 * Extras are added on top of the base payment and go to principal.
 *
 * The final month pays the exact remaining balance plus that month's interest,
 * so the balance always lands on exactly $0.
 *
 * @param inputs loan parameters
 * @param startDate the month/year the loan begins (defaults to current month)
 */
export function calculateAmortization(
  inputs: AmortizationInputs,
  startDate: Date = new Date(),
): AmortizationResult {
  const {
    loanAmount,
    apr,
    termYears,
    extraMonthly,
    extraAnnual,
    oneTimeAmount,
    oneTimeMonth,
  } = inputs;

  if (loanAmount <= 0 || apr < 0 || termYears <= 0) {
    return emptyResult();
  }

  const termMonths = Math.round(termYears * 12);
  const monthlyRate = apr / 100 / 12;

  // Base payment derived from formula, rounded to cents.
  const rawPayment = computeMonthlyPayment(loanAmount, apr, termMonths);
  const basePayment = r2(rawPayment);

  const schedule: AmortizationScheduleRow[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPaid = 0;
  let crossoverMonth: number | null = null;

  // Cap at the scheduled term + a generous buffer in case of rounding.
  const maxMonths = termMonths + 12;

  for (let month = 1; month <= maxMonths; month++) {
    if (balance <= 0.005) break;

    const interest = balance * monthlyRate;

    // Assemble this month's extras
    let extra = extraMonthly;
    if (month % 12 === 0) extra += extraAnnual;
    if (oneTimeAmount > 0 && month === oneTimeMonth) extra += oneTimeAmount;

    const totalPayment = basePayment + extra;
    let principal = totalPayment - interest;

    let rowPayment: number;
    let rowPrincipal: number;
    let rowExtra: number;

    if (principal >= balance) {
      // Final month: pay exact remaining balance + interest.
      rowPrincipal = balance;
      rowExtra = Math.max(0, extra - (principal - balance));
      rowPayment = rowPrincipal + interest;
      principal = balance;
    } else {
      rowPayment = totalPayment;
      rowPrincipal = principal;
      rowExtra = extra;
    }

    const newBalance = balance - rowPrincipal;

    // Crossover: first month principal strictly exceeds interest
    if (crossoverMonth === null && rowPrincipal > interest) {
      crossoverMonth = month;
    }

    totalInterest += interest;
    totalPaid += rowPayment;

    schedule.push({
      month,
      date: monthToDate(startDate, month),
      payment: r2(rowPayment),
      extra: r2(rowExtra),
      interest: r2(interest),
      principal: r2(rowPrincipal),
      balance: r2(Math.max(0, newBalance)),
    });

    balance = newBalance;
  }

  // Group into year summaries
  const years: YearSummary[] = [];
  for (let y = 1; y <= Math.ceil(schedule.length / 12); y++) {
    const startMonth = (y - 1) * 12 + 1;
    const endMonth = Math.min(y * 12, schedule.length);
    const rows = schedule.slice(startMonth - 1, endMonth);
    if (rows.length === 0) break;

    let yInterest = 0;
    let yPrincipal = 0;
    let yPaid = 0;
    for (const r of rows) {
      yInterest += r.interest;
      yPrincipal += r.principal;
      yPaid += r.payment;
    }

    years.push({
      year: y,
      calendarYear: new Date(startDate.getFullYear(), startDate.getMonth() + startMonth - 1, 1).getFullYear(),
      startMonth,
      endMonth,
      interest: r2(yInterest),
      principal: r2(yPrincipal),
      totalPaid: r2(yPaid),
      endingBalance: rows[rows.length - 1].balance,
      rows,
    });
  }

  const payoffMonths = schedule.length;
  const payoffDate =
    payoffMonths > 0 ? schedule[schedule.length - 1].date : null;

  return {
    monthlyPayment: basePayment,
    totalInterest: r2(totalInterest),
    totalPaid: r2(totalPaid),
    payoffMonths,
    payoffDate,
    schedule,
    years,
    crossoverMonth,
  };
}

// ── Comparison (baseline vs with extras) ─────────────────────────────────────

/**
 * Computes both the baseline (no extras) and with-extras schedules, then
 * derives the months and interest saved.
 */
export function compareAmortization(
  inputs: AmortizationInputs,
  startDate: Date = new Date(),
): AmortizationComparison {
  const baseline = calculateAmortization(
    {
      ...inputs,
      extraMonthly: 0,
      extraAnnual: 0,
      oneTimeAmount: 0,
      oneTimeMonth: 1,
    },
    startDate,
  );

  const hasExtras =
    inputs.extraMonthly > 0 ||
    inputs.extraAnnual > 0 ||
    inputs.oneTimeAmount > 0;

  const withExtras = hasExtras
    ? calculateAmortization(inputs, startDate)
    : baseline;

  const monthsSaved = baseline.payoffMonths - withExtras.payoffMonths;
  const interestSaved = r2(baseline.totalInterest - withExtras.totalInterest);

  return { baseline, withExtras, monthsSaved, interestSaved };
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

export function formatCurrency0(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 2)}%`;
}

/** Formats an ISO yyyy-mm-dd date string as "Month Year" (e.g. "March 2055"). */
export function formatMonthYear(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

/** Formats a payoff month count as "X years Y months". */
export function formatYearsMonths(totalMonths: number): string {
  if (totalMonths <= 0) return "0 months";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
}
