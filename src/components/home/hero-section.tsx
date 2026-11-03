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
      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6">
            <HeroContent content={content} />
          </div>
          <div className="lg:col-span-6">
            <FadeIn delay={0.2} xOffset={32} yOffset={0} duration={0.9}>
              <HeroPerfumeModel />
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
