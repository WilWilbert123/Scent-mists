import React from "react";
import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";

const DISPATCH_HIGHLIGHTS = [
  "Seasonal Botanical Harvest Notes",
  "Private Exhibition Invitations",
  "New Composition Unveilings",
];

export function NewsletterSection() {
  return (
    <section className="border-b border-border bg-background py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border border-border/80 bg-surface p-8 sm:p-14 lg:p-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
            {/* Left Content — Fades from Left */}
            <RevealOnScroll direction="left" className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-accent">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span className="eyebrow-label">The House Journal</span>
                </div>
                <h2 className="heading-section text-foreground">
                  Receive Seasonal Olfactory Dispatches
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Join our private mailing list for invitations to botanical
                  exhibitions, seasonal harvest notes, and new fragrance
                  unveilings from SCENTS &amp; MISTS.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {DISPATCH_HIGHLIGHTS.map((item) => (
                  <span
                    key={item}
                    className="border border-border/70 bg-surface-elevated px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-mono"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </RevealOnScroll>

            {/* Right Form — Fades from Right */}
            <RevealOnScroll direction="right" delay={0.12} className="lg:col-span-5 flex lg:justify-end">
              <NewsletterForm />
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
