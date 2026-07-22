"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw,
  ChevronDown, Info, AlertTriangle, CalendarDays,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  calculateAmortization,
  compareAmortization,
  formatCurrency,
  formatPercent,
  formatMonthYear,
  formatYearsMonths,
} from "@/lib/amortization-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

interface AmortInputs {
  loanAmount: number;
  apr: number;
  termYears: number;
  startMonth: number; // 0-indexed month of year
  startYear: number;
  extraMonthly: number;
  extraAnnual: number;
  oneTimeAmount: number;
  oneTimeMonth: number;
}

/* ─── Defaults ─── */

// SSR-safe neutral default (January 2025). The real current month/year is applied
// client-side in the useState initializer (where window is available) so the
// prerendered HTML does not freeze the build date as the default loan start date.
export const DEFAULT_INPUTS: AmortInputs = {
  loanAmount: 250000,
  apr: 6.5,
  termYears: 30,
  startMonth: 0,
  startYear: 2025,
  extraMonthly: 0,
  extraAnnual: 0,
  oneTimeAmount: 0,
  oneTimeMonth: 1,
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ─── Component ─── */

export default function AmortizationScheduleCalculator() {
  const [inputs, setInputs] = useState<AmortInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    // On the client, default startMonth/startYear to the real current month/year
    // (not the SSR neutral default) so the schedule starts from today.
    const now = new Date();
    const clientDefault = { ...DEFAULT_INPUTS, startMonth: now.getMonth(), startYear: now.getFullYear() };
    const params = new URLSearchParams(window.location.search);
    const loanAmount = params.get("amount");
    const apr = params.get("rate");
    const termYears = params.get("term");
    const extraMonthly = params.get("extra");
    const extraAnnual = params.get("annual");
    const oneTimeAmount = params.get("onetime");
    const oneTimeMonth = params.get("lumpmonth");
    const startMonth = params.get("startmonth");
    const startYear = params.get("startyear");
    if (
      !loanAmount && !apr && !termYears && !extraMonthly &&
      !extraAnnual && !oneTimeAmount
    ) {
      return clientDefault;
    }
    return {
      loanAmount: loanAmount ? parseFloat(loanAmount) : clientDefault.loanAmount,
      apr: apr ? parseFloat(apr) : clientDefault.apr,
      termYears: termYears ? parseFloat(termYears) : clientDefault.termYears,
      startMonth: startMonth ? parseInt(startMonth, 10) : clientDefault.startMonth,
      startYear: startYear ? parseInt(startYear, 10) : clientDefault.startYear,
      extraMonthly: extraMonthly ? parseFloat(extraMonthly) : clientDefault.extraMonthly,
      extraAnnual: extraAnnual ? parseFloat(extraAnnual) : clientDefault.extraAnnual,
      oneTimeAmount: oneTimeAmount ? parseFloat(oneTimeAmount) : clientDefault.oneTimeAmount,
      oneTimeMonth: oneTimeMonth ? parseInt(oneTimeMonth, 10) : clientDefault.oneTimeMonth,
    };
  });
  const [copied, setCopied] = useState(false);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([1]));

  const startDate = useMemo(
    () => new Date(inputs.startYear, inputs.startMonth, 1),
    [inputs.startYear, inputs.startMonth],
  );

  const comparison = useMemo(
    () => compareAmortization(inputs, startDate),
    [inputs, startDate],
  );

  const { baseline, withExtras, monthsSaved, interestSaved } = comparison;

  const hasExtras =
    inputs.extraMonthly > 0 ||
    inputs.extraAnnual > 0 ||
    inputs.oneTimeAmount > 0;

  // Sync URL query string when inputs change (skip initial render)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("amount", inputs.loanAmount.toString());
    params.set("rate", inputs.apr.toString());
    params.set("term", inputs.termYears.toString());
    params.set("startmonth", inputs.startMonth.toString());
    params.set("startyear", inputs.startYear.toString());
    params.set("extra", inputs.extraMonthly.toString());
    params.set("annual", inputs.extraAnnual.toString());
    params.set("onetime", inputs.oneTimeAmount.toString());
    params.set("lumpmonth", inputs.oneTimeMonth.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [inputs]);

  const handleNumberChange = useCallback(
    (field: keyof AmortInputs, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setInputs((prev) => ({ ...prev, [field]: num }));
      }
    },
    [],
  );

  const handleIntChange = useCallback(
    (field: keyof AmortInputs, value: string) => {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        setInputs((prev) => ({ ...prev, [field]: num }));
      }
    },
    [],
  );

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setExpandedYears(new Set([1]));
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
    // Expand all years for printing
    setExpandedYears(new Set(withExtras.years.map((y) => y.year)));
    // Give React a tick to render before printing
    setTimeout(() => window.print(), 100);
  }, [withExtras.years]);

  const toggleYear = useCallback((year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  }, []);

  const expandAllYears = useCallback(() => {
    setExpandedYears(new Set(withExtras.years.map((y) => y.year)));
  }, [withExtras.years]);

  const collapseAllYears = useCallback(() => {
    setExpandedYears(new Set());
  }, []);

  const summaryText = `${formatCurrency(inputs.loanAmount)} at ${formatPercent(inputs.apr)} for ${inputs.termYears} years: ${formatCurrency(withExtras.monthlyPayment)}/mo, ${formatCurrency(withExtras.totalInterest)} total interest. Calculate yours:`;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside no-print">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              Amortization Schedule Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              See every payment&apos;s interest and principal split, with optional
              extra monthly, annual, and one-time payments.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Loan Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loanAmount" className="text-sm font-medium">
                      Loan Amount
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.loanAmount)}
                    </span>
                  </div>
                  <Slider
                    id="loanAmount"
                    min={5000}
                    max={1000000}
                    step={5000}
                    value={[inputs.loanAmount]}
                    onValueChange={([v]) =>
                      setInputs((p) => ({ ...p, loanAmount: v }))
                    }
                    aria-label="Loan amount"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(5000)}</span>
                    <span>{formatCurrency(1000000)}</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={inputs.loanAmount}
                    onChange={(e) =>
                      handleNumberChange("loanAmount", e.target.value)
                    }
                    className="mt-1"
                    aria-label="Loan amount input"
                  />
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="apr" className="text-sm font-medium">
                      Interest Rate (APR)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPercent(inputs.apr)}
                    </span>
                  </div>
                  <Slider
                    id="apr"
                    min={0}
                    max={15}
                    step={0.05}
                    value={[inputs.apr]}
                    onValueChange={([v]) =>
                      setInputs((p) => ({ ...p, apr: v }))
                    }
                    aria-label="Interest rate"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>15%</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    step={0.05}
                    value={inputs.apr}
                    onChange={(e) => handleNumberChange("apr", e.target.value)}
                    className="mt-1"
                    aria-label="Interest rate input"
                  />
                </div>

                {/* Term */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="termYears" className="text-sm font-medium">
                      Term (Years)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.termYears} years
                    </span>
                  </div>
                  <Slider
                    id="termYears"
                    min={1}
                    max={40}
                    step={1}
                    value={[inputs.termYears]}
                    onValueChange={([v]) =>
                      setInputs((p) => ({ ...p, termYears: v }))
                    }
                    aria-label="Loan term in years"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1 yr</span>
                    <span>40 yrs</span>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    step={1}
                    value={inputs.termYears}
                    onChange={(e) =>
                      handleNumberChange("termYears", e.target.value)
                    }
                    className="mt-1"
                    aria-label="Term in years input"
                  />
                </div>

                {/* Start Month / Year */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    First Payment Date
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={inputs.startMonth}
                      onChange={(e) =>
                        handleIntChange("startMonth", e.target.value)
                      }
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      aria-label="Start month"
                    >
                      {MONTH_NAMES.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min={1990}
                      max={2100}
                      step={1}
                      value={inputs.startYear}
                      onChange={(e) =>
                        handleIntChange("startYear", e.target.value)
                      }
                      aria-label="Start year input"
                    />
                  </div>
                </div>
              </div>

              {/* ─── Extra Payments ─── */}
              <div className="space-y-5">
                {/* Extra Monthly */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="extraMonthly" className="text-sm font-medium">
                        Extra Monthly Payment
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-xs">
                          Added to every monthly payment. Goes directly to
                          principal, reducing future interest.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.extraMonthly)}
                    </span>
                  </div>
                  <Slider
                    id="extraMonthly"
                    min={0}
                    max={2000}
                    step={25}
                    value={[inputs.extraMonthly]}
                    onValueChange={([v]) =>
                      setInputs((p) => ({ ...p, extraMonthly: v }))
                    }
                    aria-label="Extra monthly payment"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>{formatCurrency(2000)}</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    step={25}
                    value={inputs.extraMonthly}
                    onChange={(e) =>
                      handleNumberChange("extraMonthly", e.target.value)
                    }
                    className="mt-1"
                    aria-label="Extra monthly payment input"
                  />
                </div>

                {/* Extra Annual */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="extraAnnual" className="text-sm font-medium">
                        Extra Annual Payment
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-xs">
                          Applied once per year on every 12th month. Useful for
                          tax refunds, bonuses, or annual windfalls.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.extraAnnual)}
                    </span>
                  </div>
                  <Slider
                    id="extraAnnual"
                    min={0}
                    max={20000}
                    step={100}
                    value={[inputs.extraAnnual]}
                    onValueChange={([v]) =>
                      setInputs((p) => ({ ...p, extraAnnual: v }))
                    }
                    aria-label="Extra annual payment"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>{formatCurrency(20000)}</span>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    step={100}
                    value={inputs.extraAnnual}
                    onChange={(e) =>
                      handleNumberChange("extraAnnual", e.target.value)
                    }
                    className="mt-1"
                    aria-label="Extra annual payment input"
                  />
                </div>

                {/* One-Time Extra */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="oneTimeAmount" className="text-sm font-medium">
                        One-Time Extra Payment
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-xs">
                          A single lump-sum payment applied in the month you
                          specify below.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.oneTimeAmount)}
                    </span>
                  </div>
                  <Slider
                    id="oneTimeAmount"
                    min={0}
                    max={100000}
                    step={500}
                    value={[inputs.oneTimeAmount]}
                    onValueChange={([v]) =>
                      setInputs((p) => ({ ...p, oneTimeAmount: v }))
                    }
                    aria-label="One-time extra payment"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>{formatCurrency(100000)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min={0}
                      step={500}
                      value={inputs.oneTimeAmount}
                      onChange={(e) =>
                        handleNumberChange("oneTimeAmount", e.target.value)
                      }
                      aria-label="One-time payment amount"
                    />
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="oneTimeMonth" className="text-xs text-muted-foreground whitespace-nowrap">
                        Month #
                      </Label>
                      <Input
                        id="oneTimeMonth"
                        type="number"
                        min={1}
                        max={inputs.termYears * 12}
                        step={1}
                        value={inputs.oneTimeMonth}
                        onChange={(e) =>
                          handleIntChange("oneTimeMonth", e.target.value)
                        }
                        aria-label="One-time payment month number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Results ─── */}
            <div className="mt-6 space-y-4">
              {/* Monthly Payment Highlight */}
              <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Monthly Payment
                </p>
                <p className="text-4xl font-bold tracking-tight text-ember">
                  {formatCurrency(withExtras.monthlyPayment)}
                  {hasExtras && inputs.extraMonthly > 0 && (
                    <span className="text-base font-medium text-muted-foreground ml-2">
                      + {formatCurrency(inputs.extraMonthly)} extra
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {withExtras.payoffMonths > 0 && (
                    <>
                      {formatYearsMonths(withExtras.payoffMonths)} &bull;{" "}
                      payoff {withExtras.payoffDate ? formatMonthYear(withExtras.payoffDate) : ""}
                    </>
                  )}
                </p>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ResultCard
                  label="Total Interest"
                  value={formatCurrency(withExtras.totalInterest)}
                  subtext={`${formatPercent(
                    withExtras.totalPaid > 0
                      ? (withExtras.totalInterest / withExtras.totalPaid) * 100
                      : 0
                  )} of total paid`}
                />
                <ResultCard
                  label="Total Paid"
                  value={formatCurrency(withExtras.totalPaid)}
                  subtext={`${formatCurrency(inputs.loanAmount)} principal + interest`}
                />
                <ResultCard
                  label="Payoff Date"
                  value={withExtras.payoffDate ? formatMonthYear(withExtras.payoffDate) : "-"}
                  subtext={`${withExtras.payoffMonths} payments`}
                />
              </div>

              {/* Comparison Block */}
              {hasExtras && (
                <div className="rounded-lg border border-ember/30 bg-ember/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-ember">
                    Baseline vs With Extras
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Months Saved</p>
                      <p className="text-lg font-bold">
                        {monthsSaved > 0 ? `${monthsSaved} mo` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interest Saved</p>
                      <p className="text-lg font-bold text-ember">
                        {interestSaved > 0 ? formatCurrency(interestSaved) : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-ember/20">
                    <div>
                      <p className="text-xs text-muted-foreground">Baseline</p>
                      <p className="text-sm font-semibold">
                        {formatYearsMonths(baseline.payoffMonths)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(baseline.totalInterest)} interest
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">With Extras</p>
                      <p className="text-sm font-semibold">
                        {formatYearsMonths(withExtras.payoffMonths)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(withExtras.totalInterest)} interest
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
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
                    Print Schedule
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
                  summaryText={summaryText}
                  title="Amortization Schedule Calculator"
                />
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Fixed-rate amortization math only. Does not model adjustable-rate
                mortgages, closing costs, escrow impounds, or private mortgage
                insurance. For PMI, see the{" "}
                <a
                  href="/home-buying/pmi-calculator"
                  className="text-ember hover:text-ember-hover underline underline-offset-2"
                >
                  PMI Calculator
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ─── Full Amortization Schedule ─── */}
        {withExtras.schedule.length > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Full Amortization Schedule</span>
                <div className="flex gap-2 no-print">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={expandAllYears}
                    className="text-xs h-7"
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={collapseAllYears}
                    className="text-xs h-7"
                  >
                    Collapse All
                  </Button>
                </div>
              </CardTitle>
              <p className="text-xs text-muted-foreground no-print">
                {withExtras.years.length} years &bull; {withExtras.schedule.length} monthly payments.
                Click a year to expand its month-by-month breakdown.
              </p>
            </CardHeader>
            <CardContent>
              {/* Year Summary Table (always visible, the page's core feature) */}
              <div className="amortization-scroll overflow-x-auto rounded-md border mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Year</TableHead>
                      <TableHead className="text-right">Payments</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withExtras.years.map((y) => (
                      <Collapsible
                        key={y.year}
                        asChild
                        open={expandedYears.has(y.year)}
                        onOpenChange={() => toggleYear(y.year)}
                      >
                        <tr className="border-b last:border-0">
                          <td colSpan={5} className="p-0">
                            {/* Year Summary Row */}
                            <button
                              type="button"
                              className="w-full grid grid-cols-5 items-center px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left no-print"
                              aria-expanded={expandedYears.has(y.year)}
                            >
                              <span className="font-medium flex items-center gap-1.5">
                                {expandedYears.has(y.year) ? (
                                  <ChevronDown className="size-3.5 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="size-3.5 text-muted-foreground -rotate-90" />
                                )}
                                Year {y.year}
                              </span>
                              <span className="text-right">{formatCurrency(y.totalPaid)}</span>
                              <span className="text-right">{formatCurrency(y.principal)}</span>
                              <span className="text-right text-destructive">{formatCurrency(y.interest)}</span>
                              <span className="text-right font-medium">{formatCurrency(y.endingBalance)}</span>
                            </button>
                            {/* Print-only summary row */}
                            <div className="hidden print:grid grid-cols-5 px-4 py-2.5 text-sm">
                              <span className="font-medium">Year {y.year}</span>
                              <span className="text-right">{formatCurrency(y.totalPaid)}</span>
                              <span className="text-right">{formatCurrency(y.principal)}</span>
                              <span className="text-right">{formatCurrency(y.interest)}</span>
                              <span className="text-right font-medium">{formatCurrency(y.endingBalance)}</span>
                            </div>
                            <CollapsibleContent asChild>
                              <td colSpan={5} className="p-0">
                                <div className="bg-muted/20">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-20">Month</TableHead>
                                        <TableHead className="text-right">Payment</TableHead>
                                        <TableHead className="text-right">Extra</TableHead>
                                        <TableHead className="text-right">Interest</TableHead>
                                        <TableHead className="text-right">Principal</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {y.rows.map((row) => (
                                        <TableRow key={row.month} className="text-xs">
                                          <TableCell className="font-medium">
                                            {row.month}
                                            <span className="block text-[10px] text-muted-foreground">
                                              {formatMonthYear(row.date)}
                                            </span>
                                          </TableCell>
                                          <TableCell className="text-right">{formatCurrency(row.payment)}</TableCell>
                                          <TableCell className="text-right">
                                            {row.extra > 0 ? formatCurrency(row.extra) : "-"}
                                          </TableCell>
                                          <TableCell className="text-right text-destructive">{formatCurrency(row.interest)}</TableCell>
                                          <TableCell className="text-right">{formatCurrency(row.principal)}</TableCell>
                                          <TableCell className="text-right font-medium">{formatCurrency(row.balance)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </td>
                            </CollapsibleContent>
                          </td>
                        </tr>
                      </Collapsible>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="mt-3 flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm font-medium">
                <span>
                  Total Paid:{" "}
                  <span className="text-ember">
                    {formatCurrency(withExtras.totalPaid)}
                  </span>
                </span>
                <span>
                  Total Interest:{" "}
                  <span className="text-destructive">
                    {formatCurrency(withExtras.totalInterest)}
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        )}
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
