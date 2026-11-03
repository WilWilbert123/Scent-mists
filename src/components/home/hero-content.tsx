"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { useCart } from "@/context/cart-context";
import type { HomepageContentConfig } from "@/types/admin";

interface HeroContentProps {
  content?: HomepageContentConfig;
}



export function HeroContent({ content }: HeroContentProps) {
  const { setIsCartOpen, totalItems } = useCart();

  return (
    <div className="relative z-10 flex flex-col justify-center space-y-4 sm:space-y-6 lg:py-6">


      {/* Brand Display Title */}
      <FadeIn delay={0.08} xOffset={-24} yOffset={0}>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.2rem] font-medium tracking-tight leading-[1.05] text-foreground">
          {content?.heroHeadline || "SCENTS & MISTS"}
        </h1>
      </FadeIn>

      {/* Tagline */}
      <FadeIn delay={0.14} xOffset={-24} yOffset={0}>
        <p className="font-serif text-lg sm:text-2xl italic font-normal tracking-wide text-foreground/90">
          {content?.heroSubheadline || "Authentic Body Mists & Designer Perfumes"}
        </p>
      </FadeIn>

      {/* Hairline Divider */}
      <FadeIn delay={0.18} xOffset={-24} yOffset={0}>
        <div className="h-px w-20 bg-accent/60" aria-hidden="true" />
      </FadeIn>

      {/* Description & Highlights */}
      <FadeIn delay={0.22} xOffset={-24} yOffset={0}>
        <div className="space-y-4 max-w-lg">
          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
            {content?.heroDescription ||
              "Discover our collection of 19 Aroma Body Mists (50ml) and 13 Victoria's Secret Perfumes (85ml). Pin your exact delivery location on our interactive map for smooth doorstep delivery."}
          </p>


        </div>
      </FadeIn>

      {/* Action Buttons */}
      <FadeIn delay={0.28} xOffset={-24} yOffset={0}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-accent px-7 py-3 text-xs uppercase tracking-wider font-semibold rounded-lg shadow-md cursor-pointer"
          >
            <Link href="#catalog">
              <span>Explore Perfumes</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/80 bg-background/50 backdrop-blur-xs px-5 py-3 text-xs uppercase tracking-wider font-semibold text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>View Cart ({totalItems})</span>
          </button>
        </div>
      </FadeIn>
    </div>
  );
}
