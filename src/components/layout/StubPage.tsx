import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { siteConfig } from "@/config/site.config";

interface StubPageProps {
  name: string;
  description: string;
  path: string;
}

export function generateStubMetadata({ name, description, path }: StubPageProps): Metadata {
  const canonicalUrl = `${siteConfig.url}${path}`;
  return {
    title: `${name} — Coming Soon`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${name} — Coming Soon | ${siteConfig.name}`,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${name} — Coming Soon | ${siteConfig.name}`,
      description,
      images: ["/og-default.png"],
    },
    robots: {
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    },
  };
}

export function StubPageContent({ name, description, path }: StubPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <CanonicalUrl path={path} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name, url: `${siteConfig.url}${path}` },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: name },
        ]}
        className="mb-8"
      />

      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {name}
        </h1>
        <Badge variant="secondary" className="text-xs font-medium shrink-0">
          Coming Soon
        </Badge>
      </div>

      <p className="text-lg text-muted-foreground leading-relaxed">
        {description}
      </p>

      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">
          We&apos;re building this calculator. Check back soon or{" "}
          <a
            href="/contact"
            className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
          >
            let us know
          </a>{" "}
          if you&apos;d like to see it prioritized.
        </p>
      </div>
    </div>
  );
}