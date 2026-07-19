"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw,
  ChevronDown, ChevronUp, Info, ArrowRightLeft,
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
import { formatCurrency } from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

interface LeaseInputs {
  vehiclePrice: number;
  downPayment: number;
  residualPct: number;
  moneyFactor: number;
  termMonths: number;
  salesTaxRate: number;
  purchaseFee: number;
}

type RateMode = "mf" | "apr";

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: LeaseInputs = {
  vehiclePrice: 35000,
  downPayment: 2000,
  residualPct: 55,
  moneyFactor: 0.00125,
  termMonths: 36,
  salesTaxRate: 7,
  purchaseFee: 350,
};

/* ─── Lease math ─── */

function computeLease(inputs: LeaseInputs) {
  const capCost = inputs.vehiclePrice - inputs.downPayment;
  const residual =
    Math.round((inputs.vehiclePrice * inputs.residualPct) / 100 * 100) / 100;
  const depMonthly = Math.max(0, (capCost - residual) / inputs.termMonths);
  const financeMonthly = (capCost + residual) * inputs.moneyFactor;
  const preTax = depMonthly + financeMonthly;
  const taxMonthly = preTax * (inputs.salesTaxRate / 100);
  const totalMonthly =
    Math.round((preTax + taxMonthly) * 100) / 100;
  const totalLeaseCost =
    Math.round(totalMonthly * inputs.termMonths * 100) / 100;
  const totalDepreciation =
    Math.round(depMonthly * inputs.termMonths * 100) / 100;
  const totalFinance =
    Math.round(financeMonthly * inputs.termMonths * 100) / 100;
  const totalTax =
    Math.round(taxMonthly * inputs.termMonths * 100) / 100;
  const buyoutPrice =
    Math.round((residual + inputs.purchaseFee) * 100) / 100;
  const apr = Math.round(inputs.moneyFactor * 2400 * 10000) / 10000;
  return {
    capCost: Math.round(capCost * 100) / 100,
    residual,
    depMonthly: Math.round(depMonthly * 100) / 100,
    financeMonthly: Math.round(financeMonthly * 100) / 100,
    preTax: Math.round(preTax * 100) / 100,
    taxMonthly: Math.round(taxMonthly * 100) / 100,
    totalMonthly,
    totalLeaseCost,
    totalDepreciation,
    totalFinance,
    totalTax,
    buyoutPrice,
    apr,
  };
}

/* Pre-compute default result at module level (available during SSR) */
export const DEFAULT_RESULT = computeLease(DEFAULT_INPUTS);

/* ─── Component ─── */

export default function AutoLeaseCalculator() {
  const [inputs, setInputs] = useState<LeaseInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const price = params.get("price");
    const down = params.get("down");
    const residual = params.get("residual");
    const mf = params.get("mf");
    const term = params.get("term");
    const tax = params.get("tax");
    const fee = params.get("fee");
    if (!price && !down && !residual && !mf && !term && !tax && !fee)
      return DEFAULT_INPUTS;
    return {
      vehiclePrice: price ? parseFloat(price) : DEFAULT_INPUTS.vehiclePrice,
      downPayment: down ? parseFloat(down) : DEFAULT_INPUTS.downPayment,
      residualPct: residual
        ? parseFloat(residual)
        : DEFAULT_INPUTS.residualPct,
      moneyFactor: mf ? parseFloat(mf) : DEFAULT_INPUTS.moneyFactor,
      termMonths: term ? parseInt(term, 10) : DEFAULT_INPUTS.termMonths,
      salesTaxRate: tax ? parseFloat(tax) : DEFAULT_INPUTS.salesTaxRate,
      purchaseFee: fee ? parseFloat(fee) : DEFAULT_INPUTS.purchaseFee,
    };
  });
  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [rateMode, setRateMode] = useState<RateMode>("mf");

  const result = useMemo(() => computeLease(inputs), [inputs]);

  /* Sync URL (skip initial mount) */
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("price", inputs.vehiclePrice.toString());
    params.set("down", inputs.downPayment.toString());
    params.set("residual", inputs.residualPct.toString());
    params.set("mf", inputs.moneyFactor.toString());
    params.set("term", inputs.termMonths.toString());
    params.set("tax", inputs.salesTaxRate.toString());
    params.set("fee", inputs.purchaseFee.toString());
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [inputs]);

  const handleInputChange = useCallback(
    (field: keyof LeaseInputs, value: string) => {
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

  const handleRateToggle = useCallback(() => {
    setRateMode((prev) => (prev === "mf" ? "apr" : "mf"));
  }, []);

  const handleAprChange = useCallback((value: string) => {
    const apr = parseFloat(value);
    if (!isNaN(apr)) {
      setInputs((prev) => ({
        ...prev,
        moneyFactor: Math.max(0, apr / 2400),
      }));
    }
  }, []);

  const isValid =
    inputs.vehiclePrice > 0 &&
    inputs.termMonths > 0 &&
    inputs.moneyFactor >= 0 &&
    result.capCost > result.residual;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              Auto Lease Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Calculate your monthly lease payment broken into depreciation,
              finance charge, and tax. Includes buyout estimate.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Vehicle Price */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vehicle-price" className="text-sm font-medium">
                      Vehicle Price (MSRP)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.vehiclePrice)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="vehicle-price"
                      min={5000}
                      max={100000}
                      step={500}
                      value={[inputs.vehiclePrice]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, vehiclePrice: v }))
                      }
                      aria-label="Vehicle price"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(5000)}</span>
                      <span>{formatCurrency(100000)}</span>
                    </div>
                    <Input
                      type="number"
                      min={5000}
                      max={100000}
                      step={500}
                      value={inputs.vehiclePrice}
                      onChange={(e) =>
                        handleInputChange("vehiclePrice", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Down Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label
                        htmlFor="down-payment"
                        className="text-sm font-medium"
                      >
                        Down Payment / Cap Cost Reduction
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Money paid upfront to reduce the capitalized cost of
                          the lease.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.downPayment)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="down-payment"
                      min={0}
                      max={Math.max(0, Math.round(inputs.vehiclePrice * 0.5))}
                      step={100}
                      value={[inputs.downPayment]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, downPayment: v }))
                      }
                      aria-label="Down payment"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>
                        {formatCurrency(
                          Math.round(inputs.vehiclePrice * 0.5),
                        )}
                      </span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      step={100}
                      value={inputs.downPayment}
                      onChange={(e) =>
                        handleInputChange("downPayment", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Residual Value % */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label
                        htmlFor="residual-pct"
                        className="text-sm font-medium"
                      >
                        Residual Value
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The vehicle&apos;s estimated value at lease end,
                          expressed as a percentage of MSRP. A higher residual
                          lowers your payment.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.residualPct}% ({formatCurrency(result.residual)})
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="residual-pct"
                      min={10}
                      max={85}
                      step={1}
                      value={[inputs.residualPct]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, residualPct: v }))
                      }
                      aria-label="Residual value percentage"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10%</span>
                      <span>85%</span>
                    </div>
                    <Input
                      type="number"
                      min={10}
                      max={85}
                      step={1}
                      value={inputs.residualPct}
                      onChange={(e) =>
                        handleInputChange("residualPct", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Money Factor / APR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label
                        htmlFor={rateMode === "mf" ? "mf" : "apr"}
                        className="text-sm font-medium"
                      >
                        {rateMode === "mf"
                          ? "Money Factor"
                          : "Annual Percentage Rate (APR)"}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Money factor is the lease equivalent of an interest
                          rate. Convert to APR by multiplying by 2,400.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="no-print">
                    {rateMode === "apr" ? (
                      <>
                        <Slider
                          id="apr"
                          min={0}
                          max={15}
                          step={0.1}
                          value={[result.apr]}
                          onValueChange={([v]) =>
                            handleAprChange(v.toString())
                          }
                          aria-label="APR"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>15%</span>
                        </div>
                        <Input
                          type="number"
                          id="apr"
                          min={0}
                          max={15}
                          step={0.1}
                          value={result.apr}
                          onChange={(e) => handleAprChange(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground">
                          Money Factor: {inputs.moneyFactor.toFixed(5)}
                        </p>
                      </>
                    ) : (
                      <>
                        <Input
                          type="number"
                          id="mf"
                          min={0}
                          max={0.01}
                          step={0.00001}
                          value={parseFloat(inputs.moneyFactor.toFixed(5))}
                          onChange={(e) =>
                            handleInputChange("moneyFactor", e.target.value)
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Equivalent APR: {result.apr}%
                        </p>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleRateToggle}
                      className="inline-flex items-center gap-1 text-xs text-ember hover:text-ember-hover transition-colors mt-1 cursor-pointer"
                    >
                      <ArrowRightLeft className="size-3" />
                      Enter as {rateMode === "mf" ? "APR" : "Money Factor"}
                    </button>
                  </div>
                </div>

                {/* Lease Term */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="term" className="text-sm font-medium">
                      Lease Term
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.termMonths} months
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="term"
                      min={12}
                      max={60}
                      step={1}
                      value={[inputs.termMonths]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, termMonths: v }))
                      }
                      aria-label="Lease term"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>12 mo</span>
                      <span>60 mo</span>
                    </div>
                    <Input
                      type="number"
                      id="term"
                      min={12}
                      max={60}
                      step={1}
                      value={inputs.termMonths}
                      onChange={(e) =>
                        handleInputChange("termMonths", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Sales Tax Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tax" className="text-sm font-medium">
                      Sales Tax Rate
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.salesTaxRate}%
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="tax"
                      min={0}
                      max={12}
                      step={0.5}
                      value={[inputs.salesTaxRate]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, salesTaxRate: v }))
                      }
                      aria-label="Sales tax rate"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>12%</span>
                    </div>
                    <Input
                      type="number"
                      id="tax"
                      min={0}
                      max={12}
                      step={0.5}
                      value={inputs.salesTaxRate}
                      onChange={(e) =>
                        handleInputChange("salesTaxRate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Purchase Option Fee */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="fee" className="text-sm font-medium">
                        Purchase Option Fee
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Fee charged by the lessor if you purchase the
                          vehicle at lease end.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.purchaseFee)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Input
                      type="number"
                      id="fee"
                      min={0}
                      step={50}
                      value={inputs.purchaseFee}
                      onChange={(e) =>
                        handleInputChange("purchaseFee", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {isValid ? (
                  <>
                    {/* Monthly Payment Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-4 text-center">
                      <p className="text-xs font-medium text-muted-foreground">
                        Monthly Lease Payment
                      </p>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-ember">
                        {formatCurrency(result.totalMonthly)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        per month for {inputs.termMonths} months
                      </p>
                    </div>

                    {/* Result Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Depreciation"
                        value={formatCurrency(result.depMonthly)}
                        subtext={`${formatCurrency(result.totalDepreciation)} total`}
                      />
                      <ResultCard
                        label="Finance Charge (Rent)"
                        value={formatCurrency(result.financeMonthly)}
                        subtext={`${formatCurrency(result.totalFinance)} total`}
                      />
                      <ResultCard
                        label="Monthly Tax"
                        value={formatCurrency(result.taxMonthly)}
                        subtext={`${formatCurrency(result.totalTax)} total`}
                      />
                      <ResultCard
                        label="Adjusted Cap Cost"
                        value={formatCurrency(result.capCost)}
                        subtext="Price minus down payment"
                      />
                      <ResultCard
                        label="Residual Value"
                        value={formatCurrency(result.residual)}
                        subtext={`${inputs.residualPct}% of MSRP`}
                      />
                      <ResultCard
                        label="Total Lease Cost"
                        value={formatCurrency(result.totalLeaseCost)}
                        subtext={`${inputs.termMonths} payments`}
                      />
                    </div>

                    {/* Formula Breakdown */}
                    <div className="rounded-md border bg-muted/30 p-3 space-y-1.5 text-xs text-muted-foreground">
                      <p className="font-semibold text-foreground text-sm">
                        Lease Payment Breakdown
                      </p>
                      <p>
                        Depreciation = ({formatCurrency(result.capCost)} -{" "}
                        {formatCurrency(result.residual)}) /{" "}
                        {inputs.termMonths} = {formatCurrency(result.depMonthly)}
                      </p>
                      <p>
                        Finance charge = ({formatCurrency(result.capCost)} +{" "}
                        {formatCurrency(result.residual)}) x{" "}
                        {inputs.moneyFactor.toFixed(5)} ={" "}
                        {formatCurrency(result.financeMonthly)}
                      </p>
                      <p>
                        Pre-tax payment = {formatCurrency(result.depMonthly)} +{" "}
                        {formatCurrency(result.financeMonthly)} ={" "}
                        {formatCurrency(result.preTax)}
                      </p>
                      <p>
                        Tax = {formatCurrency(result.preTax)} x{" "}
                        {inputs.salesTaxRate}% ={" "}
                        {formatCurrency(result.taxMonthly)}
                      </p>
                      <p className="font-semibold text-foreground">
                        Monthly payment = {formatCurrency(result.depMonthly)} +{" "}
                        {formatCurrency(result.financeMonthly)} +{" "}
                        {formatCurrency(result.taxMonthly)} ={" "}
                        {formatCurrency(result.totalMonthly)}
                      </p>
                    </div>

                    {/* Buyout */}
                    <div className="rounded-lg border border-ember/30 bg-ember/5 p-4 space-y-2">
                      <p className="text-sm font-semibold text-ember">
                        End-of-Lease Buyout Price
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Residual Value
                          </p>
                          <p className="text-base font-bold">
                            {formatCurrency(result.residual)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Purchase Fee
                          </p>
                          <p className="text-base font-bold">
                            {formatCurrency(inputs.purchaseFee)}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-ember/20">
                        <p className="text-xs text-muted-foreground">
                          Total Buyout Price
                        </p>
                        <p className="text-lg font-bold text-ember">
                          {formatCurrency(result.buyoutPrice)}
                        </p>
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
                      <ShareButtons
                        summaryText={`${formatCurrency(result.totalMonthly)}/mo lease on a ${formatCurrency(inputs.vehiclePrice)} vehicle. Calculate yours:`}
                      />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This is an estimate for informational purposes only. Actual
                      lease terms vary by lessor, state, credit profile, and
                      vehicle. Always review your lease agreement before signing.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    {result.capCost <= result.residual
                      ? "Adjusted cap cost must exceed the residual value for a valid lease."
                      : "Enter valid lease details to see results."}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Lease Cost Schedule ─── */}
        {isValid && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="no-print flex w-full items-center justify-between text-left"
                aria-expanded={showSchedule}
              >
                <CardTitle className="text-lg">Lease Cost Schedule</CardTitle>
                {showSchedule ? (
                  <ChevronUp className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </button>
              <CardTitle className="hidden print:block text-lg">
                Lease Cost Schedule
              </CardTitle>
            </CardHeader>
            <CardContent
              className={showSchedule ? "" : "hidden print:block"}
            >
              <div className="amortization-scroll max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Month</TableHead>
                      <TableHead className="text-right">Payment</TableHead>
                      <TableHead className="text-right">Depreciation</TableHead>
                      <TableHead className="text-right">Finance</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Total Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: inputs.termMonths }, (_, i) => {
                      const month = i + 1;
                      const cumulative =
                        Math.round(result.totalMonthly * month * 100) / 100;
                      return (
                        <TableRow key={month}>
                          <TableCell className="font-medium">
                            {month}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(result.totalMonthly)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(result.depMonthly)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(result.financeMonthly)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(result.taxMonthly)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(cumulative)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm font-medium">
                <span>
                  Total Paid:{" "}
                  <span className="text-ember">
                    {formatCurrency(result.totalLeaseCost)}
                  </span>
                </span>
                <span>
                  Finance Charges:{" "}
                  <span className="text-destructive">
                    {formatCurrency(result.totalFinance)}
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