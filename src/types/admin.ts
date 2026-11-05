export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: "ADMIN";
  created_at: string;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  admin_email?: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface HomepageContentConfig {
  announcementEnabled: boolean;
  announcementText: string;
  announcementLinkText: string;
  announcementLinkHref: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroDescription: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaHref: string;
  featuredFragranceSlug: string;
  brandIntroHeadline: string;
  brandIntroBody: string;
  headerLogoUrl?: string;
  headerBrandName?: string;
  footerLogoUrl?: string;
  footerDescription?: string;
}

export interface BrandStoryContentConfig {
  eyebrow: string;
  headline: string;
  leadParagraph: string;
  philosophyTitle: string;
  philosophyBody: string;
  craftsmanshipTitle: string;
  craftsmanshipBody: string;
  botanicalOriginNote: string;
}

export interface BannerItemConfig {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  isActive: boolean;
  placement: "announcement" | "editorial" | "collection";
}

