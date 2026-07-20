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

interface SalaryInputs {
  annualSalary: number;
  hoursPerWeek: number;
  weeksPerYear: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: SalaryInputs = {
  annualSalary: 60000,
  hoursPerWeek: 40,
  weeksPerYear: 52,
};

/* ─── URL Param Helpers ─── */

function readParams(): SalaryInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const p = new URLSearchParams(window.location.search);
  return {
    annualSalary: Number(p.get("salary")) || DEFAULT_INPUTS.annualSalary,
    hoursPerWeek: Number(p.get("hours")) || DEFAULT_INPUTS.hoursPerWeek,
    weeksPerYear: Number(p.get("weeks")) || DEFAULT_INPUTS.weeksPerYear,
  };
}

function pushParams(inputs: SalaryInputs) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  p.set("salary", String(inputs.annualSalary));
  p.set("hours", String(inputs.hoursPerWeek));
  p.set("weeks", String(inputs.weeksPerYear));
  const url = `${window.location.pathname}?${p.toString()}`;
  window.history.replaceState(null, "", url);
}

/* ─── Computation ─── */

interface SalaryResults {
  hourly: number;
  daily: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  annualHours: number;
}

function compute(inputs: SalaryInputs): SalaryResults {
  const annualHours = inputs.hoursPerWeek * inputs.weeksPerYear;
  const hourly = annualHours > 0 ? inputs.annualSalary / annualHours : 0;
  const daily = hourly * 8;
  const weekly = inputs.weeksPerYear > 0 ? inputs.annualSalary / inputs.weeksPerYear : 0;
  const biweekly = weekly * 2;
  const monthly = inputs.annualSalary / 12;
  return { hourly, daily, weekly, biweekly, monthly, annualHours };
}

/* ─── Quick-reference table (computed, not hardcoded) ─── */

const QUICK_SALARIES = [30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000];

function quickHourly(salary: number): number {
  return salary / (40 * 52);
}

/* ─── Formatting ─── */

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function fmtHourly(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

/* ─── Component ─── */

export default function SalaryToHourlyCalculator() {
  const [inputs, setInputs] = useState<SalaryInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    return readParams();
  });
  const [copied, setCopied] = useState(false);

  const effectiveInputs = inputs;

  const results = useMemo(() => compute(effectiveInputs), [effectiveInputs]);

  const update = useCallback((patch: Partial<SalaryInputs>) => {
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

  const summaryText = `$${effectiveInputs.annualSalary.toLocaleString("en-US")} a year is ${fmtHourly(results.hourly)} an hour at ${effectiveInputs.hoursPerWeek} hours per week. Calculate yours:`;

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-ember" />
            Salary to Hourly Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Annual Salary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="salary">Annual Salary</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Your total gross salary per year before any taxes or deductions.</TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="salary"
                  type="number"
                  min={0}
                  max={1000000}
                  step={1000}
                  value={effectiveInputs.annualSalary}
                  onChange={(e) => update({ annualSalary: Math.max(0, Number(e.target.value)) })}
                  className="pl-7"
                />
              </div>
              <Slider
                min={10000}
                max={250000}
                step={1000}
                value={[effectiveInputs.annualSalary]}
                onValueChange={([v]) => update({ annualSalary: v })}
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
                  <TooltipContent>The standard full-time workweek is 40 hours. Enter your actual average for an accurate hourly rate.</TooltipContent>
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
                  <TooltipContent>52 weeks is a full year. Lower this to 48-50 if you take unpaid time off, since fewer paid weeks means a higher hourly rate for the weeks you do work.</TooltipContent>
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

          {/* Live reference line */}
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-4 py-2.5">
            <strong>${effectiveInputs.annualSalary.toLocaleString("en-US")}</strong> a year is{" "}
            <strong>{fmtHourly(results.hourly)}</strong> an hour at{" "}
            <strong>{effectiveInputs.hoursPerWeek}</strong> hours per week.
          </p>

          {/* Results */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-muted/30 border-ember/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Hourly Rate
                </p>
                <p className="mt-1 text-2xl font-bold text-ember">{fmtHourly(results.hourly)}</p>
                <p className="text-xs text-muted-foreground">
                  {fmt(effectiveInputs.annualSalary)} &divide; {results.annualHours.toLocaleString("en-US")} hours
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Daily Gross (8h)
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.daily)}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtHourly(results.hourly)} &times; 8 hours
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Weekly Gross
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.weekly)}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtHourly(results.hourly)} &times; {effectiveInputs.hoursPerWeek} hours
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
                  {fmt(effectiveInputs.annualSalary)} &divide; 12 months
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick reference table */}
          <Card className="bg-muted/30">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-3">
                Hourly Rate Quick Reference (40h / 52 weeks)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Annual Salary</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Hourly Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {QUICK_SALARIES.map((salary) => {
                      const hr = quickHourly(salary);
                      const isCurrent =
                        effectiveInputs.annualSalary === salary &&
                        effectiveInputs.hoursPerWeek === 40 &&
                        effectiveInputs.weeksPerYear === 52;
                      return (
                        <tr
                          key={salary}
                          className={isCurrent ? "bg-ember/10 border-l-2 border-ember" : "border-b border-border/40 last:border-0"}
                        >
                          <td className="py-2 pr-4 font-medium">{fmt(salary)}</td>
                          <td className="py-2 font-semibold">{fmtHourly(hr)}</td>
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
            <ShareButtons summaryText={summaryText} title="Salary to Hourly Calculator" />
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
