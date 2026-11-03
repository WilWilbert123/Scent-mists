import React from "react";
import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="border border-border bg-surface-elevated p-4 space-y-4">
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="border border-border bg-surface-elevated p-12 text-center">
        <p className="font-serif text-2xl text-foreground">
          No Fragrances Currently Displayed
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Our olfactory archive is being curated. Please check back shortly or contact our house concierge.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

