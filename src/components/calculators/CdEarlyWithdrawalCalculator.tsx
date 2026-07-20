"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw, Info, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

type PenaltyType = "3" | "6" | "12" | "custom";

interface CdInputs {
  principal: number;
  apy: number;
  penaltyType: PenaltyType;
  customDays: number;
  monthsHeld: number;
  termMonths: number;
  newApy: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: CdInputs = {
  principal: 10000,
  apy: 4.5,
  penaltyType: "6",
  customDays: 90,
  monthsHeld: 6,
  termMonths: 12,
  newApy: 5.0,
};

/* ─── URL Param Helpers ─── */

function readParams(): CdInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const p = new URLSearchParams(window.location.search);
  const pt = p.get("ptype");
  return {
    principal: Number(p.get("principal")) || DEFAULT_INPUTS.principal,
    apy: Number(p.get("apy")) || DEFAULT_INPUTS.apy,
    penaltyType: (pt === "3" || pt === "6" || pt === "12" || pt === "custom") ? pt : DEFAULT_INPUTS.penaltyType,
    customDays: Number(p.get("days")) || DEFAULT_INPUTS.customDays,
    monthsHeld: Number(p.get("held")) || DEFAULT_INPUTS.monthsHeld,
    termMonths: Number(p.get("term")) || DEFAULT_INPUTS.termMonths,
    newApy: Number(p.get("newapy")) || DEFAULT_INPUTS.newApy,
  };
}

function pushParams(inputs: CdInputs) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  p.set("principal", String(inputs.principal));
  p.set("apy", String(inputs.apy));
  p.set("ptype", inputs.penaltyType);
  if (inputs.penaltyType === "custom") p.set("days", String(inputs.customDays));
  p.set("held", String(inputs.monthsHeld));
  p.set("term", String(inputs.termMonths));
  p.set("newapy", String(inputs.newApy));
  const url = `${window.location.pathname}?${p.toString()}`;
  window.history.replaceState(null, "", url);
}

/* ─── Computation ─── */

interface CdResults {
  penalty: number;
  interestEarned: number;
  netGain: number;
  netProceeds: number;
  monthsRemaining: number;
  keepValue: number;
  keepInterest: number;
  breakValue: number;
  reinvestInterest: number;
  winner: "keep" | "break" | "tie";
  difference: number;
  penaltyExceedsInterest: boolean;
}

function penaltyMonths(type: PenaltyType): number {
  switch (type) {
    case "3": return 3;
    case "6": return 6;
    case "12": return 12;
    default: return 0;
  }
}

function compute(inputs: CdInputs): CdResults {
  const { principal, apy, penaltyType, customDays, monthsHeld, termMonths, newApy } = inputs;

  // Simple-interest convention: monthly interest = principal * APY / 12
  const monthlyInterest = principal * (apy / 100) / 12;

  // Penalty in dollars
  let penalty: number;
  if (penaltyType === "custom") {
    penalty = principal * (apy / 100) * customDays / 365;
  } else {
    const pm = penaltyMonths(penaltyType);
    penalty = principal * (apy / 100) * pm / 12;
  }

  // Interest earned so far
  const interestEarned = principal * (apy / 100) * monthsHeld / 12;

  // Net gain/loss from breaking now
  const netGain = interestEarned - penalty;
  const netProceeds = principal + interestEarned - penalty;

  // Worth-breaking comparison
  const monthsRemaining = Math.max(0, termMonths - monthsHeld);
  const keepInterest = principal * (apy / 100) * monthsRemaining / 12;
  const keepValue = principal + interestEarned + keepInterest;
  const reinvestInterest = netProceeds * (newApy / 100) * monthsRemaining / 12;
  const breakValue = netProceeds + reinvestInterest;
  const difference = breakValue - keepValue;
  const winner: "keep" | "break" | "tie" =
    Math.abs(difference) < 0.005 ? "tie" : difference > 0 ? "break" : "keep";

  const penaltyExceedsInterest = penalty > interestEarned;

  return {
    penalty,
    interestEarned,
    netGain,
    netProceeds,
    monthsRemaining,
    keepValue,
    keepInterest,
    breakValue,
    reinvestInterest,
    winner,
    difference,
    penaltyExceedsInterest,
  };
}

/* ─── Formatting ─── */

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

/* ─── Component ─── */

export default function CdEarlyWithdrawalCalculator() {
  const [inputs, setInputs] = useState<CdInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    return readParams();
  });
  const [copied, setCopied] = useState(false);

  const effectiveInputs = inputs;

  const results = useMemo(() => compute(effectiveInputs), [effectiveInputs]);

  const update = useCallback((patch: Partial<CdInputs>) => {
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
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") window.print();
  }, []);

  const penaltyLabel =
    effectiveInputs.penaltyType === "custom"
      ? `${effectiveInputs.customDays} days of interest`
      : `${effectiveInputs.penaltyType} months of interest`;

  const summaryText = `A ${penaltyLabel} penalty on a ${fmt(effectiveInputs.principal)} CD at ${effectiveInputs.apy}% APY is ${fmt(results.penalty)}. Calculate yours:`;

  const winnerText =
    results.winner === "tie"
      ? "Both options finish equal"
      : results.winner === "break"
        ? "Break the CD and reinvest wins"
        : "Keep the CD to maturity wins";

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-ember" />
            CD Early Withdrawal Penalty Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Principal */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="principal">CD Principal</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>The amount you deposited into the CD.</TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="principal"
                  type="number"
                  min={100}
                  max={10000000}
                  step={500}
                  value={effectiveInputs.principal}
                  onChange={(e) => update({ principal: Math.max(0, Number(e.target.value)) })}
                  className="pl-7"
                />
              </div>
              <Slider
                min={500}
                max={250000}
                step={500}
                value={[effectiveInputs.principal]}
                onValueChange={([v]) => update({ principal: v })}
              />
            </div>

            {/* APY */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="apy">CD APY (%)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>The annual percentage yield (APY) your CD earns. The calculator uses simple interest on this rate.</TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <Input
                  id="apy"
                  type="number"
                  min={0}
                  max={20}
                  step={0.05}
                  value={effectiveInputs.apy}
                  onChange={(e) => update({ apy: Math.max(0, Number(e.target.value)) })}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
              </div>
              <Slider
                min={0}
                max={10}
                step={0.05}
                value={[effectiveInputs.apy]}
                onValueChange={([v]) => update({ apy: v })}
              />
            </div>

            {/* Penalty Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Penalty Type</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Common schedules: 3 months for terms under 1 year, 6 months for 1-2 years, 12 months for longer. Check your deposit agreement.</TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={effectiveInputs.penaltyType}
                onValueChange={(v) => update({ penaltyType: v as PenaltyType })}
              >
                <SelectTrigger id="penalty-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months of interest</SelectItem>
                  <SelectItem value="6">6 months of interest</SelectItem>
                  <SelectItem value="12">12 months of interest</SelectItem>
                  <SelectItem value="custom">Custom days of interest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom days (conditional) */}
            {effectiveInputs.penaltyType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="days">Custom Penalty (days)</Label>
                <Input
                  id="days"
                  type="number"
                  min={1}
                  max={365}
                  step={1}
                  value={effectiveInputs.customDays}
                  onChange={(e) => update({ customDays: Math.max(1, Math.min(365, Number(e.target.value))) })}
                />
              </div>
            )}

            {/* Months Held */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="held">Months Already Held</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>How many months the CD has been held. Used to compute interest earned so far.</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  min={0}
                  max={Math.max(1, effectiveInputs.termMonths)}
                  step={1}
                  value={[Math.min(effectiveInputs.monthsHeld, effectiveInputs.termMonths)]}
                  onValueChange={([v]) => update({ monthsHeld: v })}
                  className="flex-1"
                />
                <Input
                  id="held"
                  type="number"
                  min={0}
                  max={effectiveInputs.termMonths}
                  step={1}
                  value={effectiveInputs.monthsHeld}
                  onChange={(e) => update({ monthsHeld: Math.max(0, Math.min(effectiveInputs.termMonths, Number(e.target.value))) })}
                  className="w-20"
                />
              </div>
            </div>

            {/* Term */}
            <div className="space-y-2">
              <Label htmlFor="term">Total CD Term (months)</Label>
              <Input
                id="term"
                type="number"
                min={1}
                max={120}
                step={1}
                value={effectiveInputs.termMonths}
                onChange={(e) => update({ termMonths: Math.max(1, Number(e.target.value)) })}
              />
            </div>
          </div>

          {/* Live reference line */}
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-4 py-2.5">
            A <strong>{penaltyLabel}</strong> penalty on a{" "}
            <strong>{fmt(effectiveInputs.principal)}</strong> CD at{" "}
            <strong>{effectiveInputs.apy}% APY</strong> is{" "}
            <strong>{fmt(results.penalty)}</strong>.
          </p>

          {/* Results */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-muted/30 border-ember/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Penalty
                </p>
                <p className="mt-1 text-2xl font-bold text-ember">{fmt(results.penalty)}</p>
                <p className="text-xs text-muted-foreground">
                  {penaltyLabel} on {fmt(effectiveInputs.principal)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Interest Earned So Far
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.interestEarned)}</p>
                <p className="text-xs text-muted-foreground">
                  {effectiveInputs.monthsHeld} months at {effectiveInputs.apy}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Net Gain / Loss
                </p>
                <p className={`mt-1 text-2xl font-bold ${results.netGain < 0 ? "text-red-600" : ""}`}>
                  {results.netGain < 0 ? "-" : ""}{fmt(Math.abs(results.netGain))}
                </p>
                <p className="text-xs text-muted-foreground">
                  Interest earned minus penalty
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 sm:col-span-2 lg:col-span-3">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Net Proceeds (if you break now)
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.netProceeds)}</p>
                <p className="text-xs text-muted-foreground">
                  {fmt(effectiveInputs.principal)} + {fmt(results.interestEarned)} &minus; {fmt(results.penalty)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Edge case warning */}
          {results.penaltyExceedsInterest && (
            <div className="flex gap-3 rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-4">
              <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                <p className="font-semibold mb-1">Penalty exceeds interest earned</p>
                <p>
                  The penalty ({fmt(results.penalty)}) is larger than the
                  interest earned so far ({fmt(results.interestEarned)}). Some
                  banks cap the penalty at accrued interest, while others
                  deduct the difference from principal, so you could receive
                  back less than you deposited. Check your deposit agreement or
                  Truth in Savings disclosure to confirm your bank&apos;s policy.
                </p>
              </div>
            </div>
          )}

          {/* Is it worth breaking comparison */}
          <Card className="border-ember/30">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">Is It Worth Breaking?</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare keeping your CD to maturity against breaking now, paying
                the penalty, and reinvesting the net proceeds at a new APY for
                the {results.monthsRemaining} months remaining.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newapy">New APY Available Elsewhere (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      min={0}
                      max={15}
                      step={0.05}
                      value={[effectiveInputs.newApy]}
                      onValueChange={([v]) => update({ newApy: v })}
                      className="flex-1"
                    />
                    <Input
                      id="newapy"
                      type="number"
                      min={0}
                      max={20}
                      step={0.05}
                      value={effectiveInputs.newApy}
                      onChange={(e) => update({ newApy: Math.max(0, Number(e.target.value)) })}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className={`bg-muted/30 ${results.winner === "keep" ? "border-ember/40" : ""}`}>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Keep to Maturity
                    </p>
                    <p className="mt-1 text-2xl font-bold">{fmt(results.keepValue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmt(effectiveInputs.principal)} + {fmt(results.interestEarned)} earned + {fmt(results.keepInterest)} remaining
                    </p>
                  </CardContent>
                </Card>
                <Card className={`bg-muted/30 ${results.winner === "break" ? "border-ember/40" : ""}`}>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Break &amp; Reinvest
                    </p>
                    <p className="mt-1 text-2xl font-bold">{fmt(results.breakValue)}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmt(results.netProceeds)} proceeds + {fmt(results.reinvestInterest)} at {effectiveInputs.newApy}%
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className={`rounded-md px-4 py-3 text-sm font-semibold ${results.winner === "break" ? "bg-ember/10 text-ember" : results.winner === "keep" ? "bg-muted text-foreground" : "bg-muted text-muted-foreground"}`}>
                {winnerText}
                {results.winner !== "tie" && (
                  <span className="font-normal">
                    {" "}by {fmt(Math.abs(results.difference))}
                  </span>
                )}
                .
              </div>
            </CardContent>
          </Card>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
            <ShareButtons summaryText={summaryText} title="CD Early Withdrawal Penalty Calculator" />
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
