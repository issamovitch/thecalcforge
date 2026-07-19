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
import { toast } from "sonner";
import { formatCurrency } from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

interface LifeInputs {
  annualIncome: number;
  yearsToReplace: number;
  stayAtHomeParent: boolean;
  replacementServicesCost: number;
  outstandingDebts: number;
  mortgageBalance: number;
  numChildren: number;
  educationCostPerChild: number;
  finalExpenses: number;
  existingCoverage: number;
  savings: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: LifeInputs = {
  annualIncome: 75000,
  yearsToReplace: 10,
  stayAtHomeParent: false,
  replacementServicesCost: 30000,
  outstandingDebts: 20000,
  mortgageBalance: 250000,
  numChildren: 2,
  educationCostPerChild: 50000,
  finalExpenses: 15000,
  existingCoverage: 100000,
  savings: 35000,
};

/** Round up to the nearest $50,000 band. */
function roundToBand(n: number): number {
  if (n <= 0) return 0;
  return Math.ceil(n / 50000) * 50000;
}

/* ─── URL Param Helpers ─── */

function readParams(): LifeInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const p = new URLSearchParams(window.location.search);
  return {
    annualIncome: Number(p.get("income")) || DEFAULT_INPUTS.annualIncome,
    yearsToReplace: Number(p.get("years")) || DEFAULT_INPUTS.yearsToReplace,
    stayAtHomeParent: p.get("sah") === "1",
    replacementServicesCost: Number(p.get("svc")) || DEFAULT_INPUTS.replacementServicesCost,
    outstandingDebts: Number(p.get("debts")) || DEFAULT_INPUTS.outstandingDebts,
    mortgageBalance: Number(p.get("mortgage")) || DEFAULT_INPUTS.mortgageBalance,
    numChildren: Number(p.get("kids")) || DEFAULT_INPUTS.numChildren,
    educationCostPerChild: Number(p.get("edu")) || DEFAULT_INPUTS.educationCostPerChild,
    finalExpenses: Number(p.get("final")) || DEFAULT_INPUTS.finalExpenses,
    existingCoverage: Number(p.get("existing")) || DEFAULT_INPUTS.existingCoverage,
    savings: Number(p.get("savings")) || DEFAULT_INPUTS.savings,
  };
}

function toParams(i: LifeInputs): string {
  const p = new URLSearchParams();
  if (i.annualIncome !== DEFAULT_INPUTS.annualIncome) p.set("income", String(i.annualIncome));
  if (i.yearsToReplace !== DEFAULT_INPUTS.yearsToReplace) p.set("years", String(i.yearsToReplace));
  if (i.stayAtHomeParent) p.set("sah", "1");
  if (i.replacementServicesCost !== DEFAULT_INPUTS.replacementServicesCost) p.set("svc", String(i.replacementServicesCost));
  if (i.outstandingDebts !== DEFAULT_INPUTS.outstandingDebts) p.set("debts", String(i.outstandingDebts));
  if (i.mortgageBalance !== DEFAULT_INPUTS.mortgageBalance) p.set("mortgage", String(i.mortgageBalance));
  if (i.numChildren !== DEFAULT_INPUTS.numChildren) p.set("kids", String(i.numChildren));
  if (i.educationCostPerChild !== DEFAULT_INPUTS.educationCostPerChild) p.set("edu", String(i.educationCostPerChild));
  if (i.finalExpenses !== DEFAULT_INPUTS.finalExpenses) p.set("final", String(i.finalExpenses));
  if (i.existingCoverage !== DEFAULT_INPUTS.existingCoverage) p.set("existing", String(i.existingCoverage));
  if (i.savings !== DEFAULT_INPUTS.savings) p.set("savings", String(i.savings));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/* ─── Dollar Input Sub-component ─── */

function DollarInput({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 9999999,
  step = 1000,
  tooltip,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="pl-7"
        />
      </div>
    </div>
  );
}

/* ─── Component ─── */

export default function LifeInsuranceCalculator() {
  const [inputs, setInputs] = useState<LifeInputs>(readParams);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const update = useCallback(
    (patch: Partial<LifeInputs>) => {
      setInputs((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  /* ─── Computation ─── */
  const results = useMemo(() => {
    const incomeReplacement = inputs.stayAtHomeParent
      ? 0
      : inputs.annualIncome * inputs.yearsToReplace;

    const replacementServices = inputs.stayAtHomeParent || inputs.annualIncome === 0
      ? inputs.replacementServicesCost * inputs.yearsToReplace
      : 0;

    const education = inputs.numChildren * inputs.educationCostPerChild;

    const dimeTotal =
      inputs.outstandingDebts +
      incomeReplacement +
      inputs.mortgageBalance +
      education +
      inputs.finalExpenses +
      replacementServices;

    const tenXRule = inputs.annualIncome * 10;

    const whatYouHave = inputs.existingCoverage + inputs.savings;
    const gap = Math.max(dimeTotal - whatYouHave, 0);
    const recommended = roundToBand(gap);

    return {
      incomeReplacement,
      replacementServices,
      education,
      dimeTotal,
      tenXRule,
      whatYouHave,
      gap,
      recommended,
      isRounded: recommended !== gap && gap > 0,
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
    return `DIME method: ${formatCurrency(results.dimeTotal)} total need, ${formatCurrency(results.recommended)} recommended coverage. Calculate yours:`;
  }, [results]);

  const isActive = inputs.stayAtHomeParent || inputs.annualIncome === 0;

  return (
    <TooltipProvider>
      <Card className="w-full" id="calculator">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-ember" />
            Calculate Your Coverage Need
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ── Inputs ── */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Annual Income */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="annualIncome" className="text-sm font-medium">
                  Annual Income
                </Label>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(inputs.annualIncome)}
                </span>
              </div>
              <Slider
                id="annualIncome"
                min={0}
                max={500000}
                step={5000}
                value={[inputs.annualIncome]}
                onValueChange={([v]) => update({ annualIncome: v })}
                aria-label="Annual income"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$500,000</span>
              </div>
            </div>

            {/* Years to Replace */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="yearsToReplace" className="text-sm font-medium">
                    Years of Income to Replace
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      How many years your family would need income replacement. A common choice is until your youngest child is financially independent, often 10-20 years.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {inputs.yearsToReplace}
                </span>
              </div>
              <Slider
                id="yearsToReplace"
                min={1}
                max={30}
                step={1}
                value={[inputs.yearsToReplace]}
                onValueChange={([v]) => update({ yearsToReplace: v })}
                aria-label="Years of income to replace"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 year</span>
                <span>30 years</span>
              </div>
            </div>

            {/* Stay-at-Home Parent Toggle + Replacement Services */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={inputs.stayAtHomeParent}
                  onClick={() => update({ stayAtHomeParent: !inputs.stayAtHomeParent })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 ${inputs.stayAtHomeParent ? "bg-ember" : "bg-muted"}`}
                >
                  <span className={`pointer-events-none block size-4 rounded-full bg-white shadow-lg transition-transform ${inputs.stayAtHomeParent ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <Label className="text-sm font-medium cursor-pointer" onClick={() => update({ stayAtHomeParent: !inputs.stayAtHomeParent })}>
                  Stay-at-Home Parent
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Enables replacement-services costing instead of income replacement. Covers childcare, household management, and other services a stay-at-home parent provides. The default is $30,000/year, adjustable below.
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {(inputs.stayAtHomeParent || inputs.annualIncome === 0) && (
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="replacementServicesCost" className="text-sm font-medium">
                    Annual Replacement Services Cost
                  </Label>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(inputs.replacementServicesCost)}
                  </span>
                </div>
                <Slider
                  id="replacementServicesCost"
                  min={5000}
                  max={100000}
                  step={1000}
                  value={[inputs.replacementServicesCost]}
                  onValueChange={([v]) => update({ replacementServicesCost: v })}
                  aria-label="Annual replacement services cost"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$5,000</span>
                  <span>$100,000</span>
                </div>
              </div>
            )}

            {/* Debts */}
            <DollarInput
              id="outstandingDebts"
              label="Outstanding Debts (excl. mortgage)"
              value={inputs.outstandingDebts}
              onChange={(v) => update({ outstandingDebts: v })}
              tooltip="Credit cards, auto loans, student loans, personal loans. Do not include your mortgage balance, which has its own field."
            />

            {/* Mortgage */}
            <DollarInput
              id="mortgageBalance"
              label="Mortgage Balance"
              value={inputs.mortgageBalance}
              onChange={(v) => update({ mortgageBalance: v })}
              tooltip="Remaining principal on your home mortgage(s). If you rent or own your home outright, enter $0."
            />

            {/* Children count + education cost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="numChildren" className="text-sm font-medium">
                  Number of Children
                </Label>
                <span className="text-sm font-semibold text-foreground">
                  {inputs.numChildren}
                </span>
              </div>
              <Slider
                id="numChildren"
                min={0}
                max={8}
                step={1}
                value={[inputs.numChildren]}
                onValueChange={([v]) => update({ numChildren: v })}
                aria-label="Number of children"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>8</span>
              </div>
            </div>

            <DollarInput
              id="educationCostPerChild"
              label="Education Cost per Child"
              value={inputs.educationCostPerChild}
              onChange={(v) => update({ educationCostPerChild: v })}
              tooltip="Estimated total cost per child for college or other post-secondary education. The national average for a four-year public university (in-state) is roughly $40,000-$50,000 when adjusting for inflation over 18 years."
            />

            {/* Final Expenses */}
            <DollarInput
              id="finalExpenses"
              label="Final Expenses"
              value={inputs.finalExpenses}
              onChange={(v) => update({ finalExpenses: v })}
              tooltip="Funeral costs, medical bills, and estate settlement expenses. The national median funeral cost is roughly $8,000-$9,000, though total final expenses including medical and legal fees often reach $15,000 or more."
            />

            {/* Existing Coverage */}
            <DollarInput
              id="existingCoverage"
              label="Existing Life Insurance Coverage"
              value={inputs.existingCoverage}
              onChange={(v) => update({ existingCoverage: v })}
              tooltip="Total death benefit from current policies, including employer-provided group life insurance. Check your benefits summary."
            />

            {/* Savings */}
            <DollarInput
              id="savings"
              label="Savings and Investments"
              value={inputs.savings}
              onChange={(v) => update({ savings: v })}
              tooltip="Liquid assets your family could use to offset the coverage need, such as emergency savings, brokerage accounts, and 529 plans. Exclude retirement accounts with early-withdrawal penalties."
            />
          </div>

          {/* ── Results ── */}
          <div ref={resultRef} className="rounded-lg border bg-muted/30 p-5 space-y-4">
            <h3 className="text-base font-semibold">Results</h3>

            {/* Three result cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {/* Total DIME Need */}
              <div className="rounded-md bg-background p-3">
                <p className="text-xs text-muted-foreground">Total Need (DIME)</p>
                <p className="text-lg font-bold">{formatCurrency(results.dimeTotal)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  10x income rule: {formatCurrency(results.tenXRule)}
                </p>
              </div>

              {/* What You Have */}
              <div className="rounded-md bg-background p-3">
                <p className="text-xs text-muted-foreground">What You Already Have</p>
                <p className="text-lg font-bold">{formatCurrency(results.whatYouHave)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(inputs.existingCoverage)} coverage + {formatCurrency(inputs.savings)} savings
                </p>
              </div>

              {/* Recommended Additional */}
              <div className={`rounded-md p-3 ${results.recommended > 0 ? "bg-ember/5 border border-ember/20" : "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"}`}>
                <p className="text-xs text-muted-foreground">Recommended Additional Coverage</p>
                <p className={`text-lg font-bold ${results.recommended > 0 ? "text-ember" : "text-emerald-700 dark:text-emerald-400"}`}>
                  {results.recommended > 0
                    ? formatCurrency(results.recommended)
                    : "None Needed"}
                </p>
                {results.isRounded && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rounded up to nearest $50K band
                  </p>
                )}
              </div>
            </div>

            {/* DIME breakdown */}
            <div className="rounded-md bg-background p-3 space-y-1.5">
              <h4 className="text-sm font-semibold">DIME Breakdown</h4>
              <div className="grid gap-1 text-xs sm:grid-cols-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">D - Debts</span>
                  <span className="font-medium">{formatCurrency(inputs.outstandingDebts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    I - {isActive ? "Replacement Services" : "Income Replacement"}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(isActive ? results.replacementServices : results.incomeReplacement)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">M - Mortgage</span>
                  <span className="font-medium">{formatCurrency(inputs.mortgageBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">E - Education ({inputs.numChildren} child{inputs.numChildren !== 1 ? "ren" : ""})</span>
                  <span className="font-medium">{formatCurrency(results.education)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Final Expenses</span>
                  <span className="font-medium">{formatCurrency(inputs.finalExpenses)}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-semibold">Total Need</span>
                  <span className="font-bold">{formatCurrency(results.dimeTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Less: Existing Coverage + Savings</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatCurrency(results.whatYouHave)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-semibold">Coverage Gap</span>
                  <span className="font-bold">{formatCurrency(results.gap)}</span>
                </div>
              </div>
              {results.recommended > 0 && results.recommended !== results.gap && (
                <p className="text-xs text-muted-foreground pt-1">
                  Term policies are commonly sold in $50,000 bands. The recommended amount above is rounded up from {formatCurrency(results.gap)} to the next band.
                </p>
              )}
            </div>

            {results.recommended === 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Your existing life insurance and savings appear sufficient to cover the DIME need.
                Review periodically as debts decrease and children grow.
              </p>
            )}

            {/* YMYL note */}
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              This calculator estimates coverage need only. Premiums and insurability vary by age, health, gender, smoking status, and insurer. The death benefit is not guaranteed until you are approved through underwriting.
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
              <ShareButtons summaryText={summaryText} title="Life Insurance Calculator - CalcForge" />
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}