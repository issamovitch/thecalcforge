"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw,
  ChevronDown, ChevronUp, Info, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  calculateStudentLoanPayoff,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

interface StudentLoanInputs {
  balance: number;
  rate: number;
  monthlyPayment: number;
  extraMonthly: number;
  lumpSum: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: StudentLoanInputs = {
  balance: 30000,
  rate: 6.5,
  monthlyPayment: 350,
  extraMonthly: 0,
  lumpSum: 0,
};

/* ─── Component ─── */

export default function StudentLoanPayoffCalculator() {
  const [inputs, setInputs] = useState<StudentLoanInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const balance = params.get("balance");
    const rate = params.get("rate");
    const payment = params.get("payment");
    const extra = params.get("extra");
    const lump = params.get("lump");
    if (!balance && !rate && !payment && !extra && !lump) return DEFAULT_INPUTS;
    return {
      balance: balance ? parseFloat(balance) : DEFAULT_INPUTS.balance,
      rate: rate ? parseFloat(rate) : DEFAULT_INPUTS.rate,
      monthlyPayment: payment ? parseFloat(payment) : DEFAULT_INPUTS.monthlyPayment,
      extraMonthly: extra ? parseFloat(extra) : DEFAULT_INPUTS.extraMonthly,
      lumpSum: lump ? parseFloat(lump) : DEFAULT_INPUTS.lumpSum,
    };
  });
  const [copied, setCopied] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);

  // Plan: with extra + lump sum
  const planResult = useMemo(
    () => calculateStudentLoanPayoff(
      inputs.balance,
      inputs.rate,
      inputs.monthlyPayment,
      inputs.extraMonthly,
      inputs.lumpSum,
    ),
    [inputs.balance, inputs.rate, inputs.monthlyPayment, inputs.extraMonthly, inputs.lumpSum],
  );

  // Baseline: no extra, no lump
  const baselineResult = useMemo(
    () => calculateStudentLoanPayoff(
      inputs.balance,
      inputs.rate,
      inputs.monthlyPayment,
      0,
      0,
    ),
    [inputs.balance, inputs.rate, inputs.monthlyPayment],
  );

  // Sync URL query string when inputs change (skip initial render)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("balance", inputs.balance.toString());
    params.set("rate", inputs.rate.toString());
    params.set("payment", inputs.monthlyPayment.toString());
    params.set("extra", inputs.extraMonthly.toString());
    params.set("lump", inputs.lumpSum.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [inputs]);

  const handleInputChange = useCallback(
    (field: keyof StudentLoanInputs, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setInputs((prev) => ({ ...prev, [field]: num }));
      }
    },
    [],
  );

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

  const hasExtraOrLump = inputs.extraMonthly > 0 || inputs.lumpSum > 0;
  const monthsSaved = baselineResult.months - planResult.months;
  const interestSaved = Math.round((baselineResult.totalInterest - planResult.totalInterest) * 100) / 100;

  // Payoff date (client-side only)
  const payoffDate = useMemo(() => {
    if (planResult.neverPayoff || planResult.months === 0) return null;
    const d = new Date();
    d.setMonth(d.getMonth() + planResult.months);
    return d;
  }, [planResult.months, planResult.neverPayoff]);

  function formatYearsMonths(totalMonths: number): string {
    if (totalMonths <= 0) return "0 months";
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
    if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
    return `${years} year${years !== 1 ? "s" : ""} ${months} month${months !== 1 ? "s" : ""}`;
  }

  function formatDate(d: Date): string {
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  }

  const summaryText = `${formatCurrency(inputs.balance)} at ${formatPercent(inputs.rate)} with ${formatCurrency(inputs.monthlyPayment + inputs.extraMonthly)}/mo pays off in ${formatYearsMonths(planResult.months)} with ${formatCurrency(planResult.totalInterest)} in interest. Calculate yours:`;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              Student Loan Payoff Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              See your student loan payoff date, total interest, and how much
              time and money extra payments or a lump sum can save.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Loan Balance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="balance" className="text-sm font-medium">
                      Loan Balance
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.balance)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="balance"
                      min={1000}
                      max={200000}
                      step={500}
                      value={[inputs.balance]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, balance: v }))
                      }
                      aria-label="Loan balance"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(1000)}</span>
                      <span>{formatCurrency(200000)}</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      step={500}
                      value={inputs.balance}
                      onChange={(e) =>
                        handleInputChange("balance", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Loan balance input"
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate" className="text-sm font-medium">
                      Interest Rate (APR)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPercent(inputs.rate)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="rate"
                      min={0}
                      max={15}
                      step={0.05}
                      value={[inputs.rate]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, rate: v }))
                      }
                      aria-label="Interest rate"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>15%</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      step={0.05}
                      value={inputs.rate}
                      onChange={(e) =>
                        handleInputChange("rate", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Interest rate input"
                    />
                  </div>
                </div>

                {/* Monthly Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="payment" className="text-sm font-medium">
                        Monthly Payment
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-xs">
                          Your regular monthly payment. Must exceed the first
                          month&apos;s interest or the balance will grow.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.monthlyPayment)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="payment"
                      min={50}
                      max={3000}
                      step={25}
                      value={[inputs.monthlyPayment]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, monthlyPayment: v }))
                      }
                      aria-label="Monthly payment"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(50)}</span>
                      <span>{formatCurrency(3000)}</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      step={25}
                      value={inputs.monthlyPayment}
                      onChange={(e) =>
                        handleInputChange("monthlyPayment", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Monthly payment input"
                    />
                  </div>
                </div>

                {/* Extra Monthly Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="extra" className="text-sm font-medium">
                        Extra Monthly Payment
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-xs">
                          An additional amount paid each month on top of your
                          regular payment. Goes directly to principal.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.extraMonthly)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="extra"
                      min={0}
                      max={2000}
                      step={25}
                      value={[inputs.extraMonthly]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, extraMonthly: v }))
                      }
                      aria-label="Extra monthly payment"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>{formatCurrency(2000)}</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      step={25}
                      value={inputs.extraMonthly}
                      onChange={(e) =>
                        handleInputChange("extraMonthly", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Extra monthly payment input"
                    />
                  </div>
                </div>

                {/* Lump Sum */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="lump" className="text-sm font-medium">
                        One-Time Lump Sum
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-xs">
                          A one-time extra payment applied in month 1, reducing
                          your principal before interest accrues.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.lumpSum)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="lump"
                      min={0}
                      max={50000}
                      step={500}
                      value={[inputs.lumpSum]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, lumpSum: v }))
                      }
                      aria-label="Lump sum payment"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>{formatCurrency(50000)}</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      step={500}
                      value={inputs.lumpSum}
                      onChange={(e) =>
                        handleInputChange("lumpSum", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Lump sum payment input"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {planResult.neverPayoff ? (
                  <div className="flex gap-3 rounded-lg border border-red-300/50 bg-red-50 dark:bg-red-950/20 p-5">
                    <AlertTriangle className="size-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="text-sm text-red-900 dark:text-red-100 leading-relaxed">
                      <p className="font-semibold mb-1">
                        Payment does not cover monthly interest
                      </p>
                      <p>
                        Your monthly payment of{" "}
                        {formatCurrency(inputs.monthlyPayment + inputs.extraMonthly)}
                        {" "}does not cover the first month&apos;s interest of{" "}
                        {formatCurrency(planResult.effectiveStartingBalance * inputs.rate / 100 / 12)}
                        {" "}on the effective balance. The balance will grow each
                        month and the loan will never pay off. Increase your
                        monthly payment to see a payoff timeline.
                      </p>
                    </div>
                  </div>
                ) : planResult.months > 0 ? (
                  <>
                    {/* Payoff Time Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Payoff Time
                      </p>
                      <p className="text-4xl font-bold tracking-tight text-ember">
                        {formatYearsMonths(planResult.months)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {planResult.months} monthly payments
                        {payoffDate && ` • debt-free ${formatDate(payoffDate)}`}
                      </p>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Total Interest"
                        value={formatCurrency(planResult.totalInterest)}
                        subtext={`${formatPercent(
                          planResult.totalInterest > 0
                            ? (planResult.totalInterest / planResult.totalPaid) * 100
                            : 0
                        )} of total paid`}
                      />
                      <ResultCard
                        label="Total Paid"
                        value={formatCurrency(planResult.totalPaid)}
                        subtext={`${formatCurrency(inputs.balance)} principal + interest`}
                      />
                    </div>

                    {/* Comparison Block */}
                    {hasExtraOrLump && (
                      <div className="rounded-lg border border-ember/30 bg-ember/5 p-4 space-y-3">
                        <p className="text-sm font-semibold text-ember">
                          Baseline vs Your Plan
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Months Saved</p>
                            <p className="text-lg font-bold">
                              {monthsSaved > 0 ? `${monthsSaved} mo` : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Interest Saved</p>
                            <p className="text-lg font-bold text-ember">
                              {interestSaved > 0 ? formatCurrency(interestSaved) : "-"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ember/20">
                          <div>
                            <p className="text-xs text-muted-foreground">Baseline Payoff</p>
                            <p className="text-sm font-semibold">
                              {formatYearsMonths(baselineResult.months)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(baselineResult.totalInterest)} interest
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Your Plan</p>
                            <p className="text-sm font-semibold">
                              {formatYearsMonths(planResult.months)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(planResult.totalInterest)} interest
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lump Sum Note */}
                    {planResult.lumpSumApplied > 0 && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                        A lump sum of {formatCurrency(planResult.lumpSumApplied)}
                        {" "}was applied in month 1, reducing the starting balance
                        from {formatCurrency(inputs.balance)} to{" "}
                        {formatCurrency(planResult.effectiveStartingBalance)}.
                      </p>
                    )}

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
                      <ShareButtons summaryText={summaryText} title="Student Loan Payoff Calculator" />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This calculator computes fixed-payment payoff math. Federal
                      student loans offer income-driven repayment plans, forgiveness
                      programs, and deferment options this tool does not model.
                      Refinancing federal loans into a private loan removes those
                      federal protections. This page does not recommend refinancing
                      or any specific product.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Enter valid loan details to see results.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Amortization Table ─── */}
        {planResult.schedule.length > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <button
                type="button"
                onClick={() => setShowAmortization(!showAmortization)}
                className="no-print flex w-full items-center justify-between text-left"
                aria-expanded={showAmortization}
              >
                <CardTitle className="text-lg">
                  Amortization Schedule
                </CardTitle>
                {showAmortization ? (
                  <ChevronUp className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </button>
              <CardTitle className="hidden print:block text-lg">
                Amortization Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className={showAmortization ? "" : "hidden print:block"}>
              <div className="amortization-scroll max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Month</TableHead>
                      <TableHead className="text-right">Payment</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planResult.schedule.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">
                          {row.month}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.payment)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.principal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.interest)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(row.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm font-medium">
                <span>
                  Total Paid:{" "}
                  <span className="text-ember">
                    {formatCurrency(planResult.totalPaid)}
                  </span>
                </span>
                <span>
                  Total Interest:{" "}
                  <span className="text-destructive">
                    {formatCurrency(planResult.totalInterest)}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}

/* ─── Sub-components ─── */

function ResultCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground">{subtext}</p>
    </div>
  );
}
