"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Copy, Check, Printer, RotateCcw, ArrowLeftRight, ChevronDown, ChevronUp, Info, AlertTriangle } from "lucide-react";
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

interface BTInputs {
  balance: number;
  apr: number;
  payment: number;
  promoApr: number;
  promoMonths: number;
  fee: number;
  postPromoApr: number;
}

interface ScheduleRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
  rate: "Promo" | "Post-Promo";
}

interface ScenarioResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  schedule: ScheduleRow[];
  remainingAfterPromo: number;
}

/* ─── Defaults ─── */

export const DEFAULT_INPUTS: BTInputs = {
  balance: 6000,
  apr: 22,
  payment: 300,
  promoApr: 0,
  promoMonths: 18,
  fee: 3,
  postPromoApr: 22.99,
};

/* ─── Formatters ─── */

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
const fmtPercent = (v: number) => `${v.toFixed(2)}%`;

/* ─── Calculation Engine ─── */

function amortize(balance: number, apr: number, payment: number, maxMonths = 1200): ScenarioResult {
  let bal = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;

  while (bal > 0.005 && month < maxMonths) {
    month++;
    const interest = bal * (apr / 100) / 12;
    const principal = Math.min(payment - interest, bal);
    const actualPayment = principal + interest;
    bal = Math.max(0, bal - principal);
    totalInterest += interest;
    totalPaid += actualPayment;
  }

  return { months: month, totalInterest, totalPaid, schedule: [], remainingAfterPromo: 0 };
}

function newCardScenario(
  originalBalance: number,
  payment: number,
  promoApr: number,
  promoMonths: number,
  fee: number,
  postPromoApr: number,
): ScenarioResult {
  const transferFee = originalBalance * (fee / 100);
  let bal = originalBalance + transferFee;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  let remainingAfterPromo = 0;
  const schedule: ScheduleRow[] = [];
  const maxMonths = 1200;

  while (bal > 0.005 && month < maxMonths) {
    month++;
    const isPromo = month <= promoMonths;
    const rate = isPromo ? promoApr : postPromoApr;
    const interest = bal * (rate / 100) / 12;
    const principal = Math.min(payment - interest, bal);
    const actualPayment = principal + interest;
    bal = Math.max(0, bal - principal);
    totalInterest += interest;
    totalPaid += actualPayment;

    schedule.push({
      month,
      payment: actualPayment,
      interest,
      principal: Math.max(0, principal),
      balance: bal,
      rate: isPromo ? "Promo" : "Post-Promo",
    });
  }

  // Check how much remains after promo period
  const promoEndIdx = Math.min(promoMonths, schedule.length);
  if (promoEndIdx > 0 && schedule[promoEndIdx - 1]) {
    remainingAfterPromo = schedule[promoEndIdx - 1].balance;
  }

  return { months: month, totalInterest, totalPaid, schedule, remainingAfterPromo };
}

/* ─── Component ─── */

export default function BalanceTransferCalculator() {
  const [inputs, setInputs] = useState<BTInputs>(() => {
    if (typeof window === "undefined") return DEFAULT_INPUTS;
    const params = new URLSearchParams(window.location.search);
    const hasParams = params.get("b") || params.get("apr");
    if (!hasParams) return DEFAULT_INPUTS;

    return {
      balance: params.get("b") ? parseFloat(params.get("b")!) : DEFAULT_INPUTS.balance,
      apr: params.get("apr") ? parseFloat(params.get("apr")!) : DEFAULT_INPUTS.apr,
      payment: params.get("pmt") ? parseFloat(params.get("pmt")!) : DEFAULT_INPUTS.payment,
      promoApr: params.get("napr") ? parseFloat(params.get("napr")!) : DEFAULT_INPUTS.promoApr,
      promoMonths: params.get("pm") ? parseInt(params.get("pm")!, 10) : DEFAULT_INPUTS.promoMonths,
      fee: params.get("fee") ? parseFloat(params.get("fee")!) : DEFAULT_INPUTS.fee,
      postPromoApr: params.get("ppapr") ? parseFloat(params.get("ppapr")!) : DEFAULT_INPUTS.postPromoApr,
    };
  });

  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(true);

  const results = useMemo(() => {
    const stayPut = amortize(inputs.balance, inputs.apr, inputs.payment);
    const newCard = newCardScenario(
      inputs.balance,
      inputs.payment,
      inputs.promoApr,
      inputs.promoMonths,
      inputs.fee,
      inputs.postPromoApr,
    );
    return { stayPut, newCard };
  }, [inputs]);

  const transferFee = useMemo(() => inputs.balance * (inputs.fee / 100), [inputs.balance, inputs.fee]);

  const interestSaved = useMemo(
    () => results.stayPut.totalInterest - results.newCard.totalInterest,
    [results.stayPut.totalInterest, results.newCard.totalInterest],
  );

  const netSavings = useMemo(() => interestSaved - transferFee, [interestSaved, transferFee]);

  const newCardTotalCost = useMemo(
    () => transferFee + results.newCard.totalInterest,
    [transferFee, results.newCard.totalInterest],
  );

  const stayPutTotalCost = useMemo(
    () => results.stayPut.totalInterest,
    [results.stayPut.totalInterest],
  );

  const breakEvenMonth = useMemo(() => {
    if (netSavings <= 0) return null;
    let cumulativeInterestSaved = 0;
    const stayPutSchedule: ScheduleRow[] = [];
    let spBal = inputs.balance;

    for (let m = 0; m < results.stayPut.months && m < 1200; m++) {
      const interest = spBal * (inputs.apr / 100) / 12;
      const principal = Math.min(inputs.payment - interest, spBal);
      spBal = Math.max(0, spBal - principal);
      stayPutSchedule.push({ month: m + 1, payment: 0, interest, principal, balance: spBal, rate: "Promo" });
    }

    for (let i = 0; i < results.newCard.schedule.length; i++) {
      const newInterest = results.newCard.schedule[i].interest;
      const stayInterest = i < stayPutSchedule.length ? stayPutSchedule[i].interest : 0;
      cumulativeInterestSaved += stayInterest - newInterest;
      if (cumulativeInterestSaved >= transferFee) {
        return i + 1;
      }
    }
    return null;
  }, [results.newCard.schedule, results.stayPut.months, inputs.apr, inputs.payment, inputs.balance, transferFee]);

  const promoPaidOff = results.newCard.remainingAfterPromo < 0.005;

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("b", inputs.balance.toString());
    params.set("apr", inputs.apr.toString());
    params.set("pmt", inputs.payment.toString());
    params.set("napr", inputs.promoApr.toString());
    params.set("pm", inputs.promoMonths.toString());
    params.set("fee", inputs.fee.toString());
    params.set("ppapr", inputs.postPromoApr.toString());
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

  const updateInput = useCallback((field: keyof BTInputs, value: string) => {
    setInputs((prev) => {
      const num = parseFloat(value);
      return { ...prev, [field]: isNaN(num) ? 0 : num };
    });
  }, []);

  const summaryText = useMemo(() => {
    if (inputs.balance <= 0) return "";
    return `Balance transfer: ${netSavings > 0 ? "saves" : "costs"} ${fmtCurrency(Math.abs(netSavings))}. New card payoff in ${results.newCard.months} months vs ${results.stayPut.months} months staying put. Calculate yours:`;
  }, [inputs.balance, netSavings, results.newCard.months, results.stayPut.months]);

  return (
    <TooltipProvider delayDuration={300}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .print\\:hidden { display: none !important; }
              .print-break-inside { break-inside: avoid; }
            }
          `,
        }}
      />
      <div className="space-y-6">
        {/* ─── Main Calculator Card ─── */}
        <Card className="print-break-inside">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ArrowLeftRight className="size-5 text-ember" />
              Balance Transfer Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare the cost of keeping your current credit card balance versus
              transferring it to a new card with a promotional APR. Factor in
              transfer fees and post-promo rates to find the best strategy.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ─── Inputs ─── */}
              <div className="space-y-5">
                {/* Current Balance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bt-balance" className="text-sm font-medium">
                      Current Balance ($)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {fmtCurrency(inputs.balance)}
                    </span>
                  </div>
                  <div className="relative no-print">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="bt-balance"
                      type="number"
                      min={0}
                      step={100}
                      value={inputs.balance || ""}
                      onChange={(e) => updateInput("balance", e.target.value)}
                      placeholder="6000"
                      className="pl-6"
                      aria-label="Current balance"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    Current Balance: {fmtCurrency(inputs.balance)}
                  </p>
                </div>

                {/* Current APR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bt-apr" className="text-sm font-medium">
                      Current APR (%)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {fmtPercent(inputs.apr)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Input
                      id="bt-apr"
                      type="number"
                      min={0}
                      step={0.1}
                      value={inputs.apr || ""}
                      onChange={(e) => updateInput("apr", e.target.value)}
                      placeholder="22"
                      aria-label="Current APR"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    Current APR: {fmtPercent(inputs.apr)}
                  </p>
                </div>

                {/* Monthly Payment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bt-payment" className="text-sm font-medium">
                      Monthly Payment ($)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {fmtCurrency(inputs.payment)}
                    </span>
                  </div>
                  <div className="relative no-print">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="bt-payment"
                      type="number"
                      min={0}
                      step={25}
                      value={inputs.payment || ""}
                      onChange={(e) => updateInput("payment", e.target.value)}
                      placeholder="300"
                      className="pl-6"
                      aria-label="Monthly payment"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    Monthly Payment: {fmtCurrency(inputs.payment)}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* New Card Promo APR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bt-promo-apr" className="text-sm font-medium">
                      New Card Promo APR (%)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {fmtPercent(inputs.promoApr)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Input
                      id="bt-promo-apr"
                      type="number"
                      min={0}
                      step={0.1}
                      value={inputs.promoApr ?? ""}
                      onChange={(e) => updateInput("promoApr", e.target.value)}
                      placeholder="0"
                      aria-label="New card promo APR"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    New Card Promo APR: {fmtPercent(inputs.promoApr)}
                  </p>
                </div>

                {/* Promo Period */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bt-promo-months" className="text-sm font-medium">
                      Promo Period (months)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {inputs.promoMonths} mo
                    </span>
                  </div>
                  <div className="no-print">
                    <Input
                      id="bt-promo-months"
                      type="number"
                      min={1}
                      max={60}
                      step={1}
                      value={inputs.promoMonths || ""}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        setInputs((p) => ({
                          ...p,
                          promoMonths: isNaN(num) || num < 1 ? 1 : num,
                        }));
                      }}
                      placeholder="18"
                      aria-label="Promo period in months"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    Promo Period: {inputs.promoMonths} months
                  </p>
                </div>

                {/* Balance Transfer Fee */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bt-fee" className="text-sm font-medium">
                      Balance Transfer Fee (%)
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {fmtPercent(inputs.fee)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Input
                      id="bt-fee"
                      type="number"
                      min={0}
                      step={0.1}
                      value={inputs.fee ?? ""}
                      onChange={(e) => updateInput("fee", e.target.value)}
                      placeholder="3"
                      aria-label="Balance transfer fee"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    Balance Transfer Fee: {fmtPercent(inputs.fee)}
                  </p>
                </div>

                {/* Post-Promo APR */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="bt-post-promo-apr" className="text-sm font-medium">
                      Post-Promo APR (%)
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help no-print" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[280px] text-xs">
                        Rate that applies to any remaining balance after the
                        promotional period ends.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Standard rate on new card after promo</span>
                    <span className="text-sm font-semibold text-foreground">
                      {fmtPercent(inputs.postPromoApr)}
                    </span>
                  </div>
                  <div className="no-print">
                    <Input
                      id="bt-post-promo-apr"
                      type="number"
                      min={0}
                      step={0.1}
                      value={inputs.postPromoApr || ""}
                      onChange={(e) => updateInput("postPromoApr", e.target.value)}
                      placeholder="22.99"
                      aria-label="Post-promo APR"
                    />
                  </div>
                  <p className="hidden print:block text-sm">
                    Post-Promo APR: {fmtPercent(inputs.postPromoApr)}
                  </p>
                </div>
              </div>

              {/* ─── Results ─── */}
              <div className="space-y-4">
                {inputs.balance > 0 && inputs.payment > 0 ? (
                  <>
                    {/* Summary Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <ResultCard
                        label="Net Savings"
                        value={fmtCurrency(netSavings)}
                        valueClassName={netSavings > 0 ? "text-green-600 dark:text-green-400" : netSavings < 0 ? "text-destructive" : ""}
                        subtext={netSavings > 0 ? "Transfer is cheaper" : netSavings < 0 ? "Stay put is cheaper" : "Break even"}
                      />
                      <ResultCard
                        label="Payoff Time"
                        value={`${results.newCard.months} vs ${results.stayPut.months} mo`}
                        subtext={`New card vs stay put`}
                      />
                      <ResultCard
                        label="Total Cost (New Card)"
                        value={fmtCurrency(newCardTotalCost)}
                        subtext={`Fee ${fmtCurrency(transferFee)} + interest`}
                      />
                      <ResultCard
                        label="Total Cost (Stay Put)"
                        value={fmtCurrency(stayPutTotalCost)}
                        subtext={`Interest only`}
                      />
                    </div>

                    {/* Verdict Alert */}
                    {netSavings > 0 ? (
                      <Alert className="py-3 border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20">
                        <AlertDescription className="text-sm">
                          <span className="font-medium text-green-700 dark:text-green-400">
                            Transferring saves you {fmtCurrency(netSavings)}.
                          </span>{" "}
                          The promotional APR period{" "}
                          <span className="font-semibold">
                            {promoPaidOff ? "IS" : "IS NOT"}
                          </span>{" "}
                          long enough to clear the balance.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive" className="py-3">
                        <AlertTriangle className="size-4" />
                        <AlertDescription className="text-sm">
                          The transfer fee exceeds your interest savings.{" "}
                          <span className="font-medium">
                            Staying put is cheaper.
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Warning if balance remains after promo */}
                    {!promoPaidOff && results.newCard.remainingAfterPromo > 0.005 && (
                      <Alert className="py-3 border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                        <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
                          {fmtCurrency(results.newCard.remainingAfterPromo)} remains after the
                          promo period ends. Post-promo APR of {fmtPercent(inputs.postPromoApr)} will
                          apply to the remainder, reducing your savings.
                        </AlertDescription>
                      </Alert>
                    )}

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
                      <ShareButtons summaryText={summaryText} />
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      This calculator provides estimates for informational purposes
                      only. Actual savings depend on payment timing, fees, and
                      changes to your APR. Always review your card agreement for
                      accurate terms and conditions.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                    Enter a balance and monthly payment to see results.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Comparison Table ─── */}
        {inputs.balance > 0 && inputs.payment > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowLeftRight className="size-4 text-ember" />
                Stay Put vs. Balance Transfer Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-center">Stay Put</TableHead>
                      <TableHead className="text-center">New Card</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Total Interest</TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(results.stayPut.totalInterest)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {fmtCurrency(results.newCard.totalInterest)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Transfer Fee</TableCell>
                      <TableCell className="text-center">{fmtCurrency(0)}</TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {fmtCurrency(transferFee)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Cost</TableCell>
                      <TableCell className="text-center">
                        {fmtCurrency(stayPutTotalCost)}
                      </TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {fmtCurrency(newCardTotalCost)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Months to Payoff</TableCell>
                      <TableCell className="text-center">
                        {results.stayPut.months}
                      </TableCell>
                      <TableCell className="text-center font-medium text-ember">
                        {results.newCard.months}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Break-Even Readout */}
              <div className="mt-4 rounded-lg bg-muted/30 p-4 space-y-1.5">
                <p className="text-sm font-medium">
                  Break-even: You save{" "}
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {fmtCurrency(interestSaved)}
                  </span>{" "}
                  in interest but pay{" "}
                  <span className="font-bold text-destructive">
                    {fmtCurrency(transferFee)}
                  </span>{" "}
                  in fees. Net savings:{" "}
                  <span className={netSavings > 0 ? "font-bold text-green-600 dark:text-green-400" : "font-bold text-destructive"}>
                    {fmtCurrency(netSavings)}
                  </span>.
                </p>
                {breakEvenMonth !== null && (
                  <p className="text-xs text-muted-foreground">
                    The transfer pays for itself in month {breakEvenMonth}.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Month-by-Month Schedule (New Card Only) ─── */}
        {inputs.balance > 0 && inputs.payment > 0 && results.newCard.schedule.length > 0 && (
          <Card className="print-break-inside">
            <CardHeader className="pb-3">
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="no-print flex w-full items-center justify-between text-left"
                aria-expanded={showSchedule}
              >
                <CardTitle className="text-lg">
                  Month-by-Month Schedule (New Card)
                </CardTitle>
                {showSchedule ? (
                  <ChevronUp className="size-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-5 text-muted-foreground" />
                )}
              </button>
              <CardTitle className="hidden print:block text-lg">
                Month-by-Month Schedule (New Card)
              </CardTitle>
            </CardHeader>
            <CardContent className={showSchedule ? "" : "hidden print:block"}>
              <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Month</TableHead>
                      <TableHead className="text-right">Payment</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="w-28 text-center">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.newCard.schedule.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right">
                          {fmtCurrency(row.payment)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {row.interest > 0 ? fmtCurrency(row.interest) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.principal > 0 ? fmtCurrency(row.principal) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {fmtCurrency(row.balance)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              row.rate === "Promo"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {row.rate}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm font-medium">
                <span>
                  Total Paid:{" "}
                  <span className="text-ember">{fmtCurrency(results.newCard.totalPaid)}</span>
                </span>
                <span>
                  Total Interest:{" "}
                  <span className="text-destructive">{fmtCurrency(results.newCard.totalInterest)}</span>
                </span>
                <span>
                  Transfer Fee:{" "}
                  <span className="text-destructive">{fmtCurrency(transferFee)}</span>
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

function ResultCard({
  label,
  value,
  subtext,
  valueClassName,
}: {
  label: string;
  value: string;
  subtext: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-lg font-bold tracking-tight ${valueClassName || ""}`}>{value}</p>
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