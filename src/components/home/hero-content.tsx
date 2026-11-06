"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ShoppingBag } from "lucide-react";
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
    <div className="relative z-10 flex flex-col justify-center space-y-2 sm:space-y-6 lg:py-6">
      {/* Brand Display Title */}
      <FadeIn delay={0.08} xOffset={-24} yOffset={0}>
        <h1 className="font-serif text-[1.7rem] sm:text-5xl lg:text-[4.2rem] font-medium tracking-tight leading-[1.05] text-foreground text-center lg:text-left">
          {content?.heroHeadline || "SCENTS & MISTS"}
        </h1>
      </FadeIn>

      {/* Tagline */}
      <FadeIn delay={0.14} xOffset={-24} yOffset={0}>
        <p className="font-serif text-sm sm:text-xl lg:text-2xl italic font-normal tracking-wide text-foreground/90 text-center lg:text-left">
          {content?.heroSubheadline || "Timeless Elegance. Lasting Impression."}
        </p>
      </FadeIn>

      {/* Hairline Divider - Clean subtle spacing on desktop */}
      <FadeIn delay={0.18} xOffset={-24} yOffset={0}>
        <div className="hidden sm:block h-px w-16 sm:w-20 bg-accent/60 mx-auto lg:mx-0" aria-hidden="true" />
      </FadeIn>

      {/* Description & Highlights */}
      <FadeIn delay={0.22} xOffset={-24} yOffset={0}>
        <div className="max-w-sm sm:max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
          <p className="text-xs sm:text-base text-foreground/80 leading-relaxed font-sans">
            {content?.heroDescription ||
              "Fine botanical Eau de Parfum composed with wild cherry blossom, steamed white tea, and mountain cedarwood."}
          </p>
        </div>
      </FadeIn>

      {/* Mobile Subtle Scroll Cue */}
      <div className="md:hidden flex items-center justify-center pt-2 text-[10px] text-muted-foreground/75 font-mono tracking-widest uppercase">
        <span>Scroll to explore</span>
        <ChevronDown className="h-3.5 w-3.5 ml-1 animate-bounce text-accent" />
      </div>

      {/* Action Buttons - Shown on desktop/tablet, hidden on mobile so mobile visitors use the Shop bottom tab */}
      <FadeIn delay={0.28} xOffset={-24} yOffset={0}>
        <div className="hidden md:flex sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-accent px-7 py-3 text-xs uppercase tracking-wider font-semibold rounded-lg shadow-md cursor-pointer"
          >
            <Link href="/shop">
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
