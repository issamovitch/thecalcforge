"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Copy, Check, Printer, RotateCcw,
  ChevronDown, ChevronUp, Info, Plus, X,
  AlertTriangle, Target, Zap,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import ShareButtons from "@/components/calculators/ShareButtons";
import { useClientToday } from "@/lib/use-client-today";

/* ─── Types ─── */

export interface DebtEntry {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
}

interface DebtInputs {
  debts: DebtEntry[];
  method: "snowball" | "avalanche";
  extraPayment: number;
}

interface MonthEntry {
  month: number;
  debts: {
    id: string;
    name: string;
    payment: number;
    interest: number;
    principal: number;
    balance: number;
  }[];
}

interface PayoffResult {
  totalMonths: number;
  debtFreeDate: string;
  totalInterest: number;
  totalPaid: number;
  payoffOrder: string[];
  schedule: MonthEntry[];
  warnings: string[];
}

/* ─── Defaults ─── */

const genId = () => Math.random().toString(36).slice(2, 9);

export const DEFAULT_DEBTS: DebtEntry[] = [
  { id: genId(), name: "Credit Card A", balance: 4500, apr: 22.9, minimumPayment: 135 },
  { id: genId(), name: "Credit Card B", balance: 2200, apr: 18.9, minimumPayment: 66 },
  { id: genId(), name: "Personal Loan", balance: 8000, apr: 9.5, minimumPayment: 168 },
];

export const DEFAULT_INPUTS: DebtInputs = {
  debts: DEFAULT_DEBTS,
  method: "snowball",
  extraPayment: 200,
};

/* ─── Formatters ─── */

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

const fmtPercent = (v: number) => `${(v / 100).toFixed(2)}%`;

/* ─── Calculation Engine ─── */

function calculatePayoff(inputs: DebtInputs, today: Date | null): PayoffResult {
  const { debts, method, extraPayment } = inputs;

  const activeDebts = debts.filter((d) => d.balance > 0);
  if (activeDebts.length === 0) {
    return {
      totalMonths: 0,
      debtFreeDate: "",
      totalInterest: 0,
      totalPaid: 0,
      payoffOrder: [],
      schedule: [],
      warnings: [],
    };
  }

  // Check warnings: minimum payment < monthly interest
  const warnings: string[] = [];
  for (const d of activeDebts) {
    const monthlyInterest = d.balance * (d.apr / 100) / 12;
    if (d.minimumPayment <= monthlyInterest && d.minimumPayment < d.balance) {
      warnings.push(
        `"${d.name}" minimum payment (${fmtCurrency(d.minimumPayment)}/mo) may not cover monthly interest (${fmtCurrency(monthlyInterest)}/mo). This debt may never be paid off.`
      );
    }
  }

  // Sort debts based on method
  const sortedDebts = [...activeDebts].sort((a, b) => {
    if (method === "snowball") {
      return a.balance - b.balance; // lowest balance first
    } else {
      return b.apr - a.apr; // highest APR first
    }
  });

  // Build working state
  const balances: number[] = sortedDebts.map((d) => d.balance);
  const aprs: number[] = sortedDebts.map((d) => d.apr);
  const mins: number[] = sortedDebts.map((d) => d.minimumPayment);
  const names: string[] = sortedDebts.map((d) => d.name);
  const ids: string[] = sortedDebts.map((d) => d.id);

  const schedule: MonthEntry[] = [];
  const payoffOrder: string[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const maxMonths = 1200; // 100 years cap

  // Freed minimums from debts already paid off (persists across months)
  let freedMinimums = 0;

  while (month < maxMonths) {
    if (balances.every((b) => b < 0.005)) break;

    month++;
    // Extra pool = user's extra + all freed minimums from previously paid-off debts
    let extra = extraPayment + freedMinimums;
    let appliedExtra = false; // has extra been applied to the current priority debt?

    const monthData: MonthEntry = { month, debts: [] };

    for (let i = 0; i < sortedDebts.length; i++) {
      const bal = balances[i];

      // Already paid off — its minimum is already in freedMinimums
      if (bal < 0.005) {
        monthData.debts.push({ id: ids[i], name: names[i], payment: 0, interest: 0, principal: 0, balance: 0 });
        continue;
      }

      const interest = bal * (aprs[i] / 100) / 12;
      const owed = bal + interest;
      const minPay = Math.min(mins[i], owed);

      let payment = minPay;

      // Apply extra to the first (priority) unpaid debt
      if (!appliedExtra && extra > 0) {
        const remaining = owed - payment;
        const extraToApply = Math.min(extra, Math.max(0, remaining));
        payment += extraToApply;
        extra -= extraToApply;
        appliedExtra = true;
      }

      const principal = payment - interest;
      const newBal = Math.max(0, bal - principal);

      totalInterest += interest;
      totalPaid += payment;
      balances[i] = newBal;

      monthData.debts.push({
        id: ids[i],
        name: names[i],
        payment,
        interest,
        principal: Math.max(0, principal),
        balance: newBal,
      });

      // If this debt is fully paid off:
      // Free its minimum for future months only.
      // This month's remaining budget is already in `extra` from the
      // unspent portion (e.g., priority debt didn't need all the extra).
      // Reset appliedExtra so the next unpaid debt becomes the new priority.
      if (newBal < 0.005) {
        freedMinimums += mins[i];
        appliedExtra = false;
        if (!payoffOrder.includes(names[i])) {
          payoffOrder.push(names[i]);
        }
      }
    }

    schedule.push(monthData);
  }

  // today is null during SSR; debtFreeDate is left empty so no build-time date is
  // frozen in the prerendered HTML. After hydration the real date is used.
  const dateStr = today
    ? new Date(today.getFullYear(), today.getMonth() + month, 1).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "";

  return {
    totalMonths: month,
    debtFreeDate: dateStr,
    totalInterest,
    totalPaid,
    payoffOrder,
    schedule,
    warnings,
  };
}

/* ─── Component ─── */

export default function DebtPayoffCalculator() {
  const today = useClientToday();
  const [inputs, setInputs] = useState<DebtInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);

    // Check if any debt params exist
    const hasParams = params.get("d1name") || params.get("d1bal");
    if (!hasParams) return DEFAULT_INPUTS;

    // Parse debt entries from URL
    const debts: DebtEntry[] = [];
    for (let i = 1; i <= 10; i++) {
      const name = params.get(`d${i}name`);
      const bal = params.get(`d${i}bal`);
      if (!name && !bal) break;
      debts.push({
        id: genId(),
        name: name || `Debt ${i}`,
        balance: bal ? parseFloat(bal) : 0,
        apr: params.get(`d${i}apr`) ? parseFloat(params.get(`d${i}apr`)!) : 0,
        minimumPayment: params.get(`d${i}min`) ? parseFloat(params.get(`d${i}min`)!) : 0,
      });
    }
    if (debts.length === 0) return DEFAULT_INPUTS;

    const method = params.get("method") === "avalanche" ? "avalanche" : "snowball";
    const extraPayment = params.get("extra") ? parseFloat(params.get("extra")!) : DEFAULT_INPUTS.extraPayment;

    return { debts, method, extraPayment };
  });

  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(true);

  // Calculate results for both methods
  const snowballResult = useMemo(
    () => calculatePayoff({ ...inputs, method: "snowball" }, today),
    [inputs, today],
  );

  const avalancheResult = useMemo(
    () => calculatePayoff({ ...inputs, method: "avalanche" }, today),
    [inputs, today],
  );

  // Active result based on selected method
  const activeResult = inputs.method === "snowball" ? snowballResult : avalancheResult;

  // Sync URL query string when inputs change (skip initial render)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    inputs.debts.forEach((d, i) => {
      if (d.name) params.set(`d${i + 1}name`, d.name);
      params.set(`d${i + 1}bal`, d.balance.toString());
      params.set(`d${i + 1}apr`, d.apr.toString());
      params.set(`d${i + 1}min`, d.minimumPayment.toString());
    });
    params.set("method", inputs.method);
    params.set("extra", inputs.extraPayment.toString());
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

  const updateDebt = useCallback((id: string, field: keyof Omit<DebtEntry, "id">, value: string) => {
    setInputs((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => {
        if (d.id !== id) return d;
        if (field === "name") return { ...d, name: value };
        const num = parseFloat(value);
        return { ...d, [field]: isNaN(num) ? 0 : num };
      }),
    }));
  }, []);

  const addDebt = useCallback(() => {
    setInputs((prev) => ({
      ...prev,
      debts: [
        ...prev.debts,
        { id: genId(), name: `Debt ${prev.debts.length + 1}`, balance: 0, apr: 0, minimumPayment: 0 },
      ],
    }));
  }, []);

  const removeDebt = useCallback((id: string) => {
    setInputs((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
  }, []);

  const totalBalance = useMemo(
    () => inputs.debts.reduce((sum, d) => sum + d.balance, 0),
    [inputs.debts],
  );

  const hasValidDebts = inputs.debts.some((d) => d.balance > 0);

  // Comparison differences
  const interestDiff = snowballResult.totalInterest - avalancheResult.totalInterest;
  const monthDiff = snowballResult.totalMonths - avalancheResult.totalMonths;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="size-5 text-ember" />
              Debt Payoff Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare the Debt Snowball and Debt Avalanche methods to find the
              fastest and cheapest way to become debt-free. Add your debts,
              choose a strategy, and see your personalized payoff plan.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Debt Rows */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Your Debts</Label>
                    <span className="text-xs text-muted-foreground">
                      Total: {fmtCurrency(totalBalance)}
                    </span>
                  </div>

                  {inputs.debts.map((debt, idx) => (
                    <div
                      key={debt.id}
                      className="rounded-lg border bg-card p-3 sm:p-4 space-y-3"
                    >
                      {/* Row header: name + remove */}
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-ember/10 text-xs font-semibold text-ember">
                          {idx + 1}
                        </span>
                        <Input
                          type="text"
                          value={debt.name}
                          onChange={(e) => updateDebt(debt.id, "name", e.target.value)}
                          placeholder="Debt name"
                          className="flex-1 h-8 text-sm no-print"
                          aria-label={`Debt ${idx + 1} name`}
                        />
                        <span className="hidden sm:inline text-sm font-medium min-w-0 truncate max-w-[120px] print:inline">
                          {debt.name || `Debt ${idx + 1}`}
                        </span>
                        {inputs.debts.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0 text-muted-foreground hover:text-destructive no-print"
                            onClick={() => removeDebt(debt.id)}
                            aria-label={`Remove ${debt.name || `debt ${idx + 1}`}`}
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>

                      {/* Fields: 2-col on mobile, 4-col on sm+ */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Balance ($)</Label>
                          <Input
                            type="number"
                            min={0}
                            step={100}
                            value={debt.balance || ""}
                            onChange={(e) => updateDebt(debt.id, "balance", e.target.value)}
                            placeholder="0"
                            className="h-8 text-sm"
                            aria-label={`Debt ${idx + 1} balance`}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Label className="text-[11px] text-muted-foreground">APR (%)</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[200px] text-xs">
                                Annual Percentage Rate: the yearly interest rate on this debt.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            step={0.1}
                            value={debt.apr || ""}
                            onChange={(e) => updateDebt(debt.id, "apr", e.target.value)}
                            placeholder="0"
                            className="h-8 text-sm"
                            aria-label={`Debt ${idx + 1} APR`}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <div className="flex items-center gap-1">
                            <Label className="text-[11px] text-muted-foreground">Min. Payment ($/mo)</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[220px] text-xs">
                                The minimum required monthly payment. When this debt is paid off,
                                its minimum payment is redirected to the next priority debt.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            step={10}
                            value={debt.minimumPayment || ""}
                            onChange={(e) => updateDebt(debt.id, "minimumPayment", e.target.value)}
                            placeholder="0"
                            className="h-8 text-sm"
                            aria-label={`Debt ${idx + 1} minimum payment`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Debt Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addDebt}
                    className="w-full border-dashed text-muted-foreground hover:border-ember/40 hover:text-ember no-print"
                  >
                    <Plus className="mr-1.5 size-4" />
                    Add Debt
                  </Button>
                </div>

                {/* Method Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payoff Strategy</Label>
                  <div className="grid grid-cols-2 gap-2 no-print">
                    <button
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, method: "snowball" }))}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                        inputs.method === "snowball"
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground hover:border-ember/30 hover:text-ember"
                      }`}
                      aria-pressed={inputs.method === "snowball"}
                    >
                      <Target className="size-4" />
                      Snowball
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, method: "avalanche" }))}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                        inputs.method === "avalanche"
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground hover:border-ember/30 hover:text-ember"
                      }`}
                      aria-pressed={inputs.method === "avalanche"}
                    >
                      <Zap className="size-4" />
                      Avalanche
                    </button>
                  </div>
                  {/* Print-only method label */}
                  <p className="hidden print:block text-sm font-medium">
                    Strategy: {inputs.method === "snowball" ? "Debt Snowball" : "Debt Avalanche"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {inputs.method === "snowball"
                      ? "Pays off the smallest balance first for quick psychological wins."
                      : "Targets the highest interest rate first to minimize total interest paid."}
                  </p>
                </div>

                {/* Extra Monthly Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="extra-payment" className="text-sm font-medium">
                        Extra Monthly Payment
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px] text-xs">
                          An additional amount you can pay each month on top of
                          all minimum payments. This is applied to the priority
                          debt first. As debts are paid off, their minimum
                          payments also roll over to the next debt.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {fmtCurrency(inputs.extraPayment)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Input
                      id="extra-payment"
                      type="number"
                      min={0}
                      step={25}
                      value={inputs.extraPayment || ""}
                      onChange={(e) => {
                        const num = parseFloat(e.target.value);
                        setInputs((p) => ({
                          ...p,
                          extraPayment: isNaN(num) ? 0 : num,
                        }));
                      }}
                      placeholder="0"
                      aria-label="Extra monthly payment"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    Extra monthly payment: {fmtCurrency(inputs.extraPayment)}
                  </p>
                </div>

                {/* Warnings */}
                {activeResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    {activeResult.warnings.map((w, i) => (
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
                {hasValidDebts ? (
                  <>
                    {/* Debt Free Date Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Debt Free Date
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-ember">
                        {activeResult.totalMonths > 0
                          ? activeResult.debtFreeDate
                          : "Already debt-free!"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeResult.totalMonths > 0
                          ? `${activeResult.totalMonths} month${activeResult.totalMonths !== 1 ? "s" : ""} from now`
                          : "No active debt balances"}
                      </p>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Total Months"
                        value={activeResult.totalMonths.toString()}
                        subtext={
                          activeResult.totalMonths > 12
                            ? `≈ ${(activeResult.totalMonths / 12).toFixed(1)} years`
                            : activeResult.totalMonths <= 1
                              ? "Less than 1 month"
                              : `${activeResult.totalMonths} months`
                        }
                      />
                      <ResultCard
                        label="Total Interest"
                        value={fmtCurrency(activeResult.totalInterest)}
                        subtext={`${fmtPercent((activeResult.totalInterest / activeResult.totalPaid) * 100)} of total paid`}
                      />
                      <ResultCard
                        label="Total Paid"
                        value={fmtCurrency(activeResult.totalPaid)}
                        subtext={`Principal ${fmtCurrency(totalBalance)} + interest`}
                      />
                      <ResultCard
                        label="Monthly Payment"
                        value={fmtCurrency(
                          inputs.debts.reduce((s, d) => s + d.minimumPayment, 0) +
                            inputs.extraPayment,
                        )}
                        subtext="All minimums + extra"
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
                        summaryText={`Debt-free in ${activeResult.totalMonths} months. Total interest: ${fmtCurrency(activeResult.totalInterest)}. Calculate your payoff:`}
                      />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This calculator provides estimates for informational purposes
                      only. Actual payoff timelines depend on payment processing,
                      fees, and changes to your APR. Always check your statements
                      for accurate balances and rates.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Enter at least one debt with a balance to see results.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Comparison Card ─── */}
        {hasValidDebts && activeResult.totalMonths > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="size-4 text-ember" />
                Snowball vs. Avalanche Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-center">
                        <span className="flex items-center justify-center gap-1.5">
                          <Target className="size-3.5" />
                          Snowball
                        </span>
                      </TableHead>
                      <TableHead className="text-center">
                        <span className="flex items-center justify-center gap-1.5">
                          <Zap className="size-3.5" />
                          Avalanche
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Months to Payoff</TableCell>
                      <TableCell className="text-center">
                        {snowballResult.totalMonths}
                      </TableCell>
                      <TableCell className="text-center">
                        {avalancheResult.totalMonths}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Interest</TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(snowballResult.totalInterest)}
                      </TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(avalancheResult.totalInterest)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Paid</TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(snowballResult.totalPaid)}
                      </TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(avalancheResult.totalPaid)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Debt Free Date</TableCell>
                      <TableCell className="text-center text-sm">
                        {snowballResult.debtFreeDate}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {avalancheResult.debtFreeDate}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Comparison Summary */}
              <div className="mt-4 rounded-lg bg-muted/30 p-4 space-y-1.5">
                {interestDiff > 0.005 ? (
                  <>
                    <p className="text-sm font-medium">
                      <Zap className="inline size-3.5 text-ember mr-1" />
                      Avalanche saves{" "}
                      <span className="font-bold text-ember">
                        {fmtCurrency(interestDiff)}
                      </span>{" "}
                      in interest
                    </p>
                    {Math.abs(monthDiff) >= 1 && (
                      <p className="text-xs text-muted-foreground">
                        and {Math.abs(monthDiff)} month{Math.abs(monthDiff) !== 1 ? "s" : ""}{" "}
                        {monthDiff > 0 ? "faster" : "slower"} than Snowball.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Avalanche is mathematically optimal for minimizing total cost.
                    </p>
                  </>
                ) : interestDiff < -0.005 ? (
                  <>
                    <p className="text-sm font-medium">
                      <Target className="inline size-3.5 text-ember mr-1" />
                      Snowball saves{" "}
                      <span className="font-bold text-ember">
                        {fmtCurrency(Math.abs(interestDiff))}
                      </span>{" "}
                      in interest
                    </p>
                    {Math.abs(monthDiff) >= 1 && (
                      <p className="text-xs text-muted-foreground">
                        and {Math.abs(monthDiff)} month{Math.abs(monthDiff) !== 1 ? "s" : ""}{" "}
                        {monthDiff < 0 ? "faster" : "slower"} than Avalanche.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-medium">
                    Both methods cost the same:{" "}
                    <span className="text-ember">
                      {fmtCurrency(snowballResult.totalInterest)}
                    </span>{" "}
                    in total interest over {snowballResult.totalMonths} months.
                  </p>
                )}
                {inputs.extraPayment === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Without extra payments, both methods result in the same total
                    cost: only the payoff order differs.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Payoff Order ─── */}
        {hasValidDebts && activeResult.totalMonths > 0 && activeResult.payoffOrder.length > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Payoff Order ({inputs.method === "snowball" ? "Snowball" : "Avalanche"})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {activeResult.payoffOrder.map((name, idx) => {
                  const debt = inputs.debts.find((d) => d.name === name);
                  return (
                    <li key={`${name}-${idx}`} className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ember/10 text-xs font-bold text-ember">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        {debt && (
                          <p className="text-xs text-muted-foreground">
                            {fmtCurrency(debt.balance)} @ {fmtPercent(debt.apr)}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {(() => {
                          const paidMonth = activeResult.schedule.find((m) =>
                            m.debts.some((d) => d.name === name && d.balance < 0.005 && d.payment > 0)
                          );
                          return paidMonth ? (
                            <span className="text-xs font-medium text-muted-foreground">
                              Month {paidMonth.month}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* ─── Full Schedule ─── */}
        {hasValidDebts && activeResult.schedule.length > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="no-print flex w-full items-center justify-between text-left"
                aria-expanded={showSchedule}
              >
                <CardTitle className="text-lg">
                  Month-by-Month Payoff Schedule
                </CardTitle>
                {showSchedule ? (
                  <ChevronUp className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </button>
              {/* Print-only title */}
              <CardTitle className="hidden print:block text-lg">
                Month-by-Month Payoff Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className={showSchedule ? "" : "hidden print:block"}>
              <div className="amortization-scroll max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Month</TableHead>
                      <TableHead>Debt</TableHead>
                      <TableHead className="text-right">Payment</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeResult.schedule.map((m) =>
                      m.debts
                        .filter((d) => d.payment > 0 || m.month <= 1 || m.month === activeResult.totalMonths)
                        .map((d) => (
                          <TableRow key={`${m.month}-${d.id}`}>
                            {d === m.debts.filter((dd) => dd.payment > 0 || m.month <= 1 || m.month === activeResult.totalMonths)[0] ? (
                              <TableCell
                                className="font-medium align-top"
                                rowSpan={
                                  m.debts.filter((dd) => dd.payment > 0 || m.month <= 1 || m.month === activeResult.totalMonths).length
                                }
                              >
                                {m.month}
                              </TableCell>
                            ) : null}
                            <TableCell className="text-sm align-top">
                              {d.name}
                            </TableCell>
                            <TableCell className="text-right align-top">
                              {d.payment > 0 ? fmtCurrency(d.payment) : "-"}
                            </TableCell>
                            <TableCell className="text-right align-top text-muted-foreground">
                              {d.interest > 0 ? fmtCurrency(d.interest) : "-"}
                            </TableCell>
                            <TableCell className="text-right align-top">
                              {d.principal > 0 ? fmtCurrency(d.principal) : "-"}
                            </TableCell>
                            <TableCell className="text-right align-top font-medium">
                              {fmtCurrency(d.balance)}
                            </TableCell>
                          </TableRow>
                        )),
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm font-medium">
                <span>
                  Total Paid:{" "}
                  <span className="text-ember">
                    {fmtCurrency(activeResult.totalPaid)}
                  </span>
                </span>
                <span>
                  Total Interest:{" "}
                  <span className="text-destructive">
                    {fmtCurrency(activeResult.totalInterest)}
                  </span>
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