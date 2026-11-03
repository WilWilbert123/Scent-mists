import React from "react";
import Link from "next/link";
import { Quote, ArrowUpRight } from "lucide-react";
import { SAMPLE_TESTIMONIALS } from "@/data/testimonials";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";

export function TestimonialsSection() {
  return (
    <section className="border-b border-border bg-surface py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <RevealOnScroll direction="left" className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-accent">
              <span className="h-px w-6 bg-accent" aria-hidden="true" />
              <p className="eyebrow-label">Olfactory Impressions</p>
            </div>
            <h2 className="heading-section text-foreground">
              Reflections on the Scent Trail
            </h2>
          </RevealOnScroll>
          <RevealOnScroll direction="right" delay={0.1} className="max-w-md">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Notes on skin chemistry, sillage, and the quiet atmospheric evolution
              of SCENTS &amp; MISTS compositions from first mist to dry-down.
            </p>
          </RevealOnScroll>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {SAMPLE_TESTIMONIALS.map((item, idx) => (
            <RevealOnScroll
              key={item.id}
              delay={idx * 0.1}
              className="group flex flex-col justify-between border border-border/80 bg-surface-elevated transition-all duration-500 hover:border-accent/60 hover:shadow-luxury"
            >
              {/* Top Header Bar */}
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground bg-surface/60 font-mono">
                <span className="font-medium text-foreground/85">
                  {item.impressionNumber}
                </span>
                <span className="text-accent">{item.longevity}</span>
              </div>

              {/* Quote Body */}
              <div className="p-7 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <Quote
                    className="h-5 w-5 text-accent/80"
                    aria-hidden="true"
                  />
                  <blockquote className="font-serif text-lg sm:text-xl italic leading-relaxed text-foreground">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Fragrance Reference Link */}
                <div className="border-t border-border/60 pt-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
                    {item.author}
                  </p>
                  <p className="text-xs text-foreground/80 font-medium">
                    {item.role} • {item.accords}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={`/products/${item.fragranceSlug}`}
                      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-medium text-accent hover:text-foreground transition-colors group/link"
                    >
                      <span>Fragrance: {item.fragrance}</span>
                      <ArrowUpRight
                        className="h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
