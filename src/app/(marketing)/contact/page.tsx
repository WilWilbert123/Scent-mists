import React from "react";
import type { Metadata } from "next";
import { MessageSquare, Compass, ShieldCheck } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { ConciergeTabs } from "@/components/chat/concierge-tabs";
import { PageTransition } from "@/components/animations/page-transition";

export const metadata: Metadata = constructMetadata({
  title: "Atelier Concierge & Live Chat",
  description:
    "Direct live chat with the SCENTS & MISTS seller and concierge enquiries.",
  path: "/contact",
});

interface ContactPageProps {
  searchParams: Promise<{ fragrance?: string; tab?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedParams = await searchParams;
  const defaultSubject = resolvedParams.fragrance
    ? `Fragrance Enquiry: ${resolvedParams.fragrance}`
    : "";
  const initialTab = resolvedParams.tab === "enquiry" ? "enquiry" : "chat";

  return (
    <PageTransition className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3 sm:py-16 space-y-3 sm:space-y-10">
      {/* Header — compact on mobile */}
      <div className="border-b border-border/70 pb-2 sm:pb-6 max-w-3xl space-y-1">
        <h1 className="font-serif text-xl sm:text-3xl text-foreground font-normal">
          Concierge &amp; Live Chat
        </h1>
        <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Connect directly with our fragrance specialists for recommendations, stock availability, and delivery assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:gap-12 lg:grid-cols-12 items-start">
        {/* Left: Desktop only guide */}
        <div className="hidden lg:block lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-border bg-surface-elevated p-8 space-y-6">
            <h2 className="font-serif text-2xl text-foreground">
              Atelier Support Services
            </h2>
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Real-Time Seller Chat</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Chat directly with our boutique specialists. Inquiries on scent notes, stock status, and COD orders are answered immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Compass className="h-4 w-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Personalized Scent Advice</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Not sure between 50ml Aroma Mists or 85ml Victoria&apos;s Secret perfumes? Our concierge can guide you based on your occasion or preference.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Direct House Confidentiality</span>
            </div>
            <p className="leading-relaxed">
              Every message and enquiry is handled confidentially and synced directly to verified SCENTS &amp; MISTS administrators.
            </p>
          </div>
        </div>

        {/* Right: Concierge Tabs (Chat with Seller default tab + Enquiry Ticket tab) */}
        <div className="lg:col-span-7">
          <ConciergeTabs defaultSubject={defaultSubject} initialTab={initialTab} />
        </div>
      </div>
    </PageTransition>
  );
}
