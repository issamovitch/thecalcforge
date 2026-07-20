"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Calculator, Copy, Check, Printer, RotateCcw, Info,
  Plus, Trash2, TrendingUp, TrendingDown,
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

interface Row {
  id: string;
  label: string;
  amount: number;
}

interface NetWorthInputs {
  assets: Row[];
  liabilities: Row[];
  age: number;
}

/* ─── Benchmark Data (Federal Reserve Survey of Consumer Finances 2022) ─── */
/* Source: Federal Reserve SCF 2022, released October 2023 (latest available). */
/* Figures are in 2022 dollars. Next SCF release expected late 2026. */

interface Bracket {
  label: string;
  min: number;
  max: number;
  median: number;
  average: number;
}

export const NET_WORTH_BENCHMARKS: readonly Bracket[] = [
  { label: "Under 35", min: 18, max: 34, median: 39000, average: 183500 },
  { label: "35-44", min: 35, max: 44, median: 135600, average: 549600 },
  { label: "45-54", min: 45, max: 54, median: 247200, average: 975800 },
  { label: "55-64", min: 55, max: 64, median: 364500, average: 1566900 },
  { label: "65-74", min: 65, max: 74, median: 409900, average: 1794600 },
  { label: "75+", min: 75, max: 200, median: 335600, average: 1624100 },
] as const;

export const ALL_HOUSEHOLDS = {
  median: 192700,
  average: 1063700,
} as const;

/* ─── Defaults (match the worked example) ─── */

const DEFAULT_ASSETS: Row[] = [
  { id: "a1", label: "Cash and savings", amount: 50000 },
  { id: "a2", label: "Retirement accounts", amount: 80000 },
  { id: "a3", label: "Investment accounts", amount: 0 },
  { id: "a4", label: "Home value", amount: 350000 },
  { id: "a5", label: "Vehicles", amount: 15000 },
  { id: "a6", label: "Other assets", amount: 0 },
];

const DEFAULT_LIABILITIES: Row[] = [
  { id: "l1", label: "Mortgage balance", amount: 250000 },
  { id: "l2", label: "Auto loans", amount: 12000 },
  { id: "l3", label: "Student loans", amount: 0 },
  { id: "l4", label: "Credit cards", amount: 8000 },
  { id: "l5", label: "Other debts", amount: 0 },
];

export const DEFAULT_INPUTS: NetWorthInputs = {
  assets: DEFAULT_ASSETS,
  liabilities: DEFAULT_LIABILITIES,
  age: 40,
};

/* ─── URL Param Helpers ─── */
/* Encoding: age=40&a=Label|amount,Label|amount&l=Label|amount,Label|amount */

function encodeRows(rows: Row[]): string {
  return rows
    .map((r) => `${encodeURIComponent(r.label)}|${r.amount}`)
    .join(",");
}

function decodeRows(s: string | null, fallback: Row[]): Row[] {
  if (!s) return fallback;
  try {
    const parts = s.split(",");
    return parts.map((part, idx) => {
      const [labelEnc, amtStr] = part.split("|");
      return {
        id: `r${idx}_${Math.random().toString(36).slice(2, 7)}`,
        label: decodeURIComponent(labelEnc || ""),
        amount: Number(amtStr) || 0,
      };
    });
  } catch {
    return fallback;
  }
}

function readParams(): NetWorthInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const p = new URLSearchParams(window.location.search);
  const age = Number(p.get("age"));
  return {
    assets: decodeRows(p.get("a"), DEFAULT_ASSETS),
    liabilities: decodeRows(p.get("l"), DEFAULT_LIABILITIES),
    age: age >= 18 && age <= 90 ? age : DEFAULT_INPUTS.age,
  };
}

function pushParams(inputs: NetWorthInputs) {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  p.set("age", String(inputs.age));
  p.set("a", encodeRows(inputs.assets));
  p.set("l", encodeRows(inputs.liabilities));
  const url = `${window.location.pathname}?${p.toString()}`;
  window.history.replaceState(null, "", url);
}

/* ─── Computation ─── */

interface NetWorthResults {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  homeValue: number;
  mortgageBalance: number;
  homeEquity: number;
  netWorthExcludingHome: number;
  bracket: Bracket | null;
  aboveMedian: boolean | null;
  aboveAverage: boolean | null;
}

function findBracket(age: number): Bracket | null {
  return NET_WORTH_BENCHMARKS.find((b) => age >= b.min && age <= b.max) || null;
}

function compute(inputs: NetWorthInputs): NetWorthResults {
  const totalAssets = inputs.assets.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalLiabilities = inputs.liabilities.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const homeRow = inputs.assets.find((r) => /home/i.test(r.label));
  const mortgageRow = inputs.liabilities.find((r) => /mortgage/i.test(r.label));
  const homeValue = homeRow ? (Number(homeRow.amount) || 0) : 0;
  const mortgageBalance = mortgageRow ? (Number(mortgageRow.amount) || 0) : 0;
  const homeEquity = homeValue - mortgageBalance;
  const netWorthExcludingHome = netWorth - homeEquity;

  const bracket = findBracket(inputs.age);
  const aboveMedian = bracket ? netWorth >= bracket.median : null;
  const aboveAverage = bracket ? netWorth >= bracket.average : null;

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    homeValue,
    mortgageBalance,
    homeEquity,
    netWorthExcludingHome,
    bracket,
    aboveMedian,
    aboveAverage,
  };
}

/* ─── Formatting ─── */

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function makeId(): string {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/* ─── Component ─── */

export default function NetWorthCalculator() {
  const [inputs, setInputs] = useState<NetWorthInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    return readParams();
  });
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => compute(inputs), [inputs]);

  const update = useCallback((patch: Partial<NetWorthInputs>) => {
    setInputs((prev) => {
      const next = { ...prev, ...patch };
      pushParams(next);
      return next;
    });
  }, []);

  const updateAsset = useCallback((id: string, patch: Partial<Row>) => {
    setInputs((prev) => {
      const next = {
        ...prev,
        assets: prev.assets.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
      pushParams(next);
      return next;
    });
  }, []);

  const updateLiability = useCallback((id: string, patch: Partial<Row>) => {
    setInputs((prev) => {
      const next = {
        ...prev,
        liabilities: prev.liabilities.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
      pushParams(next);
      return next;
    });
  }, []);

  const addAsset = useCallback(() => {
    setInputs((prev) => {
      const next = {
        ...prev,
        assets: [...prev.assets, { id: makeId(), label: "", amount: 0 }],
      };
      pushParams(next);
      return next;
    });
  }, []);

  const addLiability = useCallback(() => {
    setInputs((prev) => {
      const next = {
        ...prev,
        liabilities: [...prev.liabilities, { id: makeId(), label: "", amount: 0 }],
      };
      pushParams(next);
      return next;
    });
  }, []);

  const removeAsset = useCallback((id: string) => {
    setInputs((prev) => {
      if (prev.assets.length <= 1) return prev;
      const next = { ...prev, assets: prev.assets.filter((r) => r.id !== id) };
      pushParams(next);
      return next;
    });
  }, []);

  const removeLiability = useCallback((id: string) => {
    setInputs((prev) => {
      if (prev.liabilities.length <= 1) return prev;
      const next = { ...prev, liabilities: prev.liabilities.filter((r) => r.id !== id) };
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

  const summaryText = `Net worth ${fmt(results.netWorth)} at age ${inputs.age} (${results.bracket ? results.bracket.label : "all ages"} bracket). Calculate yours:`;

  const comparisonSentence = (() => {
    if (!results.bracket) return null;
    const b = results.bracket;
    if (results.aboveMedian) {
      return `At age ${inputs.age} (${b.label}) with a net worth of ${fmt(results.netWorth)}, you are above the median of ${fmt(b.median)} for your age bracket.`;
    }
    return `At age ${inputs.age} (${b.label}) with a net worth of ${fmt(results.netWorth)}, you are below the median of ${fmt(b.median)} for your age bracket.`;
  })();

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-ember" />
            Net Worth by Age Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Assets Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Assets</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Everything you own that has value. Add or remove rows as needed.</TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Total: <strong className="text-foreground">{fmt(results.totalAssets)}</strong>
              </span>
            </div>
            <div className="space-y-2">
              {inputs.assets.map((row) => (
                <div key={row.id} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateAsset(row.id, { label: e.target.value })}
                    placeholder="Asset name"
                    className="flex-1"
                    aria-label="Asset name"
                  />
                  <div className="relative w-40 sm:w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={row.amount}
                      onChange={(e) => updateAsset(row.id, { amount: Math.max(0, Number(e.target.value)) })}
                      className="pl-7"
                      aria-label="Asset amount"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-9 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeAsset(row.id)}
                    disabled={inputs.assets.length <= 1}
                    aria-label="Remove asset row"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addAsset} className="w-full">
              <Plus className="size-3.5 mr-1.5" />
              Add asset row
            </Button>
          </div>

          {/* Liabilities Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Liabilities</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>Everything you owe. Add or remove rows as needed.</TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Total: <strong className="text-foreground">{fmt(results.totalLiabilities)}</strong>
              </span>
            </div>
            <div className="space-y-2">
              {inputs.liabilities.map((row) => (
                <div key={row.id} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateLiability(row.id, { label: e.target.value })}
                    placeholder="Liability name"
                    className="flex-1"
                    aria-label="Liability name"
                  />
                  <div className="relative w-40 sm:w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={row.amount}
                      onChange={(e) => updateLiability(row.id, { amount: Math.max(0, Number(e.target.value)) })}
                      className="pl-7"
                      aria-label="Liability amount"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-9 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLiability(row.id)}
                    disabled={inputs.liabilities.length <= 1}
                    aria-label="Remove liability row"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addLiability} className="w-full">
              <Plus className="size-3.5 mr-1.5" />
              Add liability row
            </Button>
          </div>

          {/* Age Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="age">Your Age</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>Used to find your age bracket from the Federal Reserve SCF 2022 benchmark data.</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                min={18}
                max={90}
                step={1}
                value={[inputs.age]}
                onValueChange={([v]) => update({ age: v })}
                className="flex-1"
              />
              <Input
                id="age"
                type="number"
                min={18}
                max={90}
                step={1}
                value={inputs.age}
                onChange={(e) => update({ age: Math.max(18, Math.min(90, Number(e.target.value) || 18)) })}
                className="w-20"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {results.bracket
                ? `Age bracket: ${results.bracket.label}`
                : "Enter an age between 18 and 90."}
            </p>
          </div>

          {/* Live reference line */}
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-md px-4 py-2.5">
            Your net worth is <strong className={results.netWorth < 0 ? "text-red-600" : ""}>{fmt(results.netWorth)}</strong>
            {" "}({fmt(results.totalAssets)} assets &minus; {fmt(results.totalLiabilities)} liabilities)
            {results.bracket ? <> at age {inputs.age} ({results.bracket.label}).</> : "."}
          </p>

          {/* Results */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Assets
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.totalAssets)}</p>
                <p className="text-xs text-muted-foreground">
                  Sum of all asset rows
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Liabilities
                </p>
                <p className="mt-1 text-2xl font-bold">{fmt(results.totalLiabilities)}</p>
                <p className="text-xs text-muted-foreground">
                  Sum of all liability rows
                </p>
              </CardContent>
            </Card>
            <Card className={`bg-muted/30 border-ember/30 ${results.netWorth < 0 ? "border-red-300/50" : ""}`}>
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Net Worth
                </p>
                <p className={`mt-1 text-2xl font-bold ${results.netWorth < 0 ? "text-red-600" : "text-ember"}`}>
                  {results.netWorth < 0 ? "-" : ""}{fmt(Math.abs(results.netWorth))}
                </p>
                <p className="text-xs text-muted-foreground">
                  Assets minus liabilities
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 sm:col-span-2 lg:col-span-3">
              <CardContent className="p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Home Equity
                    </p>
                    <p className={`mt-1 text-xl font-bold ${results.homeEquity < 0 ? "text-red-600" : ""}`}>
                      {fmt(results.homeEquity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Home value ({fmt(results.homeValue)}) &minus; mortgage ({fmt(results.mortgageBalance)})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Net Worth Excluding Home Equity
                    </p>
                    <p className={`mt-1 text-xl font-bold ${results.netWorthExcludingHome < 0 ? "text-red-600" : ""}`}>
                      {results.netWorthExcludingHome < 0 ? "-" : ""}{fmt(Math.abs(results.netWorthExcludingHome))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Net worth ({fmt(results.netWorth)}) &minus; home equity ({fmt(results.homeEquity)})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Block */}
          {results.bracket && (
            <Card className="border-ember/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">
                    How You Compare: {results.bracket.label}
                  </h3>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {comparisonSentence}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className={`bg-muted/30 ${results.aboveMedian ? "border-ember/40" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Your Net Worth
                        </p>
                        {results.aboveMedian ? (
                          <TrendingUp className="size-3.5 text-ember" />
                        ) : (
                          <TrendingDown className="size-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-1 text-xl font-bold">{fmt(results.netWorth)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Median ({results.bracket.label})
                      </p>
                      <p className="mt-1 text-xl font-bold">{fmt(results.bracket.median)}</p>
                      <p className="text-xs text-muted-foreground">
                        Half of households above, half below
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Average ({results.bracket.label})
                      </p>
                      <p className="mt-1 text-xl font-bold">{fmt(results.bracket.average)}</p>
                      <p className="text-xs text-muted-foreground">
                        Mean (skewed by high-wealth households)
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Source: Federal Reserve Survey of Consumer Finances 2022 (released October 2023,
                  latest available). Figures are in 2022 dollars. The next SCF release is expected
                  late 2026.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 print:hidden">
            <ShareButtons summaryText={summaryText} title="Net Worth by Age Calculator" />
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
