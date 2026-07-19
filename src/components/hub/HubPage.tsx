import Link from "next/link";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  CollectionPageJsonLd,
  FaqJsonLd,
} from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { siteConfig } from "@/config/site.config";

/* ─── Types ─── */

export interface HubCalculator {
  readonly label: string;
  readonly href: string;
  readonly longDescription: string;
  readonly typesCopy: string;
  readonly primaryKeyword: string;
}

export interface HubFaqItem {
  question: string;
  answer: string;
}

export interface HubPageProps {
  /** Page heading (also used as breadcrumb label and collection name). */
  breadcrumbLabel: string;
  /** URL path for this hub, e.g. "/loans". */
  path: string;
  /** CollectionPage meta description for JSON-LD. */
  collectionDescription: string;
  /** 60-100 word intro directly under the H1. */
  intro: string;
  /** Calculators to show in the cards grid and types section. */
  calculators: readonly HubCalculator[];
  /** H2: "How to Calculate" section content (JSX, may contain computed values). */
  howToTitle: string;
  howToContent: React.ReactNode;
  /** H2: "Types of" section intro paragraph. */
  typesTitle: string;
  typesIntro: string;
  /** H2: "Understanding Costs" section content (JSX). */
  costsTitle: string;
  costsContent: React.ReactNode;
  /** FAQ items (rendered as native details + FAQPage JSON-LD). */
  faq: HubFaqItem[];
  /** Optional source citation displayed after the costs section. */
  source?: {
    text: string;
    url: string;
  };
}

/* ─── Component ─── */

export function HubPage({
  breadcrumbLabel,
  path,
  collectionDescription,
  intro,
  calculators,
  howToTitle,
  howToContent,
  typesTitle,
  typesIntro,
  costsTitle,
  costsContent,
  faq,
  source,
}: HubPageProps) {
  const fullUrl = `${siteConfig.url}${path}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* JSON-LD schemas */}
      <CanonicalUrl path={path} />
      <CollectionPageJsonLd
        name={breadcrumbLabel}
        description={collectionDescription}
        url={fullUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: breadcrumbLabel, url: fullUrl },
        ]}
      />
      <FaqJsonLd faqs={faq} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: breadcrumbLabel }]}
        className="mb-8"
      />

      {/* H1 */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {breadcrumbLabel}
      </h1>

      {/* Intro */}
      <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
        {intro}
      </p>

      {/* ─── Calculator Cards ─── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {calculators.map((calc) => (
          <Link key={calc.href} href={calc.href} className="group">
            <Card className="h-full transition-colors hover:border-ember/40 hover:bg-muted/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2.5">
                  <Calculator className="size-5 text-ember" />
                  <CardTitle className="text-base font-semibold group-hover:text-ember transition-colors">
                    {calc.label}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {calc.longDescription}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {calculators.length === 0 && (
        <div className="mt-8 rounded-lg border border-border bg-muted/30 p-6">
          <p className="text-sm text-muted-foreground">
            More calculators are on the way.{" "}
            <Link
              href="/contact"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              Let us know
            </Link>{" "}
            which tools matter most to you.
          </p>
        </div>
      )}

      {/* ─── H2: How to Calculate ─── */}
      <Separator className="my-10" />
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{howToTitle}</h2>
        {howToContent}
      </section>

      {/* ─── H2: Types of ─── */}
      <Separator className="my-10" />
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{typesTitle}</h2>
        <p className="text-muted-foreground leading-relaxed">{typesIntro}</p>
        <ul className="space-y-3">
          {calculators.map((calc) => (
            <li key={calc.href} className="flex gap-2 text-muted-foreground leading-relaxed">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ember" />
              <span>
                <Link
                  href={calc.href}
                  className="font-medium text-foreground underline decoration-ember/30 underline-offset-4 transition-colors hover:text-ember hover:decoration-ember"
                >
                  {calc.primaryKeyword}
                </Link>{" "}
                {calc.typesCopy}.
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── H2: Understanding Costs ─── */}
      <Separator className="my-10" />
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{costsTitle}</h2>
        {costsContent}
        {source && (
          <p className="text-xs text-muted-foreground">
            Source:{" "}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember hover:text-ember-hover underline underline-offset-4"
            >
              {source.text}
            </a>
          </p>
        )}
      </section>

      {/* ─── FAQ ─── */}
      <Separator className="my-10" />
      <section className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">
          Frequently Asked Questions
        </h2>
        {faq.map((item) => (
          <details
            key={item.question}
            className="group rounded-lg border border-border bg-white dark:bg-card"
          >
            <summary className="cursor-pointer select-none px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40">
              {item.question}
            </summary>
            <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}