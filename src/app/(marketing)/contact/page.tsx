import React from "react";
import type { Metadata } from "next";
import { MessageSquare, Sparkles, ShieldCheck } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/forms/contact-form";
import { PageTransition } from "@/components/animations/page-transition";

export const metadata: Metadata = constructMetadata({
  title: "Contact & Enquiries",
  description:
    "Submit a fragrance enquiry to SCENTS & MISTS.",
  path: "/contact",
});

interface ContactPageProps {
  searchParams: Promise<{ fragrance?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedParams = await searchParams;
  const defaultSubject = resolvedParams.fragrance
    ? `Fragrance Enquiry: ${resolvedParams.fragrance}`
    : "";

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      <div className="border-b border-border pb-12 max-w-3xl space-y-4">
        <p className="eyebrow-label text-accent">Enquiries</p>
        <h1 className="heading-display text-foreground">
          Contact SCENTS &amp; MISTS
        </h1>
        <p className="body-editorial text-muted-foreground">
          Have a question regarding our fragrances, olfactory notes, or
          collections? Submit your enquiry below and our team will respond
          directly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        {/* Left: Accurate Online Enquiry Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-border bg-surface-elevated p-8 space-y-6">
            <h2 className="font-serif text-2xl text-foreground">
              How Enquiries Work
            </h2>
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-accent mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Direct Online Submission</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Every message submitted through this form is recorded
                    directly in the SCENTS &amp; MISTS administrator portal for
                    review and follow-up.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-accent mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Fragrance &amp; Collection Guidance</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Include the fragrance name or collection in your subject line
                    if you are enquiring about a specific scent profile.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border bg-surface p-6 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Data Privacy Assurance</span>
            </div>
            <p className="leading-relaxed">
              Your enquiry is transmitted securely and accessible only to
              verified SCENTS &amp; MISTS administrators. We never sell or share
              your contact details.
            </p>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7">
          <ContactForm defaultSubject={defaultSubject} />
        </div>
      </div>
    </PageTransition>
  );
}
