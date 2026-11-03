import React from "react";
import Link from "next/link";
import { MessageSquare, BookOpen, ShieldCheck } from "lucide-react";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "./product-gallery";
import { FragranceNotesDisplay } from "./fragrance-notes-display";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery
            name={product.name}
            primaryImage={product.image_url}
            gallery={product.gallery}
          />
        </div>

        {/* Right: Editorial Details */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="blossom">{product.fragrance_family}</Badge>
              {product.concentration && (
                <Badge variant="outline">{product.concentration}</Badge>
              )}
              {product.volume_display && (
                <Badge variant="outline">{product.volume_display}</Badge>
              )}
            </div>

            <h1 className="heading-section text-foreground pt-1">
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="font-serif text-xl italic text-muted-foreground">
                {product.subtitle}
              </p>
            )}
          </div>

          <p className="body-editorial text-foreground/90">
            {product.description}
          </p>

          {product.scent_profile && (
            <div className="border-y border-border py-5 space-y-1.5">
              <span className="eyebrow-label text-muted-foreground">
                Olfactory Character
              </span>
              <p className="font-serif text-lg text-foreground">
                {product.scent_profile}
              </p>
            </div>
          )}

          {/* Showcase Actions (No Cart / No Ecommerce) */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button asChild size="lg">
              <Link href={`/contact?fragrance=${encodeURIComponent(product.name)}`}>
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span>Enquire About This Fragrance</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/fragrance-guide">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>Olfactory Guide</span>
              </Link>
            </Button>
          </div>

          <div className="border border-border/70 bg-surface p-5 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Private Consultation &amp; Showcase</span>
            </div>
            <p className="leading-relaxed">
              SCENTS &amp; MISTS creations are presented as a curated brand showcase.
              Connect with our specialists to request scent strips, private salon
              appointments, or retail stockist details.
            </p>
          </div>
        </div>
      </div>

      {/* Fragrance Pyramid */}
      <FragranceNotesDisplay
        topNotes={product.top_notes}
        heartNotes={product.heart_notes}
        baseNotes={product.base_notes}
      />
    </div>
  );
}

