"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  createSupabaseServiceClient,
  recordAuditLog,
  verifyServerAdmin,
} from "@/lib/supabase/admin";
import { productSchema } from "@/lib/validations";
import { SAMPLE_PRODUCTS } from "@/data/products";
import type { Product, ProductFormValues } from "@/types/product";

const IMAGE_URL_MAP: Record<string, string> = {
  "/images/products/himalayan-cherry-blossom.webp":
    "/images/products/sakura-mountain-mist.webp",
  "/images/products/perfume-front.webp":
    "/images/products/morning-cedar-mist.webp",
  "/images/products/perfume-side.webp":
    "/images/products/white-tea-snow-lotus.webp",
  "/images/products/perfume-box.webp":
    "/images/products/velvet-amber-sakura-dusk.webp",
};

function mapImageUrl(url: string | undefined): string {
  if (!url) return "/images/products/sakura-mountain-mist.webp";
  return IMAGE_URL_MAP[url] ?? url;
}

function normalizeProduct(product: Product): Product {
  const isLegacySignature =
    product.name === "Himalayan Cherry Blossom Air" ||
    product.slug === "himalayan-cherry-blossom-air" ||
    product.slug === "sakura-and-mountain-mist";

  const cleanNotes = (notes: string[] | undefined) =>
    (notes ?? []).map((n) =>
      n
        .replace(/\s*\(Sample\)/gi, "")
        .replace(/^Himalayan Wild Cherry Blossom$/i, "Wild Cherry Blossom")
        .replace(/^Himalayan Deodar Cedar$/i, "Deodar Cedar")
        .trim()
    );

  const cleanDescription = (product.description ?? "")
    .replace(/of a Himalayan morning/gi, "of a high-altitude morning")
    .replace(/sun-warmed Himalayan cedar forests/gi, "sun-warmed ancient cedar forests");

  return {
    ...product,
    name: isLegacySignature ? "Sakura & Mountain Mist" : product.name,
    slug: isLegacySignature ? "sakura-and-mountain-mist" : product.slug,
    subtitle: isLegacySignature
      ? "Signature Eau de Parfum"
      : product.subtitle || "Eau de Parfum",
    description: cleanDescription,
    image_url: mapImageUrl(product.image_url),
    gallery: (product.gallery ?? []).map(mapImageUrl),
    top_notes: cleanNotes(product.top_notes),
    heart_notes: cleanNotes(product.heart_notes),
    base_notes: cleanNotes(product.base_notes),
    volume_display: product.volume_display || "100 ml / 3.4 fl. oz.",
    concentration:
      product.concentration ||
      (product.slug === "velvet-amber-and-sakura-dusk"
        ? "Extrait de Parfum"
        : "Eau de Parfum"),
  };
}

export async function getPublicProductsAction(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_PRODUCTS.filter((p) => p.is_published).map(normalizeProduct);
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return SAMPLE_PRODUCTS.filter((p) => p.is_published).map(normalizeProduct);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return SAMPLE_PRODUCTS.filter((p) => p.is_published).map(normalizeProduct);
    }

    return (data as unknown as Product[]).map(normalizeProduct);
  } catch {
    return SAMPLE_PRODUCTS.filter((p) => p.is_published).map(normalizeProduct);
  }
}

export async function getPublicProductBySlugAction(
  slug: string
): Promise<Product | null> {
  const candidateSlugs =
    slug === "sakura-and-mountain-mist" || slug === "himalayan-cherry-blossom-air"
      ? ["sakura-and-mountain-mist", "himalayan-cherry-blossom-air"]
      : [slug];

  if (!isSupabaseConfigured()) {
    const found = SAMPLE_PRODUCTS.find(
      (p) => candidateSlugs.includes(p.slug) && p.is_published
    );
    return found ? normalizeProduct(found) : null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const found = SAMPLE_PRODUCTS.find(
        (p) => candidateSlugs.includes(p.slug) && p.is_published
      );
      return found ? normalizeProduct(found) : null;
    }

    const { data } = await supabase
      .from("products")
      .select("*")
      .in("slug", candidateSlugs)
      .eq("is_published", true)
      .limit(1)
      .maybeSingle();

    if (data) {
      return normalizeProduct(data as unknown as Product);
    }

    const fallback = SAMPLE_PRODUCTS.find(
      (p) => candidateSlugs.includes(p.slug) && p.is_published
    );
    return fallback ? normalizeProduct(fallback) : null;
  } catch {
    const fallback = SAMPLE_PRODUCTS.find(
      (p) => candidateSlugs.includes(p.slug) && p.is_published
    );
    return fallback ? normalizeProduct(fallback) : null;
  }
}

export async function getAdminProductsAction(): Promise<{
  products: Product[];
  isDatabaseConnected: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { products: [], isDatabaseConnected: false };
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return { products: [], isDatabaseConnected: false };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { products: [], isDatabaseConnected: false };
  }

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: true });

  return {
    products: ((data ?? []) as unknown as Product[]).map(normalizeProduct),
    isDatabaseConnected: true,
  };
}

export async function getAdminProductByIdAction(id: string): Promise<{
  product: Product | null;
  isDatabaseConnected: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { product: null, isDatabaseConnected: false };
  }

  const auth = await verifyServerAdmin();
  if (!auth.authorized) {
    return { product: null, isDatabaseConnected: false };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { product: null, isDatabaseConnected: false };
  }

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  return {
    product: data ? normalizeProduct(data as unknown as Product) : null,
    isDatabaseConnected: true,
  };
}

export async function createProductAction(
  rawValues: ProductFormValues
): Promise<{ success: boolean; id?: string; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const parsed = productSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid fragrance showcase data.",
    };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { data, error } = await (supabase.from("products") as unknown as {
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
      error: error?.message || "Failed to create fragrance showcase entry.",
    };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "PRODUCT_CREATED",
    resourceType: "products",
    resourceId: data.id,
    metadata: { name: parsed.data.name, slug: parsed.data.slug },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/collections");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  return { success: true, id: data.id };
}

export async function updateProductAction(
  id: string,
  rawValues: ProductFormValues
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyServerAdmin();
  if (!auth.authorized || !auth.admin) {
    return { success: false, error: auth.error || "Unauthorized admin operation." };
  }

  const parsed = productSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid fragrance showcase data.",
    };
  }

  const supabase = createSupabaseServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) {
    return { success: false, error: "Supabase client unavailable." };
  }

  const { error } = await (supabase.from("products") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
    };
  })
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message || "Failed to update product." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "PRODUCT_UPDATED",
    resourceType: "products",
    resourceId: id,
    metadata: { name: parsed.data.name, slug: parsed.data.slug },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  return { success: true };
}

export async function deleteProductAction(
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

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return { success: false, error: "Failed to delete product." };
  }

  await recordAuditLog({
    adminUserId: auth.admin.id,
    action: "PRODUCT_DELETED",
    resourceType: "products",
    resourceId: id,
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");

  return { success: true };
}

