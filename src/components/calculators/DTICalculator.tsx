"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Copy, Check, Printer, RotateCcw, Info, Plus, X, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

interface DebtRow {
  id: string;
  name: string;
  amount: number;
  isDefault: boolean;
}

interface DTIInputs {
  income: number;
  debts: DebtRow[];
}

interface DTIResult {
  frontEnd: number;
  backEnd: number;
  frontEndVerdict: { label: string; text: string };
  backEndVerdict: { label: string; text: string };
  maxHousing28: number;
  maxHousing36: number;
  totalDebts: number;
  nonHousingDebts: number;
}

/* ─── Defaults ─── */

const genId = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_DEBTS: DebtRow[] = [
  { id: genId(), name: "Rent / Mortgage Payment", amount: 1500, isDefault: true },
  { id: genId(), name: "Car Loan / Lease", amount: 350, isDefault: true },
  { id: genId(), name: "Student Loan", amount: 250, isDefault: true },
  { id: genId(), name: "Credit Card Minimums", amount: 150, isDefault: true },
  { id: genId(), name: "Other Debts", amount: 0, isDefault: true },
];

export const DEFAULT_INPUTS: DTIInputs = {
  income: 5000,
  debts: DEFAULT_DEBTS,
};

export const DEFAULT_RESULT: DTIResult = {
  frontEnd: 30,
  backEnd: 45,
  frontEndVerdict: { label: "Good", text: "Meets most lender requirements" },
  backEndVerdict: { label: "Acceptable", text: "At or near QM cap" },
  maxHousing28: 1400,
  maxHousing36: 1100,
  totalDebts: 2250,
  nonHousingDebts: 750,
};

/* ─── Formatters ─── */

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

const fmtPercent = (v: number) => `${v.toFixed(1)}%`;

/* ─── Verdict Logic ─── */

function getVerdict(dti: number): { label: string; text: string } {
  if (dti <= 28) return { label: "Excellent", text: "Well within all lender limits" };
  if (dti <= 36) return { label: "Good", text: "Meets most lender requirements" };
  if (dti <= 43) return { label: "Acceptable", text: "At or near QM cap" };
  if (dti <= 50) return { label: "Caution", text: "May need compensating factors" };
  return { label: "High Risk", text: "Difficult to qualify" };
}

function getVerdictColor(label: string): string {
  switch (label) {
    case "Excellent": return "text-green-600 dark:text-green-400";
    case "Good": return "text-yellow-600 dark:text-yellow-400";
    case "Acceptable": return "text-orange-500 dark:text-orange-400";
    case "Caution": return "text-orange-600 dark:text-orange-500";
    case "High Risk": return "text-red-600 dark:text-red-500";
    default: return "text-foreground";
  }
}

/* ─── Calculation Engine ─── */

function calculateDTI(inputs: DTIInputs): DTIResult {
  const { income, debts } = inputs;

  if (income <= 0) {
    const zeroVerdict = getVerdict(0);
    return {
      frontEnd: 0,
      backEnd: 0,
      frontEndVerdict: zeroVerdict,
      backEndVerdict: zeroVerdict,
      maxHousing28: 0,
      maxHousing36: 0,
      totalDebts: 0,
      nonHousingDebts: 0,
    };
  }

  const housingDebt = debts[0]?.amount ?? 0;
  const totalDebts = debts.reduce((sum, d) => sum + d.amount, 0);
  const nonHousingDebts = totalDebts - housingDebt;

  const frontEnd = (housingDebt / income) * 100;
  const backEnd = (totalDebts / income) * 100;

  return {
    frontEnd,
    backEnd,
    frontEndVerdict: getVerdict(frontEnd),
    backEndVerdict: getVerdict(backEnd),
    maxHousing28: income * 0.28,
    maxHousing36: income * 0.36 - nonHousingDebts,
    totalDebts,
    nonHousingDebts,
  };
}

/* ─── DTI Zones ─── */

const DTI_ZONES = [
  { max: 28, color: "bg-green-500", label: "Ideal", textColor: "text-green-700 dark:text-green-400" },
  { max: 36, color: "bg-yellow-400", label: "Good", textColor: "text-yellow-700 dark:text-yellow-400" },
  { max: 43, color: "bg-orange-400", label: "Acceptable", textColor: "text-orange-700 dark:text-orange-400" },
  { max: 50, color: "bg-orange-500", label: "Caution", textColor: "text-orange-700 dark:text-orange-400" },
  { max: 100, color: "bg-red-500", label: "High Risk", textColor: "text-red-700 dark:text-red-400" },
];

/* ─── Component ─── */

export default function DTICalculator() {
  const [inputs, setInputs] = useState<DTIInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);

    const hasParams = params.get("income");
    if (!hasParams) return DEFAULT_INPUTS;

    const income = params.get("income") ? parseFloat(params.get("income")!) : DEFAULT_INPUTS.income;

    const debts: DebtRow[] = [];

    const defaultNames = ["Rent / Mortgage Payment", "Car Loan / Lease", "Student Loan", "Credit Card Minimums", "Other Debts"];
    const paramKeys = ["housing", "auto", "student", "cards", "other"];

    // Parse the 5 default debt rows
    for (let i = 0; i < 5; i++) {
      const amt = params.get(paramKeys[i]);
      const name = params.get(`${paramKeys[i]}name`) || defaultNames[i];
      debts.push({
        id: genId(),
        name,
        amount: amt ? parseFloat(amt) : 0,
        isDefault: true,
      });
    }

    // Parse custom debt rows
    for (let i = 1; i <= 10; i++) {
      const cName = params.get(`custom${i}name`);
      const cAmt = params.get(`custom${i}amt`);
      if (!cName && !cAmt) break;
      debts.push({
        id: genId(),
        name: cName || `Custom Debt ${i}`,
        amount: cAmt ? parseFloat(cAmt) : 0,
        isDefault: false,
      });
    }

    if (debts.length === 0) return DEFAULT_INPUTS;
    return { income, debts };
  });

  const [copied, setCopied] = useState(false);

  const result = useMemo(() => calculateDTI(inputs), [inputs]);

  // Sync URL query string when inputs change (skip initial render)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("income", inputs.income.toString());

    const paramKeys = ["housing", "auto", "student", "cards", "other"];
    for (let i = 0; i < Math.min(5, inputs.debts.length); i++) {
      params.set(paramKeys[i], inputs.debts[i].amount.toString());
    }

    // Custom debts
    const customDebts = inputs.debts.filter((d) => !d.isDefault);
    customDebts.forEach((d, i) => {
      params.set(`custom${i + 1}name`, d.name);
      params.set(`custom${i + 1}amt`, d.amount.toString());
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [inputs]);

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

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    toast.success("Calculator reset to defaults");
  }, []);

  const updateIncome = useCallback((value: string) => {
    const num = parseFloat(value);
    setInputs((prev) => ({
      ...prev,
      income: isNaN(num) ? 0 : num,
    }));
  }, []);

  const updateDebtAmount = useCallback((id: string, value: string) => {
    const num = parseFloat(value);
    setInputs((prev) => ({
      ...prev,
      debts: prev.debts.map((d) =>
        d.id === id ? { ...d, amount: isNaN(num) ? 0 : num } : d,
      ),
    }));
  }, []);

  const updateDebtName = useCallback((id: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      debts: prev.debts.map((d) =>
        d.id === id ? { ...d, name: value } : d,
      ),
    }));
  }, []);

  const addDebt = useCallback(() => {
    setInputs((prev) => ({
      ...prev,
      debts: [
        ...prev.debts,
        { id: genId(), name: "", amount: 0, isDefault: false },
      ],
    }));
  }, []);

  const removeDebt = useCallback((id: string) => {
    setInputs((prev) => {
      const next = prev.debts.filter((d) => d.id !== id);
      if (next.length === 0) {
        return { ...prev, debts: [{ id: genId(), name: "", amount: 0, isDefault: false }] };
      }
      return { ...prev, debts: next };
    });
  }, []);

  const totalDebts = useMemo(
    () => inputs.debts.reduce((sum, d) => sum + d.amount, 0),
    [inputs.debts],
  );

  const hasIncome = inputs.income > 0;

  // Meter position: clamp DTI between 0 and 65 for display
  const meterMax = 65;
  const meterPosition = Math.min(Math.max(result.backEnd, 0), meterMax);
  const meterPercent = (meterPosition / meterMax) * 100;

  // Threshold positions on the meter
  const threshold28 = (28 / meterMax) * 100;
  const threshold36 = (36 / meterMax) * 100;
  const threshold43 = (43 / meterMax) * 100;
  const threshold50 = (50 / meterMax) * 100;

  // Zone widths
  const zoneWidths = [
    ((28 - 0) / meterMax) * 100,
    ((36 - 28) / meterMax) * 100,
    ((43 - 36) / meterMax) * 100,
    ((50 - 43) / meterMax) * 100,
    ((meterMax - 50) / meterMax) * 100,
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Home className="size-5 text-ember" />
              Debt-to-Income (DTI) Ratio Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your DTI ratio compares your monthly debt payments to your gross
              monthly income. Lenders use this to evaluate your ability to manage
              monthly payments and repay borrowed money.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Gross Monthly Income */}
                <div className="space-y-2 pl-3 sm:pl-4">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="gross-income" className="text-sm font-medium">
                      Gross Monthly Income
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[280px] text-xs">
                        Your total pre-tax income before any deductions. Include
                        salary, wages, tips, bonuses, commissions, and any other
                        regular income sources.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative no-print">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="gross-income"
                      type="number"
                      min={0}
                      step={100}
                      value={inputs.income || ""}
                      onChange={(e) => updateIncome(e.target.value)}
                      placeholder="5,000"
                      className="h-9 pl-7 text-sm"
                      aria-label="Gross monthly income"
                    />
                  </div>
                  <p className="hidden print:block text-sm font-medium">
                    Gross Monthly Income: {fmtCurrency(inputs.income)}
                  </p>
                </div>

                {/* Monthly Debts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Monthly Debts</Label>
                    <span className="text-xs text-muted-foreground">
                      Total: {fmtCurrency(totalDebts)}
                    </span>
                  </div>

                  {inputs.debts.map((debt, idx) => (
                    <div
                      key={debt.id}
                      className="rounded-lg border bg-card p-3 sm:p-4 space-y-2"
                    >
                      {/* Row 1: Number badge + Debt name (full width) */}
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ember/10 text-xs font-semibold text-ember">
                          {idx + 1}
                        </span>
                        <Input
                          type="text"
                          value={debt.name}
                          onChange={(e) => updateDebtName(debt.id, e.target.value)}
                          placeholder="Debt name"
                          className="w-full h-8 text-sm no-print"
                          aria-label={`Debt ${idx + 1} name`}
                        />
                        <span className="hidden print:inline text-sm font-medium">
                          {debt.name || `Debt ${idx + 1}`}
                        </span>
                      </div>
                      {/* Row 2: Amount + Remove button */}
                      <div className="flex items-center gap-2 no-print">
                        <div className="relative shrink-0 w-28 sm:w-32">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            min={0}
                            step={25}
                            value={debt.amount || ""}
                            onChange={(e) => updateDebtAmount(debt.id, e.target.value)}
                            placeholder="0"
                            className="h-8 pl-6 text-sm text-right"
                            aria-label={`Debt ${idx + 1} amount`}
                          />
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => removeDebt(debt.id)}
                            aria-label={`Remove ${debt.name || `debt ${idx + 1}`}`}
                          >
                            <X className="size-4" />
                          </Button>
                      </div>
                      <span className="hidden print:inline text-sm font-medium">
                        Amount: {fmtCurrency(debt.amount)}
                      </span>
                    </div>
                  ))}

                  {/* Add Debt Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addDebt}
                    className="w-full border-dashed text-muted-foreground hover:border-ember/40 hover:text-ember no-print"
                  >
                    <Plus className="mr-1.5 size-4" />
                    Add Debt
                  </Button>
                </div>
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {hasIncome ? (
                  <>
                    {/* Print-only title */}
                    <h2 className="hidden print:block text-lg font-bold print:mb-3">
                      DTI Ratio Results
                    </h2>

                    {/* Result Cards - 2 column grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Front-End DTI"
                        value={fmtPercent(result.frontEnd)}
                        subtext={result.frontEndVerdict.label}
                        valueClassName={getVerdictColor(result.frontEndVerdict.label)}
                      />
                      <ResultCard
                        label="Back-End DTI"
                        value={fmtPercent(result.backEnd)}
                        subtext={result.backEndVerdict.label}
                        valueClassName={getVerdictColor(result.backEndVerdict.label)}
                      />
                    </div>

                    {/* Verdict Text */}
                    <div className="rounded-lg bg-muted/30 p-4 space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Front-End:</span>{" "}
                        <span className={getVerdictColor(result.frontEndVerdict.label)}>
                          {result.frontEndVerdict.text}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Back-End:</span>{" "}
                        <span className={getVerdictColor(result.backEndVerdict.label)}>
                          {result.backEndVerdict.text}
                        </span>
                      </p>
                    </div>

                    {/* Visual DTI Meter */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">DTI Ratio Meter</p>
                      <div className="relative">
                        {/* Bar */}
                        <div className="flex h-6 w-full overflow-hidden rounded-md border">
                          {DTI_ZONES.map((zone, i) => (
                            <div
                              key={zone.label}
                              className={zone.color}
                              style={{ width: `${zoneWidths[i]}%` }}
                            />
                          ))}
                        </div>

                        {/* Threshold markers */}
                        {[28, 36, 43, 50].map((threshold) => {
                          const pos = (threshold / meterMax) * 100;
                          return (
                            <div
                              key={threshold}
                              className="absolute top-0 h-full flex flex-col items-center"
                              style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
                            >
                              <div className="h-full w-px bg-black/20 dark:bg-white/30" />
                              <span className="mt-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                {threshold}%
                              </span>
                            </div>
                          );
                        })}

                        {/* User's DTI marker */}
                        <div
                          className="absolute -top-2 transition-all duration-300 ease-out"
                          style={{ left: `${meterPercent}%`, transform: "translateX(-50%)" }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="size-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-foreground" />
                            <span className="mt-0.5 rounded bg-foreground px-1 py-px text-[10px] font-bold text-background whitespace-nowrap">
                              {fmtPercent(result.backEnd)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Zone legend */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {DTI_ZONES.map((zone) => (
                          <span key={zone.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className={`inline-block size-2.5 rounded-sm ${zone.color}`} />
                            {zone.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Lender Threshold Reference Card */}
                    <div className="rounded-lg bg-muted/30 p-4 space-y-3">
                      <p className="text-sm font-medium">Lender DTI Thresholds</p>
                      <div className="grid gap-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 font-semibold text-foreground w-28">FHA Loans</span>
                          <span className="text-muted-foreground">
                            Typically up to 43% (automated) or 50% with compensating factors
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 font-semibold text-foreground w-28">VA Loans</span>
                          <span className="text-muted-foreground">
                            ~41% guideline (discretionary overrides possible)
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 font-semibold text-foreground w-28">Conventional</span>
                          <span className="text-muted-foreground">
                            Up to 45% (some lenders allow higher)
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 font-semibold text-foreground w-28">QM Cap</span>
                          <span className="text-muted-foreground">
                            43% maximum for Qualified Mortgage status
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* How Much House Can I Afford */}
                    <div className="rounded-lg border bg-card p-4 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Home className="size-4 text-ember" />
                        How Much House Can I Afford?
                      </p>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">At 28% front-end DTI</span>
                          <span className="font-bold text-ember">
                            {fmtCurrency(result.maxHousing28)}/mo
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Maximum housing payment based on gross income alone
                        </p>
                        <div className="border-t pt-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">At 36% back-end DTI</span>
                          <span className="font-bold text-ember">
                            {result.maxHousing36 > 0
                              ? `${fmtCurrency(result.maxHousing36)}/mo`
                              : "N/A"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {result.maxHousing36 > 0
                            ? `After subtracting ${fmtCurrency(result.nonHousingDebts)} in non-housing debts from the 36% income limit`
                            : "Non-housing debts exceed the 36% income limit"}
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
                        summaryText={`Back-end DTI: ${fmtPercent(result.backEnd)}. Calculate yours:`}
                      />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This calculator provides estimates for informational purposes
                      only. Actual DTI calculations may vary by lender. Some
                      lenders include additional obligations like child support or
                      alimony. Always consult with a mortgage professional for
                      accurate qualification details.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Enter your gross monthly income to see results.
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
  valueClassName,
}: {
  label: string;
  value: string;
  subtext: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-md border bg-card p-3 print-break-inside">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-lg font-bold tracking-tight ${valueClassName ?? ""}`}>
        {value}
      </p>
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