import React from "react";
import { HeroSection } from "@/components/home/hero-section";
import { BrandIntroduction } from "@/components/home/brand-introduction";
import { FragranceNotes } from "@/components/home/fragrance-notes";
import { ScentExperience } from "@/components/home/scent-experience";
import { IngredientSection } from "@/components/home/ingredient-section";
import { LifestyleSection } from "@/components/home/lifestyle-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { getHomepageContentAction } from "@/actions/content.actions";
import { getPublicProductsAction } from "@/actions/product.actions";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { generateBrandJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const [homepageContent, products] = await Promise.all([
    getHomepageContentAction(),
    getPublicProductsAction(),
  ]);

  const featuredProduct =
    products.find((p) => p.slug === homepageContent.featuredFragranceSlug) ||
    products.find((p) => p.is_featured) ||
    products[0] ||
    SAMPLE_PRODUCTS[0];

  const jsonLd = generateBrandJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection content={homepageContent} />
      <BrandIntroduction content={homepageContent} />
      <FragranceNotes initialProduct={featuredProduct} />
      <ScentExperience />
      <IngredientSection />
      <LifestyleSection />
      <TestimonialsSection />
      <NewsletterSection />
      <FinalCtaSection />
    </>
  );
}
