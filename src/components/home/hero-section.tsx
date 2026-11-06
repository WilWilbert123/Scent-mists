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
      className="relative min-h-[calc(100dvh-56px-56px)] sm:h-auto sm:min-h-[calc(100dvh-73px)] w-full overflow-hidden border-b border-border flex flex-col justify-between sm:justify-center items-center"
    >
      <HeroBackground />
      <div className="relative mx-auto w-full max-w-7xl h-full flex flex-col justify-between sm:justify-center px-4 pt-2 pb-2 sm:py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between sm:grid sm:grid-cols-1 sm:gap-8 lg:gap-10 lg:grid-cols-12 items-center h-full sm:h-auto">
          {/* Mobile First: 3D Perfume bottle displays prominently at the top */}
          <div className="order-1 lg:order-2 lg:col-span-6 w-full flex-1 sm:flex-initial flex items-center justify-center min-h-0">
            <FadeIn delay={0.08} xOffset={0} yOffset={0} duration={0.8} className="w-full h-full flex items-center justify-center">
              <HeroPerfumeModel />
            </FadeIn>
          </div>
          {/* Mobile Bottom: Brand display & description neatly framed beneath */}
          <div className="order-2 lg:order-1 lg:col-span-6 w-full shrink-0 pb-2 sm:pb-0">
            <HeroContent content={content} />
          </div>
        </div>
      </div>
    </section>
  );
}
