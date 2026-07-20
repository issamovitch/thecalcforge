import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ─── Types ─── */

export interface CalculatorCardProps {
  /** Card title (e.g. "Auto Loan Calculator"). */
  title: string;
  /** Short description shown under the title. */
  description: string;
  /** Destination URL when the card is clicked. */
  href: string;
  /** Leading icon node (e.g. <Calculator className="h-7 w-7" />). */
  icon?: React.ReactNode;
}

/* ─── Component ─── */

/**
 * Unified navigation card used on the homepage and every hub page.
 *
 * Renders a consistent clickable card with an icon, title, description, and
 * an "Open calculator" affordance with an arrow. Hover lifts the border to
 * the ember accent. Wraps the entire card in a <Link>.
 */
export function CalculatorCard({
  title,
  description,
  href,
  icon,
}: CalculatorCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-shadow hover:shadow-md hover:border-ember/40">
        <CardHeader className="flex flex-row items-start gap-3 pb-2">
          {icon && (
            <div className="mt-0.5 shrink-0 text-muted-foreground">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-ember">
            Open calculator
            <ArrowRight className="h-3 w-3" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
