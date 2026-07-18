"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw,
  Info, PlusCircle, Trash2, AlertTriangle, TrendingDown,
  TrendingUp, Scale,
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
import {
  calculateLoan,
  calculateEffectiveAPR,
  calculateFixedPaymentPayoff,
  formatCurrency,
  formatPercent,
  type FixedPaymentPayoff,
} from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

export interface DebtRow {
  name: string;
  balance: number;
  apr: number;
  monthlyPayment: number;
}

interface ConsolidationInputs {
  debts: DebtRow[];
  newApr: number;
  newTermMonths: number;
  originationFeePct: number;
}

interface DebtRowResult extends FixedPaymentPayoff {
  name: string;
  balance: number;
  apr: number;
  monthlyPayment: number;
}

interface ComparisonResult {
  current: {
    totalMonthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    longestPayoffMonths: number;
    rows: DebtRowResult[];
  };
  consolidated: {
    totalBalance: number;
    monthlyPayment: number;
    totalInterest: number;
    totalCost: number;
    termMonths: number;
    amountReceived: number;
    effectiveApr: number | null;
    hasFee: boolean;
  };
  verdict: {
    monthlySavings: number;
    interestSavings: number;
    costSavings: number;
    monthsDifference: number;
    consolidationCostsMore: boolean;
  };
}

/* ─── Defaults ─── */

export const DEFAULT_DEBTS: DebtRow[] = [
  { name: "Card A", balance: 8000, apr: 22, monthlyPayment: 250 },
  { name: "Card B", balance: 7000, apr: 19, monthlyPayment: 200 },
  { name: "Card C", balance: 5000, apr: 24, monthlyPayment: 150 },
];

export const DEFAULT_INPUTS: ConsolidationInputs = {
  debts: DEFAULT_DEBTS,
  newApr: 12,
  newTermMonths: 48,
  originationFeePct: 0,
};

/* ─── Comparison engine ─── */

function runComparison(inputs: ConsolidationInputs): ComparisonResult | null {
  const { debts, newApr, newTermMonths, originationFeePct } = inputs;

  if (debts.length === 0) return null;
  const validDebts = debts.filter((d) => d.balance > 0);
  if (validDebts.length === 0) return null;

  // Side A: current debts
  const rows: DebtRowResult[] = validDebts.map((d) => {
    const payoff = calculateFixedPaymentPayoff(d.balance, d.apr, d.monthlyPayment);
    return {
      name: d.name,
      balance: d.balance,
      apr: d.apr,
      monthlyPayment: d.monthlyPayment,
      ...payoff,
    };
  });

  const totalMonthlyPayment = rows.reduce((s, r) => s + r.monthlyPayment, 0);
  const totalInterest = rows.reduce((s, r) => s + (r.neverPayoff ? 0 : r.totalInterest), 0);
  const totalCost = rows.reduce((s, r) => s + (r.neverPayoff ? 0 : r.totalCost), 0);
  const longestPayoffMonths = rows.some((r) => r.neverPayoff)
    ? Infinity
    : Math.max(...rows.map((r) => r.monthsToPayoff));

  // Side B: consolidation loan
  const totalBalance = validDebts.reduce((s, d) => s + d.balance, 0);
  const fee = totalBalance * (originationFeePct / 100);
  const amountReceived = totalBalance - fee;
  const hasFee = originationFeePct > 0;

  const loanResult = calculateLoan({
    loanAmount: totalBalance,
    apr: newApr,
    termMonths: newTermMonths,
  });

  const effectiveApr = hasFee
    ? calculateEffectiveAPR(amountReceived, loanResult.monthlyPayment, newTermMonths)
    : null;

  // Verdict
  const consolidatedTotalCost = hasFee ? loanResult.totalCost + fee : loanResult.totalCost;
  const costSavings = r2(totalCost - consolidatedTotalCost);
  const monthlySavings = r2(totalMonthlyPayment - loanResult.monthlyPayment);
  const interestSavings = r2(totalInterest - (consolidatedTotalCost - totalBalance));
  const monthsDifference = longestPayoffMonths === Infinity ? -newTermMonths : longestPayoffMonths - newTermMonths;

  return {
    current: {
      totalMonthlyPayment: r2(totalMonthlyPayment),
      totalInterest: r2(totalInterest),
      totalCost: r2(totalCost),
      longestPayoffMonths,
      rows,
    },
    consolidated: {
      totalBalance: r2(totalBalance),
      monthlyPayment: loanResult.monthlyPayment,
      totalInterest: r2(consolidatedTotalCost - totalBalance),
      totalCost: r2(consolidatedTotalCost),
      termMonths: newTermMonths,
      amountReceived: r2(amountReceived),
      effectiveApr,
      hasFee,
    },
    verdict: {
      monthlySavings,
      interestSavings,
      costSavings,
      monthsDifference,
      consolidationCostsMore: costSavings < 0,
    },
  };
}

const r2 = (n: number): number => Math.round(n * 100) / 100;

/* ─── URL param encoding ─── */

function encodeInputs(inputs: ConsolidationInputs): string {
  const params = new URLSearchParams();
  inputs.debts.forEach((d, i) => {
    params.set(`d${i}`, `${d.name}|${d.balance}|${d.apr}|${d.monthlyPayment}`);
  });
  params.set("rate", inputs.newApr.toString());
  params.set("term", inputs.newTermMonths.toString());
  params.set("fee", inputs.originationFeePct.toString());
  return params.toString();
}

function decodeInputs(params: URLSearchParams): ConsolidationInputs | null {
  const debts: DebtRow[] = [];
  let i = 0;
  while (params.has(`d${i}`)) {
    const raw = params.get(`d${i}`)!;
    const parts = raw.split("|");
    if (parts.length === 4) {
      const name = parts[0];
      const balance = parseFloat(parts[1]);
      const apr = parseFloat(parts[2]);
      const payment = parseFloat(parts[3]);
      if (!isNaN(balance) && !isNaN(apr) && !isNaN(payment)) {
        debts.push({ name, balance, apr, monthlyPayment: payment });
      }
    }
    i++;
  }
  if (debts.length === 0) return null;
  return {
    debts,
    newApr: params.has("rate") ? parseFloat(params.get("rate")!) : DEFAULT_INPUTS.newApr,
    newTermMonths: params.has("term") ? parseInt(params.get("term")!, 10) : DEFAULT_INPUTS.newTermMonths,
    originationFeePct: params.has("fee") ? parseFloat(params.get("fee")!) : DEFAULT_INPUTS.originationFeePct,
  };
}

/* ─── Component ─── */

export default function DebtConsolidationCalculator() {
  const [inputs, setInputs] = useState<ConsolidationInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const decoded = decodeInputs(params);
    return decoded ?? DEFAULT_INPUTS;
  });
  const [copied, setCopied] = useState(false);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const qs = encodeInputs(inputs);
    window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
  }, [inputs]);

  const comparison = useMemo(() => runComparison(inputs), [inputs]);

  /* ─── Debt row handlers ─── */

  const updateDebt = useCallback(
    (index: number, field: keyof DebtRow, value: string) => {
      setInputs((prev) => {
        const debts = [...prev.debts];
        const row = { ...debts[index] };
        if (field === "name") {
          row.name = value;
        } else {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            (row as Record<string, unknown>)[field] = num;
          }
        }
        debts[index] = row;
        return { ...prev, debts };
      });
    },
    [],
  );

  const addDebt = useCallback(() => {
    setInputs((prev) => ({
      ...prev,
      debts: [
        ...prev.debts,
        { name: `Debt ${prev.debts.length + 1}`, balance: 0, apr: 0, monthlyPayment: 0 },
      ],
    }));
  }, []);

  const removeDebt = useCallback((index: number) => {
    setInputs((prev) => {
      if (prev.debts.length <= 1) return prev;
      return { ...prev, debts: prev.debts.filter((_, i) => i !== index) };
    });
    toast.success("Debt removed");
  }, []);

  const handleConsolidationChange = useCallback(
    (field: "newApr" | "newTermMonths" | "originationFeePct", value: string) => {
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

  const totalBalance = useMemo(
    () => r2(inputs.debts.reduce((s, d) => s + d.balance, 0)),
    [inputs.debts],
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              Debt Consolidation Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your existing debts and a consolidation loan offer to see
              whether combining them saves money or costs more in total.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* ─── Side A: Current Debts ─── */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">Current Debts</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Total: {formatCurrency(totalBalance)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addDebt}
                      className="no-print"
                    >
                      <PlusCircle className="size-4 mr-1" />
                      Add Debt
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {inputs.debts.map((debt, idx) => {
                    const rowResult = comparison?.current.rows[idx];
                    const isNeverPayoff = rowResult?.neverPayoff ?? false;
                    return (
                      <Card
                        key={idx}
                        className={`border ${isNeverPayoff ? "border-destructive/50 bg-destructive/5" : "bg-muted/30"}`}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row gap-3">
                            {/* Name */}
                            <div className="sm:w-32 shrink-0">
                              <Label className="text-xs text-muted-foreground">Name</Label>
                              <Input
                                type="text"
                                value={debt.name}
                                onChange={(e) => updateDebt(idx, "name", e.target.value)}
                                className="mt-1 h-9 text-sm no-print"
                                aria-label={`Debt ${idx + 1} name`}
                              />
                              <span className="sm:hidden text-sm font-medium mt-1">{debt.name}</span>
                            </div>
                            {/* Balance */}
                            <div className="flex-1 min-w-0">
                              <Label className="text-xs text-muted-foreground">Balance</Label>
                              <Input
                                type="number"
                                min={0}
                                step={100}
                                value={debt.balance}
                                onChange={(e) => updateDebt(idx, "balance", e.target.value)}
                                className="mt-1 h-9 text-sm no-print"
                                aria-label={`Debt ${idx + 1} balance`}
                              />
                              <span className="sm:hidden text-sm mt-1">{formatCurrency(debt.balance)}</span>
                            </div>
                            {/* APR */}
                            <div className="w-full sm:w-24">
                              <Label className="text-xs text-muted-foreground">APR %</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={debt.apr}
                                onChange={(e) => updateDebt(idx, "apr", e.target.value)}
                                className="mt-1 h-9 text-sm no-print"
                                aria-label={`Debt ${idx + 1} APR`}
                              />
                              <span className="sm:hidden text-sm mt-1">{formatPercent(debt.apr)}</span>
                            </div>
                            {/* Monthly Payment */}
                            <div className="w-full sm:w-28">
                              <Label className="text-xs text-muted-foreground">Payment/mo</Label>
                              <Input
                                type="number"
                                min={0}
                                step={10}
                                value={debt.monthlyPayment}
                                onChange={(e) => updateDebt(idx, "monthlyPayment", e.target.value)}
                                className="mt-1 h-9 text-sm no-print"
                                aria-label={`Debt ${idx + 1} monthly payment`}
                              />
                              <span className="sm:hidden text-sm mt-1">{formatCurrency(debt.monthlyPayment)}</span>
                            </div>
                            {/* Result / Remove */}
                            <div className="flex items-end gap-2 shrink-0">
                              {rowResult && !isNeverPayoff && (
                                <div className="text-xs text-muted-foreground text-right hidden sm:block min-w-[90px]">
                                  <div>{rowResult.monthsToPayoff} mo to payoff</div>
                                  <div className="text-destructive">
                                    {formatCurrency(rowResult.totalInterest)} interest
                                  </div>
                                </div>
                              )}
                              {rowResult && isNeverPayoff && (
                                <div className="text-xs text-destructive font-medium hidden sm:flex items-center gap-1 min-w-[90px] justify-end">
                                  <AlertTriangle className="size-3" />
                                  Never pays off
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDebt(idx)}
                                disabled={inputs.debts.length <= 1}
                                className="no-print text-muted-foreground hover:text-destructive shrink-0"
                                aria-label={`Remove debt ${idx + 1}`}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                          {/* Mobile result row */}
                          {rowResult && !isNeverPayoff && (
                            <div className="sm:hidden flex justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
                              <span>{rowResult.monthsToPayoff} months to payoff</span>
                              <span className="text-destructive">{formatCurrency(rowResult.totalInterest)} interest</span>
                            </div>
                          )}
                          {rowResult && isNeverPayoff && (
                            <div className="sm:hidden flex items-center gap-1 text-xs text-destructive font-medium mt-2 pt-2 border-t">
                              <AlertTriangle className="size-3" />
                              Payment does not cover monthly interest. This debt will never be paid off at the current rate.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <div className="border-t" />

              {/* ─── Side B: Consolidation Loan ─── */}
              <section>
                <h3 className="text-base font-semibold mb-4">Consolidation Loan</h3>

                {/* Auto-filled balance */}
                <div className="flex items-center gap-2 mb-5 p-3 rounded-md bg-muted/50">
                  <Info className="size-4 text-ember shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Total balance from your debts:{" "}
                    <strong className="text-foreground">{formatCurrency(totalBalance)}</strong>
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  {/* New APR */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-apr" className="text-sm font-medium">
                        New APR
                      </Label>
                      <span className="text-sm font-semibold text-foreground">
                        {formatPercent(inputs.newApr)}
                      </span>
                    </div>
                    <div className="no-print">
                      <Slider
                        id="new-apr"
                        min={0}
                        max={30}
                        step={0.1}
                        value={[inputs.newApr]}
                        onValueChange={([v]) =>
                          setInputs((p) => ({ ...p, newApr: v }))
                        }
                        aria-label="New loan APR"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>30%</span>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        step={0.1}
                        value={inputs.newApr}
                        onChange={(e) => handleConsolidationChange("newApr", e.target.value)}
                        className="mt-1"
                        aria-label="New APR input"
                      />
                    </div>
                  </div>

                  {/* Term */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-term" className="text-sm font-medium">
                        Term (months)
                      </Label>
                      <span className="text-sm font-semibold text-foreground">
                        {inputs.newTermMonths}
                      </span>
                    </div>
                    <div className="no-print">
                      <Slider
                        id="new-term"
                        min={6}
                        max={84}
                        step={1}
                        value={[inputs.newTermMonths]}
                        onValueChange={([v]) =>
                          setInputs((p) => ({ ...p, newTermMonths: v }))
                        }
                        aria-label="New loan term"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>6 mo</span>
                        <span>84 mo</span>
                      </div>
                      <Input
                        type="number"
                        min={6}
                        max={84}
                        step={1}
                        value={inputs.newTermMonths}
                        onChange={(e) => handleConsolidationChange("newTermMonths", e.target.value)}
                        className="mt-1"
                        aria-label="New term input"
                      />
                    </div>
                  </div>

                  {/* Origination Fee */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="fee-pct" className="text-sm font-medium">
                          Origination Fee
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="size-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Optional lender fee, deducted from the loan
                            proceeds. The amount you receive will be less than
                            the total balance, but you still repay the full
                            amount.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {inputs.originationFeePct}%
                      </span>
                    </div>
                    <div className="no-print">
                      <Slider
                        id="fee-pct"
                        min={0}
                        max={10}
                        step={0.5}
                        value={[inputs.originationFeePct]}
                        onValueChange={([v]) =>
                          setInputs((p) => ({ ...p, originationFeePct: v }))
                        }
                        aria-label="Origination fee percentage"
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
                        step={0.5}
                        value={inputs.originationFeePct}
                        onChange={(e) =>
                          handleConsolidationChange("originationFeePct", e.target.value)
                        }
                        className="mt-1"
                        aria-label="Origination fee percentage input"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ─── Action buttons ─── */}
              <div className="flex flex-wrap items-center gap-3 no-print">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="size-4 mr-1" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="size-4 mr-1" />
                    ) : (
                      <Copy className="size-4 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="size-4 mr-1" />
                    Print
                  </Button>
                </div>
                {comparison && <ShareButtons summaryText={`${formatCurrency(totalBalance)} in debts → ${formatCurrency(comparison.consolidated.monthlyPayment)}/mo consolidated. Calculate yours:`} />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Comparison Results ─── */}
        {comparison && (
          <Card className="print-break-inside">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Scale className="size-5 text-ember" />
                Consolidation Verdict
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Verdict banner */}
                <div
                  className={`rounded-lg p-4 ${
                    comparison.verdict.consolidationCostsMore
                      ? "bg-destructive/10 border border-destructive/20"
                      : "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  {comparison.verdict.consolidationCostsMore ? (
                    <div className="flex items-start gap-3">
                      <TrendingUp className="size-5 text-destructive mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-destructive">
                          Consolidation costs{" "}
                          {formatCurrency(Math.abs(comparison.verdict.costSavings))} more in total
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          The lower monthly payment comes at the expense of a longer repayment
                          period. You pay more in total even though the rate is lower.
                          A lower monthly payment is not the same as a lower total cost.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <TrendingDown className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                          Consolidation saves{" "}
                          {formatCurrency(comparison.verdict.costSavings)} in total
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          The lower rate reduces your total cost compared to keeping the debts
                          separate. You also free up{" "}
                          {formatCurrency(comparison.verdict.monthlySavings)} per month in
                          cash flow.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Side-by-side comparison table */}
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2.5 text-left font-semibold" />
                        <th className="px-4 py-2.5 text-right font-semibold">
                          Current Debts
                        </th>
                        <th className="px-4 py-2.5 text-right font-semibold">
                          Consolidated
                        </th>
                        <th className="px-4 py-2.5 text-right font-semibold">
                          Difference
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-2.5 font-medium">Monthly Payment</td>
                        <td className="px-4 py-2.5 text-right">
                          {formatCurrency(comparison.current.totalMonthlyPayment)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {formatCurrency(comparison.consolidated.monthlyPayment)}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-semibold ${
                            comparison.verdict.monthlySavings >= 0
                              ? "text-emerald-600"
                              : "text-destructive"
                          }`}
                        >
                          {comparison.verdict.monthlySavings >= 0 ? "" : "+"}
                          {formatCurrency(comparison.verdict.monthlySavings)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2.5 font-medium">Total Interest</td>
                        <td className="px-4 py-2.5 text-right">
                          {formatCurrency(comparison.current.totalInterest)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {formatCurrency(comparison.consolidated.totalInterest)}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-semibold ${
                            comparison.verdict.interestSavings >= 0
                              ? "text-emerald-600"
                              : "text-destructive"
                          }`}
                        >
                          {comparison.verdict.interestSavings >= 0 ? "" : "+"}
                          {formatCurrency(comparison.verdict.interestSavings)}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2.5 font-medium">Total Cost</td>
                        <td className="px-4 py-2.5 text-right">
                          {formatCurrency(comparison.current.totalCost)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {formatCurrency(comparison.consolidated.totalCost)}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-semibold ${
                            comparison.verdict.costSavings >= 0
                              ? "text-emerald-600"
                              : "text-destructive"
                          }`}
                        >
                          {comparison.verdict.costSavings >= 0 ? "" : "+"}
                          {formatCurrency(comparison.verdict.costSavings)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium">Payoff Time</td>
                        <td className="px-4 py-2.5 text-right">
                          {comparison.current.longestPayoffMonths === Infinity
                            ? "Never (some debts)"
                            : `${comparison.current.longestPayoffMonths} months`}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {comparison.consolidated.termMonths} months
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-semibold ${
                            comparison.verdict.monthsDifference <= 0
                              ? "text-emerald-600"
                              : "text-destructive"
                          }`}
                        >
                          {comparison.current.longestPayoffMonths === Infinity
                            ? "N/A"
                            : comparison.verdict.monthsDifference > 0
                              ? `${comparison.verdict.monthsDifference} months sooner`
                              : comparison.verdict.monthsDifference === 0
                                ? "Same"
                                : `${Math.abs(comparison.verdict.monthsDifference)} months longer`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Fee-related tiles */}
                {comparison.consolidated.hasFee && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-sm font-semibold">Amount You Receive</p>
                        <p className="text-2xl font-bold mt-1">
                          {formatCurrency(comparison.consolidated.amountReceived)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          After {inputs.originationFeePct}% origination fee
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-sm font-semibold">Effective APR</p>
                        <p className="text-2xl font-bold mt-1">
                          {comparison.consolidated.effectiveApr !== null
                            ? formatPercent(comparison.consolidated.effectiveApr)
                            : "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          True cost including the origination fee
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Per-debt breakdown */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Current Debt Breakdown</h4>
                  <div className="overflow-x-auto rounded-md border max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-muted/90 backdrop-blur">
                        <tr className="border-b">
                          <th className="px-3 py-2 text-left font-semibold">Debt</th>
                          <th className="px-3 py-2 text-right font-semibold">Balance</th>
                          <th className="px-3 py-2 text-right font-semibold">APR</th>
                          <th className="px-3 py-2 text-right font-semibold">Payment</th>
                          <th className="px-3 py-2 text-right font-semibold">Months</th>
                          <th className="px-3 py-2 text-right font-semibold">Interest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.current.rows.map((row, i) => (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="px-3 py-2">{row.name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(row.balance)}</td>
                            <td className="px-3 py-2 text-right">{formatPercent(row.apr)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(row.monthlyPayment)}</td>
                            <td className="px-3 py-2 text-right">
                              {row.neverPayoff ? (
                                <span className="text-destructive font-medium">Never</span>
                              ) : (
                                `${row.monthsToPayoff}`
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {row.neverPayoff ? "-" : formatCurrency(row.totalInterest)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-muted/50 font-semibold">
                          <td className="px-3 py-2">Total</td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(totalBalance)}
                          </td>
                          <td className="px-3 py-2" />
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(comparison.current.totalMonthlyPayment)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {comparison.current.longestPayoffMonths === Infinity
                              ? "Never"
                              : `${comparison.current.longestPayoffMonths}`}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(comparison.current.totalInterest)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Honesty callout */}
                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="size-5 text-amber-600 mt-0.5 shrink-0" />
                      <div className="text-sm text-muted-foreground space-y-1.5">
                        <p>
                          <strong className="text-foreground">Consolidating unsecured debt
                          (credit cards) into a secured loan</strong> puts the
                          collateral asset at risk. If you default, the lender can
 seize it.
                        </p>
                        <p>
                          <strong className="text-foreground">Clearing card balances
                          without changing spending habits</strong> can leave you
                          with both the consolidation loan and new card balances.
                          The consolidation loan has fixed payments; the cards do
                          not.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Print Footer ─── */}
        <div className="hidden print:block text-center text-xs text-muted-foreground mt-6 pt-4 border-t">
          <p>
            CalcForge Debt Consolidation Calculator
            {" "}&middot;{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            {" "}&middot;{" "}
            https://thecalcforge.com/loans/debt-consolidation-calculator
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}