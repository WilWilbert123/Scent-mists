import React from "react";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getPublicProductsAction } from "@/actions/product.actions";
import { ProductGrid } from "@/components/products/product-grid";
import { PageTransition } from "@/components/animations/page-transition";

export const metadata: Metadata = constructMetadata({
  title: "Shop Fragrances & Body Mists",
  description:
    "Aroma Body Mists 50ml and Victoria's Secret Perfumes 85ml with Cash on Delivery and Leaflet GPS pin delivery.",
  path: "/shop",
});

export default async function ShopShowcasePage() {
  const products = await getPublicProductsAction();

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8 space-y-6">
      {/* Editorial Header — Clean & Minimal */}
      <div className="border-b border-border/70 pb-6 space-y-1.5">
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground font-normal">
          Fragrance Collection
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          50ml Aroma Body Mists &amp; 85ml Victoria&apos;s Secret Perfumes • Cash on Delivery &amp; Leaflet Pin Delivery
        </p>
      </div>

      {/* Clean Product Grid */}
      <ProductGrid products={products} />
    </PageTransition>
  );
}
