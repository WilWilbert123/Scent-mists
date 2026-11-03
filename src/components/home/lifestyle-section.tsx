import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";

const ATMOSPHERIC_RITUALS = [
  {
    index: "01",
    title: "Atmospheric Presence",
    detail:
      "Composed to converse with natural morning light, raw stone, and serene interior architecture without overpowering the space.",
  },
  {
    index: "02",
    title: "Weightless Skin Veil",
    detail:
      "Formulated at 20% concentration to sit close to pulse points, releasing subtle botanical shifts as skin temperature changes.",
  },
  {
    index: "03",
    title: "Mindful Contemplation",
    detail:
      "An intimate personal sensory anchor designed for conscious morning application and calm, grounded evening return.",
  },
];

export function LifestyleSection() {
  return (
    <section className="border-b border-border bg-surface py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          {/* Left Editorial Copy — Fades from Left */}
          <RevealOnScroll direction="left" className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 text-accent">
                <span className="h-px w-6 bg-accent" aria-hidden="true" />
                <p className="eyebrow-label">Editorial Study</p>
              </div>
              <h2 className="heading-section text-foreground">
                Designed for Quiet Rituals &amp; Architectural Spaces
              </h2>
              <p className="body-editorial text-muted-foreground">
                From the cool weight of the chamfered crystal flacon to the whisper-soft
                diffusion of the atomizer, SCENTS &amp; MISTS is conceived as an
                object of daily contemplation.
              </p>
            </div>

            <div className="divide-y divide-border/70 border-y border-border/70">
              {ATMOSPHERIC_RITUALS.map((ritual) => (
                <div key={ritual.index} className="py-4 flex items-start gap-4">
                  <span className="font-serif text-sm tracking-[0.18em] text-accent pt-0.5">
                    {ritual.index}
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-medium text-foreground">
                      {ritual.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {ritual.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-foreground hover:text-accent transition-colors"
              >
                <span>Read Our House Story</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>

          {/* Right Unique Photographic Pair — Fades from Right */}
          <RevealOnScroll
            direction="right"
            delay={0.12}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
          >
            <figure className="group flex flex-col border border-border/80 bg-surface-elevated overflow-hidden shadow-luxury">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
                <Image
                  src="/images/lifestyle/fragrance-lifestyle.webp"
                  alt="SCENTS & MISTS flacon styled in quiet morning natural interior light"
                  fill
                  sizes="(max-width: 640px) 100vw, 35vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <figcaption className="flex items-center justify-between px-5 py-3.5 border-t border-border/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">
                <span>Study I — The Sanctuary</span>
                <span className="text-foreground/80">Living Stillness</span>
              </figcaption>
            </figure>

            <figure className="group flex flex-col border border-border/80 bg-surface-elevated overflow-hidden shadow-luxury sm:mt-10">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
                <Image
                  src="/images/lifestyle/alpine-sakura-horizon.webp"
                  alt="Cherry blossom branches overlooking sunlit alpine peaks and morning mist"
                  fill
                  sizes="(max-width: 640px) 100vw, 35vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <figcaption className="flex items-center justify-between px-5 py-3.5 border-t border-border/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">
                <span>Study II — The Horizon</span>
                <span className="text-foreground/80">Alpine Dawn</span>
              </figcaption>
            </figure>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
