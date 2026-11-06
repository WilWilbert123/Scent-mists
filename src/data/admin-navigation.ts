export interface AdminNavItem {
  label: string;
  href: string;
  iconName:
    | "LayoutDashboard"
    | "ShoppingBag"
    | "MessageCircle"
    | "BarChart3"
    | "Users"
    | "MessageSquare"
    | "Sparkles"
    | "Layers"
    | "FileText"
    | "Mail"
    | "ShieldCheck"
    | "Settings";
  description: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    iconName: "LayoutDashboard",
    description: "Brand performance, visitor metrics, and recent enquiries",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    iconName: "ShoppingBag",
    description: "Customer orders, Leaflet delivery map location, and status workflow",
  },
  {
    label: "Live Chat",
    href: "/admin/chat",
    iconName: "MessageCircle",
    description: "Real-time customer live chat conversations and seller replies",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    iconName: "BarChart3",
    description: "Traffic sources, device breakdown, and popular pages",
  },
  {
    label: "Visitors",
    href: "/admin/visitors",
    iconName: "Users",
    description: "Privacy-conscious anonymous visitor session log",
  },
  {
    label: "Enquiries",
    href: "/admin/enquiries",
    iconName: "MessageSquare",
    description: "Customer enquiries, status workflow, and internal notes",
  },
  {
    label: "Products",
    href: "/admin/products",
    iconName: "Sparkles",
    description: "Fragrance showcase entries, notes, and imagery",
  },
  {
    label: "Collections",
    href: "/admin/collections",
    iconName: "Layers",
    description: "Curated fragrance collections and publication status",
  },
  {
    label: "Content",
    href: "/admin/content",
    iconName: "FileText",
    description: "Homepage hero, announcement bar, and brand story CMS",
  },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
    iconName: "Mail",
    description: "Newsletter subscriber list and export",
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    iconName: "ShieldCheck",
    description: "Administrative security and activity trail",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    iconName: "Settings",
    description: "Admin profile, security, and dashboard appearance",
  },
];
