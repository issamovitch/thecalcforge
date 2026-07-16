"use client";

import { useMemo } from "react";
import type { CalculatorResult, PayFrequency, TaxBreakdownLine } from "@/types/calculator";
import { PAY_FREQUENCY_LABELS } from "@/types/calculator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function formatCurrencyCents(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResultsBreakdownProps {
  result: CalculatorResult;
  payFrequency: PayFrequency;
  stateName: string;
}

interface TableRowData {
  label: string;
  annualAmount: number;
  perPeriodAmount: number;
  isDeduction: boolean;
  isBold: boolean;
  indent?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResultsBreakdown({
  result,
  payFrequency,
  stateName,
}: ResultsBreakdownProps) {
  const periodLabel = PAY_FREQUENCY_LABELS[payFrequency];

  // Build table rows
  const rows = useMemo<TableRowData[]>(() => {
    const a = result.annual;
    const p = result.perPeriod;
    const r: TableRowData[] = [];

    r.push({
      label: "Gross Pay",
      annualAmount: a.grossPay,
      perPeriodAmount: p.grossPay,
      isDeduction: false,
      isBold: false,
    });
    r.push({
      label: "Federal Income Tax",
      annualAmount: -a.federalTax,
      perPeriodAmount: -p.federalTax,
      isDeduction: true,
      isBold: false,
    });
    r.push({
      label: "Social Security",
      annualAmount: -a.socialSecurity,
      perPeriodAmount: -p.socialSecurity,
      isDeduction: true,
      isBold: false,
    });
    r.push({
      label: "Medicare",
      annualAmount: -a.medicare,
      perPeriodAmount: -p.medicare,
      isDeduction: true,
      isBold: false,
    });
    if (a.medicareAdditional > 0) {
      r.push({
        label: "Additional Medicare",
        annualAmount: -a.medicareAdditional,
        perPeriodAmount: -p.medicareAdditional,
        isDeduction: true,
        isBold: false,
      });
    }
    if (a.stateTax > 0) {
      r.push({
        label: `${stateName} Taxes & Deductions`,
        annualAmount: -a.stateTax,
        perPeriodAmount: -p.stateTax,
        isDeduction: true,
        isBold: false,
      });
    }
    if (a.localTax > 0) {
      r.push({
        label: "Local Tax",
        annualAmount: -a.localTax,
        perPeriodAmount: -p.localTax,
        isDeduction: true,
        isBold: false,
      });
    }
    if (a.preTaxDeductions > 0) {
      r.push({
        label: "401(k) + HSA + Other Pre-Tax",
        annualAmount: -a.preTaxDeductions,
        perPeriodAmount: -p.preTaxDeductions,
        isDeduction: true,
        isBold: false,
      });
    }
    if (a.postTaxDeductions > 0) {
      r.push({
        label: "Post-Tax Deductions",
        annualAmount: -a.postTaxDeductions,
        perPeriodAmount: -p.postTaxDeductions,
        isDeduction: true,
        isBold: false,
      });
    }
    r.push({
      label: "Net Take-Home Pay",
      annualAmount: a.takeHomePay,
      perPeriodAmount: p.takeHomePay,
      isDeduction: false,
      isBold: true,
    });

    return r;
  }, [result, stateName]);

  // Filter state-specific breakdown lines (exclude main state tax and standard deduction)
  const stateSpecificLines = useMemo(() => {
    return result.stateBreakdown.filter(
      (line: TaxBreakdownLine) =>
        !line.label.includes("State Income Tax") &&
        !line.label.includes("Standard Deduction") &&
        line.amount > 0
    );
  }, [result.stateBreakdown]);

  const effectiveRate = result.annual.effectiveTaxRate;
  const { federal, state, fica } = result.marginalInfo;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your Paycheck Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Big take-home number */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Take-Home Pay ({periodLabel})
          </p>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground sm:text-4xl">
            {formatCurrencyCents(result.perPeriod.takeHomePay)}
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatCurrencyWhole(result.annual.takeHomePay)} per year
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs tabular-nums">
            Effective Tax Rate: {(effectiveRate * 100).toFixed(2)}%
          </Badge>
          <Badge variant="outline" className="text-xs tabular-nums">
            Marginal: {((federal + state + fica) * 100).toFixed(2)}%
            <span className="ml-1 text-muted-foreground">
              (Fed {(federal * 100).toFixed(1)}% + State{" "}
              {(state * 100).toFixed(1)}% + FICA {(fica * 100).toFixed(1)}%)
            </span>
          </Badge>
        </div>

        {/* Breakdown table */}
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-medium">Line Item</TableHead>
                <TableHead className="text-right font-medium">Annual</TableHead>
                <TableHead className="text-right font-medium">
                  Per Period
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const isNegative = row.annualAmount < 0;
                return (
                  <TableRow
                    key={row.label}
                    className={
                      row.isBold
                        ? "border-t-2 border-t-foreground/20 font-semibold"
                        : ""
                    }
                  >
                    <TableCell
                      className={
                        row.isBold
                          ? "font-semibold"
                          : row.indent
                            ? "pl-6 text-muted-foreground"
                            : ""
                      }
                    >
                      {row.label}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        row.isBold
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : isNegative
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isNegative ? "(" : ""}
                      {formatCurrencyWhole(Math.abs(row.annualAmount))}
                      {isNegative ? ")" : ""}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        row.isBold
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : isNegative
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isNegative ? "(" : ""}
                      {formatCurrencyCents(Math.abs(row.perPeriodAmount))}
                      {isNegative ? ")" : ""}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* State-specific breakdown */}
        {stateSpecificLines.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {stateName} Tax Details
            </p>
            <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3">
              {stateSpecificLines.map((line: TaxBreakdownLine) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{line.label}</span>
                  <span className="tabular-nums font-medium">
                    {formatCurrencyWhole(line.amount)}
                    {line.rate !== undefined && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ({(line.rate * 100).toFixed(2)}%)
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}