---
Task ID: 1
Agent: Main Agent
Task: Build Title Loan Calculator page at /loans/title-loan-calculator/

Work Log:
- Read all existing project files (Header, Footer, site.config, layout, loans page, JsonLd, CanonicalUrl, sitemap, robots, Breadcrumbs, globals.css, UI components)
- Created interactive Title Loan Calculator client component at src/components/calculators/TitleLoanCalculator.tsx with:
  - 4 slider+input pairs: Vehicle Value, Loan Amount, APR, Loan Term
  - Real-time calculation using standard amortizing loan formula
  - Results panel: Monthly Payment, Total Interest, Total Cost, Finance Charge, LTV
  - Collapsible amortization schedule table (12-month default)
  - URL params for shareable results (vehicle, amount, rate, term)
  - Copy Link, Print, Reset buttons
  - Tooltips on inputs with contextual help
  - Print-friendly (no-print class on actions)
  - Custom disclaimer text
- Created page at src/app/loans/title-loan-calculator/page.tsx with:
  - Full SEO metadata (title, description, keywords, OG, Twitter, canonical, robots)
  - JSON-LD: BreadcrumbList, FAQPage, WebApplication
  - Breadcrumb navigation: Home > Loan Calculators > Title Loan Calculator
  - H1: "Title Loan Calculator"
  - 5 H2 long-tail keyword sections with substantive content
  - Formula card with worked example
  - 5 FAQ items (native <details> accordion)
  - Related Calculators section linking to Payday, Personal, Auto loan calculators + Loans hub
  - Internal link from content to payday loan calculator
- Updated Header.tsx: Loans nav item now has a DropdownMenu with "Title Loan Calculator" and "All Loan Calculators" children; mobile menu shows nested links
- Updated Footer.tsx: Added 4th column "Loan Tools" with Title Loan Calculator link
- Updated sitemap.ts: Fixed URL from /title-loan-calculator to /loans/title-loan-calculator (priority 0.9)
- Updated robots.ts: Added explicit allow for /loans/title-loan-calculator

Stage Summary:
- Page URL: /loans/title-loan-calculator (nested under /loans as user requested)
- All lint checks pass, no console errors
- Agent Browser verified: page renders, calculator computes correctly ($733.82/mo for $5k @ 120% APR 12mo), amortization table works (12 rows, balance to $0), Loans dropdown works, FAQ accordion works, footer links present, homepage unaffected
- Screenshot saved to /home/z/my-project/title-loan-calc-screenshot.png