import React from "react";
import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";

interface RelatedProductsProps {
  products: Product[];
  currentSlug: string;
}

export function RelatedProducts({ products, currentSlug }: RelatedProductsProps) {
  const related = products.filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-fragrances-heading" className="space-y-8 border-t border-border pt-16">
      <div className="space-y-2">
        <p className="eyebrow-label text-accent">Companion Creations</p>
        <h2 id="related-fragrances-heading" className="heading-section text-foreground">
          Continue the Olfactory Journey
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}

