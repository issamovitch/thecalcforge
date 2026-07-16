import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { siteConfig, TAX_YEAR } from "@/config/site.config";
import { STATES, getStateBySlug, getAllStateSlugs } from "@/lib/states-registry";
import { getStateFlagUrl } from "@/lib/state-flags";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  WebApplicationJsonLd,
  FaqJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/JsonLd";
import { CanonicalUrl } from "@/components/seo/CanonicalUrl";
import { AdSlot } from "@/components/monetization/AdSlot";
import { AffiliateCta } from "@/components/monetization/AffiliateCta";
import { PaycheckCalculator } from "@/components/calculator/PaycheckCalculator";
import { RelatedCalculators } from "@/components/layout/RelatedCalculators";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function generateStaticParams(): Array<{ state: string }> {
  return getAllStateSlugs().map((slug) => ({ state: slug }));
}

interface PageProps {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { state: slug } = await params;
  const entry = getStateBySlug(slug);
  if (!entry) return {};

  const canonicalUrl = `${siteConfig.url}/paycheck/calculator/${slug}`;

  return {
    title: entry.config.meta.title,
    description: entry.config.meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: entry.config.meta.title,
      description: entry.config.meta.description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: entry.config.meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: entry.config.meta.title,
      description: entry.config.meta.description,
      images: ["/og-default.png"],
    },
  };
}

export default async function StatePaycheckCalculatorPage({ params }: PageProps) {
  const { state: slug } = await params;
  const entry = getStateBySlug(slug);

  if (!entry) {
    notFound();
  }

  const { name, config, ContentComponent } = entry;
  const statePath = `/paycheck/calculator/${slug}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <CanonicalUrl path={statePath} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Paycheck & Salary", url: `${siteConfig.url}/paycheck` },
          { name: "Paycheck Calculator", url: `${siteConfig.url}/paycheck/calculator` },
          { name, url: `${siteConfig.url}${statePath}` },
        ]}
      />
      <WebApplicationJsonLd
        name={`${name} Paycheck Calculator`}
        description={config.meta.description}
        url={`${siteConfig.url}${statePath}`}
      />
      <FaqJsonLd faqs={config.faq} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Paycheck & Salary", href: "/paycheck" },
          { label: "Paycheck Calculator", href: "/paycheck/calculator" },
          { label: name },
        ]}
        className="mb-8"
      />

      <div className="flex items-center gap-3.5">
        <Image
          src={getStateFlagUrl(config.abbreviation, 80)}
          alt=""
          width={48}
          height={32}
          className="shrink-0 rounded-sm border border-border"
        />
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {name} Paycheck Calculator {TAX_YEAR}
        </h1>
      </div>
      <p className="mt-3 text-lg text-muted-foreground">
        {config.meta.description}
      </p>

      <div className="mt-8">
        <PaycheckCalculator
          stateSlug={slug}
          stateName={name}
          stateConfig={config}
          showStateSelector={false}
        />
      </div>

      <AdSlot id={`${slug}-below-results`} className="mt-8" />
      <AffiliateCta pagePath={statePath} />

      <section className="mt-12 border-t border-border/50 pt-8">
        <ContentComponent stateConfig={config} />
      </section>

      <AdSlot id={`${slug}-mid-content`} />

      {config.faq.length > 0 && (
        <section className="mt-12 border-t border-border/50 pt-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-muted-foreground">
            Common questions about {name} paycheck taxes and calculations.
          </p>
          <Accordion type="single" collapsible className="mt-6">
            {config.faq.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      <RelatedCalculators excludeStateSlug={slug} />
    </div>
  );
}