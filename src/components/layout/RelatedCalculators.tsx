import Link from "next/link";
import { STATES } from "@/lib/states-registry";

interface RelatedCalculatorsProps {
  /** Override the default state-based siblings; provide custom links */
  customItems?: Array<{ label: string; href: string; description?: string }>;
  /** If showing state siblings, which state to exclude (the current page) */
  excludeStateSlug?: string;
  /** Whether to include the Federal Paycheck Calculator link (default true) */
  includeFederal?: boolean;
}

export function RelatedCalculators({ customItems, excludeStateSlug, includeFederal = true }: RelatedCalculatorsProps) {
  const items = customItems ?? generateStateSiblings(excludeStateSlug, includeFederal);

  if (items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-border/50 pt-8">
      <h2 className="text-xl font-semibold text-foreground mb-6">Related Calculators</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-ember/40 hover:bg-muted/50"
          >
            <span className="font-medium text-foreground group-hover:text-ember transition-colors">
              {item.label}
            </span>
            {item.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

function generateStateSiblings(excludeSlug?: string, includeFederal = true): Array<{ label: string; href: string; description: string }> {
  const hubLink = { label: "All Paycheck Calculators", href: "/paycheck", description: "Browse the full catalog of paycheck and salary tools." };
  const federalLink = { label: "Federal Paycheck Calculator", href: "/paycheck/calculator", description: "Calculate take-home pay with state selector." };

  const stateLinks = STATES.filter((s) => s.slug !== excludeSlug).slice(0, 5).map((s) => ({
    label: `${s.name} Paycheck Calculator`,
    href: `/paycheck/calculator/${s.slug}`,
    description: s.config.meta.description.length > 90
      ? s.config.meta.description.slice(0, 90) + "…"
      : s.config.meta.description,
  }));

  return [hubLink, ...(includeFederal ? [federalLink] : []), ...stateLinks];
}