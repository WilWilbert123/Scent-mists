import React from "react";
import Link from "next/link";
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


      {/* Main Catalog Showcase - Desktop Only (on mobile, customers browse via the Shop bottom tab) */}
      <section
        id="catalog"
        className="hidden md:block mx-auto max-w-7xl px-4 py-8 sm:py-14 sm:px-6 lg:px-8 space-y-6"
      >
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
