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
  Info,
  PlusCircle,
  AlertTriangle,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  calculateLoanWithExtra,
  calculateBalloonLoan,
  calculateMCA,
  formatCurrency,
  formatPercent,
  type LoanWithExtraResult,
  type BalloonLoanResult,
  type MCAResult,
} from "@/lib/loan-math";

/* ─── Types ─── */

type Mode = "term" | "equipment" | "mca";

interface TermInputs {
  loanAmount: number;
  apr: number;
  termMonths: number;
  extraMonthly: number;
  extraStartMonth: number;
}

interface EquipmentInputs {
  price: number;
  downPayment: number;
  balloonAmount: number;
  apr: number;
  termMonths: number;
}

interface MCAInputs {
  advanceAmount: number;
  factorRate: number;
  repaymentMonths: number;
}

/* ─── Defaults ─── */

export const DEFAULT_TERM_INPUTS: TermInputs = {
  loanAmount: 50000,
  apr: 8,
  termMonths: 60,
  extraMonthly: 0,
  extraStartMonth: 1,
};

export const DEFAULT_EQUIPMENT_INPUTS: EquipmentInputs = {
  price: 75000,
  downPayment: 15000,
  balloonAmount: 10000,
  apr: 7,
  termMonths: 60,
};

export const DEFAULT_MCA_INPUTS: MCAInputs = {
  advanceAmount: 50000,
  factorRate: 1.3,
  repaymentMonths: 12,
};

export const DEFAULT_INPUTS = DEFAULT_TERM_INPUTS;

/* Pre-compute default result at module level for SSR */
export const DEFAULT_RESULT = calculateLoanWithExtra({
  loanAmount: DEFAULT_TERM_INPUTS.loanAmount,
  apr: DEFAULT_TERM_INPUTS.apr,
  termMonths: DEFAULT_TERM_INPUTS.termMonths,
});

/* ─── Component ─── */

export default function BusinessLoanCalculator() {
  /* ─── Mode ─── */
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "term";
    const params = new URLSearchParams(window.location.search);
    const m = params.get("mode");
    if (m === "equipment") return "equipment";
    if (m === "mca") return "mca";
    return "term";
  });

  /* ─── Mode 1: Term Inputs ─── */
  const [termInputs, setTermInputs] = useState<TermInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_TERM_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const a = params.get("amount");
    const r = params.get("rate");
    const t = params.get("term");
    const ex = params.get("extra");
    const es = params.get("extrastart");
    if (!a && !r && !t && !ex && !es) return DEFAULT_TERM_INPUTS;
    return {
      loanAmount: a ? parseFloat(a) : DEFAULT_TERM_INPUTS.loanAmount,
      apr: r ? parseFloat(r) : DEFAULT_TERM_INPUTS.apr,
      termMonths: t ? parseInt(t, 10) : DEFAULT_TERM_INPUTS.termMonths,
      extraMonthly: ex ? parseFloat(ex) : DEFAULT_TERM_INPUTS.extraMonthly,
      extraStartMonth: es
        ? parseInt(es, 10)
        : DEFAULT_TERM_INPUTS.extraStartMonth,
    };
  });

  /* ─── Mode 2: Equipment Inputs ─── */
  const [equipmentInputs, setEquipmentInputs] = useState<EquipmentInputs>(
    () => {
      if (typeof window === "undefined") return DEFAULT_EQUIPMENT_INPUTS;
      const params = new URLSearchParams(window.location.search);
      const p = params.get("price");
      const d = params.get("down");
      const b = params.get("balloon");
      const r = params.get("rate");
      const t = params.get("term");
      if (!p && !d && !b && !r && !t) return DEFAULT_EQUIPMENT_INPUTS;
      return {
        price: p ? parseFloat(p) : DEFAULT_EQUIPMENT_INPUTS.price,
        downPayment: d ? parseFloat(d) : DEFAULT_EQUIPMENT_INPUTS.downPayment,
        balloonAmount: b
          ? parseFloat(b)
          : DEFAULT_EQUIPMENT_INPUTS.balloonAmount,
        apr: r ? parseFloat(r) : DEFAULT_EQUIPMENT_INPUTS.apr,
        termMonths: t
          ? parseInt(t, 10)
          : DEFAULT_EQUIPMENT_INPUTS.termMonths,
      };
    }
  );

  /* ─── Mode 3: MCA Inputs ─── */
  const [mcaInputs, setMCAInputs] = useState<MCAInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_MCA_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const a = params.get("advance");
    const f = params.get("factor");
    const m = params.get("months");
    if (!a && !f && !m) return DEFAULT_MCA_INPUTS;
    return {
      advanceAmount: a
        ? parseFloat(a)
        : DEFAULT_MCA_INPUTS.advanceAmount,
      factorRate: f ? parseFloat(f) : DEFAULT_MCA_INPUTS.factorRate,
      repaymentMonths: m
        ? parseInt(m, 10)
        : DEFAULT_MCA_INPUTS.repaymentMonths,
    };
  });

  const [copied, setCopied] = useState(false);
  const [showAmortization, setShowAmortization] = useState(true);
  const [showExtraInputs, setShowExtraInputs] = useState(false);

  /* ─── Results ─── */
  const termResult = useMemo(
    () =>
      calculateLoanWithExtra({
        loanAmount: termInputs.loanAmount,
        apr: termInputs.apr,
        termMonths: termInputs.termMonths,
        extraMonthly: termInputs.extraMonthly,
        extraStartMonth: termInputs.extraStartMonth,
      }),
    [
      termInputs.loanAmount,
      termInputs.apr,
      termInputs.termMonths,
      termInputs.extraMonthly,
      termInputs.extraStartMonth,
    ]
  );

  const equipmentResult = useMemo(
    () =>
      calculateBalloonLoan({
        loanAmount: equipmentInputs.price,
        downPayment: equipmentInputs.downPayment,
        balloonAmount: equipmentInputs.balloonAmount,
        apr: equipmentInputs.apr,
        termMonths: equipmentInputs.termMonths,
      }),
    [equipmentInputs]
  );

  const mcaResult = useMemo(
    () =>
      calculateMCA({
        advanceAmount: mcaInputs.advanceAmount,
        factorRate: mcaInputs.factorRate,
        repaymentMonths: mcaInputs.repaymentMonths,
      }),
    [mcaInputs]
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
    if (mode === "term") {
      params.set("mode", "term");
      params.set("amount", termInputs.loanAmount.toString());
      params.set("rate", termInputs.apr.toString());
      params.set("term", termInputs.termMonths.toString());
      params.set("extra", termInputs.extraMonthly.toString());
      params.set("extrastart", termInputs.extraStartMonth.toString());
    } else if (mode === "equipment") {
      params.set("mode", "equipment");
      params.set("price", equipmentInputs.price.toString());
      params.set("down", equipmentInputs.downPayment.toString());
      params.set("balloon", equipmentInputs.balloonAmount.toString());
      params.set("rate", equipmentInputs.apr.toString());
      params.set("term", equipmentInputs.termMonths.toString());
    } else {
      params.set("mode", "mca");
      params.set("advance", mcaInputs.advanceAmount.toString());
      params.set("factor", mcaInputs.factorRate.toString());
      params.set("months", mcaInputs.repaymentMonths.toString());
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [mode, termInputs, equipmentInputs, mcaInputs]);

  /* ─── Handlers ─── */
  const handleTermChange = useCallback(
    (field: keyof TermInputs, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setTermInputs((prev) => ({ ...prev, [field]: num }));
      }
    },
    []
  );

  const handleEquipmentChange = useCallback(
    (field: keyof EquipmentInputs, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setEquipmentInputs((prev) => ({ ...prev, [field]: num }));
      }
    },
    []
  );

  const handleMCAChange = useCallback(
    (field: keyof MCAInputs, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setMCAInputs((prev) => ({ ...prev, [field]: num }));
      }
    },
    []
  );

  const handleReset = useCallback(() => {
    setTermInputs(DEFAULT_TERM_INPUTS);
    setEquipmentInputs(DEFAULT_EQUIPMENT_INPUTS);
    setMCAInputs(DEFAULT_MCA_INPUTS);
    setShowExtraInputs(false);
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

  /* ─── Helpers ─── */
  const financedAmount = Math.max(
    0,
    equipmentInputs.price - equipmentInputs.downPayment
  );

  /* ─── Render ─── */
  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              Business Loan Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare term loans, equipment financing, and merchant cash
              advances to find the right funding for your business.
            </p>

            {/* Mode Toggle */}
            <div className="flex gap-2 pt-2 no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("term")}
                className={
                  mode === "term"
                    ? "bg-ember/10 text-ember border-ember/30"
                    : ""
                }
              >
                Term Loan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("equipment")}
                className={
                  mode === "equipment"
                    ? "bg-ember/10 text-ember border-ember/30"
                    : ""
                }
              >
                Equipment Loan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("mca")}
                className={
                  mode === "mca"
                    ? "bg-ember/10 text-ember border-ember/30"
                    : ""
                }
              >
                Merchant Cash Advance
              </Button>
            </div>

            {/* Print-only mode label */}
            <p className="hidden print:block text-sm font-medium">
              Mode:{" "}
              {mode === "term"
                ? "Term Loan"
                : mode === "equipment"
                  ? "Equipment Loan"
                  : "Merchant Cash Advance"}
            </p>
          </CardHeader>

          <CardContent>
            {/* ═══════ TERM LOAN MODE ═══════ */}
            {mode === "term" && (
              <TermLoanView
                inputs={termInputs}
                result={termResult}
                showExtraInputs={showExtraInputs}
                setShowExtraInputs={setShowExtraInputs}
                onInputChange={handleTermChange}
                copied={copied}
                onCopyLink={handleCopyLink}
                onPrint={handlePrint}
                onReset={handleReset}
              />
            )}

            {/* ═══════ EQUIPMENT LOAN MODE ═══════ */}
            {mode === "equipment" && (
              <EquipmentLoanView
                inputs={equipmentInputs}
                result={equipmentResult}
                financedAmount={financedAmount}
                onInputChange={handleEquipmentChange}
                copied={copied}
                onCopyLink={handleCopyLink}
                onPrint={handlePrint}
                onReset={handleReset}
              />
            )}

            {/* ═══════ MCA MODE ═══════ */}
            {mode === "mca" && (
              <MCAView
                inputs={mcaInputs}
                result={mcaResult}
                onInputChange={handleMCAChange}
                copied={copied}
                onCopyLink={handleCopyLink}
                onPrint={handlePrint}
                onReset={handleReset}
              />
            )}
          </CardContent>
        </Card>

        {/* ─── Amortization Table (Term Loan) ─── */}
        {mode === "term" && termResult.result.schedule.length > 0 && (
          <AmortizationTable
            schedule={termResult.result.schedule}
            totalCost={termResult.result.totalCost}
            totalInterest={termResult.result.totalInterest}
            showAmortization={showAmortization}
            setShowAmortization={setShowAmortization}
          />
        )}

        {/* ─── Amortization Table (Equipment Loan) ─── */}
        {mode === "equipment" && equipmentResult.schedule.length > 0 && (
          <AmortizationTable
            schedule={equipmentResult.schedule}
            totalCost={equipmentResult.totalCost}
            totalInterest={equipmentResult.totalInterest}
            showAmortization={showAmortization}
            setShowAmortization={setShowAmortization}
            balloonNote={`${formatCurrency(equipmentResult.balloonAmount)} balloon due after month ${equipmentResult.schedule.length}`}
          />
        )}

        {/* ─── Print-only footer ─── */}
        <PrintFooter />
      </div>
    </TooltipProvider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 1: TERM LOAN VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function TermLoanView({
  inputs,
  result,
  showExtraInputs,
  setShowExtraInputs,
  onInputChange,
  copied,
  onCopyLink,
  onPrint,
  onReset,
}: {
  inputs: TermInputs;
  result: LoanWithExtraResult;
  showExtraInputs: boolean;
  setShowExtraInputs: (v: boolean) => void;
  onInputChange: (field: keyof TermInputs, value: string) => void;
  copied: boolean;
  onCopyLink: () => void;
  onPrint: () => void;
  onReset: () => void;
}) {
  const schedule = result.result.schedule;
  const displayResult = inputs.extraMonthly > 0 ? result.result : result.baseResult;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ─── Inputs ─── */}
      <div className="space-y-5">
        {/* Loan Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="term-loan-amount" className="text-sm font-medium">
                Loan Amount
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  The total amount you want to borrow for your business.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(inputs.loanAmount)}
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="term-loan-amount"
              min={1000}
              max={500000}
              step={1000}
              value={[inputs.loanAmount]}
              onValueChange={([v]) => onInputChange("loanAmount", v.toString())}
              aria-label="Loan amount"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$1,000</span>
              <span>$500,000</span>
            </div>
            <Input
              type="number"
              min={1000}
              max={500000}
              step={1000}
              value={inputs.loanAmount}
              onChange={(e) => onInputChange("loanAmount", e.target.value)}
              className="mt-1"
              aria-label="Loan amount input"
            />
          </div>
        </div>

        {/* APR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="term-apr" className="text-sm font-medium">
                Annual Interest Rate (APR)
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-xs">
                  Business loan APRs vary widely. SBA loans can be 8&ndash;13%,
                  while online lenders may charge 10&ndash;30%. Your actual rate
                  depends on creditworthiness, revenue, and time in business.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatPercent(inputs.apr)}
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="term-apr"
              min={1}
              max={30}
              step={0.1}
              value={[inputs.apr]}
              onValueChange={([v]) => onInputChange("apr", v.toString())}
              aria-label="Annual interest rate"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>30%</span>
            </div>
            <Input
              type="number"
              min={1}
              max={30}
              step={0.1}
              value={inputs.apr}
              onChange={(e) => onInputChange("apr", e.target.value)}
              className="mt-1"
              aria-label="Annual interest rate input"
            />
          </div>
        </div>

        {/* Term */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="term-months" className="text-sm font-medium">
              Loan Term (Months)
            </Label>
            <span className="text-sm font-semibold text-foreground">
              {inputs.termMonths} mo
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="term-months"
              min={1}
              max={360}
              step={1}
              value={[inputs.termMonths]}
              onValueChange={([v]) => onInputChange("termMonths", v.toString())}
              aria-label="Loan term in months"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 mo</span>
              <span>360 mo</span>
            </div>
            <Input
              type="number"
              min={1}
              max={360}
              step={1}
              value={inputs.termMonths}
              onChange={(e) => onInputChange("termMonths", e.target.value)}
              className="mt-1"
              aria-label="Loan term in months input"
            />
          </div>
        </div>

        {/* ─── Extra Payments (collapsible) ─── */}
        <div className="no-print">
          <button
            type="button"
            onClick={() => setShowExtraInputs(!showExtraInputs)}
            className="flex w-full items-center gap-2 rounded-md border border-dashed border-muted-foreground/30 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-ember/40 hover:text-ember"
          >
            <PlusCircle className="size-4" />
            <span>Extra Monthly Payments</span>
            {showExtraInputs ? (
              <ChevronUp className="ml-auto size-4" />
            ) : (
              <ChevronDown className="ml-auto size-4" />
            )}
          </button>

          {showExtraInputs && (
            <div className="mt-3 space-y-4 rounded-lg border border-ember/20 bg-ember/5 p-4">
              {/* Extra Monthly Payment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label
                      htmlFor="term-extra-monthly"
                      className="text-sm font-medium"
                    >
                      Extra Monthly Payment
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px] text-xs">
                        An additional amount you pay each month on top of your
                        regular payment. This goes directly toward reducing
                        principal, helping you pay off the loan faster and save
                        on interest.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(inputs.extraMonthly)}
                  </span>
                </div>
                <Slider
                  id="term-extra-monthly"
                  min={0}
                  max={10000}
                  step={100}
                  value={[inputs.extraMonthly]}
                  onValueChange={([v]) =>
                    onInputChange("extraMonthly", v.toString())
                  }
                  aria-label="Extra monthly payment"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>$10,000</span>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={10000}
                  step={100}
                  value={inputs.extraMonthly}
                  onChange={(e) =>
                    onInputChange("extraMonthly", e.target.value)
                  }
                  className="mt-1"
                  aria-label="Extra monthly payment input"
                />
              </div>

              {/* Start From Month */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label
                      htmlFor="term-extra-start"
                      className="text-sm font-medium"
                    >
                      Start From Month
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px] text-xs">
                        The month number when you begin making extra payments.
                        Set to 1 to start immediately, or a higher number to
                        begin after several regular payments.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    Month {inputs.extraStartMonth}
                  </span>
                </div>
                <Slider
                  id="term-extra-start"
                  min={1}
                  max={inputs.termMonths}
                  step={1}
                  value={[inputs.extraStartMonth]}
                  onValueChange={([v]) =>
                    onInputChange("extraStartMonth", v.toString())
                  }
                  aria-label="Start extra payments from month"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>{inputs.termMonths}</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={inputs.termMonths}
                  step={1}
                  value={inputs.extraStartMonth}
                  onChange={(e) =>
                    onInputChange("extraStartMonth", e.target.value)
                  }
                  className="mt-1"
                  aria-label="Start extra payments from month input"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="space-y-4">
        {schedule.length > 0 ? (
          <>
            {/* Monthly Payment Highlight */}
            <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Estimated Monthly Payment
              </p>
              <p className="text-4xl font-bold tracking-tight text-ember">
                {formatCurrency(displayResult.monthlyPayment)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                for{" "}
                {inputs.extraMonthly > 0
                  ? `${result.actualPayoffMonth} month${result.actualPayoffMonth !== 1 ? "s" : ""} (with extra payments)`
                  : `${inputs.termMonths} month${inputs.termMonths !== 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Total Interest"
                value={formatCurrency(displayResult.totalInterest)}
                subtext={`${formatPercent(
                  (displayResult.totalInterest / displayResult.totalCost) * 100
                )} of total cost`}
              />
              <ResultCard
                label="Total Cost"
                value={formatCurrency(displayResult.totalCost)}
                subtext="Principal + interest"
              />
              <ResultCard
                label="Finance Charge"
                value={formatCurrency(displayResult.totalInterest)}
                subtext="Cost to borrow"
              />
              <ResultCard
                label="Number of Payments"
                value={
                  inputs.extraMonthly > 0
                    ? `${result.actualPayoffMonth} mo`
                    : `${inputs.termMonths} mo`
                }
                subtext={
                  inputs.extraMonthly > 0
                    ? `${result.monthsSaved} month${result.monthsSaved !== 1 ? "s" : ""} saved`
                    : "Full term"
                }
              />
            </div>

            {/* Early Payoff Savings */}
            {inputs.extraMonthly > 0 && result.monthsSaved > 0 && (
              <div className="rounded-lg border border-ember/30 bg-ember/5 p-4 space-y-2">
                <p className="text-sm font-semibold text-ember">
                  Early Payoff Savings
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Months Saved</p>
                    <p className="text-base font-bold">
                      {result.monthsSaved}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Saved</p>
                    <p className="text-base font-bold text-ember">
                      {formatCurrency(result.interestSaved)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">New Total Cost</p>
                    <p className="text-base font-bold">
                      {formatCurrency(result.result.totalCost)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <ActionButtons
              copied={copied}
              onCopyLink={onCopyLink}
              onPrint={onPrint}
              onReset={onReset}
            />

            {/* Disclaimer */}
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              This is an estimate for informational purposes only. Actual terms
              vary by lender, credit profile, and business financials. Always
              review your loan agreement carefully before signing.
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Enter valid loan details to see results.
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 2: EQUIPMENT LOAN VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function EquipmentLoanView({
  inputs,
  result,
  financedAmount,
  onInputChange,
  copied,
  onCopyLink,
  onPrint,
  onReset,
}: {
  inputs: EquipmentInputs;
  result: BalloonLoanResult;
  financedAmount: number;
  onInputChange: (field: keyof EquipmentInputs, value: string) => void;
  copied: boolean;
  onCopyLink: () => void;
  onPrint: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ─── Inputs ─── */}
      <div className="space-y-5">
        {/* Equipment Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="eq-price" className="text-sm font-medium">
                Equipment Price
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  The total purchase price of the equipment or vehicle you are
                  financing.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(inputs.price)}
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="eq-price"
              min={1000}
              max={500000}
              step={1000}
              value={[inputs.price]}
              onValueChange={([v]) => onInputChange("price", v.toString())}
              aria-label="Equipment price"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$1,000</span>
              <span>$500,000</span>
            </div>
            <Input
              type="number"
              min={1000}
              max={500000}
              step={1000}
              value={inputs.price}
              onChange={(e) => onInputChange("price", e.target.value)}
              className="mt-1"
              aria-label="Equipment price input"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="eq-down" className="text-sm font-medium">
                Down Payment
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-xs">
                  The upfront amount you pay toward the equipment. A larger down
                  payment reduces the financed amount and monthly payments.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(inputs.downPayment)}
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="eq-down"
              min={0}
              max={inputs.price}
              step={500}
              value={[inputs.downPayment]}
              onValueChange={([v]) => onInputChange("downPayment", v.toString())}
              aria-label="Down payment"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>{formatCurrency(inputs.price)}</span>
            </div>
            <Input
              type="number"
              min={0}
              max={inputs.price}
              step={500}
              value={inputs.downPayment}
              onChange={(e) => onInputChange("downPayment", e.target.value)}
              className="mt-1"
              aria-label="Down payment input"
            />
          </div>
        </div>

        {/* Balloon / Residual Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="eq-balloon" className="text-sm font-medium">
                Balloon / Residual Amount
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px] text-xs">
                  A lump sum due at the end of the loan term. Also called a
                  residual or buyout amount. Common in equipment leases where
                  you can purchase the equipment at the end.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(inputs.balloonAmount)}
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="eq-balloon"
              min={0}
              max={financedAmount}
              step={500}
              value={[inputs.balloonAmount]}
              onValueChange={([v]) =>
                onInputChange("balloonAmount", v.toString())
              }
              aria-label="Balloon amount"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>{formatCurrency(financedAmount)}</span>
            </div>
            <Input
              type="number"
              min={0}
              max={financedAmount}
              step={500}
              value={inputs.balloonAmount}
              onChange={(e) => onInputChange("balloonAmount", e.target.value)}
              className="mt-1"
              aria-label="Balloon amount input"
            />
          </div>
        </div>

        {/* APR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="eq-apr" className="text-sm font-medium">
                Annual Interest Rate (APR)
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-xs">
                  Equipment loan rates typically range from 4% to 30% depending
                  on the lender, credit profile, and equipment type.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatPercent(inputs.apr)}
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="eq-apr"
              min={1}
              max={30}
              step={0.1}
              value={[inputs.apr]}
              onValueChange={([v]) => onInputChange("apr", v.toString())}
              aria-label="Annual interest rate"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span>
              <span>30%</span>
            </div>
            <Input
              type="number"
              min={1}
              max={30}
              step={0.1}
              value={inputs.apr}
              onChange={(e) => onInputChange("apr", e.target.value)}
              className="mt-1"
              aria-label="Annual interest rate input"
            />
          </div>
        </div>

        {/* Term */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="eq-term" className="text-sm font-medium">
              Loan Term (Months)
            </Label>
            <span className="text-sm font-semibold text-foreground">
              {inputs.termMonths} mo
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="eq-term"
              min={1}
              max={180}
              step={1}
              value={[inputs.termMonths]}
              onValueChange={([v]) => onInputChange("termMonths", v.toString())}
              aria-label="Loan term in months"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 mo</span>
              <span>180 mo</span>
            </div>
            <Input
              type="number"
              min={1}
              max={180}
              step={1}
              value={inputs.termMonths}
              onChange={(e) => onInputChange("termMonths", e.target.value)}
              className="mt-1"
              aria-label="Loan term in months input"
            />
          </div>
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="space-y-4">
        {result.schedule.length > 0 ? (
          <>
            {/* Monthly Payment Highlight */}
            <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Estimated Monthly Payment
              </p>
              <p className="text-4xl font-bold tracking-tight text-ember">
                {formatCurrency(result.monthlyPayment)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                for {inputs.termMonths} month
                {inputs.termMonths !== 1 ? "s" : ""}, plus{" "}
                {formatCurrency(result.balloonAmount)} balloon due
              </p>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Financed Amount"
                value={formatCurrency(result.financedAmount)}
                subtext={`${formatCurrency(inputs.price)} - ${formatCurrency(result.downPayment)}`}
              />
              <ResultCard
                label="Down Payment"
                value={formatCurrency(result.downPayment)}
                subtext={`${((result.downPayment / inputs.price) * 100).toFixed(0)}% of price`}
              />
              <ResultCard
                label="Balloon Due"
                value={formatCurrency(result.balloonAmount)}
                subtext="Lump sum at end of term"
              />
              <ResultCard
                label="Total Interest"
                value={formatCurrency(result.totalInterest)}
                subtext={`${formatPercent((result.totalInterest / result.totalCost) * 100)} of total cost`}
              />
              <ResultCard
                label="Total Cost"
                value={formatCurrency(result.totalCost)}
                subtext="Down payment + all payments + balloon"
              />
              <ResultCard
                label="Monthly Payment"
                value={formatCurrency(result.monthlyPayment)}
                subtext="Regular monthly amount"
              />
            </div>

            {/* Actions */}
            <ActionButtons
              copied={copied}
              onCopyLink={onCopyLink}
              onPrint={onPrint}
              onReset={onReset}
            />

            {/* Disclaimer */}
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              This is an estimate for informational purposes only. Actual terms
              vary by lender, credit profile, and equipment type. Always review
              your financing agreement carefully before signing.
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Enter valid equipment details to see results.
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 3: MERCHANT CASH ADVANCE VIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function MCAView({
  inputs,
  result,
  onInputChange,
  copied,
  onCopyLink,
  onPrint,
  onReset,
}: {
  inputs: MCAInputs;
  result: MCAResult;
  onInputChange: (field: keyof MCAInputs, value: string) => void;
  copied: boolean;
  onCopyLink: () => void;
  onPrint: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ─── Inputs ─── */}
      <div className="space-y-5">
        {/* Advance Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="mca-advance" className="text-sm font-medium">
                Advance Amount
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  The lump sum you receive upfront. This is based on your
                  average monthly credit card sales.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(inputs.advanceAmount)}
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="mca-advance"
              min={1000}
              max={500000}
              step={1000}
              value={[inputs.advanceAmount]}
              onValueChange={([v]) =>
                onInputChange("advanceAmount", v.toString())
              }
              aria-label="Advance amount"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$1,000</span>
              <span>$500,000</span>
            </div>
            <Input
              type="number"
              min={1000}
              max={500000}
              step={1000}
              value={inputs.advanceAmount}
              onChange={(e) => onInputChange("advanceAmount", e.target.value)}
              className="mt-1"
              aria-label="Advance amount input"
            />
          </div>
        </div>

        {/* Factor Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="mca-factor" className="text-sm font-medium">
                Factor Rate
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-xs">
                  The multiplier applied to your advance to determine total
                  payback. A 1.3 factor rate on a $50,000 advance means you
                  repay $65,000 total. Lower is better.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {inputs.factorRate.toFixed(2)}x
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="mca-factor"
              min={1.1}
              max={1.5}
              step={0.01}
              value={[inputs.factorRate]}
              onValueChange={([v]) => onInputChange("factorRate", v.toString())}
              aria-label="Factor rate"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1.10x</span>
              <span>1.50x</span>
            </div>
            <Input
              type="number"
              min={1.1}
              max={1.5}
              step={0.01}
              value={inputs.factorRate}
              onChange={(e) => onInputChange("factorRate", e.target.value)}
              className="mt-1"
              aria-label="Factor rate input"
            />
          </div>
        </div>

        {/* Repayment Period */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="mca-months" className="text-sm font-medium">
                Repayment Period (Months)
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px] text-xs">
                  The estimated time to repay the full amount. Note: with a
                  fixed total payback, a shorter repayment period means higher
                  effective APR because the same fee is collected over fewer
                  days.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {inputs.repaymentMonths} mo
            </span>
          </div>
          <div className="no-print">
            <Slider
              id="mca-months"
              min={1}
              max={24}
              step={1}
              value={[inputs.repaymentMonths]}
              onValueChange={([v]) =>
                onInputChange("repaymentMonths", v.toString())
              }
              aria-label="Repayment period in months"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 mo</span>
              <span>24 mo</span>
            </div>
            <Input
              type="number"
              min={1}
              max={24}
              step={1}
              value={inputs.repaymentMonths}
              onChange={(e) => onInputChange("repaymentMonths", e.target.value)}
              className="mt-1"
              aria-label="Repayment period in months input"
            />
          </div>
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="space-y-4">
        {result.totalPayback > 0 ? (
          <>
            {/* Total Payback Highlight */}
            <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Payback Amount
              </p>
              <p className="text-4xl font-bold tracking-tight text-ember">
                {formatCurrency(result.totalPayback)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(result.financeCharge)} in finance charges
              </p>
            </div>

            {/* Effective APR Warning */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertTriangle className="size-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Effective APR: {formatPercent(result.effectiveAPR)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This is a simple annualized cost estimate, not a true APR.
                  MCAs are receivables purchases, not loans, so they are not
                  required to disclose APR.
                </p>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Finance Charge"
                value={formatCurrency(result.financeCharge)}
                subtext="Total cost of the advance"
              />
              <ResultCard
                label="Cost per Dollar"
                value={`$${result.costPerDollar.toFixed(2)}`}
                subtext="Cost for each $1.00 advanced"
              />
              <ResultCard
                label="Daily Payment"
                value={formatCurrency(result.dailyPayment)}
                subtext="Approximate daily withholding"
              />
              <ResultCard
                label="Weekly Payment"
                value={formatCurrency(result.weeklyPayment)}
                subtext="Approximate weekly withholding"
              />
              <ResultCard
                label="Monthly Remittance"
                value={formatCurrency(result.monthlyPayment)}
                subtext="Average monthly withholding"
              />
              <ResultCard
                label="Repayment Period"
                value={`${result.repaymentMonths} mo`}
                subtext={`${Math.round(result.repaymentMonths * 365 / 12)} estimated days`}
              />
            </div>

            {/* Actions */}
            <ActionButtons
              copied={copied}
              onCopyLink={onCopyLink}
              onPrint={onPrint}
              onReset={onReset}
            />

            {/* MCA Disclaimer */}
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-destructive">
                Important Disclaimer
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                A merchant cash advance is NOT a loan. It is a purchase of your
                future receivables. MCAs are largely unregulated at both the
                federal and state level, meaning they do not have the same
                consumer protections as traditional loans.
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Because the total payback is fixed, repaying faster means a
                higher effective APR. For example, paying back a $50,000 advance
                at 1.3x over 6 months has a significantly higher annualized cost
                than spreading the same payback over 12 months.
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                This calculator is for informational purposes only. Actual terms
                and costs vary by provider. Consult a financial advisor before
                entering into any merchant cash advance agreement.
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            Enter valid advance details to see results.
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function ActionButtons({
  copied,
  onCopyLink,
  onPrint,
  onReset,
}: {
  copied: boolean;
  onCopyLink: () => void;
  onPrint: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 no-print">
      <Button
        variant="outline"
        size="sm"
        onClick={onCopyLink}
        className="text-xs"
      >
        {copied ? (
          <Check className="mr-1.5 size-3.5" />
        ) : (
          <Copy className="mr-1.5 size-3.5" />
        )}
        {copied ? "Copied" : "Copy Link"}
      </Button>
      <Button variant="outline" size="sm" onClick={onPrint} className="text-xs">
        <Printer className="mr-1.5 size-3.5" />
        Print
      </Button>
      <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
        <RotateCcw className="mr-1.5 size-3.5" />
        Reset
      </Button>
    </div>
  );
}

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

function AmortizationTable({
  schedule,
  totalCost,
  totalInterest,
  showAmortization,
  setShowAmortization,
  balloonNote,
}: {
  schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[];
  totalCost: number;
  totalInterest: number;
  showAmortization: boolean;
  setShowAmortization: (v: boolean) => void;
  balloonNote?: string;
}) {
  return (
    <Card className="print-break-inside">
      <CardHeader className="pb-3">
        <button
          type="button"
          onClick={() => setShowAmortization(!showAmortization)}
          className="no-print flex w-full items-center justify-between text-left"
          aria-expanded={showAmortization}
        >
          <CardTitle className="text-lg">Amortization Schedule</CardTitle>
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
              {schedule.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}</TableCell>
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
        <div className="mt-3 flex flex-wrap justify-end gap-6 text-sm font-medium">
          <span>
            Total Paid:{" "}
            <span className="text-ember">{formatCurrency(totalCost)}</span>
          </span>
          <span>
            Total Interest:{" "}
            <span className="text-destructive">
              {formatCurrency(totalInterest)}
            </span>
          </span>
          {balloonNote && (
            <span>
              Balloon:{" "}
              <span className="text-destructive">{balloonNote}</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
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
    return `${window.location.host}${window.location.pathname} \u00b7 Printed ${d}`;
  }, []);
  return <span>{text}</span>;
}