"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  createSupabaseServiceClient,
  recordAuditLog,
  verifyServerAdmin,
} from "@/lib/supabase/admin";
import {
  brandStoryContentSchema,
  homepageContentSchema,
} from "@/lib/validations";
import {
  DEFAULT_BANNERS,
  DEFAULT_BRAND_STORY_CONTENT,
  DEFAULT_HOMEPAGE_CONTENT,
} from "@/lib/constants";
import type {
  BannerItemConfig,
  BrandStoryContentConfig,
  HomepageContentConfig,
} from "@/types/admin";

export interface SiteContentRecordMeta<T> {
  key: string;
  value: T;
  updatedAt: string | null;
  updatedBy: string | null;
  persistedInDatabase: boolean;
}

export interface SiteContentOverview {
  homepage: SiteContentRecordMeta<HomepageContentConfig>;
  banners: SiteContentRecordMeta<BannerItemConfig[]>;
  brandStory: SiteContentRecordMeta<BrandStoryContentConfig>;
  publishedProducts: Array<{ id: string; name: string; slug: string; is_featured: boolean }>;
}

export async function getSiteContentOverviewAction(): Promise<SiteContentOverview> {
  const supabase =
    createSupabaseServiceClient() ?? (await createSupabaseServerClient());

  if (!supabase) {
    return {
      homepage: {
        key: "homepage",
        value: DEFAULT_HOMEPAGE_CONTENT,
        updatedAt: null,
        updatedBy: null,
        persistedInDatabase: false,
      },
      banners: {
        key: "banners",
        value: DEFAULT_BANNERS,
        updatedAt: null,
        updatedBy: null,
        persistedInDatabase: false,
      },
      brandStory: {
        key: "brand_story",
        value: DEFAULT_BRAND_STORY_CONTENT,
        updatedAt: null,
        updatedBy: null,
        persistedInDatabase: false,
      },
      publishedProducts: [],
    };
  }

  const [{ data: contentRows }, { data: productRows }] = await Promise.all([
    supabase
      .from("site_content")
      .select("content_key, content_value, updated_at, updated_by"),
    supabase
      .from("products")
      .select("id, name, slug, is_featured")
      .eq("is_published", true)
      .order("display_order", { ascending: true }),
  ]);

  const rows = (contentRows ?? []) as Array<{
    content_key: string;
    content_value: unknown;
    updated_at: string | null;
    updated_by: string | null;
  }>;

  const hpRow = rows.find((r) => r.content_key === "homepage");
  const bannersRow = rows.find((r) => r.content_key === "banners");
  const storyRow = rows.find((r) => r.content_key === "brand_story");

  const homepageVal = hpRow?.content_value
    ? ({
        ...DEFAULT_HOMEPAGE_CONTENT,
        ...(hpRow.content_value as Partial<HomepageContentConfig>),
      } satisfies HomepageContentConfig)
    : DEFAULT_HOMEPAGE_CONTENT;

  const bannersVal = Array.isArray(bannersRow?.content_value)
    ? (bannersRow.content_value as BannerItemConfig[])
    : DEFAULT_BANNERS;

  const storyVal = storyRow?.content_value
    ? ({
        ...DEFAULT_BRAND_STORY_CONTENT,
        ...(storyRow.content_value as Partial<BrandStoryContentConfig>),
      } satisfies BrandStoryContentConfig)
    : DEFAULT_BRAND_STORY_CONTENT;

  return {
    homepage: {
      key: "homepage",
      value: homepageVal,
      updatedAt: hpRow?.updated_at ?? null,
      updatedBy: hpRow?.updated_by ?? null,
      persistedInDatabase: Boolean(hpRow),
    },
    banners: {
      key: "banners",
      value: bannersVal,
      updatedAt: bannersRow?.updated_at ?? null,
      updatedBy: bannersRow?.updated_by ?? null,
      persistedInDatabase: Boolean(bannersRow),
    },
    brandStory: {
      key: "brand_story",
      value: storyVal,
      updatedAt: storyRow?.updated_at ?? null,
      updatedBy: storyRow?.updated_by ?? null,
      persistedInDatabase: Boolean(storyRow),
    },
    publishedProducts: (productRows ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
      is_featured: boolean;
    }>,
  };
}

export async function getHomepageContentAction(): Promise<HomepageContentConfig> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  try {
    const supabase =
      createSupabaseServiceClient() ?? (await createSupabaseServerClient());
    if (!supabase) return DEFAULT_HOMEPAGE_CONTENT;

    const { data } = await supabase
      .from("site_content")
      .select("content_value")
      .eq("content_key", "homepage")
      .single();

    const row = data as { content_value: Partial<HomepageContentConfig> } | null;
    if (!row || !row.content_value) {
      return DEFAULT_HOMEPAGE_CONTENT;
    }

    const merged: HomepageContentConfig = {
      ...DEFAULT_HOMEPAGE_CONTENT,
      ...row.content_value,
    };

    if (
      merged.brandIntroHeadline === "Born Where Clouds Brush Ancient Blossom Branches" ||
      merged.brandIntroBody?.includes("Guided by Japanese-inspired minimalism")
    ) {
      merged.brandIntroHeadline = DEFAULT_HOMEPAGE_CONTENT.brandIntroHeadline;
      merged.brandIntroBody = DEFAULT_HOMEPAGE_CONTENT.brandIntroBody;
    }

    if (
      merged.heroDescription?.includes("An ethereal fragrance house inspired by") ||
      merged.heroDescription?.includes("An ethereal fragrance inspired by")
    ) {
      merged.heroDescription = DEFAULT_HOMEPAGE_CONTENT.heroDescription;
    }

    if (merged.heroSecondaryCtaText === "Explore Our Collection") {
      merged.heroSecondaryCtaText = "Explore the Collection";
    }

    if (merged.featuredFragranceSlug === "himalayan-cherry-blossom-air") {
      merged.featuredFragranceSlug = "sakura-and-mountain-mist";
    }

    if (merged.heroPrimaryCtaHref === "/products/himalayan-cherry-blossom-air") {
      merged.heroPrimaryCtaHref = "/products/sakura-and-mountain-mist";
    }

    return merged;
  } catch {
    return DEFAULT_HOMEPAGE_CONTENT;
  }
}

export async function updateHomepageContentAction(
  rawValues: HomepageContentConfig
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const parsed = homepageContentSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid homepage content values.",
    };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await (supabase.from("site_content") as unknown as {
    upsert: (
      values: Record<string, unknown>,
      opts: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      content_key: "homepage",
      content_value: parsed.data,
      updated_by: auth.admin.id,
    },
    { onConflict: "content_key" }
  );

  if (error) {
    return { success: false, error: error.message || "Failed to save homepage content." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "HOMEPAGE_CONTENT_UPDATED",
    resourceType: "site_content",
    resourceId: "homepage",
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidatePath("/admin/content/homepage");

  return { success: true };
}

export async function getBrandStoryContentAction(): Promise<BrandStoryContentConfig> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_BRAND_STORY_CONTENT;
  }

  try {
    const supabase =
      createSupabaseServiceClient() ?? (await createSupabaseServerClient());
    if (!supabase) return DEFAULT_BRAND_STORY_CONTENT;

    const { data } = await supabase
      .from("site_content")
      .select("content_value")
      .eq("content_key", "brand_story")
      .single();

    const row = data as { content_value: Partial<BrandStoryContentConfig> } | null;
    if (!row || !row.content_value) {
      return DEFAULT_BRAND_STORY_CONTENT;
    }

    return {
      ...DEFAULT_BRAND_STORY_CONTENT,
      ...row.content_value,
    };
  } catch {
    return DEFAULT_BRAND_STORY_CONTENT;
  }
}

export async function updateBrandStoryContentAction(
  rawValues: BrandStoryContentConfig
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const parsed = brandStoryContentSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid brand story content.",
    };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await (supabase.from("site_content") as unknown as {
    upsert: (
      values: Record<string, unknown>,
      opts: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      content_key: "brand_story",
      content_value: parsed.data,
      updated_by: auth.admin.id,
    },
    { onConflict: "content_key" }
  );

  if (error) {
    return { success: false, error: error.message || "Failed to save brand story." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "BRAND_STORY_UPDATED",
    resourceType: "site_content",
    resourceId: "brand_story",
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/content");
  revalidatePath("/admin/content/brand-story");

  return { success: true };
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const BANNERS_FILE = path.join(DATA_DIR, "banners.json");

function readLocalBanners(): BannerItemConfig[] | null {
  try {
    if (fs.existsSync(BANNERS_FILE)) {
      const data = fs.readFileSync(BANNERS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return null;
}

function writeLocalBanners(banners: BannerItemConfig[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BANNERS_FILE, JSON.stringify(banners, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

export async function getBannersContentAction(): Promise<BannerItemConfig[]> {
  const local = readLocalBanners();

  if (!isSupabaseConfigured()) {
    return local || DEFAULT_BANNERS;
  }

  try {
    const supabase =
      createSupabaseServiceClient() ?? (await createSupabaseServerClient());
    if (!supabase) return local || DEFAULT_BANNERS;

    const { data } = await supabase
      .from("site_content")
      .select("content_value")
      .eq("content_key", "banners")
      .single();

    const row = data as { content_value: BannerItemConfig[] } | null;
    if (!row || !Array.isArray(row.content_value)) {
      return local || DEFAULT_BANNERS;
    }

    writeLocalBanners(row.content_value);
    return row.content_value;
  } catch {
    return local || DEFAULT_BANNERS;
  }
}

export const getBannersAction = getBannersContentAction;

export async function updateBannersContentAction(
  banners: BannerItemConfig[]
): Promise<{ success: boolean; error?: string }> {
  writeLocalBanners(banners);

  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await (supabase.from("site_content") as unknown as {
    upsert: (
      values: Record<string, unknown>,
      opts: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  }).upsert(
    {
      content_key: "banners",
      content_value: banners,
      updated_by: auth.admin.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "content_key" }
  );

  if (error) {
    return { success: false, error: error.message || "Failed to update banners." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "BANNERS_UPDATED",
    resourceType: "site_content",
    resourceId: "banners",
    metadata: { count: banners.length },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath("/admin/content");
  revalidatePath("/admin/content/banners");

  return { success: true };
}

