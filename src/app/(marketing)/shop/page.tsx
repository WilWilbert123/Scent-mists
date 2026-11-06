import React from "react";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { getPublicProductsAction } from "@/actions/product.actions";
import { getBannersContentAction } from "@/actions/content.actions";
import type { BannerItemConfig } from "@/types/admin";
import { ProductGrid } from "@/components/products/product-grid";
import { ShopBannerCarousel } from "@/components/shop/shop-banner-carousel";
import { PageTransition } from "@/components/animations/page-transition";
import { DEFAULT_BANNERS } from "@/lib/constants";

export const metadata: Metadata = constructMetadata({
  title: "Shop Fragrances & Body Mists",
  description:
    "Aroma Body Mists 50ml and Victoria's Secret Perfumes 85ml with Cash on Delivery and Leaflet GPS pin delivery.",
  path: "/shop",
});

export default async function ShopShowcasePage() {
  const [products, bannersFromDb] = await Promise.all([
    getPublicProductsAction(),
    getBannersContentAction(),
  ]);

  // Use active banners from database; if none configured with placement === "shop", use default shop banners
  const shopBannersFromDb = (bannersFromDb || []).filter(
    (b: BannerItemConfig) => (b.placement === "shop" || !b.placement) && b.isActive !== false && Boolean(b.imageUrl)
  );

  const shopBanners =
    shopBannersFromDb.length > 0
      ? shopBannersFromDb
      : DEFAULT_BANNERS.filter((b) => b.placement === "shop");

  return (
    <PageTransition className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-10 xl:px-12 py-2 sm:py-8 space-y-4 sm:space-y-8">
      {/* Dynamic Auto-Sliding Promotional Banner Carousel (Admin Configurable) */}
      <ShopBannerCarousel banners={shopBanners} />

      {/* Clean Product Grid with Category Pills & Search at the very top */}
      <ProductGrid products={products} />
    </PageTransition>
  );
}
