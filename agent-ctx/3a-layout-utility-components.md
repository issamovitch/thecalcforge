# Task 3a — Layout & Utility Components

## Files Created
| File | Description |
|------|-------------|
| `src/components/layout/Header.tsx` | Sticky header with logo, DropdownMenu nav, mobile Sheet drawer |
| `src/components/layout/Footer.tsx` | 4-col responsive footer with dark slate-800 background |
| `src/components/layout/Breadcrumbs.tsx` | Semantic breadcrumb nav using shadcn Breadcrumb |
| `src/components/monetization/AdSlot.tsx` | Ad placeholder (dev) / AdSense-ready container (prod) |
| `src/components/monetization/AffiliateCta.tsx` | Page-path-keyed affiliate CTA renderer |
| `src/components/seo/JsonLd.tsx` | WebApplication, FAQ, Breadcrumb JSON-LD schemas |
| `src/components/seo/CanonicalUrl.tsx` | Canonical URL link tag |

## Key Decisions
- **Header**: Used DropdownMenu (not NavigationMenu) for the "Calculators" dropdown — simpler, works well with disabled items and badges. Mobile uses Sheet (right-side drawer).
- **Footer**: Server component (no "use client" needed) — purely static links from config.
- **Breadcrumbs**: Server component — uses shadcn primitives with Next.js `<Link>`.
- **AdSlot**: Conditionally renders based on `siteConfig.ads.enabled`. Placeholder uses dashed border + muted text.
- **JsonLd**: All three use `dangerouslySetInnerHTML` to inject `<script type="application/ld+json">` — standard pattern for structured data in React/Next.js.
- **CanonicalUrl**: Server component using `<link>` — Next.js hoists it to `<head>`.

## Lint Status
✅ 0 errors, 0 warnings