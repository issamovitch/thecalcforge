import Link from "next/link";
import { Calculator } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  BreadcrumbJsonLd,
  CollectionPageJsonLd,
  FaqJsonLd,
} from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { CalculatorCard } from "@/components/shared/CalculatorCard";
import { FaqSection, type FaqItem } from "@/components/shared/FaqSection";
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
  const faqItems: FaqItem[] = faq;

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
          <CalculatorCard
            key={calc.href}
            title={calc.label}
            description={calc.longDescription}
            href={calc.href}
            icon={<Calculator className="size-5" />}
          />
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
      <FaqSection faqs={faqItems} />
    </div>
  );
}
