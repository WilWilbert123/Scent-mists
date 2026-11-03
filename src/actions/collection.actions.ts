"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  createSupabaseServiceClient,
  recordAuditLog,
  verifyServerAdmin,
} from "@/lib/supabase/admin";
import { collectionSchema } from "@/lib/validations";
import { SAMPLE_COLLECTIONS } from "@/data/collections";
import type { Collection, CollectionFormValues } from "@/types/collection";

const COLLECTION_IMAGE_MAP: Record<string, string> = {
  "/images/lifestyle/fragrance-collection.webp":
    "/images/lifestyle/collection-altitude-botanicals.webp",
  "/images/lifestyle/altitude-botanicals-vista.webp":
    "/images/lifestyle/collection-altitude-botanicals.webp",
  "/images/lifestyle/cherry-blossom-garden.webp":
    "/images/lifestyle/collection-ephemeral-petals.webp",
  "/images/lifestyle/alpine-sakura-horizon.webp":
    "/images/lifestyle/collection-ephemeral-petals.webp",
  "/images/lifestyle/fragrance-lifestyle.webp":
    "/images/lifestyle/collection-nocturnal-reserves.webp",
  "/images/hero/himalayan-cherry-blossom-dark-bg.webp":
    "/images/lifestyle/collection-nocturnal-reserves.webp",
};

const COLLECTION_SLUG_IMAGE_MAP: Record<string, string> = {
  "altitude-botanicals": "/images/lifestyle/collection-altitude-botanicals.webp",
  "ephemeral-petals": "/images/lifestyle/collection-ephemeral-petals.webp",
  "nocturnal-reserves": "/images/lifestyle/collection-nocturnal-reserves.webp",
};

const COLLECTION_SUBTITLE_MAP: Record<string, string> = {
  "altitude-botanicals": "High-Elevation Olfactory Studies",
  "ephemeral-petals": "Spring Blossom Series",
  "nocturnal-reserves": "Evening & Resin Studies",
};

function normalizeCollection(col: Collection): Collection {
  const slugs = new Set(col.product_slugs ?? []);
  if (slugs.has("himalayan-cherry-blossom-air")) {
    slugs.add("sakura-and-mountain-mist");
  }
  return {
    ...col,
    subtitle: col.subtitle || COLLECTION_SUBTITLE_MAP[col.slug] || "Olfactory Chapter",
    image_url:
      COLLECTION_SLUG_IMAGE_MAP[col.slug] ??
      COLLECTION_IMAGE_MAP[col.image_url] ??
      col.image_url,
    product_slugs: Array.from(slugs),
  };
}

export async function getPublicCollectionsAction(): Promise<Collection[]> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_COLLECTIONS.filter((c) => c.is_published).map(normalizeCollection);
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase)
      return SAMPLE_COLLECTIONS.filter((c) => c.is_published).map(normalizeCollection);

    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return SAMPLE_COLLECTIONS.filter((c) => c.is_published).map(normalizeCollection);
    }

    return (data as unknown as Collection[]).map(normalizeCollection);
  } catch {
    return SAMPLE_COLLECTIONS.filter((c) => c.is_published).map(normalizeCollection);
  }
}

export async function getPublicCollectionBySlugAction(
  slug: string
): Promise<Collection | null> {
  if (!isSupabaseConfigured()) {
    const found = SAMPLE_COLLECTIONS.find((c) => c.slug === slug && c.is_published);
    return found ? normalizeCollection(found) : null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const found = SAMPLE_COLLECTIONS.find((c) => c.slug === slug && c.is_published);
      return found ? normalizeCollection(found) : null;
    }

    const { data } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (data) {
      return normalizeCollection(data as unknown as Collection);
    }

    const fallback = SAMPLE_COLLECTIONS.find((c) => c.slug === slug && c.is_published);
    return fallback ? normalizeCollection(fallback) : null;
  } catch {
    const fallback = SAMPLE_COLLECTIONS.find((c) => c.slug === slug && c.is_published);
    return fallback ? normalizeCollection(fallback) : null;
  }
}

export async function getAdminCollectionsAction(): Promise<{
  collections: Collection[];
  isDatabaseConnected: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { collections: [], isDatabaseConnected: false };
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return { collections: [], isDatabaseConnected: false };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { collections: [], isDatabaseConnected: false };
  }

  const [collectionsRes, productsRes] = await Promise.all([
    supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("products")
      .select("name, slug, collection_id")
      .order("is_featured", { ascending: false }),
  ]);

  const productRows = ((productsRes.data ?? []) as {
    name: string;
    slug: string;
    collection_id: string | null;
  }[]);

  const slugsByCollectionId = new Map<string, string[]>();
  for (const prod of productRows) {
    if (!prod.collection_id) continue;
    const normalizedSlug =
      prod.slug === "himalayan-cherry-blossom-air"
        ? "sakura-and-mountain-mist"
        : prod.slug;
    const list = slugsByCollectionId.get(prod.collection_id) ?? [];
    if (!list.includes(normalizedSlug)) {
      list.push(normalizedSlug);
    }
    slugsByCollectionId.set(prod.collection_id, list);
  }

  const rawCollections = (collectionsRes.data ?? []) as unknown as Collection[];
  const collections = rawCollections.map((col) => {
    const normalized = normalizeCollection(col);
    const liveSlugs = slugsByCollectionId.get(col.id) ?? [];
    return {
      ...normalized,
      product_slugs: liveSlugs.length > 0 ? liveSlugs : normalized.product_slugs,
    };
  });

  return {
    collections,
    isDatabaseConnected: true,
  };
}

export async function createCollectionAction(
  rawValues: CollectionFormValues
): Promise<{ success: boolean; id?: string; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const parsed = collectionSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid collection data.",
    };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { data, error } = await (supabase.from("collections") as unknown as {
    insert: (values: Record<string, unknown>) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  })
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Failed to create collection.",
    };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "COLLECTION_CREATED",
    resourceType: "collections",
    resourceId: data.id,
    metadata: { name: parsed.data.name, slug: parsed.data.slug },
  });

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/admin");
  revalidatePath("/admin/collections");

  return { success: true, id: data.id };
}

export async function updateCollectionAction(
  id: string,
  rawValues: CollectionFormValues
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const parsed = collectionSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid collection data.",
    };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await (supabase.from("collections") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  })
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message || "Failed to update collection." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "COLLECTION_UPDATED",
    resourceType: "collections",
    resourceId: id,
    metadata: { name: parsed.data.name },
  });

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath(`/collections/${parsed.data.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/collections");

  return { success: true };
}

export async function deleteCollectionAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) {
    return { success: false, error: "Failed to delete collection." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "COLLECTION_DELETED",
    resourceType: "collections",
    resourceId: id,
  });

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/admin/collections");

  return { success: true };
}

