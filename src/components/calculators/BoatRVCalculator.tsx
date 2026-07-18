"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw,
  ChevronDown, ChevronUp, Info, PlusCircle,
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
  calculateLoan, calculateLoanWithExtra, formatCurrency, formatPercent,
  type LoanWithExtraResult,
} from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

type VehicleType = "boat" | "rv" | "motorcycle";

interface BoatRVInputs {
  vehicleType: VehicleType;
  purchasePrice: number;
  tradeInValue: number;
  downPayment: number;
  salesTaxRate: number;
  apr: number;
  termMonths: number;
  extraMonthly: number;
  extraStartMonth: number;
}

/* ─── Vehicle config (slider ranges and labels) ─── */

const VEHICLE_CONFIG = {
  boat: {
    label: "Boat",
    priceMin: 5000, priceMax: 500000, priceStep: 1000,
    termMin: 12, termMax: 180,
    aprMin: 0, aprMax: 25, aprStep: 0.1,
    defaultPrice: 75000, defaultTerm: 120, defaultApr: 8.5,
  },
  rv: {
    label: "RV",
    priceMin: 10000, priceMax: 500000, priceStep: 1000,
    termMin: 12, termMax: 240,
    aprMin: 0, aprMax: 20, aprStep: 0.1,
    defaultPrice: 120000, defaultTerm: 180, defaultApr: 7,
  },
  motorcycle: {
    label: "Motorcycle",
    priceMin: 1000, priceMax: 100000, priceStep: 500,
    termMin: 12, termMax: 84,
    aprMin: 0, aprMax: 25, aprStep: 0.1,
    defaultPrice: 15000, defaultTerm: 60, defaultApr: 9,
  },
} as const;

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: BoatRVInputs = {
  vehicleType: "boat",
  purchasePrice: 75000,
  tradeInValue: 15000,
  downPayment: 10000,
  salesTaxRate: 0,
  apr: 8.5,
  termMonths: 120,
  extraMonthly: 0,
  extraStartMonth: 1,
};

/* Pre-compute default result at module level (available during SSR) */
const defaultFinanced = DEFAULT_INPUTS.purchasePrice
  + (DEFAULT_INPUTS.purchasePrice * DEFAULT_INPUTS.salesTaxRate / 100)
  - DEFAULT_INPUTS.tradeInValue
  - DEFAULT_INPUTS.downPayment;

export const DEFAULT_RESULT = calculateLoanWithExtra({
  loanAmount: defaultFinanced,
  apr: DEFAULT_INPUTS.apr,
  termMonths: DEFAULT_INPUTS.termMonths,
});

/* ─── Component ─── */

export default function BoatRVCalculator() {
  const [inputs, setInputs] = useState<BoatRVInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const price = params.get("price");
    const tradein = params.get("tradein");
    const down = params.get("down");
    const tax = params.get("tax");
    const rate = params.get("rate");
    const term = params.get("term");
    const extra = params.get("extra");
    const extrastart = params.get("extrastart");
    if (!type && !price && !tradein && !down && !tax && !rate && !term && !extra && !extrastart) return DEFAULT_INPUTS;
    return {
      vehicleType: (type === "boat" || type === "rv" || type === "motorcycle") ? type : DEFAULT_INPUTS.vehicleType,
      purchasePrice: price ? parseFloat(price) : DEFAULT_INPUTS.purchasePrice,
      tradeInValue: tradein ? parseFloat(tradein) : DEFAULT_INPUTS.tradeInValue,
      downPayment: down ? parseFloat(down) : DEFAULT_INPUTS.downPayment,
      salesTaxRate: tax ? parseFloat(tax) : DEFAULT_INPUTS.salesTaxRate,
      apr: rate ? parseFloat(rate) : DEFAULT_INPUTS.apr,
      termMonths: term ? parseInt(term, 10) : DEFAULT_INPUTS.termMonths,
      extraMonthly: extra ? parseFloat(extra) : DEFAULT_INPUTS.extraMonthly,
      extraStartMonth: extrastart ? parseInt(extrastart, 10) : DEFAULT_INPUTS.extraStartMonth,
    };
  });
  const [copied, setCopied] = useState(false);
  const [showAmortization, setShowAmortization] = useState(true);
  const [showExtraInputs, setShowExtraInputs] = useState(false);

  const config = VEHICLE_CONFIG[inputs.vehicleType];

  const financedAmount = useMemo(
    () => Math.max(0,
      inputs.purchasePrice
      + (inputs.purchasePrice * inputs.salesTaxRate / 100)
      - inputs.tradeInValue
      - inputs.downPayment
    ),
    [inputs.purchasePrice, inputs.salesTaxRate, inputs.tradeInValue, inputs.downPayment]
  );

  const result = useMemo(
    () => calculateLoanWithExtra({
      loanAmount: financedAmount,
      apr: inputs.apr,
      termMonths: inputs.termMonths,
      extraMonthly: inputs.extraMonthly,
      extraStartMonth: inputs.extraStartMonth,
    }),
    [financedAmount, inputs.apr, inputs.termMonths, inputs.extraMonthly, inputs.extraStartMonth]
  );

  const baseResult = useMemo(
    () => calculateLoan({
      loanAmount: financedAmount,
      apr: inputs.apr,
      termMonths: inputs.termMonths,
    }),
    [financedAmount, inputs.apr, inputs.termMonths]
  );

  const salesTaxAmount = useMemo(
    () => Math.round(inputs.purchasePrice * inputs.salesTaxRate / 100 * 100) / 100,
    [inputs.purchasePrice, inputs.salesTaxRate]
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
    params.set("type", inputs.vehicleType);
    params.set("price", inputs.purchasePrice.toString());
    params.set("tradein", inputs.tradeInValue.toString());
    params.set("down", inputs.downPayment.toString());
    params.set("tax", inputs.salesTaxRate.toString());
    params.set("rate", inputs.apr.toString());
    params.set("term", inputs.termMonths.toString());
    params.set("extra", inputs.extraMonthly.toString());
    params.set("extrastart", inputs.extraStartMonth.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [inputs]);

  const handleInputChange = useCallback(
    (field: keyof BoatRVInputs, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setInputs((prev) => ({ ...prev, [field]: num }));
      }
    },
    []
  );

  const handleVehicleTypeChange = useCallback((type: VehicleType) => {
    setInputs((prev) => {
      const newConfig = VEHICLE_CONFIG[type];
      return {
        ...prev,
        vehicleType: type,
        purchasePrice: Math.min(prev.purchasePrice, newConfig.priceMax),
        termMonths: prev.termMonths > newConfig.termMax ? newConfig.defaultTerm : prev.termMonths,
        apr: prev.apr > newConfig.aprMax ? newConfig.defaultApr : prev.apr,
      };
    });
  }, []);

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

  const maxTradeIn = inputs.purchasePrice;
  const maxDown = Math.max(0, inputs.purchasePrice - inputs.tradeInValue);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              Boat, RV &amp; Motorcycle Loan Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Estimate monthly payments for recreational vehicle financing.
              Adjust the vehicle type, price, and loan terms to see your
              amortization schedule.
            </p>

            {/* Vehicle Type Toggle */}
            <div className="flex gap-2 pt-2 no-print">
              {(["boat", "rv", "motorcycle"] as const).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleVehicleTypeChange(type)}
                  className={
                    inputs.vehicleType === type
                      ? "bg-ember/10 text-ember border-ember/30"
                      : ""
                  }
                >
                  {VEHICLE_CONFIG[type].label}
                </Button>
              ))}
            </div>
            {/* Print-only label */}
            <p className="hidden print:block text-sm font-medium">
              Vehicle Type: {config.label}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Purchase Price */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="purchase-price" className="text-sm font-medium">
                      Purchase Price
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.purchasePrice)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="purchase-price"
                      min={config.priceMin}
                      max={config.priceMax}
                      step={config.priceStep}
                      value={[inputs.purchasePrice]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, purchasePrice: v }))
                      }
                      aria-label="Purchase price"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(config.priceMin)}</span>
                      <span>{formatCurrency(config.priceMax)}</span>
                    </div>
                    <Input
                      type="number"
                      min={config.priceMin}
                      max={config.priceMax}
                      step={config.priceStep}
                      value={inputs.purchasePrice}
                      onChange={(e) =>
                        handleInputChange("purchasePrice", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Purchase price input"
                    />
                  </div>
                </div>

                {/* Trade-In Value */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="trade-in-value" className="text-sm font-medium">
                        Trade-In Value
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-xs">
                          The appraised value of your current vehicle being
                          traded in. This amount is subtracted from the
                          purchase price to reduce the amount financed.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.tradeInValue)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="trade-in-value"
                      min={0}
                      max={maxTradeIn}
                      step={config.priceStep}
                      value={[inputs.tradeInValue]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, tradeInValue: v }))
                      }
                      aria-label="Trade-in value"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(0)}</span>
                      <span>{formatCurrency(maxTradeIn)}</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={maxTradeIn}
                      step={config.priceStep}
                      value={inputs.tradeInValue}
                      onChange={(e) =>
                        handleInputChange("tradeInValue", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Trade-in value input"
                    />
                  </div>
                </div>

                {/* Down Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="down-payment" className="text-sm font-medium">
                      Down Payment
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.downPayment)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="down-payment"
                      min={0}
                      max={maxDown}
                      step={config.priceStep}
                      value={[inputs.downPayment]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, downPayment: v }))
                      }
                      aria-label="Down payment"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(0)}</span>
                      <span>{formatCurrency(maxDown)}</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={maxDown}
                      step={config.priceStep}
                      value={inputs.downPayment}
                      onChange={(e) =>
                        handleInputChange("downPayment", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Down payment input"
                    />
                  </div>
                </div>

                {/* Sales Tax Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="sales-tax" className="text-sm font-medium">
                        Sales Tax Rate
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px] text-xs">
                          Sales tax rates vary by state and locality. Some
                          states tax only the difference after trade-in.
                          Enter your actual rate.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPercent(inputs.salesTaxRate)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="sales-tax"
                      min={0}
                      max={15}
                      step={0.1}
                      value={[inputs.salesTaxRate]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, salesTaxRate: v }))
                      }
                      aria-label="Sales tax rate"
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
                      step={0.1}
                      value={inputs.salesTaxRate}
                      onChange={(e) =>
                        handleInputChange("salesTaxRate", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Sales tax rate input"
                    />
                  </div>
                </div>

                {/* APR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="annual-rate" className="text-sm font-medium">
                      Annual Interest Rate (APR)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPercent(inputs.apr)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="annual-rate"
                      min={config.aprMin}
                      max={config.aprMax}
                      step={config.aprStep}
                      value={[inputs.apr]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, apr: v }))
                      }
                      aria-label="Annual interest rate"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatPercent(config.aprMin)}</span>
                      <span>{formatPercent(config.aprMax)}</span>
                    </div>
                    <Input
                      type="number"
                      min={config.aprMin}
                      max={config.aprMax}
                      step={config.aprStep}
                      value={inputs.apr}
                      onChange={(e) =>
                        handleInputChange("apr", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Annual interest rate input"
                    />
                  </div>
                </div>

                {/* Term (Months) */}
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
                      min={config.termMin}
                      max={config.termMax}
                      step={1}
                      value={[inputs.termMonths]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, termMonths: v }))
                      }
                      aria-label="Loan term in months"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{config.termMin} mo</span>
                      <span>{config.termMax} mo</span>
                    </div>
                    <Input
                      type="number"
                      min={config.termMin}
                      max={config.termMax}
                      step={1}
                      value={inputs.termMonths}
                      onChange={(e) =>
                        handleInputChange("termMonths", e.target.value)
                      }
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
                            <Label htmlFor="extra-monthly" className="text-sm font-medium">
                              Extra Monthly Payment
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[240px] text-xs">
                                An additional amount you pay each month on top
                                of your regular payment. This goes directly
                                toward reducing your principal balance, helping
                                you pay off the loan faster and save on interest.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(inputs.extraMonthly)}
                          </span>
                        </div>
                        <Slider
                          id="extra-monthly"
                          min={0}
                          max={5000}
                          step={50}
                          value={[inputs.extraMonthly]}
                          onValueChange={([v]) =>
                            setInputs((p) => ({ ...p, extraMonthly: v }))
                          }
                          aria-label="Extra monthly payment"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>$0</span>
                          <span>$5,000</span>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={5000}
                          step={50}
                          value={inputs.extraMonthly}
                          onChange={(e) =>
                            handleInputChange("extraMonthly", e.target.value)
                          }
                          className="mt-1"
                          aria-label="Extra monthly payment input"
                        />
                      </div>

                      {/* Start From Month */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Label htmlFor="extra-start-month" className="text-sm font-medium">
                              Start From Month
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[240px] text-xs">
                                The month number when you begin making extra
                                payments. For example, set to 1 to start
                                immediately, or 3 to begin after the third
                                regular payment.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            Month {inputs.extraStartMonth}
                          </span>
                        </div>
                        <Slider
                          id="extra-start-month"
                          min={1}
                          max={inputs.termMonths}
                          step={1}
                          value={[inputs.extraStartMonth]}
                          onValueChange={([v]) =>
                            setInputs((p) => ({ ...p, extraStartMonth: v }))
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
                            handleInputChange("extraStartMonth", e.target.value)
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
                {baseResult.schedule.length > 0 ? (
                  <>
                    {/* Monthly Payment Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Estimated Monthly Payment
                      </p>
                      <p className="text-4xl font-bold tracking-tight text-ember">
                        {formatCurrency(baseResult.monthlyPayment)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        for {inputs.termMonths} month{inputs.termMonths !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Financed Amount"
                        value={formatCurrency(financedAmount)}
                        subtext={`Price ${formatCurrency(inputs.purchasePrice)} - trade-in ${formatCurrency(inputs.tradeInValue)} - down ${formatCurrency(inputs.downPayment)}${inputs.salesTaxRate > 0 ? ` + tax ${formatCurrency(salesTaxAmount)}` : ""}`}
                      />
                      <ResultCard
                        label="Total Interest"
                        value={formatCurrency(baseResult.totalInterest)}
                        subtext={`${formatPercent(
                          (baseResult.totalInterest / baseResult.totalCost) * 100
                        )} of total cost`}
                      />
                      <ResultCard
                        label="Total Cost"
                        value={formatCurrency(baseResult.totalCost)}
                        subtext="Principal + interest"
                      />
                      <ResultCard
                        label="Sales Tax Amount"
                        value={formatCurrency(salesTaxAmount)}
                        subtext={`${formatPercent(inputs.salesTaxRate)} of ${formatCurrency(inputs.purchasePrice)}`}
                      />
                    </div>

                    {/* Early Payoff Savings */}
                    {inputs.extraMonthly > 0 && (
                      <div className="rounded-lg border border-ember/30 bg-ember/5 p-4 space-y-2">
                        <p className="text-sm font-semibold text-ember">Early Payoff Savings</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Months Saved</p>
                            <p className="text-base font-bold">{result.monthsSaved}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Interest Saved</p>
                            <p className="text-base font-bold text-ember">{formatCurrency(result.interestSaved)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">New Total Cost</p>
                            <p className="text-base font-bold">{formatCurrency(result.result.totalCost)}</p>
                          </div>
                        </div>
                      </div>
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
                      <ShareButtons summaryText={`${formatCurrency(financedAmount)} at ${formatPercent(inputs.apr)} over ${inputs.termMonths} months = ${formatCurrency(baseResult.monthlyPayment)}/mo. Calculate yours:`} />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This is an estimate for informational purposes only. Actual
                      terms vary by lender, state, and credit profile. Always
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
          </CardContent>
        </Card>

        {/* ─── Amortization Table ─── */}
        {baseResult.schedule.length > 0 && (
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
                    {baseResult.schedule.map((row) => (
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
                    {formatCurrency(baseResult.totalCost)}
                  </span>
                </span>
                <span>
                  Total Interest:{" "}
                  <span className="text-destructive">
                    {formatCurrency(baseResult.totalInterest)}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Print-only footer: URL + date ─── */}
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
    return `${window.location.host}${window.location.pathname} · Printed ${d}`;
  }, []);
  return <span>{text}</span>;
}