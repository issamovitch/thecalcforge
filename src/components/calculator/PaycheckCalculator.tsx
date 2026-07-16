"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  CalculatorInput,
  CalculatorResult,
  FilingStatus,
  PayFrequency,
  StateTaxConfig,
} from "@/types/calculator";
import {
  FILING_STATUS_LABELS,
  PAY_FREQUENCY_LABELS,
  PERIODS_PER_YEAR,
} from "@/types/calculator";
import { calculatePaycheck } from "@/lib/tax";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Calculator,
  Percent,
  DollarSign,
} from "lucide-react";

import { ResultsBreakdown } from "./ResultsBreakdown";
import { TaxVisualization } from "./TaxVisualization";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATE_LIST = [
  { slug: "california", name: "California" },
  { slug: "texas", name: "Texas" },
  { slug: "florida", name: "Florida" },
  { slug: "new-york", name: "New York" },
  { slug: "pennsylvania", name: "Pennsylvania" },
] as const;

const DEFAULT_GROSS_PAY = 75000;

const DEFAULT_CONFIG: StateTaxConfig = {
  slug: "texas",
  name: "Texas",
  abbreviation: "TX",
  year: 2026,
  meta: { title: "", description: "" },
  hasIncomeTax: false,
  faq: [],
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PaycheckCalculatorProps {
  stateSlug: string;
  stateName: string;
  stateConfig?: StateTaxConfig;
  showStateSelector?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaycheckCalculator({
  stateSlug,
  stateName,
  stateConfig,
  showStateSelector = false,
}: PaycheckCalculatorProps) {
  const router = useRouter();
  const config = stateConfig ?? DEFAULT_CONFIG;

  // ----- Income state -----
  const [grossPay, setGrossPay] = useState(DEFAULT_GROSS_PAY);
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("annual");
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");

  // ----- Deductions state -----
  const [k401Type, setK401Type] = useState<"percent" | "fixed">("percent");
  const [k401Percent, setK401Percent] = useState(0);
  const [k401Fixed, setK401Fixed] = useState(0);
  const [hsaContribution, setHsaContribution] = useState(0);
  const [otherPreTax, setOtherPreTax] = useState(0);
  const [postTaxDeductions, setPostTaxDeductions] = useState(0);

  // ----- State options -----
  const [nycResident, setNycResident] = useState(false);
  const [paLocalEitRate, setPaLocalEitRate] = useState(1); // percentage display

  // ----- Collapsible state -----
  const [deductionsOpen, setDeductionsOpen] = useState(true);

  // ----- Build user state options -----
  const userStateOptions = useMemo<Record<string, unknown>>(() => {
    const opts: Record<string, unknown> = {};
    if (stateSlug === "new-york" && nycResident) {
      opts.nycResident = true;
    }
    if (stateSlug === "pennsylvania") {
      opts.paLocalEitRate = paLocalEitRate / 100;
    }
    return opts;
  }, [stateSlug, nycResident, paLocalEitRate]);

  // ----- Build calculator input -----
  const calcInput: CalculatorInput = useMemo(
    () => ({
      grossPay,
      payFrequency,
      hoursPerWeek: payFrequency === "hourly" ? hoursPerWeek : undefined,
      filingStatus,
      retirement401kPercent: k401Type === "percent" ? k401Percent : 0,
      retirement401kType: k401Type,
      retirement401kFixed: k401Type === "fixed" ? k401Fixed : 0,
      hsaContribution,
      otherPreTax,
      postTaxDeductions,
    }),
    [
      grossPay,
      payFrequency,
      hoursPerWeek,
      filingStatus,
      k401Type,
      k401Percent,
      k401Fixed,
      hsaContribution,
      otherPreTax,
      postTaxDeductions,
    ]
  );

  // ----- Calculate result (real-time) -----
  const result: CalculatorResult = useMemo(
    () => calculatePaycheck(calcInput, config, userStateOptions),
    [calcInput, config, userStateOptions]
  );

  // ----- Handlers -----
  const handleGrossPayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setGrossPay(isNaN(val) ? 0 : val);
    },
    []
  );

  const handleNumberInput = useCallback(
    (setter: (v: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setter(isNaN(val) ? 0 : val);
    },
    []
  );

  const handleStateChange = useCallback(
    (slug: string) => {
      router.push(`/paycheck/calculator/${slug}`);
    },
    [router]
  );

  const showHoursPerWeek = payFrequency === "hourly";
  const showNycOption = stateSlug === "new-york";
  const showPaOption = stateSlug === "pennsylvania";
  const showStateOptions = showStateSelector || showNycOption || showPaOption;

  // Adjust gross pay display for hourly
  const grossPayLabel =
    payFrequency === "hourly" ? "Hourly Wage" : "Gross Pay";

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* ===== LEFT COLUMN — Inputs ===== */}
      <div className="space-y-4">
        {/* Section 1 — Income */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gross Pay */}
            <div className="space-y-2">
              <Label htmlFor="gross-pay">{grossPayLabel}</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  id="gross-pay"
                  type="number"
                  min={0}
                  step="any"
                  value={grossPay || ""}
                  onChange={handleGrossPayChange}
                  placeholder="0.00"
                  className="pl-7 tabular-nums"
                />
              </div>
            </div>

            {/* Pay Frequency */}
            <div className="space-y-2">
              <Label htmlFor="pay-frequency">Pay Frequency</Label>
              <Select
                value={payFrequency}
                onValueChange={(v) => setPayFrequency(v as PayFrequency)}
              >
                <SelectTrigger id="pay-frequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PAY_FREQUENCY_LABELS) as [PayFrequency, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Hours/Week (hourly only) */}
            {showHoursPerWeek && (
              <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <Label htmlFor="hours-week">Hours per Week</Label>
                <Input
                  id="hours-week"
                  type="number"
                  min={0}
                  max={168}
                  value={hoursPerWeek}
                  onChange={handleNumberInput(setHoursPerWeek)}
                  placeholder="40"
                  className="tabular-nums"
                />
              </div>
            )}

            {/* Filing Status */}
            <div className="space-y-2">
              <Label htmlFor="filing-status">Filing Status</Label>
              <Select
                value={filingStatus}
                onValueChange={(v) => setFilingStatus(v as FilingStatus)}
              >
                <SelectTrigger id="filing-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(FILING_STATUS_LABELS) as [FilingStatus, string][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 — Deductions (collapsible) */}
        <Collapsible open={deductionsOpen} onOpenChange={setDeductionsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-t-xl border-b px-6 py-4 text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-expanded={deductionsOpen}
              >
                <CardTitle className="text-base">Deductions</CardTitle>
                {deductionsOpen ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-4">
                {/* 401(k) */}
                <div className="space-y-2">
                  <Label>401(k) Contribution</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-md border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setK401Type("percent")}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                          k401Type === "percent"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                        aria-pressed={k401Type === "percent"}
                      >
                        <Percent className="size-3" />
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setK401Type("fixed")}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                          k401Type === "fixed"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                        aria-pressed={k401Type === "fixed"}
                      >
                        <DollarSign className="size-3" />
                        $
                      </button>
                    </div>
                  </div>
                  {k401Type === "percent" ? (
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="0.5"
                        value={k401Percent || ""}
                        onChange={handleNumberInput(setK401Percent)}
                        placeholder="0"
                        className="pr-7 tabular-nums"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step="100"
                        value={k401Fixed || ""}
                        onChange={handleNumberInput(setK401Fixed)}
                        placeholder="0"
                        className="pl-7 tabular-nums"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        /yr
                      </span>
                    </div>
                  )}
                </div>

                {/* HSA */}
                <div className="space-y-2">
                  <Label htmlFor="hsa">HSA Contribution (annual)</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="hsa"
                      type="number"
                      min={0}
                      step="100"
                      value={hsaContribution || ""}
                      onChange={handleNumberInput(setHsaContribution)}
                      placeholder="0"
                      className="pl-7 tabular-nums"
                    />
                  </div>
                </div>

                {/* Other Pre-Tax */}
                <div className="space-y-2">
                  <Label htmlFor="other-pre-tax">
                    Other Pre-Tax Deductions (annual)
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="other-pre-tax"
                      type="number"
                      min={0}
                      step="100"
                      value={otherPreTax || ""}
                      onChange={handleNumberInput(setOtherPreTax)}
                      placeholder="0"
                      className="pl-7 tabular-nums"
                    />
                  </div>
                </div>

                {/* Post-Tax */}
                <div className="space-y-2">
                  <Label htmlFor="post-tax">
                    Post-Tax Deductions (annual)
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="post-tax"
                      type="number"
                      min={0}
                      step="100"
                      value={postTaxDeductions || ""}
                      onChange={handleNumberInput(setPostTaxDeductions)}
                      placeholder="0"
                      className="pl-7 tabular-nums"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Section 3 — State Options */}
        {showStateOptions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">State Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* State selector (generic page) */}
              {showStateSelector && (
                <div className="space-y-2">
                  <Label htmlFor="state-select">State</Label>
                  <Select
                    value={stateSlug}
                    onValueChange={handleStateChange}
                  >
                    <SelectTrigger id="state-select" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATE_LIST.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* NYC Resident toggle */}
              {showNycOption && (
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="nyc-resident" className="cursor-pointer">
                    NYC Resident
                    <p className="font-normal text-xs text-muted-foreground">
                      Adds NYC city income tax
                    </p>
                  </Label>
                  <Switch
                    id="nyc-resident"
                    checked={nycResident}
                    onCheckedChange={setNycResident}
                  />
                </div>
              )}

              {/* PA Local EIT Rate */}
              {showPaOption && (
                <div className="space-y-2">
                  <Label htmlFor="pa-eit">
                    Local EIT Rate
                    <p className="font-normal text-xs text-muted-foreground">
                      Earned Income Tax — varies by municipality
                    </p>
                  </Label>
                  <div className="relative">
                    <Input
                      id="pa-eit"
                      type="number"
                      min={0}
                      max={10}
                      step="0.1"
                      value={paLocalEitRate || ""}
                      onChange={handleNumberInput(setPaLocalEitRate)}
                      placeholder="1"
                      className="pr-7 tabular-nums"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Calculate Button */}
        <Button
          className="w-full h-12 text-base font-semibold bg-ember hover:bg-ember-hover text-ember-foreground shadow-md hover:shadow-lg transition-all"
          onClick={() => {
            // Results are already real-time via useMemo, this button is for accessibility
            const resultsEl = document.getElementById("results-section");
            resultsEl?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <Calculator className="size-5" />
          Calculate Paycheck
        </Button>
      </div>

      {/* ===== RIGHT COLUMN — Results ===== */}
      <div id="results-section" className="space-y-4 lg:sticky lg:top-4">
        {/* Period badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {stateName}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {PAY_FREQUENCY_LABELS[payFrequency]}
          </Badge>
        </div>

        <ResultsBreakdown
          result={result}
          payFrequency={payFrequency}
          stateName={stateName}
        />

        <TaxVisualization result={result} />
      </div>
    </div>
  );
}