export interface TestimonialItem {
  id: string;
  impressionNumber: string;
  quote: string;
  author: string;
  role: string;
  location: string;
  fragrance: string;
  fragranceSlug: string;
  longevity: string;
  accords: string;
}

export const SAMPLE_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "impression-1",
    impressionNumber: "Impression I",
    quote:
      "Sakura & Mountain Mist feels like opening a window at dawn in a quiet mountain sanctuary. The transition from crisp mineral air to translucent cherry blossom petals is luminous, restrained, and effortlessly sophisticated.",
    author: "Olfactory Wearing Study",
    role: "Morning & Daylight Ritual",
    location: "Eau de Parfum • 100 ML",
    fragrance: "Sakura & Mountain Mist",
    fragranceSlug: "sakura-and-mountain-mist",
    longevity: "8 – 10 Hours • Skin-Close Veil",
    accords: "Mountain Air • Wild Sakura • Silk Musk",
  },
  {
    id: "impression-2",
    impressionNumber: "Impression II",
    quote:
      "Unlike heavy florals, this composition breathes with architectural clarity. Steamed white tea and deodar cedarwood anchor the delicate petals so the dry-down lingers with calm, meditative warmth.",
    author: "Sillage & Dry-Down Note",
    role: "All-Day Botanical Wear",
    location: "Eau de Parfum • 100 ML",
    fragrance: "Morning Cedar & Mist",
    fragranceSlug: "morning-cedar-and-mist",
    longevity: "10+ Hours • Refined Trail",
    accords: "Crushed Pine • Silver Cypress • Deodar Cedar",
  },
  {
    id: "impression-3",
    impressionNumber: "Impression III",
    quote:
      "Every element—from the weight of the chamfered crystal flacon to the whisper-soft mist of snow lotus and clean linen musk—reflects an uncompromising dedication to quiet luxury.",
    author: "Craftsmanship & Vessel Note",
    role: "Contemplative & Evening Wear",
    location: "Eau de Parfum • 100 ML",
    fragrance: "White Tea & Snow Lotus",
    fragranceSlug: "white-tea-and-snow-lotus",
    longevity: "8 Hours • Translucent Aura",
    accords: "Silver Needle Tea • Snow Lotus • Ambrette",
  },
];

