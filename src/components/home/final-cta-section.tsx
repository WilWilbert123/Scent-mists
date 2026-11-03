import React from "react";
import Link from "next/link";
import { MessageSquare, Compass, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/forms/contact-form";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";

const CONCIERGE_SERVICES = [
  {
    index: "01",
    title: "Bespoke Olfactory Profiling",
    detail:
      "Guidance on selecting between our Floral Musky, Woody Aromatic, Floral Green, and Amber Floral compositions.",
  },
  {
    index: "02",
    title: "Flacon & Formulation Enquiries",
    detail:
      "Detailed specifications on botanical notes, concentration longevity, and seasonal availability.",
  },
  {
    index: "03",
    title: "Gallery & Editorial Partnerships",
    detail:
      "Direct coordination for architectural spaces, botanical exhibitions, and press requests.",
  },
];

export function FinalCtaSection() {
  return (
    <section className="bg-surface/50 py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          {/* Left Services Information — Fades from Left */}
          <RevealOnScroll direction="left" className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-accent">
                <span className="h-px w-6 bg-accent" aria-hidden="true" />
                <p className="eyebrow-label">
                  Client Concierge &amp; Enquiries
                </p>
              </div>
              <h2 className="heading-section text-foreground">
                Connect With the House of SCENTS &amp; MISTS
              </h2>
              <p className="body-editorial text-muted-foreground">
                Whether you wish to learn more about our signature compositions,
                request a private olfactory consultation, or enquire regarding
                gallery and press partnerships, our specialists are at your
                service.
              </p>
            </div>

            <div className="divide-y divide-border/70 border-y border-border/70">
              {CONCIERGE_SERVICES.map((service) => (
                <div key={service.index} className="py-4 flex items-start gap-4">
                  <span className="font-serif text-sm tracking-[0.18em] text-accent pt-0.5">
                    {service.index}
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-medium text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {service.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Verification Badge */}
            <div className="flex items-center gap-3 border border-border/60 bg-surface-elevated/70 p-4">
              <ShieldCheck className="h-5 w-5 text-accent shrink-0" aria-hidden="true" />
              <p className="text-xs font-mono text-muted-foreground">
                Every submission is recorded directly in the SCENTS &amp; MISTS concierge registry in real time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button asChild variant="outline" size="lg">
                <Link href="/fragrance-guide">
                  <Compass className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>Explore Fragrance Guide</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/contact">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span>Dedicated Contact Page</span>
                </Link>
              </Button>
            </div>
          </RevealOnScroll>

          {/* Right Direct Concierge Dispatch — Fades from Right */}
          <RevealOnScroll
            direction="right"
            delay={0.12}
            className="lg:col-span-7 border border-border/80 bg-surface-elevated p-6 sm:p-10 shadow-luxury"
          >
            <div className="mb-6 space-y-1">
              <h3 className="font-serif text-2xl text-foreground font-medium">
                Direct Concierge Dispatch
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                Average concierge response within 24 business hours.
              </p>
            </div>
            <ContactForm />
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
