import type { MetadataRoute } from "next";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { SAMPLE_COLLECTIONS } from "@/data/collections";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  const staticRoutes = [
    "",
    "/shop",
    "/collections",
    "/about",
    "/fragrance-guide",
    "/contact",
    "/privacy",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const productRoutes = SAMPLE_PRODUCTS.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const collectionRoutes = SAMPLE_COLLECTIONS.map((col) => ({
    url: `${siteUrl}/collections/${col.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}

