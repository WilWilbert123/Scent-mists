import React from "react";
import type { HomepageContentConfig } from "@/types/admin";
import { HeroBackground } from "./hero-background";
import { HeroContent } from "./hero-content";
import { HeroPerfumeModel } from "./hero-perfume-model";
import { FadeIn } from "@/components/animations/fade-in";

interface HeroSectionProps {
  content: HomepageContentConfig;
}

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section
      aria-label="Featured fragrance introduction"
      className="relative min-h-[calc(100dvh-73px)] w-full overflow-hidden border-b border-border flex items-center"
    >
      <HeroBackground />
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-4 pb-10 sm:py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-2 sm:gap-8 lg:gap-10 lg:grid-cols-12 items-center">
          {/* Mobile First: 3D Perfume bottle displays at the top on mobile screens */}
          <div className="order-1 lg:order-2 lg:col-span-6 w-full">
            <FadeIn delay={0.08} xOffset={0} yOffset={-12} duration={0.8}>
              <HeroPerfumeModel />
            </FadeIn>
          </div>
          {/* Mobile Bottom: Brand display, description, and action buttons beneath the bottle */}
          <div className="order-2 lg:order-1 lg:col-span-6 w-full">
            <HeroContent content={content} />
          </div>
        </div>
      </div>
    </section>
  );
}
