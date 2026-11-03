import React from "react";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { BRAND_NAME } from "@/lib/constants";
import { PageTransition } from "@/components/animations/page-transition";

export const metadata: Metadata = constructMetadata({
  title: "Privacy Policy",
  description:
    "Learn how SCENTS & MISTS protects visitor privacy, handles customer enquiries, and uses anonymous analytics.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <PageTransition className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="border-b border-border pb-10 space-y-4">
        <div className="inline-flex items-center gap-2 text-accent">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span className="eyebrow-label">Privacy &amp; Data Protection</span>
        </div>
        <h1 className="heading-display text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Effective Date: January 1, 2026 • House of {BRAND_NAME}
        </p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-foreground/90">
        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">
            1. Showcase Nature of This Website
          </h2>
          <p className="text-muted-foreground">
            {BRAND_NAME} operates this website exclusively as a brand showcase and
            client enquiry portfolio. We do not process online payments, store
            payment card details, or operate a commercial checkout cart.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">
            2. Customer Enquiries &amp; Newsletter Subscriptions
          </h2>
          <p className="text-muted-foreground">
            When you voluntarily submit an enquiry through our Contact form, we
            collect your full name, email address, optional telephone number,
            subject, and message solely to respond to your request. When you
            subscribe to our newsletter, we store your email address and
            subscription status.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">
            3. Privacy-Conscious Visitor Analytics
          </h2>
          <p className="text-muted-foreground">
            To understand which fragrances and pages resonate with our visitors,
            we record privacy-conscious analytics: a randomized anonymous
            visitor identifier, a session identifier, the page path viewed,
            high-level referrer category (Direct, Organic Search, Social, or
            Referral), device category (Desktop, Mobile, or Tablet), and browser
            category. We do not store raw IP addresses, precise geolocation, or
            invasive browser fingerprints.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">
            4. Row Level Security &amp; Access Controls
          </h2>
          <p className="text-muted-foreground">
            All enquiries, subscriber records, and visitor analytics are
            protected by PostgreSQL Row Level Security (RLS) in Supabase and are
            accessible exclusively to authenticated, role-verified {BRAND_NAME}{" "}
            administrators.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-2xl text-foreground">
            5. Your Rights &amp; Contact
          </h2>
          <p className="text-muted-foreground">
            You may request access to, correction of, or deletion of any enquiry
            or newsletter subscription associated with your email address at any
            time by submitting a request through our online Contact page (/contact).
          </p>
        </section>
      </div>
    </PageTransition>
  );
}

