import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, MessageSquare } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getPublicProductsAction } from "@/actions/product.actions";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/animations/page-transition";

export const metadata: Metadata = constructMetadata({
  title: "Fragrance Showcase",
  description:
    "Explore the complete SCENTS & MISTS botanical perfume showcase.",
  path: "/shop",
});

export default async function ShopShowcasePage() {
  const products = await getPublicProductsAction();

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* Editorial Header */}
      <div className="border-b border-border pb-12 space-y-5 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-accent">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span className="eyebrow-label">Informational Fragrance Archive</span>
        </div>
        <h1 className="heading-display text-foreground">
          The Fragrance Showcase
        </h1>
        <p className="body-editorial text-muted-foreground">
          Discover our botanical compositions inspired by high-altitude mist,
          delicate cherry blossoms, and mountain cedarwood. This gallery is an
          informational brand showcase—select any creation to study its olfactory
          pyramid or submit a private enquiry.
        </p>
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} />

      {/* Private Consultation Banner */}
      <div className="border border-border bg-surface p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <p className="eyebrow-label text-accent">Bespoke Olfactory Guidance</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground">
            Request Scent Strips or a Private Salon Appointment
          </h2>
          <p className="text-sm text-muted-foreground">
            Our specialists can guide you through fragrance families, seasonal
            wearability, and stockist availability.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/contact">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>Submit an Enquiry</span>
          </Link>
        </Button>
      </div>
    </PageTransition>
  );
}

