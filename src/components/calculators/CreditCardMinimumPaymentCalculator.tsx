"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Copy, Check, Printer, RotateCcw, CreditCard, ChevronDown, ChevronUp, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import ShareButtons from "@/components/calculators/ShareButtons";
import { useClientToday } from "@/lib/use-client-today";

/* ─── Types ─── */

interface MinPayInputs {
  balance: number;
  apr: number;
  minFormula: "pct_balance" | "pct_plus_interest" | "one_pct_plus_interest";
  minPercent: number;
  floorAmount: number;
  fixedPayment: number;
}

interface MinPayResult {
  firstMinimum: number;
  months: number;
  payoffDate: string;
  totalInterest: number;
  totalPaid: number;
  schedule: {
    month: number;
    minimum: number;
    interest: number;
    principal: number;
    balance: number;
  }[];
  warnings: string[];
}

interface FixedPayoffResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: string;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: MinPayInputs = {
  balance: 5000,
  apr: 22.9,
  minFormula: "pct_balance",
  minPercent: 2,
  floorAmount: 25,
  fixedPayment: 200,
};

/* ─── Formatters ─── */

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

const fmtPercent = (v: number) => `${v.toFixed(2)}%`;

/* ─── Calculation Engine ─── */

function computeMinimum(inputs: MinPayInputs, balance: number): number {
  const { apr, minFormula, minPercent, floorAmount } = inputs;
  const monthlyRate = (apr / 100) / 12;

  switch (minFormula) {
    case "pct_balance":
      return Math.max(floorAmount, balance * (minPercent / 100));
    case "pct_plus_interest":
      return Math.max(floorAmount, balance * (minPercent / 100) + balance * monthlyRate);
    case "one_pct_plus_interest":
      return Math.max(floorAmount, balance * 0.01 + balance * monthlyRate);
    default:
      return Math.max(floorAmount, balance * (minPercent / 100));
  }
}

function calculateMinimumPayoff(inputs: MinPayInputs, today: Date | null): MinPayResult {
  const { balance: startBalance, apr } = inputs;
  if (startBalance <= 0) {
    return { firstMinimum: 0, months: 0, payoffDate: "", totalInterest: 0, totalPaid: 0, schedule: [], warnings: [] };
  }

  const warnings: string[] = [];
  const monthlyRate = (apr / 100) / 12;
  let balance = startBalance;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const schedule: MinPayResult["schedule"] = [];
  let firstMinimum = 0;

  while (balance > 0.005 && month < 1200) {
    month++;
    const interest = balance * monthlyRate;
    const owed = balance + interest;
    let minPayment = computeMinimum(inputs, balance);
    minPayment = Math.min(minPayment, owed);

    if (month === 1) firstMinimum = minPayment;

    const principal = minPayment - interest;

    if (principal < 0) {
      warnings.push(
        `Minimum payment (${fmtCurrency(minPayment)}/mo) does not cover monthly interest (${fmtCurrency(interest)}/mo). Your balance will grow and this debt may never be paid off at minimum payments.`
      );
      break;
    }

    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    totalPaid += minPayment;

    schedule.push({ month, minimum: minPayment, interest, principal, balance });
  }

  if (month >= 1200 && balance > 0.005) {
    warnings.push("Payoff exceeds 100 years at minimum payments. Consider increasing your payment amount.");
  } else if (month > 120) {
    warnings.push("Paying only the minimum will take over 10 years. You could save significantly by paying more each month.");
  }

  // today is null during SSR; payoffDate is left empty so no build-time date is
  // frozen in the prerendered HTML. After hydration the real date is used.
  const payoffDate = (month > 0 && today)
    ? new Date(today.getTime() + month * 30.44 * 86400000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return { firstMinimum, months: month, payoffDate, totalInterest, totalPaid, schedule, warnings };
}

function calculateFixedPayoff(balance: number, apr: number, fixedPayment: number, today: Date | null): FixedPayoffResult {
  if (balance <= 0 || fixedPayment <= 0) {
    return { months: 0, totalInterest: 0, totalPaid: 0, payoffDate: "" };
  }

  const monthlyRate = (apr / 100) / 12;
  let bal = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (bal > 0.005 && month < 1200) {
    month++;
    const interest = bal * monthlyRate;
    const owed = bal + interest;
    const payment = Math.min(fixedPayment, owed);
    const principal = payment - interest;

    if (principal < 0) break;

    bal = Math.max(0, bal - principal);
    totalInterest += interest;
    totalPaid += payment;
  }

  // today is null during SSR; payoffDate is left empty so no build-time date is
  // frozen in the prerendered HTML. After hydration the real date is used.
  const payoffDate = (month > 0 && today)
    ? new Date(today.getTime() + month * 30.44 * 86400000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return { months: month, totalInterest, totalPaid, payoffDate };
}

/* ─── Component ─── */

export default function CreditCardMinimumPaymentCalculator() {
  const today = useClientToday();
  const [inputs, setInputs] = useState<MinPayInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const balance = params.get("balance");
    const apr = params.get("apr");
    if (!balance && !apr) return DEFAULT_INPUTS;
    return {
      balance: balance ? parseFloat(balance) : DEFAULT_INPUTS.balance,
      apr: apr ? parseFloat(apr) : DEFAULT_INPUTS.apr,
      minFormula: (params.get("formula") as MinPayInputs["minFormula"]) || DEFAULT_INPUTS.minFormula,
      minPercent: params.get("pct") ? parseFloat(params.get("pct")!) : DEFAULT_INPUTS.minPercent,
      floorAmount: params.get("floor") ? parseFloat(params.get("floor")!) : DEFAULT_INPUTS.floorAmount,
      fixedPayment: params.get("fixed") ? parseFloat(params.get("fixed")!) : DEFAULT_INPUTS.fixedPayment,
    };
  });

  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(true);

  const { minOnlyResult, fixedResult } = useMemo(() => {
    const minOnly = calculateMinimumPayoff(inputs, today);
    const fixed = calculateFixedPayoff(inputs.balance, inputs.apr, inputs.fixedPayment, today);
    return { minOnlyResult: minOnly, fixedResult: fixed };
  }, [inputs, today]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("balance", inputs.balance.toString());
    params.set("apr", inputs.apr.toString());
    params.set("formula", inputs.minFormula);
    params.set("pct", inputs.minPercent.toString());
    params.set("floor", inputs.floorAmount.toString());
    params.set("fixed", inputs.fixedPayment.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [inputs]);

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

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    toast.success("Calculator reset to defaults");
  }, []);

  const updateInput = useCallback(<K extends keyof MinPayInputs>(key: K, value: number | string) => {
    setInputs((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "number" && typeof value === "string"
        ? (parseFloat(value) || 0)
        : value,
    }));
  }, []);

  const monthsSaved = minOnlyResult.months - fixedResult.months;
  const interestSaved = minOnlyResult.totalInterest - fixedResult.totalInterest;

  const formulaDescriptions: Record<MinPayInputs["minFormula"], string> = {
    pct_balance: `Minimum = max(${fmtCurrency(inputs.floorAmount)}, ${inputs.minPercent}% of balance)`,
    pct_plus_interest: `Minimum = max(${fmtCurrency(inputs.floorAmount)}, ${inputs.minPercent}% of balance + monthly interest)`,
    one_pct_plus_interest: `Minimum = max(${fmtCurrency(inputs.floorAmount)}, 1% of balance + monthly interest)`,
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="size-5 text-ember" />
              Credit Card Minimum Payment Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              See how your minimum payment is calculated and how long it takes to
              pay off your balance when you pay only the declining minimum each month.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Balance */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="minpay-balance" className="text-sm font-medium">
                      Balance
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px] text-xs">
                        Your current credit card statement balance.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="no-print relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="minpay-balance"
                      type="number"
                      min={0}
                      step={100}
                      value={inputs.balance || ""}
                      onChange={(e) => updateInput("balance", e.target.value)}
                      placeholder="0"
                      className="pl-7 h-9"
                      aria-label="Current balance"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    Balance: {fmtCurrency(inputs.balance)}
                  </p>
                </div>

                {/* APR */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="minpay-apr" className="text-sm font-medium">
                      APR
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px] text-xs">
                        Annual Percentage Rate on your credit card. This is the
                        yearly interest rate used to calculate monthly interest charges.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="no-print relative">
                    <Input
                      id="minpay-apr"
                      type="number"
                      min={0}
                      max={99}
                      step={0.1}
                      value={inputs.apr || ""}
                      onChange={(e) => updateInput("apr", e.target.value)}
                      placeholder="0"
                      className="pr-7 h-9"
                      aria-label="Annual Percentage Rate"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="hidden print:block text-sm">
                    APR: {fmtPercent(inputs.apr)}
                  </p>
                </div>

                {/* Minimum Payment Formula */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Minimum Payment Formula</Label>
                  <div className="grid grid-cols-3 gap-2 no-print">
                    <button
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, minFormula: "pct_balance" }))}
                      className={`flex items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                        inputs.minFormula === "pct_balance"
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground hover:border-ember/30 hover:text-ember"
                      }`}
                      aria-pressed={inputs.minFormula === "pct_balance"}
                    >
                      % of Balance
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, minFormula: "pct_plus_interest" }))}
                      className={`flex items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                        inputs.minFormula === "pct_plus_interest"
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground hover:border-ember/30 hover:text-ember"
                      }`}
                      aria-pressed={inputs.minFormula === "pct_plus_interest"}
                    >
                      % + Interest
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, minFormula: "one_pct_plus_interest" }))}
                      className={`flex items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                        inputs.minFormula === "one_pct_plus_interest"
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground hover:border-ember/30 hover:text-ember"
                      }`}
                      aria-pressed={inputs.minFormula === "one_pct_plus_interest"}
                    >
                      1% + Interest
                    </button>
                  </div>
                  <p className="hidden print:block text-sm font-medium">
                    Formula: {formulaDescriptions[inputs.minFormula]}
                  </p>
                  <p className="text-[11px] text-muted-foreground no-print">
                    {formulaDescriptions[inputs.minFormula]}
                  </p>
                </div>

                {/* Percentage / Floor row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Percentage */}
                  <div className="space-y-2">
                    <Label htmlFor="minpay-pct" className="text-sm font-medium">
                      Percentage (%)
                    </Label>
                    {inputs.minFormula === "one_pct_plus_interest" ? (
                      <Input
                        id="minpay-pct"
                        type="number"
                        value="1"
                        disabled
                        className="h-9 bg-muted/50 cursor-not-allowed"
                        aria-label="Percentage (fixed at 1%)"
                      />
                    ) : (
                      <div className="no-print">
                        <Input
                          id="minpay-pct"
                          type="number"
                          min={0.5}
                          max={10}
                          step={0.5}
                          value={inputs.minPercent || ""}
                          onChange={(e) => updateInput("minPercent", e.target.value)}
                          placeholder="2"
                          className="h-9"
                          aria-label="Minimum payment percentage"
                        />
                      </div>
                    )}
                    {inputs.minFormula === "one_pct_plus_interest" && (
                      <p className="text-[11px] text-muted-foreground">Fixed at 1%</p>
                    )}
                  </div>

                  {/* Floor */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="minpay-floor" className="text-sm font-medium">
                        Floor ($)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                          The minimum dollar amount you must pay regardless of the
                          percentage calculation. Most cards set this between $25 and $35.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="no-print relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <Input
                        id="minpay-floor"
                        type="number"
                        min={0}
                        step={5}
                        value={inputs.floorAmount || ""}
                        onChange={(e) => updateInput("floorAmount", e.target.value)}
                        placeholder="25"
                        className="pl-7 h-9"
                        aria-label="Floor amount"
                      />
                    </div>
                    <p className="hidden print:block text-sm">
                      Floor: {fmtCurrency(inputs.floorAmount)}
                    </p>
                  </div>
                </div>

                {/* Fixed Payment for Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="minpay-fixed" className="text-sm font-medium">
                      Fixed Payment (for comparison)
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[250px] text-xs">
                        A fixed monthly payment amount to compare against the declining
                        minimum. Shows how much time and money you could save by paying
                        the same amount each month instead of the shrinking minimum.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="no-print relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="minpay-fixed"
                      type="number"
                      min={0}
                      step={25}
                      value={inputs.fixedPayment || ""}
                      onChange={(e) => updateInput("fixedPayment", e.target.value)}
                      placeholder="200"
                      className="pl-7 h-9"
                      aria-label="Fixed payment for comparison"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    Fixed payment for comparison: {fmtCurrency(inputs.fixedPayment)}/mo
                  </p>
                </div>

                {/* Warnings */}
                {minOnlyResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    {minOnlyResult.warnings.map((w, i) => (
                      <Alert key={i} variant="destructive" className="py-2">
                        <AlertTriangle className="size-4" />
                        <AlertDescription className="text-xs">{w}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {inputs.balance > 0 ? (
                  <>
                    {/* Debt-Free Date Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Debt-Free Date (Minimum Only)
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-ember">
                        {minOnlyResult.months > 0
                          ? minOnlyResult.payoffDate
                          : "Already debt-free!"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {minOnlyResult.months > 0
                          ? `${minOnlyResult.months} month${minOnlyResult.months !== 1 ? "s" : ""} from now`
                          : "No balance to pay off"}
                      </p>
                    </div>

                    {/* Months at minimum -- large number */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Months at Minimum Payment
                      </p>
                      <p className="mt-1 text-4xl font-bold tracking-tight">
                        {minOnlyResult.months > 0 ? minOnlyResult.months : "0"}
                      </p>
                      {minOnlyResult.months > 12 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          \u2248 {(minOnlyResult.months / 12).toFixed(1)} years
                        </p>
                      )}
                    </div>

                    {/* Comparison Box */}
                    <div className="rounded-lg bg-muted/30 p-4 space-y-2.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Minimum Only vs. Fixed {fmtCurrency(inputs.fixedPayment)}/mo
                      </p>
                      {/* Minimum Only Row */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Minimum Only</span>
                        <span>
                          {minOnlyResult.months} mo, {fmtCurrency(minOnlyResult.totalInterest)} interest
                        </span>
                      </div>
                      {/* Fixed Row */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Fixed {fmtCurrency(inputs.fixedPayment)}/mo</span>
                        <span>
                          {fixedResult.months} mo, {fmtCurrency(fixedResult.totalInterest)} interest
                        </span>
                      </div>
                      {/* Savings Line */}
                      {interestSaved > 0.005 && (
                        <div className="pt-1.5 border-t">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            You save {monthsSaved >= 1 ? `${Math.round(monthsSaved)} month${Math.round(monthsSaved) !== 1 ? "s" : ""} and ` : ""}
                            {fmtCurrency(interestSaved)} in interest
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 2x2 ResultCard Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="First Minimum"
                        value={fmtCurrency(minOnlyResult.firstMinimum)}
                        subtext="Declines each month"
                      />
                      <ResultCard
                        label="Total Interest (Min)"
                        value={fmtCurrency(minOnlyResult.totalInterest)}
                        subtext={
                          minOnlyResult.totalPaid > 0
                            ? `${fmtPercent((minOnlyResult.totalInterest / minOnlyResult.totalPaid) * 100)} of total paid`
                            : "No payments"
                        }
                      />
                      <ResultCard
                        label="Total Paid (Min)"
                        value={fmtCurrency(minOnlyResult.totalPaid)}
                        subtext={`Principal ${fmtCurrency(inputs.balance)} + interest`}
                      />
                      <ResultCard
                        label="Monthly Payment (Fixed)"
                        value={fmtCurrency(inputs.fixedPayment)}
                        subtext="Same amount each month"
                      />
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
                      <ShareButtons
                        summaryText={`Paying only minimums on a $${inputs.balance.toLocaleString()} balance takes ${minOnlyResult.months} months. Calculate yours:`}
                      />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This calculator provides estimates for informational purposes
                      only. Actual minimum payment calculations vary by issuer and may
                      include fees. Always check your statement for your exact minimum
                      payment and terms.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Enter a balance greater than zero to see results.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Comparison Table Card ─── */}
        {inputs.balance > 0 && minOnlyResult.months > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="size-4 text-ember" />
                Minimum Only vs. Fixed Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-center">Minimum Only</TableHead>
                      <TableHead className="text-center">
                        Fixed {fmtCurrency(inputs.fixedPayment)}/mo
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Months</TableCell>
                      <TableCell className="text-center">
                        {minOnlyResult.months}
                      </TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {fixedResult.months}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Interest</TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(minOnlyResult.totalInterest)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {fmtCurrency(fixedResult.totalInterest)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Paid</TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(minOnlyResult.totalPaid)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {fmtCurrency(fixedResult.totalPaid)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Payoff Date</TableCell>
                      <TableCell className="text-center text-sm">
                        {minOnlyResult.payoffDate}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-ember">
                        {fixedResult.payoffDate}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Summary Box */}
              <div className="mt-4 rounded-lg bg-muted/30 p-4 space-y-1.5">
                {interestSaved > 0.005 ? (
                  <>
                    <p className="text-sm font-medium">
                      Paying a fixed{" "}
                      <span className="font-bold text-ember">
                        {fmtCurrency(inputs.fixedPayment)}/mo
                      </span>{" "}
                      saves you{" "}
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {fmtCurrency(interestSaved)}
                      </span>{" "}
                      in interest
                    </p>
                    {monthsSaved >= 1 && (
                      <p className="text-xs text-muted-foreground">
                        and {Math.round(monthsSaved)} month{Math.round(monthsSaved) !== 1 ? "s" : ""}{" "}
                        faster than paying only the declining minimum.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Because the minimum payment shrinks as your balance drops, you pay
                      mostly interest in early months. A fixed payment keeps your
                      principal reduction consistent.
                    </p>
                  </>
                ) : fixedResult.months === 0 ? (
                  <p className="text-sm font-medium">
                    Enter a fixed payment greater than zero to see comparison savings.
                  </p>
                ) : (
                  <p className="text-sm font-medium">
                    No additional savings from the fixed payment with current settings.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Collapsible Schedule Card ─── */}
        {inputs.balance > 0 && minOnlyResult.schedule.length > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="no-print flex w-full items-center justify-between text-left"
                aria-expanded={showSchedule}
              >
                <CardTitle className="text-lg">
                  Month-by-Month Minimum Payment Schedule
                </CardTitle>
                {showSchedule ? (
                  <ChevronUp className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </button>
              <CardTitle className="hidden print:block text-lg">
                Month-by-Month Minimum Payment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className={showSchedule ? "" : "hidden print:block"}>
              <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Month</TableHead>
                      <TableHead className="text-right">Minimum</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {minOnlyResult.schedule.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right">{fmtCurrency(row.minimum)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{fmtCurrency(row.interest)}</TableCell>
                        <TableCell className="text-right">{fmtCurrency(row.principal)}</TableCell>
                        <TableCell className="text-right font-medium">{fmtCurrency(row.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm font-medium">
                <span>
                  Total Paid:{" "}
                  <span className="text-ember">{fmtCurrency(minOnlyResult.totalPaid)}</span>
                </span>
                <span>
                  Total Interest:{" "}
                  <span className="text-destructive">{fmtCurrency(minOnlyResult.totalInterest)}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Print-only footer ─── */}
        <PrintFooter />
      </div>
    </TooltipProvider>
  );
}

/* ─── Sub-components ─── */

function ResultCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold tracking-tight">{value}</p>
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