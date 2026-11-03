import { BRAND_NAME } from "./constants";
import type { Product } from "@/types/product";

export function generateBrandJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: BRAND_NAME,
    url: siteUrl,
    description:
      "Luxury botanical fragrance house inspired by delicate Himalayan cherry blossoms and crisp mountain mist.",
    logo: `${siteUrl}/images/logo/logo.svg`,
  };
}

export function generateFragranceShowcaseJsonLd(product: Product) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    category: product.fragrance_family,
    url: `${siteUrl}/products/${product.slug}`,
    image: `${siteUrl}${product.image_url}`,
  };
}

