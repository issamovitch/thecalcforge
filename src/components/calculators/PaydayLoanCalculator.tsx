"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator,
  Copy,
  Check,
  Printer,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  calculatePaydayLoan,
  calculateLoan,
  formatCurrency,
  formatPercent,
  type PaydayLoanInputs,
  type LoanInputs,
} from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

type Mode = "single" | "installment";
type FeeType = "flat" | "per100";

interface SingleInputs {
  amount: number;
  feeValue: number; // raw slider value (either flat fee or per-$100 rate)
  feeType: FeeType;
  days: number;
}

interface InstallmentInputs {
  amount: number;
  apr: number;
  termMonths: number;
}

/* ─── Defaults ─── */

const DEFAULT_SINGLE: SingleInputs = {
  amount: 500,
  feeValue: 15,
  feeType: "per100",
  days: 14,
};

const DEFAULT_INSTALLMENT: InstallmentInputs = {
  amount: 500,
  apr: 400,
  termMonths: 6,
};

/* ─── Component ─── */

export default function PaydayLoanCalculator() {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "single";
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "installment" ? "installment" : "single";
  });

  const [singleInputs, setSingleInputs] = useState<SingleInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_SINGLE;
    const params = new URLSearchParams(window.location.search);
    const a = params.get("amount");
    const f = params.get("fee");
    const ft = params.get("feeType");
    const d = params.get("days");
    if (!a && !f && !ft && !d) return DEFAULT_SINGLE;
    return {
      amount: a ? parseFloat(a) : DEFAULT_SINGLE.amount,
      feeValue: f ? parseFloat(f) : DEFAULT_SINGLE.feeValue,
      feeType: ft === "flat" ? "flat" : "per100",
      days: d ? parseInt(d, 10) : DEFAULT_SINGLE.days,
    };
  });

  const [installmentInputs, setInstallmentInputs] =
    useState<InstallmentInputs>(() => {
      if (typeof window === "undefined") return DEFAULT_INSTALLMENT;
      const params = new URLSearchParams(window.location.search);
      const a = params.get("amount");
      const r = params.get("rate");
      const t = params.get("term");
      if (!a && !r && !t) return DEFAULT_INSTALLMENT;
      return {
        amount: a ? parseFloat(a) : DEFAULT_INSTALLMENT.amount,
        apr: r ? parseFloat(r) : DEFAULT_INSTALLMENT.apr,
        termMonths: t ? parseInt(t, 10) : DEFAULT_INSTALLMENT.termMonths,
      };
    });

  const [copied, setCopied] = useState(false);
  const [showAmortization, setShowAmortization] = useState(true);

  /* ─── Derived fee for single-payment mode ─── */
  const actualFee = useMemo(() => {
    if (singleInputs.feeType === "per100") {
      return (singleInputs.amount / 100) * singleInputs.feeValue;
    }
    return singleInputs.feeValue;
  }, [singleInputs.amount, singleInputs.feeValue, singleInputs.feeType]);

  /* ─── Calculated results ─── */
  const singleResult = useMemo(
    () =>
      calculatePaydayLoan({
        loanAmount: singleInputs.amount,
        fee: actualFee,
        termDays: singleInputs.days,
      }),
    [singleInputs.amount, actualFee, singleInputs.days]
  );

  const installmentResult = useMemo(
    () =>
      calculateLoan({
        loanAmount: installmentInputs.amount,
        apr: installmentInputs.apr,
        termMonths: installmentInputs.termMonths,
      }),
    [installmentInputs.amount, installmentInputs.apr, installmentInputs.termMonths]
  );

  /* ─── URL sync ─── */
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (mode === "single") {
      params.set("mode", "single");
      params.set("amount", singleInputs.amount.toString());
      params.set("fee", singleInputs.feeValue.toString());
      params.set("feeType", singleInputs.feeType);
      params.set("days", singleInputs.days.toString());
    } else {
      params.set("mode", "installment");
      params.set("amount", installmentInputs.amount.toString());
      params.set("rate", installmentInputs.apr.toString());
      params.set("term", installmentInputs.termMonths.toString());
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [mode, singleInputs, installmentInputs]);

  /* ─── Handlers ─── */
  const handleReset = useCallback(() => {
    setSingleInputs(DEFAULT_SINGLE);
    setInstallmentInputs(DEFAULT_INSTALLMENT);
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

  /* ─── Fee config helpers ─── */
  const feeMin = singleInputs.feeType === "flat" ? 5 : 5;
  const feeMax = singleInputs.feeType === "flat" ? 200 : 35;
  const feeStep = singleInputs.feeType === "flat" ? 5 : 0.5;
  const feeLabel =
    singleInputs.feeType === "flat" ? "Fee" : "Fee per $100";

  return (
    <div className="space-y-6">
      {/* ─── Calculator Card ─── */}
      <Card className="print-break-inside">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="size-5 text-ember" />
            Payday Loan Calculator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Estimate the true cost of a payday loan (single-payment or installment), including APR, total fees, and rollover costs.
          </p>

          {/* Mode Toggle */}
          <div className="flex gap-2 pt-2 no-print">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("single")}
              className={
                mode === "single"
                  ? "bg-ember/10 text-ember border-ember/30"
                  : ""
              }
            >
              Single Payment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("installment")}
              className={
                mode === "installment"
                  ? "bg-ember/10 text-ember border-ember/30"
                  : ""
              }
            >
              Installment
            </Button>
          </div>

          {/* Print-only mode label */}
          <p className="hidden print:block text-sm font-medium">
            Mode: {mode === "single" ? "Single Payment" : "Installment"}
          </p>
        </CardHeader>

        <CardContent>
          {mode === "single" ? (
            /* ═══════ SINGLE PAYMENT MODE ═══════ */
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Loan Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Loan Amount</Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(singleInputs.amount)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      min={50}
                      max={1500}
                      step={25}
                      value={[singleInputs.amount]}
                      onValueChange={([v]) =>
                        setSingleInputs((p) => ({ ...p, amount: v }))
                      }
                      aria-label="Loan amount"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$50</span>
                      <span>$1,500</span>
                    </div>
                    <Input
                      type="number"
                      min={50}
                      max={1500}
                      step={25}
                      value={singleInputs.amount}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        if (!isNaN(n))
                          setSingleInputs((p) => ({ ...p, amount: n }));
                      }}
                      className="mt-1"
                      aria-label="Loan amount input"
                    />
                  </div>
                </div>

                {/* Fee Type Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fee Type</Label>
                  <div className="flex gap-2 no-print">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSingleInputs((p) => ({
                          ...p,
                          feeType: "flat",
                          feeValue: 75,
                        }))
                      }
                      className={
                        singleInputs.feeType === "flat"
                          ? "bg-ember/10 text-ember border-ember/30"
                          : ""
                      }
                    >
                      $ fee
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSingleInputs((p) => ({
                          ...p,
                          feeType: "per100",
                          feeValue: 15,
                        }))
                      }
                      className={
                        singleInputs.feeType === "per100"
                          ? "bg-ember/10 text-ember border-ember/30"
                          : ""
                      }
                    >
                      $ per $100
                    </Button>
                  </div>
                </div>

                {/* Fee */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{feeLabel}</Label>
                    <span className="text-sm font-semibold text-foreground">
                      {singleInputs.feeType === "flat"
                        ? formatCurrency(singleInputs.feeValue)
                        : `$${singleInputs.feeValue.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      min={feeMin}
                      max={feeMax}
                      step={feeStep}
                      value={[singleInputs.feeValue]}
                      onValueChange={([v]) =>
                        setSingleInputs((p) => ({ ...p, feeValue: v }))
                      }
                      aria-label={feeLabel}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {singleInputs.feeType === "flat"
                          ? "$5"
                          : "$5.00"}
                      </span>
                      <span>
                        {singleInputs.feeType === "flat"
                          ? "$200"
                          : "$35.00"}
                      </span>
                    </div>
                    <Input
                      type="number"
                      min={feeMin}
                      max={feeMax}
                      step={feeStep}
                      value={singleInputs.feeValue}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        if (!isNaN(n))
                          setSingleInputs((p) => ({ ...p, feeValue: n }));
                      }}
                      className="mt-1"
                      aria-label={`${feeLabel} input`}
                    />
                  </div>
                </div>

                {/* Loan Term */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Loan Term</Label>
                    <span className="text-sm font-semibold text-foreground">
                      {singleInputs.days} days
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      min={7}
                      max={31}
                      step={1}
                      value={[singleInputs.days]}
                      onValueChange={([v]) =>
                        setSingleInputs((p) => ({ ...p, days: v }))
                      }
                      aria-label="Loan term in days"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>7 days</span>
                      <span>31 days</span>
                    </div>
                    <Input
                      type="number"
                      min={7}
                      max={31}
                      step={1}
                      value={singleInputs.days}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        if (!isNaN(n))
                          setSingleInputs((p) => ({ ...p, days: n }));
                      }}
                      className="mt-1"
                      aria-label="Loan term in days input"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {singleInputs.amount > 0 && actualFee > 0 ? (
                  <>
                    {/* Total Due Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Total Due
                      </p>
                      <p className="text-4xl font-bold tracking-tight text-ember">
                        {formatCurrency(singleResult.totalRepayment)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        in {singleInputs.days} days
                      </p>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <ResultCard
                        label="Finance Charge"
                        value={formatCurrency(singleResult.financeCharge)}
                        subtext="Cost to borrow"
                      />
                      <ResultCard
                        label="APR"
                        value={formatPercent(singleResult.apr)}
                        subtext="Annualized rate"
                      />
                      <ResultCard
                        label="Cost per $100"
                        value={`$${singleResult.costPerHundred.toFixed(2)}`}
                        subtext="Effective rate"
                      />
                    </div>

                    {/* Rollover Table */}
                    <Card>
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-sm font-semibold">
                          Rollover Cost Projection
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rolled Over</TableHead>
                              <TableHead className="text-right">
                                Total Fees
                              </TableHead>
                              <TableHead className="text-right">
                                Total Due
                              </TableHead>
                              <TableHead className="text-right">Days</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {singleResult.rollovers.map((r) => (
                              <TableRow key={r.times}>
                                <TableCell className="font-medium">
                                  {r.times} time
                                  {r.times !== 1 ? "s" : ""}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(r.totalFees)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(r.totalRepayment)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {r.totalDays}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

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
                      <ShareButtons summaryText={`${formatCurrency(singleInputs.amount)} + ${formatCurrency(singleResult.financeCharge)} fee = ${formatCurrency(singleResult.totalRepayment)} in ${singleInputs.days} days (APR: ${formatPercent(singleResult.apr)}). Calculate yours:`} />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This is an estimate for informational purposes only.
                      Actual fees vary by lender and state. Many states restrict
                      or prohibit payday loan rollovers. Always review your loan
                      agreement carefully before signing.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Enter valid loan details to see results.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ═══════ INSTALLMENT MODE ═══════ */
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Loan Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Loan Amount</Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(installmentInputs.amount)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      min={50}
                      max={2000}
                      step={25}
                      value={[installmentInputs.amount]}
                      onValueChange={([v]) =>
                        setInstallmentInputs((p) => ({ ...p, amount: v }))
                      }
                      aria-label="Loan amount"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$50</span>
                      <span>$2,000</span>
                    </div>
                    <Input
                      type="number"
                      min={50}
                      max={2000}
                      step={25}
                      value={installmentInputs.amount}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        if (!isNaN(n))
                          setInstallmentInputs((p) => ({ ...p, amount: n }));
                      }}
                      className="mt-1"
                      aria-label="Loan amount input"
                    />
                  </div>
                </div>

                {/* APR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">APR</Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPercent(installmentInputs.apr)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      min={50}
                      max={600}
                      step={5}
                      value={[installmentInputs.apr]}
                      onValueChange={([v]) =>
                        setInstallmentInputs((p) => ({ ...p, apr: v }))
                      }
                      aria-label="Annual percentage rate"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>50%</span>
                      <span>600%</span>
                    </div>
                    <Input
                      type="number"
                      min={50}
                      max={600}
                      step={5}
                      value={installmentInputs.apr}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        if (!isNaN(n))
                          setInstallmentInputs((p) => ({ ...p, apr: n }));
                      }}
                      className="mt-1"
                      aria-label="APR input"
                    />
                  </div>
                </div>

                {/* Term */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Term</Label>
                    <span className="text-sm font-semibold text-foreground">
                      {installmentInputs.termMonths} month
                      {installmentInputs.termMonths !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      min={1}
                      max={12}
                      step={1}
                      value={[installmentInputs.termMonths]}
                      onValueChange={([v]) =>
                        setInstallmentInputs((p) => ({
                          ...p,
                          termMonths: v,
                        }))
                      }
                      aria-label="Loan term in months"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 mo</span>
                      <span>12 mo</span>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      step={1}
                      value={installmentInputs.termMonths}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        if (!isNaN(n))
                          setInstallmentInputs((p) => ({
                            ...p,
                            termMonths: n,
                          }));
                      }}
                      className="mt-1"
                      aria-label="Loan term in months input"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {installmentResult.schedule.length > 0 ? (
                  <>
                    {/* Monthly Payment Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Monthly Payment
                      </p>
                      <p className="text-4xl font-bold tracking-tight text-ember">
                        {formatCurrency(installmentResult.monthlyPayment)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        for {installmentInputs.termMonths} month
                        {installmentInputs.termMonths !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Total Interest"
                        value={formatCurrency(installmentResult.totalInterest)}
                        subtext="Cost to borrow"
                      />
                      <ResultCard
                        label="Total Cost"
                        value={formatCurrency(installmentResult.totalCost)}
                        subtext="Principal + interest"
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
                      <ShareButtons summaryText={`${formatCurrency(installmentInputs.amount)} at ${formatPercent(installmentInputs.apr)} over ${installmentInputs.termMonths} months = ${formatCurrency(installmentResult.monthlyPayment)}/mo. Calculate yours:`} />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This is an estimate for informational purposes only.
                      Actual terms vary by lender, state, and credit profile.
                      Always review your loan agreement carefully before signing.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Enter valid loan details to see results.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Amortization Table (Installment only) ─── */}
      {mode === "installment" && installmentResult.schedule.length > 0 && (
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
            {/* Print-only title (button is hidden in print) */}
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
                  {installmentResult.schedule.map((row) => (
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
                  {formatCurrency(installmentResult.totalCost)}
                </span>
              </span>
              <span>
                Total Interest:{" "}
                <span className="text-destructive">
                  {formatCurrency(installmentResult.totalInterest)}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Print-only footer: URL + date ─── */}
      <PrintFooter />
    </div>
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
    return `${window.location.host}${window.location.pathname} · Printed ${d}`;
  }, []);
  return <span>{text}</span>;
}