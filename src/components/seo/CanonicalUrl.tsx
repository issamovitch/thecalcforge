import { siteConfig } from "@/config/site.config";

interface CanonicalUrlProps {
  path: string;
}

export function CanonicalUrl({ path }: CanonicalUrlProps) {
  const url = `${siteConfig.url}${path}`;

  return <link rel="canonical" href={url} />;
}