import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalculatorCard } from "@/components/shared/CalculatorCard";

import {
  DollarSign,
  CreditCard,
  Landmark,
  Car,
  Home,
  Shield,
  PiggyBank,
  Calculator,
} from "lucide-react";
import { siteConfig, calculatorPages } from "@/config/site.config";

const departments = [
  { slug: "loans", name: "Loan Calculators", description: "Estimate monthly payments, total interest, and amortization schedules for any loan type.", icon: "Landmark", href: "/loans" },
  { slug: "debt", name: "Debt Calculators", description: "Build payoff strategies, compare snowball vs. avalanche, and see your debt-free date.", icon: "CreditCard", href: "/debt" },
  { slug: "auto", name: "Auto Calculators", description: "Factor in car payments, insurance, depreciation, and total cost of ownership.", icon: "Car", href: "/auto" },
  { slug: "home-buying", name: "Home Buying", description: "Crunch mortgage numbers, property taxes, PMI, and closing costs.", icon: "Home", href: "/home-buying" },
  { slug: "insurance", name: "Insurance", description: "Estimate coverage needs and premiums for life, disability, and annuity income planning.", icon: "Shield", href: "/insurance" },
  { slug: "income", name: "Income Calculators", description: "Calculate overtime pay, salary conversions, and take-home pay for any hourly wage or salary.", icon: "DollarSign", href: "/income" },
  { slug: "savings", name: "Savings", description: "Estimate CD early withdrawal penalties, net proceeds, and whether breaking a CD early is worth it.", icon: "PiggyBank", href: "/savings" },
];

const popularSlugs = [
  "/loans/auto-loan-calculator",
  "/debt/debt-payoff-calculator",
  "/debt/dti-calculator",
  "/home-buying/home-affordability-calculator",
  "/insurance/life-insurance-calculator",
  "/home-buying/heloc-calculator",
];

const popularCalculators = popularSlugs
  .map((slug) => calculatorPages.find((p) => p.href === slug))
  .filter(Boolean);

const deptIcons: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign className="h-7 w-7" />,
  CreditCard: <CreditCard className="h-7 w-7" />,
  Landmark: <Landmark className="h-7 w-7" />,
  Car: <Car className="h-7 w-7" />,
  Home: <Home className="h-7 w-7" />,
  Shield: <Shield className="h-7 w-7" />,
  PiggyBank: <PiggyBank className="h-7 w-7" />,
};

export const metadata = {
  title: `${siteConfig.name} – ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      { url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name },
    ],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.tagline,
    images: [siteConfig.ogImage],
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-slate-50 to-background">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(30deg, #0f172a 12%, transparent 12.5%, transparent 87%, #0f172a 87.5%, #0f172a), linear-gradient(150deg, #0f172a 12%, transparent 12.5%, transparent 87%, #0f172a 87.5%, #0f172a), linear-gradient(30deg, #0f172a 12%, transparent 12.5%, transparent 87%, #0f172a 87.5%, #0f172a), linear-gradient(150deg, #0f172a 12%, transparent 12.5%, transparent 87%, #0f172a 87.5%, #0f172a), linear-gradient(60deg, #ea580c 25%, transparent 25.5%, transparent 75%, #ea580c 75%, #ea580c), linear-gradient(60deg, #ea580c 25%, transparent 25.5%, transparent 75%, #ea580c 75%, #ea580c)",
            backgroundSize: "80px 140px",
            backgroundPosition: "0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight leading-[1.27] text-foreground sm:text-5xl lg:text-6xl">
              Precision-Crafted
              <span className="block text-ember">Financial Calculators</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Free, accurate, and instant. Plan your finances with tools built
              for loans, debt, auto, home, and insurance.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-ember hover:bg-ember-hover text-white font-semibold px-8 py-6 text-base"
              >
                <Link href="/loans">Explore Calculators</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Departments
          </h2>
          <p className="mt-3 text-muted-foreground">
            Browse all 25 calculators across seven categories.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const Icon = deptIcons[dept.icon] ?? <DollarSign className="h-7 w-7" />;
            return (
              <CalculatorCard
                key={dept.slug}
                title={dept.name}
                description={dept.description}
                href={dept.href}
                icon={Icon}
              />
            );
          })}
        </div>
      </section>

      {/* Popular Calculators */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Popular Calculators
          </h2>
          <p className="mt-3 text-muted-foreground">
            The most-used tools on CalcForge.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularCalculators.map((calc) => (
            <CalculatorCard
              key={calc!.href}
              title={calc!.label}
              description={calc!.description}
              href={calc!.href}
              icon={<Calculator className="h-7 w-7" />}
            />
          ))}
        </div>
      </section>
    </>
  );
}
