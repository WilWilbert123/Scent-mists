import type { FragranceNoteItem } from "@/types/product";

/**
 * Olfactory pyramid architecture for SCENTS & MISTS — Signature Composition (Sakura & Mountain Mist).
 */
export const SAMPLE_FRAGRANCE_PYRAMID: {
  disclaimer: string;
  top: FragranceNoteItem[];
  heart: FragranceNoteItem[];
  base: FragranceNoteItem[];
} = {
  disclaimer:
    "Formulated at 20% Eau de Parfum concentration, our signature composition unfolds across three distinct olfactory movements—opening with volatile mountain citrus and mineral air, blooming into cold-extracted sakura and silver-needle white tea, and anchoring in aged Himalayan cedarwood.",
  top: [
    {
      name: "Mountain Air Accord",
      botanicalOrigin: "Headspace Aldehydic Mineral",
      facet: "Ozonic & Mineral",
      description:
        "A crisp, translucent opening that captures cool alpine vapour and wet slate at daybreak with zero synthetic sharpness.",
      tier: "top",
    },
    {
      name: "White Bergamot Mist",
      botanicalOrigin: "Citrus Bergamia • Cold-Pressed",
      facet: "Luminous Citrus",
      description:
        "Unripe Calabrian bergamot rind expressed without heat, delivering a bright, dewy citrus lift that awakens the palate.",
      tier: "top",
    },
    {
      name: "Dewy Pear Blossom",
      botanicalOrigin: "Pyrus Pyrifolia • Steam Distilled",
      facet: "Crisp Orchard Floral",
      description:
        "Delicate nashi blossom and green stem notes that bridge the mineral opening with the floral heart.",
      tier: "top",
    },
  ],
  heart: [
    {
      name: "Wild Cherry Blossom",
      botanicalOrigin: "Prunus Serrulata • Enfleurage Absolute",
      facet: "Signature Floral Core",
      description:
        "Hand-harvested spring sakura petals yielding a translucent pale-pink floralcy with a subtle, powdery almond nuance.",
      tier: "heart",
    },
    {
      name: "Silver Needle White Tea",
      botanicalOrigin: "Camellia Sinensis • Supercritical CO₂",
      facet: "Steamed Botanical Leaf",
      description:
        "Unfermented spring tea buds extracted at low temperature to preserve their serene, herbaceous clarity and dry structure.",
      tier: "heart",
    },
    {
      name: "Pink Peony Petal",
      botanicalOrigin: "Paeonia Suffruticosa • Headspace Capture",
      facet: "Velvet Floral",
      description:
        "Airy, rose-tinted peony petals that lend luminous volume and soft silk texture without floral heaviness.",
      tier: "heart",
    },
  ],
  base: [
    {
      name: "Cashmere Cedarwood",
      botanicalOrigin: "Cedrus Deodara • Aged Heartwood Oil",
      facet: "Noble Mountain Wood",
      description:
        "Sustainably harvested Himalayan deodar cedar distilled into a dry, creamy wood base that anchors the composition on skin.",
      tier: "base",
    },
    {
      name: "Soft Silk Musk",
      botanicalOrigin: "Ambrettolide • Botanical Macrocyclic",
      facet: "Second-Skin Veil",
      description:
        "Plant-derived ambrette seed musk that adapts to individual skin warmth, leaving a clean, linen-soft trail.",
      tier: "base",
    },
    {
      name: "Warm White Amber",
      botanicalOrigin: "Cistus Labdanum • Fractionated Resin",
      facet: "Golden Botanical Resin",
      description:
        "Clarified labdanum and benzoin tears that impart a quiet, golden warmth across a 10-hour dry-down.",
      tier: "base",
    },
  ],
};
