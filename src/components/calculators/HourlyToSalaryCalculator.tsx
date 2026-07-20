"use client";

import { useState, useCallback, useMemo } from "react";
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
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

interface HourlyInputs {
  hourlyWage: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  otHours: number;
  otMultiplier: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: HourlyInputs = {
  hourlyWage: 20,
  hoursPerWeek: 40,
  weeksPerYear: 52,
  otHours: 0,
  otMultiplier: 1.5,
};

/* ─── URL Param Helpers ─── */

function readParams(): HourlyInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const p = new URLSearchParams(window.location.search);
  return {
    hourlyWage: Number(p.get("wage")) || DEFAULT_INPUTS.hourlyWage,
    hoursPerWeek: Number(p.get("hours")) || DEFAULT_INPUTS.hoursPerWeek,
    weeksPerYear: Number(p.get("weeks")) || DEFAULT_INPUTS.weeksPerYear,
    otHours: Number(p.get("othrs")) || 0,
    otMultiplier: Number(p.get("otmult")) || DEFAULT_INPUTS.otMultiplier,
  };
}

function pushParams(inputs: HourlyInputs) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  p.set("wage", String(inputs.hourlyWage));
  p.set("hours", String(inputs.hoursPerWeek));
  p.set("weeks", String(inputs.weeksPerYear));
  if (inputs.otHours > 0) {
    p.set("othrs", String(inputs.otHours));
    p.set("otmult", String(inputs.otMultiplier));
  }
  const url = `${window.location.pathname}?${p.toString()}`;
  window.history.replaceState(null, "", url);
}

/* ─── Computation ─── */

interface HourlyResults {
  weeklyRegular: number;
  weeklyOvertime: number;
  weeklyTotal: number;
  annualWithoutOt: number;
  annualWithOt: number;
  biweekly: number;
  monthly: number;
}

function compute(inputs: HourlyInputs): HourlyResults {
  const weeklyRegular = inputs.hourlyWage * inputs.hoursPerWeek;
  const otRate = inputs.hourlyWage * inputs.otMultiplier;
  const weeklyOvertime = otRate * inputs.otHours;
  const weeklyTotal = weeklyRegular + weeklyOvertime;
  const annualWithoutOt = weeklyRegular * inputs.weeksPerYear;
  const annualWithOt = weeklyTotal * inputs.weeksPerYear;
  const biweekly = weeklyTotal * 2;
  const monthly = annualWithOt / 12;
  return {
    weeklyRegular,
    weeklyOvertime,
    weeklyTotal,
    annualWithoutOt,
    annualWithOt,
    biweekly,
    monthly,
  };
}

/* ─── Quick-reference table (computed, not hardcoded) ─── */

const QUICK_WAGES = [12, 15, 18, 20, 22, 25, 30, 35, 40];

function quickAnnual(wage: number): number {
  return wage * 40 * 52;
}

/* ─── Formatting ─── */

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function fmtWage(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

/* ─── Component ─── */

export default function HourlyToSalaryCalculator() {
  const [inputs, setInputs] = useState<HourlyInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    return readParams();
  });
  const [copied, setCopied] = useState(false);

  const effectiveInputs = inputs;

  const results = useMemo(() => compute(effectiveInputs), [effectiveInputs]);

  const update = useCallback((patch: Partial<HourlyInputs>) => {
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

  const annualDisplay = effectiveInputs.otHours > 0 ? results.annualWithOt : results.annualWithoutOt;
  const summaryText = `${fmtWage(effectiveInputs.hourlyWage)} an hour is ${fmt(annualDisplay)} a year at ${effectiveInputs.hoursPerWeek} hours per week. Calculate yours:`;

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-ember" />
            Hourly to Salary Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Hourly Wage */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="wage">Hourly Wage</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Your regular hourly rate before any overtime multipliers.</TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="wage"
                  type="number"
                  min={7.25}
                  max={500}
                  step={0.25}
                  value={effectiveInputs.hourlyWage}
                  onChange={(e) => update({ hourlyWage: Math.max(0, Number(e.target.value)) })}
                  className="pl-7"
                />
              </div>
              <Slider
                min={7.25}
                max={100}
                step={0.25}
                value={[effectiveInputs.hourlyWage]}
                onValueChange={([v]) => update({ hourlyWage: v })}
              />
            </div>

            {/* Hours Per Week */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="hours">Hours Per Week</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>The standard full-time workweek is 40 hours. Enter your actual average for an accurate annual salary.</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="hours"
                type="number"
                min={10}
                max={80}
                step={1}
                value={effectiveInputs.hoursPerWeek}
                onChange={(e) => update({ hoursPerWeek: Math.max(10, Math.min(80, Number(e.target.value))) })}
              />
              <Slider
                min={10}
                max={80}
                step={1}
                value={[effectiveInputs.hoursPerWeek]}
                onValueChange={([v]) => update({ hoursPerWeek: v })}
              />
            </div>

            {/* Weeks Per Year */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="weeks">Weeks Per Year</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>52 weeks is a full year. Lower this to 48-50 if you take unpaid time off, since fewer paid weeks reduces your annual total.</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  min={48}
                  max={52}
                  step={1}
                  value={[effectiveInputs.weeksPerYear]}
                  onValueChange={([v]) => update({ weeksPerYear: v })}
                  className="flex-1"
                />
                <Input
                  id="weeks"
                  type="number"
                  min={48}
                  max={52}
                  step={1}
                  value={effectiveInputs.weeksPerYear}
                  onChange={(e) => update({ weeksPerYear: Math.max(48, Math.min(52, Number(e.target.value))) })}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          {/* Optional overtime block */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-4">
            <p className="text-sm font-semibold">
              Optional: Add Overtime
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                Adds to the annual total only when OT hours are greater than 0
              </span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="othrs">OT Hours Per Week</Label>
                <Input
                  id="othrs"
                  type="number"
                  min={0}
                  max={40}
                  step={0.5}
                  value={effectiveInputs.otHours}
                  onChange={(e) => update({ otHours: Math.max(0, Math.min(40, Number(e.target.value))) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otmult">OT Multiplier</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="otmult"
                    type="number"
                    min={1}
                    max={3}
                    step={0.5}
                    value={effectiveInputs.otMultiplier}
                    onChange={(e) => update({ otMultiplier: Math.max(1, Math.min(3, Number(e.target.value))) })}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    1.5x = time and a half
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Live reference line */}
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-4 py-2.5">
            <strong>{fmtWage(effectiveInputs.hourlyWage)}</strong> an hour is{" "}
            <strong>{fmt(annualDisplay)}</strong> a year at{" "}
            <strong>{effectiveInputs.hoursPerWeek}</strong> hours per week
            {effectiveInputs.otHours > 0
              ? ` with ${effectiveInputs.otHours} OT hours at ${effectiveInputs.otMultiplier}x.`
              : "."}
          </p>

          {/* Results */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-muted/30 border-ember/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Annual Salary (Gross)
                </p>
                <p className="mt-1 text-2xl font-bold text-ember">{fmt(results.annualWithOt)}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtWage(effectiveInputs.hourlyWage)} &times; {effectiveInputs.hoursPerWeek}h &times; {effectiveInputs.weeksPerYear}w
                  {effectiveInputs.otHours > 0 ? " + OT" : ""}
                </p>
              </CardContent>
            </Card>
            {effectiveInputs.otHours > 0 && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Without Overtime
                  </p>
                  <p className="mt-1 text-2xl font-bold">{fmt(results.annualWithoutOt)}</p>
                  <p className="text-xs text-muted-foreground">
                    Regular hours only, no OT
                  </p>
                </CardContent>
              </Card>
            )}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Weekly Gross
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.weeklyTotal)}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtWage(effectiveInputs.hourlyWage)} &times; {effectiveInputs.hoursPerWeek}h
                  {effectiveInputs.otHours > 0
                    ? ` + ${fmt(results.weeklyOvertime)} OT`
                    : ""}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Biweekly Gross
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.biweekly)}</p>
                <p className="text-xs text-muted-foreground">
                  Weekly gross &times; 2 paychecks
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 sm:col-span-2 lg:col-span-2">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Monthly Gross
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.monthly)}</p>
                <p className="text-xs text-muted-foreground">
                  {fmt(results.annualWithOt)} &divide; 12 months
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick reference table */}
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3">
                Annual Salary Quick Reference (40h / 52 weeks)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Hourly Wage</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Annual Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {QUICK_WAGES.map((wage) => {
                      const annual = quickAnnual(wage);
                      const isCurrent =
                        effectiveInputs.hourlyWage === wage &&
                        effectiveInputs.hoursPerWeek === 40 &&
                        effectiveInputs.weeksPerYear === 52 &&
                        effectiveInputs.otHours === 0;
                      return (
                        <tr
                          key={wage}
                          className={isCurrent ? "bg-ember/10 border-l-2 border-ember" : "border-b border-border/40 last:border-0"}
                        >
                          <td className="py-2 pr-4 font-medium">{fmtWage(wage)}/hr</td>
                          <td className="py-2 font-semibold">{fmt(annual)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                All figures gross, before taxes and deductions. Computed live by the same formula as the calculator above.
              </p>
            </CardContent>
          </Card>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
            <ShareButtons summaryText={summaryText} title="Hourly to Salary Calculator" />
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
