import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass } from "lucide-react";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";

interface FeaturedFragranceProps {
  product: Product;
}

export function FeaturedFragrance({ product }: FeaturedFragranceProps) {
  const concentrationLabel =
    product.concentration ||
    (product.slug === "velvet-amber-and-sakura-dusk"
      ? "Extrait de Parfum"
      : "Eau de Parfum");

  return (
    <section className="border-b border-border bg-surface py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          {/* Product Editorial Imagery — Fades from Left */}
          <RevealOnScroll direction="left" className="lg:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-surface-elevated shadow-luxury">
              <Image
                src={product.image_url}
                alt={`${product.name} — Signature Flacon`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 border border-border/70 bg-surface-elevated/90 p-4 backdrop-blur-xs">
                <p className="eyebrow-label text-black dark:text-white">
                  Signature Olfactory Creation
                </p>
                <p className="font-serif text-lg text-foreground">
                  {product.name} • {product.volume_display || "100 ml"}
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Editorial Copy — Fades from Right */}
          <RevealOnScroll direction="right" delay={0.12} className="lg:col-span-6 space-y-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="blossom">Featured Fragrance</Badge>
              <Badge variant="outline">{product.fragrance_family}</Badge>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/80 pl-1">
                {concentrationLabel}
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="heading-section text-foreground">{product.name}</h2>
              {product.subtitle && (
                <p className="font-serif text-xl italic text-muted-foreground">
                  {product.subtitle}
                </p>
              )}
            </div>

            <p className="body-editorial text-muted-foreground">
              {product.description}
            </p>

            {/* Scent Facets Dossier (Non-redundant formulation attributes) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-y border-border py-6">
              <div className="space-y-1">
                <p className="eyebrow-label text-accent">Concentration</p>
                <p className="font-serif text-base text-foreground">
                  20% Eau de Parfum
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  High-Purity Extract
                </p>
              </div>
              <div className="space-y-1">
                <p className="eyebrow-label text-accent">Measured Sillage</p>
                <p className="font-serif text-base text-foreground">
                  8 – 12 Hours
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Second-Skin Trail
                </p>
              </div>
              <div className="space-y-1">
                <p className="eyebrow-label text-accent">Vessel Standard</p>
                <p className="font-serif text-base text-foreground">
                  100 ML Flacon
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Heavy Optical Glass
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button asChild size="lg">
                <Link href={`/products/${product.slug}`}>
                  <span>Explore Full Olfactory Profile</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/contact?fragrance=${encodeURIComponent(product.name)}`}>
                  <Compass className="h-4 w-4 text-accent" aria-hidden="true" />
                  <span>Request Private Consultation</span>
                </Link>
              </Button>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
