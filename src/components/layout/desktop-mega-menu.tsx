"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MegaMenuColumn {
  title: string;
  image: string;
  imageAlt: string;
  links: Array<{ label: string; href: string; badge?: string; subtitle?: string }>;
}

export interface MegaMenuItem {
  id: string;
  label: string;
  href: string;
  columns: MegaMenuColumn[];
  featured: {
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
    ctaHref: string;
    guidanceTitle?: string;
    guidanceLinks: Array<{ label: string; href: string }>;
  };
}

export const MEGA_MENU_ITEMS: MegaMenuItem[] = [
  {
    id: "exclusive-offers",
    label: "Exclusive Offers",
    href: "/shop",
    columns: [
      {
        title: "Cash on Delivery",
        image: "/images/lifestyle/fragrance-collection.webp",
        imageAlt: "Authentic fragrance collection with Cash on Delivery",
        links: [
          { label: "Doorstep Inspection First", href: "/shop", subtitle: "Inspect before you pay rider" },
          { label: "Nationwide COD Coverage", href: "/shop", subtitle: "Metro Manila & Provinces" },
          { label: "Zero Advance Payment", href: "/shop", badge: "Safe" },
        ],
      },
      {
        title: "Map Pinning",
        image: "/images/hero/mountain-mist.webp",
        imageAlt: "Accurate GPS Leaflet map pin delivery",
        links: [
          { label: "Accurate GPS Pinpoint", href: "/orders", subtitle: "Pin your exact house or gate" },
          { label: "Real-Time Order Tracking", href: "/orders", badge: "Live" },
          { label: "Rapid Dispatch & Packing", href: "/orders" },
        ],
      },
      {
        title: "Curated Mist Duos",
        image: "/images/lifestyle/cherry-blossom-garden.webp",
        imageAlt: "Curated body mist duos and fragrance sets",
        links: [
          { label: "50ml + 85ml Duo Sets", href: "/shop", badge: "Save 25%" },
          { label: "Complimentary Blotters", href: "/contact", subtitle: "Request scent samples" },
          { label: "All Daily Flash Deals", href: "/shop" },
        ],
      },
    ],
    featured: {
      title: "Doorstep Luxury Delivered",
      subtitle: "Pin your exact gate on our interactive map during checkout for seamless courier dispatch.",
      image: "/images/lifestyle/altitude-botanicals-vista.webp",
      ctaText: "Explore Offers",
      ctaHref: "/shop",
      guidanceTitle: "Customer Services",
      guidanceLinks: [
        { label: "Track Your Active Order", href: "/orders" },
        { label: "Scent Longevity & Notes Guide", href: "/fragrance-guide" },
        { label: "Contact Private Concierge", href: "/contact" },
      ],
    },
  },
  {
    id: "bestsellers",
    label: "Bestsellers",
    href: "/shop",
    columns: [
      {
        title: "Clinique - Happy",
        image: "/images/lifestyle/cherry-blossom-garden.webp",
        imageAlt: "Clinique Happy 50ml Aroma Mist",
        links: [
          { label: "Clinique - Happy (50ml)", href: "/products/aroma-body-mist-50ml-clinique-happy", badge: "Top 1" },
          { label: "Ruby Grapefruit & Sea Salt Air", href: "/products/aroma-body-mist-50ml-clinique-happy" },
          { label: "Only ₱135 • 25% OFF", href: "/products/aroma-body-mist-50ml-clinique-happy" },
        ],
      },
      {
        title: "VS - Bombshell",
        image: "/images/lifestyle/collection-nocturnal-reserves.webp",
        imageAlt: "Victoria's Secret Bombshell 50ml Aroma Mist",
        links: [
          { label: "VS - Bombshell (50ml)", href: "/products/aroma-body-mist-50ml-vs-bombshell", badge: "Iconic" },
          { label: "Purple Passionfruit & Peony", href: "/products/aroma-body-mist-50ml-vs-bombshell" },
          { label: "Only ₱135 • 25% OFF", href: "/products/aroma-body-mist-50ml-vs-bombshell" },
        ],
      },
      {
        title: "Bvlgari Man in Black",
        image: "/images/lifestyle/altitude-botanicals-vista.webp",
        imageAlt: "Bvlgari Man in Black 50ml Aroma Mist",
        links: [
          { label: "Bvlgari - Man Black (50ml)", href: "/products/aroma-body-mist-50ml-bvlgari-man-in-black", badge: "Men" },
          { label: "Spiced Rum & Dark Amber", href: "/products/aroma-body-mist-50ml-bvlgari-man-in-black" },
          { label: "Only ₱135 • 25% OFF", href: "/products/aroma-body-mist-50ml-bvlgari-man-in-black" },
        ],
      },
      {
        title: "Ariana Grande Sweet Like Candy",
        image: "/images/products/perfume-box.webp",
        imageAlt: "Ariana Grande Sweet Like Candy 50ml",
        links: [
          { label: "Ariana G. - Sweet Like Candy", href: "/products/aroma-body-mist-50ml-ariana-grande-sweet-like-candy", badge: "Sweet" },
          { label: "Marshmallow & Berries", href: "/products/aroma-body-mist-50ml-ariana-grande-sweet-like-candy" },
          { label: "Only ₱135 • 25% OFF", href: "/products/aroma-body-mist-50ml-ariana-grande-sweet-like-candy" },
        ],
      },
    ],
    featured: {
      title: "The Bestseller Edit",
      subtitle: "Our most requested and complimented fragrance compositions across the Philippines.",
      image: "/images/products/perfume-front.webp",
      ctaText: "View All 36 Bestsellers",
      ctaHref: "/shop",
      guidanceTitle: "Filter by Accord",
      guidanceLinks: [
        { label: "Top Male Fragrances", href: "/shop" },
        { label: "Top Female Favorites", href: "/shop" },
        { label: "Under ₱150 Daily Mists", href: "/shop" },
      ],
    },
  },
  {
    id: "mists-50ml",
    label: "50ml Mists",
    href: "/shop",
    columns: [
      {
        title: "Fresh & Uplifting Florals",
        image: "/images/hero/botanical-sakura-petals.webp",
        imageAlt: "Fresh botanical floral aroma body mists",
        links: [
          { label: "B&BW - Sweet Pea (50ml)", href: "/products/aroma-body-mist-50ml-bbw-sweet-pea" },
          { label: "VS - Love Spell (50ml)", href: "/products/aroma-body-mist-50ml-vs-love-spell" },
          { label: "Katy Perry - Purr (50ml)", href: "/products/aroma-body-mist-50ml-katy-perry-purr" },
          { label: "Paris Hilton - Heiress (50ml)", href: "/products/aroma-body-mist-50ml-paris-hilton-heiress" },
        ],
      },
      {
        title: "Warm Vanilla & Gourmand",
        image: "/images/lifestyle/fragrance-collection.webp",
        imageAlt: "Warm vanilla and sweet gourmand mists",
        links: [
          { label: "VS - Vanilla Lace (50ml)", href: "/products/aroma-body-mist-50ml-vs-vanilla-lace" },
          { label: "VS - Sweet Temptation (50ml)", href: "/products/aroma-body-mist-50ml-vs-sweet-temptation" },
          { label: "VS - Strawberries & Champagne", href: "/products/aroma-body-mist-50ml-vs-strawberries-and-champagne" },
          { label: "VS - Warm Embrace (50ml)", href: "/products/aroma-body-mist-50ml-vs-warm-embrace" },
        ],
      },
      {
        title: "Clean Citrus & Ozone",
        image: "/images/hero/botanical-white-tea-terraces.webp",
        imageAlt: "Clean citrus and refreshing body mists",
        links: [
          { label: "Clinique - Happy (50ml)", href: "/products/aroma-body-mist-50ml-clinique-happy" },
          { label: "Elizabeth Arden - Green Tea", href: "/products/aroma-body-mist-50ml-elizabeth-arden-green-tea" },
          { label: "D&G Cologne - Light Blue (50ml)", href: "/products/aroma-body-mist-50ml-dg-cologne-light-blue" },
          { label: "B&BW - Cucumber Melon (50ml)", href: "/products/aroma-body-mist-50ml-bbw-cucumber-melon" },
        ],
      },
    ],
    featured: {
      title: "50ml Aroma Mists • ₱135 Each",
      subtitle: "Formulated with long-lasting imported perfume oils for clean, weightless daily application.",
      image: "/images/products/sakura-mountain-mist.webp",
      ctaText: "Shop All 23 Mists",
      ctaHref: "/shop",
      guidanceTitle: "Application Advice",
      guidanceLinks: [
        { label: "Daily Mist Application Ritual", href: "/fragrance-guide" },
        { label: "Layering Mists with Perfume", href: "/fragrance-guide" },
        { label: "Check In-Stock Availability", href: "/shop" },
      ],
    },
  },
  {
    id: "perfumes-85ml",
    label: "85ml Perfumes",
    href: "/shop",
    columns: [
      {
        title: "Sensual Seduction",
        image: "/images/lifestyle/collection-nocturnal-reserves.webp",
        imageAlt: "Victoria's Secret 85ml Luxury Perfumes",
        links: [
          { label: "VS Perfume - Secret Angel Gold", href: "/products/vs-perfume-85ml-secret-angel-gold", badge: "Gold" },
          { label: "VS Perfume - Winter Bombshell", href: "/products/vs-perfume-85ml-winter-bombshell" },
          { label: "VS Perfume - Pink Ravishing Love", href: "/products/vs-perfume-85ml-pink-ravishing-love" },
        ],
      },
      {
        title: "Romantic & Alluring",
        image: "/images/lifestyle/cherry-blossom-garden.webp",
        imageAlt: "Romantic 85ml Victoria's Secret Perfumes",
        links: [
          { label: "VS Perfume - Romantic Wish", href: "/products/vs-perfume-85ml-romantic-wish" },
          { label: "VS Perfume - Love Spell 85ml", href: "/products/vs-perfume-85ml-love-spell" },
          { label: "VS Perfume - Summer Sexy", href: "/products/vs-perfume-85ml-summer-sexy" },
        ],
      },
      {
        title: "Sweet Luxe Accords",
        image: "/images/products/perfume-box.webp",
        imageAlt: "Sweet gourmand 85ml perfumes",
        links: [
          { label: "VS Perfume - Pink Chiffon", href: "/products/vs-perfume-85ml-pink-chiffon" },
          { label: "VS Perfume - Strawberries & Champagne", href: "/products/vs-perfume-85ml-strawberries-and-champagne" },
          { label: "VS Perfume - Mango Temptation", href: "/products/vs-perfume-85ml-mango-temptation" },
        ],
      },
    ],
    featured: {
      title: "Victoria's Secret Luxe • ₱200 Each",
      subtitle: "Full-bodied Eau de Parfum concentrations engineered for intimate sillage and all-night allure.",
      image: "/images/lifestyle/alpine-sakura-horizon.webp",
      ctaText: "Shop All 13 Perfumes",
      ctaHref: "/shop",
      guidanceTitle: "Fragrance Notes",
      guidanceLinks: [
        { label: "Evening Sillage Guidelines", href: "/fragrance-guide" },
        { label: "Longevity & Note Breakdown", href: "/fragrance-guide" },
      ],
    },
  },
  {
    id: "mens-edit",
    label: "Men's Edit",
    href: "/shop",
    columns: [
      {
        title: "Smoky Amber & Woods",
        image: "/images/lifestyle/altitude-botanicals-vista.webp",
        imageAlt: "Bvlgari Man in Black and rich woods",
        links: [
          { label: "Bvlgari - Bvlgari Man Black", href: "/products/aroma-body-mist-50ml-bvlgari-man-in-black", badge: "Bold" },
          { label: "Spiced Rum & Guaiac Wood", href: "/products/aroma-body-mist-50ml-bvlgari-man-in-black" },
          { label: "Only ₱135 • In Stock", href: "/products/aroma-body-mist-50ml-bvlgari-man-in-black" },
        ],
      },
      {
        title: "Crisp Coastal & Herbaceous",
        image: "/images/hero/mountain-mist.webp",
        imageAlt: "Calvin Klein Eternity and fresh coastal mists",
        links: [
          { label: "CK - Eternity (CCK02)", href: "/products/aroma-body-mist-50ml-ck-eternity", badge: "Classic" },
          { label: "Mandarin, Sage & Sandalwood", href: "/products/aroma-body-mist-50ml-ck-eternity" },
          { label: "Only ₱135 • In Stock", href: "/products/aroma-body-mist-50ml-ck-eternity" },
        ],
      },
      {
        title: "Zesty Mountain Citrus",
        image: "/images/products/perfume-front.webp",
        imageAlt: "Clinique Happy for Men and zesty citrus accords",
        links: [
          { label: "Clinique - Happy for Men", href: "/products/aroma-body-mist-50ml-clinique-happy", badge: "Fresh" },
          { label: "Ruby Grapefruit & Sea Salt", href: "/products/aroma-body-mist-50ml-clinique-happy" },
          { label: "Only ₱135 • In Stock", href: "/products/aroma-body-mist-50ml-clinique-happy" },
        ],
      },
    ],
    featured: {
      title: "The Masculine Scent Edit",
      subtitle: "Distinguished, clean, and commanding accords for everyday confidence and evening presence.",
      image: "/images/lifestyle/editorial-flacon-study.webp",
      ctaText: "Shop Men's Picks",
      ctaHref: "/shop",
      guidanceTitle: "Style Guide",
      guidanceLinks: [
        { label: "Office & Daytime Scent Guide", href: "/fragrance-guide" },
        { label: "Evening Date Accords", href: "/fragrance-guide" },
        { label: "Gift Sets for Him", href: "/shop" },
      ],
    },
  },
  {
    id: "fragrance-guide",
    label: "Fragrance Guide",
    href: "/fragrance-guide",
    columns: [
      {
        title: "Olfactory Architecture",
        image: "/images/hero/botanical-sakura-petals.webp",
        imageAlt: "Three-tier fragrance evolution pyramid",
        links: [
          { label: "Top, Heart & Base Evolution", href: "/fragrance-guide" },
          { label: "Personal Skin Chemistry", href: "/fragrance-guide" },
          { label: "Concentration Differences", href: "/fragrance-guide" },
        ],
      },
      {
        title: "Application Rituals",
        image: "/images/hero/botanical-white-tea-terraces.webp",
        imageAlt: "Application rituals for long-lasting sillage",
        links: [
          { label: "15–20 cm Uniform Veil", href: "/fragrance-guide" },
          { label: "Why You Must Not Rub Wrists", href: "/fragrance-guide" },
          { label: "Flacon Conservation", href: "/fragrance-guide" },
        ],
      },
      {
        title: "Service Guarantees",
        image: "/images/lifestyle/altitude-botanicals-vista.webp",
        imageAlt: "Nationwide COD and Leaflet Pin Delivery",
        links: [
          { label: "Cash on Delivery Nationwide", href: "/shop" },
          { label: "Leaflet GPS Map Pinning", href: "/orders" },
          { label: "100% Authentic Quality", href: "/about" },
        ],
      },
    ],
    featured: {
      title: "Find Your Signature Scent",
      subtitle: "Discover the composition that mirrors your mood, presence, and personal chemistry.",
      image: "/images/products/perfume-box.webp",
      ctaText: "Open Fragrance Guide",
      ctaHref: "/fragrance-guide",
      guidanceTitle: "Atelier Guidance",
      guidanceLinks: [
        { label: "Read Our Story & Craft", href: "/about" },
        { label: "Chat With Scent Concierge", href: "/contact" },
        { label: "Track Your Order Live", href: "/orders" },
      ],
    },
  },
];

interface DesktopMegaMenuProps {
  activeMenu: string | null;
  onClose: () => void;
  onMouseEnter: (menuId: string) => void;
}

export function DesktopMegaMenu({
  activeMenu,
  onClose,
  onMouseEnter,
}: DesktopMegaMenuProps) {
  if (!activeMenu) return null;

  const currentItem = MEGA_MENU_ITEMS.find((item) => item.id === activeMenu);
  if (!currentItem) return null;

  return (
    <>
      {/* Invisible backdrop to capture outside clicks without any transparency or dimming */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 top-[115px] z-40 bg-transparent"
      />

      {/* Solid opaque white luxury mega-menu (Zero transparency) */}
      <div
        role="region"
        aria-label={`${currentItem.label} navigation menu`}
        onMouseEnter={() => onMouseEnter(activeMenu)}
        className="absolute top-full left-0 right-0 z-50 w-full border-b border-border bg-white dark:bg-[#121110] shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-1 max-h-[55vh] overflow-y-auto"
      >
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-5 sm:py-6">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Main Visual Columns: automatically adapts to 4 columns on bestsellers, 3 on standard menus */}
            <div
              className={cn(
                "col-span-8 lg:col-span-9 grid gap-4 lg:gap-6",
                currentItem.columns.length >= 4 ? "grid-cols-4" : "grid-cols-3"
              )}
            >
              {currentItem.columns.map((col, idx) => (
                <div key={idx} className="space-y-2.5">
                  {/* Visual Thumbnail Card - compact 16:9 ratio */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-surface border border-border/60 group">
                    <Image
                      src={col.image}
                      alt={col.imageAlt}
                      fill
                      sizes="(max-width: 1200px) 25vw, 20vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-1.5 left-2 right-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-white font-semibold drop-shadow-md truncate">
                      {col.title}
                    </span>
                  </div>

                  {/* Curated Links List */}
                  <ul className="space-y-1.5 pt-0.5">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="group/link flex flex-col items-start py-0.5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-serif text-foreground hover:text-accent transition-colors font-medium">
                            <span className="tracking-wide line-clamp-1">{link.label}</span>
                            {link.badge && (
                              <span className="rounded-xs bg-accent/15 text-accent px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-wider shrink-0">
                                {link.badge}
                              </span>
                            )}
                            <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0 text-accent shrink-0" />
                          </div>
                          {link.subtitle && (
                            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-sans leading-tight pt-0.5 line-clamp-1">
                              {link.subtitle}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured Right Spotlight Card — Compact & Elegant */}
            <div className="col-span-4 lg:col-span-3 border-l border-border/70 pl-6 space-y-3.5">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-surface border border-border/60 group">
                <Image
                  src={currentItem.featured.image}
                  alt={currentItem.featured.title}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white space-y-1">
                  <p className="font-serif text-xs sm:text-sm font-medium leading-tight line-clamp-1">
                    {currentItem.featured.title}
                  </p>
                  {currentItem.featured.subtitle && (
                    <p className="text-[10px] sm:text-[11px] text-white/80 font-sans leading-tight line-clamp-1">
                      {currentItem.featured.subtitle}
                    </p>
                  )}
                  <Link
                    href={currentItem.featured.ctaHref}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-accent-light hover:underline font-semibold cursor-pointer pt-0.5"
                  >
                    <span>{currentItem.featured.ctaText}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Guidance Quick Links */}
              {currentItem.featured.guidanceLinks.length > 0 && (
                <div className="space-y-1.5 pt-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent font-bold">
                    {currentItem.featured.guidanceTitle || "Customer Services"}
                  </p>
                  <ul className="space-y-1">
                    {currentItem.featured.guidanceLinks.slice(0, 3).map((gLink, gIdx) => (
                      <li key={gIdx}>
                        <Link
                          href={gLink.href}
                          onClick={onClose}
                          className="text-xs font-sans text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between group cursor-pointer py-0.5 font-medium"
                        >
                          <span className="line-clamp-1">{gLink.label}</span>
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}