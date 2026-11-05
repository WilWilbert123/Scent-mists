import { z } from "zod";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "./constants";

export const enquirySubmissionSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Please provide your full name (at least 2 characters).")
    .max(100, "Full name must not exceed 100 characters."),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(160, "Email address is too long."),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must not exceed 30 characters.")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, "Please specify a subject (at least 3 characters).")
    .max(140, "Subject must not exceed 140 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Please share a message of at least 10 characters.")
    .max(3000, "Message must not exceed 3000 characters."),
  honeypot: z.string().max(0, "Spam detected.").optional(),
});

export const enquiryUpdateSchema = z.object({
  id: z.string().min(1, "Enquiry ID is required."),
  status: z.enum(["NEW", "PENDING", "CONTACTED", "RESOLVED", "ARCHIVED"]),
  internal_notes: z.string().max(4000, "Internal notes are too long.").optional().nullable(),
});

export const newsletterSubscriptionSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address to subscribe.")
    .max(160, "Email address is too long."),
  honeypot: z.string().max(0, "Spam detected.").optional(),
});

export const visitorAnalyticsSchema = z.object({
  anonymous_visitor_id: z
    .string()
    .trim()
    .min(8, "Invalid visitor identifier")
    .max(80, "Visitor identifier too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid visitor identifier format"),
  session_id: z
    .string()
    .trim()
    .min(8, "Invalid session identifier")
    .max(80, "Session identifier too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid session identifier format"),
  page_path: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^\/[a-zA-Z0-9/_-]*$/, "Invalid page path"),
  referrer_category: z.enum(["Direct", "Organic Search", "Social", "Referral"]),
  device_category: z.enum(["Desktop", "Mobile", "Tablet"]),
  browser_category: z.enum(["Chrome", "Safari", "Firefox", "Edge", "Other"]),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid administrator email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Fragrance name is required.").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."),
  description: z.string().trim().min(15, "Description must be at least 15 characters.").max(3000),
  fragrance_family: z.string().trim().min(2, "Fragrance family is required.").max(80),
  top_notes: z.array(z.string().trim().min(1).max(80)).min(1, "Add at least one top note."),
  heart_notes: z.array(z.string().trim().min(1).max(80)).min(1, "Add at least one heart note."),
  base_notes: z.array(z.string().trim().min(1).max(80)).min(1, "Add at least one base note."),
  image_url: z.string().trim().min(1, "Primary image URL is required.").max(500),
  gallery: z.array(z.string().trim().min(1).max(500)).default([]),
  collection_id: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
});

export const collectionSchema = z.object({
  name: z.string().trim().min(2, "Collection name is required.").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(2000),
  image_url: z.string().trim().min(1, "Collection image URL is required.").max(500),
  is_published: z.boolean().default(true),
});

export const homepageContentSchema = z.object({
  announcementEnabled: z.boolean(),
  announcementText: z.string().trim().max(240),
  announcementLinkText: z.string().trim().max(80),
  announcementLinkHref: z.string().trim().max(200),
  heroEyebrow: z.string().trim().min(2).max(100),
  heroHeadline: z.string().trim().min(5).max(180),
  heroSubheadline: z.string().trim().min(3).max(160),
  heroDescription: z.string().trim().min(10).max(600),
  heroPrimaryCtaText: z.string().trim().min(2).max(60),
  heroPrimaryCtaHref: z.string().trim().min(1).max(200),
  heroSecondaryCtaText: z.string().trim().min(2).max(60),
  heroSecondaryCtaHref: z.string().trim().min(1).max(200),
  featuredFragranceSlug: z.string().trim().min(2).max(120),
  brandIntroHeadline: z.string().trim().min(4).max(160),
  brandIntroBody: z.string().trim().min(10).max(1200),
  headerLogoUrl: z.string().trim().max(500).optional().default("/images/logo/scentmistslogo.png"),
  headerBrandName: z.string().trim().max(100).optional().default("SCENTS & MISTS"),
  footerLogoUrl: z.string().trim().max(500).optional().default("/images/logo/scentmistslogo.png"),
  footerDescription: z.string().trim().max(600).optional().default("Authentic 50ml Aroma Body Mists and 85ml Victoria's Secret Perfumes. Pin your location for accurate door-to-door delivery."),
});

export const brandStoryContentSchema = z.object({
  eyebrow: z.string().trim().min(2).max(100),
  headline: z.string().trim().min(4).max(180),
  leadParagraph: z.string().trim().min(10).max(1000),
  philosophyTitle: z.string().trim().min(3).max(120),
  philosophyBody: z.string().trim().min(10).max(1500),
  craftsmanshipTitle: z.string().trim().min(3).max(120),
  craftsmanshipBody: z.string().trim().min(10).max(1500),
  botanicalOriginNote: z.string().trim().min(5).max(600),
});

export function validateImageUpload(file: { type: string; size: number; name: string }): {
  valid: boolean;
  error?: string;
  safeFilename?: string;
} {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload WebP, JPEG, PNG, or AVIF images.",
    };
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return {
      valid: false,
      error: "Image exceeds the 5 MB maximum file size.",
    };
  }
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "webp";
  const base = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 48);
  const safeFilename = `${Date.now()}-${base || "asset"}.${ext}`;
  return { valid: true, safeFilename };
}

