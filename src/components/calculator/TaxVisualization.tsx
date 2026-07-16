"use client";

import { useMemo } from "react";
import type { CalculatorResult } from "@/types/calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrencyWhole(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Segment {
  label: string;
  amount: number;
  color: string;
  bgClass: string;
}

export interface TaxVisualizationProps {
  result: CalculatorResult;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TaxVisualization({ result }: TaxVisualizationProps) {
  const { segments, total } = useMemo(() => {
    const a = result.annual;

    const segs: Segment[] = [
      {
        label: "Federal Tax",
        amount: a.federalTax,
        color: "var(--chart-1)",
        bgClass: "bg-chart-1",
      },
      {
        label: "State Tax",
        amount: a.stateTax,
        color: "var(--chart-2)",
        bgClass: "bg-chart-2",
      },
      {
        label: "FICA",
        amount: a.socialSecurity + a.medicare + a.medicareAdditional,
        color: "var(--chart-3)",
        bgClass: "bg-chart-3",
      },
      {
        label: "Deductions",
        amount: a.preTaxDeductions + a.postTaxDeductions,
        color: "var(--chart-4)",
        bgClass: "bg-chart-4",
      },
      {
        label: "Take-Home",
        amount: a.takeHomePay,
        color: "oklch(0.55 0.15 145)",
        bgClass: "bg-emerald-500",
      },
    ];

    const t = segs.reduce((sum, s) => sum + s.amount, 0);
    return { segments: segs, total: t };
  }, [result]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Where Your Money Goes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stacked bar */}
        <div className="space-y-2">
          <div
            className="flex h-10 w-full overflow-hidden rounded-full"
            role="img"
            aria-label="Tax breakdown visualization"
          >
            {segments.map((seg, i) => {
              const pct = total > 0 ? (seg.amount / total) * 100 : 0;
              if (pct < 0.5) return null;
              return (
                <div
                  key={i}
                  className="transition-all duration-500 ease-out first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: seg.color,
                  }}
                />
              );
            })}
          </div>

          {/* Percentage labels below bar */}
          <div className="flex w-full text-xs text-muted-foreground">
            {segments.map((seg, i) => {
              const pct = total > 0 ? (seg.amount / total) * 100 : 0;
              if (pct < 3) return null;
              return (
                <div
                  key={i}
                  className="text-center transition-all duration-500"
                  style={{ width: `${pct}%` }}
                >
                  {pct.toFixed(1)}%
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend with dollar amounts */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {segments.map((seg, i) => {
            const pct = total > 0 ? ((seg.amount / total) * 100).toFixed(1) : "0.0";
            return (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: seg.color }}
                />
                <div className="min-w-0">
                  <span className="block truncate text-muted-foreground text-xs">
                    {seg.label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrencyWhole(seg.amount)}
                    <span className="ml-1 text-xs text-muted-foreground">({pct}%)</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}