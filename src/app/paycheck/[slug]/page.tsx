import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site.config";
import { getStubBySlug, getAllStubSlugs } from "@/lib/stubs-registry";
import { StubPageContent, generateStubMetadata } from "@/components/layout/StubPage";

export function generateStaticParams(): Array<{ slug: string }> {
  return getAllStubSlugs().map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const stub = getStubBySlug(slug);
  if (!stub) return {};

  return generateStubMetadata({
    name: stub.name,
    description: stub.description,
    path: `/paycheck/${stub.slug}`,
  });
}

export default async function PaycheckStubPage({ params }: PageProps) {
  const { slug } = await params;
  const stub = getStubBySlug(slug);

  if (!stub) {
    notFound();
  }

  return (
    <StubPageContent
      name={stub.name}
      description={stub.description}
      path={`/paycheck/${stub.slug}`}
    />
  );
}