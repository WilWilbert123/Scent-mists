export interface NavItem {
  label: string;
  href: string;
}

/**
 * Public website navigation — Essential links only
 */
export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Track Order", href: "/orders" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_NAV_GROUPS = {
  fragrances: [
    { label: "All Perfumes", href: "/shop" },
    { label: "50ml Body Mists", href: "/shop" },
    { label: "85ml VS Perfumes", href: "/shop" },
  ],
  house: [
    { label: "Shop", href: "/shop" },
    { label: "Track Order", href: "/orders" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
  ],
};
