import type { HomepageContentConfig, BrandStoryContentConfig, BannerItemConfig } from "@/types/admin";

export const BRAND_NAME = "SCENTS & MISTS";
export const FEATURED_FRAGRANCE_NAME = "Sakura & Mountain Mist";
export const SITE_DESCRIPTION =
  "SCENTS & MISTS — Timeless Elegance. Lasting Impression. An ethereal luxury fragrance house inspired by delicate cherry blossoms, crisp mountain air, and morning mist.";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/avif",
] as const;

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const STORAGE_BUCKETS = {
  PRODUCTS: "product-images",
  COLLECTIONS: "collection-images",
  SITE_ASSETS: "site-assets",
} as const;

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContentConfig = {
  announcementEnabled: true,
  announcementText:
    "SCENTS & MISTS — Explore our high-altitude botanical Eau de Parfum showcase.",
  announcementLinkText: "Explore the Collection",
  announcementLinkHref: "/collections",
  heroEyebrow: "MAISON DE HAUTE PARFUMERIE",
  heroHeadline: "SCENTS & MISTS",
  heroSubheadline: "Timeless Elegance. Lasting Impression.",
  heroDescription:
    "Fine botanical Eau de Parfum composed with wild cherry blossom, steamed white tea, and mountain cedarwood.",
  heroPrimaryCtaText: "Discover the Fragrance",
  heroPrimaryCtaHref: "/products/sakura-and-mountain-mist",
  heroSecondaryCtaText: "Explore the Collection",
  heroSecondaryCtaHref: "/collections",
  featuredFragranceSlug: "sakura-and-mountain-mist",
  brandIntroHeadline: "Fine Botanical Perfumery, Composed to Endure",
  brandIntroBody:
    "Every SCENTS & MISTS creation unites high-purity botanical extracts, balanced Eau and Extrait de Parfum concentrations, and architectural crystal presentation—crafted for effortless daily wear and lasting impression.",
};

export const DEFAULT_BRAND_STORY_CONTENT: BrandStoryContentConfig = {
  eyebrow: "THE HOUSE OF SCENTS & MISTS",
  headline: "Fine Perfumery Crafted for Quiet Luxury",
  leadParagraph:
    "Founded on the belief that true luxury speaks through quality of materials, SCENTS & MISTS formulates fine botanical fragrances inspired by fresh mountain air, spring blossoms, and noble woods.",
  philosophyTitle: "Clarity, Balance & Longevity",
  philosophyBody:
    "Our perfumers compose with precision so every note has space to unfold naturally on skin—transitioning smoothly from crisp opening accords into a delicate floral heart and warm cedarwood foundation.",
  craftsmanshipTitle: "Small-Batch Botanical Distillation",
  craftsmanshipBody:
    "Each composition is macerated in small batches and bottled in heavy chamfered optical glass with a faceted crystal stopper and calibrated champagne-gold atomizer.",
  botanicalOriginNote:
    "Every SCENTS & MISTS composition is formulated with high-purity botanical extracts, steamed florals, and aged mountain woods designed to evolve naturally on the skin.",
};

export const DEFAULT_BANNERS: BannerItemConfig[] = [
  {
    id: "banner-announcement-main",
    title: "SCENTS & MISTS — Signature Collection",
    subtitle: "Explore our signature high-altitude botanical Eau de Parfum showcase.",
    ctaText: "Explore Collection",
    ctaHref: "/collections",
    isActive: true,
    placement: "announcement",
  },
  {
    id: "banner-editorial-consultation",
    title: "Private Olfactory Consultations",
    subtitle: "Connect with our fragrance specialists for bespoke scent profiling and press enquiries.",
    ctaText: "Submit an Enquiry",
    ctaHref: "/contact",
    isActive: true,
    placement: "editorial",
  },
];
