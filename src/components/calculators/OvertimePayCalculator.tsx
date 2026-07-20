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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import ShareButtons from "@/components/calculators/ShareButtons";

/* ─── Types ─── */

type OvertimeType = "1.5" | "2" | "custom";
type PayPeriod = "weekly" | "biweekly" | "monthly";

interface OvertimeInputs {
  hourlyWage: number;
  regularHours: number;
  overtimeHours: number;
  overtimeType: OvertimeType;
  customMultiplier: number;
  payPeriod: PayPeriod;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: OvertimeInputs = {
  hourlyWage: 18,
  regularHours: 40,
  overtimeHours: 5,
  overtimeType: "1.5",
  customMultiplier: 2,
  payPeriod: "weekly",
};

function getMultiplier(inputs: OvertimeInputs): number {
  if (inputs.overtimeType === "custom") return inputs.customMultiplier;
  return Number(inputs.overtimeType);
}

function periodLabel(period: PayPeriod): string {
  switch (period) {
    case "weekly": return "weekly";
    case "biweekly": return "biweekly";
    case "monthly": return "monthly";
  }
}

function periodMultiplier(period: PayPeriod): number {
  switch (period) {
    case "weekly": return 1;
    case "biweekly": return 2;
    case "monthly": return 52 / 12;
  }
}

/* ─── URL Param Helpers ─── */

function readParams(): OvertimeInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const p = new URLSearchParams(window.location.search);
  return {
    hourlyWage: Number(p.get("wage")) || DEFAULT_INPUTS.hourlyWage,
    regularHours: Number(p.get("reg")) || DEFAULT_INPUTS.regularHours,
    overtimeHours: Number(p.get("ot")) || DEFAULT_INPUTS.overtimeHours,
    overtimeType: (p.get("type") as OvertimeType) || DEFAULT_INPUTS.overtimeType,
    customMultiplier: Number(p.get("mult")) || DEFAULT_INPUTS.customMultiplier,
    payPeriod: (p.get("period") as PayPeriod) || DEFAULT_INPUTS.payPeriod,
  };
}

function pushParams(inputs: OvertimeInputs) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  p.set("wage", String(inputs.hourlyWage));
  p.set("reg", String(inputs.regularHours));
  p.set("ot", String(inputs.overtimeHours));
  p.set("type", inputs.overtimeType);
  if (inputs.overtimeType === "custom") p.set("mult", String(inputs.customMultiplier));
  p.set("period", inputs.payPeriod);
  const url = `${window.location.pathname}?${p.toString()}`;
  window.history.replaceState(null, "", url);
}

/* ─── Computation ─── */

interface OvertimeResults {
  otRate: number;
  otPay: number;
  regularPay: number;
  totalPay: number;
  annualGross: number;
  multiplier: number;
}

function compute(inputs: OvertimeInputs): OvertimeResults {
  const mult = getMultiplier(inputs);
  const otRate = inputs.hourlyWage * mult;
  const regularPay = inputs.hourlyWage * inputs.regularHours;
  const otPay = otRate * inputs.overtimeHours;
  const weeklyTotal = regularPay + otPay;
  const pm = periodMultiplier(inputs.payPeriod);
  return {
    otRate,
    otPay,
    regularPay,
    totalPay: weeklyTotal * pm,
    annualGross: weeklyTotal * 52,
    multiplier: mult,
  };
}

/* ─── Formatting ─── */

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

/* ─── Component ─── */

export default function OvertimePayCalculator() {
  const [inputs, setInputs] = useState<OvertimeInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    return readParams();
  });
  const [copied, setCopied] = useState(false);

  const effectiveInputs = inputs;

  const results = useMemo(() => compute(effectiveInputs), [effectiveInputs]);

  const update = useCallback((patch: Partial<OvertimeInputs>) => {
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

  const mult = getMultiplier(effectiveInputs);
  const summaryText = `At $${effectiveInputs.hourlyWage}/hr with ${effectiveInputs.overtimeHours} OT hours at ${mult}x: ${fmt(results.totalPay)} ${periodLabel(effectiveInputs.payPeriod)} gross (${fmt(results.annualGross)}/yr). Calculate yours:`;

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-ember" />
            Overtime Pay Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inputs */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Hourly Wage */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="wage">Regular Hourly Wage</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Your base pay rate before any overtime multiplier is applied.</TooltipContent>
                </Tooltip>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id="wage"
                  type="number"
                  min={1}
                  max={500}
                  step={0.50}
                  value={effectiveInputs.hourlyWage}
                  onChange={(e) => update({ hourlyWage: Math.max(0, Number(e.target.value)) })}
                  className="pl-7"
                />
              </div>
              <Slider
                min={1}
                max={100}
                step={0.50}
                value={[effectiveInputs.hourlyWage]}
                onValueChange={([v]) => update({ hourlyWage: v })}
              />
            </div>

            {/* Regular Hours */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="regularHours">Regular Hours / Week</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Standard hours before overtime kicks in. The FLSA threshold is 40 hours per week.</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="regularHours"
                type="number"
                min={0}
                max={80}
                step={1}
                value={effectiveInputs.regularHours}
                onChange={(e) => update({ regularHours: Math.max(0, Math.min(80, Number(e.target.value))) })}
              />
              <Slider
                min={0}
                max={60}
                step={1}
                value={[effectiveInputs.regularHours]}
                onValueChange={([v]) => update({ regularHours: v })}
              />
            </div>

            {/* Overtime Hours */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="otHours">Overtime Hours / Week</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Hours worked beyond your regular hours. Under FLSA, hours over 40 in a workweek.</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="otHours"
                type="number"
                min={0}
                max={80}
                step={1}
                value={effectiveInputs.overtimeHours}
                onChange={(e) => update({ overtimeHours: Math.max(0, Math.min(80, Number(e.target.value))) })}
              />
              <Slider
                min={0}
                max={40}
                step={1}
                value={[effectiveInputs.overtimeHours]}
                onValueChange={([v]) => update({ overtimeHours: v })}
              />
            </div>

            {/* Overtime Multiplier */}
            <div className="space-y-2">
              <Label>Overtime Multiplier</Label>
              <Select
                value={effectiveInputs.overtimeType}
                onValueChange={(v: OvertimeType) => update({ overtimeType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.5">Time and a Half (1.5x)</SelectItem>
                  <SelectItem value="2">Double Time (2x)</SelectItem>
                  <SelectItem value="custom">Custom Multiplier</SelectItem>
                </SelectContent>
              </Select>
              {effectiveInputs.overtimeType === "custom" && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">&times;</span>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={effectiveInputs.customMultiplier}
                    onChange={(e) => update({ customMultiplier: Math.max(1, Number(e.target.value)) })}
                    className="pl-8"
                    placeholder="e.g. 2.5"
                  />
                </div>
              )}
            </div>

            {/* Pay Period */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Pay Period</Label>
              <Select
                value={effectiveInputs.payPeriod}
                onValueChange={(v: PayPeriod) => update({ payPeriod: v })}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Live reference line */}
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-4 py-2.5">
            Time and a half for <strong>${effectiveInputs.hourlyWage.toFixed(2)}</strong> is{" "}
            <strong>${(effectiveInputs.hourlyWage * 1.5).toFixed(2)}</strong> per hour.
            {mult !== 1.5 && (
              <> At {mult}x, your OT rate is <strong>${results.otRate.toFixed(2)}</strong> per hour.</>
            )}
          </p>

          {/* Results */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Overtime Hourly Rate
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.otRate)}</p>
                <p className="text-xs text-muted-foreground">
                  {effectiveInputs.hourlyWage.toFixed(2)} &times; {mult}x
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Regular Pay
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.regularPay)}</p>
                <p className="text-xs text-muted-foreground">
                  {effectiveInputs.regularHours}h &times; {fmt(effectiveInputs.hourlyWage)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Overtime Pay
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.otPay)}</p>
                <p className="text-xs text-muted-foreground">
                  {effectiveInputs.overtimeHours}h &times; {fmt(results.otRate)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-ember/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Gross ({periodLabel(effectiveInputs.payPeriod)})
                </p>
                <p className="mt-1 text-2xl font-bold text-ember">{fmt(results.totalPay)}</p>
                <p className="text-xs text-muted-foreground">
                  Regular + overtime (before taxes)
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 sm:col-span-2 lg:col-span-2">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Annualized Gross Income
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.annualGross)}</p>
                <p className="text-xs text-muted-foreground">
                  Weekly gross ({fmt(results.regularPay + results.otPay)}) &times; 52 weeks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
            <ShareButtons summaryText={summaryText} title="Overtime Pay Calculator" />
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