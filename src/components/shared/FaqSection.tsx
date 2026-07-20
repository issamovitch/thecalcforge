import { Separator } from "@/components/ui/separator";

/* ─── Types ─── */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  /** FAQ items to render. */
  faqs: FaqItem[];
  /** Optional heading text (defaults to "Frequently Asked Questions"). */
  title?: string;
  /** Render a Separator above the section (default: true). */
  withSeparator?: boolean;
  /** Extra className for the wrapping section. */
  className?: string;
}

/* ─── Chevron icon (embedded so no local function is needed) ─── */

function ChevronIcon() {
  return (
    <svg
      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/* ─── Component ─── */

/**
 * Unified FAQ section used across every calculator page and hub page.
 *
 * Renders a consistent accordion of native <details>/<summary> elements with
 * a rotating chevron, ember hover accent, and uniform spacing. Pair with
 * <FaqJsonLd /> from "@/components/seo/JsonLd" for structured data.
 */
export function FaqSection({
  faqs,
  title = "Frequently Asked Questions",
  withSeparator = true,
  className = "",
}: FaqSectionProps) {
  return (
    <>
      {withSeparator && <Separator className="my-12" />}

      <section className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-lg border border-border bg-card"
            >
              <summary className="cursor-pointer select-none px-5 py-4 text-sm font-semibold text-foreground list-none flex items-center justify-between">
                {faq.question}
                <ChevronIcon />
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
