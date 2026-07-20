"use client";

import { useState, useCallback, useId } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw, Info,
  ShieldPlus, Trash2, Plus, ChevronDown, CalendarClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import ShareButtons from "@/components/calculators/ShareButtons";
import { calculateEmergencyFund, DEFAULT_EXPENSE_LINES, type ExpenseLine } from "@/lib/emergency-fund-math";

/* ─── Defaults (match the worked example in the page content) ─── */

const DEFAULT_EXPENSES = 3500;
const DEFAULT_MONTHS = 6;
const DEFAULT_CURRENT = 2000;
const DEFAULT_MONTHLY = 400;
const DEFAULT_RATE = 4; // %

/* ─── Types ─── */

interface Inputs {
  expenses: number;
  months: number;
  current: number;
  monthly: number;
  rate: number; // annual, percent
}

const DEFAULT_INPUTS: Inputs = {
  expenses: DEFAULT_EXPENSES,
  months: DEFAULT_MONTHS,
  current: DEFAULT_CURRENT,
  monthly: DEFAULT_MONTHLY,
  rate: DEFAULT_RATE,
};

/* ─── URL Param Helpers ─── */
/* Encoding: expenses= months= current= monthly= rate= */

function readParams(): Inputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const p = new URLSearchParams(window.location.search);
  const num = (key: string, fallback: number) => {
    const raw = p.get(key);
    if (raw === null) return fallback;
    const v = Number(raw);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  return {
    expenses: num("expenses", DEFAULT_EXPENSES),
    months: num("months", DEFAULT_MONTHS),
    current: num("current", DEFAULT_CURRENT),
    monthly: num("monthly", DEFAULT_MONTHLY),
    rate: num("rate", DEFAULT_RATE),
  };
}

function pushParams(inputs: Inputs) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  p.set("expenses", String(inputs.expenses));
  p.set("months", String(inputs.months));
  p.set("current", String(inputs.current));
  p.set("monthly", String(inputs.monthly));
  p.set("rate", String(inputs.rate));
  const url = `${window.location.pathname}?${p.toString()}`;
  window.history.replaceState(null, "", url);
}

/* ─── Formatting ─── */

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  });
}

function fmtCents(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/* ─── Component ─── */

export default function EmergencyFundCalculator() {
  const initial = readParams();
  const [inputs, setInputs] = useState<Inputs>(initial);
  const [copied, setCopied] = useState(false);

  /* Itemized breakdown state */
  const [itemized, setItemized] = useState(false);
  const [lines, setLines] = useState<ExpenseLine[]>(
    DEFAULT_EXPENSE_LINES.map((l) => ({ ...l }))
  );
  const [open, setOpen] = useState(false);
  const lineId = useId();

  const linesTotal = lines.reduce((s, l) => s + (l.amount || 0), 0);

  /* ─── Results (live, computed inline per render) ─── */
  const today = new Date();
  const expenses = itemized ? linesTotal : inputs.expenses;
  const result = calculateEmergencyFund(
    {
      monthlyExpenses: expenses,
      months: inputs.months,
      currentSavings: inputs.current,
      monthlySavings: inputs.monthly,
      annualRate: inputs.rate / 100,
    },
    today
  );

  /* ─── Update handlers ─── */

  const update = useCallback((patch: Partial<Inputs>) => {
    setInputs((prev) => {
      const next = { ...prev, ...patch };
      pushParams(next);
      return next;
    });
  }, []);

  const handleCopyLink = useCallback(() => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setItemized(false);
    setLines(DEFAULT_EXPENSE_LINES.map((l) => ({ ...l })));
    setOpen(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);

  /* Itemized row handlers */
  const updateLine = useCallback((id: string, patch: Partial<ExpenseLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const deleteLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addLine = useCallback(() => {
    setLines((prev) => [
      ...prev,
      { id: `${lineId}-${prev.length}-${Date.now()}`, label: "", amount: 0 },
    ]);
  }, [lineId]);

  /* Toggle itemized mode (plain function — React Compiler handles memoization) */
  const toggleItemized = (next: boolean) => {
    setItemized(next);
    if (next) {
      // Sync lines so their sum matches the current total the first time.
      setLines((prev) => {
        // If lines already exist with a positive sum, keep them.
        const sum = prev.reduce((s, l) => s + (l.amount || 0), 0);
        if (sum > 0) return prev;
        return DEFAULT_EXPENSE_LINES.map((l) => ({ ...l }));
      });
      setOpen(true);
    } else {
      // Carry the summed total back into the direct input.
      setInputs((prev) => {
        const nextInputs = { ...prev, expenses: linesTotal };
        pushParams(nextInputs);
        return nextInputs;
      });
      setOpen(false);
    }
  };

  /* ─── Share summary ─── */
  const summaryText = (() => {
    if (result.alreadyFunded) {
      return `Emergency fund target ${fmt(result.target)} (${inputs.months} months of ${fmt(expenses)} expenses). You already have ${fmt(inputs.current)} saved, a surplus of ${fmt(result.surplus)}. Calculate yours:`;
    }
    if (result.months === null) {
      return `Emergency fund target ${fmt(result.target)} from ${fmt(inputs.current)} at ${fmt(inputs.monthly)}/mo is unreachable. Calculate yours:`;
    }
    return `Emergency fund target ${fmt(result.target)} (${inputs.months} months of ${fmt(expenses)} expenses). From ${fmt(inputs.current)} at ${fmt(inputs.monthly)}/mo and ${inputs.rate.toFixed(2)}%, reached in ${result.years} year${result.years === 1 ? "" : "s"} ${result.remainingMonths} month${result.remainingMonths === 1 ? "" : "s"}. Calculate yours:`;
  })();

  /* ─── Render ─── */

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldPlus className="size-5 text-ember" />
            Emergency Fund Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ─── Inputs ─── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Monthly essential expenses */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ef-expenses">Monthly Essential Expenses</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Only the bills you must pay every month: rent or mortgage,
                      utilities, groceries, transportation, insurance, and minimum
                      debt payments. Not discretionary spending.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <button
                  type="button"
                  onClick={() => toggleItemized(!itemized)}
                  className="text-xs font-medium text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
                >
                  {itemized ? "Use a single total" : "Break down by category"}
                </button>
              </div>
              {itemized ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    value={fmt(linesTotal)}
                    readOnly
                    aria-label="Total monthly essential expenses (sum of categories)"
                    className="pl-7 bg-muted/50 font-medium tabular-nums"
                  />
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    id="ef-expenses"
                    type="number"
                    min={0}
                    step={100}
                    value={inputs.expenses}
                    onChange={(e) => update({ expenses: Math.max(0, Number(e.target.value)) })}
                    className="pl-7"
                  />
                </div>
              )}

              {/* Itemized breakdown */}
              {itemized && (
                <Collapsible open={open} onOpenChange={setOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                      <ChevronDown className={`size-3.5 mr-1.5 transition-transform ${open ? "rotate-180" : ""}`} />
                      {open ? "Hide categories" : `Show ${lines.length} categor${lines.length === 1 ? "y" : "ies"}`}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    {lines.map((line) => (
                      <div key={line.id} className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={line.label}
                          placeholder="Category name"
                          onChange={(e) => updateLine(line.id, { label: e.target.value })}
                          className="flex-1"
                          aria-label={`Category ${line.label || "name"}`}
                        />
                        <div className="relative w-32 shrink-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                          <Input
                            type="number"
                            min={0}
                            step={50}
                            value={line.amount}
                            onChange={(e) => updateLine(line.id, { amount: Math.max(0, Number(e.target.value)) })}
                            className="pl-7 tabular-nums"
                            aria-label={`Amount for ${line.label || "category"}`}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteLine(line.id)}
                          aria-label={`Delete ${line.label || "category"}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addLine} className="text-xs">
                      <Plus className="size-3.5 mr-1.5" />
                      Add category
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {/* Months of coverage */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ef-months">Months of Coverage</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      How many months of essential expenses the fund should
                      cover. Three is a common floor for dual stable incomes; six
                      to twelve fits single or variable income, dependents, or
                      homeownership.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums">{inputs.months} months</span>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  min={3}
                  max={12}
                  step={1}
                  value={[inputs.months]}
                  onValueChange={([v]) => update({ months: v })}
                  className="flex-1"
                />
                <Input
                  id="ef-months"
                  type="number"
                  min={1}
                  max={24}
                  step={1}
                  value={inputs.months}
                  onChange={(e) => update({ months: Math.max(1, Math.min(24, Number(e.target.value) || 1)) })}
                  className="w-20"
                />
              </div>
            </div>

            {/* Current savings */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="ef-current">Current Emergency Savings</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>What you already have set aside for emergencies today.</TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="ef-current"
                  type="number"
                  min={0}
                  step={500}
                  value={inputs.current}
                  onChange={(e) => update({ current: Math.max(0, Number(e.target.value)) })}
                  className="pl-7"
                />
              </div>
            </div>

            {/* Monthly savings */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="ef-monthly">Monthly Amount You Can Save</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>How much you add to the emergency fund each month until it is fully built.</TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="ef-monthly"
                  type="number"
                  min={0}
                  step={50}
                  value={inputs.monthly}
                  onChange={(e) => update({ monthly: Math.max(0, Number(e.target.value)) })}
                  className="pl-7"
                />
              </div>
            </div>

            {/* APY */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ef-rate">Savings APY</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Annual percentage yield on the savings account holding
                      your fund. Enter 0 for a no-growth account. Compounded
                      monthly.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-medium text-foreground tabular-nums">{inputs.rate.toFixed(2)}%</span>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  min={0}
                  max={8}
                  step={0.05}
                  value={[inputs.rate]}
                  onValueChange={([v]) => update({ rate: v })}
                  className="flex-1"
                />
                <Input
                  id="ef-rate"
                  type="number"
                  min={0}
                  max={20}
                  step={0.05}
                  value={inputs.rate}
                  onChange={(e) => update({ rate: Math.max(0, Math.min(20, Number(e.target.value) || 0)) })}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          {/* ─── Results ─── */}
          {result.alreadyFunded ? (
            <Card className="border-ember/30 bg-muted/30">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Emergency Fund Complete
                </p>
                <p className="mt-2 text-sm text-foreground leading-relaxed">
                  Your target emergency fund is{" "}
                  <strong>{fmt(result.target)}</strong> ({inputs.months} months
                  of {fmt(expenses)} in essential expenses). You already have{" "}
                  <strong>{fmt(inputs.current)}</strong> saved, a surplus of{" "}
                  <strong className="text-ember">{fmt(result.surplus)}</strong>{" "}
                  above your target. Focus any additional savings on other goals.
                </p>
              </CardContent>
            </Card>
          ) : result.months === null ? (
            <Card className="border-destructive/30 bg-muted/30">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Goal Unreachable
                </p>
                <p className="mt-2 text-sm text-foreground leading-relaxed">{result.reason}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Primary result: time to reach */}
              <Card className="border-ember/30 bg-muted/30">
                <CardContent className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Time to Build Your Emergency Fund
                  </p>
                  <p className="mt-1 text-3xl font-bold text-ember tabular-nums">
                    {result.years > 0 ? <>{result.years} year{result.years === 1 ? "" : "s"} </> : null}
                    {result.remainingMonths} month{result.remainingMonths === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.months} total monthly compounding periods
                    {result.targetDate ? (
                      <>
                        {" "}&middot; reached around{" "}
                        <strong className="inline-flex items-center gap-1">
                          <CalendarClock className="size-3.5" />
                          {fmtDate(result.targetDate)}
                        </strong>
                      </>
                    ) : null}
                  </p>
                </CardContent>
              </Card>

              {/* Secondary stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Target Fund</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{fmt(result.target)}</p>
                    <p className="text-xs text-muted-foreground">{inputs.months} months &times; {fmt(expenses)} expenses</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Remaining Gap</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{fmt(result.gap)}</p>
                    <p className="text-xs text-muted-foreground">Target minus current savings</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Growth from Returns</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-ember">{fmt(result.growthFromReturns)}</p>
                    <p className="text-xs text-muted-foreground">Interest earned while you save</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* 3 / 6 / 12 month target strip */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-muted/20">
              <CardContent className="p-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">3 Months</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums">{fmt(result.target3)}</p>
              </CardContent>
            </Card>
            <Card className="border-ember/30 bg-muted/20">
              <CardContent className="p-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">6 Months</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums text-ember">{fmt(result.target6)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/20">
              <CardContent className="p-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">12 Months</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums">{fmt(result.target12)}</p>
              </CardContent>
            </Card>
          </div>

          {/* YMYL disclaimer */}
          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-md px-4 py-2.5">
            The right emergency-fund size depends on your personal circumstances:
            income stability, dependents, health, insurance deductibles, and
            access to credit. The APY is an assumption; savings rates change over
            time. Treat the result as a plan, not a guarantee, and revisit your
            inputs when your expenses or situation change.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
            <ShareButtons summaryText={summaryText} title="Emergency Fund Calculator" />
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                {copied ? <Check className="size-3.5 mr-1.5" /> : <Copy className="size-3.5 mr-1.5" />}
                {copied ? "Copied" : "Copy Link"}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="size-3.5 mr-1.5" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="size-3.5 mr-1.5" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
