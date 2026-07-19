"use client";

import { useState, useCallback, useMemo, useRef } from "react";
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
import { formatCurrency } from "@/lib/loan-math";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

type DownPaymentMode = "pct" | "dollar";
type ClosingCostMode = "pct" | "dollar";

interface DownPaymentInputs {
  homePrice: number;
  downPaymentPct: number;
  downPaymentDollar: number;
  downPaymentMode: DownPaymentMode;
  closingCostPct: number;
  closingCostDollar: number;
  closingCostMode: ClosingCostMode;
}

interface LoanPreset {
  label: string;
  downPct: number;
  note: string;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: DownPaymentInputs = {
  homePrice: 400000,
  downPaymentPct: 20,
  downPaymentDollar: 80000,
  downPaymentMode: "pct",
  closingCostPct: 3,
  closingCostDollar: 12000,
  closingCostMode: "pct",
};

const LOAN_PRESETS: LoanPreset[] = [
  { label: "VA / USDA", downPct: 0, note: "0% down (eligible borrowers)" },
  { label: "Conventional 3%", downPct: 3, note: "Minimum conventional" },
  { label: "FHA 3.5%", downPct: 3.5, note: "FHA minimum down" },
  { label: "Conventional 5%", downPct: 5, note: "Common conventional" },
  { label: "20% (No PMI)", downPct: 20, note: "Avoids PMI" },
];

/* ─── Helper ─── */

function fmt(n: number): string {
  return formatCurrency(n);
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ─── Component ─── */

export default function DownPaymentCalculator() {
  const [inputs, setInputs] = useState<DownPaymentInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const p = (key: string, fallback: number): number => {
      const v = params.get(key);
      return v ? parseFloat(v) : fallback;
    };
    const dpMode = params.get("dpMode") as DownPaymentMode | null;
    const ccMode = params.get("ccMode") as ClosingCostMode | null;
    if (!params.get("home") && !params.get("dpPct")) return DEFAULT_INPUTS;
    return {
      homePrice: p("home", DEFAULT_INPUTS.homePrice),
      downPaymentPct: p("dpPct", DEFAULT_INPUTS.downPaymentPct),
      downPaymentDollar: p("dpDollar", DEFAULT_INPUTS.downPaymentDollar),
      downPaymentMode:
        dpMode && ["pct", "dollar"].includes(dpMode)
          ? dpMode
          : DEFAULT_INPUTS.downPaymentMode,
      closingCostPct: p("ccPct", DEFAULT_INPUTS.closingCostPct),
      closingCostDollar: p("ccDollar", DEFAULT_INPUTS.closingCostDollar),
      closingCostMode:
        ccMode && ["pct", "dollar"].includes(ccMode)
          ? ccMode
          : DEFAULT_INPUTS.closingCostMode,
    };
  });
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── Update a single input ─── */
  const update = useCallback(
    (key: keyof DownPaymentInputs, value: number | string) => {
      setInputs((prev) => {
        const next = { ...prev, [key]: value };

        // Sync down payment: changing pct updates dollar and vice versa
        if (key === "downPaymentPct") {
          next.downPaymentDollar = r2((prev.homePrice * (value as number)) / 100);
        }
        if (key === "downPaymentDollar") {
          next.downPaymentPct =
            prev.homePrice > 0 ? r2(((value as number) / prev.homePrice) * 100) : 0;
        }

        // Sync closing costs: changing pct updates dollar and vice versa
        if (key === "closingCostPct") {
          next.closingCostDollar = r2((prev.homePrice * (value as number)) / 100);
        }
        if (key === "closingCostDollar") {
          next.closingCostPct =
            prev.homePrice > 0 ? r2(((value as number) / prev.homePrice) * 100) : 0;
        }

        // If home price changes, recalculate dollar values
        if (key === "homePrice") {
          next.downPaymentDollar = r2(
            (next.downPaymentPct * (value as number)) / 100,
          );
          next.closingCostDollar = r2(
            (next.closingCostPct * (value as number)) / 100,
          );
        }

        return next;
      });
    },
    [],
  );

  /* ─── Apply a loan-program preset ─── */
  const applyPreset = useCallback(
    (downPct: number) => {
      setInputs((prev) => ({
        ...prev,
        downPaymentPct: downPct,
        downPaymentDollar: r2((prev.homePrice * downPct) / 100),
        downPaymentMode: "pct",
      }));
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
      home: String(inputs.homePrice),
      dpPct: String(inputs.downPaymentPct),
      dpDollar: String(inputs.downPaymentDollar),
      dpMode: inputs.downPaymentMode,
      ccPct: String(inputs.closingCostPct),
      ccDollar: String(inputs.closingCostDollar),
      ccMode: inputs.closingCostMode,
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
      homePrice,
      downPaymentPct,
      downPaymentDollar,
      closingCostPct,
      closingCostDollar,
    } = inputs;

    const downPayment = r2(
      inputs.downPaymentMode === "pct"
        ? (homePrice * downPaymentPct) / 100
        : downPaymentDollar,
    );
    const loanAmount = r2(Math.max(0, homePrice - downPayment));
    const ltv = homePrice > 0 ? r2((loanAmount / homePrice) * 100) : 0;
    const pmiRequired = ltv > 80;

    const closingCost = r2(
      inputs.closingCostMode === "pct"
        ? (homePrice * closingCostPct) / 100
        : closingCostDollar,
    );
    const cashToClose = r2(downPayment + closingCost);

    // Preset comparison table
    const presetComparison = LOAN_PRESETS.map((preset) => {
      const dp = r2((homePrice * preset.downPct) / 100);
      const la = r2(homePrice - dp);
      const l = homePrice > 0 ? r2((la / homePrice) * 100) : 0;
      return {
        ...preset,
        downPayment: dp,
        loanAmount: la,
        ltv: l,
        pmiRequired: l > 80,
      };
    });

    return {
      downPayment,
      loanAmount,
      ltv,
      pmiRequired,
      closingCost,
      cashToClose,
      presetComparison,
    };
  }, [inputs]);

  /* ─── Share text ─── */
  const shareText = useMemo(() => {
    return `${results.downPayment.toFixed(1)}% down on a $${inputs.homePrice.toLocaleString()} home = ${fmt(results.downPayment)} down, ${fmt(results.loanAmount)} loan (${results.ltv}% LTV). Calculate yours:`;
  }, [results, inputs.homePrice]);

  return (
    <TooltipProvider>
      <div ref={containerRef}>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-ember" />
              Down Payment Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ── Home Price ── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="homePrice" className="text-sm">
                  Home Price
                </Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {fmt(inputs.homePrice)}
                  </span>
                </div>
              </div>
              <Slider
                id="homePrice"
                min={50000}
                max={2000000}
                step={5000}
                value={[inputs.homePrice]}
                onValueChange={([v]) => update("homePrice", v)}
                aria-label="Home price"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$50K</span>
                <span>$2M</span>
              </div>
            </div>

            {/* ── Down Payment ── */}
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Down Payment</Label>
                <div className="flex gap-1">
                  <Button
                    variant={inputs.downPaymentMode === "pct" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    onClick={() => update("downPaymentMode", "pct")}
                  >
                    %
                  </Button>
                  <Button
                    variant={inputs.downPaymentMode === "dollar" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    onClick={() => update("downPaymentMode", "dollar")}
                  >
                    $
                  </Button>
                </div>
              </div>

              {inputs.downPaymentMode === "pct" ? (
                <div className="space-y-2">
                  <Slider
                    id="downPaymentPct"
                    min={0}
                    max={50}
                    step={0.5}
                    value={[inputs.downPaymentPct]}
                    onValueChange={([v]) => update("downPaymentPct", v)}
                    aria-label="Down payment percentage"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={inputs.downPaymentPct}
                      onChange={(e) =>
                        update(
                          "downPaymentPct",
                          Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                        )
                      }
                      className="w-24 h-8 text-sm text-right"
                      aria-label="Down payment percentage input"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    <span className="text-sm text-muted-foreground">
                      = {fmt(results.downPayment)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Slider
                    id="downPaymentDollar"
                    min={0}
                    max={inputs.homePrice}
                    step={1000}
                    value={[Math.min(inputs.downPaymentDollar, inputs.homePrice)]}
                    onValueChange={([v]) => update("downPaymentDollar", v)}
                    aria-label="Down payment dollar amount"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>{fmt(inputs.homePrice)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min={0}
                      max={inputs.homePrice}
                      step={1000}
                      value={inputs.downPaymentDollar}
                      onChange={(e) =>
                        update(
                          "downPaymentDollar",
                          Math.max(0, Number(e.target.value) || 0),
                        )
                      }
                      className="w-32 h-8 text-sm text-right"
                      aria-label="Down payment dollar input"
                    />
                    <span className="text-sm text-muted-foreground">
                      = {inputs.homePrice > 0
                        ? `${((inputs.downPaymentDollar / inputs.homePrice) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              )}

              {/* Loan-Program Presets */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Quick presets by loan program:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {LOAN_PRESETS.map((preset) => (
                    <Tooltip key={preset.label}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            Math.abs(inputs.downPaymentPct - preset.downPct) < 0.01
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => applyPreset(preset.downPct)}
                        >
                          {preset.label}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        {preset.note}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Closing Costs ── */}
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm font-semibold">Estimated Closing Costs</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      Closing costs typically range from 2% to 5% of the home price
                      and include lender fees, title insurance, appraisal,
                      escrow deposits, and prepaid items. Enter your estimate here
                      to see total cash needed at closing.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant={inputs.closingCostMode === "pct" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    onClick={() => update("closingCostMode", "pct")}
                  >
                    %
                  </Button>
                  <Button
                    variant={inputs.closingCostMode === "dollar" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    onClick={() => update("closingCostMode", "dollar")}
                  >
                    $
                  </Button>
                </div>
              </div>

              {inputs.closingCostMode === "pct" ? (
                <div className="space-y-2">
                  <Slider
                    id="closingCostPct"
                    min={0}
                    max={8}
                    step={0.25}
                    value={[inputs.closingCostPct]}
                    onValueChange={([v]) => update("closingCostPct", v)}
                    aria-label="Closing costs percentage"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>8%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      step={0.25}
                      value={inputs.closingCostPct}
                      onChange={(e) =>
                        update(
                          "closingCostPct",
                          Math.max(0, Math.min(20, Number(e.target.value) || 0)),
                        )
                      }
                      className="w-24 h-8 text-sm text-right"
                      aria-label="Closing costs percentage input"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    <span className="text-sm text-muted-foreground">
                      = {fmt(results.closingCost)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Slider
                    id="closingCostDollar"
                    min={0}
                    max={100000}
                    step={500}
                    value={[Math.min(inputs.closingCostDollar, 100000)]}
                    onValueChange={([v]) => update("closingCostDollar", v)}
                    aria-label="Closing costs dollar amount"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$100K</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min={0}
                      max={500000}
                      step={500}
                      value={inputs.closingCostDollar}
                      onChange={(e) =>
                        update(
                          "closingCostDollar",
                          Math.max(0, Number(e.target.value) || 0),
                        )
                      }
                      className="w-32 h-8 text-sm text-right"
                      aria-label="Closing costs dollar input"
                    />
                    <span className="text-sm text-muted-foreground">
                      = {inputs.homePrice > 0
                        ? `${((inputs.closingCostDollar / inputs.homePrice) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Results ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Results for {fmt(inputs.homePrice)} Home
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">
                    Down Payment
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {fmt(results.downPayment)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {inputs.downPaymentPct.toFixed(1)}% of home price
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">
                    Loan Amount
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {fmt(results.loanAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {results.ltv.toFixed(1)}% LTV
                  </p>
                </div>
              </div>

              {/* PMI Trigger Warning */}
              {results.pmiRequired && (
                <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    PMI Required
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                    Your loan-to-value ratio is {results.ltv.toFixed(1)}%, which
                    exceeds the 80% threshold. Conventional lenders will require
                    private mortgage insurance. You need at least 20% down
                    ({fmt(r2(inputs.homePrice * 0.2))}) to avoid PMI. Use the{" "}
                    <a
                      href="/home-buying/pmi-calculator"
                      className="underline underline-offset-2 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PMI Calculator
                    </a>{" "}
                    to estimate the monthly cost.
                  </p>
                </div>
              )}

              {!results.pmiRequired && results.downPayment > 0 && (
                <div className="rounded-md border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-3">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                    No PMI Required
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                    Your down payment of {inputs.downPaymentPct.toFixed(1)}% puts
                    your LTV at {results.ltv.toFixed(1)}%, which meets or exceeds
                    the 20% equity threshold. Conventional lenders will not require
                    private mortgage insurance.
                  </p>
                </div>
              )}

              {/* Closing Costs & Cash to Close */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/40 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Estimated Closing Costs
                  </p>
                  <p className="text-lg font-bold">{fmt(results.closingCost)}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Total Cash to Close
                  </p>
                  <p className="text-lg font-bold text-ember">
                    {fmt(results.cashToClose)}
                  </p>
                </div>
              </div>

              {/* Preset Comparison Table */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Compare Down Payments by Loan Program
                </p>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          Program
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Down Payment
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Loan Amount
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          LTV
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                          PMI
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.presetComparison.map((row) => (
                        <tr
                          key={row.label}
                          className={
                            Math.abs(inputs.downPaymentPct - row.downPct) < 0.01
                              ? "bg-ember/5 border-b last:border-b-0"
                              : "border-b last:border-b-0"
                          }
                        >
                          <td className="px-3 py-2 text-xs font-medium">
                            {row.label}
                          </td>
                          <td className="px-3 py-2 text-xs text-right">
                            {fmt(row.downPayment)}
                          </td>
                          <td className="px-3 py-2 text-xs text-right">
                            {fmt(row.loanAmount)}
                          </td>
                          <td className="px-3 py-2 text-xs text-right">
                            {row.ltv.toFixed(1)}%
                          </td>
                          <td className="px-3 py-2 text-xs text-center">
                            {row.pmiRequired ? (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                Required
                              </span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                None
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

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