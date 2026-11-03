export interface NavItem {
  label: string;
  href: string;
}

/**
 * Public website navigation.
 * CRITICAL: Never include /admin or /admin/login in public navigation or footer.
 */
export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/collections" },
  { label: "Our Story", href: "/about" },
  { label: "Fragrance Guide", href: "/fragrance-guide" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_NAV_GROUPS = {
  fragrances: [
    { label: "Sakura & Mountain Mist", href: "/products/sakura-and-mountain-mist" },
    { label: "Morning Cedar & Mist", href: "/products/morning-cedar-and-mist" },
    { label: "White Tea & Snow Lotus", href: "/products/white-tea-and-snow-lotus" },
    { label: "Velvet Amber & Sakura Dusk", href: "/products/velvet-amber-and-sakura-dusk" },
    { label: "All Fragrances Showcase", href: "/shop" },
  ],
  house: [
    { label: "Our Story & Philosophy", href: "/about" },
    { label: "Collections", href: "/collections" },
    { label: "Olfactory Fragrance Guide", href: "/fragrance-guide" },
    { label: "Private Consultation & Enquiry", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

