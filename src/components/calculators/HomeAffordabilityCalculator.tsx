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
import { formatCurrency, reverseSolveMaxPrincipal } from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

type IncomeMode = "annual" | "monthly";
type CalcMode = "by-income" | "by-payment";
type LoanType = "conventional" | "fha";

interface AffordInputs {
  incomeMode: IncomeMode;
  calcMode: CalcMode;
  loanType: LoanType;
  income: number;
  monthlyDebts: number;
  downPayment: number;
  apr: number;
  termYears: number;
  monthlyTaxInsurance: number;
}

interface AffordResult {
  maxMonthlyPayment: number;
  monthlyPI: number;
  maxLoanAmount: number;
  maxHomePrice: number;
  downPaymentAmount: number;
  frontEndRatio: number;
  backEndRatio: number;
  limitingFactor: "front-end" | "back-end";
  taxInsurance: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: AffordInputs = {
  incomeMode: "annual",
  calcMode: "by-income",
  loanType: "conventional",
  income: 100000,
  monthlyDebts: 500,
  downPayment: 40000,
  apr: 6.5,
  termYears: 30,
  monthlyTaxInsurance: 400,
};

/* ─── DTI Limits ─── */

const DTI_LIMITS = {
  conventional: { frontEnd: 28, backEnd: 36 },
  fha: { frontEnd: 31, backEnd: 43 },
} as const;

/* ─── Helpers ─── */

function fmt(n: number): string {
  return formatCurrency(n);
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Given a max PITI payment, back-solve the home price.
 * PITI = PI + T&I  =>  PI = PITI - T&I  =>  maxLoan = PV(PI, rate, term)
 * homePrice = maxLoan + downPayment
 */
function solveMaxPrice(
  maxPITI: number,
  taxInsurance: number,
  downPayment: number,
  apr: number,
  termMonths: number,
): { maxLoan: number; maxPrice: number; monthlyPI: number } {
  const pi = Math.max(0, maxPITI - taxInsurance);
  const maxLoan = reverseSolveMaxPrincipal(pi, apr, termMonths);
  const maxPrice = r2(maxLoan + downPayment);
  return { maxLoan, maxPrice, monthlyPI: pi };
}

/* ─── Component ─── */

export default function HomeAffordabilityCalculator() {
  const [inputs, setInputs] = useState<AffordInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const p = (key: string, fallback: number): number => {
      const v = params.get(key);
      return v ? parseFloat(v) : fallback;
    };
    const s = (key: string, fallback: string): string => {
      const v = params.get(key);
      return v && ["annual", "monthly", "by-income", "by-payment", "conventional", "fha"].includes(v)
        ? v
        : fallback;
    };
    if (!params.get("income") && !params.get("payment")) return DEFAULT_INPUTS;
    return {
      incomeMode: s("incMode", DEFAULT_INPUTS.incomeMode) as IncomeMode,
      calcMode: s("calcMode", DEFAULT_INPUTS.calcMode) as CalcMode,
      loanType: s("loanType", DEFAULT_INPUTS.loanType) as LoanType,
      income: p("income", DEFAULT_INPUTS.income),
      monthlyDebts: p("debts", DEFAULT_INPUTS.monthlyDebts),
      downPayment: p("down", DEFAULT_INPUTS.downPayment),
      apr: p("rate", DEFAULT_INPUTS.apr),
      termYears: p("term", DEFAULT_INPUTS.termYears),
      monthlyTaxInsurance: p("taxIns", DEFAULT_INPUTS.monthlyTaxInsurance),
    };
  });
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const update = useCallback(
    (key: keyof AffordInputs, value: number | string) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    window.history.replaceState({}, "", window.location.pathname);
    toast.success("Calculator reset to defaults");
  }, []);

  const handleCopy = useCallback(() => {
    const params = new URLSearchParams({
      incMode: inputs.incomeMode,
      calcMode: inputs.calcMode,
      loanType: inputs.loanType,
      income: String(inputs.income),
      debts: String(inputs.monthlyDebts),
      down: String(inputs.downPayment),
      rate: String(inputs.apr),
      term: String(inputs.termYears),
      taxIns: String(inputs.monthlyTaxInsurance),
    });
    const url = `${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [inputs]);

  const handlePrint = useCallback(() => window.print(), []);

  /* ─── Core Calculation ─── */
  const result = useMemo((): AffordResult | null => {
    const {
      incomeMode, calcMode, loanType,
      income, monthlyDebts, downPayment,
      apr, termYears, monthlyTaxInsurance,
    } = inputs;

    const limits = DTI_LIMITS[loanType];
    const termMonths = termYears * 12;
    const grossMonthly =
      incomeMode === "annual" ? r2(income / 12) : income;

    if (grossMonthly <= 0 || termMonths <= 0) return null;

    // Max housing payment (front-end DTI cap)
    const maxFrontEnd = r2(grossMonthly * (limits.frontEnd / 100));

    // Max total debt (back-end DTI cap)
    const maxTotalDebt = r2(grossMonthly * (limits.backEnd / 100));
    const maxHousingFromBackEnd = r2(
      Math.max(0, maxTotalDebt - monthlyDebts),
    );

    // The limiting factor is whichever produces the lower housing payment
    let maxMonthlyPayment: number;
    let limitingFactor: "front-end" | "back-end";
    if (maxHousingFromBackEnd < maxFrontEnd) {
      maxMonthlyPayment = maxHousingFromBackEnd;
      limitingFactor = "back-end";
    } else {
      maxMonthlyPayment = maxFrontEnd;
      limitingFactor = "front-end";
    }

    if (calcMode === "by-payment") {
      // User enters target payment directly, ignore DTI
      const target = r2(
        incomeMode === "annual" ? income / 12 : income,
      );
      const { maxLoan, maxPrice, monthlyPI } = solveMaxPrice(
        target, monthlyTaxInsurance, downPayment, apr, termMonths,
      );
      const fe = grossMonthly > 0 ? r2((target / grossMonthly) * 100) : 0;
      const be =
        grossMonthly > 0
          ? r2(((target + monthlyDebts) / grossMonthly) * 100)
          : 0;
      return {
        maxMonthlyPayment: target,
        monthlyPI,
        maxLoanAmount: maxLoan,
        maxHomePrice: maxPrice,
        downPaymentAmount: downPayment,
        frontEndRatio: fe,
        backEndRatio: be,
        limitingFactor: "front-end",
        taxInsurance: monthlyTaxInsurance,
      };
    }

    // Income-based mode: solve for price from DTI-limited payment
    const { maxLoan, maxPrice, monthlyPI } = solveMaxPrice(
      maxMonthlyPayment, monthlyTaxInsurance, downPayment, apr, termMonths,
    );

    return {
      maxMonthlyPayment,
      monthlyPI,
      maxLoanAmount: maxLoan,
      maxHomePrice: maxPrice,
      downPaymentAmount: downPayment,
      frontEndRatio: r2(
        (maxMonthlyPayment / grossMonthly) * 100,
      ),
      backEndRatio: r2(
        ((maxMonthlyPayment + monthlyDebts) / grossMonthly) * 100,
      ),
      limitingFactor,
      taxInsurance: monthlyTaxInsurance,
    };
  }, [inputs]);

  /* ─── FHA comparison when in conventional mode ─── */
  const fhaComparison = useMemo(() => {
    if (inputs.loanType === "fha" || inputs.calcMode !== "by-income") return null;
    const limits = DTI_LIMITS.fha;
    const grossMonthly =
      inputs.incomeMode === "annual"
        ? r2(inputs.income / 12)
        : inputs.income;
    if (grossMonthly <= 0) return null;

    const maxFrontEnd = r2(grossMonthly * (limits.frontEnd / 100));
    const maxTotalDebt = r2(grossMonthly * (limits.backEnd / 100));
    const maxHousingFromBackEnd = r2(
      Math.max(0, maxTotalDebt - inputs.monthlyDebts),
    );
    const maxPayment =
      maxHousingFromBackEnd < maxFrontEnd
        ? maxHousingFromBackEnd
        : maxFrontEnd;
    const termMonths = inputs.termYears * 12;
    const { maxPrice } = solveMaxPrice(
      maxPayment,
      inputs.monthlyTaxInsurance,
      inputs.downPayment,
      inputs.apr,
      termMonths,
    );
    return maxPrice;
  }, [inputs]);

  /* ─── Share text ─── */
  const shareText = useMemo(() => {
    if (!result) return "How much house can you afford? Calculate yours:";
    return `You can afford up to ${fmt(result.maxHomePrice)} with a ${fmt(result.maxMonthlyPayment)}/mo payment. Calculate yours:`;
  }, [result]);

  const grossMonthly =
    inputs.incomeMode === "annual"
      ? r2(inputs.income / 12)
      : inputs.income;

  const limits = DTI_LIMITS[inputs.loanType];

  return (
    <TooltipProvider>
      <div ref={containerRef}>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-ember" />
              Home Affordability Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ── Mode Switch ── */}
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Calculation Mode</Label>
                <div className="flex gap-1">
                  <Button
                    variant={inputs.calcMode === "by-income" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-3"
                    onClick={() => update("calcMode", "by-income")}
                  >
                    By Income
                  </Button>
                  <Button
                    variant={inputs.calcMode === "by-payment" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-3"
                    onClick={() => update("calcMode", "by-payment")}
                  >
                    By Monthly Payment
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Loan Type</Label>
                <div className="flex gap-1">
                  <Button
                    variant={inputs.loanType === "conventional" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-3"
                    onClick={() => update("loanType", "conventional")}
                  >
                    Conventional (28/36)
                  </Button>
                  <Button
                    variant={inputs.loanType === "fha" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-3"
                    onClick={() => update("loanType", "fha")}
                  >
                    FHA (31/43)
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Income or Target Payment ── */}
            {inputs.calcMode === "by-income" ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="income" className="text-sm">
                      Gross {inputs.incomeMode === "annual" ? "Annual" : "Monthly"} Income
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        Your gross income before taxes and deductions. Lenders use
                        gross income, not take-home pay, for DTI calculations.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {inputs.incomeMode === "annual"
                        ? fmt(inputs.income)
                        : fmt(inputs.income) + "/mo"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-1.5 text-muted-foreground"
                      onClick={() =>
                        update(
                          "incomeMode",
                          inputs.incomeMode === "annual" ? "monthly" : "annual",
                        )
                      }
                    >
                      {inputs.incomeMode === "annual" ? "Switch to monthly" : "Switch to annual"}
                    </Button>
                  </div>
                </div>
                <Slider
                  id="income"
                  min={20000}
                  max={500000}
                  step={inputs.incomeMode === "annual" ? 5000 : 500}
                  value={[inputs.income]}
                  onValueChange={([v]) => update("income", v)}
                  aria-label="Gross income"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{inputs.incomeMode === "annual" ? "$20K/yr" : "$2K/mo"}</span>
                  <span>{inputs.incomeMode === "annual" ? "$500K/yr" : "$50K/mo"}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {inputs.incomeMode === "annual" ? "$" : "$"}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={inputs.incomeMode === "annual" ? 1000 : 100}
                    value={inputs.income}
                    onChange={(e) =>
                      update("income", Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-36 h-8 text-sm text-right"
                    aria-label="Income input"
                  />
                  <span className="text-sm text-muted-foreground">
                    {inputs.incomeMode === "annual" ? "per year" : "per month"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="targetPayment" className="text-sm">
                  Target Monthly Payment (PITI)
                </Label>
                <Slider
                  id="targetPayment"
                  min={500}
                  max={5000}
                  step={25}
                  value={[inputs.income]}
                  onValueChange={([v]) => update("income", v)}
                  aria-label="Target monthly payment"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$500/mo</span>
                  <span>$5,000/mo</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    type="number"
                    min={0}
                    step={25}
                    value={inputs.income}
                    onChange={(e) =>
                      update("income", Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-36 h-8 text-sm text-right"
                    aria-label="Target payment input"
                  />
                  <span className="text-sm text-muted-foreground">per month</span>
                </div>
              </div>
            )}

            {/* ── Monthly Debts ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="debts" className="text-sm">
                  Monthly Debt Payments
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Minimum payments on credit cards, auto loans, student loans,
                    personal loans, and any other recurring debt. Do not include
                    utilities, groceries, or the new housing payment.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Slider
                id="debts"
                min={0}
                max={5000}
                step={50}
                value={[inputs.monthlyDebts]}
                onValueChange={([v]) => update("monthlyDebts", v)}
                aria-label="Monthly debt payments"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$5,000</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  min={0}
                  step={50}
                  value={inputs.monthlyDebts}
                  onChange={(e) =>
                    update("monthlyDebts", Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-36 h-8 text-sm text-right"
                  aria-label="Monthly debts input"
                />
                <span className="text-sm text-muted-foreground">per month</span>
              </div>
            </div>

            {/* ── Down Payment ── */}
            <div className="space-y-2">
              <Label htmlFor="down" className="text-sm">
                Down Payment Savings
              </Label>
              <Slider
                id="down"
                min={0}
                max={300000}
                step={1000}
                value={[inputs.downPayment]}
                onValueChange={([v]) => update("downPayment", v)}
                aria-label="Down payment savings"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$300K</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  value={inputs.downPayment}
                  onChange={(e) =>
                    update("downPayment", Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-36 h-8 text-sm text-right"
                  aria-label="Down payment input"
                />
              </div>
            </div>

            {/* ── Rate and Term ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apr" className="text-sm">Interest Rate</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    step={0.125}
                    value={inputs.apr}
                    onChange={(e) =>
                      update("apr", Math.max(1, Math.min(15, Number(e.target.value) || 0)))
                    }
                    className="w-24 h-8 text-sm text-right"
                    id="apr"
                    aria-label="Interest rate"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="term" className="text-sm">Loan Term</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={inputs.termYears === 30 ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8 px-3"
                    onClick={() => update("termYears", 30)}
                  >
                    30 yr
                  </Button>
                  <Button
                    variant={inputs.termYears === 15 ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8 px-3"
                    onClick={() => update("termYears", 15)}
                  >
                    15 yr
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Tax & Insurance ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="taxIns" className="text-sm">
                  Estimated Property Tax + Insurance
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Monthly property tax and homeowner&apos;s insurance. A common
                    estimate is 1.25% of home value per year for tax plus
                    $80-$120/month for insurance. Enter your best estimate here.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Slider
                id="taxIns"
                min={0}
                max={1500}
                step={25}
                value={[inputs.monthlyTaxInsurance]}
                onValueChange={([v]) => update("monthlyTaxInsurance", v)}
                aria-label="Monthly tax and insurance"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span>$1,500/mo</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  min={0}
                  step={25}
                  value={inputs.monthlyTaxInsurance}
                  onChange={(e) =>
                    update("monthlyTaxInsurance", Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-36 h-8 text-sm text-right"
                  aria-label="Tax and insurance input"
                />
                <span className="text-sm text-muted-foreground">per month</span>
              </div>
            </div>

            {/* ── Results ── */}
            {result && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {inputs.calcMode === "by-income"
                    ? `Maximum Affordable Home (28/36${inputs.loanType === "fha" ? " upgraded" : ""})`
                    : "Home Price for Target Payment"}
                </h3>

                <div className="rounded-lg border border-ember/30 bg-ember/5 p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Maximum Home Price
                  </p>
                  <p className="text-3xl font-bold text-ember mt-1">
                    {fmt(result.maxHomePrice)}
                  </p>
                  {inputs.calcMode === "by-income" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Limited by{" "}
                      <strong>
                        {result.limitingFactor === "front-end"
                          ? "front-end DTI"
                          : "back-end DTI (your other debts)"}
                      </strong>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Max Monthly Payment (PITI)
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {fmt(result.maxMonthlyPayment)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      P&I: {fmt(result.monthlyPI)} + T&I: {fmt(result.taxInsurance)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Max Loan Amount
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {fmt(result.maxLoanAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      + {fmt(result.downPaymentAmount)} down payment
                    </p>
                  </div>
                </div>

                {inputs.calcMode === "by-income" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/40 p-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        Front-End DTI
                      </p>
                      <p className="text-lg font-bold">
                        {result.frontEndRatio.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (cap: {limits.frontEnd}%)
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        Back-End DTI
                      </p>
                      <p className="text-lg font-bold">
                        {result.backEndRatio.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (cap: {limits.backEnd}%)
                      </p>
                    </div>
                  </div>
                )}

                {inputs.calcMode === "by-payment" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/40 p-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        Front-End DTI
                      </p>
                      <p className="text-lg font-bold">
                        {result.frontEndRatio.toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 text-center">
                      <p className="text-xs text-muted-foreground">
                        Back-End DTI
                      </p>
                      <p className="text-lg font-bold">
                        {result.backEndRatio.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* FHA comparison */}
                {fhaComparison !== null && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-3">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      FHA Comparison (31/43 DTI Limits)
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                      With FHA&apos;s higher DTI allowance, you could qualify for up
                      to <strong>{fmt(fhaComparison)}</strong> (vs. {fmt(result.maxHomePrice)} conventional).
                      FHA requires a 3.5% minimum down payment and carries mortgage
                      insurance premiums. Switch to FHA mode above to see full details.
                    </p>
                  </div>
                )}

                {/* Conservative note */}
                <p className="text-xs text-muted-foreground">
                  <strong>Disclaimer:</strong> This estimate uses standard DTI
                  guidelines and a fixed interest rate. Actual affordability
                  depends on credit score, lender overlays, property type, and
                  other factors. Consult a lender for a pre-approval.
                </p>
              </div>
            )}

            {/* ── Action Row ── */}
            <div className="flex flex-wrap items-center gap-2 no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs"
              >
                {copied ? (
                  <Check className="mr-1.5 size-3.5" />
                ) : (
                  <Copy className="mr-1.5 size-3.5" />
                )}
                {copied ? "Copied" : "Copy Link"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs"
              >
                <Printer className="mr-1.5 size-3.5" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <RotateCcw className="mr-1.5 size-3.5" />
                Reset
              </Button>
              <div className="ml-auto">
                <ShareButtons summaryText={shareText} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}