# AGENTS.md — CalcForge Maintenance Instructions

This file instructs any AI agent (GitHub Copilot, Claude Code, z.ai, or other) working on this repository. Read fully before changing anything.

## What this project is

CalcForge (thecalcforge.com) is a static Next.js finance calculator hub. The state paycheck calculators depend on tax constants that must be refreshed once per year. The authoritative list of covered states is NOT fixed: it is every state with a folder under `content/paycheck/`. Enumerate those folders at the start of every refresh and apply the full procedure to each one. Everything else on the site is evergreen math and needs no maintenance.

The site is fully static. Never add a runtime API, server dependency, or database. All calculations run client-side from constants in data files.

## Where the tax data lives (the ONLY files the annual refresh touches)

- `src/lib/tax/federal.ts` — federal brackets, standard deductions, Social Security wage base, Medicare thresholds
- `src/lib/tax/states/*.ts` — state tax modules (calculation engine)
- `content/paycheck/<state>/data.ts` — display copies of state brackets, deductions, payroll rates, FAQ figures. MUST stay numerically identical to the engine module for the same state
- `content/paycheck/<state>/content.tsx` — visible bracket tables, worked examples, "last verified" dates
- `src/__tests__/tax-engine.test.ts` — expected values for probe households

## Annual refresh procedure (run every January, or when major federal tax legislation passes)

1. `pip install --upgrade policyengine-us` in your sandbox.
2. Confirm the package is current: check that policyengine-us has had a release within the last 3 months. If not, prefer the government sources in step 5 for everything.
3. Extract parameter values for the new tax year from policyengine-us and write them into the files above, for EVERY state folder found under `content/paycheck/`:
   - Federal brackets and standard deductions (`gov.irs...`)
   - Each state's income tax brackets, standard deduction/exemptions, and local taxes where the calculator models them (e.g., NYC resident tax)
   - Each state's employee-paid payroll programs where they exist. Known examples: CA SDI (`gov.states.ca.tax.payroll.disability.employee_rate`), NY PFL and NY DBL contributions, PA employee SUI, NJ TDI/FLI, RI TDI, HI TDI, WA long-term care premium. When adding a NEW state to the site, list its employee payroll deductions from policyengine-us variables (search variable names for the state prefix plus "contribution", "insurance", "family_leave", "disability", "unemployment") and confirm each is either modeled in the calculator or documented as intentionally excluded on the page
4. Probe verification: for single and married filers at $30,000, $60,000, $120,000, $250,000, $500,000, and $1,200,000 in EVERY covered state, compute results in BOTH policyengine-us and this repo's engine, including all modeled employee payroll contributions (e.g., `ca_employee_state_disability_insurance_contribution`, `ny_employee_paid_family_leave_contribution`, `ny_employee_disability_benefits_contribution`, `pa_employee_unemployment_compensation_contribution`, and their equivalents in other states). The matrix is 12 probes per state (6 incomes x 2 filing statuses). ALL rows must match. Investigate and fix any mismatch before proceeding.
5. Spot-check values against official government sources. If they disagree with policyengine-us, THE GOVERNMENT SOURCE WINS:
   - Always: federal standard deduction from irs.gov (annual inflation adjustment revenue procedure) and CA SDI rate from edd.ca.gov/en/payroll_taxes/rates_and_withholding/
   - Plus: one randomly chosen value (a bracket boundary or payroll rate) from TWO additional covered states, checked against each state's own revenue department website. Rotate which states each year and name them in the PR
6. Update visible content: bracket tables, worked examples (recompute the numbers), and every "Last verified [date]" line in `content/paycheck/*/content.tsx`.
7. Update `src/__tests__/tax-engine.test.ts` expected values, run the full test suite, and confirm all tests pass.
8. Deliver as a pull request with a summary table: file changed, value changed, source.

## Hard rules

- NEVER write a tax rate, bracket, or threshold from your training memory. Every number must come from policyengine-us output or a government page fetched during this session.
- Every constant carries a source comment and verification date.
- Engine files and content data files for the same state must contain identical numbers.
- State-published figures may legitimately lag the calendar year (example: California FTB publishes indexed brackets late in the year). Use the latest OFFICIAL figures and label the tax year honestly on the page. Never present projected or estimated brackets as official.
- If a needed value cannot be verified, leave the existing value, mark it TODO with an explanation, and flag it in the PR description. Never fill gaps with guesses.
- This is YMYL (financial) content. Accuracy outranks completeness, speed, and elegance.

## Final validation checklist (MANDATORY before opening the PR)

Run every check below and paste the results into the PR description. If any check fails, fix it and re-run all of them. Do not open the PR with a failing or skipped check.

1. **Unit tests:** `npm test` — full suite passes. Paste the summary line.
2. **Build:** `npm run build` completes with zero errors (static export must succeed).
3. **Probe matrix:** paste the full comparison table, 12 rows per covered state (our engine vs policyengine-us). Every row must show MATCH. Any mismatch above $1 (rounding) is a failure.
4. **Sync check:** run a script that programmatically compares every bracket, rate, and deduction in `src/lib/tax/states/<state>.ts` against `content/paycheck/<state>/data.ts`. Zero differences allowed.
5. **Stale-number sweep:** grep the entire repo for every OLD value you replaced (old rates, old bracket boundaries, old deduction amounts). Zero hits allowed outside of test history/changelogs. This catches hardcoded numbers hiding in prose, FAQs, and worked examples.
6. **Worked-example audit:** for each state page, recompute the worked example ($60,000 single filer) with the repo engine and confirm the numbers printed in the page prose match the engine output to the dollar.
7. **Date sweep:** grep for "Last verified" — every occurrence must show the current refresh date. Grep for previous tax years in page titles/headers and confirm each remaining occurrence is intentional and honestly labeled (e.g., a bracket table legitimately labeled with the latest official state year).
8. **TODO sweep:** grep for "TODO" in tax data files. Any remaining TODO must be listed and explained in the PR description.
9. **Government spot-checks:** state in the PR the two values checked (federal standard deduction from irs.gov, CA SDI rate from edd.ca.gov), the values found, and confirmation they match the shipped data.
10. **Schema sanity:** confirm each bracket array is strictly ascending, starts at 0, has exactly one null-max top bracket, and all rates are between 0 and 0.2 (state) or 0 and 0.4 (federal). Absurd values indicate a paste error.

## Out of scope for the annual refresh

Do not redesign pages, change SEO structure, alter monetization slots, or refactor the engine during a data refresh. One PR = data refresh only.
