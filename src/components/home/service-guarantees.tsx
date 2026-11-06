"use client";

import React from "react";
import { Coins, MapPin, ShieldCheck, Truck } from "lucide-react";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";

const GUARANTEES = [
  {
    icon: Coins,
    title: "Cash on Delivery",
    tagline: "Nationwide COD Available",
    description:
      "Pay securely upon arrival. Inspect your sealed fragrance order at your doorstep before handing payment.",
  },
  {
    icon: MapPin,
    title: "Leaflet Map Pinpoint",
    tagline: "Accurate Door-to-Door Delivery",
    description:
      "Pin your exact gate, building, or landmark on our interactive map at checkout for zero courier delays.",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic Oils",
    tagline: "6–8 Hours Skin Longevity",
    description:
      "Formulated with genuine perfume essence and high-purity botanical oils for lasting projection and sillage.",
  },
  {
    icon: Truck,
    title: "Reinforced Packaging",
    tagline: "Rapid Dispatch",
    description:
      "Every glass flacon is cushioned in shock-absorbent bubble wrap and double-wall protective luxury cartons.",
  },
];

export function ServiceGuarantees() {
  return (
    <section className="border-b border-border bg-surface/60 py-12 sm:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <RevealOnScroll className="text-center max-w-2xl mx-auto space-y-2">
          <p className="eyebrow-label text-accent">The SCENTS & MISTS Standard</p>
          <h2 className="heading-section text-foreground">
            Doorstep Luxury &amp; Guaranteed Authenticity
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            We prioritize seamless shopping, accurate courier routing, and pristine bottle condition.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {GUARANTEES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <RevealOnScroll
                key={item.title}
                delay={idx * 0.08}
                className="group relative flex flex-col justify-between border border-border/80 bg-surface-elevated p-6 rounded-xl transition-all duration-300 hover:border-accent/60 hover:shadow-luxury"
              >
                <div className="space-y-3.5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-accent font-semibold">
                      {item.tagline}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground/80 uppercase tracking-widest">
                  <span>Standard 0{idx + 1}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

