# Task 2: DebtPayoffCalculator Component

## Agent: Main Agent
## Status: Completed

## Work Log
- Read `PersonalLoanCalculator.tsx` (744 lines) to understand: action row pattern (Copy Link / Print / Reset / ShareButtons), print CSS (`print:hidden`, `no-print`, `print-break-inside`, PrintFooter), URL param encoding, toast usage, TooltipProvider wrapping, card styling, table styling, amortization toggle.
- Read `ShareButtons.tsx` to understand the share component interface.
- Browsed available shadcn/ui components in `src/components/ui/`.
- Built complete `DebtPayoffCalculator.tsx` (1070 lines) with all requested features.

## What Was Built

### File: `src/components/calculators/DebtPayoffCalculator.tsx`

**Types & Exports:**
- `DebtEntry` interface (id, name, balance, apr, minimumPayment)
- `DebtInputs` interface (debts[], method, extraPayment)
- `MonthEntry` interface for schedule rows
- `PayoffResult` interface (totalMonths, debtFreeDate, totalInterest, totalPaid, payoffOrder, schedule, warnings)
- `DEFAULT_DEBTS` exported: 3 debts (Credit Card A $4,500 @ 22.9%, Credit Card B $2,200 @ 18.9%, Personal Loan $8,000 @ 9.5%)
- `DEFAULT_INPUTS` exported: debts + snowball method + $200 extra

**Calculation Engine (`calculatePayoff`):**
- Vanilla JS, no libraries
- Sorts debts by method (snowball: balance ascending, avalanche: APR descending)
- Each month: pays minimum on ALL debts, applies extra to priority debt
- When debt hits $0, redirects its minimum + extra to next priority debt
- Handles remaining extra after priority debt payoff within same month
- Warning detection: minimum payment < monthly interest
- 100-year cap (1200 months) for safety
- Calculates debt-free date from current month

**Input Section:**
- Multiple debt rows with: name (text), balance ($), APR (%), min payment ($)
- Numbered badges per debt
- Add Debt button (+ icon)
- Remove button (X icon) per row (hidden when only 1 debt)
- Method toggle: Snowball / Avalanche with visual active state
- Extra Monthly Payment input with tooltip
- 2-col grid on mobile (`grid-cols-2 sm:grid-cols-4`) for debt fields
- Warnings displayed as Alert components

**Results Section:**
1. Debt-Free Date highlight card (ember/10 background)
2. 2x2 result grid: Total Months, Total Interest, Total Paid, Monthly Payment
3. Side-by-side comparison table (Snowball vs Avalanche) with highlighted savings
4. Payoff Order numbered list with debt details and payoff month
5. Collapsible month-by-month schedule table (default expanded, per-debt rows)

**Action Row:**
- Exact pattern from PersonalLoanCalculator
- Copy Link (with Check/Copy toggle + toast)
- Print button
- Reset button
- ShareButtons with summary text
- `flex flex-wrap items-center gap-3 no-print`

**URL Parameter Encoding:**
- `d1name`, `d1bal`, `d1apr`, `d1min` for debt 1 (up to 10 debts)
- `method` = "snowball" | "avalanche"
- `extra` = extra monthly payment
- Reads URL params on mount, syncs on change via `replaceState`

**Print Support:**
- `print:hidden` on interactive elements
- `no-print` on controls
- `print-break-inside` on result cards
- PrintFooter with URL + date
- Print-only method label and title

**Lint Status:** 0 errors in this file. All 11 remaining lint errors are pre-existing in `title-loan-calculator/page.tsx`.