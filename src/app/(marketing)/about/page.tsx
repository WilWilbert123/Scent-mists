import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Feather, Mountain, Sparkles } from "lucide-react";
import { constructMetadata } from "@/lib/metadata";
import { getBrandStoryContentAction } from "@/actions/content.actions";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/animations/page-transition";

export const metadata: Metadata = constructMetadata({
  title: "Our Story & Philosophy",
  description:
    "Discover the story and philosophy of SCENTS & MISTS — inspired by Himalayan cherry blossoms, mountain morning mist, and minimalist restraint.",
  path: "/about",
});

export default async function AboutPage() {
  const story = await getBrandStoryContentAction();

  return (
    <PageTransition className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-24">
      {/* Editorial Hero */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center border-b border-border pb-20">
        <div className="lg:col-span-7 space-y-6">
          <p className="eyebrow-label text-accent">{story.eyebrow}</p>
          <h1 className="heading-display text-foreground">{story.headline}</h1>
          <p className="body-editorial text-muted-foreground">
            {story.leadParagraph}
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-surface">
            <Image
              src="/images/lifestyle/editorial-flacon-study.webp"
              alt="SCENTS & MISTS crystal perfume bottle in natural morning light"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Philosophy & Craftsmanship */}
      <section className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="border border-border bg-surface-elevated p-8 sm:p-12 space-y-5">
          <div className="inline-flex h-11 w-11 items-center justify-center border border-accent/40 bg-surface text-accent">
            <Feather className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="heading-section text-foreground">
            {story.philosophyTitle}
          </h2>
          <p className="body-editorial text-muted-foreground">
            {story.philosophyBody}
          </p>
        </div>

        <div className="border border-border bg-surface-elevated p-8 sm:p-12 space-y-5">
          <div className="inline-flex h-11 w-11 items-center justify-center border border-accent/40 bg-surface text-accent">
            <Mountain className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="heading-section text-foreground">
            {story.craftsmanshipTitle}
          </h2>
          <p className="body-editorial text-muted-foreground">
            {story.craftsmanshipBody}
          </p>
        </div>
      </section>

      {/* Editorial Transparency Note */}
      <section className="border border-border bg-surface p-8 sm:p-12 space-y-6">
        <div className="flex items-center gap-2.5 text-accent">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span className="eyebrow-label">Botanical Transparency</span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-4xl">
          {story.botanicalOriginNote}
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Button asChild>
            <Link href="/collections">
              <span>Explore Collections</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">
              <span>Contact Our Concierge</span>
            </Link>
          </Button>
        </div>
      </section>
    </PageTransition>
  );
}

