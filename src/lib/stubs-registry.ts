/**
 * Registry of all paycheck calculator stubs.
 * Each entry maps a URL slug to display metadata.
 * When a stub is promoted to a live calculator, set `live: true`
 * and the navigation/footer/hub page will style it accordingly.
 */

export interface StubEntry {
  slug: string;
  name: string;
  description: string;
  live: boolean;
}

export const PAYCHECK_STUBS: readonly StubEntry[] = [
  { slug: "bonus-tax", name: "Bonus Tax Calculator", description: "Calculate federal and state taxes on bonuses using your state's supplemental wage rules.", live: false },
  { slug: "biweekly", name: "Biweekly Paycheck Calculator", description: "Convert annual salary to biweekly take-home pay after taxes and deductions.", live: false },
  { slug: "commission", name: "Commission Calculator", description: "Estimate your net pay from commission earnings after tax withholding.", live: false },
  { slug: "fica", name: "FICA Tax Calculator", description: "Calculate your Social Security and Medicare tax contributions for any income level.", live: false },
  { slug: "final-paycheck-law", name: "Final Paycheck Law by State", description: "Understand when your final paycheck is due after leaving a job, state by state.", live: false },
  { slug: "gross-up", name: "Gross-Up Pay Calculator", description: "Calculate the gross amount needed so that net pay equals a target amount after taxes.", live: false },
  { slug: "hourly-to-salary", name: "Hourly to Salary Calculator", description: "Convert your hourly wage to an equivalent annual salary with overtime adjustments.", live: false },
  { slug: "no-tax-on-overtime", name: "No Tax on Overtime Calculator", description: "Calculate your federal tax deduction on qualified overtime pay under the 2025 OBBBA law (2025-2028).", live: false },
  { slug: "no-tax-on-tips", name: "No Tax on Tips Calculator", description: "Calculate your federal tax deduction on qualified tip income under the 2025 OBBBA law (2025-2028).", live: false },
  { slug: "overtime", name: "Overtime Pay Calculator", description: "Calculate weekly overtime pay under FLSA rules, including overtime for salaried non-exempt employees.", live: false },
  { slug: "pay-raise", name: "Pay Raise Calculator", description: "See how a percentage or flat raise affects your take-home pay after taxes.", live: false },
  { slug: "per-diem", name: "Per Diem Calculator", description: "Calculate per diem rates and tax-free allowance for travel and business expenses.", live: false },
  { slug: "prorated-salary", name: "Prorated Salary Calculator", description: "Calculate partial salary for mid-month start dates, unpaid leave, or part-time work.", live: false },
  { slug: "salary-to-hourly", name: "Salary to Hourly Calculator", description: "Convert your annual salary to an equivalent hourly, weekly, or biweekly rate.", live: false },
  { slug: "salary-with-overtime", name: "Salary with Overtime Calculator", description: "Calculate total pay for salaried employees who also work overtime hours.", live: false },
  { slug: "severance-tax", name: "Severance Pay Tax Calculator", description: "Estimate federal and state taxes on severance pay to plan your net payout.", live: false },
  { slug: "time-and-a-half", name: "Time and a Half Calculator", description: "Calculate 1.5x time-and-a-half, 2x double time, and holiday pay rates.", live: false },
  { slug: "tip-out", name: "Tip-Out Calculator", description: "Calculate tip pooling and tip-out amounts for restaurant and service industry workers.", live: false },
];

const stubMap = new Map<string, StubEntry>(
  PAYCHECK_STUBS.map((s) => [s.slug, s])
);

export function getStubBySlug(slug: string): StubEntry | undefined {
  return stubMap.get(slug);
}

export function getAllStubSlugs(): string[] {
  return PAYCHECK_STUBS.map((s) => s.slug);
}