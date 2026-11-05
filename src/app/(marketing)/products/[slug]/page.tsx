import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getPublicProductBySlugAction } from "@/actions/product.actions";
import { ProductDetails } from "@/components/products/product-details";
import { PageTransition } from "@/components/animations/page-transition";
import { generateFragranceShowcaseJsonLd } from "@/lib/seo";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlugAction(slug);
  if (!product) {
    return constructMetadata({ title: "Fragrance Not Found" });
  }
  return constructMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${product.slug}`,
    image: product.image_url,
  });
}

export default async function ProductShowcaseDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = await getPublicProductBySlugAction(slug);

  if (!product) {
    notFound();
  }

  const jsonLd = generateFragranceShowcaseJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTransition className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-2 pb-6 sm:pt-6 sm:pb-16 space-y-2.5 sm:space-y-6">
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors py-1 font-mono font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to Fragrance Showcase</span>
          </Link>
        </div>

        <ProductDetails product={product} />
      </PageTransition>
    </>
  );
}

