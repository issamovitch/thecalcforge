import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { getAllStateSlugs } from "@/lib/states-registry";
import { getAllStubSlugs } from "@/lib/stubs-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  // Static pages (indexed)
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/paycheck`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${base}/paycheck/calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  // State calculator pages (indexed)
  const statePages: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${base}/paycheck/calculator/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...statePages];
}