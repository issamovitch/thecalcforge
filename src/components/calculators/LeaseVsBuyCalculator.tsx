"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw,
  Info, ArrowRightLeft,
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
import { formatCurrency } from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

interface LeaseInputs {
  vehiclePrice: number;
  salesTaxRate: number;
  comparisonMonths: number;
  leaseDown: number;
  residualPct: number;
  moneyFactor: number;
  leaseTerm: number;
  buyDown: number;
  loanApr: number;
  loanTerm: number;
  resaleValue: number;
}

type RateMode = "mf" | "apr";

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: LeaseInputs = {
  vehiclePrice: 35000,
  salesTaxRate: 7,
  comparisonMonths: 36,
  leaseDown: 2000,
  residualPct: 55,
  moneyFactor: 0.00125,
  leaseTerm: 36,
  buyDown: 3500,
  loanApr: 6.5,
  loanTerm: 60,
  resaleValue: 21000,
};

/* ─── Math helpers ─── */

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

function computeLeasePayment(
  price: number,
  down: number,
  resPct: number,
  mf: number,
  term: number,
  taxRate: number,
) {
  const capCost = price - down;
  const residual = r2((price * resPct) / 100);
  const depMonthly = Math.max(0, (capCost - residual) / term);
  const finMonthly = (capCost + residual) * mf;
  const preTax = depMonthly + finMonthly;
  const taxMonthly = preTax * (taxRate / 100);
  const totalMonthly = r2(preTax + taxMonthly);
  return { capCost: r2(capCost), residual, depMonthly: r2(depMonthly), finMonthly: r2(finMonthly), preTax: r2(preTax), taxMonthly: r2(taxMonthly), totalMonthly };
}

function computeLoanPayment(amount: number, apr: number, term: number) {
  if (apr <= 0) return r2(amount / term);
  const r = apr / 100 / 12;
  return r2(amount * (r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1));
}

function remainingBalance(
  principal: number,
  apr: number,
  term: number,
  monthsPaid: number,
) {
  if (monthsPaid >= term) return 0;
  if (apr <= 0) return r2(principal - (principal / term) * monthsPaid);
  const r = apr / 100 / 12;
  const factor = Math.pow(1 + r, term);
  return r2(principal * (factor - Math.pow(1 + r, monthsPaid)) / (factor - 1));
}

interface LeaseResult {
  monthly: number;
  totalCost: number;
  totalDepreciation: number;
  totalFinance: number;
  totalTax: number;
}

interface BuyResult {
  monthly: number;
  totalPayments: number;
  totalInterest: number;
  remainingBalance: number;
  equity: number;
  netCost: number;
}

interface ComparisonResult {
  lease: LeaseResult;
  buy: BuyResult;
  difference: number;
  winner: "buy" | "lease" | "tie";
  breakEvenMonth: number | null;
}

function computeComparison(inputs: LeaseInputs): ComparisonResult {
  const lp = computeLeasePayment(
    inputs.vehiclePrice, inputs.leaseDown, inputs.residualPct,
    inputs.moneyFactor, inputs.leaseTerm, inputs.salesTaxRate,
  );

  // Total lease cost over comparison period (handles multiple lease cycles)
  const comp = inputs.comparisonMonths;
  let totalLeaseCost = 0;
  let remaining = comp;
  while (remaining > 0) {
    const monthsThisCycle = Math.min(remaining, inputs.leaseTerm);
    totalLeaseCost += inputs.leaseDown + lp.totalMonthly * monthsThisCycle;
    remaining -= inputs.leaseTerm;
  }

  // Buy side
  const loanAmount = inputs.vehiclePrice - inputs.buyDown;
  const buyMonthly = computeLoanPayment(loanAmount, inputs.loanApr, inputs.loanTerm);
  const totalBuyPayments = inputs.buyDown + buyMonthly * Math.min(comp, inputs.loanTerm);
  const totalInterest = r2(buyMonthly * Math.min(comp, inputs.loanTerm) - Math.min(loanAmount, loanAmount * Math.min(comp, inputs.loanTerm) / inputs.loanTerm));
  const bal = remainingBalance(loanAmount, inputs.loanApr, inputs.loanTerm, Math.min(comp, inputs.loanTerm));
  const equity = Math.max(0, inputs.resaleValue - bal);
  const netBuyCost = r2(totalBuyPayments - equity);

  // Winner
  const diff = r2(totalLeaseCost - netBuyCost);
  const winner = Math.abs(diff) < 1 ? "tie" as const : diff > 0 ? "buy" as const : "lease" as const;

  // Break-even: find month where cumulative buy net cost first < cumulative lease net cost
  let breakEvenMonth: number | null = null;
  const maxMonths = Math.min(comp, 120); // cap at 10 years
  for (let m = 1; m <= maxMonths; m++) {
    // Cumulative lease
    let cumLease = 0;
    let rem = m;
    while (rem > 0) {
      const mc = Math.min(rem, inputs.leaseTerm);
      cumLease += inputs.leaseDown + lp.totalMonthly * mc;
      rem -= inputs.leaseTerm;
    }

    // Cumulative buy net cost
    const cumBuyPayments = inputs.buyDown + buyMonthly * Math.min(m, inputs.loanTerm);
    const remBal = remainingBalance(loanAmount, inputs.loanApr, inputs.loanTerm, Math.min(m, inputs.loanTerm));
    // Interpolated resale value at month m
    const interpResale = inputs.vehiclePrice - (inputs.vehiclePrice - inputs.resaleValue) * (m / comp);
    const cumEquity = Math.max(0, r2(interpResale) - remBal);
    const cumBuyNet = cumBuyPayments - cumEquity;

    if (cumBuyNet < cumLease) {
      breakEvenMonth = m;
      break;
    }
  }

  return {
    lease: {
      monthly: lp.totalMonthly,
      totalCost: r2(totalLeaseCost),
      totalDepreciation: r2(lp.depMonthly * Math.min(comp, inputs.leaseTerm)),
      totalFinance: r2(lp.finMonthly * Math.min(comp, inputs.leaseTerm)),
      totalTax: r2(lp.taxMonthly * Math.min(comp, inputs.leaseTerm)),
    },
    buy: {
      monthly: buyMonthly,
      totalPayments: r2(totalBuyPayments),
      totalInterest,
      remainingBalance: bal,
      equity,
      netCost: netBuyCost,
    },
    difference: diff,
    winner,
    breakEvenMonth,
  };
}

/* Pre-compute default result at module level (available during SSR) */
export const DEFAULT_RESULT = computeComparison(DEFAULT_INPUTS);

/* ─── Component ─── */

export default function LeaseVsBuyCalculator() {
  const [inputs, setInputs] = useState<LeaseInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const p = new URLSearchParams(window.location.search);
    const g = (key: string, fallback: number) => {
      const v = p.get(key);
      return v ? parseFloat(v) : fallback;
    };
    if (!p.has("price") && !p.has("ld") && !p.has("bd")) return DEFAULT_INPUTS;
    return {
      vehiclePrice: g("price", DEFAULT_INPUTS.vehiclePrice),
      salesTaxRate: g("tax", DEFAULT_INPUTS.salesTaxRate),
      comparisonMonths: g("comp", DEFAULT_INPUTS.comparisonMonths),
      leaseDown: g("ld", DEFAULT_INPUTS.leaseDown),
      residualPct: g("res", DEFAULT_INPUTS.residualPct),
      moneyFactor: g("mf", DEFAULT_INPUTS.moneyFactor),
      leaseTerm: g("lt", DEFAULT_INPUTS.leaseTerm),
      buyDown: g("bd", DEFAULT_INPUTS.buyDown),
      loanApr: g("apr", DEFAULT_INPUTS.loanApr),
      loanTerm: g("lnt", DEFAULT_INPUTS.loanTerm),
      resaleValue: g("resale", DEFAULT_INPUTS.resaleValue),
    };
  });
  const [copied, setCopied] = useState(false);
  const [rateMode, setRateMode] = useState<RateMode>("mf");

  const result = useMemo(() => computeComparison(inputs), [inputs]);

  /* Sync URL (skip initial mount) */
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("price", inputs.vehiclePrice.toString());
    params.set("tax", inputs.salesTaxRate.toString());
    params.set("comp", inputs.comparisonMonths.toString());
    params.set("ld", inputs.leaseDown.toString());
    params.set("res", inputs.residualPct.toString());
    params.set("mf", inputs.moneyFactor.toString());
    params.set("lt", inputs.leaseTerm.toString());
    params.set("bd", inputs.buyDown.toString());
    params.set("apr", inputs.loanApr.toString());
    params.set("lnt", inputs.loanTerm.toString());
    params.set("resale", inputs.resaleValue.toString());
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [inputs]);

  const handleInputChange = useCallback(
    (field: keyof LeaseInputs, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num)) setInputs((prev) => ({ ...prev, [field]: num }));
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
    } catch { toast.error("Failed to copy link"); }
  }, []);

  const handlePrint = useCallback(() => { window.print(); }, []);

  const handleRateToggle = useCallback(() => {
    setRateMode((prev) => (prev === "mf" ? "apr" : "mf"));
  }, []);

  const handleAprChange = useCallback((value: string) => {
    const apr = parseFloat(value);
    if (!isNaN(apr)) setInputs((prev) => ({ ...prev, moneyFactor: Math.max(0, apr / 2400) }));
  }, []);

  const leaseApr = r2(inputs.moneyFactor * 2400);

  const isValid =
    inputs.vehiclePrice > 0 &&
    inputs.leaseTerm > 0 &&
    inputs.loanTerm > 0 &&
    inputs.comparisonMonths > 0 &&
    (inputs.vehiclePrice - inputs.leaseDown) >
      r2((inputs.vehiclePrice * inputs.residualPct) / 100);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              Lease vs Buy Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare the total cost of leasing versus buying over the same
              period, including resale equity.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Shared Section Header */}
                <div className="flex items-center gap-2 border-b pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shared Inputs
                  </span>
                </div>

                {/* Vehicle Price */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="v-price" className="text-sm font-medium">
                      Vehicle Price
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.vehiclePrice)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="v-price"
                      min={5000}
                      max={100000}
                      step={500}
                      value={[inputs.vehiclePrice]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, vehiclePrice: v }))}
                      aria-label="Vehicle price"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(5000)}</span>
                      <span>{formatCurrency(100000)}</span>
                    </div>
                    <Input
                      type="number" min={5000} max={100000} step={500}
                      value={inputs.vehiclePrice}
                      onChange={(e) => handleInputChange("vehiclePrice", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Sales Tax Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="s-tax" className="text-sm font-medium">Sales Tax Rate</Label>
                    <span className="text-sm font-semibold text-foreground">{inputs.salesTaxRate}%</span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="s-tax" min={0} max={12} step={0.5}
                      value={[inputs.salesTaxRate]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, salesTaxRate: v }))}
                      aria-label="Sales tax rate" className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span><span>12%</span>
                    </div>
                    <Input
                      type="number" min={0} max={12} step={0.5}
                      value={inputs.salesTaxRate}
                      onChange={(e) => handleInputChange("salesTaxRate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Comparison Period */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="comp" className="text-sm font-medium">Comparison Period</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The number of months you plan to keep the vehicle. Both lease and buy costs are calculated over this same period.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.comparisonMonths} months
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="comp" min={12} max={84} step={1}
                      value={[inputs.comparisonMonths]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, comparisonMonths: v }))}
                      aria-label="Comparison period" className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>12 mo</span><span>84 mo</span>
                    </div>
                    <Input
                      type="number" min={12} max={84} step={1}
                      value={inputs.comparisonMonths}
                      onChange={(e) => handleInputChange("comparisonMonths", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Lease Section Header */}
                <div className="flex items-center gap-2 border-b pt-2 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Lease Terms
                  </span>
                </div>

                {/* Lease Down Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ld" className="text-sm font-medium">Lease Down Payment</Label>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(inputs.leaseDown)}</span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="ld" min={0} max={Math.max(0, Math.round(inputs.vehiclePrice * 0.3))} step={100}
                      value={[inputs.leaseDown]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, leaseDown: v }))}
                      aria-label="Lease down payment" className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>{formatCurrency(Math.round(inputs.vehiclePrice * 0.3))}</span>
                    </div>
                    <Input
                      type="number" min={0} step={100}
                      value={inputs.leaseDown}
                      onChange={(e) => handleInputChange("leaseDown", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Residual % */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="res-pct" className="text-sm font-medium">Residual Value</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The vehicle&apos;s estimated value at lease end, as a percentage of the negotiated price.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.residualPct}% ({formatCurrency(r2(inputs.vehiclePrice * inputs.residualPct / 100))})
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="res-pct" min={10} max={85} step={1}
                      value={[inputs.residualPct]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, residualPct: v }))}
                      aria-label="Residual percentage" className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10%</span><span>85%</span>
                    </div>
                    <Input
                      type="number" min={10} max={85} step={1}
                      value={inputs.residualPct}
                      onChange={(e) => handleInputChange("residualPct", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Money Factor / APR Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={rateMode === "mf" ? "mf" : "l-apr"} className="text-sm font-medium">
                        {rateMode === "mf" ? "Money Factor" : "Lease APR"}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Money factor is the lease equivalent of an interest rate. Multiply by 2,400 to convert to APR.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="no-print">
                    {rateMode === "apr" ? (
                      <>
                        <Slider
                          id="l-apr" min={0} max={15} step={0.1}
                          value={[leaseApr]}
                          onValueChange={([v]) => handleAprChange(v.toString())}
                          aria-label="Lease APR" className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span><span>15%</span>
                        </div>
                        <Input
                          type="number" id="l-apr" min={0} max={15} step={0.1}
                          value={leaseApr}
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
                          type="number" id="mf" min={0} max={0.01} step={0.00001}
                          value={parseFloat(inputs.moneyFactor.toFixed(5))}
                          onChange={(e) => handleInputChange("moneyFactor", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Equivalent APR: {leaseApr}%
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
                    <Label htmlFor="lt" className="text-sm font-medium">Lease Term</Label>
                    <span className="text-sm font-semibold text-foreground">{inputs.leaseTerm} months</span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="lt" min={12} max={60} step={1}
                      value={[inputs.leaseTerm]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, leaseTerm: v }))}
                      aria-label="Lease term" className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>12 mo</span><span>60 mo</span>
                    </div>
                    <Input
                      type="number" min={12} max={60} step={1}
                      value={inputs.leaseTerm}
                      onChange={(e) => handleInputChange("leaseTerm", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Buy Section Header */}
                <div className="flex items-center gap-2 border-b pt-2 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Purchase / Finance Terms
                  </span>
                </div>

                {/* Buy Down Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bd" className="text-sm font-medium">Purchase Down Payment</Label>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(inputs.buyDown)}</span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="bd" min={0} max={Math.max(0, Math.round(inputs.vehiclePrice * 0.5))} step={100}
                      value={[inputs.buyDown]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, buyDown: v }))}
                      aria-label="Purchase down payment" className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>{formatCurrency(Math.round(inputs.vehiclePrice * 0.5))}</span>
                    </div>
                    <Input
                      type="number" min={0} step={100}
                      value={inputs.buyDown}
                      onChange={(e) => handleInputChange("buyDown", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Loan APR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="b-apr" className="text-sm font-medium">Loan APR</Label>
                    <span className="text-sm font-semibold text-foreground">{inputs.loanApr}%</span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="b-apr" min={0} max={15} step={0.1}
                      value={[inputs.loanApr]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, loanApr: v }))}
                      aria-label="Loan APR" className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span><span>15%</span>
                    </div>
                    <Input
                      type="number" min={0} max={15} step={0.1}
                      value={inputs.loanApr}
                      onChange={(e) => handleInputChange("loanApr", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Loan Term */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lnt" className="text-sm font-medium">Loan Term</Label>
                    <span className="text-sm font-semibold text-foreground">{inputs.loanTerm} months</span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="lnt" min={12} max={84} step={1}
                      value={[inputs.loanTerm]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, loanTerm: v }))}
                      aria-label="Loan term" className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>12 mo</span><span>84 mo</span>
                    </div>
                    <Input
                      type="number" min={12} max={84} step={1}
                      value={inputs.loanTerm}
                      onChange={(e) => handleInputChange("loanTerm", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Resale Value */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="resale" className="text-sm font-medium">Est. Resale / Trade-In Value</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The estimated market value of the car at the end of the comparison period. This is the equity you retain when buying.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(inputs.resaleValue)}</span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="resale" min={0} max={inputs.vehiclePrice} step={500}
                      value={[inputs.resaleValue]}
                      onValueChange={([v]) => setInputs((p) => ({ ...p, resaleValue: v }))}
                      aria-label="Estimated resale value" className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0</span><span>{formatCurrency(inputs.vehiclePrice)}</span>
                    </div>
                    <Input
                      type="number" min={0} step={500}
                      value={inputs.resaleValue}
                      onChange={(e) => handleInputChange("resaleValue", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {isValid ? (
                  <>
                    {/* Verdict Banner */}
                    <div className={`rounded-lg border p-4 text-center ${
                      result.winner === "buy"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                        : result.winner === "lease"
                        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                        : "bg-muted/50 border-border"
                    }`}>
                      <p className="text-xs font-medium text-muted-foreground">
                        Over {inputs.comparisonMonths} months, {result.winner === "tie" ? "both options cost roughly the same" : `${result.winner === "buy" ? "buying" : "leasing"} is cheaper`}
                      </p>
                      {result.winner !== "tie" && (
                        <p className={`mt-1 text-2xl font-bold tracking-tight ${
                          result.winner === "buy" ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                        }`}>
                          by {formatCurrency(Math.abs(result.difference))}
                        </p>
                      )}
                      {result.winner === "tie" && (
                        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                          Difference: {formatCurrency(Math.abs(result.difference))}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Buying builds equity; leasing does not.
                      </p>
                    </div>

                    {/* Side-by-side comparison */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md border bg-card p-3">
                        <p className="text-xs font-medium text-muted-foreground">Monthly Lease</p>
                        <p className="mt-0.5 text-lg font-bold tracking-tight">{formatCurrency(result.lease.monthly)}</p>
                        <p className="text-[11px] text-muted-foreground">{formatCurrency(result.lease.totalCost)} total</p>
                      </div>
                      <div className="rounded-md border bg-card p-3">
                        <p className="text-xs font-medium text-muted-foreground">Monthly Loan</p>
                        <p className="mt-0.5 text-lg font-bold tracking-tight">{formatCurrency(result.buy.monthly)}</p>
                        <p className="text-[11px] text-muted-foreground">{formatCurrency(result.buy.totalPayments)} total paid</p>
                      </div>
                    </div>

                    {/* Detailed breakdown */}
                    <div className="space-y-3">
                      {/* Lease breakdown */}
                      <div className="rounded-md border bg-muted/30 p-3 space-y-1.5 text-xs">
                        <p className="font-semibold text-foreground text-sm">Lease Cost Breakdown</p>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Down payment</span>
                          <span>{formatCurrency(inputs.leaseDown)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{Math.min(inputs.comparisonMonths, inputs.leaseTerm)} monthly payments</span>
                          <span>{formatCurrency(r2(result.lease.monthly * Math.min(inputs.comparisonMonths, inputs.leaseTerm)))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">of which depreciation</span>
                          <span>{formatCurrency(result.lease.totalDepreciation)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">of which finance charge</span>
                          <span>{formatCurrency(result.lease.totalFinance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">of which tax</span>
                          <span>{formatCurrency(result.lease.totalTax)}</span>
                        </div>
                        {inputs.comparisonMonths > inputs.leaseTerm && (
                          <div className="flex justify-between text-amber-600 dark:text-amber-400">
                            <span>Second lease down payment</span>
                            <span>+{formatCurrency(inputs.leaseDown)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-foreground border-t pt-1.5 mt-1.5">
                          <span>Total Lease Cost</span>
                          <span className="text-destructive">{formatCurrency(result.lease.totalCost)}</span>
                        </div>
                      </div>

                      {/* Buy breakdown */}
                      <div className="rounded-md border bg-muted/30 p-3 space-y-1.5 text-xs">
                        <p className="font-semibold text-foreground text-sm">Purchase Cost Breakdown</p>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Down payment</span>
                          <span>{formatCurrency(inputs.buyDown)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{Math.min(inputs.comparisonMonths, inputs.loanTerm)} monthly payments</span>
                          <span>{formatCurrency(r2(result.buy.monthly * Math.min(inputs.comparisonMonths, inputs.loanTerm)))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining loan balance</span>
                          <span className="text-destructive">- {formatCurrency(result.buy.remainingBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Resale value</span>
                          <span className="text-emerald-600 dark:text-emerald-400">- {formatCurrency(inputs.resaleValue)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-foreground border-t pt-1.5 mt-1.5">
                          <span>Net Cost of Buying</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(result.buy.netCost)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Equity retained: {formatCurrency(result.buy.equity)}
                        </p>
                      </div>
                    </div>

                    {/* Break-even */}
                    {result.breakEvenMonth && (
                      <div className="rounded-lg border border-ember/30 bg-ember/5 p-4 space-y-2">
                        <p className="text-sm font-semibold text-ember">Break-Even Point</p>
                        <p className="text-2xl font-bold text-ember">
                          Month {result.breakEvenMonth}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.breakEvenMonth <= inputs.leaseTerm
                            ? `Buying becomes cheaper within the first lease term.`
                            : `Buying becomes cheaper after the first lease ends.`}
                          {" "}Holding the car longer increases the equity advantage of buying.
                        </p>
                      </div>
                    )}

                    {/* No break-even found */}
                    {!result.breakEvenMonth && result.winner === "lease" && (
                      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-1">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                          Buying does not break even
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Over the {inputs.comparisonMonths}-month comparison period, leasing remains cheaper. Buying may still break even if you hold the vehicle well beyond this period and resale value holds up.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 no-print">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyLink} className="text-xs">
                          {copied ? <Check className="mr-1.5 size-3.5" /> : <Copy className="mr-1.5 size-3.5" />}
                          {copied ? "Copied" : "Copy Link"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePrint} className="text-xs">
                          <Printer className="mr-1.5 size-3.5" />Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
                          <RotateCcw className="mr-1.5 size-3.5" />Reset
                        </Button>
                      </div>
                      <ShareButtons
                        summaryText={`Lease ${formatCurrency(result.lease.monthly)}/mo vs Buy ${formatCurrency(result.buy.monthly)}/mo. ${result.winner === "buy" ? "Buying" : result.winner === "lease" ? "Leasing" : "Tie"} wins by ${formatCurrency(Math.abs(result.difference))} over ${inputs.comparisonMonths}mo. Calculate yours:`}
                      />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This is an estimate for informational purposes only. Actual costs vary by
                      lender, credit profile, negotiated price, and local tax treatment. Always
                      review your lease or loan agreement before signing.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    {(inputs.vehiclePrice - inputs.leaseDown) <= r2((inputs.vehiclePrice * inputs.residualPct) / 100)
                      ? "Adjusted cap cost must exceed the residual value."
                      : "Enter valid details to see the comparison."}
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

/* ─── Sub-components ─── */

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
      year: "numeric", month: "long", day: "numeric",
    });
    return `${window.location.host}${window.location.pathname} - Printed ${d}`;
  }, []);
  return <span>{text}</span>;
}