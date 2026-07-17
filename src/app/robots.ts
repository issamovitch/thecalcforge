import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";

export const dynamic = "force-static";

const departmentPaths = ["/debt", "/loans", "/auto", "/home-buying", "/insurance"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/loans/title-loan-calculator"],
        disallow: departmentPaths,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}