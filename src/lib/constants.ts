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

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const STORAGE_BUCKETS = {
  PRODUCTS: "product-images",
  COLLECTIONS: "collection-images",
  SITE_ASSETS: "site-assets",
} as const;

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContentConfig = {
  announcementEnabled: false,
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
  headerLogoUrl: "/images/logo/scentmistslogo.png",
  headerBrandName: "SCENTS & MISTS",
  footerLogoUrl: "/images/logo/scentmistslogo.png",
  footerDescription:
    "Authentic 50ml Aroma Body Mists and 85ml Victoria's Secret Perfumes. Pin your location for accurate door-to-door delivery.",
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
    id: "shop-banner-50ml",
    title: "Aroma Body Mists • 50ml",
    subtitle: "19 Refreshing Daily Fragrance Mists • Long-lasting scent oils • ₱135 Each",
    ctaText: "Shop 50ml Mists",
    ctaHref: "/shop",
    isActive: true,
    placement: "shop",
    imageUrl: "/images/lifestyle/fragrance-collection.webp",
  },
  {
    id: "shop-banner-85ml",
    title: "Victoria's Secret Luxe • 85ml",
    subtitle: "13 Iconic Designer Scents • Pure elegance and irresistible allure",
    ctaText: "Shop 85ml Luxe",
    ctaHref: "/shop",
    isActive: true,
    placement: "shop",
    imageUrl: "/images/lifestyle/alpine-sakura-horizon.webp",
  },
  {
    id: "shop-banner-cod",
    title: "Cash on Delivery Available",
    subtitle: "Doorstep delivery nationwide • Pin your exact location during checkout",
    ctaText: "Order Today",
    ctaHref: "/shop",
    isActive: true,
    placement: "shop",
    imageUrl: "/images/hero/mountain-mist.webp",
  },
  {
    id: "shop-banner-male",
    title: "Curated Male Fragrances",
    subtitle: "Clinique Happy, Bvlgari Man in Black & Calvin Klein Eternity",
    ctaText: "View Male Picks",
    ctaHref: "/shop",
    isActive: true,
    placement: "shop",
    imageUrl: "/images/lifestyle/altitude-botanicals-vista.webp",
  },
  {
    id: "shop-banner-sweet",
    title: "Sweet Blossom & Amber Notes",
    subtitle: "Vanilla Lace, Sweet Pea, Love Spell & Pink Chiffon favorites",
    ctaText: "Explore Aromas",
    ctaHref: "/shop",
    isActive: true,
    placement: "shop",
    imageUrl: "/images/lifestyle/cherry-blossom-garden.webp",
  },
  {
    id: "shop-banner-artisan",
    title: "Fine Fragrances Crafted to Endure",
    subtitle: "Premium botanical essences blended for all-day confidence",
    ctaText: "Discover All Scents",
    ctaHref: "/shop",
    isActive: true,
    placement: "shop",
    imageUrl: "/images/lifestyle/fragrance-lifestyle.webp",
  },
  {
    id: "banner-announcement-main",
    title: "SCENTS & MISTS — Signature Collection",
    subtitle: "Explore our signature high-altitude botanical Eau de Parfum showcase.",
    ctaText: "Explore Collection",
    ctaHref: "/collections",
    isActive: true,
    placement: "announcement",
    imageUrl: "/images/hero/himalayan-cherry-blossom-bg.webp",
  },
  {
    id: "banner-editorial-consultation",
    title: "Private Olfactory Consultations",
    subtitle: "Connect with our fragrance specialists for bespoke scent profiling and press enquiries.",
    ctaText: "Submit an Enquiry",
    ctaHref: "/contact",
    isActive: true,
    placement: "editorial",
    imageUrl: "/images/lifestyle/editorial-flacon-study.webp",
  },
];
