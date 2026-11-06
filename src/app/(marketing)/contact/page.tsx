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
    <PageTransition className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8 py-1.5 sm:py-3 lg:py-3 space-y-1.5 sm:space-y-3 lg:space-y-3">
      {/* Header — compact on mobile and desktop webview */}
      <div className="border-b border-border/70 pb-1 sm:pb-2 max-w-3xl space-y-0.5">
        <h1 className="font-serif text-base sm:text-2xl text-foreground font-normal">
          Concierge &amp; Live Chat
        </h1>
        <p className="hidden sm:block text-xs text-muted-foreground leading-normal">
          Connect directly with our fragrance specialists for recommendations, stock availability, and delivery assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:gap-8 lg:grid-cols-12 items-start">
        {/* Left: Desktop only guide */}
        <div className="hidden lg:block lg:col-span-5 space-y-3">
          <div className="rounded-2xl border border-border bg-surface-elevated p-4 lg:p-5 space-y-3.5">
            <h2 className="font-serif text-lg lg:text-xl text-foreground font-normal">
              Atelier Support Services
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MessageSquare className="h-4 w-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Real-Time Seller Chat</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Chat directly with our boutique specialists. Inquiries on scent notes, stock status, and COD orders are answered immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Compass className="h-4 w-4 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Personalized Scent Advice</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Not sure between 50ml Aroma Mists or 85ml Victoria&apos;s Secret perfumes? Our concierge can guide you based on your occasion or preference.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-3.5 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span className="text-xs">Direct House Confidentiality</span>
            </div>
            <p className="text-[11px] leading-relaxed">
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
