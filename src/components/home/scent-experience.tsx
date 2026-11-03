import React from "react";
import { Sun, CloudFog, MoonStar } from "lucide-react";
import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";

export function ScentExperience() {
  const moments = [
    {
      time: "06:30 — First Light",
      title: "The Mountain Mist Awakening",
      description:
        "Upon application, a cool mineral vapour accord rises alongside white bergamot mist—evoking the crisp silence of dawn at 2,800 meters.",
      icon: CloudFog,
    },
    {
      time: "11:00 — Warm Blossom Sun",
      title: "Sunlit Sakura Branches",
      description:
        "As the scent warms to skin temperature, wild cherry blossom petals and steamed high-altitude white tea unfold in a translucent floral veil.",
      icon: Sun,
    },
    {
      time: "19:00 — Alpine Twilight",
      title: "Cashmere Cedar & Silk Trail",
      description:
        "Hours later, dry Himalayan cedarwood and clean silk musk remain close to the skin—intimate, grounded, and unhurried.",
      icon: MoonStar,
    },
  ];

  return (
    <section className="border-b border-border bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <RevealOnScroll className="max-w-2xl space-y-4">
          <p className="eyebrow-label text-accent">Sensory Choreography</p>
          <h2 className="heading-section text-foreground">
            How the Fragrance Lives Across the Day
          </h2>
          <p className="body-editorial text-muted-foreground">
            Every SCENTS &amp; MISTS creation is composed to evolve with body
            warmth and ambient air, moving through three distinct atmospheric
            chapters.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {moments.map((moment, idx) => {
            const Icon = moment.icon;
            return (
              <RevealOnScroll
                key={moment.title}
                delay={idx * 0.12}
                className="relative flex flex-col justify-between border border-border bg-surface-elevated p-8 space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow-label text-accent">{moment.time}</span>
                    <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="heading-card text-foreground">{moment.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {moment.description}
                  </p>
                </div>
                <div className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  Chapter 0{idx + 1} • Olfactory Evolution
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

