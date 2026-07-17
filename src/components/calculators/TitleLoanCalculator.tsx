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
  calculateLoan,
  formatCurrency,
  formatPercent,
  type LoanInputs,
  type AmortizationRow,
} from "@/lib/loan-math";

/* ─── Types ─── */

interface TitleLoanInputs extends LoanInputs {
  vehicleValue: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: TitleLoanInputs = {
  vehicleValue: 10000,
  loanAmount: 5000,
  apr: 120,
  termMonths: 12,
};

/* Pre-compute default result at module level — available during SSR */
export const DEFAULT_RESULT = calculateLoan({
  loanAmount: DEFAULT_INPUTS.loanAmount,
  apr: DEFAULT_INPUTS.apr,
  termMonths: DEFAULT_INPUTS.termMonths,
});

/* ─── Component ─── */

export function TitleLoanCalculator() {
  // Read URL params in initializer — SSR gets DEFAULT_INPUTS, client reads query string.
  // This avoids useSearchParams (which forces a Suspense boundary) and avoids
  // calling setState in an useEffect (which the React compiler forbids).
  const [inputs, setInputs] = useState<TitleLoanInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const v = params.get("vehicle");
    const a = params.get("amount");
    const r = params.get("rate");
    const t = params.get("term");
    if (!v && !a && !r && !t) return DEFAULT_INPUTS;
    return {
      vehicleValue: v ? parseFloat(v) : DEFAULT_INPUTS.vehicleValue,
      loanAmount: a ? parseFloat(a) : DEFAULT_INPUTS.loanAmount,
      apr: r ? parseFloat(r) : DEFAULT_INPUTS.apr,
      termMonths: t ? parseInt(t, 10) : DEFAULT_INPUTS.termMonths,
    };
  });
  const [copied, setCopied] = useState(false);
  // Amortization starts expanded so it appears in static HTML for crawlers
  const [showAmortization, setShowAmortization] = useState(true);

  const result = useMemo(
    () =>
      calculateLoan({
        loanAmount: inputs.loanAmount,
        apr: inputs.apr,
        termMonths: inputs.termMonths,
      }),
    [inputs]
  );

  // Sync URL query string when inputs change (skip initial render to avoid
  // overwriting a clean URL with default params on first load).
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("vehicle", inputs.vehicleValue.toString());
    params.set("amount", inputs.loanAmount.toString());
    params.set("rate", inputs.apr.toString());
    params.set("term", inputs.termMonths.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [inputs]);

  const handleInputChange = useCallback(
    (field: keyof TitleLoanInputs, value: string) => {
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

  const ltvPercent =
    inputs.vehicleValue > 0
      ? ((inputs.loanAmount / inputs.vehicleValue) * 100).toFixed(0)
      : "0";

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calculator className="size-5 text-ember" />
              Title Loan Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your loan details to estimate monthly payments, total interest, and view the full amortization schedule.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Vehicle Value */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vehicle-value" className="text-sm font-medium">
                      Vehicle Value
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.vehicleValue)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="vehicle-value"
                      min={1000}
                      max={100000}
                      step={500}
                      value={[inputs.vehicleValue]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, vehicleValue: v }))
                      }
                      aria-label="Vehicle value"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$1,000</span>
                      <span>$100,000</span>
                    </div>
                    <Input
                      type="number"
                      min={1000}
                      max={100000}
                      step={100}
                      value={inputs.vehicleValue}
                      onChange={(e) =>
                        handleInputChange("vehicleValue", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Vehicle value input"
                    />
                  </div>
                </div>

                {/* Loan Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="loan-amount" className="text-sm font-medium">
                        Loan Amount
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                          Title lenders typically offer 25&ndash;50% of your
                          vehicle&apos;s appraised value. Your current LTV is{" "}
                          <strong>{ltvPercent}%</strong>.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inputs.loanAmount)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="loan-amount"
                      min={100}
                      max={inputs.vehicleValue}
                      step={100}
                      value={[inputs.loanAmount]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, loanAmount: v }))
                      }
                      aria-label="Loan amount"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$100</span>
                      <span>{formatCurrency(inputs.vehicleValue)}</span>
                    </div>
                    <Input
                      type="number"
                      min={100}
                      max={inputs.vehicleValue}
                      step={100}
                      value={inputs.loanAmount}
                      onChange={(e) =>
                        handleInputChange("loanAmount", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Loan amount input"
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="annual-rate" className="text-sm font-medium">
                        Annual Interest Rate (APR)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[260px] text-xs">
                          Title loan APRs are typically 100&ndash;300%. A 120%
                          APR equals 10% monthly interest. Check your loan
                          agreement for the exact rate.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPercent(inputs.apr)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Slider
                      id="annual-rate"
                      min={1}
                      max={400}
                      step={0.5}
                      value={[inputs.apr]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, apr: v }))
                      }
                      aria-label="Annual interest rate"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1%</span>
                      <span>400%</span>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={400}
                      step={0.5}
                      value={inputs.apr}
                      onChange={(e) =>
                        handleInputChange("apr", e.target.value)
                      }
                      className="mt-1"
                      aria-label="Annual interest rate input"
                    />
                  </div>
                </div>

                {/* Loan Term */}
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
                      max={48}
                      step={1}
                      value={[inputs.termMonths]}
                      onValueChange={([v]) =>
                        setInputs((p) => ({ ...p, termMonths: v }))
                      }
                      aria-label="Loan term in months"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 mo</span>
                      <span>48 mo</span>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      max={48}
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
                        for {inputs.termMonths} month{inputs.termMonths !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Total Interest"
                        value={formatCurrency(result.totalInterest)}
                        subtext={`${formatPercent(
                          (result.totalInterest / result.totalCost) * 100
                        )} of total cost`}
                      />
                      <ResultCard
                        label="Total Cost"
                        value={formatCurrency(result.totalCost)}
                        subtext="Principal + interest"
                      />
                      <ResultCard
                        label="Finance Charge"
                        value={formatCurrency(result.totalInterest)}
                        subtext="Cost to borrow"
                      />
                      <ResultCard
                        label="Loan-to-Value"
                        value={`${ltvPercent}%`}
                        subtext={`${formatCurrency(inputs.loanAmount)} / ${formatCurrency(inputs.vehicleValue)}`}
                      />
                    </div>

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
        {result.schedule.length > 0 && (
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
                    {result.schedule.map((row) => (
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
              <div className="mt-3 flex justify-end gap-6 text-sm font-medium">
                <span>
                  Total Paid:{" "}
                  <span className="text-ember">
                    {formatCurrency(result.totalCost)}
                  </span>
                </span>
                <span>
                  Total Interest:{" "}
                  <span className="text-destructive">
                    {formatCurrency(result.totalInterest)}
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
      <span>CalcForge — thecalcforge.com</span>
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