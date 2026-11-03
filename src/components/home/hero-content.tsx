import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import type { HomepageContentConfig } from "@/types/admin";

interface HeroContentProps {
  content: HomepageContentConfig;
}

const SIGNATURE_NOTES = [
  "Wild Cherry Blossom",
  "Silver Needle White Tea",
  "Cashmere Cedarwood",
];

export function HeroContent({ content }: HeroContentProps) {
  return (
    <div className="relative z-10 flex flex-col justify-center space-y-4 sm:space-y-6 lg:py-10">
      {/* Subtle Maison Eyebrow */}
      <FadeIn delay={0.04} xOffset={-24} yOffset={0}>
        <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-foreground/75">
          <span>{content.heroEyebrow || "Maison de Haute Parfumerie"}</span>
          <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
          <span>100 ML Eau de Parfum</span>
        </div>
      </FadeIn>

      {/* Brand Display Title */}
      <FadeIn delay={0.08} xOffset={-24} yOffset={0}>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.35rem] font-normal tracking-[0.06em] leading-[1.04] text-foreground">
          {content.heroHeadline}
        </h1>
      </FadeIn>

      {/* Signature Tagline */}
      <FadeIn delay={0.14} xOffset={-24} yOffset={0}>
        <p className="font-serif text-lg sm:text-2xl lg:text-[1.65rem] italic font-normal tracking-wide text-foreground/90">
          {content.heroSubheadline}
        </p>
      </FadeIn>

      {/* Architectural Hairline Divider */}
      <FadeIn delay={0.18} xOffset={-24} yOffset={0}>
        <div className="h-px w-24 bg-foreground/35" aria-hidden="true" />
      </FadeIn>

      {/* Concise Editorial Description & Key Notes */}
      <FadeIn delay={0.22} xOffset={-24} yOffset={0}>
        <div className="space-y-4 max-w-lg">
          <p className="font-serif text-base sm:text-[1.2rem] text-foreground/85 leading-relaxed">
            {content.heroDescription}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {SIGNATURE_NOTES.map((note) => (
              <span
                key={note}
                className="border border-foreground/20 bg-background/30 backdrop-blur-xs px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/85"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Refined Action Row */}
      <FadeIn delay={0.28} xOffset={-24} yOffset={0}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 pt-2 sm:pt-3">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-foreground/50 bg-background/30 backdrop-blur-xs hover:bg-foreground hover:text-background w-full sm:w-auto px-7 py-3 sm:py-6 text-xs uppercase tracking-[0.2em] min-h-[44px]"
          >
            <Link href={content.heroSecondaryCtaHref}>
              <span>{content.heroSecondaryCtaText}</span>
            </Link>
          </Button>

          <Link
            href={content.heroPrimaryCtaHref}
            className="group inline-flex items-center justify-center sm:justify-start gap-2.5 px-3 py-3 text-xs uppercase tracking-[0.2em] font-medium text-foreground/85 hover:text-foreground transition-colors"
          >
            <span>{content.heroPrimaryCtaText}</span>
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}

