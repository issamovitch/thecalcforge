"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw, Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

type PayoutOption =
  | "life_only"
  | "life_10yr"
  | "life_20yr"
  | "fixed_10"
  | "fixed_15"
  | "fixed_20"
  | "fixed_25"
  | "joint_life";

type Sex = "male" | "female";

interface AnnuityInputs {
  premium: number;
  payoutOption: PayoutOption;
  age: number;
  sex: Sex;
  fixedRate: number;
}

/* ─── Payout Option Labels ─── */

const PAYOUT_OPTIONS: { value: PayoutOption; label: string }[] = [
  { value: "life_only", label: "Life Only" },
  { value: "life_10yr", label: "Life with 10-Year Period Certain" },
  { value: "life_20yr", label: "Life with 20-Year Period Certain" },
  { value: "fixed_10", label: "Fixed Period: 10 Years" },
  { value: "fixed_15", label: "Fixed Period: 15 Years" },
  { value: "fixed_20", label: "Fixed Period: 20 Years" },
  { value: "fixed_25", label: "Fixed Period: 25 Years" },
  { value: "joint_life", label: "Joint Life (50% to survivor)" },
];

function isLifeMode(opt: PayoutOption): boolean {
  return opt === "life_only" || opt === "life_10yr" || opt === "life_20yr" || opt === "joint_life";
}

function isFixedPeriod(opt: PayoutOption): boolean {
  return opt === "fixed_10" || opt === "fixed_15" || opt === "fixed_20" || opt === "fixed_25";
}

function fixedPeriodYears(opt: PayoutOption): number {
  switch (opt) {
    case "fixed_10": return 10;
    case "fixed_15": return 15;
    case "fixed_20": return 20;
    case "fixed_25": return 25;
    default: return 0;
  }
}

/* ─── SPIA Payout Rate Table ──────────────────────────────────────────────
 *
 * Approximate annual payout rates (%) for a $100,000 single-premium
 * immediate annuity (SPIA), based on recent market averages.
 *
 * These are NOT guaranteed quotes. Actual rates vary by insurer, interest
 * rate environment, state of issue, and product features.
 *
 * Source basis: published SPIA rate surveys (2024-2025 averages).
 * Male rates are higher because male life expectancy is shorter.
 * Period-certain riders and joint-life options reduce the payout rate
 * because the insurer expects to pay for more years on average.
 * ──────────────────────────────────────────────────────────────────────── */

const SPIA_RATES: Record<Sex, Record<number, Record<string, number>>> = {
  male: {
    50: { life_only: 5.00, life_10yr: 4.80, life_20yr: 4.45, joint_life: 4.50 },
    55: { life_only: 5.60, life_10yr: 5.35, life_20yr: 4.85, joint_life: 4.95 },
    60: { life_only: 6.40, life_10yr: 6.00, life_20yr: 5.35, joint_life: 5.50 },
    65: { life_only: 7.20, life_10yr: 6.70, life_20yr: 5.80, joint_life: 6.10 },
    70: { life_only: 8.10, life_10yr: 7.40, life_20yr: 6.30, joint_life: 6.70 },
    75: { life_only: 9.20, life_10yr: 8.20, life_20yr: 6.80, joint_life: 7.50 },
    80: { life_only: 10.60, life_10yr: 9.30, life_20yr: 7.30, joint_life: 8.50 },
    85: { life_only: 12.30, life_10yr: 10.60, life_20yr: 8.00, joint_life: 9.80 },
  },
  female: {
    50: { life_only: 4.80, life_10yr: 4.60, life_20yr: 4.30, joint_life: 4.30 },
    55: { life_only: 5.35, life_10yr: 5.10, life_20yr: 4.70, joint_life: 4.75 },
    60: { life_only: 6.10, life_10yr: 5.75, life_20yr: 5.15, joint_life: 5.25 },
    65: { life_only: 6.85, life_10yr: 6.40, life_20yr: 5.60, joint_life: 5.80 },
    70: { life_only: 7.70, life_10yr: 7.05, life_20yr: 6.10, joint_life: 6.35 },
    75: { life_only: 8.80, life_10yr: 7.85, life_20yr: 6.55, joint_life: 7.05 },
    80: { life_only: 10.10, life_10yr: 8.90, life_20yr: 7.05, joint_life: 8.00 },
    85: { life_only: 11.80, life_10yr: 10.20, life_20yr: 7.70, joint_life: 9.30 },
  },
};

const RATE_TABLE_AGES = [50, 55, 60, 65, 70, 75, 80, 85] as const;

/** Look up the nearest SPIA rate by interpolating between table ages. */
function lookupRate(sex: Sex, age: number, option: PayoutOption): number {
  const table = SPIA_RATES[sex];
  const ages = RATE_TABLE_AGES;

  // Clamp age to table range
  const clampedAge = Math.max(ages[0], Math.min(ages[ages.length - 1], age));

  // Find bracketing ages
  let lower = ages[0];
  let upper = ages[ages.length - 1];
  for (let i = 0; i < ages.length - 1; i++) {
    if (clampedAge >= ages[i] && clampedAge <= ages[i + 1]) {
      lower = ages[i];
      upper = ages[i + 1];
      break;
    }
  }

  const rateLower = table[lower]?.[option] ?? table[65]?.[option] ?? 6.0;
  const rateUpper = table[upper]?.[option] ?? table[65]?.[option] ?? 6.0;

  if (upper === lower) return rateLower;
  const fraction = (clampedAge - lower) / (upper - lower);
  return rateLower + fraction * (rateUpper - rateLower);
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: AnnuityInputs = {
  premium: 100000,
  payoutOption: "life_only",
  age: 65,
  sex: "male",
  fixedRate: 4.5,
};

/* ─── URL Param Helpers ─── */

function readParams(): AnnuityInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const p = new URLSearchParams(window.location.search);
  return {
    premium: Number(p.get("premium")) || DEFAULT_INPUTS.premium,
    payoutOption: (p.get("option") as PayoutOption) || DEFAULT_INPUTS.payoutOption,
    age: Number(p.get("age")) || DEFAULT_INPUTS.age,
    sex: (p.get("sex") as Sex) || DEFAULT_INPUTS.sex,
    fixedRate: Number(p.get("rate")) || DEFAULT_INPUTS.fixedRate,
  };
}

function toParams(i: AnnuityInputs): string {
  const p = new URLSearchParams();
  if (i.premium !== DEFAULT_INPUTS.premium) p.set("premium", String(i.premium));
  if (i.payoutOption !== DEFAULT_INPUTS.payoutOption) p.set("option", i.payoutOption);
  if (i.age !== DEFAULT_INPUTS.age) p.set("age", String(i.age));
  if (i.sex !== DEFAULT_INPUTS.sex) p.set("sex", i.sex);
  if (i.fixedRate !== DEFAULT_INPUTS.fixedRate) p.set("rate", String(i.fixedRate));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/* ─── Component ─── */

export default function AnnuityPayoutCalculator() {
  const [inputs, setInputs] = useState<AnnuityInputs>(readParams);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const update = useCallback(
    (patch: Partial<AnnuityInputs>) => {
      setInputs((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  /* ─── Computation ─── */
  const results = useMemo(() => {
    const life = isLifeMode(inputs.payoutOption);
    const fixed = isFixedPeriod(inputs.payoutOption);

    if (life) {
      const annualPayoutRate = lookupRate(inputs.sex, inputs.age, inputs.payoutOption);
      const annualIncome = inputs.premium * (annualPayoutRate / 100);
      const monthlyIncome = annualIncome / 12;
      const yearsToBreakEven = annualIncome > 0 ? inputs.premium / annualIncome : Infinity;
      const breakEvenAge = yearsToBreakEven === Infinity ? null : inputs.age + yearsToBreakEven;
      return {
        life: true,
        monthlyIncome,
        annualIncome,
        payoutRate: annualPayoutRate,
        breakEvenAge,
        totalReceived: null as number | null,
        totalInterest: null as number | null,
      };
    }

    if (fixed) {
      const n = fixedPeriodYears(inputs.payoutOption);
      const r = inputs.fixedRate / 100;
      const rMonthly = r / 12;
      const nMonths = n * 12;
      let monthlyIncome: number;
      if (rMonthly === 0) {
        monthlyIncome = inputs.premium / nMonths;
      } else {
        monthlyIncome =
          (inputs.premium * rMonthly) /
          (1 - Math.pow(1 + rMonthly, -nMonths));
      }
      const annualIncome = monthlyIncome * 12;
      const totalReceived = monthlyIncome * nMonths;
      const totalInterest = totalReceived - inputs.premium;
      const payoutRate = (annualIncome / inputs.premium) * 100;
      return {
        life: false,
        monthlyIncome,
        annualIncome,
        payoutRate,
        breakEvenAge: null as number | null,
        totalReceived,
        totalInterest,
      };
    }

    // Fallback
    return {
      life: true,
      monthlyIncome: 0,
      annualIncome: 0,
      payoutRate: 0,
      breakEvenAge: null as number | null,
      totalReceived: null as number | null,
      totalInterest: null as number | null,
    };
  }, [inputs]);

  /* ─── Actions ─── */
  const handleCopyLink = useCallback(() => {
    const url = window.location.origin + window.location.pathname + toParams(inputs);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [inputs]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    window.history.replaceState(null, "", window.location.pathname);
    toast.success("Calculator reset to defaults");
  }, []);

  const summaryText = useMemo(() => {
    return `${formatCurrency(inputs.premium)} ${inputs.payoutOption.replace(/_/g, " ")}, age ${inputs.age}: ${formatCurrency(results.monthlyIncome)}/mo. Calculate yours:`;
  }, [inputs, results]);

  const showAge = isLifeMode(inputs.payoutOption);
  const showSex = isLifeMode(inputs.payoutOption);
  const showRate = isFixedPeriod(inputs.payoutOption);

  return (
    <TooltipProvider>
      <Card className="w-full" id="calculator">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-ember" />
            Calculate Your Payout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ── Inputs ── */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Premium Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="premium" className="text-sm font-medium">
                  Premium Amount
                </Label>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(inputs.premium)}
                </span>
              </div>
              <Slider
                id="premium"
                min={10000}
                max={2000000}
                step={5000}
                value={[inputs.premium]}
                onValueChange={([v]) => update({ premium: v })}
                aria-label="Premium amount"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$10,000</span>
                <span>$2,000,000</span>
              </div>
            </div>

            {/* Payout Option */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="payoutOption" className="text-sm font-medium">
                  Payout Option
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Life options pay as long as you live (with optional guarantee period). Fixed period options pay for a set number of years regardless of lifespan. Joint life pays while either spouse is alive.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={inputs.payoutOption}
                onValueChange={(v) => update({ payoutOption: v as PayoutOption })}
              >
                <SelectTrigger id="payoutOption" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Life Annuity Options
                  </div>
                  {PAYOUT_OPTIONS.filter((o) => isLifeMode(o.value)).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                  <div className="my-1 h-px bg-border" />
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Fixed Period Options
                  </div>
                  {PAYOUT_OPTIONS.filter((o) => isFixedPeriod(o.value)).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Age (life mode) */}
            {showAge && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="age" className="text-sm font-medium">
                    Your Age
                  </Label>
                  <span className="text-sm font-semibold text-foreground">
                    {inputs.age}
                  </span>
                </div>
                <Slider
                  id="age"
                  min={50}
                  max={85}
                  step={1}
                  value={[inputs.age]}
                  onValueChange={([v]) => update({ age: v })}
                  aria-label="Your age"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50</span>
                  <span>85</span>
                </div>
              </div>
            )}

            {/* Sex (life mode) */}
            {showSex && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm font-medium">Sex</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Payout rates differ by sex because life expectancy affects how long the insurer expects to pay. Males receive slightly higher monthly payments.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={inputs.sex === "male" ? "default" : "outline"}
                    size="sm"
                    onClick={() => update({ sex: "male" })}
                    className="text-xs"
                  >
                    Male
                  </Button>
                  <Button
                    type="button"
                    variant={inputs.sex === "female" ? "default" : "outline"}
                    size="sm"
                    onClick={() => update({ sex: "female" })}
                    className="text-xs"
                  >
                    Female
                  </Button>
                </div>
              </div>
            )}

            {/* Annual Interest Rate (fixed period) */}
            {showRate && (
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="fixedRate" className="text-sm font-medium">
                      Annual Interest / Growth Rate
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        The rate used to calculate fixed-period payouts. Higher rates produce higher monthly payments. This is an assumed rate, not a guaranteed return.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {inputs.fixedRate}%
                  </span>
                </div>
                <Slider
                  id="fixedRate"
                  min={1}
                  max={10}
                  step={0.1}
                  value={[inputs.fixedRate]}
                  onValueChange={([v]) => update({ fixedRate: v })}
                  aria-label="Annual interest rate"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span>
                  <span>10%</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Results ── */}
          <div ref={resultRef} className="rounded-lg border bg-muted/30 p-5 space-y-4">
            <h3 className="text-base font-semibold">Results</h3>

            {/* Primary result */}
            <div className="rounded-md bg-ember/5 border border-ember/20 p-4 space-y-2">
              <p className="text-xs text-muted-foreground">Estimated Monthly Income</p>
              <p className="text-3xl font-bold text-ember">
                {formatCurrency(results.monthlyIncome)}
              </p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Annual Income: </span>
                  <span className="font-semibold">{formatCurrency(results.annualIncome)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payout Rate: </span>
                  <span className="font-semibold">{results.payoutRate.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Secondary metrics */}
            <div className="grid gap-3 sm:grid-cols-2">
              {results.life && results.breakEvenAge !== null && (
                <div className="rounded-md bg-background p-3">
                  <p className="text-xs text-muted-foreground">Break-Even Age</p>
                  <p className="text-lg font-bold">
                    {results.breakEvenAge.toFixed(1)} years old
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cumulative payments equal your premium at this age
                  </p>
                </div>
              )}
              {!results.life && results.totalReceived !== null && results.totalInterest !== null && (
                <>
                  <div className="rounded-md bg-background p-3">
                    <p className="text-xs text-muted-foreground">Total Received</p>
                    <p className="text-lg font-bold">{formatCurrency(results.totalReceived)}</p>
                    <p className="text-xs text-muted-foreground">
                      Over {fixedPeriodYears(inputs.payoutOption)} years
                    </p>
                  </div>
                  <div className="rounded-md bg-background p-3">
                    <p className="text-xs text-muted-foreground">Interest Portion</p>
                    <p className="text-lg font-bold">{formatCurrency(results.totalInterest)}</p>
                    <p className="text-xs text-muted-foreground">
                      Earnings above your premium
                    </p>
                  </div>
                </>
              )}
              <div className="rounded-md bg-background p-3">
                <p className="text-xs text-muted-foreground">Premium Paid</p>
                <p className="text-lg font-bold">{formatCurrency(inputs.premium)}</p>
              </div>
            </div>

            {/* YMYL disclaimer */}
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              {results.life
                ? "Payout rates are market estimates based on recent SPIA surveys and change with interest rates. Actual quotes vary by insurer, state, health, and product features. This is not a quote."
                : "Fixed-period payouts are calculated using the standard amortization formula. Actual annuity products may have different rates, fees, or riders that affect the payout."}
            </p>
          </div>

          {/* ── Action Row ── */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="text-xs">
              {copied ? <Check className="mr-1.5 size-3.5" /> : <Copy className="mr-1.5 size-3.5" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
              <Printer className="mr-1.5 size-3.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset
            </Button>
            <div className="ml-auto">
              <ShareButtons summaryText={summaryText} title="Annuity Payout Calculator - CalcForge" />
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}