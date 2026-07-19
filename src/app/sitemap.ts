import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    // Loans hub + 7 calculators
    { url: `${base}/loans`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/loans/title-loan-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/loans/payday-loan-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/loans/business-loan-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/loans/boat-rv-motorcycle-loan-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/loans/personal-loan-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/loans/auto-loan-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/loans/debt-consolidation-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    // Debt hub + calculators
    { url: `${base}/debt`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/debt/debt-payoff-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/debt/dti-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/debt/credit-card-payoff-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/debt/credit-card-minimum-payment-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/debt/balance-transfer-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    // Department stubs
    { url: `${base}/auto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/auto/car-affordability-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/auto/auto-lease-payment-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/auto/lease-vs-buy-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/home-buying`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/home-buying/pmi-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/home-buying/refinance-break-even-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/home-buying/heloc-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/home-buying/down-payment-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/home-buying/home-affordability-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/insurance`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    // Info pages
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  return pages;
}