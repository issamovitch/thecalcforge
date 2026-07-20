import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";

const departmentLinks = [
  { label: "Loans", href: "/loans" },
  { label: "Debt", href: "/debt" },
  { label: "Auto", href: "/auto" },
  { label: "Home Buying", href: "/home-buying" },
  { label: "Insurance", href: "/insurance" },
  { label: "Income", href: "/income" },
];

const popularCalculators = [
  { label: "Auto Loan Calculator", href: "/loans/auto-loan-calculator" },
  { label: "Debt Payoff Calculator", href: "/debt/debt-payoff-calculator" },
  { label: "DTI Calculator", href: "/debt/dti-calculator" },
  { label: "Home Affordability Calculator", href: "/home-buying/home-affordability-calculator" },
  { label: "Life Insurance Calculator", href: "/insurance/life-insurance-calculator" },
  { label: "HELOC Calculator", href: "/home-buying/heloc-calculator" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-800 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="cursor-pointer inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <Image src="/logo.png" alt="CalcForge" width={28} height={28} className="size-7" />
              <span className="text-lg font-bold text-white">
                Calc<span style={{ color: "#00786f" }}>Forge</span>
              </span>
            </Link>
            <p className="mt-2 text-sm font-medium text-slate-400">{siteConfig.tagline}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Free, accurate financial calculators for loans, debt, auto, home,
              and insurance.
            </p>
          </div>

          {/* Column 2: Calculators (department hubs) */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Calculators
            </h3>
            <ul className="mt-4 space-y-2.5">
              {departmentLinks.map((dept) => (
                <li key={dept.href}>
                  <Link href={dept.href} className="cursor-pointer text-sm text-slate-400 transition-colors hover:text-white">
                    {dept.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Popular Calculators */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Popular Calculators
            </h3>
            <ul className="mt-4 space-y-2.5">
              {popularCalculators.map((calc) => (
                <li key={calc.href}>
                  <Link href={calc.href} className="cursor-pointer text-sm text-slate-400 transition-colors hover:text-white">
                    {calc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/about" className="cursor-pointer text-sm text-slate-400 transition-colors hover:text-white">
                  About
                </Link>
              </li>
              {siteConfig.nav.legal.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="cursor-pointer text-sm text-slate-400 transition-colors hover:text-white">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-center text-xs leading-relaxed text-slate-500">
            &copy; 2026 CalcForge. All rights reserved. | Calculations are
            estimates for informational purposes only. Consult a financial
            professional for advice.
          </p>
        </div>
      </div>
    </footer>
  );
}