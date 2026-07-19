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

type BenefitPeriod = "2yr" | "5yr" | "10yr" | "to65" | "to67";

interface DisabilityInputs {
  annualIncome: number;
  monthlyExpenses: number;
  employerLtdPct: number;
  otherBenefits: number;
  benefitPeriod: BenefitPeriod;
  currentAge: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: DisabilityInputs = {
  annualIncome: 80000,
  monthlyExpenses: 4000,
  employerLtdPct: 40,
  otherBenefits: 0,
  benefitPeriod: "to65",
  currentAge: 35,
};

const BENEFIT_PERIOD_OPTIONS: { value: BenefitPeriod; label: string }[] = [
  { value: "2yr", label: "2 Years" },
  { value: "5yr", label: "5 Years" },
  { value: "10yr", label: "10 Years" },
  { value: "to65", label: "To Age 65" },
  { value: "to67", label: "To Age 67" },
];

function benefitPeriodMonths(period: BenefitPeriod, age: number): number {
  switch (period) {
    case "2yr": return 24;
    case "5yr": return 60;
    case "10yr": return 120;
    case "to65": return Math.max((65 - age) * 12, 12);
    case "to67": return Math.max((67 - age) * 12, 12);
  }
}

function benefitPeriodLabel(period: BenefitPeriod, age: number): string {
  switch (period) {
    case "2yr": return "2 years";
    case "5yr": return "5 years";
    case "10yr": return "10 years";
    case "to65": return `to age 65 (${Math.max(65 - age, 1)} years)`;
    case "to67": return `to age 67 (${Math.max(67 - age, 1)} years)`;
  }
}

/* ─── URL Param Helpers ─── */

function readParams(): DisabilityInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const p = new URLSearchParams(window.location.search);
  return {
    annualIncome: Number(p.get("income")) || DEFAULT_INPUTS.annualIncome,
    monthlyExpenses: Number(p.get("expenses")) || DEFAULT_INPUTS.monthlyExpenses,
    employerLtdPct: Number(p.get("employer")) || DEFAULT_INPUTS.employerLtdPct,
    otherBenefits: Number(p.get("other")) || DEFAULT_INPUTS.otherBenefits,
    benefitPeriod: (p.get("period") as BenefitPeriod) || DEFAULT_INPUTS.benefitPeriod,
    currentAge: Number(p.get("age")) || DEFAULT_INPUTS.currentAge,
  };
}

function toParams(i: DisabilityInputs): string {
  const p = new URLSearchParams();
  if (i.annualIncome !== DEFAULT_INPUTS.annualIncome) p.set("income", String(i.annualIncome));
  if (i.monthlyExpenses !== DEFAULT_INPUTS.monthlyExpenses) p.set("expenses", String(i.monthlyExpenses));
  if (i.employerLtdPct !== DEFAULT_INPUTS.employerLtdPct) p.set("employer", String(i.employerLtdPct));
  if (i.otherBenefits !== DEFAULT_INPUTS.otherBenefits) p.set("other", String(i.otherBenefits));
  if (i.benefitPeriod !== DEFAULT_INPUTS.benefitPeriod) p.set("period", i.benefitPeriod);
  if (i.currentAge !== DEFAULT_INPUTS.currentAge) p.set("age", String(i.currentAge));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/* ─── Component ─── */

export default function DisabilityInsuranceCalculator() {
  const [inputs, setInputs] = useState<DisabilityInputs>(readParams);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const update = useCallback(
    (patch: Partial<DisabilityInputs>) => {
      setInputs((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  /* ─── Computation ─── */
  const results = useMemo(() => {
    const monthlyGross = inputs.annualIncome / 12;
    const sixtyPctRule = monthlyGross * 0.6;
    const employerBenefit = monthlyGross * (inputs.employerLtdPct / 100);
    const totalExisting = employerBenefit + inputs.otherBenefits;
    const coverageGap = Math.max(inputs.monthlyExpenses - totalExisting, 0);
    const recommendedBenefit = Math.min(coverageGap, sixtyPctRule);
    const benefitPctOfIncome = monthlyGross > 0
      ? (recommendedBenefit / monthlyGross) * 100
      : 0;

    const bpMonths = benefitPeriodMonths(inputs.benefitPeriod, inputs.currentAge);
    const premiumRates = [0.01, 0.02, 0.03];
    const premiumEstimates = premiumRates.map((rate) => ({
      rate,
      monthlyPremium: (inputs.annualIncome * rate) / 12,
      annualPremium: inputs.annualIncome * rate,
      totalPremium: inputs.annualIncome * rate * (bpMonths / 12),
    }));

    return {
      monthlyGross,
      sixtyPctRule,
      employerBenefit,
      totalExisting,
      coverageGap,
      recommendedBenefit,
      benefitPctOfIncome,
      bpMonths,
      premiumEstimates,
      hasGap: coverageGap > 0,
      benefitExceedsCap: coverageGap > sixtyPctRule,
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

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    window.history.replaceState(null, "", window.location.pathname);
    toast.success("Calculator reset to defaults");
  }, []);

  const summaryText = useMemo(() => {
    return `$${(inputs.annualIncome / 1000).toFixed(0)}K salary, $${(inputs.monthlyExpenses / 1000).toFixed(1)}K/mo expenses: recommended ${formatCurrency(results.recommendedBenefit)}/mo disability benefit. Calculate yours:`;
  }, [inputs, results]);

  const showAgeInput = inputs.benefitPeriod === "to65" || inputs.benefitPeriod === "to67";

  return (
    <TooltipProvider>
      <Card className="w-full" id="calculator">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-ember" />
            Calculate Your Coverage Needs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ── Inputs ── */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Annual Income */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="annualIncome" className="text-sm font-medium">
                  Gross Annual Income
                </Label>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(inputs.annualIncome)}
                </span>
              </div>
              <Slider
                id="annualIncome"
                min={10000}
                max={500000}
                step={5000}
                value={[inputs.annualIncome]}
                onValueChange={([v]) => update({ annualIncome: v })}
                aria-label="Gross annual income"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$10,000</span>
                <span>$500,000</span>
              </div>
            </div>

            {/* Monthly Expenses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="monthlyExpenses" className="text-sm font-medium">
                  Monthly Essential Expenses
                </Label>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(inputs.monthlyExpenses)}
                </span>
              </div>
              <Slider
                id="monthlyExpenses"
                min={500}
                max={15000}
                step={100}
                value={[inputs.monthlyExpenses]}
                onValueChange={([v]) => update({ monthlyExpenses: v })}
                aria-label="Monthly essential expenses"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$500</span>
                <span>$15,000</span>
              </div>
            </div>

            {/* Employer LTD % */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="employerLtdPct" className="text-sm font-medium">
                    Employer LTD Coverage
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Most employer group long-term disability plans cover 50-60% of base salary, often with a monthly cap (e.g. $5,000-$10,000). Check your benefits summary for your exact percentage and cap.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {inputs.employerLtdPct}%
                </span>
              </div>
              <Slider
                id="employerLtdPct"
                min={0}
                max={60}
                step={5}
                value={[inputs.employerLtdPct]}
                onValueChange={([v]) => update({ employerLtdPct: v })}
                aria-label="Employer LTD coverage percentage"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>60%</span>
              </div>
            </div>

            {/* Other Monthly Benefits */}
            <div className="space-y-2">
              <Label htmlFor="otherBenefits" className="text-sm font-medium">
                Other Monthly Benefits
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="otherBenefits"
                  type="number"
                  min={0}
                  max={10000}
                  step={50}
                  value={inputs.otherBenefits}
                  onChange={(e) =>
                    update({ otherBenefits: Math.max(0, Number(e.target.value) || 0) })
                  }
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Social Security disability, state benefits, or other income replacement
              </p>
            </div>

            {/* Benefit Period */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="benefitPeriod" className="text-sm font-medium">
                  Desired Benefit Period
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    The benefit period is how long the policy pays if you remain disabled. Longer periods cost more. Most financial advisors recommend coverage to at least age 65 (full retirement age).
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={inputs.benefitPeriod}
                onValueChange={(v) => update({ benefitPeriod: v as BenefitPeriod })}
              >
                <SelectTrigger id="benefitPeriod" className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BENEFIT_PERIOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Age (conditional) */}
            {showAgeInput && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="currentAge" className="text-sm font-medium">
                  Your Current Age
                </Label>
                <div className="flex items-center gap-3">
                  <Slider
                    id="currentAge"
                    min={18}
                    max={64}
                    step={1}
                    value={[inputs.currentAge]}
                    onValueChange={([v]) => update({ currentAge: v })}
                    className="flex-1"
                    aria-label="Your current age"
                  />
                  <span className="w-10 text-right text-sm font-semibold text-foreground">
                    {inputs.currentAge}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Results ── */}
          <div ref={resultRef} className="rounded-lg border bg-muted/30 p-5 space-y-4">
            <h3 className="text-base font-semibold">Results</h3>

            {/* Key metrics grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-background p-3">
                <p className="text-xs text-muted-foreground">Monthly Gross Income</p>
                <p className="text-lg font-bold">{formatCurrency(results.monthlyGross)}</p>
              </div>
              <div className="rounded-md bg-background p-3">
                <p className="text-xs text-muted-foreground">Standard 60% Rule</p>
                <p className="text-lg font-bold">{formatCurrency(results.sixtyPctRule)}/mo</p>
              </div>
              <div className="rounded-md bg-background p-3">
                <p className="text-xs text-muted-foreground">Existing Coverage (LTD + Other)</p>
                <p className="text-lg font-bold">{formatCurrency(results.totalExisting)}/mo</p>
              </div>
              <div className={`rounded-md p-3 ${results.hasGap ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" : "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"}`}>
                <p className="text-xs text-muted-foreground">
                  {results.hasGap ? "Coverage Gap (Expenses minus Existing)" : "No Coverage Gap"}
                </p>
                <p className={`text-lg font-bold ${results.hasGap ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                  {results.hasGap ? formatCurrency(results.coverageGap) + "/mo" : "Expenses Covered"}
                </p>
              </div>
            </div>

            {/* Recommended benefit */}
            <div className="rounded-md bg-ember/5 border border-ember/20 p-4 space-y-2">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Recommended Monthly Benefit</p>
                  <p className="text-2xl font-bold text-ember">
                    {formatCurrency(results.recommendedBenefit)}/mo
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">As % of Income</p>
                  <p className="text-lg font-bold">{results.benefitPctOfIncome.toFixed(1)}%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This is the lesser of your coverage gap and the standard 60% policy cap.
                Benefit period: {benefitPeriodLabel(inputs.benefitPeriod, inputs.currentAge)}.
              </p>
              {results.benefitExceedsCap && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Your expenses exceed the typical 60% policy cap. You may need to prioritize
                  essential costs or look for supplemental coverage options.
                </p>
              )}
              {!results.hasGap && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Your existing coverage appears sufficient to cover essential expenses.
                  Consider whether supplemental coverage is still appropriate for your situation.
                </p>
              )}
            </div>

            {/* Premium estimates */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                Estimated Monthly Premium
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    These are rough estimates only. Actual premiums vary significantly by age, health status, gender, smoking status, and occupation class (e.g. office workers pay less than heavy laborers). Own-occupation policies typically cost 20-40% more than any-occupation policies. Get quotes from multiple insurers.
                  </TooltipContent>
                </Tooltip>
              </h4>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Estimates only. Premiums vary by age, health, occupation class, and policy type (own-occupation vs any-occupation).
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {results.premiumEstimates.map((pe) => (
                  <div key={pe.rate} className="rounded-md bg-background p-3 text-center">
                    <p className="text-xs text-muted-foreground">At {pe.rate * 100}% of Salary</p>
                    <p className="text-lg font-bold">{formatCurrency(pe.monthlyPremium)}/mo</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(pe.annualPremium)}/yr
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Total estimated cost over {benefitPeriodLabel(inputs.benefitPeriod, inputs.currentAge)}:{" "}
                {formatCurrency(results.premiumEstimates[1].totalPremium)} at the 2% mid-range rate.
                Actual cost may differ significantly based on underwriting.
              </p>
            </div>

            {/* Own-occupation vs any-occupation info */}
            <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 space-y-2">
              <h4 className="text-sm font-semibold">Own-Occupation vs Any-Occupation</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Own-occupation</strong> policies pay benefits if you cannot perform the duties
                of your specific occupation, even if you can work in another field. These are more
                expensive but offer stronger protection, especially for high-income professionals.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Any-occupation</strong> policies pay only if you cannot perform work in any
                occupation for which you are reasonably qualified by education, training, or
                experience. These cost less but provide narrower coverage.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The premium estimates above are generic. Own-occupation policies typically cost
                20-40% more than any-occupation policies for the same benefit amount. The benefit
                amount itself does not change between the two types, but the definition of
                disability affects when you qualify for payment.
              </p>
            </div>
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
              <ShareButtons summaryText={summaryText} title="Disability Insurance Calculator - CalcForge" />
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}