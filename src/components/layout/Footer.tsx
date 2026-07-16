import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { DEPARTMENTS } from "@/lib/departments";
import { STATES } from "@/lib/states-registry";
import { PAYCHECK_STUBS } from "@/lib/stubs-registry";

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-800 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <Image src="/logo.png" alt="CalcForge" width={28} height={28} className="size-7" />
              <span className="text-lg font-bold text-white">
                Calc<span style={{ color: "#00786f" }}>Forge</span>
              </span>
            </Link>
            <p className="mt-2 text-sm font-medium text-slate-400">{siteConfig.tagline}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Free, accurate financial calculators for paycheck taxes, loans,
              debt, auto, home, and insurance.
            </p>
          </div>

          {/* Column 2: Paycheck (live) */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Paycheck
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/paycheck/calculator" className="text-sm text-slate-400 transition-colors hover:text-white">
                  Federal Calculator
                </Link>
              </li>
              {STATES.map((s) => (
                <li key={s.slug}>
                  <Link href={`/paycheck/calculator/${s.slug}`} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Coming Soon departments */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Coming Soon
            </h3>
            <ul className="mt-4 space-y-2.5">
              {DEPARTMENTS.filter((d) => !d.live).map((dept) => (
                <li key={dept.slug} className="text-sm text-slate-500">
                  {dept.name}
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
                <Link href="/about" className="text-sm text-slate-400 transition-colors hover:text-white">
                  About
                </Link>
              </li>
              {siteConfig.nav.legal.map((page) => (
                <li key={page.href}>
                  <Link href={page.href} className="text-sm text-slate-400 transition-colors hover:text-white">
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
            estimates for informational purposes only. Consult a tax
            professional for advice.
          </p>
        </div>
      </div>
    </footer>
  );
}