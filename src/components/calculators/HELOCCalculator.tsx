"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { formatCurrency, calculateLoanWithExtra } from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

interface HELOCInputs {
  homeValue: number;
  mortgageBalance: number;
  maxCLTV: number;
  helocDraw: number;
  apr: number;
  drawYears: number;
  repaymentYears: number;
  extraMonthly: number;
  extraDuring: "draw" | "repayment" | "none";
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: HELOCInputs = {
  homeValue: 400000,
  mortgageBalance: 250000,
  maxCLTV: 80,
  helocDraw: 50000,
  apr: 8.5,
  drawYears: 10,
  repaymentYears: 20,
  extraMonthly: 0,
  extraDuring: "none",
};

/* ─── Helper: format a number as currency for display ─── */

function fmt(n: number): string {
  return formatCurrency(n);
}

/* ─── Component ─── */

export default function HELOCCalculator() {
  const [inputs, setInputs] = useState<HELOCInputs>(DEFAULT_INPUTS);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── URL param sync ─── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = (key: string, fallback: number): number => {
      const v = params.get(key);
      return v ? parseFloat(v) : fallback;
    };
    const extraDuringVal = params.get("extraDuring") as HELOCInputs["extraDuring"] | null;
    setInputs((prev) => ({
      homeValue: p("home", prev.homeValue),
      mortgageBalance: p("mortgage", prev.mortgageBalance),
      maxCLTV: p("cltv", prev.maxCLTV),
      helocDraw: p("draw", prev.helocDraw),
      apr: p("rate", prev.apr),
      drawYears: p("drawYr", prev.drawYears),
      repaymentYears: p("repayYr", prev.repaymentYears),
      extraMonthly: p("extra", prev.extraMonthly),
      extraDuring: extraDuringVal && ["draw", "repayment", "none"].includes(extraDuringVal)
        ? extraDuringVal
        : prev.extraDuring,
    }));
  }, []);

  /* ─── Update a single input ─── */
  const update = useCallback(
    (key: keyof HELOCInputs, value: number | string) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /* ─── Reset ─── */
  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    window.history.replaceState({}, "", window.location.pathname);
    toast.success("Calculator reset to defaults");
  }, []);

  /* ─── Copy link ─── */
  const handleCopy = useCallback(() => {
    const params = new URLSearchParams({
      home: String(inputs.homeValue),
      mortgage: String(inputs.mortgageBalance),
      cltv: String(inputs.maxCLTV),
      draw: String(inputs.helocDraw),
      rate: String(inputs.apr),
      drawYr: String(inputs.drawYears),
      repayYr: String(inputs.repaymentYears),
      extra: String(inputs.extraMonthly),
      extraDuring: inputs.extraDuring,
    });
    const url = `${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [inputs]);

  /* ─── Print ─── */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  /* ─── Core calculations ─── */
  const results = useMemo(() => {
    const {
      homeValue, mortgageBalance, maxCLTV, helocDraw,
      apr, drawYears, repaymentYears, extraMonthly, extraDuring,
    } = inputs;

    const cltvDecimal = maxCLTV / 100;
    const maxAvailable = Math.max(0, homeValue * cltvDecimal - mortgageBalance);
    const effectiveDraw = Math.min(helocDraw, maxAvailable);
    const monthlyRate = apr / 100 / 12;
    const drawMonths = drawYears * 12;
    const repaymentMonths = repaymentYears * 12;

    // Interest-only payment during draw period
    const ioPayment = monthlyRate > 0 ? r2(effectiveDraw * monthlyRate) : 0;

    // Repayment period: fully amortizing payment over repaymentMonths
    let repaymentPayment = 0;
    if (repaymentMonths > 0 && effectiveDraw > 0) {
      if (monthlyRate === 0) {
        repaymentPayment = r2(effectiveDraw / repaymentMonths);
      } else {
        const factor = Math.pow(1 + monthlyRate, repaymentMonths);
        repaymentPayment = r2(
          (effectiveDraw * monthlyRate * factor) / (factor - 1),
        );
      }
    }

    const paymentJump = r2(repaymentPayment - ioPayment);

    // Total interest without extra payments
    const baseTotalInterest = r2(ioPayment * drawMonths + repaymentPayment * repaymentMonths - effectiveDraw);

    // Extra payments
    let extraResult = null;
    if (extraMonthly > 0 && extraDuring !== "none" && effectiveDraw > 0) {
      if (extraDuring === "repayment") {
        const res = calculateLoanWithExtra({
          loanAmount: effectiveDraw,
          apr,
          termMonths: repaymentMonths,
          extraMonthly,
          extraStartMonth: 1,
        });
        extraResult = {
          period: "repayment" as const,
          newRepaymentPayment: res.result.monthlyPayment,
          newTotalInterest: r2(ioPayment * drawMonths + res.result.totalInterest),
          monthsSaved: res.monthsSaved,
          interestSaved: r2(
            repaymentPayment * repaymentMonths - res.result.totalCost,
          ),
          actualPayoffMonths: res.actualPayoffMonth,
        };
      } else {
        // Extra during draw period: interest-only + extra reduces the balance each month
        // Then the remaining balance amortizes over repaymentMonths
        let remaining = effectiveDraw;
        for (let m = 1; m <= drawMonths; m++) {
          const interest = remaining * monthlyRate;
          const totalPayment = ioPayment + extraMonthly;
          const principal = totalPayment - interest;
          if (principal >= remaining) {
            remaining = 0;
            break;
          }
          remaining -= principal;
        }
        remaining = Math.max(0, remaining);

        if (remaining > 0 && repaymentMonths > 0) {
          let newRepayment = 0;
          if (monthlyRate === 0) {
            newRepayment = r2(remaining / repaymentMonths);
          } else {
            const factor = Math.pow(1 + monthlyRate, repaymentMonths);
            newRepayment = r2((remaining * monthlyRate * factor) / (factor - 1));
          }

          const drawInterest = r2(effectiveDraw - remaining); // rough: total principal paid down in draw
          const repaymentInterest = r2(newRepayment * repaymentMonths - remaining);
          const newTotalInterest = r2(
            (ioPayment * drawMonths - (effectiveDraw - remaining)) + repaymentInterest,
          );

          extraResult = {
            period: "draw" as const,
            newRepaymentPayment: newRepayment,
            newTotalInterest,
            monthsSaved: 0,
            interestSaved: r2(baseTotalInterest - newTotalInterest),
            actualPayoffMonths: repaymentMonths,
            balanceAtEndOfDraw: remaining,
          };
        } else {
          // Paid off during draw period
          let totalMonthsDraw = 0;
          let bal = effectiveDraw;
          for (let m = 1; m <= drawMonths; m++) {
            const interest = bal * monthlyRate;
            const principal = ioPayment + extraMonthly - interest;
            if (principal >= bal) {
              totalMonthsDraw = m;
              bal = 0;
              break;
            }
            bal -= principal;
            totalMonthsDraw = m;
          }
          extraResult = {
            period: "draw" as const,
            newRepaymentPayment: 0,
            newTotalInterest: r2(effectiveDraw - bal + (effectiveDraw - bal)), // approximate
            monthsSaved: drawMonths + repaymentMonths - totalMonthsDraw,
            interestSaved: r2(baseTotalInterest - effectiveDraw + bal),
            actualPayoffMonths: totalMonthsDraw,
            balanceAtEndOfDraw: 0,
          };
        }
      }
    }

    return {
      maxAvailable,
      effectiveDraw,
      ioPayment,
      repaymentPayment,
      paymentJump,
      drawMonths,
      repaymentMonths,
      baseTotalInterest,
      totalCostNoExtra: r2(effectiveDraw + baseTotalInterest),
      extraResult,
    };
  }, [inputs]);

  /* ─── Share text ─── */
  const shareText = useMemo(() => {
    return `$${results.effectiveDraw.toLocaleString()} HELOC at ${inputs.apr}%: $${results.ioPayment}/mo interest-only, then $${results.repaymentPayment}/mo repayment. Calculate yours:`;
  }, [results, inputs.apr]);

  return (
    <TooltipProvider>
      <div ref={containerRef}>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-ember" />
              HELOC Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ── Section: How much can I borrow ── */}
            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                How Much Can I Borrow?
              </h3>
              <p className="text-xs text-muted-foreground">
                Your maximum HELOC credit line depends on your home value,
                current mortgage balance, and the lender&apos;s maximum
                combined loan-to-value (CLTV) ratio.
              </p>

              {/* Home Value */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="homeValue" className="text-sm">
                    Home Value
                  </Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {fmt(inputs.homeValue)}
                  </span>
                </div>
                <Slider
                  id="homeValue"
                  min={50000}
                  max={2000000}
                  step={5000}
                  value={[inputs.homeValue]}
                  onValueChange={([v]) => update("homeValue", v)}
                  aria-label="Home value"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$50K</span>
                  <span>$2M</span>
                </div>
              </div>

              {/* Mortgage Balance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mortgageBalance" className="text-sm">
                    Current Mortgage Balance
                  </Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {fmt(inputs.mortgageBalance)}
                  </span>
                </div>
                <Slider
                  id="mortgageBalance"
                  min={0}
                  max={1500000}
                  step={5000}
                  value={[inputs.mortgageBalance]}
                  onValueChange={([v]) => update("mortgageBalance", v)}
                  aria-label="Current mortgage balance"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>$1.5M</span>
                </div>
              </div>

              {/* Max CLTV */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="maxCLTV" className="text-sm">
                    Maximum CLTV
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      Combined Loan-to-Value. Most lenders cap CLTV at 80% for
                      HELOCs, though some go up to 85% or 90%. Lower CLTV means
                      a smaller credit line.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    id="maxCLTV"
                    min={50}
                    max={95}
                    step={1}
                    value={[inputs.maxCLTV]}
                    onValueChange={([v]) => update("maxCLTV", v)}
                    className="flex-1"
                    aria-label="Maximum CLTV percentage"
                  />
                  <Input
                    type="number"
                    min={50}
                    max={95}
                    step={1}
                    value={inputs.maxCLTV}
                    onChange={(e) =>
                      update("maxCLTV", Math.max(50, Math.min(95, Number(e.target.value) || 0)))
                    }
                    className="w-20 h-8 text-sm text-right"
                    aria-label="CLTV percentage input"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              {/* Max Available Result */}
              <div className="rounded-md bg-ember/5 border border-ember/20 p-3">
                <p className="text-xs text-muted-foreground">Maximum Available Credit Line</p>
                <p className="text-xl font-bold text-ember">{fmt(results.maxAvailable)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Home value &times; {inputs.maxCLTV}% &minus; mortgage balance)
                </p>
              </div>
            </div>

            {/* ── Section: Payment Calculator ── */}
            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Payment Calculator
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter your drawn amount and terms to see interest-only draw
                payments and the repayment-period payment. HELOC rates are
                variable and may change over time; this calculator uses a fixed
                rate for estimation purposes.
              </p>

              {/* HELOC Amount Drawn */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="helocDraw" className="text-sm">
                    HELOC Amount Drawn
                  </Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {fmt(inputs.helocDraw)}
                  </span>
                </div>
                <Slider
                  id="helocDraw"
                  min={0}
                  max={Math.max(results.maxAvailable, 1000)}
                  step={1000}
                  value={[Math.min(inputs.helocDraw, Math.max(results.maxAvailable, 1000))]}
                  onValueChange={([v]) => update("helocDraw", v)}
                  aria-label="HELOC amount drawn"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>{fmt(Math.max(results.maxAvailable, 1000))}</span>
                </div>
                {inputs.helocDraw > results.maxAvailable && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Draw exceeds maximum available credit line. Results use the
                    capped amount of {fmt(results.effectiveDraw)}.
                  </p>
                )}
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="apr" className="text-sm">
                    Interest Rate (Variable)
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      HELOCs use variable rates tied to the prime rate. Enter
                      your current rate for this estimate. Actual payments will
                      change as the rate adjusts.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    id="apr"
                    min={3}
                    max={18}
                    step={0.1}
                    value={[inputs.apr]}
                    onValueChange={([v]) => update("apr", v)}
                    className="flex-1"
                    aria-label="HELOC interest rate"
                  />
                  <Input
                    type="number"
                    min={3}
                    max={18}
                    step={0.1}
                    value={inputs.apr}
                    onChange={(e) =>
                      update("apr", Math.max(3, Math.min(18, Number(e.target.value) || 0)))
                    }
                    className="w-20 h-8 text-sm text-right"
                    aria-label="Interest rate input"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              {/* Draw Period */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="drawYears" className="text-sm">
                    Draw Period
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      The period (typically 5-10 years) when you can borrow from
                      the line. During this time, you typically pay only the
                      interest on the amount drawn.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    id="drawYears"
                    min={1}
                    max={15}
                    step={1}
                    value={[inputs.drawYears]}
                    onValueChange={([v]) => update("drawYears", v)}
                    className="flex-1"
                    aria-label="Draw period in years"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={15}
                    step={1}
                    value={inputs.drawYears}
                    onChange={(e) =>
                      update("drawYears", Math.max(1, Math.min(15, Number(e.target.value) || 0)))
                    }
                    className="w-20 h-8 text-sm text-right"
                    aria-label="Draw period years input"
                  />
                  <span className="text-sm text-muted-foreground">yrs</span>
                </div>
              </div>

              {/* Repayment Period */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="repaymentYears" className="text-sm">
                    Repayment Period
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      The period (typically 10-20 years) after the draw period
                      ends. You can no longer borrow and must repay the full
                      balance with principal and interest.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3">
                  <Slider
                    id="repaymentYears"
                    min={5}
                    max={30}
                    step={1}
                    value={[inputs.repaymentYears]}
                    onValueChange={([v]) => update("repaymentYears", v)}
                    className="flex-1"
                    aria-label="Repayment period in years"
                  />
                  <Input
                    type="number"
                    min={5}
                    max={30}
                    step={1}
                    value={inputs.repaymentYears}
                    onChange={(e) =>
                      update("repaymentYears", Math.max(5, Math.min(30, Number(e.target.value) || 0)))
                    }
                    className="w-20 h-8 text-sm text-right"
                    aria-label="Repayment period years input"
                  />
                  <span className="text-sm text-muted-foreground">yrs</span>
                </div>
              </div>
            </div>

            {/* ── Section: Extra Payments ── */}
            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Extra Payments (Optional)
              </h3>
              <p className="text-xs text-muted-foreground">
                Making extra payments toward principal during the draw or
                repayment period reduces your balance faster, lowering total
                interest and shortening the payoff timeline.
              </p>

              {/* Extra Monthly */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="extraMonthly" className="text-sm">
                    Extra Monthly Payment
                  </Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {fmt(inputs.extraMonthly)}
                  </span>
                </div>
                <Slider
                  id="extraMonthly"
                  min={0}
                  max={2000}
                  step={25}
                  value={[inputs.extraMonthly]}
                  onValueChange={([v]) => update("extraMonthly", v)}
                  aria-label="Extra monthly payment"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>$2,000</span>
                </div>
              </div>

              {/* Apply During */}
              {inputs.extraMonthly > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Apply Extra Payments During</Label>
                  <div className="flex gap-2">
                    {(
                      [
                        { value: "draw", label: "Draw Period" },
                        { value: "repayment", label: "Repayment Period" },
                      ] as const
                    ).map((opt) => (
                      <Button
                        key={opt.value}
                        variant={inputs.extraDuring === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => update("extraDuring", opt.value)}
                        className="text-xs"
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Results ── */}
            {results.effectiveDraw > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Results for {fmt(results.effectiveDraw)} HELOC at {inputs.apr}%
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Interest-Only Payment (Draw Period)
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {fmt(results.ioPayment)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      for {results.drawMonths} months ({inputs.drawYears} years)
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Repayment Payment (Principal + Interest)
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {fmt(results.repaymentPayment)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      for {results.repaymentMonths} months ({inputs.repaymentYears} years)
                    </p>
                  </div>
                </div>

                {/* Payment Jump Warning */}
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Payment Jump at End of Draw Period
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                    Your monthly payment increases from{" "}
                    <strong>{fmt(results.ioPayment)}</strong> to{" "}
                    <strong>{fmt(results.repaymentPayment)}</strong> (+
                    {fmt(results.paymentJump)}).
                    {results.paymentJump > 0 &&
                      ` This is a ${Math.round(
                        (results.paymentJump / results.ioPayment) * 100,
                      )}% increase.`}
                  </p>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/40 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total Interest</p>
                    <p className="text-lg font-bold">{fmt(results.baseTotalInterest)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total Cost</p>
                    <p className="text-lg font-bold">
                      {fmt(results.totalCostNoExtra)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3 text-center col-span-2 sm:col-span-1">
                    <p className="text-xs text-muted-foreground">
                      Draw-Period Interest
                    </p>
                    <p className="text-lg font-bold">
                      {fmt(results.ioPayment * results.drawMonths)}
                    </p>
                  </div>
                </div>

                {/* Extra Payment Results */}
                {results.extraResult && (
                  <div className="rounded-lg border border-ember/30 bg-ember/5 p-4 space-y-3">
                    <p className="text-sm font-semibold text-ember">
                      With Extra Payments (
                      {results.extraResult.period === "draw"
                        ? "during draw period"
                        : "during repayment period"}
                      )
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          New Repayment Pmt
                        </p>
                        <p className="text-base font-bold">
                          {results.extraResult.period === "repayment"
                            ? fmt(results.extraResult.newRepaymentPayment + inputs.extraMonthly)
                            : results.extraResult.balanceAtEndOfDraw !== undefined
                              ? fmt(results.extraResult.newRepaymentPayment)
                              : "$0.00"}
                          <span className="text-xs font-normal text-muted-foreground">/mo</span>
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Interest Saved
                        </p>
                        <p className="text-base font-bold text-ember">
                          {fmt(results.extraResult.interestSaved)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Months Saved
                        </p>
                        <p className="text-base font-bold text-ember">
                          {results.extraResult.monthsSaved}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          New Total Interest
                        </p>
                        <p className="text-base font-bold">
                          {fmt(results.extraResult.newTotalInterest)}
                        </p>
                      </div>
                    </div>
                    {"balanceAtEndOfDraw" in results.extraResult &&
                      results.extraResult.balanceAtEndOfDraw !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Remaining balance at end of draw period with extra
                          payments: {fmt(results.extraResult.balanceAtEndOfDraw)}
                        </p>
                      )}
                  </div>
                )}

                {/* Variable Rate Disclaimer */}
                <p className="text-xs text-muted-foreground">
                  <strong>Important:</strong> HELOCs use variable interest rates
                  tied to the prime rate. The calculations above assume a fixed
                  rate for the entire term. Actual payments will vary as the rate
                  adjusts. This estimate is for planning purposes only and does
                  not constitute a loan offer.
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

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}