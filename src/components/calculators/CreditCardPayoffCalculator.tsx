"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Copy, Check, Printer, RotateCcw, CreditCard, ChevronDown, ChevronUp, Info, Plus, X, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

interface CardEntry {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
}

interface CCInputs {
  cards: CardEntry[];
  mode: "fixed" | "target";
  fixedPayment: number;
  targetMonths: number;
  snowball: boolean;
}

interface PayoffResult {
  months: number;
  payoffDate: string;
  totalInterest: number;
  totalPaid: number;
  schedule: ScheduleRow[];
  warnings: string[];
}

interface ScheduleRow {
  month: number;
  cards: {
    id: string;
    name: string;
    payment: number;
    interest: number;
    principal: number;
    balance: number;
  }[];
}

/* ─── Defaults ─── */

const genId = () => Math.random().toString(36).slice(2, 9);

export const DEFAULT_CARDS: CardEntry[] = [
  { id: genId(), name: "Visa Card", balance: 5000, apr: 22.9, minimumPayment: 150 },
  { id: genId(), name: "Mastercard", balance: 3000, apr: 18.99, minimumPayment: 90 },
  { id: genId(), name: "Store Card", balance: 1200, apr: 27.99, minimumPayment: 48 },
];

export const DEFAULT_INPUTS: CCInputs = {
  cards: DEFAULT_CARDS,
  mode: "fixed",
  fixedPayment: 200,
  targetMonths: 24,
  snowball: true,
};

/* ─── Formatters ─── */

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
const fmtPercent = (v: number) => `${v.toFixed(2)}%`;

/* ─── Calculation Engine ─── */

function runSchedule(cards: CardEntry[], monthlyBudget: number, snowball: boolean): PayoffResult {
  const active = cards.filter((c) => c.balance > 0);
  if (active.length === 0) {
    return { months: 0, payoffDate: "", totalInterest: 0, totalPaid: 0, schedule: [], warnings: [] };
  }

  const warnings: string[] = [];
  for (const c of active) {
    const monthlyInterest = c.balance * (c.apr / 100) / 12;
    if (c.minimumPayment <= monthlyInterest && c.minimumPayment < c.balance) {
      warnings.push(
        `"${c.name}" minimum payment (${fmtCurrency(c.minimumPayment)}/mo) may not cover monthly interest (${fmtCurrency(monthlyInterest)}/mo). This debt may never be paid off.`
      );
    }
  }

  const sorted = [...active].sort((a, b) =>
    snowball ? a.balance - b.balance : b.apr - a.apr,
  );

  const balances = sorted.map((c) => c.balance);
  const aprs = sorted.map((c) => c.apr);
  const mins = sorted.map((c) => c.minimumPayment);
  const names = sorted.map((c) => c.name);
  const ids = sorted.map((c) => c.id);

  const schedule: ScheduleRow[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const maxMonths = 1200;
  let freedMinimums = 0;

  while (month < maxMonths) {
    if (balances.every((b) => b < 0.005)) break;

    month++;
    const totalMins = mins.reduce((s, m, i) => (balances[i] >= 0.005 ? s + m : s), 0);
    let extra = monthlyBudget - totalMins + freedMinimums;
    let appliedExtra = false;

    const row: ScheduleRow = { month, cards: [] };

    for (let i = 0; i < sorted.length; i++) {
      const bal = balances[i];
      if (bal < 0.005) {
        row.cards.push({ id: ids[i], name: names[i], payment: 0, interest: 0, principal: 0, balance: 0 });
        continue;
      }

      const interest = bal * (aprs[i] / 100) / 12;
      const owed = bal + interest;
      const minPay = Math.min(mins[i], owed);

      let payment = minPay;

      if (!appliedExtra && extra > 0) {
        const remaining = owed - payment;
        const extraToApply = Math.min(extra, Math.max(0, remaining));
        payment += extraToApply;
        extra -= extraToApply;
        appliedExtra = true;
      }

      const principal = payment - interest;
      const newBal = Math.max(0, bal - principal);

      totalInterest += interest;
      totalPaid += payment;
      balances[i] = newBal;

      row.cards.push({
        id: ids[i],
        name: names[i],
        payment,
        interest,
        principal: Math.max(0, principal),
        balance: newBal,
      });

      if (newBal < 0.005) {
        freedMinimums += mins[i];
        appliedExtra = false;
      }
    }

    schedule.push(row);
  }

  const now = new Date();
  const debtFree = new Date(now.getFullYear(), now.getMonth() + month, 1);
  const payoffDate = debtFree.toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return { months: month, payoffDate, totalInterest, totalPaid, schedule, warnings };
}

function calculateResults(inputs: CCInputs): { minOnly: PayoffResult; active: PayoffResult } {
  const { cards, mode, fixedPayment, targetMonths, snowball } = inputs;
  const active = cards.filter((c) => c.balance > 0);

  const empty: PayoffResult = { months: 0, payoffDate: "", totalInterest: 0, totalPaid: 0, schedule: [], warnings: [] };
  if (active.length === 0) return { minOnly: empty, active: empty };

  const totalMins = active.reduce((s, c) => s + c.minimumPayment, 0);

  // Min-only result: budget = sum of minimums only
  const minOnly = runSchedule(cards, totalMins, snowball);

  if (mode === "fixed") {
    const budget = totalMins + fixedPayment;
    const activeResult = runSchedule(cards, budget, snowball);
    return { minOnly, active: activeResult };
  }

  // Target mode: binary search for the monthly budget
  let lo = totalMins;
  let hi = totalMins + active.reduce((s, c) => s + c.balance, 0);
  let result = lo;

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const r = runSchedule(cards, mid, snowball);
    if (r.months <= targetMonths) {
      result = mid;
      hi = mid;
    } else {
      lo = mid;
    }
  }

  const activeResult = runSchedule(cards, result, snowball);
  return { minOnly, active: activeResult };
}

/* ─── Component ─── */

export default function CreditCardPayoffCalculator() {
  const [inputs, setInputs] = useState<CCInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const hasParams = params.get("c1name") || params.get("c1bal");
    if (!hasParams) return DEFAULT_INPUTS;

    const cards: CardEntry[] = [];
    for (let i = 1; i <= 10; i++) {
      const name = params.get(`c${i}name`);
      const bal = params.get(`c${i}bal`);
      if (!name && !bal) break;
      cards.push({
        id: genId(),
        name: name || `Card ${i}`,
        balance: bal ? parseFloat(bal) : 0,
        apr: params.get(`c${i}apr`) ? parseFloat(params.get(`c${i}apr`)!) : 0,
        minimumPayment: params.get(`c${i}min`) ? parseFloat(params.get(`c${i}min`)!) : 0,
      });
    }
    if (cards.length === 0) return DEFAULT_INPUTS;

    const mode = params.get("mode") === "target" ? "target" : "fixed";
    const fixedPayment = params.get("extra") ? parseFloat(params.get("extra")!) : DEFAULT_INPUTS.fixedPayment;
    const targetMonths = params.get("months") ? parseInt(params.get("months")!, 10) : DEFAULT_INPUTS.targetMonths;
    const snowball = params.get("snowball") !== "false";

    return { cards, mode, fixedPayment, targetMonths, snowball };
  });

  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(true);

  const { minOnlyResult, activeResult } = useMemo(() => {
    const { minOnly, active } = calculateResults(inputs);
    return { minOnlyResult: minOnly, activeResult: active };
  }, [inputs]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    inputs.cards.forEach((c, i) => {
      if (c.name) params.set(`c${i + 1}name`, c.name);
      params.set(`c${i + 1}bal`, c.balance.toString());
      params.set(`c${i + 1}apr`, c.apr.toString());
      params.set(`c${i + 1}min`, c.minimumPayment.toString());
    });
    params.set("mode", inputs.mode);
    params.set("extra", inputs.fixedPayment.toString());
    params.set("months", inputs.targetMonths.toString());
    params.set("snowball", inputs.snowball.toString());
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

  const updateCard = useCallback((id: string, field: keyof Omit<CardEntry, "id">, value: string) => {
    setInputs((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => {
        if (c.id !== id) return c;
        if (field === "name") return { ...c, name: value };
        const num = parseFloat(value);
        return { ...c, [field]: isNaN(num) ? 0 : num };
      }),
    }));
  }, []);

  const addCard = useCallback(() => {
    setInputs((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        { id: genId(), name: `Card ${prev.cards.length + 1}`, balance: 0, apr: 0, minimumPayment: 0 },
      ],
    }));
  }, []);

  const removeCard = useCallback((id: string) => {
    setInputs((prev) => {
      const next = prev.cards.filter((c) => c.id !== id);
      if (next.length === 0) {
        return { ...prev, cards: [{ id: genId(), name: "", balance: 0, apr: 0, minimumPayment: 0 }] };
      }
      return { ...prev, cards: next };
    });
  }, []);

  const totalBalance = useMemo(
    () => inputs.cards.reduce((sum, c) => sum + c.balance, 0),
    [inputs.cards],
  );

  const hasValidCards = inputs.cards.some((c) => c.balance > 0);

  const activeCards = inputs.cards.filter((c) => c.balance > 0);
  const totalMinPayments = activeCards.reduce((s, c) => s + c.minimumPayment, 0);
  const monthlyBudget = inputs.mode === "fixed"
    ? totalMinPayments + inputs.fixedPayment
    : activeResult.totalPaid > 0
      ? activeResult.totalPaid / activeResult.months
      : totalMinPayments;

  const monthsSaved = minOnlyResult.months - activeResult.months;
  const interestSaved = minOnlyResult.totalInterest - activeResult.totalInterest;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* ─── Main Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="size-5 text-ember" />
              Credit Card Payoff Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              See how extra payments can help you become credit card debt-free faster.
              Compare minimum-only payments against an accelerated payoff plan using
              the Snowball or Avalanche strategy.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Card Rows */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Your Credit Cards</Label>
                    <span className="text-xs text-muted-foreground">
                      Total: {fmtCurrency(totalBalance)}
                    </span>
                  </div>

                  {inputs.cards.map((card, idx) => (
                    <div
                      key={card.id}
                      className="rounded-lg border bg-card p-3 sm:p-4 space-y-2"
                    >
                      {/* Row 1: Number badge + name (full width) + remove */}
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ember/10 text-xs font-semibold text-ember">
                          {idx + 1}
                        </span>
                        <Input
                          type="text"
                          value={card.name}
                          onChange={(e) => updateCard(card.id, "name", e.target.value)}
                          placeholder="Card name"
                          className="w-full h-8 text-sm no-print"
                          aria-label={`Card ${idx + 1} name`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0 text-muted-foreground hover:text-destructive shrink-0 no-print"
                          onClick={() => removeCard(card.id)}
                          aria-label={`Remove ${card.name || `card ${idx + 1}`}`}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>

                      {/* Row 2: Fields (3 cols on sm+) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 no-print">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">Balance ($)</Label>
                          <Input
                            type="number"
                            min={0}
                            step={100}
                            value={card.balance || ""}
                            onChange={(e) => updateCard(card.id, "balance", e.target.value)}
                            placeholder="0"
                            className="h-8 text-sm"
                            aria-label={`Card ${idx + 1} balance`}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Label className="text-[11px] text-muted-foreground">APR (%)</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[200px] text-xs">
                                Annual Percentage Rate on this credit card.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            step={0.1}
                            value={card.apr || ""}
                            onChange={(e) => updateCard(card.id, "apr", e.target.value)}
                            placeholder="0"
                            className="h-8 text-sm"
                            aria-label={`Card ${idx + 1} APR`}
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-1 col-span-2">
                          <div className="flex items-center gap-1">
                            <Label className="text-[11px] text-muted-foreground">Min. Pay ($/mo)</Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="size-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[220px] text-xs">
                                The minimum required monthly payment. When this card is
                                paid off, its minimum rolls to the next priority card.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            type="number"
                            min={0}
                            step={10}
                            value={card.minimumPayment || ""}
                            onChange={(e) => updateCard(card.id, "minimumPayment", e.target.value)}
                            placeholder="0"
                            className="h-8 text-sm"
                            aria-label={`Card ${idx + 1} minimum payment`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Card Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCard}
                    className="w-full border-dashed text-muted-foreground hover:border-ember/40 hover:text-ember no-print"
                  >
                    <Plus className="mr-1.5 size-4" />
                    Add Card
                  </Button>
                </div>

                {/* Mode Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Calculation Mode</Label>
                  <div className="grid grid-cols-2 gap-2 no-print">
                    <button
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, mode: "fixed" }))}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                        inputs.mode === "fixed"
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground hover:border-ember/30 hover:text-ember"
                      }`}
                      aria-pressed={inputs.mode === "fixed"}
                    >
                      <CreditCard className="size-4" />
                      Fixed Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, mode: "target" }))}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
                        inputs.mode === "target"
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground hover:border-ember/30 hover:text-ember"
                      }`}
                      aria-pressed={inputs.mode === "target"}
                    >
                      <CreditCard className="size-4" />
                      Target Months
                    </button>
                  </div>
                  <p className="hidden print:block text-sm font-medium">
                    Mode: {inputs.mode === "fixed" ? "Fixed Payment" : "Target Months"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {inputs.mode === "fixed"
                      ? "Set an extra monthly payment to see how long it takes to become debt-free."
                      : "Set a target timeframe to find out how much you need to pay each month."}
                  </p>
                </div>

                {/* Fixed Payment Input */}
                {inputs.mode === "fixed" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor="cc-extra-payment" className="text-sm font-medium">
                          Extra Monthly Payment
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[280px] text-xs">
                            An additional amount you can pay each month on top of
                            all minimum payments. This is applied to the priority
                            card first. As cards are paid off, their minimums also
                            roll over to the next card.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {fmtCurrency(inputs.fixedPayment)}
                      </span>
                    </div>
                    <div className="no-print">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="cc-extra-payment"
                          type="number"
                          min={0}
                          step={25}
                          value={inputs.fixedPayment || ""}
                          onChange={(e) => {
                            const num = parseFloat(e.target.value);
                            setInputs((p) => ({
                              ...p,
                              fixedPayment: isNaN(num) ? 0 : num,
                            }));
                          }}
                          placeholder="0"
                          className="pl-6"
                          aria-label="Extra monthly payment"
                        />
                      </div>
                    </div>
                    <p className="hidden print:block text-sm">
                      Extra monthly payment: {fmtCurrency(inputs.fixedPayment)}
                    </p>
                  </div>
                )}

                {/* Target Months Input */}
                {inputs.mode === "target" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="cc-target-months" className="text-sm font-medium">
                        Target Months to Be Debt-Free
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[250px] text-xs">
                          The number of months within which you want to pay off all
                          credit card debt. The calculator will find the required
                          monthly payment.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="no-print">
                      <Input
                        id="cc-target-months"
                        type="number"
                        min={1}
                        max={600}
                        step={1}
                        value={inputs.targetMonths || ""}
                        onChange={(e) => {
                          const num = parseInt(e.target.value, 10);
                          setInputs((p) => ({
                            ...p,
                            targetMonths: isNaN(num) || num < 1 ? 1 : num,
                          }));
                        }}
                        placeholder="24"
                        aria-label="Target months to be debt-free"
                      />
                    </div>
                    <p className="hidden print:block text-sm">
                      Target months to be debt-free: {inputs.targetMonths}
                    </p>
                  </div>
                )}

                {/* Snowball / Avalanche Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payoff Strategy</Label>
                  <div className="grid grid-cols-2 gap-2 no-print">
                    <button
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, snowball: true }))}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                        inputs.snowball
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground hover:border-ember/30 hover:text-ember"
                      }`}
                      aria-pressed={inputs.snowball}
                    >
                      Snowball
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, snowball: false }))}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                        !inputs.snowball
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border bg-background text-muted-foreground hover:border-ember/30 hover:text-ember"
                      }`}
                      aria-pressed={!inputs.snowball}
                    >
                      Avalanche
                    </button>
                  </div>
                  <p className="hidden print:block text-sm font-medium">
                    Strategy: {inputs.snowball ? "Snowball (smallest balance first)" : "Avalanche (highest APR first)"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {inputs.snowball
                      ? "Pays off the smallest balance first for quick wins."
                      : "Targets the highest interest rate first to minimize total interest."}
                  </p>
                </div>

                {/* Warnings */}
                {activeResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    {activeResult.warnings.map((w, i) => (
                      <Alert key={i} variant="destructive" className="py-2">
                        <AlertTriangle className="size-4" />
                        <AlertDescription className="text-xs">{w}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {hasValidCards ? (
                  <>
                    {/* Debt-Free Date Highlight */}
                    <div className="rounded-lg bg-ember/10 border border-ember/20 p-5 text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Debt-Free Date
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold tracking-tight text-ember">
                        {activeResult.months > 0
                          ? activeResult.payoffDate
                          : "Already debt-free!"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeResult.months > 0
                          ? `${activeResult.months} month${activeResult.months !== 1 ? "s" : ""} from now`
                          : "No active card balances"}
                      </p>
                    </div>

                    {/* Savings Callout */}
                    {monthsSaved > 0.5 && (
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4 space-y-1">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                          Extra payments save you{" "}
                          <span className="font-bold">
                            {fmtCurrency(interestSaved)}
                          </span>{" "}
                          in interest
                        </p>
                        {monthsSaved >= 1 && (
                          <p className="text-xs text-green-600 dark:text-green-500">
                            and{" "}
                            {Math.round(monthsSaved)} month{Math.round(monthsSaved) !== 1 ? "s" : ""}{" "}
                            faster than paying minimums only.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Months to Payoff"
                        value={activeResult.months.toString()}
                        subtext={
                          activeResult.months > 12
                            ? `\u2248 ${(activeResult.months / 12).toFixed(1)} years`
                            : activeResult.months <= 1
                              ? "Less than 1 month"
                              : `${activeResult.months} months`
                        }
                      />
                      <ResultCard
                        label="Total Interest"
                        value={fmtCurrency(activeResult.totalInterest)}
                        subtext={`${fmtPercent(activeResult.totalPaid > 0 ? (activeResult.totalInterest / activeResult.totalPaid) * 100 : 0)} of total paid`}
                      />
                      <ResultCard
                        label="Total Paid"
                        value={fmtCurrency(activeResult.totalPaid)}
                        subtext={`Principal ${fmtCurrency(totalBalance)} + interest`}
                      />
                      <ResultCard
                        label="Monthly Payment"
                        value={fmtCurrency(monthlyBudget)}
                        subtext={
                          inputs.mode === "fixed"
                            ? `All minimums + ${fmtCurrency(inputs.fixedPayment)} extra`
                            : "Computed for target months"
                        }
                      />
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
                        summaryText={`Credit card debt-free in ${activeResult.months} months. Total interest: ${fmtCurrency(activeResult.totalInterest)}. Calculate yours:`}
                      />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This calculator provides estimates for informational purposes
                      only. Actual payoff timelines depend on payment processing,
                      fees, and changes to your APR. Always check your statements
                      for accurate balances and rates.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Enter at least one card with a balance to see results.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Comparison Card ─── */}
        {hasValidCards && activeResult.months > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="size-4 text-ember" />
                Minimum Only vs. Extra Payment Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-center">Minimum Only</TableHead>
                      <TableHead className="text-center">With Extra Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Months to Payoff</TableCell>
                      <TableCell className="text-center">
                        {minOnlyResult.months}
                      </TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {activeResult.months}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Interest</TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(minOnlyResult.totalInterest)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {fmtCurrency(activeResult.totalInterest)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Paid</TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(minOnlyResult.totalPaid)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {fmtCurrency(activeResult.totalPaid)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Debt-Free Date</TableCell>
                      <TableCell className="text-center text-sm">
                        {minOnlyResult.payoffDate}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium text-ember">
                        {activeResult.payoffDate}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Summary Box */}
              <div className="mt-4 rounded-lg bg-muted/30 p-4 space-y-1.5">
                {interestSaved > 0.005 ? (
                  <>
                    <p className="text-sm font-medium">
                      Paying an extra{" "}
                      <span className="font-bold text-ember">
                        {inputs.mode === "fixed"
                          ? fmtCurrency(inputs.fixedPayment)
                          : fmtCurrency(monthlyBudget - totalMinPayments)}
                        /mo
                      </span>{" "}
                      saves you{" "}
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {fmtCurrency(interestSaved)}
                      </span>{" "}
                      in interest
                    </p>
                    {monthsSaved >= 1 && (
                      <p className="text-xs text-muted-foreground">
                        and{" "}
                        {Math.round(monthsSaved)} month{Math.round(monthsSaved) !== 1 ? "s" : ""}{" "}
                        faster than paying minimums only.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-medium">
                    No additional savings from extra payments with current settings.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Month-by-Month Schedule ─── */}
        {hasValidCards && activeResult.schedule.length > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="no-print flex w-full items-center justify-between text-left"
                aria-expanded={showSchedule}
              >
                <CardTitle className="text-lg">
                  Month-by-Month Payoff Schedule
                </CardTitle>
                {showSchedule ? (
                  <ChevronUp className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </button>
              <CardTitle className="hidden print:block text-lg">
                Month-by-Month Payoff Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className={showSchedule ? "" : "hidden print:block"}>
              <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Month</TableHead>
                      <TableHead>Card</TableHead>
                      <TableHead className="text-right">Payment</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeResult.schedule.map((m) =>
                      m.cards
                        .filter((d) => d.payment > 0 || m.month <= 1 || m.month === activeResult.months)
                        .map((d, di, arr) => (
                          <TableRow key={`${m.month}-${d.id}`}>
                            {di === 0 ? (
                              <TableCell
                                className="font-medium align-top"
                                rowSpan={arr.length}
                              >
                                {m.month}
                              </TableCell>
                            ) : null}
                            <TableCell className="text-sm align-top">
                              {d.name}
                            </TableCell>
                            <TableCell className="text-right align-top">
                              {d.payment > 0 ? fmtCurrency(d.payment) : "-"}
                            </TableCell>
                            <TableCell className="text-right align-top text-muted-foreground">
                              {d.interest > 0 ? fmtCurrency(d.interest) : "-"}
                            </TableCell>
                            <TableCell className="text-right align-top">
                              {d.principal > 0 ? fmtCurrency(d.principal) : "-"}
                            </TableCell>
                            <TableCell className="text-right align-top font-medium">
                              {fmtCurrency(d.balance)}
                            </TableCell>
                          </TableRow>
                        )),
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm font-medium">
                <span>
                  Total Paid:{" "}
                  <span className="text-ember">{fmtCurrency(activeResult.totalPaid)}</span>
                </span>
                <span>
                  Total Interest:{" "}
                  <span className="text-destructive">{fmtCurrency(activeResult.totalInterest)}</span>
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

function ResultCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
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