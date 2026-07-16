import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/paycheck-calculator",
        destination: "/paycheck/calculator",
        permanent: true,
      },
      {
        source: "/paycheck-calculator/california",
        destination: "/paycheck/calculator/california",
        permanent: true,
      },
      {
        source: "/paycheck-calculator/new-york",
        destination: "/paycheck/calculator/new-york",
        permanent: true,
      },
      {
        source: "/paycheck-calculator/pennsylvania",
        destination: "/paycheck/calculator/pennsylvania",
        permanent: true,
      },
      {
        source: "/paycheck-calculator/texas",
        destination: "/paycheck/calculator/texas",
        permanent: true,
      },
      {
        source: "/paycheck-calculator/florida",
        destination: "/paycheck/calculator/florida",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;