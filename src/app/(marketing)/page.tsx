import React from "react";
import Link from "next/link";
import { getHomepageContentAction } from "@/actions/content.actions";
import { getPublicProductsAction } from "@/actions/product.actions";
import { HeroSection } from "@/components/home/hero-section";
import { ProductGrid } from "@/components/products/product-grid";
import { CuratedCollections } from "@/components/home/curated-collections";
import { ServiceGuarantees } from "@/components/home/service-guarantees";
import { BrandIntroduction } from "@/components/home/brand-introduction";
import { ScentExperience } from "@/components/home/scent-experience";
import { IngredientSection } from "@/components/home/ingredient-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
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

      {/* Main Catalog Showcase - Desktop Only (on mobile, customers browse via the dedicated Shop bottom tab) */}
      <section
        id="catalog"
        className="hidden md:block mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-12 py-8 sm:py-16 space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/70 pb-5">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground font-normal tracking-tight">
              Perfume Catalog
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select any mist or perfume to add to cart. Filter by Male Picks, Female Picks, 50ml, or 85ml.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-medium text-accent hover:underline self-start sm:self-auto transition-colors"
          >
            View all 36 perfumes &rarr;
          </Link>
        </div>

        {/* Clean, spacious 3-column luxury desktop grid with enhanced card sizing */}
        <ProductGrid products={products} />
      </section>

      {/* Curated Olfactory Worlds / Category Highlights (Visible on Mobile & Desktop) */}
      <CuratedCollections />

      {/* Cash on Delivery & Leaflet Map Pin Delivery Guarantees */}
      <ServiceGuarantees />

      {/* Brand Philosophy & Craftsmanship */}
      <BrandIntroduction content={homepageContent} />

      {/* How the Fragrance Lives Across the Day (Sensory Choreography) */}
      <ScentExperience />

      {/* Botanical Ingredients & Sourcing */}
      <IngredientSection />

      {/* Real Customer Testimonials & Longevity Impressions */}
      <TestimonialsSection />

      {/* Real-time VIP Scent Club / Newsletter Subscription */}
      <NewsletterSection />
    </>
  );
}
