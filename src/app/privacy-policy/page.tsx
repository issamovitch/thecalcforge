import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "CalcForge privacy policy. Learn how we handle your data — spoiler: we don't collect any.",
  alternates: { canonical: `${siteConfig.url}/privacy-policy` },
  openGraph: {
    title: "Privacy Policy",
    description: "CalcForge privacy policy. We don't collect personal financial data.",
    url: `${siteConfig.url}/privacy-policy`,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary" as const,
    title: "Privacy Policy",
  },
};

const LAST_UPDATED = "June 15, 2025";

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
        className="mb-8"
      />

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 max-w-[72ch] space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground">
            1. Overview
          </h2>
          <p className="mt-3">
            CalcForge (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            operates the website{" "}
            <a
              href={siteConfig.url}
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              {siteConfig.domain}
            </a>
            . This privacy policy explains our practices regarding the
            collection, use, and disclosure of information when you use our
            service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            2. Information We Collect
          </h2>
          <p className="mt-3">
            <strong className="text-foreground">We do not collect personal
            financial data.</strong> All financial
            calculations are performed entirely in your web browser using
            JavaScript. Your inputs are never transmitted to our servers or stored
            anywhere outside your device.
          </p>
          <p className="mt-3">
            We may collect standard web analytics data such as page views,
            referral sources, device type, and general geographic region through
            privacy-respecting analytics tools. This data is aggregated and
            anonymous — it cannot be used to identify you personally.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            3. Cookies and Tracking
          </h2>
          <p className="mt-3">
            We use minimal, functional cookies only if required for the
            operation of the site (for example, remembering your preferred
            state or theme preference). We do not use advertising trackers,
            cross-site tracking pixels, or third-party cookies for profiling
            purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            4. Third-Party Services
          </h2>
          <p className="mt-3">
            Our site may embed content from third-party services (such as fonts
            or analytics). These services may collect information as described
            in their own privacy policies. We do not control and are not
            responsible for the privacy practices of third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            5. Data Security
          </h2>
          <p className="mt-3">
            Because we do not collect personal financial data, the risk of
            financial data exposure is effectively zero. Our website is served
            over HTTPS, and we follow industry best practices for web security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            6. Children&apos;s Privacy
          </h2>
          <p className="mt-3">
            Our service is not directed at children under the age of 13. We do
            not knowingly collect personal information from children. If you
            believe we have collected information from a child, please contact
            us and we will take steps to remove it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            7. Changes to This Policy
          </h2>
          <p className="mt-3">
            We may update this privacy policy from time to time. Changes will be
            posted on this page with an updated &quot;Last updated&quot;
            date. Your continued use of the site after any changes constitutes
            acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">
            8. Contact Us
          </h2>
          <p className="mt-3">
            If you have questions about this privacy policy, please contact us
            at{" "}
            <a
              href="mailto:hello@thecalcforge.com"
              className="text-ember hover:text-ember-hover underline underline-offset-4 transition-colors"
            >
              hello@thecalcforge.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}