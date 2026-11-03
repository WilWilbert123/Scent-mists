import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import {
  getPublicProductBySlugAction,
  getPublicProductsAction,
} from "@/actions/product.actions";
import { ProductDetails } from "@/components/products/product-details";
import { RelatedProducts } from "@/components/products/related-products";
import { EnquiryForm } from "@/components/forms/enquiry-form";
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
  const [product, allProducts] = await Promise.all([
    getPublicProductBySlugAction(slug),
    getPublicProductsAction(),
  ]);

  if (!product) {
    notFound();
  }

  const jsonLd = generateFragranceShowcaseJsonLd(product);

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Fragrance Showcase</span>
        </Link>
      </div>

      <ProductDetails product={product} />

      {/* Direct Fragrance Enquiry Section */}
      <section aria-labelledby="fragrance-enquiry-heading" className="border-t border-border pt-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="eyebrow-label text-accent">Private Concierge</p>
            <h2 id="fragrance-enquiry-heading" className="heading-section text-foreground">
              Enquire About {product.name}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Submit an enquiry to request complimentary scent blotters, private
              salon consultations, or availability details for {product.name}.
            </p>
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm fragranceName={product.name} />
          </div>
        </div>
      </section>

      <RelatedProducts products={allProducts} currentSlug={product.slug} />
    </PageTransition>
  );
}

