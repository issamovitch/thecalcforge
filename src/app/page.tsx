import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  CreditCard,
  Landmark,
  Car,
  Home,
  Shield,
  ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { DEPARTMENTS } from "@/lib/departments";
import { STATES } from "@/lib/states-registry";
import { getStateFlagUrl } from "@/lib/state-flags";

const deptIcons: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign className="h-7 w-7" />,
  CreditCard: <CreditCard className="h-7 w-7" />,
  Landmark: <Landmark className="h-7 w-7" />,
  Car: <Car className="h-7 w-7" />,
  Home: <Home className="h-7 w-7" />,
  Shield: <Shield className="h-7 w-7" />,
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
      { url: "/og-default.png", width: 1200, height: 630, alt: siteConfig.name },
    ],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.tagline,
    images: ["/og-default.png"],
  },
};

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─── */}
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Precision-Crafted
              <span className="block text-ember">Financial Calculators</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Free, accurate, and instant. Calculate your take-home pay, plan
              loans, and understand your finances with tools built on
              up-to-date&nbsp;2026 tax data.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-ember hover:bg-ember-hover text-white font-semibold px-8 py-6 text-base"
              >
                <Link href="/paycheck">Paycheck Calculators</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Departments Grid ─── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Departments
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((dept) => {
            const Icon = deptIcons[dept.icon] ?? <DollarSign className="h-7 w-7" />;
            return (
              <Card
                key={dept.slug}
                className={`relative transition-shadow ${dept.live ? "hover:shadow-md" : "opacity-60"}`}
              >
                <CardHeader className="flex flex-row items-start gap-3 pb-2">
                  <div
                    className={`mt-0.5 shrink-0 ${dept.live ? "text-ember" : "text-muted-foreground"}`}
                  >
                    {Icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{dept.name}</CardTitle>
                  </div>
                  {!dept.live && (
                    <Badge variant="secondary" className="text-xs font-medium shrink-0">
                      Coming Soon
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {dept.description}
                  </CardDescription>
                  {dept.live && (
                    <p className="mt-2 text-xs font-medium text-ember">
                      6 calculators live, more coming
                    </p>
                  )}
                  {!dept.live && (
                    <a
                      href={dept.href}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Learn more
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ─── Popular Calculators Strip ─── */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-center">
            Popular Calculators
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Federal */}
            <Link href="/paycheck/calculator" className="group">
              <Card className="transition-shadow h-full hover:shadow-md">
                <CardHeader className="flex flex-row items-start gap-3 pb-2">
                  <Image
                    src="https://flagcdn.com/w80/us.png"
                    alt=""
                    width={28}
                    height={19}
                    className="mt-0.5 shrink-0 rounded-sm border border-border"
                  />
                  <CardTitle className="text-sm">Federal Paycheck Calculator</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">Calculate take-home pay with state selector for any US state.</CardDescription>
                </CardContent>
              </Card>
            </Link>
            {/* State pages */}
            {STATES.map((state) => (
              <Link key={state.slug} href={`/paycheck/calculator/${state.slug}`} className="group">
                <Card className="transition-shadow h-full hover:shadow-md">
                  <CardHeader className="flex flex-row items-start gap-3 pb-2">
                    <Image
                      src={getStateFlagUrl(state.abbreviation, 80)}
                      alt=""
                      width={28}
                      height={19}
                      className="mt-0.5 shrink-0 rounded-sm border border-border"
                    />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm">{state.name}</CardTitle>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-ember">{state.abbreviation}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs line-clamp-2">
                      {state.config.meta.description.length > 100
                        ? state.config.meta.description.slice(0, 100) + "…"
                        : state.config.meta.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}