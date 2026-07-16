import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ALL_STATES } from "@/lib/all-states";
import { PAYCHECK_STUBS } from "@/lib/stubs-registry";
import { getStateFlagUrl } from "@/lib/state-flags";
import {
  DollarSign,
  MapPin,
  Calculator,
  Clock,
  Percent,
  Gift,
  Banknote,
  Timer,
  ArrowRightLeft,
  TrendingUp,
  HandCoins,
  Receipt,
  Briefcase,
  Scale,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Paycheck & Salary Calculators",
  description:
    "Free paycheck and salary calculators for every US state. Calculate take-home pay, overtime, FICA, bonuses, and more with 2026 tax data.",
  alternates: { canonical: `${siteConfig.url}/paycheck` },
  openGraph: {
    title: "Paycheck & Salary Calculators",
    description:
      "Free paycheck and salary calculators for every US state. Calculate take-home pay, overtime, FICA, bonuses, and more with 2026 tax data.",
    url: `${siteConfig.url}/paycheck`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "CalcForge Paycheck & Salary Calculators" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paycheck & Salary Calculators",
    description: "Free paycheck and salary calculators for every US state with 2026 tax data.",
    images: ["/og-default.png"],
  },
};

/* ─── Icon map for stubs ─── */
const stubIcons: Record<string, React.ReactNode> = {
  "bonus-tax": <Gift className="h-5 w-5" />,
  biweekly: <Clock className="h-5 w-5" />,
  commission: <Percent className="h-5 w-5" />,
  fica: <Banknote className="h-5 w-5" />,
  "final-paycheck-law": <Scale className="h-5 w-5" />,
  "gross-up": <TrendingUp className="h-5 w-5" />,
  "hourly-to-salary": <ArrowRightLeft className="h-5 w-5" />,
  "no-tax-on-overtime": <Timer className="h-5 w-5" />,
  "no-tax-on-tips": <HandCoins className="h-5 w-5" />,
  overtime: <Clock className="h-5 w-5" />,
  "pay-raise": <TrendingUp className="h-5 w-5" />,
  "per-diem": <Receipt className="h-5 w-5" />,
  "prorated-salary": <Calculator className="h-5 w-5" />,
  "salary-to-hourly": <ArrowRightLeft className="h-5 w-5" />,
  "salary-with-overtime": <Clock className="h-5 w-5" />,
  "severance-tax": <Briefcase className="h-5 w-5" />,
  "time-and-a-half": <Timer className="h-5 w-5" />,
  "tip-out": <HandCoins className="h-5 w-5" />,
};

/* ─── Section grouping ─── */
const salaryWageSlugs = ["biweekly", "salary-to-hourly", "hourly-to-salary", "commission", "prorated-salary", "pay-raise", "time-and-a-half", "salary-with-overtime", "overtime"];
const taxDeductionSlugs = ["fica", "gross-up", "no-tax-on-overtime", "no-tax-on-tips"];
const bonusStateSlugs = ["bonus-tax", "severance-tax", "tip-out", "per-diem", "final-paycheck-law"];

function StubCard({ slug, name, description, live }: { slug: string; name: string; description: string; live: boolean }) {
  const Icon = stubIcons[slug] ?? <Calculator className="h-5 w-5" />;
  const content = (
    <Card className={`transition-shadow ${live ? "hover:shadow-md cursor-pointer" : "opacity-60"}`}>
      <CardHeader className="flex flex-row items-start gap-3 pb-2">
        <div className={`mt-0.5 shrink-0 ${live ? "text-ember" : "text-muted-foreground"}`}>{Icon}</div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm">{name}</CardTitle>
        </div>
        {!live && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">Soon</Badge>}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
    </Card>
  );

  if (live) {
    return <Link key={slug} href={`/paycheck/${slug}`}>{content}</Link>;
  }
  return <div key={slug}>{content}</div>;
}

export default function PaycheckHubPage() {
  return (
    <div>
      <CanonicalUrl path="/paycheck" />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Paycheck & Salary", url: `${siteConfig.url}/paycheck` },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Paycheck & Salary" }]}
          className="mb-8"
        />

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Paycheck &amp; Salary Calculators
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-3xl">
          Free, accurate paycheck calculators using official 2026 federal and state tax brackets.
          Select a state for location-specific results or try our salary conversion and tax deduction tools.
        </p>

        {/* ─── Paycheck Calculators ─── */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">Paycheck Calculators</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/paycheck/calculator">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-3 pb-2">
                  <Image
                    src="https://flagcdn.com/w80/us.png"
                    alt=""
                    width={24}
                    height={16}
                    className="mt-0.5 shrink-0 rounded-sm border border-border"
                  />
                  <CardTitle className="text-sm">Federal Paycheck Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">Calculate take-home pay with state selector for any US state.</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <a href="#states">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-3 pb-2">
                  <div className="mt-0.5 shrink-0 text-ember"><MapPin className="h-5 w-5" /></div>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <CardTitle className="text-sm">Paycheck Calculator by State</CardTitle>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">Choose from 50 states for state-specific tax calculations.</CardDescription>
                </CardContent>
              </Card>
            </a>
          </div>
        </section>

        {/* ─── By State ─── */}
        <section id="states" className="mt-12 scroll-mt-20">
          <h2 className="text-xl font-semibold text-foreground mb-6">By State</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {ALL_STATES.map((state) => {
              if (state.live) {
                return (
                  <Link
                    key={state.slug}
                    href={`/paycheck/calculator/${state.slug}`}
                    className="group rounded-lg border border-border bg-card p-3 transition-colors hover:border-ember/40 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={getStateFlagUrl(state.abbreviation, 40)}
                        alt=""
                        width={24}
                        height={16}
                        className="shrink-0 rounded-sm"
                      />
                      <div className="min-w-0">
                        <span className="font-medium text-sm text-foreground group-hover:text-ember transition-colors">
                          {state.name}
                        </span>
                        <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-ember">
                          {state.abbreviation}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              }
              return (
                <div
                  key={state.slug}
                  className="rounded-lg border border-border bg-card p-3 opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <Image
                      src={getStateFlagUrl(state.abbreviation, 40)}
                      alt=""
                      width={24}
                      height={16}
                      className="shrink-0 rounded-sm"
                    />
                    <div className="min-w-0">
                      <span className="font-medium text-sm text-muted-foreground">
                        {state.name}
                      </span>
                      <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {state.abbreviation}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Coming soon</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Salary & Wage Tools ─── */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">Salary &amp; Wage Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {salaryWageSlugs.map((s) => {
              const stub = PAYCHECK_STUBS.find((st) => st.slug === s);
              if (!stub) return null;
              return <StubCard key={s} slug={s} name={stub.name} description={stub.description} live={stub.live} />;
            })}
          </div>
        </section>

        {/* ─── Tax Deduction Tools (2025-2028) ─── */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">Tax Deduction Tools (2025–2028)</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {taxDeductionSlugs.map((s) => {
              const stub = PAYCHECK_STUBS.find((st) => st.slug === s);
              if (!stub) return null;
              return <StubCard key={s} slug={s} name={stub.name} description={stub.description} live={stub.live} />;
            })}
          </div>
        </section>

        {/* ─── Bonus & State Rules ─── */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">Bonus &amp; State Rules</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bonusStateSlugs.map((s) => {
              const stub = PAYCHECK_STUBS.find((st) => st.slug === s);
              if (!stub) return null;
              return <StubCard key={s} slug={s} name={stub.name} description={stub.description} live={stub.live} />;
            })}
          </div>
        </section>
      </div>
    </div>
  );
}