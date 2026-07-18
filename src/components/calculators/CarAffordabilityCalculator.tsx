"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator,
  Copy,
  Check,
  Printer,
  RotateCcw,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  reverseSolveMaxPrincipal,
  calculateLoan,
  formatCurrency,
  formatPercent,
} from "@/lib/loan-math";

/* ─── Types ─── */

type Mode = "income" | "payment" | "rule";

interface AffordInputs {
  mode: Mode;
  // Mode 1: From Income
  grossAnnualIncome: number;
  existingMonthlyDebt: number;
  incomePct: number;
  // Mode 2: From Payment
  targetPayment: number;
  // Shared
  downPayment: number;
  tradeInValue: number;
  salesTaxRate: number;
  apr: number;
  termMonths: number;
  // Mode 3: 20/4/10
  monthlyInsurance: number;
  monthlyFuel: number;
  monthlyMaintenance: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: AffordInputs = {
  mode: "income",
  grossAnnualIncome: 60000,
  existingMonthlyDebt: 500,
  incomePct: 15,
  targetPayment: 450,
  downPayment: 5000,
  tradeInValue: 0,
  salesTaxRate: 7,
  apr: 6.5,
  termMonths: 60,
  monthlyInsurance: 0,
  monthlyFuel: 0,
  monthlyMaintenance: 0,
};

/* ─── Result type ─── */

interface AffordResult {
  valid: boolean;
  maxMonthlyPayment: number;
  maxPrincipal: number;
  maxVehiclePrice: number;
  salesTaxAmount: number;
  totalLoanCost: number;
  totalInterest: number;
  downPctOfPrice: number;
  // Mode 1 extras
  monthlyGross?: number;
  maxTotalDebt?: number;
  // Mode 3 extras
  monthlyBudget?: number;
  availableForLoan?: number;
  transportationTotal?: number;
  // Mode 3 strict 20% constraint
  strictPrice?: number;
  strictDown?: number;
  downConstraintMet?: boolean;
}

/* ─── Computation ─── */

function computeResult(inputs: AffordInputs): AffordResult {
  const empty: AffordResult = {
    valid: false,
    maxMonthlyPayment: 0,
    maxPrincipal: 0,
    maxVehiclePrice: 0,
    salesTaxAmount: 0,
    totalLoanCost: 0,
    totalInterest: 0,
    downPctOfPrice: 0,
  };

  const { apr, termMonths, downPayment, tradeInValue, salesTaxRate } = inputs;
  const effectiveTerm = inputs.mode === "rule" ? 48 : termMonths;
  const taxMult = 1 + salesTaxRate / 100;

  let maxPayment = 0;
  let monthlyGross = 0;
  let maxTotalDebt = 0;
  let monthlyBudget = 0;
  let availableForLoan = 0;
  let transportationTotal = 0;

  if (inputs.mode === "income") {
    monthlyGross = inputs.grossAnnualIncome / 12;
    maxTotalDebt = monthlyGross * (inputs.incomePct / 100);
    maxPayment = maxTotalDebt - inputs.existingMonthlyDebt;
  } else if (inputs.mode === "payment") {
    maxPayment = inputs.targetPayment;
  } else {
    // 20/4/10 rule
    monthlyGross = inputs.grossAnnualIncome / 12;
    monthlyBudget = monthlyGross * 0.10;
    transportationTotal =
      inputs.monthlyInsurance + inputs.monthlyFuel + inputs.monthlyMaintenance;
    availableForLoan = monthlyBudget - transportationTotal;
    maxPayment = availableForLoan;
  }

  if (maxPayment <= 0) return empty;

  const maxPrincipal = reverseSolveMaxPrincipal(maxPayment, apr, effectiveTerm);
  if (maxPrincipal <= 0) return empty;

  // maxPrice = (principal + down + tradeIn) / (1 + taxRate/100)
  const maxPrice = Math.max(0, (maxPrincipal + downPayment + tradeInValue) / taxMult);
  const taxAmount = Math.round(maxPrice * salesTaxRate) / 100;
  const totalLoanCost = Math.round(maxPayment * effectiveTerm * 100) / 100;
  const totalInterest = Math.round((totalLoanCost - maxPrincipal) * 100) / 100;
  const downPct = maxPrice > 0 ? Math.round((downPayment / maxPrice) * 1000) / 10 : 0;

  const result: AffordResult = {
    valid: true,
    maxMonthlyPayment: Math.round(maxPayment * 100) / 100,
    maxPrincipal,
    maxVehiclePrice: maxPrice,
    salesTaxAmount: taxAmount,
    totalLoanCost,
    totalInterest,
    downPctOfPrice: downPct,
  };

  if (inputs.mode === "income") {
    result.monthlyGross = Math.round(monthlyGross * 100) / 100;
    result.maxTotalDebt = Math.round(maxTotalDebt * 100) / 100;
  }

  if (inputs.mode === "rule") {
    result.monthlyBudget = Math.round(monthlyBudget * 100) / 100;
    result.availableForLoan = Math.round(availableForLoan * 100) / 100;
    result.transportationTotal = Math.round(transportationTotal * 100) / 100;

    // Check 20% down constraint
    const downConstraintMet = downPct >= 20;
    result.downConstraintMet = downConstraintMet;

    if (!downConstraintMet) {
      // Solve with exactly 20% down: price = (P + tradeIn) / (0.80 + taxRate/100)
      const strictPrice = Math.max(
        0,
        (maxPrincipal + tradeInValue) / (0.80 + salesTaxRate / 100)
      );
      const strictDown = Math.round(strictPrice * 0.20 * 100) / 100;
      result.strictPrice = Math.round(strictPrice * 100) / 100;
      result.strictDown = strictDown;
    }
  }

  return result;
}

export const DEFAULT_RESULT = computeResult(DEFAULT_INPUTS);

/* ─── Component ─── */

export default function CarAffordabilityCalculator() {
  const [inputs, setInputs] = useState<AffordInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const m = params.get("mode");
    const g = params.get("income");
    const d = params.get("debt");
    const p = params.get("pct");
    const tp = params.get("payment");
    const dp = params.get("down");
    const tr = params.get("trade");
    const tx = params.get("tax");
    const r = params.get("rate");
    const t = params.get("term");
    const ins = params.get("insurance");
    const fuel = params.get("fuel");
    const maint = params.get("maintenance");
    if (
      !m && !g && !d && !p && !tp && !dp && !tr && !tx && !r && !t
    ) return DEFAULT_INPUTS;
    return {
      mode: (m === "payment" ? "payment" : m === "rule" ? "rule" : "income") as Mode,
      grossAnnualIncome: g ? parseFloat(g) : DEFAULT_INPUTS.grossAnnualIncome,
      existingMonthlyDebt: d ? parseFloat(d) : DEFAULT_INPUTS.existingMonthlyDebt,
      incomePct: p ? parseFloat(p) : DEFAULT_INPUTS.incomePct,
      targetPayment: tp ? parseFloat(tp) : DEFAULT_INPUTS.targetPayment,
      downPayment: dp ? parseFloat(dp) : DEFAULT_INPUTS.downPayment,
      tradeInValue: tr ? parseFloat(tr) : DEFAULT_INPUTS.tradeInValue,
      salesTaxRate: tx ? parseFloat(tx) : DEFAULT_INPUTS.salesTaxRate,
      apr: r ? parseFloat(r) : DEFAULT_INPUTS.apr,
      termMonths: t ? parseInt(t, 10) : DEFAULT_INPUTS.termMonths,
      monthlyInsurance: ins ? parseFloat(ins) : DEFAULT_INPUTS.monthlyInsurance,
      monthlyFuel: fuel ? parseFloat(fuel) : DEFAULT_INPUTS.monthlyFuel,
      monthlyMaintenance: maint ? parseFloat(maint) : DEFAULT_INPUTS.monthlyMaintenance,
    };
  });

  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeResult(inputs), [inputs]);

  // Sync URL
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("mode", inputs.mode);
    if (inputs.mode === "income" || inputs.mode === "rule") {
      params.set("income", inputs.grossAnnualIncome.toString());
    }
    if (inputs.mode === "income") {
      params.set("debt", inputs.existingMonthlyDebt.toString());
      params.set("pct", inputs.incomePct.toString());
    }
    if (inputs.mode === "payment") {
      params.set("payment", inputs.targetPayment.toString());
    }
    if (inputs.mode === "rule") {
      params.set("insurance", inputs.monthlyInsurance.toString());
      params.set("fuel", inputs.monthlyFuel.toString());
      params.set("maintenance", inputs.monthlyMaintenance.toString());
    }
    params.set("down", inputs.downPayment.toString());
    params.set("trade", inputs.tradeInValue.toString());
    params.set("tax", inputs.salesTaxRate.toString());
    params.set("rate", inputs.apr.toString());
    if (inputs.mode !== "rule") {
      params.set("term", inputs.termMonths.toString());
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [inputs]);

  const handleInputChange = useCallback(
    (field: keyof AffordInputs, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setInputs((prev) => ({ ...prev, [field]: num }));
      }
    },
    []
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

  const effectiveTerm = inputs.mode === "rule" ? 48 : inputs.termMonths;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              How Much Car Can I Afford Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your income or target payment to calculate the maximum vehicle
              price you can finance.
            </p>
          </CardHeader>
          <CardContent>
            {/* ─── Mode Toggle ─── */}
            <div className="no-print mb-6 flex flex-wrap gap-2">
              {(
                [
                  { key: "income", label: "From Income" },
                  { key: "payment", label: "From Monthly Payment" },
                  { key: "rule", label: "20/4/10 Rule" },
                ] as const
              ).map(({ key, label }) => (
                <Button
                  key={key}
                  variant={inputs.mode === key ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setInputs((p) => ({ ...p, mode: key }))
                  }
                  className={
                    inputs.mode === key
                      ? "bg-ember hover:bg-ember-hover text-white"
                      : ""
                  }
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Mode 1: Income fields */}
                {inputs.mode === "income" && (
                  <>
                    <InputField
                      id="gross-income"
                      label="Gross Annual Income"
                      tooltip="Your total pre-tax annual salary before any deductions. These affordability rules use gross income, not take-home pay."
                      value={inputs.grossAnnualIncome}
                      min={10000}
                      max={500000}
                      step={1000}
                      format={formatCurrency}
                      onChange={(v) => handleInputChange("grossAnnualIncome", v)}
                    />
                    <InputField
                      id="existing-debt"
                      label="Existing Monthly Debt Payments"
                      tooltip="Total of all current monthly debt obligations: rent or mortgage, student loans, credit card minimums, and any other recurring debt."
                      value={inputs.existingMonthlyDebt}
                      min={0}
                      max={10000}
                      step={50}
                      format={formatCurrency}
                      onChange={(v) => handleInputChange("existingMonthlyDebt", v)}
                    />
                    <InputField
                      id="income-pct"
                      label="Target % of Income for Total Debt"
                      tooltip="The percentage of gross monthly income you are willing to allocate to all debt payments combined (existing debt plus the new car payment). This is your choice, not a recommendation."
                      value={inputs.incomePct}
                      min={5}
                      max={50}
                      step={1}
                      format={(v) => `${v}%`}
                      onChange={(v) => handleInputChange("incomePct", v)}
                    />
                  </>
                )}

                {/* Mode 2: Target payment field */}
                {inputs.mode === "payment" && (
                  <InputField
                    id="target-payment"
                    label="Target Monthly Payment"
                    tooltip="The maximum monthly amount you want to spend on the car loan payment."
                    value={inputs.targetPayment}
                    min={50}
                    max={3000}
                    step={25}
                    format={formatCurrency}
                    onChange={(v) => handleInputChange("targetPayment", v)}
                  />
                )}

                {/* Mode 3: 20/4/10 fields */}
                {inputs.mode === "rule" && (
                  <>
                    <InputField
                      id="rule-gross-income"
                      label="Gross Annual Income"
                      tooltip="Your total pre-tax annual salary before deductions. The 10% rule uses gross income."
                      value={inputs.grossAnnualIncome}
                      min={10000}
                      max={500000}
                      step={1000}
                      format={formatCurrency}
                      onChange={(v) => handleInputChange("grossAnnualIncome", v)}
                    />
                    <InputField
                      id="monthly-insurance"
                      label="Estimated Monthly Insurance"
                      tooltip="Your estimated monthly car insurance premium. Leave at 0 if unknown, but note that the result will assume insurance cost is zero, which is not realistic."
                      value={inputs.monthlyInsurance}
                      min={0}
                      max={1000}
                      step={25}
                      format={formatCurrency}
                      onChange={(v) => handleInputChange("monthlyInsurance", v)}
                    />
                    <InputField
                      id="monthly-fuel"
                      label="Estimated Monthly Fuel"
                      tooltip="Your estimated monthly fuel expense. Leave at 0 if unknown, but note that the result will assume fuel cost is zero, which is not realistic."
                      value={inputs.monthlyFuel}
                      min={0}
                      max={1000}
                      step={25}
                      format={formatCurrency}
                      onChange={(v) => handleInputChange("monthlyFuel", v)}
                    />
                    <InputField
                      id="monthly-maintenance"
                      label="Estimated Monthly Maintenance"
                      tooltip="Your estimated monthly vehicle maintenance and repair budget. Leave at 0 if unknown, but note that the result will assume maintenance cost is zero, which is not realistic."
                      value={inputs.monthlyMaintenance}
                      min={0}
                      max={1000}
                      step={25}
                      format={formatCurrency}
                      onChange={(v) => handleInputChange("monthlyMaintenance", v)}
                    />
                  </>
                )}

                {/* Shared fields */}
                <InputField
                  id="down-payment"
                  label="Down Payment"
                  tooltip="Cash you will pay upfront toward the vehicle. In 20/4/10 mode, this should be at least 20% of the vehicle price to satisfy that constraint."
                  value={inputs.downPayment}
                  min={0}
                  max={100000}
                  step={500}
                  format={formatCurrency}
                  onChange={(v) => handleInputChange("downPayment", v)}
                />
                <InputField
                  id="trade-in-value"
                  label="Trade-In Value"
                  tooltip="The dealer's offer for your current vehicle. This reduces the amount you need to finance."
                  value={inputs.tradeInValue}
                  min={0}
                  max={100000}
                  step={500}
                  format={formatCurrency}
                  onChange={(v) => handleInputChange("tradeInValue", v)}
                />
                <InputField
                  id="sales-tax-rate"
                  label="Sales Tax Rate (%)"
                  tooltip="The combined sales tax rate for your state and locality, applied to the vehicle purchase price."
                  value={inputs.salesTaxRate}
                  min={0}
                  max={15}
                  step={0.25}
                  format={(v) => `${v}%`}
                  onChange={(v) => handleInputChange("salesTaxRate", v)}
                />
                <InputField
                  id="apr"
                  label="APR (%)"
                  tooltip="Annual percentage rate on the auto loan."
                  value={inputs.apr}
                  min={0}
                  max={30}
                  step={0.1}
                  format={(v) => `${v}%`}
                  onChange={(v) => handleInputChange("apr", v)}
                />
                {inputs.mode !== "rule" && (
                  <InputField
                    id="term-months"
                    label="Loan Term (Months)"
                    tooltip="The number of months to repay the loan. In 20/4/10 mode, the term is fixed at 48 months."
                    value={inputs.termMonths}
                    min={12}
                    max={84}
                    step={1}
                    format={(v) => `${v} mo`}
                    onChange={(v) => handleInputChange("termMonths", v)}
                  />
                )}
                {inputs.mode === "rule" && (
                  <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 p-3 text-sm text-muted-foreground">
                    <strong className="text-foreground">Loan term locked at 48 months</strong>{" "}
                    per the 20/4/10 rule.
                  </div>
                )}
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {result.valid ? (
                  <>
                    {/* Primary result: Max Vehicle Price */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Maximum Vehicle Price
                      </p>
                      <p className="text-4xl font-bold tracking-tight text-ember">
                        {formatCurrency(result.maxVehiclePrice)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        including {formatCurrency(result.salesTaxAmount)} sales tax
                      </p>
                    </div>

                    {/* Breakdown grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {inputs.mode === "income" && (
                        <>
                          <ResultCard
                            label="Monthly Gross Income"
                            value={formatCurrency(result.monthlyGross!)}
                            subtext="Gross annual / 12"
                          />
                          <ResultCard
                            label="Max Total Monthly Debt"
                            value={formatCurrency(result.maxTotalDebt!)}
                            subtext={`${inputs.incomePct}% of gross monthly`}
                          />
                          <ResultCard
                            label="Less: Existing Debt"
                            value={formatCurrency(inputs.existingMonthlyDebt)}
                            subtext="Subtracted from budget"
                          />
                        </>
                      )}
                      {inputs.mode === "rule" && (
                        <>
                          <ResultCard
                            label="10% Monthly Budget"
                            value={formatCurrency(result.monthlyBudget!)}
                            subtext="10% of gross monthly"
                          />
                          <ResultCard
                            label="Less: Insurance/Fuel/Maintenance"
                            value={formatCurrency(result.transportationTotal!)}
                            subtext={
                              result.transportationTotal === 0
                                ? "Set to 0 (not realistic)"
                                : "User-estimated costs"
                            }
                          />
                        </>
                      )}
                      <ResultCard
                        label="Max Monthly Payment"
                        value={formatCurrency(result.maxMonthlyPayment)}
                        subtext={
                          inputs.mode === "income"
                            ? "Budget remaining for car"
                            : inputs.mode === "rule"
                              ? "Available for loan payment"
                              : "Your target payment"
                        }
                      />
                      <ResultCard
                        label="Max Loan Principal"
                        value={formatCurrency(result.maxPrincipal)}
                        subtext={`At ${formatPercent(inputs.apr)} for ${effectiveTerm} months`}
                      />
                      <ResultCard
                        label="Total Interest"
                        value={formatCurrency(result.totalInterest)}
                        subtext={`${formatPercent(
                          result.totalLoanCost > 0
                            ? (result.totalInterest / result.totalLoanCost) * 100
                            : 0
                        )} of total loan cost`}
                      />
                      <ResultCard
                        label="Total Loan Cost"
                        value={formatCurrency(result.totalLoanCost)}
                        subtext="Principal + interest"
                      />
                      <ResultCard
                        label="Down Payment"
                        value={formatCurrency(inputs.downPayment)}
                        subtext={`${result.downPctOfPrice}% of vehicle price`}
                      />
                    </div>

                    {/* Mode 3: 20/4/10 constraint warnings */}
                    {inputs.mode === "rule" && (
                      <>
                        {result.transportationTotal === 0 && (
                          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                              Insurance, fuel, and maintenance are all set to zero
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              The 10% budget covers total monthly transportation costs, not
                              just the loan payment. With these set to zero, the result
                              assumes those costs are zero, which is not realistic. Enter
                              your estimates for a more useful answer.
                            </p>
                          </div>
                        )}
                        {!result.downConstraintMet && result.strictPrice !== undefined && (
                          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                              20% down payment constraint not met
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Your down payment of {formatCurrency(inputs.downPayment)} is{" "}
                              {result.downPctOfPrice}% of the computed price, which is below
                              the 20% threshold. To satisfy all three 20/4/10 constraints
                              simultaneously, the maximum price drops to{" "}
                              <strong>{formatCurrency(result.strictPrice)}</strong> (requiring
                              a {formatCurrency(result.strictDown)} down payment at 20%).
                            </p>
                          </div>
                        )}
                        {result.downConstraintMet && (
                          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              All three 20/4/10 constraints satisfied
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              The result above meets the 20% down, 48-month term, and 10%
                              income thresholds simultaneously.
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Gross vs Net note (all modes) */}
                    {(inputs.mode === "income" || inputs.mode === "rule") && (
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        These calculations use <strong>gross income</strong> (pre-tax).
                        Your actual take-home pay is lower after taxes and deductions,
                        so a payment sized against gross income consumes a larger
                        share of your real take-home than the percentage shown here
                        suggests. This calculator does not estimate net income or
                        tax withholdings because those vary by filing status,
                        deductions, and jurisdiction.
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 no-print">
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
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-xs"
                      >
                        <RotateCcw className="mr-1.5 size-3.5" />
                        Reset
                      </Button>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This is an estimate for informational purposes only. Actual
                      affordability depends on credit approval, lender requirements,
                      state taxes, and other factors not modeled here. The 20/4/10
                      rule is a commonly cited guideline, not financial advice.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    {inputs.mode === "rule"
                      ? "No budget remains for a loan payment after insurance, fuel, and maintenance. Reduce those costs or increase income."
                      : inputs.mode === "income"
                        ? "Existing debt exceeds the target debt budget. Increase the income percentage or reduce existing debt."
                        : "Enter a positive target payment to see results."}
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

/* ─── Reusable Input Field ─── */

function InputField({
  id,
  label,
  tooltip,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  id: string;
  label: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px] text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-sm font-semibold text-foreground">
          {format(value)}
        </span>
      </div>
      <div className="no-print">
        <Slider
          id={id}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([v]) => {
            const clamped = Math.min(Math.max(v, min), max);
            onChange(clamped.toString());
          }}
          aria-label={label}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const num = parseFloat(e.target.value);
            if (!isNaN(num)) {
              onChange(Math.min(Math.max(num, min), max).toString());
            }
          }}
          className="mt-1"
          aria-label={`${label} input`}
        />
      </div>
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
    return `${window.location.host}${window.location.pathname} - Printed ${d}`;
  }, []);
  return <span>{text}</span>;
}