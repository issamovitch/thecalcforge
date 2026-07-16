/**
 * CalcForge - Centralized Site Configuration
 * Domain: thecalcforge.com
 *
 * Edit this single file to change branding, colors, links across the entire site.
 */

export const TAX_YEAR = 2026;

export const siteConfig = {
  name: "CalcForge",
  tagline: "Precision-crafted financial calculators",
  description:
    "Free, accurate financial calculators for paycheck taxes, loans, debt, auto, home, and insurance. Calculate your take-home pay instantly.",
  domain: "thecalcforge.com",
  url: "https://thecalcforge.com" as const,
  ogImage: "/og-default.png",

  // Branding colors (CSS custom properties are set in globals.css)
  colors: {
    primary: "slate",
    accent: "ember",
    accentHex: "#00786f",
    accentHover: "#005f58",
  },

  // Navigation
  nav: {
    pages: [
      { label: "About", href: "/about" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Contact", href: "/contact" },
    ],
  },

  // Monetization placeholders
  ads: {
    enabled: false,
    clientId: "",
  },

  // Affiliate CTA config per page (key = page path)
  affiliateCta: {
    // "/paycheck/calculator/california": { html: "<div>...</div>" },
  } as Record<string, { html: string }>,
} as const;

export type SiteConfig = typeof siteConfig;