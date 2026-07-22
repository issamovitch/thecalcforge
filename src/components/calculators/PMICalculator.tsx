"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw, Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { formatCurrency, calculateLoan } from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";
import { useClientToday } from "@/lib/use-client-today";

/* ─── Types ─── */

type CreditBand = "excellent" | "good" | "fair" | "below_avg";
type DownPaymentMode = "pct" | "dollar";

interface PMIInputs {
  homePrice: number;
  downPaymentPct: number;
  downPaymentDollar: number;
  downPaymentMode: DownPaymentMode;
  apr: number;
  termYears: 15 | 30;
  creditBand: CreditBand;
  showFHA: boolean;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: PMIInputs = {
  homePrice: 300000,
  downPaymentPct: 10,
  downPaymentDollar: 30000,
  downPaymentMode: "pct",
  apr: 6.5,
  termYears: 30,
  creditBand: "good",
  showFHA: false,
};

/* ─── PMI Rate Table ─── */

const PMI_RATES: Record<CreditBand, { min95: number; min90: number; min85: number; min80: number }> = {
  excellent:  { min95: 0.50, min90: 0.35, min85: 0.25, min80: 0.15 },
  good:       { min95: 0.80, min90: 0.55, min85: 0.35, min80: 0.25 },
  fair:       { min95: 1.10, min90: 0.80, min85: 0.50, min80: 0.35 },
  below_avg:  { min95: 1.50, min90: 1.10, min85: 0.70, min80: 0.45 },
};

const CREDIT_BAND_LABELS: Record<CreditBand, string> = {
  excellent: "Excellent (760+)",
  good: "Good (720-759)",
  fair: "Fair (680-719)",
  below_avg: "Below Average (640-679)",
};

function getPMIAnnualRate(ltvPct: number, band: CreditBand): number | null {
  if (ltvPct < 80) return null; // No PMI needed
  if (ltvPct >= 97) return null; // Rates vary significantly
  const tier = PMI_RATES[band];
  if (ltvPct >= 95) return tier.min95;
  if (ltvPct >= 90) return tier.min90;
  if (ltvPct >= 85) return tier.min85;
  return tier.min80;
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

/* ─── PMI Computation ─── */

interface PMIResult {
  loanAmount: number;
  ltvPct: number;
  pmiAnnualRate: number | null;
  monthlyPMI: number;
  annualPMI: number;
  month80LTV: number | null;
  month78LTV: number | null;
  date80LTV: string | null;
  date78LTV: string | null;
  totalPMITo78: number;
  rateNote: string | null;
  // FHA
  fhaUpfrontMIP: number;
  fhaAnnualMIPRate: number;
  fhaMonthlyMIP: number;
  fhaAnnualMIP: number;
  fhaTotalMIP: number;
  fhaNote: string;
}

function computePMI(inputs: PMIInputs, today: Date | null): PMIResult {
  const downPayment =
    inputs.downPaymentMode === "pct"
      ? (inputs.homePrice * inputs.downPaymentPct) / 100
      : inputs.downPaymentDollar;
  const loanAmount = r2(inputs.homePrice - downPayment);
  const ltvPct = inputs.homePrice > 0 ? r2((loanAmount / inputs.homePrice) * 100) : 0;

  const termMonths = inputs.termYears * 12;
  const { schedule } = calculateLoan({ loanAmount, apr: inputs.apr, termMonths });

  // Get PMI rate
  const pmiAnnualRate = getPMIAnnualRate(ltvPct, inputs.creditBand);
  let rateNote: string | null = null;
  if (ltvPct >= 97) {
    rateNote = "PMI rates vary significantly for LTV above 97%. Contact your lender for exact pricing.";
  }

  const monthlyPMI = pmiAnnualRate !== null ? r2((loanAmount * pmiAnnualRate) / 100 / 12) : 0;
  const annualPMI = r2(monthlyPMI * 12);

  // LTV drop-off calculation
  let month80LTV: number | null = null;
  let month78LTV: number | null = null;
  // today is null during SSR; startDate is left null so date80LTV/date78LTV are
  // null and not frozen in the prerendered HTML. After hydration the real date is used.
  const startDate = today ? new Date(today.getFullYear(), today.getMonth(), 1) : null;

  for (const row of schedule) {
    const rowLTV = inputs.homePrice > 0 ? (row.balance / inputs.homePrice) * 100 : 0;
    if (month80LTV === null && rowLTV <= 80) {
      month80LTV = row.month;
    }
    if (month78LTV === null && rowLTV <= 78) {
      month78LTV = row.month;
      break;
    }
  }

  const date80LTV = (month80LTV !== null && startDate) ? formatDate(addMonths(startDate, month80LTV - 1)) : null;
  const date78LTV = (month78LTV !== null && startDate) ? formatDate(addMonths(startDate, month78LTV - 1)) : null;

  // Total PMI paid until 78% LTV
  let totalPMITo78 = 0;
  if (month78LTV !== null && pmiAnnualRate !== null) {
    for (let m = 0; m < month78LTV && m < schedule.length; m++) {
      totalPMITo78 += monthlyPMI;
    }
    totalPMITo78 = r2(totalPMITo78);
  }

  // FHA MIP
  const fhaUpfrontMIP = r2(loanAmount * 0.0175);
  let fhaAnnualMIPRate: number;
  if (inputs.termYears === 30) {
    fhaAnnualMIPRate = ltvPct > 90 ? 0.55 : 0.50;
  } else {
    fhaAnnualMIPRate = ltvPct > 90 ? 0.40 : 0.15;
  }
  const fhaMonthlyMIP = r2((loanAmount * fhaAnnualMIPRate) / 100 / 12);
  const fhaAnnualMIP = r2(fhaMonthlyMIP * 12);
  const fhaTotalMIP = r2(fhaUpfrontMIP + fhaMonthlyMIP * termMonths);
  const fhaNote = "FHA MIP generally cannot be removed for the life of the loan (loans with <10% down originated after 2013).";

  return {
    loanAmount,
    ltvPct,
    pmiAnnualRate,
    monthlyPMI,
    annualPMI,
    month80LTV,
    month78LTV,
    date80LTV,
    date78LTV,
    totalPMITo78,
    rateNote,
    fhaUpfrontMIP,
    fhaAnnualMIPRate,
    fhaMonthlyMIP,
    fhaAnnualMIP,
    fhaTotalMIP,
    fhaNote,
  };
}

export const DEFAULT_RESULT = computePMI(DEFAULT_INPUTS, null);

/* ─── Component ─── */

export default function PMICalculator() {
  const today = useClientToday();
  const [inputs, setInputs] = useState<PMIInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const home = params.get("home");
    const down = params.get("down");
    const apr = params.get("apr");
    const term = params.get("term");
    const credit = params.get("credit");
    const fha = params.get("fha");
    if (!home && !down && !apr && !term && !credit && !fha)
      return DEFAULT_INPUTS;
    return {
      homePrice: home ? parseFloat(home) : DEFAULT_INPUTS.homePrice,
      downPaymentPct: down ? parseFloat(down) : DEFAULT_INPUTS.downPaymentPct,
      downPaymentDollar: DEFAULT_INPUTS.downPaymentDollar,
      downPaymentMode: DEFAULT_INPUTS.downPaymentMode,
      apr: apr ? parseFloat(apr) : DEFAULT_INPUTS.apr,
      termYears: term
        ? (parseInt(term, 10) === 15 ? 15 : 30)
        : DEFAULT_INPUTS.termYears,
      creditBand: credit
        ? (credit as CreditBand)
        : DEFAULT_INPUTS.creditBand,
      showFHA: fha === "1",
    };
  });
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computePMI(inputs, today), [inputs, today]);

  // Sync URL (skip initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("home", inputs.homePrice.toString());
    params.set("down", inputs.downPaymentPct.toString());
    params.set("apr", inputs.apr.toString());
    params.set("term", inputs.termYears.toString());
    params.set("credit", inputs.creditBand);
    params.set("fha", inputs.showFHA ? "1" : "0");
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  }, [inputs]);

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

  const handleDownModeToggle = useCallback(() => {
    setInputs((prev) => {
      const newMode: DownPaymentMode = prev.downPaymentMode === "pct" ? "dollar" : "pct";
      const downPaymentDollar =
        newMode === "dollar"
          ? r2((prev.homePrice * prev.downPaymentPct) / 100)
          : prev.downPaymentDollar;
      return { ...prev, downPaymentMode: newMode, downPaymentDollar };
    });
  }, []);

  const handleInputChange = useCallback(
    (field: keyof PMIInputs, value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) return;
      setInputs((prev) => ({ ...prev, [field]: num }));
    },
    [],
  );

  // Sync dollar value when % changes
  const handleDownPctChange = useCallback(
    (val: number) => {
      setInputs((prev) => ({
        ...prev,
        downPaymentPct: val,
        downPaymentDollar: r2((prev.homePrice * val) / 100),
      }));
    },
    [],
  );

  // Sync % value when dollar changes
  const handleDownDollarChange = useCallback(
    (val: number) => {
      setInputs((prev) => ({
        ...prev,
        downPaymentDollar: val,
        downPaymentPct: prev.homePrice > 0 ? r2((val / prev.homePrice) * 100) : 0,
      }));
    },
    [],
  );

  const downPayment =
    inputs.downPaymentMode === "pct"
      ? r2((inputs.homePrice * inputs.downPaymentPct) / 100)
      : inputs.downPaymentDollar;

  const hasPMI = result.ltvPct >= 80;
  const creditLabel =
    CREDIT_BAND_LABELS[inputs.creditBand] ?? inputs.creditBand;

  return (
    <TooltipProvider delayDuration={300}>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              PMI Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Estimate your Private Mortgage Insurance cost based on your
              down payment, credit score, and loan details.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Home Price */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="home-price" className="text-sm font-medium">
                      Home Price
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.homePrice)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="home-price"
                      min={50000}
                      max={2000000}
                      step={5000}
                      value={[inputs.homePrice]}
                      onValueChange={([v]) =>
                        setInputs((p) => {
                          const newDownDollar = p.downPaymentMode === "dollar"
                            ? Math.min(p.downPaymentDollar, v)
                            : r2((v * p.downPaymentPct) / 100);
                          return { ...p, homePrice: v, downPaymentDollar: newDownDollar };
                        })
                      }
                      aria-label="Home price"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$50,000</span>
                      <span>$2,000,000</span>
                    </div>
                    <Input
                      type="number"
                      min={50000}
                      max={2000000}
                      step={5000}
                      value={inputs.homePrice}
                      onChange={(e) => handleInputChange("homePrice", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Down Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="down-payment" className="text-sm font-medium">
                        Down Payment
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          PMI is typically required when your down payment is
                          less than 20% of the home price. Toggle between
                          percentage and dollar amount.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.downPaymentMode === "pct"
                        ? `${inputs.downPaymentPct}% (${formatCurrency(downPayment)})`
                        : `${formatCurrency(downPayment)} (${inputs.downPaymentPct}%)`}
                    </span>
                  </div>
                  <div className="no-print">
                    {inputs.downPaymentMode === "pct" ? (
                      <>
                        <Slider
                          id="down-payment"
                          min={0}
                          max={100}
                          step={1}
                          value={[inputs.downPaymentPct]}
                          onValueChange={([v]) => handleDownPctChange(v)}
                          aria-label="Down payment percentage"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>100%</span>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={inputs.downPaymentPct}
                          onChange={(e) => {
                            const n = parseFloat(e.target.value);
                            if (!isNaN(n)) handleDownPctChange(n);
                          }}
                          className="mt-1"
                        />
                      </>
                    ) : (
                      <>
                        <Slider
                          id="down-payment"
                          min={0}
                          max={500000}
                          step={1000}
                          value={[inputs.downPaymentDollar]}
                          onValueChange={([v]) => handleDownDollarChange(v)}
                          aria-label="Down payment dollar amount"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>$0</span>
                          <span>$500,000</span>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={500000}
                          step={1000}
                          value={inputs.downPaymentDollar}
                          onChange={(e) => {
                            const n = parseFloat(e.target.value);
                            if (!isNaN(n)) handleDownDollarChange(n);
                          }}
                          className="mt-1"
                        />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleDownModeToggle}
                      className="inline-flex items-center gap-1 text-xs text-ember hover:text-ember-hover transition-colors mt-1 cursor-pointer"
                    >
                      Switch to{" "}
                      {inputs.downPaymentMode === "pct" ? "dollar amount" : "percentage"}
                    </button>
                  </div>
                </div>

                {/* Mortgage APR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="apr" className="text-sm font-medium">
                        Mortgage APR
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          The annual percentage rate on your mortgage. Used to
                          build the amortization schedule and determine when
                          LTV drops below 80% and 78%.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.apr}%
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="apr"
                      min={0}
                      max={15}
                      step={0.125}
                      value={[inputs.apr]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, apr: r2(v) }))
                      }
                      aria-label="Mortgage APR"
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
                      step={0.125}
                      value={inputs.apr}
                      onChange={(e) => handleInputChange("apr", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Loan Term */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="term" className="text-sm font-medium">
                      Loan Term
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.termYears} years
                    </span>
                  </div>
                  <div className="no-print flex gap-2">
                    <Button
                      type="button"
                      variant={inputs.termYears === 15 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInputs((p) => ({ ...p, termYears: 15 }))}
                      className="flex-1"
                    >
                      15 years
                    </Button>
                    <Button
                      type="button"
                      variant={inputs.termYears === 30 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setInputs((p) => ({ ...p, termYears: 30 }))}
                      className="flex-1"
                    >
                      30 years
                    </Button>
                  </div>
                </div>

                {/* Credit Score Band */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="credit-band" className="text-sm font-medium">
                      Credit Score Band
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Higher credit scores generally qualify for lower PMI
                        rates. These are mid-range estimates.
                      </TooltipContent>
                    </Tooltip>
                    </div>
                  <div className="no-print">
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(CREDIT_BAND_LABELS) as CreditBand[]).map(
                        (band) => (
                          <Button
                            key={band}
                            type="button"
                            variant={inputs.creditBand === band ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setInputs((p) => ({ ...p, creditBand: band }))
                            }
                            className="text-xs w-full"
                          >
                            {CREDIT_BAND_LABELS[band]}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* FHA Comparison Toggle */}
                <div className="flex items-center gap-2 no-print">
                  <Checkbox
                    id="fha-toggle"
                    checked={inputs.showFHA}
                    onCheckedChange={(checked) =>
                      setInputs((p) => ({ ...p, showFHA: !!checked }))
                    }
                  />
                  <Label
                    htmlFor="fha-toggle"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Show FHA MIP comparison
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Compare conventional PMI with FHA Mortgage Insurance
                      Premium (MIP). FHA loans require both an upfront and
                      annual MIP.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {hasPMI ? (
                  <>
                    {/* Monthly PMI Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-4 text-center">
                      <p className="text-xs font-medium text-muted-foreground">
                        Estimated Monthly PMI
                      </p>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-ember">
                        {formatCurrency(result.monthlyPMI)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.pmiAnnualRate !== null
                          ? `at ${result.pmiAnnualRate}% annual rate`
                          : "rate varies at this LTV level"}
                      </p>
                    </div>

                    {/* Rate note */}
                    {result.rateNote && (
                      <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 p-3 text-xs text-yellow-800 dark:text-yellow-200">
                        {result.rateNote}
                      </div>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Current LTV"
                        value={`${result.ltvPct.toFixed(2)}%`}
                        subtext={`${formatCurrency(result.loanAmount)} loan / ${formatCurrency(inputs.homePrice)} home`}
                      />
                      <ResultCard
                        label="Estimated PMI Rate"
                        value={
                          result.pmiAnnualRate !== null
                            ? `${result.pmiAnnualRate}%`
                            : "Varies"
                        }
                        subtext="annual rate of loan amount"
                      />
                      <ResultCard
                        label="Monthly PMI Cost"
                        value={formatCurrency(result.monthlyPMI)}
                        subtext="added to your mortgage"
                      />
                      <ResultCard
                        label="Annual PMI Cost"
                        value={formatCurrency(result.annualPMI)}
                        subtext="per year"
                      />
                    </div>

                    {/* LTV Drop-off Section */}
                    <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                      <p className="font-semibold text-sm">PMI Removal Timeline</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-md border bg-card p-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            80% LTV (Borrower-Request)
                          </p>
                          <p className="mt-0.5 text-base font-bold tracking-tight">
                            {result.month80LTV !== null
                              ? `Month ${result.month80LTV}`
                              : "Not reached"}
                          </p>
                          {result.date80LTV && (
                            <p className="text-[11px] text-muted-foreground">
                              {result.date80LTV}
                            </p>
                          )}
                        </div>
                        <div className="rounded-md border bg-card p-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            78% LTV (Auto-Termination)
                          </p>
                          <p className="mt-0.5 text-base font-bold tracking-tight">
                            {result.month78LTV !== null
                              ? `Month ${result.month78LTV}`
                              : "Not reached"}
                          </p>
                          {result.date78LTV && (
                            <p className="text-[11px] text-muted-foreground">
                              {result.date78LTV}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-md border border-ember/20 bg-ember/5 p-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Total PMI Paid Until 78% LTV
                        </p>
                        <p className="text-lg font-bold text-ember">
                          {formatCurrency(result.totalPMITo78)}
                        </p>
                        {result.month78LTV !== null && (
                          <p className="text-[11px] text-muted-foreground">
                            Over {result.month78LTV} months ({result.month78LTV > 12 ? `${Math.floor(result.month78LTV / 12)} yr${result.month78LTV > 24 ? "s" : ""} ${result.month78LTV % 12} mo` : `${result.month78LTV} months`})
                          </p>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground">
                        The 80% LTV borrower-request removal requires a good
                        payment history and that the home value has not
                        declined. The 78% LTV automatic termination is
                        required by federal law once the scheduled balance
                        reaches that threshold.
                      </p>
                    </div>

                    {/* FHA Comparison */}
                    {inputs.showFHA && (
                      <Card className="border-dashed">
                        <CardHeader className="pb-3 pt-4 px-4">
                          <CardTitle className="text-base">
                            FHA MIP Comparison
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <ResultCard
                              label="FHA Upfront MIP"
                              value={formatCurrency(result.fhaUpfrontMIP)}
                              subtext="1.75% of loan amount"
                            />
                            <ResultCard
                              label="FHA Annual MIP Rate"
                              value={`${result.fhaAnnualMIPRate}%`}
                              subtext={`${inputs.termYears}yr, LTV ${result.ltvPct > 90 ? ">" : "<="}90%`}
                            />
                            <ResultCard
                              label="FHA Monthly MIP"
                              value={formatCurrency(result.fhaMonthlyMIP)}
                              subtext="added to monthly payment"
                            />
                            <ResultCard
                              label="FHA Annual MIP"
                              value={formatCurrency(result.fhaAnnualMIP)}
                              subtext="per year"
                            />
                          </div>

                          <div className="rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800 p-3 text-xs text-yellow-800 dark:text-yellow-200">
                            {result.fhaNote}
                          </div>

                          <div className="rounded-md border bg-card p-3 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Side-by-Side Total Cost
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[11px] text-muted-foreground">
                                  Conventional PMI (to 78% LTV)
                                </p>
                                <p className="text-base font-bold">
                                  {formatCurrency(result.totalPMITo78)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] text-muted-foreground">
                                  FHA MIP (full loan term)
                                </p>
                                <p className="text-base font-bold text-destructive">
                                  {formatCurrency(result.fhaTotalMIP)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                      <ShareButtons
                        summaryText={`$${(inputs.homePrice / 1000).toFixed(0)}K home, ${inputs.downPaymentPct}% down, ${creditLabel.split(" ")[0]} credit = ${formatCurrency(result.monthlyPMI)}/mo PMI. Calculate yours:`}
                      />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      PMI rates are estimates and vary by insurer and lender.
                      Contact your lender for exact pricing.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    {inputs.homePrice > 0 && inputs.ltvPct !== undefined
                      ? "Your down payment is 20% or more, so no PMI is required."
                      : "Enter valid home details to see PMI estimates."}
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