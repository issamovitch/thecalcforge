/**
 * Department registry — defines all departments and their metadata.
 * Used by the homepage, footer, navigation, and hub pages.
 */

export interface Department {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  live: boolean;
  icon: "DollarSign" | "Landmark" | "CreditCard" | "Car" | "Home" | "Shield";
}

export const DEPARTMENTS: readonly Department[] = [
  {
    slug: "paycheck",
    name: "Paycheck & Salary",
    shortName: "Paycheck",
    description: "Calculate your take-home pay after federal and state taxes, including FICA, deductions, and local taxes.",
    href: "/paycheck",
    live: true,
    icon: "DollarSign",
  },
  {
    slug: "debt",
    name: "Debt",
    shortName: "Debt",
    description: "Build payoff strategies, compare snowball vs. avalanche methods, and see your debt-free date.",
    href: "/debt",
    live: false,
    icon: "CreditCard",
  },
  {
    slug: "loans",
    name: "Loans",
    shortName: "Loans",
    description: "Estimate monthly payments, total interest, and amortization schedules for any loan type.",
    href: "/loans",
    live: false,
    icon: "Landmark",
  },
  {
    slug: "auto",
    name: "Auto",
    shortName: "Auto",
    description: "Factor in car payments, insurance, depreciation, and total cost of ownership for any vehicle.",
    href: "/auto",
    live: false,
    icon: "Car",
  },
  {
    slug: "home-buying",
    name: "Home Buying",
    shortName: "Home",
    description: "Crunch mortgage numbers, property taxes, PMI, and closing costs for your home purchase.",
    href: "/home-buying",
    live: false,
    icon: "Home",
  },
  {
    slug: "insurance",
    name: "Insurance",
    shortName: "Insurance",
    description: "Estimate coverage needs and premiums for health, life, auto, and homeowners insurance.",
    href: "/insurance",
    live: false,
    icon: "Shield",
  },
];

export function getDepartmentBySlug(slug: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.slug === slug);
}