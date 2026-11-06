import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Compass, ShieldCheck } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getPublicProductsAction } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/animations/page-transition";
import { OlfactoryMatrix } from "@/components/fragrance-guide/olfactory-matrix";

export const metadata: Metadata = constructMetadata({
  title: "Olfactory Fragrance Guide",
  description:
    "Understand fragrance families, three-tier skin evolution, concentration longevity, and application rituals across SCENTS & MISTS creations.",
  path: "/fragrance-guide",
});

const APPLICATION_STEPS = [
  {
    step: "01",
    phase: "Distance & Diffusion",
    title: "Mist from 15 – 20 cm",
    body: "Allow the micro-calibrated atomizer to disperse a weightless, uniform veil across pulse points (collarbone, inner wrists, base of the throat) so volatile mountain citrus and airy accords settle evenly.",
  },
  {
    step: "02",
    phase: "Restraint & Chemistry",
    title: "Do Not Rub Wrists",
    body: "Frictional heat accelerates evaporation prematurely, shearing delicate cherry blossom enfleurage molecules. Allow the perfume oil to dry naturally and marry with your skin's personal lipid chemistry.",
  },
  {
    step: "03",
    phase: "Botanical Conservation",
    title: "Cool Shadow Preservation",
    body: "Store your optical crystal flacon in a stable, temperate setting away from direct ultraviolet rays and sudden humidity shifts to preserve volatile botanical heartwoods and delicate petal extracts.",
  },
];

export default async function FragranceGuidePage() {
  const products = await getPublicProductsAction();

  const signature =
    products.find((p) => p.is_featured) ||
    products.find((p) => p.slug === "sakura-and-mountain-mist") ||
    products[0];

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-24">
      {/* Editorial Page Header */}
      <div className="border-b border-border pb-12 max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 text-accent">
          <Compass className="h-4 w-4" aria-hidden="true" />
          <span className="eyebrow-label">Olfactory Education &amp; Codex</span>
        </div>
        <h1 className="heading-display text-foreground">
          The SCENTS &amp; MISTS Fragrance Guide
        </h1>
        <p className="body-editorial text-muted-foreground">
          A definitive guide to reading botanical compositions, understanding how
          top, heart, and base notes unfold on skin, and discovering the olfactory
          family suited to your daily ritual.
        </p>
      </div>

      {/* Interactive Four Olfactory Families Matrix (Live Database Backed) */}
      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1.5">
            <span className="eyebrow-label text-accent">
              Composition Chapters
            </span>
            <h2 className="heading-section text-foreground">
              Four Olfactory Families
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-md font-serif italic">
            Select an olfactory family below to inspect its live three-tier pyramid,
            botanical notes, and seasonal character.
          </p>
        </div>

        <OlfactoryMatrix products={products} />
      </section>

      {/* Ritual of Application */}
      <section className="border border-border bg-surface-elevated p-8 sm:p-14 space-y-12 shadow-luxury">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end border-b border-border/80 pb-8">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <span className="eyebrow-label">Ritual of Application</span>
            </div>
            <h2 className="heading-section text-foreground">
              Preserving Delicate Top Notes &amp; Sillage
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="body-editorial text-muted-foreground">
              Formulated at 18% – 25% Eau and Extrait de Parfum concentration, every
              SCENTS &amp; MISTS composition is engineered to evolve cleanly across 8 to
              12 hours of skin wear without synthetic fixative fatigue.
            </p>
          </div>
        </div>

        {/* 3 Step Application Guidelines */}
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {APPLICATION_STEPS.map((step) => (
            <li
              key={step.step}
              className="border border-border bg-surface p-7 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em]">
                  <span className="text-accent font-serif text-sm">
                    Step {step.step}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {step.phase}
                  </span>
                </div>
                <h3 className="font-serif text-xl text-foreground font-medium">
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>

              <div className="border-t border-border/60 pt-3">
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Optimal Diffusion
                </span>
              </div>
            </li>
          ))}
        </ol>

        {/* Bottom CTA Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/80 pt-8">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
            <span>
              Every formulation is verified against IFRA standards and macerated in small batches.
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            {signature && (
              <Button asChild>
                <Link href={`/products/${signature.slug}`}>
                  <span>Explore {signature.name}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/contact">
                <span>Ask a Fragrance Specialist</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
