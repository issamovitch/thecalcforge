import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { getAllStubSlugs } from "@/lib/stubs-registry";

const stubSlugs = getAllStubSlugs();
const stubPaths = stubSlugs.map((s) => `/paycheck/${s}`);
const departmentPaths = ["/debt", "/loans", "/auto", "/home-buying", "/insurance"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...stubPaths, ...departmentPaths],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}