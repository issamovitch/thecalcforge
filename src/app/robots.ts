import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-static";

const loanPaths = [
  "/loans",
  "/loans/title-loan-calculator",
  "/loans/payday-loan-calculator",
  "/loans/business-loan-calculator",
  "/loans/boat-rv-motorcycle-loan-calculator",
  "/loans/personal-loan-calculator",
  "/loans/auto-loan-calculator",
  "/loans/debt-consolidation-calculator",
  "/auto/car-affordability-calculator",
  "/auto/auto-lease-payment-calculator",
  "/auto/lease-vs-buy-calculator",
  "/home-buying/pmi-calculator",
];

const departmentPaths = ["/debt", "/auto", "/home-buying", "/insurance"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...loanPaths],
        disallow: departmentPaths,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}