import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getPublicCollectionBySlugAction } from "@/actions/collection.actions";
import { getPublicProductsAction } from "@/actions/product.actions";
import { ProductGrid } from "@/components/products/product-grid";
import { PageTransition } from "@/components/animations/page-transition";

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getPublicCollectionBySlugAction(slug);
  if (!collection) {
    return constructMetadata({ title: "Collection Not Found" });
  }
  return constructMetadata({
    title: `${collection.name} Collection`,
    description: collection.description,
    path: `/collections/${collection.slug}`,
    image: collection.image_url,
  });
}

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { slug } = await params;
  const [collection, allProducts] = await Promise.all([
    getPublicCollectionBySlugAction(slug),
    getPublicProductsAction(),
  ]);

  if (!collection) {
    notFound();
  }

  const collectionProducts = allProducts.filter(
    (p) =>
      p.collection_id === collection.id ||
      p.collection_slug === collection.slug ||
      (collection.product_slugs && collection.product_slugs.includes(p.slug))
  );

  const displayedProducts =
    collectionProducts.length > 0 ? collectionProducts : allProducts;

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-14">
      <div>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to All Collections</span>
        </Link>
      </div>

      <div className="border-b border-border pb-12 max-w-3xl space-y-4">
        <p className="eyebrow-label text-accent">Curated Collection</p>
        <h1 className="heading-display text-foreground">{collection.name}</h1>
        <p className="body-editorial text-muted-foreground">
          {collection.description}
        </p>
      </div>

      <ProductGrid products={displayedProducts} />
    </PageTransition>
  );
}

