import type { Collection } from "@/types/collection";

export const SAMPLE_COLLECTIONS: Collection[] = [
  {
    id: "col-himalayan-horizontals",
    name: "Altitude Botanicals",
    slug: "altitude-botanicals",
    subtitle: "High-Elevation Olfactory Studies",
    description:
      "Compositions shaped by crisp mountain air, wild cherry blossoms, and ancient cedar groves where clouds brush stone.",
    image_url: "/images/lifestyle/collection-altitude-botanicals.webp",
    is_published: true,
    product_slugs: ["sakura-and-mountain-mist", "himalayan-cherry-blossom-air", "morning-cedar-and-mist"],
    created_at: "2026-01-10T08:00:00.000Z",
    updated_at: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "col-ephemeral-petals",
    name: "Ephemeral Petals",
    slug: "ephemeral-petals",
    subtitle: "Spring Blossom Series",
    description:
      "Delicate floral architectures capturing the fleeting days of spring bloom in serene high-altitude valleys.",
    image_url: "/images/lifestyle/collection-ephemeral-petals.webp",
    is_published: true,
    product_slugs: ["sakura-and-mountain-mist", "himalayan-cherry-blossom-air", "white-tea-and-snow-lotus"],
    created_at: "2026-01-12T08:00:00.000Z",
    updated_at: "2026-01-12T08:00:00.000Z",
  },
  {
    id: "col-nocturnal-reserves",
    name: "Nocturnal Reserves",
    slug: "nocturnal-reserves",
    subtitle: "Evening & Resin Studies",
    description:
      "Deeper concentrations crafted for twilight hours, pairing botanical petals with warm woods, amber resins, and silk musk.",
    image_url: "/images/lifestyle/collection-nocturnal-reserves.webp",
    is_published: true,
    product_slugs: ["velvet-amber-and-sakura-dusk"],
    created_at: "2026-01-14T08:00:00.000Z",
    updated_at: "2026-01-14T08:00:00.000Z",
  },
];

