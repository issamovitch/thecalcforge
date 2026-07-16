export interface LoanParams {
  principal: number;
  apr: number;
  termMonths: number;
  extraMonthly?: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
  date: string;
}

export interface LoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  effectiveTermMonths: number;
  payoffDate: string;
  schedule: AmortizationRow[];
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateLoan(params: LoanParams): LoanResult {
  const { principal, apr, termMonths, extraMonthly = 0 } = params;

  if (principal <= 0 || termMonths <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalCost: 0,
      effectiveTermMonths: 0,
      payoffDate: "",
      schedule: [],
    };
  }

  const monthlyRate = apr / 100 / 12;
  const startDate = new Date();

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = (principal * monthlyRate * factor) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let effectiveTerm = termMonths;

  for (let i = 1; i <= termMonths && balance > 0.01; i++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;
    let extra = 0;
    let actualPayment = monthlyPayment;

    if (balance <= principalPayment + extraMonthly) {
      principalPayment = balance;
      actualPayment = principalPayment + interestPayment;
    } else {
      extra = extraMonthly;
      actualPayment = monthlyPayment + extra;
    }

    balance = Math.max(0, balance - principalPayment - extra);

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);

    schedule.push({
      month: i,
      payment: Math.round(actualPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      extraPayment: Math.round(extra * 100) / 100,
      balance: Math.round(balance * 100) / 100,
      date: paymentDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    });

    if (balance <= 0.01) {
      effectiveTerm = i;
      break;
    }
  }

  const totalCost = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = totalCost - principal;

  const payoffDate = new Date(startDate);
  payoffDate.setMonth(payoffDate.getMonth() + effectiveTerm);

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    effectiveTermMonths: effectiveTerm,
    payoffDate: payoffDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    schedule,
  };
}