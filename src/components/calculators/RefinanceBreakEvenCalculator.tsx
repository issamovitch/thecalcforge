"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw, Info, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { formatCurrency, calculateLoan, formatPercent } from "@/lib/loan-math";
import type { AmortizationRow } from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

type ClosingCostMode = "dollar" | "pct";

interface RefinanceInputs {
  balance: number;
  curRate: number;
  curPayment: number; // 0 = auto
  curRemainingMonths: number; // 0 = auto
  newRate: number;
  newTermYears: 10 | 15 | 20 | 25 | 30;
  closingCostMode: ClosingCostMode;
  closingCostDollar: number;
  closingCostPct: number;
  enableCashout: boolean;
  cashoutAmount: number;
  plannedYears: number;
}

interface RefinanceResult {
  // Current loan resolved
  currentMonthlyPayment: number;
  currentRemainingMonths: number;
  currentTotalInterest: number;
  // New loan
  newLoanAmount: number;
  newMonthlyPayment: number;
  newTermMonths: number;
  newTotalInterest: number;
  // Savings
  monthlySavings: number;
  breakEvenMonths: number | null; // null = never
  interestSaved: number;
  // Flags
  termReset: boolean;
  termResetExtraMonths: number;
  // Worth it
  worthIt: boolean;
  worthItText: string;
}

/* ─── Defaults ─── */

const DEFAULT_INPUTS: RefinanceInputs = {
  balance: 300000,
  curRate: 7,
  curPayment: 0,
  curRemainingMonths: 0,
  newRate: 6,
  newTermYears: 30,
  closingCostMode: "dollar",
  closingCostDollar: 6000,
  closingCostPct: 2,
  enableCashout: false,
  cashoutAmount: 0,
  plannedYears: 10,
};

const TERM_OPTIONS: (10 | 15 | 20 | 25 | 30)[] = [10, 15, 20, 25, 30];

/* ─── Helpers ─── */

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function monthsToText(m: number): string {
  if (m < 12) return `${m} month${m !== 1 ? "s" : ""}`;
  const yrs = Math.floor(m / 12);
  const mos = m % 12;
  if (mos === 0) return `${yrs} year${yrs !== 1 ? "s" : ""}`;
  return `${yrs} yr${yrs !== 1 ? "s" : ""} ${mos} mo`;
}

function formatBalanceShort(balance: number): string {
  if (balance >= 1000000) return `$${(balance / 1000000).toFixed(1)}M`;
  return `$${Math.round(balance / 1000)}K`;
}

/* ─── Computation ─── */

function computeRefinance(inputs: RefinanceInputs): RefinanceResult {
  const { balance, curRate, curPayment, curRemainingMonths, newRate, newTermYears, closingCostMode, closingCostDollar, closingCostPct, enableCashout, cashoutAmount, plannedYears } = inputs;

  if (balance <= 0 || curRate <= 0 || newRate <= 0) {
    return emptyResult();
  }

  const monthlyRate = curRate / 100 / 12;
  const newMonthlyRate = newRate / 100 / 12;

  // ── A. Resolve current loan payment and remaining term ──

  let currentMonthlyPayment: number;
  let currentRemainingMonths: number;
  let currentTotalInterest: number;

  const hasCustomPayment = curPayment > 0;
  const hasCustomTerm = curRemainingMonths > 0;

  if (hasCustomPayment && hasCustomTerm) {
    // Use both as provided
    currentMonthlyPayment = r2(curPayment);
    currentRemainingMonths = curRemainingMonths;
    // Compute total interest for remaining term
    currentTotalInterest = computeRemainingInterest(balance, monthlyRate, currentMonthlyPayment, currentRemainingMonths);
  } else if (hasCustomPayment && !hasCustomTerm) {
    // Given payment, find remaining term by running amortization
    currentMonthlyPayment = r2(curPayment);
    const firstInterest = balance * monthlyRate;
    if (currentMonthlyPayment <= firstInterest) {
      // Payment too low, never pays off
      return { ...emptyResult(), worthItText: "Current payment is too low to pay off the loan." };
    }
    const { schedule } = runAmortization(balance, monthlyRate, currentMonthlyPayment);
    currentRemainingMonths = schedule.length;
    currentTotalInterest = r2(schedule.reduce((s, r) => s + r.interest, 0));
  } else if (!hasCustomPayment && hasCustomTerm) {
    // Given term, compute payment
    currentRemainingMonths = curRemainingMonths;
    currentMonthlyPayment = computePayment(balance, monthlyRate, currentRemainingMonths);
    const { schedule } = calculateLoan({ loanAmount: balance, apr: curRate, termMonths: currentRemainingMonths });
    currentTotalInterest = r2(schedule.reduce((s, r) => s + r.interest, 0));
  } else {
    // Neither provided: assume original 30-year term, find remaining term
    const originalTerm = 360; // 30 years
    const originalPayment = computePayment(balance, monthlyRate, originalTerm);
    // Build full schedule for 30 years
    const fullSchedule = calculateLoan({ loanAmount: balance, apr: curRate, termMonths: originalTerm }).schedule;
    // Find the month where the balance first drops to the current balance
    // Actually, the balance IS the current balance, so we need to figure out
    // where we are. Since balance = current remaining, the remaining term is
    // however many months it takes to amortize this balance at this rate.
    // With a 30-yr original term, the payment is based on the original loan amount.
    // But we only have the current balance, not the original amount.
    // The simplest approach: use the payment from a 30-year amortization of the CURRENT balance
    // and compute remaining months from that.
    // Actually, we should assume the payment is what was set for the original 30-year term.
    // Since we don't know the original loan amount, we compute the payment for a 30-year
    // amortization of the current balance (which is what matters going forward).
    const assumedPayment = computePayment(balance, monthlyRate, originalTerm);
    currentMonthlyPayment = r2(assumedPayment);
    const { schedule } = runAmortization(balance, monthlyRate, currentMonthlyPayment);
    currentRemainingMonths = schedule.length;
    currentTotalInterest = r2(schedule.reduce((s, r) => s + r.interest, 0));
  }

  // ── B. New loan ──

  const closingCosts = closingCostMode === "dollar"
    ? closingCostDollar
    : r2((balance * closingCostPct) / 100);

  const cashout = enableCashout ? cashoutAmount : 0;
  const newLoanAmount = r2(balance + closingCosts + cashout);
  const newTermMonths = newTermYears * 12;

  let newMonthlyPayment: number;
  if (newMonthlyRate === 0) {
    newMonthlyPayment = r2(newLoanAmount / newTermMonths);
  } else {
    const factor = Math.pow(1 + newMonthlyRate, newTermMonths);
    newMonthlyPayment = r2((newLoanAmount * newMonthlyRate * factor) / (factor - 1));
  }

  const newSchedule = calculateLoan({ loanAmount: newLoanAmount, apr: newRate, termMonths: newTermMonths }).schedule;
  const newTotalInterest = r2(newSchedule.reduce((s, r) => s + r.interest, 0));

  // ── C. Break-even ──

  const monthlySavings = r2(currentMonthlyPayment - newMonthlyPayment);
  const breakEvenMonths = monthlySavings > 0 ? r2(closingCosts / monthlySavings) : null;

  // ── D. Interest comparison ──

  const interestSaved = r2(currentTotalInterest - newTotalInterest);
  const termReset = newTermMonths > currentRemainingMonths;
  const termResetExtraMonths = termReset ? newTermMonths - currentRemainingMonths : 0;

  // ── F. Worth-it decision ──

  let worthIt = false;
  let worthItText = "";

  if (monthlySavings <= 0) {
    worthIt = false;
    worthItText = "Refinancing does not reduce your monthly payment";
  } else if (breakEvenMonths === null) {
    worthIt = false;
    worthItText = "Unable to calculate break-even point";
  } else if (breakEvenMonths < plannedYears * 12) {
    worthIt = true;
    worthItText = `Worth it - you break even in ${monthsToText(breakEvenMonths)}, well before you plan to move`;
  } else {
    worthIt = false;
    worthItText = "Not worth it at this point - you would move before breaking even";
  }

  return {
    currentMonthlyPayment,
    currentRemainingMonths,
    currentTotalInterest,
    newLoanAmount,
    newMonthlyPayment,
    newTermMonths,
    newTotalInterest,
    monthlySavings,
    breakEvenMonths,
    interestSaved,
    termReset,
    termResetExtraMonths,
    worthIt,
    worthItText,
  };
}

function emptyResult(): RefinanceResult {
  return {
    currentMonthlyPayment: 0,
    currentRemainingMonths: 0,
    currentTotalInterest: 0,
    newLoanAmount: 0,
    newMonthlyPayment: 0,
    newTermMonths: 0,
    newTotalInterest: 0,
    monthlySavings: 0,
    breakEvenMonths: null,
    interestSaved: 0,
    termReset: false,
    termResetExtraMonths: 0,
    worthIt: false,
    worthItText: "",
  };
}

function computePayment(principal: number, monthlyRate: number, termMonths: number): number {
  if (monthlyRate === 0) return principal / termMonths;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function runAmortization(balance: number, monthlyRate: number, payment: number): { schedule: AmortizationRow[] } {
  const schedule: AmortizationRow[] = [];
  let remaining = balance;
  let month = 0;
  const maxMonths = 600;

  while (remaining > 0 && month < maxMonths) {
    month++;
    const interest = remaining * monthlyRate;
    const principal = payment - interest;

    if (principal >= remaining) {
      schedule.push({
        month,
        payment: r2(remaining + interest),
        principal: r2(remaining),
        interest: r2(interest),
        balance: 0,
      });
      break;
    }

    remaining -= principal;
    schedule.push({
      month,
      payment: r2(payment),
      principal: r2(principal),
      interest: r2(interest),
      balance: r2(remaining),
    });
  }

  return { schedule };
}

function computeRemainingInterest(balance: number, monthlyRate: number, payment: number, remainingMonths: number): number {
  let remaining = balance;
  let totalInterest = 0;

  for (let m = 1; m <= remainingMonths; m++) {
    const interest = remaining * monthlyRate;
    const principal = payment - interest;

    if (principal >= remaining) {
      totalInterest += interest;
      break;
    }

    remaining -= principal;
    totalInterest += interest;
  }

  return r2(totalInterest);
}

export const DEFAULT_RESULT = computeRefinance(DEFAULT_INPUTS);

/* ─── Component ─── */

export default function RefinanceBreakEvenCalculator() {
  const [inputs, setInputs] = useState<RefinanceInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const bal = params.get("balance");
    const cr = params.get("curRate");
    const nr = params.get("newRate");
    const nt = params.get("newTerm");
    const co = params.get("costs");
    const ca = params.get("cashout");
    const yr = params.get("years");
    if (!bal && !cr && !nr && !nt && !co && !ca && !yr)
      return DEFAULT_INPUTS;
    const termVal = nt ? parseInt(nt, 10) as 10 | 15 | 20 | 25 | 30 : DEFAULT_INPUTS.newTermYears;
    const validTerm = (TERM_OPTIONS.includes(termVal) ? termVal : DEFAULT_INPUTS.newTermYears) as 10 | 15 | 20 | 25 | 30;
    return {
      balance: bal ? parseFloat(bal) : DEFAULT_INPUTS.balance,
      curRate: cr ? parseFloat(cr) : DEFAULT_INPUTS.curRate,
      curPayment: DEFAULT_INPUTS.curPayment,
      curRemainingMonths: DEFAULT_INPUTS.curRemainingMonths,
      newRate: nr ? parseFloat(nr) : DEFAULT_INPUTS.newRate,
      newTermYears: validTerm,
      closingCostMode: DEFAULT_INPUTS.closingCostMode,
      closingCostDollar: co ? parseFloat(co) : DEFAULT_INPUTS.closingCostDollar,
      closingCostPct: DEFAULT_INPUTS.closingCostPct,
      enableCashout: ca ? parseFloat(ca) > 0 : DEFAULT_INPUTS.enableCashout,
      cashoutAmount: ca ? parseFloat(ca) : DEFAULT_INPUTS.cashoutAmount,
      plannedYears: yr ? parseInt(yr, 10) : DEFAULT_INPUTS.plannedYears,
    };
  });
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeRefinance(inputs), [inputs]);

  // Sync URL (skip initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("balance", inputs.balance.toString());
    params.set("curRate", inputs.curRate.toString());
    params.set("newRate", inputs.newRate.toString());
    params.set("newTerm", inputs.newTermYears.toString());
    params.set("costs", inputs.closingCostMode === "dollar" ? inputs.closingCostDollar.toString() : inputs.closingCostPct.toString());
    if (inputs.enableCashout && inputs.cashoutAmount > 0) {
      params.set("cashout", inputs.cashoutAmount.toString());
    }
    params.set("years", inputs.plannedYears.toString());
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [inputs]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    toast.success("Calculator reset to defaults");
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleInputChange = useCallback(
    (field: keyof RefinanceInputs, value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) return;
      setInputs((prev) => ({ ...prev, [field]: num }));
    },
    [],
  );

  const handleCostModeToggle = useCallback(() => {
    setInputs((prev) => {
      const newMode: ClosingCostMode = prev.closingCostMode === "dollar" ? "pct" : "dollar";
      const closingCostDollar =
        newMode === "pct"
          ? r2((prev.balance * prev.closingCostPct) / 100)
          : prev.closingCostDollar;
      const closingCostPct =
        newMode === "dollar"
          ? r2((prev.closingCostDollar / prev.balance) * 100)
          : prev.closingCostPct;
      return { ...prev, closingCostMode: newMode, closingCostDollar, closingCostPct };
    });
  }, []);

  const closingCosts = inputs.closingCostMode === "dollar"
    ? inputs.closingCostDollar
    : r2((inputs.balance * inputs.closingCostPct) / 100);

  const summaryText = useMemo(() => {
    const balShort = formatBalanceShort(inputs.balance);
    const savings = result.monthlySavings > 0
      ? `${formatCurrency(result.monthlySavings)}/mo savings`
      : "no monthly savings";
    const be = result.breakEvenMonths !== null
      ? `${Math.round(result.breakEvenMonths)}-month break-even`
      : "no break-even";
    return `${balShort} balance, ${formatPercent(inputs.curRate)} to ${formatPercent(inputs.newRate)} = ${savings}, ${be}. Calculate yours:`;
  }, [inputs, result]);

  return (
    <TooltipProvider delayDuration={300}>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              Refinance Break-Even Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare your current mortgage with a refinanced loan to see if
              refinancing saves you money and when you break even on closing costs.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Current Loan Balance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="balance" className="text-sm font-medium">
                        Current Loan Balance
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The outstanding principal balance on your current mortgage.
                          Check your latest statement for the exact amount.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.balance)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="balance"
                      min={10000}
                      max={1000000}
                      step={5000}
                      value={[inputs.balance]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, balance: v }))
                      }
                      aria-label="Current loan balance"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$10,000</span>
                      <span>$1,000,000</span>
                    </div>
                    <Input
                      type="number"
                      min={10000}
                      max={1000000}
                      step={5000}
                      value={inputs.balance}
                      onChange={(e) => handleInputChange("balance", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Current Interest Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="cur-rate" className="text-sm font-medium">
                        Current Interest Rate
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The annual interest rate on your current mortgage.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPercent(inputs.curRate)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="cur-rate"
                      min={0}
                      max={15}
                      step={0.125}
                      value={[inputs.curRate]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, curRate: r2(v) }))
                      }
                      aria-label="Current interest rate"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>15%</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={15}
                      step={0.125}
                      value={inputs.curRate}
                      onChange={(e) => handleInputChange("curRate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Current Monthly Payment (optional override) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="cur-payment" className="text-sm font-medium">
                      Current Monthly Payment
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Leave at 0 to auto-calculate from your balance and rate.
                        Enter your actual payment only if you want to override
                        the calculated value.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="no-print">
                    <Input
                      id="cur-payment"
                      type="number"
                      min={0}
                      step={1}
                      placeholder={inputs.curPayment === 0 ? "Auto-calculated" : ""}
                      value={inputs.curPayment || ""}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        if (isNaN(n) || e.target.value === "") {
                          setInputs((p) => ({ ...p, curPayment: 0 }));
                        } else {
                          setInputs((p) => ({ ...p, curPayment: Math.max(0, n) }));
                        }
                      }}
                    />
                    {inputs.curPayment === 0 && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Auto-calculated: {formatCurrency(result.currentMonthlyPayment)}/mo
                      </p>
                    )}
                  </div>
                </div>

                {/* Current Remaining Term (optional override) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="cur-term" className="text-sm font-medium">
                      Current Remaining Term (months)
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Leave at 0 to auto-calculate. Enter the number of
                        months remaining on your current loan to override.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="no-print">
                    <Input
                      id="cur-term"
                      type="number"
                      min={0}
                      max={480}
                      step={1}
                      placeholder={inputs.curRemainingMonths === 0 ? "Auto-calculated" : ""}
                      value={inputs.curRemainingMonths || ""}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        if (isNaN(n) || e.target.value === "") {
                          setInputs((p) => ({ ...p, curRemainingMonths: 0 }));
                        } else {
                          setInputs((p) => ({ ...p, curRemainingMonths: Math.max(0, n) }));
                        }
                      }}
                    />
                    {inputs.curRemainingMonths === 0 && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Auto-calculated: {monthsToText(result.currentRemainingMonths)}
                      </p>
                    )}
                  </div>
                </div>

                {/* New Interest Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="new-rate" className="text-sm font-medium">
                        New Interest Rate
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The interest rate on the new refinanced mortgage.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPercent(inputs.newRate)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="new-rate"
                      min={0}
                      max={15}
                      step={0.125}
                      value={[inputs.newRate]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, newRate: r2(v) }))
                      }
                      aria-label="New interest rate"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>15%</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={15}
                      step={0.125}
                      value={inputs.newRate}
                      onChange={(e) => handleInputChange("newRate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* New Loan Term */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="new-term" className="text-sm font-medium">
                      New Loan Term
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        The loan term for the new mortgage. Choosing a shorter
                        term means higher payments but less total interest.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="no-print flex flex-wrap gap-2">
                    {TERM_OPTIONS.map((yr) => (
                      <Button
                        key={yr}
                        type="button"
                        variant={inputs.newTermYears === yr ? "default" : "outline"}
                        size="sm"
                        onClick={() => setInputs((p) => ({ ...p, newTermYears: yr }))}
                        className="flex-1 min-w-0"
                      >
                        {yr} years
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Closing Costs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="closing-costs" className="text-sm font-medium">
                        Refinance Closing Costs
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Typical closing costs for refinancing range from 2% to
                          6% of the loan amount, or roughly $3,000 to $10,000+.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.closingCostMode === "dollar"
                        ? formatCurrency(inputs.closingCostDollar)
                        : `${inputs.closingCostPct}% (${formatCurrency(closingCosts)})`}
                    </span>
                  </div>
                  <div className="no-print">
                    {inputs.closingCostMode === "dollar" ? (
                      <>
                        <Slider
                          id="closing-costs"
                          min={0}
                          max={50000}
                          step={500}
                          value={[inputs.closingCostDollar]}
                          onValueChange={([v]) =>
                            setInputs((p) => {
                              const pct = p.balance > 0 ? r2((v / p.balance) * 100) : 0;
                              return { ...p, closingCostDollar: v, closingCostPct: pct };
                            })
                          }
                          aria-label="Closing costs dollar amount"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>$0</span>
                          <span>$50,000</span>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={50000}
                          step={500}
                          value={inputs.closingCostDollar}
                          onChange={(e) => {
                            const n = parseFloat(e.target.value);
                            if (!isNaN(n)) {
                              const pct = inputs.balance > 0 ? r2((n / inputs.balance) * 100) : 0;
                              setInputs((p) => ({ ...p, closingCostDollar: Math.max(0, n), closingCostPct: pct }));
                            }
                          }}
                          className="mt-1"
                        />
                      </>
                    ) : (
                      <>
                        <Slider
                          id="closing-costs"
                          min={0}
                          max={10}
                          step={0.25}
                          value={[inputs.closingCostPct]}
                          onValueChange={([v]) =>
                            setInputs((p) => ({
                              ...p,
                              closingCostPct: v,
                              closingCostDollar: r2((p.balance * v) / 100),
                            }))
                          }
                          aria-label="Closing costs percentage"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>10%</span>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          step={0.25}
                          value={inputs.closingCostPct}
                          onChange={(e) => {
                            const n = parseFloat(e.target.value);
                            if (!isNaN(n)) {
                              setInputs((p) => ({
                                ...p,
                                closingCostPct: n,
                                closingCostDollar: r2((p.balance * n) / 100),
                              }));
                            }
                          }}
                          className="mt-1"
                        />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleCostModeToggle}
                      className="inline-flex items-center gap-1 text-xs text-ember hover:text-ember-hover transition-colors mt-1 cursor-pointer"
                    >
                      Switch to{" "}
                      {inputs.closingCostMode === "dollar" ? "percentage" : "dollar amount"}
                    </button>
                  </div>
                </div>

                {/* Cash-Out Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 no-print">
                    <Checkbox
                      id="cashout-toggle"
                      checked={inputs.enableCashout}
                      onCheckedChange={(checked) =>
                        setInputs((p) => ({ ...p, enableCashout: !!checked }))
                      }
                    />
                    <Label
                      htmlFor="cashout-toggle"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Include Cash-Out
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        If you want to take cash out during the refinance,
                        enable this and enter the amount. Cash-out increases
                        your new loan balance and monthly payment.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {inputs.enableCashout && (
                    <div className="no-print space-y-1 ml-6">
                      <Slider
                        min={0}
                        max={500000}
                        step={1000}
                        value={[inputs.cashoutAmount]}
                        onValueChange={([v]) =>
                          setInputs((p) => ({ ...p, cashoutAmount: v }))
                        }
                        aria-label="Cash-out amount"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>$0</span>
                        <span>$500,000</span>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={500000}
                        step={1000}
                        value={inputs.cashoutAmount}
                        onChange={(e) => handleInputChange("cashoutAmount", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Planned Years in Home */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="planned-years" className="text-sm font-medium">
                        Planned Years in Home
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          How many more years you plan to stay in the home.
                          Used to determine if refinancing is worth it before
                          you move.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.plannedYears} {inputs.plannedYears === 1 ? "year" : "years"}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="planned-years"
                      min={1}
                      max={30}
                      step={1}
                      value={[inputs.plannedYears]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, plannedYears: v }))
                      }
                      aria-label="Planned years in home"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 year</span>
                      <span>30 years</span>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      value={inputs.plannedYears}
                      onChange={(e) => handleInputChange("plannedYears", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {inputs.balance > 0 && inputs.curRate > 0 && inputs.newRate > 0 ? (
                  <>
                    {/* New Monthly Payment Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-4 text-center">
                      <p className="text-xs font-medium text-muted-foreground">
                        New Monthly Payment
                      </p>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-ember">
                        {formatCurrency(result.newMonthlyPayment)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.monthlySavings > 0
                          ? `saves ${formatCurrency(result.monthlySavings)}/mo vs. ${formatCurrency(result.currentMonthlyPayment)}`
                          : result.monthlySavings === 0
                            ? `same as current payment of ${formatCurrency(result.currentMonthlyPayment)}`
                            : `increases by ${formatCurrency(Math.abs(result.monthlySavings))}/mo vs. ${formatCurrency(result.currentMonthlyPayment)}`}
                      </p>
                    </div>

                    {/* Worth-It Verdict */}
                    <div
                      className={`rounded-md border p-4 flex items-start gap-3 ${
                        result.worthIt
                          ? "border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800"
                          : "border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800"
                      }`}
                    >
                      <div className={`mt-0.5 rounded-full p-1 ${result.worthIt ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"}`}>
                        {result.worthIt ? (
                          <Check className="size-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${result.worthIt ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}>
                          {result.worthIt ? "Refinancing is Worth It" : "Refinancing is Not Worth It"}
                        </p>
                        <p className={`text-xs mt-0.5 ${result.worthIt ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                          {result.worthItText}
                        </p>
                      </div>
                    </div>

                    {/* Term Reset Warning */}
                    {result.termReset && (
                      <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 p-3 flex items-start gap-2">
                        <AlertTriangle className="size-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                        <div className="text-xs text-yellow-800 dark:text-yellow-200">
                          <p className="font-semibold">Term Reset Warning</p>
                          <p className="mt-0.5">
                            Your new {monthsToText(result.newTermMonths)} term extends{" "}
                            {monthsToText(result.termResetExtraMonths)} beyond your
                            current remaining {monthsToText(result.currentRemainingMonths)}.
                            {result.interestSaved < 0
                              ? ` This means you would pay ${formatCurrency(Math.abs(result.interestSaved))} more in total interest.`
                              : " Even though you save monthly, the extra term adds interest cost."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Monthly Savings"
                        value={result.monthlySavings >= 0
                          ? formatCurrency(result.monthlySavings)
                          : `+${formatCurrency(Math.abs(result.monthlySavings))}`}
                        subtext={result.monthlySavings >= 0 ? "per month" : "payment increase per month"}
                        valueClass={result.monthlySavings >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                      />
                      <ResultCard
                        label="Break-Even Point"
                        value={result.breakEvenMonths !== null
                          ? monthsToText(Math.round(result.breakEvenMonths))
                          : "Never"}
                        subtext={result.breakEvenMonths !== null
                          ? `${formatCurrency(closingCosts)} in closing costs`
                          : "No monthly savings to recoup costs"}
                        valueClass={result.breakEvenMonths !== null ? "" : "text-red-600 dark:text-red-400"}
                      />
                      <ResultCard
                        label="Total Interest Saved"
                        value={result.interestSaved >= 0
                          ? formatCurrency(result.interestSaved)
                          : `-${formatCurrency(Math.abs(result.interestSaved))}`}
                        subtext={result.interestSaved >= 0
                          ? "over the life of the loans"
                          : "additional total interest cost"}
                        valueClass={result.interestSaved >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}
                      />
                      <ResultCard
                        label="New Loan Amount"
                        value={formatCurrency(result.newLoanAmount)}
                        subtext={inputs.enableCashout && inputs.cashoutAmount > 0
                          ? `includes ${formatCurrency(inputs.cashoutAmount)} cash-out`
                          : `includes ${formatCurrency(closingCosts)} closing costs`}
                      />
                    </div>

                    {/* Cash-Out Breakdown */}
                    {inputs.enableCashout && inputs.cashoutAmount > 0 && (
                      <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                        <p className="font-semibold text-sm">New Loan Breakdown</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current balance</span>
                            <span className="font-medium">{formatCurrency(inputs.balance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Closing costs</span>
                            <span className="font-medium">{formatCurrency(closingCosts)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cash-out</span>
                            <span className="font-medium">{formatCurrency(inputs.cashoutAmount)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-semibold">
                            <span>New loan amount</span>
                            <span>{formatCurrency(result.newLoanAmount)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interest Comparison */}
                    <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                      <p className="font-semibold text-sm">Interest Comparison</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current loan remaining interest</span>
                          <span className="font-medium">{formatCurrency(result.currentTotalInterest)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">New loan total interest</span>
                          <span className="font-medium">{formatCurrency(result.newTotalInterest)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Net interest difference</span>
                          <span className={result.interestSaved >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                            {result.interestSaved >= 0 ? "saved" : "additional cost"}: {formatCurrency(Math.abs(result.interestSaved))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 no-print">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyLink}
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
                      </div>
                      <ShareButtons summaryText={summaryText} />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This calculator provides estimates only. Actual costs and savings
                      depend on your specific loan terms, credit profile, and lender
                      fees. Closing costs may include appraisal, origination, title,
                      and recording fees. Consult a licensed mortgage professional
                      for personalized advice.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Enter your loan details to see refinance savings estimates.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Print-only footer ─── */}
        <PrintFooter />
      </div>
    </TooltipProvider>
  );
}

/* ─── Sub-components ─── */

function ResultCard({
  label,
  value,
  subtext,
  valueClass = "",
}: {
  label: string;
  value: string;
  subtext: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-lg font-bold tracking-tight ${valueClass}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{subtext}</p>
    </div>
  );
}

function PrintFooter() {
  return (
    <div className="hidden print:block print:mt-6 print:pt-3 print:border-t print:border-gray-300 print:text-[8pt] print:text-gray-500 print:flex print:justify-between">
      <span>CalcForge - thecalcforge.com</span>
      <PrintDateAndUrl />
    </div>
  );
}

function PrintDateAndUrl() {
  const text = useMemo(() => {
    if (typeof window === "undefined") return "";
    const d = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${window.location.host}${window.location.pathname} - Printed ${d}`;
  }, []);
  return <span>{text}</span>;
}