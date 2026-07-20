"use client";

import { useState, useCallback } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw, Info, Target, Clock,
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
import ShareButtons from "@/components/calculators/ShareButtons";
import {
  solveMonthly, solveTime, type SolveTimeResult,
} from "@/lib/savings-goal-math";

/* ─── Types ─── */

type TabId = 1 | 2;

interface SharedInputs {
  goal: number;
  current: number;
  rate: number; // annual, percent
}

interface Tab1Inputs extends SharedInputs {
  years: number;
}

interface Tab2Inputs extends SharedInputs {
  monthly: number;
}

/* ─── Defaults (match the worked example in the page content) ─── */

const DEFAULT_GOAL = 50000;
const DEFAULT_CURRENT = 5000;
const DEFAULT_RATE = 4; // %
const DEFAULT_YEARS = 5;
const DEFAULT_MONTHLY = 500;

const DEFAULT_TAB1: Tab1Inputs = {
  goal: DEFAULT_GOAL,
  current: DEFAULT_CURRENT,
  rate: DEFAULT_RATE,
  years: DEFAULT_YEARS,
};

const DEFAULT_TAB2: Tab2Inputs = {
  goal: DEFAULT_GOAL,
  current: DEFAULT_CURRENT,
  rate: DEFAULT_RATE,
  monthly: DEFAULT_MONTHLY,
};

/* ─── URL Param Helpers ─── */
/* Encoding: tab=1|2 goal= current= rate= years= (tab1) monthly= (tab2) */

function readParams(): { tab: TabId; tab1: Tab1Inputs; tab2: Tab2Inputs } {
  if (typeof window === "undefined") {
    return { tab: 1, tab1: DEFAULT_TAB1, tab2: DEFAULT_TAB2 };
  }
  const p = new URLSearchParams(window.location.search);
  const num = (key: string, fallback: number) => {
    const raw = p.get(key);
    if (raw === null) return fallback;
    const v = Number(raw);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  const goal = num("goal", DEFAULT_GOAL);
  const current = num("current", DEFAULT_CURRENT);
  const rate = num("rate", DEFAULT_RATE);
  const years = num("years", DEFAULT_YEARS);
  const monthly = num("monthly", DEFAULT_MONTHLY);
  const tabParam = p.get("tab");
  const tab: TabId = tabParam === "2" ? 2 : 1;
  return {
    tab,
    tab1: { goal, current, rate, years },
    tab2: { goal, current, rate, monthly },
  };
}

function pushParams(tab: TabId, shared: SharedInputs, extra: { years?: number; monthly?: number }) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  p.set("tab", String(tab));
  p.set("goal", String(shared.goal));
  p.set("current", String(shared.current));
  p.set("rate", String(shared.rate));
  if (tab === 1 && extra.years !== undefined) p.set("years", String(extra.years));
  if (tab === 2 && extra.monthly !== undefined) p.set("monthly", String(extra.monthly));
  const url = `${window.location.pathname}?${p.toString()}`;
  window.history.replaceState(null, "", url);
}

/* ─── Formatting ─── */

function fmt(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function fmtCents(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/* ─── Component ─── */

export default function SavingsGoalCalculator() {
  const initial = readParams();
  const [tab, setTab] = useState<TabId>(initial.tab);
  const [tab1, setTab1] = useState<Tab1Inputs>(initial.tab1);
  const [tab2, setTab2] = useState<Tab2Inputs>(initial.tab2);
  const [copied, setCopied] = useState(false);

  /* ─── Results (live) ─── */
  /* Computed inline on every render. The React Compiler handles memoization.
     `today` is captured fresh per render so the target date reflects the
     user's current month, matching the pattern in StudentLoanPayoffCalculator. */

  const r1 = solveMonthly(tab1.goal, tab1.current, tab1.rate / 100, tab1.years);

  const r2: SolveTimeResult = solveTime(
    tab2.goal,
    tab2.current,
    tab2.monthly,
    tab2.rate / 100
  );

  /* ─── Update handlers (push URL params on every change) ─── */

  const updateTab1 = useCallback((patch: Partial<Tab1Inputs>) => {
    setTab1((prev) => {
      const next = { ...prev, ...patch };
      pushParams(1, next, { years: next.years });
      return next;
    });
  }, []);

  const updateTab2 = useCallback((patch: Partial<Tab2Inputs>) => {
    setTab2((prev) => {
      const next = { ...prev, ...patch };
      pushParams(2, next, { monthly: next.monthly });
      return next;
    });
  }, []);

  const switchTab = useCallback((next: TabId) => {
    setTab(next);
    if (next === 1) {
      pushParams(1, tab1, { years: tab1.years });
    } else {
      pushParams(2, tab2, { monthly: tab2.monthly });
    }
  }, [tab1, tab2]);

  const handleCopyLink = useCallback(() => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const handleReset = useCallback(() => {
    setTab(1);
    setTab1(DEFAULT_TAB1);
    setTab2(DEFAULT_TAB2);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);

  /* ─── Share summary text ─── */

  const summaryText = (() => {
    if (tab === 1) {
      return `To reach ${fmt(tab1.goal)} in ${tab1.years} year${tab1.years === 1 ? "" : "s"} at ${tab1.rate.toFixed(2)}% from ${fmt(tab1.current)}, save ${fmtCents(r1.monthlyContribution)}/month. Calculate yours:`;
    }
    if (r2.months === null) {
      return `Goal ${fmt(tab2.goal)} from ${fmt(tab2.current)} at ${fmt(tab2.monthly)}/month is unreachable. Calculate yours:`;
    }
    return `Goal ${fmt(tab2.goal)} from ${fmt(tab2.current)} at ${fmt(tab2.monthly)}/month (${tab2.rate.toFixed(2)}%) reached in ${r2.years} year${r2.years === 1 ? "" : "s"} ${r2.remainingMonths} month${r2.remainingMonths === 1 ? "" : "s"}. Calculate yours:`;
  })();

  /* ─── Render ─── */

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-ember" />
            Savings Goal Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tab Switcher */}
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => switchTab(1)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === 1 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={tab === 1}
            >
              <Target className="size-3.5" />
              How much per month
            </button>
            <button
              type="button"
              onClick={() => switchTab(2)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === 2 ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={tab === 2}
            >
              <Clock className="size-3.5" />
              How long will it take
            </button>
          </div>

          {/* ─── Tab 1: How much per month ─── */}
          {tab === 1 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="t1-goal">Savings Goal</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>The dollar amount you want to reach.</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="t1-goal"
                      type="number"
                      min={0}
                      step={1000}
                      value={tab1.goal}
                      onChange={(e) => updateTab1({ goal: Math.max(0, Number(e.target.value)) })}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="t1-current">Current Savings</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>What you already have saved today.</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="t1-current"
                      type="number"
                      min={0}
                      step={1000}
                      value={tab1.current}
                      onChange={(e) => updateTab1({ current: Math.max(0, Number(e.target.value)) })}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="t1-years">Years to Goal</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>How long you have to save. Monthly compounding uses years &times; 12 months.</TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-medium text-foreground tabular-nums">{tab1.years} yr</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={1}
                      max={50}
                      step={1}
                      value={[tab1.years]}
                      onValueChange={([v]) => updateTab1({ years: v })}
                      className="flex-1"
                    />
                    <Input
                      id="t1-years"
                      type="number"
                      min={1}
                      max={50}
                      step={1}
                      value={tab1.years}
                      onChange={(e) => updateTab1({ years: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="t1-rate">Annual Return (APY)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Assumed annual rate of return. Enter 0 for a no-growth savings account.</TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-medium text-foreground tabular-nums">{tab1.rate.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={0}
                      max={12}
                      step={0.05}
                      value={[tab1.rate]}
                      onValueChange={([v]) => updateTab1({ rate: v })}
                      className="flex-1"
                    />
                    <Input
                      id="t1-rate"
                      type="number"
                      min={0}
                      max={30}
                      step={0.05}
                      value={tab1.rate}
                      onChange={(e) => updateTab1({ rate: Math.max(0, Math.min(30, Number(e.target.value) || 0)) })}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>

              {/* Result: required monthly */}
              <Card className="border-ember/30 bg-muted/30">
                <CardContent className="p-5">
                  {r1.alreadyReached ? (
                    <p className="text-sm text-foreground leading-relaxed">
                      Your current savings of <strong>{fmt(tab1.current)}</strong>, grown at{" "}
                      {tab1.rate.toFixed(2)}% for {tab1.years} years, already reaches your goal of{" "}
                      <strong>{fmt(tab1.goal)}</strong>. No additional monthly contribution is needed.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Required Monthly Contribution
                      </p>
                      <p className="mt-1 text-3xl font-bold text-ember tabular-nums">
                        {fmtCents(r1.monthlyContribution)}<span className="text-base font-medium text-muted-foreground">/mo</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        To reach {fmt(tab1.goal)} in {tab1.years} year{tab1.years === 1 ? "" : "s"} at {tab1.rate.toFixed(2)}% from {fmt(tab1.current)}.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Secondary stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Contributed</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{fmt(r1.totalContributed)}</p>
                    <p className="text-xs text-muted-foreground">Current savings plus every monthly contribution</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Growth from Returns</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-ember">{fmt(r1.growthFromReturns)}</p>
                    <p className="text-xs text-muted-foreground">Interest earned on the growing balance</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Final Amount</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{fmt(r1.finalAmount)}</p>
                    <p className="text-xs text-muted-foreground">Projected balance at the end of the term</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ─── Tab 2: How long will it take ─── */}
          {tab === 2 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="t2-goal">Savings Goal</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>The dollar amount you want to reach.</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="t2-goal"
                      type="number"
                      min={0}
                      step={1000}
                      value={tab2.goal}
                      onChange={(e) => updateTab2({ goal: Math.max(0, Number(e.target.value)) })}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="t2-current">Current Savings</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>What you already have saved today.</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="t2-current"
                      type="number"
                      min={0}
                      step={1000}
                      value={tab2.current}
                      onChange={(e) => updateTab2({ current: Math.max(0, Number(e.target.value)) })}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="t2-monthly">Monthly Contribution</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>How much you add to savings each month.</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id="t2-monthly"
                      type="number"
                      min={0}
                      step={50}
                      value={tab2.monthly}
                      onChange={(e) => updateTab2({ monthly: Math.max(0, Number(e.target.value)) })}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="t2-rate">Annual Return (APY)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>Assumed annual rate of return. Enter 0 for a no-growth savings account.</TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-medium text-foreground tabular-nums">{tab2.rate.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={0}
                      max={12}
                      step={0.05}
                      value={[tab2.rate]}
                      onValueChange={([v]) => updateTab2({ rate: v })}
                      className="flex-1"
                    />
                    <Input
                      id="t2-rate"
                      type="number"
                      min={0}
                      max={30}
                      step={0.05}
                      value={tab2.rate}
                      onChange={(e) => updateTab2({ rate: Math.max(0, Math.min(30, Number(e.target.value) || 0)) })}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>

              {/* Result: time to goal */}
              {r2.months === null ? (
                <Card className="border-destructive/30 bg-muted/30">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Goal Unreachable</p>
                    <p className="mt-2 text-sm text-foreground leading-relaxed">{r2.reason}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-ember/30 bg-muted/30">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Time to Reach Your Goal
                    </p>
                    <p className="mt-1 text-3xl font-bold text-ember tabular-nums">
                      {r2.years > 0 ? <>{r2.years} year{r2.years === 1 ? "" : "s"} </> : null}
                      {r2.remainingMonths} month{r2.remainingMonths === 1 ? "" : "s"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r2.months} total monthly compounding periods
                      {r2.targetDate ? <> &middot; reached around <strong>{fmtDate(r2.targetDate)}</strong></> : null}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Secondary stats */}
              {r2.months !== null && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Contributed</p>
                      <p className="mt-1 text-xl font-bold tabular-nums">{fmt(r2.totalContributed)}</p>
                      <p className="text-xs text-muted-foreground">Current savings plus every monthly contribution</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Growth from Returns</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-ember">{fmt(r2.growthFromReturns)}</p>
                      <p className="text-xs text-muted-foreground">Interest earned on the growing balance</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Final Amount</p>
                      <p className="mt-1 text-xl font-bold tabular-nums">{fmt(r2.finalAmount)}</p>
                      <p className="text-xs text-muted-foreground">Projected balance when the goal is reached</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* YMYL disclaimer */}
          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-md px-4 py-2.5">
            The annual return is an assumption, not a guarantee. Investment returns
            vary from year to year and can be negative. Savings-account APYs change
            over time. Use the calculator to plan; revisit your inputs as rates and
            your situation change.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
            <ShareButtons summaryText={summaryText} title="Savings Goal Calculator" />
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
