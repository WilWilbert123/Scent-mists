import React from "react";
import Link from "next/link";
import { MapPin, ShieldCheck, Truck } from "lucide-react";
import { getHomepageContentAction } from "@/actions/content.actions";
import { getPublicProductsAction } from "@/actions/product.actions";
import { HeroSection } from "@/components/home/hero-section";
import { ProductGrid } from "@/components/products/product-grid";
import { generateBrandJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const [homepageContent, products] = await Promise.all([
    getHomepageContentAction(),
    getPublicProductsAction(),
  ]);

  const jsonLd = generateBrandJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section with Interactive 3D Perfume Model */}
      <HeroSection content={homepageContent} />

      {/* Quick Perks Bar */}
      <section className="border-b border-border bg-surface/40 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface/80 p-3.5 shadow-xs">
              <div className="rounded-md bg-accent/15 p-2 text-accent">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Interactive Leaflet GPS</p>
                <p className="text-[11px] text-muted-foreground">Pin exact drop-off spot for riders</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface/80 p-3.5 shadow-xs">
              <div className="rounded-md bg-accent/15 p-2 text-accent">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Cash on Delivery &amp; GCash</p>
                <p className="text-[11px] text-muted-foreground">Pay safely upon receipt or online</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface/80 p-3.5 shadow-xs">
              <div className="rounded-md bg-accent/15 p-2 text-accent">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Long-Lasting Fragrances</p>
                <p className="text-[11px] text-muted-foreground">50ml Aroma Mists &amp; 85ml VS Perfumes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Showcase */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 py-8 sm:py-14 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/70 pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-normal">
              Perfume Catalog
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select any mist or perfume to add to cart. Filter by Male Picks, Female Picks, 50ml, or 85ml.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-medium text-accent hover:underline self-start sm:self-auto"
          >
            View all 32 perfumes &rarr;
          </Link>
        </div>

        {/* Clean, responsive 2-column mobile / 4-column desktop grid with instant Add to Cart */}
        <ProductGrid products={products} />
      </section>
    </>
  );
}
